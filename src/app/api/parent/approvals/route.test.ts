import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAuthenticatedParentFamily = vi.fn();
vi.mock("@/lib/parent-auth", () => ({
  getAuthenticatedParentFamily: () => mockGetAuthenticatedParentFamily(),
}));

const mockKidsFindMany = vi.fn();
const mockCompletionsFindMany = vi.fn();
const mockRedemptionsFindMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: { findMany: (...a: unknown[]) => mockKidsFindMany(...a) },
      taskCompletions: { findMany: (...a: unknown[]) => mockCompletionsFindMany(...a) },
      redemptionRequests: { findMany: (...a: unknown[]) => mockRedemptionsFindMany(...a) },
    },
  },
}));

import { GET } from "./route";

const FAMILY = { id: "family-1", parentUserId: "parent-1", name: "Family" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthenticatedParentFamily.mockResolvedValue({ user: { id: "parent-1" }, family: FAMILY });
  mockKidsFindMany.mockResolvedValue([
    { id: "kid-1", name: "Sam", avatarColor: "#F4D34E", balance: 20 },
  ]);
  mockCompletionsFindMany.mockResolvedValue([
    {
      id: "comp-1",
      taskId: "task-1",
      kidId: "kid-1",
      coinsEarned: 10,
      paymentPercent: 100,
      bonusCoins: 0,
      status: "pending",
      completedAt: new Date("2026-07-11T10:00:00Z"),
      task: { title: "Make bed" },
      kid: { name: "Sam" },
    },
  ]);
  mockRedemptionsFindMany.mockResolvedValue([
    {
      id: "red-1",
      kidId: "kid-1",
      rewardId: "reward-1",
      coinsSpent: 50,
      status: "pending",
      createdAt: new Date("2026-07-11T09:00:00Z"),
      reward: { title: "Movie night" },
      kid: { name: "Sam" },
    },
  ]);
});

describe("GET /api/parent/approvals", () => {
  it("returns 401 when parent is not authenticated", async () => {
    mockGetAuthenticatedParentFamily.mockResolvedValueOnce({ error: 401 });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty collections when the family has no kids", async () => {
    mockKidsFindMany.mockResolvedValueOnce([]);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ taskCompletions: [], redemptions: [], kids: [] });
    expect(mockCompletionsFindMany).not.toHaveBeenCalled();
  });

  it("serializes pending task completions and redemptions with kid info", async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.taskCompletions).toEqual([
      {
        id: "comp-1",
        taskId: "task-1",
        taskTitle: "Make bed",
        kidId: "kid-1",
        kidName: "Sam",
        coinsEarned: 10,
        paymentPercent: 100,
        bonusCoins: 0,
        status: "pending",
        completedAt: "2026-07-11T10:00:00.000Z",
      },
    ]);
    expect(body.redemptions).toEqual([
      {
        id: "red-1",
        kidId: "kid-1",
        kidName: "Sam",
        rewardId: "reward-1",
        rewardTitle: "Movie night",
        coinsSpent: 50,
        status: "pending",
        createdAt: "2026-07-11T09:00:00.000Z",
      },
    ]);
    expect(body.kids).toHaveLength(1);
    expect(body.kids[0]).toMatchObject({ id: "kid-1", balance: 20 });
  });

  it("returns 500 when a query throws", async () => {
    mockKidsFindMany.mockRejectedValueOnce(new Error("db down"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
