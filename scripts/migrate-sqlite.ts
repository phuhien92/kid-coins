import { fileURLToPath } from "node:url";
import { migrateSqlite } from "../src/lib/sqlite/db";

if (!process.env.SQLITE_PATH) throw new Error("Set SQLITE_PATH to an absolute disk path");
migrateSqlite(
  process.env.SQLITE_PATH,
  fileURLToPath(new URL("../drizzle-sqlite", import.meta.url)),
);
console.log("SQLite migrations applied");
