// @vitest-environment node
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { rewards } from "@/lib/sqlite/schema";
import { createTestSqlite, seedFamily, type TestSqlite } from "@/test/sqlite";
import {
  claimRewardStock,
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

describe("claimRewardStock", () => {
  let database: TestSqlite;
  let ids: ReturnType<typeof seedFamily>;
  beforeEach(() => {
    database = createTestSqlite();
    ids = seedFamily(database.db, 1);
  });
  afterEach(() => database.cleanup());

  const reward = () => database.db.select().from(rewards).where(eq(rewards.id, ids.reward)).get();
  const setStock = (quantity: number | null, quantityUsed: number) =>
    database.db.update(rewards).set({ quantity, quantityUsed }).where(eq(rewards.id, ids.reward)).run();
  const claim = () => database.db.transaction((tx) => claimRewardStock(tx, ids.reward));

  it("takes the last unit once, deactivates the reward, then reports sold out", () => {
    expect(claim()).toBe(true);
    expect(reward()).toMatchObject({ quantityUsed: 1, isActive: false });
    expect(claim()).toBe(false);
    expect(reward()?.quantityUsed).toBe(1);
  });

  it("takes a unit and leaves the reward active while stock remains", () => {
    setStock(3, 1);
    expect(claim()).toBe(true);
    expect(reward()).toMatchObject({ quantityUsed: 2, isActive: true });
  });

  it("refuses stock already lowered below what was used", () => {
    setStock(1, 2);
    expect(claim()).toBe(false);
    expect(reward()?.quantityUsed).toBe(2);
  });

  it("always succeeds for an unlimited reward", () => {
    setStock(null, 7);
    expect(claim()).toBe(true);
    expect(reward()).toMatchObject({ quantityUsed: 8, isActive: true });
  });
});
