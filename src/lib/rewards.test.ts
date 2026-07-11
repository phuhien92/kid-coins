import { describe, it, expect } from "vitest";
import {
  getRemainingStock,
  hasRewardStock,
  shouldDeactivateReward,
} from "./rewards";

describe("reward stock helpers", () => {
  it("treats null quantity as unlimited", () => {
    expect(getRemainingStock(null, 5)).toBeNull();
    expect(hasRewardStock(null, 99)).toBe(true);
    expect(shouldDeactivateReward(null, 99)).toBe(false);
  });

  it("computes remaining stock", () => {
    expect(getRemainingStock(3, 1)).toBe(2);
    expect(hasRewardStock(3, 3)).toBe(false);
    expect(shouldDeactivateReward(3, 3)).toBe(true);
  });
});
