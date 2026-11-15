"""Étape B — Préparation des features d'entraînement pour le Random Forest.

Sources (toutes vérifiées au préalable, ne rien supposer):
  1. Ground truth: shapefile lulc_fielddata (labels crop/season/tree/irrigation + géométries),
     zone 'Tadla' uniquement (1 558 parcelles documentées, 1 géométrie nulle).
  2. Sentinel-2 2024: séries par parcelle (12 bandes + NDVI éditeur), 1 460 parcelles appariées.
  3. MOD13Q1 v061 2024: NDVI/EVI 230 m, 614 composites, 56 848 pixels sur le bbox provisoire.

Sorties (dossier model/features/):
  - parcels_s2_features.csv       : 1 ligne = 1 parcelle (features S2 + labels + pixel MODIS)
  - modis_pixels_2024_features.csv: 1 ligne = 1 pixel MODIS (features NDVI/EVI + label agréé)
  - extraction_summary.txt        : journal des compteurs (audit de la préparation)

Reproductibilité: ce script est déterministe (aucun tirage aléatoire). Exécution:
    python model/01_prepare_features.py
"""
from __future__ import annotations

import json
from pathlib import Path
import numpy as np
import pandas as pd
import shapefile  # pyshp

# ------------------------- CONFIG -------------------------
DATA_ROOT = Path("C:/Users/Mahmoud/Desktop/data_nasa")
GT = DATA_ROOT / "Field_Shift_Tadla_Agricultural_Data/Field_Shift_Tadla_Agricultural_Data/01_Crop_Data"
S2_DIR = GT / "extracted_sentinel2/Sentinel2 bands for all surveyed parcels"
SHP = GT / "extracted_parcels/Shapefile_Crop and irrigation dataset/lulc_fielddata.shp"
MODIS_2024 = DATA_ROOT / "data/raw/modis/MODIS data/MOD13Q1_Tadla_2024.csv"
OUT = Path(__file__).resolve().parent / "features"
OUT.mkdir(exist_ok=True)

ZONE = "Tadla"
BBOX = dict(lat_min=32.1625, lat_max=32.5503, lon_min=-7.0283, lon_max=-6.3967)
MIN_OBS_S2 = 6          # parcelles avec moins d'observations NDVI -> exclues de l'entraînement
MIN_OBS_MODIS = 10      # composites MODIS attendus en 2024 (23 théoriques)
GREEN_T = 0.40          # seuil de "végétation active"
CROSS_T = 0.45          # seuil de comptage des remontées (cycles verts)
SEASONS = {"winter": (12, 1, 2), "spring": (3, 4, 5), "summer": (6, 7, 8), "autumn": (9, 10, 11)}
# -----------------------------------------------------------

log_lines: list[str] = []


def log(msg: str) -> None:
    print(msg, flush=True)
    log_lines.append(str(msg))


def compute_ndvi_metrics(dates: pd.Series, ndvi: np.ndarray, prefix: str = "") -> dict:
    """Métriques phénologiques communes aux deux échelles (S2 et MODIS).

    - tri par date, agrégation des doublons (moyenne), suppression des NaN
    - métriques: amplitude, pic, durée verte, cycles (remontées de seuil),
      taux de verdissement/sénescence, AUC hebdomadaire, moyennes saisonnières
    """
    d = pd.DataFrame({"date": pd.to_datetime(dates), "ndvi": np.asarray(ndvi, dtype=float)})
    d = d.groupby("date", as_index=False)["ndvi"].mean().sort_values("date").reset_index(drop=True)
    d = d.dropna(subset=["ndvi"])
    m: dict = {}
    m[prefix + "n_obs"] = len(d)
    if len(d) < 3:
        return m
    nd = d["ndvi"].to_numpy()
    doy = d["date"].dt.dayofyear.to_numpy()
    m[prefix + "span_days"] = int((d["date"].max() - d["date"].min()).days)
    m[prefix + "ndvi_mean"] = round(float(nd.mean()), 4)
    m[prefix + "ndvi_max"] = round(float(nd.max()), 4)
    m[prefix + "ndvi_min"] = round(float(nd.min()), 4)
    m[prefix + "ndvi_std"] = round(float(nd.std()), 4)
    m[prefix + "ndvi_amp"] = round(float(nd.max() - nd.min()), 4)
    m[prefix + "doy_peak"] = int(doy[int(nd.argmax())])
    m[prefix + "doy_min"] = int(doy[int(nd.argmin())])
    # grille hebdomadaire interpolée (échantillonnage irrégulier)
    gd = np.arange(doy.min(), doy.max() + 1, 7)
    gi = np.interp(gd, doy, nd)
    m[prefix + "green_days"] = float(round(float((gi > GREEN_T).sum()) * 7, 1))
    upcross = int(np.sum((gi[1:] > CROSS_T) & (gi[:-1] <= CROSS_T)))
    m[prefix + "n_cycles"] = upcross + (1 if gi[0] > CROSS_T else 0)
    rates = np.diff(nd) / np.maximum(np.diff(doy), 1)
    m[prefix + "max_green_rate"] = round(float(rates.max()), 5) if len(rates) else 0.0
    m[prefix + "max_sen_rate"] = round(float(rates.min()), 5) if len(rates) else 0.0
    m[prefix + "ndvi_auc"] = round(float(gi.mean()), 4)
    months = d["date"].dt.month.to_numpy()
    for name, mm in SEASONS.items():
        sel = np.isin(months, mm)
        m[prefix + f"ndvi_{name}"] = round(float(nd[sel].mean()), 4) if sel.any() else np.nan
    return m


def compute_s2_band_features(df: pd.DataFrame) -> dict:
    """Features de bandes Sentinel-2 (réflectance x10000 éditeur; les indices
    de type ratio sont invariants d'échelle — valeurs absolues utilisées avec
    le caveat 'scaling éditeur non documenté'). Red-edge B5/B6/B7 inclus:
    sensibles au type de culture et à la chlorophylle."""
    b3 = df["B3"].to_numpy(float)
    b5 = df["B5"].to_numpy(float)
    b7 = df["B7"].to_numpy(float)
    b8 = df["B8"].to_numpy(float)
    b11 = df["B11"].to_numpy(float)
    b12 = df["B12"].to_numpy(float)
    b4 = df["B4"].to_numpy(float)
    b6 = df["B6"].to_numpy(float)
    nd = df["NDVI"].to_numpy(float)
    with np.errstate(divide="ignore", invalid="ignore"):
        ndmi = (b8 - b11) / (b8 + b11)
    ndmi[~np.isfinite(ndmi)] = np.nan
    pk = int(np.nanargmax(nd))
    return {
        "ndmi_mean": round(float(np.nanmean(ndmi)), 4),
        "ndmi_max": round(float(np.nanmax(ndmi)), 4),
        "ndmi_min": round(float(np.nanmin(ndmi)), 4),
        "ndmi_peak": round(float(ndmi[pk]), 4),
        "b8_peak": round(float(b8[pk]), 1),
        "b11_peak": round(float(b11[pk]), 1),
        "b4_peak": round(float(b4[pk]), 1),
        "b3_peak": round(float(b3[pk]), 1),
        "b5_peak": round(float(b5[pk]), 1),
        "b7_peak": round(float(b7[pk]), 1),
        "b5_mean": round(float(np.nanmean(b5)), 1),
        "b7_mean": round(float(np.nanmean(b7)), 1),
        "b12_mean": round(float(np.nanmean(b12)), 1),
        "b6_mean": round(float(np.nanmean(b6)), 1),
        "b11_min": round(float(np.nanmin(b11)), 1),
    }


def map_grid(vals: np.ndarray, grid: np.ndarray) -> np.ndarray:
    """Index du point de grille le plus proche (grille régulière triée)."""
    idx = np.clip(np.searchsorted(grid, vals), 1, len(grid) - 1)
    left, right = grid[idx - 1], grid[idx]
    return np.where(np.abs(vals - left) <= np.abs(vals - right), idx - 1, idx).astype(int)


# ================= 1. Labels et géométries (shapefile) =================
log("== 1. Lecture du shapefile ground-truth ==")
sf = shapefile.Reader(str(SHP))
fields = [f[0] for f in sf.fields[1:]]  # 1er élément = DeletionFlag
rows = []
null_geom = 0
for shp_rec, rec in zip(sf.shapes(), sf.records()):
    d = dict(zip(fields, rec))
    if d.get("zone") != ZONE:
        continue
    pts = shp_rec.points
    if not pts:
        null_geom += 1
        continue
    d["centroid_lat"] = float(np.mean([p[1] for p in pts]))
    d["centroid_lon"] = float(np.mean([p[0] for p in pts]))
    rows.append(d)
labels = pd.DataFrame(rows)
log(f"parcelles {ZONE} avec géométrie: {len(labels)} (géométries nules ignorées: {null_geom})")
log("répartition crop: " + json.dumps(labels["crop"].value_counts().to_dict()))

# champs attendus présents ?
for col in ("parcel_id", "crop", "season", "tree", "irrigation"):
    assert col in labels.columns, f"champ absent du shapefile: {col}"

# ================= 2. Features Sentinel-2 par parcelle =================
log("== 2. Features Sentinel-2 par parcelle ==")
s2_files = sorted(S2_DIR.rglob("Tadla_*_S2_timeseries.csv"))
log(f"fichiers S2 Tadla: {len(s2_files)}")
lab_index = labels.set_index("parcel_id")
recs = []
no_label = 0
cat_mismatch = 0
for f in s2_files:
    pid = f.name[: -len("_S2_timeseries.csv")]
    if pid not in lab_index.index:
        no_label += 1
        continue
    row = lab_index.loc[pid].to_dict()
    row["parcel_id"] = pid  # set_index a retiré la colonne du dict — la restituer
    # contrôle croisé: catégorie du dossier vs label 'crop' des attributs
    folder_cat = f.parent.name
    if folder_cat != row["crop"]:
        cat_mismatch += 1
    df = pd.read_csv(f)
    df["date"] = pd.to_datetime(df["date"])
    df = df.groupby("date", as_index=False).mean(numeric_only=True).sort_values("date")
    met = compute_ndvi_metrics(df["date"], df["NDVI"])
    row["excluded"] = "too_few_obs" if met.get("n_obs", 0) < MIN_OBS_S2 else ""
    if row["excluded"]:
        recs.append({**row, **met})
        continue
    met.update(compute_s2_band_features(df))
    row["s2_folder"] = folder_cat
    recs.append({**row, **met})
s2 = pd.DataFrame(recs)
log(f"parcelles sans fichier S2 apparié: {no_label} (documenté dans l'audit éditeur)")
log(f"discordances dossier/attributs 'crop': {cat_mismatch}")
log(f"parcelles exclues (trop peu d'obs, < {MIN_OBS_S2}): {(s2['excluded'] == 'too_few_obs').sum()}")
log(f"parcelles S2 conservées: {(s2['excluded'] == '').sum()}")

# ================= 3. Features MODIS par pixel (2024) =================
log("== 3. Features MODIS 230 m par pixel (2024) ==")
usecols = ["lat", "lon", "date", "ndvi", "evi"]
chunks = [ch for ch in pd.read_csv(MODIS_2024, usecols=usecols, chunksize=500_000)]
mod = pd.concat(chunks, ignore_index=True)
mod["date"] = pd.to_datetime(mod["date"])
lats = np.sort(mod["lat"].unique())
lons = np.sort(mod["lon"].unique())
log(f"grille MODIS: {len(lats)} lat x {len(lons)} lon")

mod["lat_i"] = map_grid(mod["lat"].to_numpy(), lats)
mod["lon_i"] = map_grid(mod["lon"].to_numpy(), lons)
mod["pix"] = mod["lat_i"].astype(str) + "_" + mod["lon_i"].astype(str)

labels["lat_i"] = map_grid(labels["centroid_lat"].to_numpy(), lats)
labels["lon_i"] = map_grid(labels["centroid_lon"].to_numpy(), lons)
labels["pix"] = labels["lat_i"].astype(str) + "_" + labels["lon_i"].astype(str)
in_bbox = (
    labels["centroid_lat"].between(BBOX["lat_min"], BBOX["lat_max"])
    & labels["centroid_lon"].between(BBOX["lon_min"], BBOX["lon_max"])
)
log(f"parcelles hors bbox (exclues du modèle MODIS): {(~in_bbox).sum()}")

grp = labels[in_bbox].groupby("pix")["crop"].agg(nunique="nunique", n_parcels="count")
agree_pix = grp[grp["nunique"] == 1].index
mixed_pix = grp[grp["nunique"] > 1].index
log(f"pixels MODIS couverts par parcelles: {len(grp)} | label unique: {len(agree_pix)} | MIXTES (exclus): {len(mixed_pix)}")
labels.loc[~labels["pix"].isin(agree_pix), "pixel_agree"] = False
labels.loc[labels["pix"].isin(agree_pix), "pixel_agree"] = True

pix_class = labels[in_bbox].groupby("pix")["crop"].first()
metrics_rows = []
sel = mod[mod["pix"].isin(agree_pix)]
for pix, gdf in sel.groupby("pix"):
    m = compute_ndvi_metrics(gdf["date"], gdf["ndvi"])
    if m.get("n_obs", 0) < MIN_OBS_MODIS:
        continue
    evi = pd.Series(gdf["evi"].to_numpy(float))
    evi = evi.groupby(pd.to_datetime(gdf["date"].to_numpy())).mean().sort_index()
    m["evi_mean"] = round(float(evi.mean()), 4)
    m["evi_max"] = round(float(evi.max()), 4)
    m["evi_amp"] = round(float(evi.max() - evi.min()), 4)
    m["pix"] = pix
    m["crop"] = pix_class.loc[pix]
    m["n_parcels"] = int(grp.loc[pix, "n_parcels"])
    metrics_rows.append(m)
moddf = pd.DataFrame(metrics_rows)
log(f"pixels MODIS conservés pour l'entraînement: {len(moddf)}")
log("répartition crop (pixels): " + json.dumps(moddf["crop"].value_counts().to_dict()))

# saison par pixel (pour le binaire Wheat/Alfalfa à l'échelle MODIS):
# pixels 'Seasonal Crop' à saison unique parmi les parcelles qui les couvrent
sub_lab = labels[in_bbox & labels["pix"].isin(agree_pix)]
season_uniq = sub_lab.dropna(subset=["season"]).groupby("pix")["season"].agg(
    nunique="nunique", season="first")
single_season = season_uniq[season_uniq["nunique"] == 1]["season"]
moddf["pixel_season"] = moddf["pix"].map(single_season)
log("pixels avec saison unique (Wheat/Alfalfa possibles): "
    f"{moddf['pixel_season'].isin(['Wheat', 'Alfalfa']).sum()}")

# ================= 4. Sauvegardes + journal =================
s2.to_csv(OUT / "parcels_s2_features.csv", index=False)
moddf.to_csv(OUT / "modis_pixels_2024_features.csv", index=False)
log_lines.append(f"[fichier] {OUT/'parcels_s2_features.csv'}")
log_lines.append(f"[fichier] {OUT/'modis_pixels_2024_features.csv'}")
(OUT / "extraction_summary.txt").write_text("\n".join(log_lines), encoding="utf-8")
log("PRÉPARATION TERMINÉE.")
