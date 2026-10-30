// @vitest-environment node
import { afterEach, beforeEach, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import Database from "better-sqlite3";
import { migrateSqlite } from "./sqlite/db";

let directory: string;
let path: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "earnie-shutdown-"));
  path = join(directory, "app.sqlite");
  migrateSqlite(path, resolve("drizzle-sqlite"));
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));

it("checkpoints the WAL into the main file when the app process is stopped", () => {
  // A child process writes through the app's db and is stopped the way `next start` exits on SIGTERM.
  const child = join(directory, "child.mts");
  writeFileSync(child, `
    const { db } = await import(${JSON.stringify(resolve("src/lib/db.ts"))});
    const s = await import(${JSON.stringify(resolve("src/lib/sqlite/schema.ts"))});
    db.insert(s.families).values({ id: "00000000-0000-4000-8000-000000000001", parentUserId: "parent-1", name: "Synthetic" }).run();
    process.on("SIGTERM", () => process.exit(143));
    process.kill(process.pid, "SIGTERM");
    await new Promise(() => {});
  `);
  const result = spawnSync(resolve("node_modules/.bin/tsx"), [child], { env: { ...process.env, SQLITE_PATH: path }, encoding: "utf8" });
  expect(result.stderr).toBe("");
  expect(result.status).toBe(143);

  expect(readdirSync(directory).filter((f) => f.startsWith("app.sqlite"))).toEqual(["app.sqlite"]);
  // The main file alone, copied elsewhere, holds the write.
  const copy = join(directory, "copy.sqlite");
  copyFileSync(path, copy);
  const client = new Database(copy, { readonly: true });
  expect(client.prepare("select name from families").all()).toEqual([{ name: "Synthetic" }]);
  client.close();
}, 20_000);
