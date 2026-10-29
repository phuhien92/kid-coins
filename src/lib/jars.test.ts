// @vitest-environment node
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { and, eq } from "drizzle-orm";
import { jars, kidProfiles } from "@/lib/sqlite/schema";
import { createTestSqlite, seedFamily, type TestSqlite } from "@/test/sqlite";
import {
  calculateInterest,
  weeksElapsed,
  allocateToJar,
  withdrawFromSaveJar,
  WEEK_MS,
} from "./jars";

describe("weeksElapsed", () => {
  const base = new Date("2026-01-01T00:00:00Z");

  it("returns 0 for the same instant or a past 'to'", () => {
    expect(weeksElapsed(base, base)).toBe(0);
    expect(weeksElapsed(base, new Date(base.getTime() - WEEK_MS))).toBe(0);
  });

  it("counts only whole weeks, discarding the remainder", () => {
    expect(weeksElapsed(base, new Date(base.getTime() + WEEK_MS - 1))).toBe(0);
    expect(weeksElapsed(base, new Date(base.getTime() + WEEK_MS))).toBe(1);
    expect(weeksElapsed(base, new Date(base.getTime() + 3 * WEEK_MS + 5))).toBe(3);
  });
});

describe("calculateInterest", () => {
  it("is zero when balance, rate, or weeks are non-positive", () => {
    expect(calculateInterest(0, 500, 4)).toBe(0);
    expect(calculateInterest(100, 0, 4)).toBe(0);
    expect(calculateInterest(100, 500, 0)).toBe(0);
    expect(calculateInterest(-50, 500, 4)).toBe(0);
  });

  it("floors each week, so a balance too small to earn a coin never grows", () => {
    // 5% of 19 = 0.95 → floors to 0 every week.
    expect(calculateInterest(19, 500, 10)).toBe(0);
  });

  it("compounds week over week", () => {
    // 100 @ 5%/wk: 100→105→110 (floor(105*.05)=5) → interest = 10 over 2 weeks.
    expect(calculateInterest(100, 500, 2)).toBe(10);
    // Single week is a plain floored percentage.
    expect(calculateInterest(100, 500, 1)).toBe(5);
  });
});

describe("jar moves", () => {
  // Seeded kid: Spend 100, Save 40, Give 0.
  let database: TestSqlite;
  let kidId: string;
  beforeEach(() => {
    database = createTestSqlite();
    kidId = seedFamily(database.db, 1).kid;
  });
  afterEach(() => database.cleanup());

  const balances = () => ({
    spend: database.db.select().from(kidProfiles).where(eq(kidProfiles.id, kidId)).get()?.balance,
    save: database.db.select().from(jars).where(and(eq(jars.kidId, kidId), eq(jars.type, "save"))).get()?.balance,
    give: database.db.select().from(jars).where(and(eq(jars.kidId, kidId), eq(jars.type, "give"))).get()?.balance,
  });
  const allocate = (type: "save" | "give", amount: number) =>
    database.db.transaction((tx) => allocateToJar(tx, kidId, type, amount));
  const withdraw = (amount: number) => database.db.transaction((tx) => withdrawFromSaveJar(tx, kidId, amount));

  it("rejects non-positive amounts without touching balances", () => {
    expect(allocate("save", 0)).toBeNull();
    expect(withdraw(-5)).toBeNull();
    expect(balances()).toEqual({ spend: 100, save: 40, give: 0 });
  });

  it("moves Spend into a jar and reports the post-move balances", () => {
    expect(allocate("give", 25)).toEqual({ spend: 75, jarBalance: 25 });
    expect(balances()).toEqual({ spend: 75, save: 40, give: 25 });
  });

  it("refuses an allocation Spend cannot afford, leaving both balances intact", () => {
    expect(allocate("save", 101)).toBeNull();
    expect(balances()).toEqual({ spend: 100, save: 40, give: 0 });
  });

  it("rolls the Spend debit back when the jar row is missing", () => {
    database.db.delete(jars).where(and(eq(jars.kidId, kidId), eq(jars.type, "give"))).run();
    expect(() => allocate("give", 10)).toThrow(/Missing give jar/);
    expect(balances().spend).toBe(100);
  });

  it("withdraws from Save into Spend only while Save holds the coins", () => {
    expect(withdraw(40)).toEqual({ spend: 140, jarBalance: 0 });
    expect(withdraw(1)).toBeNull();
    expect(balances()).toEqual({ spend: 140, save: 0, give: 0 });
  });
});
