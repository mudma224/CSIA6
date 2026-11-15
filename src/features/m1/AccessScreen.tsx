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
