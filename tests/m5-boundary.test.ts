import { describe, expect, it } from "vitest";
import { m5Messages } from "@/i18n/m5Messages";
import { emptyParcelDraft, validateParcelStep } from "@/features/m2/parcelDraft";
import { verifiedMapPoints } from "@/data/m3/verifiedPoints";
import { emptyCommunityDraft, validateCommunityDraft } from "@/features/m4/communityDraft";

const isSourceUrl = (value: string) => /^https:\/\//.test(value);

describe("M5 frontend-only boundaries", () => {
  it("all new English strings have corresponding Darija strings", () => {
    expect(Object.keys(m5Messages.en).sort()).toEqual(Object.keys(m5Messages.ary).sort());
    for (const key of Object.keys(m5Messages.en) as Array<keyof typeof m5Messages.en>) {
      expect(m5Messages.en[key].length).toBeGreaterThan(2);
      expect(m5Messages.ary[key].length).toBeGreaterThan(2);
    }
  });

  it("M2 starts without invented parcel facts or precise location", () => {
    const parcel = emptyParcelDraft;
    expect(parcel.zone).toBe("");
    expect(parcel.irrigation).toBe("");
    expect(parcel.areaHa).toBe("");
    expect(parcel.latitude).toBe("");
    expect(parcel.longitude).toBe("");
    expect(parcel.locationChoice).toBe("none");
    expect(parcel.recentCrop).toBe("");
    expect(parcel.seasonChoice).toBe("");
  });

  it("M2 accepts an explicit unknown instead of guessing the irrigation zone", () => {
    const parcel = { ...emptyParcelDraft, zone: "unsure" as const };
    expect(validateParcelStep(parcel, 0)).toEqual({});
    expect(validateParcelStep({ ...parcel, areaHa: "-4" }, 0).areaHa).toBe("invalidArea");
  });

  it("M3 markers each keep source URLs and approximate feature meaning", () => {
    expect(verifiedMapPoints).toHaveLength(2);
    for (const point of verifiedMapPoints) {
      expect(point.category).toBe("water");
      expect(point.coordinateMeaning).toBe("approximate-mapped-feature");
      expect(isSourceUrl(point.coordinateSourceUrl)).toBe(true);
      expect(isSourceUrl(point.osmFeatureUrl)).toBe(true);
    }
  });

  it("M4 starts with a blank locally authored post, not a seeded public post", () => {
    const draft = emptyCommunityDraft();
    expect(draft.kind).toBe("");
    expect(draft.crop).toBe("");
    expect(draft.description).toBe("");
    expect(validateCommunityDraft(draft)).toEqual({ kind: "required" });
  });
});
