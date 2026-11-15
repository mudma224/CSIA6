"""Tests of the rule-based rotation engine (D1 handoff, contract v0.2).

Rule-level behaviour is tested white-box through ``engine._score`` (so assertions do not
depend on the max-3 alternatives cap); contract-level behaviour through ``recommend``.

Run from the repository root (anaconda base):
    python -m pytest science/tests -q
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "science"))

import engine.engine as eng  # noqa: E402
from engine.engine import (  # noqa: E402
    AGRO, ENGINE_VERSION, FLOOR, recommend, validate,
)

CTX = {"weights": {"soil_health": 1.0, "water_saving": 1.0, "yield_stability": 1.0},
       "irrigation": "flood", "planned_season": None}


def base_request(**overrides) -> dict:
    req: dict = {
        "parcel": {"zone": "beni_amir", "irrigation": "flood"},
        "history": [{"crop_id": "wheat", "season": "2024-2025"}],
    }
    req.update(overrides)
    return req


def rule_ids(scored: dict) -> list[str]:
    return [e["rule_id"] for e in scored["rule_evidence"]]


def by_id(response: dict, crop_id: str) -> dict | None:
    return next((a for a in response["alternatives"] if a["crop_id"] == crop_id), None)


def test_engine_version_and_contract():
    r = recommend(base_request())
    assert r["contract_version"] == "0.2"
    assert r["engine_version"] == ENGINE_VERSION
    assert "crops_vocabulary" in r["data_versions"]


def test_baseline_is_scored_with_the_same_rules():
    r = recommend(base_request())
    assert r["baseline"]["crop_id"] == "wheat"
    assert "R-BRK-01" in rule_ids(r["baseline"])
    assert r["baseline"]["score"] < 100


def test_legume_credit_for_cereals():
    after_fava = eng._score("wheat", ["fava_bean"], dict(CTX))
    after_onion = eng._score("wheat", ["onion"], dict(CTX))
    assert "R-LEG-01" in rule_ids(after_fava)
    assert "R-LEG-01" not in rule_ids(after_onion)
    assert after_fava["score"] == 100 and after_onion["score"] == 100  # both clipped at 100
    # credit also reaches maize, and is visible un-clipped against a cereal-after-cereal case:
    maize_fava = eng._score("maize", ["fava_bean"], dict(CTX))
    assert "R-LEG-01" in rule_ids(maize_fava)
    two_cereals_then_maize = eng._score("maize", ["wheat", "barley"], dict(CTX))
    assert two_cereals_then_maize["score"] < 100  # penalized, proving the scale is live


def test_cereal_after_cereal_penalized_and_nematode_stacks():
    one = eng._score("maize", ["wheat"], dict(CTX))
    two = eng._score("maize", ["wheat", "barley"], dict(CTX))
    assert "R-BRK-01" in rule_ids(one)
    assert "R-BRK-01" in rule_ids(two) and "R-NEM-01" in rule_ids(two)
    assert two["score"] < one["score"]


def test_beet_after_beet_is_blocking_everywhere_it_appears():
    # As an alternative (baseline wheat): sugar_beet must be excluded, not ranked.
    r = recommend(base_request(history=[{"crop_id": "wheat"}, {"crop_id": "sugar_beet"}]))
    assert by_id(r, "sugar_beet") is None
    assert any(b["crop_id"] == "sugar_beet" for b in r.get("excluded", []))
    # As the baseline (repeat sugar beet): score 0 + explicit warning.
    r2 = recommend(base_request(history=[{"crop_id": "sugar_beet"}, {"crop_id": "wheat"}]))
    assert r2["baseline"]["score"] == 0
    assert "R-BEET-01" in rule_ids(r2["baseline"])
    assert "baseline_repetition_blocked_by_rule" in r2["warnings"]


def test_onion_after_onion_strong_penalty_but_non_blocking():
    scored = eng._score("onion", ["onion"], dict(CTX))
    # R-FAM-01 (-15, same family) stacks with R-ONI-01 (-30, white rot) — documented stacking
    assert "R-ONI-01" in rule_ids(scored) and "R-FAM-01" in rule_ids(scored)
    assert scored["score"] == 55  # 100 - 15 - 30, still non-blocking (>= floor)
    other = eng._score("carrot", ["onion"], dict(CTX))
    assert "R-ONI-01" not in rule_ids(other)


def test_unknown_free_text_is_never_canonicalized():
    r = recommend(base_request(history=[{"crop_id": "machin chose"}]))
    assert r["status"] == "request_error"
    assert r["error"]["fields"][0]["code"] == "UNRECOGNIZED_CROP"
    r_ar = recommend(base_request(history=[{"crop_id": "القمح"}]))
    assert r_ar["baseline"]["crop_id"] == "wheat"


def test_history_crop_outside_candidates_never_crashes():
    # barley / trees / rare crops are legal history entries: family known, rules degrade
    scored = eng._score("maize", ["barley", "barley"], dict(CTX))
    assert scored["score"] < 100  # cereal-after-cereal still applies
    tree_hist = eng._score("wheat", ["olive"], dict(CTX))
    assert "R-LEG-01" not in rule_ids(tree_hist)
    r = recommend(base_request(history=[{"crop_id": "potato"}]))
    assert r["status"] == "results_available"
    assert r["baseline"]["crop_id"] == "potato"
    assert "water_evidence_not_available_for_this_crop" in r["baseline"]["notes"]
    assert r["baseline"]["water_evidence"] is None


def test_season_grammar_and_optional_season():
    bad = recommend(base_request(history=[{"crop_id": "wheat"}], planned_season="2025/2026"))
    assert bad["status"] == "request_error"
    non_consecutive = recommend(base_request(history=[{"crop_id": "wheat"}],
                                             planned_season="2024-2026"))
    assert non_consecutive["status"] == "request_error"
    absent = recommend(base_request())
    assert absent["status"] == "results_available"
    assert "season_absent_results_generic" in absent["warnings"]
    assert all("planting_window_not_evaluated_season_absent" in a["notes"]
               for a in absent["alternatives"])
    provided = recommend(base_request(planned_season="2025-2026"))
    assert all("planting_window_not_evaluated_season_absent" not in a["notes"]
               for a in provided["alternatives"])


def test_irrigation_unknown_degrades_water_evidence_without_penalty():
    ctx_unknown = dict(CTX, irrigation="unknown")
    alf = eng._score("alfalfa", [], ctx_unknown)
    assert alf["water_evidence"] is None
    assert "water_evidence_unavailable_irrigation_unknown" in alf["notes"]
    ctx_flood = dict(CTX, irrigation="flood")
    alf_k = eng._score("alfalfa", [], ctx_flood)
    assert alf_k["water_evidence"]["estimate_label"].startswith("estimate")
    assert alf_k["water_evidence"]["crop_water_need_mm_estimate"] == [800, 1600]
    assert "R-WAT-01" in rule_ids(alf_k)  # very_high need + surface irrigation


def test_priorities_optional_neutral_and_documented_effect():
    absent = recommend(base_request())
    assert "priorities_not_provided_neutral_weights" in absent["notes"]
    ctx_strong = dict(CTX, weights={"soil_health": 2.0, "water_saving": 1.0,
                                    "yield_stability": 1.0})
    maize = eng._score("maize", ["wheat"], ctx_strong)
    brk = next(e for e in maize["rule_evidence"] if e["rule_id"] == "R-BRK-01")
    assert brk["delta"] == -24  # -12 x weight 2.0
    unbound = recommend(base_request(farmer_priorities={"market": 3}))
    assert "priority_market_no_rule_bound_v0_2" in unbound["notes"]


def test_alternatives_capped_ranked_deterministically():
    r = recommend(base_request())
    assert len(r["alternatives"]) == 3
    scores = [a["score"] for a in r["alternatives"]]
    assert scores == sorted(scores, reverse=True)
    assert [a["rank"] for a in r["alternatives"]] == [1, 2, 3]
    assert recommend(base_request())["alternatives"][0]["crop_id"] == r["alternatives"][0]["crop_id"]


def test_prevalence_tiebreak_prefers_locally_grown_crops():
    # drip irrigation keeps every neutral candidate at 100, so the order is pure prevalence
    r = recommend(base_request(history=[], parcel={"zone": "beni_amir", "irrigation": "drip"}))
    top_ids = [a["crop_id"] for a in r["alternatives"]]
    assert top_ids == ["wheat", "alfalfa", "sugar_beet"]  # 887 > 138 > 100 observed parcels


def test_perennial_trees_never_proposed():
    assert len(AGRO) == 25  # every vocabulary crop carries a family
    for tree in ("olive", "citrus", "pomegranate"):
        assert AGRO[tree]["rotation_candidate"] is False
        assert not AGRO[tree].get("water_need_mm_estimate")
    r = recommend(base_request(history=[]))
    assert all(a["crop_id"] not in ("olive", "citrus", "pomegranate") for a in r["alternatives"])


def test_empty_history_honest_baseline():
    r = recommend(base_request(history=[]))
    assert r["baseline"] is None
    assert "baseline_unavailable_no_history" in r["notes"]
    assert r["status"] == "results_available"


def test_zone_unsure_degrades_without_guessing():
    r = recommend(base_request(parcel={"zone": "unsure", "irrigation": "flood"}))
    assert r["status"] == "results_available"
    assert "zone_recorded_no_zone_scoring_v0_2" in r["notes"]


def test_validation_catches_all_field_classes():
    req = {
        "parcel": {"zone": "galaxy", "irrigation": "bucket", "area_ha": -1,
                   "location": {"lat": 999, "lon": -6.4}},
        "history": [{"crop_id": "", "season": "abc"}, {"crop_id": "wheat", "season": "2024-2025"}],
        "planned_season": "24-25",
        "farmer_priorities": {"money": 5},
        "baseline": {"role": "invented"},
    }
    errors = validate(req)
    paths = {e["path"] for e in errors}
    assert "parcel.zone" in paths and "parcel.irrigation" in paths
    assert "parcel.area_ha" in paths and "parcel.location" in paths
    assert "history[0].crop_id" in paths and "history[0].season" in paths
    assert "planned_season" in paths and "farmer_priorities.money" in paths
    assert "baseline.role" in paths


def test_no_suitable_options_when_every_candidate_is_blocked():
    original = eng._score
    try:
        eng._score = lambda crop_id, history_ids, ctx: {
            "crop_id": crop_id, "name_en": "", "name_ar": "", "score": 0,
            "rule_evidence": [], "water_evidence": None, "notes": [], "blocked": True}
        r = recommend(base_request())
        assert r["status"] == "no_suitable_options"
        assert r["reason"] == "every_rotation_candidate_blocked"
        assert len(r["blocked"]) >= 1
    finally:
        eng._score = original


def test_floor_excludes_weak_scores():
    assert FLOOR == 35
    original = eng._score
    try:
        def weak(crop_id, history_ids, ctx):
            s = original(crop_id, history_ids, ctx)
            if crop_id == "maize":
                s["score"] = 30
                s["blocked"] = False
            return s
        eng._score = weak
        r = recommend(base_request())
        assert by_id(r, "maize") is None
        assert any(b["crop_id"] == "maize" for b in r.get("excluded", []))
    finally:
        eng._score = original
