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
| `docs/frontend/milestone-MX/MX-DEV1.md` / `MX-DEV2.md` | Exact full code, commands and tests for **current** milestone | **Whenever affected code changes** |
| `docs/decisions.md` (optional) | Brief dated decisions with rationale | When the team makes a non-obvious tradeoff |

Keep the approved design-system ZIP as a read-only visual source (or a documented location/link); do not use its example pages as frontend screen requirements. Record asset licenses and approved audio transcripts/recordings close to the relevant assets.

## 2. Continuous update rule

**Every line change triggers a guide check.** In the same PR, verify that any code snippet, file path, npm command, expected output and test in that developer's current execution guide matches the actual change. Update the guide if needed; otherwise state `Guide reviewed: still accurate` in the PR. Update shared reference docs **only if their factual content is affected**. No generic history paragraphs or copy-pasting whole code files into all four reference documents.

Keep updates close to the code: small and specific. **No passing PR if code and its execution guide disagree.** Do not defer synchronization until milestone end.

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

## 4. Documentation workflow per milestone

1. **Before coding:** Coordinator confirms `main` SHA, checks docs, generates exactly two guides for the current milestone with explicit file ownership and runnable test steps. Previous milestone must be merged.
2. **During coding:** Each developer updates their own guide immediately alongside source/tests. One PR = implementation + relevant documentation.
3. **Before individual PR:** Run task tests; check guide instructions against the actual files; summarize test results and any incomplete checks.
4. **Integration:** Merge reviewed feature PRs into `integration/mX`, validate the full flow, correct shared docs and guide snippets for integration fixes, and record pass/fail results.
5. **Promotion:** Merge `integration/mX` into protected `main` only after review and passing checks. Record final SHA and a 3–5-line handoff.
6. **Next milestone:** Generate the next pair of guides from the **actual merged repository**, not previous expectations. No future-milestone guides in advance.

## 5. Small PR template

```md
### What changed
- ...
### Files / ownership
- ...
### Verification
- lint: PASS / FAIL / NOT RUN
- typecheck: PASS / FAIL / NOT RUN
- tests/build: PASS / FAIL / NOT RUN
- manual mobile + Darija/RTL + English + audio/map (as applicable): ...
### Documentation
- Updated: ...  OR  Guide reviewed: still accurate
### Constraints / later backend work
- ... (only if relevant)
```

Never claim tests passed without running them. Screenshots are useful for visual review, but do not replace automated tests. Keep PR notes short; avoid duplicating the entire guide.

## 6. Frontend-to-backend handoff (after frontend completion)

Provide a compact inventory of screens and user actions, UI-owned fields and validation, what currently uses local demo state, what requires real persistence/authorization, geographic source metadata, audio language/asset mapping, and empty/error behavior. **Do not define final REST endpoints or model JSON now.** Once backend development starts, document approved API contracts separately from frontend display types. After the data scientist delivers validated model inputs/results, document the crop vocabulary, score meanings, uncertainty and explanation provenance before building the recommendation feature.

## 7. Acceptance of documentation quality

A teammate with the docs and checked-out `main` should be able to: identify which milestone is next, know the two developers' responsibilities, find the correct code/test instructions, distinguish live from demo functionality, and see exactly which integrations remain deferred. If not, revise the smallest relevant section—not the entire documentation set.
