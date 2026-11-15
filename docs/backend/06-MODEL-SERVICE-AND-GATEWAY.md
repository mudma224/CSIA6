# D2 + B3 — Validated model service and secure backend gateway

**Owners (to confirm):** D2 = Data Science contributor; B3 = backend integration owner · **Branches:** `feature/d2-model-service` and `feature/b3-model-gateway` (separate, sequential integration commits) · **Gates:** signed G0 contract, GD1 validated engine/artifact, G2 backend identity/RLS where relevant. **Status:** proposed; science outputs and prediction request schemas are **not yet authorized**.

## 0. Intended communication

```text
Next.js UI
  POST /api/v1/recommendations (only if approved)
     |
     v
Next.js route handler: session/policy, input validation and request ID
     |
     | short timeout; private service identity; server-only secret
     v
FastAPI: approved Pydantic scientific input → validated offline engine
     |          (no live NASA fetch; no identity/DB ownership logic)
     v
scientific status/result + model/data versions + source/limitations
     |
Next.js: validate response shape/status; redact logs; HTTP mapping
     |
UI: approved status discriminant, max 2 actual alternatives, EN/ary
```

The *public* BFF route and the *private* FastAPI inference route are two different surfaces, potentially with different names. **Do not publish an unauthenticated model endpoint** and do not implement scoring in the BFF or browser. If the DS engine is packaged directly in a secure internal Python process, avoid redundant layers. No inference call until model artifacts, validity rules and public contract are approved.

## 1. D2 — preflight, environment and files (PowerShell)

```powershell
$ErrorActionPreference = 'Stop'
Set-Location 'C:\path\to\CSIA6'  # adjust to actual checkout
if (@(git status --porcelain).Count -ne 0) { throw 'Start clean.' }
git fetch origin
git switch main
git pull --ff-only origin main
$base = (git rev-parse HEAD).Trim()
if ($base -ne (git rev-parse origin/main).Trim()) { throw 'Not at remote main.' }
# Before implementation: require approved contract, science methodology/artifact hashes,
# verified source manifest and actual D1 observed scientific tests.
git switch -c feature/d2-model-service
if ($LASTEXITCODE -ne 0) { throw 'Inspect existing D2 branch.' }
py -3 --version
py -3 -m venv .venv-model
# Only after inspecting existing Python environment/lock; this is a minimal scaffold:
& .\.venv-model\Scripts\python.exe -m pip install fastapi uvicorn pytest httpx
if ($LASTEXITCODE -ne 0) { throw 'Python install failed.' }
# Freeze resolved versions in services/model_api/requirements.lock.txt
& .\.venv-model\Scripts\python.exe -m pip freeze
```

**Do not treat the `pip install` command as a reproducible pin:** after confirming compatibility with the scientist's actual engine, write and commit a curated, fully pinned requirements file and reproducible clean install. Do not install a second heavy ML framework just because a template mentions it.

**Proposed file tree:**

| Path | Action | Responsibility |
|---|---|---|
| `services/model_api/app/__init__.py` | CREATE | Python package |
| `services/model_api/app/main.py` | CREATE | non-misleading liveness/readiness first; prediction only later |
| `services/model_api/app/schema.py` | CREATE **after G0** | Pydantic models from approved DS contract |
| `services/model_api/app/engine.py` | CREATE **after GD1** | loader and thin adapter for scientifically validated engine |
| `services/model_api/tests/test_health.py` | CREATE | complete actual health/readiness tests |
| `services/model_api/tests/test_contract.py` | CREATE after approved schema | valid/invalid/missing status fixture and OpenAPI tests |
| `services/model_api/artifacts/manifest.json` | CREATE from actual approved artifact | hash, model/data versions, source limits (no raw farm data) |
| `services/model_api/requirements.lock.txt` | CREATE after environment verification | exact pip versions |
| `services/model_api/.env.example` | CREATE | non-secret config names |
| `services/model_api/README.md` | CREATE | launch, test, readiness and artifact fetch |
| `docs/integration/D2-MODEL-SERVICE.md` | CREATE | code/guide sync and evidence |

## 2. Complete safe FastAPI scaffold: no fake prediction endpoint

Only add this independent health code **after** the FastAPI service architecture is approved. A service with no loaded/validated engine is **not ready**. No handler returns sample recommendations.

**`services/model_api/app/main.py`** — CREATE:

```python
from fastapi import FastAPI, HTTPException

app = FastAPI(title="flaht bladi scientific service", version="0.0.0-unready")

@app.get("/health")
def health() -> dict[str, str]:
    """Liveness only, never a claim that scientific predictions are usable."""
    return {"status": "alive"}

@app.get("/ready")
def ready() -> None:
    """Remain unavailable until the approved engine/artifact loader is integrated."""
    raise HTTPException(
        status_code=503,
        detail={"code": "MODEL_NOT_READY", "message": "Validated model is not loaded."},
    )
```

**`services/model_api/tests/test_health.py`** — CREATE:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_liveness_does_not_claim_readiness():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'alive'}
    assert 'model_version' not in response.json()

def test_unvalidated_engine_is_not_ready():
    response = client.get('/ready')
    assert response.status_code == 503
    assert response.json()['detail']['code'] == 'MODEL_NOT_READY'

def test_no_unapproved_recommendation_endpoint():
    response = client.post('/api/v1/recommendations', json={})
    assert response.status_code == 404
```

```powershell
# Run from repository root with Python module path; Windows PowerShell:
$env:PYTHONPATH = (Resolve-Path 'services/model_api').Path
& .\.venv-model\Scripts\python.exe -m pytest services/model_api/tests/test_health.py -q
if ($LASTEXITCODE -ne 0) { throw 'Model service health tests failed.' }
# Start locally only when approved; new terminal:
& .\.venv-model\Scripts\python.exe -m uvicorn app.main:app --app-dir services/model_api --host 127.0.0.1 --port 8001
# Another terminal (without exposing secrets):
# Invoke-RestMethod http://127.0.0.1:8001/health
```

**Expected, NOT claimed:** health 200, readiness 503 and unapproved prediction route 404. After G0/GD1 you **replace the stubs and their tests**, not falsely mark `ready` just because the server launched. Use real artifact-load checks, exact hash/version verification and a small validated inference self-test; readiness 200 only when all are true.

## 3. After scientific contract approval: exactly how to add inference

**D2 owner must implement in this order:**

1. Freeze approved `contracts/model-input.md`, `contracts/model-output.md` and FastAPI OpenAPI schema; implement Pydantic models for all approved enums, field optional/null semantics, units and status **discriminated union** (no arbitrary default values). Confirm API versioning.
2. Load **pre-computed, immutable, versioned** feature artifacts on startup. Verify filename/hash, license, geographic and temporal coverage and `model_version`/`data_versions` from manifest; fail readiness when missing or corrupted. Do **not** download raw NASA files or retrain model at request time.
3. Implement an engine adapter calling the validated D1 method. Inference must preserve the farmer's explicit baseline/history; if information insufficient, return an approved defensible no-result/validation status, not a guessed crop. Validate crop IDs/annual-vs-perennial and the season grammar. Keep deterministic rules tied to rule IDs/source citations.
4. Use an *internal* inference route with an explicit service access control (Cloud Run IAM/workload identity or rotated service secret) and network restriction. **The DS service must not accept a browser token as proof of user authorization**; BFF handles user permissions.
5. Serialize only approved outputs: scientifically supported option(s), rank, explanation evidence, source/time/resolution, limitations, missing fields, model/data/schema versions. No scientific score unless its meaning/units are validated. Model unavailable returns an honest unavailable state with **no fabricated baseline score**.
6. Export machine-readable OpenAPI via running FastAPI app, validate JSON Schema and fixtures, and hand one frozen schema revision to backend. The private scientific contract and public BFF contract are related through a documented backend adapter, not guessed to be byte-for-byte identical.
7. Tests: supported/unrecognized crops, known/unknown season, no coordinates, incomplete history, missing data, duplicate/out-of-date artifact, 0/1/2+ alternative outcomes, unsupported climate/zone, all status variants, sources/limitations, deterministic ordering, missing-fields consistency. Distinguish integration transport errors from science no-results.

**The previously suggested v0.1 example (score 61/78, `water_evidence.relative_index=0.82`, 33–66 kg N/ha, etc.) is not permission to generate production outputs**. Submit scientific validation, not just contract-compliant formatting.

## 4. B3 — Backend secure gateway, exact workflow

**Dependency:** D2 model service is deployed privately and GD2 tests pass; G2 backend identity/parcel API is stable. **Branch:** `feature/b3-model-gateway`. Backend owns the route handler and science adapter; DS owns only private FastAPI engine/response schema.

| Proposed repo file | Action | Behavior |
|---|---|---|
| `src/lib/server/modelGateway.ts` | CREATE from **approved** model schema | server-only authenticated transport, timeout/cancel, safe errors |
| `src/lib/server/modelAdapters.ts` | CREATE | explicit public-vs-private API transformation without scientific recomputation |
| `src/app/api/v1/recommendations/route.ts` | CREATE only after approval | auth/approved demo policy, validation, service call, safe status |
| `tests/model-gateway.test.ts` | CREATE | fake transport/contract fixtures, validation, no secret leakage |
| `tests/recommendations-route.test.ts` | CREATE | every approved HTTP/app status and auth boundary |
| `.env.example` | UPDATE | `MODEL_API_BASE_URL=`, `MODEL_API_TIMEOUT_MS=`, private auth config key names |
| `docs/integration/B3-MODEL-GATEWAY.md` | CREATE | complete adapter/route code and tests after approved final contract |

### Required server behavior

- Validate the *public API* request and verified farmer identity first; for demo requests, require a **separate explicit approved demo policy**. Do not send model call on unauthorized or malformed input.
- Build a DS request **only using approved field mappings**, including unknown/missing semantics. Never produce canonical crops or priorities from UI free text by guessing. Never put farmer phone/owner ID in the scientific request unless reviewed as genuinely required (usually unnecessary).
- Use `process.env.MODEL_API_BASE_URL` server-side, an approved service identity/secret, and an explicit timeout. Never accept a user-supplied model URL, expose internal API credentials or use `NEXT_PUBLIC_MODEL_*`. Disable redirects to untrusted hosts; configure exact allowed origin/TLS.
- On HTTP 200, **runtime-validate** the exact science status union and ensure fields/evidence/versions are present where required. On non-200, malformed response, network error or timeout, return a safe approved error/unavailable. **No automatic `demo_preview` fallback** on failure.
- Enforce response budget, cap visible alternatives at **approved** UI count without silently hiding safety warnings, preserve rank/original source. Do not rescore or re-rank science results in Next.js.
- Add request ID + elapsed time + version (not raw coordinates/phone/history) to server logs; bound concurrency and rate limit real and demo requests. Use `Cache-Control: no-store` for private recommendation context/results.

### Example service transport skeleton (NO production prediction code yet)

After C01/C10 approval, a generic server-only call may use `fetch` and `AbortController` without any new dependencies. The **actual request/response validation and auth** must be supplied from approved schema before this can be used:

```typescript
// Illustration of transport only. NOT a callable production recommendation service.
export async function postToPrivateModel(
  url: string, serverToken: string, approvedBody: unknown, timeoutMs: number,
): Promise<unknown> {
  if (!url.startsWith('https://')) throw new Error('TLS model endpoint required');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new Error('Invalid timeout');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serverToken}` },
      body: JSON.stringify(approvedBody),
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`UPSTREAM_HTTP_${response.status}`);
    return await response.json(); // UNTRUSTED until canonical schema validation.
  } finally {
    clearTimeout(timer);
  }
}
```

**Do not wire this illustrative helper before service identity policy, fixed allowlisted URL, request schema and runtime response parser are approved.** The function itself does not verify the caller or validate `approvedBody`, does not enforce a response size, and throws generic errors. The production gateway **must** add those defenses; do not call it secure just because a bearer header exists. Cloud Run IAM may require identity tokens rather than a fixed secret; adopt the actual approved hosting authentication method.

## 5. Status/contract and failure test matrix

| Test input / condition | Expected gate |
|---|---|
| Valid, approved input + validated result | fields/versions/source accepted; UI may display only actual returned options |
| No suitable model alternatives | real no-options response with reason; no computed fallback |
| Missing crop ID / unsupported season / unknown priority | field-level error or not-enough-context, per approved status |
| User omits coordinates | accepted if optional, provenance reflects reduced precision |
| DS process dead or readiness 503 | BFF reports truthful model unavailable/503, no demo fixture |
| DS request exceeds timeout | BFF reports timeout/unavailable; client can retry explicitly |
| DS returns invalid JSON / wrong `model_version` / absent evidence | reject as upstream invalid (502), no partial fake result |
| Invalid or expired auth | reject before DS call (401); verify mock DS called **zero times** |
| Duplicate submit with concurrent clicks | UI and BFF guard/rate limit, no duplicate persisted result |
| DS leaks secret, PII, precise source not supported | block response/log and fix contract/serialization |
| Demo fixture requested explicitly and approved | prominent demo label, never silently treated as validated output |

**Cross-language tests:** export actual FastAPI OpenAPI, validate BFF adapter both ways against reviewed fixtures, generate TypeScript types from public `contracts/openapi.json`, run Python model tests and frontend/route tests. Detect schema drift in CI by regenerating and checking diff. No contradictory Python and TypeScript field definitions.

## 6. Deployment, readiness, documentation, rollback

**FastAPI local:** loopback `127.0.0.1:8001`; remote service must be HTTPS, private/authenticated or restricted to BFF. Container build may be added only after artifact license, health/readiness, memory and service account policy are approved. Readiness checks must validate actual loaded model and correct artifact checksum, not only return HTTP200. Prepare environment variables as names only; no raw NASA API keys, private data or bearer tokens in repo. Choose timeout by measured service latency and real application UX; do not invent an SLO.

**B3 deployment:** server-only env holds fixed model base URL/identity; reject untrusted upstream redirects; scrub logs; restrict CORS/origin at public BFF; no browser model access. Configure and test fallback UI if service cannot be reached. Observability tracks availability/status/version, not private farmer payloads.

**Checks (PowerShell, after approved production code exists):**

```powershell
# D2 science tests, from repo root:
$env:PYTHONPATH = (Resolve-Path 'services/model_api').Path
& .\.venv-model\Scripts\python.exe -m pytest services/model_api/tests -q
if ($LASTEXITCODE -ne 0) { throw 'DS service tests failed.' }
# B3 (only when branch and code exist):
npm ci
npm run lint; if ($LASTEXITCODE -ne 0) { throw 'Lint failed.' }
npm run typecheck; if ($LASTEXITCODE -ne 0) { throw 'TS failed.' }
npm run test; if ($LASTEXITCODE -ne 0) { throw 'Tests failed.' }
npm run build; if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
```

**No Pull Requests.** Each owner updates own D2/B3 guide with complete code/test blocks, versions, known scientific/transport failures and exact observed results in same feature commit. Local `git merge --no-ff --no-commit <feature-branch>` only after dedicated and merged-tree checks pass; no force push; record pushed `main` SHA. On DS regression, mark readiness unavailable and route to explicit unavailable UI while rolling back to last *validated* artifact/schema version; never substitute fabricated recommendations. On BFF regression, disable model proxy separately from unrelated approved parcel/community APIs.

**GD2 Definition of done:** validated service + fixtures + OpenAPI + private authenticated endpoint + readiness/source versions and observed tests. **G3 Definition of done:** real secure gateway with checked user/session, schema-validated request/response, safe status mapping, timeouts, scientific provenance and observed failure cases. Until both, recommendation UI remains M2 unavailable.
