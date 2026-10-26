import { describe, it, expect } from "vitest";
import { MASCOT_ART, STEPS, getStep } from "./brand";

describe("brand story", () => {
  it("tells the five steps in order", () => {
    expect(STEPS.map((s) => s.name)).toEqual(["Do", "Earn", "Save", "Choose", "Grow"]);
    expect(STEPS.map((s) => s.number)).toEqual([1, 2, 3, 4, 5]);
  });

  it("looks a step up by id and rejects unknown ids", () => {
    expect(getStep("choose").headline).toBe("Learn through decisions.");
    // @ts-expect-error — unknown id
    expect(() => getStep("spend")).toThrow();
  });

  it("gives every mascot slot alt text", () => {
    for (const art of Object.values(MASCOT_ART)) {
      expect(art.alt.length).toBeGreaterThan(10);
    }
  });
});
