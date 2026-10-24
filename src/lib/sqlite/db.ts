import { isAbsolute } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

/** Explicit disk path; never create a database implicitly during a Next build. */
export function openSqlite(path: string) {
  if (!isAbsolute(path)) throw new Error("SQLITE_PATH must be an absolute file path");
  const client = new Database(path, { timeout: 5000 });
  try {
    client.pragma("foreign_keys = ON");
    client.pragma("journal_mode = WAL");
    client.pragma("synchronous = FULL");
    const db = drizzle(client, { schema });
    return { db, client, close: () => client.close() };
  } catch (error) {
    client.close();
    throw error;
  }
}

export function migrateSqlite(path: string, migrationsFolder: string) {
  const connection = openSqlite(path);
  try {
    migrate(connection.db, { migrationsFolder });
  } finally {
    connection.close();
  }
}
