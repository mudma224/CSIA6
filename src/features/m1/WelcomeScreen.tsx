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
