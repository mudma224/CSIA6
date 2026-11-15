"use client";

import Link from "next/link";
import { ArrowUpRight, MapPinned, Sprout, UsersRound } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM2Text } from "@/i18n/m2Messages";

export function HomeScreen() {
  const { t } = useLocale();
  const tx = useM2Text();
  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <p className="font-semibold text-leaf">{t("demoModeTitle")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{t("homeTitle")}</h1>
        <p className="text-base text-muted">{t("homeDescription")}</p>
      </header>
      <Card className="space-y-4 bg-mint">
        <div className="flex items-center gap-3">
          <Sprout aria-hidden="true" className="text-forest" />
          <h2 className="text-xl font-bold text-forest">{t("nextCropTitle")}</h2>
        </div>
        <p className="text-base text-ink">{t("nextCropUnavailable")}</p>
        <ActionLink href="/rotation">{t("seeUnavailableRotation")}</ActionLink>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/parcels/new" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <Sprout aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("parcelTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{tx("parcelEntryDescription")}</p>
          <p className="mt-3 font-bold text-leaf">{tx("startParcel")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/map" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf">
          <MapPinned aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("mapTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("mapComing")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
        <Link href="/community" className="min-h-44 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-leaf sm:col-span-2">
          <UsersRound aria-hidden="true" className="text-leaf" />
          <h2 className="mt-3 text-xl font-bold text-forest">{t("communityTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("communityComing")}</p>
          <ArrowUpRight className="mt-3 text-leaf" aria-hidden="true" />
        </Link>
      </div>
      <p className="text-sm text-muted">{t("homeNoLiveData")}</p>
    </div>
  );
}
