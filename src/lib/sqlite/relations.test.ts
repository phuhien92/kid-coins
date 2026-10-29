// @vitest-environment node
import { afterEach, beforeEach, expect, it } from "vitest";
import { createTableRelationsHelpers, extractTablesRelationalConfig, One } from "drizzle-orm";
import { createTestSqlite, seedFamily, type TestSqlite } from "@/test/sqlite";
import * as postgres from "../schema";
import * as sqlite from "./schema";

function relationShape(schema: Record<string, unknown>) {
  const { tables } = extractTablesRelationalConfig(schema, createTableRelationsHelpers);
  return Object.fromEntries(Object.values(tables).map((table) => [table.dbName, Object.fromEntries(
    Object.entries(table.relations).map(([name, relation]) => [name, {
      kind: relation instanceof One ? "one" : "many",
      target: relation.referencedTableName,
      fields: relation instanceof One ? relation.config?.fields.map((c) => c.name) : undefined,
      references: relation instanceof One ? relation.config?.references.map((c) => c.name) : undefined,
    }]),
  )]));
}

it("declares the same relational-query relations as the Postgres schema", () => {
  const source = relationShape(postgres);
  expect(relationShape(sqlite)).toEqual(source);
  expect(Object.keys(source)).toHaveLength(14);
});

let database: TestSqlite;
let a: ReturnType<typeof seedFamily>;
beforeEach(() => {
  database = createTestSqlite();
  a = seedFamily(database.db, 1);
  seedFamily(database.db, 2);
});
afterEach(() => database.cleanup());

it("resolves nested family → kids → jars → settings relations scoped to one family", async () => {
  const family = await database.db.query.families.findFirst({
    where: (f, { eq }) => eq(f.id, a.family),
    with: { settings: true, kids: { with: { jars: true, family: { with: { settings: true } } } } },
  });
  expect(family?.settings?.saveInterestBps).toBe(500);
  expect(family?.kids).toHaveLength(1);
  expect(family?.kids[0].jars.map((j) => j.type).sort()).toEqual(["give", "save"]);
  expect(family?.kids[0].family.settings?.familyId).toBe(a.family);
});

it("resolves pending approvals with their kid, task and reward", async () => {
  const completions = await database.db.query.taskCompletions.findMany({
    where: (c, { eq }) => eq(c.status, "pending"),
    with: { task: true, kid: { columns: { id: true, name: true, familyId: true } } },
  });
  expect(completions.map((c) => [c.kid.name, c.task.title]).sort()).toEqual([["Kid 1", "Task 1"], ["Kid 2", "Task 2"]]);

  const redemption = await database.db.query.redemptionRequests.findFirst({
    where: (r, { eq }) => eq(r.id, a.redemption),
    with: { reward: true, kid: true },
  });
  expect(redemption).toMatchObject({ reward: { title: "Reward 1", coinCost: 30 }, kid: { familyId: a.family } });
});
