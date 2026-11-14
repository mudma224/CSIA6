# Field Shift — Start Here (M0 only)

This package contains **two things**: (a) the four step-by-step M0 Markdown guides and shared rules, and (b) an **example of the fully integrated M0 source tree** for reference and line-by-line verification. Do not copy the complete integrated tree onto DEV1's branch before other developers do their assigned work: that would defeat parallel ownership.

## The order, exactly

1. Coordinator uploads shared `docs/` files to a repository with an initialized `main`, protects `main`, selects an integration owner and reviewer(s), and verifies source ZIP/design-system provenance.
2. One owner creates `integration/m0` from `main` (the DEV1 guide illustrates this), and DEV1 creates `feature/m0-dev1-foundation` from it.
3. DEV1 follows their guide, copying only DEV1-owned code plus bootstrap `src/app/layout.tsx` and `src/app/page.tsx` from `docs/integration/M0-bootstrap-*.tsx.txt`. DEV1 must install dependencies, generate/commit `package-lock.json`, and pass lint/typecheck/build.
4. DEV1 PR is reviewed and merged into `integration/m0`; DEV2–DEV4 branch from **this updated integration branch** and follow their own guides in parallel.
5. Feature PRs go into `integration/m0`; integration owner copies final layout/page snapshots from `docs/integration/M0-final-*.tsx.txt` and runs `npm run check` and manual mobile/RTL/audio checks.
6. Only after all checks pass, open reviewed PR `integration/m0` → `main`. No direct push to main. Generate the four M1 guides **only after that PR merges**.

## Critical notes

- The original design ZIP is a **visual token reference only**, not an application screen specification.
- Darija (Arabic-script RTL) + English (LTR) supersede the earlier Arabic/French draft.
- Audio recording files are **not supplied**; scripts are drafts; audio must be tap-to-play and handle unavailable MP3s.
- Real phone OTP, model API and agricultural predictions are **not implemented in M0**.
- **Every code-line edit requires a review of the corresponding guide**, with a guide update in the same PR when its text/code differs.
- **Verification limitation:** these guides contain full source code, but automated npm checks must still be run on developers' machines; see `docs/07-verification-status.md`.

## Guides

- `docs/03-development-rules.md` — binding shared team rules.
- `docs/frontend/milestone-0-foundation/M0-DEV1-foundation.md`
- `docs/frontend/milestone-0-foundation/M0-DEV2-foundation.md`
- `docs/frontend/milestone-0-foundation/M0-DEV3-foundation.md`
- `docs/frontend/milestone-0-foundation/M0-DEV4-foundation.md`
- `docs/integration/M0-integration-checklist.md`
- `docs/05-milestone-roadmap.md` — planned M1–M5 only, not code for those milestones.
