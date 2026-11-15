# flaht bladi — Lightweight Documentation Strategy

**Repository:** `CSIA6` · **Team:** 2 frontend developers  
**Goal:** Keep documentation **brief, accurate and synchronized with implementation**, making later backend/API work easy without inventing contracts now.

## 1. Document hierarchy: one purpose per file

| File | Single responsibility | When to update |
|---|---|---|
| `docs/01-cahier-des-charges.md` | Approved product scope and acceptance criteria | When agreed functionality/scope changes |
| `docs/frontend-guide.md` | Milestone roadmap and two-person division | When milestone plan/order changes |
| `docs/instructions.md` | Non-negotiable frontend rules and Git/testing gates | When a team rule changes |
| `docs/system-design.md` | Current architecture, routes, boundaries, data provenance rules | When architecture, shared components or ownership changes |
| `docs/documentation-strategy.md` | How and when documentation is maintained | Only when documentation process changes |
| `docs/frontend/milestone-MX/MX-DEVY.md` | One complete execution guide for the current milestone/sole assigned owner | **Whenever affected code changes** |
| `docs/decisions.md` (optional) | Brief dated decisions with rationale | When the team makes a non-obvious tradeoff |

Keep the approved design-system ZIP as a read-only visual source (or a documented location/link); do not use its example pages as frontend screen requirements. Record asset licenses and approved audio transcripts/recordings close to the relevant assets.

## 2. Continuous update rule

**Every line change triggers a guide check.** In the same feature-branch commit, verify that any code snippet, file path, npm command, expected output and test in that developer's current execution guide matches the actual change. Update the guide if needed; otherwise state `Guide reviewed: still accurate` in the milestone verification log. Update shared reference docs **only if their factual content is affected**. No generic history paragraphs or copy-pasting whole code files into all four reference documents.

Keep updates close to the code: small and specific. **No merge or push if code and its execution guide disagree.** Do not defer synchronization until milestone end.

## 3. The minimum documentation for each feature

Use this concise template in an execution guide or feature README (ideally 5–10 short lines):

```md
### [Feature / route]
- Purpose: ...
- Owner / files: DEV1 or DEV2 — `src/...`
- Data shown/collected: ... (units / locale as relevant)
- Current source: UI-local demo / static verified data / recorded audio
- User interactions and validation: ...
- Empty/loading/error states: ...
- Backend later: required capability, **TBD contract** (or none)
- Tests: command + manual acceptance check
```

For external geographic or agricultural facts, attach **source URL, verification date, geographic scope, and precision limitation** to the data file or a short data index. For recorded audio, record filename, locale, transcript, reviewer and recording/usage permission. Avoid fabricated statuses, coordinates and placeholders that look real.

## 4. Sequential documentation workflow per milestone

1. **Baseline:** Previous milestone must be confirmed on `origin/main`. Record baseline SHA and inspect the actual repository. M0 is completed; DEV1 owns M1–M3, DEV2 owns M4–M5.
2. **Guide creation:** Generate exactly **one** complete guide for the next active milestone: M1 `M1-DEV1.md`, then M2 `M2-DEV1.md`, M3 `M3-DEV1.md`, M4 `M4-DEV2.md`, M5 `M5-DEV2.md`. Do **not** generate later guides early.
3. **During work:** Keep guide source blocks, commands, paths, tests, expectations and changed shared reference facts synchronized **on the feature branch** in the same commit. Historical M0 guides are not rewritten to describe the new process.
4. **Feature gate:** Record actual PASS/FAIL/NOT VERIFIED for lint, types, tests, build and applicable manual checks. Document `Guide reviewed: still accurate` only when it is truly unchanged and verified.
5. **Local integration:** Merge the feature branch locally into `main` using `--no-ff --no-commit`. Rerun required checks on the merged tree. Fix failures before committing/pushing. **No Pull Requests or integration branches.**
6. **Promotion / handoff:** Push tested `main` to GitHub; record the pushed SHA and a 3–5-line milestone handoff. Begin the next milestone only after remote `main` is verified.

## 5. Small milestone verification template

```md
### Milestone / owner / baseline SHA
- Milestone: ... | Owner: ... | Branch: ... | Baseline: ...
### Implemented / documented
- Main paths or routes: ...
- Guide updates: ... (or "Guide reviewed: still accurate")
- Other docs updated: ... / none needed
### Checks (actual outcomes only)
- Feature tests: PASS / FAIL / NOT RUN
- lint / typecheck / full tests / build: ...
- Mobile + desktop, en + ary/RTL, keyboard, audio/map where relevant: ...
### Integration and handoff
- Local merge checks: ...
- Pushed `main` SHA: ...
- Deferred backend/data/model capabilities: ...
```

Do not claim tests or GitHub CI passed unless observed. Keep the GitHub Actions workflow aligned with **pushes to `main`**, rather than relying solely on the older M0 PR trigger. M1's current execution guide owns that adjustment.

## 6. Frontend-to-backend handoff (after frontend completion)

Provide a compact inventory of screens and user actions, UI-owned fields and validation, what currently uses local demo state, what requires real persistence/authorization, geographic source metadata, audio language/asset mapping, and empty/error behavior. **Do not define final REST endpoints or model JSON now.** Once backend development starts, document approved API contracts separately from frontend display types. After the data scientist delivers validated model inputs/results, document the crop vocabulary, score meanings, uncertainty and explanation provenance before building the recommendation feature.

## 7. Acceptance of documentation quality

A teammate with the docs and checked-out `main` should be able to: identify which milestone is next, know the two developers' responsibilities, find the correct code/test instructions, distinguish live from demo functionality, and see exactly which integrations remain deferred. If not, revise the smallest relevant section—not the entire documentation set.
