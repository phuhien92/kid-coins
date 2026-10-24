// @vitest-environment node
import { expect, it } from "vitest";
import { getTableConfig as pgConfig, PgTable } from "drizzle-orm/pg-core";
import { getTableConfig, SQLiteTable } from "drizzle-orm/sqlite-core";
import { getTableName, is } from "drizzle-orm";
import * as postgres from "../schema";
import * as sqlite from "./schema";

it("ports every Postgres table, column, nullability, default and foreign-key action", () => {
  const source = Object.values(postgres).filter((value) => is(value, PgTable)).map(pgConfig);
  const target = Object.values(sqlite).filter((value) => is(value, SQLiteTable)).map(getTableConfig);
  const normalize = (table: (typeof source)[number] | (typeof target)[number]) => ({
    name: table.name,
    columns: table.columns.map((c) => [c.name, c.notNull, c.hasDefault, c.primary, c.isUnique]),
    foreignKeys: table.foreignKeys.map((fk) => {
      const ref = fk.reference();
      return [getTableName(ref.foreignTable), ref.columns.map((c) => c.name), ref.foreignColumns.map((c) => c.name), fk.onDelete];
    }),
  });
  expect(target.map(normalize).sort((a, b) => a.name.localeCompare(b.name)))
    .toEqual(source.map(normalize).sort((a, b) => a.name.localeCompare(b.name)));
  expect(target).toHaveLength(14);
});
