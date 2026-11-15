# flaht bladi — Frontend System Design

**Project:** flaht bladi · **GitHub:** `CSIA6` (M0 initialized)  
**Status:** M0 foundation implemented; later screens, routes and APIs remain proposed. No backend/API exists.

## 1. Architectural intent

Build a **mobile-first Next.js + React + TypeScript frontend**, styled with Tailwind CSS and the provided HTML/CSS design tokens. Two developers own separate files within each milestone. Build the whole non-recommendation frontend before backend/API development. The recommendation route is a bilingual **unavailable placeholder only** until the data-science handoff.

```text
User/browser
  ├─ App shell: welcome, language, demo entry, dashboard, profile
  ├─ Parcel form: illustrated selections + UI-only validation/local form state
  ├─ Rotation: unavailable placeholder (NO recommendation calculations/results)
  ├─ Map: Leaflet UI + sourced static GeoJSON/point records
  ├─ Community: local/demo feed, input forms, filters, sharing UI
  ├─ Calendar: vetted static stage information or unavailable state
  └─ Shared UX: design system, Darija/English i18n, prerecorded audio help

             [FUTURE INTEGRATION BOUNDARY — NOT IMPLEMENTED]
       Authentication / storage / posts / data APIs / model service
```

## 2. Proposed stack

| Area | Selection | Boundary |
|---|---|---|
| Framework | Next.js App Router, React, TypeScript | No domain API routes or backend business logic during frontend milestones |
| Styling | Tailwind CSS + CSS variables | Preserve semantic values from source `styles.css` |
| Icons/components | Lucide + accessible locally owned components; optional UI library only if agreed | Design system is not a set of pages to copy |
| Mapping | Leaflet / React Leaflet + OpenStreetMap tiles | Sourced features only; client-side filters and popups |
| Localization | Central `en` and `ary` dictionaries, locale provider, `dir` handling | Arabic-script Darija RTL; English LTR |
| Audio | `<audio>` or `HTMLAudioElement`, reusable player, static assets | No speech backend, automatic autoplay or fictitious audio assets |
| Testing | ESLint, TypeScript, Vitest + React Testing Library; Playwright smoke when available | Scripts must be introduced and documented by M0 guide |
| Deployment | Frontend preview when available | No backend service deployment in this phase |

**Visual foundation:** ZIP `Field_Shift_Design_System_Source(1).zip`, especially `Field_Shift_Design_System/styles.css` and README. Key original tokens: forest `#193D2B`, leaf `#39794F`, sage `#A8C98A`, canvas `#F5F6EF`, cream `#FFFDF8`, harvest `#D9A44B`; Inter and Noto Sans Arabic. Use reference imagery responsibly, respecting its stated limitations. Example Home/Field/Rotation screens in the ZIP are **not** implementation requirements.

## 3. Proposed route map

Paths are **proposals for M0 confirmation**, not declarations that files exist:

| Route | Frontend behavior |
|---|---|
| `/` | Welcome, language selection and first-visit audio onboarding |
| `/access` | Phone-first demo/test UI; no true OTP |
| `/home` | Farmer dashboard and accessible navigation |
| `/parcels/new` | Guided parcel form; optionally view entered demo data |
| `/rotation` | **Awaiting data-science model** placeholder only |
| `/map` | Interactive Tadla map with verified points and filters |
| `/community` | Local/demo feed and post forms; no remote multi-user persistence |
| `/calendar` | Verified static guidance or missing-data state (P1) |
| `/profile` | Demo profile/language preferences; no real authenticated profile |

On mobile, use a simple navigation model based on Home / Rotation / Map / Community / Profile; a nested form/calendar need not occupy primary tabs.

## 4. Proposed repository layout

**M0 actual modules are recorded below.** The broader tree remains a proposal for later milestones.

```text
CSIA6/
├── docs/
│   ├── 01-cahier-des-charges.md
│   ├── frontend-guide.md
│   ├── instructions.md
│   ├── system-design.md
│   ├── documentation-strategy.md
│   ├── frontend/                 # future 2 per-milestone execution guides
│   └── decisions.md              # concise actual decisions (when needed)
├── public/
│   ├── audio/{ary,en}/           # real reviewed recordings only
│   └── images/                   # licensed/approved assets
├── src/
│   ├── app/                      # pages, layouts, global styles
│   ├── components/
│   │   ├── ui/                   # reusable presentational primitives
│   │   ├── audio/                # playback/coachmark components
│   │   ├── map/                  # React Leaflet presentation
│   │   └── forms/                # guided-input UI
│   ├── i18n/                     # dictionaries, RTL/LTR and provider
│   ├── data/                     # source-cited static POIs, vetted crop labels, demo fixtures
│   ├── features/                 # screen-specific presentation and UI state
│   ├── lib/                      # generic UI helpers only
│   └── types/                    # UI/view-model types, not invented backend contracts
├── tests/
└── package.json
```

Avoid creating a complex structure before it is justified. **File ownership must be declared separately for each milestone.** Shared files (root layout, dependencies, tokens, language manifest) have one temporary owner per PR; the other developer requests changes through review rather than overwriting them.

## 5. Module boundaries

- **`components/ui`**: presentational props, accessibility and styling; no fetch or business logic.
- **`features/*`**: screen composition, temporary local state, display formatting, controlled form steps and UI-only input checks. No hidden agricultural calculations.
- **`i18n`**: strings and RTL/LTR; switching locale preserves in-progress form selections.
- **`components/audio`**: user-initiated playback via a fixed locale-to-asset manifest; gracefully hide/disable missing audio; no auto-recording or TTS.
- **`components/map`**: present sourced points/polygons, category selection, external directions links and attribution; never convert vague descriptions into invented geometry.
- **`data`**: immutable small demo or verified static records with provenance/date where applicable, clearly differentiated. No mock recommendations.
- **`rotation`**: only localized unavailable view. Later integration must not require frontend guessing model outputs.

## 6. Future backend/API seams — documented, not implemented

Future capabilities may include phone OTP/session, parcel CRUD, recommendation service, community posting permissions, image storage and public sharing. The **models, API endpoints, database schema, authorization rules and recommendation outputs are all TBD**. Do not write placeholder server code or fictitious request/response JSON now. For each screen, document only the user action, data it displays/collects, where demo state currently lives, missing real capability, and relevant error/empty states.

After frontend acceptance, use those notes as input to backend/API design. The data scientist must validate supported crop identifiers, required parcel fields, model outputs, scores, explanations and uncertainties before rotation functionality is implemented.

## 7. Non-functional constraints

- Keyboard operability, 44 px targets, visible focus and reduced-motion support.
- Small viewport behavior, slow network and missing-asset states.
- No secrets in client bundles, no claimed server-side security in frontend-only demos.
- Map attribution and compliance with tile-provider terms; no bulk tile downloads.
- Source, timestamp, resolution and uncertainty when showing environmental indicators.
- Version docs with code changes; integration tests and build gate before merging `integration/mX` into protected `main`.

## M0 implemented foundation (verified at integration)

- Implemented routes: `/` and `/foundation-preview`, both showing the same internal foundation preview; no farmer-facing M1 screens yet.
- DEV1: App Router root layout, global approved CSS tokens + Tailwind, toolchain, CI and bootstrap checks.
- DEV2: `src/i18n/{locale,messages,LocaleProvider}`, `src/components/ui/{Button,Card,TextField}`, `src/components/audio/{clips,AudioHelp}`, `src/features/foundation/FoundationDemo`, Vitest/Testing Library tests.
- Only `localStorage` language preference and local preview-input UI state exist; both are **frontend-only**. No user authentication, data APIs, real audio recordings, verified map features or model computations.
- Audio manifest is intentionally empty; a visible transcript/fallback is required. The data-science v0.1 contract remains **proposed** and unimplemented.
- Proposed route table above is a future plan, not a claim the other routes already exist.
