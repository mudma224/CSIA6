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
