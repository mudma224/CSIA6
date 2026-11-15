import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const crops = JSON.parse(
  readFileSync(resolve(process.cwd(), "src/data/crops.v1.json"), "utf8"),
) as {
  crops: Array<{
    crop_id: string;
    name_en: string;
    name_ar: string;
    scientific_name: string;
    class: string;
    lifecycle: string;
    observed: boolean;
    observed_count: number | null;
    rare: boolean;
    form_p0: boolean;
  }>;
};

const places = JSON.parse(
  readFileSync(resolve(process.cwd(), "src/data/verified-places.v1.geojson"), "utf8"),
) as {
  type: string;
  features: Array<{
    type: string;
    properties: {
      id: string;
      name_en: string;
      name_ar: string;
      category: string;
      source: string[];
      verified_date: string;
      precision_caveat: string;
    };
    geometry: { type: string; coordinates: number[] };
  }>;
};

describe("crop vocabulary data contract", () => {
  it("exposes 25 crops with unique ids", () => {
    expect(crops.crops).toHaveLength(25);
    const ids = crops.crops.map((c) => c.crop_id);
    expect(new Set(ids).size).toBe(25);
  });

  it("provides bilingual, Arabic and scientific names for every crop", () => {
    for (const c of crops.crops) {
      expect(c.name_en.trim().length).toBeGreaterThan(0);
      expect(c.name_ar.trim().length).toBeGreaterThan(0);
      expect(c.scientific_name.trim().length).toBeGreaterThan(0);
    }
  });

  it("matches verified ground-truth observation counts", () => {
    const byId = Object.fromEntries(crops.crops.map((c) => [c.crop_id, c.observed_count]));
    expect(byId.wheat).toBe(887);
    expect(byId.alfalfa).toBe(138);
    expect(byId.sugar_beet).toBe(100);
    expect(byId.olive).toBe(185);
  });

  it("flags exactly 13 P0-form crops and 10 rare ones", () => {
    expect(crops.crops.filter((c) => c.form_p0)).toHaveLength(13);
    expect(crops.crops.filter((c) => c.rare)).toHaveLength(10);
  });

  it("lists 2 rotation candidates as not observed", () => {
    const candidates = crops.crops.filter((c) => !c.observed);
    expect(candidates.map((c) => c.crop_id).sort()).toEqual(["barley", "berseem_clover"]);
    for (const c of candidates) {
      expect(c.observed_count).toBeNull();
    }
  });
});

describe("verified places data contract", () => {
  it("contains 5 sourced point features", () => {
    expect(places.type).toBe("FeatureCollection");
    expect(places.features).toHaveLength(5);
    for (const f of places.features) {
      expect(f.type).toBe("Feature");
      expect(f.geometry.type).toBe("Point");
      expect(f.properties.source.length).toBeGreaterThan(0);
      expect(f.properties.verified_date).toBe("2026-11-15");
      expect(f.properties.precision_caveat.trim().length).toBeGreaterThan(0);
    }
  });

  it("covers both dams and the three reference cities", () => {
    const ids = places.features.map((f) => f.properties.id);
    expect(ids).toEqual([
      "dam-bin-el-ouidane",
      "dam-ahmed-el-hansali",
      "city-beni-mellal",
      "city-kasba-tadla",
      "city-fquih-ben-salah",
    ]);
  });

  it("keeps polygons out of the verified layer (no invented zone geometry)", () => {
    expect(places.features.every((f) => f.geometry.type === "Point")).toBe(true);
  });
});
