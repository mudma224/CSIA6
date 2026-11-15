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
