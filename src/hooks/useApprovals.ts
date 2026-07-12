"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

async function postAction(url: string, reason?: string): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reason ? { reason } : {}),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Request failed");
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
 * called. On failure the item is restored and the kid's balance is rolled back
 * to the value it held before the attempt, then the error is re-thrown so the
 * page can surface a toast.
 */
export function useApprovals(): UseApprovalsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskCompletions, setTaskCompletions, taskRef] = useLiveState<TaskCompletion[]>([]);
  const [redemptions, setRedemptions, redemptionRef] = useLiveState<RedemptionRequest[]>([]);
  const [kidsById, setKidsById, kidsRef] = useLiveState<Record<string, ApprovalKid>>({});

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

  const setBalance = useCallback(
    (kidId: string, balance: number) => {
      setKidsById((current) => {
        const kid = current[kidId];
        if (!kid) return current;
        return { ...current, [kidId]: { ...kid, balance } };
      });
    },
    [setKidsById]
  );

  const resolveTask = useCallback(
    async (id: string, action: "approve" | "decline", reason?: string) => {
      const item = taskRef.current.find((completion) => completion.id === id);
      if (!item) return;
      const previousBalance = kidsRef.current[item.kidId]?.balance;

      // Optimistic removal + (on approve) live balance credit.
      setTaskCompletions((current) => current.filter((c) => c.id !== id));
      if (action === "approve" && previousBalance !== undefined) {
        setBalance(item.kidId, previousBalance + item.coinsEarned);
      }

      try {
        await postAction(`/api/parent/approvals/task/${id}/${action}`, reason);
      } catch (err) {
        // Restore the row and the pre-attempt balance so the UI matches the server.
        setTaskCompletions((current) =>
          current.some((c) => c.id === id) ? current : [item, ...current]
        );
        if (action === "approve" && previousBalance !== undefined) {
          setBalance(item.kidId, previousBalance);
        }
        throw err;
      }
    },
    [taskRef, kidsRef, setTaskCompletions, setBalance]
  );

  const resolveRedemption = useCallback(
    async (id: string, action: "approve" | "decline", reason?: string) => {
      const item = redemptionRef.current.find((redemption) => redemption.id === id);
      if (!item) return;
      const previousBalance = kidsRef.current[item.kidId]?.balance;

      // Optimistic removal + (on approve) live balance debit.
      setRedemptions((current) => current.filter((r) => r.id !== id));
      if (action === "approve" && previousBalance !== undefined) {
        setBalance(item.kidId, Math.max(0, previousBalance - item.coinsSpent));
      }

      try {
        await postAction(`/api/parent/approvals/redemption/${id}/${action}`, reason);
      } catch (err) {
        setRedemptions((current) =>
          current.some((r) => r.id === id) ? current : [item, ...current]
        );
        if (action === "approve" && previousBalance !== undefined) {
          setBalance(item.kidId, previousBalance);
        }
        throw err;
      }
    },
    [redemptionRef, kidsRef, setRedemptions, setBalance]
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
