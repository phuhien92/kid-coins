import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyKidSession = vi.fn();
vi.mock("@/lib/kid-session.server", () => ({
  verifyKidSession: (...args: unknown[]) => mockVerifyKidSession(...args),
}));

const mockIsTaskVisible = vi.fn();
vi.mock("@/lib/tasks", () => ({
  isTaskVisible: (...args: unknown[]) => mockIsTaskVisible(...args),
}));

const mockKidFindFirst = vi.fn();
const mockTaskFindFirst = vi.fn();
const mockSettingsFindFirst = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
      tasks: { findFirst: (...args: unknown[]) => mockTaskFindFirst(...args) },
      familySettings: { findFirst: (...args: unknown[]) => mockSettingsFindFirst(...args) },
    },
    transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { POST } from "./route";

const KID_ID = "kid-1";
const TASK = {
  id: "task-1",
  kidId: KID_ID,
  title: "Make bed",
  coinReward: 8,
  isActive: true,
  scheduledStartAt: null,
  durationDays: null,
};

function makeReq(body: Record<string, unknown>) {
  return new Request(`http://localhost/api/kids/${KID_ID}/task-completions`, {
    method: "POST",
    headers: { "x-kid-session-token": "token" },
    body: JSON.stringify(body),
  });
}

function makeCtx() {
  return { params: Promise.resolve({ id: KID_ID }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockVerifyKidSession.mockReturnValue(true);
  mockKidFindFirst.mockResolvedValue({ id: KID_ID, familyId: "family-1", balance: 20 });
  mockTaskFindFirst.mockResolvedValue(TASK);
  mockIsTaskVisible.mockReturnValue(true);
  mockSettingsFindFirst.mockResolvedValue({ requireTaskApproval: true });
  mockTransaction.mockImplementation(async (fn) =>
    fn({
      insert: () => ({
        values: () => ({
          returning: async () => [
            {
              id: "completion-1",
              taskId: TASK.id,
              kidId: KID_ID,
              coinsEarned: 8,
              paymentPercent: 100,
              bonusCoins: 0,
              status: "pending",
              completedAt: new Date("2026-06-01T00:00:00Z"),
              resolvedAt: null,
            },
          ],
        }),
      }),
    })
  );
});

describe("POST /api/kids/[id]/task-completions", () => {
  it("returns 401 without kid session", async () => {
    mockVerifyKidSession.mockReturnValueOnce(false);
    const res = await POST(makeReq({ taskId: TASK.id }), makeCtx());
    expect(res.status).toBe(401);
  });

  it("creates a pending completion when approval is required", async () => {
    const res = await POST(makeReq({ taskId: TASK.id }), makeCtx());
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.completion.status).toBe("pending");
    expect(body.completion.coinsEarned).toBe(8);
  });
});
