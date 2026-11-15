# contracts/model-input.md — DS input contract v0.2 (D1 handoff)

**Status:** PROPOSED v0.2 — awaits G0 approval (C04–C10, C14). Supersedes the v0.1 proposal in
`TEAM_BRIEFING_DATA_CONTRACT.md` for the recommendation input; the v0.1 statuses/vocabulary
discipline carries over. Author: data-science contributor. Maps the **real M2 form**
(`src/features/m2/parcelDraft.ts`) field by field; the v0.1 draft described a form that did not
exist yet, which is exactly what this revision fixes.

## 1. Request body — `POST /internal/v1/recommendations` (private science service)

```jsonc
{
  "contract_version": "0.2",
  "parcel": {
    "zone": "beni_amir | beni_moussa | other | unsure",
    "area_ha": 2.5,                    // optional; positive number, ≤ 1000
    "irrigation": "flood | basin | drip | pivot | sprinkler | unknown",
    "location": { "lat": 32.30, "lon": -6.35 }   // optional; present ONLY with consent
  },
  "history": [                          // most recent first, 0–2 entries (M2 form limit)
    { "crop_id": "wheat", "season": "2024-2025" },
    { "crop_id": "alfalfa", "season": "2023-2024" }
  ],
  "planned_season": "2025-2026",        // optional
  "farmer_priorities": {                // optional; each key 0–3, default neutral
    "water_saving": 2, "soil_health": 1, "market": 1,
    "input_cost": 0, "yield_stability": 1
  },
  "baseline": { "role": "existing_strategy" }   // only allowed value in v0.2
}
```

## 2. Field rules and M2 form mapping

| DS field | M2 form field | Rule |
|---|---|---|
| `parcel.zone` | `zone: amir\|moussa\|other\|unsure` | `amir→beni_amir`, `moussa→beni_moussa`, `unsure` kept, `other` kept. Zone-dependent rules are **skipped with a note** when `unsure`/`other` — never guessed. |
| `parcel.area_ha` | `areaHa` string | Optional. `""`→omitted; `"1,5"`→`1.5` (decimal comma accepted); must be finite, > 0, ≤ 1000 ha. No default. |
| `parcel.irrigation` | `irrigation: drip-ui\|surface-ui\|other-ui\|missing` | **C04 proposal:** DS enum is `flood|basin|drip|pivot|sprinkler|unknown`. `drip-ui→drip`. `surface-ui→unknown` (surface irrigation is not uniquely flood or basin — no silent mapping). `other-ui→unknown`. Missing→`unknown`. Water rules degrade gracefully with `unknown` (warning, no penalty). |
| `parcel.location` | `locationChoice=none\|manual` + `latitude/longitude` | Serialized **only** when `locationChoice="manual"` AND both parse in range; `none`→omitted (no stale coordinates ever). Optional: engine never requires coordinates. |
| `history[].crop_id` | `recentCrop` / `earlierCrop` (free text) | Free text is resolved against `src/data/crops.v1.json` (`crop_id`, plus exact `name_en`/`name_ar` match, case-insensitive). **No fuzzy matching.** Unrecognized text → field-coded `request_error` (`UNRECOGNIZED_CROP`), no silent canonicalization. |
| `history[].season` | `recentCropSeason` / `earlierCropSeason` | Optional per entry; if present must match `^\d{4}-\d{4}$` campaign grammar (`2024-2025`), consecutive years. Absent season tolerated (rules that need season order degrade with a note). |
| `planned_season` | `seasonChoice: known\|unsure` + `plannedSeason` | **C06 proposal:** optional. `unsure`→omitted. Present → `^\d{4}-\d{4}$` grammar. Absent → results are season-generic; season-dependent rules (frost window) are skipped with a per-option note. |
| `farmer_priorities` | not collected by M2 (yet) | **C08 proposal:** optional; absent → neutral weights (all factors 1.0), with an explicit response note `priorities_not_provided_neutral_weights`. Each factor 0–3 → weight 0.5+0.5×v (0→0.5, 1→1.0, 2→1.5, 3→2.0) applied only to its rule group. Documented, deterministic, no hidden default weights. |
| `baseline.role` | not collected (M2 limit) | **C07 proposal:** only `existing_strategy`. Engine computes the baseline as **"repeat history[0].crop_id next season"**, scored with the same rules. `history` empty → `baseline: null` + note `baseline_unavailable_no_history` (results still returned). Not fabricable from nothing; never silently inferred beyond one step. |

`parcelName` is **never serialized** (private display name — B0 §2). `history` limited to the 2
entries the M2 form can carry (`recentCrop`, `earlierCrop`); the contract accepts up to 3 for
future form growth but the M2 adapter sends ≤ 2.

## 3. Validation errors (`request_error`, HTTP 422)

Field-coded, EN message key + Darija pending review. All validation happens **before** any
scoring: unknown crop text (`UNRECOGNIZED_CROP` for `history[0].crop_id` path), invalid season
grammar (`INVALID_SEASON`), area ≤ 0 (`INVALID_AREA`), lat/lon out of range (`INVALID_COORDS`),
too long fields (`TOO_LONG_*`), unknown enum (`INVALID_ENUM`). No guessing, no auto-correction.
