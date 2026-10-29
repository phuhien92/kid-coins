import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as pg from "../src/lib/schema";
import { buildTransferFile, TRANSFER_TABLES, writeTransferFile, type TransferTable } from "../src/lib/sqlite/transfer";

// Reads every application table in one read-only snapshot; never writes to Postgres.
const [output] = process.argv.slice(2);
const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL to the source Postgres database");
if (!output) throw new Error("Usage: pnpm db:export:postgres /absolute/new-file.export.json");

async function main(url: string, output: string) {
  const client = postgres(url, { prepare: false, max: 1 });
  try {
    const db = drizzle(client);
    const rows = await db.transaction(async (tx) => {
      const result = {} as Record<TransferTable, Record<string, unknown>[]>;
      for (const name of Object.keys(TRANSFER_TABLES) as TransferTable[]) {
        result[name] = await tx.select().from(pg[name]);
      }
      return result;
    }, { isolationLevel: "repeatable read", accessMode: "read only" });
    writeTransferFile(output, buildTransferFile(rows));
    console.log(Object.entries(rows).map(([name, list]) => `${name}: ${list.length}`).join("\n"));
  } finally {
    await client.end();
  }
}

main(url, output).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
