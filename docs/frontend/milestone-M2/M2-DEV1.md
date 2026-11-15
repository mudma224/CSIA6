# flaht bladi — M2 Parcel Journey & Deferred Rotation — DEV1 execution guide

**Target repository:** `mudma224/CSIA6`  
**Destination:** `docs/frontend/milestone-M2/M2-DEV1.md`  
**Owner:** DEV1 · **Only feature branch:** `feature/m2-dev1` · **Prepared:** 15 November 2026  
**Dependency:** M0 and M1 implemented, validated, and available on `origin/main`. M3–M5 are **not** part of this guide.

> **Baseline integrity notice.** The supplied M1 guide is historical implementation guidance, **not proof of the contents of the current repository**. This document was prepared from the seven supplied project references and the M1 guide. A live checkout of `mudma224/CSIA6` was **not accessible to the author**; therefore, no SHA, CI result, live source compatibility, or test success is claimed. **Section 1 is a required stop/go inspection of actual `origin/main` before copying any source code.** If M1 changed materially after its guide was written, adapt the *complete affected block here*, the corresponding tests, and the acceptance expectations on the M2 branch before proceeding. Never overwrite newer working code blindly.

## 0. Deliverable and non-goals

At the end of M2, `/parcels/new` shows a **four-stage, mobile-first and bilingual UI**: **(1) parcel basics → (2) irrigation & optional location → (3) crop notes & planned season → (4) review**. The farmer can change steps and languages without losing entered values; `en` stays LTR and `ary` stays RTL. The final action confirms **a local review in the current page only**: it neither transmits, saves, authenticates nor recommends anything. `/home` links to parcel entry, and `/rotation` links to parcel entry while clearly stating that recommendations are **unavailable**. The existing five-tab navigation, M0/M1 providers, controls, colors, M0 audio fallback and remaining routes stay intact.

### Form choices are UI-only, **not an approved data contract**

| UI item | What M2 collects | Required for progression? | Honest boundary |
|---|---|---|---|
| Parcel name | Optional farmer-friendly free text | No | Not a registered/cadastral identifier |
| Irrigation zone | Béni Amir, Béni Moussa, Other, I don't know | **Explicit selection required**, unknown allowed | A zone is **not** a coordinate or field boundary |
| Approximate area | Optional text entered as hectares, checked for positive decimal format | No | No water or yield calculation |
| Irrigation method | Drip, surface/gravity, other, I don't know | **Explicit selection required**, unknown allowed | These are provisional **display choices**, not API enum IDs |
| Location | **No coordinates** or user-entered latitude/longitude | Optional | No map pin or GPS guess. Manual values are not verified. Map selection remains M3/future |
| Most recent / older crop | Optional **free-text notes**, with optional season labels | No | **No unapproved crop list/IDs**, canonical matching or scientific inference |
| Planned season | User's own season label **or** I don't know | **Explicit selection required**; text needed only when known | No fixed season list, calendar or inferred dates without approval |

**Why free text for crops?** The proposed `TEAM_BRIEFING_DATA_CONTRACT.md` includes crop IDs, enums and a potential API, but it is expressly **PROPOSED**. Do not copy its schema, candidate crop IDs, mock results or rules. M2's `ParcelDraft` is a **presentation-only view model**, not a request payload, and must not be exported as a backend contract. Required-field and decimal checks are for form usability only; later server/model validation remains separate.

**Out of scope:** backend endpoints, `fetch` calls, auth/OTP, databases or `localStorage` parcel persistence; sample parcels, maps, real parcel coordinates, generated crops/rotations, rankings, scores, climate/soil claims, planting windows, saved records, and comparisons. Preserve `/map` (M3), `/community` (M4) and `/foundation-preview` as they currently work.

**Design references:** use the existing M0/M1 `forest`, `leaf`, `mint`, `sage`, `cream`, 16/20 px radii and design-system spacing/tokens. Respect 44 px hit areas and narrow screens. The design-system ZIP's illustrative parcels/crops/maps are **not** real data and must not be copied.

## 1. Mandatory preflight on Windows PowerShell — inspect REAL `origin/main`

Open **VS Code → Terminal → New Terminal → PowerShell** in your existing `CSIA6` checkout. Do **not** run `create-next-app` or reinitialize the repository. If not cloned, use `git clone https://github.com/mudma224/CSIA6.git` once and open that folder.

```powershell
# Run from the CSIA6 repository folder (PowerShell, NOT Git Bash).
$ErrorActionPreference = 'Stop'
$root = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Open the existing CSIA6 Git checkout first.' }
Set-Location $root
if ((git status --porcelain).Count -ne 0) { throw 'Working tree must be clean. Commit or stash your other changes first.' }

git remote -v  # confirm origin points to mudma224/CSIA6; stop if it does not
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Cannot fetch origin; do not guess that M1 exists on remote main.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Local main is missing; inspect the repository.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'main cannot fast-forward; resolve outside M2.' }
if ((git status --porcelain).Count -ne 0) { throw 'main must be clean.' }
$baseline = (git rev-parse HEAD).Trim()
$remote = (git rev-parse origin/main).Trim()
if ($baseline -ne $remote) { throw 'Local main does not match origin/main.' }
Write-Host "M2_BASELINE_SHA=$baseline"

$mustExist = @(
  'package.json', 'package-lock.json', '.nvmrc',
  'src/app/globals.css', 'src/i18n/LocaleProvider.tsx', 'src/i18n/locale.ts',
  'src/i18n/messages.ts', 'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx', 'src/components/ui/TextField.tsx',
  'src/components/m1/ActionLink.tsx', 'src/components/m1/LocaleSwitcher.tsx',
  'src/components/navigation/PrimaryNav.tsx', 'src/components/navigation/AppFrame.tsx',
  'src/features/m1/HomeScreen.tsx', 'src/features/m1/UnavailableScreen.tsx',
  'src/app/(farmer)/(workspace)/home/page.tsx',
  'src/app/(farmer)/(workspace)/rotation/page.tsx',
  'src/app/(farmer)/(workspace)/parcels/new/page.tsx',
  'docs/frontend/milestone-M1/M1-DEV1.md',
  'docs/system-design.md', 'README.md',
  'tests/m1-screens.test.tsx'
)
foreach ($path in $mustExist) {
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "M1 baseline file missing: $path. Inspect real main, then reconcile this guide before proceeding."
  }
}
$remoteM1 = git ls-tree -r --name-only origin/main -- 'docs/frontend/milestone-M1/M1-DEV1.md'
if (-not ($remoteM1 -contains 'docs/frontend/milestone-M1/M1-DEV1.md')) {
  throw 'The M1 execution guide is absent from origin/main.'
}
Write-Host 'M1 file inventory exists on origin/main. Still inspect source differences before replacing files.'
node -v
npm -v
Get-Content .nvmrc
Get-Content package.json
Get-Content src/components/ui/Button.tsx
Get-Content src/components/ui/Card.tsx
Get-Content src/components/ui/TextField.tsx
Get-Content src/i18n/LocaleProvider.tsx
Get-Content src/features/m1/HomeScreen.tsx
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/rotation/page.tsx'
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/parcels/new/page.tsx'
```

**Required manual baseline decision, before proceeding:** verify the actual `Button` accepts native `type`, `onClick` and `variant="outline"`, `Card` accepts `className`, `TextField` accepts `label`, `hint`, `error`, `value`, `onChange`, `type`, `inputMode` and `maxLength`, `useLocale()` exposes `locale` and `t`, and the workspace still wraps its pages in `LocaleProvider` and `AppFrame`. Verify the home and route-group paths above. Compare M1's current code to the supplied M1 guide, particularly `HomeScreen`, route pages and navigation. **If any interface or file layout differs, do not blindly paste the following replacements:** change this guide's corresponding full code block to match working `main`, and add/update tests on the feature branch. This is the only safe way to honor the actual-code baseline without inventing its contents.

**M1 verification:** inspect M1's completion record and the GitHub Actions result for the fetched `origin/main` commit; a file inventory and matching SHA **do not by themselves prove tests passed**. If M1 is not actually green, fix/verify M1 first; do not start M2. The commands below are for when that gate is met.

```powershell
# Clean install using the committed lockfile. M0/M1 pinned Node 22.22.2.
# Switch Node versions using your existing Node manager, if needed.
npm ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Baseline lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Baseline TypeScript failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Baseline tests failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Baseline production build failed.' }
if ((git status --porcelain).Count -ne 0) { throw 'Baseline build changed tracked files; review and restore only generated artifacts.' }

git switch -c feature/m2-dev1
if ($LASTEXITCODE -ne 0) { throw 'The feature branch already exists; inspect it rather than deleting work.' }
if ((git branch --show-current).Trim() -ne 'feature/m2-dev1') { throw 'Wrong branch.' }
New-Item -ItemType Directory -Force 'src/components/forms', 'src/features/m2', 'tests', 'docs/frontend/milestone-M2' | Out-Null
```

**Dependencies:** **none added**. Reuse the installed M0/M1 packages and tests. No `npm install`, `npm update`, new location/map library or lockfile change is necessary in the reference implementation. The committed `package-lock.json` should stay unchanged. If actual `main` differs, any justified dependency change must also update this guide, `package.json`, `package-lock.json`, tests and the install instruction **together**; use `npm install <package>` and commit both manifests only then.

## 2. Exact file operations

| Path (repository relative) | Operation |
|---|---|
| `src/i18n/m2Messages.ts` | **CREATE** complete M2 dictionary/use-hook; uses existing M0 locale context, no second store |
| `src/features/m2/parcelDraft.ts` | **CREATE** UI-only types, initial state and format/required validation |
| `src/components/forms/ChoiceGroup.tsx` | **CREATE** accessible reusable radio choice cards |
| `src/features/m2/ParcelJourney.tsx` | **CREATE** complete 4-stage wizard, local review and confirmation |
| `src/features/m2/RotationScreen.tsx` | **CREATE** recommendation-unavailable entry with parcel link |
| `src/features/m1/HomeScreen.tsx` | **REPLACE ENTIRE FILE** only after baseline inspection; retain M1 links and add M2 parcel copy |
| `src/app/(farmer)/(workspace)/parcels/new/page.tsx` | **REPLACE ENTIRE FILE** to mount `ParcelJourney` |
| `src/app/(farmer)/(workspace)/rotation/page.tsx` | **REPLACE ENTIRE FILE** to mount `RotationScreen` |
| `tests/m2-parcel-validation.test.ts` | **CREATE** full pure-function validation tests |
| `tests/m2-parcel-journey.test.tsx` | **CREATE** complete interaction tests |
| `tests/m2-navigation.test.tsx` | **CREATE** Home/Rotation integration tests |
| `README.md` | **SMALL conditional edits** by the idempotent script in §7; do not rewrite README |
| `docs/system-design.md` | **APPEND a small factual M2 note** via §7, once; no global rewrite |
| `docs/frontend/milestone-M2/M2-DEV1.md` | **CREATE this guide**; keep matching source/test blocks updated |

**Not modified:** `src/i18n/messages.ts` (M0/M1 existing keys remain), M0/M1 UI primitives, `globals.css`, `PrimaryNav`, locale provider, audio, `package.json`, `package-lock.json`, the five shared reference documents other than the necessary **architecture** update, the proposed data contract or other milestone guides. The M2 translations live in `src/i18n/` and read the **same** `useLocale()` context—no independent language state or storage.

Create/replace files **in the exact order below** using VS Code. Each fenced source block is the **complete content** of its named file; preserve the file extension and `'use client'` directives. Parenthesized Next.js folders are literal folder names and have no effect on the browser URL.

## 3. Source file: `src/i18n/m2Messages.ts` — CREATE

```typescript
import { useLocale } from "@/i18n/LocaleProvider";

// UI wording only. This is NOT a model vocabulary, crop catalog, or API schema.
export const m2Messages = {
  en: {
    formEyebrow: "Parcel · local demonstration",
    formTitle: "Tell us about your parcel",
    formIntro: "Enter only what you know. This form stays in this page and does not save or send information.",
    formPrivacy: "Local demonstration only. Refreshing or leaving this page loses the draft. Do not enter sensitive location details.",
    progressLabel: "Parcel form steps",
    step1: "Parcel basics",
    step2: "Water and location",
    step3: "Crops and season",
    step4: "Review",
    stepCounter: "Step",
    of: "of",
    next: "Next step",
    back: "Previous step",
    confirm: "Confirm local review",
    startAgain: "Start a new local form",
    cancel: "Back to rotation",
    requiredNote: "Fields marked required need an answer; ‘I don't know’ is an acceptable answer where offered.",
    nameLabel: "Parcel name (optional)",
    nameHint: "A short name for this screen only, not a legal land identifier.",
    namePlaceholder: "Your own parcel label",
    zoneLabel: "Irrigation zone (required)",
    zoneHint: "A zone choice does not identify your exact field position.",
    zoneAmir: "Béni Amir",
    zoneMoussa: "Béni Moussa",
    zoneOther: "Other area",
    unsure: "I don't know",
    areaLabel: "Approximate area in hectares (optional)",
    areaHint: "Enter a positive number if known, such as 1.5 or 1,5. No measurement is calculated.",
    areaPlaceholder: "Area in ha",
    irrigationLabel: "Irrigation method (required)",
    irrigationHint: "These are simple UI descriptions, not an approved scientific classification.",
    irrigationDrip: "Drip irrigation",
    irrigationSurface: "Surface or gravity irrigation",
    irrigationOther: "Other method",
    locationLabel: "How would you like to describe the location?",
    locationHint: "Exact coordinates are optional. This page cannot find or verify your position.",
    locationNone: "I don't have coordinates / I'll add them later",
    locationManual: "I want to type my own coordinates",
    latLabel: "Latitude (entered by you)",
    lonLabel: "Longitude (entered by you)",
    coordinatesHint: "Use decimal degrees. Both fields are required for manual entry. The values will NOT be checked against a map or transmitted.",
    mapLater: "Map-pin selection is not available in this milestone. It will require verified geographic UI later.",
    cropIntro: "Crop history is optional until a reviewed crop list is supplied. Your entries are free-text notes only—not recognized crop IDs.",
    recentCrop: "Most recent crop (optional free text)",
    recentCropSeason: "Season of that crop (optional)",
    earlierCrop: "Crop before that (optional free text)",
    earlierCropSeason: "Season of earlier crop (optional)",
    cropPlaceholder: "Write the crop name you use",
    cropSeasonHint: "Use your own season/year wording; no official calendar is available here.",
    seasonModeLabel: "Do you know the planned season? (required)",
    seasonKnown: "Yes, I can describe it",
    seasonUnknown: "I don't know yet",
    seasonLabel: "Planned season or year (required if known)",
    seasonHint: "Use your own label, e.g. 2026/2027. This is not a validated model season ID.",
    reviewIntro: "Check what you entered. Nothing has been saved or sent, and no recommendation will be generated.",
    reviewLocation: "Location detail",
    reviewUnverified: "Manually entered coordinates — unverified and private",
    notProvided: "Not provided",
    userUnsure: "I don't know",
    noHistory: "No crop history entered",
    reviewCrops: "Optional crop notes",
    reviewSeason: "Planned season",
    areaUnit: "ha (as entered)",
    statusTitle: "Local review confirmed",
    statusDescription: "You reviewed this form inside your browser tab. No parcel was saved, no information was sent, and no crop recommendation was produced.",
    recommendationsUnavailable: "Crop recommendations are unavailable until the data-science work and interfaces have been approved.",
    rotationIntro: "You can explore the parcel form locally. It does not request a recommendation or connect to a model.",
    startParcel: "Describe a parcel",
    parcelEntryDescription: "Open a guided parcel form and review your answers locally. No server save or recommendation.",
    requiredZone: "Choose your irrigation zone, or select ‘I don't know’.",
    invalidArea: "Enter a number greater than zero in hectares, or leave the area blank.",
    requiredIrrigation: "Choose an irrigation method, or select ‘I don't know’.",
    invalidLatitude: "Enter a latitude between -90 and 90 in decimal degrees.",
    invalidLongitude: "Enter a longitude between -180 and 180 in decimal degrees.",
    requiredCoordinates: "Enter both coordinates, or select the option without coordinates.",
    requiredSeasonMode: "Say whether you know the planned season.",
    requiredSeasonText: "Write a planned season/year, or choose ‘I don't know yet’.",
    cropRequiredForSeason: "Add a crop name for this crop-season note, or clear its season.",
    tooLongName: "Use a parcel name of 60 characters or fewer.",
    tooLongCrop: "Use a crop note of 80 characters or fewer.",
    tooLongSeason: "Use a season label of 40 characters or fewer.",
    errorHeading: "Please correct these fields before continuing:",
    reviewError: "Some information needs correction. Go back to the indicated step.",
  },
  ary: {
    formEyebrow: "القطعة الأرضية · غير تجربة محلية",
    formTitle: "عطينا معلومات على الأرض ديالك",
    formIntro: "دخل غير المعلومات اللي عارف. هاد الاستمارة كتبقى غير فهاد الصفحة وما كتتحفظ وما كتصيفط والو.",
    formPrivacy: "غير تجربة محلية. إلا خرجتي من الصفحة ولا عاودتي تحميلها، المعلومات غادي تضيع. ما تدخلش معلومات حساسة على الموقع.",
    progressLabel: "مراحل استمارة الأرض",
    step1: "معلومات الأرض",
    step2: "السقي والموقع",
    step3: "الزراعات والموسم",
    step4: "المراجعة",
    stepCounter: "المرحلة",
    of: "من",
    next: "المرحلة الجاية",
    back: "المرحلة اللي فاتت",
    confirm: "أكد المراجعة المحلية",
    startAgain: "بدا استمارة محلية جديدة",
    cancel: "رجع للتناوب",
    requiredNote: "الخانات الضرورية خاصها جواب. تقدر تختار «ما عارفش» فين كاينة.",
    nameLabel: "اسم الأرض (اختياري)",
    nameHint: "غير اسم قصير باش تعرف الأرض فهاد الصفحة، ماشي رقم رسمي ديال الملكية.",
    namePlaceholder: "الاسم اللي سميتي به الأرض",
    zoneLabel: "منطقة السقي (ضرورية)",
    zoneHint: "اختيار المنطقة ما كيعنيش عرفنا الموقع الدقيق ديال الأرض.",
    zoneAmir: "بني عمير",
    zoneMoussa: "بني موسى",
    zoneOther: "منطقة أخرى",
    unsure: "ما عارفش",
    areaLabel: "المساحة التقريبية بالهكتار (اختيارية)",
    areaHint: "إلى كنتي عارف، دخل رقم أكبر من صفر بحال 1.5 ولا 1,5. ما كنحسبو حتى قياس.",
    areaPlaceholder: "المساحة بالهكتار",
    irrigationLabel: "طريقة السقي (ضرورية)",
    irrigationHint: "هاد الاختيارات غير للوصف فالواجهة، ماشي تصنيف علمي مصادق عليه.",
    irrigationDrip: "السقي بالتنقيط",
    irrigationSurface: "السقي السطحي أو بالجاذبية",
    irrigationOther: "طريقة أخرى",
    locationLabel: "كيفاش بغيتي تحدد موقع الأرض؟",
    locationHint: "الإحداثيات اختيارية. هاد الصفحة ما كتقدرش تلقى ولا تتحقق من الموقع ديالك.",
    locationNone: "ما عنديش الإحداثيات / نزيدهم من بعد",
    locationManual: "بغيت ندخل الإحداثيات بنفسي",
    latLabel: "خط العرض (دخلتيه نتا)",
    lonLabel: "خط الطول (دخلتيه نتا)",
    coordinatesHint: "استعمل الدرجات العشرية. خاصك تدخل الجوج. ما كنراجعوش الإحداثيات مع الخريطة وما كنصيفطوهمش.",
    mapLater: "اختيار نقطة من الخريطة مازال ما متوفرش. خاص واجهة جغرافية متأكد منها من بعد.",
    cropIntro: "الزراعات السابقة اختيارية حتى تتوفر لائحة مراجعة. اللي غادي تكتب غير ملاحظات حرة، ماشي رموز محاصيل معتمدة.",
    recentCrop: "آخر زراعة (كتابة اختيارية)",
    recentCropSeason: "الموسم ديال هاد الزراعة (اختياري)",
    earlierCrop: "الزراعة اللي قبل منها (كتابة اختيارية)",
    earlierCropSeason: "الموسم ديال الزراعة السابقة (اختياري)",
    cropPlaceholder: "كتب اسم الزراعة اللي كتعرف",
    cropSeasonHint: "كتب الموسم أو العام بطريقتك، ما كاينش هنا تقويم فلاحي معتمد.",
    seasonModeLabel: "واش عارف الموسم اللي ناوي تزرع فيه؟ (ضروري)",
    seasonKnown: "إييه، نقدر نحدد الموسم",
    seasonUnknown: "مازال ما عارفش",
    seasonLabel: "الموسم أو العام اللي مخطط ليه (ضروري إلا كنت عارف)",
    seasonHint: "كتب الموسم بالطريقة ديالك، بحال 2026/2027. هادا ماشي رمز موسم معتمد من النموذج.",
    reviewIntro: "راجع شنو دخلتي. ما تحفظات وما تصيفطات حتى معلومة، وما غادي يخرج حتى اقتراح زراعي.",
    reviewLocation: "تفاصيل الموقع",
    reviewUnverified: "إحداثيات دخلتيها بنفسك، ماشي متأكد منها وكتبقى خاصة",
    notProvided: "ما تعطاتش",
    userUnsure: "ما عارفش",
    noHistory: "ما دخلتي حتى زراعة سابقة",
    reviewCrops: "ملاحظات اختيارية على الزراعات",
    reviewSeason: "الموسم المخطط ليه",
    areaUnit: "هكتار (حسب اللي دخلتي)",
    statusTitle: "تأكدات المراجعة المحلية",
    statusDescription: "راجعتي الاستمارة فهاد الصفحة فقط. ما تحفظات حتى أرض وما تصيفطات حتى معلومة وما تولد حتى اقتراح زراعي.",
    recommendationsUnavailable: "اقتراحات الزراعة مازال ما متوفراش حتى تتم المصادقة على خدمة البيانات والواجهة ديالها.",
    rotationIntro: "تقدر تجرب استمارة الأرض محليا. ما كتطلب حتى اقتراح وما كتتاصلش بالنموذج.",
    startParcel: "دخل معلومات الأرض",
    parcelEntryDescription: "حل استمارة ديال الأرض وراجع المعلومات محليا. بلا حفظ فخادم وبلا اقتراح زراعي.",
    requiredZone: "اختار منطقة السقي أو «ما عارفش».",
    invalidArea: "دخل رقم أكبر من صفر بالهكتار، أو خلي المساحة خاوية.",
    requiredIrrigation: "اختار طريقة السقي أو «ما عارفش».",
    invalidLatitude: "دخل خط العرض ما بين -90 و90 بالدرجات العشرية.",
    invalidLongitude: "دخل خط الطول ما بين -180 و180 بالدرجات العشرية.",
    requiredCoordinates: "دخل جوج الإحداثيات أو اختار بلا إحداثيات.",
    requiredSeasonMode: "حدد واش عارف الموسم المخطط ليه.",
    requiredSeasonText: "كتب الموسم أو العام، أو اختار «مازال ما عارفش».",
    cropRequiredForSeason: "كتب اسم الزراعة المرتبطة بهاد الموسم، أو مسح الموسم.",
    tooLongName: "خلي اسم الأرض 60 حرف أو أقل.",
    tooLongCrop: "خلي ملاحظة الزراعة 80 حرف أو أقل.",
    tooLongSeason: "خلي اسم الموسم 40 حرف أو أقل.",
    errorHeading: "صلح هاد الخانات باش تكمل:",
    reviewError: "كاينة معلومات خاصها تصحيح. رجع للمرحلة المناسبة.",
  },
} as const;

export type M2MessageKey = keyof typeof m2Messages.en;

/** Reuses the original locale provider; no new language preference or storage. */
export function useM2Text(): (key: M2MessageKey) => string {
  const { locale } = useLocale();
  return (key: M2MessageKey) => m2Messages[locale][key];
}
```

**Expected:** one shared dictionary location (`src/i18n/`) with all new UI labels/error messages. If the TypeScript compiler flags a missing Darija key, add a reviewed counterpart; do not silently fall back to English. Keep user-provided crop names and season text as entered (not translated). Final agricultural/linguistic wording still requires human review.

## 4. Source file: `src/features/m2/parcelDraft.ts` — CREATE

This is **not** a backend request or approved domain model. Option values below are internal React display state. Crop names are free text; no catalog, crop IDs, scientific constraint, expected yield or recommendation is encoded.

```typescript
export type ZoneChoice = "" | "amir" | "moussa" | "other" | "unsure";
export type IrrigationChoice = "" | "drip-ui" | "surface-ui" | "other-ui" | "unsure";
export type LocationChoice = "none" | "manual";
export type PlannedSeasonChoice = "" | "known" | "unsure";
export type ParcelStep = 0 | 1 | 2 | 3;

/** React form draft only. Do NOT treat this as a server/API contract. */
export type ParcelDraft = {
  parcelName: string;
  zone: ZoneChoice;
  areaHa: string;
  irrigation: IrrigationChoice;
  locationChoice: LocationChoice;
  latitude: string;
  longitude: string;
  recentCrop: string;
  recentCropSeason: string;
  earlierCrop: string;
  earlierCropSeason: string;
  seasonChoice: PlannedSeasonChoice;
  plannedSeason: string;
};

export const emptyParcelDraft: ParcelDraft = {
  parcelName: "",
  zone: "",
  areaHa: "",
  irrigation: "",
  locationChoice: "none", // no coordinate is inferred or assigned
  latitude: "",
  longitude: "",
  recentCrop: "",
  recentCropSeason: "",
  earlierCrop: "",
  earlierCropSeason: "",
  seasonChoice: "",
  plannedSeason: "",
};

export type ParcelErrorField =
  | "parcelName" | "zone" | "areaHa" | "irrigation"
  | "latitude" | "longitude" | "recentCrop" | "recentCropSeason"
  | "earlierCrop" | "earlierCropSeason" | "seasonChoice" | "plannedSeason";

export type ParcelErrorCode =
  | "requiredZone" | "invalidArea" | "requiredIrrigation"
  | "invalidLatitude" | "invalidLongitude" | "requiredCoordinates"
  | "requiredSeasonMode" | "requiredSeasonText"
  | "cropRequiredForSeason" | "tooLongName" | "tooLongCrop" | "tooLongSeason";

export type ParcelErrors = Partial<Record<ParcelErrorField, ParcelErrorCode>>;

// Deliberately rejects scientific notation, units and non-decimal text.
// Commas are accepted for a user's decimal separator; no area is estimated.
function decimalInput(value: string): number | null {
  const clean = value.trim();
  if (!/^-?\d+(?:[.,]\d+)?$/.test(clean)) return null;
  const parsed = Number(clean.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function isCoordinateValid(value: string, min: number, max: number): boolean {
  const number = decimalInput(value);
  return number !== null && number >= min && number <= max;
}

/** Usability validation only; server/model requirements are not determined here. */
export function validateParcelStep(draft: ParcelDraft, step: 0 | 1 | 2): ParcelErrors {
  const errors: ParcelErrors = {};

  if (step === 0) {
    if (!draft.zone) errors.zone = "requiredZone";
    if (draft.parcelName.trim().length > 60) errors.parcelName = "tooLongName";
    if (draft.areaHa.trim() !== "") {
      const area = decimalInput(draft.areaHa);
      if (area === null || area <= 0) errors.areaHa = "invalidArea";
    }
  }

  if (step === 1) {
    if (!draft.irrigation) errors.irrigation = "requiredIrrigation";
    if (draft.locationChoice === "manual") {
      if (!draft.latitude.trim() || !draft.longitude.trim()) {
        if (!draft.latitude.trim()) errors.latitude = "requiredCoordinates";
        if (!draft.longitude.trim()) errors.longitude = "requiredCoordinates";
      } else {
        if (!isCoordinateValid(draft.latitude, -90, 90)) errors.latitude = "invalidLatitude";
        if (!isCoordinateValid(draft.longitude, -180, 180)) errors.longitude = "invalidLongitude";
      }
    }
  }

  if (step === 2) {
    if (!draft.seasonChoice) errors.seasonChoice = "requiredSeasonMode";
    if (draft.seasonChoice === "known" && !draft.plannedSeason.trim()) {
      errors.plannedSeason = "requiredSeasonText";
    }
    if (draft.plannedSeason.trim().length > 40) errors.plannedSeason = "tooLongSeason";
    for (const [cropKey, seasonKey] of [
      ["recentCrop", "recentCropSeason"],
      ["earlierCrop", "earlierCropSeason"],
    ] as const) {
      if (draft[cropKey].trim().length > 80) errors[cropKey] = "tooLongCrop";
      if (draft[seasonKey].trim().length > 40) errors[seasonKey] = "tooLongSeason";
      if (!draft[cropKey].trim() && draft[seasonKey].trim()) {
        errors[cropKey] = "cropRequiredForSeason";
      }
    }
  }

  return errors;
}

export function firstInvalidStep(draft: ParcelDraft): 0 | 1 | 2 | null {
  for (const step of [0, 1, 2] as const) {
    if (Object.keys(validateParcelStep(draft, step)).length) return step;
  }
  return null;
}
```

**Expected:** no implicit zone, crop, area, season or coordinates; the only default is explicit *absence of coordinates*. `0`, negative or malformed hectares fail **only when entered**; user-entered latitude/longitude are checked for syntactic range, never map-matched. Missing crop list does not block the demonstration; missing season can be explicitly marked unknown.

## 5. Source file: `src/components/forms/ChoiceGroup.tsx` — CREATE

A reusable native radio group. The legend provides accessible naming; each card is clickable/keyboard-selectable; error messages have a stable association. All options have readable text and hit areas ≥44px.

```tsx
"use client";

import { useId } from "react";

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type ChoiceGroupProps<T extends string> = {
  name: string;
  legend: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
  hint?: string;
  error?: string;
};

export function ChoiceGroup<T extends string>({
  name, legend, value, options, onChange, hint, error,
}: ChoiceGroupProps<T>) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      className="space-y-3"
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
    >
      <legend className="text-base font-bold text-forest">{legend}</legend>
      {hint && <p id={hintId} className="text-sm text-muted">{hint}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border bg-white px-4 py-3 text-ink transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-leaf ${value === option.value ? "border-forest bg-mint" : "border-[var(--border)] hover:border-leaf"}`}
          >
            <input
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--leaf)]"
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-describedby={describedBy}
            />
            <span className="min-w-0">
              <span className="block break-words font-semibold">{option.label}</span>
              {option.description && <span className="mt-1 block text-sm text-muted">{option.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && <p id={errorId} role="alert" className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
    </fieldset>
  );
}
```

## 6. Source file: `src/features/m2/ParcelJourney.tsx` — CREATE

State is owned once by the mounted screen, above conditional step content. It survives Back/Next and changes through M0's language provider. The only form submit is intercepted by `preventDefault()`, and the success screen explicitly denies persistence. **Do not add an API call, `localStorage` form draft or geolocation code.**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useM2Text } from "@/i18n/m2Messages";
import type { M2MessageKey } from "@/i18n/m2Messages";
import {
  emptyParcelDraft, firstInvalidStep, validateParcelStep,
} from "./parcelDraft";
import type {
  ParcelDraft, ParcelErrorField, ParcelErrors, ParcelStep,
  ZoneChoice, IrrigationChoice, LocationChoice, PlannedSeasonChoice,
} from "./parcelDraft";

export function ParcelJourney() {
  const tx = useM2Text();
  const [draft, setDraft] = useState<ParcelDraft>({ ...emptyParcelDraft });
  const [step, setStep] = useState<ParcelStep>(0);
  const [errors, setErrors] = useState<ParcelErrors>({});
  const [confirmed, setConfirmed] = useState(false);

  const stepLabels: M2MessageKey[] = ["step1", "step2", "step3", "step4"];

  function update<K extends keyof ParcelDraft>(key: K, value: ParcelDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function error(field: ParcelErrorField): string | undefined {
    const code = errors[field];
    return code ? tx(code) : undefined;
  }

  function goBack() {
    setErrors({});
    setStep((current) => (current > 0 ? (current - 1) as ParcelStep : current));
  }

  function submitLocalForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // IMPORTANT: no browser navigation, POST or remote save
    if (step < 3) {
      const currentErrors = validateParcelStep(draft, step as 0 | 1 | 2);
      if (Object.keys(currentErrors).length) {
        setErrors(currentErrors);
        return;
      }
      setErrors({});
      setStep((step + 1) as ParcelStep);
      return;
    }

    // Recheck every prior step before displaying the local confirmation state.
    const invalid = firstInvalidStep(draft);
    if (invalid !== null) {
      setStep(invalid);
      setErrors(validateParcelStep(draft, invalid));
      return;
    }
    setErrors({});
    setConfirmed(true); // no submission or persistence
  }

  function reset() {
    setDraft({ ...emptyParcelDraft });
    setErrors({});
    setStep(0);
    setConfirmed(false);
  }

  const zoneOptions: { value: ZoneChoice; label: string }[] = [
    { value: "amir", label: tx("zoneAmir") },
    { value: "moussa", label: tx("zoneMoussa") },
    { value: "other", label: tx("zoneOther") },
    { value: "unsure", label: tx("unsure") },
  ];
  const irrigationOptions: { value: IrrigationChoice; label: string }[] = [
    { value: "drip-ui", label: tx("irrigationDrip") },
    { value: "surface-ui", label: tx("irrigationSurface") },
    { value: "other-ui", label: tx("irrigationOther") },
    { value: "unsure", label: tx("unsure") },
  ];
  const locationOptions: { value: LocationChoice; label: string }[] = [
    { value: "none", label: tx("locationNone") },
    { value: "manual", label: tx("locationManual") },
  ];
  const seasonOptions: { value: PlannedSeasonChoice; label: string }[] = [
    { value: "known", label: tx("seasonKnown") },
    { value: "unsure", label: tx("seasonUnknown") },
  ];

  function labelForZone(): string {
    return zoneOptions.find((item) => item.value === draft.zone)?.label ?? tx("notProvided");
  }
  function labelForIrrigation(): string {
    return irrigationOptions.find((item) => item.value === draft.irrigation)?.label ?? tx("notProvided");
  }
  function display(value: string): string { return value.trim() || tx("notProvided"); }

  function reviewRow(label: string, value: string) {
    return (
      <div key={label} className="grid gap-1 border-b border-[var(--border)] py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
        <dt className="font-semibold text-forest">{label}</dt>
        <dd className="min-w-0 break-words text-ink"><bdi>{value}</bdi></dd>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="font-bold text-leaf">{tx("formEyebrow")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{tx("formTitle")}</h1>
        <p className="text-base text-ink">{tx("formIntro")}</p>
        <LocaleSwitcher />
        <p className="rounded-[var(--radius-md)] bg-mint p-3 text-sm text-forest">{tx("formPrivacy")}</p>
      </header>

      {confirmed ? (
        <Card className="space-y-5" >
          <div role="status" aria-live="polite" className="space-y-3">
            <h2 className="text-2xl font-bold text-forest">{tx("statusTitle")}</h2>
            <p>{tx("statusDescription")}</p>
            <p className="text-sm text-muted">{tx("recommendationsUnavailable")}</p>
          </div>
          <Button type="button" onClick={reset}>{tx("startAgain")}</Button>
          <Link href="/rotation" className="inline-flex min-h-11 items-center px-3 font-bold text-forest underline">{tx("cancel")}</Link>
        </Card>
      ) : (
        <>
          <nav aria-label={tx("progressLabel")}>
            <ol className="grid grid-cols-4 gap-2">
              {stepLabels.map((label, index) => (
                <li
                  key={label}
                  aria-current={step === index ? "step" : undefined}
                  className={`rounded-[var(--radius-sm)] px-2 py-3 text-center text-xs font-semibold sm:text-sm ${index === step ? "bg-forest text-white" : "bg-mint text-forest"}`}
                >
                  <span className="block">{index + 1}</span>
                  <span className="block break-words">{tx(label)}</span>
                </li>
              ))}
            </ol>
          </nav>
          <Card className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-leaf" aria-live="polite">
                {tx("stepCounter")} {step + 1} {tx("of")} 4
              </p>
              <h2 className="mt-1 text-2xl font-bold text-forest">{tx(stepLabels[step])}</h2>
              {step < 3 && <p className="mt-2 text-sm text-muted">{tx("requiredNote")}</p>}
            </div>

            <form noValidate onSubmit={submitLocalForm} className="space-y-6">
              {step === 0 && (
                <>
                  <TextField
                    label={tx("nameLabel")}
                    hint={tx("nameHint")}
                    placeholder={tx("namePlaceholder")}
                    error={error("parcelName")}
                    maxLength={60}
                    value={draft.parcelName}
                    onChange={(event) => update("parcelName", event.target.value)}
                  />
                  <ChoiceGroup
                    name="m2-zone"
                    legend={tx("zoneLabel")}
                    hint={tx("zoneHint")}
                    value={draft.zone}
                    options={zoneOptions}
                    onChange={(value) => update("zone", value)}
                    error={error("zone")}
                  />
                  <TextField
                    label={tx("areaLabel")}
                    hint={tx("areaHint")}
                    placeholder={tx("areaPlaceholder")}
                    type="text"
                    inputMode="decimal"
                    error={error("areaHa")}
                    value={draft.areaHa}
                    onChange={(event) => update("areaHa", event.target.value)}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <ChoiceGroup
                    name="m2-irrigation"
                    legend={tx("irrigationLabel")}
                    hint={tx("irrigationHint")}
                    value={draft.irrigation}
                    options={irrigationOptions}
                    onChange={(value) => update("irrigation", value)}
                    error={error("irrigation")}
                  />
                  <ChoiceGroup
                    name="m2-location"
                    legend={tx("locationLabel")}
                    hint={tx("locationHint")}
                    value={draft.locationChoice}
                    options={locationOptions}
                    onChange={(value) => {
                      update("locationChoice", value);
                      setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
                    }}
                  />
                  {draft.locationChoice === "manual" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        label={tx("latLabel")}
                        hint={tx("coordinatesHint")}
                        type="text"
                        inputMode="decimal"
                        error={error("latitude")}
                        value={draft.latitude}
                        onChange={(event) => update("latitude", event.target.value)}
                      />
                      <TextField
                        label={tx("lonLabel")}
                        hint={tx("coordinatesHint")}
                        type="text"
                        inputMode="decimal"
                        error={error("longitude")}
                        value={draft.longitude}
                        onChange={(event) => update("longitude", event.target.value)}
                      />
                    </div>
                  )}
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-cream p-4 text-sm text-muted">
                    {tx("mapLater")}
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="rounded-[var(--radius-md)] bg-mint p-4 text-sm text-forest">{tx("cropIntro")}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      label={tx("recentCrop")}
                      placeholder={tx("cropPlaceholder")}
                      maxLength={80}
                      error={error("recentCrop")}
                      value={draft.recentCrop}
                      onChange={(event) => update("recentCrop", event.target.value)}
                    />
                    <TextField
                      label={tx("recentCropSeason")}
                      hint={tx("cropSeasonHint")}
                      maxLength={40}
                      error={error("recentCropSeason")}
                      value={draft.recentCropSeason}
                      onChange={(event) => update("recentCropSeason", event.target.value)}
                    />
                    <TextField
                      label={tx("earlierCrop")}
                      placeholder={tx("cropPlaceholder")}
                      maxLength={80}
                      error={error("earlierCrop")}
                      value={draft.earlierCrop}
                      onChange={(event) => update("earlierCrop", event.target.value)}
                    />
                    <TextField
                      label={tx("earlierCropSeason")}
                      hint={tx("cropSeasonHint")}
                      maxLength={40}
                      error={error("earlierCropSeason")}
                      value={draft.earlierCropSeason}
                      onChange={(event) => update("earlierCropSeason", event.target.value)}
                    />
                  </div>
                  <ChoiceGroup
                    name="m2-season-choice"
                    legend={tx("seasonModeLabel")}
                    value={draft.seasonChoice}
                    options={seasonOptions}
                    onChange={(value) => update("seasonChoice", value)}
                    error={error("seasonChoice")}
                  />
                  {draft.seasonChoice === "known" && (
                    <TextField
                      label={tx("seasonLabel")}
                      hint={tx("seasonHint")}
                      maxLength={40}
                      error={error("plannedSeason")}
                      value={draft.plannedSeason}
                      onChange={(event) => update("plannedSeason", event.target.value)}
                    />
                  )}
                </>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted">{tx("reviewIntro")}</p>
                  <dl>
                    {reviewRow(tx("nameLabel"), display(draft.parcelName))}
                    {reviewRow(tx("zoneLabel"), labelForZone())}
                    {reviewRow(tx("areaLabel"), draft.areaHa.trim() ? `${draft.areaHa.trim()} ${tx("areaUnit")}` : tx("notProvided"))}
                    {reviewRow(tx("irrigationLabel"), labelForIrrigation())}
                    {reviewRow(tx("reviewLocation"), draft.locationChoice === "none"
                      ? tx("notProvided")
                      : `${tx("reviewUnverified")}: ${draft.latitude.trim()}, ${draft.longitude.trim()}`)}
                    {reviewRow(tx("recentCrop"), display(draft.recentCrop))}
                    {reviewRow(tx("recentCropSeason"), display(draft.recentCropSeason))}
                    {reviewRow(tx("earlierCrop"), display(draft.earlierCrop))}
                    {reviewRow(tx("earlierCropSeason"), display(draft.earlierCropSeason))}
                    {reviewRow(tx("reviewSeason"), draft.seasonChoice === "unsure" ? tx("userUnsure") : display(draft.plannedSeason))}
                  </dl>
                  <p className="rounded-[var(--radius-md)] bg-mint p-3 text-sm font-semibold text-forest">
                    {tx("recommendationsUnavailable")}
                  </p>
                </div>
              )}

              {Object.values(errors).some(Boolean) && (
                <p role="alert" className="rounded-[var(--radius-md)] border border-[var(--danger)] p-3 text-sm font-semibold text-[var(--danger)]">
                  {tx("errorHeading")}
                </p>
              )}

              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-between">
                {step === 0 ? (
                  <Link href="/rotation" className="inline-flex min-h-11 items-center justify-center px-4 font-semibold text-forest underline">
                    {tx("cancel")}
                  </Link>
                ) : (
                  <Button type="button" variant="outline" onClick={goBack}>{tx("back")}</Button>
                )}
                <Button type="submit">{step === 3 ? tx("confirm") : tx("next")}</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
```

**Expected:** controlled React state remains mounted while step components appear/disappear. The `aria-current="step"` progress item is read by assistive technology. Radio card groups, text labels, errors and the fallback for missing coordinates work in both directions. No form `action`, API URL, `fetch`, fake location or saved-parcel logic is present.

**Important privacy detail:** when a farmer selects the *no-coordinates* option after typing coordinates, the hidden drafts remain in React state to avoid unexpected loss on step changes, **but are never shown in review or used** while the no-coordinates option is active. Page exit/refresh discards the state. Future backend integration must explicitly exclude such inactive fields; M2 does not create a serialization payload.

## 6a. Source file: `src/features/m2/RotationScreen.tsx` — CREATE

```tsx
"use client";

import { Info, Sprout } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM2Text } from "@/i18n/m2Messages";

export function RotationScreen() {
  const { t } = useLocale();
  const tx = useM2Text();
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex items-center gap-3 text-forest">
          <Info aria-hidden="true" />
          <h1 className="text-2xl font-extrabold">{t("rotationTitle")}</h1>
        </div>
        <p className="text-ink">{t("rotationUnavailable")}</p>
        <p className="text-sm text-muted">{tx("recommendationsUnavailable")}</p>
      </Card>
      <Card className="space-y-4 bg-mint">
        <div className="flex items-center gap-3 text-forest">
          <Sprout aria-hidden="true" />
          <h2 className="text-xl font-bold">{tx("startParcel")}</h2>
        </div>
        <p className="text-ink">{tx("rotationIntro")}</p>
        <ActionLink href="/parcels/new">{tx("startParcel")}</ActionLink>
      </Card>
      <ActionLink href="/home" variant="outline">{t("backHome")}</ActionLink>
    </div>
  );
}
```

## 6b. Source file: `src/features/m1/HomeScreen.tsx` — REPLACE (full file)

**Only replace if §1 confirms the file is still compatible with the M1 version.** Preserve any post-M1 fixes from the actual repository by updating this full block and the related tests first, on `feature/m2-dev1`. The original M1 Home route remains the same.

```tsx
"use client";

import Link from "next/link";
import { ArrowUpRight, MapPinned, Sprout, UsersRound } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM2Text } from "@/i18n/m2Messages";

export function HomeScreen() {
  const { t } = useLocale();
  const tx = useM2Text();
  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <p className="font-semibold text-leaf">{t("demoModeTitle")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{t("homeTitle")}</h1>
        <p className="text-base text-muted">{t("homeDescription")}</p>
      </header>
      <Card className="space-y-4 bg-mint">
        <div className="flex items-center gap-3">
          <Sprout aria-hidden="true" className="text-forest" />
          <h2 className="text-xl font-bold text-forest">{t("nextCropTitle")}</h2>
        </div>
        <p className="text-base text-ink">{t("nextCropUnavailable")}</p>
        <ActionLink href="/rotation">{t("seeUnavailableRotation")}</ActionLink>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/parcels/new" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <Sprout aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("parcelTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{tx("parcelEntryDescription")}</p>
          <p className="mt-3 font-bold text-leaf">{tx("startParcel")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/map" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <MapPinned aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("mapTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("mapComing")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/community" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf sm:col-span-2">
          <UsersRound aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("communityTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("communityComing")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
      </div>
      <p className="text-sm text-muted">{t("homeNoLiveData")}</p>
    </div>
  );
}
```

## 6c. Route pages — REPLACE each **entire file**

### `src/app/(farmer)/(workspace)/parcels/new/page.tsx`

```tsx
import { ParcelJourney } from "@/features/m2/ParcelJourney";

export default function NewParcelPage() {
  return <ParcelJourney />;
}
```

### `src/app/(farmer)/(workspace)/rotation/page.tsx`

```tsx
import { RotationScreen } from "@/features/m2/RotationScreen";

export default function RotationPage() {
  return <RotationScreen />;
}
```

**Navigation:** M1's `PrimaryNav` marks `/parcels/*` as belonging to **Rotation**. Keep it unchanged: Home → Parcel card → `/parcels/new`, or Home → recommendation status → `/rotation` → Describe parcel → `/parcels/new`. The 5 navigation destinations are not expanded. No `/api`, `/recommendations`, `/parcels/[id]` or fake results page is created.

## 7. Complete automated tests — CREATE three files

Run these tests **after** creating the code in §§3–6. All counts below are *planned*, not observed. They use the existing M0/M1 Vitest + React Testing Library setup; do not add a second test runner. Form/component tests are intentionally independent of approved science schemas or real network calls.

### `tests/m2-parcel-validation.test.ts` — CREATE

```typescript
import { describe, expect, it } from "vitest";
import {
  emptyParcelDraft, firstInvalidStep, validateParcelStep,
} from "@/features/m2/parcelDraft";
import type { ParcelDraft } from "@/features/m2/parcelDraft";

function draft(overrides: Partial<ParcelDraft> = {}): ParcelDraft {
  return {
    ...emptyParcelDraft,
    zone: "amir",
    irrigation: "unsure",
    seasonChoice: "unsure",
    ...overrides,
  };
}

describe("M2 UI-only parcel validation", () => {
  it("requires an explicit zone but accepts unsure", () => {
    expect(validateParcelStep(draft({ zone: "" }), 0).zone).toBe("requiredZone");
    expect(validateParcelStep(draft({ zone: "unsure" }), 0)).toEqual({});
  });

  it("allows no parcel name or area", () => {
    expect(validateParcelStep(draft(), 0)).toEqual({});
  });

  it("checks entered hectares without calculating measurements", () => {
    expect(validateParcelStep(draft({ areaHa: "0" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "-1" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "abc" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "1e4" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "1,5" }), 0)).toEqual({});
    expect(validateParcelStep(draft({ areaHa: "2.25" }), 0)).toEqual({});
  });

  it("requires irrigation selection but allows an unknown method", () => {
    expect(validateParcelStep(draft({ irrigation: "" }), 1).irrigation).toBe("requiredIrrigation");
    expect(validateParcelStep(draft({ irrigation: "unsure" }), 1)).toEqual({});
  });

  it("never requires coordinates in no-location mode", () => {
    expect(validateParcelStep(draft({
      locationChoice: "none", latitude: "not used", longitude: "not used",
    }), 1)).toEqual({});
  });

  it("requires BOTH manual coordinates when that mode is selected", () => {
    expect(validateParcelStep(draft({ locationChoice: "manual" }), 1)).toMatchObject({
      latitude: "requiredCoordinates", longitude: "requiredCoordinates",
    });
    expect(validateParcelStep(draft({ locationChoice: "manual", latitude: "32" }), 1).longitude)
      .toBe("requiredCoordinates");
  });

  it("checks numeric coordinate ranges without inventing map positions", () => {
    expect(validateParcelStep(draft({
      locationChoice: "manual", latitude: "91", longitude: "0",
    }), 1).latitude).toBe("invalidLatitude");
    expect(validateParcelStep(draft({
      locationChoice: "manual", latitude: "0", longitude: "-181",
    }), 1).longitude).toBe("invalidLongitude");
    expect(validateParcelStep(draft({
      locationChoice: "manual", latitude: "32,1", longitude: "-6.2",
    }), 1)).toEqual({});
  });

  it("allows unknown season and requires typed label only if known", () => {
    expect(validateParcelStep(draft({ seasonChoice: "" }), 2).seasonChoice).toBe("requiredSeasonMode");
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "" }), 2).plannedSeason)
      .toBe("requiredSeasonText");
    expect(validateParcelStep(draft({ seasonChoice: "unsure" }), 2)).toEqual({});
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "My next season" }), 2))
      .toEqual({});
  });

  it("does not require a crop name or pretend to validate a crop catalog", () => {
    expect(validateParcelStep(draft({ recentCrop: "farmer's own crop note" }), 2)).toEqual({});
    expect(validateParcelStep(draft({ recentCropSeason: "last year" }), 2).recentCrop)
      .toBe("cropRequiredForSeason");
    expect(validateParcelStep(draft({ earlierCropSeason: "previous" }), 2).earlierCrop)
      .toBe("cropRequiredForSeason");
  });

  it("rejects overly long manually supplied values", () => {
    expect(validateParcelStep(draft({ parcelName: "x".repeat(61) }), 0).parcelName)
      .toBe("tooLongName");
    expect(validateParcelStep(draft({ recentCrop: "x".repeat(81) }), 2).recentCrop)
      .toBe("tooLongCrop");
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "x".repeat(41) }), 2).plannedSeason)
      .toBe("tooLongSeason");
  });

  it("rechecks all steps, not just the visible one", () => {
    expect(firstInvalidStep(draft({ zone: "" }))).toBe(0);
    expect(firstInvalidStep(draft({ irrigation: "" }))).toBe(1);
    expect(firstInvalidStep(draft({ seasonChoice: "" }))).toBe(2);
    expect(firstInvalidStep(draft())).toBeNull();
  });
});
```

### `tests/m2-parcel-journey.test.tsx` — CREATE

```tsx
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParcelJourney } from "@/features/m2/ParcelJourney";
import { LocaleProvider } from "@/i18n/LocaleProvider";

function renderJourney() {
  return render(<LocaleProvider><ParcelJourney /></LocaleProvider>);
}

async function reachStep2(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Béni Amir" }));
  await user.click(screen.getByRole("button", { name: "Next step" }));
}

async function reachStep3(user: ReturnType<typeof userEvent.setup>) {
  await reachStep2(user);
  await user.click(screen.getByRole("radio", { name: "I don't know" }));
  await user.click(screen.getByRole("button", { name: "Next step" }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("M2 guided parcel form", () => {
  it("starts with local-only notice, no values, and an accessible progress indicator", () => {
    renderJourney();
    expect(screen.getByRole("heading", { name: "Tell us about your parcel" })).toBeInTheDocument();
    expect(screen.getByText(/does not save or send information/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Parcel form steps" })).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to rotation" })).toHaveAttribute("href", "/rotation");
  });

  it("shows a required zone error and then accepts an explicit unknown", async () => {
    const user = userEvent.setup();
    renderJourney();
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Choose your irrigation zone/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Parcel basics" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "I don't know" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: "Water and location" })).toBeInTheDocument();
  });

  it("validates an entered area and preserves it on Back/Next", async () => {
    const user = userEvent.setup();
    renderJourney();
    await user.type(screen.getByRole("textbox", { name: /Approximate area in hectares/ }), "0");
    await user.click(screen.getByRole("radio", { name: "Béni Moussa" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Enter a number greater than zero/)).toBeInTheDocument();
    const area = screen.getByRole("textbox", { name: /Approximate area in hectares/ });
    await user.clear(area);
    await user.type(area, "1,5");
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByRole("textbox", { name: /Approximate area in hectares/ })).toHaveValue("1,5");
    expect(screen.getByRole("radio", { name: "Béni Moussa" })).toBeChecked();
  });

  it("shows no fabricated coordinates and validates manual entries only when chosen", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep2(user);
    expect(screen.queryByRole("textbox", { name: /Latitude/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Drip irrigation" }));
    await user.click(screen.getByRole("radio", { name: "I want to type my own coordinates" }));
    const lat = screen.getByRole("textbox", { name: /Latitude/ });
    const lon = screen.getByRole("textbox", { name: /Longitude/ });
    await user.type(lat, "91");
    await user.type(lon, "0");
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/latitude between -90 and 90/i)).toBeInTheDocument();
    await user.clear(lat);
    await user.type(lat, "32.1"); // supplied by tester, not invented by the app
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: "Crops and season" })).toBeInTheDocument();
  });

  it("accepts unknown planned season with empty crop history", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep3(user);
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Say whether you know the planned season/)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.getByText(/Nothing has been saved or sent/)).toBeInTheDocument();
  });

  it("keeps crop notes and the current step while switching English to Darija RTL", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep3(user);
    await user.type(screen.getByRole("textbox", { name: /Most recent crop/ }), "My crop note");
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(document.documentElement).toHaveAttribute("lang", "ary");
    expect(screen.getByRole("textbox", { name: /آخر زراعة/ })).toHaveValue("My crop note");
    expect(screen.getByRole("heading", { name: "الزراعات والموسم" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "مازال ما عارفش" }));
    await user.click(screen.getByRole("button", { name: "المرحلة الجاية" }));
    expect(screen.getByText("My crop note")).toBeInTheDocument();
  });

  it("confirms a local review without network requests, saving or recommendations", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderJourney();
    await reachStep3(user);
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "Confirm local review" }));
    expect(screen.getByRole("heading", { name: "Local review confirmed" })).toBeInTheDocument();
    expect(screen.getByText(/No parcel was saved, no information was sent/)).toBeInTheDocument();
    expect(screen.getByText(/Crop recommendations are unavailable/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("parcel")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Start a new local form" }));
    expect(screen.getByRole("heading", { name: "Parcel basics" })).toBeInTheDocument();
  });

  it("does not display hidden coordinates after switching back to no location", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep2(user);
    await user.click(screen.getByRole("radio", { name: "I don't know" }));
    await user.click(screen.getByRole("radio", { name: "I want to type my own coordinates" }));
    await user.type(screen.getByRole("textbox", { name: /Latitude/ }), "12");
    await user.type(screen.getByRole("textbox", { name: /Longitude/ }), "13");
    await user.click(screen.getByRole("radio", { name: /I don't have coordinates/ }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getAllByText("Not provided").length).toBeGreaterThan(0);
    expect(screen.queryByText(/12, 13/)).not.toBeInTheDocument();
  });
});
```

### `tests/m2-navigation.test.tsx` — CREATE

```tsx
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeScreen } from "@/features/m1/HomeScreen";
import { RotationScreen } from "@/features/m2/RotationScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

describe("M2 Home / Rotation links", () => {
  it("Home offers a real parcel-form link, while next-crop still opens unavailable rotation", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
    expect(screen.getByText(/No server save or recommendation/i)).toBeInTheDocument();
  });

  it("Rotation links to the parcel form without displaying scores or options", () => {
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Describe a parcel" })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByText(/Recommendations are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText(/suitability score/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
```

### Test execution and expected outcomes (PowerShell)

```powershell
# From repository root, on feature/m2-dev1, after all source files exist:
if ((git branch --show-current).Trim() -ne 'feature/m2-dev1') { throw 'Wrong branch.' }
npx --no-install vitest run tests/m2-parcel-validation.test.ts
if ($LASTEXITCODE -ne 0) { throw 'M2 validation tests failed.' }
npx --no-install vitest run tests/m2-parcel-journey.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'M2 wizard tests failed.' }
npx --no-install vitest run tests/m2-navigation.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'M2 navigation tests failed.' }
```

| Task check | Expected if source matches this guide (not an observed result) |
|---|---|
| `m2-parcel-validation` | **11** tests pass: required fields/unknown, optional inputs, positive area, optional coordinate range, crop notes, season, length limits and full recheck |
| `m2-parcel-journey` | **8** tests pass: step/locale preservation, validation, unverified location, local confirmation and no `fetch` |
| `m2-navigation` | **2** tests pass: working links and honest recommendation placeholder |
| Entire project | Existing M0/M1 tests must also pass; do **not** assume an exact grand total because real `main` may contain additional tests |

If any test fails, examine the **real installed code**, fix the issue, and update **both source file and this guide's full matching block** before committing. Never delete a regression test to make the suite green. `npx --no-install` ensures the already-installed local Vitest is used rather than unexpectedly fetching a new version.

## 8. Minimal and rerunnable documentation updates

Only two existing repository documents need small factual corrections when this code is actually implemented: **`README.md`** (its `/parcels/new` route must no longer say unavailable) and **`docs/system-design.md`** (the new parcel module, local-state life cycle and route ownership are architectural facts). **Do not modify** `docs/frontend-guide.md`, `docs/instructions.md`, `docs/documentation-strategy.md`, or `docs/01-cahier-des-charges.md`: M2 follows their existing roadmap, role allocation, rules and approved functional scope. Do not approve/edit the proposed data contract by implication.

The following **PowerShell script is rerunnable and does not regenerate other documents**. It updates the one known M1 README table row **only if present once**, skips it when already updated, and appends an M2 architecture section **only once**. It stops rather than damaging a README whose route row has evolved beyond the provided M1 baseline. Run from repository root **on the feature branch after implementation**, and review the diff.

```powershell
$ErrorActionPreference = 'Stop'
if ((git branch --show-current).Trim() -ne 'feature/m2-dev1') { throw 'Run documentation changes only on feature/m2-dev1.' }

# README.md — targeted factual status, NEVER a whole-file rewrite.
$readmePath = 'README.md'
$readme = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $readmePath))
$oldRow = '| `/parcels/new` | Parcel form unavailable until M2 |'
$newRow = '| `/parcels/new` | M2 guided local-only parcel form, optional manual coordinates, review; no server save or recommendations |'
if ($readme.Contains($newRow)) {
  Write-Host 'README parcel row already updated; skipping.'
} elseif ($readme.Contains($oldRow)) {
  if (([regex]::Matches($readme, [regex]::Escape($oldRow))).Count -ne 1) {
    throw 'Duplicate README parcel rows: inspect manually.'
  }
  $readme = $readme.Replace($oldRow, $newRow)
  if ($readme.Contains('## Implemented routes at M1')) {
    $readme = $readme.Replace('## Implemented routes at M1', '## Implemented routes through M2')
  }
  $readme += "`r`nM2 form entries exist only in page memory and disappear on refresh or route exit; the existing locale preference may persist. No parcel data is uploaded or saved.`r`n"
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) $readmePath), $readme, [System.Text.UTF8Encoding]::new($false))
} else {
  throw 'README parcel row differs from the supplied M1 guide. Inspect current main and revise this exact update and the guide, rather than overwriting it.'
}

# docs/system-design.md — concise, versioned architectural fact, appended ONCE.
$systemPath = 'docs/system-design.md'
$system = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $systemPath))
$marker = '<!-- M2-PARCEL-JOURNEY: implemented -->'
if ($system.Contains($marker)) {
  Write-Host 'M2 system-design note already exists; skipping.'
} else {
  $addition = @'

<!-- M2-PARCEL-JOURNEY: implemented -->
## M2 parcel journey — implementation state

- **Owner / route:** DEV1; `/parcels/new` mounts `src/features/m2/ParcelJourney.tsx`. `/home` and `/rotation` link to it; `/rotation` still renders recommendation-unavailable content only.
- **Module boundary:** `ParcelDraft` is a temporary React view model in `src/features/m2/parcelDraft.ts`; `ChoiceGroup` is a reusable presentational control. `src/i18n/m2Messages.ts` reads the existing `LocaleProvider` (`en` LTR, `ary` RTL) without another preference store.
- **UI inputs:** optional name/area/free-text history, explicitly selected zone/irrigation (unknown allowed), optional **user-entered unverified** coordinates or none, planned-season label or unknown. UI validation only; no approved crop IDs, scientific/season rules or recommendation adapter.
- **Lifetime:** form state survives wizard steps and locale switching **while mounted**; review/confirmation is local-only and resets on route exit or refresh. No parcel persistence, submission, map pin, geocoding, results or model/API contract.
- **Tests:** `tests/m2-*.test.*`, plus full lint/typecheck/test/build; future backend needs separately approved field definitions, validation, authorization and storage. The proposed data-science contract is not implemented.
'@
  $system += $addition
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) $systemPath), $system, [System.Text.UTF8Encoding]::new($false))
}

git diff -- README.md docs/system-design.md
git diff --check
```

**Expected README change:** `/parcels/new` status changes from “unavailable until M2” to local-only guided form, section heading updates from M1 to M2, and a short lifetime warning appears. **Expected architecture change:** a single `<!-- M2-PARCEL-JOURNEY: implemented -->` heading/section appears after existing content. Rerunning yields **skip**, no duplicated notes or changes. If current main's README or system design differs, repair the smallest factual sentence manually and document the exact amendment in **this guide**; do not force the script through another project's structure.

**Guide ↔ source parity:** after *every* source/test edit, compare that file's **complete** block above with the working implementation and update `docs/frontend/milestone-M2/M2-DEV1.md` in the same feature commit when code differs. If no text change is necessary, record `Guide reviewed: still accurate` in the completion record. Do **not** mass-copy files into all reference documents.

## 9. Full checks, manual acceptance and expected results

Execute from repository root on `feature/m2-dev1` **after** the task tests and the minimal documentation changes. Record command output; **no checks in this guide are claimed as already run**.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m2-dev1') { throw 'Wrong branch.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Lint failed. Fix before integration.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'TypeScript check failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Full Vitest suite failed, including M0/M1 regressions.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace/diff check failed.' }

# Start browser test session; after checking pages, use Ctrl+C.
npm run dev
```

**Expected:** each command exits `0`; all three M2 task-test files and all existing M0/M1 tests pass; the production build includes at least `/home`, `/rotation`, `/parcels/new`, `/map`, `/community`, `/profile`, `/`, `/access` and `/foundation-preview` if they existed on actual M1 main. **Do not claim those routes or totals as observed without checking the build output and browser.** No unapproved API, fake crop results, database, authentication or map dependency is added.

### Manual M2 acceptance record — mark each PASS / FAIL / NOT VERIFIED

| ID | Browser task and expected result |
|---|---|
| M2-A | From `/home`, open My parcel → `/parcels/new`. From `/home`, choose “See recommendation status” → `/rotation`; only **unavailable** text is displayed, with a separate link to the form. Primary tab *Rotation* remains active on `/parcels/new`. |
| M2-B | At **320 × 640**, **375 × 812** and a **1280 px** desktop width, all four steps remain readable; no horizontal scroll, truncation of Darija or covered final actions by the mobile bottom bar; labels and cards remain at least ~44 px high. |
| M2-C | With empty zone, Next displays a **plain-language required error** and stays on step 1. Choosing “I don't know” permits progress. Optional name/area remain blank without blocking. Area `0`, `-1`, `abc` fails; `1.5` and `1,5` pass. No hectares-to-water conversion or soil advice appears. |
| M2-D | On step 2, unknown irrigation is accepted, but a missing irrigation choice shows an error. Default location displays **no coordinate inputs, marker or invented position**. Choosing manual coordinates reveals both inputs; one missing or out of geographic range fails. Entered values are explicitly **unverified**. Switching to no coordinates does not display them in review. |
| M2-E | On step 3, crop history is optional free text; there is **no unapproved crop drop-down**. A season note without its crop name shows an error. Planned season demands either a written label or the explicit unknown choice. There are no model IDs, crop rankings or forecast seasons silently filled in. |
| M2-F | Enter a name, area, a crop note and planned season; move Back/Next repeatedly. Text, radio state and current step remain unchanged by those navigations. Switch `en` → `ary` → `en` halfway through; text is preserved, every visible heading/error/control translates, and `<html lang="ary" dir="rtl">` / `<html lang="en" dir="ltr">` update correctly. |
| M2-G | On step 4, review exactly **user-entered** details, clear “Not provided” / “I don't know” values, and an unverified marker for manually supplied coordinates. Confirm local review. The confirmation must say **nothing saved, sent or recommended**. Try Start a new local form: all form values reset. |
| M2-H | Check browser **Network**: proceeding and confirming creates no parcel POST, model request or third-party coordinate lookup. Inspect Application → Local Storage: no parcel key or saved-draft JSON; only existing locale preference may be stored. Reload or leave/re-enter `/parcels/new`: the in-memory form restarts (not a persistence failure). |
| M2-I | With keyboard only: Tab reaches language buttons, radios, text inputs, Back/Next and links; Space chooses radio, Enter submits the local form step; visible focus indicator and error text are present. Screen-reader smoke: fieldset legends label radio groups, labels identify inputs, `aria-current="step"` identifies progress and errors have `role="alert"`. |
| M2-J | Check Darija RTL at 320 px: logical spacing, card borders, `bdi` numbers, no English UI copy remaining except brand, user-entered strings and allowed technical notation. **Human Darija wording review** required before public demo. Test reduced-motion OS preference; no new animation is introduced. |
| M2-K | Regression: welcome language + audio text fallback, demo phone format UI, Home, Profile, Map-unavailable, Community-unavailable and `/foundation-preview` remain as M1/M0 established. Existing M0/M1 tests must remain green. No access/login changes. |
| M2-L | Inspect source with VS Code search for `fetch(`, `/api/`, `localStorage`, recommendation scores, crop IDs, geolocation, mock map points, fabricated water estimates. M2 files should contain **no such new integration/decision logic**; the local confirmation deliberately makes no network request. |

**Do not merge if an applicable acceptance item FAILS.** If a browser, screen reader or device is unavailable, record `NOT VERIFIED`, with date and reason; don't label it PASS. You may use Chrome DevTools responsive device sizes and Accessibility tree, but note they are emulation rather than an actual-phone test.

## 10. Troubleshooting / compatibility with actual M1 `main`

| Symptom | Safe resolution |
|---|---|
| Git says source branch or folder is already present | **Do not overwrite/delete the existing feature branch**. Check `git branch -a`, `git status`, `git log`; compare its history with `origin/main`. Continue only if it is the intended M2 branch; otherwise stop and reconcile. |
| `TextField` TypeScript props do not match | Inspect actual `src/components/ui/TextField.tsx` in main; adapt the complete M2 form block/this guide, preserving controlled inputs and error association. Do **not** replace the proven M0 control blindly. |
| `Button type="submit"` is rejected | Inspect actual `Button` typing. Native form button attributes should be forwarded; if they are not, safely adjust the **M2 usage** or make a separately tested backward-compatible primitive fix; then document/test the whole affected file in this guide. |
| Text persists across steps but disappears on locale change | Make sure M2 is under M1's existing `(farmer)/layout.tsx` provider; the provider must not be given `key={locale}` or remount the `ParcelJourney`. Use one state owner above conditional steps, not separate state per step. |
| Tests cannot find a radio or validation error | Check actual accessible label and `ChoiceGroup` legend, not CSS selectors. Match the visible bilingual wording in this guide. Review jsdom setup (M0/M1 already configured Testing Library). |
| `getByRole` returns more than one node | Scope with `within()` to an explicit fieldset/form, or query by exact translated name. Do not remove meaningful labels simply to satisfy tests. |
| `npm run build` reports duplicate Next.js `/` or route collisions | Preserve the M1 route-group topology. Do not create `src/app/page.tsx` again or duplicate an `(workspace)` page outside that group. |
| CSS color classes/radii are missing | Inspect actual Tailwind M0 configuration and `globals.css`. Keep existing tokens rather than installing an unrelated design-system framework; update M2 classes/guide together if token naming differs. |
| Browser says `window/localStorage is not defined` | Avoid browser storage in the parcel form; the existing locale provider is a client component and should guard browser-only access as M0 implemented. Keep `ParcelJourney`, `ChoiceGroup` and `RotationScreen` as client components. |
| Visual crop suggestions appear | This violates the unapproved model/data boundary. Remove the list/results, revert to optional free text and unavailable rotation; no heuristic or hardcoded crop catalog is allowed. |
| README updater stops because the old row is absent | This is **intentional**. Inspect the actual README route row, modify only the smallest stale sentence and update §8 of this guide to match what you really did. Never force a broad replacement. |
| `npm ci` changes lockfile or fails | Check Node/.nvmrc and committed lockfile, do not `npm update` to hide the issue. Only synchronize lockfile if an actual approved dependency was added. |
| Local merge has conflicts | Resolve against real latest `main`, keep newer working changes, update this guide/tests to reflect the resolution, rerun **all** checks before the merge commit. For a failed uncommitted merge, `git merge --abort` when safe. |
| `git push origin main` is denied by a ruleset | Ask an authorized repository admin to align GitHub branch rules with the team's no-PR workflow. Do **not** force-push or bypass mandatory rules. |

## 11. Commit on feature branch (no Pull Request)

First place **this downloaded guide** at `docs/frontend/milestone-M2/M2-DEV1.md` in your working repository, if you have not already done so. It is the **only new generated deliverable** outside the files you create yourself following these instructions. If any source block needed real-main reconciliation, save the corrected full block here **before committing**. There is no separate ZIP, guide for another milestone, or automatic overwrite of the five shared source documents.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m2-dev1') { throw 'Do not commit M2 changes on main.' }
$guide = 'docs/frontend/milestone-M2/M2-DEV1.md'
if (-not (Test-Path -LiteralPath $guide)) { throw "Copy the generated M2-DEV1.md to $guide before committing." }

git status --short
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Fix whitespace problems before staging.' }

# Stage only the M2 implementation, tests, guide, and the two necessary doc updates.
$stage = @(
  'src/i18n/m2Messages.ts',
  'src/features/m2/parcelDraft.ts',
  'src/features/m2/ParcelJourney.tsx',
  'src/features/m2/RotationScreen.tsx',
  'src/components/forms/ChoiceGroup.tsx',
  'src/features/m1/HomeScreen.tsx',
  'src/app/(farmer)/(workspace)/rotation/page.tsx',
  'src/app/(farmer)/(workspace)/parcels/new/page.tsx',
  'tests/m2-parcel-validation.test.ts',
  'tests/m2-parcel-journey.test.tsx',
  'tests/m2-navigation.test.tsx',
  'README.md', 'docs/system-design.md',
  'docs/frontend/milestone-M2/M2-DEV1.md'
)
foreach ($file in $stage) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Required file missing: $file" }
}
git add -- $stage
if ($LASTEXITCODE -ne 0) { throw 'git add failed.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Staged diff has whitespace problems.' }
git diff --cached --stat
git diff --cached -- README.md docs/system-design.md

# Before this commit, document the actual feature tests, npm checks and manual results.
# Verify no unexpected M0/M1, package-lock or proposed-contract changes are staged.
git commit -m "feat(m2): guided local parcel journey and deferred rotation"
if ($LASTEXITCODE -ne 0) { throw 'Feature commit failed.' }
if ((git status --porcelain).Count -ne 0) { throw 'Feature tree must be clean before merging.' }
git rev-parse HEAD  # record M2_FEATURE_SHA

# Optional remote feature-branch backup; creates NO PR. Skip if intentionally local-only.
# git push -u origin feature/m2-dev1
```

**Expected:** one feature commit containing all changed code, three complete M2 test files, this updated execution guide and only necessary README/architecture changes. No direct feature work on `main`. If branch CI is used, check its real `checks` outcome; a local test result is not proof of a green GitHub job.

## 12. Safe local merge into `main`, recheck, and push

**Perform only after every mandatory M2 task test, lint/typecheck/test/build and applicable manual acceptance check has passed on `feature/m2-dev1`, and the guide matches code.** Before integration, fetch remote `main` again. The source baseline can advance; if so, inspect the diff and solve conflicts without losing newer main work.

```powershell
$ErrorActionPreference = 'Stop'
if ((git status --porcelain).Count -ne 0) { throw 'Feature worktree must be clean.' }
if ((git branch --show-current).Trim() -ne 'feature/m2-dev1') { throw 'Start from feature/m2-dev1.' }

git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify remote main.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Cannot switch to main.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'main is not fast-forwardable; investigate.' }
if ((git status --porcelain).Count -ne 0) { throw 'main must be clean before merge.' }

git merge --no-ff --no-commit feature/m2-dev1
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Merge was not clean. Resolve deliberately or run git merge --abort when safe.'
  throw 'Stop: no merge commit until conflicts are resolved and the guide is synchronized.'
}

# Required checks on the actual MERGED TREE before the merge commit:
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree npm ci failed. Do NOT commit.' }
npx --no-install vitest run tests/m2-parcel-validation.test.ts tests/m2-parcel-journey.test.tsx tests/m2-navigation.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree M2 feature tests failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree TypeScript failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree full test suite failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree production build failed.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Merged staged diff failed whitespace validation.' }

# Rerun relevant manual Home -> Rotation -> Parcel -> Review -> Confirmation,
# keyboard + en/ary/RTL + mobile/desktop + M0/M1 regression checks.
# Only when all actual outcomes are recorded as acceptable:
git commit -m "merge(m2): validate parcel journey on main"
if ($LASTEXITCODE -ne 0) { throw 'Merge commit failed.' }
if ((git status --porcelain).Count -ne 0) { throw 'Merged main must be clean.' }
$localSha = (git rev-parse HEAD).Trim()
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'Push failed; do not force push. Inspect remote state/rules.' }
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify pushed main.' }
$remoteSha = (git rev-parse origin/main).Trim()
Write-Host "LOCAL_MAIN_SHA=$localSha"
Write-Host "REMOTE_MAIN_SHA=$remoteSha"
if ($localSha -ne $remoteSha) { throw 'main did not reach origin/main; do NOT begin M3.' }
```

**Why `--no-commit` matters:** it leaves the integration candidate available for tests **before** the merge commit exists. `git merge --abort` is the normal recovery before commitment when the merge can be safely aborted; return to `feature/m2-dev1`, correct source/tests/guide, recommit, and retry from updated `main`. **Do not** make direct feature fixes on `main` or publish a failing merge. If a conflict occurs, resolve it carefully and run the merged-tree checks; the snippet deliberately stops rather than committing partially resolved files.

**After push:** inspect the GitHub Actions run corresponding to the **actual new `main` SHA**, if the repository's M1 workflow runs checks on main pushes. Record its status only after viewing it; a matching SHA is **not** itself proof of green CI. When remote `main` and applicable checks are verified, M2 can be handed off. **Do not start M3** before that gate.

## 13. M2 completion log — fill with actual evidence, not predictions

```text
Milestone / owner: M2 / DEV1
Working branch: feature/m2-dev1
M2_BASELINE_SHA (origin/main after M1): ______________________________
M1 remote CI/verification evidence: _________________________________
Actual main deviations from supplied M1 guide: ______________________
Reconciled source / guide blocks (if any): ___________________________
Dependencies: NONE expected / actual changes: _______________________
M2 validation tests (actual count + PASS/FAIL): ______________________
M2 journey tests (actual count + PASS/FAIL): _________________________
M2 navigation tests (actual count + PASS/FAIL): ______________________
npm run lint (actual): ______________________________________________
npm run typecheck (actual): _________________________________________
npm run test (actual total, including M0/M1): ________________________
npm run build (actual): _____________________________________________
Manual 320 / 375 / 1280 px (browser + date): _________________________
Manual English/Darija and RTL (browser + date): ______________________
Keyboard, labels, validation, unknown choice: ________________________
No coordinates invented / unverified handling: ______________________
No save/POST/model result (Network/Storage review): __________________
M0/M1 route/audio/navigation regressions: ___________________________
Other manual items NOT VERIFIED (reason): ___________________________
README/status update: _______________________________________________
docs/system-design.md M2 note: ______________________________________
Other shared docs: NONE (if scope/rules/roadmap unchanged)
Guide reviewed: still accurate / updated paths: _____________________
M2_FEATURE_SHA: ____________________________________________________
Local merged-tree tests/build + manual: _____________________________
LOCAL_MAIN_SHA after merge: _________________________________________
REMOTE_MAIN_SHA after push: _________________________________________
GitHub Actions main result (if configured): _________________________
Deferred: approved crop taxonomy, location/map integration, server
validation, parcel persistence, recommendation API/model: NOT BUILT
Handoff: Only after all gates are verified may DEV1 start M3.
```

### Concise future-backend handoff (do not implement in M2)

- **Form UI:** `ParcelJourney` collects user-described values, with permissive unknowns and optional crop notes. Client checks handle basic usability, not server acceptance or agronomic eligibility.
- **State ownership:** one React component stores the draft while mounted; locale is the existing M0 preference. Confirmation is a *local visual state only*, **not** a submitted or saved record.
- **Location precision:** absent or user-typed unverified coordinates; the chosen irrigation zone is not an exact location. Map pin/verified geodata belongs to M3 and later approved integration.
- **Integration later:** the backend/model team must agree on required fields, canonical crops/seasons/units, safe parcel storage and authorization, validation, coordinate precision, and separate approved request/response contracts. **None are inferred from the proposed v0.1 briefing.**
- **Tests:** unit tests document accepted UI input shapes and errors; component tests document local navigation, RTL and confirmation without a network call. They are **not API contract tests**.

**STOP AFTER M2.** Only `M2-DEV1.md` is generated as the downloadable execution artifact. M3–M5 and backend/model implementations remain separate future milestones.
