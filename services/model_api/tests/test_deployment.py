"""Deployment-mode tests: shared token gate, dual-prefix routing, serverless manifest."""
from __future__ import annotations

import importlib
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "services/model_api"))
sys.path.insert(0, str(REPO_ROOT / "science"))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import create_app  # noqa: E402

VALID = {
    "parcel": {"zone": "beni_amir", "irrigation": "flood"},
    "history": [{"crop_id": "wheat"}],
}


def test_health_is_an_open_liveness_probe():
    client = TestClient(create_app())
    assert client.get("/health").status_code == 200


def test_shared_token_gate_is_enforced_when_configured(monkeypatch):
    monkeypatch.setenv("SCIENCE_TOKEN", "secret-1")
    client = TestClient(create_app())
    assert client.get("/health").status_code == 200  # liveness stays open
    assert client.get("/ready").status_code == 401
    assert client.post("/internal/v1/recommendations", json=VALID).status_code == 401
    headers = {"Authorization": "Bearer secret-1"}
    assert client.get("/ready", headers=headers).status_code == 200
    assert client.post("/internal/v1/recommendations", json=VALID,
                       headers=headers).status_code == 200


def test_token_gate_accepts_model_api_token_fallback(monkeypatch):
    monkeypatch.setenv("MODEL_API_TOKEN", "shared-secret")
    client = TestClient(create_app())
    assert client.get("/ready").status_code == 401
    assert client.get("/ready", headers={"Authorization": "Bearer shared-secret"}).status_code == 200


def test_token_gate_is_open_when_no_token_configured(monkeypatch):
    monkeypatch.delenv("SCIENCE_TOKEN", raising=False)
    monkeypatch.delenv("MODEL_API_TOKEN", raising=False)
    client = TestClient(create_app())
    assert client.get("/ready").status_code == 200


def test_dual_prefix_routes_for_the_serverless_bundle():
    client = TestClient(create_app(prefixes=("", "/api/science")))
    assert client.get("/health").status_code == 200
    assert client.get("/api/science/health").status_code == 200
    assert client.get("/api/science/ready").status_code == 200
    r = client.post("/api/science/internal/v1/recommendations", json=VALID)
    assert r.status_code == 200
    assert r.json()["status"] == "results_available"


def test_serverless_manifest_selected_and_verifies():
    """Reload the adapter with SCIENCE_SERVERLESS=1; restore afterwards."""
    import app.engine_adapter as ea

    try:
        import os
        os.environ["SCIENCE_SERVERLESS"] = "1"
        importlib.reload(ea)
        assert "serverless" in str(ea.MANIFEST_PATH.name)
        verdict = ea.verify_artifacts()
        assert verdict["ok"] is True, verdict
        assert verdict["checked"] == 4
        readiness = ea.readiness()
        assert readiness["ready"] is True
    finally:
        os.environ.pop("SCIENCE_SERVERLESS", None)
        importlib.reload(ea)
