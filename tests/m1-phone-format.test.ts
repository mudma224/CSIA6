import { describe, expect, it } from "vitest";
import { checkMoroccanPhoneFormat } from "@/features/m1/phoneFormat";

describe("M1 phone format guidance (not authentication)", () => {
  it("returns empty for missing input", () => {
    expect(checkMoroccanPhoneFormat("  ")).toBe("empty");
  });
  it("recognizes local mobile formatting", () => {
    expect(checkMoroccanPhoneFormat("06 12 34 56 78")).toBe("valid");
    expect(checkMoroccanPhoneFormat("0712345678")).toBe("valid");
  });
  it("recognizes +212 mobile formatting", () => {
    expect(checkMoroccanPhoneFormat("+212 6 12 34 56 78")).toBe("valid");
  });
  it("rejects landlines, missing digits and text", () => {
    expect(checkMoroccanPhoneFormat("0512345678")).toBe("invalid");
    expect(checkMoroccanPhoneFormat("0612345")).toBe("invalid");
    expect(checkMoroccanPhoneFormat("hello")).toBe("invalid");
  });
});
