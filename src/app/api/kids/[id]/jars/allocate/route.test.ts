import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyKidSession = vi.fn();
vi.mock("@/lib/kid-session.server", () => ({
  verifyKidSession: (...args: unknown[]) => mockVerifyKidSession(...args),
}));

const mockAllocateToJar = vi.fn();
vi.mock("@/lib/jars", () => ({
  allocateToJar: (...args: unknown[]) => mockAllocateToJar(...args),
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

const KID_ID = "kid-1";
function makeReq(body: Record<string, unknown>) {
  return new Request(`http://localhost/api/kids/${KID_ID}/jars/allocate`, {
    method: "POST",
    headers: { "x-kid-session-token": "token" },
    body: JSON.stringify(body),
  });
}
const ctx = () => ({ params: Promise.resolve({ id: KID_ID }) });

/** tx whose inserts are no-ops. */
const fakeTx = {
  insert: () => ({ values: async () => undefined }),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockVerifyKidSession.mockReturnValue(true);
  mockKidFindFirst.mockResolvedValue({ id: KID_ID, familyId: "fam-1", balance: 40 });
  mockTransaction.mockImplementation(async (fn) => fn(fakeTx));
});

describe("POST /api/kids/[id]/jars/allocate", () => {
  it("returns 401 without a kid session", async () => {
    mockVerifyKidSession.mockReturnValueOnce(false);
    const res = await POST(makeReq({ jarType: "save", amount: 10 }), ctx());
    expect(res.status).toBe(401);
  });

  it("rejects an invalid jarType", async () => {
    const res = await POST(makeReq({ jarType: "spend", amount: 10 }), ctx());
    expect(res.status).toBe(400);
    expect(mockAllocateToJar).not.toHaveBeenCalled();
  });

  it("rejects a non-positive or non-integer amount", async () => {
    expect((await POST(makeReq({ jarType: "save", amount: 0 }), ctx())).status).toBe(400);
    expect((await POST(makeReq({ jarType: "save", amount: -5 }), ctx())).status).toBe(400);
    expect((await POST(makeReq({ jarType: "save", amount: 2.5 }), ctx())).status).toBe(400);
    expect(mockAllocateToJar).not.toHaveBeenCalled();
  });

  it("fast-rejects when Spend can't cover the amount, before opening a tx", async () => {
    const res = await POST(makeReq({ jarType: "save", amount: 999 }), ctx());
    expect(res.status).toBe(400);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("reports the helper's authoritative post-move balances on success", async () => {
    mockAllocateToJar.mockResolvedValueOnce({ spend: 15, jarBalance: 125 });
    const res = await POST(makeReq({ jarType: "save", amount: 25 }), ctx());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(mockAllocateToJar).toHaveBeenCalledWith(fakeTx, KID_ID, "save", 25);
    expect(body).toEqual({ jarType: "save", moved: 25, spend: 15, jarBalance: 125 });
  });

  it("returns 400 when the guarded allocate loses the race (no fall-through)", async () => {
    mockAllocateToJar.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ jarType: "give", amount: 25 }), ctx());
    expect(res.status).toBe(400);
  });
});
