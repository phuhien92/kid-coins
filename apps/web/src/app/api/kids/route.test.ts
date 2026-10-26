import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

const mockTransaction = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock("@/lib/family", () => ({
  getOrCreateFamily: vi.fn().mockResolvedValue({ id: "family-1" }),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-pin"),
  },
}));

import { POST } from "./route";

const PARENT_UID = "parent-uid-1";

function makePost(body: Record<string, unknown>) {
  return new Request("http://localhost/api/kids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: PARENT_UID } } });
  mockTransaction.mockImplementation(async (callback) =>
    callback({
      insert: () => ({
        values: () => ({
          returning: async () => [
            {
              id: "kid-1",
              name: "Emma",
              avatarColor: "var(--color-mint)",
              balance: 0,
            },
          ],
        }),
      }),
    })
  );
});

describe("POST /api/kids", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const res = await POST(makePost({ name: "Emma", pin: "1234" }));
    expect(res.status).toBe(401);
  });

  it("creates a kid with guild character data", async () => {
    const res = await POST(
      makePost({
        name: "Emma",
        pin: "1234",
        character: {
          outfit: "wizard",
          color: "mint",
          bg: "lav",
        },
      })
    );

    expect(res.status).toBe(201);
    const payload = await res.json();
    expect(payload.kid.name).toBe("Emma");
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("rejects locked outfits at signup", async () => {
    const res = await POST(
      makePost({
        name: "Emma",
        pin: "1234",
        character: {
          outfit: "knight",
          color: "yellow",
        },
      })
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid character selection");
  });
});
