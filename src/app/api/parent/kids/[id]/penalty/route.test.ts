import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAuthenticatedParentFamily = vi.fn();
vi.mock("@/lib/parent-auth", () => ({
  getAuthenticatedParentFamily: () => mockGetAuthenticatedParentFamily(),
}));

const mockKidFindFirst = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
    },
    transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { POST } from "./route";

const FAMILY = { id: "family-1", parentUserId: "parent-1", name: "Family" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthenticatedParentFamily.mockResolvedValue({ user: { id: "parent-1" }, family: FAMILY });
  mockKidFindFirst.mockResolvedValue({ id: "kid-1", balance: 30, name: "Sam" });
  mockTransaction.mockImplementation(async (fn) =>
    fn({
      update: () => ({
        set: () => ({
          where: () => ({
            returning: async () => [{ balance: 20 }],
          }),
        }),
      }),
      insert: () => ({ values: async () => undefined }),
    })
  );
});

describe("POST /api/parent/kids/[id]/penalty", () => {
  it("returns 400 without reason", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ amount: 5 }),
      }),
      { params: Promise.resolve({ id: "kid-1" }) }
    );
    expect(res.status).toBe(400);
  });

  it("deducts coins and returns updated balance", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ amount: 10, reason: "Broke curfew" }),
      }),
      { params: Promise.resolve({ id: "kid-1" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.kid.balance).toBe(20);
  });
});
