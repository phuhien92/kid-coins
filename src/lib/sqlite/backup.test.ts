// @vitest-environment node
import { afterEach, beforeEach, expect, it } from "vitest";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { eq } from "drizzle-orm";
import { backupSqlite, verifySqlite } from "./backup";
import { openSqlite } from "./db";
import * as s from "./schema";
import { createTestSqlite, seedFamily, type TestSqlite } from "@/test/sqlite";

let app: TestSqlite;
let out: string;
let kidId: string;
beforeEach(() => {
  app = createTestSqlite();
  kidId = seedFamily(app.db, 1).kid;
  out = mkdtempSync(join(tmpdir(), "earnie-backup-"));
});
afterEach(() => {
  app.cleanup();
  rmSync(out, { recursive: true, force: true });
});

const balanceIn = (path: string) => {
  const copy = openSqlite(path);
  try {
    return copy.db.select().from(s.kidProfiles).where(eq(s.kidProfiles.id, kidId)).get()?.balance;
  } finally {
    copy.close();
  }
};

it("copies a running database, including writes still in its WAL, to one private verified file", () => {
  app.client.pragma("wal_autocheckpoint = 0");
  app.db.update(s.kidProfiles).set({ balance: 321 }).where(eq(s.kidProfiles.id, kidId)).run();
  expect(statSync(`${app.path}-wal`).size).toBeGreaterThan(0);

  const target = join(out, "earnie.backup.sqlite");
  backupSqlite(app.path, target);

  expect(readdirSync(out)).toEqual(["earnie.backup.sqlite"]);
  expect(statSync(target).mode & 0o777).toBe(0o600);
  expect(() => verifySqlite(target)).not.toThrow();
  expect(balanceIn(target)).toBe(321);
  // The app keeps working on its own file.
  app.db.update(s.kidProfiles).set({ balance: 5 }).where(eq(s.kidProfiles.id, kidId)).run();
  expect(balanceIn(target)).toBe(321);
});

it("restores a backup into a new location the app can open", () => {
  const backup = join(out, "earnie.backup.sqlite");
  backupSqlite(app.path, backup);
  const restored = join(out, "restored.sqlite");
  backupSqlite(backup, restored);
  expect(balanceIn(restored)).toBe(100);
});

it("leaves a stopped source as a single file", () => {
  app.close();
  backupSqlite(app.path, join(out, "copy.sqlite"));
  expect(readdirSync(dirname(app.path))).toEqual(["test.sqlite"]);
});

it("refuses an existing target or sidecar and leaves it untouched", () => {
  for (const name of ["taken.sqlite", "sidecar.sqlite-wal"]) writeFileSync(join(out, name), "keep");
  expect(() => backupSqlite(app.path, join(out, "taken.sqlite"))).toThrow(/Refusing to overwrite/);
  expect(() => backupSqlite(app.path, join(out, "sidecar.sqlite"))).toThrow(/Refusing to overwrite/);
  expect(readFileSync(join(out, "taken.sqlite"), "utf8")).toBe("keep");
  expect(readdirSync(out).sort()).toEqual(["sidecar.sqlite-wal", "taken.sqlite"]);
});

it("publishes nothing when the source is not a valid database", () => {
  const broken = join(out, "broken.sqlite");
  writeFileSync(broken, "not a database file at all, just synthetic bytes".repeat(100));
  expect(() => backupSqlite(broken, join(out, "copy.sqlite"))).toThrow();
  expect(readdirSync(out)).toEqual(["broken.sqlite"]);
  expect(() => backupSqlite("relative.sqlite", join(out, "copy.sqlite"))).toThrow(/absolute/);
});
