"use client";

import { CalendarClock, Info } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Card } from "@/components/ui/Card";
import { useM4Text } from "@/i18n/m4Messages";

export function CalendarScreen() {
  const t = useM4Text();
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-bold text-leaf">{t("localOnly")}</p>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-forest">
          <CalendarClock aria-hidden="true" className="shrink-0" /> {t("calendarHeading")}
        </h1>
        <p className="text-base text-ink">{t("calendarDescription")}</p>
      </header>
      <LocaleSwitcher />
      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <Info aria-hidden="true" className="shrink-0 text-leaf" />
          <p className="text-ink">{t("calendarDataMissing")}</p>
        </div>
        <p className="text-sm text-muted">{t("calendarFuture")}</p>
        <p className="text-sm text-muted">{t("rotationUnavailable")}</p>
        <ActionLink href="/home" variant="outline">{t("backHome")}</ActionLink>
      </Card>
    </div>
  );
}
