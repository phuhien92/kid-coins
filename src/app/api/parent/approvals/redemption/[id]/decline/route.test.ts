import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAuthenticatedParentFamily = vi.fn();
vi.mock("@/lib/parent-auth", () => ({
  getAuthenticatedParentFamily: () => mockGetAuthenticatedParentFamily(),
}));

const mockRedemptionFindFirst = vi.fn();
const mockKidFindFirst = vi.fn();
const mockRewardFindFirst = vi.fn();
const mockTransaction = vi.fn();
const mockInsertValues = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      redemptionRequests: { findFirst: (...args: unknown[]) => mockRedemptionFindFirst(...args) },
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
      rewards: { findFirst: (...args: unknown[]) => mockRewardFindFirst(...args) },
    },
    transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { POST } from "./route";

const FAMILY = { id: "family-1", parentUserId: "parent-1", name: "Family" };

/** Drives the route's transaction with whatever the guarded UPDATE returns. */
function withUpdateReturning(rows: unknown[]) {
  mockTransaction.mockImplementation(async (fn) =>
    fn({
      update: () => ({
        set: () => ({ where: () => ({ returning: async () => rows }) }),
      }),
      insert: () => ({ values: (...args: unknown[]) => mockInsertValues(...args) }),
    })
  );
}

function post(id = "red-1") {
  return POST(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ reason: "Not this week" }),
    }),
    { params: Promise.resolve({ id }) }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthenticatedParentFamily.mockResolvedValue({ user: { id: "parent-1" }, family: FAMILY });
  mockRedemptionFindFirst.mockResolvedValue({
    id: "red-1",
    kidId: "kid-1",
    rewardId: "reward-1",
    coinsSpent: 50,
    status: "pending",
  });
  mockKidFindFirst.mockResolvedValue({ id: "kid-1", name: "Sam" });
  mockRewardFindFirst.mockResolvedValue({ title: "Movie night" });
  withUpdateReturning([
    {
      id: "red-1",
      status: "denied",
      rejectionReason: "Not this week",
      resolvedAt: new Date("2026-06-01T00:00:00Z"),
    },
  ]);
});

describe("POST /api/parent/approvals/redemption/[id]/decline", () => {
  it("returns 401 when parent is not authenticated", async () => {
    mockGetAuthenticatedParentFamily.mockResolvedValueOnce({ error: 401 });
    expect((await post()).status).toBe(401);
  });

  it("returns 404 when the redemption is not in the parent's family", async () => {
    mockKidFindFirst.mockResolvedValueOnce(undefined);
    expect((await post()).status).toBe(404);
  });

  it("declines a pending redemption", async () => {
    const res = await post();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.redemption.status).toBe("denied");
    expect(body.redemption.rejectionReason).toBe("Not this week");
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({ type: "reward_denied" })
    );
  });

  it("returns 409 without logging when the redemption is no longer pending", async () => {
    // An approve committed between the pre-transaction read and this UPDATE:
    // the status guard matches no row, so the debit and stock stay consistent.
    withUpdateReturning([]);

    const res = await post();

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Redemption already resolved" });
    expect(mockInsertValues).not.toHaveBeenCalled();
  });
});
