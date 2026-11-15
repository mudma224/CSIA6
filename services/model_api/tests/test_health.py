"""Health/readiness tests for the private science service (D2 guide §2)."""
from __future__ import annotations

import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "services/model_api"))
sys.path.insert(0, str(REPO_ROOT / "science"))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def test_liveness_does_not_claim_readiness():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "alive"}
    assert "engine_version" not in response.json()


def test_ready_is_truthful_after_artifact_verification():
    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["artifacts_checked"] >= 8
    assert body["self_test"] == "results_available"


def test_no_public_recommendation_route():
    # The public BFF route is a different surface (B3), not this private service.
    assert client.post("/api/v1/recommendations", json={}).status_code == 404
