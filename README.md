# flaht bladi — CSIA6 (NASA Space Apps Challenge 2026 · Field Shift)

Mobile-first crop-rotation decision companion for the **Tadla irrigated perimeter** (Béni Amir /
Béni Moussa, Morocco). Bilingual (`en` LTR / `ary` Darija RTL), demo-first, honest by design:
every displayed number is a **source-cited ranking score or a labeled estimate** — never a
guaranteed yield, profit or water saving.

The recommendation chain is live: parcel form → Next.js BFF (`POST /api/v1/recommendations`)
→ private FastAPI science service (`:8001`, artifact hashes verified) → deterministic
rule-based rotation engine (source-cited agronomic rules) → ranked options with evidence.

## Quick start (frontend only)

- Node.js 22.22.2 (see `.nvmrc`), npm and Git.
- Keep the committed `package-lock.json`; do not reinstall package versions.

```bash
npm ci
npm run dev          # http://localhost:3000
```

The app runs fully without the science service: `/rotation` then shows the honest
"scoring service unavailable" state. To get real recommendations, also start the service:

## Full chain (recommended — this is how the team runs it)

Prerequisites: Node 22.22.2 + **Python 3.10+** (developed on anaconda base, 3.14).

```bash
# 1. install everything
npm ci
pip install -r services/model_api/requirements.lock.txt

# 2. start the private science service (terminal 1)
PYTHONPATH=services/model_api python -m uvicorn app.main:app \
  --app-dir services/model_api --host 127.0.0.1 --port 8001
curl http://127.0.0.1:8001/ready   # 200 = engine loaded + artifact hashes verified

# 3. start the app (terminal 2)
npm run dev                        # http://localhost:3000
```

Optionally copy `.env.example` to `.env.local` to override `MODEL_API_BASE_URL`,
`MODEL_API_TIMEOUT_MS` or set `MODEL_API_TOKEN` (never commit `.env.local`).

Then: **Describe a parcel** (`/parcels/new`) → pick crops from the validated vocabulary →
**See my rotation options** → `/rotation` shows your current strategy scored with the same
rules as the alternatives, each option carrying its rule evidence.

## Tests

```bash
npm run lint && npm run typecheck && npm run test     # frontend (vitest)
npm run build                                         # production build
npx playwright install chromium                       # once
PYTHONPATH=services/model_api python -m pytest services/model_api/tests science/tests -q
npm run test:e2e                                      # full-chain browser journeys (needs :8001 up)
```

CI (`.github/workflows/frontend.yml`) runs all of the above on every push, including the
science service and the full-chain E2E journey.

## Science & data (deterministic, reproducible)

| Folder | Content |
|---|---|
| `model/` | ML rotation-history observers (Wheat/Alfalfa macro-F1 0.864; 3-class 0.843) — criteria pre-registered in `criteres_sauvegarde.json` v2, artifacts committed, seed 42 |
| `science/engine/` | The rule-based scoring engine: `rules_table.json` (8 rules, each with expression, magnitude and citation) + `crops_agronomy.json` (FAO-56 water estimates, planting windows) |
| `services/model_api/` | Private FastAPI service: `/health`, `/ready` (SHA-256 artifact verification), `POST /internal/v1/recommendations` |
| `contracts/` | `model-input.md` + `model-output.md` v0.2 and runtime-tested fixtures in `contracts/fixtures/` |
| `src/data/` | Vetted static data: crop vocabulary (25 crops, EN + MSA Arabic), verified map places v1.1 |

Regenerate the model artifacts (needs the ground-truth + NASA datasets locally, paths in
`model/01_prepare_features.py` CONFIG block):

```bash
python model/01_prepare_features.py   # feature extraction
python model/02_train_rf.py           # training + evaluation (criteria v2)
python model/03_evaluate_rules.py     # rule baselines (ML justification)
```

## Routes

| Route | Behavior |
|---|---|
| `/` | Bilingual welcome, language selection, audio transcript / missing-recording fallback |
| `/access` | Phone **format hint** and direct demo access; no real SMS, OTP, authentication or saved number |
| `/home` | Local dashboard and honest navigation |
| `/profile` | UI-only display-name draft and language choice; no account or saved items |
| `/rotation` | **Live**: scored baseline + up to 2 ranked alternatives with rule evidence, water values labeled *estimate*; honest unavailable / error / no-option states when applicable |
| `/parcels/new` | 4-step guided form; crop pickers from the validated vocabulary, "I don't know" everywhere valid, campaign-grammar seasons, optional unverified coordinates |
| `/map` | M3 interactive OSM basemap: 2 sourced dams + 3 reference cities (single sourced dataset), honest empty market/supplier categories |
| `/community` | Session-only local community previews; no public posts or saved records |
| `/calendar` | Unavailable pending agronomy-reviewed dates — no invented dates |
| `/foundation-preview` | M0 internal UI preview |

Demo policy (G0-approved, see `docs/decisions.md`): no auth provider yet (C02 pending) — the
BFF is rate-limited (30 req/min/IP), persists nothing, logs no farmer inputs. Scores are
ranking scores, never probabilities. The ML observers never generate recommendations; they
are evidence-only artifacts whose hashes are verified at service startup.

## Documentation

- Scope: `docs/01-cahier-des-charges.md` · roadmap: `docs/frontend-guide.md` · rules: `docs/instructions.md` · architecture: `docs/system-design.md`
- Integration contract + G0 decisions: `docs/backend/02-INTEGRATION-CONTRACT-DRAFT.md`, `docs/integration/DS-POSITIONS-G0-C04-C14.md` (**APPROVED 2026-11-15**), `contracts/`
- DS execution guides: `docs/backend/05-DATA-SCIENCE-EXECUTION.md`, `docs/backend/06-MODEL-SERVICE-AND-GATEWAY.md`
- Milestone guides: `docs/frontend/milestone-M1/` … `M5-DEV2.md` (M2 guide carries a post-G0 addendum)
- Decision log: `docs/decisions.md`

Sequential owner order: DEV1 M1→M2→M3; DEV2 M4→M5. Feature branches merge **locally** into a
tested `main`, which is then pushed. No Pull Requests.

## Deploy online (100 % free — Vercel)

The repo is **zero-config deployable** to Vercel: the Next.js app and the science engine ship
as functions of the SAME project (the BFF resolves the science function at the deployment's
own origin — no second platform, no cold-start pain).

1. Push this repo to GitHub (already done: `github.com/mudma224/CSIA6`).
2. On [vercel.com](https://vercel.com) (free Hobby account): **Add New… → Project** → import
   `mudma224/CSIA6` → **Deploy** (accept the detected Next.js settings — no configuration needed).
3. Recommended hardening (2 minutes): in Project → Settings → Environment Variables, add
   `MODEL_API_TOKEN` with a random value (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`)
   for Production+Preview+Development. One variable covers both sides: the BFF sends it as the
   bearer and `api/science.py` enforces it. Redeploy after adding it.
4. Verify: `https://<your-app>.vercel.app/api/science/ready` → `{"status":"ready",...}` — then
   open the app, describe a parcel, and get real ranked options.

What ships server-side on Vercel:
- Node functions: the app pages + `POST /api/v1/recommendations` (BFF: validation, rate limit,
  same-origin call to the science function, honest status mapping).
- Python function (`api/science.py`): the validated rule engine + `/health`, `/ready` (hash
  verification via `manifest.serverless.json`) and the recommendations route, exposed under
  `/api/science/*` (see `vercel.json` rewrites + `includeFiles`).
- The ML observers (joblibs) stay local evidence artifacts: they are hash-verified on the
  local run and are **not** part of the serverless bundle (evidence-only role, per contract).
- Local development is unchanged (`uvicorn :8001` + `npm run dev`); `MODEL_API_BASE_URL` still
  points the BFF wherever you want, and the loopback HTTPS exemption never applies off-localhost.
