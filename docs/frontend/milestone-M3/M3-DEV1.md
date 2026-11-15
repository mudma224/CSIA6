# flaht bladi — M3 Interactive Tadla Mapping — DEV1 execution guide

**Repository:** `mudma224/CSIA6` · **Target file:** `docs/frontend/milestone-M3/M3-DEV1.md`  
**Owner:** DEV1 · **Branch:** `feature/m3-dev1` · **Prepared:** 15 November 2026  
**Required baseline:** M0, M1 **and M2** committed, tested, merged into, and verified on `origin/main`. **Next owner:** DEV2 starts M4 only after M3 is verified on remote `main`.

> **Baseline and execution honesty.** This guide uses the supplied requirements, shared documents, design-system ZIP, historical M1 guide and produced `M2-DEV1.md`. I could not retrieve the actual live source of `mudma224/CSIA6/main`, or verify M2 has been integrated. The quoted M2 files below are **the guide's expected versions**, not assertions about the current checkout. **Do the PowerShell preflight in §1 and compare every file that will be replaced with real `origin/main`.** Adapt and synchronize the complete code blocks, tests and instructions **on the feature branch** if the real implementation differs. Neither the M3 code nor its test commands have been run in the user's repository; expected results below are not claimed successes.

## 0. What M3 implements, and what it cannot claim

M3 replaces `/map`'s M1 unavailable placeholder with a **client-only interactive OpenStreetMap basemap** using Leaflet + React Leaflet. It provides pan/zoom, map attribution, **two source-checked dam landmarks**, category filters, clickable map popups, an accessible keyboard-friendly list and detail panel, external source/directions links, empty categories, missing-tile feedback and English (`en`, LTR) / Moroccan Darija (`ary`, RTL). `/home` changes its map card from “coming later” to a truthful available-map description. All existing M2 parcel wizard inputs, review behavior, Rotation placeholder, M0 audio, primary navigation and UI tokens remain intact.

**Geographic truth and limits:**

- The published Tadla irrigated-perimeter study rectangle is an **orientation reference**, **not** an official parcel or irrigation-sector polygon. **Never draw it as a boundary.** The camera initially includes that published study extent **and** the two separately mapped, **off-perimeter** dam features; it is a cartographic viewport, not land ownership or hydraulic coverage.
- **Two verified-location water infrastructure examples only:** **Bin El Ouidane Dam** (`32.10682, -6.46409`, OSM way `504108035`) and **Ahmed El Hansali Dam** (`32.69320, -5.88843`, OSM way `385347001`). These are **representative points on mapped dam features**, **not gate/entrance coordinates** or high-precision surveyed coordinates. A research source links the respective dams with Béni Moussa/Béni Amir irrigation systems; the UI does **not** show operating status, volumes, levels, allocations or parcel water sufficiency.
- The source inventory contains **zero approved wholesale markets and zero approved agricultural suppliers**. Both filters therefore show a clear **empty** state. No fake POIs, shops, locations, inventories, prices or implied completeness.
- **No irrigation-sector boundaries**, arbitrary polygons, geocoded guesses, browser GPS, inferred parcel locations, satellite overlays, weather or scientific calculations. M2's manually typed coordinates stay within its **in-memory form**; M3 does **not** pretend a map point selected here is linked to or saved as that parcel's position. Map-pin entry into the parcel wizard requires its **own** later explicit consent/state-transfer design and review.
- `/rotation` stays **recommendations unavailable**; the data-science contract v0.1 remains **proposed**, and no API, crop IDs, algorithms, mock scores or results are added.
- Map tiles are an external **basemap imagery service**; curated markers are **static, checked reference data**. There is no backend. Tile failures must not hide the accessible source-checked list.

### Sources, verification and licensing for the two markers

| What is used | Source and exactly supported facts | How M3 labels it |
|---|---|---|
| Tadla study viewport | [Published study-area coordinates, 2025](https://www.tandfonline.com/doi/10.1080/10106049.2025.2471104): latitude 32°09′45″–32°33′01″ N; longitude 7°01′42″–6°23′48″ W. The cited article describes the two irrigated systems and the corresponding dams. | **General reference extent**, never a geographic polygon or parcel boundary |
| Bin El Ouidane | [Mapped OSM dam way 504108035, exposed with point coordinates by Mapcarta](https://mapcarta.com/W504108035); [OSM source feature](https://www.openstreetmap.org/way/504108035) | **Dam / approximate feature point**; outside published study view |
| Ahmed El Hansali | [Mapped OSM dam way 385347001, exposed with point coordinates by Mapcarta](https://mapcarta.com/W385347001); [OSM source feature](https://www.openstreetmap.org/way/385347001); an [academic study](https://www.mdpi.com/2073-4441/16/21/3108) independently locates the dam around 32°41′37″ N, 5°53′17″ W | **Dam / approximate feature point**; outside published study view |
| Basemap | [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/) and [OSM attribution guidance](https://www.openstreetmap.org/copyright) | `© OpenStreetMap contributors`, visible on-map; no tile bulk download/prefetch |

**Recorded source check:** 15 November 2026 (web references reviewed for preparation of this guide; no field survey, government GIS geometry or independent onsite verification). Before demo/deployment, re-open the sources, verify attribution/license and check every `lat`/`lng` and OSM way ID. If either marker cannot be substantiated, **remove its record**, update the unit tests and guide, and show the resulting empty state; **never invent a replacement**. Sources support the physical map features, **not** the current condition or safe access to each dam. The OpenStreetMap foundation's public tile servers are best-effort and subject to usage restrictions; do not stress-test or prefetch them.

**Design reference:** use existing M0–M2 `forest`, `leaf`, `mint`, `cream`, `border`, `radius-md` and `Card` surfaces. The supplied `Field_Shift_Design_System_Source.zip` is a **visual token source**, and its fictional mock maps/crop cards are **not data**. Maintain ≥44px touch targets and a readable list for keyboard/screen-reader users.

## 1. PowerShell preflight: prove M2 is really on remote `main`

Open the **existing** `CSIA6` repository in VS Code, select **Terminal → PowerShell**. Do not recreate a Next.js project, reset commits or assume M2 was merged merely because its guide exists. If the repository is not cloned, clone it once with `git clone https://github.com/mudma224/CSIA6.git` and open that folder.

```powershell
$ErrorActionPreference = 'Stop'
$root = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Open an existing CSIA6 Git checkout first.' }
Set-Location $root
if ((git status --porcelain).Count -ne 0) { throw 'Commit/stash unrelated work; start clean.' }
git remote -v  # Inspect: origin should be mudma224/CSIA6. Stop if it is not.
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify remote main.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Missing local main.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'main diverged: investigate first.' }
$baseSha = (git rev-parse HEAD).Trim()
$remoteSha = (git rev-parse origin/main).Trim()
if ($baseSha -ne $remoteSha) { throw 'main differs from origin/main.' }
if ((git status --porcelain).Count -ne 0) { throw 'Baseline working tree is not clean.' }
Write-Host "M3_BASELINE_SHA=$baseSha"

$required = @(
  'package.json', 'package-lock.json', '.nvmrc', 'README.md',
  'src/app/globals.css',
  'src/i18n/locale.ts', 'src/i18n/LocaleProvider.tsx',
  'src/i18n/messages.ts', 'src/i18n/m2Messages.ts',
  'src/components/ui/Button.tsx', 'src/components/ui/Card.tsx',
  'src/components/m1/ActionLink.tsx',
  'src/components/m1/LocaleSwitcher.tsx',
  'src/components/navigation/PrimaryNav.tsx',
  'src/features/m1/HomeScreen.tsx',
  'src/features/m2/ParcelJourney.tsx',
  'src/features/m2/RotationScreen.tsx',
  'src/features/m2/parcelDraft.ts',
  'src/app/(farmer)/(workspace)/map/page.tsx',
  'src/app/(farmer)/(workspace)/parcels/new/page.tsx',
  'src/app/(farmer)/(workspace)/rotation/page.tsx',
  'docs/frontend/milestone-M2/M2-DEV1.md',
  'docs/system-design.md', 'tests/m2-parcel-journey.test.tsx'
)
foreach ($file in $required) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
    throw "Required M2 baseline file missing: $file"
  }
}
$trackedM2 = @(git ls-tree -r --name-only origin/main -- 'docs/frontend/milestone-M2/M2-DEV1.md')
if ($trackedM2 -notcontains 'docs/frontend/milestone-M2/M2-DEV1.md') {
  throw 'M2 guide not present on origin/main; do NOT start M3.'
}
Get-Content package.json
Get-Content .nvmrc
Get-Content src/i18n/LocaleProvider.tsx
Get-Content src/i18n/locale.ts
Get-Content src/components/ui/Card.tsx
Get-Content src/features/m1/HomeScreen.tsx
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/map/page.tsx'
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/parcels/new/page.tsx'
Get-Content -LiteralPath 'src/app/(farmer)/(workspace)/rotation/page.tsx'
```

**STOP/GO review before creation:** Confirm the **real** M2 `HomeScreen` uses `useM2Text()` and still has a map card pointing to `/map`; `LocaleProvider` exports `useLocale()` with `locale` and `setLocale`; the workspace layout provides that context; `Card` accepts `className`; M2 wizard and Rotation placeholder work; `/map` is still an M1 `UnavailableScreen`. If anything changed after the guides, reconcile the corresponding **entire M3 source block and tests here first**, on the new feature branch, instead of overwriting working code. Read M2's actual completion log and remote CI result; the file-presence check alone does **not** prove M2 passed.

```powershell
# Run the existing remote-main baseline BEFORE branching. Node should match .nvmrc
node -v
npm -v
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Baseline npm ci failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Baseline lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Baseline typecheck failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Baseline test suite failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Baseline build failed.' }
if ((git status --porcelain).Count -ne 0) { throw 'Review tracked changes created by baseline checks.' }

# Create M3 branch ONLY after M2 remote and baseline gates are confirmed:
git switch -c feature/m3-dev1
if ($LASTEXITCODE -ne 0) { throw 'M3 branch exists or could not be created; inspect it.' }
if ((git branch --show-current).Trim() -ne 'feature/m3-dev1') { throw 'Wrong branch.' }
New-Item -ItemType Directory -Force 'src/data/m3', 'src/components/map', 'src/features/m3', 'tests', 'docs/frontend/milestone-M3' | Out-Null
```

### New dependencies, React peer check and reproducible lockfile

The guide's **reference implementation assumes React 19** (typical for the M0 Next.js baseline), but **the actual `package.json` is authoritative**. React Leaflet 5 requires React/React DOM 19. **If React 18 is actually in `main`, STOP and revise this guide to a compatible tested map-library version; do not upgrade React/Next casually or use `--legacy-peer-deps`.** Do not install before the baseline succeeds.

```powershell
npm ls react react-dom next
if ($LASTEXITCODE -ne 0) { throw 'Inspect actual React/Next installation.' }
node -p "require('./package.json').dependencies.react"
node -p "require('./package.json').dependencies['react-dom']"
# When both installed React + React DOM are version 19.x:
npm install --save-exact leaflet@1.9.4 react-leaflet@5.0.0
if ($LASTEXITCODE -ne 0) { throw 'Leaflet install failed; check peer dependencies.' }
npm install --save-dev --save-exact @types/leaflet@1.9.21
if ($LASTEXITCODE -ne 0) { throw 'Leaflet types install failed.' }
npm ls leaflet react-leaflet @types/leaflet
if ($LASTEXITCODE -ne 0) { throw 'Dependency tree has issues.' }
# Both package.json and package-lock.json MUST be staged later.
```

**If the repository already has compatible matching dependencies:** inspect `npm ls` and `package.json` first, skip redundant installs; record the actual versions in this guide. Do **not** hand-edit the lockfile. `npm ci` later must recreate the same dependency graph on feature branch and merged `main`. No geocoder, geolocation plugin, API SDK, clustering plugin or model package is required.

Official implementation references: [React Leaflet v5](https://react-leaflet.js.org/docs/start-introduction/), [installation/types](https://react-leaflet.js.org/docs/start-installation/), [Next.js client-only dynamic imports](https://nextjs.org/docs/app/guides/lazy-loading), [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

## 2. Exact file operations (follow in order)

| File | Action | Purpose |
|---|---|---|
| `src/data/m3/verifiedPoints.ts` | **CREATE** | Two sourced dam feature points, scholarly orientation extent and display-filter helpers; **not** a simulated geography |
| `src/i18n/m3Messages.ts` | **CREATE** | Typed `en`/`ary` map strings on top of the existing provider |
| `src/components/map/TadlaLeafletMap.tsx` | **CREATE** | Client-side Leaflet view, attributed tiles, pan/zoom, points/popups and tile callbacks |
| `src/features/m3/MapScreen.tsx` | **CREATE** | Page UI, filter buttons, keyboard-accessible point list, source/precision detail, no-data and tile-error states |
| `src/app/(farmer)/(workspace)/map/page.tsx` | **REPLACE ENTIRE FILE** | Real M3 `/map` route and Leaflet CSS import |
| `src/features/m1/HomeScreen.tsx` | **REPLACE ENTIRE FILE** | Update **only the factual map-card description**, preserve M2 parcel/home/rotation/community logic |
| `tests/m3-data.test.ts` | **CREATE** | Verified data/precision, extent and filtering invariant tests |
| `tests/m3-map-screen.test.tsx` | **CREATE** | User-visible filters, empty categories, detail, navigation, RTL and tile-error tests |
| `README.md` | **TARGETED update** | Correct `/map` route status; no wholesale rewrite |
| `docs/system-design.md` | **APPEND one marked factual note** | Actual M3 modules and geography/source/trust boundaries |
| `docs/frontend/milestone-M3/M3-DEV1.md` | **CREATE** | This execution guide, kept in sync with **every M3 code change** |
| `package.json`, `package-lock.json` | **UPDATE via npm** | Only the three map dependencies, with exact locked versions |

**Do not modify:** M0/M1 tokens, audio, existing locale provider, `src/i18n/messages.ts`, `src/i18n/m2Messages.ts`, M2 form model and route, Rotation placeholder, PrimaryNav, Map placeholders inside the historical M1/M2 guides, original design ZIP, proposed data-science contract, `docs/frontend-guide.md`, `docs/instructions.md`, `docs/documentation-strategy.md` or `docs/01-cahier-des-charges.md` unless their governing facts truly change. The historical guides are past implementation records, **not** live source templates.

### Create vs replace safely (PowerShell)

```powershell
# Must still be on the M3 feature branch:
if ((git branch --show-current).Trim() -ne 'feature/m3-dev1') { throw 'Not on M3 feature branch.' }
New-Item -ItemType Directory -Force 'src/data/m3', 'src/components/map', 'src/features/m3', 'tests' | Out-Null
$toCreate = @(
  'src/data/m3/verifiedPoints.ts', 'src/i18n/m3Messages.ts',
  'src/components/map/TadlaLeafletMap.tsx', 'src/features/m3/MapScreen.tsx',
  'tests/m3-data.test.ts', 'tests/m3-map-screen.test.tsx'
)
foreach ($path in $toCreate) {
  if (Test-Path -LiteralPath $path) { throw "CREATE target exists: $path. Review existing code; do not overwrite." }
}
# Open/inspect existing replacement targets before replacing them in VS Code.
code 'src/features/m1/HomeScreen.tsx'
code 'src/app/(farmer)/(workspace)/map/page.tsx'
```

Use VS Code's **New File / Save** for each CREATE path; for each REPLACE path open the existing file, compare with the relevant M2 guide/baseline and paste the **complete** block below. The source blocks are full files, not diffs or ellipses. **Do not execute shell snippets embedded in the TypeScript blocks**; only PowerShell code fences are terminal commands.

## 3. `src/data/m3/verifiedPoints.ts` — CREATE the source-checked data and filter helpers

The coordinates, OSM IDs and cited sources are the **only** curated geometry in M3. No bounding polygons are drawn. Use source date as the **review date**, **not** an observation/measurement date. The initial viewport is a union spanning the research study rectangle plus the two separately mapped dam points; this is only a map camera extent.

```typescript
import type { Locale } from "@/i18n/locale";

export type MapCategory = "water" | "market" | "supplier";
export type MapFilter = "all" | MapCategory;

/** A cartographic feature reference only, never a parcel, entrance or live status. */
export type VerifiedMapPoint = Readonly<{
  id: string;
  category: MapCategory;
  title: Readonly<Record<Locale, string>>;
  description: Readonly<Record<Locale, string>>;
  latitude: number;
  longitude: number;
  coordinateMeaning: "approximate-mapped-feature";
  reviewedOn: "2026-11-15";
  coordinateSourceUrl: string;
  osmFeatureUrl: string;
  contextSourceUrl: string;
}>;

/** Published study rectangle (2025 paper); do NOT render as an ORMVAT boundary. */
export const publishedStudyExtent = {
  south: 32.1625,              // 32°09′45″ N
  north: 32.5502777778,       // 32°33′01″ N
  west: -7.0283333333,        // 7°01′42″ W
  east: -6.3966666667,        // 6°23′48″ W
  sourceUrl: "https://www.tandfonline.com/doi/10.1080/10106049.2025.2471104",
} as const;

/** Camera bounds INCLUDE two dams outside the study rectangle; never draw as a polygon. */
export const initialOrientationBounds: [[number, number], [number, number]] = [
  [32.10682, -7.0283333333],
  [32.69320, -5.88843],
];

export const verifiedMapPoints: readonly VerifiedMapPoint[] = [
  {
    id: "bin-el-ouidane",
    category: "water",
    title: { en: "Bin El Ouidane Dam", ary: "سد بين الويدان" },
    description: {
      en: "A mapped dam referenced in studies of the Béni Moussa irrigation system. The point is on the mapped feature, not a visitor entrance.",
      ary: "سد مبين فالخرائط ومذكور فالمراجع على سقي بني موسى. النقطة كتمثل موقع السد فالخريطة، ماشي المدخل ديالو.",
    },
    latitude: 32.10682,
    longitude: -6.46409,
    coordinateMeaning: "approximate-mapped-feature",
    reviewedOn: "2026-11-15",
    coordinateSourceUrl: "https://mapcarta.com/W504108035",
    osmFeatureUrl: "https://www.openstreetmap.org/way/504108035",
    contextSourceUrl: publishedStudyExtent.sourceUrl,
  },
  {
    id: "ahmed-el-hansali",
    category: "water",
    title: { en: "Ahmed El Hansali Dam", ary: "سد أحمد الحنصالي" },
    description: {
      en: "A mapped dam referenced in studies of the Béni Amir irrigation system. The point is on the mapped feature, not a visitor entrance.",
      ary: "سد مبين فالخرائط ومذكور فالمراجع على سقي بني عمير. النقطة كتمثل موقع السد فالخريطة، ماشي المدخل ديالو.",
    },
    latitude: 32.69320,
    longitude: -5.88843,
    coordinateMeaning: "approximate-mapped-feature",
    reviewedOn: "2026-11-15",
    coordinateSourceUrl: "https://mapcarta.com/W385347001",
    osmFeatureUrl: "https://www.openstreetmap.org/way/385347001",
    contextSourceUrl: publishedStudyExtent.sourceUrl,
  },
];

export function filterVerifiedPoints(filter: MapFilter): readonly VerifiedMapPoint[] {
  return filter === "all"
    ? verifiedMapPoints
    : verifiedMapPoints.filter((point) => point.category === filter);
}

export function countVerifiedPoints(filter: MapFilter): number {
  return filterVerifiedPoints(filter).length;
}

/** The external service decides routing; this is NOT a surveyed access location. */
export function externalDirectionsUrl(point: VerifiedMapPoint): string {
  const destination = `${point.latitude},${point.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
```

**Data check:** Data is static, reviewable, source-linked and intentionally small. If you later receive an official ORMVAT polygon or separately verified market/supplier records, that is a new, independently reviewed source change; do **not** fabricate data to make filter counts nonzero. The map is centered/zoomed using a camera extent, **not** a new model of Béni Amir/Moussa boundaries. “Reviewed 2026-11-15” applies to the cited public map coordinate, not irrigation operational status.

## 4. `src/i18n/m3Messages.ts` — CREATE bilingual map UI wording

M2 already demonstrated a scoped `useM2Text()` hook reading the shared M0 `LocaleProvider`. Use the **same architecture**: no separate locale state or storage; English keys must all exist in Darija. Review Darija wording with a fluent teammate before the public demo.

```typescript
import { useLocale } from "@/i18n/LocaleProvider";

export const m3Messages = {
  en: {
    eyebrow: "Tadla · sourced map reference",
    title: "Explore the Tadla area",
    description: "Explore an interactive map and a small, documented inventory of water infrastructure. This is not a parcel-boundary or live agricultural monitoring map.",
    homeMapAvailable: "Explore a real map and two source-checked water landmarks. No unverified markets, suppliers or irrigation boundaries.",
    mapOrientation: "The map view spans a published study-area reference and two nearby regional dams. The view is NOT an official irrigation boundary.",
    mapPrecision: "Dam pins represent approximate mapped features, not surveyed entrances or parcel coordinates. Do not use them as precise navigation or irrigation advice.",
    mapNetwork: "The basemap needs an internet connection. Verified reference points remain listed if tiles fail.",
    mapHeading: "Interactive map",
    mapRegionLabel: "Interactive Tadla reference map; pan, zoom, or use the accessible place list",
    loadingMap: "Loading interactive map… The reference list is available below.",
    tileProblem: "Map tiles may be unavailable right now. Use the place list, sources and external map links below.",
    filtersLabel: "Filter verified places",
    all: "All",
    water: "Water infrastructure",
    markets: "Wholesale markets",
    suppliers: "Agricultural suppliers",
    found: "source-checked places in this filter",
    placeList: "Verified place list",
    empty: "No individually checked locations are available in this category. Nothing has been plotted or invented.",
    selectPrompt: "Select a place to see its reference and coordinate limits.",
    viewOnMap: "View on map",
    selectedDetails: "Selected place details",
    mapSource: "Coordinate source",
    osmFeature: "Mapped OSM feature",
    contextSource: "Research context",
    reviewedOn: "Public-source review date",
    approximateLocation: "Approximate mapped-feature position. Not a gate, parcel, official boundary or verified public entrance.",
    directions: "Open external directions (approximate destination)",
    directionsNotice: "An external map service may ask for your starting point. Access and road directions to this approximate feature are not verified by flaht bladi.",
    resetView: "Reset map view",
    categoryWater: "Dam / water infrastructure",
    linkedBack: "Explore parcel form",
    manualLocationNote: "The M2 parcel form is separate. Selecting a map feature does not set, save or transmit a parcel location.",
    missingCoverage: "No approved market or supplier inventory. No sector polygons, live dam levels, water allocations or crop outputs are displayed.",
  },
  ary: {
    eyebrow: "تادلة · خريطة بمصادر واضحة",
    title: "اكتاشف منطقة تادلة",
    description: "شوف خريطة تفاعلية ولائحة صغيرة ديال منشآت الماء اللي عندها مصادر. هادي ماشي خريطة ديال حدود الأراضي ولا مراقبة فلاحية مباشرة.",
    homeMapAvailable: "شوف خريطة حقيقية وجوج سدود بمواقع مراجعَة. بلا أسواق ولا موردين ولا حدود سقي غير متأكد منها.",
    mapOrientation: "الخريطة كتشمل مجال دراسة منشور وجوج سدود فالجهة. هاد المجال ماشي حدود رسمية ديال السقي.",
    mapPrecision: "النقاط كتدل على مواقع تقريبية ديال السدود فالخرائط، ماشي مداخل مؤكدة ولا إحداثيات ديال أرضك. ما تعتمدش عليها بوحدها فالتوجيه ولا السقي.",
    mapNetwork: "الخريطة الأساسية خاصها الإنترنت. لائحة الأماكن والمصادر كتبقى باينة حتى إلا ما تحملاتش الخريطة.",
    mapHeading: "الخريطة التفاعلية",
    mapRegionLabel: "خريطة تادلة التفاعلية، تقدر تحركها وتكبرها أو تستعمل لائحة الأماكن",
    loadingMap: "الخريطة كتحمل… لائحة الأماكن كاينة لتحت.",
    tileProblem: "يمكن صور الخريطة ما خداماش دابا. استعمل لائحة الأماكن والمصادر وروابط الخرائط الخارجية.",
    filtersLabel: "صفي الأماكن اللي عندها مصادر",
    all: "الكل",
    water: "منشآت الماء",
    markets: "أسواق الجملة",
    suppliers: "موردو الفلاحة",
    found: "أماكن بمصادر مراجعة فهاد التصنيف",
    placeList: "لائحة الأماكن بمصادر",
    empty: "ما كاين حتى موقع متأكد منو بوحدو فهاد التصنيف. ما زدنا حتى نقطة من عندنا.",
    selectPrompt: "اختار شي مكان باش تشوف المصدر وحدود دقة الإحداثيات.",
    viewOnMap: "شوف فـالخريطة",
    selectedDetails: "معلومات المكان المختار",
    mapSource: "مصدر الإحداثيات",
    osmFeature: "المعلم المرسوم فـ OpenStreetMap",
    contextSource: "مرجع الدراسة",
    reviewedOn: "تاريخ مراجعة المصادر العامة",
    approximateLocation: "موقع تقريبي ديال معلم فالخريطة. ماشي المدخل ولا أرض فلاحية ولا حدود رسمية.",
    directions: "حل الطريق فخريطة خارجية (موقع تقريبي)",
    directionsNotice: "خدمة الخرائط الخارجية تقدر تطلب منك نقطة الانطلاق. الطريق والوصول للمكان ما تأكدناش منهم فـ فلاحت بلادي.",
    resetView: "رجع العرض الأول ديال الخريطة",
    categoryWater: "سد / منشأة مائية",
    linkedBack: "شوف استمارة الأرض",
    manualLocationNote: "استمارة الأرض ديال M2 مستقلة. اختيار مكان من الخريطة ما كيعمرش الموقع ديال أرضك وما كيحفظو وما كيصيفطوش.",
    missingCoverage: "مازال ما كايناش لائحة معتمدة ديال الأسواق والموردين، ولا حدود السقي، ولا مستويات السدود الحالية، ولا حسابات زراعية.",
  },
} as const;

export type M3MessageKey = keyof typeof m3Messages.en;
export function useM3Text(): (key: M3MessageKey) => string {
  const { locale } = useLocale();
  return (key: M3MessageKey) => m3Messages[locale][key];
}
```

**Language acceptance:** toggling via existing `LocaleSwitcher` changes heading, filters, details, placeholder and warning; the current filter/selected feature stays selected because those are React state in `MapScreen`, not recreated by a locale provider. Arabic-script copy is human-review pending; this is not a claim of professionally validated translation.

## 5. `src/components/map/TadlaLeafletMap.tsx` — CREATE client-only Leaflet UI

**Leaflet must not be imported in a Server Component** because it accesses browser globals. M3 imports this entire file only through client-side `next/dynamic({ ssr: false })` in §6. `leaflet/dist/leaflet.css` is loaded on the page in §7. Use `CircleMarker` rather than Leaflet's default image-pin icon, avoiding broken default marker asset URLs and adding no unverified icon art. The baseline tile URL and attribution follow OSM's current policy; **do not use subdomains** such as `{s}.tile.openstreetmap.org` or prefetch tiles.

```tsx
"use client";

import { useEffect } from "react";
import {
  CircleMarker, MapContainer, Popup, TileLayer, useMap, ZoomControl,
} from "react-leaflet";
import {
  initialOrientationBounds, verifiedMapPoints,
} from "@/data/m3/verifiedPoints";
import type { VerifiedMapPoint } from "@/data/m3/verifiedPoints";
import type { Locale } from "@/i18n/locale";

export type TadlaLeafletMapProps = {
  points: readonly VerifiedMapPoint[];
  selectedId: string | null;
  resetViewKey: number;
  locale: Locale;
  onSelect: (id: string) => void;
  onTileError: () => void;
};

function ViewController({ selectedId, resetViewKey }: {
  selectedId: string | null;
  resetViewKey: number;
}) {
  const map = useMap();

  useEffect(() => {
    const selected = verifiedMapPoints.find((point) => point.id === selectedId);
    if (selected) {
      // Map navigation only; NEVER assigns or persists a farmer's parcel coordinates.
      map.setView([selected.latitude, selected.longitude], 12, { animate: false });
    } else {
      map.fitBounds(initialOrientationBounds, {
        padding: [24, 24],
        animate: false,
      });
    }
  }, [map, selectedId, resetViewKey]);

  return null;
}

export function TadlaLeafletMap({
  points, selectedId, resetViewKey, locale, onSelect, onTileError,
}: TadlaLeafletMapProps) {
  return (
    <MapContainer
      bounds={initialOrientationBounds}
      scrollWheelZoom={false}
      keyboard
      zoomControl={false}
      minZoom={5}
      maxZoom={16}
      className="h-[350px] w-full rounded-[var(--radius-md)] sm:h-[450px]"
      style={{ background: "var(--water, #DCECE6)" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        eventHandlers={{ tileerror: onTileError }}
        maxZoom={19}
      />
      <ZoomControl position="topright" />
      <ViewController selectedId={selectedId} resetViewKey={resetViewKey} />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.latitude, point.longitude]}
          radius={selectedId === point.id ? 12 : 9}
          pathOptions={{
            color: "#193D2B",
            fillColor: selectedId === point.id ? "#D9A44B" : "#39794F",
            fillOpacity: 0.95,
            weight: 3,
          }}
          eventHandlers={{ click: () => onSelect(point.id) }}
        >
          <Popup>
            <div className="max-w-52 space-y-2 text-sm" dir={locale === "ary" ? "rtl" : "ltr"}>
              <strong className="block">{point.title[locale]}</strong>
              <p>{point.description[locale]}</p>
              <a
                className="underline"
                href={point.osmFeatureUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {locale === "ary" ? "المصدر فـ OpenStreetMap" : "Source on OpenStreetMap"}
              </a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
```

**Map implementation boundaries:** React Leaflet changes the DOM indirectly. The map has an accessible **separate list and details** in §6, so keyboard or screen-reader users never have to operate a canvas/SVG popup to read geographic facts. Opening `/map` loads only OSM tiles (as needed) and static feature records. There is no model call or user-location request.

## 6. `src/features/m3/MapScreen.tsx` — CREATE full farmer-facing map screen

The `MapScreen` module is a Client Component. It dynamically loads Leaflet **only in the browser**, while the controls, filters, details and empty states are simple React controls. Keep map camera state **separate** from M2's parcel state. The list provides keyboard-accessible `button` actions; the map is a progressive visual enhancement.

```tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { MapPinned, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import {
  countVerifiedPoints, externalDirectionsUrl, filterVerifiedPoints,
  verifiedMapPoints, publishedStudyExtent,
} from "@/data/m3/verifiedPoints";
import type { MapFilter } from "@/data/m3/verifiedPoints";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM3Text } from "@/i18n/m3Messages";

function MapLoading() {
  const tx = useM3Text();
  return (
    <div role="status" className="grid min-h-[350px] place-items-center rounded-[var(--radius-md)] bg-mint p-5 text-center text-forest">
      {tx("loadingMap")}
    </div>
  );
}

const LeafletMap = dynamic(
  () => import("@/components/map/TadlaLeafletMap").then((mod) => mod.TadlaLeafletMap),
  { ssr: false, loading: MapLoading },
);

const filters: MapFilter[] = ["all", "water", "market", "supplier"];

export function MapScreen() {
  const { locale } = useLocale();
  const tx = useM3Text();
  const [filter, setFilter] = useState<MapFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [tileProblem, setTileProblem] = useState(false);

  const visiblePoints = filterVerifiedPoints(filter);
  const selected = verifiedMapPoints.find((item) => item.id === selectedId) ?? null;

  const filterLabels: Record<MapFilter, string> = {
    all: tx("all"), water: tx("water"),
    market: tx("markets"), supplier: tx("suppliers"),
  };

  function changeFilter(next: MapFilter) {
    setFilter(next);
    setSelectedId(null);
  }

  function resetView() {
    setSelectedId(null);
    setResetViewKey((count) => count + 1);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="font-semibold text-leaf">{tx("eyebrow")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{tx("title")}</h1>
        <p className="max-w-3xl text-base text-ink">{tx("description")}</p>
        <LocaleSwitcher />
      </header>

      <Card className="space-y-3 bg-mint">
        <p className="font-semibold text-forest">{tx("mapOrientation")}</p>
        <p className="text-sm text-ink">{tx("mapPrecision")}</p>
        <p className="text-sm text-muted">{tx("mapNetwork")}</p>
        <a
          href={publishedStudyExtent.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-semibold text-forest underline"
        >
          {tx("contextSource")}
        </a>
      </Card>

      <section aria-labelledby="map-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="map-heading" className="flex items-center gap-2 text-xl font-extrabold text-forest">
            <MapPinned aria-hidden="true" /> {tx("mapHeading")}
          </h2>
          <button
            type="button"
            onClick={resetView}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-forest bg-white px-4 py-2 font-semibold text-forest hover:bg-mint"
          >
            <RotateCcw size={18} aria-hidden="true" /> {tx("resetView")}
          </button>
        </div>
        <div
          role="region"
          aria-label={tx("mapRegionLabel")}
          dir="ltr"
          className="relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-2"
        >
          <LeafletMap
            points={visiblePoints}
            selectedId={selectedId}
            resetViewKey={resetViewKey}
            locale={locale}
            onSelect={setSelectedId}
            onTileError={() => setTileProblem(true)}
          />
        </div>
        {tileProblem && (
          <p role="alert" className="rounded-[var(--radius-md)] border border-[var(--border)] bg-cream p-4 text-ink">
            {tx("tileProblem")}
          </p>
        )}
      </section>

      <section aria-labelledby="filters-heading" className="space-y-4">
        <h2 id="filters-heading" className="text-xl font-extrabold text-forest">{tx("filtersLabel")}</h2>
        <div role="group" aria-label={tx("filtersLabel")} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {filters.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => changeFilter(value)}
              className={`min-h-12 rounded-[var(--radius-md)] border px-3 py-3 text-sm font-semibold focus-visible:outline-4 ${filter === value ? "border-forest bg-forest text-white" : "border-[var(--border)] bg-white text-forest hover:bg-mint"}`}
            >
              {filterLabels[value]} ({countVerifiedPoints(value)})
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {visiblePoints.length} {tx("found")}
        </p>
      </section>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="place-list-heading">
          <Card className="h-full space-y-4">
            <h2 id="place-list-heading" className="text-xl font-extrabold text-forest">{tx("placeList")}</h2>
            {visiblePoints.length === 0 ? (
              <p role="status" className="text-ink">{tx("empty")}</p>
            ) : (
              <ul className="space-y-3">
                {visiblePoints.map((point) => (
                  <li key={point.id}>
                    <button
                      type="button"
                      aria-pressed={selectedId === point.id}
                      onClick={() => setSelectedId(point.id)}
                      className={`w-full min-h-16 rounded-[var(--radius-md)] border p-4 text-start focus-visible:outline-4 ${selectedId === point.id ? "border-forest bg-mint" : "border-[var(--border)] bg-white hover:bg-cream"}`}
                    >
                      <span className="block font-bold text-forest">{point.title[locale]}</span>
                      <span className="mt-1 block text-sm text-ink">{tx("viewOnMap")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section aria-labelledby="place-detail-heading">
          <Card className="h-full space-y-4">
            <h2 id="place-detail-heading" className="text-xl font-extrabold text-forest">{tx("selectedDetails")}</h2>
            {!selected ? (
              <p className="text-ink">{tx("selectPrompt")}</p>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-forest">{selected.title[locale]}</h3>
                <p className="text-ink">{selected.description[locale]}</p>
                <p className="text-sm font-semibold text-leaf">{tx("categoryWater")}</p>
                <p className="text-sm text-muted">{tx("approximateLocation")}</p>
                <p className="text-sm text-muted">
                  {tx("reviewedOn")}: <time dateTime={selected.reviewedOn}>{selected.reviewedOn}</time>
                </p>
                <div className="flex flex-col items-start gap-1">
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={selected.coordinateSourceUrl} target="_blank" rel="noopener noreferrer">{tx("mapSource")}</a>
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={selected.osmFeatureUrl} target="_blank" rel="noopener noreferrer">{tx("osmFeature")}</a>
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={selected.contextSourceUrl} target="_blank" rel="noopener noreferrer">{tx("contextSource")}</a>
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={externalDirectionsUrl(selected)} target="_blank" rel="noopener noreferrer">{tx("directions")}</a>
                </div>
                <p className="text-sm text-muted">{tx("directionsNotice")}</p>
              </div>
            )}
          </Card>
        </section>
      </div>

      <Card className="space-y-3">
        <p className="text-sm text-muted">{tx("missingCoverage")}</p>
        <p className="text-sm text-muted">{tx("manualLocationNote")}</p>
        <Link href="/parcels/new" className="inline-flex min-h-11 items-center font-semibold text-forest underline">
          {tx("linkedBack")}
        </Link>
      </Card>
    </div>
  );
}
```

**Expected UI states:** `all`: exactly the two reviewed dams, `water`: two, `market`: zero with empty text, `supplier`: zero with empty text; clicking a list item or map circle selects the same detail record and pans the map to its feature; Reset shows the orientation camera again. `aria-pressed` tracks the filter/selected button. On tile failure, message appears; source list continues to function. `locale` switches update all visible text and popup copy but **not** selected place/filter. **No farmer location is read or persisted.**

**Localized loading behavior:** `MapLoading` is a normal component under the existing locale provider, so the temporary loading status also appears in English or Darija. The final §6 code already includes this behavior—no extra edits/snippets are required. The real map and its accessible point list are verified separately in the browser.

## 7. Route and Home: full replacement files

### `src/app/(farmer)/(workspace)/map/page.tsx` — REPLACE ENTIRE FILE

Import the Leaflet global stylesheet **once** from this App Router route page. This makes the tile layer, default zoom controls and popups display correctly without modifying M0's root design tokens. The map component itself is dynamically loaded only in the browser.

```tsx
import "leaflet/dist/leaflet.css";
import { MapScreen } from "@/features/m3/MapScreen";

export default function MapPage() {
  return <MapScreen />;
}
```

### `src/features/m1/HomeScreen.tsx` — REPLACE ENTIRE FILE based on the supplied M2 version

This is the **full M2 HomeScreen** with one intentional M3 content change: map-card description now uses `useM3Text().homeMapAvailable`. Preserve all M2 parcel links, M1 labels/navigation and Rotation-unavailable copy. If actual `main` differs, merge the real working behavior into this full block **and update this guide/tests before committing**.

```tsx
"use client";

import Link from "next/link";
import { ArrowUpRight, MapPinned, Sprout, UsersRound } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM2Text } from "@/i18n/m2Messages";
import { useM3Text } from "@/i18n/m3Messages";

export function HomeScreen() {
  const { t } = useLocale();
  const tx = useM2Text();
  const t3 = useM3Text();
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
          <p className="mt-1 text-sm text-muted">{t3("homeMapAvailable")}</p>
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

**Navigation:** M1's five destinations remain Home / Rotation / Map / Community / Profile. `/parcels/new` remains nested under Rotation. Do not add an extra map tab, a parcel ID route, a server API, or an autocomplete/search service. `/home` must no longer falsely claim `/map` is unavailable. The untranslated `t('mapComing')` key can remain in the M1 dictionary as historical language copy (unused here); do not edit M1 keys just to remove it.

## 8. Complete automated tests — CREATE both files

The commands use the **existing** Vitest/Testing Library configuration from M0–M2; no test runner installation or test-script rewrite is required. The React Leaflet DOM is deliberately mocked in the screen test because jsdom cannot verify actual tiles/network/pan/zoom; those are tested manually in §10. The actual `TadlaLeafletMap` is exercised by production compilation and browser acceptance.

### `tests/m3-data.test.ts` — CREATE

```typescript
import { describe, expect, it } from "vitest";
import {
  countVerifiedPoints, externalDirectionsUrl, filterVerifiedPoints,
  initialOrientationBounds, publishedStudyExtent, verifiedMapPoints,
} from "@/data/m3/verifiedPoints";

const EXPECTED_IDS = ["bin-el-ouidane", "ahmed-el-hansali"];

describe("M3 source-checked static map dataset", () => {
  it("has only the two explicitly documented feature IDs and no unsourced categories", () => {
    expect(verifiedMapPoints.map((p) => p.id)).toEqual(EXPECTED_IDS);
    expect(new Set(verifiedMapPoints.map((p) => p.id)).size).toBe(verifiedMapPoints.length);
    expect(verifiedMapPoints.every((p) => p.category === "water")).toBe(true);
  });

  it("keeps valid positions tied to exact source URLs and review metadata", () => {
    for (const point of verifiedMapPoints) {
      expect(point.latitude).toBeGreaterThanOrEqual(-90);
      expect(point.latitude).toBeLessThanOrEqual(90);
      expect(point.longitude).toBeGreaterThanOrEqual(-180);
      expect(point.longitude).toBeLessThanOrEqual(180);
      expect(point.coordinateMeaning).toBe("approximate-mapped-feature");
      expect(point.reviewedOn).toBe("2026-11-15");
      expect(point.coordinateSourceUrl).toMatch(/^https:\/\/mapcarta\.com\/W\d+$/);
      expect(point.osmFeatureUrl).toMatch(/^https:\/\/www\.openstreetmap\.org\/way\/\d+$/);
      expect(point.contextSourceUrl).toBe(publishedStudyExtent.sourceUrl);
      expect(point.title.en.length).toBeGreaterThan(4);
      expect(point.title.ary.length).toBeGreaterThan(4);
    }
  });

  it("pins both dam positions to the sourced coordinate values, never generated coordinates", () => {
    expect(verifiedMapPoints[0]).toMatchObject({ latitude: 32.10682, longitude: -6.46409 });
    expect(verifiedMapPoints[1]).toMatchObject({ latitude: 32.6932, longitude: -5.88843 });
  });

  it("uses the published extent only for camera context, not an official polygon", () => {
    expect(publishedStudyExtent.north).toBeGreaterThan(publishedStudyExtent.south);
    expect(publishedStudyExtent.east).toBeGreaterThan(publishedStudyExtent.west);
    expect(initialOrientationBounds).toHaveLength(2);
    expect(initialOrientationBounds[0][0]).toBeLessThan(publishedStudyExtent.south);
    expect(initialOrientationBounds[1][0]).toBeGreaterThan(publishedStudyExtent.north);
  });

  it("counts correctly and preserves honest empty category results", () => {
    expect(countVerifiedPoints("all")).toBe(2);
    expect(countVerifiedPoints("water")).toBe(2);
    expect(countVerifiedPoints("market")).toBe(0);
    expect(countVerifiedPoints("supplier")).toBe(0);
    expect(filterVerifiedPoints("water")).toHaveLength(2);
    expect(filterVerifiedPoints("market")).toEqual([]);
    expect(filterVerifiedPoints("supplier")).toEqual([]);
  });

  it("creates external directions from VERIFIED marker values, not the user's position", () => {
    const url = new URL(externalDirectionsUrl(verifiedMapPoints[0]));
    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe("32.10682,-6.46409");
    expect(url.searchParams.has("origin")).toBe(false);
  });
});
```

### `tests/m3-map-screen.test.tsx` — CREATE

The mock represents **only** a map canvas. It does not invent locations or claim tile functionality is tested. Filter/list selection/source links and tile-error feedback are tested through the real React screen.

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { MapScreen } from "@/features/m3/MapScreen";
import { HomeScreen } from "@/features/m1/HomeScreen";

vi.mock("next/dynamic", () => ({
  default: () => function MockMap({ onTileError }: { onTileError: () => void }) {
    return <button type="button" onClick={onTileError}>Simulate tile failure in test</button>;
  },
}));

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

function renderMap() {
  return render(<LocaleProvider><MapScreen /></LocaleProvider>);
}

describe("M3 map page", () => {
  it("renders attributed-source explanations and two actual reference records", () => {
    renderMap();
    expect(screen.getByRole("heading", { name: "Explore the Tadla area" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filter verified places" })).toBeInTheDocument();
    const list = screen.getByRole("heading", { name: "Verified place list" }).closest("section");
    expect(list).not.toBeNull();
    expect(within(list!).getByRole("button", { name: /Bin El Ouidane Dam/ })).toBeInTheDocument();
    expect(within(list!).getByRole("button", { name: /Ahmed El Hansali Dam/ })).toBeInTheDocument();
    expect(screen.getByText(/not an official irrigation boundary/i)).toBeInTheDocument();
  });

  it("filters markers/list to zero markets and zero suppliers with truthful empty state", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "Wholesale markets (0)" }));
    expect(screen.getByText(/No individually checked locations/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wholesale markets (0)" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Agricultural suppliers (0)" }));
    expect(screen.getByText(/No individually checked locations/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Water infrastructure (2)" }));
    expect(screen.getByRole("button", { name: /Bin El Ouidane Dam/ })).toBeInTheDocument();
  });

  it("selects source-checked feature details and external directions without using GPS", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: /Bin El Ouidane Dam/ }));
    expect(screen.getByRole("heading", { name: "Bin El Ouidane Dam" })).toBeInTheDocument();
    expect(screen.getByText(/Not a gate, parcel, official boundary/)).toBeInTheDocument();
    const details = screen.getByRole("heading", { name: "Selected place details" }).closest("section");
    expect(details).not.toBeNull();
    expect(within(details!).getByRole("link", { name: "Coordinate source" })).toHaveAttribute("href", "https://mapcarta.com/W504108035");
    expect(within(details!).getByRole("link", { name: "Mapped OSM feature" })).toHaveAttribute("href", "https://www.openstreetmap.org/way/504108035");
    expect(within(details!).getByRole("link", { name: /Open external directions/ })).toHaveAttribute("target", "_blank");
  });

  it("keeps selection/filter when changing to Darija, and sets RTL", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "Water infrastructure (2)" }));
    await user.click(screen.getByRole("button", { name: /Bin El Ouidane Dam/ }));
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("heading", { name: "اكتاشف منطقة تادلة" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "منشآت الماء (2)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "سد بين الويدان" })).toBeInTheDocument();
  });

  it("shows an accessible failure notice and keeps the place list usable", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "Simulate tile failure in test" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Map tiles may be unavailable/);
    expect(screen.getByRole("button", { name: /Ahmed El Hansali Dam/ })).toBeInTheDocument();
  });

  it("preserves honest Home → map and parcel links and unavailable rotation copy", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: /Tadla map/ })).toHaveAttribute("href", "/map");
    expect(screen.getByText(/two source-checked water landmarks/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
  });
});
```

**Task-specific checks and expected counts:**

```powershell
# Feature branch after creating all M3 files and installing dependencies:
npx vitest run tests/m3-data.test.ts tests/m3-map-screen.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'M3 tests failed; fix source + tests + this guide.' }
```

**Planned:** 6 data tests + 6 screen tests = **12 M3 tests**; all existing M0–M2 tests remain unchanged and must pass. Actual runner output is authoritative. If the test selector or custom setup differs in actual `main`, adjust the exact command and **this guide**. In jsdom, there is **no real tile request, Leaflet popup, pan/zoom or visual RTL layout**: use the browser acceptance grid below.

## 9. Safe, **rerunnable** documentation sync — only necessary facts

Because the implemented `/map` route and modules changed, **two existing repo docs must be corrected**: `README.md` for route status, and `docs/system-design.md` for M3 architecture/source rules. The roadmap, development rules, documentation workflow and requirements scope have **not** changed, so **do not edit** `docs/frontend-guide.md`, `docs/instructions.md`, `docs/documentation-strategy.md` or `docs/01-cahier-des-charges.md`. Do not rewrite the five shared docs wholesale. **Save this guide to its target repository path before the feature commit.**

The script below **skips** when a change is already present; it stops on unexpected text rather than silently corrupting a customized README. It uses Windows PowerShell only, UTF-8 file I/O, and writes only if content actually changes. Run it **on the M3 feature branch** after code tests pass:

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m3-dev1') { throw 'Wrong branch.' }

# README: change the single exact M1/M2 map row; safe to repeat.
$readmePath = 'README.md'
$readme = [System.IO.File]::ReadAllText((Join-Path (Get-Location).Path $readmePath))
$oldMapRow = '| `/map` | Map unavailable until M3; no invented map points |'
$newMapRow = '| `/map` | M3 client-only OpenStreetMap with two sourced dam landmarks, filters, popups, accessible list, attribution and honest empty categories; no live data or official boundaries |'
if ($readme.Contains($newMapRow)) {
  Write-Host 'README: M3 route row already present; skipped.'
} elseif ($readme.Contains($oldMapRow)) {
  if ($readme.Split([string[]]@($oldMapRow), [System.StringSplitOptions]::None).Length -ne 2) { throw 'README old map row occurs more than once.' }
  $readme = $readme.Replace($oldMapRow, $newMapRow)
  [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $readmePath), $readme, [System.Text.UTF8Encoding]::new($false))
  Write-Host 'README: map row updated.'
} else {
  throw 'README map row differs from M1/M2 expected baseline. Manually update the single /map status line and THIS guide; do not overwrite the whole README.'
}

# docs/system-design.md: append a clearly delimited, idempotent architectural note.
$sysPath = 'docs/system-design.md'
$sysFullPath = Join-Path (Get-Location).Path $sysPath
$sys = [System.IO.File]::ReadAllText($sysFullPath)
$marker = '<!-- M3-VERIFIED-TADLA-MAP: implemented -->'
if ($sys.Contains($marker)) {
  Write-Host 'system-design: M3 section already present; skipped.'
} else {
  $m3Note = @'

## M3 verified Tadla map — implemented frontend boundary

<!-- M3-VERIFIED-TADLA-MAP: implemented -->
- **Owner / route:** DEV1; `/map` loads `src/features/m3/MapScreen.tsx` and dynamically imports `src/components/map/TadlaLeafletMap.tsx` on the client. `src/features/m1/HomeScreen.tsx` links to the working map; M2 parcel/Rotation features remain unchanged.
- **Static data:** `src/data/m3/verifiedPoints.ts` holds exactly two publicly source-reviewed **dam feature** coordinates (Bin El Ouidane / Ahmed El Hansali; review 2026-11-15), individual OSM/source URLs, a published Tadla study reference rectangle used for the **camera only** and no sector/parcel polygons. Points approximate the mapped features, **not entrances**; market/supplier categories are intentionally empty.
- **Presentation:** React Leaflet + Leaflet, public OpenStreetMap tiles with visible attribution, local filter/selection state, popups, accessible place list/detail, external-source/directions link and tile-error fallback. `src/i18n/m3Messages.ts` reuses the existing `LocaleProvider` (`en`/LTR, `ary`/RTL).
- **Boundary:** no geolocation, parcel coordinate transfer, real-time dam status, inventory, API, database, backend or model/scientific output. Official boundaries, vetted POIs and any map-to-parcel flow require later evidence/approval.
- **Tests:** `tests/m3-data.test.ts`, `tests/m3-map-screen.test.tsx`, plus browser tile/popup/keyboard/mobile/RTL acceptance; full lint/typecheck/test/build before and after local merge.
'@
  [System.IO.File]::WriteAllText($sysFullPath, $sys.TrimEnd() + "`n`n" + $m3Note.Trim() + "`n", [System.Text.UTF8Encoding]::new($false))
  Write-Host 'system-design: one M3 note appended.'
}

git diff -- README.md docs/system-design.md
```

**Manual mismatch path:** If `README.md` is organized differently, update the **one** map line to exactly the `$newMapRow` content, but in the real table's existing style. Edit the PowerShell instructions in this guide to match that actual change before committing. Do not force a broad regex or rewrite. For `docs/system-design.md`, append only the one note; rerunning detects the marker and skips. Check it still accurately distinguishes M0/M1/M2/M3 planned vs implemented statements; amend a **single stale factual line** if required and document the exact correction here. Avoid a fabricated claim of real user/server records.

**Continuous parity rule:** For *every* changed line of `src/data/m3`, `src/i18n/m3Messages.ts`, `src/components/map`, `src/features/m3`, M1 `HomeScreen`, route page, tests, package manifests or styling, re-read the matching **full code block** and instructions in `docs/frontend/milestone-M3/M3-DEV1.md` and update them together on `feature/m3-dev1`. If the code matches already, record `Guide reviewed: still accurate` in the completion log. No M3 guide/code disagreement may reach `main`.

## 10. Validation: task tests → lint → types → full tests → production build → manual gate

Use PowerShell **from repo root** on `feature/m3-dev1`. TypeScript/ESLint errors are not to be suppressed with `any`, `@ts-ignore`, ignored peer deps, or fake test stubs. If any command fails, fix actual code and update this guide before rerunning.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m3-dev1') { throw 'Not on the M3 branch.' }

# Lockfile reproducibility after the map dependencies were installed:
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Clean install failed.' }
npx vitest run tests/m3-data.test.ts tests/m3-map-screen.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'M3 task-specific tests failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'M3 lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'M3 typecheck failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Full test suite failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }

git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace/diff issues.' }

npm run dev
# Inspect browser at http://localhost:3000/map and /home;
# finish dev server with Ctrl+C when manual checks are done.
```

**Expected, NOT observed:** `npm ci` resolves exact lockfile; `npm run lint`, `typecheck`, `test`, `build` exit `0`; Vitest discovers the **12 M3 tests** and all previous tests. Next production route inventory retains `/`, `/access`, `/home`, `/parcels/new`, `/rotation`, `/map`, `/community`, `/profile`, `/foundation-preview`. Only `/map` becomes a real map; `/rotation` stays unavailable, `/community` waits for M4. Inspect actual browser tiles/network, not just the successful build.

### Manual M3 acceptance record (mark **PASS / FAIL / NOT VERIFIED**, browser/date)

| ID | User-visible acceptance | Actual outcome |
|---|---|---|
| M3-A | Open `/home` → map card → `/map`; card no longer says “coming M3”. Existing Home, Rotation and M2 parcel links still work; five-tab nav marks Map active. | ____ |
| M3-B | At 375×812 mobile and ~1280px desktop, map is present and pan/zoom controls work; mobile bottom nav stays visible and doesn't cover attribution/map links; no horizontal overflow at 320px. | ____ |
| M3-C | With internet, OSM tiles load and attribution `© OpenStreetMap contributors` is **readable and visible**. No attribution hidden by bottom nav, sticky elements, cookie overlays or CSS. | ____ |
| M3-D | Initially pan/zoom map; see the two real dam markers within the broad view. Select Bin El Ouidane via the accessible list → map pans to its **sourced** feature, associated detail appears; click a map marker → popup opens. Repeat for Ahmed El Hansali. | ____ |
| M3-E | Filter All(2), Water(2), Wholesale markets(0), Suppliers(0). Empty states are explicit; map displays no markers for missing categories. No fake shops, product availability, prices or irrigation polygon. | ____ |
| M3-F | Detail panel shows name, approximate-feature warning, review date, clickable coordinate source, OSM feature, research context and an external directions link. Link opens in a separate tab; verify destination is approximate and origin isn't auto-filled by our app. | ____ |
| M3-G | Switch `en`→`ary`→`en` while Water and one point are selected. Content, filters, warnings and details translate; `<html lang="ary" dir="rtl">`, then `en/ltr`; state remains, Arabic text doesn't overlap map controls. | ____ |
| M3-H | Keyboard-only: Tab to language switch, filter buttons, point list, Reset, source/directions links; Enter/Space operate buttons; focus is visible, each button ≥44px. The list provides equivalent data when map circles aren't keyboard accessible. | ____ |
| M3-I | Simulate offline/no tile network using DevTools (block `tile.openstreetmap.org`); a nonfatal tile-error notice appears; no crash; source list/details, locale and filters continue functioning. Restore network and reload. | ____ |
| M3-J | Test ≥200% zoom/text enlargement, reduced motion, portrait/landscape 320/375/768/1280 widths and light/RTL layout. Readable status/links, no map trapping keyboard focus, and basic touch/drag. | ____ |
| M3-K | Check `/parcels/new` steps, manual coordinates and local confirmation remain independent; no map interaction silently adds a field coordinate; reload loses local parcel draft. `/rotation` still shows **no recommendations** or result cards. | ____ |
| M3-L | Browser Network: only expected third-party **OSM tiles** and user-initiated external links, no model/API calls, no Nominatim/geocoder, no browser `navigator.geolocation`, no secrets or locally persisted parcel/map selections. | ____ |
| M3-M | Review geographic provenance/source URLs, source review date, mapped-dam coordinate precision; neither official ORMVAT irrigation boundaries nor supplier/market inventory is claimed. Display no dynamic dam levels or unreviewed water facts. | ____ |
| M3-N | Regression `/foundation-preview`, `/`, `/access`, `/home`, `/profile`, `/community` unavailable state, M2 form and M1 audio empty manifest. | ____ |

**Required limitation:** We cannot claim actual Leaflet popup and basemap correctness, map tile availability, touch/RTL layout or test success without running the browser on the user's machine. Mark any unrun item `NOT VERIFIED`, not `PASS`. Do not merge while a required gate is unresolved.

## 11. Troubleshooting and reconciliation with real M2 source

| Symptom | Exact check / fix |
|---|---|
| `window is not defined` / `document is not defined` in build | `TadlaLeafletMap.tsx` imports `react-leaflet` and is loaded only by the client `dynamic(...,{ ssr:false })`; do not import it directly from a server page/layout. Keep `MapScreen` as `"use client"`. |
| Blank map but no console exception | Check Leaflet CSS imported exactly once by `src/app/(farmer)/(workspace)/map/page.tsx`; ensure map container has explicit height; review browser network tile status and OSM policy. |
| 404/429/blocked tile requests | Do not scrape/prefetch, impersonate headers or rotate tile endpoints. Show source list + tile warning, and review compliant tile hosting before external launch. A public demo should not depend on free OSM tile SLA. |
| Default marker icon missing | This guide uses `CircleMarker` so no image-pin icon asset is needed. Do not add undocumented CDN marker assets. |
| Maps look mirrored in Darija or buttons overlap | Leaflet region uses `dir="ltr"` for map controls and tiles; surrounding text receives document-level RTL. Inspect in browser; preserve visible attribution. |
| React peer dependency error | Verify actual `react`/`react-dom` versions. React Leaflet 5 needs React 19; do not use `--force`/`--legacy-peer-deps`. If main is React 18, version the guide and use a tested compatible alternative. |
| `npm ci` failure | Install with `npm install ...` on M3 branch (not on main) to update both manifests; commit lockfile; Node version must agree with `.nvmrc`. |
| `MapScreen` filter tests fail | Confirm `next/dynamic` mock, Vitest jsdom setup and `useLocale()` match actual M0/M2 code. Do not change application state just to satisfy a stale test assertion. |
| Source OSM feature no longer appears / point moved | Revalidate original way + independent map position; correct/remove static record and update **full data block, all tests and guide**. Never move it to a plausible unverified point. |
| Sidebar/bottom nav active state incorrect | M1 `PrimaryNav` already owns `/map`; do not duplicate nav or introduce six tabs. Inspect actual M1 code before changing it. |
| Map point should set the parcel's coordinates? | **No** in this milestone. M2 state is screen-local; map points are dam structures, **not the farmer's parcel**. An explicit farmer-selected location model, map pin flow, consent and geographic semantics need independent design/review. |
| Build creates duplicate `/map` route | Replace the existing route-group file, don't create `src/app/map/page.tsx` alongside it. Check `src/app/(farmer)/(workspace)/map/page.tsx` path. |
| PowerShell script finds unexpected README | The source tree differs from the supplied guides. Update only its actual `/map` row manually and synchronize the precise guide script; do not globally replace text. |
| GitHub rules reject a local merge push | Authorized repository admin updates rules for agreed no-PR workflow. Never force push or bypass legitimate protection. |

## 12. Commit tested M3 feature branch — no Pull Requests

Before committing, make the **actual M3 implementation** match the code blocks and tests in this document; record real results, not expected ones. Ensure `docs/frontend/milestone-M3/M3-DEV1.md` is **this finished file** and not an outdated copy. Feature work stays on `feature/m3-dev1`.

```powershell
if ((git branch --show-current).Trim() -ne 'feature/m3-dev1') { throw 'Not on feature/m3-dev1.' }
git status --short
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Fix diff errors.' }

$stagedFiles = @(
  'package.json', 'package-lock.json',
  'src/data/m3/verifiedPoints.ts',
  'src/i18n/m3Messages.ts',
  'src/components/map/TadlaLeafletMap.tsx',
  'src/features/m3/MapScreen.tsx',
  'src/app/(farmer)/(workspace)/map/page.tsx',
  'src/features/m1/HomeScreen.tsx',
  'tests/m3-data.test.ts', 'tests/m3-map-screen.test.tsx',
  'README.md', 'docs/system-design.md',
  'docs/frontend/milestone-M3/M3-DEV1.md'
)
foreach ($file in $stagedFiles) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Expected M3 file missing: $file" }
}
git add -- $stagedFiles
if ($LASTEXITCODE -ne 0) { throw 'Staging M3 files failed.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Staged whitespace error.' }
git diff --cached --stat
git diff --cached --name-only
# Inspect: there should be no M4/M5 files, backend, model contracts, fake POIs or unrelated docs.
git commit -m 'feat(m3): add source-checked Tadla map and accessible filters'
if ($LASTEXITCODE -ne 0) { throw 'Feature commit failed.' }
if ((git status --porcelain).Count -ne 0) { throw 'Unexpected remaining changes after commit.' }
$featureSha = (git rev-parse HEAD).Trim()
Write-Host "M3_FEATURE_SHA=$featureSha"
# Optional feature backup; does not create a PR:
# git push -u origin feature/m3-dev1
```

**Expected:** one commit containing exactly app changes, two test files, npm manifest/lockfile, minimal README/system-design updates and the synchronized M3 guide. No PR or M4 development.

## 13. Local **uncommitted** merge into `main`, full retest, push verification

Only after all mandatory feature tests, manual acceptance and guide parity are actually green. Confirm no one updated remote `main` in the meantime; a diverged remote must be reconciled safely. Do not implement features on `main`.

```powershell
if ((git status --porcelain).Count -ne 0) { throw 'Feature tree not clean.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Could not switch to main.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'main changed/diverged. Investigate and reconcile M3 first.' }
if ((git status --porcelain).Count -ne 0) { throw 'main is not clean.' }

git merge --no-ff --no-commit feature/m3-dev1
if ($LASTEXITCODE -ne 0) { throw 'Merge conflicts. Resolve manually or git merge --abort; DO NOT test/commit an unresolved merge.' }
# HEAD is still previous main; the index/worktree now contain the proposed merge.
# All checks run on the ACTUAL MERGED TREE before merge commit.
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Merged npm ci failed. Abort merge after inspecting.' }
npx vitest run tests/m3-data.test.ts tests/m3-map-screen.test.tsx
if ($LASTEXITCODE -ne 0) { throw 'Merged task-specific M3 tests failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Merged lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Merged TypeScript failed.' }
npm run test
if ($LASTEXITCODE -ne 0) { throw 'Merged suite failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Merged build failed.' }

# Repeat relevant manual Home -> Map -> filters -> details -> RTL, and
# Home -> Rotation -> Parcel -> local review, plus attribution/tiles/browser checks.
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Merge index has diff errors.' }
# Check guide parity on MERGED tree; only then create the merge commit:
git commit -m 'merge(m3): verify mapped Tadla UI on main'
if ($LASTEXITCODE -ne 0) { throw 'Do not push a failed merge.' }
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'Push rejected; do not force push. Fetch and reconcile.' }
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Could not verify remote.' }
$localHead = (git rev-parse HEAD).Trim()
$remoteHead = (git rev-parse origin/main).Trim()
if ($localHead -ne $remoteHead) { throw 'Remote main does not match the validated merge commit.' }
Write-Host "M3_MERGED_SHA=$localHead"
# Also inspect actual GitHub Actions `checks` on this SHA, if configured.
```

**Merge conflict / failure:** If conflicts or any merged-tree check fails, **do not commit or push**; while a merge is ongoing, run `git merge --abort` if safe, return to `feature/m3-dev1`, fix source/tests/guide in the feature branch, rerun its checks, and retry the no-commit merge. If `main` changed, compare against the new remote baseline rather than assuming no conflicts. If GitHub requires a PR, ask an authorized admin to adjust rules to the team's agreed no-PR policy; do not work around permissions or force push. M4 starts **only** after matched local/remote SHA and post-push CI status are verified.

## 14. M3 completion record — fill using real observed results

```text
Milestone: M3 — Interactive Tadla mapping   Owner: DEV1
Feature branch: feature/m3-dev1
Verified M2 origin/main baseline SHA: ______________________________
Feature commit SHA: ________________________________________________
Actual React / React DOM / Leaflet / React Leaflet versions: __________
Task-specific M3 tests (actual count/result): _______________________
Feature npm ci: ____________________________________________________
Feature lint / typecheck / full tests / build: ______________________
Browser and date: __________________________________________________
English/LTR + Darija/RTL: __________________________________________
Mobile 320px/375px, desktop ~1280px, touch/keyboard: _______________
Real OSM tiles and attribution checked: ____________________________
Bin El Ouidane + Ahmed El Hansali, popup and source links: _________
Market/supplier honest empty filters: _____________________________
Offline/tile failure fallback: _____________________________________
M0/M1/M2 regression (especially parcel and Rotation): _____________
Guide/source/tests/package-lock parity: ___________________________
Other shared docs: NONE (if roadmap/rules/scope stayed unchanged)
README map status and docs/system-design M3 note: _________________
Merged-tree npm ci / M3 tests / lint / typecheck / tests / build: ____
Merged-tree manual verification: ___________________________________
Pushed origin/main SHA matches local HEAD: _________________________
Actual remote CI `checks` result: __________________________________
Unverified/failed items and precise next action: ___________________
Handoff: DEV2 begins M4 only when the above gates are genuinely met.
```

### Three-line handoff to DEV2 (after integration, not before)

1. `/map` is a source-linked, client-only Leaflet map with two approximate mapped dam features, filters (water = 2, markets/suppliers = 0), accessible place list/detail, bilingual labels and OSM attribution. **No boundaries, GPS/parcel transfer, live status, API or model.**
2. M2 parcel creation/review and Rotation-unavailable screen are deliberately unchanged; the exact new UI source boundaries are `src/data/m3/verifiedPoints.ts`, `src/i18n/m3Messages.ts`, `src/components/map/TadlaLeafletMap.tsx`, `src/features/m3/MapScreen.tsx`.
3. Supply the **actual** M3 merge SHA, CI result, test totals, any missing tile/browser checks and remaining map data gaps. DEV2 owns M4 after that remote gate, not before.

**STOP AFTER M3.** This guide must never be interpreted as permission to implement M4/M5, backend/API, OTP, a recommendation model, or proposed data-science payloads.
