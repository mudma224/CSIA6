import { describe, expect, it } from "vitest";
import {
  emptyParcelDraft, firstInvalidStep, validateParcelStep,
} from "@/features/m2/parcelDraft";
import type { ParcelDraft } from "@/features/m2/parcelDraft";

function draft(overrides: Partial<ParcelDraft> = {}): ParcelDraft {
  return {
    ...emptyParcelDraft,
    zone: "amir",
    irrigation: "unsure",
    seasonChoice: "unsure",
    ...overrides,
  };
}

describe("M2 UI-only parcel validation", () => {
  it("requires an explicit zone but accepts unsure", () => {
    expect(validateParcelStep(draft({ zone: "" }), 0).zone).toBe("requiredZone");
    expect(validateParcelStep(draft({ zone: "unsure" }), 0)).toEqual({});
  });

  it("allows no parcel name or area", () => {
    expect(validateParcelStep(draft(), 0)).toEqual({});
  });

  it("checks entered hectares without calculating measurements", () => {
    expect(validateParcelStep(draft({ areaHa: "0" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "-1" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "abc" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "1e4" }), 0).areaHa).toBe("invalidArea");
    expect(validateParcelStep(draft({ areaHa: "1,5" }), 0)).toEqual({});
    expect(validateParcelStep(draft({ areaHa: "2.25" }), 0)).toEqual({});
  });

  it("requires irrigation selection but allows an unknown method", () => {
    expect(validateParcelStep(draft({ irrigation: "" }), 1).irrigation).toBe("requiredIrrigation");
    expect(validateParcelStep(draft({ irrigation: "unsure" }), 1)).toEqual({});
  });

  it("never requires coordinates in no-location mode", () => {
    expect(validateParcelStep(draft({
      locationChoice: "none", latitude: "not used", longitude: "not used",
    }), 1)).toEqual({});
  });

  it("requires BOTH manual coordinates when that mode is selected", () => {
    expect(validateParcelStep(draft({ locationChoice: "manual" }), 1)).toMatchObject({
      latitude: "requiredCoordinates", longitude: "requiredCoordinates",
    });
    expect(validateParcelStep(draft({ locationChoice: "manual", latitude: "32" }), 1).longitude)
      .toBe("requiredCoordinates");
  });

  it("checks numeric coordinate ranges without inventing map positions", () => {
    expect(validateParcelStep(draft({
      locationChoice: "manual", latitude: "91", longitude: "0",
    }), 1).latitude).toBe("invalidLatitude");
    expect(validateParcelStep(draft({
      locationChoice: "manual", latitude: "0", longitude: "-181",
    }), 1).longitude).toBe("invalidLongitude");
    expect(validateParcelStep(draft({
      locationChoice: "manual", latitude: "32,1", longitude: "-6.2",
    }), 1)).toEqual({});
  });

  it("allows unknown season and enforces the campaign grammar when known", () => {
    expect(validateParcelStep(draft({ seasonChoice: "" }), 2).seasonChoice).toBe("requiredSeasonMode");
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "" }), 2).plannedSeason)
      .toBe("requiredSeasonText");
    expect(validateParcelStep(draft({ seasonChoice: "unsure" }), 2)).toEqual({});
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "2025-2026" }), 2))
      .toEqual({});
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "My next season" }), 2)
      .plannedSeason).toBe("invalidSeasonFormat");
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "2024-2026" }), 2)
      .plannedSeason).toBe("invalidSeasonFormat");
    expect(validateParcelStep(draft({ recentCrop: "wheat", recentCropSeason: "2024/2025" }), 2)
      .recentCropSeason).toBe("invalidSeasonFormat");
  });

  it("does not require a crop name or pretend to validate a crop catalog", () => {
    expect(validateParcelStep(draft({ recentCrop: "farmer's own crop note" }), 2)).toEqual({});
    expect(validateParcelStep(draft({ recentCropSeason: "last year" }), 2).recentCrop)
      .toBe("cropRequiredForSeason");
    expect(validateParcelStep(draft({ earlierCropSeason: "previous" }), 2).earlierCrop)
      .toBe("cropRequiredForSeason");
  });

  it("rejects overly long manually supplied values", () => {
    expect(validateParcelStep(draft({ parcelName: "x".repeat(61) }), 0).parcelName)
      .toBe("tooLongName");
    expect(validateParcelStep(draft({ recentCrop: "x".repeat(81) }), 2).recentCrop)
      .toBe("tooLongCrop");
    expect(validateParcelStep(draft({ seasonChoice: "known", plannedSeason: "x".repeat(41) }), 2).plannedSeason)
      .toBe("tooLongSeason");
  });

  it("rechecks all steps, not just the visible one", () => {
    expect(firstInvalidStep(draft({ zone: "" }))).toBe(0);
    expect(firstInvalidStep(draft({ irrigation: "" }))).toBe(1);
    expect(firstInvalidStep(draft({ seasonChoice: "" }))).toBe(2);
    expect(firstInvalidStep(draft())).toBeNull();
  });
});
