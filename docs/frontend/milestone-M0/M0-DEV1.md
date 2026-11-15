# flaht bladi — M0 (Foundation) — DEV1 execution guide

**Repository:** `CSIA6` · **Owner:** DEV1 · **Integration owner:** DEV1  
**Inputs:** approved requirements v1.1, all four shared guidance docs, design-system source ZIP, and proposed (unapproved) data-science briefing.  
**Target files in repository:** `docs/frontend/milestone-M0/M0-DEV1.md` (this guide) and `M0-DEV2.md`.  
**Scope:** **M0 only**. Do not start or author M1 instructions.

## 0. Outcome and ownership

At completion, `main` has an installable Next.js App Router + React + TypeScript + Tailwind CSS foundation, original design tokens, lint/type/test/build gates, a bilingual UI component preview, reusable i18n and opt-in audio scaffolding, and a documented no-backend/no-recommendations boundary. **This is not the actual farmer welcome/dashboard/form/map implementation.**

**DEV1 owns:** GitHub initialization, `README.md`, `.nvmrc`, `.gitignore`, `package.json`, **generated** `package-lock.json` and `next-env.d.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (two specified versions), `tests/bootstrap.test.ts`, `.github/workflows/frontend.yml`, initial `docs/` imports, and final shared-doc status updates. Both M0 guide files enter the repository in DEV1's bootstrap PR; each developer maintains their own guide thereafter.

**DEV2 owns only** the files listed in `M0-DEV2.md` after DEV1's reviewed bootstrap PR merges. DEV2 must **not** edit DEV1-owned files or install/change dependencies or the lockfile without a reviewed, documented ownership transfer. All test dependencies are installed during DEV1 bootstrap; DEV2 configures and exercises them.

**Order and branch gates (mandatory):**

1. **DEV1 / GitHub initialization:** create `main` README baseline in GitHub UI (the sole initial-repo exception), configure main protection, create `integration/m0` from `main`, create `feature/m0-dev1-bootstrap` from `integration/m0`.
2. **DEV1 / bootstrap PR:** import reference sources, write all DEV1 bootstrap files below, install dependencies, commit lockfile and generated Next types, run **bootstrap tests**; push and open `feature/m0-dev1-bootstrap` → `integration/m0`. **DEV2 reviews** and DEV1/maintainer merges only after the checks pass.
3. **DEV2 / feature PR:** branch `feature/m0-dev2-shared-ui` from the **updated** `integration/m0`; complete own guide and tests; DEV1 reviews and merges into `integration/m0`.
4. **DEV1 / wiring PR:** branch `feature/m0-dev1-wire-foundation` from updated `integration/m0`; replace **only** `src/app/page.tsx` with the integration code below; update current architecture status and both developer guides as needed; rerun all checks. DEV2 reviews and merges.
5. **DEV1 / integration gate:** validate merged `integration/m0` using a **fresh checkout + `npm ci`**, automated tests and human checks, then open a reviewed PR **`integration/m0` → `main`**. DEV2 reviews. Do **not** begin M1 until merged and final `main` SHA recorded.

No API endpoints, backend/domain logic, invented model types/fixtures/results, real auth, fabricated map records or recorded audio are part of M0. The data-science briefing v0.1 is **proposed**, not approved: archive as documentation only, **do not implement** its request/response shapes or model assumptions.

## 1. Prerequisites and one-time GitHub setup

- Both developers: install Git, Git Bash (Windows) or a POSIX shell, **Node.js 22.22.2**, npm, and VS Code. Check `git --version`, `node --version` (must be `v22.22.2`) and `npm --version`.
- Both developers must have GitHub repository permissions sufficient for branch pushes and PR review. Set a Git identity: `git config --global user.name "Your GitHub display name"` and `git config --global user.email "your-verified-git-email"` (replace with actual values).
- `CSIA6` means **repository name only**; replace `YOUR_GITHUB_OWNER` below with the actual GitHub user/organization. Never guess its owner.
- In GitHub UI, create the repository if missing. If it exists **without branches**, initialize it using **Add a README**; if `main` already exists, use it without reinitializing. Set default branch to `main`. A new empty repository needs this one initial seed commit; subsequent changes must go through PRs.
- In **Settings → Rules → Rulesets** (or Branch protection), protect `main`: block direct pushes/deletions/force-pushes, require at least **1 independent approval**, require up-to-date branches and **`checks`** CI status after the workflow first appears. Enforce the same reviews for the integration PR, and enable Actions for the repository. If the platform/repo plan cannot enforce a rule, use an explicitly documented manual gate; do not claim it is protected.
- **Stage all 9 files locally** in a dedicated folder: `01-cahier-des-charges-updated.md`, `frontend-guide.md`, `instructions.md`, `system-design.md`, `documentation-strategy.md`, `TEAM_BRIEFING_DATA_CONTRACT.md`, `Field_Shift_Design_System_Source.zip`, and the two downloadable guides (`M0-DEV1.md`, `M0-DEV2.md`). That's **9 files total** (7 supplied reference/source files + 2 guides). Ensure file extensions are not doubled (`.md.md`). The design ZIP is an immutable **visual reference**, not source code to copy into screens; its README says illustration metrics and map data are fictional.

### Git Bash commands — repository not yet cloned

```bash
export GH_OWNER="YOUR_GITHUB_OWNER"      # replace once, no angle brackets
export SOURCE_DIR="$HOME/Downloads/flaht-bladi-m0-sources"  # replace with real local folder

git clone "https://github.com/${GH_OWNER}/CSIA6.git"
cd CSIA6
git switch main
git pull --ff-only origin main
git rev-parse --short HEAD  # record baseline SHA in PR description

git switch -c integration/m0
git push -u origin integration/m0   # creates integration baseline; no code direct-push

git switch -c feature/m0-dev1-bootstrap
```

Expected: initial README exists on `main`; `git branch --show-current` prints `feature/m0-dev1-bootstrap`; `git remote -v` references the real `CSIA6` owner. If the repository is private, authenticate via Git Credential Manager or a supported credential flow, not a token pasted into code.

## 2. Copy and verify the authoritative project sources

Run from **repository root**, on the bootstrap feature branch:

```bash
mkdir -p docs/frontend/milestone-M0 docs/reference docs/design
for file in 01-cahier-des-charges-updated.md frontend-guide.md instructions.md system-design.md documentation-strategy.md TEAM_BRIEFING_DATA_CONTRACT.md Field_Shift_Design_System_Source.zip M0-DEV1.md M0-DEV2.md; do
  test -f "$SOURCE_DIR/$file" || { echo "MISSING SOURCE: $file"; exit 1; }
done
cp "$SOURCE_DIR/01-cahier-des-charges-updated.md" docs/01-cahier-des-charges.md
cp "$SOURCE_DIR/frontend-guide.md" docs/frontend-guide.md
cp "$SOURCE_DIR/instructions.md" docs/instructions.md
cp "$SOURCE_DIR/system-design.md" docs/system-design.md
cp "$SOURCE_DIR/documentation-strategy.md" docs/documentation-strategy.md
cp "$SOURCE_DIR/TEAM_BRIEFING_DATA_CONTRACT.md" docs/reference/TEAM_BRIEFING_DATA_CONTRACT.md
cp "$SOURCE_DIR/Field_Shift_Design_System_Source.zip" docs/design/Field_Shift_Design_System_Source.zip
cp "$SOURCE_DIR/M0-DEV1.md" docs/frontend/milestone-M0/M0-DEV1.md
cp "$SOURCE_DIR/M0-DEV2.md" docs/frontend/milestone-M0/M0-DEV2.md
```

Expected: exact documents are available in `docs/`; the data contract retains its **PROPOSED** label (its outdated "4 frontend" audience statement does not change the actual **2 frontend developers** team assignment). Never copy the ZIP's demo HTML screens, demo maps, numbers or fictional crop cards into app pages.

## 3. DEV1 bootstrap: create directories, source and config

From repository root:

```bash
mkdir -p src/app tests .github/workflows
```

Write the following files **verbatim**, using UTF-8. All content is complete; do not run `create-next-app` in an already cloned `CSIA6` folder because its generated defaults would conflict with the documented file tree. Only `package-lock.json` and `next-env.d.ts` are tool-generated; commit them after checking actual output.

### 3A. Repository and TypeScript configuration

**`.nvmrc`**

```bash
22.22.2
```

**`.gitignore`**

```bash
node_modules/
.next/
out/
build/
coverage/
*.tsbuildinfo
*.log
.env*
!.env.example
.DS_Store
.vscode/
```

**`package.json`**

```json
{
  "name": "flaht-bladi",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**`postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**`eslint.config.mjs`**

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);
```

### 3B. CSS/design system and base Next.js layout

**`src/app/globals.css`**

```css
@import "tailwindcss";

/* Design values transcribed from design ZIP: Field_Shift_Design_System/styles.css */
:root {
  --forest: #193D2B;
  --forest-deep: #102B20;
  --leaf: #39794F;
  --leaf-hover: #2E6743;
  --sage: #A8C98A;
  --mint: #E6F1DD;
  --canvas: #F5F6EF;
  --cream: #FFFDF8;
  --white: #FFFFFF;
  --ink: #172C22;
  --muted: #64756A;
  --border: #E1E8DA;
  --harvest: #D9A44B;
  --water: #DCECE6;
  --danger: #B34738;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-pill: 999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --shadow-soft: 0 12px 45px rgba(25, 61, 43, .06);
  --shadow-card: 0 2px 10px rgba(20, 51, 34, .04);
  --font-ui: "Inter", "Segoe UI", Arial, sans-serif;
  --font-ar: "Noto Sans Arabic", Tahoma, Arial, sans-serif;
}

@theme inline {
  --color-forest: var(--forest);
  --color-forest-deep: var(--forest-deep);
  --color-leaf: var(--leaf);
  --color-sage: var(--sage);
  --color-mint: var(--mint);
  --color-canvas: var(--canvas);
  --color-cream: var(--cream);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-harvest: var(--harvest);
  --color-danger: var(--danger);
  --font-sans: var(--font-ui);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-ui);
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
html[lang="ary"] body { font-family: var(--font-ar); }
button, input, textarea, select { font: inherit; }
a { color: inherit; }
:focus-visible { outline: 3px solid var(--harvest); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

**`src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "flaht bladi — Frontend foundation",
  description: "M0 visual and accessibility foundation; no agricultural results or backend.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
```

**`src/app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-5 px-5 py-12">
      <span className="w-fit rounded-full bg-mint px-4 py-2 text-sm font-semibold text-forest">
        M0 · bootstrap only
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-forest">flaht bladi</h1>
      <p className="max-w-xl text-lg text-ink">
        The frontend foundation is installed. A bilingual component preview will be
        connected after DEV2 finishes the shared UI and localization work.
      </p>
      <p className="text-sm text-muted">
        No accounts, backend operations, agricultural calculations or recommendations are available.
      </p>
    </main>
  );
}
```

### 3C. Baseline test, CI, and README

**`tests/bootstrap.test.ts`**

```typescript
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("M0 visual source", () => {
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

  it("preserves key approved palette tokens", () => {
    expect(css).toContain("--forest: #193D2B");
    expect(css).toContain("--leaf: #39794F");
    expect(css).toContain("--canvas: #F5F6EF");
    expect(css).toContain("--harvest: #D9A44B");
  });

  it("includes keyboard focus and reduced-motion support", () => {
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
```

**`.github/workflows/frontend.yml`**

```yaml
name: Frontend checks

on:
  pull_request:
    branches: [main, integration/m0]
  push:
    branches: [integration/m0]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

**`README.md`**

````markdown
# flaht bladi · CSIA6

Mobile-first agricultural decision-support UI for the Tadla study area.

**M0 status:** frontend foundation only. No production login, persistence,
map dataset, scientific recommendation, API client, or backend is implemented.

## Requirements

- Node.js 22.22.2 (see `.nvmrc`), npm, Git.
- Use the committed `package-lock.json`: `npm ci`.

## Local commands

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Open `http://localhost:3000`. At the end of M0 this route shows a bilingual
**foundation component preview**, not the farmer-facing welcome/dashboard.

## Project guidance

- Product scope: `docs/01-cahier-des-charges.md`.
- Rules: `docs/instructions.md`.
- Milestones: `docs/frontend-guide.md`.
- Architecture: `docs/system-design.md`.
- Documentation policy: `docs/documentation-strategy.md`.
- M0 execution: `docs/frontend/milestone-M0/M0-DEV1.md` and `M0-DEV2.md`.
- Proposed (not approved) model contract: `docs/reference/TEAM_BRIEFING_DATA_CONTRACT.md`.
- Visual reference only: `docs/design/Field_Shift_Design_System_Source.zip`.

Never wire model fixture responses, agronomic calculations or speculative API
paths into this frontend. Real audio recordings must be reviewed and licensed
before any files are added to `public/audio`.
````

## 4. Install dependencies (DEV1 owns `package.json` and lockfile)

Run only after `package.json` exists. Explicit stable core versions were checked against the current Next.js/Tailwind docs; remaining packages are resolved **once** during bootstrap, saved without semver ranges by `--save-exact`, and made deterministic for everyone by the committed `package-lock.json` plus `npm ci`. Do not later run `npm update` during M0.

```bash
npm install --save-exact next@16.4.6 react@19.2.8 react-dom@19.2.8 lucide-react
npm install --save-dev --save-exact typescript@6.0.3 @types/node @types/react @types/react-dom eslint@9.39.5 eslint-config-next@16.4.6 tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 postcss vitest@5.1.0 @vitejs/plugin-react@6.3.0 vite-tsconfig-paths jsdom@31.0.1 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.9
npm ls --depth=0
```

`npm ls --depth=0` must exit 0 and show installed Next 16.4.6, React/React DOM 19.2.8, Tailwind 4.3.3 and `eslint-config-next` 16.4.6. Node 22.22.2 is intentional: the pinned `jsdom@31.0.1` requires that Node 22 patch level or newer. If a later npm registry version causes a peer-dependency issue, **stop**, select a compatible version, regenerate the lockfile once, and update **this guide's dependency command** in the same bootstrap PR; do not bypass errors with `--force` or `--legacy-peer-deps` without team review.

First run the Next.js build/dev environment to let it generate `next-env.d.ts` (if generated) and any Next type files. Do not hand-edit its generated contents. If Next modifies `tsconfig.json`, reconcile **Section 3A** immediately so the guide matches the resulting committed code.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
# Open http://localhost:3000, then Ctrl+C in this terminal.
```

**Expected individual bootstrap results:** ESLint exits 0; TypeScript exits 0; Vitest reports **2 tests passing** from `tests/bootstrap.test.ts`; production build succeeds; `/` displays `flaht bladi`, `M0 · bootstrap only`, and an honest no-backend notice; mobile width 375px has no horizontal overflow. If tests cannot run due to network or environment, record `NOT RUN`/`BLOCKED` and do **not** merge.

### Bootstrap PR (first reviewed PR to `integration/m0`)

```bash
git status --short
git add .
git diff --cached --check
git commit -m "chore(m0): initialize frontend foundation and source documentation"
git push -u origin feature/m0-dev1-bootstrap
```

Open GitHub **Pull requests → New pull request**: base `integration/m0`, compare `feature/m0-dev1-bootstrap`; title `M0 DEV1 — Bootstrap Next.js and design tokens`. Request **DEV2** review. In the PR body include source import, Node/npm version, `npm ls --depth=0` status, baseline SHA, lint/typecheck/test/build outcomes, mobile smoke result, and **`Guide reviewed: still accurate`** or the exact guide changes. Show the complete `package-lock.json` change as generated; never omit it. **Merge only after DEV2 approval and passing checks.** Do not implement DEV2's files before this merge.

## 5. After DEV2's PR: DEV1 reviewed wiring PR

**Do not run this step until DEV2's `feature/m0-dev2-shared-ui` PR has merged to `integration/m0` and its tests are passing.** Use a fresh branch from that exact integration head:

```bash
git fetch origin
git switch integration/m0
git pull --ff-only origin integration/m0
git switch -c feature/m0-dev1-wire-foundation
```

Replace only the bootstrap `src/app/page.tsx` with this **complete, final M0 version** (it makes the reusable bilingual component preview available on `/`, and DEV2's own `/foundation-preview` remains available for isolated component review). Do **not** copy a design-system example screen.

**`src/app/page.tsx` — final M0 replacement (not bootstrap content)**

```tsx
import { FoundationDemo } from "@/features/foundation/FoundationDemo";

export default function HomePage() {
  return <FoundationDemo />;
}
```

### Final, minimal documentation synchronization (integration wiring PR)

After the final page is wired, update only facts that changed in the shared docs. The following one-time script **edits precisely `docs/frontend-guide.md` and `docs/system-design.md`**, leaving the functional requirements and the proposed data-science contract untouched:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(file, oldText, newText) {
  const before = readFileSync(file, 'utf8');
  if (!before.includes(oldText)) throw new Error(`Expected original text not found in ${file}`);
  writeFileSync(file, before.replace(oldText, newText));
}

replaceOnce(
  'docs/frontend-guide.md',
  '**Repository:** `CSIA6` (not yet initialized)',
  '**Repository:** `CSIA6` (M0 repository initialized; final merge SHA recorded in PR)'
);
replaceOnce(
  'docs/system-design.md',
  '**Project:** flaht bladi · **GitHub:** `CSIA6` (not initialized)',
  '**Project:** flaht bladi · **GitHub:** `CSIA6` (M0 initialized)'
);
replaceOnce(
  'docs/system-design.md',
  '**Status:** Proposed architecture, to be concretized and versioned in M0. No backend or API exists as a consequence of this document.',
  '**Status:** M0 foundation implemented; later screens, routes and APIs remain proposed. No backend/API exists.'
);
replaceOnce(
  'docs/system-design.md',
  '**Nothing here is assumed to exist yet.** M0 must create and verify the actual tree, then update this diagram if it differs.',
  '**M0 actual modules are recorded below.** The broader tree remains a proposal for later milestones.'
);

const file = 'docs/system-design.md';
const text = readFileSync(file, 'utf8');
const section = `

## M0 implemented foundation (verified at integration)

- Implemented routes: \`/\` and \`/foundation-preview\`, both showing the same internal foundation preview; no farmer-facing M1 screens yet.
- DEV1: App Router root layout, global approved CSS tokens + Tailwind, toolchain, CI and bootstrap checks.
- DEV2: \`src/i18n/{locale,messages,LocaleProvider}\`, \`src/components/ui/{Button,Card,TextField}\`, \`src/components/audio/{clips,AudioHelp}\`, \`src/features/foundation/FoundationDemo\`, Vitest/Testing Library tests.
- Only \`localStorage\` language preference and local preview-input UI state exist; both are **frontend-only**. No user authentication, data APIs, real audio recordings, verified map features or model computations.
- Audio manifest is intentionally empty; a visible transcript/fallback is required. The data-science v0.1 contract remains **proposed** and unimplemented.
- Proposed route table above is a future plan, not a claim the other routes already exist.
`;
if (!text.includes('## M0 implemented foundation (verified at integration)')) {
  writeFileSync(file, text.trimEnd() + section);
}
NODE
```

Check `git diff -- docs/frontend-guide.md docs/system-design.md`. If the source baseline text has changed since guide generation, **do not force-replace**: update this guide's script first, review it with DEV2, then rerun. Update your M0 guide **in the same PR** if code, dependency instructions, paths, expectations, or doc patch changed. DEV2 owns his own guide; ask DEV2 to update if integration changes affect his snippets.

### Wiring tests / PR

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
# Browser: open / and /foundation-preview; follow the manual checks below.
# Ctrl+C to stop.
git status --short
git add src/app/page.tsx docs/frontend-guide.md docs/system-design.md docs/frontend/milestone-M0/M0-DEV1.md
git diff --cached --check
git commit -m "feat(m0): connect bilingual preview and update architecture snapshot"
git push -u origin feature/m0-dev1-wire-foundation
```

If `docs/frontend/milestone-M0/M0-DEV1.md` itself did not change after review, the `git add` entry simply stages nothing for it; explicitly write **`Guide reviewed: still accurate`** in PR description. Base `integration/m0`, compare `feature/m0-dev1-wire-foundation`; request DEV2 review. **Expected:** all bootstrap + DEV2 tests pass, production build succeeds, `/` and `/foundation-preview` show equivalent bilingual previews. Do not merge on any unverified error.

## 6. Final integration gate (DEV1 owner; DEV2 independent reviewer)

After **both developers' feature PRs** and the wiring PR have merged to `integration/m0`, run the final checks in a **fresh clone**, not the existing `node_modules` folder:

```bash
cd ..
git clone --branch integration/m0 "https://github.com/${GH_OWNER}/CSIA6.git" CSIA6-m0-validation
cd CSIA6-m0-validation
git rev-parse HEAD             # record candidate integration SHA
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
# Ctrl+C after completing manual browser checks.
```

**Expected automated gate:** `npm ci` succeeds from the committed lockfile; ESLint, TypeScript, Vitest and Next production build all exit **0**. Vitest should run DEV1's **2 bootstrap tests** plus DEV2's **8 component/provider/audio/preview tests** = **10 total** based on the exact guide code (always trust the actual test runner count over this planning figure). CI job `checks` must be green on the integration branch and both PRs.

**Mandatory manual gate (record PASS / FAIL / NOT VERIFIED individually in integration PR):**

- `http://localhost:3000` and `/foundation-preview` load at **375 × 812** and a desktop width (~1280px) without horizontal scroll; palette uses forest `#193D2B`, leaf `#39794F`, canvas `#F5F6EF`, rounded cards and 44px targets. No copied fictional design showcase.
- With English selected: visible text and labels in English, `<html lang="en" dir="ltr">`. Select Darija: Arabic-script strings and `<html lang="ary" dir="rtl">`; refresh preserves locale. Switch back; a typed test field value remains unchanged. Test keyboard Tab/Enter focus and buttons.
- Audio transcript remains visible, missing-reviewed-recording status appears in **both** locales, and no audio is autostarted or represented as available. Audio play/pause/replay/error are **unit-tested** using a test-only URL; real playback cannot be manually certified until actual approved recordings exist. Verify the motion pulse does not run when clips are missing; optional reduced-motion emulation confirms `motion-safe` behavior.
- Recommendation placeholder says **unavailable / awaiting validated model** in both locales. No score, ranked crop alternative, imaginary location, water-savings number, API handler, auth flow or claims of working persistence appear.
- Check browser Console for runtime errors and GitHub Actions logs; manually tested devices/browsers must be **named**, otherwise mark NOT VERIFIED. No M1 routes should be expected at this milestone.
- Confirm `docs/frontend/milestone-M0/M0-DEV1.md` and `M0-DEV2.md` reflect **all committed source/config/test changes** (file-by-file diff review). Confirm shared docs report only what M0 really implements.

**Final PR:** open from `integration/m0` into protected `main`; title `M0 — Foundation: integration to main`; include: branch SHAs, **all 3 reviewed feature/wiring PR links**, commands and actual results, manual checklist, brief note that no backend/data-science integration exists, proposed contract not used, and a 3–5-line M0→next-milestone handoff. DEV2 independently reviews; only merge with checks green and at least one valid approval. If GitHub refuses a self-review or required check, fix review permissions/check first—never bypass protection.

After merge (not before):

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git rev-parse HEAD  # record the exact promoted SHA in final PR/handoff
```

**STOP:** M0 is done only after `main` is updated. Do not create M1 files, directories or execution guides as part of M0.

## 7. Every-change guide sync / concise handoff

For **each** source, test, config, style, install-script, or dependency change (including integrations): check the corresponding full code block/path in **this** guide and adjust it within that PR. If unchanged, explicitly put `Guide reviewed: still accurate` in the PR. Changes to shared architecture facts: update `docs/system-design.md`; changes to task division/order: update `docs/frontend-guide.md`; scope changes alone: update `docs/01-cahier-des-charges.md`; doc process changes alone: update `docs/documentation-strategy.md`. Never duplicate large blocks there.

Short handoff to record in final PR: implemented routes; both owners + PRs; exact test/build/browser statuses; permitted local state and missing audio; **deferred** real auth/storage/map dataset/recommendations/API; promoted `main` commit SHA. This keeps API handoff honest without inventing endpoints or model JSON.
