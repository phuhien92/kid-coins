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

  it("keeps a sibling row's credit when a concurrent approval for the same kid fails", async () => {
    // Per-row busy state only locks the row that was clicked, so two rows for
    // the same kid can be in flight at once. Backing out a failure must remove
    // only its own delta, never restore a snapshot that predates the sibling.
    const multi = {
      ...LIST,
      taskCompletions: [
        { ...LIST.taskCompletions[0], id: "comp-1" },
        { ...LIST.taskCompletions[0], id: "comp-2" },
      ],
    };

    const release: Record<string, (res: Response) => void> = {};
    mockFetch((url, init) => {
      if (init?.method === "POST") {
        const id = url.includes("comp-1") ? "comp-1" : "comp-2";
        return new Promise<Response>((resolve) => {
          release[id] = resolve;
        });
      }
      return new Response(JSON.stringify(multi), { status: 200 });
    });

    const { result } = await renderLoaded();

    let first: Promise<unknown> | undefined;
    let second: Promise<unknown> | undefined;
    await act(async () => {
      first = result.current.approveTask("comp-1").catch(() => "failed");
      second = result.current.approveTask("comp-2");
      await waitFor(() => expect(Object.keys(release)).toHaveLength(2));
    });

    // Both optimistic credits are applied: 20 + 10 + 10.
    expect(result.current.kidsById["kid-1"].balance).toBe(40);

    await act(async () => {
      release["comp-2"](new Response(JSON.stringify({ completion: {} }), { status: 200 }));
      await second;
      release["comp-1"](new Response(JSON.stringify({ error: "Server error" }), { status: 500 }));
      await first;
    });

    // comp-1 rolled back, comp-2's credit survives: 20 + 10.
    expect(result.current.kidsById["kid-1"].balance).toBe(30);
    expect(result.current.taskCount).toBe(1);
  });

  it("surfaces a permanent server reason and hides transient ones", async () => {
    mockFetch((url, init) => {
      if (init?.method === "POST") {
        return url.includes("red-1")
          ? new Response(JSON.stringify({ error: "Reward is sold out" }), { status: 400 })
          : new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
      }
      return new Response(JSON.stringify(LIST), { status: 200 });
    });
    const { result } = await renderLoaded();

    await act(async () => {
      // A 400 will fail identically on retry, so the parent gets the reason.
      await expect(result.current.approveRedemption("red-1")).rejects.toThrow("Reward is sold out");
      // A 5xx is worth retrying and has nothing useful to say.
      await expect(result.current.approveTask("comp-1")).rejects.toThrow(/something went wrong/i);
    });
  });

  it("restores the pre-attempt balance when a clamped redemption approval fails", async () => {
    // Balance 20, redemption costs 50: the optimistic debit clamps to 0, so the
    // revert has to restore the snapshot (20) rather than add the 50 back.
    mockFetch((url, init) => {
      if (init?.method === "POST")
        return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
      return new Response(JSON.stringify(LIST), { status: 200 });
    });
    const { result } = await renderLoaded();

    await act(async () => {
      await expect(result.current.approveRedemption("red-1")).rejects.toThrow();
    });

    expect(result.current.redemptionCount).toBe(1);
    expect(result.current.kidsById["kid-1"].balance).toBe(20);
  });

  it("approves redemptions one at a time so each request sees the prior debit", async () => {
    const multi = {
      ...LIST,
      redemptions: [
        { ...LIST.redemptions[0], id: "red-1", coinsSpent: 30 },
        { ...LIST.redemptions[0], id: "red-2", coinsSpent: 50 },
      ],
      kids: [{ id: "kid-1", name: "Sam", avatarColor: "#F4D34E", balance: 100 }],
    };

    let inFlight = 0;
    let maxInFlight = 0;
    mockFetch(async (url, init) => {
      if (init?.method === "POST") {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 0));
        inFlight -= 1;
        return new Response(JSON.stringify({ redemption: {} }), { status: 200 });
      }
      return new Response(JSON.stringify(multi), { status: 200 });
    });

    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.approveAllRedemptions();
    });

    // Fired in parallel, the batch's own members would be settled against the
    // same committed balance and stock, and the losers rejected.
    expect(maxInFlight).toBe(1);
    expect(result.current.redemptionCount).toBe(0);
    expect(result.current.kidsById["kid-1"].balance).toBe(20);
  });

  it("approves tasks one at a time and reports partial bulk failures", async () => {
    const multi = {
      ...LIST,
      taskCompletions: [
        { ...LIST.taskCompletions[0], id: "comp-1" },
        { ...LIST.taskCompletions[0], id: "comp-2" },
      ],
    };

    let inFlight = 0;
    let maxInFlight = 0;
    mockFetch(async (url, init) => {
      if (init?.method === "POST") {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 0));
        inFlight -= 1;
        const failed = url.includes("comp-2");
        return new Response(JSON.stringify(failed ? { error: "Server error" } : { completion: {} }), {
          status: failed ? 500 : 200,
        });
      }
      return new Response(JSON.stringify(multi), { status: 200 });
    });

    const { result } = await renderLoaded();

    await act(async () => {
      await expect(result.current.approveAllTasks()).rejects.toThrow(
        /something went wrong/i
      );
    });

    expect(maxInFlight).toBe(1);
    // The successful one is gone and credited; the failed one is restored.
    expect(result.current.taskCount).toBe(1);
    expect(result.current.kidsById["kid-1"].balance).toBe(30);
  });

  it("surfaces the server's reason when a bulk approval is rejected", async () => {
    const multi = {
      ...LIST,
      redemptions: [
        { ...LIST.redemptions[0], id: "red-1", coinsSpent: 10 },
        { ...LIST.redemptions[0], id: "red-2", coinsSpent: 10 },
      ],
    };

    mockFetch(async (url, init) => {
      if (init?.method === "POST") {
        const soldOut = url.includes("red-2");
        return new Response(
          JSON.stringify(soldOut ? { error: "Reward is sold out" } : { redemption: {} }),
          { status: soldOut ? 400 : 200 }
        );
      }
      return new Response(JSON.stringify(multi), { status: 200 });
    });

    const { result } = await renderLoaded();

    await act(async () => {
      await expect(result.current.approveAllRedemptions()).rejects.toThrow(
        "Reward is sold out"
      );
    });

    expect(result.current.redemptionCount).toBe(1);
    expect(result.current.kidsById["kid-1"].balance).toBe(10);
  });

  it("counts the failures and names one reason when a batch fails several ways", async () => {
    const multi = {
      ...LIST,
      redemptions: [
        { ...LIST.redemptions[0], id: "red-1", coinsSpent: 10 },
        { ...LIST.redemptions[0], id: "red-2", coinsSpent: 10 },
      ],
    };

    mockFetch(async (url, init) => {
      if (init?.method === "POST") {
        const reason = url.includes("red-1") ? "Reward is sold out" : "Insufficient balance";
        return new Response(JSON.stringify({ error: reason }), { status: 400 });
      }
      return new Response(JSON.stringify(multi), { status: 200 });
    });

    const { result } = await renderLoaded();

    await act(async () => {
      await expect(result.current.approveAllRedemptions()).rejects.toThrow(
        "2 couldn't be approved — Reward is sold out"
      );
    });

    // Both rows are restored and neither debit stuck.
    expect(result.current.redemptionCount).toBe(2);
    expect(result.current.kidsById["kid-1"].balance).toBe(20);
  });
});
