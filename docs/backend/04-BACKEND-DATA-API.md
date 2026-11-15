# B2 — Real identity, parcel/profile CRUD, community & privacy-safe API

**Owner:** backend owner **to appoint** · **Branch:** `feature/b2-identity-data` · **Prerequisites:** M5 proven, G0 contract/architecture decisions approved, B1 committed with tested DB/RLS on `origin/main`. **Status:** **BLOCKED** for actual implementations pending provider, approved field schema, moderation and privacy decisions. This is a step-by-step implementation guide; it **does not pretend** that Supabase Auth or the CRUD endpoints exist.

## 0. Responsibilities and preserved UX

**Backend:** secure identity verification, server input validation, authorization/ownership, persistence, moderation state, error envelope and audit-safe events. **Database:** independent RLS policy enforcement. **Frontend:** preserve M1 phone-format demo and M2/M4 local UX; only enable real save/publication with authenticated consent; no UI-only guard presented as security. **Scientist:** nothing in this milestone.

Keep these modes separate:

| Mode | Real authentication? | Parcel save? | Public posting? |
|---|---|---|---|
| Existing M1 demo | **No** | **No**; local M2 review only | **No**; M4 page preview only |
| Real Supabase session, provider configured | Yes, if verified server-side | Yes after approved schema, RLS and privacy gate | Only if publication and moderation are approved |
| Phone/SMS not provisioned | No phone OTP | No data operations requiring auth | No pretending SMS works |
| DB temporarily down | Existing demo remains visibly local | Clear unavailable/error; no fake save | Preview/copy remains local and private |

Never turn the optional M1 phone-format preview into a login token. Do not persist phone numbers typed in the demo form. If phone OTP is needed, configure a supported Supabase phone provider and a real delivery test (including rate limits, expiration, abuse prevention, spending caps) **before enabling sign-in**. Non-phone methods also require explicit UX/scope approval; do not silently add email/password login.

## 1. Preflight and branch (PowerShell)

```powershell
$ErrorActionPreference = 'Stop'
Set-Location 'C:\path\to\CSIA6' # adjust
if (@(git status --porcelain).Count -ne 0) { throw 'Uncommitted work.' }
git fetch origin
git switch main
git pull --ff-only origin main
$sha = (git rev-parse HEAD).Trim()
if ($sha -ne (git rev-parse origin/main).Trim()) { throw 'Not current main.' }
# Verify B1 guide, migrations and RLS tests are on main AND have actual PASS evidence.
Get-Content package.json
Get-Content .nvmrc
# Only after B1 and C02/C03/C11 approved:
git switch -c feature/b2-identity-data
if ($LASTEXITCODE -ne 0) { throw 'Branch already exists or cannot be created.' }
```

Inspect `src/app/api/`, server auth helper (if any), `src/features/m1/AccessScreen.tsx`, actual M2 draft, M4 preview, and confirmed `supabase/migrations/`. Do not replace any frontend files in B2 unless explicitly agreed with frontend owner and reflected in this guide.

## 2. Conditional exact file operations

| File | Action after relevant approval | Reason |
|---|---|---|
| `src/lib/server/supabase.ts` | CREATE or reconcile actual helper | cookie-based server client, no service-role in app requests |
| `src/lib/server/auth.ts` | CREATE | verified server-side user; no trust in request body `owner_id` |
| `src/lib/server/apiErrors.ts` | CREATE | stable JSON error envelope/request IDs, redacted logging |
| `src/lib/server/validateParcel.ts` | CREATE from **approved** parcel schema | strictly parse and normalize only approved fields, no DS inference |
| `src/app/api/v1/me/route.ts` | CREATE if approved | private current user profile; return safe display fields only |
| `src/app/api/v1/parcels/route.ts` | CREATE if approved | GET list + POST create, auth and owner scope |
| `src/app/api/v1/parcels/[id]/route.ts` | CREATE if approved | GET/PATCH/DELETE with own-record scope |
| `supabase/migrations/<timestamp>_community.sql` | CREATE after moderation review | RLS, pending publication, no direct user privilege escalation |
| `src/lib/server/validatePost.ts` | CREATE from approved post schema | category-specific validation, privacy constraints |
| `src/app/api/v1/community/posts/route.ts` | CREATE if approved | listing/publication policy, cursor pagination/filter |
| `src/app/api/v1/community/posts/[id]/route.ts` | CREATE if approved | owner read/delete, moderator-only transitions |
| `src/app/api/v1/community/posts/[id]/reports/route.ts` | CREATE if approved | private abuse reporting and moderation tooling |
| `tests/api-auth.test.ts`, `tests/api-parcels.test.ts`, `tests/api-community.test.ts` | CREATE | complete approved-path and hostile/anonymous tests |
| `supabase/tests/*.test.sql` | CREATE | cross-user and role enforcement under DB policies |
| `docs/integration/B2-DATA-API.md` | CREATE | actual code, commands, schema version and regression evidence |

**One canonical public API schema:** approved `contracts/openapi.json` from B0 governs paths, verbs, required fields, status/error bodies, pagination, idempotency. The examples below are **proposed workflow targets**, not a license to invent route payloads.

## 3. Auth implementation procedure (conditional on verified provider)

1. Confirm real Supabase project URL/publishable key, Auth redirect allowlist, provider choice and session policy. For Next SSR cookie sessions, install/use `@supabase/supabase-js` + `@supabase/ssr` only if they match current resolved dependencies. Verify the current official Next integration for the installed Next major version, particularly the refresh Proxy/Middleware and cookie APIs.
2. Create server client using request cookies. **On every restricted route**, call `supabase.auth.getUser()` (or a verifiably equivalent documented identity check) before any operation. Treat null/error as 401; do not authorize from browser-supplied `user_id`, display name, phone or unsigned cookies. Review SSR cache handling and authentication redirects.
3. Use the authenticated user's Supabase client and ensure query results are still constrained by **DB RLS**. Avoid service-role for farmer requests. Restrict any administrative moderation service to server-only authenticated admin role with explicit authorization and audit.
4. Protect state-changing cookie-authenticated requests from CSRF with same-site cookies plus strict Origin/Host checks (or reviewed CSRF tokens) as supported by deployment. Define a real production origin, allowlist forwarded-host behavior behind proxy and reject unknown origins. Configure `Cache-Control: no-store` for private data and disable shared/CDN caching of cookie response content.
5. Keep `Demo` separate (no auth cookie); unauthenticated request to private API returns 401 even if `/home` is navigable in demo mode.

**Do not ship a self-created “fake JWT”, temporary `user-123`, hardcoded OTP, or frontend-only boolean `isAuthenticated`.** Client Supabase publishable keys may be browser-visible; service-role and internal model keys may not.

## 4. Parcel operations and constraints (B2 contract-gated)

**Example API operation names (NOT approved):** `GET/POST /api/v1/parcels`, `GET/PATCH/DELETE /api/v1/parcels/{id}`. Specify actual JSON request and response *from* signed `contracts/openapi.json`, not the UI draft. Every route:

- Return 401 if unauthenticated, independently of the existing demo entry.
- Verify ownership by server-authenticated identity **and RLS**, not `owner_id` in the request.
- Validate JSON size/type, Unicode length, area and coordinate rules, field-allowlist, unknown semantics, and clear 422 field errors; never `parseFloat('12abc')` or default unknown `zone` to Béni Amir.
- Ignore or reject any client-provided `id`, `owner_id`, `created_at`, `updated_at`, model version or scientific source. Use server-generated UUID/timestamps and revision control if edits can conflict.
- If `locationChoice = none`, store **no** coordinates; if the user explicitly opts into manual location, use approved privacy text and exactness/retention controls. Never publish parcel coordinates via community or share link.
- Only return approved private fields; list pagination/cursor limits and deterministic sort; get-by-ID must not distinguish “someone else's parcel” from “not found” if it leaks existence.
- Reject unknown crop labels for model use while preserving farmer free-text notes **privately** if storage was approved. Nothing in parcel CRUD implies a valid recommendation request.
- Use a single transaction for any multi-row update; deletion behavior must be documented (soft/hard delete, references, backup retention and user data export/removal).

**Acceptance matrix:** user A owns A1, user B owns B1; A can create/read/edit/delete A1; B cannot access A1, even by direct Supabase Data API; unauthenticated cannot enumerate; invalid decimal, unknown enum, partial lat/lon and overlong strings fail; null/absent remain semantically distinct as approved; network failure never yields a saved-success toast.

## 5. Community: approval needed for publication and moderation

M4 currently supports **local-only** three kinds: `experience`, `sale`, `partnership`, with user-entered fields, filters, review-before-add, remove and privacy-confirmed copy. It has no users, contact links or moderation. For a real service approve:

- Public visibility: logged-in only or anonymously readable; whether a farmer can view private draft, pending, approved, hidden and deleted states.
- Publication policy: recommended **pending → reviewed → published**, with a clear user-facing pending label; if real moderation is impossible, **do not publish public posts yet**.
- Review/reporting workflows: report reason, throttling, moderation queue, rejection/appeal, hide, delete, retention, escalation; define who is authorized moderator, never trust user-provided role.
- Explicit consent for publication; individual posts must not automatically include phone number, precise coordinate, private parcel ID or whole private profile. User-written content may still expose PII; prompts/confirmation and moderation are not guaranteed redaction.
- Post type-specific schema: `experience` title/description; `sale` user-entered crop/quantity unit/optional asking price **not validated market truth**; `partnership` purpose/approximate area; never connect payments, inventory or guaranteed availability by default.
- Server sanitization/output encoding, spam/rate limits, pagination/filters, record ownership, deletion requests and acceptable use. Public URLs, if approved, must render only **approved non-sensitive** data.

**Conditional SQL design pattern (illustrative, not a migration):** `community_posts` with `owner_id` FK, `status` default `pending`, and separate RLS policies: user insert allowed only with `owner_id = auth.uid()` **and** `status = 'pending'`; owner reads own pending; public read only `published`; ownership and status must be immutable through user UPDATE; moderators may change status only via a **separately authorized server path**. Do not give regular users blanket `UPDATE status` or direct `published` insert. Test `anon`/A/B/moderator reads, publish attempt denial, delete own vs other, report throttling.

## 6. Backend error contract, limits and observability

Adopt the signed error envelope from the contract: code, safe summary, array of field paths/codes where relevant, correlation ID. Proposed mapping:

| Condition | Expected HTTP (finalize at C10) | Backend behavior |
|---|---|---|
| no/expired auth | 401 | no query; prompt to sign in if supported |
| other owner/no row | 404 or 403 | leak-resistant, no raw row |
| malformed JSON / invalid values | 400 / 422 | bounded parsed input; preserve field errors |
| stale update | 409 | no silent lost update |
| rate limited | 429 | Retry-After when available |
| DB down | 503 | no successful-save message; error ID |
| unexpected | 500 | log server-only sanitized error, generic client body |

Limit body sizes, read/insert rates and list page sizes; use approved per-user/IP limits; do not invent production thresholds. Logs may include route, request ID, duration, status, schema version, never raw farmer comments/phone/coordinates or full request JSON. CORS should generally be unnecessary with same-origin browser APIs; if cross-origin selected, allow explicit approved origins only, no `*` with credentialed cookies. Configure anti-CSRF and safe cookies.

## 7. Full implementation and tests **after** schema approval

Generate backend request parsers directly from approved schema with server-side validators. **Do not copy `ParcelDraft` or `CommunityDraft` into server code as approved domain types.** The guide can only provide complete handler code after decisions C02/C03/C04/C10/C11 and the actual server/auth/client interfaces are verified; inventing it now would violate the user's implementation-readiness rule.

**Required automated tests:**

1. Auth: anonymous/demo requests 401; verified session works; expired/tampered cookie fails; origin/CSRF restriction.
2. CRUD: valid minimal/optional/unknown; invalid boundary values; create/list/read/patch/delete; pagination; duplicate submission/idempotency semantics; optimistic concurrency if enabled.
3. RLS: A vs B row access in SQL, including direct Data API and malicious `owner_id` request; service-role never leaked to browser.
4. Community: each `kind`, invalid fields, user-entered unverified crop/price, moderation state, unapproved public publication blocked, reporting and owner delete, privacy checks.
5. Errors: DB outage, timeout, invalid JSON, client abort, generic safe error and correlation, no phone/coordinates in logs.
6. Regression: M0–M5 UI, `en`/`ary` and RTL; local demo unaffected and honest; no implicit real post persistence.

When contract is finalized, **replace these test specifications with complete Vitest/pgTAP code** in the actual B2 feature guide, run them, and attach observed evidence. With no credentials or provider, mark auth `BLOCKED`; do not fabricate testing outcomes.

## 8. Exact checks, documentation, merge, and rollback

```powershell
# On feature/b2-identity-data, after implementation and complete tests:
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Install failed' }
npm run lint; if ($LASTEXITCODE -ne 0) { throw 'Lint failed' }
npm run typecheck; if ($LASTEXITCODE -ne 0) { throw 'Typecheck failed' }
npm run test; if ($LASTEXITCODE -ne 0) { throw 'Tests failed' }
npm run build; if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
# Supabase local pgTAP tests when configured:
# npx supabase test db
# Browser E2E when configured, against test authenticated accounts ONLY:
# npm run test:e2e
```

**Expected (not observed):** authenticated data scoped to owner, all anonymous/other-user denials, published data approved/moderated, frontend demo still works, no private info in public output; good network/error handling.

Documentation: record `contracts/openapi.json` version, migration names, provider (not secrets), real routes and responses, policy matrix, tests, updated source excerpts and SHA in `docs/integration/B2-DATA-API.md`. Touch `docs/system-design.md` only for implemented architecture. Preserve M0–M5 historical docs. In the same commit, update this guide for **every source/test/config change**.

Use `git merge --no-ff --no-commit feature/b2-identity-data` locally into a clean `main` only after G2; rerun full frontend+DB/security checks before completing merge. Confirm remote commit after push, no Pull Request. On failure abort an ongoing merge and fix the feature branch. On deployed failure, disable real save/post entry points while preserving honest local demo, roll back app to compatible build, **do not blindly reverse production migrations**, and apply reviewed forward fix/restore plan.

**B2 Definition of done:** real provider verified (or auth scope explicitly deferred), secure approved CRUD with full code/tests and RLS proof, approved moderation before public posting, no demo impersonation, documented endpoints/version, passing observed tests and real `origin/main` integration. Any unmet dependency stays **BLOCKED**, not implicitly completed.
