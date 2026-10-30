// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import * as s from "@/lib/sqlite/schema";
import { issueKidSessionToken } from "@/lib/kid-session.server";
import { createTestSqlite, seedFamily, type TestSqlite } from "@/test/sqlite";

// Only the external boundaries are faked: the Supabase user and the database file.
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

import { POST as approveTask } from "./parent/approvals/task/[id]/approve/route";
import { POST as approveRedemption } from "./parent/approvals/redemption/[id]/approve/route";
import { POST as declineRedemption } from "./parent/approvals/redemption/[id]/decline/route";
import { POST as penalize } from "./parent/kids/[id]/penalty/route";
import { POST as allocate } from "./kids/[id]/jars/allocate/route";
import { POST as accrueInterest } from "./cron/accrue-interest/route";

type Ids = ReturnType<typeof seedFamily>;
let database: TestSqlite;
let a: Ids;
let b: Ids;

beforeEach(() => {
  database = current.database = createTestSqlite();
  a = seedFamily(database.db, 1);
  b = seedFamily(database.db, 2);
  current.user = { id: "parent-1" };
});
afterEach(() => database.cleanup());

const call = (handler: (r: Request, c: { params: Promise<{ id: string }> }) => Promise<Response>, id: string, body: unknown = {}, headers: Record<string, string> = {}) =>
  handler(new Request("http://localhost", { method: "POST", body: JSON.stringify(body), headers }), { params: Promise.resolve({ id }) });
const statuses = (responses: Response[]) => responses.map((r) => r.status).sort();
const kid = (id: string) => database.db.select().from(s.kidProfiles).where(eq(s.kidProfiles.id, id)).get()!;
const ledger = (kidId: string) => database.db.select().from(s.coinTransactions).where(eq(s.coinTransactions.kidId, kidId)).all();

describe("authorization and tenant isolation", () => {
  it("rejects unauthenticated parents without touching data", async () => {
    current.user = null;
    expect((await call(approveTask, a.completion)).status).toBe(401);
    expect(kid(a.kid).balance).toBe(100);
  });

  it("hides another family's records from a signed-in parent", async () => {
    current.user = { id: "parent-2" };
    expect((await call(approveTask, a.completion)).status).toBe(404);
    expect((await call(approveRedemption, a.redemption)).status).toBe(404);
    expect((await call(declineRedemption, a.redemption, { reason: "no" })).status).toBe(404);
    expect((await call(penalize, a.kid, { amount: 5, reason: "x" })).status).toBe(404);
    expect(kid(a.kid).balance).toBe(100);
    expect(ledger(a.kid)).toEqual([]);
    expect(database.db.select().from(s.redemptionRequests).where(eq(s.redemptionRequests.id, a.redemption)).get()?.status).toBe("pending");
  });

  it("only lets a kid session move that kid's own coins", async () => {
    const token = { "x-kid-session-token": issueKidSessionToken(b.kid) };
    expect((await call(allocate, a.kid, { jarType: "save", amount: 10 }, token)).status).toBe(401);
    expect(kid(a.kid).balance).toBe(100);
  });
});

describe("duplicate and concurrent money operations", () => {
  it("credits a task approval exactly once under concurrent submits", async () => {
    const responses = await Promise.all(Array.from({ length: 5 }, () => call(approveTask, a.completion, { paymentPercent: 100 })));
    expect(statuses(responses)).toEqual([200, 409, 409, 409, 409]);
    expect(kid(a.kid).balance).toBe(110);
    expect(ledger(a.kid)).toHaveLength(1);
    expect((await call(approveTask, a.completion)).status).toBe(404); // no longer pending
  });

  it("spends coins and stock for a redemption exactly once", async () => {
    const responses = await Promise.all([call(approveRedemption, a.redemption), call(approveRedemption, a.redemption)]);
    expect(statuses(responses)).toEqual([200, 409]);
    expect(kid(a.kid).balance).toBe(70);
    expect(database.db.select().from(s.rewards).where(eq(s.rewards.id, a.reward)).get()).toMatchObject({ quantityUsed: 1, isActive: false });
  });

  it("lets only one of two concurrent redemptions take the last unit, rolling the loser back", async () => {
    const second = database.db.insert(s.redemptionRequests).values({ kidId: a.kid, rewardId: a.reward, coinsSpent: 30 }).returning().get();
    const responses = await Promise.all([call(approveRedemption, a.redemption), call(approveRedemption, second.id)]);
    expect(statuses(responses)).toEqual([200, 400]);
    expect(kid(a.kid).balance).toBe(70);
    const pending = database.db.select().from(s.redemptionRequests).where(eq(s.redemptionRequests.status, "pending")).all();
    expect(pending.filter((r) => r.kidId === a.kid)).toHaveLength(1);
  });

  it("never lets concurrent spends overdraw a balance", async () => {
    database.db.update(s.kidProfiles).set({ balance: 40 }).where(eq(s.kidProfiles.id, a.kid)).run();
    database.db.update(s.rewards).set({ quantity: null }).where(eq(s.rewards.id, a.reward)).run();
    const second = database.db.insert(s.redemptionRequests).values({ kidId: a.kid, rewardId: a.reward, coinsSpent: 30 }).returning().get();
    const responses = await Promise.all([call(approveRedemption, a.redemption), call(approveRedemption, second.id)]);
    expect(statuses(responses)).toEqual([200, 400]);
    expect(kid(a.kid).balance).toBe(10);
    expect(ledger(a.kid).filter((t) => t.type === "redeemed")).toHaveLength(1);
  });

  it("never lets concurrent jar moves spend the same coins twice", async () => {
    const token = { "x-kid-session-token": issueKidSessionToken(a.kid) };
    const responses = await Promise.all(Array.from({ length: 3 }, () => call(allocate, a.kid, { jarType: "save", amount: 60 }, token)));
    expect(statuses(responses)).toEqual([200, 400, 400]);
    expect(kid(a.kid).balance).toBe(40);
    const save = database.db.select().from(s.jars).where(and(eq(s.jars.kidId, a.kid), eq(s.jars.type, "save"))).get();
    expect(save?.balance).toBe(100);
  });

  it("pays savings interest once when the cron fires twice at the same time", async () => {
    vi.stubEnv("CRON_SECRET", "synthetic-cron");
    const twoWeeksAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    database.db.update(s.jars).set({ createdAt: twoWeeksAgo }).run();
    const fire = () => accrueInterest(new Request("http://localhost", { method: "POST", headers: { authorization: "Bearer synthetic-cron" } }));
    const bodies = await Promise.all([fire(), fire()]).then((r) => Promise.all(r.map((x) => x.json())));
    // 40 coins at 5%/week for 2 weeks per kid: 40 → 42 → 44.
    expect(bodies.reduce((sum, body) => sum + body.coinsPaid, 0)).toBe(8);
    const saves = database.db.select().from(s.jars).where(eq(s.jars.type, "save")).all();
    expect(saves.map((j) => j.balance)).toEqual([44, 44]);
    vi.unstubAllEnvs();
  });
});
