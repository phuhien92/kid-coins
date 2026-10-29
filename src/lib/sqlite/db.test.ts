// @vitest-environment node
import { afterEach, beforeEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { eq } from "drizzle-orm";
import { migrateSqlite, openSqlite } from "./db";
import * as s from "./schema";

let directory: string;
let path: string;
let connection: ReturnType<typeof openSqlite>;
const migrations = resolve("drizzle-sqlite");
const familyId = "00000000-0000-4000-8000-000000000001";
const kidId = "00000000-0000-4000-8000-000000000002";
const instant = new Date("2026-01-02T03:04:05.678Z");

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "earnie-sqlite-"));
  path = join(directory, "fixture.sqlite");
  migrateSqlite(path, migrations);
  connection = openSqlite(path);
  connection.db.insert(s.families).values({ id: familyId, parentUserId: "auth-uid", name: "Family", parentPinHash: "synthetic-parent-hash", createdAt: instant }).run();
  connection.db.insert(s.kidProfiles).values({ id: kidId, familyId, name: "Kid", pinHash: "synthetic-kid-hash", balance: 100, createdAt: instant }).run();
});
afterEach(() => {
  connection.close();
  rmSync(directory, { recursive: true, force: true });
});

it("persists IDs, hashes, milliseconds, JSON, booleans and jar interest state across reopen and migration replay", () => {
  const { db } = connection;
  db.insert(s.familySettings).values({ familyId, requireTaskApproval: false }).run();
  db.insert(s.jars).values({ kidId, type: "save", balance: 25, lastInterestAt: instant }).run();
  db.insert(s.activityLog).values({ familyId, kidId, type: "coins_allocated", payload: { amount: 25, nested: [true, "🎁"] } }).run();
  connection.close();
  migrateSqlite(path, migrations);
  connection = openSqlite(path);
  expect(connection.db.select().from(s.kidProfiles).get()).toMatchObject({ id: kidId, balance: 100, pinHash: "synthetic-kid-hash", createdAt: instant });
  expect(connection.db.select().from(s.families).get()).toMatchObject({ parentUserId: "auth-uid", parentPinHash: "synthetic-parent-hash" });
  expect(connection.db.select().from(s.jars).get()).toMatchObject({ balance: 25, lastInterestAt: instant });
  expect(connection.db.select().from(s.activityLog).get()?.payload).toEqual({ amount: 25, nested: [true, "🎁"] });
  expect(connection.db.select().from(s.familySettings).get()).toMatchObject({ requireTaskApproval: false, quietHours: false, requireRedemptionApproval: true, saveInterestBps: 500 });
  const [task] = connection.db.insert(s.tasks).values({ kidId, title: "Read" }).returning().all();
  expect(task).toMatchObject({ type: "daily", coinReward: 10, isActive: true, scheduledStartAt: null });
  expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
  expect(task.createdAt).toBeInstanceOf(Date);
  expect(connection.client.pragma("foreign_keys", { simple: true })).toBe(1);
  expect(connection.client.pragma("journal_mode", { simple: true })).toBe("wal");
});

it("enforces foreign keys, unique jars, enum values, nonnegative balances and stock", () => {
  const { db, client } = connection;
  expect(() => db.insert(s.jars).values({ kidId: "missing", type: "give" }).run()).toThrow();
  db.insert(s.jars).values({ kidId, type: "give" }).run();
  expect(() => db.insert(s.jars).values({ kidId, type: "give" }).run()).toThrow();
  const task = db.insert(s.tasks).values({ kidId, title: "Read" }).returning().get();
  const reward = db.insert(s.rewards).values({ familyId, title: "Book", coinCost: 5, quantity: 1 }).returning().get();
  db.insert(s.taskCompletions).values({ kidId, taskId: task.id, coinsEarned: 10 }).run();
  db.insert(s.redemptionRequests).values({ kidId, rewardId: reward.id, coinsSpent: 5 }).run();
  db.insert(s.coinTransactions).values({ kidId, type: "interest", amount: 1, description: "Interest" }).run();
  db.insert(s.activityLog).values({ familyId, kidId, type: "interest_paid" }).run();
  for (const query of [
    "update kid_profiles set balance = -1",
    "update jars set balance = -1",
    "update jars set type = 'spend'",
    "update tasks set type = 'weekly'",
    "update rewards set quantity = -1",
    "update rewards set quantity_used = -1",
    "update task_completions set status = 'invalid'",
    "update redemption_requests set status = 'invalid'",
    "update coin_transactions set type = 'invalid'",
    "update activity_log set type = 'invalid'",
    "update activity_log set payload = 'invalid json'",
  ]) expect(() => client.exec(query)).toThrow();
  expect(db.select().from(s.kidProfiles).get()?.balance).toBe(100);
});

it("accepts a reward whose quantity was lowered below quantity already used", () => {
  const { db } = connection;
  const reward = db.insert(s.rewards).values({ familyId, title: "Book", coinCost: 5, quantity: 5, quantityUsed: 5 }).returning().get();
  db.update(s.rewards).set({ quantity: 2 }).where(eq(s.rewards.id, reward.id)).run();
  expect(db.select().from(s.rewards).get()).toMatchObject({ quantity: 2, quantityUsed: 5 });
});

it("rolls back failed transactions and preserves cascade/set-null relationships", () => {
  const { db } = connection;
  expect(() => db.transaction((tx) => {
    tx.update(s.families).set({ name: "Rolled back" }).where(eq(s.families.id, familyId)).run();
    tx.insert(s.jars).values({ kidId: "missing", type: "save" }).run();
  }, { behavior: "immediate" })).toThrow();
  expect(db.select().from(s.families).get()?.name).toBe("Family");
  db.insert(s.activityLog).values({ familyId, kidId, type: "kid_added" }).run();
  db.insert(s.jars).values({ kidId, type: "save" }).run();
  db.delete(s.kidProfiles).where(eq(s.kidProfiles.id, kidId)).run();
  expect(db.select().from(s.jars).all()).toEqual([]);
  expect(db.select().from(s.activityLog).get()?.kidId).toBeNull();
  db.delete(s.families).where(eq(s.families.id, familyId)).run();
  expect(db.select().from(s.activityLog).all()).toEqual([]);
});

it("requires an absolute disk path and closes cleanly after a migration failure", () => {
  expect(() => openSqlite("relative.sqlite")).toThrow("absolute");
  expect(() => openSqlite(":memory:")).toThrow("absolute");
  expect(() => migrateSqlite(path, join(directory, "missing-migrations"))).toThrow();
  const reopened = openSqlite(path);
  reopened.close();
});
