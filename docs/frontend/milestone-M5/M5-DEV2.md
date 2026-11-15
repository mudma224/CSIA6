# flaht bladi — M5 Frontend Hardening & API Handoff — DEV2 execution guide

**Repository:** `mudma224/CSIA6` · **Target path:** `docs/frontend/milestone-M5/M5-DEV2.md`  
**Sole implementer:** DEV2 · **Working branch:** `feature/m5-dev2` · **Prepared:** 15 November 2026  
**Required baseline:** M0 → M1 → M2 → M3 → **M4** implemented, fully checked, integrated and verified on `origin/main`. **M5 is the last planned frontend milestone.** No Pull Requests.

> **Actual-code-first warning:** This guide is grounded in the supplied v1.2 requirements, `frontend-guide.md`, `instructions.md`, `system-design.md`, `documentation-strategy.md`, the proposed data-science contract, the design ZIP and the provided **M1–M4 execution guides**. The **live contents of `mudma224/CSIA6/main` were not inspected** while authoring this file. M4's code blocks establish the *expected* baseline, not proof of the real repository. **Read the real files and verify the M4 commit on remote `main` in §1 before copying code.** If there is any mismatch, reconcile the *entire affected code block, its tests, file operations, commands and expected results in this M5 guide* on `feature/m5-dev2`, then implement. The planned tests, browser runs, accessibility checks, CI status and build are **NOT claimed to have passed**.

## 0. Exact deliverable and guardrails

M5 **finishes and verifies the existing frontend**, rather than creating new agricultural/business capabilities:

1. **Workspace usability:** an always-discoverable language switcher, visible truthful demo status, robust mobile/desktop shell, skip-to-main keyboard navigation and consistent app routes. Preserve the existing M1 five-way sidebar/mobile nav and M0 locale preference; do not add a sixth tab.
2. **Explicit recovery UI:** translated, accessible 404 page and workspace rendering-error fallback with a user-triggered retry. Never show fabricated success, data or server status.
3. **Real-browser regression coverage:** Playwright Chromium end-to-end smoke tests against the **production build**: entry/demo → Home → Rotation → Parcel → unavailable recommendation, sourced Map + empty categories, community review/local post/copy-consent, calendar unavailable, locale/RTL, keyboard/mobile and an unknown route. Existing M0–M4 unit/component tests still run.
4. **Privacy, geographic and scientific truth:** verify no phone auth/OTP, backend requests, persisted parcel/posts, fake model results, fake irrigation boundaries, unverified map markers, made-up calendar dates or exposed private contact data. Ensure M3's source-checked list remains usable when OSM tiles cannot load; do not treat two dam markers as comprehensive Tadla coverage.
5. **Frontend-to-backend handoff:** a concise, exact inventory in §11 of UI data, in-memory state, form usability checks, route and unavailable/error states, map sources, consent/privacy boundaries, and **questions that remain open**. No API request/response JSON or canonical crop IDs are authored or inferred from the **unapproved** `TEAM_BRIEFING_DATA_CONTRACT.md`.
6. **Verified end state:** task-level and full tests, lint, typecheck, production build, actual mobile/desktop + both locales + keyboard/RTL manual acceptance, checked and documented before a local no-commit merge, retested on `main`, pushed and verified. Record actual evidence, not proposed totals.

**M5 does NOT implement**: auth, SMS/OTP, database/local parcel persistence, API routes, server actions, community publishing/moderation, agricultural models, crop mappings, scoring, yield/water estimates, recommendation comparison/results, satellite downloads, unapproved crop calendars, geocoding/GPS, additional unsourced POIs or polygons. `TEAM_BRIEFING_DATA_CONTRACT.md` is **a proposal**, not permission to implement a service. Data-science/backend integration starts only after a separate approval/handoff.

**Visual continuity:** retain M0/M1 `forest #193D2B`, `leaf #39794F`, `mint`, `sage`, `cream`, `canvas`, font families, spacing, radii and existing UI components. The design ZIP is a **visual reference, not a source of example screens, agricultural facts or fake map positions**. All actions must remain 44px or taller, readable at 320/375px and in Darija (`ary` RTL) and English (`en` LTR).

### Expected route behavior after M5

| Route | Actual UI role; M5 must preserve it |
|---|---|
| `/` | M1 bilingual welcome and approved-audio **text fallback**; choose language first |
| `/access` | M1 optional Moroccan phone **format preview** + independent demo entry, never OTP |
| `/home` | M4 final dashboard with truthful links to Rotation, Parcel, Map, Community, Calendar |
| `/rotation` | M2 **recommendation-unavailable** page with parcel-entry link, no results |
| `/parcels/new` | M2 4-step UI-only form, unknown choices, optional unverified coordinates, review/confirmation only |
| `/map` | M3 interactive OSM basemap, two sourced approximate dam features + accessible list, empty unsupported categories |
| `/community` | M4 user-entered, **page-session-only** posts with review/filter/remove; sharing requires explicit privacy confirmation before copying text |
| `/calendar` | M4 **unavailable** placeholder until actual vetted dates/region/crop exist |
| `/profile` | M1 screen-local display name and language preference; no real account or saved items |
| `/foundation-preview` | Untouched M0 internal controls/audio/component lab |
| Unknown URL | **M5 new** bilingual 404 guidance, no content mistaken for a real record |
| Workspace render failure | **M5 new** translated fallback + retry button; may not repair the underlying error |

## 1. Windows PowerShell preflight — prove M4 exists on `origin/main`

Open **VS Code → Terminal → PowerShell** inside the existing `CSIA6` working copy. Do not recreate the repo or overwrite newer files with older guide code. The M4 milestone must already have been integrated, with the real SHA and actual green checks verified. The commands below are **PowerShell, not Bash**. In particular, a path containing `(farmer)` must be passed with quotes and `-LiteralPath` when needed.

```powershell
$ErrorActionPreference = 'Stop'
$root = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or -not $root) { throw 'Open the actual CSIA6 Git working copy.' }
Set-Location $root
if (@(git status --porcelain).Count -ne 0) { throw 'Start from a clean worktree; commit/stash unrelated edits.' }
git remote -v # Verify origin really is mudma224/CSIA6 (STOP if not).
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify the remote main commit.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Cannot switch to main.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'main diverged; resolve it without force or reset.' }
$baseline = (git rev-parse HEAD).Trim()
$remote = (git rev-parse origin/main).Trim()
if ($baseline -ne $remote) { throw 'main does not match origin/main.' }
if (@(git status --porcelain).Count -ne 0) { throw 'Baseline worktree is not clean.' }
Write-Host "M5_BASELINE_SHA=$baseline"

$required = @(
  '.nvmrc','package.json','package-lock.json','README.md',
  '.github/workflows/frontend.yml','src/app/layout.tsx','src/app/globals.css',
  'src/i18n/LocaleProvider.tsx','src/i18n/messages.ts',
  'src/i18n/m2Messages.ts','src/i18n/m3Messages.ts','src/i18n/m4Messages.ts',
  'src/components/m1/LocaleSwitcher.tsx','src/components/navigation/AppFrame.tsx',
  'src/components/navigation/PrimaryNav.tsx','src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx','src/features/m1/HomeScreen.tsx',
  'src/features/m2/ParcelJourney.tsx','src/features/m2/RotationScreen.tsx',
  'src/features/m3/MapScreen.tsx','src/data/m3/verifiedPoints.ts',
  'src/features/m4/CommunityScreen.tsx','src/features/m4/CalendarScreen.tsx',
  'src/features/m4/communityDraft.ts','src/components/audio/AudioHelp.tsx',
  'src/app/(farmer)/(workspace)/layout.tsx',
  'src/app/(farmer)/(workspace)/community/page.tsx',
  'src/app/(farmer)/(workspace)/calendar/page.tsx',
  'docs/frontend/milestone-M4/M4-DEV2.md',
  'docs/frontend-guide.md','docs/instructions.md','docs/system-design.md',
  'docs/documentation-strategy.md','docs/01-cahier-des-charges.md',
  'tests/m4-community-draft.test.ts','tests/m4-community-screen.test.tsx',
  'tests/m4-calendar-home.test.tsx'
)
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Missing M4 baseline file: $path. Investigate real origin/main first."
  }
}
$tracked = @(git ls-tree -r --name-only origin/main -- 'docs/frontend/milestone-M4/M4-DEV2.md')
if ($tracked -notcontains 'docs/frontend/milestone-M4/M4-DEV2.md') {
  throw 'M4 guide is not tracked on remote main. Do not start M5.'
}
Get-Content .nvmrc
node -v
npm -v
Get-Content package.json
Get-Content src/i18n/LocaleProvider.tsx
Get-Content src/components/navigation/AppFrame.tsx
Get-Content src/components/navigation/PrimaryNav.tsx
Get-Content src/components/m1/LocaleSwitcher.tsx
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/layout.tsx'
Get-Content src/features/m4/CommunityScreen.tsx
Get-Content src/features/m2/ParcelJourney.tsx
Get-Content src/features/m3/MapScreen.tsx
Get-Content .github/workflows/frontend.yml
```

**Human baseline review, mandatory:** confirm that M4 really exists and works on `main`, and inspect its **actual** latest CI/check results; a guide file or SHA match alone is insufficient. Verify the existing `LocaleProvider` exports `useLocale` and changes HTML `lang`/`dir`; `LocaleSwitcher` uses it; `Button` accepts `type`, `variant` and `onClick`; `AppFrame` still has a five-link `PrimaryNav` and `main#main-content`; M2/M3/M4 use their per-milestone `useM2Text`, `useM3Text`, `useM4Text` and their existing local state. Check the real Next version, package scripts and test config. **If actual `main` differs from the code expected in this guide, stop copying; reconcile the complete M5 replacement blocks, tests and instructions before continuing.** Preserve proven fixes even when not in the older guide.

```powershell
# Baseline must pass before opening the new milestone.
npm ci
if ($LASTEXITCODE -ne 0) { throw 'M4 baseline npm ci failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'M4 baseline lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'M4 baseline typecheck failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'M4 baseline tests failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'M4 baseline production build failed.' }
if (@(git status --porcelain).Count -ne 0) {
  throw 'Build changed versioned files; inspect before creating M5 branch.'
}

git switch -c feature/m5-dev2
if ($LASTEXITCODE -ne 0) { throw 'M5 branch exists or creation failed. Inspect instead of deleting it.' }
if ((git branch --show-current).Trim() -ne 'feature/m5-dev2') { throw 'Wrong working branch.' }
Write-Host "M5 feature branch: verified M4 baseline $baseline"
```

**Do not proceed** if M4 did not actually pass or the branch is not based on that verified remote-main commit. M5 work occurs **only on `feature/m5-dev2`**, never directly on `main`.

## 2. Exact file operations and dependencies

| Path relative to repository root | Action | Why |
|---|---|---|
| `src/i18n/m5Messages.ts` | **CREATE** | Fully bilingual new shell/recovery copy with existing provider |
| `src/features/m5/RecoveryScreen.tsx` | **CREATE** | One accessible unavailable/error presentation; no server data |
| `src/components/navigation/AppFrame.tsx` | **REPLACE ENTIRE FILE**, after comparing actual source | Universal workspace locale switcher and accessible header/skip link; preserve mobile/desktop nav |
| `src/app/not-found.tsx` | **CREATE** | Bilingual fallback for unmatched URLs; independent locale provider |
| `src/app/(farmer)/(workspace)/error.tsx` | **CREATE** | Next.js client error boundary using existing workspace locale/layout |
| `tests/m5-shell-recovery.test.tsx` | **CREATE** | Locale/RTL/navigation/recovery unit-component tests |
| `tests/m5-boundary.test.ts` | **CREATE** | Explicit bilingual and frontend-only/source invariants |
| `playwright.config.ts` | **CREATE** | Production-server Chromium E2E test runner |
| `e2e/m5-journey.pw.ts` | **CREATE** | Full browser journeys and trustworthy unavailable states |
| `package.json` + `package-lock.json` | **UPDATE using npm**, not manual rewrites | `@playwright/test`, `test:e2e` script; keep lock synchronized |
| `.github/workflows/frontend.yml` | **REPLACE ENTIRE FILE** after real-baseline comparison | Add Chromium E2E checks after lint/type/test/build on pushes |
| `.gitignore` | **APPEND idempotently** | Ignore generated Playwright artifacts, not source/tests |
| `README.md` + `docs/system-design.md` | **TARGETED, idempotent documentation update** | New recovery/locale shell/testing architecture facts |
| `docs/frontend/milestone-M5/M5-DEV2.md` | **CREATE** | This guide and its evidence/handoff; synchronize with every M5 code change |

**Do not touch by default:** M0 audio code/manifest, M1 `PrimaryNav`, M2 form/validation, M3 verified dataset/Leaflet, M4 composer/calendar, M0 tokens/styles, previously integrated guides, `docs/frontend-guide.md`, `docs/instructions.md`, `docs/documentation-strategy.md`, `docs/01-cahier-des-charges.md`, and the proposed science contract. If an audit uncovers a real defect in one of these modules, **fix it on the M5 branch, add complete replacement source and corresponding tests to THIS M5 guide, rerun all checks and record the reason**; never claim that the untouched code was fixed or overwrite it with historical instructions.

### A. Install the only new testing dependency (PowerShell)

The app already has Next/React/TypeScript, Vitest, Testing Library, Tailwind/Lucide, and Leaflet from M0–M4. M5 adds **only the Playwright browser test runner** as a development dependency, not an app runtime package. On the **M5 feature branch**:

```powershell
npm install --save-dev @playwright/test
if ($LASTEXITCODE -ne 0) { throw 'Playwright install failed.' }

$package = Get-Content -Raw -Encoding utf8 package.json | ConvertFrom-Json
$existingE2E = $package.scripts.'test:e2e'
if (-not $existingE2E) {
  npm pkg set 'scripts.test:e2e=playwright test'
  if ($LASTEXITCODE -ne 0) { throw 'Could not register test:e2e.' }
} elseif ($existingE2E -ne 'playwright test') {
  throw "Existing test:e2e is '$existingE2E'. Reconcile real project scripts; do not overwrite blindly."
}
npx playwright install chromium
if ($LASTEXITCODE -ne 0) { throw 'Chromium installation failed.' }
# The new package/lockfile must agree; do NOT edit package-lock.json by hand.
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Package and lockfile are not reproducible.' }
npm pkg get scripts.test:e2e
git diff -- package.json package-lock.json
```

Expected `test:e2e` value: `playwright test`. The **actual resolved Playwright version is recorded by your committed `package-lock.json`**; do not hard-code an imagined version or run `npm update`. Browser binaries are installed locally and are **not** committed. The CI workflow below installs its own Chromium.

### B. Create directories and guard against accidental overwrites

```powershell
New-Item -ItemType Directory -Force 'src/features/m5' | Out-Null
New-Item -ItemType Directory -Force 'e2e' | Out-Null
New-Item -ItemType Directory -Force 'docs/frontend/milestone-M5' | Out-Null
$mustBeNew = @(
 'src/i18n/m5Messages.ts', 'src/features/m5/RecoveryScreen.tsx',
 'src/app/not-found.tsx', 'src/app/(farmer)/(workspace)/error.tsx',
 'tests/m5-shell-recovery.test.tsx', 'tests/m5-boundary.test.ts',
 'playwright.config.ts', 'e2e/m5-journey.pw.ts'
)
foreach ($path in $mustBeNew) {
  if (Test-Path -LiteralPath $path) { throw "CREATE target already exists: $path. Review it, don't overwrite." }
}
# Save this guide at docs/frontend/milestone-M5/M5-DEV2.md using VS Code.
# If a previous copy exists, compare and update it rather than deleting history.
code 'src/components/navigation/AppFrame.tsx'
code '.github/workflows/frontend.yml'
```

**File editing method:** for **CREATE**, VS Code → Explorer → New File, paste the entire corresponding TypeScript/TSX/YAML block below and save as UTF-8. For **REPLACE**, open the existing file, first compare it with the guide's expected M1/M4 version, then replace its **entire contents** with the block below (unless live `main` has evolved—then reconcile the whole guide block too). **Do not paste fenced Markdown markers into source files.** For **TARGETED** updates, use the rerunnable PowerShell commands in §9; never replace all shared docs with a generator.

## 3. CREATE `src/i18n/m5Messages.ts` — complete localization

M5 introduces no new locale store. The hook reads M0 `useLocale`; its `en` and `ary` dictionaries have identical keys. Have fluent Darija reviewers check wording before public presentation.

```typescript
import { useLocale } from "@/i18n/LocaleProvider";

export const m5Messages = {
  en: {
    notFoundTitle: "This page is not available",
    notFoundBody: "The address may be wrong or the page may have moved. No parcel or recommendation was loaded.",
    errorTitle: "This screen could not open",
    errorBody: "A display error occurred. You can try again or return to Home. This message is not a server or model result.",
    retry: "Try this screen again",
    home: "Return to Home",
    welcome: "Return to welcome",
    recoveryNote: "flaht bladi is currently a frontend demonstration. Saving, accounts and crop recommendations are not connected.",
  },
  ary: {
    notFoundTitle: "هاد الصفحة ما متوفراش",
    notFoundBody: "يمكن العنوان غلط ولا تبدلات الصفحة. ما تحملات لا أرض لا اقتراح زراعي.",
    errorTitle: "ما قدرناش نحلو هاد الشاشة",
    errorBody: "وقع مشكل فالعرض. تقدر تعاود المحاولة ولا ترجع للرئيسية. هادي ماشي نتيجة من الخادم ولا النموذج.",
    retry: "عاود جرّب هاد الشاشة",
    home: "رجع للرئيسية",
    welcome: "رجع للاستقبال",
    recoveryNote: "فلاحت بلادي دابا غير تجربة للواجهة. الحفظ والحسابات والاقتراحات الزراعية مازال ما مربوطينش.",
  },
} as const;

export type M5MessageKey = keyof typeof m5Messages.en;

export function useM5Text(): (key: M5MessageKey) => string {
  const { locale } = useLocale();
  return (key: M5MessageKey) => m5Messages[locale][key];
}
```

**Expected:** changing language through the existing provider updates all new headings, explanatory copy, buttons and `html[lang]`/`html[dir]`; no client persistence is added beyond M0's **language preference**.

## 4. CREATE `src/features/m5/RecoveryScreen.tsx` — complete reusable view

This is presentation only. It renders no exception message, stack, internal URL, private parcel information or fake data. Retry is available **only** when Next supplies a genuine error-boundary `reset` callback.

```tsx
"use client";

import { CircleAlert, House, RotateCcw } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useM5Text } from "@/i18n/m5Messages";

type Props =
  | { kind: "not-found"; onRetry?: never }
  | { kind: "error"; onRetry: () => void };

export function RecoveryScreen(props: Props) {
  const t = useM5Text();
  const missing = props.kind === "not-found";

  return (
    <Card className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden="true" className="mt-1 shrink-0 text-leaf" size={28} />
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            {missing ? t("notFoundTitle") : t("errorTitle")}
          </h1>
          <p className="text-base text-ink">
            {missing ? t("notFoundBody") : t("errorBody")}
          </p>
        </div>
      </div>
      <p className="rounded-[var(--radius-md)] bg-mint p-4 text-sm text-forest">
        {t("recoveryNote")}
      </p>
      <div className="flex flex-wrap gap-3">
        {!missing && (
          <Button type="button" onClick={props.onRetry}>
            <RotateCcw aria-hidden="true" size={18} /> {t("retry")}
          </Button>
        )}
        <ActionLink href="/home" variant="outline">
          <House aria-hidden="true" size={18} /> {t("home")}
        </ActionLink>
        <ActionLink href="/" variant="outline">{t("welcome")}</ActionLink>
      </div>
      <LocaleSwitcher />
    </Card>
  );
}
```

**Expected:** 404 contains Home and Welcome paths; render error has a retry callback, not a fake save/retry request; buttons and links remain keyboard reachable. `Card`, `Button` and `ActionLink` are **existing** components.

## 5. REPLACE `src/components/navigation/AppFrame.tsx` — entire source file

Replace the **whole M1 `AppFrame`** only after reconciling any working M2–M4 changes in real `main`. Add a small accessible top bar with `LocaleSwitcher` on **every workspace page** (including Home/Rotation where M1 did not show it). This may repeat a language control already present inside M2/M3/M4 screens; both controls use **the same M0 provider**, not separate stores, so no user-typed data is lost. Preserve the desktop sidebar, mobile bottom nav, brand link, scrollable workspace and 44px targets.

```tsx
"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";
import { PrimaryNav } from "./PrimaryNav";

export function AppFrame({ children }: { children: ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto min-h-dvh max-w-7xl md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-white focus:p-3 focus:font-bold focus:text-forest focus:outline-4"
      >
        {t("skipToContent")}
      </a>
      <aside className="hidden border-e border-[var(--border)] bg-cream px-4 py-7 md:block">
        <Link href="/home" className="mb-9 flex min-h-11 items-center gap-2 font-bold text-forest focus-visible:outline-4">
          <Sprout aria-hidden="true" /> flaht bladi
        </Link>
        <PrimaryNav />
      </aside>
      <div className="min-w-0 pb-24 md:pb-0">
        <header className="border-b border-[var(--border)] bg-cream px-4 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/home" className="inline-flex min-h-11 items-center gap-2 text-xl font-bold text-forest focus-visible:outline-4 md:hidden">
              <Sprout aria-hidden="true" /> flaht bladi
            </Link>
            <p className="min-w-0 text-sm font-semibold text-forest">{t("frontendDemoNote")}</p>
            <LocaleSwitcher />
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-4 py-7 focus:outline-4 focus:outline-offset-4 focus:outline-leaf sm:px-7 sm:py-10">
          {children}
        </main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-cream px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
        <PrimaryNav mobile />
      </div>
    </div>
  );
}
```

**Expected:** one `<main id="main-content">` per workspace page; the focused skip link bypasses header/sidebar navigation; the mobile bottom nav remains usable at 320px and with browser zoom. The top banner uses M1's *already-translated* `frontendDemoNote`, not an invented new claim. If a duplicate language switcher crowds a very narrow screen, **fix the layout carefully in the M5 branch**; update this full block and rerun responsive tests rather than deleting controls from other milestones without an audit.

## 6. CREATE two App Router fallbacks — complete page files

### `src/app/not-found.tsx` — CREATE

Next's root 404 is outside the M1 farmer route group, so **wrap just this page in the existing `LocaleProvider`**. Do not add a second global provider and do not change root metadata to claim dynamic data.

```tsx
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { RecoveryScreen } from "@/features/m5/RecoveryScreen";

export default function NotFoundPage() {
  return (
    <LocaleProvider>
      <main id="main-content" className="mx-auto min-h-dvh max-w-4xl px-4 py-10 sm:py-16">
        <RecoveryScreen kind="not-found" />
      </main>
    </LocaleProvider>
  );
}
```

### `src/app/(farmer)/(workspace)/error.tsx` — CREATE

Next.js requires `error.tsx` to be a **Client Component**. The workspace layout still supplies `AppFrame` and its parent farmer layout supplies `LocaleProvider`. **Do not** wrap another provider here. A Next `reset()` retries the current render; it does **not** retry an API call or promise persistence.

```tsx
"use client";

import { RecoveryScreen } from "@/features/m5/RecoveryScreen";

export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RecoveryScreen kind="error" onRetry={reset} />;
}
```

**Scope of this boundary:** workspace page render errors only. It does not catch every browser, navigation, tile-server, audio or external clipboard failure. M0 audio and M3 tile errors already have their own truthful text fallbacks; M4 handles clipboard denial. Do not introduce fake generalized global “success” states.

## 7. CREATE complete Vitest component and boundary tests

The M0–M4 test suite stays intact. **Do not delete or weaken existing tests** to make M5 pass. These are new, real test files using the existing Vitest + React Testing Library setup; they test the new code and its compatibility boundaries. The E2E `.pw.ts` test is deliberately named differently from `.test.ts`/`.spec.ts` so Vitest's default test discovery does not accidentally run Playwright tests.

### `tests/m5-shell-recovery.test.tsx` — CREATE

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { AppFrame } from "@/components/navigation/AppFrame";
import { RecoveryScreen } from "@/features/m5/RecoveryScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

vi.mock("next/navigation", () => ({ usePathname: () => "/home" }));

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

function wrap(content: ReactNode) {
  return render(<LocaleProvider>{content}</LocaleProvider>);
}

describe("M5 accessible workspace shell", () => {
  it("preserves five navigation targets on both viewport variants", () => {
    wrap(<AppFrame><h1>Workspace content</h1></AppFrame>);
    const navs = screen.getAllByRole("navigation", { name: "Main navigation" });
    expect(navs).toHaveLength(2);
    for (const nav of navs) {
      expect(nav.querySelectorAll("a")).toHaveLength(5);
      expect(nav.querySelector('a[href="/rotation"]')).not.toBeNull();
      expect(nav.querySelector('a[href="/map"]')).not.toBeNull();
      expect(nav.querySelector('a[href="/community"]')).not.toBeNull();
    }
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("provides keyboard-compatible skip link targeting its unique main", () => {
    wrap(<AppFrame><h1>Workspace content</h1></AppFrame>);
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveAttribute("href", "#main-content");
    expect(document.querySelectorAll("#main-content")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("exposes real demo disclaimer and an always-available language switcher", async () => {
    const user = userEvent.setup();
    wrap(<AppFrame><h1>Workspace content</h1></AppFrame>);
    expect(screen.getByText(/Frontend demonstration · no real account/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(document.documentElement).toHaveAttribute("lang", "ary");
    expect(screen.getAllByRole("link", { name: "الخريطة" })[0]).toHaveAttribute("href", "/map");
    expect(screen.getByRole("heading", { name: "Workspace content" })).toBeInTheDocument();
  });
});

describe("M5 honest recovery screens", () => {
  it("404 has translated guidance and no fake results or retry", () => {
    wrap(<RecoveryScreen kind="not-found" />);
    expect(screen.getByRole("heading", { name: "This page is not available" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Home" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "Return to welcome" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button", { name: "Try this screen again" })).not.toBeInTheDocument();
    expect(screen.getByText(/frontend demonstration/)).toBeInTheDocument();
  });

  it("render-error recovery invokes ONLY the provided reset callback", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    wrap(<RecoveryScreen kind="error" onRetry={reset} />);
    expect(screen.getByRole("heading", { name: "This screen could not open" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try this screen again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("404/recovery copy is bilingual and does not lose its actions", async () => {
    const user = userEvent.setup();
    wrap(<RecoveryScreen kind="not-found" />);
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("heading", { name: "هاد الصفحة ما متوفراش" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "رجع للرئيسية" })).toHaveAttribute("href", "/home");
  });
});
```

**Expected when the actual M4 baseline matches:** **6 new tests**, plus all retained M0–M4 tests. The DOM test is not a substitute for actual mobile/keyboard/visual auditing; see §10. If real `Button`, `LocaleProvider` or navigation semantics differ, fix the relevant implementation and update this **whole** test block, never silently skip tests.

### `tests/m5-boundary.test.ts` — CREATE

These are small, non-model **regression invariants** for the actual M2/M3/M4 modules. Their purpose is to catch accidentally imported fake data or changed semantics during M5. They **do not certify scientific validity or API readiness**.

```typescript
import { describe, expect, it } from "vitest";
import { m5Messages } from "@/i18n/m5Messages";
import { emptyParcelDraft, validateParcelStep } from "@/features/m2/parcelDraft";
import { verifiedMapPoints } from "@/data/m3/verifiedPoints";
import { emptyCommunityDraft, validateCommunityDraft } from "@/features/m4/communityDraft";

const isSourceUrl = (value: string) => /^https:\/\//.test(value);

describe("M5 frontend-only boundaries", () => {
  it("all new English strings have corresponding Darija strings", () => {
    expect(Object.keys(m5Messages.en).sort()).toEqual(Object.keys(m5Messages.ary).sort());
    for (const key of Object.keys(m5Messages.en) as Array<keyof typeof m5Messages.en>) {
      expect(m5Messages.en[key].length).toBeGreaterThan(2);
      expect(m5Messages.ary[key].length).toBeGreaterThan(2);
    }
  });

  it("M2 starts without invented parcel facts or precise location", () => {
    const parcel = emptyParcelDraft;
    expect(parcel.zone).toBe("");
    expect(parcel.irrigation).toBe("");
    expect(parcel.areaHa).toBe("");
    expect(parcel.latitude).toBe("");
    expect(parcel.longitude).toBe("");
    expect(parcel.locationChoice).toBe("none");
    expect(parcel.recentCrop).toBe("");
    expect(parcel.seasonChoice).toBe("");
  });

  it("M2 accepts an explicit unknown instead of guessing the irrigation zone", () => {
    const parcel = { ...emptyParcelDraft, zone: "unsure" as const };
    expect(validateParcelStep(parcel, 0)).toEqual({});
    expect(validateParcelStep({ ...parcel, areaHa: "-4" }, 0).areaHa).toBe("invalidArea");
  });

  it("M3 markers each keep source URLs and approximate feature meaning", () => {
    expect(verifiedMapPoints).toHaveLength(2);
    for (const point of verifiedMapPoints) {
      expect(point.category).toBe("water");
      expect(point.coordinateMeaning).toBe("approximate-mapped-feature");
      expect(isSourceUrl(point.coordinateSourceUrl)).toBe(true);
      expect(isSourceUrl(point.osmFeatureUrl)).toBe(true);
    }
  });

  it("M4 starts with a blank locally authored post, not a seeded public post", () => {
    const draft = emptyCommunityDraft();
    expect(draft.kind).toBe("");
    expect(draft.crop).toBe("");
    expect(draft.description).toBe("");
    expect(validateCommunityDraft(draft)).toEqual({ kind: "required" });
  });
});
```

**Expected:** **5 tests**. If M3 genuinely removes an unsourced dam during a later source recheck, the expected marker count must be updated **with matching data provenance, M3-related tests and guide changes**; never add a fake point simply to keep a test green.

### Task-specific Vitest gate (PowerShell)

```powershell
npm run test -- tests/m5-shell-recovery.test.tsx tests/m5-boundary.test.ts
if ($LASTEXITCODE -ne 0) { throw 'M5 unit/component tests failed; fix before continuing.' }
```

**Expected:** **11 M5 Vitest tests**, pending execution. `npm run test` must also continue to include M0–M4 tests with no regressions. The actual runner output is authoritative, not these planned counts.

## 8. CREATE Playwright real-browser smoke suite and CI workflow

These tests use a **built production app**, launched by Playwright as a **local** Node/Next process. That test server is only a frontend preview—not a backend/API implementation. Browser navigation is real; data remains local and page-session-only. External OSM tiles are deliberately blocked in the map test to prove its **list fallback**; do not benchmark the public OSM tile service. `.pw.ts` avoids Vitest's default matching rules.

### `playwright.config.ts` — CREATE (complete file)

```typescript
import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.pw\.ts/,
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
    env: { NEXT_TELEMETRY_DISABLED: "1" },
  },
});
```

**Important:** `npm run build` **must finish successfully before** `npm run test:e2e` because Playwright starts `next start`, not `next dev`. Port **3100** must be free. The web server exits with the test runner. Do not create an extra backend server for M5. If the current project's Next.js `start` script has custom flags, reconcile this full config and the test commands first.

### `e2e/m5-journey.pw.ts` — CREATE (complete browser tests)

These tests use only the English/Darija labels from the M1–M4 supplied code and **user-entered test text**. They do not invent a sample crop, seller, parcel geometry or model output. Each test has a new Playwright browser context, so the M0 locale preference does not leak between tests. Coordinate text in M2 is avoided altogether.

```typescript
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

function monitorAppApiWrites(page: Page): string[] {
  const writes: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname === "127.0.0.1" && url.pathname.startsWith("/api/") && request.method() !== "GET") {
      writes.push(`${request.method()} ${url.pathname}`);
    }
  });
  return writes;
}

async function openEnglish(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // Every M5 workspace page has the shared locale control.
  await page.locator("[role=group] button").first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
}

test("welcome → optional phone/demo entry → Home → Rotation", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("link", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/access$/);
  await expect(page.getByText(/no SMS verification, account creation or authentication/i)).toBeVisible();
  await page.getByRole("link", { name: "Enter demo" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText(/Frontend demonstration · no real account/)).toBeVisible();
  await page.getByRole("link", { name: "See recommendation status" }).click();
  await expect(page).toHaveURL(/\/rotation$/);
  await expect(page.getByText(/Crop recommendations are unavailable/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Describe a parcel" })).toBeVisible();
});

test("four-step parcel UI validates, preserves draft across languages, and confirms locally", async ({ page }) => {
  const appApiWrites = monitorAppApiWrites(page);
  await openEnglish(page, "/parcels/new");
  await expect(page.getByRole("heading", { name: "Tell us about your parcel" })).toBeVisible();
  await page.getByRole("textbox", { name: "Parcel name (optional)" }).fill("My temporary field");
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText(/Choose your irrigation zone/)).toBeVisible();
  await page.getByRole("radio", { name: "Béni Amir" }).check();
  await page.getByRole("button", { name: "Darija" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ary");
  await page.locator("[role=group] button").first().click();
  await expect(page.getByRole("textbox", { name: "Parcel name (optional)" })).toHaveValue("My temporary field");
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("radio", { name: "Drip irrigation" }).check();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("radio", { name: "I don't know yet" }).check();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText("My temporary field")).toBeVisible();
  await expect(page.getByText(/Crop recommendations are unavailable/)).toBeVisible();
  await page.getByRole("button", { name: "Confirm local review" }).click();
  await expect(page.getByRole("heading", { name: "Local review confirmed" })).toBeVisible();
  await expect(page.getByText(/No parcel was saved/)).toBeVisible();
  expect(appApiWrites).toEqual([]);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("textbox", { name: "Parcel name (optional)" })).toHaveValue("");
});

test("Tadla map keeps a sourced list and honest empty category without network tiles", async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
  await openEnglish(page, "/map");
  await expect(page.getByRole("heading", { name: "Explore the Tadla area" })).toBeVisible();
  await expect(page.getByText(/Bin El Ouidane/).first()).toBeVisible();
  await expect(page.getByText(/Ahmed El Hansali/).first()).toBeVisible();
  await expect(page.getByText(/OpenStreetMap contributors/).first()).toBeVisible();
  await page.getByRole("button", { name: /Wholesale markets/ }).click();
  await expect(page.getByText(/No individually checked locations are available in this category/)).toBeVisible();
});

test("community review → local preview → explicit share consent → refresh empty", async ({ page, context }) => {
  const appApiWrites = monitorAppApiWrites(page);
  await openEnglish(page, "/community");
  await expect(page.getByText("No local preview posts yet")).toBeVisible();
  await page.getByRole("radio", { name: "Experience" }).check();
  await page.getByRole("textbox", { name: "Experience title (required)" }).fill("A local test note");
  await page.getByRole("textbox", { name: "Description (required)" }).fill("A sentence I entered for the preview");
  await page.getByRole("button", { name: "Review local preview" }).click();
  await expect(page.getByRole("heading", { name: "Review before adding" })).toBeVisible();
  await page.getByRole("button", { name: "Add to local preview" }).click();
  await expect(page.getByText("A local test note")).toBeVisible();
  await page.getByRole("button", { name: "Review text to copy" }).click();
  await page.getByRole("button", { name: "Copy reviewed text" }).click();
  await expect(page.getByText(/Confirm after reviewing the text/)).toBeVisible();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("checkbox", { name: /I checked the text and confirm/ }).check();
  await page.getByRole("button", { name: "Copy reviewed text" }).click();
  await expect(page.getByText(/Text copied\. You decide where/)).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("A local test note");
  expect(appApiWrites).toEqual([]);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("No local preview posts yet")).toBeVisible();
  await expect(page.getByText("A local test note")).toHaveCount(0);
});

test("unavailable calendar contains no invented crop dates", async ({ page }) => {
  await openEnglish(page, "/calendar");
  await expect(page.getByRole("heading", { name: "Crop calendar unavailable" })).toBeVisible();
  await expect(page.getByText(/no approved crop/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/home");
});

test("an unknown URL shows a bilingual 404 and useful navigation", async ({ page }) => {
  await page.goto("/m5-unknown-route-example", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "This page is not available" })).toBeVisible();
  await page.getByRole("button", { name: "Darija" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "رجع للرئيسية" })).toHaveAttribute("href", "/home");
});

test("mobile skip link and English/Darija navigation stay keyboard operable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.keyboard.press("Tab");
  await expect(page.locator('a[href="#main-content"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await page.getByRole("button", { name: "Darija" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ary");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await page.locator("[role=group] button").first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("navigation", { name: "Main navigation" }).last()
    .getByRole("link", { name: "Map" }).click();
  await expect(page).toHaveURL(/\/map$/);
});
```

**Planned browser tests: 7.** Real-world Playwright/Next behavior is the source of truth. For a transient OSM tile failure, **the source list and empty-state test must still pass**. If a selector in real M4 differs, change the *smallest accurate locator* **and the complete guide code block together**; do not remove coverage. Playwright is not testing scientific accuracy, real backend saving or a public farmer account.

### `.github/workflows/frontend.yml` — REPLACE ENTIRE FILE, after checking actual M4 workflow

This builds on M1's no-PR **push-triggered** `checks` job and adds Chromium smoke tests. GitHub Actions uses Ubuntu; the `run:` commands in the YAML are CI commands **not** a Windows-terminal script. The repository stays free of PR requirements. Do not add fake secrets, external API keys, or a production backend test server.

```yaml
name: Frontend checks

on:
  push:
    branches:
      - main
      - "feature/**"
  workflow_dispatch:

jobs:
  checks:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - name: Install locked dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: TypeScript
        run: npm run typecheck
      - name: Unit/component tests
        run: npm run test
      - name: Production build
        run: npm run build
      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium
      - name: Browser E2E on production app
        run: npm run test:e2e
        env:
          CI: "true"
      - name: Upload Playwright failure evidence
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
          if-no-files-found: ignore
          retention-days: 7
```

**Expected:** the same `checks` job runs on pushes to `main` and `feature/**`, and now includes 7 browser-smoke tests as well as the original lint/type/unit/build gates. If GitHub has extra M4 workflow jobs or steps, reconcile the **entire YAML block** instead of dropping them. Do not call the workflow green before its actual run finishes.

### Execute the real-browser gate (PowerShell)

```powershell
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Production build must pass before E2E.' }
npm run test:e2e
if ($LASTEXITCODE -ne 0) { throw 'Real Chromium journeys failed; inspect playwright-report and traces.' }
```

**Important:** On Windows, local Playwright's `--with-deps` is **not** required. If Chromium was not installed successfully, rerun `npx playwright install chromium`, then the E2E command. If port 3100 is already occupied, close the application using it before testing; do not configure Playwright to reuse an unrelated process. On GitHub Actions, the workflow installs required Ubuntu browser dependencies.

## 9. Precise, safe-to-rerun documentation/artifact-ignore synchronization

**Do NOT regenerate the five shared documents.** They have different responsibilities. M5 changes implemented shell/recovery routes and test infrastructure; therefore **only** `README.md` and `docs/system-design.md` need small factual additions, plus the M5 execution guide itself. The roadmap and owners did not change, so leave `docs/frontend-guide.md` alone. No development rules changed, so do not modify `docs/instructions.md`. No documentation workflow changed, so leave `docs/documentation-strategy.md` alone. Product requirements and unapproved scientific/API scope did not change, so leave `docs/01-cahier-des-charges.md` and `docs/reference/TEAM_BRIEFING_DATA_CONTRACT.md` untouched.

Run this **entire PowerShell block from repository root on `feature/m5-dev2`** after adding the source and tests. It checks exact section headings, safely skips previously applied updates, and refuses to create duplicate M5 sections. **It does not erase any existing content or silently rewrite outdated unrelated paragraphs.** Review resulting diffs before commit.

````powershell
if ((git branch --show-current).Trim() -ne 'feature/m5-dev2') {
  throw 'Documentation updates are only permitted on M5 feature branch.'
}
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# .gitignore — append Playwright output directories, once each.
$ignorePath = '.gitignore'
if (Test-Path -LiteralPath $ignorePath) {
  $ignoreText = [System.IO.File]::ReadAllText((Resolve-Path $ignorePath), $utf8NoBom)
} else {
  $ignoreText = ''
}
foreach ($line in @('/playwright-report/', '/test-results/')) {
  if (($ignoreText -split "`r?`n") -notcontains $line) {
    if ($ignoreText.Length -gt 0 -and -not $ignoreText.EndsWith("`n")) {
      $ignoreText += "`r`n"
    }
    $ignoreText += "$line`r`n"
  }
}
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $ignorePath), $ignoreText, $utf8NoBom)

# README — add one M5 test/use note; do not replace old route inventories.
$readmePath = 'README.md'
if (-not (Test-Path -LiteralPath $readmePath)) { throw 'README missing.' }
$readme = [System.IO.File]::ReadAllText((Resolve-Path $readmePath), $utf8NoBom)
$readmeMarker = '## M5 frontend verification (no backend)'
$readmeBlock = @'
## M5 frontend verification (no backend)

M0–M5 are a **frontend-only demonstration** after successful M5 integration.
The workspace has an always-available `en`/`ary` switcher and bilingual recovery
pages. Parcel forms and community posts remain page-local; there are no saved
accounts, real OTP, public posts or crop recommendations. The calendar is
unavailable pending reviewed agricultural data. The sourced Tadla map remains
limited to its documented verified points; OSM tiles require network access.

From the repository root, using the committed Node version and lockfile:

```powershell
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

The E2E runner launches `next start` locally on port 3100 against the **built**
frontend. Its browser tests check M0–M4 journeys, mobile/RTL, unavailable states
and user-controlled copy consent. It is **not** an API/model test. See
`docs/frontend/milestone-M5/M5-DEV2.md` for the full verification and handoff.
'@
if (-not $readme.Contains($readmeMarker)) {
  $readme = $readme.TrimEnd() + "`r`n`r`n" + $readmeBlock.TrimEnd() + "`r`n"
  [System.IO.File]::WriteAllText((Resolve-Path $readmePath), $readme, $utf8NoBom)
} else { Write-Host 'README: M5 section already exists; skipped.' }

# Architecture — capture only M5 actual routes/components and seams.
$designPath = 'docs/system-design.md'
if (-not (Test-Path -LiteralPath $designPath)) { throw 'docs/system-design.md missing.' }
$design = [System.IO.File]::ReadAllText((Resolve-Path $designPath), $utf8NoBom)
$designMarker = '## M5 frontend hardening and handoff — implemented boundary'
$designBlock = @'
## M5 frontend hardening and handoff — implemented boundary

- **Shell:** `src/components/navigation/AppFrame.tsx` keeps M1's five-route
  responsive navigation, adds a persistent workspace `LocaleSwitcher` using the
  existing M0 provider, displays demo-only status and supports skip-to-main.
- **Recovery:** `src/app/not-found.tsx` is the bilingual public 404 view using a
  page-local locale provider. `src/app/(farmer)/(workspace)/error.tsx` is the
  workspace render-error boundary with a user-requested `reset` retry.
  Neither endpoint is a business API or a new storage layer.
- **Testing:** `tests/m5-*.test.*` run in Vitest. `e2e/*.pw.ts` run in Playwright
  Chromium against locally started **production-built** Next (`test:e2e`),
  after lint/typecheck/unit tests/build. CI checks on `main` and `feature/**`.
- **Data boundary:** M2 parcel and M4 community states are React page-memory
  only; M0 locale choice alone may persist in browser preference storage. M3
  static sourced dam points remain approximate and do not populate a parcel.
  M0 audio manifests and unavailable/no-data states remain truthful. M2, M3,
  M4 scientific, map and community validation remains presentation-only.
- **Backend/model handoff:** Exact user actions, display fields, availability,
  provenance, privacy and integration questions are in
  `docs/frontend/milestone-M5/M5-DEV2.md` §11; no recommendation/API schemas
  are approved or implemented by M5.
'@
if (-not $design.Contains($designMarker)) {
  $design = $design.TrimEnd() + "`r`n`r`n" + $designBlock.TrimEnd() + "`r`n"
  [System.IO.File]::WriteAllText((Resolve-Path $designPath), $design, $utf8NoBom)
} else { Write-Host 'Architecture: M5 section already exists; skipped.' }

git diff -- .gitignore README.md docs/system-design.md
````

**Expected after first run:** `.gitignore` contains the two Playwright ignore entries once; `README.md` has one new short M5 verification section; `docs/system-design.md` has one accurately scoped M5 architecture section. **Second run:** neither document gets another section. The `.gitignore` script preserves existing contents; its output is versioned. If M4 already added a similar exact heading, **inspect and reconcile** rather than silently duplicate it.

**Guide parity rule (continuous):** every change to `src/`, `tests/`, `e2e/`, workflow YAML, Playwright config, npm scripts, styling, `.gitignore`, or the documentation script requires checking the matching complete block/path/command in **this M5 guide in the same feature-branch commit**. Update it when different, rerun relevant tests, and review the diff. If the code remains exactly as described, log `Guide reviewed: still accurate`. The M0–M4 guides are historical instructions and should not be rewritten to pretend M5 code existed earlier.

## 10. Verification gates, manual acceptance, troubleshooting

### A. Automated gate — required in this order on `feature/m5-dev2`

Run in **PowerShell**, repository root, after implementing all source/test/doc changes. Failures must be fixed **before** commit/merge. Check output; simply launching a command is not a PASS.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m5-dev2') { throw 'Wrong branch.' }
node -v
npm ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }

npm run test -- tests/m5-shell-recovery.test.tsx tests/m5-boundary.test.ts
if ($LASTEXITCODE -ne 0) { throw 'M5 targeted Vitest tests failed.' }

npm run lint
if ($LASTEXITCODE -ne 0) { throw 'ESLint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'TypeScript failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Full Vitest suite failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Next production build failed.' }
npx playwright install chromium
if ($LASTEXITCODE -ne 0) { throw 'Chromium unavailable.' }
npm run test:e2e
if ($LASTEXITCODE -ne 0) { throw 'Playwright E2E failed.' }

git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace errors found.' }
git status --short
```

| Check | **Planned/expected** outcome, not a claimed observed result |
|---|---|
| `npm ci` | Restores dependency versions from committed package-lock with Playwright present |
| Targeted M5 Vitest | **11** tests: 6 shell/recovery + 5 boundary, if actual M4 interfaces match |
| `npm run lint` | Exit 0, no errors in M5 and existing modules |
| `npm run typecheck` | Exit 0, including Next page types, Playwright TS, all prior M0–M4 code |
| `npm run test` | All previous M0–M4 Vitest suites plus **11** M5 tests pass; actual runner count is authoritative |
| `npm run build` | Exit 0; all existing routes + root 404 + workspace error boundary compile |
| `npm run test:e2e` | **7** browser tests pass using Chromium and production `next start` on port 3100 |
| CI on pushed feature/main | `checks` workflow validates identical stages, including browser install/smoke; verify real execution status |

**Environment gate:** the project pins Node in `.nvmrc` (M0 expected `22.22.2`); confirm your active `node -v` actually matches that file. Do not upgrade Node or Next because M5 has a testing task. `npm install -D @playwright/test` is the only planned new package; its resolved version and lockfile changes are part of the feature commit.

### B. Required manual acceptance (record PASS / FAIL / NOT VERIFIED, with browser/date)

Open a real browser, run `npm run dev` for interactive manual checks or inspect the built preview (`npm run start`) after a production build. Do not confuse a dev-server UI with production-build success. Test a fresh tab/incognito plus a tab with previously stored locale. **Manually verify at least:** 320×720, 375×812, 768×1024 and 1280×800 CSS px; English and Arabic-script Darija; keyboard-only; visible focus; reduced-motion preference. If a device/screen reader is not available, record `NOT VERIFIED` instead of PASS.

| ID | Exact manual action | What constitutes PASS |
|---|---|---|
| M5-A01 | Fresh visit `/` → English/Darija → `/access` → enter demo → `/home` | No authentication/OTP is implied, language continues, welcome/audio text fallback honest |
| M5-A02 | `/home`: try all five nav targets; also open Parcel and Calendar cards | All links resolve; sidebar on desktop, five-tap-target bottom bar on mobile; active state correct |
| M5-A03 | Keyboard from `/home`: press `Tab` then `Enter` on Skip link; traverse nav and language controls | Focus visible, skip targets `#main-content`, buttons and links usable without pointer; no focus trap |
| M5-A04 | `/parcels/new`: leave zone blank, enter `0` area, select unknown instead; step forward/back | Plain-language errors; explicit unknown accepted; no coordinates guessed or submitted |
| M5-A05 | Type a parcel name, switch `en`→`ary`→`en`, go through all 4 steps, confirm review | Draft survives step and locale changes; `html lang/dir` correct; confirmation states no save or recommendation; refresh clears draft |
| M5-A06 | `/rotation` from Home and Parcel | Only unavailable description + parcel link; **no crop result, score, comparison, yield or water-saving claim** |
| M5-A07 | `/map` online: pan, zoom, select each sourced dam; inspect source links and text | Real OSM tiles if allowed, visible attribution, source/approximation/date; two documented markers only; map pin does **not** set parcel location |
| M5-A08 | `/map` with browser network throttled/offline or OSM tiles blocked | Meaningful map-tile unavailable feedback and **still-useful accessible source list**; not blank/error-only |
| M5-A09 | Map filters Markets/Suppliers | Both give truthful **empty** states, no fictional markers, businesses, live dam levels or irrigation boundaries |
| M5-A10 | `/community` initial feed; create an Experience and Sale; filter and remove a preview | Starts empty; only user-authored entries appear; review before adding; removal is **local**, not public deletion |
| M5-A11 | While editing Community, switch locale; start copy preview, click Copy without consent, then grant consent | Typed text remains; no copy before consent; no auto posting; clipboard denial shows manual-copy fallback; user decides whether/where to share |
| M5-A12 | Refresh/leave `/community`; enter a draft on Parcel then refresh | Posts and parcel draft do **not** persist; no claim of saved user content. M0 locale preference alone can persist |
| M5-A13 | `/calendar` in both languages | Explicit unavailable calendar; **no invented sowing/harvest windows or crop list** |
| M5-A14 | `/profile` enter name, toggle language; navigate away/reload | Screen-local draft survives locale toggle but no authenticated profile/saved parcels claimed |
| M5-A15 | `/foundation-preview` with empty audio manifest; trigger available controls | M0 page still loads; readable audio transcript and missing-recording fallback; no fake MP3/autoplay |
| M5-A16 | Open `/m5-does-not-exist` and force a controlled **development-only** render exception if safely possible | 404 translated and navigable; error boundary explains failure with retry; no raw stack or private details in user-facing copy |
| M5-A17 | 320px/375px/desktop, both `dir` modes and 200% browser zoom | No sideways scroll/overlap, all text readable, bottom bar not covering primary actions, tap targets ≥44px |
| M5-A18 | Inspect DevTools Console/Network across workflows | No unexpected app domain POST/API calls, auth token, model result, fake satellite data or stored parcel/post; OSM tiles are external visual tiles only |
| M5-A19 | Turn on OS reduced motion and use browser NVDA/VoiceOver if available | UI remains operable, headings/fieldsets/error messages read meaningfully; note any unavailable assistive tech honestly |

**Contrast/accessibility review:** Inspect low-contrast `text-muted`, placeholder/error text, decorative-only icons, focus rings and RTL alignment with browser tools. Do **not** assume passing unit tests alone proves WCAG conformance. If a contrast, label, landmark, keyboard or focus issue is found, fix it on the M5 branch and include the **complete changed file and its test in this guide**. If adding any package such as axe is justified later, document its exact npm dependency, lockfile, commands and CI integration **before** making that change; none is required by this baseline.

**Recovery test safety:** do not commit a throw-in-render sample route or a purposely broken component into `main`. An ad-hoc local-only test of the error boundary may be performed on the M5 branch and then removed, with a clean diff; the RecoveryScreen unit test verifies `reset` callback behavior without injecting production failures.

### C. Troubleshooting — do not bypass failed gates

| Observed problem | Likely cause and exact corrective action |
|---|---|
| Required M4 file missing or newer implementation differs | Stop; inspect `origin/main` and M4 completion record. Update matching **whole** source/test blocks in this guide before implementing |
| `AppFrame` causes `useLocale must be within provider` | Check M1 `src/app/(farmer)/layout.tsx` still wraps workspace routes in the existing `LocaleProvider` and do not place AppFrame outside it |
| Duplicate `/` / 404 or route group build error | Confirm only `src/app/not-found.tsx` was created; do not create an extra `src/app/page.tsx` (M1 owns `/` in a route group) |
| Next `error.tsx` needs a client boundary | Keep `"use client"` at top; pass only `reset` to `RecoveryScreen`; don't introduce server actions |
| HTML `dir` changes but a field resets | Do not key providers/pages by locale; inspect M0 provider + child state; retain controlled inputs, don't remount the wizard/community on switch |
| `getByRole` E2E selector fails | Inspect accessible name in **real** M4 with Playwright trace; use stable semantic labels, then update test + guide together; never delete the test |
| Playwright tests unexpectedly run in Vitest | Keep browser file named `e2e/m5-journey.pw.ts`; do not use `.test.ts`/`.spec.ts` for browser tests; inspect `vitest.config.mts` include/exclude |
| Browser executable missing | `npx playwright install chromium`; for GitHub Actions use `npx playwright install --with-deps chromium` as in workflow |
| `next start` says no production build | Run `npm run build` first; `npm run test:e2e` starts port 3100 automatically |
| Port 3100 in use | Close the conflicting process; keep Playwright `reuseExistingServer: false` to avoid accidentally testing another app |
| Tile-related map E2E is flaky | Block only the OSM tile URL in that test; assert source list and empty filter, not tile pixel/image success; verify attribution manually online |
| Clipboard permission denied in Playwright | Use the test's Chromium `context.grantPermissions` call; if denied, confirm M4's manual-copy fallback and record the real limitation. Don't disable consent protection |
| 404 text wrong language after a refresh | Confirm M0 persisted preference and `LocaleProvider` hydration; do not use a second custom locale system |
| GitHub CI fails but local passes | Examine exact runner logs and build/browser versions from locked deps; fix workflow or code on the branch, then rerun; never mark CI green speculatively |
| `npm ci` reports lock mismatch | Re-run documented `npm install -D @playwright/test` / `npm pkg set` **on M5 feature branch**, commit both package files, verify with `npm ci` |
| `main` moved during development or remote push rejected | Fetch/update local `main` without force, resolve tested integration conflicts, rerun the entire merged-tree suite; respect repository rules |

**Security/source-truth audit before commit:** inspect `git diff` and `git status` for any generated `.env`, credentials, private data, invented API/crop contracts, copied ZIP example pages, fake geodata or mock results. The `.gitignore` addition excludes Playwright outputs only; do not stage traces/screenshots containing user information. Do not seed `localStorage` with farm data; keep M2/M4 draft state in component memory and only M0 locale preference persistent.

## 11. Concrete M5 frontend → future backend/data-science handoff

This section is the **handoff deliverable**, kept inside the one M5 guide (no extra generated Markdown output). It reports only **the prior guides' described UI** until the real checkout and M5 tests confirm it. On the actual M5 feature branch, reconcile each item against the implemented files and add any tested corrections here. The future backend and scientist owners must **approve their own contracts later**; these are not API definitions.

### UI and temporary-state inventory

| Frontend surface (owner) | Inputs/displays and ownership today | Local state, validation and honest empty/error | Required later capability — **NOT built here** |
|---|---|---|---|
| M0 language/audio | `en`/`ary`, `LocaleProvider`, reviewed-clip manifest with text transcripts | Locale preference in M0 browser setting; missing audio → written help; never autoplay | Reviewed files/translations and permission metadata if recorded audio is added |
| M1 welcome/access | Language before entry; optional Moroccan phone-format input; separate demo link | Format-only `checkMoroccanPhoneFormat`, no phone verification or stored number | Secure OTP provider, account/session, sensitive data protections and authorization |
| M1 Home/Profile | Navigation to working frontend routes; display-name draft/empty saved-items UI | Home no live data; profile name in screen memory; no real saved items | Authenticated profile and authorized saved user records |
| M2 Parcel | Optional label/area (ha); explicit zone (Béni Amir/Moussa/Other/Unsure); irrigation (drip/surface/other/unknown), optional user-typed lat/lon, optional free-text crop history/season, planned-season label or unknown | Four steps; positive-number and coordinate-range *input formatting only*; unknown accepted; review/confirm stays on page; no parcel ID, server submission, crop IDs or coordinates inferred; refresh clears | Reviewed field meanings, required/optional rules, server validation, consentful location processing, actual parcel CRUD/ownership; model mapping only after approval |
| M2 Rotation | Unavailable description; parcel-form navigation | No baseline/alternative/score/evidence card or model call | Approved scientific contract, meanings and sourced model outputs plus explicit no-result/unavailable/error handling |
| M3 Map | Leaflet+OSM basemap; two approximate, source-checked dam points; filters; accessible source list/detail/directions link | Published study rectangle is a **camera reference, not a polygon**; Markets/Suppliers lists empty; tile failure retains list; no plot or GPS selection tied to parcel | Verified feature inventory/licensing, provenance, uncertainty, operational statuses and authorized geographic APIs if approved |
| M4 Community | Session-only Experience, Harvest-for-sale and Partnership previews; filter/remove; review-before-add; user-reviewed clipboard text | Form-required fields/positive-format checks; no real users or sample public posts; local list resets on page exit/refresh; clipboard copy requires **fresh** affirmative privacy confirmation | Actual identity/ownership, moderation/reporting, consent, PII policy, posting/storage, access controls and safe public sharing |
| M4 Calendar | Unavailable page, Home navigation | **No approved crop/date/calendar data** | Vetted crop-specific regional stages/windows with source, date, unit/reviewer, validity and localization |
| M5 Recovery | Bilingual 404 and workspace render-error fallback | Text only; retry invokes Next reset; no guessed data or authenticated error status | Backend-specific error/empty/loading contracts only after integration is approved |
| M5 Browser test harness | Production-built Next app + Chromium journey tests | No server API under test; sourced map list works without OSM tiles | Separate, approved backend integration/security/model tests after the future service exists |

### M3 geographic provenance to preserve, not re-infer

M3's **source-checked** data originally included two approximate mapped-feature locations: Bin El Ouidane Dam (mapped OSM way `504108035`) and Ahmed El Hansali Dam (mapped OSM way `385347001`), plus a **published Tadla study-area reference extent** for map orientation. The original marker coordinate/source/verification-date details and source links live in `src/data/m3/verifiedPoints.ts` and the historical **M3 guide**; those locations are **not surveyed entrances**, official parcel limits, or a claim of irrigation-service coverage. The implementation handoff must include each record's coordinate meaning, source URL, review date, precision caveat and license/attribution status. If the real repository has changed or either source can no longer be verified, correct the actual M3 data and corresponding M5 regression expectations **rather than reintroduce a stale position**. The public OSM tile service is best effort and subject to usage requirements.

### Decisions the backend/data scientist must resolve before any implementation

1. **Parcel schema/consent:** which display fields are approved, what is required for requesting results versus optional, valid area/units and coordinate consent, how to represent `unknown`, and which UI-only fields are *not* serialized (e.g. hidden manual coordinate drafts). Do not convert M2 `ParcelDraft` to an API request by renaming it.
2. **Crop and seasons:** reviewed canonical vocabulary/IDs, labels in Darija and English, which historical seasons are supported, whether the engine produces a next crop versus a multi-season strategy, and how user free text is validated/mapped. The v0.1 proposal alone is insufficient.
3. **Recommendation outputs:** finalized status/error meanings, baseline vs alternatives, explanation/rule/data provenance, scores' scientific interpretation, missing-input semantics, uncertainty, non-suitable and service-unavailable handling. **Do not create fabricated comparison fixtures during M5.**
4. **Accounts/parcels/posts:** real authentication provider, SMS configuration, identity/session/authorization, server-side validation, save/reopen, privacy/retention/deletion, moderation/reporting and any truly public shareable links. No UI-only check provides security.
5. **Map/calendar governance:** authorized point/polygon data, official geographic scope, review date, georeferencing confidence, attribution and legal tile usage; agronomist-reviewed calendar windows for a specified crop/region/season. “No data” remains the correct state until approval.
6. **Review/versions:** approve and version the exact model contract and fixtures with scientific reviewer and backend owner *before* writing adapters or routes; specify deployment/availability expectations and the real integration test plan separately from this frontend-only guide.

**Handoff acceptance:** after M5 integration, record the actual `origin/main` SHA, the successful CI run, code/guide parity, manual acceptance results/limitations, and these open decisions. Share `docs/frontend/milestone-M5/M5-DEV2.md` and the real repository commit with the backend/data-science contributors; **do not imply that pending approvals have occurred**.

## 12. Commit verified M5 feature work — no Pull Request

**Gate:** targeted tests, full suite, lint, TS, build, browser E2E and required manual checks must be completed and recorded; no blocking FAIL and no false PASS. The guide must exactly match any changed code. **Do not** commit screenshots, Playwright reports, `.env` files, real phone or field-location data.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m5-dev2') { throw 'Wrong branch.' }
git status --short
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Diff whitespace errors.' }

# Stage only authorized M5 source, tests, config, docs and lockfile.
git add -- 'src/i18n/m5Messages.ts' 'src/features/m5/RecoveryScreen.tsx' `
  'src/components/navigation/AppFrame.tsx' 'src/app/not-found.tsx' `
  'src/app/(farmer)/(workspace)/error.tsx' `
  'tests/m5-shell-recovery.test.tsx' 'tests/m5-boundary.test.ts' `
  'playwright.config.ts' 'e2e/m5-journey.pw.ts' `
  'package.json' 'package-lock.json' '.github/workflows/frontend.yml' `
  '.gitignore' 'README.md' 'docs/system-design.md' `
  'docs/frontend/milestone-M5/M5-DEV2.md'
if ($LASTEXITCODE -ne 0) { throw 'Staging failed; inspect paths.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Staged whitespace errors.' }
git diff --cached --stat
git diff --cached --name-only
# Confirm no unrelated generated artifacts, model/API, M0–M4 docs or secret files staged.

# Only when all gates and guide parity are independently verified:
git commit -m 'feat(m5): harden frontend UX, browser tests and integration handoff'
if ($LASTEXITCODE -ne 0) { throw 'Feature commit failed.' }
if (@(git status --porcelain).Count -ne 0) { throw 'Worktree is not clean after commit.' }
$featureSha = (git rev-parse HEAD).Trim()
Write-Host "M5_FEATURE_SHA=$featureSha"

# OPTIONAL: remote backup + feature-branch push CI (NO PR):
# git push -u origin feature/m5-dev2
# Check the real CI result if you choose to push the feature branch.
```

If actual bug fixes required changing M0–M4 files or adding tests, stage those **explicit, reviewed** paths too and include **complete corrected code blocks in §3–8 (or a clearly marked new M5 fix subsection)** before this commit. Never use `git add .` blindly.

## 13. Safe local no-commit merge into `main`, retest, push and remote verification

Only after the M5 feature branch is fully validated and committed, update `main` from remote and create an **uncommitted merge candidate**. The full suite **runs again on the actual merged tree before making a merge commit**. No Pull Requests, no force push, no bypassing GitHub branch rules.

```powershell
# Do not do feature development here; this is an integration-only merge candidate.
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Could not switch to main.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'Remote main changed or diverged. Resolve safely before merging.' }
if (@(git status --porcelain).Count -ne 0) { throw 'main must be clean before merge.' }

# Staged but UNCOMMITTED merge candidate. git merge may report conflicts.
git merge --no-ff --no-commit feature/m5-dev2
if ($LASTEXITCODE -ne 0) {
  Write-Warning 'Merge conflict/failure: STOP. Resolve only after examining both versions.'
  throw 'Uncommitted merge not ready; do NOT commit or push.'
}

# All checks run on the actual merged worktree before making the merge commit.
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree npm ci failed.' }
npm run test -- tests/m5-shell-recovery.test.tsx tests/m5-boundary.test.ts
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree M5 unit tests failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree types failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree unit/component regressions failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree production build failed.' }
npx playwright install chromium
if ($LASTEXITCODE -ne 0) { throw 'Chromium not installed.' }
npm run test:e2e
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree E2E failed.' }

# RERUN manual M5 core farmer journey and en/ary/RTL/map/a11y checklist.
# Check the guide/source parity on the MERGED tree before proceeding.
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Merged index whitespace failure.' }
git status --short

# ONLY after all actual automated/manual checks pass, with no blocking uncertainty:
git commit -m 'merge(m5): validate frontend completion and handoff on main'
if ($LASTEXITCODE -ne 0) { throw 'Merge commit failed.' }
git push origin main
if ($LASTEXITCODE -ne 0) {
  throw 'main push rejected. Do NOT force push; inspect remote/rules and retest.'
}
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Could not verify pushed SHA.' }
$localSha = (git rev-parse HEAD).Trim()
$remoteSha = (git rev-parse origin/main).Trim()
if ($localSha -ne $remoteSha) { throw 'Pushed main SHA does not match locally validated merge.' }
Write-Host "M5_INTEGRATED_MAIN_SHA=$localSha"
# Finally inspect real GitHub Actions `checks` for THIS main SHA; do not mark green by assumption.
```

**On merge conflict or failing merged-tree test:** while the merge is uncommitted, stop and use `git status` to inspect. If possible run `git merge --abort` to restore pre-merge `main`, then return to `feature/m5-dev2`, correct/retest the source + this guide, commit and retry from freshly pulled `main`. If `git merge --abort` is unavailable (e.g. partial manual resolution), **do not use `git reset --hard` on unreviewed user changes**: inspect the current index/worktree and recover safely. If branch rules forbid verified local merge pushes, an authorized repository administrator must change the rules to allow the agreed no-PR workflow—**never force push or bypass a rule**.

**After remote push:** verify the remote commit exists and that **its** CI `checks` job really passed. If CI is red, M5 is not accepted; fix the defect through the agreed feature/local-merge flow before treating the frontend as finished. Preserve actual trace evidence where safe, but keep generated report directories untracked.

## 14. M5 completion and future-handoff record — fill ONLY with observed facts

Copy this block into the milestone's actual verification log/guide after you execute the work. An item not executed is `NOT VERIFIED`, never automatically `PASS`.

```text
Milestone: M5 — Frontend hardening & API handoff
Owner: DEV2 | Branch: feature/m5-dev2
M4 verified origin/main baseline SHA: __________________________
Baseline M4 CI result/date: ____________________________________
Actual M5 source changes vs guide: _____________________________
Guide reviewed: still accurate / updated in commit: ____________
Package-lock and Node reproducibility: _________________________
Targeted M5 Vitest: PASS / FAIL / NOT VERIFIED; actual total: ____
Full Vitest: PASS / FAIL / NOT VERIFIED; actual total: ___________
Lint: ___________  Typecheck: ___________  Build: ______________
Playwright Chromium: PASS / FAIL / NOT VERIFIED; actual total: __
Manual A01–A19 record (PASS/FAIL/NOT VERIFIED by ID): __________
Browser(s), date, mobile sizes, desktop, keyboard, en/ary/RTL: ___
M0 audio fallback checked: _____________________________________
M2 parcel form + local-only/privacy checks: ____________________
M3 sourced POIs/OSM attribution/tile-failure list: ______________
M4 local post/form/copy consent/calendar checks: ________________
M5 404/error and locale shell checked: __________________________
Observed Console/Network findings: _____________________________
Open accessibility/translation/licensing issues: ________________
Other docs changed and reason: _________________________________
Feature commit SHA: ____________________________________________
Merged-tree lint/type/tests/build/E2E/manual: ___________________
Main merge SHA verified == origin/main: _________________________
GitHub Actions checks on exact main SHA: _______________________
Handoff inventory verified against actual source: ______________
Deferred approvals / backend + science owners informed: ________
Known limits / NOT VERIFIED items: _____________________________
```

### Final STOP/GO definition

**GO — frontend M0–M5 integrated:** only after all actual mandatory checks and manual gates pass, this guide matches committed code, the validated local merge is pushed, the remote SHA matches, and CI finishes green. **STOP — backend/model scope:** M5 alone neither approves `TEAM_BRIEFING_DATA_CONTRACT.md` nor implements APIs or recommendations. The next work is a **separately approved backend/data-science integration phase** with independently defined contracts, security, geographic provenance and science acceptance—not another invented frontend milestone.
