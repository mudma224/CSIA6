# flaht bladi — Frontend System Design

**Project:** flaht bladi · **GitHub:** `CSIA6` · **Reported baseline:** M0 integrated into `main`  
**Status:** M0 frontend foundation completed (per team report); M1–M5 are sequential frontend milestones. No backend/API is implemented by this design.

## 1. Architectural intent

Build a **mobile-first Next.js + React + TypeScript frontend**, styled with Tailwind CSS and the provided HTML/CSS design tokens. DEV1 owns M1–M3; DEV2 owns M4–M5, sequentially. No simultaneous milestone development. Build the whole non-recommendation frontend before backend/API development. The recommendation route is a bilingual **unavailable placeholder only** until the data-science handoff.

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

Routes below show **intended milestones**, not a claim they all exist in the M0 baseline:

| Route | Frontend behavior |
|---|---|
| `/` | M0 foundation preview initially; M1 replaces it with bilingual welcome/audio fallback |
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

**M0 established the base Next.js tree, UI primitives, i18n, audio scaffolding and a foundation preview.** Future routes/modules below remain planned until their owner merges each milestone; verify actual file names against `main` at milestone start.

```text
CSIA6/
├── docs/
│   ├── 01-cahier-des-charges.md
│   ├── frontend-guide.md
│   ├── instructions.md
│   ├── system-design.md
│   ├── documentation-strategy.md
│   ├── frontend/                 # one execution guide per current milestone/owner
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

Avoid creating a complex structure before it is justified. **File ownership must be declared separately for each milestone.** Shared files (root layout, dependencies, tokens, language manifest) are modified only by the owner of the active milestone; changes must be reflected in that milestone guide and tested before a local merge to `main`.

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
- Version docs with each code change; test the local `main` merge candidate before pushing; next milestone starts only after its predecessor is verified on remote `main`.

## 8. Current M0 baseline and M1 change boundary

- **M0 already established (reported):** App Router and global design tokens; `/` and `/foundation-preview` both show a foundation preview; local `LocaleProvider` with `en`/`ary` plus persisted preference; `Button`, `Card`, `TextField`; `AudioHelp` with **empty approved-clip manifests**; Vitest/RTL baseline and CI.
- **M1 implemented on the verified feature branch (to be integrated):** Route-group locale provider for the farmer journey, actual welcome `/`, demo access `/access`, dashboard `/home`, profile `/profile`, five-destination responsive navigation, and honest unavailable views for incomplete M2–M4 destinations. Keep `/foundation-preview` and M0 tests functioning.
- **Only local demo UI state:** Phone is checked for input **format only**, never sent or stored as authentication; optional profile display name is in React state only; locale preference uses M0 localStorage. No account, session, authorization, parcel persistence, map data, or recommendation calculation is implied.
- **Ownership/integration:** DEV1 exclusively implements and locally integrates M1, M2, M3 (in order). DEV2 exclusively implements/integrates M4, M5. Exact feature branches and gates are defined in `docs/frontend-guide.md`.

## M4 session-only community and unavailable calendar — implemented frontend boundary

<!-- M4-COMMUNITY-CALENDAR: implemented -->
- **Owner / routes:** DEV2; `/community` mounts `src/features/m4/CommunityScreen.tsx`; `/calendar` mounts `src/features/m4/CalendarScreen.tsx`; Home links to both. The five-tab `PrimaryNav`, M2 parcel/Rotation and M3 map stay unchanged.
- **UI model:** `src/features/m4/communityDraft.ts` defines unapproved **presentation-only** draft strings, basic client usability checks and user-reviewed share text formatting; not a community API/database schema or approved crop vocabulary. `src/i18n/m4Messages.ts` consumes existing `LocaleProvider` for `en`/LTR and `ary`/RTL.
- **State lifetime:** no seed posts; only locally created in-memory previews, category filter, in-page review/removal and clipboard-copy consent. Nothing is submitted, persisted, authenticated or publicly posted. Removing one is not remote deletion. No phone/WhatsApp contact, Facebook link, report submission or claim of moderation.
- **Calendar boundary:** no approved crop calendar, seasons, crop stages, planting dates or source-reviewed windows were supplied; `/calendar` explains the unavailable status without inventing dates. Recommendation/model contract remains deferred.
- **Tests / later backend:** `tests/m4-community-draft.test.ts`, `tests/m4-community-screen.test.tsx`, `tests/m4-calendar-home.test.tsx` and bilingual/mobile/browser/clipboard acceptance. Future backend needs moderation, consent/privacy, authorization, real data storage, share URL and independently approved agronomic calendar sources.
