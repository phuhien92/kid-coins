import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("@/lib/kid-session", () => ({
  kidSessionHeaders: () => ({ "x-kid-id": "kid-1", "x-kid-session-token": "tok" }),
}));

import { useJars } from "./useJars";

const JARS_BODY = {
  jars: { spend: 40, save: 100, give: 5 },
  interest: { rateBps: 500, projectedNextWeek: 5 },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  return vi.spyOn(global, "fetch").mockImplementation((input, init) =>
    Promise.resolve(handler(String(input), init as RequestInit))
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useJars", () => {
  it("loads the three buckets and projected interest", async () => {
    mockFetch(() => jsonResponse(JARS_BODY));
    const { result } = renderHook(() => useJars("kid-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.jars).toEqual({ spend: 40, save: 100, give: 5 });
    expect(result.current.interest).toEqual({ rateBps: 500, projectedNextWeek: 5 });
  });

  it("does not fetch when there is no kid id", async () => {
    const fetchSpy = mockFetch(() => jsonResponse(JARS_BODY));
    const { result } = renderHook(() => useJars(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.jars).toBeNull();
  });

  it("applies the server balances returned by an allocate", async () => {
    // GET reflects the post-move state, so the background reconcile confirms
    // rather than clobbers the optimistic values.
    let current = { spend: 40, save: 100, give: 5 };
    mockFetch((url, init) => {
      if (url.endsWith("/jars/allocate")) {
        const body = JSON.parse(String(init?.body));
        expect(body).toEqual({ jarType: "save", amount: 25 });
        current = { ...current, spend: 15, save: 125 };
        return jsonResponse({ jarType: "save", moved: 25, spend: 15, jarBalance: 125 });
      }
      return jsonResponse({ jars: current, interest: { rateBps: 500, projectedNextWeek: 6 } });
    });

    const { result } = renderHook(() => useJars("kid-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.allocate("save", 25);
    });

    await waitFor(() => expect(result.current.jars?.spend).toBe(15));
    expect(result.current.jars?.save).toBe(125);
  });

  it("rejects an allocate with the server's actionable message", async () => {
    mockFetch((url) =>
      url.endsWith("/jars/allocate")
        ? jsonResponse({ error: "Not enough coins to move" }, 400)
        : jsonResponse(JARS_BODY)
    );

    const { result } = renderHook(() => useJars("kid-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.allocate("save", 999)).rejects.toThrow(
      "Not enough coins to move"
    );
  });

  it("applies the server balances returned by a withdraw", async () => {
    let current = { spend: 40, save: 100, give: 5 };
    mockFetch((url) => {
      if (url.endsWith("/jars/withdraw")) {
        current = { ...current, spend: 70, save: 70 };
        return jsonResponse({ moved: 30, spend: 70, saveBalance: 70 });
      }
      return jsonResponse({ jars: current, interest: { rateBps: 500, projectedNextWeek: 3 } });
    });

    const { result } = renderHook(() => useJars("kid-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.withdraw(30);
    });

    await waitFor(() => expect(result.current.jars?.spend).toBe(70));
    expect(result.current.jars?.save).toBe(70);
  });
});
