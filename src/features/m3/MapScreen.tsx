"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { MapPinned, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import {
  countVerifiedPoints, externalDirectionsUrl, filterVerifiedPoints,
  verifiedMapPoints, publishedStudyExtent,
} from "@/data/m3/verifiedPoints";
import type { MapFilter } from "@/data/m3/verifiedPoints";
import { useLocale } from "@/i18n/LocaleProvider";
import { useM3Text } from "@/i18n/m3Messages";

function MapLoading() {
  const tx = useM3Text();
  return (
    <div role="status" className="grid min-h-[350px] place-items-center rounded-[var(--radius-md)] bg-mint p-5 text-center text-forest">
      {tx("loadingMap")}
    </div>
  );
}

const LeafletMap = dynamic(
  () => import("@/components/map/TadlaLeafletMap").then((mod) => mod.TadlaLeafletMap),
  { ssr: false, loading: MapLoading },
);

const filters: MapFilter[] = ["all", "water", "market", "supplier"];

export function MapScreen() {
  const { locale } = useLocale();
  const tx = useM3Text();
  const [filter, setFilter] = useState<MapFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [tileProblem, setTileProblem] = useState(false);

  const visiblePoints = filterVerifiedPoints(filter);
  const selected = verifiedMapPoints.find((item) => item.id === selectedId) ?? null;

  const filterLabels: Record<MapFilter, string> = {
    all: tx("all"), water: tx("water"),
    market: tx("markets"), supplier: tx("suppliers"),
  };

  function changeFilter(next: MapFilter) {
    setFilter(next);
    setSelectedId(null);
  }

  function resetView() {
    setSelectedId(null);
    setResetViewKey((count) => count + 1);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="font-semibold text-leaf">{tx("eyebrow")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{tx("title")}</h1>
        <p className="max-w-3xl text-base text-ink">{tx("description")}</p>
        <LocaleSwitcher />
      </header>

      <Card className="space-y-3 bg-mint">
        <p className="font-semibold text-forest">{tx("mapOrientation")}</p>
        <p className="text-sm text-ink">{tx("mapPrecision")}</p>
        <p className="text-sm text-muted">{tx("mapNetwork")}</p>
        <a
          href={publishedStudyExtent.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-semibold text-forest underline"
        >
          {tx("contextSource")}
        </a>
      </Card>

      <section aria-labelledby="map-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="map-heading" className="flex items-center gap-2 text-xl font-extrabold text-forest">
            <MapPinned aria-hidden="true" /> {tx("mapHeading")}
          </h2>
          <button
            type="button"
            onClick={resetView}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-forest bg-white px-4 py-2 font-semibold text-forest hover:bg-mint"
          >
            <RotateCcw size={18} aria-hidden="true" /> {tx("resetView")}
          </button>
        </div>
        <div
          role="region"
          aria-label={tx("mapRegionLabel")}
          dir="ltr"
          className="relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-2"
        >
          <LeafletMap
            points={visiblePoints}
            selectedId={selectedId}
            resetViewKey={resetViewKey}
            locale={locale}
            onSelect={setSelectedId}
            onTileError={() => setTileProblem(true)}
          />
        </div>
        {tileProblem && (
          <p role="alert" className="rounded-[var(--radius-md)] border border-[var(--border)] bg-cream p-4 text-ink">
            {tx("tileProblem")}
          </p>
        )}
      </section>

      <section aria-labelledby="filters-heading" className="space-y-4">
        <h2 id="filters-heading" className="text-xl font-extrabold text-forest">{tx("filtersLabel")}</h2>
        <div role="group" aria-label={tx("filtersLabel")} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {filters.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => changeFilter(value)}
              className={`min-h-12 rounded-[var(--radius-md)] border px-3 py-3 text-sm font-semibold focus-visible:outline-4 ${filter === value ? "border-forest bg-forest text-white" : "border-[var(--border)] bg-white text-forest hover:bg-mint"}`}
            >
              {filterLabels[value]} ({countVerifiedPoints(value)})
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {visiblePoints.length} {tx("found")}
        </p>
      </section>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="place-list-heading">
          <Card className="h-full space-y-4">
            <h2 id="place-list-heading" className="text-xl font-extrabold text-forest">{tx("placeList")}</h2>
            {visiblePoints.length === 0 ? (
              <p role="status" className="text-ink">{tx("empty")}</p>
            ) : (
              <ul className="space-y-3">
                {visiblePoints.map((point) => (
                  <li key={point.id}>
                    <button
                      type="button"
                      aria-pressed={selectedId === point.id}
                      onClick={() => setSelectedId(point.id)}
                      className={`w-full min-h-16 rounded-[var(--radius-md)] border p-4 text-start focus-visible:outline-4 ${selectedId === point.id ? "border-forest bg-mint" : "border-[var(--border)] bg-white hover:bg-cream"}`}
                    >
                      <span className="block font-bold text-forest">{point.title[locale]}</span>
                      <span className="mt-1 block text-sm text-ink">{tx("viewOnMap")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section aria-labelledby="place-detail-heading">
          <Card className="h-full space-y-4">
            <h2 id="place-detail-heading" className="text-xl font-extrabold text-forest">{tx("selectedDetails")}</h2>
            {!selected ? (
              <p className="text-ink">{tx("selectPrompt")}</p>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-forest">{selected.title[locale]}</h3>
                <p className="text-ink">{selected.description[locale]}</p>
                <p className="text-sm font-semibold text-leaf">{tx("categoryWater")}</p>
                <p className="text-sm text-muted">{tx("approximateLocation")}</p>
                <p className="text-sm text-muted">
                  {tx("reviewedOn")}: <time dateTime={selected.reviewedOn}>{selected.reviewedOn}</time>
                </p>
                <div className="flex flex-col items-start gap-1">
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={selected.coordinateSourceUrl} target="_blank" rel="noopener noreferrer">{tx("mapSource")}</a>
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={selected.osmFeatureUrl} target="_blank" rel="noopener noreferrer">{tx("osmFeature")}</a>
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={selected.contextSourceUrl} target="_blank" rel="noopener noreferrer">{tx("contextSource")}</a>
                  <a className="inline-flex min-h-11 items-center font-semibold text-forest underline" href={externalDirectionsUrl(selected)} target="_blank" rel="noopener noreferrer">{tx("directions")}</a>
                </div>
                <p className="text-sm text-muted">{tx("directionsNotice")}</p>
              </div>
            )}
          </Card>
        </section>
      </div>

      <Card className="space-y-3">
        <p className="text-sm text-muted">{tx("missingCoverage")}</p>
        <p className="text-sm text-muted">{tx("manualLocationNote")}</p>
        <Link href="/parcels/new" className="inline-flex min-h-11 items-center font-semibold text-forest underline">
          {tx("linkedBack")}
        </Link>
      </Card>
    </div>
  );
}
