import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("M0 visual source", () => {
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

  it("preserves key approved palette tokens", () => {
    expect(css).toContain("--forest: #193D2B");
    expect(css).toContain("--leaf: #39794F");
    expect(css).toContain("--canvas: #F5F6EF");
    expect(css).toContain("--harvest: #D9A44B");
  });

  it("includes keyboard focus and reduced-motion support", () => {
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
