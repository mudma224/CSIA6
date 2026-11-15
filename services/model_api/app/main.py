"""Private science service — flaht bladi D2 handoff (contract v0.2, PROPOSED).

Endpoints:
  GET  /health                          liveness only
  GET  /ready                           engine + artifact-hash verification
  POST /internal/v1/recommendations     rule-engine scoring, contract v0.2 union

This is the PRIVATE science service (BFF wiring stays blocked until the G0
decisions C04-C10/C14 are approved - see docs/integration/DS-POSITIONS-G0-C04-C14.md).
No browser access, no secrets, no NASA fetching, no user identity logic.
"""
from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

sys.path.insert(0, str(Path(__file__).resolve().parent))  # package imports via app dir
from app.engine_adapter import readiness  # noqa: E402
from app.schema import RecommendationsRequest  # noqa: E402
from engine.engine import recommend  # noqa: E402

app = FastAPI(title="flaht bladi science service", version="0.2.0-proposed")


@app.get("/health")
def health() -> dict:
    """Liveness only - never a claim that scoring is usable."""
    return {"status": "alive"}


@app.get("/ready")
def ready() -> JSONResponse:
    """200 only when the engine answers AND every manifest artifact hash matches."""
    r = readiness()
    if not r["ready"]:
        return JSONResponse(status_code=503, content={
            "status": "model_unavailable",
            "reason": "artifact_hash_mismatch" if not r["artifacts"]["ok"] else "engine_self_test_failed",
            "detail": {"artifacts": r["artifacts"], "self_test": r["self_test"]},
        })
    return JSONResponse(status_code=200, content={
        "status": "ready",
        "engine_version": r["engine_version"],
        "artifacts_checked": r["artifacts"]["checked"],
        "self_test": r["self_test"]["status"],
    })


def _union_error(fields: list[dict]) -> dict:
    return {"status": "request_error",
            "error": {"code": "VALIDATION_ERROR", "fields": fields}}


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Map Pydantic errors into the contract's field-coded request_error union (B0 §5)."""
    fields = []
    for e in exc.errors():
        loc = ".".join(str(p) for p in e.get("loc", []) if p != "body")
        fields.append({"path": loc or "$", "code": e.get("type", "INVALID").upper()})
    return JSONResponse(status_code=422, content=_union_error(fields))


@app.post("/internal/v1/recommendations")
def recommendations(req: RecommendationsRequest) -> JSONResponse:
    body = req.model_dump(exclude_none=False)
    # Pydantic already enforced enums/season grammar; the engine owns vocabulary
    # resolution (UNRECOGNIZED_CROP is field-coded by the engine itself).
    result = recommend({
        "parcel": body["parcel"],
        "history": body["history"],
        "planned_season": body["planned_season"],
        "farmer_priorities": body["farmer_priorities"],
        "baseline": body["baseline"],
    })
    if result["status"] == "request_error":
        return JSONResponse(status_code=422, content=result)
    return JSONResponse(status_code=200, content=result)
