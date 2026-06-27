import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase mock ─────────────────────────────────────────────────────────
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// ── DB mock ───────────────────────────────────────────────────────────────
const mockFamilyFindFirst = vi.fn();
const mockKidFindFirst = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      families: { findFirst: (...args: unknown[]) => mockFamilyFindFirst(...args) },
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
    },
  },
}));

// ── kid-session.server mock ───────────────────────────────────────────────
vi.mock("@/lib/kid-session.server", () => ({
  issueKidSessionToken: (id: string) => `mock-token-for-${id}`,
}));

import { POST } from "./route";

const PARENT_UID = "parent-uid-1";
const FAMILY_ID = "family-1";
const KID_ID = "kid-1";

function makeReq(kidId: string = KID_ID) {
  return new Request(`http://localhost/api/kids/${kidId}/session`, {
    method: "POST",
  });
}

function makeCtx(kidId: string = KID_ID) {
  return { params: Promise.resolve({ id: kidId }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: PARENT_UID } } });
  mockFamilyFindFirst.mockResolvedValue({ id: FAMILY_ID });
  mockKidFindFirst.mockResolvedValue({ id: KID_ID });
});

describe("POST /api/kids/[id]/session", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await POST(makeReq(), makeCtx());
    expect(res.status).toBe(401);
  });

  it("returns 404 when family not found", async () => {
    mockFamilyFindFirst.mockResolvedValueOnce(null);
    const res = await POST(makeReq(), makeCtx());
    expect(res.status).toBe(404);
  });

  it("returns 404 when kid not found in family", async () => {
    mockKidFindFirst.mockResolvedValueOnce(null);
    const res = await POST(makeReq(), makeCtx());
    expect(res.status).toBe(404);
  });

  it("returns 200 with sessionToken on success", async () => {
    const res = await POST(makeReq(), makeCtx());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionToken).toBe(`mock-token-for-${KID_ID}`);
  });
});
