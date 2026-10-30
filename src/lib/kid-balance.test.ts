// @vitest-environment node
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { eq } from "drizzle-orm";
import { kidProfiles, redemptionRequests } from "@/lib/sqlite/schema";
import { createTestSqlite, seedFamily, type TestSqlite } from "@/test/sqlite";

const current = vi.hoisted(() => ({ database: undefined as TestSqlite | undefined }));
vi.mock("@/lib/db", () => ({
  get db() {
    return current.database!.db;
  },
}));

import {
  getKidEffectiveBalance,
  creditBalance,
  debitBalance,
  debitBalanceIfAffordable,
} from "./kid-balance";

// Seeded kid: balance 100 with one pending 30-coin redemption.
let database: TestSqlite;
let kidId: string;
beforeEach(() => {
  database = current.database = createTestSqlite();
  kidId = seedFamily(database.db, 1).kid;
});
afterEach(() => database.cleanup());

const balance = () => database.db.select().from(kidProfiles).where(eq(kidProfiles.id, kidId)).get()?.balance;

describe("getKidEffectiveBalance", () => {
  it("returns null when kid is missing", async () => {
    await expect(getKidEffectiveBalance("missing")).resolves.toBeNull();
  });

  it("subtracts only pending redemption reservations", async () => {
    await expect(getKidEffectiveBalance(kidId)).resolves.toBe(70);
    database.db.update(redemptionRequests).set({ status: "approved" }).run();
    await expect(getKidEffectiveBalance(kidId)).resolves.toBe(100);
  });
});

describe("balance writes", () => {
  it("credits atomically in SQL", () => {
    database.db.transaction((tx) => creditBalance(tx, kidId, 25));
    expect(balance()).toBe(125);
  });

  it("debits with a floor of zero", () => {
    database.db.transaction((tx) => debitBalance(tx, kidId, 30));
    expect(balance()).toBe(70);
    database.db.transaction((tx) => debitBalance(tx, kidId, 500));
    expect(balance()).toBe(0);
  });

  it("debits only what the kid can still afford", () => {
    const spend = (amount: number) => database.db.transaction((tx) => debitBalanceIfAffordable(tx, kidId, amount));
    expect(spend(60)).toBe(true);
    expect(spend(60)).toBe(false);
    expect(balance()).toBe(40);
    expect(spend(40)).toBe(true);
    expect(balance()).toBe(0);
  });
});
