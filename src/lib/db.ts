import { openSqlite } from "./sqlite/db";

type DB = ReturnType<typeof openSqlite>["db"];

let _instance: DB | undefined;

function getInstance(): DB {
  if (!_instance) {
    if (!process.env.SQLITE_PATH) {
      throw new Error("SQLITE_PATH environment variable is not set");
    }
    // One process-wide connection; run `pnpm db:sqlite:migrate` before starting the app.
    _instance = openSqlite(process.env.SQLITE_PATH).db;
  }
  return _instance;
}

// Lazy proxy — defers opening the database until first query so Next.js can
// collect page data during build without SQLITE_PATH being set.
export const db = new Proxy({} as DB, {
  get(_, prop) {
    return Reflect.get(getInstance(), prop as keyof DB);
  },
});

/**
 * Transactions are synchronous: the callback must not await, so a whole
 * transaction runs without yielding and concurrent requests cannot interleave.
 */
export type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];
