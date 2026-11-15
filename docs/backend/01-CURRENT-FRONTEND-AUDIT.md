# B0 — Current frontend audit & dependency inventory

**Status:** **guide-derived evidence only** until the script runs on the real `origin/main` and an implementer checks source signatures. Do not report these as currently implemented code. **Owner to appoint:** frontend delegate / integration lead.

## 1. Mandatory actual-repository preflight (Windows PowerShell)

```powershell
# If you already have a local checkout, open its folder in VS Code.
# Otherwise, on a machine with repository access:
git clone https://github.com/mudma224/CSIA6.git
Set-Location CSIA6
$ErrorActionPreference = 'Stop'
if (@(git status --porcelain).Count -ne 0) { throw 'Working tree not clean.' }
git remote -v
git fetch origin
git switch main
git pull --ff-only origin main
$sha = (git rev-parse HEAD).Trim()
if ($sha -ne (git rev-parse origin/main).Trim()) { throw 'Local main differs from remote.' }
Write-Host "Current authoritative SHA: $sha"
Get-Content .nvmrc
Get-Content package.json
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Install failed.' }
npm run lint; if ($LASTEXITCODE -ne 0) { throw 'Lint failed.' }
npm run typecheck; if ($LASTEXITCODE -ne 0) { throw 'Typecheck failed.' }
npm run test; if ($LASTEXITCODE -ne 0) { throw 'Tests failed.' }
npm run build; if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
# If package.json has a test:e2e script and browsers are installed, run it separately.
# Keep evidence of browser/RTL/manual coverage; do NOT mark it PASS automatically.
```

Copy the supplied `audit-frontend.ps1` to a temporary tools folder **outside** the repo and run:

```powershell
& 'C:\path\to\audit-frontend.ps1' -RepositoryPath 'C:\path\to\CSIA6' -OutputPath 'C:\path\to\main-audit.md'
```

The script validates the origin, fetches `origin/main`, checks the working branch, records SHA, lists tracked files/routes/tests and prints export signatures. It **does not certify semantic correctness** or real test success. The owner must inspect all affected source files manually and reconcile the inventory below.

## 2. Route-by-route impact inventory (from M0–M5 guides)

| Browser route | Guide-specified component / path to verify | Current guide-described data | Future integration & gate |
|---|---|---|---|
| `/` | `src/app/(farmer)/page.tsx` → `src/features/m1/WelcomeScreen.tsx` | locale; text fallback for missing audio | Preserve; no backend required for demo entry |
| `/access` | `src/app/(farmer)/access/page.tsx` → `src/features/m1/AccessScreen.tsx`, `phoneFormat.ts` | optional phone string, format-only | Only real verified Auth provider; no fake OTP; Auth gate G2 |
| `/home` | `src/app/(farmer)/(workspace)/home/page.tsx` → `src/features/m1/HomeScreen.tsx` | local UI links/cards; no weather/parcel data | Optional authorized recent parcels after G2; preserve current Home sections |
| `/parcels/new` | `src/app/(farmer)/(workspace)/parcels/new/page.tsx` → `src/features/m2/ParcelJourney.tsx` | `ParcelDraft` in component memory; 4 steps, local review | Adapter→approved parcel API; preserve wizard state and validation; G2/G4 |
| `/rotation` | `src/app/(farmer)/(workspace)/rotation/page.tsx` → `src/features/m2/RotationScreen.tsx` | explicit recommendations unavailable | No model UI until G3 and approved states; then approved adapter; G4 |
| `/map` | `src/app/(farmer)/(workspace)/map/page.tsx` → `src/features/m3/MapScreen.tsx` | sourced static points, OSM tiles, filters, list | Usually no API needed; no unsourced polygons or inferred parcel pin |
| `/community` | `src/app/(farmer)/(workspace)/community/page.tsx` → `src/features/m4/CommunityScreen.tsx` | session-only local posts/filter/remove/share-preview | Persist/publish only with identity, moderation, privacy approval; G2/G4 |
| `/calendar` | `src/app/(farmer)/(workspace)/calendar/page.tsx` → `src/features/m4/CalendarScreen.tsx` | unavailable until crop-calendar validation | Keep unavailable; only vetted dated records |
| `/profile` | `src/app/(farmer)/(workspace)/profile/page.tsx` → `src/features/m1/ProfileScreen.tsx` | local display name; persisted locale | Conditional authenticated profile; demo remains label-only |
| `/foundation-preview` | `src/app/foundation-preview/page.tsx`, `src/features/foundation/FoundationDemo.tsx` | internal M0 UI/audio lab | Do not connect to backend |
| non-existent route | `src/app/not-found.tsx` | M5 recovery | preserve bilingual 404 |
| workspace rendering failure | `src/app/(farmer)/(workspace)/error.tsx` | M5 recovery/reset | translate new API errors without leaking details |

**Actual file paths MUST be verified.** In Next.js, parenthesized App Router route groups do not appear in the URL.

## 3. Existing component / dependency interface checklist

| Historical file | Verify actual export or props | Risk of rewriting blindly |
|---|---|---|
| `src/i18n/LocaleProvider.tsx` | `useLocale()` supplies `locale`, `setLocale`, `t`; `lang=en/ary` & `dir=ltr/rtl` | Breaking input preservation or RTL |
| `src/components/ui/Button.tsx` | accepts native button attributes, `variant`, disabled/loading conventions | Losing accessibility or M0–M5 tests |
| `src/components/ui/TextField.tsx` | `label`, `hint`, `error`, controlled `value`/`onChange` | Lost validation/labels |
| `src/components/forms/ChoiceGroup.tsx` | `legend`, `name`, `options`, `value`, `onChange` | Wrong enum mapping to backend |
| `src/components/navigation/AppFrame.tsx` | workspace shell, skip link, locale switcher | Duplicated nav/locale contexts |
| `src/components/navigation/PrimaryNav.tsx` | five items Home/Rotation/Map/Community/Profile | Accidental sixth tab or route rename |
| `src/features/m2/parcelDraft.ts` | `ParcelDraft`, `emptyParcelDraft`, `validateParcelStep`, `firstInvalidStep` | UI-only types treated as production contract |
| `src/features/m4/communityDraft.ts` | `CommunityDraft`, `LocalPreviewPost`, `validateCommunityDraft`, share formatter | Accidentally publishing unreviewed private data |
| `src/features/m3/MapScreen.tsx`, `src/data/m3/verifiedPoints.ts` | static sourced points, precision note, no GPS binding | Precision misrepresentation |
| `src/components/audio/AudioHelp.tsx`, `clips.ts` | reviewed recordings only; manifest possibly empty | Invented audio, autoplay |
| `tests/**/*`, `e2e/**/*` | current suites and selectors; `playwright.config.ts` | Regression false positives |

**Package/version verification:** M0–M2 guides anticipated Node `22.22.2`, npm lockfile, Vitest/Testing Library, Next.js/React/Tailwind. M3 anticipated React 19 + Leaflet 1.9.4/React Leaflet 5.0.0; M5 anticipated Playwright. These are **historical plans only**, not evidence of installed versions. Check real `package.json`, `package-lock.json`, `npm ls --depth=0`, `.nvmrc`, and `npm pkg get scripts`. Never run blanket `npm update`.

## 4. M2 UI-only `ParcelDraft`: complete guide-derived field inventory

Source: historical M2 guide, `src/features/m2/parcelDraft.ts`. These names/types are **not API names**.

| Field | UI type or value set | M2 validation/meaning |
|---|---|---|
| `parcelName` | string | optional, trim, max 60 chars |
| `zone` | `""`, `amir`, `moussa`, `other`, `unsure` | explicit choice mandatory, `unsure` accepted |
| `areaHa` | string decimal `.` or `,` | optional, positive number when supplied; hectares |
| `irrigation` | `""`, `drip-ui`, `surface-ui`, `other-ui`, `unsure` | explicit choice mandatory; UI enums only |
| `locationChoice` | `none`, `manual` | no coordinates by default; manual requires both values |
| `latitude` / `longitude` | decimal strings | optional unless manual; only range checks [-90,90]/[-180,180]; **not geolocated or verified** |
| `recentCrop` / `earlierCrop` | optional free-text strings | max 80 chars each; **not** recognized crop ID |
| `recentCropSeason` / `earlierCropSeason` | optional free-text strings | max 40 chars; nonempty season requires its crop |
| `seasonChoice` | `""`, `known`, `unsure` | required selection; `unsure` permitted |
| `plannedSeason` | string | needed only for `known`, max 40 chars; no approved format |

**Important historical-guide inconsistency:** the opening M2 table says “location: no coordinates,” while the actual guide's `ParcelDraft` and wizard source **do include optional user-typed manual lat/lon**. The adapter must follow **the real source after audit**, not the inaccurate table. The M2 guide sometimes describes unknown zone/season as acceptable while the DS proposal expects a specific `planned_season`; unresolved.

## 5. M4 `CommunityDraft`: guide-derived, not approved DB fields

`kind` = `experience | sale | partnership`, `title`, `description`, `crop`, `quantity`, `unit` (`kg|t|other|unknown|""`), `price`, `area`, `purpose`, `partnershipArea`. Local-only `id` is a rendering identifier, not a server ID. The M4 composer checks required text/positive numerical *formats*; it does not verify crops, inventories, prices or seller identity. Posts disappear on refresh/leave; sharing copies **only after user review and consent**. A production public feed and moderation plan require a separate approval.

## 6. State, tests, environment and trust boundaries

- **Locale:** one M0 `LocaleProvider`, localStorage language preference; do not create duplicate i18n store.
- **Authentication:** M1 checks phone **syntax only**; demo entry is an unauthenticated UI journey. No backend user is implied.
- **Parcel:** M2 wizard is component memory, not persisted, submitted, or signed. Do not silently start saving on next-step or review actions.
- **Community:** M4 user-authored page-instance previews only. Do not migrate ephemeral preview items to a public feed automatically.
- **Map:** M3 two sourced *approximate mapped feature points* (Bin El Ouidane and Ahmed El Hansali dams) + a published study camera extent; no verified markets/suppliers, polygon or parcel linkage. Respect OSM attribution and tile limits.
- **Recommendations:** currently guide-described unavailable route, zero trusted model outputs. Data-science contract v0.1 is not approved.
- **Calendar:** no vetted dates; remain unavailable until approved.
- **Audio:** reviewed prerecorded per-language clips only; text fallback remains.
- **Tests:** M0→M4 Vitest/RTL; M5 intended Playwright `test:e2e`; CI originally on main pushes. Verify actual scripts/CI. No current test run observed.
- **Environment:** frontend guides do **not** prove existing API URLs or credentials; inventory `.env.example` and process env; never dump `.env.local` contents to shared docs.

## 7. Every data-dependent component must be revalidated

For each actual component, log in `docs/integration/audit-inventory.md`: `browser route | exact file/export | props/type | state source | user action | needed API/owner | contract version | adapter file | usability vs server validation | test IDs | status`. Fill all cells from real code, never infer exports from the guides. In particular, trace `ParcelJourney`'s confirm button, its internal state reset, and M4's publish-preview boundary before modifying any handler.

**B0 Definition of done:** clean current SHA, actual route/file/props inventory, M5 evidence, documented deviations from historical guides, design/locale tests, open issues and signed contract checklist. Then and only then freeze future integration code locations.
