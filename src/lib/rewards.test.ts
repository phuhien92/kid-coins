import { describe, it, expect } from "vitest";
import type { Tx } from "./kid-balance";
import {
  claimRewardStock,
  getRemainingStock,
  hasRewardStock,
  shouldDeactivateReward,
} from "./rewards";

type Claimed = { quantity: number | null; quantityUsed: number };

/** Stands in for a transaction whose guarded UPDATE returns `claimed`. */
function fakeTx(claimed: Claimed[]) {
  const sets: Record<string, unknown>[] = [];
  const tx = {
    update: () => ({
      set: (values: Record<string, unknown>) => {
        sets.push(values);
        return {
          where: () =>
            Object.assign(Promise.resolve(undefined), {
              returning: async () => claimed,
            }),
        };
      },
    }),
  } as unknown as Tx;

  return { tx, sets };
}

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

describe("claimRewardStock", () => {
  it("reports failure when the guarded update matches no row", async () => {
    // The reward sold out after the caller's advisory check: the loser of a
    // concurrent claim matches nothing, so it must not be told it took a unit.
    const { tx, sets } = fakeTx([]);

    await expect(claimRewardStock(tx, "reward-1")).resolves.toBe(false);
    expect(sets).toHaveLength(1);
    expect(sets[0]).not.toHaveProperty("isActive");
  });

  it("takes a unit and deactivates the reward once the last one is gone", async () => {
    const { tx, sets } = fakeTx([{ quantity: 3, quantityUsed: 3 }]);

    await expect(claimRewardStock(tx, "reward-1")).resolves.toBe(true);
    expect(sets).toContainEqual({ isActive: false });
  });

  it("takes a unit and leaves the reward active while stock remains", async () => {
    const { tx, sets } = fakeTx([{ quantity: 3, quantityUsed: 1 }]);

    await expect(claimRewardStock(tx, "reward-1")).resolves.toBe(true);
    expect(sets).toHaveLength(1);
  });

  it("always succeeds for an unlimited reward", async () => {
    const { tx, sets } = fakeTx([{ quantity: null, quantityUsed: 99 }]);

    await expect(claimRewardStock(tx, "reward-1")).resolves.toBe(true);
    expect(sets).toHaveLength(1);
  });
});
