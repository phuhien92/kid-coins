import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAuthenticatedParentFamily = vi.fn();
vi.mock("@/lib/parent-auth", () => ({
  getAuthenticatedParentFamily: () => mockGetAuthenticatedParentFamily(),
}));

const mockDebitBalanceIfAffordable = vi.fn();
vi.mock("@/lib/kid-balance", () => ({
  debitBalanceIfAffordable: (...args: unknown[]) => mockDebitBalanceIfAffordable(...args),
}));

const mockHasRewardStock = vi.fn();
const mockClaimRewardStock = vi.fn();
vi.mock("@/lib/rewards", () => ({
  hasRewardStock: (...args: unknown[]) => mockHasRewardStock(...args),
  claimRewardStock: (...args: unknown[]) => mockClaimRewardStock(...args),
}));

const mockRedemptionFindFirst = vi.fn();
const mockKidFindFirst = vi.fn();
const mockRewardFindFirst = vi.fn();
const mockReturning = vi.fn();
const mockInsertValues = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      redemptionRequests: { findFirst: (...args: unknown[]) => mockRedemptionFindFirst(...args) },
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
      rewards: { findFirst: (...args: unknown[]) => mockRewardFindFirst(...args) },
    },
    transaction: (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        update: () => ({
          set: () => ({ where: () => ({ returning: () => mockReturning() }) }),
        }),
        insert: () => ({ values: (...args: unknown[]) => mockInsertValues(...args) }),
      }),
  },
}));

import { POST } from "./route";

const FAMILY = { id: "family-1", parentUserId: "parent-1", name: "Family" };

function approve() {
  return POST(new Request("http://localhost", { method: "POST" }), {
    params: Promise.resolve({ id: "red-1" }),
  });
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
  mockKidFindFirst.mockResolvedValue({ id: "kid-1", balance: 80, name: "Sam" });
  mockRewardFindFirst.mockResolvedValue({
    id: "reward-1",
    title: "Movie night",
    quantity: 3,
    quantityUsed: 1,
  });
  mockHasRewardStock.mockReturnValue(true);
  mockClaimRewardStock.mockResolvedValue(true);
  mockDebitBalanceIfAffordable.mockResolvedValue(true);
  mockInsertValues.mockResolvedValue(undefined);
  mockReturning.mockResolvedValue([
    { id: "red-1", status: "approved", resolvedAt: new Date("2026-07-11T00:00:00Z") },
  ]);
});

describe("POST /api/parent/approvals/redemption/[id]/approve", () => {
  it("returns 401 when the parent is not authenticated", async () => {
    mockGetAuthenticatedParentFamily.mockResolvedValueOnce({ error: 401 });
    expect((await approve()).status).toBe(401);
  });

  it("claims stock, debits the kid, and records the spend", async () => {
    const res = await approve();

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ redemption: { status: "approved" } });
    expect(mockClaimRewardStock).toHaveBeenCalledWith(expect.anything(), "reward-1");
    expect(mockDebitBalanceIfAffordable).toHaveBeenCalledWith(expect.anything(), "kid-1", 50);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({ type: "redeemed", amount: -50 })
    );
  });

  it("returns 409 without spending when the redemption is already resolved", async () => {
    mockReturning.mockResolvedValueOnce([]);

    const res = await approve();

    expect(res.status).toBe(409);
    expect(mockClaimRewardStock).not.toHaveBeenCalled();
    expect(mockDebitBalanceIfAffordable).not.toHaveBeenCalled();
  });

  it("rejects without debiting when the reward sold out under a concurrent approval", async () => {
    // The advisory pre-check passed; the guarded UPDATE is what actually settles it.
    mockClaimRewardStock.mockResolvedValueOnce(false);

    const res = await approve();

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Reward is sold out" });
    expect(mockDebitBalanceIfAffordable).not.toHaveBeenCalled();
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it("rejects without recording a spend when the coins were already spent", async () => {
    mockDebitBalanceIfAffordable.mockResolvedValueOnce(false);

    const res = await approve();

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Insufficient balance" });
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it("rejects up front when the kid plainly cannot afford the reward", async () => {
    mockKidFindFirst.mockResolvedValueOnce({ id: "kid-1", balance: 10, name: "Sam" });

    const res = await approve();

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Insufficient balance" });
    expect(mockClaimRewardStock).not.toHaveBeenCalled();
  });

  it("rejects up front when the reward is already sold out", async () => {
    mockHasRewardStock.mockReturnValueOnce(false);

    const res = await approve();

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Reward is sold out" });
    expect(mockClaimRewardStock).not.toHaveBeenCalled();
  });
});
