"""Contract tests: the service honors contracts/model-input.md + model-output.md v0.2."""
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

VALID = {
    "parcel": {"zone": "beni_amir", "area_ha": 2.5, "irrigation": "flood"},
    "history": [{"crop_id": "wheat", "season": "2024-2025"}],
    "planned_season": "2025-2026",
}


def test_valid_request_returns_union_with_versions():
    r = client.post("/internal/v1/recommendations", json=VALID)
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "results_available"
    assert body["contract_version"] == "0.2"
    assert body["engine_version"].startswith("rule-engine")
    assert body["baseline"]["crop_id"] == "wheat"
    assert 1 <= len(body["alternatives"]) <= 3
    for a in body["alternatives"]:
        assert a["rank"] in (1, 2, 3)
        for e in a["rule_evidence"]:
            assert e["rule_id"].startswith("R-")
        if a["water_evidence"]:
            assert "estimate" in a["water_evidence"]["estimate_label"]


def test_unknown_free_text_maps_to_422_field_error():
    bad = dict(VALID, history=[{"crop_id": "machin chose"}])
    r = client.post("/internal/v1/recommendations", json=bad)
    assert r.status_code == 422
    body = r.json()
    assert body["status"] == "request_error"
    assert body["error"]["fields"][0]["path"] == "history[0].crop_id"
    assert body["error"]["fields"][0]["code"] == "UNRECOGNIZED_CROP"


def test_pydantic_violations_use_the_contract_error_union():
    bad = dict(VALID, parcel={"zone": "galaxy", "irrigation": "flood"})
    r = client.post("/internal/v1/recommendations", json=bad)
    assert r.status_code == 422
    body = r.json()
    assert body["status"] == "request_error"
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert any("zone" in f["path"] for f in body["error"]["fields"])


def test_season_grammar_enforced_at_the_boundary():
    bad = dict(VALID, planned_season="2025/2026")
    r = client.post("/internal/v1/recommendations", json=bad)
    assert r.status_code == 422
    assert r.json()["status"] == "request_error"


def test_beet_repeat_blocked_and_flagged():
    r = client.post("/internal/v1/recommendations", json=dict(
        VALID, history=[{"crop_id": "sugar_beet"}, {"crop_id": "wheat"}]))
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "results_available"
    assert body["baseline"]["score"] == 0
    assert any(e["rule_id"] == "R-BEET-01" for e in body["baseline"]["rule_evidence"])
    assert "baseline_repetition_blocked_by_rule" in body["warnings"]


def test_irrigation_unknown_keeps_water_evidence_null():
    r = client.post("/internal/v1/recommendations", json=dict(
        VALID, parcel={"zone": "beni_amir", "irrigation": "unknown"}, planned_season=None))
    assert r.status_code == 200
    body = r.json()
    for a in body["alternatives"]:
        assert a["water_evidence"] is None
        assert "water_evidence_unavailable_irrigation_unknown" in a["notes"]


def test_optional_fields_default_to_honest_degradation():
    r = client.post("/internal/v1/recommendations", json={
        "parcel": {"zone": "unsure", "irrigation": "unknown"}})
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "results_available"
    assert body["baseline"] is None
    assert "season_absent_results_generic" in body["warnings"]
    assert "baseline_unavailable_no_history" in body["notes"]
    assert "zone_recorded_no_zone_scoring_v0_2" in body["notes"]
