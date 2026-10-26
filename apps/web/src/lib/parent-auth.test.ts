import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

const mockFamilyFindFirst = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      families: { findFirst: (...args: unknown[]) => mockFamilyFindFirst(...args) },
    },
  },
}));

import { getAuthenticatedParentFamily } from "./parent-auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAuthenticatedParentFamily", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await getAuthenticatedParentFamily();
    expect(result).toEqual({ error: 401 });
  });

  it("returns 404 when family not found", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "parent-1" } } });
    mockFamilyFindFirst.mockResolvedValueOnce(null);
    const result = await getAuthenticatedParentFamily();
    expect(result).toEqual({ error: 404 });
  });

  it("returns user and family on success", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "parent-1" } } });
    mockFamilyFindFirst.mockResolvedValueOnce({
      id: "family-1",
      parentUserId: "parent-1",
      name: "Test Family",
    });
    const result = await getAuthenticatedParentFamily();
    expect(result).toEqual({
      user: { id: "parent-1" },
      family: {
        id: "family-1",
        parentUserId: "parent-1",
        name: "Test Family",
      },
    });
  });
});
