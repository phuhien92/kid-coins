import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAuthenticatedParentFamily = vi.fn();
vi.mock("@/lib/parent-auth", () => ({
  getAuthenticatedParentFamily: () => mockGetAuthenticatedParentFamily(),
}));

const mockCalculateCoinsEarned = vi.fn();
const mockIsValidApprovalTier = vi.fn();
vi.mock("@/lib/tasks", () => ({
  calculateCoinsEarned: (...args: unknown[]) => mockCalculateCoinsEarned(...args),
  isValidApprovalTier: (...args: unknown[]) => mockIsValidApprovalTier(...args),
}));

const mockCompletionFindFirst = vi.fn();
const mockKidFindFirst = vi.fn();
const mockTaskFindFirst = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      taskCompletions: { findFirst: (...args: unknown[]) => mockCompletionFindFirst(...args) },
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
      tasks: { findFirst: (...args: unknown[]) => mockTaskFindFirst(...args) },
    },
    transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { POST } from "./route";

const FAMILY = { id: "family-1", parentUserId: "parent-1", name: "Family" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthenticatedParentFamily.mockResolvedValue({ user: { id: "parent-1" }, family: FAMILY });
  mockCompletionFindFirst.mockResolvedValue({
    id: "completion-1",
    taskId: "task-1",
    kidId: "kid-1",
    status: "pending",
    coinsEarned: 10,
  });
  mockKidFindFirst.mockResolvedValue({
    id: "kid-1",
    balance: 10,
    name: "Sam",
    familyId: FAMILY.id,
  });
  mockTaskFindFirst.mockResolvedValue({ id: "task-1", title: "Make bed", coinReward: 10 });
  mockIsValidApprovalTier.mockReturnValue(true);
  mockCalculateCoinsEarned.mockReturnValue(12);
  mockTransaction.mockImplementation(async (fn) =>
    fn({
      update: () => ({
        set: () => ({
          where: () => ({
            returning: async () => [
              {
                id: "completion-1",
                status: "approved",
                coinsEarned: 12,
                paymentPercent: 75,
                bonusCoins: 5,
                resolvedAt: new Date("2026-06-01T00:00:00Z"),
              },
            ],
          }),
        }),
      }),
      insert: () => ({ values: async () => undefined }),
    })
  );
});

describe("POST /api/parent/approvals/task/[id]/approve", () => {
  it("returns 401 when parent is not authenticated", async () => {
    mockGetAuthenticatedParentFamily.mockResolvedValueOnce({ error: 401 });
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ paymentPercent: 75, bonusCoins: 5 }),
      }),
      { params: Promise.resolve({ id: "completion-1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("approves with tiered payout", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ paymentPercent: 75, bonusCoins: 5 }),
      }),
      { params: Promise.resolve({ id: "completion-1" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completion.coinsEarned).toBe(12);
    expect(mockCalculateCoinsEarned).toHaveBeenCalledWith(10, 75, 5);
  });

  it("pays out the reward snapshotted on the completion, not the task's current one", async () => {
    // The parent raised the task's reward to 40 while this completion sat
    // pending; the kid — and the Approvals card — were promised 10.
    mockTaskFindFirst.mockResolvedValueOnce({ id: "task-1", title: "Make bed", coinReward: 40 });

    await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({}) }),
      { params: Promise.resolve({ id: "completion-1" }) }
    );

    expect(mockCalculateCoinsEarned).toHaveBeenCalledWith(10, 100, 0);
  });
});
