"""Rule-based rotation scoring engine — flaht bladi D1 handoff (v0.2).

Deterministic, explainable, source-cited. Implements `contracts/model-input.md` and
`contracts/model-output.md` v0.2. Every rule delta resolves to `rules_table.json`
(rule_id, expression, magnitude, source citation, review status). Scores are ranking
scores, never probabilities. No network access, no randomness, no NASA fetching.

Public API:
    recommend(request: dict) -> dict          # discriminated union per contract
    validate(request: dict) -> list[dict]     # field-coded errors, [] when valid
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ENGINE_VERSION = "rule-engine 0.2.0"
FLOOR = 35          # candidates below this are excluded (contract §2)
MAX_ALTERNATIVES = 3
CAMPAIGN_START_MONTH = 11   # a "2025-2026" campaign starts in November
WINTER_MONTHS = {10, 11, 12, 1, 2}
SEASON_RE = re.compile(r"^\d{4}-\d{4}$")

_PKG = Path(__file__).resolve().parent
_DATA = _PKG.parents[1] / "src" / "data"

RULES_TABLE = json.loads((_PKG / "rules_table.json").read_text(encoding="utf-8"))
AGRONOMY = json.loads((_PKG / "crops_agronomy.json").read_text(encoding="utf-8"))
VOCAB = json.loads((_DATA / "crops.v1.json").read_text(encoding="utf-8"))

RULES = {r["rule_id"]: r for r in RULES_TABLE["rules"]}
CROPS = {c["crop_id"]: c for c in VOCAB["crops"]}
AGRO = AGRONOMY["crops"]
PRIORITY_KEYS = ["water_saving", "soil_health", "market", "input_cost", "yield_stability"]
DATA_VERSIONS = {
    "crops_vocabulary": "crops.v1",
    "agronomy_table": AGRONOMY["table_version"],
    "nasa_power": "daily point 1981-2026 (Tadla centroid, local dataset)",
    "imerg_monthly": "304 months 2000-06..2025-09 (local dataset)",
}


class RequestError(Exception):
    """Field-coded validation failure -> request_error (HTTP 422)."""

    def __init__(self, fields: list[dict]) -> None:
        self.fields = fields
        super().__init__("VALIDATION_ERROR")


def _field(path: str, code: str) -> dict:
    return {"path": path, "code": code}


def _season_ok(value: str, path: str, errors: list[dict]) -> None:
    if not SEASON_RE.match(value) or int(value[:4]) + 1 != int(value[5:]):
        errors.append(_field(path, "INVALID_SEASON"))


def validate(request: dict) -> list[dict]:
    errors: list[dict] = []
    if not isinstance(request, dict):
        return [_field("$", "INVALID_OBJECT")]
    parcel = request.get("parcel") or {}
    zone = parcel.get("zone")
    if zone not in ("beni_amir", "beni_moussa", "other", "unsure"):
        errors.append(_field("parcel.zone", "INVALID_ENUM"))
    irrigation = parcel.get("irrigation")
    if irrigation not in ("flood", "basin", "drip", "pivot", "sprinkler", "unknown"):
        errors.append(_field("parcel.irrigation", "INVALID_ENUM"))
    area = parcel.get("area_ha")
    if area is not None and (not isinstance(area, (int, float)) or isinstance(area, bool)
                             or area <= 0 or area > 1000):
        errors.append(_field("parcel.area_ha", "INVALID_AREA"))
    loc = parcel.get("location")
    if loc is not None:
        lat, lon = loc.get("lat"), loc.get("lon")
        if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)) \
                or not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            errors.append(_field("parcel.location", "INVALID_COORDS"))
    history = request.get("history") or []
    if not isinstance(history, list) or len(history) > 3:
        errors.append(_field("history", "INVALID_HISTORY"))
        history = []
    for i, entry in enumerate(history):
        crop = (entry.get("crop_id") or "").strip().lower()
        if not crop:
            errors.append(_field(f"history[{i}].crop_id", "UNRECOGNIZED_CROP"))
        elif crop not in CROPS and not any(
                crop == c["name_en"].lower() or crop == c["name_ar"] for c in VOCAB["crops"]):
            errors.append(_field(f"history[{i}].crop_id", "UNRECOGNIZED_CROP"))
        season = entry.get("season")
        if season is not None:
            if not isinstance(season, str) or not season.strip():
                errors.append(_field(f"history[{i}].season", "INVALID_SEASON"))
            else:
                _season_ok(season.strip(), f"history[{i}].season", errors)
    planned = request.get("planned_season")
    if planned is not None:
        if not isinstance(planned, str) or not planned.strip():
            errors.append(_field("planned_season", "INVALID_SEASON"))
        else:
            _season_ok(planned.strip(), "planned_season", errors)
    priorities = request.get("farmer_priorities")
    if priorities is not None:
        if not isinstance(priorities, dict):
            errors.append(_field("farmer_priorities", "INVALID_PRIORITIES"))
        else:
            for k, v in priorities.items():
                if k not in PRIORITY_KEYS or not isinstance(v, int) or isinstance(v, bool) \
                        or not 0 <= v <= 3:
                    errors.append(_field(f"farmer_priorities.{k}", "INVALID_PRIORITY_VALUE"))
    baseline = request.get("baseline")
    if baseline is not None and baseline.get("role") != "existing_strategy":
        errors.append(_field("baseline.role", "INVALID_BASELINE_ROLE"))
    return errors


def _resolve_crop(text: str) -> str | None:
    """Exact resolution only: crop_id, EN name or Arabic name (case-insensitive). No fuzz."""
    t = text.strip().lower()
    if t in CROPS:
        return t
    for c in VOCAB["crops"]:
        if t == c["name_en"].lower() or t == c["name_ar"]:
            return c["crop_id"]
    return None


def _weights(request: dict) -> tuple[dict, list[str]]:
    priorities = request.get("farmer_priorities")
    notes: list[str] = []
    weights = {g: 1.0 for g in ("soil_health", "water_saving", "yield_stability")}
    if priorities is None:
        notes.append("priorities_not_provided_neutral_weights")
        return weights, notes
    for key, value in priorities.items():
        if key in weights:
            weights[key] = 0.5 + 0.5 * value
        elif value != 1:
            notes.append(f"priority_{key}_no_rule_bound_v0_2")
    return weights, notes


def _score(crop_id: str, history_ids: list[str], ctx: dict) -> dict:
    """Score one candidate. ctx: weights, irrigation, planned_season. Deterministic."""
    crop, agro = CROPS[crop_id], AGRO[crop_id]
    evidence: list[dict] = []
    notes: list[str] = []
    deltas = 0

    def apply(rule_id: str, delta: float) -> None:
        rule = RULES[rule_id]
        scaled = round(delta * ctx["weights"][rule["group"]])
        nonlocal deltas
        deltas += scaled
        evidence.append({
            "rule_id": rule_id, "delta": scaled,
            "explanation": rule["explanation_en"],
            "explanation_ary_pending_review": rule["explanation_ary_pending_review"],
        })

    prev1 = AGRO[history_ids[0]] if history_ids else None
    prev2 = AGRO[history_ids[1]] if len(history_ids) > 1 else None

    # --- soil_health rules ---
    if agro["family"] == "poaceae" and prev1 is not None and prev1["legume"]:
        apply("R-LEG-01", RULES["R-LEG-01"]["delta"])
    if agro["family"] == "poaceae" and prev1 is not None and prev1["family"] == "poaceae":
        apply("R-BRK-01", RULES["R-BRK-01"]["delta"])
    if agro["family"] == "poaceae" and prev1 is not None and prev2 is not None \
            and prev1["family"] == "poaceae" and prev2["family"] == "poaceae":
        apply("R-NEM-01", RULES["R-NEM-01"]["delta"])
    if prev1 is not None and agro["family"] == prev1["family"] and agro["family"] != "poaceae":
        apply("R-FAM-01", RULES["R-FAM-01"]["delta"])
    beet_hit = (crop_id == "sugar_beet" and (
        (prev1 is not None and prev1["family"] == "amaranthaceae")
        or (prev2 is not None and prev2["family"] == "amaranthaceae")))
    if beet_hit:
        apply("R-BEET-01", RULES["R-BEET-01"]["delta"])
    if crop_id == "onion" and prev1 is not None and prev1["family"] == "amaryllidaceae":
        apply("R-ONI-01", RULES["R-ONI-01"]["delta"])

    # --- R-WAT-01: water need vs irrigation system (only when irrigation is known) ---
    water_evidence = None
    wc = agro.get("water_class")
    if ctx["irrigation"] == "unknown":
        notes.append("water_evidence_unavailable_irrigation_unknown")
    elif wc is None:
        # Non-candidate crop (e.g. a tree or rare crop in history): no estimate exists.
        notes.append("water_evidence_not_available_for_this_crop")
    else:
        if ctx["irrigation"] in ("flood", "basin"):
            if wc == "very_high":
                apply("R-WAT-01", RULES["R-WAT-01"]["delta"])
                notes.append("water_high_need_surface_irrigation_caution")
            elif wc == "high":
                apply("R-WAT-01", -4)
        water_evidence = {
            "crop_water_need_mm_estimate": agro["water_need_mm_estimate"],
            "estimate_source": "FAO Irrigation & Drainage Paper 56 (Allen et al., 1998)",
            "estimate_label": "estimate - not a measured or guaranteed value",
        }
        if ctx["irrigation"] in ("drip", "pivot", "sprinkler"):
            notes.append("water_pressurized_system_efficiency_note")

    # --- R-FRT-01: planting window / frost guidance (only when season provided) ---
    if ctx["planned_season"] is None:
        notes.append("planting_window_not_evaluated_season_absent")
    elif "planting_months" not in agro:
        notes.append("planting_window_not_defined_for_crop")
    else:
        winter_fit = bool(set(agro["planting_months"]) & WINTER_MONTHS)
        sens = agro["frost_sensitivity"]
        if sens == "high" and winter_fit:
            apply("R-FRT-01", RULES["R-FRT-01"]["delta"])
            notes.append("frost_sensitive_winter_planting_caution")
        elif not winter_fit:
            notes.append("planting_window_spring_note_plant_after_last_frost")
        else:
            notes.append("planting_window_compatible_campaign_start")

    total = max(0, min(100, 100 + deltas))
    blocked = bool(beet_hit)  # blocking rule -> excluded from alternatives, score 0
    if blocked:
        total = 0

    return {
        "crop_id": crop_id,
        "name_en": crop["name_en"],
        "name_ar": crop["name_ar"],
        "score": int(total),
        "rule_evidence": evidence,
        "water_evidence": water_evidence,
        "notes": notes,
        "blocked": blocked,
    }


def recommend(request: dict) -> dict:
    errors = validate(request)
    if errors:
        return {
            "status": "request_error",
            "contract_version": "0.2",
            "error": {"code": "VALIDATION_ERROR", "fields": errors},
        }

    parcel = request.get("parcel") or {}
    history = request.get("history") or []
    history_ids: list[str] = []
    for entry in history:
        resolved = _resolve_crop(entry["crop_id"])
        if resolved is None:  # defensive; validate() already caught it
            resolved = entry["crop_id"].strip().lower()
        history_ids.append(resolved)

    weights, notes = _weights(request)
    warnings: list[str] = []
    if request.get("planned_season") is None:
        warnings.append("season_absent_results_generic")
    if parcel.get("zone") in ("unsure", "other"):
        notes.append("zone_recorded_no_zone_scoring_v0_2")

    ctx = {
        "weights": weights,
        "irrigation": parcel.get("irrigation", "unknown"),
        "planned_season": request.get("planned_season"),
    }

    # Baseline = repeat the most recent crop with the same rules (C07 proposal).
    baseline = None
    if history_ids:
        b = _score(history_ids[0], history_ids, ctx)
        baseline = {k: b[k] for k in ("crop_id", "name_en", "name_ar", "score", "rule_evidence",
                                      "water_evidence", "notes")}
        baseline["rank"] = None
        baseline["notes"] = baseline["notes"] + [
            "baseline = repeating last season's crop, scored with the same rules"]
    else:
        notes.append("baseline_unavailable_no_history")

    # Alternatives = rotation candidates minus the baseline crop; trees and non-candidates
    # (perennials, rare crops) are never proposed.
    alternatives, blocked_list = [], []
    for crop_id, agro in AGRO.items():
        if not agro.get("rotation_candidate"):
            continue
        if crop_id == (history_ids[0] if history_ids else None):
            continue
        s = _score(crop_id, history_ids, ctx)
        if s.pop("blocked") or s["score"] < FLOOR:
            reason = s["rule_evidence"][0] if s["rule_evidence"] else None
            blocked_list.append({
                "crop_id": crop_id,
                "reason_code": (reason["rule_id"] + "_blocking") if reason else "score_below_floor",
                "explanation": reason["explanation"] if reason else "score below the honest floor",
            })
        else:
            alternatives.append(s)

    # Ties broken by observed local prevalence (Tadla 2024 ground truth, observational),
    # then by crop_id — deterministic and documented in contracts/model-output.md §2.
    def prevalence(crop_id: str) -> int:
        row = next(c for c in VOCAB["crops"] if c["crop_id"] == crop_id)
        return row["observed_count"] or 0

    alternatives.sort(key=lambda s: (-s["score"], -prevalence(s["crop_id"]), s["crop_id"]))
    for rank, s in enumerate(alternatives[:MAX_ALTERNATIVES], start=1):
        s["rank"] = rank

    if baseline is not None and baseline["score"] == 0:
        warnings.append("baseline_repetition_blocked_by_rule")

    if alternatives:
        result = {
            "status": "results_available",
            "contract_version": "0.2",
            "engine_version": ENGINE_VERSION,
            "data_versions": DATA_VERSIONS,
            "baseline": baseline,
            "alternatives": alternatives[:MAX_ALTERNATIVES],
        }
        if warnings:
            result["warnings"] = warnings
        if notes:
            result["notes"] = notes
        if blocked_list:
            result["excluded"] = blocked_list
        return result

    return {
        "status": "no_suitable_options",
        "contract_version": "0.2",
        "engine_version": ENGINE_VERSION,
        "data_versions": DATA_VERSIONS,
        "reason": "every_rotation_candidate_blocked",
        "blocked": blocked_list,
        "notes": notes,
    }
