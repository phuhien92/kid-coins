import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyKidSession = vi.fn();
vi.mock("@/lib/kid-session.server", () => ({
  verifyKidSession: (...args: unknown[]) => mockVerifyKidSession(...args),
}));

const mockKidFindFirst = vi.fn();
const mockJarsFindMany = vi.fn();
const mockSettingsFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
      jars: { findMany: (...args: unknown[]) => mockJarsFindMany(...args) },
      familySettings: { findFirst: (...args: unknown[]) => mockSettingsFindFirst(...args) },
    },
  },
}));

import { GET } from "./route";

const KID_ID = "kid-1";

function makeReq() {
  return new Request(`http://localhost/api/kids/${KID_ID}/jars`, {
    headers: { "x-kid-session-token": "token" },
  });
}
const ctx = () => ({ params: Promise.resolve({ id: KID_ID }) });

beforeEach(() => {
  vi.clearAllMocks();
  mockVerifyKidSession.mockReturnValue(true);
  mockKidFindFirst.mockResolvedValue({ id: KID_ID, familyId: "fam-1", balance: 40 });
  mockJarsFindMany.mockResolvedValue([
    { type: "save", balance: 100 },
    { type: "give", balance: 12 },
  ]);
  mockSettingsFindFirst.mockResolvedValue({ saveInterestBps: 500 });
});

describe("GET /api/kids/[id]/jars", () => {
  it("returns 401 without a kid session", async () => {
    mockVerifyKidSession.mockReturnValueOnce(false);
    const res = await GET(makeReq(), ctx());
    expect(res.status).toBe(401);
  });

  it("returns 404 when the kid does not exist", async () => {
    mockKidFindFirst.mockResolvedValueOnce(null);
    const res = await GET(makeReq(), ctx());
    expect(res.status).toBe(404);
  });

  it("returns the three buckets and projected weekly interest", async () => {
    const res = await GET(makeReq(), ctx());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.jars).toEqual({ spend: 40, save: 100, give: 12 });
    // 5% of 100 = 5
    expect(body.interest).toEqual({ rateBps: 500, projectedNextWeek: 5 });
  });

  it("defaults missing jars and rate to zero", async () => {
    mockJarsFindMany.mockResolvedValueOnce([]);
    mockSettingsFindFirst.mockResolvedValueOnce(undefined);
    const res = await GET(makeReq(), ctx());
    const body = await res.json();
    expect(body.jars).toEqual({ spend: 40, save: 0, give: 0 });
    expect(body.interest).toEqual({ rateBps: 0, projectedNextWeek: 0 });
  });
});
