import { describe, it, expect } from "vitest";
import { contrastRatio, luminance } from "./contrast";

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
    // #767676 on white is the classic 4.54:1 AA boundary grey.
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#0B1A3A", "#F5B800")).toBeCloseTo(contrastRatio("#F5B800", "#0B1A3A"), 10);
  });

  it("rejects non-hex colours instead of guessing", () => {
    expect(() => luminance("rgba(0,0,0,.1)")).toThrow();
  });
});
