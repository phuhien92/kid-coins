import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyKidSession = vi.fn();
vi.mock("@/lib/kid-session.server", () => ({
  verifyKidSession: (...args: unknown[]) => mockVerifyKidSession(...args),
}));

const mockWithdrawFromSaveJar = vi.fn();
vi.mock("@/lib/jars", () => ({
  withdrawFromSaveJar: (...args: unknown[]) => mockWithdrawFromSaveJar(...args),
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
  return new Request(`http://localhost/api/kids/${KID_ID}/jars/withdraw`, {
    method: "POST",
    headers: { "x-kid-session-token": "token" },
    body: JSON.stringify(body),
  });
}
const ctx = () => ({ params: Promise.resolve({ id: KID_ID }) });

const fakeTx = { insert: () => ({ values: async () => undefined }) };

beforeEach(() => {
  vi.clearAllMocks();
  mockVerifyKidSession.mockReturnValue(true);
  mockKidFindFirst.mockResolvedValue({ id: KID_ID, familyId: "fam-1", balance: 40 });
  mockTransaction.mockImplementation(async (fn) => fn(fakeTx));
});

describe("POST /api/kids/[id]/jars/withdraw", () => {
  it("returns 401 without a kid session", async () => {
    mockVerifyKidSession.mockReturnValueOnce(false);
    const res = await POST(makeReq({ amount: 10 }), ctx());
    expect(res.status).toBe(401);
  });

  it("rejects a non-positive or non-integer amount", async () => {
    expect((await POST(makeReq({ amount: 0 }), ctx())).status).toBe(400);
    expect((await POST(makeReq({ amount: 3.5 }), ctx())).status).toBe(400);
    expect(mockWithdrawFromSaveJar).not.toHaveBeenCalled();
  });

  it("moves coins back to Spend and reports balances on success", async () => {
    mockWithdrawFromSaveJar.mockResolvedValueOnce({ spend: 70, jarBalance: 70 });
    const res = await POST(makeReq({ amount: 30 }), ctx());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(mockWithdrawFromSaveJar).toHaveBeenCalledWith(fakeTx, KID_ID, 30);
    expect(body).toEqual({ moved: 30, spend: 70, saveBalance: 70 });
  });

  it("returns 400 when the Save jar lacks the coins (no fall-through)", async () => {
    mockWithdrawFromSaveJar.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ amount: 30 }), ctx());
    expect(res.status).toBe(400);
  });
});
