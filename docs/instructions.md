# flaht bladi — Mandatory Frontend Instructions

**Repository:** `CSIA6` · **Scope:** two-developer frontend-first implementation · **Applies to:** every milestone, feature branch and local integration. Read with `01-cahier-des-charges.md`, `frontend-guide.md`, `system-design.md`, and `documentation-strategy.md`.

## 1. Non-negotiable architecture boundaries

**Allowed in frontend:** React components, routes/layouts, design tokens, accessibility, language strings and RTL/LTR, audio playback, map visualization, simple UI interaction state, input-format/usability checks, explicitly labeled local demo states, and non-sensitive share/copy controls.

**Forbidden during frontend phase:**

- Backend routes, API handlers, server actions for domain operations, direct database access, real account/session management or phone OTP service integration.
- Authorization, security policy enforcement, payment operations, server persistence, real multi-user posting or messaging.
- Scientific/agronomic recommendations, ranking, crop suitability, expected water savings, yields/profit or data processing inside UI components.
- Fake model responses, fabricated comparison cards, invented coordinates, fictitious data timestamps, unverified market/supplier inventory.
- API URLs, credentials or inferred contract types invented in anticipation of the data scientist's handoff.

**Temporary UI-only state** may demonstrate form navigation and non-sensitive examples; label such experiences **Demo / Local only**. Browser validation helps the user but is **not** a substitute for later server validation. Real business rules, persistence, authorization and scientific computations belong to the future backend/model phase.

**Recommendation rule:** The feature is **on hold**. Add a discoverable navigation destination with only “Recommendations not available yet / awaiting model” in both locales. Do **not** build comparison UI, algorithms, computed values, or mock recommendation fixtures before the data-science handoff.

## 2. Sequential owner responsibilities

- **DEV1:** Owns M1, M2 and M3, in that order. Full implementation, tests, documentation and local integration for each milestone.
- **DEV2:** Owns M4 and M5, in that order, after M3 is integrated. The same full ownership applies.
- **M0:** Already completed by both developers; keep historical M0 guides as records, not as current Git workflow instructions.
- **Data scientist:** Provides a separate, proposed handoff; no frontend dependency on unapproved contracts or unready recommendations.

There is **one active developer/milestone branch at a time**. A milestone owner can maintain shared frontend files as required, but documents all affected changes. No developer overwrites another's unmerged work.

## 3. Branching and integration — no Pull Requests

1. **`main` is the stable integration branch.** Never develop directly on it. Start from clean, up-to-date `main`, capture its baseline SHA, then create the exact branch for the current milestone: `feature/m1-dev1`, `feature/m2-dev1`, `feature/m3-dev1`, `feature/m4-dev2`, or `feature/m5-dev2`.
2. Make source, tests and documentation changes **on the feature branch only**; commit them together. No PRs and no `integration/mX` branches.
3. Before merging, run feature tests plus `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and applicable manual mobile, desktop, bilingual and accessibility checks. Record actual results.
4. Locally merge into clean `main` using `git merge --no-ff --no-commit <feature-branch>`. Rerun required checks **on the merged tree** before completing the merge commit; on failure, abort the merge and fix the feature branch.
5. Only after tests and guide parity pass, create the merge commit, `git push origin main`, confirm the remote SHA, and document the handoff. **Do not begin the next milestone before this succeeds.**
6. Preserve compatible GitHub protections and CI checks. If the existing rules require a PR or forbid pushing a verified local merge to `main`, an authorized admin must adjust those rules; never bypass permissions, force push or treat a failed test as success.

**Exact order:** M0 complete → M1 DEV1 → M2 DEV1 → M3 DEV1 → M4 DEV2 → M5 DEV2. Only the currently due execution guide is generated; do not pre-author later guides. The guide must be based on files actually in `main`, not only historical M0 instructions.

## 4. Guide-code synchronization — highest priority

**Every time anyone changes even one line of source, test, configuration or styling code:**

1. Check the current milestone guide's corresponding file/code/commands.
2. Update it in the **same feature-branch commit** if the instructions, snippets, paths, tests or expectations changed.
3. If no text change is needed, record `Guide reviewed: still accurate` in the milestone verification/handoff log.
4. Update any affected shared architecture/decisions note briefly; rerun relevant tests.

**No local merge or push if executable guidance contradicts committed code.** Update docs *while developing*, not weeks later. Preserve concise, readable change notes; do not duplicate entire files in several documents.

## 5. UI, language, audio and farmer accessibility

- Use the supplied design system for visual language **only**. Its showcase pages are not feature requirements. Respect approved forest/leaf/sage/cream tokens; follow the original `styles.css` when translating to Tailwind.
- Darija (Arabic script, `ary`, `rtl`) + English (`en`, `ltr`) on **all** screens, including messages and form errors. Select language before entering the application; persist without losing in-progress input.
- Large readable buttons and cards; aim for 44 px minimum hit areas, high contrast, keyboard/focus support, responsive small-screen layouts. Prefer images/tapping over free typing; add an “I don't know” choice where valid.
- Reusable audio help: short reviewed recordings by locale, tap to play, pause/replay and missing-file fallback. Text equivalents always visible. **No autoplay.** First visit: green pulsing speaker icon explaining its use; respect `prefers-reduced-motion` and keep help replayable.
- No audio recording, speech recognition, cloud TTS or dynamic spoken recommendations within the frontend-only scope. Do not claim audio exists until recorded files are actually provided and tested.
- Respect map attribution, dates, uncertainty and source metadata. Do not make visual imagery look like a validated satellite measurement.

## 6. Testing rules

Every task must specify and run appropriate checks: TypeScript, linting, unit/component tests, relevant browser interactions, small mobile/desktop visual checks, localization/RTL, audio playback/error handling and map correctness. Integrated milestone additionally requires clean install feasibility and production build. Never mark a command as passed unless actually executed and verified. Where an external browser or device is unavailable, record **not verified**, never “passed”.

**Milestone-aware smoke checks:** M1: first-visit language/audio fallback → demo access → dashboard → navigation and unavailable pages → profile/language switch. Add parcel form in M2, verified map/filter/popup in M3, community/calendar in M4; repeat the full end-to-end journey in M5. Test both locales and keyboard/touch; never fail M1 merely because future screens do not exist yet.

## 7. Content and privacy

Use verified crop labels and geographic records only. No misleading real user accounts, live weather, satellite-derived parcel precision, working OTP, stored community messages or social posting claims. Avoid sensitive exact parcel locations in sharing; never expose private phone numbers by default. Facebook supports manual share-link UX when a real safe public URL exists; otherwise offer copy-text with honest messaging. No personal-profile auto-posting.

## 8. How to hand these documents to the milestone-guide generator

Provide the updated requirements, these four reference documents, the approved design-system source, the current repository tree and current `main` commit. Request **only one guide for the currently active milestone/assigned owner**, including full copy-ready code, paths, Git commands, tests, documentation and the no-PR local integration sequence. Reject any output that invents backend logic, creates recommendation results or makes assumptions about uninitialized files.
