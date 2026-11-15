"use client";

import { Info, Sprout } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM2Text } from "@/i18n/m2Messages";

export function RotationScreen() {
  const { t } = useLocale();
  const tx = useM2Text();
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex items-center gap-3 text-forest">
          <Info aria-hidden="true" />
          <h1 className="text-2xl font-extrabold">{t("rotationTitle")}</h1>
        </div>
        <p className="text-ink">{t("rotationUnavailable")}</p>
        <p className="text-sm text-muted">{tx("recommendationsUnavailable")}</p>
      </Card>
      <Card className="space-y-4 bg-mint">
        <div className="flex items-center gap-3 text-forest">
          <Sprout aria-hidden="true" />
          <h2 className="text-xl font-bold">{tx("startParcel")}</h2>
        </div>
        <p className="text-ink">{tx("rotationIntro")}</p>
        <ActionLink href="/parcels/new">{tx("startParcel")}</ActionLink>
      </Card>
      <ActionLink href="/home" variant="outline">{t("backHome")}</ActionLink>
    </div>
  );
}
