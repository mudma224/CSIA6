# FLAHT BLADI — Functional and Technical Requirements Specification

**Project:** flaht bladi (formerly Field Shift)  
**GitHub repository:** `CSIA6`  
**Event:** NASA Space Apps Challenge 2026  
**Document:** `docs/01-cahier-des-charges.md`  
**Version:** 1.1 — updated frontend-first baseline  
**Date:** 14 November 2026  
**Status:** Frontend-first MVP scope; backend/API and data-science recommendation contracts deferred  
**Target implementation window:** 48 hours  
**Primary study area:** Tadla irrigated perimeter — Béni Amir and Béni Moussa, Morocco  
**Working language of this specification:** English

> **Document authority:** This specification defines *what* flaht bladi will deliver. Separate future files—`frontend-guide.md`, `instructions.md`, `system-design.md`, and `documentation-strategy.md`—will define the milestones, mandatory frontend-only rules, architecture, and concise documentation workflow for **two frontend developers**. They are **not created by this document**. The repository `CSIA6` is not initialized yet. The frontend will be completed and tested before backend/API work starts. The data-science recommendation feature remains on hold until its inputs, outputs, and model are ready; no API contract checkpoint blocks frontend work on other features.

---

## 1. Project Overview

### 1.1 Context and problem

Farmers in Tadla need practical support when deciding which crop to plant next, when to plant it and how to rotate crops between seasons. These decisions depend on prior crops, local environmental conditions, water availability and agronomic constraints. Relevant datasets exist across satellite Earth observation, weather, soils and agricultural sources, but they are not necessarily accessible in a simple farmer-facing decision tool.

### 1.2 Proposed solution

**flaht bladi** (formerly Field Shift) is a mobile-first agricultural decision-support web application. Its **future integrated version** will let a farmer describe a parcel, review their existing strategy and compare it with **two model-produced alternatives**, with readable explanations, planting guidance and local geographic context. **During frontend development, recommendation functionality is not implemented**; only a clearly labeled unavailable placeholder is shown. A lightweight community area enables farmers to exchange experiences, publish harvest listings or seek partners.

flaht bladi provides **decision support, not guaranteed prescriptions**. Predictions and estimates must distinguish measured, model-derived, rule-derived and illustrative information.

### 1.3 Objectives

1. Present two potentially suitable crop-rotation options beside the farmer's existing strategy.
2. Explain recommendations in clear, farmer-friendly language without fabricating model reasoning.
3. Help farmers understand planting windows through a simple crop calendar.
4. Make verified Tadla geographic and agricultural information accessible on an interactive map.
5. Support optional farmer collaboration with a basic community feed and manual sharing.
6. Demonstrate a credible workflow connecting prepared NASA data to agricultural decisions.

### 1.4 Target users and stakeholders

- **Primary user:** A farmer operating in or near the Béni Amir/Béni Moussa study area, potentially with limited digital literacy.
- **Secondary users:** Agricultural advisors and demonstration reviewers.
- **Development stakeholders:** Two frontend developers and the separate data-science/model contributor(s). Task ownership will be assigned per milestone.

### 1.5 Geographic boundary

The product starts with the **Tadla irrigated perimeter**, focusing on **Béni Amir and Béni Moussa**. The map may allow zooming to surrounding areas, but the application must not imply complete coverage of Béni Mellal–Khénifra or all of Morocco. Geographic datasets and markers are included only after source and coordinate verification.

### 1.6 Success definition

The **frontend-only demonstration** succeeds when a farmer can open the application, choose Darija or English, navigate the app, enter parcel context, see an honest recommendation-unavailable placeholder and explore verified map features and supported community UI. Recommendation generation, comparison, explanation and saving become a separate later acceptance goal once the data scientist and backend are ready.

---

## 2. MVP Scope, Priority and Exclusions

### 2.1 Priority definitions

- **P0 — Mandatory:** Must be usable during the final demo, with appropriate demo/mocked states where explicitly identified.
- **P1 — Time-permitting:** Feasible in a simplified form; implement after all P0 features pass integration tests.
- **Conditional:** Implement only if a named external dependency is verified and ready.
- **Out of scope:** Not part of the 48-hour build.

### 2.2 Scope matrix

| Module / capability | Priority | Exact 48-hour scope |
|---|---|---|
| Welcome and phone-first access | P0 | Accessible welcome screen, phone entry interface and clearly labeled demo/test access |
| Production SMS phone OTP | Conditional | Only after provider, billing, deliverability and secure configuration are confirmed |
| Home/dashboard | P0 | Clear navigation and entry points into the core user journey |
| Parcel input | P0 | Minimal guided form with validated user inputs and location selection |
| Recommendations comparison | Deferred until data-science handoff | Do not build recommendation screens, result logic, or mock predictions during the frontend-only phase; retain a clearly labeled unavailable/coming-later entry point |
| Explanations and limitations | Deferred until data-science handoff | Implement with the recommendation feature after model outputs are validated |
| Interactive Tadla map | P0 | Real map, verified available points, layer filters, popups and attribution |
| Persist saved parcel/recommendation | Frontend-only / deferred | Parcel form UI may use local demo state; database persistence and recommendation saving await backend/model work |
| Farmer profile | P1 | Name, language, saved items and own posts |
| Planting calendar | P1 | Static validated crop calendar rendered as a timeline, not automated irrigation advice |
| Community | P1 | A basic feed and creating/deleting one's own posts; types: experience, harvest for sale, partnership |
| Share via copy and public link | P1 | Explicitly approved non-sensitive summaries; optional Facebook Share Dialog |
| Wholesale market markers | Conditional within map | A small list with individually verified coordinates and operational status |
| Seed/agricultural supplier markers | Conditional within map | A small verified directory; no promise of product inventory or price availability |
| Irrigation-basin/sector polygons | Conditional within map | Only when reliable and correctly georeferenced vector boundaries are available |
| Water-related satellite indicator | P1 / Conditional | Display a valid dated regional observation with resolution caveat, if prepared |

### 2.3 Explicitly excluded

- Integrated private messenger, real-time messaging, push-notification infrastructure and follower networks.
- Direct automatic posting to personal Facebook timelines or mandatory Facebook account linking.
- Payment processing, escrow, delivery logistics, stock tracking or a full marketplace.
- Nationwide wholesale-market and seed-supplier coverage.
- Precise parcel-level soil conclusions inferred from coarse satellite grids.
- Unverified irrigation-sector polygons or fabricated places/coordinates.
- Live dam levels, water allocations, guaranteed water savings, estimated profits or yields without validated inputs and methods.
- On-demand ingestion/processing of all raw satellite imagery during a farmer's request.
- Native Android/iOS applications, microservices, Kubernetes and other unnecessary infrastructure.

### 2.4 Scope-control rule

**During frontend-only development, P0 means the agreed non-recommendation frontend screens and interactions work with explicitly labeled local/demo data.** Recommendation generation, recommendation results and backend-dependent persistence are deferred. Implement P1 features only when the required frontend work is stable; never reduce validation, reliability or transparency.

---

## 3. Users, Journeys and Navigation

### 3.1 Design assumptions

The application is primarily designed for smartphone use, simple interactions and minimal reading. The planned interface supports Moroccan Darija in Arabic script (RTL) and English (LTR), with language choice before authentication and persistent preference. Final translations and cultural wording will be reviewed before the demo. The provided design system will later determine colors, typography, imagery and spacing.

### 3.2 Core farmer journey

1. Enter through welcome/phone-first access or a clearly labeled demo mode.
2. Open the dashboard and choose **Find my next crop**.
3. Create/select a parcel and supply the requested field information.
4. During the frontend-only phase, encounter a clear “Recommendations coming later” placeholder; no generated result, comparison or model-driven advice is shown.
5. After the data-science handoff and backend/API phase, submit the parcel context, review the baseline and up to two model-provided alternatives, and select/save a result where enabled.
7. Open the geographic map to investigate verified places and geographic context.
8. Optionally browse the community or share a non-sensitive summary.

### 3.3 Proposed navigation destinations

**Home · Rotation · Map · Community · Profile**

The parcel form, recommendation details and crop calendar can be nested screens within the **Rotation** journey, avoiding too many primary navigation items. The calendar is not required as a separate bottom-navigation tab.

### 3.4 Critical states

Every data-dependent view must support **loading, success, empty, unavailable and error states**. A model unavailable state must never silently display invented recommendations.

---

## 4. Functional Requirements by Page

Each requirement has an ID for later implementation tasks and acceptance tests.

### 4.1 Page A — Welcome and authentication

**Purpose:** Minimal-friction entry for a farmer.

**Requirements**

- **FR-A01 (P0):** Show flaht bladi branding, one simple value proposition, preferred-language control and a prominent continue action.
- **FR-A02 (P0):** Provide phone-number input with Morocco `+212` formatting/validation guidance; do not require an email field.
- **FR-A03 (P0):** Provide a clearly identified **test/demo access path** for the hackathon build when production SMS is not ready.
- **FR-A04 (Conditional):** Support real phone OTP through a configured provider with proper error/retry handling; never implement a fake OTP as if it authenticated a real account.
- **FR-A05 (P1):** On first authenticated access, request only a display name, preferred language and optionally the irrigation zone.

**Acceptance:** A user can open the app and reach Home using the documented demo/test access; invalid phone input is identified; authentication mode is not misleading. Real OTP acceptance is separate and conditional.

### 4.2 Page B — Dashboard / Home

**Purpose:** Make the next action obvious.

- **FR-B01 (P0):** Show a clear **Find my next crop** entry point that leads to a labeled unavailable placeholder until recommendations are developed.
- **FR-B02 (P0):** Provide navigation to Rotation, Map, Community and Profile (unavailable P1 destinations may be labeled as such during development).
- **FR-B03 (P0):** Use simple cards, icons, short labels and a readable mobile layout.
- **FR-B04 (P1):** Show recent parcel or saved recommendation when data exists.
- **FR-B05 (Conditional):** Show weather/environmental information only if source, spatial meaning and timestamp are available.

**Acceptance:** All available navigation targets are functional on a small mobile viewport; no placeholder card masquerades as live data.

### 4.3 Page C — Parcel information

**Purpose:** Gather the minimum context for a rotation request.

**Required user-entered inputs (subject to final model contract):**

| Field | MVP behavior | Notes |
|---|---|---|
| Parcel name | Optional short text | User-friendly label, not a cadastral identifier |
| Irrigation zone | Béni Amir / Béni Moussa / Other or unsure | Not a replacement for coordinates |
| Parcel location | Map pin or coordinates when permitted | If missing, show reduced geographic precision |
| Approximate field area | Numeric, in hectares | Positive-number validation |
| Most recent crop | Choice from **validated** study crop list | Supplied: `src/data/crops.v1.json` — P0 form list = entries with `form_p0: true`; an explicit unspecified state is required (FR-C03) |
| Planned season | Season selection | Must be tied to the relevant year in the final contract |
| Irrigation method | Drip / surface / unknown, subject to validation | Do not assume irrigation allocation |
| Additional previous crop | Optional | Helps distinguish rotation history from a one-season record |
| Known soil constraints | Optional advanced input | Not mandatory for first-time users |

- **FR-C01 (P0):** Provide a guided, multi-step or short grouped form with large controls.
- **FR-C02 (P0):** Validate required fields and explain mistakes in plain language.
- **FR-C03 (P0):** Allow an **unsure** state instead of forcing fabricated field knowledge.
- **FR-C04 (P0):** Display what information may be derived from external datasets; do not ask farmers to enter satellite indices.
- **FR-C05 (P0):** Support a point location selector where feasible and explicitly communicate uncertainty if only an area is selected.
- **FR-C06 (P0 target):** Demonstrate parcel entry using explicitly labeled local/demo state; saving/reopening through authenticated storage is deferred to backend integration.
- **FR-C07 (P1):** Allow optional extra crop history and basic constraints without overwhelming the default form.

**Acceptance:** A valid parcel form produces a typed request object; invalid/missing inputs are handled; unspecified values remain unspecified rather than guessed.

### 4.4 Page D — Crop-rotation recommendations (deferred core feature)

**Frontend-only phase:** Do not implement this page or recommendation/comparison logic yet. Provide only a plainly labeled navigation placeholder (“Coming later / awaiting model”) without scientific outputs. The existing P0/P1 tags below refer to **future integrated-product priorities**, not tasks for the frontend-only milestones. The requirements remain specifications **for a later phase**, after the data-science contributor supplies validated inputs, output semantics, and integration requirements.

**Future purpose:** Compare the farmer's current approach with two justified alternatives.

- **FR-D01 (P0):** Display the farmer's stated existing crop/rotation choice as a **baseline**, without implying that it has been model-scored unless it has.
- **FR-D02 (P0):** Display **up to two alternatives** returned by the model; if fewer exist, explicitly state why.
- **FR-D03 (P0):** Present each option with crop label, visual identification, relevant suitability/compatibility status and available planting information.
- **FR-D04 (P0):** Explain the recommendation using documented model features, agronomic rules or data indicators; clearly identify the source of the explanation.
- **FR-D05 (P0):** Show data/model limitations and missing values rather than substituting unsupported numbers.
- **FR-D06 (P0):** Support explicit status modes: `demo preview`, `model unavailable`, `results available`, `no suitable options`, and `request error`.
- **FR-D07 (P0):** Let the user select an alternative, then show a confirmation or saved-choice state.
- **FR-D08 (P1):** Save and reopen selected recommendations with a timestamp and model/data version when available.
- **FR-D09 (P1):** Offer a simple rotation timeline and a link to the planting calendar.
- **FR-D10 (P1):** Allow sharing an approved summary without revealing the parcel's exact position or private details.

**Not permitted:** Fabricated confidence values, absolute irrigation savings, predicted revenue/yield or precise sowing dates without defensible provenance. An ML suitability score is not automatically a probability or a measure of water savings.

**Acceptance:** With a valid contract-compliant sample result, the screen renders the baseline, two alternatives, explanations and missing-data states; unavailable model responses are correctly labeled. Actual model validity is assessed separately from UI correctness.

### 4.5 Page E — Agricultural map

**Purpose:** Explore the real Tadla geography and verified agricultural points of interest.

- **FR-E01 (P0):** Render a usable interactive base map centered on the study area with zoom/pan and required map attribution.
- **FR-E02 (P0):** Represent Béni Amir and Béni Moussa as labeled study areas using verified geography; **do not draw arbitrary polygons**.
- **FR-E03 (P0):** Add clickable **verified** available points (e.g., known water infrastructure) with name, type and geographic coordinates.
- **FR-E04 (P0):** Provide filter controls for water/irrigation, wholesale markets and seed/agricultural suppliers; categories without verified points may show an honest empty state.
- **FR-E05 (P0):** Open a popup or information panel with available sourced facts; when a valid location exists, provide an external directions link.
- **FR-E06 (Conditional):** Add wholesale markets only with confirmed coordinates and operational status; planned markets must be labeled *planned* or omitted.
- **FR-E07 (Conditional):** Add seed suppliers only when name and location are verified; no stock or price claims unless separately verified.
- **FR-E08 (Conditional):** Load irrigation sectors/basins as polygons only with authoritative or validated georeferenced boundary files.
- **FR-E09 (P1 / Conditional):** Optionally display dated satellite layers or a soil-moisture indicator, including original spatial resolution and a no-parcel-precision warning.

**Acceptance:** The map loads, attribution is visible, filters change displayed points, markers open valid popups, the default extent is geographically grounded and every visible feature has a traceable source.

**Map-data constraint:** Official irrigation maps and descriptions do **not** establish publicly available GIS polygons. No claim of comprehensive water, market or supplier coverage is allowed.

### 4.6 Page F — Crop calendar

**Purpose:** Help farmers interpret *when* crop-related activities happen.

- **FR-F01 (P1):** Display a simple timeline: soil preparation, sowing window, growing/irrigation phase and harvest window.
- **FR-F02 (P1):** Draw dates/windows only from a vetted crop-calendar source or validated model output.
- **FR-F03 (P1):** When no calendar is available for a crop/season, show `Calendar not available for this crop` rather than constructing a date.
- **FR-F04 (P1):** Link back to the corresponding selected crop/rotation.

**Acceptance:** A verified example renders the correct sequence; unverified crops do not display fabricated calendar guidance.

### 4.7 Page G — Community

**Purpose:** Enable simple farmer-to-farmer exchange without building a social platform.

- **FR-G01 (P1):** Display a simple feed containing **experience**, **harvest for sale** and **partnership request** post types.
- **FR-G02 (P1):** Filter the feed by post type.
- **FR-G03 (P1):** Create a post with type-specific required fields: experience (title/description), sale (crop/quantity/unit/optional price/approximate location), partnership (purpose/area/description).
- **FR-G04 (P1):** Allow authors to delete their own posts; other users may not edit/delete them.
- **FR-G05 (P1):** Offer a contact action through an explicitly approved phone/WhatsApp method; private numbers must not be exposed by default.
- **FR-G06 (P1):** Provide a basic report action or moderation fallback before any public deployment.
- **FR-G07 (Conditional):** Allow one optional post image when upload/storage and safeguards are in place.

**Acceptance (frontend phase):** Demo/local posts, filters and forms work with clearly labeled sample state. Real multi-user posting, authorization and persistence are validated only after backend integration. No payments or integrated chat exist.

### 4.8 Page H — Profile and saved information

**Purpose:** Allow returning farmers to access their work.

- **FR-H01 (P1):** Show display name, optional area and language preference.
- **FR-H02 (P1):** List saved parcels and selected recommendations with reopen actions.
- **FR-H03 (P1):** List the user's own community posts where enabled.
- **FR-H04 (P1):** Allow sign-out when a real authentication session exists.

**Acceptance:** Saved items correspond to the current authorized user; UI remains usable if no items exist.

### 4.9 Sharing / Facebook integration

- **FR-S01 (P1):** Generate a farmer-approved, privacy-reviewed summary of a selected recommendation or community post.
- **FR-S02 (P1):** Copy the prepared text to the clipboard.
- **FR-S03 (P1):** Where a public URL is available, open Facebook's sharing flow for that link and supply suitable public page preview metadata.
- **FR-S04 (P1):** Explain that the farmer completes publication manually; do not promise automatic text prefill or personal-profile auto-posting.
- **FR-S05 (P1):** Support a share cancellation path without changing saved content.

**Acceptance:** Frontend copy/share controls work with explicitly public, approved content; a real public URL and its privacy guarantees are validated after backend/public-page integration. Facebook sharing does not require linking a farmer account to the app.

---

## 5. UX, Accessibility and Localization

### 5.1 Interface principles

- **Mobile-first responsive web/PWA**, with a desktop presentation layout also usable by judges.
- Clear visual hierarchy; large touch targets; prominent primary action; minimal text per screen.
- Use recognizable agricultural pictures/icons without relying on imagery alone to convey warnings.
- Form steps and progress indicators must be understandable; avoid technical model jargon.
- Provide explicit back/cancel actions and confirmation before publishing information.
- Display source/observation dates and units wherever numerical environmental information appears.
- Support low-bandwidth conditions with loading/empty/error feedback; do not require bulk satellite downloads in the browser.
- Maintain sufficient contrast and keyboard accessibility; use semantic labels and error messages.

### 5.2 Language strategy

The supported interface languages are **Moroccan Darija in Arabic script (RTL)** and **English (LTR)**. Language selection occurs before authentication and remains available throughout the app; the choice persists without erasing in-progress input. Short prerecorded audio guidance should be offered at helpful steps in the selected language, including first-visit tap-to-play onboarding (green pulsing speaker icon; never autoplay). All audio must have visible text equivalents. Agricultural translations and recordings require review.

### 5.3 Design-system status

The provided design-system ZIP is a **visual reference only** for colors, typography, spacing, shapes, components and responsiveness. Its example screens and functionality must **not** be copied as the app pages. Detailed UI implementation will be specified in separate future milestone guides.

---

## 6. Agricultural, Earth-Observation and Geographic Data

### 6.1 Candidate inputs (not all guaranteed for the MVP)

| Source | Potential use | Important limitation |
|---|---|---|
| NASA POWER | Historical meteorological variables and climate context | Spatial/temporal representativeness must be checked |
| GPM IMERG | Rainfall history | Grid-scale estimates, not exact field rain-gauge measurements |
| MODIS MOD13Q1 | Vegetation-index history | Pixel resolution and quality masking matter |
| SMAP SPL3SMP_E V6 | Regional near-surface soil-moisture context | Approximately 9-km footprint; **not parcel-level soil moisture** |
| SMAP SPL4SMGP (if processed) | Additional modeled soil/water features | Model-derived gridded estimates and version-specific definitions |
| Landsat 8/9 Collection 2 L2 | Higher-resolution reflectance and temperature features | QA, cloud coverage, acquisition dates and processing required |
| ORMVAT / other official agricultural records | Irrigation geography and agronomic context | Public documentation may not include GIS geometries or machine-readable schedules |
| Verified agricultural reference tables | Crop suitability, rotations, sowing windows | Need local agronomic validation before use |
| OpenStreetMap + verified POI sources | Base map, roads, infrastructure/market/supplier points | Variable coverage and completeness |

### 6.2 Data handling requirements

- Each dataset used in a recommendation must have documented **name, product/version, variables, units, spatial resolution, time period, processing and provenance**.
- Preprocess large NASA sources offline in the team's data pipeline/notebooks, then expose prepared features or model results to the app.
- Do not substitute missing real observations with unlabeled simulated data.
- Explicitly distinguish observed satellite estimates, modeled features and farmer-reported data.
- Do not conflate a broad irrigation-zone selection with a precise field boundary.
- Exclude unverified crop compatibility and irrigation claims from recommendation text.

### 6.3 Geographic verification workflow

1. Obtain a source describing the place or geographic feature.
2. Verify coordinates and the correct feature type.
3. Confirm whether it is active, planned or unknown where this matters (e.g., wholesale markets).
4. Store source URL, verification date and any caveat with the record.
5. Include it in the map only when grounded.

A minimum useful map with a handful of verified features is preferable to a fabricated comprehensive map.

---

## 7. Recommendation Engine and Explainability

### 7.1 Responsibility separation

- The **farmer** supplies known parcel facts and their current strategy.
- The **data pipeline** prepares environmental and geographic features.
- The **model/rule engine** produces candidate alternatives and supported evidence.
- The **frontend** presents those results and collects a user's selection; it must not invent recommendations or scientific metrics.

### 7.2 Expected model behavior to validate

The team intends to compare **the existing strategy + two alternatives**. Before backend integration, the data-science contributor and developers must agree on the meaning of a "strategy": a next crop, a sequence of crops across seasons, or both. The frontend must not imply a multi-season optimization if the model predicts only one next crop.

Also validate:

- Exact supported crop vocabulary and crop IDs.
- Required versus optional parcel inputs, and units.
- Whether field latitude/longitude is necessary or only zone information is supported.
- Applicable planting-season representation and calendar year.
- Number and order of valid alternatives; tie and no-result behavior.
- Meaning of any score; whether it is a ranking, compatibility score or calibrated confidence.
- Which explanations come from features, rules or templates.
- Whether any water-use comparison is truly calculated and validated.
- Which missing values block a recommendation versus merely lower context quality.

### 7.3 Result transparency

Each result should visibly distinguish **recommendation**, **explanation**, **data source**, **uncertainty/limitations** and **availability status**. The interface should prefer accessible qualitative explanations over unjustified percentage claims. Any explanatory text derived from a template must truthfully correspond to actual model/rule signals.

### 7.4 Integration boundary

The precise API request/response schema and endpoints are **TBD** until the data-science handoff. No endpoints, recommendation contracts, results, or recommendation mock fixtures should be invented. Frontend development proceeds on other screens using UI-only local state and data clearly marked as sample content. Backend integration will be addressed after the frontend phase.

---

## 8. Technical Architecture

### 8.1 Intended approach

A **frontend-first implementation with a deferred recommendation contract**:

1. Initialize the as-yet-uncreated `CSIA6` repository and shared frontend foundations.
2. Build all agreed **non-recommendation** frontend screens and their presentational interactions using safe local/demo data.
3. Validate responsive layouts, localization, audio assistance, accessibility, and the frontend-only user journeys.
4. Wait for the data scientist to finish before defining or building the recommendation page, its business logic or API integration.
5. After frontend validation, implement backend, persistence and APIs, then integrate and test the model.

**Boundary:** Frontend code handles presentation, navigation, local UI state and client-side usability validation only. Server-side authorization, sensitive data handling, persistence rules, scientific/agronomic decisions, recommendation algorithms, and protected service calls belong in the later backend/model phase.

### 8.2 Proposed implementation stack

| Concern | Preferred technology | Decision status |
|---|---|---|
| Web app | Next.js + React + TypeScript | Proposed |
| Styling/components | Tailwind CSS + shared component system | Proposed; visual design pending |
| Geographic UI | Leaflet / React Leaflet + OpenStreetMap base map | Proposed |
| App database, storage, access policy | Supabase PostgreSQL / Auth / Storage | Proposed |
| Geographic DB queries | PostGIS | Optional; unnecessary for a small static marker set |
| Model service | Python + FastAPI | Proposed, dependent on data-science model packaging |
| Frontend hosting | Vercel or equivalent | Proposed |
| Collaboration | GitHub, protected `main`, short-lived feature branches | Approved workflow direction; detailed rules in frontend guide |

### 8.3 Authentication nuance

True SMS OTP is conditional, not a free/demo-only frontend checkbox. Supabase phone login requires an SMS provider for sending actual OTP messages, while documented test phone numbers can be used without sending SMS. App-level authorizations and personal-data protection must still be correctly implemented if user data is persisted.

### 8.4 Offline / deployment expectations

The MVP is an **online mobile-first web app**; guaranteed offline support is out of scope. PWA installability is optional. Heavy satellite processing remains server-side/offline, not part of client page rendering.

---

## 9. Data Model and Planned Interfaces

### 9.1 Proposed logical entities (not finalized tables)

- **User/Profile:** user ID, display name, locale, optional region, authentication identity.
- **Parcel:** owner, display name, zone, optional location, approximate area, irrigation method.
- **CropHistory:** parcel, crop, season/year (where known).
- **RecommendationRun:** parcel/input snapshot, creation time, status, relevant model/data version.
- **RecommendationOption:** linked run, proposed crop/rotation, evidence, supported scores and warnings.
- **SavedChoice:** owner, parcel, chosen result and saved time.
- **CommunityPost:** owner, post type, title/description, optional listing fields, creation time and visibility.
- **GeoPoint / GeographicLayer:** name/type, verified geometry, source, verification metadata and status.
- **CropCalendarEntry:** validated crop, season/region scope, stage and date/window with source.

These are **conceptual entities**, not a claim that every table or field is feasible or required during the demo. P1 modules may remain unimplemented.

### 9.2 Proposed interface boundaries

- Frontend ↔ authentication/session service.
- Frontend ↔ parcel and saved-result persistence.
- Frontend ↔ recommendation adapter/model API.
- Frontend ↔ curated map GeoJSON/POI data.
- Frontend ↔ community post service (P1).
- Frontend ↔ public-sharing page generation (P1).

### 9.3 API/model contract — deliberately deferred

After the data scientist finishes, a joint review will define recommendation inputs/outputs, canonical crop IDs, units, error states and test fixtures. **This does not block the non-recommendation frontend or its milestone guides.** API contracts remain placeholders until that handoff, and will be documented and versioned when backend/API work begins.

---

## 10. Non-Functional Requirements

### 10.1 Usability and accessibility

- Essential actions reachable on mobile without horizontal overflow.
- Forms have labels, sensible validation, visible error messages and accessible focus states.
- Icons are paired with text where ambiguity is possible.
- Arabic/RTL rendering must be tested if Arabic is enabled.

### 10.2 Performance and stability

- Static UI and lightweight metadata load without waiting for model computation.
- Network calls must expose loading/error/timeout states.
- Do not ship large raw remote-sensing files to the client.
- Map layers should load only as needed; production tile usage must respect the tile provider's policy.

### 10.3 Security, privacy and trust

- Do not put secret API keys in the frontend bundle.
- Enforce authorization server-side for saved parcels, recommendations and posts.
- Use appropriate row-level security and storage access policies if Supabase is selected.
- Do not publish precise parcel coordinates, private phone numbers or private agronomic information without explicit permission.
- Include a clear disclaimer that advice depends on data quality and is not guaranteed.
- Validate any user-generated text/images before public release; provide a basic report/moderation path for community posts.
- Do not falsely advertise simulated flows as production integrations.

### 10.4 Data quality

- Keep dates, units and geographic scale visible where they matter.
- Missing data remains `unavailable` rather than silently defaulted.
- Keep a provenance list for externally sourced facts and layer points.

---

## 11. Acceptance Criteria and Test Strategy

### 11.1 Mandatory P0 end-to-end demonstration

A successful **frontend-only** P0 demo must pass the following (model-specific requirements apply only in a later phase):

1. **Entry:** Farmer opens the app and enters a clearly identified permitted/demo session.
2. **Navigation:** All implemented primary destinations resolve without broken routes.
3. **Parcel form:** Valid inputs can be submitted; invalid input produces useful errors.
4. **Deferred recommendations:** The frontend clearly indicates that recommendations are unavailable; it renders no simulated alternatives or agronomic advice. Recommendation contract and explainability tests are reserved for the later model/API phase.
5. **Truthfulness:** Sample UI data is labeled, and no result is presented as model-derived before integration.
6. **UI clarity:** No unsupported scientific or numerical claims appear.
7. **Map:** Verified features are displayed at supported coordinates; layer filters, popups and attribution work.
8. **Persistence:** When enabled, the user can save/reopen a parcel or choice; if not enabled, the fallback is clearly declared and must not be misrepresented.
9. **Mobile:** Core journey is usable on a small screen with readable labels and touch controls.
10. **Frontend integration:** Implemented screens, local/demo interactions, empty/error states and navigation work without backend services; model/API tests are deferred.

### 11.2 P1 acceptance gates

- **Calendar:** Validated windows display correctly; absent information is shown as unavailable.
- **Community:** Basic create/read/delete-own-post permissions work; type filters work; sensitive contact sharing is consent-based.
- **Sharing:** Only approved public summaries/URLs are shared; no private location leakage; copy/share actions work or fail gracefully.
- **Profile:** Only the current user's saved data is shown.

### 11.3 Testing levels

- **Static checks:** formatting/linting and TypeScript.
- **Unit/component tests:** form validation, conditional states, typed result rendering, filtering and helper functions.
- **Interaction tests:** keyboard/touch navigation and map interaction.
- **End-to-end smoke tests:** welcome/language → dashboard → parcel form → recommendation-unavailable placeholder → map/community journey; recommendation results/save tested later.
- **Manual visual tests:** narrow mobile and desktop browser layouts; Arabic/RTL when added.
- **Integration tests:** model response compatibility and error handling when APIs become available.

**Rule:** A task is not complete until its relevant tests pass. Changes enter `main` only after review and documented validation. Exact commands and the development team's task-by-task test matrix belong in the frontend guide.

---

## 12. Project Phases, Collaboration and Deliverables

### 12.1 Implementation phases

| Phase | Outcome | Gate to proceed |
|---|---|---|
| 0. Requirements baseline | Approved MVP specification and visible scope cuts | This document agreed |
| 1. Frontend foundation | Initialize `CSIA6`, routes, shared types, UI primitives, test setup | Both developers can run the same app |
| 2. Parallel frontend | All agreed frontend screens except recommendations, using labeled local/demo state only | Individual tests + pull-request review |
| 3. Frontend integration | Consistent, navigable, tested frontend-only user journey | Non-recommendation UI acceptance checklist passed |
| 4. Backend/API and model integration | Backend and API work begins after frontend validation; recommendation development begins only after data-science handoff | Approved contracts, data/error and authorization tests pass |
| 5. Demo stabilization | Deploy, rehearse, verify claims and prepare fallback | Final end-to-end demo passes |

### 12.2 Two-person frontend collaboration principles

- **Two developers**, with responsibilities divided by milestone so each has clear file ownership and a balanced workload. One coordinator generates the **two milestone-specific execution guides** together; the coordinator role may be held by either developer.
- Both follow the same shared rules in the future `instructions.md`; neither invents architecture or backend logic independently.
- Use a milestone integration branch (`integration/mX`) and separate feature branches. Each developer tests their tasks and updates relevant documentation in the same PR; the combined milestone is tested before a reviewed PR merges into protected `main`.
- **Only after a milestone has passed integration checks and merged into `main`** may the coordinator generate the next milestone guides from the actual merged state.
- **Any code-line change requires checking the corresponding guide and updating it if needed**, within the same change/PR; keep documentation brief, accurate and continuous.
- Frontend code is limited to presentation, navigation, reusable UI, input interactions, and explicitly identified demo/local state; backend/business/scientific logic, secure authentication and data persistence are not implemented here.
- Recommendation pages and logic are excluded from the frontend milestones until the data-science handoff.

### 12.3 Planned GitHub documentation

The **`CSIA6` repository does not exist as an initialized project yet**; establishing its structure is the first milestone. The following files are **planned, not generated now**:

```text
CSIA6/
  docs/
    01-cahier-des-charges.md     # This requirements specification
    frontend-guide.md           # Frontend milestones and scope (not individual guides)
    instructions.md             # Mandatory rules, two-person responsibilities and workflow
    system-design.md            # Architecture, boundaries and planned repository structure
    documentation-strategy.md   # Concise living documentation and API-handoff rules
    frontend/                   # Two execution guides per milestone, generated one milestone at a time
```

The cahier des charges defines *what*. The four planned reference files define *how* and provide the common context for a separate ChatGPT project that will later generate each milestone's two execution guides. **No actual execution guides are required at this stage.**

### 12.4 Release deliverables

- Public or demonstrable mobile-first flaht bladi web application.
- Functional non-recommendation frontend with parcel entry, an explicit recommendation-unavailable placeholder, map and supported community interactions; the comparison workflow is a later deliverable after data-science handoff.
- Interactive geographically verified Tadla map.
- Model recommendation screen, real recommendations and integration **deferred until the data-science handoff**; no fabricated result fixtures during the frontend-only phase.
- Versioned requirements, planned shared frontend reference documentation, concise per-change updates and task/test records; API contracts follow the backend/model handoff.
- Reproducible deployment/startup instructions and a tested demo scenario.

---

## 13. Risks, Dependencies and Future Evolution

| Risk | Impact | Mitigation |
|---|---|---|
| ML results not ready or model inputs differ from form | Recommendation functionality is deferred | Keep a clear unavailable placeholder; define model inputs/results only after data-science handoff |
| Crop list / agronomic rotation rules unvalidated | Incorrect farming guidance | Use verified vocabulary and constraints; label preview/unknown |
| No irrigation-sector boundary files | Cannot draw trustworthy polygons | Use real labels/points first; postpone polygons |
| Incomplete market/supplier locations | Misleading map | Show fewer verified locations and transparent empty categories |
| SMS billing/provider not operational | Login blocked | Explicit demo/test access; keep production OTP conditional |
| Community grows in complexity | Threatens core deadline | Deliver minimal P1 feed only after P0 works |
| Merge conflicts between two developers | Rework and regressions | Shared setup, explicit file ownership, small PRs and review |
| Late backend contract changes | Potential UI adjustments | Keep UI/data boundaries explicit; document API integration after frontend and data-science handoff |
| Satellite data too coarse or delayed | False precision | State resolution and observation dates; avoid parcel-specific certainty |
| Facebook sharing limitations | Poor sharing UX | Use public link, manual share and copy-text fallback |

### 13.1 Explicit future enhancements — not MVP commitments

- Full parcel polygons and validated per-parcel feature extraction.
- Longer historical crop sequences and multi-season optimization.
- More robust water-use modeling and validated estimates.
- Richer agronomic constraints, specialist review and local calibration.
- Expanded official market/supplier partnerships and data coverage.
- Moderated community growth, improved accessibility and optional offline features.

### 13.2 Deferred backend/model decisions (not blockers for frontend development)

The following questions remain **open until the data-science handoff and subsequent backend/API phase**:

- [ ] Does the model predict the next crop, a multi-season rotation or both?
- [ ] Which parcel inputs, crops, crop IDs, units and seasons does it support?
- [ ] What do model scores and explanations represent scientifically?
- [ ] Which environmental datasets are ready and validated?
- [ ] What are the eventual API request/response schemas and error states?
- [ ] Which storage, authentication and authorization operations will the backend provide?

For the frontend milestone guides, confirm only the **visual design system, two-developer ownership, routes, UI boundaries, source-verified map data and test strategy**. Recommendation results are not part of the frontend implementation yet. The four planned shared documents in §12.3 will be authored separately before generating the first milestone execution guides.

---

## 14. Reference Documentation

The following are source documentation and data-entry points, **not proof that all requested data layers are available**:

1. ORMVAT — Tadla Monograph: https://ormvatadla.ma/monographie/
2. ORMVAT — Irrigation network modernization: https://ormvatadla.ma/modernisation-des-reseaux-gravitaires/
3. Supabase — Phone authentication: https://supabase.com/docs/guides/auth/phone-login
4. Leaflet — GeoJSON layers: https://leafletjs.com/examples/geojson/
5. OpenStreetMap Foundation — Tile usage policy: https://operations.osmfoundation.org/policies/tiles/
6. Overpass Turbo — OSM geographic queries: https://overpass-turbo.eu/
7. NASA Earthdata: https://www.earthdata.nasa.gov/
8. NASA POWER: https://power.larc.nasa.gov/
9. GPM IMERG information: https://gpm.nasa.gov/data/imerg
10. NASA SMAP: https://smap.jpl.nasa.gov/
11. USGS Landsat Collection 2: https://www.usgs.gov/landsat-missions/landsat-collection-2

---

## Change History

| Version | Date | Change | Approval |
|---|---|---|---|
| 1.0 | 2026-11-14 | Initial English requirements baseline for Field Shift | Pending team review |
| 1.1 | 2026-11-14 | Rename to flaht bladi / CSIA6; two-developer milestone workflow; separate concise reference documentation; frontend-only scope with deferred recommendation and backend/API | User-requested scope revision |

**Change-management rule:** This file is version-controlled. Any approved change to product scope, functionality, constraints or acceptance criteria must update this specification in the same pull request as the corresponding implementation change. Keep the design guide, API contracts and task board consistent.
