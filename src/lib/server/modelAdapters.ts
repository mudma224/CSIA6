if (typeof window !== "undefined") {
  throw new Error("This module is server-only and must never run in the browser.");
}

/**
 * Explicit public ↔ science mapping (B0 §2 reconciliation matrix, approved C04–C08).
 * No silent conversions: every mapping below is documented and tested.
 */
import {
  seasonGrammarOk,
  type PublicRecommendationRequest,
} from "@/lib/recommendationTypes";

export type ScienceRecommendationRequest = {
  parcel: {
    zone: "beni_amir" | "beni_moussa" | "other" | "unsure";
    area_ha?: number;
    irrigation: "flood" | "basin" | "drip" | "pivot" | "sprinkler" | "unknown";
    location?: { lat: number; lon: number };
  };
  history: Array<{ crop_id: string; season?: string }>;
  planned_season?: string;
};

const ZONE_MAP: Record<PublicRecommendationRequest["parcel"]["zone"], ScienceRecommendationRequest["parcel"]["zone"]> = {
  amir: "beni_amir",
  moussa: "beni_moussa",
  other: "other",
  unsure: "unsure",
};

const IRRIGATION_MAP: Record<
  PublicRecommendationRequest["parcel"]["irrigation"],
  ScienceRecommendationRequest["parcel"]["irrigation"]
> = {
  "drip-ui": "drip",
  "surface-ui": "unknown", // surface is not uniquely flood or basin (C04 — no silent mapping)
  "other-ui": "unknown",
  unsure: "unknown",
  "": "unknown",
};

function parseArea(areaHa: string | undefined): number | undefined {
  const clean = (areaHa ?? "").trim();
  if (!clean) return undefined;
  if (!/^\d+(?:[.,]\d+)?$/.test(clean)) return undefined;
  const parsed = Number(clean.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1000) return undefined;
  return parsed;
}

export function publicToScience(publicBody: PublicRecommendationRequest): ScienceRecommendationRequest {
  const area = parseArea(publicBody.parcel.areaHa);
  const history: Array<{ crop_id: string; season?: string }> = [];
  for (const entry of publicBody.history) {
    const crop_id = (entry.crop_id ?? "").trim().toLowerCase();
    if (!crop_id) continue;
    const season = entry.season && seasonGrammarOk(entry.season.trim())
      ? entry.season.trim()
      : undefined;
    history.push(season ? { crop_id, season } : { crop_id });
  }

  const request: ScienceRecommendationRequest = {
    parcel: {
      zone: ZONE_MAP[publicBody.parcel.zone],
      irrigation: IRRIGATION_MAP[publicBody.parcel.irrigation],
      ...(area !== undefined ? { area_ha: area } : {}),
      ...(publicBody.parcel.location ? { location: publicBody.parcel.location } : {}),
    },
    history,
  };
  const planned = (publicBody.plannedSeason ?? "").trim();
  if (planned && seasonGrammarOk(planned)) {
    request.planned_season = planned;
  }
  return request;
}
