// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { migrateSqlite, openSqlite } from "./db";
import * as s from "./schema";
import {
  buildTransferFile, importTransferFile, readTransferFile, TRANSFER_TABLES, writeTransferFile,
  type TransferTable,
} from "./transfer";

const migrations = resolve("drizzle-sqlite");
const ids = Object.fromEntries(
  ["family", "kid", "task", "reward", "other"].map((key, i) => [key, `00000000-0000-4000-8000-00000000000${i + 1}`]),
);
const created = new Date("2026-01-02T03:04:05.678Z");
const later = new Date("2026-02-03T04:05:06.789Z");
const uid = (n: number) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** Synthetic source rows shaped like Drizzle Postgres selects: Dates, booleans, JSON. */
function sourceRows(): Record<TransferTable, Record<string, unknown>[]> {
  const kidId = ids.kid;
  return {
    families: [{ id: ids.family, parentUserId: "synthetic-auth-uid", name: "Fixture", parentPinHash: "$2b$10$parenthash", createdAt: created }],
    familySettings: [{ id: uid(1), familyId: ids.family, requireTaskApproval: false, requireRedemptionApproval: true, weeklyAiSummary: false, quietHours: true, saveInterestBps: 250, updatedAt: later }],
    kidProfiles: [{ id: kidId, familyId: ids.family, name: "Kid", avatarColor: "#000000", pinHash: "$2b$10$kidhash", balance: 140, createdAt: created }],
    characters: [{ id: uid(2), kidId, color: "blue", hat: "cap", eye: "wink", extra: "none", bg: "sky", outfit: "cape", updatedAt: later }],
    jars: [
      { id: uid(3), kidId, type: "save", balance: 60, lastInterestAt: later, createdAt: created },
      { id: uid(4), kidId, type: "give", balance: 0, lastInterestAt: null, createdAt: created },
    ],
    tasks: [{ id: ids.task, kidId, title: "Read", emoji: "📚", type: "once", coinReward: 15, scheduledStartAt: later, durationDays: 3, isActive: false, createdAt: created }],
    taskCompletions: [{ id: uid(5), taskId: ids.task, kidId, coinsEarned: 15, paymentPercent: 50, bonusCoins: 2, status: "approved", rejectionReason: null, completedAt: created, resolvedAt: later }],
    coinTransactions: [{ id: uid(6), kidId, type: "interest", amount: 3, description: "Weekly interest", createdAt: later }],
    // Stock below quantityUsed is a valid state today (parent lowered quantity after redemptions).
    rewards: [{ id: ids.reward, familyId: ids.family, title: "Book", description: null, coinCost: 30, emoji: "🎁", quantity: 1, quantityUsed: 2, isActive: true, createdAt: created }],
    redemptionRequests: [{ id: uid(7), kidId, rewardId: ids.reward, status: "pending", coinsSpent: 30, rejectionReason: null, createdAt: later, resolvedAt: null }],
    goals: [{ id: uid(8), kidId, title: "Bike", targetAmount: 500, emoji: "🚲", isActive: true, createdAt: created }],
    streaks: [{ id: uid(9), kidId, currentStreak: 2, longestStreak: 7, lastCompletedDate: later }],
    badges: [{ id: uid(10), kidId, slug: "first-task", earnedAt: created }],
    activityLog: [
      { id: uid(11), familyId: ids.family, kidId, type: "interest_paid", payload: { amount: 3, nested: [true, "🎁"] }, createdAt: later },
      { id: uid(12), familyId: ids.family, kidId: null, type: "kid_added", payload: null, createdAt: created },
    ],
  };
}

let directory: string;
let target: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "earnie-transfer-"));
  target = join(directory, "family.sqlite");
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));

const exported = () => JSON.parse(JSON.stringify(buildTransferFile(sourceRows(), later)));

it("round-trips every table through an export file with IDs, hashes, balances, dates and relationships intact", () => {
  const file = join(directory, "family.export.json");
  writeTransferFile(file, buildTransferFile(sourceRows(), later));
  expect(statSync(file).mode & 0o777).toBe(0o600);
  const counts = importTransferFile(readTransferFile(file), target, migrations);
  expect(counts).toMatchObject({ families: 1, jars: 2, activityLog: 2, rewards: 1 });

  const connection = openSqlite(target);
  try {
    const source = sourceRows();
    for (const name of Object.keys(TRANSFER_TABLES) as TransferTable[]) {
      const rows = connection.db.select().from(TRANSFER_TABLES[name]).all();
      expect(rows).toEqual(expect.arrayContaining(source[name].map((row) => expect.objectContaining(row))));
      expect(rows).toHaveLength(source[name].length);
    }
    expect(connection.client.pragma("foreign_key_check")).toEqual([]);
  } finally {
    connection.close();
  }
  expect(readdirSync(directory).sort()).toEqual(["family.export.json", "family.sqlite"]);
});

it("refuses to overwrite an existing export file", () => {
  const file = join(directory, "family.export.json");
  writeFileSync(file, "keep");
  expect(() => writeTransferFile(file, buildTransferFile(sourceRows()))).toThrow(/Refusing to overwrite/);
  expect(readFileSync(file, "utf8")).toBe("keep");
});

describe("import target protection", () => {
  it("refuses an existing database and leaves it untouched", () => {
    migrateSqlite(target, migrations);
    const connection = openSqlite(target);
    connection.db.insert(s.families).values({ id: ids.other, parentUserId: "existing", name: "Existing" }).run();
    connection.close();
    expect(() => importTransferFile(exported(), target, migrations)).toThrow(/Refusing to overwrite/);
    const reopened = openSqlite(target);
    expect(reopened.db.select().from(s.families).all()).toEqual([expect.objectContaining({ id: ids.other })]);
    reopened.close();
  });

  it("refuses when only a WAL sidecar remains at the target", () => {
    writeFileSync(`${target}-wal`, "");
    expect(() => importTransferFile(exported(), target, migrations)).toThrow(/-wal/);
    expect(existsSync(target)).toBe(false);
  });

  it("requires an absolute target path", () => {
    expect(() => importTransferFile(exported(), "relative.sqlite", migrations)).toThrow(/absolute/);
  });
});

describe("invalid imports roll back completely", () => {
  const cases: [string, (file: ReturnType<typeof exported>) => void, RegExp][] = [
    ["wrong format", (f) => { f.format = "other"; }, /format/],
    ["unsupported version", (f) => { f.version = 2; }, /version/],
    ["unknown table", (f) => { f.tables.sessions = []; }, /unknown tables sessions/],
    ["missing table", (f) => { delete f.tables.badges; }, /badges must be an array/],
    ["unknown column", (f) => { f.tables.kidProfiles[0].extra = 1; }, /unknown columns extra/],
    ["missing column", (f) => { delete f.tables.kidProfiles[0].pinHash; }, /missing columns pinHash/],
    ["null in required column", (f) => { f.tables.kidProfiles[0].pinHash = null; }, /pinHash must not be null/],
    ["fractional balance", (f) => { f.tables.kidProfiles[0].balance = 1.5; }, /balance must be an integer/],
    ["string boolean", (f) => { f.tables.tasks[0].isActive = "false"; }, /isActive must be a boolean/],
    ["non-UTC date", (f) => { f.tables.families[0].createdAt = "2026-01-02 03:04:05"; }, /UTC instant/],
    // The rest pass shape validation and fail inside the SQLite transaction after earlier rows were inserted.
    ["negative balance", (f) => { f.tables.jars[0].balance = -1; }, /CHECK constraint/],
    ["unknown enum value", (f) => { f.tables.redemptionRequests[0].status = "paid"; }, /CHECK constraint/],
    ["dangling relationship", (f) => { f.tables.activityLog[1].familyId = ids.other; }, /FOREIGN KEY/],
    ["duplicate id", (f) => { f.tables.badges.push({ ...f.tables.badges[0] }); }, /UNIQUE/],
  ];

  it.each(cases)("%s", (_, mutate, error) => {
    const file = exported();
    mutate(file);
    expect(() => importTransferFile(file, target, migrations)).toThrow(error);
    expect(readdirSync(directory)).toEqual([]);
  });
});
