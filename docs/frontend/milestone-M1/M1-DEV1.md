# flaht bladi — M1 (Welcome, demo access & navigation) — DEV1 execution guide

**Repository:** `CSIA6` · **Owner:** DEV1 · **Branch:** `feature/m1-dev1` · **Depends on:** M0 already integrated into `main`  
**Repository destination:** `docs/frontend/milestone-M1/M1-DEV1.md` · **Prepared:** 15 November 2026  
**Delivery:** **M1 only.** Do not implement M2, M3, M4 or M5 functionality in this milestone. No PRs.

> **Baseline truth:** The team says M0 is completed and merged to `main`. This guide is constructed from the supplied **M0-DEV1.md**, **M0-DEV2.md**, v1.1 functional requirements (with v1.2 workflow-only updates), the design ZIP and the updated shared guidance. I cannot inspect the live `CSIA6` Git history or execute its installed app here. **Before applying replacement files, inspect actual `main`; if it differs from the M0 guide snapshots, reconcile M1 code and update THIS guide on the feature branch.** Never report the planned test totals as observed results.

## 0. Exact M1 outcome and limits

Implement the entire previously split **M1** under **DEV1 alone**:

- `/`: farmer-facing bilingual welcome with **language choice before entry**, explanation of the prototype and first-visit `AudioHelp`. The M0 audio manifest is intentionally empty: show text and a truthful unavailable-recording message, **never autoplay** or fabricate an MP3.
- `/access`: accessible Morocco `+212` phone-format **preview only**, with clear optional demo entry. No SMS/OTP, backend account, verification request, phone storage, or fake login success.
- `/home`: usable dashboard and prominent “Find my next crop” link to an honest unavailable state; no mock recommendations, statistics, map data or agricultural outputs.
- Shared navigation: five working target routes, **Home / Rotation / Map / Community / Profile**, responsive desktop sidebar/mobile bottom bar; all labels in `en` + Arabic-script `ary` with correct RTL.
- `/profile`: editable **in-memory-only** demo display name, language preference and honest empty saved-items explanation. Nothing is a real authenticated profile.
- `/rotation`, `/parcels/new`, `/map`, `/community`: minimal, bilingual, working **unavailable** pages only. `/parcels/new` is built in M2; map in M3; community in M4; real rotation recommendations are deferred even beyond frontend milestones until scientific approval.
- `/foundation-preview`: preserve the M0 internal preview unchanged. Preserve all M0 tests and design tokens.

**Data-science rule:** `docs/reference/TEAM_BRIEFING_DATA_CONTRACT.md` is a **PROPOSED**, unapproved contract. Do not add its API endpoints, score objects, crop arrays, rules or result fixtures. The project’s future service is not implemented by this guide.

**Existing M0 modules reused, NOT replaced:** `src/i18n/LocaleProvider.tsx`, `src/i18n/locale.ts`, `src/components/ui/{Button,Card,TextField}.tsx`, `src/components/audio/{AudioHelp,clips}.tsx`, `src/features/foundation/FoundationDemo.tsx`, `src/app/foundation-preview/page.tsx`, `src/app/globals.css`, `vitest.config.mts`, and existing M0 tests. M1 changes `src/i18n/messages.ts`, `src/app/layout.tsx`, `README.md`, and GitHub Actions, and replaces the original `src/app/page.tsx` with the new route-group page. All complete changed/created file contents are included below.

### Working route and state map

| Browser route | M1 implementation | Local / future boundary |
|---|---|---|
| `/` | `WelcomeScreen` | Language preference via existing M0 `localStorage`; audio text fallback |
| `/access` | `AccessScreen` | Phone string in component memory, formatting hint only; demo link independent of phone |
| `/home` | `HomeScreen` | No farmer/user/server data |
| `/profile` | `ProfileScreen` | Display-name draft in component memory; locale preference persistent |
| `/rotation` | `UnavailableScreen` (`rotation`) | No recommendations/model/API |
| `/parcels/new` | `UnavailableScreen` (`parcel`) | No parcel data collection until M2 |
| `/map` | `UnavailableScreen` (`map`) | No tile map, polygon or coordinates until M3 |
| `/community` | `UnavailableScreen` (`community`) | No user-generated posts until M4 |
| `/foundation-preview` | Existing M0 route | Remains an internal component lab, not farmer app homepage |

**Design:** Keep the ZIP’s original forest `#193D2B`, leaf `#39794F`, mint `#E6F1DD`, sage `#A8C98A`, canvas `#F5F6EF`, card rounding and 44px targets through the **existing M0 CSS tokens**. No design-ZIP example screens, fictional values, mock maps, or sample crop rankings are copied. Colored bars in the welcome illustration are purely decorative CSS shapes, not data/fields.

## 1. Prerequisites, branch creation, and updated documentation

Use **Git Bash on Windows** or a POSIX shell. M0 pins Node `22.22.2`; verify `node -v` reads `v22.22.2`, use `npm ci` from committed lockfile. **No new npm packages are required**: React, Next.js, Lucide, Tailwind, Vitest and Testing Library came from M0. Do not run `create-next-app`, `npm update` or a new `npm install`.

Repository name is `CSIA6`; the GitHub owner **is not known**. Set `GH_OWNER` to its actual user or organization only if you need to clone. If it is already cloned, start from the folder containing the `CSIA6` checkout (otherwise omit `cd CSIA6` if your terminal is already inside that repository):

```bash
# Only if not already cloned:
# export GH_OWNER="YOUR_ACTUAL_GITHUB_OWNER"
# git clone "https://github.com/${GH_OWNER}/CSIA6.git"
cd CSIA6

node -v
npm -v
git status --short                # must be empty; commit/stash unrelated edits first
git switch main
git pull --ff-only origin main
git rev-parse HEAD                # record: M1_BASELINE_SHA
git status --short                # clean again
git switch -c feature/m1-dev1
git branch --show-current          # feature/m1-dev1

# M0 baseline files (check the ACTUAL repository, not only guide expectations):
test -f package-lock.json
test -f src/app/globals.css
test -f src/app/page.tsx
test -f src/i18n/messages.ts
test -f src/i18n/LocaleProvider.tsx
test -f src/components/audio/AudioHelp.tsx
test -f src/features/foundation/FoundationDemo.tsx
test -f tests/bootstrap.test.ts
test -f tests/foundation-demo.test.tsx
test -f docs/frontend/milestone-M0/M0-DEV1.md
test -f docs/frontend/milestone-M0/M0-DEV2.md
npm ci
```

**Expected:** clean `feature/m1-dev1` based exactly on current `main`; M0 files and lockfile present. If any `test -f` command fails or the M0 source differs materially, **do not paste blindly**: compare the real `main` file, adjust this guide and corresponding M1 code before committing. If current `main` has incompatible PR-only branch rules, coordinate a legitimate GitHub ruleset update **before the final push**; no PR, no force push and no bypass of failing tests.

### Install the updated shared documents in the feature branch

Download the **five revised Markdown documents** accompanying this guide into one local folder. These are explicit updates to existing repository documentation, **not a new project scaffold**. `DOC_SOURCE_DIR` is the folder where *you* saved them:

```bash
export DOC_SOURCE_DIR="$HOME/Downloads/flaht-bladi-m1-docs"  # adjust to your local folder
for f in frontend-guide.md instructions.md system-design.md documentation-strategy.md 01-cahier-des-charges-updated.md M1-DEV1.md; do
  test -f "$DOC_SOURCE_DIR/$f" || { echo "Missing: $f"; exit 1; }
done
mkdir -p docs/frontend/milestone-M1
cp "$DOC_SOURCE_DIR/frontend-guide.md" docs/frontend-guide.md
cp "$DOC_SOURCE_DIR/instructions.md" docs/instructions.md
cp "$DOC_SOURCE_DIR/system-design.md" docs/system-design.md
cp "$DOC_SOURCE_DIR/documentation-strategy.md" docs/documentation-strategy.md
cp "$DOC_SOURCE_DIR/01-cahier-des-charges-updated.md" docs/01-cahier-des-charges.md
cp "$DOC_SOURCE_DIR/M1-DEV1.md" docs/frontend/milestone-M1/M1-DEV1.md
```

**Expected:** the docs say **M0 complete, DEV1 M1–M3, DEV2 M4–M5, sequential, no PRs, locally tested merge into `main`**. Keep the original M0 execution guides as historical snapshots; do not rewrite them to pretend M0 used today’s workflow. Do not edit the proposed data-science contract.

## 2. Create the M1 file structure and remove the old homepage

Next.js route groups (parenthesized folders) keep `/` and `/home` clean while placing the locale provider around the real farmer pages only. **The M0 `/foundation-preview` remains outside this group and keeps its own LocaleProvider**, preserving the old preview tests.

```bash
mkdir -p src/components/m1 src/components/navigation src/features/m1
mkdir -p "src/app/(farmer)/access"   "src/app/(farmer)/(workspace)/home"   "src/app/(farmer)/(workspace)/profile"   "src/app/(farmer)/(workspace)/rotation"   "src/app/(farmer)/(workspace)/parcels/new"   "src/app/(farmer)/(workspace)/map"   "src/app/(farmer)/(workspace)/community"

git rm src/app/page.tsx  # essential: avoid duplicate / routes in Next.js
```

**Do not** move/delete `src/app/foundation-preview/page.tsx`; the existing M0 preview stays available at `/foundation-preview`. Create every file below at the exact repository-relative path shown. The code blocks are complete replacements, not partial pseudocode.

## 3. Localization and app metadata

### `src/i18n/messages.ts`

**Replace full M0 dictionary**, retaining every existing M0 key while adding all bilingual M1 messages (do not paste just the additions).

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
    welcomeEyebrow: "Tadla · agricultural companion",
    welcomeTitle: "A simpler way to explore your farming tools",
    welcomeDescription: "Explore parcel tools, local maps and community features as they become available. Recommendations are not ready yet.",
    chooseLanguage: "Choose your language",
    continueToAccess: "Continue",
    frontendDemoNote: "Frontend demonstration · no real account",
    welcomeAudioText: "Choose your language, then tap Continue to explore the demonstration. Audio will be available only when a reviewed recording is provided.",
    backToWelcome: "Back to welcome",
    accessTitle: "Phone-first access preview",
    accessDescription: "This is a demonstration of phone entry. There is no SMS verification, account creation or authentication.",
    phoneLabel: "Moroccan mobile number (optional preview)",
    phoneHint: "Example: 06 12 34 56 78 or +212 6 12 34 56 78. This stays in this screen and is not sent or saved.",
    phoneInvalid: "This does not match the expected Moroccan mobile format. Try 06/07 followed by eight digits, or +212 6/7 followed by eight digits.",
    checkFormat: "Check format only",
    phoneLooksValid: "The format looks correct. No SMS was sent and the number was not verified.",
    phoneEmpty: "Enter a number to preview its format, or continue directly in demo mode.",
    demoModeTitle: "Demo mode only",
    demoModeExplanation: "Continue without a phone or account. This is not a signed-in session and nothing is stored on a server.",
    enterDemo: "Enter demo",
    navHome: "Home",
    navRotation: "Rotation",
    navMap: "Map",
    navCommunity: "Community",
    navProfile: "Profile",
    primaryNavigation: "Main navigation",
    skipToContent: "Skip to content",
    homeTitle: "What would you like to explore?",
    homeDescription: "This is a local interface demonstration. Features still being developed are clearly identified.",
    nextCropTitle: "Find my next crop",
    nextCropUnavailable: "Crop recommendations are not available until the model and its evidence have been reviewed.",
    seeUnavailableRotation: "See recommendation status",
    parcelTitle: "My parcel",
    parcelComing: "Parcel entry is not available yet. The guided form is planned for M2.",
    mapTitle: "Tadla map",
    mapComing: "The interactive map is not available yet. Verified geographic features are planned for M3.",
    communityTitle: "Farmer community",
    communityComing: "Community tools are not available yet. The local demonstration is planned for M4.",
    homeNoLiveData: "No live weather, parcel records, map points or agricultural results are being displayed.",
    profileTitle: "Demo profile and preferences",
    profileNotAccount: "This is not a registered account. No private profile, sign-in or saved farmer data exists.",
    displayNameLabel: "Display name for this preview (optional)",
    displayNameHint: "Only kept while this screen stays open; not sent or saved. Language changes keep it in place.",
    savedItemsTitle: "Saved information",
    savedItemsEmpty: "No saved parcels, recommendations or posts. Saving requires a future backend.",
    notLiveNotice: "This page is an honest unavailable state, not a live service or a data result.",
    backHome: "Back to home",
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
    welcomeEyebrow: "تادلة · واجهة للفلاحة",
    welcomeTitle: "طريقة سهلة باش تكتاشف أدوات الفلاحة",
    welcomeDescription: "تقدر تكتاشف أدوات القطع الأرضية والخريطة والتواصل مع الفلاحة ملي يوجدو. الاقتراحات مازال ما واجدينش.",
    chooseLanguage: "اختار اللغة",
    continueToAccess: "كمّل",
    frontendDemoNote: "غير تجربة ديال الواجهة · بلا حساب حقيقي",
    welcomeAudioText: "اختار اللغة ومن بعد ضغط على كمّل باش تدخل للتجربة. الصوت غادي يتوفر غير ملي يكون التسجيل مراجع.",
    backToWelcome: "رجع للاستقبال",
    accessTitle: "تجربة إدخال رقم الهاتف",
    accessDescription: "هاد الصفحة غير كتوري كيفاش تدخل رقم الهاتف. ما كاين لا كود SMS لا إنشاء حساب لا تسجيل دخول حقيقي.",
    phoneLabel: "رقم هاتف مغربي (اختياري فالتجربة)",
    phoneHint: "مثال: 06 12 34 56 78 أو +212 6 12 34 56 78. الرقم ما كيتصيفطش وما كيتحفظش.",
    phoneInvalid: "هاد الشكل ديال الرقم ماشي صحيح. جرّب 06 أو 07 وزيد 8 أرقام، أو +212 6 أو 7 وزيد 8 أرقام.",
    checkFormat: "تأكد غير من شكل الرقم",
    phoneLooksValid: "شكل الرقم صحيح. ما تصيفط حتى SMS وما تحققناش من الرقم.",
    phoneEmpty: "دخل رقم باش تجرب الشكل ديالو، أو دخل مباشرة لوضع التجربة.",
    demoModeTitle: "وضع التجربة فقط",
    demoModeExplanation: "دخل بلا رقم وبلا حساب. هادي ماشي جلسة مسجّلة وما كيتحفظ والو فخادم.",
    enterDemo: "دخل للتجربة",
    navHome: "الرئيسية",
    navRotation: "التناوب",
    navMap: "الخريطة",
    navCommunity: "المجتمع",
    navProfile: "الملف",
    primaryNavigation: "التنقل الرئيسي",
    skipToContent: "دوز للمحتوى",
    homeTitle: "شنو بغيتي تكتاشف؟",
    homeDescription: "هادي غير تجربة محلية للواجهة. الأدوات اللي مازال خدامين عليها باينة بوضوح.",
    nextCropTitle: "شنو نزرع من بعد؟",
    nextCropUnavailable: "اقتراحات الزراعة مازال ما متوفراش حتى تتم مراجعة النموذج والمعلومات ديالو.",
    seeUnavailableRotation: "شوف حالة الاقتراحات",
    parcelTitle: "القطعة الأرضية ديالي",
    parcelComing: "إدخال معلومات الأرض مازال ما متوفرش. الاستمارة غادي تكون فـ M2.",
    mapTitle: "خريطة تادلة",
    mapComing: "الخريطة التفاعلية مازال ما متوفراش. المواقع المتأكد منها غادي تكون فـ M3.",
    communityTitle: "مجتمع الفلاحة",
    communityComing: "التواصل بين الفلاحة مازال ما متوفرش. التجربة المحلية غادي تكون فـ M4.",
    homeNoLiveData: "ما كايناش هنا معلومات مباشرة على الطقس أو الأراضي أو الخريطة أو نتائج فلاحية.",
    profileTitle: "ملف تجريبي والإعدادات",
    profileNotAccount: "هادا ماشي حساب مسجّل. ما كاين لا ملف شخصي حقيقي لا دخول لا معلومات محفوظة.",
    displayNameLabel: "اسم يظهر فهاد التجربة (اختياري)",
    displayNameHint: "كيظل غير مادامت هاد الصفحة محلولة، وما كيتصيفطش وما كيتحفظش. تبديل اللغة ما كيمسحوش.",
    savedItemsTitle: "المعلومات المحفوظة",
    savedItemsEmpty: "ما كايناش أراضي ولا اقتراحات ولا منشورات محفوظة. الحفظ خاصو خادم من بعد.",
    notLiveNotice: "هاد الصفحة كتبيّن بصراحة باللي الخدمة مازال ما متوفراش، وماشي نتيجة حقيقية.",
    backHome: "رجع للرئيسية",
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
```

### `src/app/layout.tsx`

**Replace** the M0 metadata; keep the actual root HTML and global stylesheet unchanged otherwise.

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "flaht bladi — Farmer UI demonstration",
  description: "Bilingual, frontend-only farmer tools. No production login or crop recommendations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
```


## 4. Reusable M1 UI, navigation and screen logic

### `src/components/m1/ActionLink.tsx`

A styled Next.js navigation link (not a submit button).

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

export function ActionLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ActionLinkProps) {
  const colors = variant === "primary"
    ? "bg-forest text-white hover:bg-forest-deep"
    : "border border-forest bg-white text-forest hover:bg-mint";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-5 py-3 text-center text-base font-bold ${colors} ${className}`}
    >
      {children}
    </Link>
  );
}
```

### `src/components/m1/LocaleSwitcher.tsx`

Use the existing M0 locale provider and Button; no second locale store.

```tsx
"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/LocaleProvider";

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div role="group" aria-label={t("language")} className="flex flex-wrap gap-2">
      <Button
        variant={locale === "en" ? "primary" : "outline"}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        {t("english")}
      </Button>
      <Button
        variant={locale === "ary" ? "primary" : "outline"}
        aria-pressed={locale === "ary"}
        onClick={() => setLocale("ary")}
      >
        {t("darija")}
      </Button>
    </div>
  );
}
```

### `src/components/navigation/PrimaryNav.tsx`

Five destinations, active state, visible icon labels and mobile/desktop variants.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MapPinned, Sprout, UsersRound, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { MessageKey } from "@/i18n/messages";

const items: { href: string; label: MessageKey; icon: LucideIcon }[] = [
  { href: "/home", label: "navHome", icon: House },
  { href: "/rotation", label: "navRotation", icon: Sprout },
  { href: "/map", label: "navMap", icon: MapPinned },
  { href: "/community", label: "navCommunity", icon: UsersRound },
  { href: "/profile", label: "navProfile", icon: UserRound },
];

export function PrimaryNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { t } = useLocale();
  return (
    <nav aria-label={t("primaryNavigation")} className={mobile ? "flex w-full" : "flex flex-col gap-2"}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === "/rotation" && pathname.startsWith("/parcels/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 min-w-0 items-center justify-center gap-1 rounded-[var(--radius-md)] px-1 py-2 font-semibold transition-colors ${mobile ? "flex-1 flex-col text-[11px]" : "justify-start gap-3 px-4 text-base"} ${active ? "bg-mint text-forest" : "text-muted hover:bg-white hover:text-forest"}`}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="max-w-full text-center leading-tight [overflow-wrap:anywhere]">{t(label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

### `src/components/navigation/AppFrame.tsx`

Desktop sidebar, mobile bottom navigation, skip link and safe-area padding.

```tsx
"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { PrimaryNav } from "./PrimaryNav";

export function AppFrame({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto min-h-dvh max-w-7xl md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
        {t("skipToContent")}
      </a>
      <aside className="hidden border-e border-[var(--border)] bg-cream px-4 py-7 md:block">
        <Link href="/home" className="mb-9 flex min-h-11 items-center gap-2 font-bold text-forest">
          <Sprout aria-hidden="true" /> flaht bladi
        </Link>
        <PrimaryNav />
      </aside>
      <div className="min-w-0 pb-24 md:pb-0">
        <header className="border-b border-[var(--border)] bg-cream px-5 py-4 md:hidden">
          <Link href="/home" className="inline-flex min-h-11 items-center gap-2 text-xl font-bold text-forest">
            <Sprout aria-hidden="true" /> flaht bladi
          </Link>
        </header>
        <main id="main-content" className="mx-auto max-w-4xl px-4 py-7 sm:px-7 sm:py-10">
          {children}
        </main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-cream px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
        <PrimaryNav mobile />
      </div>
    </div>
  );
}
```

### `src/features/m1/WelcomeScreen.tsx`

Welcome, language selector, abstract token-based ornament and M0 audio help with text fallback.

```tsx
"use client";

import { Sprout } from "lucide-react";
import { AudioHelp } from "@/components/audio/AudioHelp";
import { ActionLink } from "@/components/m1/ActionLink";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";

export function WelcomeScreen() {
  const { locale, t } = useLocale();
  return (
    <main className="mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-10">
      <div>
        <div className="mb-7 flex items-center gap-3 text-2xl font-extrabold text-forest">
          <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-forest text-white">
            <Sprout aria-hidden="true" />
          </span>
          flaht bladi
        </div>
        <p className="mb-3 font-semibold text-leaf">{t("welcomeEyebrow")}</p>
        <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-forest sm:text-5xl">
          {t("welcomeTitle")}
        </h1>
        <p className="mt-5 max-w-lg text-lg text-ink">{t("welcomeDescription")}</p>
        <div className="mt-7 space-y-4">
          <h2 className="text-lg font-bold text-forest">{t("chooseLanguage")}</h2>
          <LocaleSwitcher />
          <ActionLink href="/access" className="w-full sm:w-auto">{t("continueToAccess")}</ActionLink>
          <p className="text-sm text-muted">{t("frontendDemoNote")}</p>
        </div>
      </div>
      <div className="rounded-[var(--radius-xl)] bg-cream p-5 shadow-[var(--shadow-soft)] sm:p-8">
        <div aria-hidden="true" className="mb-6 flex h-32 items-end justify-center gap-3 rounded-[var(--radius-lg)] bg-mint p-5">
          <span className="h-12 w-10 rounded-t-full bg-sage" />
          <span className="h-20 w-12 rounded-t-full bg-leaf" />
          <span className="h-24 w-12 rounded-t-full bg-forest" />
          <span className="h-16 w-10 rounded-t-full bg-sage" />
        </div>
        <AudioHelp locale={locale} topic="onboarding" text={t("welcomeAudioText")} firstVisit />
      </div>
    </main>
  );
}
```

### `src/features/m1/phoneFormat.ts`

Only an input-format hint. Valid formatting is **not** proof of reachable phone, SMS or identity.

```typescript
export type PhoneFormatState = "empty" | "valid" | "invalid";

/** Client-side formatting hint, NOT a valid/reachable-number or identity check. */
export function checkMoroccanPhoneFormat(value: string): PhoneFormatState {
  const compact = value.replace(/[\s().-]/g, "");
  if (!compact) return "empty";
  return /^(?:0[67]\d{8}|\+212[67]\d{8})$/.test(compact) ? "valid" : "invalid";
}
```

### `src/features/m1/AccessScreen.tsx`

Phone format check is separate from the always-available demo link. The number never leaves React state.

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionLink } from "@/components/m1/ActionLink";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useLocale } from "@/i18n/LocaleProvider";
import { checkMoroccanPhoneFormat } from "./phoneFormat";
import type { PhoneFormatState } from "./phoneFormat";

export function AccessScreen() {
  const { t } = useLocale();
  const [phone, setPhone] = useState("");
  const [formatState, setFormatState] = useState<PhoneFormatState | null>(null);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-8 sm:py-14">
      <Link href="/" className="inline-flex min-h-11 items-center font-semibold text-forest">{t("backToWelcome")}</Link>
      <Card className="mt-5 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-leaf">{t("frontendDemoNote")}</p>
          <h1 className="text-3xl font-extrabold text-forest">{t("accessTitle")}</h1>
          <p className="text-base text-muted">{t("accessDescription")}</p>
        </div>
        <LocaleSwitcher />
        <div className="space-y-3">
          <TextField
            label={t("phoneLabel")}
            hint={t("phoneHint")}
            error={formatState === "invalid" ? t("phoneInvalid") : undefined}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="06 12 34 56 78"
            value={phone}
            onChange={(event) => { setPhone(event.target.value); setFormatState(null); }}
          />
          <Button variant="outline" onClick={() => setFormatState(checkMoroccanPhoneFormat(phone))}>
            {t("checkFormat")}
          </Button>
          {formatState === "valid" && <p role="status" className="text-sm text-forest">{t("phoneLooksValid")}</p>}
          {formatState === "empty" && <p role="status" className="text-sm text-muted">{t("phoneEmpty")}</p>}
        </div>
        <div className="space-y-3 border-t border-[var(--border)] pt-5">
          <p className="font-semibold text-forest">{t("demoModeTitle")}</p>
          <p className="text-sm text-muted">{t("demoModeExplanation")}</p>
          <ActionLink href="/home" className="w-full">{t("enterDemo")}</ActionLink>
        </div>
      </Card>
    </main>
  );
}
```

### `src/features/m1/HomeScreen.tsx`

Demo dashboard; link to working unavailable routes, no invented data.

```tsx
"use client";

import Link from "next/link";
import { ArrowUpRight, MapPinned, Sprout, UsersRound } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";

export function HomeScreen() {
  const { t } = useLocale();
  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <p className="font-semibold text-leaf">{t("demoModeTitle")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{t("homeTitle")}</h1>
        <p className="text-base text-muted">{t("homeDescription")}</p>
      </header>
      <Card className="space-y-4 bg-mint">
        <div className="flex items-center gap-3"><Sprout aria-hidden="true" className="text-forest" /><h2 className="text-xl font-bold text-forest">{t("nextCropTitle")}</h2></div>
        <p className="text-base text-ink">{t("nextCropUnavailable")}</p>
        <ActionLink href="/rotation">{t("seeUnavailableRotation")}</ActionLink>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/parcels/new" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <Sprout className="text-leaf" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("parcelTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("parcelComing")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/map" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <MapPinned className="text-leaf" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("mapTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("mapComing")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/community" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf sm:col-span-2">
          <UsersRound className="text-leaf" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("communityTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("communityComing")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
      </div>
      <p className="text-sm text-muted">{t("homeNoLiveData")}</p>
    </div>
  );
}
```

### `src/features/m1/ProfileScreen.tsx`

Optional screen-local draft name, empty saved items, persistent existing locale only.

```tsx
"use client";

import { useState } from "react";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useLocale } from "@/i18n/LocaleProvider";

export function ProfileScreen() {
  const { t } = useLocale();
  const [displayName, setDisplayName] = useState("");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-forest">{t("profileTitle")}</h1>
        <p className="mt-2 text-muted">{t("profileNotAccount")}</p>
      </header>
      <Card className="space-y-5">
        <TextField
          label={t("displayNameLabel")}
          hint={t("displayNameHint")}
          value={displayName}
          maxLength={50}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <div className="space-y-2">
          <h2 className="font-bold text-forest">{t("chooseLanguage")}</h2>
          <LocaleSwitcher />
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-bold text-forest">{t("savedItemsTitle")}</h2>
        <p className="mt-2 text-muted">{t("savedItemsEmpty")}</p>
      </Card>
    </div>
  );
}
```

### `src/features/m1/UnavailableScreen.tsx`

One bilingual unavailable template, including the deferred recommendation state.

```tsx
"use client";

import { Info } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import type { MessageKey } from "@/i18n/messages";

type Kind = "rotation" | "parcel" | "map" | "community";

const views: Record<Kind, { title: MessageKey; description: MessageKey }> = {
  rotation: { title: "rotationTitle", description: "rotationUnavailable" },
  parcel: { title: "parcelTitle", description: "parcelComing" },
  map: { title: "mapTitle", description: "mapComing" },
  community: { title: "communityTitle", description: "communityComing" },
};

export function UnavailableScreen({ kind }: { kind: Kind }) {
  const { t } = useLocale();
  const content = views[kind];
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3 text-forest"><Info aria-hidden="true" /><h1 className="text-2xl font-bold">{t(content.title)}</h1></div>
      <p className="text-base text-ink">{t(content.description)}</p>
      <p className="text-sm text-muted">{t("notLiveNotice")}</p>
      <ActionLink href="/home" variant="outline">{t("backHome")}</ActionLink>
    </Card>
  );
}
```


## 5. Next.js route-group pages (complete files)

### `src/app/(farmer)/layout.tsx`

Locale context shared across real farmer pages only.

```tsx
import type { ReactNode } from "react";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export default function FarmerLayout({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
```

### `src/app/(farmer)/page.tsx`

The new `/` homepage; old `src/app/page.tsx` was removed in §2.

```tsx
import { WelcomeScreen } from "@/features/m1/WelcomeScreen";

export default function WelcomePage() {
  return <WelcomeScreen />;
}
```

### `src/app/(farmer)/access/page.tsx`

`/access` phone-format and demo-entry UI.

```tsx
import { AccessScreen } from "@/features/m1/AccessScreen";

export default function AccessPage() {
  return <AccessScreen />;
}
```

### `src/app/(farmer)/(workspace)/layout.tsx`

Shared nav shell for workspace routes, not the welcome/access entry.

```tsx
import type { ReactNode } from "react";
import { AppFrame } from "@/components/navigation/AppFrame";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
```

### `src/app/(farmer)/(workspace)/home/page.tsx`

`/home`.

```tsx
import { HomeScreen } from "@/features/m1/HomeScreen";

export default function HomePage() {
  return <HomeScreen />;
}
```

### `src/app/(farmer)/(workspace)/profile/page.tsx`

`/profile`.

```tsx
import { ProfileScreen } from "@/features/m1/ProfileScreen";

export default function ProfilePage() {
  return <ProfileScreen />;
}
```

### `src/app/(farmer)/(workspace)/rotation/page.tsx`

`/rotation` awaiting model; unavailable text only.

```tsx
import { UnavailableScreen } from "@/features/m1/UnavailableScreen";

export default function RotationPage() {
  return <UnavailableScreen kind="rotation" />;
}
```

### `src/app/(farmer)/(workspace)/parcels/new/page.tsx`

`/parcels/new` M2 placeholder.

```tsx
import { UnavailableScreen } from "@/features/m1/UnavailableScreen";

export default function NewParcelPage() {
  return <UnavailableScreen kind="parcel" />;
}
```

### `src/app/(farmer)/(workspace)/map/page.tsx`

`/map` M3 placeholder.

```tsx
import { UnavailableScreen } from "@/features/m1/UnavailableScreen";

export default function MapPage() {
  return <UnavailableScreen kind="map" />;
}
```

### `src/app/(farmer)/(workspace)/community/page.tsx`

`/community` M4 placeholder.

```tsx
import { UnavailableScreen } from "@/features/m1/UnavailableScreen";

export default function CommunityPage() {
  return <UnavailableScreen kind="community" />;
}
```


## 6. M1 unit/component tests and no-PR CI configuration

### `tests/m1-phone-format.test.ts`

4 pure UI-format tests.

```typescript
import { describe, expect, it } from "vitest";
import { checkMoroccanPhoneFormat } from "@/features/m1/phoneFormat";

describe("M1 phone format guidance (not authentication)", () => {
  it("returns empty for missing input", () => {
    expect(checkMoroccanPhoneFormat("  ")).toBe("empty");
  });
  it("recognizes local mobile formatting", () => {
    expect(checkMoroccanPhoneFormat("06 12 34 56 78")).toBe("valid");
    expect(checkMoroccanPhoneFormat("0712345678")).toBe("valid");
  });
  it("recognizes +212 mobile formatting", () => {
    expect(checkMoroccanPhoneFormat("+212 6 12 34 56 78")).toBe("valid");
  });
  it("rejects landlines, missing digits and text", () => {
    expect(checkMoroccanPhoneFormat("0512345678")).toBe("invalid");
    expect(checkMoroccanPhoneFormat("0612345")).toBe("invalid");
    expect(checkMoroccanPhoneFormat("hello")).toBe("invalid");
  });
});
```

### `tests/m1-welcome.test.tsx`

2 welcome/locale/audio-fallback tests.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WelcomeScreen } from "@/features/m1/WelcomeScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

describe("M1 welcome", () => {
  it("shows a clear demo entry and honest missing-audio text", () => {
    render(<LocaleProvider><WelcomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/access");
    expect(screen.getByText(/No reviewed recording is available/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play audio" })).not.toBeInTheDocument();
  });
  it("switches to Darija and RTL before entry", async () => {
    render(<LocaleProvider><WelcomeScreen /></LocaleProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("link", { name: "كمّل" })).toHaveAttribute("href", "/access");
  });
});
```

### `tests/m1-access.test.tsx`

3 phone/demo access tests.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AccessScreen } from "@/features/m1/AccessScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

describe("M1 access preview", () => {
  it("shows a user-friendly format error for invalid phone", async () => {
    render(<LocaleProvider><AccessScreen /></LocaleProvider>);
    const phone = screen.getByRole("textbox", { name: /Moroccan mobile number/ });
    await userEvent.type(phone, "123");
    await userEvent.click(screen.getByRole("button", { name: "Check format only" }));
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("does not match");
  });
  it("checks format without implying a sent SMS", async () => {
    render(<LocaleProvider><AccessScreen /></LocaleProvider>);
    await userEvent.type(screen.getByRole("textbox", { name: /Moroccan mobile number/ }), "0612345678");
    await userEvent.click(screen.getByRole("button", { name: "Check format only" }));
    expect(screen.getByRole("status")).toHaveTextContent("No SMS was sent");
  });
  it("allows demo access without entering a phone", () => {
    render(<LocaleProvider><AccessScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Enter demo" })).toHaveAttribute("href", "/home");
    expect(screen.getByText(/no SMS verification, account creation or authentication/i)).toBeInTheDocument();
  });
});
```

### `tests/m1-navigation.test.tsx`

2 navigation tests. The router pathname is mocked only in tests.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { LocaleProvider } from "@/i18n/LocaleProvider";

vi.mock("next/navigation", () => ({ usePathname: () => "/home" }));

describe("M1 navigation", () => {
  it("renders five actual link targets and marks active route", () => {
    render(<LocaleProvider><PrimaryNav mobile /></LocaleProvider>);
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    expect(navigation.querySelectorAll("a")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Rotation" })).toHaveAttribute("href", "/rotation");
    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute("href", "/map");
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute("href", "/community");
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });
  it("translates navigation and updates document direction", async () => {
    render(<LocaleProvider><LocaleSwitcher /><PrimaryNav /></LocaleProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("link", { name: "الخريطة" })).toHaveAttribute("href", "/map");
  });
});
```

### `tests/m1-screens.test.tsx`

3 dashboard/unavailable/profile tests.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HomeScreen } from "@/features/m1/HomeScreen";
import { ProfileScreen } from "@/features/m1/ProfileScreen";
import { UnavailableScreen } from "@/features/m1/UnavailableScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

describe("M1 workspace screens", () => {
  it("dashboard links only to real routes and explains absent data", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByText(/No live weather/)).toBeInTheDocument();
  });
  it("rotation renders no recommendations or scores", () => {
    render(<LocaleProvider><UnavailableScreen kind="rotation" /></LocaleProvider>);
    expect(screen.getByText(/Recommendations are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText(/suitability score/i)).not.toBeInTheDocument();
  });
  it("preserves local profile text on a language change", async () => {
    render(<LocaleProvider><ProfileScreen /></LocaleProvider>);
    await userEvent.type(screen.getByRole("textbox", { name: /Display name for this preview/ }), "Test farmer");
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("textbox", { name: /اسم يظهر/ })).toHaveValue("Test farmer");
    expect(screen.getByText(/ما كايناش أراضي/)).toBeInTheDocument();
  });
});
```

### `.github/workflows/frontend.yml`

**Replace** the M0 PR-triggered workflow. Run on feature-branch pushes and `main` pushes, no PR dependency; job is still `checks`.

```yaml
name: Frontend checks

on:
  push:
    branches:
      - main
      - "feature/**"
  workflow_dispatch:

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


## 7. README update

### `README.md`

**Replace** the outdated M0-only README. This documents M1 as an honest frontend-only demonstration and gives the route inventory.

````markdown
# flaht bladi · CSIA6

Mobile-first agricultural interface for the Tadla study area, **frontend-only**.
M0 foundation is complete. M1 adds bilingual welcome, demo entry, navigation,
dashboard and local profile preferences. **This is not a production service.**

## Run locally

- Node.js 22.22.2 (see `.nvmrc`), npm and Git.
- Keep the committed `package-lock.json`; do not reinstall package versions.

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Implemented routes at M1

| Route | Current behavior |
|---|---|
| `/` | Bilingual welcome, language selection, audio transcript / missing-recording fallback |
| `/access` | Phone **format hint** and direct demo access; no real SMS, OTP, authentication or saved number |
| `/home` | Local dashboard and honest navigation |
| `/profile` | UI-only display-name draft and language choice; no account or saved items |
| `/rotation` | **Recommendations unavailable** until approved data-science/model handoff |
| `/parcels/new` | Parcel form unavailable until M2 |
| `/map` | Map unavailable until M3; no invented map points |
| `/community` | Community unavailable until M4 |
| `/foundation-preview` | M0 internal UI preview (not the farmer welcome) |

The M0 locale preference is the only persistent local setting. Typed phone numbers
and profile names are React state, not sent or saved. Audio manifest remains empty;
no approved recordings are claimed. No APIs, database, real user accounts, map
features or agricultural recommendation calculations exist.

## Documentation / branch policy

- Scope: `docs/01-cahier-des-charges.md`
- Roadmap & exact owner branches: `docs/frontend-guide.md`
- Frontend rules: `docs/instructions.md`
- Architecture: `docs/system-design.md`
- Documentation parity: `docs/documentation-strategy.md`
- M1 execution: `docs/frontend/milestone-M1/M1-DEV1.md`
- M0 historical guides: `docs/frontend/milestone-M0/`
- Pending science proposal: `docs/reference/TEAM_BRIEFING_DATA_CONTRACT.md` (**unapproved**)
- Visual reference: `docs/design/Field_Shift_Design_System_Source.zip` (tokens only)

Sequential owner order: DEV1 M1 → M2 → M3; DEV2 M4 → M5. Feature branches
merge **locally** into tested `main`, which is then pushed. No Pull Requests.
````

## 8. Run exact M1 verification (feature branch)

All commands from repository root, **on `feature/m1-dev1`**. M0's `package.json` already supplies the scripts; no new package install is needed.

```bash
node -v                      # M0 pin: v22.22.2
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
# Inspect the pages in a browser, then Ctrl+C to stop the dev server.
```

**Planned/expected results (NOT claims of executed tests):**

| Check | Expected result |
|---|---|
| `npm ci` | Restores exactly the committed M0 lockfile; no package or lockfile changes |
| `npm run lint` | 0 ESLint errors |
| `npm run typecheck` | 0 TypeScript errors, including aliases and Next route groups |
| `npm run test` | **24 tests expected** if baseline matches M0 guides: **10 M0 + 14 M1** (4 phone-format, 2 welcome, 3 access, 2 navigation, 3 workspace). The **actual runner output is authoritative** |
| `npm run build` | Exits 0; Next routes `/`, `/access`, `/home`, `/profile`, `/rotation`, `/parcels/new`, `/map`, `/community`, `/foundation-preview` |
| `npm run dev` | All 9 listed routes load without runtime console errors; no application API traffic or fake sign-in success |

**Required manual acceptance record (write PASS / FAIL / NOT VERIFIED with browser + date):**

1. **Entry and locales:** At `/`, pick English then Darija. Inspect document `<html lang="en" dir="ltr">` and `<html lang="ary" dir="rtl">`; all visible headings, controls and errors translate. Refresh: stored locale restores. Locale is selected before `/access` and follows into `/home` and `/profile`.
2. **Welcome/audio:** The M0 `AudioHelp` text is always visible. With the **empty M0 manifest**, show the missing-recording message and **no Play button**; nothing autoplays. Do not claim a pulsing playable recording when no reviewed file exists. The existing M0 audio unit test verifies opt-in playback using a **test-only** source. If real approved recordings arrive later, update manifest/transcripts/tests/guide in that later milestone, not secretly here.
3. **Access:** A malformed number gives a readable localized error; `0612345678` and `+212 6 12 34 56 78` produce a *format-only* message saying **no SMS sent**. `/home` remains accessible using the separate “Enter demo” link with the phone field empty. Changing language before continuing must **not** clear the typed phone until route navigation. No input is posted, persisted or used as an authenticated identity.
4. **Navigation:** `/home` has clear next-crop, parcel, map and community links. On a 375×812 viewport, mobile bottom nav contains 5 labeled tappable options (at least 44px), with no horizontal overflow; on desktop around 1280px, sidebar appears. Keyboard Tab/Enter and focus outline work; skip-to-content target exists.
5. **Unavailable content:** `/rotation` is visibly **awaiting an approved model**; no score, crop result, water saving, comparison cards, API request or invented scientific advice. `/parcels/new`, `/map`, `/community` each explain that their own functionality is not implemented yet, not a silent blank/404.
6. **Profile state:** `/profile` says no real account/saved records; type a test display name, change locale, confirm draft survives *the locale toggle*. Refreshing or navigating away may reset this **screen-local** draft; verify no user profile is claimed to persist. The language choice alone persists (M0 behavior).
7. **Regression and visuals:** `/foundation-preview` continues working with its M0 bilingual preview/tests; neither M0 CSS tokens nor i18n/audio implementation are broken. Inspect foreground/background contrast, text overflow, 320px and 375px viewport, keyboard focus, reduced-motion preference, and a desktop viewport. This milestone does **not** need actual map tiles, parcel entry or community posts.
8. **Safety and source truth:** No external image labeled as a Tadla measurement, no mocked authenticated session, no invented locations, no unapproved data-science request/response types; check browser console/network if available.

If automated or mandatory manual checks fail, **do not merge**. If a particular browser/device was not checked, mark `NOT VERIFIED` and record the limitation, rather than asserting PASS.

### Feature-to-backend handoff notes (documentation, not code)

| UI | What exists in M1 | Future capability (TBD contract) |
|---|---|---|
| Welcome | Locale selection and text fallback | Reviewed audio file for each locale if supplied |
| Access | Local phone format guidance; separate open demo route | Real phone authentication, SMS provider, secure session and server-side validation |
| Home | Route discovery and unavailable labels | Actual parcel and verified data retrieval, later |
| Profile | React-only draft name; existing local locale preference | Real authorized account/profile/saved items, later |
| Rotation | Plain unavailable message | Validated model/science output and approved API, **not yet** |
| Map/community | Placeholder navigation destinations | Verified geographic inventory and authorized community data in later phases |

## 9. Bring architecture documentation into parity with implemented M1

The five shared docs downloaded in §1 already describe the **new sequential workflow**. After you actually finish implementing/testing M1, change only the single *future tense* architecture sentence so `docs/system-design.md` reflects the working branch. Run once, then inspect the diff:

```bash
python - <<'PY'
from pathlib import Path
p = Path('docs/system-design.md')
text = p.read_text(encoding='utf-8')
old = '- **M1 planned edits (not yet deployed):**'
new = '- **M1 implemented on the verified feature branch (to be integrated):**'
if text.count(old) != 1:
    raise SystemExit('Expected M1 architecture sentence missing or duplicated. Review docs manually and update this guide.')
p.write_text(text.replace(old, new), encoding='utf-8')
PY
git diff -- docs/01-cahier-des-charges.md docs/frontend-guide.md docs/instructions.md docs/system-design.md docs/documentation-strategy.md README.md
```

The final wording can be changed to `M1 integrated in main` **after the local integration commit** only if that fact is true; this small historical tense discrepancy is acceptable while the feature branch is under review. If source code differs in any way from §3–7, update the affected **complete code block in `docs/frontend/milestone-M1/M1-DEV1.md` in that same commit**. Update tests and expected outcomes as needed; do not copy source files into every shared doc. If a shared doc remains accurate, do not make cosmetic edits. The requirements version 1.2 changes **workflow statements only**, not product requirements.

## 10. Commit feature; test local merge into `main`; push main (no PR)

**GitHub rules precondition:** The M0 process may have required PR approvals on `main`. This **conflicts** with the new no-PR workflow. An authorized repository admin must adjust the GitHub ruleset to allow tested local-merge pushes by your account, without enabling force pushes or deleting branches. If blocked, **stop at the tested feature branch** and have the rules updated legitimately; do not create a PR as a workaround or bypass permission checks.

### A. Commit the tested feature branch

```bash
git branch --show-current            # feature/m1-dev1
git status --short                  # review expected files only
git diff --check

git add README.md .github/workflows/frontend.yml   src/app src/i18n/messages.ts src/components/m1 src/components/navigation   src/features/m1 tests/m1-phone-format.test.ts tests/m1-welcome.test.tsx   tests/m1-access.test.tsx tests/m1-navigation.test.tsx tests/m1-screens.test.tsx   docs/01-cahier-des-charges.md docs/frontend-guide.md docs/instructions.md   docs/system-design.md docs/documentation-strategy.md   docs/frontend/milestone-M1/M1-DEV1.md

git diff --cached --check
git diff --cached --stat
git commit -m "feat(m1): add bilingual welcome, demo access and navigation"
git status --short                  # empty
# Optional but recommended: feature-branch backup and feature-push CI
# This does NOT create a PR:
git push -u origin feature/m1-dev1
```

Expected: the feature commit includes **all** changed source + test + current guide + required docs in one coherent change; `src/app/page.tsx` deletion is staged. On GitHub the workflow's `checks` job can run on the feature push; inspect its real status if this push is used. **Do not** put unfinished implementation commits directly on `main`.

### B. Integrate locally and rerun checks **on the merged tree**

```bash
# Only after every required feature-branch check above passes:
git switch main
git pull --ff-only origin main
git status --short                 # empty

# Keep merge uncommitted until revalidation succeeds:
git merge --no-ff --no-commit feature/m1-dev1
# If conflicts appear: resolve deliberately, maintain THIS guide as needed,
# and rerun relevant tests; do not auto-ignore conflicting docs.

npm ci
npm run lint
npm run typecheck
npm run test
npm run build
# Rerun the relevant manual journey at /, /access, /home, /profile,
# /rotation, /map, /community, /parcels/new and /foundation-preview.

# ONLY after all these pass and source/guide parity has been rechecked:
git diff --cached --check
git commit -m "merge(m1): validate welcome and navigation on main"
git push origin main
git fetch origin
git rev-parse HEAD                    # M1_MERGED_SHA
git rev-parse origin/main
# The two SHA values above must match before starting M2.
```

**On failure before commit:** if a merge is still in progress, run `git merge --abort`, return to `feature/m1-dev1`, fix code, tests and the guide together, then retry integration; if conflicts have been resolved but an uncommitted merge remains, carefully verify whether `git merge --abort` is still available. Do **not** publish a broken `main`. If `git push origin main` is rejected (new commits or rules), **stop**, fetch the current remote state and resolve via documented local integration; never force-push.

**Expected integrated gate:** `npm ci` + lint/typecheck/tests/build all pass again on the **merged main tree**, M0 regressions are absent, and the remote `main` SHA matches the locally validated commit. GitHub Actions then runs on pushed `main`; confirm `checks` succeeds there as well. Only after remote status is verified should the next milestone begin.

### M1 completion record — fill with actual observations

```text
Milestone: M1 | Owner: DEV1 | Branch: feature/m1-dev1
Baseline main SHA: ______________________________
Feature commit SHA: _____________________________
Feature lint/typecheck/test/build: ______________
Actual Vitest totals and failing cases: __________
Manual en/ary + RTL + mobile + desktop: __________
Welcome/audio missing-file and no autoplay: ______
Phone-format/demo-entry no-OTP checks: __________
M0 /foundation-preview regression: ______________
Guide vs code parity checked: ___________________
Local-merge tests/build + manual journey: _______
Pushed origin/main SHA: _________________________
GitHub Actions checks on main: __________________
Unverified items / known limits: _________________
Handoff: M2 begins only after all above gates pass.
```

**STOP AFTER M1:** This file contains only the M1 implementation. Do **not** generate `M2-DEV1.md` yet and do not start M2 until the verified M1 `main` SHA and green checks are recorded. M2, M3 belong to DEV1 later; M4 and M5 belong exclusively to DEV2 after M3 is integrated.
