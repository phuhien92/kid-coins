"use client";

import { useCallback, useEffect, useState } from "react";
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
 * Data hook powering the parent Approvals page.
 *
 * Owns the pending task-completion and redemption queues plus a live per-kid
 * balance map. Every mutation is optimistic: the item is removed (and the kid's
 * balance adjusted) immediately so the row can slide out, then the API is
 * called. On failure the item and balance are restored and the error is
 * re-thrown so the page can surface a toast.
 */
export function useApprovals(): UseApprovalsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const [kidsById, setKidsById] = useState<Record<string, ApprovalKid>>({});

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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const adjustBalance = useCallback((kidId: string, delta: number) => {
    setKidsById((current) => {
      const kid = current[kidId];
      if (!kid) return current;
      return {
        ...current,
        [kidId]: { ...kid, balance: Math.max(0, kid.balance + delta) },
      };
    });
  }, []);

  const resolveTask = useCallback(
    async (id: string, action: "approve" | "decline", reason?: string) => {
      const item = taskCompletions.find((completion) => completion.id === id);
      if (!item) return;

      // Optimistic removal + (on approve) live balance credit.
      setTaskCompletions((current) => current.filter((c) => c.id !== id));
      if (action === "approve") adjustBalance(item.kidId, item.coinsEarned);

      try {
        await postAction(`/api/parent/approvals/task/${id}/${action}`, reason);
      } catch (err) {
        // Restore the row and revert the balance so the UI matches the server.
        setTaskCompletions((current) =>
          current.some((c) => c.id === id) ? current : [item, ...current]
        );
        if (action === "approve") adjustBalance(item.kidId, -item.coinsEarned);
        throw err;
      }
    },
    [taskCompletions, adjustBalance]
  );

  const resolveRedemption = useCallback(
    async (id: string, action: "approve" | "decline", reason?: string) => {
      const item = redemptions.find((redemption) => redemption.id === id);
      if (!item) return;

      // Optimistic removal + (on approve) live balance debit.
      setRedemptions((current) => current.filter((r) => r.id !== id));
      if (action === "approve") adjustBalance(item.kidId, -item.coinsSpent);

      try {
        await postAction(`/api/parent/approvals/redemption/${id}/${action}`, reason);
      } catch (err) {
        setRedemptions((current) =>
          current.some((r) => r.id === id) ? current : [item, ...current]
        );
        if (action === "approve") adjustBalance(item.kidId, item.coinsSpent);
        throw err;
      }
    },
    [redemptions, adjustBalance]
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

  const approveAllTasks = useCallback(async () => {
    const ids = taskCompletions.map((completion) => completion.id);
    const results = await Promise.allSettled(ids.map((id) => resolveTask(id, "approve")));
    if (results.some((r) => r.status === "rejected")) {
      throw new Error("Some approvals couldn't be saved");
    }
  }, [taskCompletions, resolveTask]);

  const approveAllRedemptions = useCallback(async () => {
    const ids = redemptions.map((redemption) => redemption.id);
    const results = await Promise.allSettled(
      ids.map((id) => resolveRedemption(id, "approve"))
    );
    if (results.some((r) => r.status === "rejected")) {
      throw new Error("Some approvals couldn't be saved");
    }
  }, [redemptions, resolveRedemption]);

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
