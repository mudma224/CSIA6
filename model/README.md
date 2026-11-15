# model/ — Pipeline ML « observateur » (Field Shift / flaht bladi)

Pipeline ML reproductible du projet. Le rôle des modèles : **observateurs de l'historique
de rotation** — ils observent ce qui a été cultivé ; ils ne recommandent rien. Le scoring
des recommandations reste rule-based (explicabilité exigée par l'énoncé), et les
observateurs alimentent ses **preuves**.

## Résultats v2 (critères figés `criteres_sauvegarde.json` v2, avant entraînement)

| Modèle | Échelle | macro-F1 test | Critère 0,75 | Verdict |
|---|---|---|---|---|
| 4 classes (crop) | parcelle S2 | 0,669 | non atteint | non sauvegardé (historique v1) |
| 4 classes (crop) | pixel MODIS 230 m | 0,468 | non atteint | non sauvegardé (historique v1) |
| **Wheat vs Alfalfa** (seuil OOF 0,45) | parcelle S2 | **0,864** | **atteint** | ✅ `artifacts/model_binary_wheat_alfalfa.joblib` |
| Wheat vs Alfalfa | pixel MODIS | 0,624 | non atteint | non sauvegardé |
| **3 classes (Seasonal/Trees/Bare)** | parcelle S2 | **0,843** (acc. 0,926) | **atteint** | ✅ `artifacts/model_s2_parcel_3class.joblib` |

Détail par classe (test) — 3 classes : Seasonal Crop F1 0,954 · Trees 0,895 · Bare soil 0,680
(supports 278/49/23). Détails complets : `artifacts/metrics_all.json` (CV par pli, rapports
par classe, versions), matrices de confusion et importances en PNG/CSV dans `artifacts/`.

### Ce que v2 a changé (et pourquoi)

1. **Modèle 3 classes ajouté** : la classe mixte `Trees + Seasonal` (non séparable, F1 0,20 en
   v1) sort du périmètre ML et devient rule-based. Sans elle, le macro-F1 passe de 0,669 à
   **0,843** — l'observateur parcelle couvre désormais Seasonal/Trees/Bare avec le critère atteint.
2. **Seuil de décision du binaire réglé sur la CV** (out-of-fold du train uniquement, jamais sur
   le test) : grille 0,05–0,95 → **0,45** retenu. Transfert test honnête à documenter : le seuil
   0,45 donne 0,864 sur le test contre 0,886 pour le 0,5 par défaut (v1) — variance d'échantillon
   (support Alfalfa du test = 30). Les deux passent le critère figé ; l'artefact livré suit le
   protocole pré-enregistré v2 et embarque `decision_threshold = 0.45`.
3. **Baselines de règles** (`03_evaluate_rules.py` → `artifacts/rule_baselines.json`) :
   - Binaire : une règle transparente à une variable (`ndvi_summer >= 0,28`) atteint déjà
     **0,831** au test ; classe majoritaire 0,464. Le ML apporte **+3,3 points** au-delà de la
     meilleure règle simple — gain réel mais modeste, qui justifie le ML tout en restant
     documenté (la règle simple reste le fallback explicable si le ML est indisponible).
   - Observateur pixel rule-based (couche historique) : **0,446** au test — Seasonal bien
     détecté (F1 0,895), Trees modéré (0,524), Bare/Trees+Seasonal non séparables à 230 m.
     La couche historique pixel ne peut donc affirmer honnêtement que la distinction grossière
     « saisonnier vs autre » — documenté comme limite du produit.

## Reproduction (2 commandes, anaconda base)

```bash
python model/01_prepare_features.py    # ~2 min : features parcelles + pixels
python model/02_train_rf.py            # ~8 min : entraînements + évaluations + artefacts
python model/03_evaluate_rules.py      # ~1 min : baselines de règles (v2)
```

Les chemins des données sont dans le bloc `CONFIG` de `01_prepare_features.py`
(données hors repo : `C:/Users/Mahmoud/Desktop/data_nasa`). Déterministe (seed 42 partout) :
les runs 4 classes/pixel sont identiques au millésime v1 ; seul le binaire diffère (seuil réglé).
Les artefacts `artifacts/*.joblib` de ce dossier sont ceux chargés par le service
FastAPI (`services/model_api/`) ; `artifacts/model_contract.json` décrit entrées/sorties/limites.

## Environnement (versions réelles — dans metrics_all.json)

python 3.14.6 (anaconda base) · scikit-learn 1.9.0 · numpy 2.5.2 · pandas 3.0.5 ·
matplotlib 3.11.0 · joblib 1.5.3 · pyshp 3.1.8 · h5py 3.16.0
(les runs v1 ont été produits avec numpy 2.4.6 / pandas 2.3.3 — résultats 4 classes
identiques, donc reproductibilité confirmée entre versions mineures)

Seul paquet ajouté à la base : `pyshp`.

## Utilisation des artefacts sauvés

```python
import joblib
bundle = joblib.load("artifacts/model_binary_wheat_alfalfa.joblib")
pipe = bundle["pipeline"]            # Pipeline(imputer -> RandomForest)
feats = bundle["features"]           # ordre exact des 33 features attendues
thr = bundle["decision_threshold"]   # 0.45 (réglé OOF, v2)
X = parcelle_df[feats]               # DataFrame 1 ligne par parcelle
p = pipe.predict_proba(X[feats])[:, list(bundle["classes"]).index(1)]
pred = (p >= thr).astype(int)        # 0 = Wheat, 1 = Alfalfa
# p est un score de l'observateur, PAS une probabilité calibrée (model_contract.json §4.4)
```

**Frontière de confiance** : ne charger que des artefacts produits par ce pipeline (seed 42,
scripts versionnés). Ne jamais charger un joblib d'origine inconnue.

## Données consommées (toutes vérifiées au préalable)

- Shapefile ground-truth (labels + géométries, zone Tadla : 1 557 parcelles valides)
- 1 460 séries Sentinel-2 2024 (bandes + NDVI) appariées par `parcel_id`
- MOD13Q1 v061 2024 (614 composites, 56 848 pixels, NDVI + EVI)

## Limites documentées (à reprendre dans la doc scientifique)

- Un seul millésime de vérité terrain (2024) — aucune validation inter-annuelle.
- Scaling des bandes S2 non documenté par l'éditeur (indices ratio utilisés en priorité).
- 60 discordances dossier/attributs `crop` (4,1 %) : le champ DBF `crop` est retenu
  comme canonique (il reproduit les comptes publiés 1 162/217/71/108).
- 389 parcelles « Tadla » hors bbox provisoire (le label éditeur déborde du rectangle).
- 78 pixels MODIS à labels mixtes exclus du modèle pixel (méthodologie §transfert).
- La classe mixte `Trees + Seasonal` n'est pas séparable à ces échelles/features → rule-based.
- À l'échelle pixel, seuls « Seasonal Crop » (F1 0,90) et partiellement « Trees » sont
  observables ; le produit n'affirmera jamais plus que cela à cette résolution.
