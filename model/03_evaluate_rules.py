"""Étape E — Baselines de règles (critères v2) : quantifier l'apport réel du ML.

Deux évaluations indépendantes, sur le MÊME protocole que 02_train_rf.py
(GroupShuffleSplit par parcelle/pixel, test 25 %, seed 42). Tous les seuils
sont choisis sur le TRAIN uniquement ; le test ne sert qu'au rapport final.

A. Binaire Wheat vs Alfalfa (échelle parcelle, mêmes parcelles que le ML) :
   - R1 : Alfalfa si ndvi_summer >= t1
   - R2 : Alfalfa si ndvi_summer >= t1 OU ndvi_autumn >= t2
   Comparaison directe avec le ML (metrics_all.json) : le ML ne se justifie
   que s'il apporte un gain mesurable par rapport à ces règles simples.

B. Observateur pixel rule-based (4 labels du ground-truth, échelle MODIS 230 m) :
   arbre de décision à seuils sur les métriques NDVI annuelles :
     - sol nu       : ndvi_mean < bare_mean  ET  ndvi_amp < bare_amp
     - arbres       : ndvi_min >= tree_min   ET  ndvi_amp < tree_amp (vert permanent)
     - mixte T+S    : ndvi_min >= ts_min     (fluctuant mais jamais complètement nu)
     - saisonnier   : sinon (le pixel passe nu à un moment de l'année)
   La couche historique restera rule-based (le ML pixel a échoué au critère v1) :
   c'est la mesure de performance honnête de cette couche.

Sorties (model/artifacts/) :
  - rule_baselines.json            (règles, seuils, métriques, notes d'honnêteté)
  - confusion_pixel_observer.png / .csv
"""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, f1_score, classification_report
from sklearn.model_selection import GroupShuffleSplit

SEED = 42
MODEL_DIR = Path(__file__).resolve().parent
FEAT = MODEL_DIR / "features"
ART = MODEL_DIR / "artifacts"

log_lines: list[str] = []


def log(msg: str) -> None:
    print(msg, flush=True)
    log_lines.append(str(msg))


def macro_f1(y_true, y_pred) -> float:
    return float(f1_score(y_true, y_pred, average="macro"))


# ================= A. Binaire Wheat vs Alfalfa — règles simples =================
log("== A. Binaire Wheat/Alfalfa : baselines de règles ==")
s2 = pd.read_csv(FEAT / "parcels_s2_features.csv")
s2 = s2[s2["excluded"].fillna("") == ""]
sub = s2[(s2["crop"] == "Seasonal Crop") & (s2["season"].isin(["Wheat", "Alfalfa"]))].copy()
sub["is_alfalfa"] = (sub["season"] == "Alfalfa").astype(int)
X = sub[["ndvi_summer", "ndvi_autumn"]].replace([np.inf, -np.inf], np.nan)
y = sub["is_alfalfa"]
groups = sub["parcel_id"]
gss = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=SEED)
tr_idx, te_idx = next(gss.split(X, y, groups=groups))
y_tr, y_te = y.iloc[tr_idx], y.iloc[te_idx]
f1_tr = sub["ndvi_summer"].iloc[tr_idx].to_numpy()
f2_tr = sub["ndvi_autumn"].iloc[tr_idx].to_numpy()
f1_te = sub["ndvi_summer"].iloc[te_idx].to_numpy()
f2_te = sub["ndvi_autumn"].iloc[te_idx].to_numpy()
log(f"train {len(y_tr)} / test {len(y_te)} (répartition train: {y_tr.value_counts().to_dict()})")

# R1 : seuil unidimensionnel choisi sur le train (grille sur les quantiles observés)
grid1 = np.unique(np.quantile(f1_tr[np.isfinite(f1_tr)], np.linspace(0.05, 0.95, 91)))
r1_scores = [macro_f1(y_tr, (f1_tr >= t).astype(int)) for t in grid1]
r1_t = float(grid1[int(np.argmax(r1_scores))])
r1_test = macro_f1(y_te, (f1_te >= r1_t).astype(int))
log(f"R1 (ndvi_summer >= {r1_t:.4f}): macro-F1 train {max(r1_scores):.3f} -> test {r1_test:.3f}")

# R2 : grille 2D grossière, choisie sur le train
g1 = np.unique(np.quantile(f1_tr[np.isfinite(f1_tr)], np.linspace(0.1, 0.9, 9)))
g2 = np.unique(np.quantile(f2_tr[np.isfinite(f2_tr)], np.linspace(0.1, 0.9, 9)))
best = (-1.0, None, None)
for t1 in g1:
    for t2 in g2:
        pred_tr = ((f1_tr >= t1) | (f2_tr >= t2)).astype(int)
        sc = macro_f1(y_tr, pred_tr)
        if sc > best[0]:
            best = (sc, float(t1), float(t2))
r2_test = macro_f1(y_te, ((f1_te >= best[1]) | (f2_te >= best[2])).astype(int))
log(f"R2 (summer>={best[1]:.4f} OU autumn>={best[2]:.4f}): macro-F1 train {best[0]:.3f} -> test {r2_test:.3f}")

# Majority-class baseline (plancher honnête)
maj = int(y_tr.value_counts().idxmax())
maj_test = macro_f1(y_te, np.full(len(y_te), maj))
log(f"plancher classe majoritaire (Wheat): macro-F1 test {maj_test:.3f}")

# ================= B. Observateur pixel rule-based (MODIS) =================
log("== B. Observateur pixel rule-based (4 labels, MODIS 230 m) ==")
mod = pd.read_csv(FEAT / "modis_pixels_2024_features.csv")
FEATURES_P = ["ndvi_mean", "ndvi_amp", "ndvi_min"]
Xp = mod[FEATURES_P].replace([np.inf, -np.inf], np.nan)
yp = mod["crop"]
gp = mod["pix"]
gss_p = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=SEED)
trp, tep = next(gss_p.split(Xp, yp, groups=gp))
mod_tr = mod.iloc[trp]
mod_te = mod.iloc[tep]
log(f"pixels train {len(mod_tr)} / test {len(mod_te)} (répartition train: {mod_tr['crop'].value_counts().to_dict()})")

CLASSES_P = ["Seasonal Crop", "Trees", "Bare soil", "Trees + Seasonal"]


def observe(mean: np.ndarray, amp: np.ndarray, vmin: np.ndarray,
            p: dict) -> np.ndarray:
    """Arbre de décision à seuils ; ordre: sol nu -> arbres -> mixte -> saisonnier."""
    out = np.full(len(mean), "Seasonal Crop", dtype=object)
    out[(mean < p["bare_mean"]) & (amp < p["bare_amp"])] = "Bare soil"
    out[(vmin >= p["tree_min"]) & (amp < p["tree_amp"])] = "Trees"
    out[vmin >= p["ts_min"]] = "Trees + Seasonal"
    return out


def as_array(df: pd.DataFrame, col: str) -> np.ndarray:
    return df[col].fillna(df[col].median()).to_numpy(float)


mean_tr, amp_tr, min_tr = (as_array(mod_tr, c) for c in FEATURES_P)
mean_te, amp_te, min_te = (as_array(mod_te, c) for c in FEATURES_P)

# grille grossière, choisie sur le train uniquement
grid_mean = np.round(np.arange(0.15, 0.36, 0.025), 3)
grid_amp = np.round(np.arange(0.10, 0.41, 0.05), 3)
grid_min = np.round(np.arange(0.20, 0.46, 0.05), 3)
best_p, best_score = None, -1.0
for bm in grid_mean:
    for ba in grid_amp:
        for tm in grid_min:
            for ta in grid_amp:
                for ts in grid_min:
                    p = {"bare_mean": bm, "bare_amp": ba, "tree_min": tm,
                         "tree_amp": ta, "ts_min": ts}
                    sc = macro_f1(mod_tr["crop"], observe(mean_tr, amp_tr, min_tr, p))
                    if sc > best_score:
                        best_score, best_p = sc, p
log(f"seuils retenus (train): {json.dumps(best_p)} | macro-F1 train {best_score:.3f}")

pred_te = observe(mean_te, amp_te, min_te, best_p)
obs_test = macro_f1(mod_te["crop"], pred_te)
report_p = classification_report(mod_te["crop"], pred_te, labels=CLASSES_P,
                                 output_dict=True, zero_division=0)
log(f"observateur pixel rule-based: macro-F1 test {obs_test:.3f}")
for c in CLASSES_P:
    log(f"  {c}: F1 test = {report_p[c]['f1-score']:.3f} (support {int(report_p[c]['support'])})")

cm = confusion_matrix(mod_te["crop"], pred_te, labels=CLASSES_P)
fig, ax = plt.subplots(figsize=(7.5, 6))
im = ax.imshow(cm, cmap="Blues")
ax.set_xticks(range(4), CLASSES_P, rotation=25, ha="right")
ax.set_yticks(range(4), CLASSES_P)
thr = cm.max() / 2 if cm.max() else 0
for i in range(4):
    for j in range(4):
        ax.text(j, i, cm[i, j], ha="center", va="center",
                color="white" if cm[i, j] > thr else "black", fontsize=10)
ax.set_xlabel("Prédiction (règles)")
ax.set_ylabel("Réel")
ax.set_title(f"Observateur pixel rule-based — test n={len(mod_te)}")
fig.colorbar(im, ax=ax, shrink=0.8)
fig.tight_layout()
fig.savefig(ART / "confusion_pixel_observer.png", dpi=130)
plt.close(fig)
pd.DataFrame(cm, index=[f"true_{c}" for c in CLASSES_P],
             columns=[f"pred_{c}" for c in CLASSES_P]).to_csv(ART / "confusion_pixel_observer.csv")

# ================= Sauvegarde du rapport =================
ml_binary_f1 = None
metrics_path = ART / "metrics_all.json"
if metrics_path.exists():
    ml_binary_f1 = json.loads(metrics_path.read_text(encoding="utf-8"))["runs"][
        "binary_wheat_alfalfa"]["test_macro_f1"]

report = {
    "purpose": "Baselines de règles (critères v2) : seuils choisis sur le train uniquement, "
               "mêmes splits que 02_train_rf.py (seed 42) pour une comparaison équitable.",
    "binary_wheat_alfalfa": {
        "split": "GroupShuffleSplit test 25 %, seed 42, même procédure que le ML",
        "rules": {
            "R1_summer": {"expression": "Alfalfa si ndvi_summer >= t", "threshold_train": round(r1_t, 4),
                          "test_macro_f1": round(r1_test, 4)},
            "R2_summer_or_autumn": {"expression": "Alfalfa si ndvi_summer >= t1 OU ndvi_autumn >= t2",
                                    "thresholds_train": [round(best[1], 4), round(best[2], 4)],
                                    "test_macro_f1": round(r2_test, 4)},
            "majority_class": {"expression": "toujours Wheat", "test_macro_f1": round(maj_test, 4)},
        },
        "ml_random_forest_test_macro_f1": ml_binary_f1,
        "lecture": "le ML ne se justifie que par son écart avec la meilleure règle simple ; "
                   "un écart faible signifie qu'une règle transparente suffirait au produit.",
    },
    "pixel_observer_rule_based": {
        "split": "GroupShuffleSplit par pixel, test 25 %, seed 42",
        "rule_tree": [
            "sol nu       : ndvi_mean < bare_mean ET ndvi_amp < bare_amp",
            "arbres       : ndvi_min >= tree_min ET ndvi_amp < tree_amp (vert permanent)",
            "mixte T+S    : ndvi_min >= ts_min (fluctuant mais jamais nu)",
            "saisonnier   : sinon",
        ],
        "thresholds_train": best_p,
        "test_macro_f1": round(obs_test, 4),
        "per_class_test_f1": {c: round(report_p[c]["f1-score"], 4) for c in CLASSES_P},
        "confusion_files": ["confusion_pixel_observer.png", "confusion_pixel_observer.csv"],
    },
    "honesty_notes": [
        "tous les seuils sont réglés sur le train ; aucune métrique de test n'a influencé un choix",
        "les règles B s'appliquent à l'échelle pixel MODIS 230 m (mélange de parcelles inévitable)",
        "ces baselines ne remplacent pas le scoring agronomique rule-based du produit : elles "
        "quantifient l'apport de l'observateur ML et la performance de l'observateur pixel",
    ],
}
(ART / "rule_baselines.json").write_text(
    json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
log_lines.append(f"[fichier] {ART/'rule_baselines.json'}")
(MODEL_DIR / "rules_log.txt").write_text("\n".join(log_lines), encoding="utf-8")
log("ÉVALUATION DES RÈGLES TERMINÉE.")
