import { fileURLToPath } from "node:url";
import { importTransferFile, readTransferFile } from "../src/lib/sqlite/transfer";

// Creates SQLITE_PATH from a transfer file; refuses an existing target and never leaves a partial one.
const [input] = process.argv.slice(2);
if (!process.env.SQLITE_PATH) throw new Error("Set SQLITE_PATH to an absolute path that does not exist yet");
if (!input) throw new Error("Usage: pnpm db:sqlite:import /absolute/file.export.json");

const counts = importTransferFile(
  readTransferFile(input),
  process.env.SQLITE_PATH,
  fileURLToPath(new URL("../drizzle-sqlite", import.meta.url)),
);
console.log(Object.entries(counts).map(([name, n]) => `${name}: ${n}`).join("\n"));
