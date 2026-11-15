"use client";

import { useEffect } from "react";
import {
  CircleMarker, MapContainer, Popup, TileLayer, useMap, ZoomControl,
} from "react-leaflet";
import {
  initialOrientationBounds, verifiedMapPoints,
} from "@/data/m3/verifiedPoints";
import type { VerifiedMapPoint } from "@/data/m3/verifiedPoints";
import type { Locale } from "@/i18n/locale";

export type TadlaLeafletMapProps = {
  points: readonly VerifiedMapPoint[];
  selectedId: string | null;
  resetViewKey: number;
  locale: Locale;
  onSelect: (id: string) => void;
  onTileError: () => void;
};

function ViewController({ selectedId, resetViewKey }: {
  selectedId: string | null;
  resetViewKey: number;
}) {
  const map = useMap();

  useEffect(() => {
    const selected = verifiedMapPoints.find((point) => point.id === selectedId);
    if (selected) {
      // Map navigation only; NEVER assigns or persists a farmer's parcel coordinates.
      map.setView([selected.latitude, selected.longitude], 12, { animate: false });
    } else {
      map.fitBounds(initialOrientationBounds, {
        padding: [24, 24],
        animate: false,
      });
    }
  }, [map, selectedId, resetViewKey]);

  return null;
}

export function TadlaLeafletMap({
  points, selectedId, resetViewKey, locale, onSelect, onTileError,
}: TadlaLeafletMapProps) {
  return (
    <MapContainer
      bounds={initialOrientationBounds}
      scrollWheelZoom={false}
      keyboard
      zoomControl={false}
      minZoom={5}
      maxZoom={16}
      className="h-[350px] w-full rounded-[var(--radius-md)] sm:h-[450px]"
      style={{ background: "var(--water, #DCECE6)" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        eventHandlers={{ tileerror: onTileError }}
        maxZoom={19}
      />
      <ZoomControl position="topright" />
      <ViewController selectedId={selectedId} resetViewKey={resetViewKey} />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.latitude, point.longitude]}
          radius={selectedId === point.id ? 12 : 9}
          pathOptions={{
            color: "#193D2B",
            fillColor: selectedId === point.id ? "#D9A44B" : "#39794F",
            fillOpacity: 0.95,
            weight: 3,
          }}
          eventHandlers={{ click: () => onSelect(point.id) }}
        >
          <Popup>
            <div className="max-w-52 space-y-2 text-sm" dir={locale === "ary" ? "rtl" : "ltr"}>
              <strong className="block">{point.title[locale]}</strong>
              <p>{point.description[locale]}</p>
              <a
                className="underline"
                href={point.osmFeatureUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {locale === "ary" ? "المصدر فـ OpenStreetMap" : "Source on OpenStreetMap"}
              </a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
