import { describe, expect, it } from "vitest";
import {
  countVerifiedPoints, externalDirectionsUrl, filterVerifiedPoints,
  initialOrientationBounds, publishedStudyExtent, verifiedMapPoints,
} from "@/data/m3/verifiedPoints";

const EXPECTED_IDS = [
  "dam-bin-el-ouidane", "dam-ahmed-el-hansali",
  "city-beni-mellal", "city-kasba-tadla", "city-fquih-ben-salah",
];

describe("M3 source-checked static map dataset", () => {
  it("has only the five explicitly documented feature IDs from the committed data layer", () => {
    expect(verifiedMapPoints.map((p) => p.id)).toEqual(EXPECTED_IDS);
    expect(new Set(verifiedMapPoints.map((p) => p.id)).size).toBe(verifiedMapPoints.length);
  });

  it("keeps two water features and three reference cities, nothing invented", () => {
    expect(verifiedMapPoints.filter((p) => p.category === "water")).toHaveLength(2);
    expect(verifiedMapPoints.filter((p) => p.category === "reference")).toHaveLength(3);
    expect(verifiedMapPoints.every((p) => p.category === "water" || p.category === "reference")).toBe(true);
  });

  it("keeps valid positions tied to review metadata and honest approximate meaning", () => {
    for (const point of verifiedMapPoints) {
      expect(point.latitude).toBeGreaterThanOrEqual(-90);
      expect(point.latitude).toBeLessThanOrEqual(90);
      expect(point.longitude).toBeGreaterThanOrEqual(-180);
      expect(point.longitude).toBeLessThanOrEqual(180);
      expect(point.coordinateMeaning).toBe("approximate-mapped-feature");
      expect(point.reviewedOn).toBe("2026-11-15");
      expect(point.precisionCaveat.length).toBeGreaterThan(10);
      expect(point.title.en.length).toBeGreaterThan(4);
      expect(point.title.ary.length).toBeGreaterThan(4);
    }
  });

  it("keeps provenance URLs only where actually verified (never fabricated)", () => {
    const dams = verifiedMapPoints.filter((p) => p.category === "water");
    for (const dam of dams) {
      expect(dam.coordinateSourceUrl).toMatch(/^https:\/\/mapcarta\.com\/W\d+$/);
      expect(dam.osmFeatureUrl).toMatch(/^https:\/\/www\.openstreetmap\.org\/way\/\d+$/);
      expect(dam.contextSourceUrl).toBe(publishedStudyExtent.sourceUrl);
    }
    for (const city of verifiedMapPoints.filter((p) => p.category === "reference")) {
      expect(city.osmFeatureUrl).toBeNull();
      // Cities carry at most one verified coordinate/context URL, or honest nulls.
      expect(city.coordinateSourceUrl === null || /^https:\/\//.test(city.coordinateSourceUrl)).toBe(true);
    }
    expect(verifiedMapPoints[2].coordinateSourceUrl).toMatch(/^https:\/\/www\.hcp\.ma\//);
  });

  it("pins all five positions to the sourced coordinate values, never generated coordinates", () => {
    expect(verifiedMapPoints[0]).toMatchObject({ latitude: 32.10682, longitude: -6.46409 });
    expect(verifiedMapPoints[1]).toMatchObject({ latitude: 32.6932, longitude: -5.88843 });
    expect(verifiedMapPoints[2]).toMatchObject({ latitude: 32.3667, longitude: -6.4 });
    expect(verifiedMapPoints[3]).toMatchObject({ latitude: 32.598, longitude: -6.268 });
    expect(verifiedMapPoints[4]).toMatchObject({ latitude: 32.5009, longitude: -6.6905 });
  });

  it("uses the published extent only for camera context, not an official polygon", () => {
    expect(publishedStudyExtent.north).toBeGreaterThan(publishedStudyExtent.south);
    expect(publishedStudyExtent.east).toBeGreaterThan(publishedStudyExtent.west);
    expect(initialOrientationBounds).toHaveLength(2);
    expect(initialOrientationBounds[0][0]).toBeLessThan(publishedStudyExtent.south);
    expect(initialOrientationBounds[1][0]).toBeGreaterThan(publishedStudyExtent.north);
  });

  it("counts correctly and preserves honest empty category results", () => {
    expect(countVerifiedPoints("all")).toBe(5);
    expect(countVerifiedPoints("water")).toBe(2);
    expect(countVerifiedPoints("reference")).toBe(3);
    expect(countVerifiedPoints("market")).toBe(0);
    expect(countVerifiedPoints("supplier")).toBe(0);
    expect(filterVerifiedPoints("water")).toHaveLength(2);
    expect(filterVerifiedPoints("reference")).toHaveLength(3);
    expect(filterVerifiedPoints("market")).toEqual([]);
    expect(filterVerifiedPoints("supplier")).toEqual([]);
  });

  it("creates external directions from VERIFIED marker values, not the user's position", () => {
    const url = new URL(externalDirectionsUrl(verifiedMapPoints[0]));
    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe("32.10682,-6.46409");
    expect(url.searchParams.has("origin")).toBe(false);
  });
});
