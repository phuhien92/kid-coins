import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Make Framer Motion deterministic in jsdom: pass children through and strip
// motion-only props so optimistic add/remove is synchronous and assertable.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(function M(props, ref) {
      const { children, initial, animate, exit, transition, layout, ...rest } = props as {
        children?: React.ReactNode;
        [key: string]: unknown;
      };
      void initial;
      void animate;
      void exit;
      void transition;
      void layout;
      return React.createElement(tag, { ...rest, ref }, children as React.ReactNode);
    });
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy({}, { get: (_t, tag: string) => passthrough(tag) }),
  };
});

import ParentApprovalsPage from "./page";

function makeList(taskCount: number) {
  return {
    taskCompletions: Array.from({ length: taskCount }, (_, i) => ({
      id: `comp-${i + 1}`,
      taskId: `task-${i + 1}`,
      taskTitle: `Task ${i + 1}`,
      kidId: "kid-1",
      kidName: "Sam",
      coinsEarned: 10,
      paymentPercent: 100,
      bonusCoins: 0,
      status: "pending",
      completedAt: "2026-07-11T10:00:00.000Z",
    })),
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
}

type FetchCall = { url: string; method: string; body: unknown };
let calls: FetchCall[] = [];

function installFetch(options: {
  list?: ReturnType<typeof makeList>;
  postStatus?: number;
} = {}) {
  const list = options.list ?? makeList(1);
  const postStatus = options.postStatus ?? 200;
  vi.spyOn(global, "fetch").mockImplementation((input, init) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, method, body });
    if (method === "POST") {
      return Promise.resolve(
        new Response(JSON.stringify(postStatus === 200 ? { ok: true } : { error: "Server error" }), {
          status: postStatus,
        })
      );
    }
    return Promise.resolve(new Response(JSON.stringify(list), { status: 200 }));
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  calls = [];
});

async function renderPage() {
  render(<ParentApprovalsPage />);
  await waitFor(() => expect(screen.getByRole("tab", { name: /Tasks/ })).toBeInTheDocument());
}

describe("ParentApprovalsPage", () => {
  it("renders both tabs with pending counts and a task row", async () => {
    installFetch();
    await renderPage();

    const tasksTab = screen.getByRole("tab", { name: /Tasks/ });
    expect(within(tasksTab).getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText(/Task completed/)).toBeInTheDocument();
  });

  it("approves a task: calls the approve endpoint, removes the row, and toasts", async () => {
    const user = userEvent.setup();
    installFetch();
    await renderPage();

    await user.click(screen.getByRole("button", { name: /Approve/ }));

    await waitFor(() => expect(screen.queryByText("Task 1")).not.toBeInTheDocument());
    expect(calls.some((c) => c.url.endsWith("/api/parent/approvals/task/comp-1/approve"))).toBe(true);
    expect(await screen.findByText(/coins sent to Sam/)).toBeInTheDocument();

    // Tab badge count drops from 1 to 0 (badge removed).
    const tasksTab = screen.getByRole("tab", { name: /Tasks/ });
    expect(within(tasksTab).queryByText("1")).not.toBeInTheDocument();
  });

  it("declines a task with an optional reason via the modal", async () => {
    const user = userEvent.setup();
    installFetch();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Not now" }));
    await user.type(screen.getByLabelText(/Reason/), "Bed wasn't made");
    await user.click(screen.getByRole("button", { name: "Decline" }));

    await waitFor(() => expect(screen.queryByText("Task 1")).not.toBeInTheDocument());
    const declineCall = calls.find((c) =>
      c.url.endsWith("/api/parent/approvals/task/comp-1/decline")
    );
    expect(declineCall).toBeDefined();
    expect(declineCall?.body).toEqual({ reason: "Bed wasn't made" });
  });

  it("restores the row and shows an error toast when approve fails", async () => {
    const user = userEvent.setup();
    installFetch({ postStatus: 500 });
    await renderPage();

    await user.click(screen.getByRole("button", { name: /Approve/ }));

    // A 5xx is worth retrying and has no actionable reason to give.
    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
    // Row is restored after the failed request.
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("toasts the server's reason when an approval can never succeed", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockImplementation((input, init) => {
      const method = (init?.method ?? "GET").toUpperCase();
      if (method === "POST") {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Reward is sold out" }), { status: 400 })
        );
      }
      return Promise.resolve(new Response(JSON.stringify(makeList(1)), { status: 200 }));
    });
    await renderPage();

    await user.click(screen.getByRole("tab", { name: /Rewards/ }));
    await user.click(screen.getByRole("button", { name: /Approve/ }));

    // Retrying a sold-out reward fails identically, so say why instead of "try again".
    expect(await screen.findByText("Reward is sold out")).toBeInTheDocument();
    expect(screen.getByText("Movie night")).toBeInTheDocument();
  });

  it("shows Approve all when a tab has more than 3 pending and approves them all", async () => {
    const user = userEvent.setup();
    installFetch({ list: makeList(4) });
    await renderPage();

    const approveAll = screen.getByRole("button", { name: /Approve all \(4\)/ });
    await user.click(approveAll);

    await waitFor(() => expect(screen.queryByText("Task 1")).not.toBeInTheDocument());
    const approveCalls = calls.filter((c) => c.url.includes("/task/") && c.url.endsWith("/approve"));
    expect(approveCalls).toHaveLength(4);
  });

  it("renders the kid's balance on each row and updates it on approval", async () => {
    const user = userEvent.setup();
    installFetch({ list: makeList(2) });
    await renderPage();

    const chips = screen.getAllByLabelText(/Sam's balance/);
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent("20");

    // Approving one 10-coin task credits Sam, so the remaining row's chip follows.
    await user.click(screen.getAllByRole("button", { name: /Approve/ })[0]);

    await waitFor(() => {
      const remaining = screen.getAllByLabelText(/Sam's balance/);
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toHaveTextContent("30");
    });
  });

  it("serializes the batch and locks the UI while Approve all is in flight", async () => {
    const user = userEvent.setup();
    let releaseFirst: (() => void) | undefined;
    let posts = 0;
    vi.spyOn(global, "fetch").mockImplementation((input, init) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      calls.push({ url, method, body: undefined });
      if (method === "POST") {
        posts += 1;
        const ok = new Response(JSON.stringify({ ok: true }), { status: 200 });
        // Park only the first request so the batch is observably mid-flight.
        if (posts === 1) {
          return new Promise<Response>((resolve) => {
            releaseFirst = () => resolve(ok);
          });
        }
        return Promise.resolve(ok);
      }
      return Promise.resolve(new Response(JSON.stringify(makeList(4)), { status: 200 }));
    });
    await renderPage();

    await user.click(screen.getByRole("button", { name: /Approve all \(4\)/ }));

    await waitFor(() => expect(screen.getByRole("button", { name: /Approving/ })).toBeDisabled());
    // Only the parked request has been sent — the other three wait their turn,
    // so each one sees the previous debit/credit committed.
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(1);
    // Rows are locked too, so a stray click can't interleave with the batch.
    expect(screen.getAllByRole("button", { name: "Not now" })[0]).toBeDisabled();

    await act(async () => {
      releaseFirst?.();
    });

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Approving/ })).not.toBeInTheDocument()
    );
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(4);
  });

  it("locks every approval while a single row's approval is in flight", async () => {
    const user = userEvent.setup();
    let release: (() => void) | undefined;
    vi.spyOn(global, "fetch").mockImplementation((input, init) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      calls.push({ url, method, body: undefined });
      if (method === "POST") {
        return new Promise<Response>((resolve) => {
          release = () => resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        });
      }
      return Promise.resolve(new Response(JSON.stringify(makeList(5)), { status: 200 }));
    });
    await renderPage();

    const rowButtons = () => screen.getAllByRole("button", { name: /✓ Approve$/ });
    await user.click(rowButtons()[0]);

    // A second approval would race the first: both would settle against the
    // same pre-credit balance and stock server-side.
    await waitFor(() => expect(rowButtons()[1]).toBeDisabled());
    expect(screen.getByRole("button", { name: /Approve all/ })).toBeDisabled();

    await user.click(rowButtons()[1]);
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(1);

    await act(async () => {
      release?.();
    });

    await waitFor(() => expect(rowButtons()[0]).toBeEnabled());
  });

  it("offers a retry that refetches when the initial load fails", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    vi.spyOn(global, "fetch").mockImplementation(() => {
      attempt += 1;
      if (attempt === 1) return Promise.resolve(new Response("nope", { status: 500 }));
      return Promise.resolve(new Response(JSON.stringify(makeList(1)), { status: 200 }));
    });

    render(<ParentApprovalsPage />);

    const retry = await screen.findByRole("button", { name: "Try again" });
    expect(screen.getByRole("alert")).toHaveTextContent(/Couldn't load approvals/);

    await user.click(retry);

    expect(await screen.findByText("Task 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });
});
