import { isAbsolute } from "node:path";
import Database from "better-sqlite3";
import { publishNew } from "./transfer";

/** Throws unless the file passes SQLite's integrity and foreign-key checks. */
export function verifySqlite(path: string) {
  const client = new Database(path, { readonly: true, fileMustExist: true });
  try {
    if (client.pragma("integrity_check", { simple: true }) !== "ok") throw new Error("integrity_check failed");
    if ((client.pragma("foreign_key_check") as unknown[]).length) throw new Error("foreign_key_check failed");
  } finally {
    client.close();
  }
}

/**
 * Copy a database to a brand-new file with `VACUUM INTO`. The copy is one consistent
 * snapshot that already contains every committed WAL page, so it is safe while the app
 * is running and is a single self-contained file: no `-wal`/`-shm` to carry along.
 * Restoring is the same copy in the other direction, into a path the app is not using.
 */
export function backupSqlite(source: string, target: string) {
  if (!isAbsolute(source)) throw new Error("Source must be an absolute file path");
  publishNew(target, (temp) => {
    // Read-write so closing a stopped database checkpoints and removes the sidecars it opened.
    const client = new Database(source, { fileMustExist: true, timeout: 5000 });
    try {
      client.prepare("VACUUM INTO ?").run(temp);
    } finally {
      client.close();
    }
    verifySqlite(temp);
  });
}
