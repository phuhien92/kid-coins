// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import * as s from "@/lib/sqlite/schema";
import { issueKidSessionToken } from "@/lib/kid-session.server";
import { createTestSqlite, seedFamily, type TestSqlite } from "@/test/sqlite";

// There is no push channel: screens refetch these GET endpoints on load and after
// each action. These tests check that a write made by one side is what the other
// side's next fetch returns from the SQLite file.
const current = vi.hoisted(() => ({
  database: undefined as TestSqlite | undefined,
  user: null as { id: string } | null,
}));
vi.mock("@/lib/db", () => ({
  get db() {
    return current.database!.db;
  },
}));
vi.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: async () => ({ data: { user: current.user } }) },
  }),
}));

import { GET as kidJars } from "./kids/[id]/jars/route";
import { POST as allocate } from "./kids/[id]/jars/allocate/route";
import { GET as approvalsFeed } from "./parent/approvals/route";
import { POST as approveTask } from "./parent/approvals/task/[id]/approve/route";
import { POST as approveRedemption } from "./parent/approvals/redemption/[id]/approve/route";
import { POST as accrueInterest } from "./cron/accrue-interest/route";

let database: TestSqlite;
let ids: ReturnType<typeof seedFamily>;
beforeEach(() => {
  database = current.database = createTestSqlite();
  ids = seedFamily(database.db, 1);
  current.user = { id: "parent-1" };
});
afterEach(() => database.cleanup());

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (body: unknown = {}, headers: Record<string, string> = {}) =>
  new Request("http://localhost", { method: "POST", body: JSON.stringify(body), headers });
const kidSession = () => ({ "x-kid-session-token": issueKidSessionToken(ids.kid) });
const kidView = async () => (await kidJars(new Request("http://localhost", { headers: kidSession() }), params(ids.kid))).json();
const parentView = async () => (await approvalsFeed()).json();

describe("kid screens see parent decisions on their next fetch", () => {
  it("shows coins from an approved task", async () => {
    expect((await kidView()).jars.spend).toBe(100);
    expect((await approveTask(post({ paymentPercent: 100 }), params(ids.completion))).status).toBe(200);
    expect((await kidView()).jars).toEqual({ spend: 110, save: 40, give: 0 });
  });

  it("shows the spend from an approved redemption", async () => {
    expect((await approveRedemption(post(), params(ids.redemption))).status).toBe(200);
    expect((await kidView()).jars.spend).toBe(70);
  });

  it("shows interest paid by the weekly job", async () => {
    vi.stubEnv("CRON_SECRET", "synthetic-cron");
    database.db.update(s.jars).set({ createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }).run();
    const cron = new Request("http://localhost", { method: "POST", headers: { authorization: "Bearer synthetic-cron" } });
    expect((await accrueInterest(cron)).status).toBe(200);
    expect((await kidView()).jars.save).toBe(42);
    vi.unstubAllEnvs();
  });
});

describe("the parent feed sees current state on its next fetch", () => {
  it("drops resolved items and reports the credited balance", async () => {
    const before = await parentView();
    expect(before.taskCompletions.map((c: { id: string }) => c.id)).toEqual([ids.completion]);
    await approveTask(post({ paymentPercent: 100 }), params(ids.completion));
    const after = await parentView();
    expect(after.taskCompletions).toEqual([]);
    expect(after.kids).toEqual([expect.objectContaining({ id: ids.kid, balance: 110 })]);
  });

  it("reports a balance the kid moved into a jar", async () => {
    expect((await allocate(post({ jarType: "save", amount: 25 }, kidSession()), params(ids.kid))).status).toBe(200);
    expect((await parentView()).kids[0].balance).toBe(75);
    expect(database.db.select().from(s.kidProfiles).where(eq(s.kidProfiles.id, ids.kid)).get()?.balance).toBe(75);
  });
});
