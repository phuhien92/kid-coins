import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// ── Supabase mock ─────────────────────────────────────────────────────────
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// ── DB mock ───────────────────────────────────────────────────────────────
const mockFindFirst = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { query: { families: { findFirst: (...args: unknown[]) => mockFindFirst(...args) } } },
}));

import { POST } from "./route";

const PARENT_UID = "parent-supabase-uid";

function makeReq(body: unknown) {
  return new Request("http://localhost/api/parent/verify-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: PARENT_UID } } });
});

describe("POST /api/parent/verify-pin", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await POST(makeReq({ pin: "1234" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid PIN format", async () => {
    const res = await POST(makeReq({ pin: "abc" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when family not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ pin: "1234" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 when no PIN is set on the family", async () => {
    mockFindFirst.mockResolvedValueOnce({ parentPinHash: null });
    const res = await POST(makeReq({ pin: "1234" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 for correct PIN", async () => {
    const hash = await bcrypt.hash("1234", 10);
    mockFindFirst.mockResolvedValueOnce({ parentPinHash: hash });
    const res = await POST(makeReq({ pin: "1234" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns 401 for wrong PIN", async () => {
    const hash = await bcrypt.hash("1234", 10);
    mockFindFirst.mockResolvedValueOnce({ parentPinHash: hash });
    const res = await POST(makeReq({ pin: "9999" }));
    expect(res.status).toBe(401);
  });
});
