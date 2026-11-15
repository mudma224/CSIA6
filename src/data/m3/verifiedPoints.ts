import placesJson from "@/data/verified-places.v1.json";
import type { Locale } from "@/i18n/locale";

export type MapCategory = "water" | "reference" | "market" | "supplier";
export type MapFilter = "all" | MapCategory;

/**
 * A cartographic feature reference only, never a parcel, entrance or live status.
 * Provenance URLs are optional because the committed data layer only carries
 * links that were actually verified; the UI renders links when present.
 */
export type VerifiedMapPoint = Readonly<{
  id: string;
  category: MapCategory;
  title: Readonly<Record<Locale, string>>;
  description: Readonly<Record<Locale, string>>;
  latitude: number;
  longitude: number;
  coordinateMeaning: "approximate-mapped-feature";
  reviewedOn: "2026-11-15";
  coordinateSourceUrl: string | null;
  osmFeatureUrl: string | null;
  contextSourceUrl: string | null;
  precisionCaveat: string;
}>;

/** Published study rectangle (2025 paper); do NOT render as an ORMVAT boundary. */
export const publishedStudyExtent = {
  south: 32.1625,              // 32°09′45″ N
  north: 32.5502777778,       // 32°33′01″ N
  west: -7.0283333333,        // 7°01′42″ W
  east: -6.3966666667,        // 6°23′48″ W
  sourceUrl: "https://www.tandfonline.com/doi/10.1080/10106049.2025.2471104",
} as const;

/** Camera bounds INCLUDE reference cities outside the study rectangle; never draw as a polygon. */
export const initialOrientationBounds: [[number, number], [number, number]] = [
  [32.10682, -7.0283333333],
  [32.69320, -5.88843],
];

type RawPlaces = {
  features: Array<{
    properties: {
      id: string;
      name_en: string;
      name_ar: string;
      category: string;
      detail_en: string;
      detail_ar: string;
      coordinate_source_url?: string | null;
      osm_feature_url?: string | null;
      context_source_url?: string | null;
      verified_date: string;
      precision_caveat: string;
    };
    geometry: { type: string; coordinates: [number, number] };
  }>;
};

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`verified-places.v1.json: ${message}`);
  }
}

/** Adapt the committed data layer into map points; fail loudly on any schema drift. */
function toMapPoints(raw: unknown): readonly VerifiedMapPoint[] {
  const data = raw as RawPlaces;
  assertCondition(data && Array.isArray(data.features) && data.features.length > 0, "missing features array");
  return data.features.map((feature) => {
    const p = feature.properties;
    const category = p.category;
    assertCondition(
      category === "water" || category === "reference",
      `unsupported category "${category}" for ${p.id}`,
    );
    assertCondition(feature.geometry.type === "Point", `non-point geometry for ${p.id}`);
    assertCondition(p.verified_date === "2026-11-15" && p.precision_caveat.length > 0, `provenance missing for ${p.id}`);
    const [longitude, latitude] = feature.geometry.coordinates;
    assertCondition(
      Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180,
      `coordinates out of range for ${p.id}`,
    );
    return {
      id: p.id,
      category,
      title: { en: p.name_en, ary: p.name_ar },
      description: { en: p.detail_en, ary: p.detail_ar },
      latitude,
      longitude,
      coordinateMeaning: "approximate-mapped-feature",
      reviewedOn: "2026-11-15",
      coordinateSourceUrl: p.coordinate_source_url ?? null,
      osmFeatureUrl: p.osm_feature_url ?? null,
      contextSourceUrl: p.context_source_url ?? null,
      precisionCaveat: p.precision_caveat,
    } satisfies VerifiedMapPoint;
  });
}

export const verifiedMapPoints: readonly VerifiedMapPoint[] = toMapPoints(placesJson);

export function filterVerifiedPoints(filter: MapFilter): readonly VerifiedMapPoint[] {
  return filter === "all"
    ? verifiedMapPoints
    : verifiedMapPoints.filter((point) => point.category === filter);
}

export function countVerifiedPoints(filter: MapFilter): number {
  return filterVerifiedPoints(filter).length;
}

/** The external service decides routing; this is NOT a surveyed access location. */
export function externalDirectionsUrl(point: VerifiedMapPoint): string {
  const destination = `${point.latitude},${point.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
