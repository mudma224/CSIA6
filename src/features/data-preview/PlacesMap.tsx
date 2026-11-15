"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";

const TADLA_BBOX: [[number, number], [number, number]] = [[32.1625, -7.0283], [32.5503, -6.3967]];

/**
 * Displays the verified map places from `src/data/verified-places.v1.geojson`
 * (5 sourced points). The dashed rectangle is the provisional study bbox,
 * explicitly labelled team-derived: it is NOT an official ORMVAT boundary.
 * Internal verification component; the farmer-facing map is the M3 milestone.
 */
export function PlacesMap({ places }: { places: FeatureCollection }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: LeafletMap | null = null;
    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current).setView([32.45, -6.55], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.rectangle(TADLA_BBOX, {
        color: "#D9A44B",
        weight: 2,
        dashArray: "6 6",
        fill: false,
      })
        .addTo(map)
        .bindTooltip("Provisional study bbox (team-derived — NOT an official boundary)");

      L.geoJSON(places, {
        pointToLayer: (feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 9,
            color: "#FFFFFF",
            weight: 2,
            fillColor: feature.properties.category === "dam" ? "#39794F" : "#D9A44B",
            fillOpacity: 0.95,
          }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties as {
            name_en: string;
            name_ar: string;
            detail_en: string;
            built?: number;
            source: string[];
            verified_date: string;
            precision_caveat: string;
          };
          layer.bindPopup(
            `<div style="min-width:230px">
              <b>${p.name_en}</b> · <span dir="rtl" style="font-size:16px">${p.name_ar}</span><br>
              <i>${p.detail_en}</i><br>
              ${p.built ? `Built: ${p.built}<br>` : ""}
              <span style="font-size:11px;color:#64756A">
                Sources: ${p.source.join(" · ")}<br>
                Verified: ${p.verified_date}<br>
                ⚠ ${p.precision_caveat}
              </span>
            </div>`,
          );
        },
      }).addTo(map);
    })();

    return () => {
      cancelled = true;
      map?.remove();
      map = null;
    };
  }, [places]);

  return (
    <div
      ref={containerRef}
      className="h-[460px] w-full rounded-[var(--radius-lg)] border border-[var(--border)]"
      role="application"
      aria-label="Verified Tadla map places"
    />
  );
}
