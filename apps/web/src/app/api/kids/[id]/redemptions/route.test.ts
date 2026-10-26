import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyKidSession = vi.fn();
vi.mock("@/lib/kid-session.server", () => ({
  verifyKidSession: (...args: unknown[]) => mockVerifyKidSession(...args),
}));

const mockGetKidEffectiveBalance = vi.fn();
vi.mock("@/lib/kid-balance", () => ({
  getKidEffectiveBalance: (...args: unknown[]) => mockGetKidEffectiveBalance(...args),
}));

const mockHasRewardStock = vi.fn();
vi.mock("@/lib/rewards", () => ({
  hasRewardStock: (...args: unknown[]) => mockHasRewardStock(...args),
}));

const mockKidFindFirst = vi.fn();
const mockRewardFindFirst = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
      rewards: { findFirst: (...args: unknown[]) => mockRewardFindFirst(...args) },
    },
    transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { POST } from "./route";

const KID_ID = "kid-1";

beforeEach(() => {
  vi.clearAllMocks();
  mockVerifyKidSession.mockReturnValue(true);
  mockKidFindFirst.mockResolvedValue({ id: KID_ID, familyId: "family-1", name: "Sam" });
  mockRewardFindFirst.mockResolvedValue({
    id: "reward-1",
    title: "Ice cream",
    coinCost: 20,
    isActive: true,
    quantity: 2,
    quantityUsed: 0,
  });
  mockHasRewardStock.mockReturnValue(true);
  mockGetKidEffectiveBalance.mockResolvedValue(25);
  mockTransaction.mockImplementation(async (fn) =>
    fn({
      insert: () => ({
        values: () => ({
          returning: async () => [
            {
              id: "redemption-1",
              kidId: KID_ID,
              rewardId: "reward-1",
              coinsSpent: 20,
              status: "pending",
              createdAt: new Date("2026-06-01T00:00:00Z"),
            },
          ],
        }),
      }),
    })
  );
});

describe("POST /api/kids/[id]/redemptions", () => {
  it("rejects when effective balance is too low", async () => {
    mockGetKidEffectiveBalance.mockResolvedValueOnce(10);
    const res = await POST(
      new Request(`http://localhost/api/kids/${KID_ID}/redemptions`, {
        method: "POST",
        body: JSON.stringify({ rewardId: "reward-1" }),
      }),
      { params: Promise.resolve({ id: KID_ID }) }
    );
    expect(res.status).toBe(400);
  });

  it("creates a pending redemption", async () => {
    const res = await POST(
      new Request(`http://localhost/api/kids/${KID_ID}/redemptions`, {
        method: "POST",
        body: JSON.stringify({ rewardId: "reward-1" }),
      }),
      { params: Promise.resolve({ id: KID_ID }) }
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.redemption.status).toBe("pending");
    expect(body.redemption.rewardTitle).toBe("Ice cream");
  });
});
