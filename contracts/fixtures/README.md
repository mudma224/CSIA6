# contracts/fixtures — validated contract fixtures (B0 §6)

| File | fixture_type | Provenance |
|---|---|---|
| `results_available.json` | `real_engine_output` | **Real** deterministic engine output on the documented fixed input (reproduce via `science/engine` or the service). The positive contract sample. |
| `request_error.json` | `real_engine_output` | **Real** validation outcome for unrecognized free text (`UNRECOGNIZED_CROP`), field-coded, no fuzzy matching. |
| `no_suitable_options.json` | `synthetic_contract_test` | Clearly synthetic union shape for BFF failure-path tests — the real engine cannot reach this status with v0.2 rules. Never displayed as a real result. |
| `model_unavailable.json` | `synthetic_contract_test` | Clearly synthetic 503 body shape for transport tests. |
| `demo_preview.json` | `demo_only` | Explicitly labeled demo material; surfaced only after the demo-policy decision, with a prominent demo label. |

Rule (B0 §6): a positive result fixture proves evidence + versions; negative fixtures prove
no score is returned. Never reuse v0.1 example scores (61/78) — these fixtures replace them.
