"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RedemptionRequest, TaskCompletion } from "@/types";

export type ApprovalKid = {
  id: string;
  name: string;
  avatarColor: string;
  balance: number;
};

export type UseApprovalsResult = {
  loading: boolean;
  error: string;
  taskCompletions: TaskCompletion[];
  redemptions: RedemptionRequest[];
  kidsById: Record<string, ApprovalKid>;
  taskCount: number;
  redemptionCount: number;
  approveTask: (id: string) => Promise<void>;
  declineTask: (id: string, reason?: string) => Promise<void>;
  approveRedemption: (id: string) => Promise<void>;
  declineRedemption: (id: string, reason?: string) => Promise<void>;
  approveAllTasks: () => Promise<void>;
  approveAllRedemptions: () => Promise<void>;
  refresh: () => void;
};

type ApprovalsResponse = {
  taskCompletions: TaskCompletion[];
  redemptions: RedemptionRequest[];
  kids: ApprovalKid[];
};

/** Shown when the failure is transient or has no actionable server-side reason. */
const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Throws an Error whose message is safe to show a parent verbatim.
 *
 * A 4xx carries a permanent, actionable reason ("Reward is sold out",
 * "Insufficient balance", "Redemption already resolved") that retrying cannot
 * fix, so it is surfaced as-is. Network faults and 5xx are worth retrying and
 * have nothing useful to say, so they collapse to a generic message.
 */
async function postAction(url: string, reason?: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reason ? { reason } : {}),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const serverReason = typeof data.error === "string" ? data.error.trim() : "";
    throw new Error(res.status >= 500 || !serverReason ? GENERIC_ERROR : serverReason);
  }
}

/**
 * State whose latest value is readable synchronously, before React re-renders.
 *
 * Approvals are applied one after another across `await` boundaries, so each
 * step has to see the result of the step before it rather than the value
 * captured when the callback was created.
 */
function useLiveState<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const ref = useRef<T>(initial);

  const update = useCallback((next: T | ((current: T) => T)) => {
    ref.current =
      typeof next === "function" ? (next as (current: T) => T)(ref.current) : next;
    setState(ref.current);
  }, []);

  return [state, update, ref] as const;
}

/**
 * Data hook powering the parent Approvals page.
 *
 * Owns the pending task-completion and redemption queues plus a live per-kid
 * balance map. Every mutation is optimistic: the item is removed (and the kid's
 * balance adjusted) immediately so the row can slide out, then the API is
 * called. On failure the item is restored and the mutation's own balance delta
 * is backed out, then the error is re-thrown so the page can surface a toast.
 *
 * Balances are stored unclamped and clamped only on the way out. Several rows
 * for the same kid can be in flight at once, so reverts have to compose: adding
 * and later subtracting the same delta is exact, whereas clamping on write (or
 * restoring an absolute snapshot) would discard a sibling row's delta.
 */
export function useApprovals(): UseApprovalsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskCompletions, setTaskCompletions, taskRef] = useLiveState<TaskCompletion[]>([]);
  const [redemptions, setRedemptions, redemptionRef] = useLiveState<RedemptionRequest[]>([]);
  const [rawKidsById, setKidsById] = useLiveState<Record<string, ApprovalKid>>({});

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/parent/approvals")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((data: ApprovalsResponse) => {
        setTaskCompletions(data.taskCompletions ?? []);
        setRedemptions(data.redemptions ?? []);
        setKidsById(
          Object.fromEntries((data.kids ?? []).map((kid) => [kid.id, kid]))
        );
      })
      .catch(() => setError("Couldn't load approvals. Please try again."))
      .finally(() => setLoading(false));
  }, [setTaskCompletions, setRedemptions, setKidsById]);

  useEffect(() => {
    load();
  }, [load]);

  const applyBalanceDelta = useCallback(
    (kidId: string, delta: number) => {
      if (delta === 0) return;
      setKidsById((current) => {
        const kid = current[kidId];
        if (!kid) return current;
        return { ...current, [kidId]: { ...kid, balance: kid.balance + delta } };
      });
    },
    [setKidsById]
  );

  const resolveTask = useCallback(
    async (id: string, action: "approve" | "decline", reason?: string) => {
      const item = taskRef.current.find((completion) => completion.id === id);
      if (!item) return;
      const delta = action === "approve" ? item.coinsEarned : 0;

      // Optimistic removal + (on approve) live balance credit.
      setTaskCompletions((current) => current.filter((c) => c.id !== id));
      applyBalanceDelta(item.kidId, delta);

      try {
        await postAction(`/api/parent/approvals/task/${id}/${action}`, reason);
      } catch (err) {
        // Restore the row and back out only this attempt's own credit.
        setTaskCompletions((current) =>
          current.some((c) => c.id === id) ? current : [item, ...current]
        );
        applyBalanceDelta(item.kidId, -delta);
        throw err;
      }
    },
    [taskRef, setTaskCompletions, applyBalanceDelta]
  );

  const resolveRedemption = useCallback(
    async (id: string, action: "approve" | "decline", reason?: string) => {
      const item = redemptionRef.current.find((redemption) => redemption.id === id);
      if (!item) return;
      const delta = action === "approve" ? -item.coinsSpent : 0;

      // Optimistic removal + (on approve) live balance debit.
      setRedemptions((current) => current.filter((r) => r.id !== id));
      applyBalanceDelta(item.kidId, delta);

      try {
        await postAction(`/api/parent/approvals/redemption/${id}/${action}`, reason);
      } catch (err) {
        setRedemptions((current) =>
          current.some((r) => r.id === id) ? current : [item, ...current]
        );
        applyBalanceDelta(item.kidId, -delta);
        throw err;
      }
    },
    [redemptionRef, setRedemptions, applyBalanceDelta]
  );

  const approveTask = useCallback((id: string) => resolveTask(id, "approve"), [resolveTask]);
  const declineTask = useCallback(
    (id: string, reason?: string) => resolveTask(id, "decline", reason),
    [resolveTask]
  );
  const approveRedemption = useCallback(
    (id: string) => resolveRedemption(id, "approve"),
    [resolveRedemption]
  );
  const declineRedemption = useCallback(
    (id: string, reason?: string) => resolveRedemption(id, "decline", reason),
    [resolveRedemption]
  );

  /**
   * Bulk approvals run one at a time, never in parallel: the approve routes
   * check the kid's balance and the reward's remaining stock *before* opening
   * their transaction, so concurrent requests would all read the same
   * pre-debit state and each be allowed through.
   */
  const approveAllTasks = useCallback(async () => {
    const ids = taskRef.current.map((completion) => completion.id);
    let failed = false;
    for (const id of ids) {
      try {
        await resolveTask(id, "approve");
      } catch {
        failed = true;
      }
    }
    if (failed) throw new Error("Some approvals couldn't be saved");
  }, [taskRef, resolveTask]);

  const approveAllRedemptions = useCallback(async () => {
    const ids = redemptionRef.current.map((redemption) => redemption.id);
    let failed = false;
    for (const id of ids) {
      try {
        await resolveRedemption(id, "approve");
      } catch {
        failed = true;
      }
    }
    if (failed) throw new Error("Some approvals couldn't be saved");
  }, [redemptionRef, resolveRedemption]);

  // An in-flight debit can drive the stored total below zero; the server floors
  // debits at zero and rejects any redemption the kid can't afford, so the
  // shortfall is always transient and only the displayed value is clamped.
  const kidsById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(rawKidsById).map(([id, kid]) => [
          id,
          kid.balance < 0 ? { ...kid, balance: 0 } : kid,
        ])
      ),
    [rawKidsById]
  );

  return {
    loading,
    error,
    taskCompletions,
    redemptions,
    kidsById,
    taskCount: taskCompletions.length,
    redemptionCount: redemptions.length,
    approveTask,
    declineTask,
    approveRedemption,
    declineRedemption,
    approveAllTasks,
    approveAllRedemptions,
    refresh: load,
  };
}
