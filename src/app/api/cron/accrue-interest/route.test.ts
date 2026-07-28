import { describe, it, expect, vi, beforeEach } from "vitest";

const mockJarsFindMany = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      jars: { findMany: (...args: unknown[]) => mockJarsFindMany(...args) },
    },
    transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { POST } from "./route";

const SECRET = "test-cron-secret";

function makeReq(auth?: string) {
  return new Request("http://localhost/api/cron/accrue-interest", {
    method: "POST",
    headers: auth ? { authorization: auth } : {},
  });
}

/** A Save jar joined with its family's interest rate. */
function saveJar(overrides: Record<string, unknown> = {}) {
  return {
    id: "jar-1",
    kidId: "kid-1",
    balance: 100,
    lastInterestAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    kid: { familyId: "fam-1", family: { id: "fam-1", settings: { saveInterestBps: 500 } } },
    ...overrides,
  };
}

/** tx whose guarded UPDATE returns `updated`. */
function fakeTx(updated: Array<{ id: string }>) {
  return {
    update: () => ({
      set: () => ({ where: () => ({ returning: async () => updated }) }),
    }),
    insert: () => ({ values: async () => undefined }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", SECRET);
  // Freeze "now" ~2 weeks after the jar's baseline.
  vi.setSystemTime(new Date("2026-01-15T00:00:00Z"));
  mockTransaction.mockImplementation(async (fn) => fn(fakeTx([{ id: "jar-1" }])));
});

describe("POST /api/cron/accrue-interest", () => {
  it("returns 401 without the shared secret", async () => {
    mockJarsFindMany.mockResolvedValue([]);
    expect((await POST(makeReq())).status).toBe(401);
    expect((await POST(makeReq("Bearer wrong"))).status).toBe(401);
    expect(mockJarsFindMany).not.toHaveBeenCalled();
  });

  it("compounds interest over the whole weeks elapsed", async () => {
    mockJarsFindMany.mockResolvedValue([saveJar()]);
    const res = await POST(makeReq(`Bearer ${SECRET}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    // 2 weeks @ 5%: 100→105→110 → 10 coins paid.
    expect(body).toEqual({ jarsPaid: 1, coinsPaid: 10 });
  });

  it("skips jars with a zero rate or less than a week elapsed", async () => {
    mockJarsFindMany.mockResolvedValue([
      saveJar({ id: "j-zero", kid: { familyId: "f", family: { id: "f", settings: { saveInterestBps: 0 } } } }),
      saveJar({ id: "j-fresh", lastInterestAt: new Date("2026-01-14T00:00:00Z") }),
    ]);
    const res = await POST(makeReq(`Bearer ${SECRET}`));
    const body = await res.json();
    expect(body).toEqual({ jarsPaid: 0, coinsPaid: 0 });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("does not double-pay when the idempotency guard loses the race", async () => {
    mockJarsFindMany.mockResolvedValue([saveJar()]);
    mockTransaction.mockImplementationOnce(async (fn) => fn(fakeTx([]))); // guard matched no row
    const res = await POST(makeReq(`Bearer ${SECRET}`));
    const body = await res.json();
    expect(body).toEqual({ jarsPaid: 0, coinsPaid: 0 });
  });
});
