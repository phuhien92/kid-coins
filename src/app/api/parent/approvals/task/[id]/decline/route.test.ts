import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAuthenticatedParentFamily = vi.fn();
vi.mock("@/lib/parent-auth", () => ({
  getAuthenticatedParentFamily: () => mockGetAuthenticatedParentFamily(),
}));

const mockCompletionFindFirst = vi.fn();
const mockKidFindFirst = vi.fn();
const mockTaskFindFirst = vi.fn();
const mockTransaction = vi.fn();
const mockInsertValues = vi.fn();

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

function post(id = "completion-1") {
  return POST(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ reason: "Bed wasn't made" }),
    }),
    { params: Promise.resolve({ id }) }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthenticatedParentFamily.mockResolvedValue({ user: { id: "parent-1" }, family: FAMILY });
  mockCompletionFindFirst.mockResolvedValue({
    id: "completion-1",
    taskId: "task-1",
    kidId: "kid-1",
    status: "pending",
  });
  mockKidFindFirst.mockResolvedValue({ id: "kid-1", name: "Sam", familyId: FAMILY.id });
  mockTaskFindFirst.mockResolvedValue({ title: "Make bed" });
  withUpdateReturning([
    {
      id: "completion-1",
      status: "denied",
      rejectionReason: "Bed wasn't made",
      resolvedAt: new Date("2026-06-01T00:00:00Z"),
    },
  ]);
});

describe("POST /api/parent/approvals/task/[id]/decline", () => {
  it("returns 401 when parent is not authenticated", async () => {
    mockGetAuthenticatedParentFamily.mockResolvedValueOnce({ error: 401 });
    expect((await post()).status).toBe(401);
  });

  it("returns 404 when the completion is not in the parent's family", async () => {
    mockKidFindFirst.mockResolvedValueOnce(undefined);
    expect((await post()).status).toBe(404);
  });

  it("declines a pending completion and zeroes its payout", async () => {
    const res = await post();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completion.status).toBe("denied");
    expect(body.completion.rejectionReason).toBe("Bed wasn't made");
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({ type: "task_denied" })
    );
  });

  it("returns 409 without logging when the completion is no longer pending", async () => {
    // An approve committed between the pre-transaction read and this UPDATE:
    // the status guard matches no row, so the credited coins are left alone.
    withUpdateReturning([]);

    const res = await post();

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Completion already resolved" });
    expect(mockInsertValues).not.toHaveBeenCalled();
  });
});
