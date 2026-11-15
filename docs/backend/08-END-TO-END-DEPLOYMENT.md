# Q1 — Full integration acceptance, deployment & recovery guide

**Owner:** release/integration owner **to appoint** · **Branch:** `feature/q1-release-hardening` · **Prerequisites:** actual M5 `main` confirmed, B0/G0 contract approval, tested B1+B2, GD1+GD2, B3/G3, F1/G4 as applicable. **Status:** plan only, no deployment or integration tests claimed. If auth/science is not approved, release only the honest frontend demo and hide/disable dependent operations.

## 0. Product acceptance: real service vs honest prototype

**Real release** may offer authenticated private parcel CRUD, approved community workflow and scientific recommendations *only after* the named gates. **Frontend-only demo** already described by historical guides remains a legitimate alternative for unavailable features, but must be clearly labeled. Never turn a mock fixture into a live result during an outage. Never label health or demo mode “authenticated.” Preserve design tokens, all listed routes, M2/Map/Community local UX, `en/ary` and reviewed-only audio.

## 1. Expected deployable topology (PROPOSED)

| Environment/service | Suggested role | Cannot claim until verified |
|---|---|---|
| Next.js Next App Router host (e.g. Vercel) | secure HTTPS app+BFF | real hosting, cost, preview/prod domain, chosen region |
| Supabase PostgreSQL/Auth | managed private data & sessions under RLS | account, provider/SMS availability, backups, privacy policy |
| Private FastAPI model service (e.g. Cloud Run) | scientific inference, pre-computed immutable artifact | artifact rights, service auth, model readiness, hosting region/cost |
| Approved artifact store | encrypted/restricted offline feature+model versions | license, checksums, authorized access, expiry |
| Public OSM tiles (M3) | basemap only | uptime not guaranteed; attribution/usage terms apply |

**No need for** Kubernetes, microservices for CRUD, Redis/RabbitMQ or Supabase Storage without justified requirement. A single private Python service is already enough if validated scientific method requires Python. Separate frontend and DS deployment failure domains; model failure must not take down welcome/demo/map or local form.

## 2. Environment and secrets plan

Use a different Supabase project/credentials and approved dataset/artifact access for local, staging and production. Review actual Next and cloud hosting behavior before setting variables. No real secret appears in repo, screenshots, logs, source maps or client JS.

| Candidate variable | Runtime | Purpose / security |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser and server | public project endpoint; actual value only after account setup |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser and server | public scoped key; **never** a service-role key |
| `MODEL_API_BASE_URL` | Next.js server only | fixed HTTPS private model endpoint, never user-controlled |
| `MODEL_API_TIMEOUT_MS` | Next.js server only | approved max time budget; measured and tested |
| `MODEL_SERVICE_AUTH_*` | Next.js server only | provider-specific workload identity/secret; no `NEXT_PUBLIC_*` prefix |
| `MODEL_ARTIFACT_MANIFEST` | Python service only | approved loaded artifact manifest/hash reference |
| `DATABASE_URL` (only if needed) | trusted server/migrations only | **never** exposed to browser or logged |

**Account authentication:** require provider configuration and real OTP delivery tests before advertising phone login. Never let a demo phone input store a user session. Ensure browser/private responses are `no-store` and origin/CSRF policies protect state-changing cookie requests. CORS is not required for same-origin browser-to-BFF; any cross-origin deployment must use an explicit allowlist, not permissive wildcards with credentials.

**Privacy and security:** documented farmer consent for precise manual coordinate storage/retention/deletion; no public parcel coordinates; public community moderation/reporting and data deletion; authorization at route **and DB RLS**; no unreviewed phone/post details in logs; restrict DS artifact access; redact exceptions; rotate credentials on exposure. Ensure test accounts do not use real farmer phone numbers.

## 3. Mandatory end-to-end automated verification matrix

| # | Test | Required result / owner |
|---|---|---|
| 1 | UI input serialization | exact approved M2→JSON transform, no empty→invented values; frontend |
| 2 | Backend request validator | accepted/422 rejected inputs with per-field codes; backend |
| 3 | OpenAPI/TS/Python agreement | generated types and runtime schemas match canonical versions; backend+DS+frontend |
| 4 | `results_available` (when approved) | only returned baseline/0–2 options and sourced reasoning; DS+frontend |
| 5 | `no_suitable_options` | clear reason, **no fabricated alternatives**; DS+frontend |
| 6 | `model_unavailable` | no automatic demo fallback; gateway+frontend |
| 7 | explicitly opted-in `demo_preview` | prominent label, not live/savable as real; frontend |
| 8 | `request_error` + 422 | field errors, preserve draft and focus first error; backend+frontend |
| 9 | unknown zone/irrigation/crop/season | explicit valid unknown or blocked clarification, never coerced; all |
| 10 | absent/partial/invalid coordinates | reduced-precision path or validation; **no stale coords**; all |
| 11 | backend 401/403, expired cookie | private operation blocked, demo still visible; backend+frontend |
| 12 | parcel create/read/update/delete ownership | A may access own; B cannot access A; SQL RLS proves isolation; backend |
| 13 | community permissions | owner delete, pending/moderation/report rules, no unsafe public post; backend |
| 14 | timeout/network error/invalid JSON | visible translated recovery, no success claim; integration |
| 15 | duplicate form submissions | no repeated save/record; double click and server retries covered; integration |
| 16 | locale en/ary, RTL | inputs preserved, translated errors/loading/status, keyboard navigation; frontend |
| 17 | missing provenance/limitations | response rejected or UI states missing-data as approved; all |
| 18 | regression M0–M5 | welcome/demo, 4-step parcel, 2 dam markers/list/tiles failure, local share consent, unavailable calendar, audio fallback, 404; frontend |
| 19 | schema malicious payloads | oversize JSON, invalid content type, extra owner field, XSS, rate limiting; backend |
| 20 | scientific reproducibility | chosen artifact hash, source coverage, model version, deterministic tests and SME review; DS |
| 21 | deployment smoke/rollback | actual staging → production, disabled model fallback, DB backup and rollback rehearsal; release |

**Scientific acceptance is separate from API shape:** a schema-valid response does **not** prove scientifically safe crops. An independent agronomist must approve active rules and dataset geographic applicability; scores are not probabilities unless a justified calibrated meaning is documented. Maintain precision disclaimers and soil/water-data uncertainty.

## 4. Actual PowerShell verification script

Copy the separately provided `verify-integration.ps1` to a known tools folder. It executes the current repo's **npm ci → lint → typecheck → unit/component tests → production build**, optionally browser E2E, and writes an evidence file **outside the repo by default**. It does not deploy or claim manual checks pass.

```powershell
$ErrorActionPreference = 'Stop'
Set-Location 'C:\path\to\CSIA6'  # adjust to actual repo
& 'C:\path\to\verify-integration.ps1' -RepositoryPath (Get-Location).Path `
  -OutputPath 'C:\path\to\integration-evidence.md' -RunBrowserTests
# Omit -RunBrowserTests until npm has a real test:e2e script and browsers are installed.
```

**Additional suites (after implementation):**

```powershell
# DB tests on safe local Supabase instance:
npx supabase test db
if ($LASTEXITCODE -ne 0) { throw 'RLS tests failed.' }
# Python DS contract/model tests:
$env:PYTHONPATH = (Resolve-Path 'services/model_api').Path
& .\.venv-model\Scripts\python.exe -m pytest services/model_api/tests -q
if ($LASTEXITCODE -ne 0) { throw 'DS tests failed.' }
# OpenAPI code generation must not change committed generated TypeScript:
npx openapi-typescript contracts/openapi.json -o src/lib/api/generated/types.ts
if ($LASTEXITCODE -ne 0) { throw 'Schema generation failed.' }
git diff --exit-code -- src/lib/api/generated/types.ts
if ($LASTEXITCODE -ne 0) { throw 'Generated types drift.' }
```

Run only the suites/tools **actually installed and approved**. If a route/service/credential does not exist, mark its checks `NOT RUN/BLOCKED` rather than showing green. For E2E, ensure Playwright launches a real `npm run build` production server with known isolated staging users; do not click real sales/publication in production from tests. Test Map UI with tile network blocked while source list remains usable.

## 5. Manual acceptance in BOTH locales (minimum)

- **320/375px and desktop:** Home, nav, parcels, map, community, calendar, profile, rotation and error pages render without clipping or modal traps; tap targets ~44 px, focus visible, mobile bottom navigation accessible.
- **Darija `ary` RTL / English `en` LTR:** switch in wizard without losing inputs; code/numbers/coords displayed understandably, new errors and dialog states translated by reviewed copy; HTML `lang/dir` accurate.
- **Unauthenticated demo:** clearly labeled no account; no phone SMS sent; no private parcel API call. Existing local form review/community preview continue to work and reset honestly.
- **Authenticated mode if approved:** real login, invalid/expired session and logout; own parcel save/reopen/edit/delete; user B denied access; private geolocation not exposed publicly.
- **Community if approved:** pending/approved states and consent; copy preview requires active user confirmation; report/delete policies; no automatic share links to private data.
- **Rotation if approved:** actual returned baseline/results only, sourced rule citations/data resolution and limitations, uncertainty, no unsupported water/yield/price claims; no-result/timeout/unavailable/error/retry all tested.
- **Map:** source-checked dam feature points, map attribution, third-party tile policy, no unsourced polygons or precise entrances, market/supplier empty states; accessible list when tiles unavailable.
- **Calendar:** remain unavailable unless exact reviewed season/crop/region windows with references exist; never inject fake dates.
- **Audio:** text fallback visible without recordings; no autoplay; language-specific reviewed clips only if approved/loaded.

Record actual evidence: tester, UTC date/time, SHA, browser/device, locale, observed PASS/FAIL, screenshots with personal data redacted. **Manual checks cannot be auto-passed by the script.**

## 6. Staging → production promotion (only after G5)

1. **Freeze:** final public OpenAPI/hash + internal DS schema, image/build artifact, SQL migration IDs, app SHA, DS engine/model/data artifact versions, crop vocabulary and science citations; sign off DS/agraronomy and privacy/operations owners.
2. **Prepare:** infrastructure owners approve real domain, TLS, provider service regions, pricing/quotas, secret management, rate limits, allowed origins/redirects, backup and retention policy. Verify DB RLS under staging keys, Auth provider delivery and model service restrictions. Keep internal model inaccessible from browser.
3. **Deploy staging:** apply migrations to staging with backups, load versioned read-only model artifacts, deploy private FastAPI then BFF/UI configured to stage, verify health **and readiness separately**, run schema/security/real browser regression and no-result/unavailable states.
4. **Production deploy:** use reviewed CI/build artifact and compatible migrations, enable capabilities one by one. **Enable recommendations last** after DS readiness, science review and test traffic. If no DS readiness, leave M2 unavailable page and do not route users to sample scores.
5. **Verify:** observed readiness, 401 on protected unauthenticated calls, own vs other-user data privacy, no public coordinates/phone, no logging leaks, response versions/provenance, EN/ary and mobile smoke. Record a real deploy URL only after it exists.
6. **Monitor:** rates for 4xx/5xx/502/503/504, auth delivery failures, request latency and model readiness, DB policy denials, post reports, model/data version; logs must omit private content. Use an operational owner and explicit incident/rollback threshold, rather than guessed numerical SLOs.

## 7. Rollback & failure recovery

- **Frontend/BFF regression:** disable new API-dependent actions/feature flag and restore last compatible frontend release; keep previously accepted local demo and static map operational. Never represent an unsaved parcel as saved.
- **DS unavailable/invalid response:** mark readiness 503; gateway safely returns unavailable/502; **do not use automatic mock fixture or stale unverified results**. Restore last validated model/data artifact+schema pair only if its scientific approval is still valid.
- **Auth outage:** real sign-in and private CRUD disabled; demo clearly remains unauthenticated; private requests must not be accepted without identity.
- **RLS bug or leaked service-role:** disable affected API, revoke/rotate credentials, investigate access/logs without copying private data into incident chat; repair policy and rerun cross-user tests before reenable.
- **Bad DB migration:** halt writes, capture current schema/backup and decide forward-fix; do **not** blindly drop columns or `db reset` production. Restore verified backup only through approved operational procedure and consider data lost since backup.
- **Geography/source invalidated:** remove or label affected marker/indicator, update provenance and tests; do not invent replacement positions.
- **Community PII/report incident:** hide/disable public publication pending moderation and privacy response; retain required evidence securely, respect deletion policy.

## 8. Exact no-PR Git promotion and release record (PowerShell)

```powershell
# On verified feature/q1-release-hardening after feature tests + guide parity:
git add <EXACT-CHANGED-FILES>         # replace with real paths; DO NOT paste angle brackets literally
git commit -m 'Q1: validate integrated release'
if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
git switch main
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'Cannot fast forward main.' }
git merge --no-ff --no-commit feature/q1-release-hardening
if ($LASTEXITCODE -ne 0) { throw 'Merge failed; do not push.' }
# Rerun documented npm/DB/DS/contract/browser/QA checks on the PENDING MERGED TREE.
# On failure and ongoing merge: git merge --abort; fix on feature branch.
# On observed PASS only:
# git commit -m 'Integrate Q1 release validation'
# git push origin main
# git fetch origin
# Check git rev-parse HEAD equals git rev-parse origin/main.
```

**Guide/source parity:** every code, test, migration, generated type, config or deployment change triggers update/check of `docs/integration/Q1-RELEASE.md` in same commit; update shared docs only if architecture/scope/process actually changes. Do not rewrite historical M0–M5 guides. Release record must include current `origin/main` SHA, deployment artifact digest, contract hash, DB migration IDs, science version+hash, verified capabilities, all observed tests, unverified/deferred features, named owner, incident contacts, rollback test and decision/time.

## 9. Definitions of done — practical pass/fail

| Stage | PASS only when | Otherwise |
|---|---|---|
| G-M5 | actual source and M5 CI/browser evidence verified | no backend integration branch promotion |
| G0 | signed API/science/security decisions and schema | block affected endpoint/adapters |
| G1 | DB migration + anonymous/A/B RLS tests observed | no private persistence |
| G2 | configured real Auth + approved CRUD/moderation tests | honest demo/local-only |
| GD1/GD2 | reviewed data/rules/artifact and real inference contract/status tests | model unavailable |
| G3 | private gateway + validation/status/timeout/security tests | no recommendations |
| G4 | generated types/adapters + EN/ary/M0–M5 browser regression | stay on prior frontend |
| G5 | staging/prod-safe deploy, source/data/privacy audit, rollback rehearsal | release blocked/limited to demo |

**Release principle:** passing unit tests does not replace agricultural scientific review or real-user privacy controls. A safe, truthful feature-unavailable state is preferable to fabricated crop advice.
