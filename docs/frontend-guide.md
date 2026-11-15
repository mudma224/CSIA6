# flaht bladi — Frontend Milestone Guide

**Repository:** `CSIA6` (M0 repository initialized; final merge SHA to be recorded after merge)  
**Team:** 2 frontend developers; a coordinator (may be one of them) prepares each milestone's execution guides  
**Status:** Reference roadmap — not an execution guide  
**Source of requirements:** `docs/01-cahier-des-charges.md` (v1.1)

## 1. Purpose and boundaries

This document defines **what to build and in what order**. The separate project that generates milestone execution guides must read this document alongside `instructions.md`, `system-design.md`, `documentation-strategy.md`, the cahier des charges, the approved design-system source, and the **actual latest merged `main`**. It must generate **two** developer guides for **one milestone only**, with full code, exact commands, tests, expected outcomes, file ownership and PR instructions.

**Frontend only.** Develop navigation, screens, UI state, client-side interaction/validation, accessible audio, localization and verified map visualization. Do **not** implement server endpoints, databases, authentication providers, permissions/authorization logic, data ingestion, agronomic calculations, recommendation algorithms or model/API clients. The **recommendation feature is not built now**: display only a bilingual, explicitly unavailable/coming-later placeholder; no comparison cards, fake scores or sample recommendations.

## 2. Mandatory UX and design requirements

- The provided HTML/CSS design system determines colors, typography, spacing, component styling and tone **only**; its sample pages are not the app specification. Use the cahier des charges for actual screens.
- Mobile first, large touch targets (at least 44 × 44 px), readable type, low text density, crop image cards, tapping over typing, clear back/continue actions, an “I don't know” option where appropriate.
- Darija in Arabic script (`ary`, RTL) and English (`en`, LTR); choose language **before** phone/demo entry, persist it locally, and make it changeable without losing form progress. Translate controls, validation, empty states and map labels.
- Audio wherever it *meaningfully assists*: reusable tap-to-play control, short prerecorded clips in the selected language, visible text fallback, pause/replay, file-missing handling. First visit: large speaker with green pulsing rings, opt-in tap, onboarding instruction; **never autoplay**. Respect reduced-motion preference. Do not invent prerecorded assets: record or obtain reviewed speech files and document their source.
- Data and map markers must be source-verified. No fictitious irrigation polygons, suppliers, prices, rainfall, yields, recommendations or live statuses.

## 3. Shared development protocol (every milestone)

1. Coordinator checks that previous milestone is merged into protected `main`, test status is documented, and code/docs match; for M0, initialize an empty `CSIA6` repository and upload reference docs and authorized design assets.
2. Coordinator generates exactly **two** coordinated guides from that baseline: `docs/frontend/milestone-MX/MX-DEV1.md` and `MX-DEV2.md`. Each guide states prerequisites, owned files, complete runnable source snippets, exact npm/Git commands, automated/manual checks, and acceptance criteria. Do not generate subsequent milestones yet.
3. Integration owner creates `integration/mX` from the current `main`. Both developers branch from that integration baseline **after any mandatory shared bootstrap passes**. If the generated M0 guides require a DEV1-only bootstrap, DEV2 waits only for that bootstrap PR, not for unrelated DEV1 work.
4. Developers implement only assigned files on `feature/mX-dev1-*` and `feature/mX-dev2-*`; test locally and synchronize their guides with changes. PRs target `integration/mX`, not `main`.
5. Integration owner reviews, merges, resolves conflicts, runs full milestone tests, and records results. Failed check = no promotion.
6. Open a reviewed PR `integration/mX` → `main`; merge only when tests and documentation pass. Record the resulting commit SHA. **Only then** generate the next pair of guides.

## 4. Milestones and proposed two-person split

The splits below are provisional. The milestone guide generator may balance effort after inspecting the actual code, but may not move backend work or recommendation logic into frontend tasks. Each milestone must deliver useful work for both developers and avoid shared-file collisions.

| Milestone | DEV 1 ownership | DEV 2 ownership | Integration acceptance gate |
|---|---|---|---|
| **M0 — Repository & shared foundation** | Initialize Next.js/TypeScript/Tailwind, base app shell, design tokens and global styles | Test setup, shared UI primitives, localization/audio infrastructure (after bootstrap) | Clean install, lint, typecheck, tests, build; visual tokens, RTL and audio component smoke checks |
| **M1 — Welcome, access & navigation** | First-visit speaker onboarding, bilingual welcome, phone-first **demo UI**; no real OTP | Dashboard, responsive navigation, profile/language preference UI | Welcome → language → demo entry → navigation works in both locales, audio only on tap |
| **M2 — Parcel journey & deferred rotation** | Guided parcel form, crop image choices, irrigation/season/area inputs, client-side usability validation | Parcel location selection UI and bilingual **recommendations unavailable** page; optional local demo state display | A farmer can complete the parcel UI, encounter honest unavailable message, go back without losing values; no recommendations computed or rendered |
| **M3 — Interactive Tadla mapping** | React Leaflet map page, base map, attribution, zoom/pan, responsive container | Verified GeoJSON/POI inventory, filters, accessible popup/location cards, empty categories | Sources/coordinates verified, map/filter/popup tests pass; no invented sector polygons |
| **M4 — Community, calendar & sharing UI** | Community feed filters, form UI for experiences/sales/partnerships, local demo interactions | Crop-calendar UI using **only vetted static content** or unavailable state; external contact/copy sharing and Facebook link-sharing UX | Correct demo labeling, no real persistence or private-post claims; no fake public URLs; safe sharing and calendar missing-data handling |
| **M5 — Frontend hardening & handoff** | Farmer-journey end-to-end tests, small-screen UX, keyboard accessibility and error/empty states | Darija/English & RTL audit, audio regression, map testing, documentation and future API seam audit | Full tests + production build; 2-browser/mobile smoke review; audited docs; reviewed merge into `main` |

**P0 first:** If 48 hours are insufficient, simplify M4 and other P1 work before cutting reliable M0–M3 UX/tests. Both developers may contribute to the same milestone but should not edit the same files without explicit coordination.

## 5. Milestone deliverable template

Each generated milestone package must contain:

- `MX-DEV1.md` and `MX-DEV2.md` — actual **execution** guides, not generic Claude prompts.
- A short integration checklist appended to the appropriate guide or a small milestone README: baseline commit, merge order, exact full-suite commands and human acceptance checks.
- Exact files/paths, full code, package changes, tests and expected outputs for that milestone; no assumptions about files that do not yet exist.
- A mini handoff note specifying **UI-only state**, source and limitations of any demo data, and future service boundary (`TODO: backend integration`), without speculative API shapes.
- Both developers' PRs including concise documentation changes required by `documentation-strategy.md`.

## 6. Definition of done

- Assigned functionality works without backend services and does not imply fake production capability.
- Both locales, direction, audio behavior, mobile layout and accessibility checks relevant to the milestone pass.
- Unit/component tests and smoke checks relevant to changed code pass; lint, TypeScript, and production build pass on integrated branch.
- Exact guide contents reflect code changes (or review explicitly certifies an unchanged guide remains accurate); PR review and milestone integration checklist completed.
- `integration/mX` merges into `main` via approved PR; next milestone starts only after that merge.

## 7. Future handoff — after all frontend milestones

Once the frontend is validated, document actual user inputs, UI states and data placeholders. After the data scientist delivers supported crops, model semantics, inputs, outputs and limits, collaboratively define and version backend API contracts. Only **then** implement backend/auth/storage and recommendation behavior, followed by real integration tests. This later phase is outside the frontend milestones above.
