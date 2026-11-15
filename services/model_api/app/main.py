"""Private science service — flaht bladi D2 handoff (contract v0.2, G0-approved).

Two run modes from the SAME code:
  - Local/dev (default): uvicorn on 127.0.0.1:8001, routes at "/" — exactly as before.
  - Vercel serverless: api/science.py builds the same app with additional prefixed
    routes ("" and "/api/science") so any runtime path convention works.

Shared bearer token: when the SCIENCE_TOKEN or MODEL_API_TOKEN env var is set,
/ready and the recommendations route require `Authorization: Bearer <token>`
(/health stays an open liveness probe). Unset (default local) = no gate.
No browser access, no user identity logic, no NASA fetching, no secrets in repo.
"""
from __future__ import annotations

import os
from collections.abc import Sequence

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.engine_adapter import readiness  # noqa: E402
from app.schema import RecommendationsRequest  # noqa: E402
from engine.engine import recommend  # noqa: E402

TITLE = "flaht bladi science service"
VERSION = "0.2.0-approved"


def _expected_token() -> str | None:
    return os.environ.get("SCIENCE_TOKEN") or os.environ.get("MODEL_API_TOKEN") or None


def verify_token(request: Request) -> None:
    """Shared-secret gate, enforced only when a token is configured."""
    expected = _expected_token()
    if not expected:
        return
    supplied = request.headers.get("Authorization", "")
    if supplied != f"Bearer {expected}":
        from fastapi import HTTPException

        raise HTTPException(status_code=401, detail={"code": "INVALID_TOKEN"})


def _union_error(fields: list[dict]) -> dict:
    return {"status": "request_error",
            "error": {"code": "VALIDATION_ERROR", "fields": fields}}


def create_app(prefixes: Sequence[str] = ("",)) -> FastAPI:
    """Build the science app; routes are registered under every given prefix."""
    app = FastAPI(title=TITLE, version=VERSION)

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        fields = []
        for e in exc.errors():
            loc = ".".join(str(p) for p in e.get("loc", []) if p != "body")
            fields.append({"path": loc or "$", "code": e.get("type", "INVALID").upper()})
        return JSONResponse(status_code=422, content=_union_error(fields))

    def health() -> dict:
        """Liveness only - never a claim that scoring is usable."""
        return {"status": "alive"}

    def ready(_: None = Depends(verify_token)) -> JSONResponse:
        """200 only when the engine answers AND every manifest artifact hash matches."""
        r = readiness()
        if not r["ready"]:
            return JSONResponse(status_code=503, content={
                "status": "model_unavailable",
                "reason": ("artifact_hash_mismatch" if not r["artifacts"]["ok"]
                           else "engine_self_test_failed"),
                "detail": {"artifacts": r["artifacts"], "self_test": r["self_test"]},
            })
        return JSONResponse(status_code=200, content={
            "status": "ready",
            "engine_version": r["engine_version"],
            "artifacts_checked": r["artifacts"]["checked"],
            "self_test": r["self_test"]["status"],
        })

    def recommendations(req: RecommendationsRequest,
                        _: None = Depends(verify_token)) -> JSONResponse:
        body = req.model_dump(exclude_none=False)
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

    for prefix in prefixes:
        app.get(f"{prefix}/health")(health)
        app.get(f"{prefix}/ready")(ready)
        app.post(f"{prefix}/internal/v1/recommendations")(recommendations)
    return app


# Local default: routes at "/" (uvicorn app.main:app --app-dir services/model_api).
app = create_app()
