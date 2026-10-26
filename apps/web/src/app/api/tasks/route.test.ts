import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAuthenticatedParentFamily = vi.fn();
vi.mock("@/lib/parent-auth", () => ({
  getAuthenticatedParentFamily: () => mockGetAuthenticatedParentFamily(),
}));

const mockKidFindMany = vi.fn();
const mockTasksFindMany = vi.fn();
const mockKidFindFirst = vi.fn();
const mockInsertReturning = vi.fn();
const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: {
        findMany: (...args: unknown[]) => mockKidFindMany(...args),
        findFirst: (...args: unknown[]) => mockKidFindFirst(...args),
      },
      tasks: {
        findMany: (...args: unknown[]) => mockTasksFindMany(...args),
      },
    },
    insert: () => ({ values: mockInsertValues }),
  },
}));

import { GET, POST } from "./route";

const FAMILY = { id: "family-1", parentUserId: "parent-1", name: "Family" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthenticatedParentFamily.mockResolvedValue({ user: { id: "parent-1" }, family: FAMILY });
});

describe("GET /api/tasks", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetAuthenticatedParentFamily.mockResolvedValueOnce({ error: 401 });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty list when family has no kids", async () => {
    mockKidFindMany.mockResolvedValueOnce([]);
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ tasks: [] });
  });
});

describe("POST /api/tasks", () => {
  it("returns 400 when title missing", async () => {
    const res = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify({ kidId: "kid-1" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates a task for a family kid", async () => {
    mockKidFindFirst.mockResolvedValueOnce({ id: "kid-1", name: "Sam" });
    mockInsertReturning.mockResolvedValueOnce([
      {
        id: "task-1",
        kidId: "kid-1",
        title: "Brush teeth",
        emoji: "🦷",
        type: "daily",
        coinReward: 10,
        scheduledStartAt: null,
        durationDays: null,
        isActive: true,
        createdAt: new Date("2026-06-01T00:00:00Z"),
      },
    ]);

    const res = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          kidId: "kid-1",
          title: "Brush teeth",
          emoji: "🦷",
          type: "daily",
          coinReward: 10,
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.task.title).toBe("Brush teeth");
    expect(body.task.kidName).toBe("Sam");
  });
});
