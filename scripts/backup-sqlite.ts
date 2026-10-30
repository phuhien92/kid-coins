import { backupSqlite } from "../src/lib/sqlite/backup";

// Copies SQLITE_PATH to a new verified file; safe while the app runs, refuses an existing target.
const [target] = process.argv.slice(2);
if (!process.env.SQLITE_PATH) throw new Error("Set SQLITE_PATH to the absolute path of the database to copy");
if (!target) throw new Error("Usage: pnpm db:sqlite:backup /absolute/new-backup.sqlite");

backupSqlite(process.env.SQLITE_PATH, target);
console.log(`Backed up ${process.env.SQLITE_PATH} to ${target}`);
