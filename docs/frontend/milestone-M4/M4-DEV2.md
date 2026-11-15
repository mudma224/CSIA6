# flaht bladi — M4 Community, Calendar & Privacy-Safe Sharing UI — DEV2 execution guide

**Repository:** `mudma224/CSIA6` · **Destination:** `docs/frontend/milestone-M4/M4-DEV2.md`  
**Sole owner:** DEV2 · **Only working branch:** `feature/m4-dev2` · **Prepared:** 15 November 2026  
**Starting gate:** M0, M1, M2, **and M3** are implemented, checked, merged into and verified on `origin/main`. DEV1 hands off after M3. **Do not begin M5 before this M4 merge is validated.** No Pull Requests.

> **Baseline truth:** This guide was assembled from the requirements v1.2, `frontend-guide`, `instructions`, `system-design`, `documentation-strategy`, proposed science contract, design-system ZIP, the historical M1 guide, and the previously generated M2 and M3 guides. **The real live `main` source/CI was not available for direct inspection during authoring.** The M3 code blocks referenced below are the *guide's expectation*, not a claim about current GitHub code. §1 requires inspecting `origin/main` and aligning the complete replacement blocks with the real source **before copying them**. No npm, browser or automated application tests have been executed for your checkout; all test counts below are planned expectations, not observed passes.

## 0. M4 outcome, exact frontend boundary and farmer experience

M4 implements **only** the roadmap's **Community, calendar & sharing UI**:

1. `/community`: bilingual (`en` LTR, `ary` RTL), mobile-first, **empty initially**. A farmer can choose **Experience**, **Harvest for sale**, or **Partnership request**; enter the category-specific fields; receive accessible, plain-language errors; **review** the content; and explicitly **add it to a session-only, local preview list**. Filtering by type and removing one's own *locally created previews* work without a service or account. All items disappear on refresh, navigation away, or remount. The interface continuously says it is not a public community feed.
2. Sharing: each local preview can open an **explicit text preview**. The user must tick a confirmation that it contains **no personal contact details, precise location or private information** before invoking browser clipboard copy. This is an informed, **user-controlled** copy, not an automatic publication or privacy scanner. Copy failure gets a truthful fallback: select the preview text manually. **No public URL**, Facebook Share Dialog, WhatsApp link, phone exposure, server upload or external share operation exists in M4.
3. `/calendar`: a clearly labeled **unavailable state** because the supplied sources provide **no approved crop calendar with verified dates/windows, geographic applicability and agronomic review**. Do not invent static crop stages/dates, sowing windows or crop vocabulary. It is a discoverable page (Home card), not a sixth primary tab.
4. `/home`: preserve the M3 map link and M2 parcel/rotation links, change the Community card from "coming later" to "local preview only", and add a Calendar card. `/rotation` remains an unavailable recommendation placeholder. The existing five-tab mobile and sidebar navigation remains **Home / Rotation / Map / Community / Profile**.

**Allowed state:** controlled React form fields, local-only items created by the current page instance, form-specific *usability* validation, filter selection, in-page review and clipboard feedback. The list's temporary `local-*` keys are rendering identifiers, **not database identifiers or authentication**.

**Not allowed:** real community users or posts, public publication, persistence (`localStorage`, Supabase, IndexedDB, cookies or server), backend APIs/server actions, accounts/authorization, identity claims, prices or inventories attributed to actual sellers, live phone contact, report submission/moderation claims, model results, scores, crop IDs, calculations, invented parcel geography, satellite numbers or fabricated planting windows. **Only user-entered text** appears in this M4 feed; no fictional "community samples". Display approximate area only if the user supplies it; never infer coordinates.

**Privacy caveat:** Free text may itself contain private data. M4 does **not** certify a post as safe; the share dialog intentionally makes the user review and confirm it before clipboard copy. A future production service must supply moderation, permissions, privacy, consent, deletion and public sharing policy. M4's "Remove from preview" is **not** evidence of deleting a published post. The proposed `TEAM_BRIEFING_DATA_CONTRACT.md` relates to future recommendations and is **not** an approved API, crop vocabulary, calendar, or community schema.

**Design:** reuse M0–M3 `Button`, `Card`, `TextField`, `ActionLink`, `LocaleSwitcher`, M2 `ChoiceGroup`, existing `LocaleProvider`, design tokens (`forest` `#193D2B`, `leaf` `#39794F`, `mint`, `cream`, `canvas`, `--border`, `--danger`), and accessible 44px targets. The design ZIP is a **visual reference**, never a source of mock farmers/posts/crops/maps. No new visual framework or dependencies.

### Route/state matrix

| Path | At end of M3 | M4 behavior |
|---|---|---|
| `/community` | M1 unavailable placeholder | **M4 session-only composer → review → local list/filter/delete/share-preview** |
| `/calendar` | Not guaranteed to exist | **M4 honest unavailable calendar**; Home link; no vetted dates |
| `/home` | M3 parcel/map/unavailable community cards | **M4 correct Community status + Calendar link**, existing cards intact |
| `/rotation` | M2 recommendation unavailable | **Untouched** |
| `/parcels/new`, `/map`, `/profile`, `/`, `/access`, `/foundation-preview` | M0–M3 implementations | **Untouched; regression-tested** |

## 1. Windows PowerShell preflight: verify M3 is on remote `main`

Run **in VS Code → Terminal → PowerShell** from the `CSIA6` repo root. If you need to clone once, use `git clone https://github.com/mudma224/CSIA6.git` before the commands. **Do not** run `create-next-app`, download a ZIP of the repo, or reset working source. The current remote `main` is authoritative, not the earlier guide. These checks are necessary even if team members report that everything works.

```powershell
$ErrorActionPreference = 'Stop'
$root = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or -not $root) { throw 'Open the actual CSIA6 Git repository.' }
Set-Location $root
if (@(git status --porcelain).Count -ne 0) { throw 'Clean working tree required: commit or stash other work.' }
git remote -v # Confirm origin is mudma224/CSIA6; otherwise STOP.
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Could not verify remote baseline.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Cannot switch to main.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'main diverged; investigate rather than overwriting it.' }
$baseSha = (git rev-parse HEAD).Trim()
$originSha = (git rev-parse origin/main).Trim()
if ($baseSha -ne $originSha) { throw 'Local main and origin/main differ.' }
if (@(git status --porcelain).Count -ne 0) { throw 'Baseline tree is not clean.' }
Write-Host "M4_BASELINE_SHA=$baseSha"

$required = @(
  'package.json', 'package-lock.json', '.nvmrc', 'README.md',
  'src/app/globals.css', 'src/i18n/LocaleProvider.tsx', 'src/i18n/locale.ts',
  'src/i18n/messages.ts', 'src/i18n/m2Messages.ts', 'src/i18n/m3Messages.ts',
  'src/components/ui/Button.tsx', 'src/components/ui/Card.tsx',
  'src/components/ui/TextField.tsx', 'src/components/forms/ChoiceGroup.tsx',
  'src/components/m1/ActionLink.tsx', 'src/components/m1/LocaleSwitcher.tsx',
  'src/components/navigation/PrimaryNav.tsx',
  'src/features/m1/HomeScreen.tsx', 'src/features/m2/ParcelJourney.tsx',
  'src/features/m2/RotationScreen.tsx', 'src/features/m3/MapScreen.tsx',
  'src/app/(farmer)/(workspace)/community/page.tsx',
  'src/app/(farmer)/(workspace)/home/page.tsx',
  'src/app/(farmer)/(workspace)/map/page.tsx',
  'docs/frontend/milestone-M3/M3-DEV1.md',
  'docs/frontend-guide.md', 'docs/instructions.md', 'docs/system-design.md',
  'docs/documentation-strategy.md', 'docs/01-cahier-des-charges.md',
  'tests/m3-data.test.ts', 'tests/m3-map-screen.test.tsx'
)
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Expected M3 baseline file missing: $path. Reconcile the actual repository first."
  }
}
$trackedM3 = @(git ls-tree -r --name-only origin/main -- 'docs/frontend/milestone-M3/M3-DEV1.md')
if ($trackedM3 -notcontains 'docs/frontend/milestone-M3/M3-DEV1.md') {
  throw 'M3 guide is missing on origin/main. Do not start M4.'
}
Get-Content package.json
Get-Content .nvmrc
Get-Content src/i18n/LocaleProvider.tsx
Get-Content src/components/ui/Button.tsx
Get-Content src/components/ui/TextField.tsx
Get-Content src/components/forms/ChoiceGroup.tsx
Get-Content src/features/m1/HomeScreen.tsx
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/community/page.tsx'
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/home/page.tsx'
```

**Manual STOP/GO comparison:** confirm actual M3 `HomeScreen` still uses `useLocale()`, `useM2Text()`, and `useM3Text()`, M1 navigation still links `/community`, `Card` accepts `className`, `TextField` supports `label`, `hint`, `error`, `value`, `onChange`, `inputMode`, `maxLength`, and `Button` supports `type`/`variant`/`onClick`. Confirm `ChoiceGroup` has `value`, `name`, `legend`, `options`, `onChange`, and M0's provider controls `document.documentElement.lang/dir`. Confirm `/community` still has M1 `UnavailableScreen` unless the real `main` has already implemented it; **never overwrite a newer working community implementation**. Read M3's actual completion log and check real GitHub CI results; a file's presence **does not prove it passed tests**. If files/props differ, adjust the **entire affected M4 code block and tests in this guide** on the feature branch before pasting anything. Do not alter M3 history to hide differences.

```powershell
# Baseline verification before branching:
node -v                     # Compare with .nvmrc; M0 guide expected v22.22.2.
npm -v
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Baseline clean install failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Baseline lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Baseline typecheck failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Baseline test suite failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Baseline production build failed.' }

# Only after M3 baseline is proven and clean:
git switch -c feature/m4-dev2
if ($LASTEXITCODE -ne 0) { throw 'M4 branch may already exist; inspect it rather than deleting/recreating.' }
if ((git branch --show-current).Trim() -ne 'feature/m4-dev2') { throw 'Wrong branch.' }
Write-Host "M4 feature branch created from verified main: $baseSha"
```

**Dependencies:** **NONE new**. M4 uses installed React/Next/Lucide/Vitest/Testing Library and M2's `ChoiceGroup`. Do **not** run `npm install`, `npm update`, or change `package.json`/`package-lock.json` for this reference implementation. Keep `npm ci` reproducible. If actual source needs a justified dependency change, first record the reason and exact install/lockfile changes **in this guide**, then run `npm ci` and all checks again.

## 2. Exact CREATE/REPLACE inventory

| Repository-relative path | Action | Purpose |
|---|---|---|
| `src/i18n/m4Messages.ts` | **CREATE** | Complete `en`/`ary` community/calendar/share strings using existing locale |
| `src/features/m4/communityDraft.ts` | **CREATE** | UI-only temporary draft types, format checks, share text formatting; **not** API/domain models |
| `src/features/m4/CommunityScreen.tsx` | **CREATE** | Form, validation, review, local preview feed, filter, remove, clipboard/share consent |
| `src/features/m4/CalendarScreen.tsx` | **CREATE** | Vetted-calendar-unavailable page, no dates |
| `src/app/(farmer)/(workspace)/community/page.tsx` | **REPLACE ENTIRE FILE** | Connect `/community` to CommunityScreen |
| `src/app/(farmer)/(workspace)/calendar/page.tsx` | **CREATE** | Nested `/calendar` page using existing workspace layout |
| `src/features/m1/HomeScreen.tsx` | **REPLACE ENTIRE FILE** | M3 Home with accurate Community card and a Calendar link |
| `tests/m4-community-draft.test.ts` | **CREATE** | All form variants, optional fields, positive-format and share invariants |
| `tests/m4-community-screen.test.tsx` | **CREATE** | Validation, flow, filters, removal, locale/RTL, share consent and failure |
| `tests/m4-calendar-home.test.tsx` | **CREATE** | Calendar placeholder and Home links, no fabricated dates |
| `README.md` | **TARGETED, idempotent update** | Correct `/community` status, add `/calendar` |
| `docs/system-design.md` | **APPEND one marked note**, idempotent | Actual M4 components/routes and local data/privacy boundaries |
| `docs/frontend/milestone-M4/M4-DEV2.md` | **CREATE** | This full procedure; keep identical to implemented code |

**Untouched unless real facts change:** `src/i18n/messages.ts`, `LocaleProvider`, M0/M1 primitives, `src/i18n/m2Messages.ts`, `src/i18n/m3Messages.ts`, `PrimaryNav`, audio, Leaflet files/data, M2 parcel/rotation, root tokens/styles, `docs/frontend-guide.md`, `docs/instructions.md`, `docs/documentation-strategy.md`, `docs/01-cahier-des-charges.md`, proposed data-science contract, historical M0–M3 guides. Neither M4 nor DEV2 may make changes to model/API contracts or produce M5 work.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m4-dev2') { throw 'Implement M4 only on its branch.' }
New-Item -ItemType Directory -Force 'src/features/m4' | Out-Null
New-Item -ItemType Directory -Force 'src/app/(farmer)/(workspace)/calendar' | Out-Null
New-Item -ItemType Directory -Force 'docs/frontend/milestone-M4' | Out-Null
$createFiles = @(
  'src/i18n/m4Messages.ts', 'src/features/m4/communityDraft.ts',
  'src/features/m4/CommunityScreen.tsx', 'src/features/m4/CalendarScreen.tsx',
  'src/app/(farmer)/(workspace)/calendar/page.tsx',
  'tests/m4-community-draft.test.ts', 'tests/m4-community-screen.test.tsx',
  'tests/m4-calendar-home.test.tsx'
)
foreach ($file in $createFiles) {
  if (Test-Path -LiteralPath $file) { throw "CREATE file already exists: $file. Review; do not overwrite." }
}
# Copy/download this generated guide to docs/frontend/milestone-M4/M4-DEV2.md
# using VS Code. If it already exists there, compare rather than overwrite it.
code 'src/features/m1/HomeScreen.tsx'
code 'src/app/(farmer)/(workspace)/community/page.tsx'
```

For each **CREATE**, use VS Code Explorer → **New File**, paste its **complete** code block, and save with the path shown. For each **REPLACE**, review the existing file against M3, then replace **all** its content with the complete file below (or reconcile and update this guide if the actual baseline differs). **Never paste code fences into `.ts` or `.tsx` files**. Use PowerShell blocks only in the terminal. Use UTF-8 so Arabic letters remain intact.

## 3. `src/i18n/m4Messages.ts` — CREATE (complete bilingual dictionary)

This is a separate typed M4 namespace, like `m2Messages.ts` and `m3Messages.ts`, but uses the **same M0 locale provider**. No second store and no new dictionary routing.

```typescript
import { useLocale } from "@/i18n/LocaleProvider";

export const m4Messages = {
  en: {
    localOnly: "Local demo only · not published or saved",
    communityHeading: "Community preview",
    communityIntro: "Try writing an experience, harvest offer or partnership request. Only posts you add on this screen are shown; no real farmers can see them.",
    demoLimit: "This is not a live community. Items vanish when you leave or reload this page. No account, public posting or server storage is connected.",
    emptyTitle: "No local preview posts yet",
    emptyText: "Create one below to try the form. There are no sample or public posts.",
    noFilterResults: "There are no local previews of this type.",
    postsHeading: "Local preview posts",
    filterLegend: "Filter local posts",
    filterAll: "All types",
    typeExperience: "Experience",
    typeSale: "Harvest for sale",
    typePartnership: "Partnership request",
    createHeading: "Write a local post",
    typeLegend: "What do you want to share?",
    requiredHint: "Fields marked required must be completed before review.",
    experienceTitle: "Experience title (required)",
    experienceTitleHint: "A short title about what you want to share.",
    description: "Description (required)",
    descriptionHint: "Avoid phone numbers, precise addresses and other private details.",
    saleCrop: "Crop name (required)",
    saleCropHint: "Your own description; this is not a validated crop identifier.",
    saleQuantity: "Quantity (required)",
    saleQuantityHint: "Enter a positive approximate number; no inventory is verified.",
    saleUnit: "Quantity unit (required)",
    unitLegend: "Quantity unit",
    unitKg: "Kilograms (kg)",
    unitTonne: "Tonnes (t)",
    unitOther: "Another unit",
    unitUnknown: "I don't know the unit",
    salePrice: "Optional asking price (MAD)",
    salePriceHint: "Only a number you type; not a verified market price or a payment feature.",
    saleArea: "Approximate area (optional)",
    saleAreaHint: "Use a broad description only. Do not enter a precise address or coordinates.",
    partnershipPurpose: "Partnership purpose (required)",
    partnershipPurposeHint: "Briefly say what kind of collaboration you are looking for.",
    partnershipArea: "Broad area (required)",
    partnershipAreaHint: "For example, an irrigation zone. No precise location or map point is inferred.",
    requiredError: "Please complete this field before reviewing your preview.",
    quantityError: "Enter a positive number, such as 12 or 12.5.",
    priceError: "If you enter a price, use a positive number; otherwise leave it blank.",
    editDraft: "Edit draft",
    reviewAction: "Review local preview",
    reviewHeading: "Review before adding",
    reviewMessage: "This shows exactly what you entered. Adding only puts it in a temporary list on this page; it is not published, saved or sent.",
    addLocal: "Add to local preview",
    cancelReview: "Back to editing",
    addedNotice: "Added to this page's local preview only. Nothing was published or saved.",
    removedNotice: "Removed from this page's local preview only.",
    removeLocal: "Remove from preview",
    emptyValue: "Not provided",
    postType: "Type",
    postDescription: "Description",
    postTitle: "Title",
    postCrop: "Crop",
    postQuantity: "Quantity",
    postPrice: "Asking price",
    postArea: "Approximate area",
    postPurpose: "Purpose",
    postPartnershipArea: "Broad area",
    shareAction: "Review text to copy",
    shareHeading: "Review copyable text",
    shareWarning: "Text you entered may contain sensitive information. Review the full text yourself; this app cannot detect private details. Nothing is shared automatically.",
    shareConsent: "I checked the text and confirm it contains no private contact details, exact location or information I do not want to disclose.",
    shareConsentError: "Confirm after reviewing the text before copying.",
    shareTextLabel: "Text that can be copied",
    copyAction: "Copy reviewed text",
    copySuccess: "Text copied. You decide where, whether and with whom to share it.",
    copyFailure: "Copy did not work. Select the text above and copy it manually.",
    closeShare: "Close sharing preview",
    shareUnavailable: "There is no public post URL, automatic Facebook sharing or contact method in this local demonstration.",
    moderationUnavailable: "Public posting, contact details and report/moderation tools are unavailable until a real service and safeguards exist.",
    calendarHomeTitle: "Crop calendar",
    calendarHomeDescription: "No vetted planting windows yet. See the calendar availability status.",
    calendarHeading: "Crop calendar unavailable",
    calendarDescription: "Verified crop-specific planting and harvest windows have not been approved for this study area. We will not show guessed months or agricultural instructions.",
    calendarDataMissing: "No approved crop, source, season, review date or regional planting schedule is connected to this frontend.",
    calendarFuture: "A future calendar requires agronomic review and source attribution before dates are displayed.",
    backHome: "Back to home",
    rotationUnavailable: "Crop recommendations are also unavailable until the scientific/model handoff is approved.",
  },
  ary: {
    localOnly: "غير تجربة محلية · ما تنشر والو وما تحفظ والو",
    communityHeading: "تجربة مجتمع الفلاحة",
    communityIntro: "تقدر تكتب تجربة، عرض محصول للبيع، ولا طلب شراكة. غير اللي كتزيدو فهاد الصفحة كيبان هنا، وما كيشوفوهش فلاحة آخرين.",
    demoLimit: "هادا ماشي مجتمع مباشر. اللي زدتي كيمشي ملي كتخرج ولا كتعاود تحل الصفحة. ما كاين لا حساب لا نشر للعموم لا تخزين فالخادم.",
    emptyTitle: "مازال ما زدتي حتى منشور تجريبي",
    emptyText: "جرّب الاستمارة لتحت. ما كاينين لا منشورات ديال ناس حقيقيين لا أمثلة مفبركة.",
    noFilterResults: "ما كاين حتى منشور تجريبي من هاد النوع.",
    postsHeading: "المنشورات التجريبية المحلية",
    filterLegend: "صنّف المنشورات المحلية",
    filterAll: "جميع الأنواع",
    typeExperience: "تجربة",
    typeSale: "محصول للبيع",
    typePartnership: "طلب شراكة",
    createHeading: "كتب منشور تجريبي",
    typeLegend: "شنو بغيتي تشارك؟",
    requiredHint: "الخانات المطلوبة خاصها تعمّر قبل ما تراجع المنشور.",
    experienceTitle: "عنوان التجربة (ضروري)",
    experienceTitleHint: "عنوان قصير للتجربة ديالك.",
    description: "الشرح (ضروري)",
    descriptionHint: "ما تكتبش رقم الهاتف ولا العنوان الدقيق ولا شي معلومات خاصة.",
    saleCrop: "اسم المحصول (ضروري)",
    saleCropHint: "كتب الوصف ديالك. هادا ماشي معرّف محصول مصادق عليه.",
    saleQuantity: "الكمية (ضروري)",
    saleQuantityHint: "دخل رقم تقريبي موجب. المخزون ما متأكدينش منو.",
    saleUnit: "وحدة الكمية (ضروري)",
    unitLegend: "وحدة الكمية",
    unitKg: "كيلوغرام (kg)",
    unitTonne: "طن (t)",
    unitOther: "وحدة أخرى",
    unitUnknown: "ما عارفش الوحدة",
    salePrice: "الثمن المطلوب اختياري (درهم)",
    salePriceHint: "غير ثمن كتبتيه نتا، ماشي ثمن سوق متأكد منو ولا أداء إلكتروني.",
    saleArea: "المنطقة التقريبية (اختيارية)",
    saleAreaHint: "كتب غير منطقة عامة، بلا عنوان دقيق ولا إحداثيات.",
    partnershipPurpose: "سبب الشراكة (ضروري)",
    partnershipPurposeHint: "شرح باختصار نوع التعاون اللي كتقلب عليه.",
    partnershipArea: "المنطقة العامة (ضروري)",
    partnershipAreaHint: "بحال منطقة السقي، بلا موقع دقيق ولا نقطة فالخريطة.",
    requiredError: "عمر هاد الخانة قبل المراجعة.",
    quantityError: "دخل رقم موجب بحال 12 ولا 12.5.",
    priceError: "إلا دخلتي الثمن خاصو يكون رقم موجب، وإلا خليه خاوي.",
    editDraft: "بدل المسودة",
    reviewAction: "راجع المنشور المحلي",
    reviewHeading: "راجع قبل ما تزيد",
    reviewMessage: "هادا هو اللي كتبتي. إلا زدتيه غادي يبان غير مؤقتا فهاد الصفحة، ما غاديش يتنشر ولا يتحفظ ولا يتصيفط.",
    addLocal: "زيد للتجربة المحلية",
    cancelReview: "رجع للتعديل",
    addedNotice: "تزاد غير فالتجربة ديال هاد الصفحة. ما تنشر وما تحفظ والو.",
    removedNotice: "تحيد غير من التجربة ديال هاد الصفحة.",
    removeLocal: "حيد من التجربة",
    emptyValue: "ما تعطاتش المعلومة",
    postType: "النوع",
    postDescription: "الشرح",
    postTitle: "العنوان",
    postCrop: "المحصول",
    postQuantity: "الكمية",
    postPrice: "الثمن المطلوب",
    postArea: "المنطقة التقريبية",
    postPurpose: "الهدف",
    postPartnershipArea: "المنطقة العامة",
    shareAction: "راجع النص قبل النسخ",
    shareHeading: "راجع النص القابل للنسخ",
    shareWarning: "النص اللي كتبتي يقدر يحتوي على معلومات خاصة. راجعو كامل براسك، التطبيق ما كيقدرش يكتاشف المعلومات الخاصة. ما كيتشارك والو بوحدو.",
    shareConsent: "راجعت النص وكنأكد ما فيه لا رقم تواصل خاص لا موقع دقيق لا معلومة ما بغيتش نشاركها.",
    shareConsentError: "أكد من بعد مراجعة النص باش تقدر تنسخو.",
    shareTextLabel: "النص اللي تقدر تنسخو",
    copyAction: "نسخ النص المراجع",
    copySuccess: "تنسخ النص. نتا اللي كتقرر واش وفين ومع من تشاركو.",
    copyFailure: "ما قدرناش ننسخو. اختار النص اللي لفوق ونسخو يدويا.",
    closeShare: "سد معاينة المشاركة",
    shareUnavailable: "ما كاين لا رابط منشور عمومي لا مشاركة أوتوماتيكية لفيسبوك لا وسيلة تواصل فهاد التجربة.",
    moderationUnavailable: "النشر للعموم والتواصل والتبليغ والمراقبة مازال ما متوفرينش حتى تكون خدمة حقيقية وضمانات الحماية.",
    calendarHomeTitle: "تقويم الزراعة",
    calendarHomeDescription: "مازال ما كايناش مواعيد زراعة مراجعة. شوف حالة التقويم.",
    calendarHeading: "تقويم الزراعة مازال ما متوفرش",
    calendarDescription: "مواعيد الزرع والحصاد الخاصة بالمحاصيل فهاد المنطقة مازال ما تصادقش عليها. ما غاديش نعطيو شهور ولا تعليمات مخمنة.",
    calendarDataMissing: "ما كاين لا محصول مصادق عليه لا مصدر لا موسم لا تاريخ مراجعة لا برنامج محلي مربوط بهاد الواجهة.",
    calendarFuture: "التقويم فالمرحلة الجاية خاصو مراجعة فلاحية ومصادر واضحة قبل ما نعرضو التواريخ.",
    backHome: "رجع للرئيسية",
    rotationUnavailable: "حتى اقتراحات التناوب مازال ما متوفراش حتى تتم المصادقة على تسليم الفريق العلمي والنموذج.",
  },
} as const;

export type M4MessageKey = keyof typeof m4Messages.en;

export function useM4Text(): (key: M4MessageKey) => string {
  const { locale } = useLocale();
  return (key: M4MessageKey) => m4Messages[locale][key];
}
```

**Localization check:** TypeScript's static key set prevents accidental missing keys on the English side; the Darija side must have the **same keys**. The tests in §9 assert this parity. Review Darija crop/community terminology with a speaker before release; this guide does not assert linguistic approval.

## 4. `src/features/m4/communityDraft.ts` — CREATE (UI view model, no API schema)

These are **presentation-only**, **in-memory** strings. They are not a database table, an agricultural vocabulary, a model contract, a verified marketplace listing or an account type. Format checks help users catch empty fields/malformed numeric text only; the server must revalidate anything used in the future.

```typescript
import type { M4MessageKey } from "@/i18n/m4Messages";

export type PostKind = "experience" | "sale" | "partnership";
export type PostFilter = "all" | PostKind;
export type QuantityUnit = "" | "kg" | "t" | "other" | "unknown";

export type CommunityDraft = {
  kind: "" | PostKind;
  title: string;
  description: string;
  crop: string;
  quantity: string;
  unit: QuantityUnit;
  price: string;
  area: string;
  purpose: string;
  partnershipArea: string;
};

export type DraftField = keyof CommunityDraft;
export type DraftError = "required" | "quantity" | "price";
export type DraftErrors = Partial<Record<DraftField, DraftError>>;

export type LocalPreviewPost = {
  /** Page-instance rendering key only. Never a persistent post/user ID. */
  id: string;
  draft: CommunityDraft;
};

export function emptyCommunityDraft(): CommunityDraft {
  return {
    kind: "", title: "", description: "", crop: "", quantity: "",
    unit: "", price: "", area: "", purpose: "", partnershipArea: "",
  };
}

/** A usability check for text typed in decimal inputs, not a price/inventory rule. */
export function isPositiveDecimalInput(raw: string): boolean {
  const text = raw.trim();
  if (!/^\d+(?:[.,]\d{1,3})?$/.test(text)) return false;
  return Number(text.replace(",", ".")) > 0;
}

export function validateCommunityDraft(draft: CommunityDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.kind) {
    errors.kind = "required";
    return errors;
  }
  if (!draft.description.trim()) errors.description = "required";

  if (draft.kind === "experience") {
    if (!draft.title.trim()) errors.title = "required";
  }
  if (draft.kind === "sale") {
    if (!draft.crop.trim()) errors.crop = "required";
    if (!draft.quantity.trim() || !isPositiveDecimalInput(draft.quantity)) {
      errors.quantity = "quantity";
    }
    if (!draft.unit) errors.unit = "required";
    if (draft.price.trim() && !isPositiveDecimalInput(draft.price)) {
      errors.price = "price";
    }
  }
  if (draft.kind === "partnership") {
    if (!draft.purpose.trim()) errors.purpose = "required";
    if (!draft.partnershipArea.trim()) errors.partnershipArea = "required";
  }
  return errors;
}

/** Explicitly labelled copy preview. Only from user-entered content, never server data. */
export function formatLocalPreviewText(
  draft: CommunityDraft,
  t: (key: M4MessageKey) => string,
): string {
  if (!draft.kind) return "";
  const lines = [t("localOnly")];
  const typeLabel = draft.kind === "experience"
    ? t("typeExperience")
    : draft.kind === "sale"
      ? t("typeSale")
      : t("typePartnership");
  lines.push(`${t("postType")}: ${typeLabel}`);
  const add = (label: M4MessageKey, value: string) => {
    if (value.trim()) lines.push(`${t(label)}: ${value.trim()}`);
  };
  if (draft.kind === "experience") add("postTitle", draft.title);
  if (draft.kind === "sale") {
    add("postCrop", draft.crop);
    if (draft.quantity.trim()) {
      const unit = draft.unit === "kg" ? t("unitKg")
        : draft.unit === "t" ? t("unitTonne")
          : draft.unit === "other" ? t("unitOther")
            : draft.unit === "unknown" ? t("unitUnknown") : "";
      add("postQuantity", `${draft.quantity.trim()}${unit ? ` ${unit}` : ""}`);
    }
    if (draft.price.trim()) add("postPrice", `${draft.price.trim()} MAD`);
    add("postArea", draft.area);
  }
  if (draft.kind === "partnership") {
    add("postPurpose", draft.purpose);
    add("postPartnershipArea", draft.partnershipArea);
  }
  add("postDescription", draft.description);
  return lines.join("\n");
}
```

**Notes:** `unknown` is an explicit unit choice, not silently assigned; a missing unit remains missing and blocks *local form review*, not a future transaction. A sale's "asking price" is unverified optional user text, not payment or market data. The formatter includes the **local-only label**; it does not automatically redact secrets from arbitrary free text. Review-and-consent is therefore mandatory before copy.

## 5. `src/features/m4/CommunityScreen.tsx` — CREATE (complete local interaction)

Use one mounted React component to own draft, filter, user-created previews and share review. This preserves input during locale switches and filtering; navigation away/reload discards it. The community form has no fetch or form submission to a server.

```tsx
"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ClipboardCopy, Info, MessageSquareText, Trash2 } from "lucide-react";
import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useM4Text } from "@/i18n/m4Messages";
import type { M4MessageKey } from "@/i18n/m4Messages";
import {
  emptyCommunityDraft, formatLocalPreviewText, validateCommunityDraft,
} from "./communityDraft";
import type {
  CommunityDraft, DraftErrors, DraftField, LocalPreviewPost,
  PostFilter, PostKind,
} from "./communityDraft";

type DescriptionBoxProps = {
  label: string;
  hint: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function DescriptionBox({ label, hint, value, error, onChange }: DescriptionBoxProps) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-bold text-forest">{label}</label>
      <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>
      <textarea
        id={id}
        rows={5}
        maxLength={1200}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        aria-invalid={Boolean(error)}
        className="block min-h-32 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3 text-base text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-leaf"
      />
      {error && <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
    </div>
  );
}

function LocalPostContent({ draft }: { draft: CommunityDraft }) {
  const t = useM4Text();
  const typeName = draft.kind === "experience" ? t("typeExperience")
    : draft.kind === "sale" ? t("typeSale") : t("typePartnership");
  const rows: { label: M4MessageKey; value: string }[] = [];
  if (draft.kind === "experience") rows.push({ label: "postTitle", value: draft.title });
  if (draft.kind === "sale") {
    rows.push({ label: "postCrop", value: draft.crop });
    const unit = draft.unit === "kg" ? t("unitKg")
      : draft.unit === "t" ? t("unitTonne")
        : draft.unit === "other" ? t("unitOther")
          : draft.unit === "unknown" ? t("unitUnknown") : "";
    rows.push({ label: "postQuantity", value: `${draft.quantity}${unit ? ` ${unit}` : ""}` });
    if (draft.price.trim()) rows.push({ label: "postPrice", value: `${draft.price} MAD` });
    if (draft.area.trim()) rows.push({ label: "postArea", value: draft.area });
  }
  if (draft.kind === "partnership") {
    rows.push({ label: "postPurpose", value: draft.purpose });
    rows.push({ label: "postPartnershipArea", value: draft.partnershipArea });
  }
  rows.push({ label: "postDescription", value: draft.description });
  return (
    <div className="space-y-3">
      <p className="font-semibold text-leaf">{typeName}</p>
      <dl className="space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-sm font-bold text-forest">{t(label)}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-ink">{value.trim() || t("emptyValue")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CommunityScreen() {
  const t = useM4Text();
  const [draft, setDraft] = useState<CommunityDraft>(emptyCommunityDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [reviewing, setReviewing] = useState(false);
  const [posts, setPosts] = useState<LocalPreviewPost[]>([]);
  const [filter, setFilter] = useState<PostFilter>("all");
  const [notice, setNotice] = useState<"added" | "removed" | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareConsent, setShareConsent] = useState(false);
  const [copyState, setCopyState] = useState<"consent" | "copied" | "failed" | null>(null);
  const nextLocalKey = useRef(0);

  const filteredPosts = posts.filter((post) => filter === "all" || post.draft.kind === filter);
  const selectedPost = posts.find((post) => post.id === sharingId);
  const shareText = selectedPost ? formatLocalPreviewText(selectedPost.draft, t) : "";

  function update<K extends DraftField>(field: K, value: CommunityDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
    setReviewing(false);
    setNotice(null);
  }

  function errorFor(field: DraftField): string | undefined {
    const error = errors[field];
    if (!error) return undefined;
    return t(error === "quantity" ? "quantityError"
      : error === "price" ? "priceError" : "requiredError");
  }

  function reviewDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Never submit a real HTTP form.
    const nextErrors = validateCommunityDraft(draft);
    setErrors(nextErrors);
    setNotice(null);
    if (Object.keys(nextErrors).length === 0) setReviewing(true);
  }

  function addLocalPreview() {
    const nextErrors = validateCommunityDraft(draft);
    setErrors(nextErrors);
    if (!reviewing || Object.keys(nextErrors).length > 0) return;
    nextLocalKey.current += 1;
    setPosts((current) => [
      { id: `local-${nextLocalKey.current}`, draft: { ...draft } }, ...current,
    ]);
    setDraft(emptyCommunityDraft());
    setReviewing(false);
    setFilter("all");
    setNotice("added");
  }

  function removeLocalPreview(id: string) {
    setPosts((current) => current.filter((post) => post.id !== id));
    if (sharingId === id) closeShare();
    setNotice("removed");
  }

  function openShare(id: string) {
    setSharingId(id);
    setShareConsent(false);
    setCopyState(null);
  }

  function closeShare() {
    setSharingId(null);
    setShareConsent(false);
    setCopyState(null);
  }

  async function copyReviewedText() {
    if (!selectedPost || !shareConsent) {
      setCopyState("consent");
      return;
    }
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(shareText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const typeOptions: { value: PostKind; label: string }[] = [
    { value: "experience", label: t("typeExperience") },
    { value: "sale", label: t("typeSale") },
    { value: "partnership", label: t("typePartnership") },
  ];
  const filterOptions: { value: PostFilter; label: string }[] = [
    { value: "all", label: t("filterAll") },
    ...typeOptions,
  ];

  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <p className="text-sm font-bold text-leaf">{t("localOnly")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{t("communityHeading")}</h1>
        <p className="text-base text-ink">{t("communityIntro")}</p>
        <p className="text-sm text-muted">{t("demoLimit")}</p>
        <LocaleSwitcher />
      </header>

      <section aria-labelledby="m4-posts-heading" className="space-y-4">
        <h2 id="m4-posts-heading" className="text-2xl font-bold text-forest">{t("postsHeading")}</h2>
        <div role="group" aria-label={t("filterLegend")} className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={filter === option.value ? "primary" : "outline"}
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="text-sm text-leaf">
          {notice === "added" ? t("addedNotice") : notice === "removed" ? t("removedNotice") : ""}
        </p>
        {posts.length === 0 ? (
          <Card className="space-y-2">
            <h3 className="text-lg font-bold text-forest">{t("emptyTitle")}</h3>
            <p className="text-muted">{t("emptyText")}</p>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card><p className="text-muted">{t("noFilterResults")}</p></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="min-w-0 space-y-4">
                <p className="text-xs font-bold text-leaf">{t("localOnly")}</p>
                <LocalPostContent draft={post.draft} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => openShare(post.id)}>
                    <ClipboardCopy aria-hidden="true" size={18} /> {t("shareAction")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => removeLocalPreview(post.id)}>
                    <Trash2 aria-hidden="true" size={18} /> {t("removeLocal")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {selectedPost && (
        <section aria-labelledby="m4-share-heading">
          <Card className="space-y-4 border border-leaf bg-mint">
            <h2 id="m4-share-heading" className="text-xl font-bold text-forest">{t("shareHeading")}</h2>
            <p className="text-sm text-ink">{t("shareWarning")}</p>
            <div className="space-y-2">
              <label htmlFor="m4-share-text" className="font-bold text-forest">{t("shareTextLabel")}</label>
              <textarea
                id="m4-share-text"
                readOnly
                rows={8}
                value={shareText}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-leaf"
              />
            </div>
            <label className="flex min-h-11 items-start gap-3 text-sm font-semibold text-forest">
              <input
                type="checkbox"
                checked={shareConsent}
                onChange={(event) => { setShareConsent(event.target.checked); setCopyState(null); }}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--leaf)]"
              />
              <span>{t("shareConsent")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={copyReviewedText}>{t("copyAction")}</Button>
              <Button type="button" variant="outline" onClick={closeShare}>{t("closeShare")}</Button>
            </div>
            {copyState && (
              <p role={copyState === "consent" || copyState === "failed" ? "alert" : "status"}
                className="text-sm font-semibold text-forest">
                {t(copyState === "consent" ? "shareConsentError"
                  : copyState === "copied" ? "copySuccess" : "copyFailure")}
              </p>
            )}
            <p className="text-sm text-muted">{t("shareUnavailable")}</p>
          </Card>
        </section>
      )}

      <section aria-labelledby="m4-compose-heading">
        <Card className="space-y-6">
          <div className="flex items-start gap-3">
            <MessageSquareText aria-hidden="true" className="shrink-0 text-leaf" />
            <div>
              <h2 id="m4-compose-heading" className="text-2xl font-bold text-forest">{t("createHeading")}</h2>
              <p className="mt-1 text-sm text-muted">{t("requiredHint")}</p>
            </div>
          </div>
          <form noValidate onSubmit={reviewDraft} className="space-y-5">
            <ChoiceGroup
              name="m4-kind"
              legend={t("typeLegend")}
              value={draft.kind}
              options={typeOptions}
              onChange={(value) => update("kind", value)}
              error={errorFor("kind")}
            />
            {draft.kind === "experience" && (
              <TextField
                label={t("experienceTitle")}
                hint={t("experienceTitleHint")}
                error={errorFor("title")}
                maxLength={100}
                value={draft.title}
                onChange={(event) => update("title", event.target.value)}
              />
            )}
            {draft.kind === "sale" && (
              <>
                <TextField
                  label={t("saleCrop")}
                  hint={t("saleCropHint")}
                  error={errorFor("crop")}
                  maxLength={80}
                  value={draft.crop}
                  onChange={(event) => update("crop", event.target.value)}
                />
                <TextField
                  label={t("saleQuantity")}
                  hint={t("saleQuantityHint")}
                  error={errorFor("quantity")}
                  inputMode="decimal"
                  maxLength={20}
                  value={draft.quantity}
                  onChange={(event) => update("quantity", event.target.value)}
                />
                <ChoiceGroup
                  name="m4-unit"
                  legend={t("unitLegend")}
                  value={draft.unit}
                  options={[
                    { value: "kg", label: t("unitKg") },
                    { value: "t", label: t("unitTonne") },
                    { value: "other", label: t("unitOther") },
                    { value: "unknown", label: t("unitUnknown") },
                  ]}
                  onChange={(value) => update("unit", value)}
                  error={errorFor("unit")}
                />
                <TextField
                  label={t("salePrice")}
                  hint={t("salePriceHint")}
                  error={errorFor("price")}
                  inputMode="decimal"
                  maxLength={20}
                  value={draft.price}
                  onChange={(event) => update("price", event.target.value)}
                />
                <TextField
                  label={t("saleArea")}
                  hint={t("saleAreaHint")}
                  maxLength={100}
                  value={draft.area}
                  onChange={(event) => update("area", event.target.value)}
                />
              </>
            )}
            {draft.kind === "partnership" && (
              <>
                <TextField
                  label={t("partnershipPurpose")}
                  hint={t("partnershipPurposeHint")}
                  error={errorFor("purpose")}
                  maxLength={150}
                  value={draft.purpose}
                  onChange={(event) => update("purpose", event.target.value)}
                />
                <TextField
                  label={t("partnershipArea")}
                  hint={t("partnershipAreaHint")}
                  error={errorFor("partnershipArea")}
                  maxLength={100}
                  value={draft.partnershipArea}
                  onChange={(event) => update("partnershipArea", event.target.value)}
                />
              </>
            )}
            {draft.kind !== "" && (
              <DescriptionBox
                label={t("description")}
                hint={t("descriptionHint")}
                value={draft.description}
                error={errorFor("description")}
                onChange={(value) => update("description", value)}
              />
            )}
            <Button type="submit">{t("reviewAction")}</Button>
          </form>
          {reviewing && (
            <div className="space-y-4 rounded-[var(--radius-lg)] border border-leaf bg-mint p-4"
              aria-labelledby="m4-review-heading">
              <h3 id="m4-review-heading" className="text-xl font-bold text-forest">{t("reviewHeading")}</h3>
              <p className="text-sm text-ink">{t("reviewMessage")}</p>
              <LocalPostContent draft={draft} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={addLocalPreview}>{t("addLocal")}</Button>
                <Button type="button" variant="outline" onClick={() => setReviewing(false)}>{t("cancelReview")}</Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      <Card className="flex items-start gap-3 bg-cream">
        <Info aria-hidden="true" className="shrink-0 text-leaf" />
        <p className="text-sm text-muted">{t("moderationUnavailable")}</p>
      </Card>
    </div>
  );
}
```

**Important behavior:** Native Enter submits the *local form review* (`preventDefault`) only; no request is emitted. Empty forms show `role="alert"` errors. Clicking filters changes only visibility of *this screen's locally added posts*. `LocalPostContent` renders user text as React text nodes (not `dangerouslySetInnerHTML`). Language switches re-render labels but do not recreate page-local state. The clipboard action is **never automatically invoked**, does not share a URL, and requires a positive confirmation **on every opening** of the share preview.

## 6. `src/features/m4/CalendarScreen.tsx` — CREATE

The requirements include a P1 calendar **only if crop stages/windows are source-checked**. The project sources and pending scientist contract **do not provide an approved calendar**. An honest unavailable page is the executable M4 calendar state. **Do not create speculative dates, placeholder calendar bars or unapproved crop suggestions.**

```tsx
"use client";

import { CalendarClock, Info } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Card } from "@/components/ui/Card";
import { useM4Text } from "@/i18n/m4Messages";

export function CalendarScreen() {
  const t = useM4Text();
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-bold text-leaf">{t("localOnly")}</p>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-forest">
          <CalendarClock aria-hidden="true" className="shrink-0" /> {t("calendarHeading")}
        </h1>
        <p className="text-base text-ink">{t("calendarDescription")}</p>
      </header>
      <LocaleSwitcher />
      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <Info aria-hidden="true" className="shrink-0 text-leaf" />
          <p className="text-ink">{t("calendarDataMissing")}</p>
        </div>
        <p className="text-sm text-muted">{t("calendarFuture")}</p>
        <p className="text-sm text-muted">{t("rotationUnavailable")}</p>
        <ActionLink href="/home" variant="outline">{t("backHome")}</ActionLink>
      </Card>
    </div>
  );
}
```

## 7. Route pages — REPLACE and CREATE (complete files)

### `src/app/(farmer)/(workspace)/community/page.tsx` — REPLACE ENTIRE FILE

M1 left an unavailable route here; replace only its page module. The shared M1 workspace layout supplies `AppFrame` and `LocaleProvider` through the enclosing M0/M1 route-group layout.

```tsx
import { CommunityScreen } from "@/features/m4/CommunityScreen";

export default function CommunityPage() {
  return <CommunityScreen />;
}
```

### `src/app/(farmer)/(workspace)/calendar/page.tsx` — CREATE

The parenthesized folders are **Next.js route groups**. The browser URL is `/calendar`, not `/(farmer)/(workspace)/calendar`.

```tsx
import { CalendarScreen } from "@/features/m4/CalendarScreen";

export default function CalendarPage() {
  return <CalendarScreen />;
}
```

## 8. `src/features/m1/HomeScreen.tsx` — REPLACE ENTIRE FILE

This preserves the **complete planned M3 Home screen** while changing Community copy to truthful local-demo wording and adding a discoverable Calendar card. Do not accidentally revert M2 parcel entry, M3 map description, M1 home/rotation content or navigation. **If actual `main` differs, reconcile the real contents and update this entire code block and the related tests BEFORE committing.**

```tsx
"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPinned, Sprout, UsersRound } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM2Text } from "@/i18n/m2Messages";
import { useM3Text } from "@/i18n/m3Messages";
import { useM4Text } from "@/i18n/m4Messages";

export function HomeScreen() {
  const { t } = useLocale();
  const t2 = useM2Text();
  const t3 = useM3Text();
  const t4 = useM4Text();
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
          <Sprout className="text-leaf" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("parcelTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t2("parcelEntryDescription")}</p>
          <p className="mt-3 font-bold text-leaf">{t2("startParcel")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/map" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <MapPinned aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("mapTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t3("homeMapAvailable")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/community" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <UsersRound aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("communityTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t4("communityIntro")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/calendar" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <CalendarDays aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t4("calendarHomeTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t4("calendarHomeDescription")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
      </div>
      <p className="text-sm text-muted">{t("homeNoLiveData")}</p>
    </div>
  );
}
```

**What is deliberately not modified:** `PrimaryNav` remains five items. `/calendar` is reachable from Home and Back to Home works. `/rotation` remains deferred. `/community` is neither a backend service nor a shared feed, despite its discoverable nav entry. Keep legacy `communityComing` M1 dictionary key if other pages/tests still reference it; there is no need to rewrite M1 translation history.

## 9. Complete M4 automated tests — CREATE three files

Use the existing Vitest, React Testing Library and `@testing-library/user-event` from M0–M3. These tests use **only user-typed data**; they do not seed fake public farmers or test a nonexistent service. No dependency changes are required. The full application suite must also run (§11).

### `tests/m4-community-draft.test.ts` — CREATE

```typescript
import { describe, expect, it } from "vitest";
import { m4Messages } from "@/i18n/m4Messages";
import {
  emptyCommunityDraft, formatLocalPreviewText,
  isPositiveDecimalInput, validateCommunityDraft,
} from "@/features/m4/communityDraft";

const en = (key: keyof typeof m4Messages.en) => m4Messages.en[key];

function experienceDraft() {
  return {
    ...emptyCommunityDraft(), kind: "experience" as const,
    title: "My farm note", description: "A short local experiment.",
  };
}

describe("M4 presentation-only community draft", () => {
  it("starts with no post kind or invented data", () => {
    const draft = emptyCommunityDraft();
    expect(draft.kind).toBe("");
    expect(draft.crop).toBe("");
    expect(draft.price).toBe("");
    expect(validateCommunityDraft(draft)).toEqual({ kind: "required" });
  });

  it("requires experience title and description", () => {
    expect(validateCommunityDraft({ ...emptyCommunityDraft(), kind: "experience" }))
      .toEqual({ description: "required", title: "required" });
    expect(validateCommunityDraft(experienceDraft())).toEqual({});
  });

  it("requires sale crop, positive quantity, unit and description", () => {
    expect(validateCommunityDraft({ ...emptyCommunityDraft(), kind: "sale" }))
      .toEqual({ description: "required", crop: "required", quantity: "quantity", unit: "required" });
  });

  it("accepts an explicitly unknown unit, not a silently defaulted one", () => {
    const draft = {
      ...emptyCommunityDraft(), kind: "sale" as const,
      description: "A local offer draft", crop: "My crop",
      quantity: "12", unit: "unknown" as const,
    };
    expect(validateCommunityDraft(draft)).toEqual({});
    expect(formatLocalPreviewText(draft, en)).toContain("I don't know the unit");
  });

  it("checks numeric input as a usability hint, not a market calculation", () => {
    for (const value of ["10", "12.5", "12,5", "0.25", " 2 "]) {
      expect(isPositiveDecimalInput(value)).toBe(true);
    }
    for (const value of ["", "0", "-5", "1e8", "abc", "2..5", "5 000"]) {
      expect(isPositiveDecimalInput(value)).toBe(false);
    }
  });

  it("rejects optional price only when a malformed value was entered", () => {
    const base = {
      ...emptyCommunityDraft(), kind: "sale" as const,
      crop: "Farmer description", description: "Offer preview",
      quantity: "5", unit: "kg" as const,
    };
    expect(validateCommunityDraft({ ...base, price: "" })).toEqual({});
    expect(validateCommunityDraft({ ...base, price: "-3" })).toEqual({ price: "price" });
    expect(validateCommunityDraft({ ...base, price: "25.5" })).toEqual({});
  });

  it("requires broad area and purpose for partnership, not coordinates", () => {
    expect(validateCommunityDraft({ ...emptyCommunityDraft(), kind: "partnership" }))
      .toEqual({ description: "required", purpose: "required", partnershipArea: "required" });
    expect(validateCommunityDraft({
      ...emptyCommunityDraft(), kind: "partnership",
      purpose: "Explore equipment sharing", partnershipArea: "Béni Amir",
      description: "A local conversation preview",
    })).toEqual({});
  });

  it("formats only selected user fields and marks copied content local", () => {
    const preview = formatLocalPreviewText(experienceDraft(), en);
    expect(preview).toContain("Local demo only");
    expect(preview).toContain("My farm note");
    expect(preview).not.toMatch(/https?:\/\/|latitude|longitude|user id/i);
    expect(formatLocalPreviewText(emptyCommunityDraft(), en)).toBe("");
  });

  it("keeps Darija and English message keys identical", () => {
    expect(Object.keys(m4Messages.en).sort()).toEqual(Object.keys(m4Messages.ary).sort());
    expect(m4Messages.ary.communityHeading).not.toBe(m4Messages.en.communityHeading);
  });
});
```

**Expected:** **9 tests**. The numeric helper does not determine crop quantity validity for sale transactions in production; it only checks typed form formatting. Unknown unit is intentionally allowed when explicitly selected.

### `tests/m4-community-screen.test.tsx` — CREATE

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityScreen } from "@/features/m4/CommunityScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

function renderCommunity() {
  return render(<LocaleProvider><CommunityScreen /></LocaleProvider>);
}

async function addExperience(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Experience" }));
  await user.type(screen.getByRole("textbox", { name: "Experience title (required)" }), "My demo story");
  await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "What I noticed on my own parcel");
  await user.click(screen.getByRole("button", { name: "Review local preview" }));
  await user.click(screen.getByRole("button", { name: "Add to local preview" }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

describe("M4 community is a LOCAL demo, not public posting", () => {
  it("starts with no invented public posts and explains the session limit", () => {
    renderCommunity();
    expect(screen.getByText("No local preview posts yet")).toBeInTheDocument();
    expect(screen.getByText(/Items vanish when you leave or reload/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove from preview" })).not.toBeInTheDocument();
  });

  it("shows a required type error without pretending to submit", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please complete this field");
    expect(screen.queryByRole("button", { name: "Add to local preview" })).not.toBeInTheDocument();
  });

  it("reviews and adds an experience only after explicit confirmation", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Experience" }));
    await user.type(screen.getByRole("textbox", { name: "Experience title (required)" }), "My demo story");
    await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "Learning by trying");
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByRole("heading", { name: "Review before adding" })).toBeInTheDocument();
    expect(screen.getByText("No local preview posts yet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to local preview" }));
    expect(screen.getByText("My demo story")).toBeInTheDocument();
    expect(screen.getByText(/Nothing was published or saved/)).toBeInTheDocument();
    expect(screen.queryByText("No local preview posts yet")).not.toBeInTheDocument();
  });

  it("filters only temporary items, then removes a locally authored preview", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Harvest for sale" }));
    expect(screen.getByText("There are no local previews of this type.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "All types" }));
    expect(screen.getByText("My demo story")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove from preview" }));
    expect(screen.getByText("No local preview posts yet")).toBeInTheDocument();
    expect(screen.getByText("Removed from this page's local preview only.")).toBeInTheDocument();
  });

  it("validates sale-specific fields and accepts optional price blank", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Harvest for sale" }));
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(3);
    await user.type(screen.getByRole("textbox", { name: "Crop name (required)" }), "User-named crop");
    await user.type(screen.getByRole("textbox", { name: "Quantity (required)" }), "12.5");
    await user.click(screen.getByRole("radio", { name: "Kilograms (kg)" }));
    await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "Session-only offer");
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByRole("heading", { name: "Review before adding" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to local preview" }));
    expect(screen.getByText("User-named crop")).toBeInTheDocument();
    expect(screen.getByText(/12\.5 Kilograms/)).toBeInTheDocument();
  });

  it("shows partnership purpose and broad area errors, then reviews user input", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Partnership request" }));
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(3);
    await user.type(screen.getByRole("textbox", { name: "Partnership purpose (required)" }), "Coordinate a shared equipment idea");
    await user.type(screen.getByRole("textbox", { name: "Broad area (required)" }), "Béni Moussa");
    await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "A draft conversation topic");
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByText("Coordinate a shared equipment idea")).toBeInTheDocument();
    expect(screen.getByText("Béni Moussa")).toBeInTheDocument();
  });

  it("keeps the typed draft during language switch and updates RTL", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Experience" }));
    await user.type(screen.getByRole("textbox", { name: "Experience title (required)" }), "Keep this draft");
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("textbox", { name: "عنوان التجربة (ضروري)" })).toHaveValue("Keep this draft");
    expect(screen.getByRole("heading", { name: "تجربة مجتمع الفلاحة" })).toBeInTheDocument();
  });

  it("prevents clipboard copy until explicit review consent", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    const copyArea = screen.getByRole("textbox", { name: "Text that can be copied" });
    expect((copyArea as HTMLTextAreaElement).value).toContain("Local demo only");
    await user.click(screen.getByRole("button", { name: "Copy reviewed text" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Confirm after reviewing");
    expect(writeText).not.toHaveBeenCalled();
    await user.click(screen.getByRole("checkbox", { name: /I checked the text and confirm/ }));
    await user.click(screen.getByRole("button", { name: "Copy reviewed text" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain("My demo story");
    expect(screen.getByText(/Text copied\. You decide where/)).toBeInTheDocument();
  });

  it("provides manual-copy fallback if browser clipboard access fails", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    await user.click(screen.getByRole("checkbox", { name: /I checked the text and confirm/ }));
    await user.click(screen.getByRole("button", { name: "Copy reviewed text" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Select the text above"));
    expect(screen.getByRole("textbox", { name: "Text that can be copied" })).toHaveAttribute("readonly");
  });

  it("requires new consent each time the share preview is opened", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    await user.click(screen.getByRole("checkbox", { name: /I checked the text and confirm/ }));
    await user.click(screen.getByRole("button", { name: "Close sharing preview" }));
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    expect(screen.getByRole("checkbox", { name: /I checked the text and confirm/ })).not.toBeChecked();
  });
});
```

**Expected:** **10 component tests**. Testing Library uses jsdom; it can test clipboard interaction only by a deliberate test stub, **not** claim OS clipboard permissions, actual browser sharing or privacy approval.

### `tests/m4-calendar-home.test.tsx` — CREATE

```tsx
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarScreen } from "@/features/m4/CalendarScreen";
import { HomeScreen } from "@/features/m1/HomeScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

describe("M4 calendar and dashboard", () => {
  it("renders an honest empty vetted-calendar state with no invented dates", () => {
    render(<LocaleProvider><CalendarScreen /></LocaleProvider>);
    expect(screen.getByRole("heading", { name: "Crop calendar unavailable" })).toBeInTheDocument();
    expect(screen.getByText(/will not show guessed months/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/home");
    expect(screen.queryByText(/2027|plant in March|harvest in June/i)).not.toBeInTheDocument();
  });

  it("links to the real M4 routes while preserving M2/M3 routes", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: /Crop calendar/ })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: /Farmer community/ })).toHaveAttribute("href", "/community");
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByRole("link", { name: /Tadla map/ })).toHaveAttribute("href", "/map");
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
  });

  it("never describes the community as a public service or promises live data", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByText(/Only posts you add on this screen/)).toBeInTheDocument();
    expect(screen.getByText(/No live weather/)).toBeInTheDocument();
    expect(screen.queryByText(/Community tools are not available yet/)).not.toBeInTheDocument();
  });
});
```

**Expected:** **3 tests**. Together the three M4 files have **22 planned tests** (9 + 10 + 3). The real runner output is authoritative. Note M0–M3 tests must continue passing even though the Home Community card has changed from an unavailable label to a session-only label.

### Task-specific test commands (PowerShell)

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m4-dev2') { throw 'Wrong branch.' }
npx vitest run tests/m4-community-draft.test.ts tests/m4-community-screen.test.tsx tests/m4-calendar-home.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'M4 tests failed. Fix code, tests and guide together.' }
```

**Expected, not observed:** Vitest discovers 22 M4 tests and reports zero failures. If an older M1/M2/M3 test asserts the original Community placeholder/route copy on Home, update that test **only to match the real M4 functionality**, document its exact replacement here, and rerun the full suite. Do not weaken assertions about M2 parcel state or M3 sourced map points. Do not claim clipboard functionality merely from a jsdom mock: §11 requires the real browser check.

## 10. Necessary documentation synchronization — precise and rerunnable

**Only these two existing repository docs need small factual edits:**

- `README.md`: `/community` now opens a **session-only local preview**, not an unavailable page; `/calendar` has a working **unavailable** route. Note what clipboard sharing does/does not do.
- `docs/system-design.md`: append the factual M4 community modules, route, state lifetime, consent and missing backend/calendar seams.

**No changes needed** to `docs/frontend-guide.md` (ownership/roadmap unchanged), `docs/instructions.md` (no rule change), `docs/documentation-strategy.md` (same guide-code process), or `docs/01-cahier-des-charges.md` (P1/local-demo scope and calendar missing-source rule already specified). The proposed data-science contract is unchanged/unapproved. Do not rewrite shared docs or historical M1–M3 guides. Run the script only when implementation and tests are working; it is **safe to rerun**. If an expected README line has been customized, **STOP** and update exactly the corresponding real row plus the specific script/code block *in this M4 guide*, rather than forcing a blanket replacement.

```powershell
$ErrorActionPreference = 'Stop'
if ((git branch --show-current).Trim() -ne 'feature/m4-dev2') { throw 'Documentation updates belong on the M4 branch.' }
$enc = [System.Text.UTF8Encoding]::new($false)

# README: exact one-line community status, add calendar line only if absent.
$readmePath = (Join-Path (Get-Location).Path 'README.md')
$original = [System.IO.File]::ReadAllText($readmePath)
$readme = $original
$oldCommunity = '| `/community` | Community unavailable until M4 |'
$newCommunity = '| `/community` | M4 session-only local community previews (experience, sale, partnership), filtering, review, removal and consent-gated copy; no public posts or saved records |'
$calendarRow = '| `/calendar` | M4 vetted-calendar-unavailable page; no approved planting dates, crop stages or inferred schedule |'
if ($readme.Contains($newCommunity)) {
  Write-Host 'README community row already updated; skipped.'
} elseif ($readme.Contains($oldCommunity)) {
  if (([regex]::Matches($readme, [regex]::Escape($oldCommunity))).Count -ne 1) {
    throw 'Duplicate community rows in README; inspect manually.'
  }
  $readme = $readme.Replace($oldCommunity, $newCommunity)
  Write-Host 'README community row updated.'
} else {
  throw 'README /community row does not match M3 guide baseline. Inspect and update the smallest factual line + this guide.'
}
if ($readme.Contains($calendarRow)) {
  Write-Host 'README calendar row already present; skipped.'
} elseif ($readme.Contains($newCommunity)) {
  $readme = $readme.Replace($newCommunity, $newCommunity + "`n" + $calendarRow)
  Write-Host 'README calendar row inserted.'
} else {
  throw 'Could not find updated community row to insert calendar status.'
}
$oldHeadings = @('## Implemented routes through M2', '## Implemented routes through M3', '## Implemented routes at M1')
$newHeading = '## Implemented routes through M4'
if (-not $readme.Contains($newHeading)) {
  $foundHeadings = @($oldHeadings | Where-Object { $readme.Contains($_) })
  if ($foundHeadings.Count -eq 1) {
    $readme = $readme.Replace($foundHeadings[0], $newHeading)
  } else {
    throw 'README heading differs: inspect it and update this precise instruction.'
  }
}
# If an unchanged historical M1 README still says there are no map features,
# correct that single outdated factual sentence (M3 has a real sourced map).
$staleMapSentence = 'No APIs, database, real user accounts, map\s+features or agricultural recommendation calculations exist\.'
$staleMapMatches = [regex]::Matches($readme, $staleMapSentence)
if ($staleMapMatches.Count -gt 1) { throw 'Duplicate stale map claims in README; inspect manually.' }
if ($staleMapMatches.Count -eq 1) {
  $readme = [regex]::Replace($readme, $staleMapSentence,
    'No application APIs, database, real user accounts or agricultural recommendation calculations exist. M3 provides a sourced reference map and external OSM basemap tiles.')
  Write-Host 'README obsolete no-map claim corrected.'
}
$readmeMarker = '<!-- M4-LOCAL-COMMUNITY: implemented -->'
if (-not $readme.Contains($readmeMarker)) {
  $readme += "`n`n" + $readmeMarker + "`nM4 community entries, review and post removal live only in the mounted page's React memory. They disappear on refresh/navigation. Copy sharing requires review and consent; no public post/link, phone contact, report submission, login, storage or real farmer feed. The crop calendar is unavailable until reviewed source data exists.`n"
}
if ($readme -ne $original) {
  [System.IO.File]::WriteAllText($readmePath, $readme, $enc)
  Write-Host 'README updated; reruns will skip completed changes.'
}

# Architecture: append a concise, marked M4 implementation note once.
$systemPath = (Join-Path (Get-Location).Path 'docs/system-design.md')
$system = [System.IO.File]::ReadAllText($systemPath)
$systemMarker = '<!-- M4-COMMUNITY-CALENDAR: implemented -->'
if ($system.Contains($systemMarker)) {
  Write-Host 'system-design M4 note already present; skipped.'
} else {
  $m4Note = @'

## M4 session-only community and unavailable calendar — implemented frontend boundary

<!-- M4-COMMUNITY-CALENDAR: implemented -->
- **Owner / routes:** DEV2; `/community` mounts `src/features/m4/CommunityScreen.tsx`; `/calendar` mounts `src/features/m4/CalendarScreen.tsx`; Home links to both. The five-tab `PrimaryNav`, M2 parcel/Rotation and M3 map stay unchanged.
- **UI model:** `src/features/m4/communityDraft.ts` defines unapproved **presentation-only** draft strings, basic client usability checks and user-reviewed share text formatting; not a community API/database schema or approved crop vocabulary. `src/i18n/m4Messages.ts` consumes existing `LocaleProvider` for `en`/LTR and `ary`/RTL.
- **State lifetime:** no seed posts; only locally created in-memory previews, category filter, in-page review/removal and clipboard-copy consent. Nothing is submitted, persisted, authenticated or publicly posted. Removing one is not remote deletion. No phone/WhatsApp contact, Facebook link, report submission or claim of moderation.
- **Calendar boundary:** no approved crop calendar, seasons, crop stages, planting dates or source-reviewed windows were supplied; `/calendar` explains the unavailable status without inventing dates. Recommendation/model contract remains deferred.
- **Tests / later backend:** `tests/m4-community-draft.test.ts`, `tests/m4-community-screen.test.tsx`, `tests/m4-calendar-home.test.tsx` and bilingual/mobile/browser/clipboard acceptance. Future backend needs moderation, consent/privacy, authorization, real data storage, share URL and independently approved agronomic calendar sources.
'@
  [System.IO.File]::WriteAllText($systemPath, $system.TrimEnd() + "`n`n" + $m4Note.Trim() + "`n", $enc)
  Write-Host 'system-design M4 note appended.'
}
git diff -- README.md docs/system-design.md
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Documentation diff has errors.' }
```

**Expected:** exactly one updated `/community` row, one `/calendar` row, one marked README note, one marked M4 system-design section, and correction of an older M1 no-map claim only if it still exists; rerunning produces **no extra text**. If the README already documents these facts differently, review the existing text instead of adding duplicates. Any necessary manual correction must be described **precisely in this guide**, staged with its code and tested. Do not duplicate executable source in the shared architecture document.

**Mandatory code ↔ guide parity:** For **every changed line** in the M4 TypeScript/TSX files, route files, Home, tests, README, or install instructions, check the corresponding **complete block in this `M4-DEV2.md`**. Update both in the same M4 commit when they diverge; otherwise record `Guide reviewed: still accurate`. Preserve all M0–M3 regression functionality. Never use the source's historical code blocks to overwrite the newer real implementation of earlier milestones.

## 11. Full feature verification, browser acceptance and troubleshooting

Execute **on `feature/m4-dev2` from repository root**. Do not suppress TypeScript issues with `any`/`@ts-ignore`, disable tests or change CSS tokens to hide a bug. Each failed step blocks merge. Run the task tests first, then the exact full gate:

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m4-dev2') { throw 'Wrong branch.' }
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Clean lockfile install failed.' }
npx vitest run tests/m4-community-draft.test.ts tests/m4-community-screen.test.tsx tests/m4-calendar-home.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'M4 feature tests failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'TypeScript failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Full regression suite failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Next.js production build failed.' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Diff whitespace/error check failed.' }
npm run dev
# Open http://localhost:3000/community , /calendar and /home.
# Run the manual checks below; use Ctrl+C to stop the dev server.
```

**Planned results, NOT claims of execution:** `npm ci` succeeds with unchanged committed lockfile; the M4 task suite discovers **22 tests**; `npm run lint`, `typecheck`, full tests and build exit `0`; Next.js has the new `/calendar` route and a functioning `/community` route; existing `/map`, `/parcels/new`, `/rotation`, `/profile`, `/`, `/access`, and `/foundation-preview` still build. The full-suite count depends on **actual** `main`, not historical guide totals. M4 introduces **no server endpoint, network post operation, account or recommendation output**.

### Manual M4 acceptance checklist (record PASS / FAIL / NOT VERIFIED with browser and date)

| ID | Browser action / observable outcome | Actual |
|---|---|---|
| M4-01 | Open `/home` → Community card describes a local preview, not an unavailable/live community; Calendar card leads to `/calendar`; existing parcel, map and rotation links still work | ___ |
| M4-02 | `/community` starts with **zero** items. Empty state, no sample farmers, "not published/saved" disclaimer and five-tab nav are visible | ___ |
| M4-03 | With no selected post type, Review gives readable error and does not add an item. Select Experience and leave title/description empty; both errors are associated with the controls | ___ |
| M4-04 | Enter Experience title/description → Review shows typed content **without** adding it → Back to editing preserves values → Review → Add to local preview shows exactly one item | ___ |
| M4-05 | Sale: requires user-entered crop/positive quantity/unit/description; incorrect `0`, `-3`, `abc` fails; valid `12.5` passes; price and broad area may be blank; `unknown` unit is an explicit choice | ___ |
| M4-06 | Partnership: requires purpose, broad area and description; no precise coordinates, phone field or external contact method is requested | ___ |
| M4-07 | Filter All / Experience / Harvest / Partnership; empty filtered category reports no local items; Remove deletes **only** a local preview, with no server/delete claim | ___ |
| M4-08 | Enter draft, switch `en`→`ary`→`en`: input remains and labels translate; `<html lang="ary" dir="rtl">` then `<html lang="en" dir="ltr">`. Filter and share review stay usable in RTL | ___ |
| M4-09 | Open share: full readonly text appears, no outgoing action occurs. Copy before confirmation shows error; confirming then copying works in supported secure browser context, and clipboard text includes "Local demo only" | ___ |
| M4-10 | Deny clipboard permission / use browser without Clipboard API: copy error and selectable textarea fallback appear. Close then reopen: consent **resets unchecked**. No public link or Facebook auto-post exists | ___ |
| M4-11 | Reload `/community` or navigate away and back: post previews vanish. A language preference may persist under M0, **but community content does not**. Browser Storage shows no new post keys | ___ |
| M4-12 | `/calendar` states no reviewed calendar exists; no crop schedule, month range, sowing/harvest dates, fabricated agricultural calendar or recommendation. Back to Home works | ___ |
| M4-13 | Mobile 320×568 and 375×812: no horizontal overflow, long Darija labels wrap, bottom nav isn't covered, cards/form fields and copy controls remain tappable (≥44px) | ___ |
| M4-14 | Desktop 1280px: sidebar visible, two-column card layout, forms readable; text and focus states remain high contrast | ___ |
| M4-15 | Keyboard-only Tab/Shift+Tab/Enter/Space navigate native radio choices, filter buttons, textarea, review, checkbox and copy. Focus visible; errors announced; screen reader has labels, fieldsets and live status | ___ |
| M4-16 | Browser Network: adding/removing/filtering/copying posts sends **no application API request**; M3 map may request OSM tiles on `/map` as already documented. No persistence/auth/analytics introduced by M4 | ___ |
| M4-17 | Regression: `/map` still shows its sourced points, filters, attribution and empty categories; `/parcels/new` wizard still keeps state across steps and locales; `/rotation` still says unavailable | ___ |
| M4-18 | Existing welcome, access demo, profile and M0 audio/`/foundation-preview` behave unchanged; no new approved audio is falsely claimed | ___ |

**Manual record rule:** a check is `PASS` only if actually performed and observed, `FAIL` if not working, and `NOT VERIFIED` if the browser/environment is missing. **Do not merge if a mandatory check fails.** For accessibility, screen-reader inspection is separate from jsdom unit tests. Browser clipboard support typically depends on HTTPS/localhost and permissions; the fallback must remain usable.

### Troubleshooting reference (do not silently change architecture)

| Symptom | What to check / exact repair principle |
|---|---|
| `Cannot find module '@/i18n/m4Messages'` | Confirm exact path/casing and M0 alias; `m4Messages.ts` is CREATE, not a modification to `messages.ts`. |
| `useLocale must be used within...` | Ensure M1 `(farmer)/layout.tsx` provides existing `LocaleProvider`; do not mount a second provider in M4. |
| Buttons/radios do not accept props | Compare *actual* M0 Button / M2 ChoiceGroup with §1 assumptions; adapt **complete corresponding guide code and tests**. |
| TS error on ChoiceGroup generic / `kind` or `unit` | Confirm `ChoiceGroup` accepts a string union incl. empty current value; preserve explicit unselected state, do not assign a default type/unit. |
| `React Hook` or lint errors | Use hooks only at component top level; remove unused imports in both actual file and full guide block; rerun lint/tests. |
| JSDOM clipboard assertion fails | Use `Object.defineProperty` test stub and `waitFor`. JS DOM cannot verify actual OS clipboard; test in a real browser too. |
| Share consent survives close | Always reset `shareConsent` and `copyState` in both `openShare` and `closeShare`. |
| Text disappears on changing language | Do not key the component by `locale`, recreate draft state in `useEffect`, navigate on toggle or add a separate locale store. |
| Home link/build references outdated M3 code | Compare actual M3 Home (and `useM3Text`) before replacement. Keep map description and parcel link; update the full replacement block in this guide. |
| Existing M1 test expects Community unavailable | That is now stale *only where M4 actually changed the UI*. Update the affected assertion precisely and document the changed test here; do not remove M1 test coverage. |
| `calendar` 404 or duplicate route | Create `src/app/(farmer)/(workspace)/calendar/page.tsx`; search repo for an already existing `/calendar` page and reconcile rather than creating duplicate routes. |
| README script stops on unexpected row | Real README is authoritative; replace only the factual row and update this guide's exact command rather than regex-overwriting the full document. |
| `npm run build` fails with source differences | Fix actual code/guide parity on feature branch; no hidden API, no weakening TypeScript or test gates. |
| Merge conflicts | Stop; resolve against actual `main`, return to feature branch if implementation must change; rerun all checks before merge commit. |

### Compact frontend-to-backend handoff (documentation only, **not** implemented)

| Screen / activity | Exists in M4 | Must wait for a later approved backend/data decision |
|---|---|---|
| Community compose/review | Field-specific UI forms and client usability errors; draft in React memory | Real post schema, user authorization, private data validation, moderation/reporting, publication and storage |
| Community feed/filter/delete | Only user-created temporary cards and local filter/remove | Public/user-scoped feed, API pagination, auth-based edit/delete policy, abuse controls |
| Harvest listing | Farmer-typed crop name, quantity/unit and optional price/area preview | Approved field meanings, listing status, permissions, contact/commerce policy; **no inventory or prices verified** |
| Partnership | Farmer-entered purpose, broad area and description preview | Safe communication/consent workflow and privacy limits |
| Share | Readonly user-reviewed text, consent-gated browser clipboard, manual fallback | Real public safe URL (if ever approved), public sharing, contact and data-redaction safeguards |
| Calendar | Clear missing-reviewed-source screen | Approved crop calendar source, species/season/region scope, source date, agronomic reviewer and publication policy |
| Rotation | Still unavailable from previous milestone | Data-science contract/model approval and later API integration, **not in M4** |

## 12. Commit validated M4 implementation on the feature branch — NO PR

Once **M4 task tests + full checks + mandatory manual acceptance** pass and the documentation script has been run, save **this exact guide** to `docs/frontend/milestone-M4/M4-DEV2.md`. Check the guide blocks against the real source **line for line**; reconcile anything changed during debugging and rerun affected checks before committing. Commit only M4 files plus necessary docs. No feature development on `main`.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m4-dev2') { throw 'Wrong branch.' }
git status --short
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Fix whitespace issues.' }

# Stage exactly the M4 changes. Do not stage unrelated files.
git add -- 'src/i18n/m4Messages.ts' `
  'src/features/m4/communityDraft.ts' `
  'src/features/m4/CommunityScreen.tsx' `
  'src/features/m4/CalendarScreen.tsx' `
  'src/app/(farmer)/(workspace)/community/page.tsx' `
  'src/app/(farmer)/(workspace)/calendar/page.tsx' `
  'src/features/m1/HomeScreen.tsx' `
  'tests/m4-community-draft.test.ts' `
  'tests/m4-community-screen.test.tsx' `
  'tests/m4-calendar-home.test.tsx' `
  'README.md' 'docs/system-design.md' `
  'docs/frontend/milestone-M4/M4-DEV2.md'
if ($LASTEXITCODE -ne 0) { throw 'Staging failed; inspect path names.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Fix staged whitespace.' }
git diff --cached --stat
git diff --cached --name-only
# Confirm no package/lockfile edits, backend files or unrelated changes are staged.
git commit -m 'feat(m4): add local community preview and deferred crop calendar'
if ($LASTEXITCODE -ne 0) { throw 'Feature commit failed.' }
$featureSha = (git rev-parse HEAD).Trim()
if (@(git status --porcelain).Count -ne 0) { throw 'Feature tree must be clean.' }
Write-Host "M4_FEATURE_SHA=$featureSha"
# OPTIONAL: push only the tested feature for backup/CI (does NOT create a PR).
# git push -u origin feature/m4-dev2
```

**Expected:** a focused feature commit including all changed executable files, test sources, `README.md`, `docs/system-design.md`, and **this guide**. If you had to change an old test due to a genuinely changed Home/Community string, **stage that test and document its exact replacement block in §9 above** before the commit; otherwise the guide and repository cannot be reproduced from one another. Avoid committing environmental `.env` files or app-generated builds.

## 13. Local uncommitted merge into `main`, full retest, push verification

Only proceed when the M4 feature branch is fully validated and its committed guide matches its code. **No Pull Requests.** GitHub rules must permit authorized tested local-merge pushes; ask the repository administrator to update incompatible rules legitimately, without bypassing required protection or force pushing.

```powershell
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Cannot switch to main.' }
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify remote.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'main diverged; do not force merge.' }
if (@(git status --porcelain).Count -ne 0) { throw 'main must be clean before merge.' }

# Preserve an uncommitted integration candidate for post-merge validation.
git merge --no-ff --no-commit feature/m4-dev2
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Merge could not complete cleanly. Resolve deliberately or use git merge --abort.'
  throw 'Merge conflict: no merge commit/push until reconciled and fully retested.'
}

# Run on the MERGED TREE, before making the merge commit.
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree npm ci failed; abort/fix.' }
npx vitest run tests/m4-community-draft.test.ts tests/m4-community-screen.test.tsx tests/m4-calendar-home.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree M4 tests failed; abort/fix.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree TypeScript failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree tests failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree production build failed.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Merged-tree staged diff failed.' }
# Rerun mandatory manual M4 journey and M0-M3 regression check in browser.
# Do NOT commit unless the merged-tree guide/source parity is still exact.

# ONLY after actual automated and manual checks succeed:
git commit -m 'merge(m4): validate local community and calendar on main'
if ($LASTEXITCODE -ne 0) { throw 'Merge commit failed.' }
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'Push rejected; do not force push.' }
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Remote verification fetch failed.' }
$localSha = (git rev-parse HEAD).Trim()
$remoteSha = (git rev-parse origin/main).Trim()
if ($localSha -ne $remoteSha) { throw 'Pushed origin/main does not match the validated local commit.' }
Write-Host "M4_INTEGRATED_SHA=$localSha"
Write-Host 'Verify the actual GitHub Actions main/checks job result separately before M5.'
```

**On a failure while merge is pending:** `git merge --abort` (only while a merge is active) restores the original `main` working tree; `git switch feature/m4-dev2`, repair the code/tests/**guide**, commit changes, retest, then retry the safe local merge. Do not commit a failed integration. On a remote rejection/new commits, **fetch and reconcile legitimate upstream changes**; never `git push --force`, skip checks or create a PR as an unplanned workaround. If GitHub CI fails after push, do **not** start M5: identify the failure and coordinate a properly tested fix.

### M4 completion record — populate with observed evidence

```text
Milestone / owner: M4 / DEV2
Baseline origin/main SHA after M3: ______________________
Branch: feature/m4-dev2
Actual M3 completion / remote CI gate: __________________
Actual M4 task tests (counts, date, output): ____________
Feature npm ci / lint / typecheck / full test / build: ___
Manual en/ary and document dir: ________________________
Manual 320/375px + desktop + keyboard/focus: ____________
Review, validation, filter, remove: _____________________
Copy consent / clipboard failure / privacy warning: ____
Calendar unavailable + M2/M3 regressions: ______________
Relevant docs changed: README.md, docs/system-design.md
Other shared docs changed (if genuinely required): _____
Guide vs every changed source/test block: ______________
Guide reviewed: still accurate (only if actually true): _
Feature commit SHA: ____________________________________
Uncommitted merge candidate tests / manual gate: _______
Final main merge commit SHA: ___________________________
Pushed origin/main SHA matches: ________________________
Actual main CI result (not just triggered): ____________
Outstanding failed/not-verified checks: _________________
Next owner/milestone: DEV2 / M5 — ONLY AFTER above gates
```

### Three-line handoff to DEV2's M5 (after verified promotion only)

1. **Implemented:** `/community` three-form local preview, review/filter/remove and consent-gated clipboard text; `/calendar` honest vetted-source-unavailable state; Home now links to both. All are `en`/`ary` and use the existing design/layout.
2. **Boundaries:** user-generated previews are page-memory only, no actual published feed/accounts/authorization/moderation/contacts/URL, no validated calendar, no backend and no recommendations. Existing parcel/map/rotation routes are unchanged.
3. **Next:** M5 may audit the **integrated** end-to-end frontend, accessibility/RTL/privacy/docs and future integration seams; do not author/execute M5 ahead of the verified `origin/main` M4 SHA. Record M4's observed checks and limitations, not estimates.

**STOP AFTER M4.** Deliver this file alone for the guide-generation task; follow it in VS Code to implement changes on `feature/m4-dev2`. Do not generate M5 or modify any repository source as a separate artifact in this guide-generation deliverable.
