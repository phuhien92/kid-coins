import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useApprovals } from "./useApprovals";

const LIST = {
  taskCompletions: [
    {
      id: "comp-1",
      taskId: "task-1",
      taskTitle: "Make bed",
      kidId: "kid-1",
      kidName: "Sam",
      coinsEarned: 10,
      paymentPercent: 100,
      bonusCoins: 0,
      status: "pending",
      completedAt: "2026-07-11T10:00:00.000Z",
    },
  ],
  redemptions: [
    {
      id: "red-1",
      kidId: "kid-1",
      kidName: "Sam",
      rewardId: "reward-1",
      rewardTitle: "Movie night",
      coinsSpent: 50,
      status: "pending",
      createdAt: "2026-07-11T09:00:00.000Z",
    },
  ],
  kids: [{ id: "kid-1", name: "Sam", avatarColor: "#F4D34E", balance: 20 }],
};

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  return vi.spyOn(global, "fetch").mockImplementation((input, init) =>
    Promise.resolve(handler(String(input), init as RequestInit))
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

async function renderLoaded() {
  const hook = renderHook(() => useApprovals());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("useApprovals", () => {
  it("loads pending queues and per-kid balances", async () => {
    mockFetch(() => new Response(JSON.stringify(LIST), { status: 200 }));
    const { result } = await renderLoaded();

    expect(result.current.taskCount).toBe(1);
    expect(result.current.redemptionCount).toBe(1);
    expect(result.current.kidsById["kid-1"].balance).toBe(20);
  });

  it("surfaces a load error", async () => {
    mockFetch(() => new Response("nope", { status: 500 }));
    const { result } = await renderLoaded();
    expect(result.current.error).toMatch(/couldn't load/i);
  });

  it("optimistically approves a task and credits the kid balance", async () => {
    mockFetch((url, init) => {
      if (init?.method === "POST") return new Response(JSON.stringify({ completion: {} }), { status: 200 });
      return new Response(JSON.stringify(LIST), { status: 200 });
    });
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.approveTask("comp-1");
    });

    expect(result.current.taskCount).toBe(0);
    expect(result.current.kidsById["kid-1"].balance).toBe(30);
  });

  it("debits the balance when a redemption is approved", async () => {
    mockFetch((url, init) => {
      if (init?.method === "POST") return new Response(JSON.stringify({ redemption: {} }), { status: 200 });
      return new Response(JSON.stringify(LIST), { status: 200 });
    });
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.approveRedemption("red-1");
    });

    expect(result.current.redemptionCount).toBe(0);
    // 20 balance − 50 spent, clamped to a non-negative floor
    expect(result.current.kidsById["kid-1"].balance).toBe(0);
  });

  it("restores the item and balance when the approve call fails", async () => {
    mockFetch((url, init) => {
      if (init?.method === "POST")
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
      return new Response(JSON.stringify(LIST), { status: 200 });
    });
    const { result } = await renderLoaded();

    await act(async () => {
      await expect(result.current.approveTask("comp-1")).rejects.toThrow();
    });

    expect(result.current.taskCount).toBe(1);
    expect(result.current.kidsById["kid-1"].balance).toBe(20);
  });
});
