import { describe, expect, it } from "vitest";
import { appNavFocusRing, appNavStampedChipRing } from "./types";

describe("AppNav register tokens", () => {
  it("maps kid register to green and parent to purple stamped chip rings", () => {
    expect(appNavStampedChipRing("kid")).toBe("green");
    expect(appNavStampedChipRing("parent")).toBe("purple");
  });

  it("maps kid register to green and parent to purple focus rings", () => {
    expect(appNavFocusRing("kid")).toContain("ring-green");
    expect(appNavFocusRing("parent")).toContain("ring-purple");
  });
});
