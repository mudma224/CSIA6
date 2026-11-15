# flaht bladi — Frontend Milestone Guide

**Repository:** `CSIA6` · **Team:** DEV1 + DEV2 · **Baseline:** M0 completed and integrated into `main` (as reported by the team)  
**Status:** Roadmap and ownership; execution details live in the current milestone guide. **Workflow revised:** 15 November 2026.

## 1. Scope and design boundaries

Build the **frontend first** using the M0 Next.js/React/TypeScript/Tailwind foundation and the provided design ZIP's visual tokens (never copy its example screens). Keep `en` (LTR) and `ary` (Arabic-script Darija, RTL), accessible 44px targets, usable audio text fallback and mobile-first design. Backend routes, APIs, real SMS login, databases, domain/agronomic calculations and fabricated geographic/scientific data are forbidden during frontend milestones. **Crop recommendations stay explicitly unavailable** until a validated, approved data-science handoff; the proposed v0.1 contract is not implementation authority.

## 2. Fixed responsibilities and order

Development is **sequential, not parallel**. Exactly one milestone feature branch is under active development at a time; no next milestone starts until its predecessor has passed tests, merged locally into `main`, and been pushed to GitHub.

| Order | Milestone | Sole implementation owner | Exact feature branch | Deliverable / gate |
|---|---|---|---|---|
| Done | M0 — Foundation | Completed by both developers | Historical M0 branches | Baseline is in `main`; retain M0 guides as historical records |
| 1 | **M1 — Welcome, access & navigation** | **DEV1** | `feature/m1-dev1` | Bilingual welcome/first-visit audio fallback, phone-format demo UI, dashboard, responsive navigation, honest profile and unavailable destinations |
| 2 | **M2 — Parcel journey & deferred rotation** | **DEV1** | `feature/m2-dev1` | Guided parcel inputs, location-selection UI, client-side usability validation, preserved local form state; recommendation placeholder only |
| 3 | **M3 — Interactive Tadla mapping** | **DEV1** | `feature/m3-dev1` | Map/tiles/attribution, verified feature inventory, filters, popups and source/precision labels; no invented geography |
| 4 | **M4 — Community, calendar & sharing UI** | **DEV2** | `feature/m4-dev2` | Labeled local/demo community interactions, vetted calendar or unavailable state, privacy-safe copying/sharing |
| 5 | **M5 — Frontend hardening & API handoff** | **DEV2** | `feature/m5-dev2` | End-to-end farmer journey, accessibility/RTL/audio/map audits, empty/error checks, documented future API boundaries |

Ownership includes implementation, tests and the milestone execution guide. DEV1 may hand off to DEV2 **only after M3 is pushed and validated on `main`**. Avoid editing unfinished milestone code on another branch.

## 3. Local branch integration — no Pull Requests

For each milestone `MX`:

1. Verify `main` is clean and current: `git switch main && git pull --ff-only origin main`; capture `git rev-parse HEAD`.
2. Create **only that milestone's exact feature branch** from this baseline (`git switch -c feature/mX-devY`, using lowercase `m` and the assigned number/owner).
3. Implement exclusively frontend UI, tests and its **one** current execution guide; maintain code–guide synchronization with every change. Update shared architecture docs only where facts change.
4. Run documented task-level checks, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` and manual bilingual/mobile/audio checks. Commit all source and documentation together; keep feature changes off `main`.
5. Merge **locally** using `git switch main`, `git pull --ff-only origin main`, `git merge --no-ff --no-commit feature/mX-devY`; rerun full checks on this candidate integration state; commit the merge only when all required gates pass; then `git push origin main`.
6. Confirm `origin/main` has the promoted SHA; record actual results and short handoff. **Only now** begin the next milestone.

No `integration/mX` branches, no PR creation/reviews, no direct feature implementation on `main`, no force push. If a GitHub rule still **requires PRs or rejects local merge pushes**, a repository administrator must update the rule to permit this agreed workflow **before** the push. Keep non-PR protections where compatible (e.g. block force/deletion; use CI on `push` to `main`). Never bypass a failed test.

## 4. Current execution-guide policy

Generate **one guide for the active milestone and sole owner**, based on the checked-out, merged `main`, the cahier des charges, the four shared docs, design ZIP and pending data-science boundary. Initially: `docs/frontend/milestone-M1/M1-DEV1.md` only. Do not generate M2–M5 guides ahead of their turn. Each guide includes exact file paths, **complete implementation code**, dependency handling, commands, tests, expected results, manual verification, documentation synchronization and local-merge instructions. The old M0 guides remain untouched historical records of the process used at that time.

## 5. Acceptance, time pressure and future handoff

For every milestone: required screens/routes work without backend, app copy honestly distinguishes local/demo and unavailable states, both locales and directions work, keyboard focus/mobile layout remain usable, relevant tests/build succeed, and the **committed guide matches every affected file**. Missing manual verification is `NOT VERIFIED`, not `PASS`. On conflict/failure, keep remote `main` stable and fix the feature branch.

Prioritize P0 over P1 if the hackathon timeline tightens. After M5, summarize actual UI inputs, local state, missing persistence/security, verified data provenance and approved audio assets; define backend/model API contracts **only after** the relevant handoff. The M1 guide does not authorize creating M2–M5 functionality.
