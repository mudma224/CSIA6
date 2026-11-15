"""Étapes C et D — Entraînement Random Forest, évaluation et artefacts.

Protocole (identique pour tous les modèles):
  - split train/test par PARCELLE (GroupShuffleSplit, test 25%, seed 42)
  - validation croisée StratifiedGroupKFold(5) sur le train
  - RandomForest(500 arbres, class_weight='balanced', seed 42)
  - imputation médiane intégrée au pipeline (aucune fuite train/test)
  - critères de sauvegarde: criteres_sauvegarde.json (v2, figés AVANT l'entraînement)

Modèles entraînés:
  1. s2_parcel        : 4 classes (historique v1 — non sauvegardé, classe mixte non séparable)
  2. modis_pixel      : 4 classes, features MODIS 230 m par pixel (historique v1)
  3. binary_wheat_alfalfa : Wheat vs Alfalfa (échelle parcelle) — seuil de décision
                            réglé sur les probabilités OOF de la CV du train (critère v2)
  4. modis_binary     : binaire à l'échelle MODIS (historique v1)
  5. s2_parcel_3class : 3 classes Seasonal/Trees/Bare — la classe mixte passe rule-based (v2)

Si un critère n'est pas atteint: métriques sauvegardées avec "saved": false,
AUCUN joblib pour cette échelle (le produit reste rule-based — décision figée).
"""
from __future__ import annotations

import json
import platform
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, f1_score)
from sklearn.model_selection import (GroupShuffleSplit, StratifiedGroupKFold,
                                     cross_val_predict)
from sklearn.pipeline import Pipeline

SEED = 42
MODEL_DIR = Path(__file__).resolve().parent
FEAT = MODEL_DIR / "features"
ART = MODEL_DIR / "artifacts"
ART.mkdir(exist_ok=True)
CRITERES = json.loads((MODEL_DIR / "criteres_sauvegarde.json").read_text(encoding="utf-8"))

FEATURES_S2 = [
    "n_obs", "span_days", "ndvi_mean", "ndvi_max", "ndvi_min", "ndvi_std",
    "ndvi_amp", "doy_peak", "doy_min", "green_days", "n_cycles",
    "max_green_rate", "max_sen_rate", "ndvi_auc",
    "ndvi_winter", "ndvi_spring", "ndvi_summer", "ndvi_autumn",
    "ndmi_mean", "ndmi_max", "ndmi_min", "ndmi_peak",
    "b8_peak", "b11_peak", "b4_peak", "b3_peak", "b5_peak", "b7_peak",
    "b5_mean", "b7_mean", "b12_mean", "b6_mean", "b11_min",
]
FEATURES_MODIS = [
    "n_obs", "span_days", "ndvi_mean", "ndvi_max", "ndvi_min", "ndvi_std",
    "ndvi_amp", "doy_peak", "doy_min", "green_days", "n_cycles",
    "max_green_rate", "max_sen_rate", "ndvi_auc",
    "ndvi_winter", "ndvi_spring", "ndvi_summer", "ndvi_autumn",
    "evi_mean", "evi_max", "evi_amp",
]
CLASSES_4 = CRITERES["quatre_classes"]["classes"]


def make_pipeline() -> Pipeline:
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("rf", RandomForestClassifier(n_estimators=500, class_weight="balanced",
                                      random_state=SEED, n_jobs=-1)),
    ])


def run_one(df: pd.DataFrame, feature_cols: list[str], label_col: str,
            group_col: str, scale_name: str, macro_f1_min: float,
            tune: bool = False, tune_threshold: bool = False,
            keep_classes: list[str] | None = None) -> dict:
    """Protocole complet pour un modèle. Retourne le dict de métriques.

    tune_threshold=True (binaire uniquement): le seuil de décision est réglé sur
    les probabilités out-of-fold de la CV du TRAIN — le test ne sert qu'au rapport.
    keep_classes: sous-ensemble de classes à conserver (modèle 3 classes, v2).
    """
    print(f"\n===== {scale_name} =====", flush=True)
    if keep_classes is not None:
        data = df[df[label_col].isin(keep_classes)].copy()
    elif label_col == "crop":
        data = df[df[label_col].isin(CLASSES_4)].copy()
    else:
        data = df.copy()
    X = data[feature_cols].replace([np.inf, -np.inf], np.nan)
    y = data[label_col]
    groups = data[group_col]
    print(f"échantillon: {len(data)} groupes | répartition: {y.value_counts().to_dict()}", flush=True)

    gss = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=SEED)
    tr_idx, te_idx = next(gss.split(X, y, groups=groups))
    X_tr, X_te = X.iloc[tr_idx], X.iloc[te_idx]
    y_tr, y_te = y.iloc[tr_idx], y.iloc[te_idx]
    g_tr = groups.iloc[tr_idx]
    print(f"train {len(X_tr)} / test {len(X_te)} (parcelles distinctes train/test: "
          f"{g_tr.nunique()} / {groups.iloc[te_idx].nunique()})", flush=True)

    cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEED)
    pipe = make_pipeline()
    if tune:
        # léger balayage d'hyperparamètres sur la CV du train (grille réduite,
        # critère inchangé — documenté dans les métriques)
        best_score, best_params = -1.0, (None, 1)
        for md, msl in [(None, 1), (30, 1), (None, 3), (16, 4)]:
            sc = []
            for i_tr, i_val in cv.split(X_tr, y_tr, groups=g_tr):
                p = Pipeline([("imputer", SimpleImputer(strategy="median")),
                              ("rf", RandomForestClassifier(
                                  n_estimators=300, max_depth=md, min_samples_leaf=msl,
                                  class_weight="balanced", random_state=SEED, n_jobs=-1))])
                p.fit(X_tr.iloc[i_tr], y_tr.iloc[i_tr])
                sc.append(f1_score(y_tr.iloc[i_val], p.predict(X_tr.iloc[i_val]), average="macro"))
            mscore = float(np.mean(sc))
            print(f"  tune max_depth={md} min_samples_leaf={msl}: CV macro-F1 = {mscore:.3f}", flush=True)
            if mscore > best_score:
                best_score, best_params = mscore, (md, msl)
        print(f"  -> config retenue: max_depth={best_params[0]} "
              f"min_samples_leaf={best_params[1]} (CV {best_score:.3f})", flush=True)
        pipe = Pipeline([("imputer", SimpleImputer(strategy="median")),
                         ("rf", RandomForestClassifier(
                             n_estimators=500, max_depth=best_params[0],
                             min_samples_leaf=best_params[1], class_weight="balanced",
                             random_state=SEED, n_jobs=-1))])
        tuned = {"max_depth": best_params[0], "min_samples_leaf": best_params[1]}
    else:
        tuned = {"max_depth": None, "min_samples_leaf": 1}
    cv_scores = []
    for k, (i_tr, i_val) in enumerate(cv.split(X_tr, y_tr, groups=g_tr), 1):
        pipe.fit(X_tr.iloc[i_tr], y_tr.iloc[i_tr])
        f1 = f1_score(y_tr.iloc[i_val], pipe.predict(X_tr.iloc[i_val]), average="macro")
        cv_scores.append(round(float(f1), 4))
        print(f"  CV fold {k}: macro-F1 = {f1:.3f}", flush=True)
    cv_mean = float(np.mean(cv_scores))

    # --- seuil de décision (v2, binaire uniquement): réglé sur l'OOF du train ---
    threshold = 0.5
    if tune_threshold:
        oof = cross_val_predict(pipe, X_tr, y_tr, cv=cv, groups=g_tr,
                                method="predict_proba")[:, 1]
        grid = np.round(np.arange(0.05, 0.96, 0.01), 2)
        oof_scores = [float(f1_score(y_tr, (oof >= t).astype(int), average="macro"))
                      for t in grid]
        threshold = float(grid[int(np.argmax(oof_scores))])
        f1_05 = float(f1_score(y_tr, (oof >= 0.5).astype(int), average="macro"))
        print(f"  seuil réglé sur OOF train: {threshold:.2f} "
              f"(macro-F1 OOF {max(oof_scores):.3f}; 0.50 donnerait {f1_05:.3f})", flush=True)

    pipe.fit(X_tr, y_tr)
    if tune_threshold:
        y_score = pipe.predict_proba(X_te)[:, list(pipe.named_steps["rf"].classes_).index(1)]
        y_pred = (y_score >= threshold).astype(int)
    else:
        y_pred = pipe.predict(X_te)
    macro = float(f1_score(y_te, y_pred, average="macro"))
    acc = float(accuracy_score(y_te, y_pred))
    report = classification_report(y_te, y_pred, output_dict=True, zero_division=0)
    print(f"TEST macro-F1 = {macro:.3f} | accuracy = {acc:.3f} | CV macro-F1 = {cv_mean:.3f}", flush=True)

    classes = sorted(y.unique())
    cm = confusion_matrix(y_te, y_pred, labels=classes)
    fig, ax = plt.subplots(figsize=(1.1 * len(classes) + 2, 1.1 * len(classes) + 1.5))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(classes)), classes, rotation=30, ha="right")
    ax.set_yticks(range(len(classes)), classes)
    thr = cm.max() / 2 if cm.max() else 0
    for i in range(len(classes)):
        for j in range(len(classes)):
            ax.text(j, i, cm[i, j], ha="center", va="center",
                    color="white" if cm[i, j] > thr else "black", fontsize=9)
    ax.set_xlabel("Prédiction"); ax.set_ylabel("Réel")
    ax.set_title(f"{scale_name} — test n={len(y_te)}")
    fig.colorbar(im, ax=ax, shrink=0.8)
    fig.tight_layout()
    fig.savefig(ART / f"confusion_{scale_name}.png", dpi=130)
    plt.close(fig)
    pd.DataFrame(cm, index=[f"true_{c}" for c in classes],
                 columns=[f"pred_{c}" for c in classes]).to_csv(ART / f"confusion_{scale_name}.csv")

    rf = pipe.named_steps["rf"]
    imp = pd.DataFrame({"feature": feature_cols,
                        "importance": rf.feature_importances_}).sort_values("importance", ascending=False)
    imp.to_csv(ART / f"feature_importances_{scale_name}.csv", index=False)
    top = imp.head(10)
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.barh(top["feature"][::-1], top["importance"][::-1])
    ax.set_title(f"{scale_name} — 10 variables les plus importantes")
    fig.tight_layout()
    fig.savefig(ART / f"feature_importances_{scale_name}.png", dpi=130)
    plt.close(fig)

    passed = macro >= macro_f1_min
    metrics = {
        "scale": scale_name,
        "saved": bool(passed),
        "criterion_macro_f1_min": macro_f1_min,
        "test_macro_f1": round(macro, 4),
        "test_accuracy": round(acc, 4),
        "cv_macro_f1_folds": cv_scores,
        "cv_macro_f1_mean": round(cv_mean, 4),
        "tuned_params": tuned,
        "decision_threshold": threshold,
        "n_train": int(len(X_tr)), "n_test": int(len(X_te)),
        "class_report_test": report,
        "confusion_labels": [str(c) for c in classes],
        "versions": {"python": sys.version.split()[0], "sklearn": sklearn.__version__,
                     "numpy": np.__version__, "pandas": pd.__version__,
                     "platform": platform.platform()},
        "seed": SEED,
    }
    if passed:
        joblib.dump({"pipeline": pipe, "features": feature_cols,
                     "classes": list(pipe.named_steps["rf"].classes_),
                     "decision_threshold": threshold},
                    ART / f"model_{scale_name}.joblib")
        print(f"CRITÈRE ATTEINT ({macro:.3f} >= {macro_f1_min}) — artefact sauvegardé.", flush=True)
    else:
        print(f"CRITÈRE NON ATTEINT ({macro:.3f} < {macro_f1_min}) — "
              f"AUCUN modèle sauvegardé pour cette échelle (produit reste rule-based).", flush=True)
    return metrics


def main() -> None:
    s2 = pd.read_csv(FEAT / "parcels_s2_features.csv")
    mod = pd.read_csv(FEAT / "modis_pixels_2024_features.csv")

    s2_tr = s2[s2["excluded"].fillna("") == ""].copy()
    print(f"parcelles S2 utilisables: {len(s2_tr)}", flush=True)

    results = {"criteres": CRITERES, "runs": {}}

    # 1. Échelle parcelle (S2) — 4 classes, avec tuning léger
    results["runs"]["s2_parcel"] = run_one(
        s2_tr, FEATURES_S2, "crop", "parcel_id", "s2_parcel",
        CRITERES["quatre_classes"]["macro_f1_min"], tune=True)

    # 2. Échelle pixel (MODIS) — 4 classes, déploiement historique
    results["runs"]["modis_pixel"] = run_one(
        mod, FEATURES_MODIS, "crop", "pix", "modis_pixel",
        CRITERES["quatre_classes"]["macro_f1_min"])

    # 3. Binaire Wheat vs Alfalfa (échelle parcelle) — seuil réglé sur la CV du train (v2)
    sub = s2_tr[(s2_tr["crop"] == "Seasonal Crop") & (s2_tr["season"].isin(["Wheat", "Alfalfa"]))].copy()
    sub["is_alfalfa"] = (sub["season"] == "Alfalfa").astype(int)
    print(f"\nbinaire Wheat/Alfalfa: {sub['season'].value_counts().to_dict()}", flush=True)
    results["runs"]["binary_wheat_alfalfa"] = run_one(
        sub, FEATURES_S2, "is_alfalfa", "parcel_id", "binary_wheat_alfalfa",
        CRITERES["binaire_luzerne_cereale"]["macro_f1_min"], tune_threshold=True)

    # 4. Binaire Wheat/Alfalfa à l'échelle MODIS (historique v1)
    mod_bin = mod[mod["pixel_season"].isin(["Wheat", "Alfalfa"])].copy()
    mod_bin["pixel_is_alfalfa"] = (mod_bin["pixel_season"] == "Alfalfa").astype(int)
    print(f"\nbinaire MODIS Wheat/Alfalfa (pixels): "
          f"{mod_bin['pixel_season'].value_counts().to_dict()}", flush=True)
    results["runs"]["modis_binary_wheat_alfalfa"] = run_one(
        mod_bin, FEATURES_MODIS, "pixel_is_alfalfa", "pix", "modis_binary_wheat_alfalfa",
        CRITERES["binaire_luzerne_cereale"]["macro_f1_min"])

    # 5. v2 — 3 classes (Seasonal / Trees / Bare) : la classe mixte passe rule-based
    results["runs"]["s2_parcel_3class"] = run_one(
        s2_tr, FEATURES_S2, "crop", "parcel_id", "s2_parcel_3class",
        CRITERES["trois_classes"]["macro_f1_min"], tune=True,
        keep_classes=CRITERES["trois_classes"]["classes"])

    # ---- contrats des modèles sauvegardés ----
    contracts = {}
    if results["runs"]["binary_wheat_alfalfa"]["saved"]:
        b = results["runs"]["binary_wheat_alfalfa"]
        contracts["binary_wheat_alfalfa"] = {
            "model_file": "model_binary_wheat_alfalfa.joblib",
            "role": "observateur d'espèces 'Wheat vs Alfalfa' au niveau parcelle (échelle S2) — "
                    "couche d'observation qui alimente les preuves du scoring rule-based",
            "input": {"source": "série Sentinel-2 annuelle d'une parcelle (bandes + NDVI éditeur)",
                      "features": {f: "number" for f in FEATURES_S2},
                      "feature_definitions": "model/01_prepare_features.py (fonctions documentées)"},
            "output": {"classes": {"0": "Wheat", "1": "Alfalfa"},
                       "decision_threshold": b["decision_threshold"],
                       "decision_rule": "Alfalfa si proba(OOF-réglé) >= seuil, sinon Wheat",
                       "proba": "score de l'observateur — PAS une probabilité calibrée (spec §4.4)"},
            "training": {"labels": "ground-truth Ouassanouan et al. 2025, champ 'season' (Tadla 2024)",
                         "n": {"wheat": 765, "alfalfa": 116},
                         "seed": SEED, "metrics_file": "metrics_all.json"},
            "limitations": [
                "un seul millésime de vérité terrain (2024)",
                "valide uniquement sur le vocabulaire Wheat/Alfalfa du ground-truth",
                "l'échelle pixel MODIS n'a PAS passé le critère (macro-F1 0.62) — "
                "l'observateur ne s'applique qu'au niveau parcelle",
            ],
        }
    if results["runs"]["s2_parcel_3class"]["saved"]:
        c3 = results["runs"]["s2_parcel_3class"]
        contracts["s2_parcel_3class"] = {
            "model_file": "model_s2_parcel_3class.joblib",
            "role": "observateur de couverture 'Seasonal Crop / Trees / Bare soil' au niveau parcelle "
                    "(échelle S2) — couche d'observation rule-based pour la classe mixte "
                    "'Trees + Seasonal' (retirée du périmètre ML, critère v2)",
            "input": {"source": "série Sentinel-2 annuelle d'une parcelle (bandes + NDVI éditeur)",
                      "features": {f: "number" for f in FEATURES_S2},
                      "feature_definitions": "model/01_prepare_features.py (fonctions documentées)"},
            "output": {"classes": sorted(CRITERES["trois_classes"]["classes"])},
            "training": {"labels": "ground-truth Ouassanouan et al. 2025, champ 'crop' (Tadla 2024)",
                         "seed": SEED,
                         "test_macro_f1": c3["test_macro_f1"],
                         "metrics_file": "metrics_all.json"},
            "limitations": [
                "un seul millésime de vérité terrain (2024)",
                "la classe mixte 'Trees + Seasonal' n'est pas dans le périmètre de ce modèle",
            ],
        }
    if contracts:
        (ART / "model_contract.json").write_text(
            json.dumps({"models": contracts}, indent=2, ensure_ascii=False), encoding="utf-8")

    (ART / "metrics_all.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print("\nRésumé:", json.dumps({k: {"saved": v["saved"], "macro_f1": v["test_macro_f1"]}
                                   for k, v in results["runs"].items()}, indent=2), flush=True)


if __name__ == "__main__":
    main()
