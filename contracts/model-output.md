# contracts/model-output.md — DS output contract v0.2 (D1 handoff)

**Status:** PROPOSED v0.2 — awaits G0 approval (C09, C10, C14). Companion of `model-input.md`
v0.2. Response is a **discriminated union** on `status`; the BFF renders by status, never by
guessing. No fabricated precision: every number is a documented estimate or a ranking score.

## 1. Discriminated union — five statuses

```jsonc
// 200 — results_available
{
  "status": "results_available",
  "contract_version": "0.2",
  "engine_version": "rule-engine 0.2.0",
  "data_versions": { "crops_vocabulary": "crops.v1", "agronomy_table": "crops_agronomy 0.2.0",
                     "nasa_power": "daily point 1981-2026", "imerg_monthly": "304 months 2000-06..2025-09" },
  "baseline": {                       // null + note when history is empty (C07)
    "crop_id": "wheat", "score": 71, "rank": null,
    "rule_evidence": [ { "rule_id": "R-BRK-01", "delta": -10,
                         "explanation": "cereal after cereal: disease carry-over risk (break-crop effect)",
                         "explanation_ary_pending_review": "القمح بعد القمح: خطر أمراض ملوية (كسر الدورة) مفخن" } ],
    "notes": ["baseline = repeating last season's crop, scored with the same rules"]
  },
  "alternatives": [                   // max 3, ranked desc; UI displays max 2 (B0 §2)
    { "crop_id": "alfalfa", "name_en": "Alfalfa", "name_ar": "البرسيم الحجازي",
      "score": 88, "rank": 1,
      "rule_evidence": [ ... ],       // rule_id, delta, explanation_en (+ary pending review)
      "water_evidence": {             // null when irrigation unknown / water rule skipped
        "crop_water_need_mm_estimate": [450, 650], "estimate_source": "FAO Irrigation & Drainage Paper 56",
        "estimate_label": "estimate — not a measured or guaranteed value" }
    }
  ],
  "warnings": ["priorities_not_provided_neutral_weights", "season_absent_results_generic"]
  // notes: zone/irrigation degradation notes as needed
}
```

```jsonc
// 200 — no_suitable_options : every candidate carries a blocking rule (score < 35 floor)
{ "status": "no_suitable_options",
  "contract_version": "0.2", "engine_version": "rule-engine 0.2.0",
  "reason": "every_rotation_candidate_blocked",
  "blocked": [ { "crop_id": "sugar_beet", "reason_code": "R-BEET-01_blocking",
                 "explanation": "sugar beet after beet-family crop: beet cyst nematode — 3–5 year break required" } ],
  "notes": ["..."] }

// 200 — demo_preview : ONLY when explicitly requested AND approved; prominent demo label
{ "status": "demo_preview", "demo": true,
  "demo_notice": "DEMO FIXTURE — not a real agronomic result", "payload": { ...fixture... } }

// 200|503 — model_unavailable : engine/artifact unusable; never a fabricated result
{ "status": "model_unavailable", "reason": "engine_not_ready | artifact_hash_mismatch" }

// 422 — request_error
{ "status": "request_error",
  "error": { "code": "VALIDATION_ERROR",
    "fields": [ { "path": "history[0].crop_id", "code": "UNRECOGNIZED_CROP" } ] } }
```

## 2. Score semantics (C09)

- `score` = deterministic rule score, **ranking score only — never a probability**; 0–100
  starting from a 100 base minus/plus documented rule deltas, clipped to [0, 100].
- Baseline is scored with the same rules as alternatives — comparable, no rescoring in the BFF.
  A baseline blocked by a rule (score 0, e.g. beet after beet) raises warning
  `baseline_repetition_blocked_by_rule`; `results_available` still returns the ranked alternatives.
- `rank` starts at 1 (best alternative); baseline carries no rank.
- Ties broken deterministically by (score desc, **observed local prevalence desc** — Tadla 2024
  ground-truth counts, observational, `null` → 0, then crop_id asc).
- Floor 35: any candidate whose score < 35 is excluded and, if **all** candidates are excluded,
  status becomes `no_suitable_options` with per-crop blocking reasons. A partially blocked
  candidate set may surface an optional `excluded[]` list in `results_available`.

## 3. Evidence rules

- Every delta carries its `rule_id` (resolvable to `science/engine/rules_table.json`: expression,
  magnitude, source citation, review status) and an EN explanation (+ Ary string marked
  **pending linguistic review**).
- Water evidence is always labeled **estimate** (`FAO Irrigation & Drainage Paper 56` ranges);
  never a measured value, never a savings guarantee. Skipped (null) when irrigation is
  `unknown` — with a note, not a guessed number.
- `warnings`/`notes` cover: absent season → generic results; zone `unsure`/`other` →
  zone rules skipped; irrigation `unknown` → water evidence skipped; priorities absent →
  neutral weights; history empty → baseline null.

## 4. Versions and traceability (C14)

`engine_version`, `data_versions` (vocabulary/agronomy/POWER/IMERG), and every artifact hash
are part of the response only through `engine_version`+`data_versions` (hashes live in
`services/model_api/artifacts/manifest.json`, checked at `/ready`).
