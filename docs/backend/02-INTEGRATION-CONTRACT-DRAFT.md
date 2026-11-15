# B0 — Frontend–Backend–Data Science Integration Contract (approval draft)

**Document status:** **DRAFT / NOT APPROVED** · **Current DS source:** `TEAM_BRIEFING_DATA_CONTRACT.md`, **v0.1 PROPOSED** (14 Nov 2026). **Canonical future source:** approved, versioned OpenAPI + JSON Schema/fixtures generated from the serving implementation. Do not use this document or v0.1 as permission to implement recommendation payloads. **Reviewers:** named backend/API owner, Data Science owner, frontend delegate, agronomy reviewer, data/privacy owner (roles; people TBD).

## 1. What is agreed, and what is not

**Product requirements (v1.2):** English (`en`) and Moroccan Darija (`ary`), RTL/LTR, transparent demo, private parcel data, farmer baseline plus **up to two** justified alternative strategies, traceable reasoning and limitations, source-checked maps and no fabricated scores/water savings. **Historical frontend guide behavior (unverified in live repo):** M2 local form, M4 session-only community, M1 phone-format demo, M3 source-checked points.

**Open:** system provider/configuration, identity, DB schema, REST paths, mandatory model inputs, crop mappings and names, baseline semantics, missing/unknown, `farmer_priorities` defaults, valid seasons, validated scientific rules, science output contract, transport error codes, privacy retention and demo policy. Approval is explicit; absence of an objection is *not* approval.

## 2. Reconciliation matrix: M2 UI fields vs v0.1 model proposal

The `ParcelDraft` fields below were extracted from the supplied historical M2 code. Their presence in the **actual** `main` must be checked before implementing the adapter.

| M2 UI field/value | v0.1 target | Candidate transform (NOT approved) | Main conflict / test / approval |
|---|---|---|---|
| `parcelName: string`, optional, max 60 | **No DS field** | persist private `name`; **omit from science** | User-visible naming is not cadastral identity; test never sent to DS |
| `zone: amir|moussa|other|unsure` | `parcel.zone: beni_amir|beni_moussa|other|unsure` | `amir→beni_amir`, `moussa→beni_moussa`, others unchanged | Explicit mapping approval; no coordinate inferred; test each value |
| `areaHa: decimal string` | `parcel.area_ha?: number` | if blank omit; else `Number(trim.replace(',', '.'))` | Positive only, numeric precision, safe bounds, units ha; test `1,5`, blank, `0`, invalid |
| `irrigation: drip-ui|surface-ui|other-ui|unsure` | `parcel.irrigation: flood|basin|drip|pivot|sprinkler|unknown` | `drip-ui→drip` *candidate*, `unsure→unknown` *candidate* | **BLOCKER:** surface ≠ uniquely flood/basin, `other-ui` has no faithful enum, no silent mapping; approve broad enum or new UI step; test mapping refusal |
| `locationChoice: none|manual` | `parcel.location?: {lat,lon}` | `none→omit`; `manual→validate both and serialize after disclosure/consent` | No background GPS; require privacy agreement; test no hidden stale coordinates when `none` |
| `latitude`, `longitude` strings | decimal degrees | decimal comma parsing, range check | No local-Tadla geofence assumption, no parcel-scale satellite claim; test partial/invalid/out-of-range and consent |
| `recentCrop: free text` | `history[].crop_id` | **NONE until approved vocab and explicit review** | Free text is NOT canonical crop ID; ambiguous local naming → block request or ask farmer; test unknown and spelling |
| `recentCropSeason: free text` | `history[].season` | only after approved season grammar | No silent `YYYY-YYYY`; test unsupported format |
| `earlierCrop`, `earlierCropSeason` | earlier `history[]` | preserve chronological order after review | Empty crop with nonempty season rejected in UI; test order, gaps, duplicates |
| `seasonChoice: known|unsure` | `planned_season` **required in sample** | `known→approved canonical season` only | **BLOCKER:** `unsure` has no representation in v0.1; decide nullable/omittable vs cannot recommend |
| `plannedSeason: free text` | `planned_season: "2025-2026"` example | parse only if approved grammar | Text alone not validated; test invalid range/unknown/no invented year |
| **not collected:** `soil_constraints` | optional array | absent, never silently choose `[]` if difference matters | DS must define absent vs known none vs unknown |
| **not collected:** `farmer_priorities` | 0–3 per 5 factors | **none** | **BLOCKER:** agree optionality/defaults and add farmer controls if truly mandatory; no automatic arbitrary weights |
| **not collected:** existing proposed next crop or full baseline plan | `baseline.role=existing_strategy` | cannot derive from last grown crop | **BLOCKER:** define baseline from farmer-provided choice/sequence; never claim scored farmer strategy from one previous crop |

**Other scientific conflicts:** v0.1 offers **up to 3 alternatives**, UI product requirement displays **up to 2**; agree truncation/ranking responsibility and explanatory notice. v0.1 says “at least three strategies including existing” but under `no_suitable_options` fewer than three may be scientifically defensible—do not fabricate options to satisfy a display target. v0.1's numeric demo scores and water examples are *illustrative, unverified*, not production data. Proposed crop vocabulary includes perennial trees in a crop rotation catalog and conflates **alfalfa/berseem**; require agronomist review, annual/perennial compatibility and Darija labels. **No crop ID is approved by these files.**

## 3. Proposed deployment/API surface — freeze at approval

**Two separate API ownership zones**, not independent competing specifications:

| Consumer → owner | Proposed route/method | Auth & scope | Approval |
|---|---|---|---|
| browser → Next.js BFF | `GET /api/health` | public, no secrets | B1 architecture decision |
| browser → BFF | `GET /api/v1/me` | authenticated; private display profile | B2 identity decision |
| browser → BFF | `GET /api/v1/parcels`, `POST /api/v1/parcels` | authenticated, self only | B0/B2 review |
| browser → BFF | `GET/PATCH/DELETE /api/v1/parcels/{id}` | authenticated and owner | B0/B2 review |
| browser → BFF | `GET/POST /api/v1/community/posts` | browsing/publication policy TBD; posting auth | moderation/privacy approval |
| browser → BFF | `DELETE /api/v1/community/posts/{id}` | owner and authorized moderators | moderation approval |
| browser → BFF | `POST /api/v1/community/posts/{id}/reports` | reporter auth/abuse control TBD | moderation approval |
| browser → BFF | `POST /api/v1/recommendations` | policy: auth or limited approved demo? TBD | DS + security signoff |
| BFF → **private** FastAPI | dedicated internal inference path **TBD** | server-to-server secret or workload identity; deny public | architecture + contract signoff |
| BFF or operations → FastAPI | `/health` and `/ready` **proposal** | no sensitive artifacts exposed publicly | DS service signoff |

The DS v0.1 suggests `POST /api/v1/recommendations` *on the model service*. If the BFF exposes the same public name, route ownership/hosting still differs: select an **internal route name** without breaking the external contract. Do not accidentally ship two uncoordinated public `/api/v1/recommendations` implementations. Prefer **same-origin** browser requests; if a separate API is later selected, update CORS, CSRF/origin, cookies, generated clients and deployment plan in the **same** revision.

## 4. Canonical definitions to fill BEFORE production code

**API version:** choose `v1` in routes only *after approval*; define backward compatibility, additive change policy, deprecation and semantic contract version (`contract_version`) independent of model/data versions.

**Object semantics:** `required` = key must exist, `optional` = may be omitted, `nullable` = key exists with `null`, **unknown** = explicit farmer choice, `""` = empty input and not a substitute for any of the above. Decide per field in OpenAPI; do **not** collapse `undefined`, empty string, `null` and `"unknown"` into one implicit default. `area_ha` finite positive decimal; latitude -90..90, longitude -180..180; coordinate **accuracy**, origin and consent are separate fields/procedures to approve. `created_at` timestamps UTC ISO-8601; client must not supply ownership identity; server determines it. Free-form farmer text must be bounded and escaped in presentation.

**Crops/seasons:** reviewed stable `crop_id`, label EN and human-reviewed `ary`, category, annual/perennial, observed/local-evidence flags, scientific support status, aliases and unknown policy; `planned_season` canonical format, hemisphere/region applicability, support windows, and date-free unavailability when absent. Do not treat last crop as the farmer's existing proposed rotation. Rules and published sources must be cited by ID and version.

**DS inputs/outputs:** approve method/rules, history order, baseline input, candidate generation, score scale and interpretation (ranking score **never automatically a probability**), rank stability/ties, whether options are multi-season plans or single crops, 0/1/2 results, model/data versions, feature provenance/resolution, missing fields, warnings and agronomic limitations; require a *non-fabricated explanation for each option*. No guaranteed yield/profit/water saving. Require *source lineage* (dataset, variable, period, region, resolution, method, date, verification level) if environmental evidence is returned.

## 5. Proposed status and transport behavior (NOT yet approved)

| HTTP | Application state | Display/handling intention |
|---|---|---|
| `200` | `results_available` | validated science result; baseline and **0–2 displayed alternatives only after contract decision**; provenance and warnings |
| `200` | `no_suitable_options` | valid request, explain why none; never manufacture alternatives |
| `200` | `demo_preview` | **explicit opted-in fixture**, prominent demo label; not a real answer; disable save as real result |
| `200` or `503` TBD | `model_unavailable` | no scientific output; retry/status; model service downtime not confused with no suitable crops |
| `400`/`422` | `request_error` | field-coded validation errors; keep farmer inputs and focus invalid control |
| `401` | auth required | no authenticated session, do not call DS |
| `403` | forbidden | authenticated but no access; never reveal another user's data |
| `404` | not found | parcel/post inaccessible or absent; leak-resistant |
| `409` | conflict | optimistic concurrency/duplicate request if supported |
| `429` | rate limited | polite retry, obey Retry-After if sent |
| `502` | upstream returned malformed/incompatible response | log safe correlation ID, no guessed result |
| `503` | service unavailable | preserve unavailable UI, no fixture substitution |
| `504` | upstream timeout | user-retryable, no duplicate writes |

**v0.1 statuses:** `results_available`, `no_suitable_options`, `model_unavailable`, `demo_preview`, `request_error` (all *proposals*). Final response **must use a discriminated union** with required properties for each status; frontend branches by application status where HTTP is successful and also handles transport/HTTP errors separately.

**Proposed common error envelope** (example schema shape; **not a production fixture**):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Review the highlighted fields.",
    "fields": [{ "path": "parcel.area_ha", "code": "POSITIVE_NUMBER_REQUIRED" }],
    "request_id": "EXAMPLE-ONLY"
  }
}
```

For production, approve localized message keys or codes rather than trusting English server prose for Darija. Do not put raw coordinates, phone numbers, user text, model-internal private information or unredacted tokens in error messages/logs. Define request ID generation, backoff, retry safety, max request size and timeout budget in one place.

## 6. Proposed positive and negative contract tests — after approval

- **Valid minimal parcel request:** authenticated user with approved zone/irrigation/season/crop semantics, optional area absent, no coordinates; returns record owned by caller; test no default values added.
- **Valid explicit unknown:** if schema permits `unsure`/`unknown`, accept with documented reduced science capability; otherwise a *clear* unavailable/not-enough-context state, never guessing.
- **Invalid parcel:** `area_ha = 0`, strings in numeric positions, incomplete manual coordinate pair, out-of-range lat/lon, empty non-nullable name, unknown enum; assert canonical 422 field errors.
- **Auth/ownership:** unauthenticated 401; user B cannot read/update/delete A's parcel (404/403 as decided); DB RLS denies cross-owner even if route auth has bug.
- **Crop and history:** unrecognized free text and unapproved alias must **not** be silently converted to a canonical crop; invalid season/chronology rejected.
- **Recommendation:** test all approved statuses; source/evidence required for scientific results; zero-result and unavailable contain no fabricated alternatives; score not marked probability; client displays at most two *returned* options.
- **Transport:** malformed JSON response, timeout, abort, network error, retry, duplicate click, 429 and service unavailable preserve UI input, with safe status.
- **Privacy:** absent location transmits no coordinates, switching from `manual` to `none` removes stale values, anonymous community draft stays local; share preview never gains hidden personal data automatically.

The scientist must supply **real validated input/output fixtures** and **explicitly labelled demo-only fixtures**; do not reuse numerical sample values from the v0.1 brief as if they were evaluated results. Once approved, generate a positive JSON sample from a verified known-science test input and a negative sample from the schema validator; commit versioned fixtures in `contracts/fixtures/`.

## 7. One canonical schema; generation and drift gates

1. Approve architecture and choose a *canonical schema owner* for each public surface (Next.js BFF OpenAPI for CRUD/aggregated responses; FastAPI-generated OpenAPI for **private scientific service**); map both into a reviewed **public** `contracts/openapi.json` for the frontend. Do not edit the same schema independently in two languages.
2. Implement the schema **once** in approved server request/response validators, e.g., FastAPI/Pydantic for scientific API. Export its OpenAPI from the actual app; maintain public BFF OpenAPI through one selected schema generation/check method (choice TBD).
3. Pin `openapi-typescript` as a **dev dependency** only after seeing actual `package.json`; generate `src/lib/api/generated/types.ts` from committed `contracts/openapi.json`:

```powershell
# After contract approval and package install on feature branch:
# npm install --save-dev openapi-typescript
npx openapi-typescript contracts/openapi.json -o src/lib/api/generated/types.ts
if ($LASTEXITCODE -ne 0) { throw 'OpenAPI generation failed.' }
# Regenerate on CI; fail if git diff --exit-code -- src/lib/api/generated/types.ts is nonempty.
git diff --exit-code -- src/lib/api/generated/types.ts
```

4. Generated TypeScript types are **compile-time only**. Add runtime response validation (server or browser as needed) against generated JSON Schema or maintained parsers; an unexpected model payload yields **upstream invalid**, never a rendered guess.
5. Contract tests compare BFF behavior with approved public schema, model service with its own OpenAPI, all fixture validation, and adapters with union statuses. Any breaking change requires new version, migrated clients, updated fixtures, and simultaneous guide+source revisions.

## 8. Mandatory approval checkpoint — a meeting with explicit decisions

**Prerequisites:** live M5 audit; scientist's current code/data manifests; both frontend models; backend deployment constraints; available identity/SMS/DB/hosting credentials; reviewer named. Each line below needs **approve / amend / reject / deferred**, an owner, date and evidence.

| Decision ID | Concrete question | Blocking whom? |
|---|---|---|
| C01 | Next.js BFF + Supabase Auth/Postgres/RLS + separate private FastAPI, or alternate stack? Who owns it? | B1/B2/D2/B3/F1 |
| C02 | Auth provider and supported sign-in method available? OTP verified? Anonymous demo access policy? | B2/F1 |
| C03 | Parcel fields, DB retention/deletion, coordinate consent and RLS? | B1/B2 |
| C04 | Exact mapping of UI `zone`, irrigation `surface-ui` and `other-ui` and unknown semantics? | B2/DS/F1 |
| C05 | Canonical crop vocabulary/aliases and approved EN/ary labels; annual/perennial distinction? | D1/F1 |
| C06 | History chronology; canonical season format; what to do with unknown season? | DS/F1 |
| C07 | Baseline strategy: where user supplies it; does scoring it have scientific support? | D1/F1 |
| C08 | `farmer_priorities` present/optional/defaulted? Any newly needed UI? | D1/F1 |
| C09 | Engine methodology, scores, evidence/provenance, 0–2 displayed alternatives, warnings & limitations? | D1/D2/F1 |
| C10 | HTTP+application status unions, errors, versioning, timeouts, idempotency and privacy redaction? | B2/D2/B3/F1 |
| C11 | Community publication, moderation, reports, safe sharing, public feed visibility? | B2/F1 |
| C12 | Geographic policy, dataset resolution claims, approved crop calendar/tiles/assets? | D1/F1 |
| C13 | Production deployment/auth/observability/rollback and ownership of secrets? | B3/Q1 |
| C14 | Validated DS fixtures, independent science review, model/data versions, reproducibility? | D2/B3/F1 |

**Approval artifact:** `docs/integration/decisions.md` with date/signatures/refs + exact `contracts/openapi.json` hash and fixtures; use states `APPROVED`, `PROPOSED`, `BLOCKED` per operation. Publish no recommendations unless C04–C10/C14 are approved and tests pass. A single unsigned meeting note does not unlock production.

## 9. Documentation and handoff gate

- Changes to **actual architecture**: update `docs/system-design.md` once, concisely; do not rewrite old M0–M5 guides as if the past followed this new architecture.
- Scope changes: only update `docs/01-cahier-des-charges.md` on explicit product approval. `docs/frontend-guide.md` is about M0–M5; keep as historical unless a roadmap decision explicitly changes it. Update `docs/instructions.md` and `docs/documentation-strategy.md` only when their process/boundary rules change.
- Every changed file/script/test/schema must match its owning current integration guide in the **same feature commit**. Keep a 3–5-line completion log with actual results and SHA.

**B0 Definition of done:** all critical decision IDs have explicit approval/defer status; generated schema and validators are frozen where approved; M5 baseline inspected; blocked tasks listed honestly; downstream guides reconciled to actual `main` before execution.
