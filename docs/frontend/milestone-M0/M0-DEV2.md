# flaht bladi — M0 (Foundation) — DEV2 execution guide

**Repository:** `CSIA6` · **Owner:** DEV2 · **Depends on:** DEV1's **reviewed, merged** bootstrap PR to `integration/m0`.  
**Target:** `docs/frontend/milestone-M0/M0-DEV2.md` (this guide).  
**Scope:** M0 only. No M1/M2 screens or backend/model implementation.

## 0. Outcome, dependency and file ownership

Implement reusable, accessible, mobile-first UI building blocks using the original design ZIP's **tokens**, not its illustration screens. Add **English (`en`, LTR)** and **Arabic-script Darija (`ary`, RTL)** translations with local preference persistence; a reusable, tap-initiated prerecorded-audio component with honest **missing-file fallback**, a component laboratory at `/foundation-preview`, and real React Testing Library/Vitest tests. It uses **no API and no actual audio files**. Keep recommendations unavailable, not simulated.

**DEV2 exclusive ownership** (create these files only):

- `src/i18n/locale.ts`, `messages.ts`, `LocaleProvider.tsx`;
- `src/components/ui/Button.tsx`, `Card.tsx`, `TextField.tsx`;
- `src/components/audio/clips.ts`, `AudioHelp.tsx`, `public/audio/README.md`;
- `src/features/foundation/FoundationDemo.tsx`, `src/app/foundation-preview/page.tsx`;
- `vitest.config.mts`, `tests/setup.ts`, `tests/ui-components.test.tsx`, `tests/localization.test.tsx`, `tests/audio-help.test.tsx`, `tests/foundation-demo.test.tsx`;
- this guide (`docs/frontend/milestone-M0/M0-DEV2.md`) whenever actual changes require it.

**Do not edit:** DEV1's `package.json`, `package-lock.json`, `.github/workflows/frontend.yml`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `README.md`, or source documents without an explicit ownership agreement and matching guide updates. DEV1 already installs all testing, Lucide and Tailwind dependencies and owns final app-root wiring. `src/app/page.tsx` continues to show the bootstrap-only page during this feature PR; your **independent preview route** is `/foundation-preview` until DEV1's separate wiring PR.

**Exact execution chain:** DEV1 bootstrap PR approved+merged → DEV2 branch+implementation+individual checks → DEV2 PR reviewed by DEV1 and merged to `integration/m0` → DEV1 page-wiring PR reviewed by DEV2 → full integrated gate → reviewed `integration/m0`→`main` PR → **M1 only after `main` merge**.

## 1. Verify prerequisites and create DEV2 branch

Use Node.js 22.22.2 and Git Bash (Windows) or a POSIX shell. DEV1 must have pushed `integration/m0` **with a passing bootstrap PR**, committed `package-lock.json`, and copied **both** M0 guides to `docs/frontend/milestone-M0/`. Never branch from uninitialized `main` or copy a design-system example page.

```bash
export GH_OWNER="YOUR_GITHUB_OWNER"  # replace with actual CSIA6 owner
# If you have not cloned yet:
git clone "https://github.com/${GH_OWNER}/CSIA6.git"
cd CSIA6

git fetch origin
git switch integration/m0 2>/dev/null || git switch --track origin/integration/m0
git pull --ff-only origin integration/m0
git rev-parse --short HEAD   # record DEV1 bootstrap baseline SHA
git switch -c feature/m0-dev2-shared-ui
npm ci
npm ls --depth=0
```

Expected: clean `feature/m0-dev2-shared-ui` based on `integration/m0`; exact dependency set restored with `npm ci` and no package modification. Verify `test -f src/app/globals.css && test -f docs/frontend/milestone-M0/M0-DEV1.md`. If false, **stop**: DEV1 bootstrap was not merged. You must **not** create another package.json or rerun `create-next-app`.

```bash
mkdir -p src/i18n src/components/ui src/components/audio src/features/foundation src/app/foundation-preview public/audio tests
```

## 2. Implement the complete DEV2-owned source code

All paths below are relative to repository root. Create each file in UTF-8, matching the entire code block. **Do not reuse design-system demo imagery, crops, metrics, or mock map coordinates.** Darija copy below is a working interface draft; schedule human language review before using farmer-facing speech/text in later milestones. The only storage is local UI language preference.

### 2A. Locale key, translated strings and React provider

**`src/i18n/locale.ts`**

```typescript
export type Locale = "en" | "ary";
export const LOCALE_STORAGE_KEY = "flaht-bladi.locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ary";
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ary" ? "rtl" : "ltr";
}
```

**`src/i18n/messages.ts`**

```typescript
import type { Locale } from "./locale";

export const messages = {
  en: {
    language: "Language",
    english: "English",
    darija: "Darija",
    badge: "M0 · UI foundation preview",
    title: "Ready to build accessible farm tools",
    introduction: "This preview checks our design tokens and reusable controls. It is not the farmer application yet.",
    inputLabel: "Test field (local only)",
    inputHint: "Type here, then change language. Your text should remain.",
    sampleButton: "Try the button",
    buttonResult: "The button works locally. No data was sent.",
    audioHelp: "Audio help",
    audioTranscript: "Tap the speaker to hear help when a reviewed recording is available. The written instruction always stays visible.",
    audioMissing: "No reviewed recording is available yet. Use the written instructions.",
    audioError: "Audio could not play. Please use the written instructions.",
    playAudio: "Play audio",
    pauseAudio: "Pause audio",
    resumeAudio: "Resume audio",
    replayAudio: "Replay audio",
    rotationTitle: "Crop recommendations",
    rotationUnavailable: "Recommendations are not available yet. We are waiting for an approved model and data-science handoff.",
    demoOnly: "Foundation preview · local UI only · no login, map data or backend",
  },
  ary: {
    language: "اللغة",
    english: "الإنجليزية",
    darija: "الدارجة",
    badge: "M0 · تجربة عناصر الواجهة",
    title: "كنوجدو واجهة سهلة للاستعمال للفلاحة",
    introduction: "هاد الصفحة غير تجربة ديال الألوان والأزرار واللغة. ماشي التطبيق النهائي ديال الفلاح.",
    inputLabel: "خانة للتجربة فقط",
    inputHint: "كتب شي حاجة وبدل اللغة. اللي كتبتي خاصو يبقى.",
    sampleButton: "جرّب الزر",
    buttonResult: "الزر خدام غير هنا. ما تصيفطات حتى معلومة.",
    audioHelp: "المساعدة بالصوت",
    audioTranscript: "ملي يكون تسجيل صوتي مراجع، تقدر تضغط على السماعة وتسمع الشرح. الشرح مكتوب ديما.",
    audioMissing: "مازال ما كاين حتى تسجيل صوتي مراجع. استعمل الشرح المكتوب.",
    audioError: "ما قدرناش نشغلو الصوت. استعمل الشرح المكتوب.",
    playAudio: "شغّل الصوت",
    pauseAudio: "وقف الصوت",
    resumeAudio: "كمّل الصوت",
    replayAudio: "عاود الصوت",
    rotationTitle: "اقتراحات الزراعة",
    rotationUnavailable: "اقتراحات الزراعة مازال ما متوفراش. كنتسناو المصادقة على النموذج وتسليم فريق البيانات.",
    demoOnly: "تجربة الواجهة فقط · المعلومات محلية · بلا حساب ولا خريطة ولا خادم",
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
```

**`src/i18n/LocaleProvider.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { directionFor, isLocale, LOCALE_STORAGE_KEY } from "./locale";
import type { Locale } from "./locale";
import { translate } from "./messages";
import type { MessageKey } from "./messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted locale after hydration.
      if (isLocale(saved)) setCurrentLocale(saved);
    } catch {
      // Private browsing or disabled storage must not block the UI.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = directionFor(locale);
  }, [locale]);

  function setLocale(next: Locale) {
    setCurrentLocale(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Language switching still works for the current session.
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: (key) => translate(locale, key) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
```

### 2B. Accessible UI primitives

**`src/components/ui/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "soft";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-forest-deep",
  outline: "border border-forest bg-white text-forest hover:bg-mint",
  soft: "bg-mint text-forest hover:bg-sage",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
```

**`src/components/ui/Card.tsx`**

```tsx
import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}
      {...props}
    />
  );
}
```

**`src/components/ui/TextField.tsx`**

```tsx
"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, id, className = "", ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="font-semibold text-forest">{label}</label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-2 text-base text-ink placeholder:text-muted focus:border-leaf ${className}`}
        {...props}
      />
      {hint && <p id={hintId} className="text-sm text-muted">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
```

### 2C. Audio infrastructure: reviewed-files-only manifest, tap playback and text fallback

**`src/components/audio/clips.ts`**

```typescript
import type { Locale } from "@/i18n/locale";

export type AudioTopic = "onboarding";

// Empty until real, linguistically reviewed and permitted recordings are delivered.
// When approved: add actual public/audio/{en,ary}/... files and URL mappings here.
export const audioClips: Record<Locale, Partial<Record<AudioTopic, string>>> = {
  en: {},
  ary: {},
};
```

**`src/components/audio/AudioHelp.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/locale";
import { translate } from "@/i18n/messages";
import { audioClips } from "./clips";
import type { AudioTopic } from "./clips";

type AudioState = "idle" | "playing" | "paused" | "error";

type AudioHelpProps = {
  locale: Locale;
  topic: AudioTopic;
  text: string;
  firstVisit?: boolean;
  /** For isolated tests only; real app audio comes from the reviewed manifest. */
  testSource?: string;
};

export function AudioHelp({ locale, topic, text, firstVisit = false, testSource }: AudioHelpProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<AudioState>("idle");
  const source = testSource ?? audioClips[locale][topic];

  useEffect(() => {
    const player = audioRef.current;
    if (player && !player.paused) player.pause();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- audio source change must reset UI.
    setState("idle");
  }, [locale, source]);

  async function play(startOver = false) {
    const player = audioRef.current;
    if (!player) return;
    try {
      if (startOver) player.currentTime = 0;
      await player.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }

  function pause() {
    audioRef.current?.pause();
    setState("paused");
  }

  return (
    <section aria-label={translate(locale, "audioHelp")} className="rounded-[var(--radius-lg)] bg-mint p-5">
      <div className="flex items-center gap-3">
        <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-white">
          {firstVisit && source && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border-2 border-leaf motion-safe:animate-ping" />
          )}
          <Volume2 size={22} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-forest">{translate(locale, "audioHelp")}</h2>
      </div>
      <p className="mt-3 text-base text-ink">{text}</p>
      {!source ? (
        <p role="status" className="mt-3 text-sm text-forest">{translate(locale, "audioMissing")}</p>
      ) : (
        <>
          <audio
            ref={audioRef}
            data-testid="audio-element"
            src={source}
            preload="none"
            onEnded={() => setState("idle")}
            onError={() => setState("error")}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            {state === "playing" ? (
              <Button variant="outline" onClick={pause}><Pause size={18} aria-hidden="true" />{translate(locale, "pauseAudio")}</Button>
            ) : (
              <Button variant="primary" onClick={() => void play()}>
                <Play size={18} aria-hidden="true" />
                {translate(locale, state === "paused" ? "resumeAudio" : "playAudio")}
              </Button>
            )}
            <Button variant="soft" onClick={() => void play(true)}>
              <RotateCcw size={18} aria-hidden="true" />{translate(locale, "replayAudio")}
            </Button>
          </div>
          {state === "error" && <p role="alert" className="mt-3 text-sm text-danger">{translate(locale, "audioError")}</p>}
        </>
      )}
    </section>
  );
}
```

**`public/audio/README.md`**

```markdown
# Audio source policy

No recordings have been approved for M0. The manifest at
`src/components/audio/clips.ts` is intentionally empty; the user sees a
text fallback instead of a broken/fictional playback control.

When approved audio arrives, record for every clip: **filename, locale (`ary`
or `en`), exact visible transcript, human reviewer, and recording/use
permission**. Add only reviewed recordings and synchronize the manifest,
transcript, tests, and the current milestone execution guide in the same PR.

No autoplay, microphone recording, generated voice, or external TTS is used.
```

### 2D. M0 foundation preview component and isolated route

**`src/features/foundation/FoundationDemo.tsx`**

```tsx
"use client";

import { useState } from "react";
import { AudioHelp } from "@/components/audio/AudioHelp";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { LocaleProvider, useLocale } from "@/i18n/LocaleProvider";

function FoundationContent() {
  const { locale, setLocale, t } = useLocale();
  const [sampleText, setSampleText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-7 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="rounded-full bg-mint px-4 py-2 text-sm font-bold text-forest">{t("badge")}</span>
        <div role="group" aria-label={t("language")} className="flex flex-wrap gap-2">
          <Button variant={locale === "en" ? "primary" : "outline"} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>{t("english")}</Button>
          <Button variant={locale === "ary" ? "primary" : "outline"} aria-pressed={locale === "ary"} onClick={() => setLocale("ary")}>{t("darija")}</Button>
        </div>
      </div>

      <header className="mb-7">
        <h1 className="text-3xl font-bold leading-tight text-forest sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-base text-muted">{t("introduction")}</p>
      </header>

      <div className="space-y-5">
        <Card>
          <div className="space-y-4">
            <TextField label={t("inputLabel")} hint={t("inputHint")} value={sampleText} onChange={(event) => setSampleText(event.target.value)} />
            <Button onClick={() => setShowFeedback(true)}>{t("sampleButton")}</Button>
            {showFeedback && <p role="status" className="rounded-[var(--radius-sm)] bg-mint p-3 text-sm text-forest">{t("buttonResult")}</p>}
          </div>
        </Card>
        <AudioHelp locale={locale} topic="onboarding" text={t("audioTranscript")} firstVisit />
        <Card>
          <h2 className="text-xl font-bold text-forest">{t("rotationTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("rotationUnavailable")}</p>
        </Card>
      </div>
      <footer className="mt-7 text-sm text-muted">{t("demoOnly")}</footer>
    </main>
  );
}

export function FoundationDemo() {
  return <LocaleProvider><FoundationContent /></LocaleProvider>;
}
```

**`src/app/foundation-preview/page.tsx`**

```tsx
import { FoundationDemo } from "@/features/foundation/FoundationDemo";

export default function PreviewPage() {
  return <FoundationDemo />;
}
```

### 2E. Vitest setup and full task-level tests

**`vitest.config.mts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
  },
});
```

**`tests/setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});
```

**`tests/ui-components.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";

describe("shared UI controls", () => {
  it("makes a button of type button and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toContain("min-h-11");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports an accessible card and field error", () => {
    render(
      <Card aria-label="Test panel">
        <TextField label="Parcel name" hint="Optional" error="Invalid text" />
      </Card>,
    );
    const input = screen.getByRole("textbox", { name: "Parcel name" });
    expect(screen.getByRole("region", { name: "Test panel" })).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Optional Invalid text");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid text");
  });
});
```

**`tests/localization.test.tsx`**

```tsx
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LocaleProvider, useLocale } from "@/i18n/LocaleProvider";
import { LOCALE_STORAGE_KEY } from "@/i18n/locale";

function Probe() {
  const { locale, setLocale, t } = useLocale();
  const [draft, setDraft] = useState("");
  return (
    <>
      <p data-testid="locale">{locale}</p>
      <p>{t("title")}</p>
      <input aria-label="draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button onClick={() => setLocale("ary")}>Switch to Darija</button>
      <button onClick={() => setLocale("en")}>Switch to English</button>
    </>
  );
}

describe("locale provider", () => {
  it("changes lang/dir, stores locale, and keeps unsaved input", async () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    await userEvent.type(screen.getByRole("textbox", { name: "draft" }), "my field");
    await userEvent.click(screen.getByRole("button", { name: "Switch to Darija" }));
    expect(document.documentElement).toHaveAttribute("lang", "ary");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ary");
    expect(screen.getByRole("textbox", { name: "draft" })).toHaveValue("my field");
  });

  it("restores stored Darija on a later mount", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "ary");
    render(<LocaleProvider><Probe /></LocaleProvider>);
    await waitFor(() => expect(screen.getByTestId("locale")).toHaveTextContent("ary"));
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });
});
```

**`tests/audio-help.test.tsx`**

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioHelp } from "@/components/audio/AudioHelp";

const playMock = vi.fn().mockResolvedValue(undefined);
const pauseMock = vi.fn();

beforeEach(() => {
  playMock.mockClear();
  pauseMock.mockClear();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(playMock);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pauseMock);
});

describe("audio help", () => {
  it("keeps text visible when no real file is approved", () => {
    render(<AudioHelp locale="en" topic="onboarding" text="Visible transcript" firstVisit />);
    expect(screen.getByText("Visible transcript")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No reviewed recording");
    expect(screen.queryByRole("button", { name: "Play audio" })).not.toBeInTheDocument();
    expect(playMock).not.toHaveBeenCalled();
  });

  it("never autoplays and provides play, pause, replay, error fallback", async () => {
    render(<AudioHelp locale="en" topic="onboarding" text="Visible transcript" testSource="/test-only.mp3" firstVisit />);
    expect(playMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Play audio" }));
    await waitFor(() => expect(playMock).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole("button", { name: "Pause audio" }));
    expect(pauseMock).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Replay audio" }));
    expect(playMock).toHaveBeenCalledTimes(2);
    fireEvent.error(screen.getByTestId("audio-element"));
    expect(screen.getByRole("alert")).toHaveTextContent("Audio could not play");
    expect(screen.getByText("Visible transcript")).toBeInTheDocument();
  });
});
```

**`tests/foundation-demo.test.tsx`**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FoundationDemo } from "@/features/foundation/FoundationDemo";

describe("foundation preview", () => {
  it("displays only an unavailable recommendation state", () => {
    render(<FoundationDemo />);
    expect(screen.getByText(/Recommendations are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText(/suitability score/i)).not.toBeInTheDocument();
  });

  it("is bilingual, RTL, and preserves the preview draft", async () => {
    render(<FoundationDemo />);
    await userEvent.type(screen.getByRole("textbox", { name: "Test field (local only)" }), "test input");
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("textbox", { name: "خانة للتجربة فقط" })).toHaveValue("test input");
    expect(screen.getByText(/اقتراحات الزراعة مازال/)).toBeInTheDocument();
  });
});
```

## 3. Execute tests and visually inspect your own feature branch

Run these commands on `feature/m0-dev2-shared-ui` from repo root. DEV1 installed dependencies during bootstrap, so **`npm ci` only**—no `npm install` or implicit package/lockfile changes.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
# Inspect http://localhost:3000/foundation-preview
# Press Ctrl+C when finished.
```

**Expected DEV2 feature branch automated outcomes:**

- `npm run lint`: 0 ESLint errors.
- `npm run typecheck`: 0 TypeScript errors, including test and alias imports.
- `npm run test`: **10 passing tests** total: DEV1 `bootstrap.test.ts` (2), DEV2 `ui-components` (2), `localization` (2), `audio-help` (2), `foundation-demo` (2); no autoplay and no model-result fixture tests.
- `npm run build`: production Next.js build exits 0; includes `/` (DEV1 bootstrap page) and `/foundation-preview` (DEV2 lab page).
- `npm run dev`: preview route loads, no browser console errors. Main `/` remains DEV1's placeholder **until** the approved wiring PR.

**Task-level manual checks (record status, not guesses):**

1. At 375px viewport, no horizontal overflow. Buttons at least 44px high, readable 16px text, forest/leaf/sage/canvas/cream from `globals.css`; no copied ZIP example pages. Also inspect desktop layout and keyboard focus/Enter.
2. `/foundation-preview` starts in English on first browser visit. Click Darija: actual `<html lang="ary" dir="rtl">` and Arabic-script labels; reload and verify language persists. Switch back to English; free-text preview input remains **unchanged while switching**.
3. Button click displays a **local-only** status, not a fake server success. The recommendation panel says only **unavailable / awaiting approved model**. No response type, ranking, probability, soil verdict or water saving appears.
4. Audio always displays a text equivalent. With **no approved audio asset** in `public/audio`, no Play button should appear, a clear localized missing-recording message should appear, and no audio should auto-start. In unit tests, a **test-only** media URL verifies opt-in Play/Pause/Replay and error handling; do not add that URL to real manifests or claim manual listening succeeded.
5. Enable `prefers-reduced-motion` and inspect for no forced ping animations. Confirm the pulsing speaker ring is conditional on first visit **and** a real provided source; this is infrastructure, not M1 onboarding logic.

If any check cannot be performed, mark `NOT VERIFIED` in PR; fix failures before approval. Audio recordings are *not* supplied by the project ZIP; never invent `/public/audio/*.mp3` or use generated speech as real content.

## 4. Documentation parity and DEV2 feature PR

For **every** edit in `src/`, `tests/`, `vitest.config.mts`, or `public/audio/`, compare the exact corresponding block in this guide. Update this same Markdown file **in the same commit/PR** when code, test, file paths, expected behavior, or commands differ. If the guide remains accurate, put `Guide reviewed: still accurate` in the PR body. Do not duplicate implementation into `docs/system-design.md`; DEV1 will record the final short architecture snapshot after wiring. Coordinate any shared-file change before editing.

```bash
git status --short
git diff --check
git add src/i18n src/components/ui src/components/audio src/features/foundation src/app/foundation-preview public/audio vitest.config.mts tests/setup.ts tests/ui-components.test.tsx tests/localization.test.tsx tests/audio-help.test.tsx tests/foundation-demo.test.tsx docs/frontend/milestone-M0/M0-DEV2.md
git diff --cached --check
git commit -m "feat(m0): add bilingual UI, accessible controls and audio foundation"
git push -u origin feature/m0-dev2-shared-ui
```

Open GitHub PR **base** `integration/m0`, **compare** `feature/m0-dev2-shared-ui`, titled `M0 DEV2 — UI primitives, i18n and audio foundation`. Request **DEV1** review. PR body: DEV1 bootstrap SHA, owned paths, `npm ci`/lint/typecheck/test/build results (**actual** counts), explicit English/Darija RTL and input-preservation evidence, audio-missing fallback, phone/desktop check, guide synchronization declaration, and clear statement `frontend-only; no approved model/API contract`. **Merge only after DEV1 approval and green checks.** Do not directly push to `integration/m0` or `main` with implementation changes.

## 5. Integration handoff and independent review of DEV1 wiring

After DEV2 merge, alert DEV1 that this is available:

- `FoundationDemo` export: `src/features/foundation/FoundationDemo.tsx` — client component with its **own** `LocaleProvider`. Root wiring is literally `import { FoundationDemo } from "@/features/foundation/FoundationDemo";` and `<FoundationDemo />`. Do **not** duplicate the provider in the M0 root layout.
- `/foundation-preview`: isolated feature validation route. After DEV1 reviewed wiring, `/` should render the same preview.
- UI owns a transient input and feedback; language preference lives in `localStorage` under `flaht-bladi.locale`. These are **not** authenticated/persistent farmer data.
- `audioClips.en`/`ary` are intentionally empty. `AudioHelp` text remains visible and missing-file behavior is intentional; no recordings or speech backend exist.
- Proposed contract `docs/reference/TEAM_BRIEFING_DATA_CONTRACT.md` remains **documentation only**; no API response parsing, types, crop recommendations or invented data are included.

Review `feature/m0-dev1-wire-foundation` → `integration/m0` PR and approve **only if** both `/` and `/foundation-preview` work in both locales and the guide/doc changes are accurate. Independently review the final `integration/m0` → `main` PR, its clean-install test status, build, manual evidence, documentation parity and the **no-backend/no-model** rule. No reviewer should approve their own PR.

**Promotion blocker:** If *any* DEV1 or DEV2 automated/manual required M0 check fails, or an execution guide contradicts committed code, M0 does not pass. Record final merge SHA in the handoff once GitHub shows `main` updated. Do **not** begin M1 or create any later guide before this is complete.

## 6. Compact maintenance rule

- New component/text/audio behavior → edit this guide's file block, related tests and expected result **together**.
- Shared architecture fact changed → inform DEV1, who patches `docs/system-design.md` in the integration PR; scope/cahier only if actual approved scope changes.
- Adding actual future recordings requires filename, locale, reviewed transcript, reviewer, permission, and tests; this is **not** part of M0.
- When the later backend/model handoff happens, its approved API contract will be documented independently. Do **not** infer endpoint names, request fields, recommendation statuses or scientific scores from the data-science **proposal** during this milestone.
