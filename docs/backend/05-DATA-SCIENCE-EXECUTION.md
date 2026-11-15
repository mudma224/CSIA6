# D1 — Data Science contributor execution guide: scientific readiness and deliverables

**Owner:** existing Data Science contributor (individual not named) · **Proposed branch:** `feature/d1-science-readiness` · **Dependencies:** DS work can audit **offline** now; G0 contract decisions C04–C10/C12/C14 before publishing model inputs/results for integration; M5 must be verified before merging app changes. **Status:** unverified data/model, **NOT** considered production-ready. Follow steps in order.

## 0. What you must deliver (and what is not your work)

**You own:** verified agricultural data inventory, prepared feature pipeline, crop vocabulary, agronomic rule table, reproducible model (rule engine or scientifically justified method), evaluation and limitations, versioned artifacts, final DS input/output specification, FastAPI science service after approval, contract-aligned fixtures and tests. **You do NOT own:** Next.js farmer screens, Supabase user data/auth, site-wide API gateway, moderator identity, production database migration, EN/ary review *alone*, map markers or frontend visual style.

**Non-negotiable:** the proposed data briefing is v0.1, not an approved model. Its “READY” labels are **statements by its author, not independent file checks**. It contains example scores (61/78), water indices and agronomic statements—**not validated output**. Never transplant its example JSON into a recommendation result shown as real. No guaranteed harvest/yield/profit/water savings, parcel-level inference from broad cells, fabricated calendar dates, random rotation rules, hidden crop substitution or scientifically unjustified probabilities.

## 1. Actual data readiness to check

| Dataset | Proposed v0.1 claim (not independently verified) | Your required action / risk |
|---|---|---|
| **NASA POWER** | daily single point, 1981-01-01 to 2026-11-13, 12 variables; provisional centroid / cell elevation ~581.64 m | Locate raw file(s), params/units, missing days, time zone/dates, point location/resolution, license. **One point is not every parcel**. Verify ET/soil-wetness meanings and provenance. |
| **MODIS MOD13Q1 v061** | 614 NDVI/EVI composites from 2000-02-18 to 2026-10-16; QA-masked over a provisional bbox | Inspect actual files, QA masking, reprojection, cloud/data gaps, resampling, grid/temporal aggregation, boundary validity. A pixel is **not parcel ground truth**. |
| **SMAP SPL3SMP_E** | point-task **IN PROGRESS**, four points × seven layers, 2015–2026 | Do not call it ready. Check actual task completion/download, QA, metadata, units, spatial resolution and uncertainty; don't fetch giant granules at request time. |
| **Ground truth (Ouassanouan et al.)** | 1,558 Tadla-labelled parcels, 2024; 1,460 matched S2 series | Verify files, real Tadla geometry/filter criteria, label provenance/accuracy, duplicates, leakage between parcels, distribution and licensing (proposed CC BY 4.0). Do not treat it as a temporal rotation-sequence dataset. |
| **ORMVAT** | tabulated monograph, no official GIS boundaries | Verify document/table years, agricultural classes, location scope and authoritative provenance; no invented parcel/irrigation polygon. |
| **Crop catalog/irrigation** | draft observed/candidate crop list | Reconcile alfalfa/berseem, annual/perennial, crop labels, class prevalence, irrigation distinctions, rare/unobserved flags; require agronomy + bilingual review. |
| **Crop Kc/calendars** | pending local agronomy reviewer | Keep unsupported dates/water calculations unavailable or clearly research-only; literature fallback must be explicitly reviewed and labeled, not silently asserted as local truth. |
| **Rotation literature/rules** | draft rule IDs and some source references | For each rule record citation, climatic/soil scope, applicability, contradictions, reviewer, validation status and why it supports result. |
| **Official ORMVAT boundaries** | pending | No official geometry until real approved georeferenced data; provisional team-derived polygons cannot silently become official. |

**Data readiness categories:** `MISSING` (file absent), `ACQUIRED` (files downloaded, not verified), `VALIDATED` (metadata/QA/provenance checked), `MODEL_READY` (usable for a documented scientific task). Current proposal’s “READY” is **not equivalent** to `MODEL_READY`.

## 2. Repository and folder plan (proposed locations, verify actual tree)

```text
CSIA6/
  docs/integration/D1-SCIENCE.md      # this guide + actual evidence
  docs/science/data-inventory.md      # one row per real source/file
  docs/science/methodology.md         # assumptions, validation and limitations
  docs/science/rules.md               # rule source/ID/status/reviewer
  docs/science/evaluation.md          # metrics, holdouts, uncertainty
  contracts/crop-vocabulary.csv       # approved stable IDs + review flags
  contracts/fixtures/                # AFTER approval, labelled test cases
  data/manifest.json                 # small metadata manifest only
  data/raw/                          # typically excluded; licenses/PII reviewed
  data/processed/                    # versioned artifacts, avoid committing big/sensitive files
  science/prepare/                   # deterministic offline feature scripts
  science/engine/                    # validated rule/model Python package
  science/tests/                     # pure and model science tests
  scripts/check-datasets.py          # accompanying metadata audit script
  scripts/test_dataset_audit.py      # its independent unittest suite
```

**Large files and parcel geometries:** store in an approved access-controlled artifact store with checksum and license. Avoid adding multi-GB NASA source material or private parcel coordinates to Git. `data/manifest.json` can contain paths/URLs/metadata, but **never access tokens or personally identifying data**. Keep data provenance reproducible by checksum and version rather than copying proprietary records into the repo. Choose approved location and version-control method before writing a pipeline.

## 3. Offline work is safe now: Windows PowerShell setup

```powershell
$ErrorActionPreference = 'Stop'
Set-Location 'C:\path\to\CSIA6' # use real local repo
# Read/inspect sources and open D1 guide. Do not assume a DS venv exists.
py -3 --version
py -3 -m venv .venv-science
& .\.venv-science\Scripts\python.exe -m pip --version
# Stdlib manifest validator does not require pip installs.
New-Item -ItemType Directory -Force 'scripts','docs/science','science/prepare','science/engine','science/tests','data' | Out-Null
# Copy supplied check-datasets.py and test_dataset_audit.py into scripts/.
& .\.venv-science\Scripts\python.exe -m unittest discover -s scripts -p 'test_*.py' -v
if ($LASTEXITCODE -ne 0) { throw 'Metadata audit tests failed.' }
# After writing data/manifest.json with real files and metadata:
& .\.venv-science\Scripts\python.exe scripts/check-datasets.py --manifest data/manifest.json --root .
if ($LASTEXITCODE -ne 0) { throw 'Data files/manifest incomplete; cannot mark ready.' }
```

No guessed `pip install fastapi numpy sklearn` yet; first inspect the scientist's existing `requirements.txt`/conda lock/Python version and reproduce **actual** successful environment. Freeze exact versions and provenance. `check-datasets.py` checks *presence and metadata completeness only*: it does **not** verify scientific quality; its unit tests use synthetic metadata to test the checker, not satellite data. It reads the actual file checksum only when `sha256` was supplied. Run a separate scientific QA notebook/script for each data source.

**Example manifest entry structure — a TEMPLATE, not a dataset record:**

```json
{
  "datasets": [
    {
      "id": "REPLACE_REAL_DATASET_ID",
      "path": "REPLACE_RELATIVE_PATH_TO_REAL_FILE",
      "source_url": "REPLACE_VERIFIED_URL",
      "license": "REPLACE_VERIFIED_LICENSE",
      "version": "REPLACE_REAL_VERSION",
      "geography": "REPLACE_SCOPE_AND_CRS",
      "start_date": "REPLACE_VERIFIED_DATE",
      "end_date": "REPLACE_VERIFIED_DATE",
      "variables_units": "REPLACE_VARIABLES_AND_UNITS",
      "resolution": "REPLACE_SPATIAL_AND_TEMPORAL_RESOLUTION",
      "missing_data": "REPLACE_MISSINGNESS_SUMMARY",
      "processing": "REPLACE_REPRODUCIBLE_STEPS",
      "quality_checks": "REPLACE_OBSERVED_QA_RESULTS",
      "limitations": "REPLACE_REAL_LIMITATIONS",
      "model_use": "REPLACE_DOCUMENTED_ROLE"
    }
  ]
}
```

**Never commit the template as a passing real dataset audit**; fill every field from inspected evidence. Add a `sha256` of the local real file and verify it (optional in structural script but **required for handoff artifacts**).

## 4. Prepare reproducible offline feature data

1. **Inventory:** locate files, dates, units/scale factors/CRS, license, checksum, resolution and missingness. Record each item's true `MISSING/ACQUIRED/VALIDATED/MODEL_READY` status; include commands/logs/versions to reproduce.
2. **Spatial review:** compare source footprint/provisional AOI to Béni Amir/Béni Moussa. Do not confuse the published study rectangle with an official perimeter boundary. Confirm coordinate conventions, reprojection, parcel matching and satellite footprint before spatial joins. **Never infer a farmer's precise soil from a coarse satellite cell.**
3. **Temporal alignment:** use acquisition/QA dates, stable time zones and crop-year definitions; avoid using features from the future relative to a predicted season. Record resampling/aggregations and temporal gaps.
4. **Cleaning:** preserve raw immutable data; handle invalid, cloud-contaminated and missing pixels by documented QA; no arbitrary zero imputation of physically unknown observations. Save cleaning logs and test failure cases.
5. **Join discipline:** validate parcel IDs/geometry overlaps/dates, ensure no duplicates, and separate observational ground truth from published aggregate crop shares. Log counts before/after each filter and join.
6. **Versioning:** write deterministically sorted prepared features with a manifest containing generator commit, input hashes, parameters, spatial/temporal coverage, feature schema, output hash and version. Include unit/schema validation in tests.
7. **No request-time NASA ingestion:** raw downloads, reprojection, model fitting and large artifact creation run **offline**, never in a browser, Next API route or per-user FastAPI call.

**Acceptance:** a teammate can obtain authorized raw assets, run documented scripts, get matching checksums/row counts within documented deterministic rules, and inspect QA/limits. If no verifiable input exists, record the source as `MISSING` and skip dependent model rules.

## 5. Freeze an agronomist-reviewed crop vocabulary

`contracts/crop-vocabulary.csv` — suggested columns (not filled until review):

```csv
crop_id,label_en,label_ary,label_fr,annual_or_perennial,observed_in_tadla,observed_count,ground_truth_class,aliases,status,source_id,reviewer,review_date
```

**Must decide:** crop IDs, synonym mapping, ambiguity (`alfalfa` vs `berseem`), annual/perennial role, minimum sample support, observed vs candidate/unobserved, supported rotations and geographic eligibility, rejected free-text aliases, linguistic review in Arabic-script Darija. The v0.1 list is *a review input only*. Rare and non-observed candidates may not be scientifically equivalent to frequent observed crops. Do not normalize arbitrary user text by a confidence-free fuzzy match; return explicit clarification/unsupported status.

**Tests:** unique stable IDs, no empty reviewed label, no alias collision, proper Unicode `ary`, scientific status and source for each crop, user-free-text unknown not auto-mapped, crop category compatible with engine rule. If a vocabulary change breaks the contract, version the contract and fixtures at once.

## 6. Implement scientific rules / model with reproducible evaluation

**First verify the scientist's actual method.** V0.1 proposes a deterministic rule-based engine; the optional Random Forest classifier mentioned in the proposal **does not, by itself, establish rotation recommendations or historical parcel sequences**. Do not state an ML model is trained or accurate without code/results.

If rule-based is selected, establish `docs/science/rules.md` with, for every rule: `rule_id`, crop/history inputs, geographic/season applicability, rule expression, physical units, evidence source + DOI/URL, validation status (`validated | pending_expert | not_applicable`), reviewer/date, uncertainty and known exceptions. A pending rule cannot silently generate a production claim. Use an explicit deterministic tie-breaker and documented score aggregation **only if reviewed scientifically**.

Define model inputs (exact names/enums/units) from **G0-approved contract**, including what happens with missing zone, coordinates, crop history, planned season, farmer priorities and soil constraints; distinguish optional, explicit unsure and blocking. Define baseline from *farmer's actual stated strategy* rather than guessing from last season. If a defensible baseline cannot be supplied, show `insufficient context` / no result as the approved status. Model output includes versioned evidence, rule/dataset provenance, uncertainty, missing-field warnings, and **no unsupported precision**.

**Evaluation plan before release:** pre-register scientific plausibility cases with agronomy SME; cover reasonable, contraindicated, unsupported, unknown and no-option cases; compare against published literature and local expert checks. For ML extras, split by parcel/space/time to avoid spatial/temporal leakage and class-imbalance tricks; report confusion matrix/per-crop support only on an appropriate labeled target. **Do not invent numerical accuracy, water savings or validation counts.** Record false positives, limitations, bias and uncertainties, especially perennial vs annual differences.

## 7. DS artifacts / handoff checklist (exact owner and location)

| Deliverable | Suggested path | Required PASS gate |
|---|---|---|
| Versioned dataset inventory & licenses | `data/manifest.json`, `docs/science/data-inventory.md` | real files/QA/coverage/checksums verified |
| Offline processing scripts | `science/prepare/*.py` | clean documented run, deterministic versions |
| Prepared feature artifacts | approved controlled artifact store, `data/processed/manifest.json` | version/hash/units/coverage/permissions |
| Approved crop vocabulary EN/ary | `contracts/crop-vocabulary.csv` | SME + linguistic review, alias/annual tests |
| Final DS input spec | `contracts/model-input.md` + canonical approved OpenAPI | all required/unknown units/enums mapped |
| Final DS output spec | `contracts/model-output.md` + canonical approved OpenAPI | statuses, scores, evidence, limits/version |
| Reviewed rule table | `docs/science/rules.md` | every active rule has source and reviewer |
| Engine package | `science/engine/` | stable deterministic tests and no unverified defaults |
| Model artifact | controlled store + hash/version | load/restore tests, provenance, license |
| Scientific methodology / quality | `docs/science/methodology.md`, `evaluation.md` | data leakage, QA, uncertainty and SME signoff |
| Explicitly labelled fixtures | `contracts/fixtures/` **after approval** | each contract status, invalid inputs, no fake production predictions |
| Model service after G0/GD1 | `services/model_api/` | validated contract, tests, health/ready, secure access |
| Installation/operation | `services/model_api/README.md` | pinned env, commands, offline artifact selection |
| Handoff signoff | `docs/integration/D1-SCIENCE.md` | source+model/data versions, known limitations, owner, SHA |

**Contract fixture statuses (still proposed):** `results_available`, `no_suitable_options`, `model_unavailable`, `demo_preview`, `request_error`. For every status, cover only **scientifically defensible real model output** or clearly synthetic **contract testing material**; label fixture `fixture_type` and keep it out of any real-results claim. Positive result test must prove evidence source and limitations; invalid test must prove no score returned.

## 8. Test execution and acceptance (Windows PowerShell)

```powershell
# D1 metadata tests supplied with this handoff:
py -3 -m unittest discover -s scripts -p 'test_*.py' -v
if ($LASTEXITCODE -ne 0) { throw 'Metadata tests failed.' }
# After dataset manifest exists:
py -3 scripts/check-datasets.py --manifest data/manifest.json --root .
if ($LASTEXITCODE -ne 0) { throw 'Data source incomplete.' }
# After engine requirements, paths and scientific test suite are approved:
# & .\.venv-science\Scripts\python.exe -m pip install -r science/requirements.lock.txt
# & .\.venv-science\Scripts\python.exe -m pytest science/tests -q
# Must use ACTUAL recorded install/test versions; no guessed pins.
```

**Required automated tests:** data paths/sha, schema/unit/range and missingness, no post-target-date leakage, deterministic preprocessing, no fake geospatial precision, crop alias rejection, incompatible histories and perennials, absence of data, repeatability, rank/explanation evidence, no unsupported date/water/yield/profit outputs, metadata/model_version consistency, status fixtures. Add negative tests whenever a real bug is found.

**Human review:** agronomy SME signs off all active rotation rules and uncertain assumptions; bilingual reviewer signs off farmer-facing crop labels; model-data QA owner checks each source/license/resolution; server owner accepts machine-readable input/output. If SME unavailable, leave questionable rules **pending**, ship a truthful no-result/disabled integration rather than manufacture advice.

## 9. Git / documentation / rollback

Build this offline on a reproducible branch once M5 baseline is current; do not merge unreviewed datasets or unfinished service into `main`. Commit only licensed lightweight code/manifests/docs/fixtures, not raw sensitive geometry or huge files. Same-commit rule: any script/engine change updates this D1 guide and the exact methodology, tests, version hash. Use `git merge --no-ff --no-commit feature/d1-science-readiness` locally only after GD1; run full frontend tests as well if the shared repo is changed, and validate model checks on candidate. Push only approved verified main; record commit SHA and artifact hashes. For scientific defect, disable the model version, revert service to last reviewed artifact, document failure and rerun reviewed evaluation; never silently patch outputs.

**D1 Definition of done:** real audited data, reviewed vocabulary/rules, reproducible artifact and version registry, evaluated model, explicit invalid/missing behavior, model/source limitations, all scientific tests with observed results, signed DS handoff. If the scientist cannot verify the supplied v0.1 “READY” claims, mark the affected outputs **NOT READY** rather than improvising.
