import { describe, expect, it } from "vitest";
import { m4Messages } from "@/i18n/m4Messages";
import {
  emptyCommunityDraft, formatLocalPreviewText,
  isPositiveDecimalInput, validateCommunityDraft,
} from "@/features/m4/communityDraft";

const en = (key: keyof typeof m4Messages.en) => m4Messages.en[key];

function experienceDraft() {
  return {
    ...emptyCommunityDraft(), kind: "experience" as const,
    title: "My farm note", description: "A short local experiment.",
  };
}

describe("M4 presentation-only community draft", () => {
  it("starts with no post kind or invented data", () => {
    const draft = emptyCommunityDraft();
    expect(draft.kind).toBe("");
    expect(draft.crop).toBe("");
    expect(draft.price).toBe("");
    expect(validateCommunityDraft(draft)).toEqual({ kind: "required" });
  });

  it("requires experience title and description", () => {
    expect(validateCommunityDraft({ ...emptyCommunityDraft(), kind: "experience" }))
      .toEqual({ description: "required", title: "required" });
    expect(validateCommunityDraft(experienceDraft())).toEqual({});
  });

  it("requires sale crop, positive quantity, unit and description", () => {
    expect(validateCommunityDraft({ ...emptyCommunityDraft(), kind: "sale" }))
      .toEqual({ description: "required", crop: "required", quantity: "quantity", unit: "required" });
  });

  it("accepts an explicitly unknown unit, not a silently defaulted one", () => {
    const draft = {
      ...emptyCommunityDraft(), kind: "sale" as const,
      description: "A local offer draft", crop: "My crop",
      quantity: "12", unit: "unknown" as const,
    };
    expect(validateCommunityDraft(draft)).toEqual({});
    expect(formatLocalPreviewText(draft, en)).toContain("I don't know the unit");
  });

  it("checks numeric input as a usability hint, not a market calculation", () => {
    for (const value of ["10", "12.5", "12,5", "0.25", " 2 "]) {
      expect(isPositiveDecimalInput(value)).toBe(true);
    }
    for (const value of ["", "0", "-5", "1e8", "abc", "2..5", "5 000"]) {
      expect(isPositiveDecimalInput(value)).toBe(false);
    }
  });

  it("rejects optional price only when a malformed value was entered", () => {
    const base = {
      ...emptyCommunityDraft(), kind: "sale" as const,
      crop: "Farmer description", description: "Offer preview",
      quantity: "5", unit: "kg" as const,
    };
    expect(validateCommunityDraft({ ...base, price: "" })).toEqual({});
    expect(validateCommunityDraft({ ...base, price: "-3" })).toEqual({ price: "price" });
    expect(validateCommunityDraft({ ...base, price: "25.5" })).toEqual({});
  });

  it("requires broad area and purpose for partnership, not coordinates", () => {
    expect(validateCommunityDraft({ ...emptyCommunityDraft(), kind: "partnership" }))
      .toEqual({ description: "required", purpose: "required", partnershipArea: "required" });
    expect(validateCommunityDraft({
      ...emptyCommunityDraft(), kind: "partnership",
      purpose: "Explore equipment sharing", partnershipArea: "Béni Amir",
      description: "A local conversation preview",
    })).toEqual({});
  });

  it("formats only selected user fields and marks copied content local", () => {
    const preview = formatLocalPreviewText(experienceDraft(), en);
    expect(preview).toContain("Local demo only");
    expect(preview).toContain("My farm note");
    expect(preview).not.toMatch(/https?:\/\/|latitude|longitude|user id/i);
    expect(formatLocalPreviewText(emptyCommunityDraft(), en)).toBe("");
  });

  it("keeps Darija and English message keys identical", () => {
    expect(Object.keys(m4Messages.en).sort()).toEqual(Object.keys(m4Messages.ary).sort());
    expect(m4Messages.ary.communityHeading).not.toBe(m4Messages.en.communityHeading);
  });
});
