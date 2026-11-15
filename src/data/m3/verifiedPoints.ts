import type { Locale } from "@/i18n/locale";

export type MapCategory = "water" | "market" | "supplier";
export type MapFilter = "all" | MapCategory;

/** A cartographic feature reference only, never a parcel, entrance or live status. */
export type VerifiedMapPoint = Readonly<{
  id: string;
  category: MapCategory;
  title: Readonly<Record<Locale, string>>;
  description: Readonly<Record<Locale, string>>;
  latitude: number;
  longitude: number;
  coordinateMeaning: "approximate-mapped-feature";
  reviewedOn: "2026-11-15";
  coordinateSourceUrl: string;
  osmFeatureUrl: string;
  contextSourceUrl: string;
}>;

/** Published study rectangle (2025 paper); do NOT render as an ORMVAT boundary. */
export const publishedStudyExtent = {
  south: 32.1625,              // 32°09′45″ N
  north: 32.5502777778,       // 32°33′01″ N
  west: -7.0283333333,        // 7°01′42″ W
  east: -6.3966666667,        // 6°23′48″ W
  sourceUrl: "https://www.tandfonline.com/doi/10.1080/10106049.2025.2471104",
} as const;

/** Camera bounds INCLUDE two dams outside the study rectangle; never draw as a polygon. */
export const initialOrientationBounds: [[number, number], [number, number]] = [
  [32.10682, -7.0283333333],
  [32.69320, -5.88843],
];

export const verifiedMapPoints: readonly VerifiedMapPoint[] = [
  {
    id: "bin-el-ouidane",
    category: "water",
    title: { en: "Bin El Ouidane Dam", ary: "سد بين الويدان" },
    description: {
      en: "A mapped dam referenced in studies of the Béni Moussa irrigation system. The point is on the mapped feature, not a visitor entrance.",
      ary: "سد مبين فالخرائط ومذكور فالمراجع على سقي بني موسى. النقطة كتمثل موقع السد فالخريطة، ماشي المدخل ديالو.",
    },
    latitude: 32.10682,
    longitude: -6.46409,
    coordinateMeaning: "approximate-mapped-feature",
    reviewedOn: "2026-11-15",
    coordinateSourceUrl: "https://mapcarta.com/W504108035",
    osmFeatureUrl: "https://www.openstreetmap.org/way/504108035",
    contextSourceUrl: publishedStudyExtent.sourceUrl,
  },
  {
    id: "ahmed-el-hansali",
    category: "water",
    title: { en: "Ahmed El Hansali Dam", ary: "سد أحمد الحنصالي" },
    description: {
      en: "A mapped dam referenced in studies of the Béni Amir irrigation system. The point is on the mapped feature, not a visitor entrance.",
      ary: "سد مبين فالخرائط ومذكور فالمراجع على سقي بني عمير. النقطة كتمثل موقع السد فالخريطة، ماشي المدخل ديالو.",
    },
    latitude: 32.69320,
    longitude: -5.88843,
    coordinateMeaning: "approximate-mapped-feature",
    reviewedOn: "2026-11-15",
    coordinateSourceUrl: "https://mapcarta.com/W385347001",
    osmFeatureUrl: "https://www.openstreetmap.org/way/385347001",
    contextSourceUrl: publishedStudyExtent.sourceUrl,
  },
];

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
