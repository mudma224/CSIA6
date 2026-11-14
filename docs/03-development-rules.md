# Field Shift — Mandatory Development Rules

**Status:** Binding team-wide working agreement for the frontend. **Language:** English. **Source of truth:** validated `main` branch and the guides in this repository. **Do not confuse the design system preview with production pages.**

## 1. One milestone at a time

- M0 foundation → M1 app shell → M2 rotation → M3 mapping → M4 community → M5 final validation.
- Only the single coordinator generates the **four guides for the current milestone** using Claude. No next-mile guide is created until the current milestone passes and reaches `main`.
- All four guides share architecture, packages, tokens, translations, branch workflow and tests; implementation work/file ownership differs.
- The coordinator reads the final merged code, tests, and documentation before generating the next milestone.

## 2. Exact branches and gate

- `main`: protected, release-ready; never push directly.
- `integration/mX`: temporary milestone aggregation branch, created from the last passing `main`.
- `feature/mX-devY-description`: task branch, created from the current milestone integration baseline.
- Pull requests target **`integration/mX`**, not `main`. An assigned integrator combines approved feature PRs, validates the complete milestone, then raises a PR from `integration/mX` into `main`.
- Merge the milestone into `main` only after individual checks, integrated checks, documentation verification and manual acceptance are complete.
- Require one different developer to review each feature PR; use GitHub branch protection and required CI checks where available.
- Do not force-push shared branches or commit credentials, real phone numbers, precise private parcel coordinates, or secrets.

## 3. The uncompromising change-to-guide rule

**Every time any developer changes even one line of code, they must compare that line to their current guide and update the guide in the same PR if it contains changed code, behavior, commands, paths or tests.** If no guide text needs adjustment, explicitly state `Guide checked; no update required` in the PR description. The code and guide must never contradict each other.

- Each guide's code blocks are executable source snapshots, not rough examples.
- If a code line differs, **fix the corresponding guide code block** and update tests/expected outputs when affected.
- Change the shared rulebook and/or design-system reference when shared conventions change; coordinate edits to prevent conflict.
- PR reviewers compare changed files against guide code blocks and require updates before approval.
- Integrator records integration-only edits in `docs/integration/` and corresponding guide references; no undocumented last-minute patches.

## 4. File ownership / conflict avoidance

- M0 DEV1: package setup, `src/app/globals.css`, bootstrap `src/app/layout.tsx` and `src/app/page.tsx`, global config, README, initial design assets.
- M0 DEV2: `src/components/ui/`, UI component tests.
- M0 DEV3: `src/i18n/`, `src/components/i18n/`, translation tests.
- M0 DEV4: `src/components/audio/`, `src/tests/`, `vitest.config.ts`, audio assets manifest and recording scripts.
- M0 coordinator/integrator: **final wiring** of `src/app/page.tsx` and `src/app/layout.tsx` after all feature PRs have landed. The exact final files are in `docs/integration/`.
- If two tasks must touch a shared file, first agree an integration owner and edit location; no silent overlapping edits.

## 5. Visual and agricultural truth

- Source of visual tokens: supplied ZIP `docs/reference/Field_Shift_Design_System_Source.zip` and `docs/02-design-system.md`.
- Exact palette: forest `#193D2B`, leaf `#39794F`, sage `#A8C98A`, canvas `#F5F6EF`, cream `#FFFDF8`, harvest `#D9A44B`, water `#DCECE6`; retain full tokens in `globals.css`.
- Do not copy the ZIP's sample Home, Field, Crop Rotation or Sign-in page compositions. Routes must follow the cahier des charges.
- Farmer-first: minimal typing; large illustrations and tappable controls; touch targets >=44px; body >=16px; clear disabled/error/unknown states; never rely on color alone.
- The bundled photos are illustrative, never actual Tadla parcels, crops, or satellite observations.
- Model/API contract pending: **no invented crop recommendations, savings, accuracy, yields, confidence or real-time water data.** Label demo data as demo data. Only show geographic locations with verified provenance.

## 6. Localization and accessible audio

- Exactly **Darija (`ary`, Arabic script, RTL)** and **English (`en`, LTR)** in the MVP. This decision supersedes older Arabic/French wording in the original requirements draft.
- Locale chosen before phone-first demo entry (M1) and persisted. Changing locale must not erase form data. Every new UI string requires both translations.
- Static help can be a short prerecorded Darija/English MP3. M0 provides reusable audio infrastructure but the source ZIP includes **no recordings**. Audio buttons should fail gracefully or be omitted when no approved recording exists.
- Audio is **tap-to-play only**. Never autoplay; do not ask for microphone permissions. For first-visit help (M1), pulse the speaker icon using CSS with `prefers-reduced-motion` support.
- Provide visible text for audio instructions. Dynamic farmer posts and ML explanations must not be automatically narrated until a real tested TTS solution exists.

## 7. Tooling and tests

- Required baseline: TypeScript strict mode, Next.js, React, Tailwind CSS, ESLint, Vitest, Testing Library. Use `npm ci` after `package-lock.json` exists. Do not mix npm, yarn and pnpm lockfiles.
- Every developer checks touched files, manually verifies relevant behavior and runs `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` once the integrated dependency tree is available.
- M0 bootstrap DEV1 must pass lint, typecheck and build *before* DEV2–DEV4 branches start. DEV2–DEV4 tests pass on their own branches after dependencies are committed.
- The integration branch must pass `npm run check` and browser-based mobile checks (at least 360px and desktop), locale switch, RTL, audio non-autoplay and missing-audio error states.
- Fail = stop; fix, retest, update guide. Tests are evidence, not a formality. Do not claim they passed without executing them.
- `npm run build` alone is not proof of accessible UI. M5 adds end-to-end and additional accessibility verification.

## 8. Security and dependencies

- No production SMS OTP until a real provider/billing/permission setup is verified. Demo login must be labeled.
- Do not commit `.env` files, API tokens or private data. Do not embed external speech API keys in client components.
- Reuse source images according to their credits; audit actual provenance and licensing before production use.
- External map tiles must show provider attribution; actual map deployment occurs in M3, not M0.

## 9. PR template (copy)

```
Task: M0-DEV#
Base: integration/m0
Files touched:
Code/guide synchronized: yes | Guide checked; no update required
Commands executed + results:
Manual browser checks + results:
Known limitations:
Reviewer:
```

## 10. Final handoff gate

Coordinator checks that `main` includes a matching set of code and guides, records actual test results and known limits, and only then generates M1. If repository state differs from this package, inspect it before copying files: **never overwrite existing team work blindly**.
