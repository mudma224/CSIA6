import { describe, expect, it } from "vitest";
import {
  countVerifiedPoints, externalDirectionsUrl, filterVerifiedPoints,
  initialOrientationBounds, publishedStudyExtent, verifiedMapPoints,
} from "@/data/m3/verifiedPoints";

const EXPECTED_IDS = ["bin-el-ouidane", "ahmed-el-hansali"];

describe("M3 source-checked static map dataset", () => {
  it("has only the two explicitly documented feature IDs and no unsourced categories", () => {
    expect(verifiedMapPoints.map((p) => p.id)).toEqual(EXPECTED_IDS);
    expect(new Set(verifiedMapPoints.map((p) => p.id)).size).toBe(verifiedMapPoints.length);
    expect(verifiedMapPoints.every((p) => p.category === "water")).toBe(true);
  });

  it("keeps valid positions tied to exact source URLs and review metadata", () => {
    for (const point of verifiedMapPoints) {
      expect(point.latitude).toBeGreaterThanOrEqual(-90);
      expect(point.latitude).toBeLessThanOrEqual(90);
      expect(point.longitude).toBeGreaterThanOrEqual(-180);
      expect(point.longitude).toBeLessThanOrEqual(180);
      expect(point.coordinateMeaning).toBe("approximate-mapped-feature");
      expect(point.reviewedOn).toBe("2026-11-15");
      expect(point.coordinateSourceUrl).toMatch(/^https:\/\/mapcarta\.com\/W\d+$/);
      expect(point.osmFeatureUrl).toMatch(/^https:\/\/www\.openstreetmap\.org\/way\/\d+$/);
      expect(point.contextSourceUrl).toBe(publishedStudyExtent.sourceUrl);
      expect(point.title.en.length).toBeGreaterThan(4);
      expect(point.title.ary.length).toBeGreaterThan(4);
    }
  });

  it("pins both dam positions to the sourced coordinate values, never generated coordinates", () => {
    expect(verifiedMapPoints[0]).toMatchObject({ latitude: 32.10682, longitude: -6.46409 });
    expect(verifiedMapPoints[1]).toMatchObject({ latitude: 32.6932, longitude: -5.88843 });
  });

  it("uses the published extent only for camera context, not an official polygon", () => {
    expect(publishedStudyExtent.north).toBeGreaterThan(publishedStudyExtent.south);
    expect(publishedStudyExtent.east).toBeGreaterThan(publishedStudyExtent.west);
    expect(initialOrientationBounds).toHaveLength(2);
    expect(initialOrientationBounds[0][0]).toBeLessThan(publishedStudyExtent.south);
    expect(initialOrientationBounds[1][0]).toBeGreaterThan(publishedStudyExtent.north);
  });

  it("counts correctly and preserves honest empty category results", () => {
    expect(countVerifiedPoints("all")).toBe(2);
    expect(countVerifiedPoints("water")).toBe(2);
    expect(countVerifiedPoints("market")).toBe(0);
    expect(countVerifiedPoints("supplier")).toBe(0);
    expect(filterVerifiedPoints("water")).toHaveLength(2);
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
