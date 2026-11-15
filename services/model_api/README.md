# services/model_api — private science service (D2 handoff, contract v0.2 PROPOSED)

FastAPI service exposing the validated rule-based rotation engine. This is the **private**
science service: the public BFF route (`feature/b3-model-gateway`, per
`docs/backend/06-MODEL-SERVICE-AND-GATEWAY.md`) stays **blocked until the G0 decisions
C04–C10/C14 are approved** — see `docs/integration/DS-POSITIONS-G0-C04-C14.md`.

## What it serves

| Endpoint | Behavior |
|---|---|
| `GET /health` | liveness only, `{"status": "alive"}` |
| `GET /ready` | 200 only when the engine self-test passes **and** every artifact hash in `artifacts/manifest.json` matches; 503 `model_unavailable` otherwise (no fabricated result) |
| `POST /internal/v1/recommendations` | rule-engine scoring; returns the contract v0.2 discriminated union: `results_available` / `no_suitable_options` (200), `request_error` (422 field-coded) |

No browser access, no user identity logic, no NASA fetching, no secrets. Validation happens
twice: Pydantic boundary (enums, season grammar, ranges) then engine vocabulary resolution
(`UNRECOGNIZED_CROP` field-coded, never fuzzy-matched).

## Run from the repository root (anaconda base)

```bash
# tests (10 health/contract cases)
PYTHONPATH=services/model_api python -m pytest services/model_api/tests -q

# local service (loopback only)
PYTHONPATH=services/model_api python -m uvicorn app.main:app --app-dir services/model_api --host 127.0.0.1 --port 8001
```

Then `curl http://127.0.0.1:8001/health` in another terminal (expect `{"status":"alive"}`).

## Honest boundaries

- `demo_preview` is intentionally NOT implemented in the service: per B0 §5 it is an explicit
  opt-in fixture surface and needs the demo policy decision — the service never returns
  synthetic recommendations as real ones.
- The ML observers (`model/artifacts/*.joblib`) are **evidence-only**: their hashes are
  verified at `/ready`, but they do not produce recommendations (rotation history observation
  layer, separate future endpoint after G0).
- Any regression rule: on engine/artifact failure the service returns honest
  `model_unavailable` 503 — never a fabricated result.
