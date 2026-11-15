"""Vercel Python serverless entry point for the private science service.

Same code as the local uvicorn service (services/model_api/app/main.py), built with
prefixed routes so /api/science/* works regardless of how the runtime passes the
request path. SCIENCE_SERVERLESS=1 switches readiness to the serverless manifest
(rule-engine files only; the joblib observers stay evidence-only on the local run).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("SCIENCE_SERVERLESS", "1")
for p in (str(REPO_ROOT), str(REPO_ROOT / "services" / "model_api")):
    if p not in sys.path:
        sys.path.insert(0, p)  # repo root (engine, data) + service dir (app package)

from services.model_api.app.main import create_app  # noqa: E402

PREFIX = os.environ.get("SCIENCE_ROUTE_PREFIX", "/api/science")
app = create_app(prefixes=("", PREFIX))
