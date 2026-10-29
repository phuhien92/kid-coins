import { randomUUID } from "node:crypto";
import { existsSync, linkSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { count, getTableColumns } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { migrateSqlite, openSqlite } from "./db";
import * as s from "./schema";

export const TRANSFER_FORMAT = "earnie-sqlite-transfer";
export const TRANSFER_VERSION = 1;

/** Parents before children, so foreign keys hold after every insert. */
export const TRANSFER_TABLES = {
  families: s.families,
  familySettings: s.familySettings,
  kidProfiles: s.kidProfiles,
  characters: s.characters,
  jars: s.jars,
  tasks: s.tasks,
  taskCompletions: s.taskCompletions,
  coinTransactions: s.coinTransactions,
  rewards: s.rewards,
  redemptionRequests: s.redemptionRequests,
  goals: s.goals,
  streaks: s.streaks,
  badges: s.badges,
  activityLog: s.activityLog,
} satisfies Record<string, SQLiteTable>;

export type TransferTable = keyof typeof TRANSFER_TABLES;
type Row = Record<string, unknown>;
export type TransferFile = {
  format: typeof TRANSFER_FORMAT;
  version: typeof TRANSFER_VERSION;
  exportedAt: string;
  tables: Record<TransferTable, Row[]>;
};

const tableNames = Object.keys(TRANSFER_TABLES) as TransferTable[];
const SIDECARS = ["", "-wal", "-shm", "-journal"];
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** Serialize source rows (Dates become ISO strings) into the versioned transfer shape. */
export function buildTransferFile(rows: Record<TransferTable, Row[]>, exportedAt = new Date()): TransferFile {
  const tables = {} as Record<TransferTable, Row[]>;
  for (const name of tableNames) {
    const columns = Object.keys(getTableColumns(TRANSFER_TABLES[name]));
    tables[name] = (rows[name] ?? []).map((row) => Object.fromEntries(columns.map((key) => {
      const value = row[key] === undefined ? null : row[key];
      return [key, value instanceof Date ? value.toISOString() : value];
    })));
  }
  return { format: TRANSFER_FORMAT, version: TRANSFER_VERSION, exportedAt: exportedAt.toISOString(), tables };
}

/** Write a transfer file without ever replacing an existing file. */
export function writeTransferFile(path: string, file: TransferFile) {
  publishNew(path, (temp) => writeFileSync(temp, JSON.stringify(file), { flag: "wx", mode: 0o600 }));
}

export function readTransferFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function fail(message: string): never {
  throw new Error(`Invalid transfer file: ${message}`);
}

function convertValue(column: SQLiteColumn, value: unknown, where: string): unknown {
  if (value === null) {
    if (column.notNull) fail(`${where} must not be null`);
    return null;
  }
  switch (column.columnType) {
    case "SQLiteText":
      if (typeof value !== "string") fail(`${where} must be a string`);
      return value;
    case "SQLiteInteger":
      if (!Number.isSafeInteger(value)) fail(`${where} must be an integer`);
      return value;
    case "SQLiteBoolean":
      if (typeof value !== "boolean") fail(`${where} must be a boolean`);
      return value;
    case "SQLiteTimestamp":
      if (typeof value !== "string" || !ISO_INSTANT.test(value) || Number.isNaN(Date.parse(value))) {
        fail(`${where} must be an ISO-8601 UTC instant`);
      }
      return new Date(value);
    case "SQLiteTextJson":
      if (typeof value !== "object") fail(`${where} must be a JSON object`);
      return value;
    default:
      return fail(`${where} has unsupported column type ${column.columnType}`);
  }
}

/** Validate the whole file up front and convert it to typed insert values. */
export function parseTransferFile(input: unknown): Record<TransferTable, Row[]> {
  if (typeof input !== "object" || input === null) fail("not an object");
  const file = input as Partial<TransferFile>;
  if (file.format !== TRANSFER_FORMAT) fail(`format must be ${TRANSFER_FORMAT}`);
  if (file.version !== TRANSFER_VERSION) fail(`unsupported version ${String(file.version)}`);
  const tables = file.tables as Record<string, unknown> | undefined;
  if (typeof tables !== "object" || tables === null) fail("tables missing");
  const unknownTables = Object.keys(tables).filter((name) => !(name in TRANSFER_TABLES));
  if (unknownTables.length) fail(`unknown tables ${unknownTables.join(", ")}`);

  const parsed = {} as Record<TransferTable, Row[]>;
  for (const name of tableNames) {
    const rows = tables[name];
    if (!Array.isArray(rows)) fail(`${name} must be an array`);
    const columns = getTableColumns(TRANSFER_TABLES[name]) as Record<string, SQLiteColumn>;
    const keys = Object.keys(columns);
    parsed[name] = rows.map((row: unknown, index) => {
      const where = `${name}[${index}]`;
      if (typeof row !== "object" || row === null || Array.isArray(row)) fail(`${where} must be an object`);
      const extra = Object.keys(row).filter((key) => !(key in columns));
      if (extra.length) fail(`${where} has unknown columns ${extra.join(", ")}`);
      const missing = keys.filter((key) => !(key in row));
      if (missing.length) fail(`${where} is missing columns ${missing.join(", ")}`);
      return Object.fromEntries(keys.map((key) => [key, convertValue(columns[key], (row as Row)[key], `${where}.${key}`)]));
    });
  }
  return parsed;
}

function assertAbsent(path: string) {
  const present = SIDECARS.map((suffix) => path + suffix).filter((candidate) => existsSync(candidate));
  if (present.length) throw new Error(`Refusing to overwrite existing ${present.join(", ")}`);
}

/** Build into a private sibling, then hard-link it into place; link never replaces an existing path. */
function publishNew(target: string, build: (temp: string) => void) {
  if (!isAbsolute(target)) throw new Error("Target must be an absolute file path");
  assertAbsent(target);
  const temp = join(dirname(target), `.${basename(target)}.partial-${randomUUID()}`);
  try {
    build(temp);
    SIDECARS.slice(1).forEach((suffix) => {
      if (existsSync(temp + suffix)) throw new Error(`Unexpected ${suffix} left beside staged file`);
    });
    linkSync(temp, target);
  } finally {
    SIDECARS.forEach((suffix) => rmSync(temp + suffix, { force: true }));
  }
}

const CHUNK = 100;

/** Import a transfer file into a brand-new SQLite database; any failure leaves no target behind. */
export function importTransferFile(input: unknown, target: string, migrationsFolder: string) {
  const rows = parseTransferFile(input);
  const counts = {} as Record<TransferTable, number>;
  publishNew(target, (temp) => {
    migrateSqlite(temp, migrationsFolder);
    const connection = openSqlite(temp);
    try {
      connection.db.transaction((tx) => {
        for (const name of tableNames) {
          for (let i = 0; i < rows[name].length; i += CHUNK) {
            // Values are validated against these exact columns by parseTransferFile.
            tx.insert(TRANSFER_TABLES[name]).values(rows[name].slice(i, i + CHUNK) as never).run();
          }
        }
      });
      for (const name of tableNames) {
        counts[name] = connection.db.select({ n: count() }).from(TRANSFER_TABLES[name]).get()?.n ?? 0;
        if (counts[name] !== rows[name].length) throw new Error(`Row count mismatch for ${name}`);
      }
      if (connection.client.pragma("integrity_check", { simple: true }) !== "ok") throw new Error("integrity_check failed");
      if ((connection.client.pragma("foreign_key_check") as unknown[]).length) throw new Error("foreign_key_check failed");
    } finally {
      connection.close();
    }
  });
  return counts;
}
