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
