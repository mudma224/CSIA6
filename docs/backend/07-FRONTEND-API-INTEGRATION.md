# F1 — Precise frontend API integration, zero speculative science

**Owner:** frontend integration developer **to appoint** (DEV1/DEV2 assignments ended with M5) · **Branch:** `feature/f1-api-integration` · **Prerequisites:** real M5 main audit; G0 approved public OpenAPI; G2 authenticated CRUD where enabled; G3 validated model gateway before changing `/rotation`. **Status:** planned / NO real repository edits have been applied. **Do not** overwrite existing M0–M5 source with historical guide versions.

## 0. Principles: preserve the working farmer journey

**All integration changes are incremental.** Maintain exact routes, layouts and components from the **real** main checkout; M2 local four-stage wizard continues to own its controlled state and existing validation; M4 local composer remains available for explicit offline demo; `en` LTR and `ary` RTL use the **same** existing locale provider. Store no new parcel data or credentials in localStorage. Do not add map/voice/calendar backends when static verified assets already work. Do not add a frontend scoring function or infer crop IDs.

**Recommended communication:** frontend `fetch('/api/v1/...')` same-origin → Next.js BFF route handler → Supabase identity/DB or private FastAPI service. The browser never calls FastAPI directly or receives its secret. BFF validates authorization and request schema, maps approved UI to scientific schema, validates response and sends a safe public result. Frontend parses typed approved response **at runtime** before rendering. No separate CORS setup needed for same-origin requests.

## 1. Start from the *actual*, tested frontend main (PowerShell)

```powershell
$ErrorActionPreference = 'Stop'
Set-Location 'C:\path\to\CSIA6' # adjust
if (@(git status --porcelain).Count -ne 0) { throw 'Clean worktree required.' }
git remote -v  # confirm mudma224/CSIA6
git fetch origin
git switch main
git pull --ff-only origin main
$baseline = (git rev-parse HEAD).Trim()
if ($baseline -ne (git rev-parse origin/main).Trim()) { throw 'Remote main mismatch.' }
Get-Content package.json
Get-Content src/features/m2/parcelDraft.ts
Get-Content src/features/m2/ParcelJourney.tsx
Get-Content src/features/m4/CommunityScreen.tsx
Get-Content src/features/m4/communityDraft.ts
Get-Content src/features/m2/RotationScreen.tsx
Get-Content src/i18n/LocaleProvider.tsx
Get-Content src/components/navigation/AppFrame.tsx
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/parcels/new/page.tsx'
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/rotation/page.tsx'
# Confirm approved contracts/openapi.json exists and its hash/version is signed.
# Inspect M5 observed browser/RTL result and G2/G3 endpoint test evidence.
npm ci
npm run lint; if ($LASTEXITCODE -ne 0) { throw 'Baseline lint failed.' }
npm run typecheck; if ($LASTEXITCODE -ne 0) { throw 'Baseline types failed.' }
npm run test; if ($LASTEXITCODE -ne 0) { throw 'Baseline tests failed.' }
npm run build; if ($LASTEXITCODE -ne 0) { throw 'Baseline build failed.' }
# Branch ONLY when baseline, contract and relevant services are ready:
git switch -c feature/f1-api-integration
if ($LASTEXITCODE -ne 0) { throw 'Existing branch; inspect it.' }
```

If M5 or API readiness is unverified, **stop production integration and perform only read-only auditing / contract review**. Frontend file paths in this guide are historical M5 expectations; verify each with the audit script. Never invent missing exports or props. Do not use M5 guide code as a replacement for real source.

## 2. Exact planned frontend file operations and gates

| File relative to repo root | CREATE / MODIFY | What to verify before editing |
|---|---|---|
| `contracts/openapi.json` | ADD **approved canonical schema only** | current approval/date/hash; public BFF routes only |
| `src/lib/api/generated/types.ts` | CREATE generated | `openapi-typescript` output from approved schema; never hand-edit |
| `src/lib/api/request.ts` | CREATE (safe generic code below) | do not duplicate pre-existing request client |
| `src/lib/api/errors.ts` | OPTIONAL if existing convention requires | typed transport failures; no raw server details |
| `src/lib/api/runtime.ts` | CREATE after schema approval | approved runtime decoders; TypeScript types alone insufficient |
| `src/lib/api/adapters/parcel.ts` | CREATE **after C03–C06** | exact M2 field mapping, **reject unsupported crop/irrigation** |
| `src/lib/api/adapters/community.ts` | CREATE **after C11** | category-specific payload, strip unapproved PII |
| `src/lib/api/adapters/recommendation.ts` | CREATE **after G3** | science statuses, baseline/options/evidence; no science math |
| `src/features/m2/ParcelJourney.tsx` | TARGETED MODIFY | preserve wizard/steps/local demo; add explicit save only if approved |
| `src/features/m2/RotationScreen.tsx` | TARGETED MODIFY **last** | keep unavailable until real model response and contract tests |
| `src/features/m4/CommunityScreen.tsx` | TARGETED MODIFY | preserve previews; real publish gated by auth/moderation/consent |
| `src/features/m1/AccessScreen.tsx` / `ProfileScreen.tsx` | TARGETED MODIFY only after real Auth | keep demo and profile semantics truthful |
| `src/features/m1/HomeScreen.tsx` | TARGETED MODIFY only if real data supported | avoid unnecessary layout replacements |
| `src/i18n/*` | TARGETED ADD translation keys | all new labels/status/errors en+ary; same provider |
| `tests/f1-transport.test.ts` | CREATE | generic transport tests below |
| `tests/f1-parcel-adapter.test.ts` | CREATE after approved schema | every mapping/unknown/blank boundary |
| `tests/f1-recommendation-states.test.tsx` | CREATE after G3 | every science status and fallback |
| `e2e/f1-integration.pw.ts` | CREATE after real backend env | full actual server- and browser-based journey |
| `.env.example` | UPDATE only needed public client config | no `NEXT_PUBLIC_MODEL_SECRET` or service-role key |
| `docs/integration/F1-API.md` | CREATE | complete actual source/test mapping, contract SHA |

**Do not change by default:** original design tokens/CSS, `LocaleProvider` internals, `PrimaryNav` destinations, M0 audio manifest/`AudioHelp`, M3 sourced `verifiedPoints.ts`, OSM attribution, M4 unavailable calendar, `/foundation-preview`, past M0–M5 guides. If approved business changes require a screen adjustment, update the *smallest* component/guide/test set together.

## 3. Contract-generated types and runtime validators

After schema approval and checking `package.json`:

```powershell
# On F1 branch, when approved contracts/openapi.json is committed:
npm install --save-dev openapi-typescript
if ($LASTEXITCODE -ne 0) { throw 'Type generator install failed.' }
New-Item -ItemType Directory -Force 'src/lib/api/generated' | Out-Null
npx openapi-typescript contracts/openapi.json -o src/lib/api/generated/types.ts
if ($LASTEXITCODE -ne 0) { throw 'Generation failed.' }
# Record actual installed version and regenerated diff; pin/lock it.
npm ls openapi-typescript
```

Do not create a handwritten clone of approved Python Pydantic fields. Use generated `paths`/`components` types in adapter signatures. TypeScript **does not validate JSON from the network**; define a runtime parser/validator for every public response status and error body (e.g. use a generated JSON Schema validator chosen at C10, or an explicitly tested local parser). Do not add a new validation library until checked against actual dependencies. Fail closed on unexpected shape or missing evidence.

## 4. Complete, safe **contract-independent** API transport (code only after source audit)

The transport is independent of parcel/DS schemas and adds no crop logic. It accepts a **required** runtime parser so callers cannot treat arbitrary network JSON as trusted. `timeoutMs` is required because the production timeout must be agreed in C10, not guessed from this guide.

**`src/lib/api/request.ts` — CREATE if no compatible client exists:**

```typescript
export type ApiFailure = 'http' | 'network' | 'timeout' | 'cancelled' | 'invalid_response';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiFailure,
    public readonly status: number | null,
  ) {
    super(kind === 'http' ? `HTTP ${status}` : kind);
    this.name = 'ApiError';
  }
}

type RequestArgs<T> = {
  path: string; // same-origin BFF path only
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  timeoutMs: number; // approved per-operation budget
  signal?: AbortSignal;
  parse: (json: unknown) => T; // approved runtime schema parser
  fetchImpl?: typeof fetch; // test injection
};

export async function requestJson<T>({
  path, method = 'GET', body, timeoutMs, signal, parse,
  fetchImpl = fetch,
}: RequestArgs<T>): Promise<T> {
  if (!path.startsWith('/api/') || path.startsWith('//') || path.includes('://')) {
    throw new Error('Only same-origin API paths are allowed');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error('timeoutMs must be a positive integer');
  }
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetchImpl(path, {
      method,
      headers: { 'Accept': 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
    });
    if (!response.ok) throw new ApiError('http', response.status);
    let json: unknown;
    try { json = await response.json(); }
    catch { throw new ApiError('invalid_response', response.status); }
    try { return parse(json); }
    catch { throw new ApiError('invalid_response', response.status); }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError('timeout', null);
    if (controller.signal.aborted) throw new ApiError('cancelled', null);
    throw new ApiError('network', null);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
```

**Limits to fix at G4:** this transport deliberately does not parse approved field errors (HTTP 422) yet, handle `204 No Content`, stream/read size caps, or implement retry/idempotency. Extend only against the approved status/error schema and test. The `parse` callback must actually validate JSON; a caller's unsafe `(x) => x as T` is forbidden. The BFF owns the authorization/CSRF checks; setting `credentials` by itself is **not authentication**. Ensure no `GET` requests have a body and no raw error payload or private user input gets logged.

**`tests/f1-transport.test.ts` — CREATE if Vitest configuration supports `AbortController`/`fetch` and existing test conventions:**

```typescript
import { describe, expect, it, vi } from 'vitest';
import { ApiError, requestJson } from '../src/lib/api/request';

function parseOk(value: unknown): { ok: boolean } {
  if (!value || typeof value !== 'object' || !('ok' in value) ||
      typeof (value as { ok: unknown }).ok !== 'boolean') {
    throw new Error('Invalid response');
  }
  return { ok: (value as { ok: boolean }).ok };
}

const mock = (fn: (...args: Parameters<typeof fetch>) => Promise<Response>): typeof fetch =>
  vi.fn(fn) as unknown as typeof fetch;

describe('F1 same-origin transport', () => {
  it('serializes POST without inventing fields, then parses runtime JSON', async () => {
    const fake = mock(async (_url, init) => {
      expect(init?.method).toBe('POST');
      expect(JSON.parse(String(init?.body))).toEqual({ zone: 'user-choice-only' });
      return Response.json({ ok: true });
    });
    await expect(requestJson({ path: '/api/test', method: 'POST',
      body: { zone: 'user-choice-only' }, timeoutMs: 1000, parse: parseOk,
      fetchImpl: fake })).resolves.toEqual({ ok: true });
  });
  it('fails closed on malformed success', async () => {
    const fake = mock(async () => Response.json({ unsupported: true }));
    await expect(requestJson({ path: '/api/test', timeoutMs: 1000,
      parse: parseOk, fetchImpl: fake })).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  it('surfaces unauthorized HTTP state distinctly', async () => {
    const fake = mock(async () => new Response(null, { status: 401 }));
    await expect(requestJson({ path: '/api/test', timeoutMs: 1000,
      parse: parseOk, fetchImpl: fake })).rejects.toMatchObject({ kind: 'http', status: 401 });
  });
  it('does not allow external model URL', async () => {
    await expect(requestJson({ path: 'https://model.example/predict',
      timeoutMs: 1000, parse: parseOk })).rejects.toThrow(/same-origin/);
  });
  it('handles network errors without leaking an internal exception', async () => {
    const fake = mock(async () => { throw new TypeError('private network detail'); });
    await expect(requestJson({ path: '/api/test', timeoutMs: 1000,
      parse: parseOk, fetchImpl: fake })).rejects.toMatchObject({ kind: 'network' });
  });
  it('honors cancellation', async () => {
    const controller = new AbortController(); controller.abort();
    const fake = mock(async (_url, init) => {
      if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      return Response.json({ ok: true });
    });
    await expect(requestJson({ path: '/api/test', timeoutMs: 1000,
      signal: controller.signal, parse: parseOk, fetchImpl: fake }))
      .rejects.toMatchObject({ kind: 'cancelled' });
  });
});
```

**Important:** M5 Vitest/test environment must be inspected first; sample code was **not run in the user's repository**, and must be reconciled to the real test config before use. Add a deterministic fake-clock timeout test based on actual Vitest version; do not use arbitrary slow sleeps. If `fetch` is already wrapped, extend that existing layer rather than creating a competing client.

## 5. Exact M2 form → approved server request adapter (BLOCKED until C03–C08)

Retain real `ParcelDraft` state and `validateParcelStep()` / `firstInvalidStep()` for **UI usability only**. An *explicit review-to-save/recommend* handler creates a separate approved typed request by calling `toApprovedParcelInput(draft, reviewedCropMapping, consentState)`, returning `success` or a **field-specific blocked/error**—never silently guessing. The adapter must be pure and unit tested. It does **not** gain responsibility for science.

| Existing field (historical M2 guide) | Target field | Required transform or rejection; exact unit | Tests |
|---|---|---|---|
| `parcelName` | approved private `name` (if permitted), not model | trim, 60 chars, blank means absent; never public | blank/Unicode/length, DS omission |
| `zone` | proposed `parcel.zone` | explicit candidate `amir→beni_amir`, `moussa→beni_moussa`, `other/unsure` only if approved; string enum | all 4 + unselected, no location inference |
| `areaHa` | `area_ha` | positive finite decimal in **ha**, commas to dots; blank **omit** not zero | `1,5`, blank, malformed, 0/negative |
| `irrigation` | proposed `parcel.irrigation` | `drip-ui` candidate drip; **surface-ui/other-ui cannot be faithfully mapped to v0.1 flood/basin/pivot/sprinkler**; block/clarify | all values; unsupported never guessed |
| `locationChoice` + `latitude`/`longitude` | optional `location` | `none`: remove BOTH coordinates even if old strings remain; `manual`: both ranges + consent and reviewed precision policy | switch manual→none, partial values, out-of-range |
| `recentCrop`, `earlierCrop` | `history[].crop_id` | free text **must be selected/mapped through approved human-reviewed vocabulary**; reject ambiguity/unknown | exact/alias/unsupported/unselected |
| `recentCropSeason`, `earlierCropSeason` | `history[].season` | approved parser and ordering, free text not auto year | invalid year/order/dangling season |
| `seasonChoice`, `plannedSeason` | `planned_season` | `unsure` blocked if required by DS; `known` parsed only in approved format | unknown/empty/unapproved |
| M2 has **no** `soil_constraints` | optional | omit unless later explicit user-added controlled input | absent vs `[]` semantics |
| M2 has **no** `farmer_priorities` | priorities object | **do not invent default weights**; if mandatory, add reviewed controls as a separately approved UI change | missing/explicit values |
| M2 has **no** explicit proposed baseline crop sequence | baseline fields | **cannot derive existing farmer strategy from last crop**; ask user after approval | no baseline implies no results |

**Critical M2 discrepancy:** historical guide opening claims no coords, but its actual `ParcelDraft` includes optional user-typed lat/lon. Audit `main` first. **Do not** unconditionally send coordinates merely because draft strings are non-empty. Make consent and geographic source/resolution visible to farmer. For unsupported crop IDs or scientific input requirements, preserve the local review, show *recommendations currently unavailable / more information needed*, no fallback crops. Do not freeze the current UI-only model as an API payload.

**G4 adapter test specification (implement complete code after schema approval):** table-driven tests for every row above; `JSON.stringify` snapshot from approved generated types, absent keys omitted; `unknown` explicit only where schema accepts; no `NaN`, `Infinity`, raw free-text crop IDs, stale coords, unsupported irrigation or implicit priority weighting. Validate against actual BFF route with 200/422 response tests.

## 6. Parcel integration without rewriting wizard

1. Check real M2 `ParcelJourney.tsx`: where step 4 reviews and `Confirm local review` currently resets/shows local success. **Do not replace this action with an unexpected API POST**.
2. Keep existing local-only action for unauthenticated Demo. If signed-in saving is approved, add a *separate explicitly named* Save action (or a reviewed mode switch with clear language); on click, run UI checks, pure adapter, authenticated `requestJson` using the approved parser.
3. Use `useRef` in-flight guard **and** disabled submit button to reject duplicate clicks. `try/finally` clears the guard; do not assume React state updates alone are synchronous locks. On unmount cancel in-flight read/action where safe; server mutations may still complete—use idempotency key/confirmed outcome where approved.
4. Keep draft values and current step after network 401/422/503/timeout. Render inline translated field errors, focus first bad input; backend validation remains authoritative. Only show a persisted parcel ID/saved-state when the server really returned a validated success.
5. Do not auto-trigger recommendation after parcel save. Recommendation action is distinct and blocked until G3/DS approval. After an approved model response, no implied user-selected recommendation until the user explicitly chooses.
6. Add tests for both demo/offline and signed-in paths, with no regression in step navigation, RTL, native keyboard, coordinates privacy and local confirmation.

## 7. Recommendation UI: switch only after G3

**Until G3:** keep M2 `RotationScreen`'s `recommendations unavailable` text **as-is**, regardless of whether B1/B2 backend is running. **After G3:** add a component preserving route/layout/navigation; it receives a validated *public* discriminated result union and shows only returned data.

| Approved status (proposed v0.1 labels) | What UI must show | What it must never show |
|---|---|---|
| `results_available` | real farmer-stated baseline strategy, actual 0–2 returned alternatives if specified, supporting explanations, verified provenance/missing-data/limits/version | invented option, fake history, scores as probabilities |
| `no_suitable_options` | explicit reason and context limitations, next action to clarify | arbitrary fallback crop |
| `model_unavailable` | unavailable/error with retry and preserved form input | cached sample presented as live |
| `demo_preview` | clearly opted-in labelled illustrative fixture, distinct styling, no production save | unsignalled model substitution |
| `request_error` / 422 | translated field errors and a route back to M2 data entry | silent coercion of missing crops/irrigation |

**Also handle**: loading, initial empty, network offline, 401/403, 429, 500/502/503/504, unexpected response schema, timeout/abort, stale request, duplicate clicks. No automatic retry of writes without idempotency approval. 0–100 **compatibility ranking** is a *proposal* and may not be displayed as percent chance or savings. Display rule/source text only from validated service, with units/region/date/resolution and explicit caveat where relevant. The user can choose an alternative only when a real supported result was received; saving a choice requires separate authenticated persistence and version/timestamp semantics.

## 8. Community, profile, Home, map, calendar, language and audio

- **Welcome/demo:** preserve language-before-entry and independent demo flow. M1 phone field is a format preview; only after genuine provider setup add real sign-in and say whether SMS was sent/verified from actual outcome. Do not create a fake account on demo click.
- **Home:** show private recent parcel only after valid authenticated response; otherwise maintain truthful empty/demo state, with no invented weather or cached sample. Keep existing cards and nav.
- **Profile:** persist only approved fields for signed-in user; display name stays ephemeral in demo. Show auth expiry, log out and deletion appropriately only when supported; never leak phone.
- **Parcel:** as §5–6, keep four-step UX/unknown choices, preserve input on errors, no silent save.
- **Rotation:** as §7, a separate gate; no model calculation in UI.
- **Map:** preserve M3 static sourced approximate dam points and accessible list/OSM attribution. No API call unless vetted new data exists; do not convert M2 typed coordinate into a public map marker without consent and explicit linkage design. Markets/suppliers empty until verified.
- **Community:** keep M4 session-only composer/review/list. Authenticated real publication is a **separate explicit action** only when moderation/consent/policy exists; distinguish `pending`, `published` and error. `local-*` IDs are never server IDs. Copy text requires same privacy confirmation; no auto public URL.
- **Calendar:** leave unavailable until agronomist-reviewed regional/crop/season windows; no dates generated by frontend.
- **Language:** reuse single `LocaleProvider`, `en` LTR / `ary` RTL, preserve draft values across language change. New backend errors map to translated *codes*, not unreviewed raw English server strings.
- **AudioHelp:** existing empty/reviewed clip manifest and transcript fallback remain; backend not needed. Never autoplay or add AI TTS by accident.
- **Recovery:** preserve M5 404/error boundary and retry; error code display must not expose internals.

## 9. Contract and integration tests — exact scenarios

**Implement each after approved public schema; reuse M0–M5 tests:**

| Test layer | Cases | Gate |
|---|---|---|
| Pure UI→request adapter | serializes M2 decimals, blank/unknown, zone/irrigation, explicit coords, crop/season, priorities | blocks unmapped inputs, no defaults |
| Backend schema | request accepted/rejected with field-coded 422, auth/owner scope | no invalid value stored |
| OpenAPI drift | generation reproducible, approved hash, server and TS types aligned | CI fails on divergence |
| Science statuses | results, no suitable, unavailable, demo labelled, request error | no fake fallback, all limitation fields |
| Transport | 401/403/429/500/502/503/504, invalid JSON, timeout, abort, offline | no false saved success |
| Concurrency | double-click Save/Recommend; tab change and stale response | single submission or safe idempotency |
| Authorization | anonymous demo cannot call private APIs, A cannot read B parcel/post | DB + route tests pass |
| Community | category-specific validation, moderation/pending, removal/report permission | no publication bypass |
| UI regression | welcome/demo, four-step parcel, OSM filters/list, sharing, calendar, recovery | all M0–M5 suites still pass |
| Localization/accessibility | en/ary, RTL, keyboard focus, screen readers, 320/375 px, loading/live regions | no untranslated error or dropped input |
| Scientific integrity | missing source warning, no precise satellite claim, no fabricated score/crop/dates | user sees limitations |

Use actual backend test accounts/isolated staging only; never use real farmer phone numbers for integration fixtures. Browser E2E should run against built app and controlled service fixtures in **test environment**, clearly labelled test—not against arbitrary mocked science in production.

## 10. Feature check, docs and local merge (PowerShell)

```powershell
# F1 feature branch with actual approved code:
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Install failed.' }
npm run test -- --run tests/f1-transport.test.ts
if ($LASTEXITCODE -ne 0) { throw 'Transport test failed.' }
npm run lint; if ($LASTEXITCODE -ne 0) { throw 'Lint failed.' }
npm run typecheck; if ($LASTEXITCODE -ne 0) { throw 'TS failed.' }
npm run test; if ($LASTEXITCODE -ne 0) { throw 'Full tests failed.' }
npm run build; if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
# When configured and with approved ephemeral test accounts/services:
# npm run test:e2e
```

**Expected (not observed):** demo still functions as M5, authenticated save/CRUD works only for own records, M4 preview remains local unless explicitly published and moderated, rotation shows only actual science or unavailable, all EN/ary and browser tests pass, and no design token/route/audio/map regressions.

Update `docs/integration/F1-API.md` **with complete implemented source code**, generated-schema hash, field-by-field approved mapping, the actual file diffs, tests, known limitations and SHA; edit `docs/system-design.md` only to reflect new real integration boundaries. Every source line changed triggers guide review **in the same feature commit**. Keep historical M0–M5 guides as historical references, not rewritten proof.

Local integrate with `git merge --no-ff --no-commit feature/f1-api-integration` on current clean `main`; rerun full tested stack and browser suite before commit/push. On failure abort pending merge and fix branch; no force-push or Pull Request. Roll back the UI integration while leaving verified static/local demo paths functioning if an upstream API fails. **Do not roll back scientific model versions without corresponding contract/metadata review**.

**F1 Definition of done:** actual M5 source audited, approved OpenAPI and generated types synchronized, runtime parsers and explicit adapters tested, authenticated routes integrate without breaking local/demo, scientific UI only after G3, all model status and failure states test green, en/ary/RTL/keyboard/mobile acceptance observed, local merged-tree gates pass and remote SHA confirmed.
