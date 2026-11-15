import { readFileSync } from "node:fs";
import path from "node:path";
import type { FeatureCollection } from "geojson";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { DataPreviewShell } from "@/features/data-preview/DataPreviewShell";
import type { CropRow } from "@/features/data-preview/CropsTable";

const DATA_DIR = path.join(process.cwd(), "src", "data");

/**
 * Internal data-verification page (server component). Reads the committed
 * data files at request time and hands them to the client shell.
 * Not linked from farmer navigation; the recommendation feature stays
 * deferred until the data-science handoff (cahier des charges v1.1).
 */
export const metadata = {
  title: "flaht bladi — data verification (internal)",
};

function readCrops(): CropRow[] {
  const raw: unknown = JSON.parse(readFileSync(path.join(DATA_DIR, "crops.v1.json"), "utf8"));
  if (typeof raw !== "object" || raw === null || !Array.isArray((raw as { crops?: unknown }).crops)) {
    throw new Error("crops.v1.json: missing crops array");
  }
  const crops = (raw as { crops: unknown[] }).crops;
  if (!crops.every((c) => typeof (c as CropRow).crop_id === "string")) {
    throw new Error("crops.v1.json: a crop entry is missing its crop_id");
  }
  return crops as CropRow[];
}

function readPlaces(): FeatureCollection {
  const raw: unknown = JSON.parse(readFileSync(path.join(DATA_DIR, "verified-places.v1.geojson"), "utf8"));
  const fc = raw as FeatureCollection;
  if (fc.type !== "FeatureCollection" || !Array.isArray(fc.features) || fc.features.length === 0) {
    throw new Error("verified-places.v1.geojson: not a non-empty FeatureCollection");
  }
  return fc;
}

export default function DataPreviewPage() {
  const crops = readCrops();
  const places = readPlaces();
  return (
    <LocaleProvider>
      <DataPreviewShell crops={crops} places={places} />
    </LocaleProvider>
  );
}
