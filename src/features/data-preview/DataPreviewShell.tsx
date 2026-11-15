"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { Card } from "@/components/ui/Card";
import type { FeatureCollection } from "geojson";
import { CropsTable, type CropRow } from "./CropsTable";
import { PlacesMap } from "./PlacesMap";

type DataPreviewShellProps = {
  crops: CropRow[];
  places: FeatureCollection;
};

/**
 * Internal data-verification shell: renders the committed data files
 * (`src/data/crops.v1.json` and `src/data/verified-places.v1.geojson`)
 * so the team can validate them inside the running app.
 * Not a farmer-facing screen: never linked from the app navigation,
 * and the recommendation feature stays deferred (cahier des charges v1.1).
 */
export function DataPreviewShell({ crops, places }: DataPreviewShellProps) {
  const { locale, t } = useLocale();
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="rounded-full bg-mint px-4 py-2 text-sm font-bold text-forest">{t("dataPreviewBadge")}</span>
        <span className="text-sm text-muted">{locale === "ary" ? "العربية (الفصحى)" : "English + MSA Arabic"}</span>
      </div>

      <header className="mb-7">
        <h1 className="text-3xl font-bold leading-tight text-forest sm:text-4xl">{t("dataPreviewTitle")}</h1>
        <p className="mt-3 text-base text-muted">{t("dataPreviewIntro")}</p>
      </header>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-3 text-xl font-bold text-forest">{t("cropsTitle")}</h2>
          <div className="overflow-x-auto">
            <CropsTable crops={crops} />
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-bold text-forest">{t("dataPreviewMapTitle")}</h2>
          <PlacesMap places={places} />
          <p className="mt-3 text-sm text-muted">{t("mapNote")}</p>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-bold text-forest">{t("dataFiles")}</h2>
          <ul className="list-inside list-disc text-sm text-ink">
            <li><code>src/data/crops.v1.json</code> — 25 crops, 13 in the P0 form list</li>
            <li><code>src/data/verified-places.v1.geojson</code> — 5 verified points</li>
            <li><code>src/data/README.md</code> — provenance and verification trail</li>
          </ul>
        </Card>
      </div>

      <footer className="mt-7 text-sm text-muted">{t("dataEditWarning")}</footer>
    </main>
  );
}
