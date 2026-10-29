import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { migrateSqlite, openSqlite } from "@/lib/sqlite/db";
import * as s from "@/lib/sqlite/schema";

/** A migrated SQLite database in its own temporary directory; `cleanup` closes and deletes it. */
export function createTestSqlite() {
  const directory = mkdtempSync(join(tmpdir(), "earnie-test-"));
  const path = join(directory, "test.sqlite");
  migrateSqlite(path, resolve("drizzle-sqlite"));
  const connection = openSqlite(path);
  return {
    ...connection,
    path,
    cleanup() {
      connection.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

export type TestSqlite = ReturnType<typeof createTestSqlite>;

/** Deterministic synthetic family: one kid with jars, a pending task completion and a pending redemption. */
export function seedFamily(db: TestSqlite["db"], n: number, kidBalance = 100) {
  const id = (k: number) => `00000000-0000-4000-8000-${String(n * 100 + k).padStart(12, "0")}`;
  const ids = {
    family: id(1), kid: id(2), task: id(3), completion: id(4), reward: id(5), redemption: id(6),
  };
  db.insert(s.families).values({ id: ids.family, parentUserId: `parent-${n}`, name: `Family ${n}` }).run();
  db.insert(s.familySettings).values({ familyId: ids.family, saveInterestBps: 500 }).run();
  db.insert(s.kidProfiles).values({ id: ids.kid, familyId: ids.family, name: `Kid ${n}`, pinHash: "synthetic-hash", balance: kidBalance }).run();
  db.insert(s.jars).values([{ kidId: ids.kid, type: "save", balance: 40 }, { kidId: ids.kid, type: "give", balance: 0 }]).run();
  db.insert(s.tasks).values({ id: ids.task, kidId: ids.kid, title: `Task ${n}`, coinReward: 10 }).run();
  db.insert(s.taskCompletions).values({ id: ids.completion, taskId: ids.task, kidId: ids.kid, coinsEarned: 10 }).run();
  db.insert(s.rewards).values({ id: ids.reward, familyId: ids.family, title: `Reward ${n}`, coinCost: 30, quantity: 1 }).run();
  db.insert(s.redemptionRequests).values({ id: ids.redemption, kidId: ids.kid, rewardId: ids.reward, coinsSpent: 30 }).run();
  return ids;
}
