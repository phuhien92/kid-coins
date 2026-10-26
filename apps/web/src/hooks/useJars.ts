"use client";

import { useCallback, useEffect, useState } from "react";
import { kidSessionHeaders } from "@/lib/kid-session";

export type JarType = "save" | "give";

export type JarBalances = {
  /** Spendable balance — the kid's Spend jar (kidProfiles.balance). */
  spend: number;
  save: number;
  give: number;
};

export type JarInterest = {
  rateBps: number;
  /** Coins the Save jar would earn over the next week at the current rate. */
  projectedNextWeek: number;
};

export type UseJarsResult = {
  loading: boolean;
  error: string;
  jars: JarBalances | null;
  interest: JarInterest | null;
  /** Move coins from Spend into a jar. Rejects with a kid-safe message. */
  allocate: (jarType: JarType, amount: number) => Promise<void>;
  /** Move coins from the Save jar back into Spend. Rejects with a kid-safe message. */
  withdraw: (amount: number) => Promise<void>;
  refresh: () => void;
};

/** Shown when the failure is transient or has no actionable server-side reason. */
const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Data hook powering the kid savings-jar UI.
 *
 * Owns the three bucket balances and the projected weekly interest. A mutation
 * applies the server's authoritative balances to state immediately (so the move
 * feels instant), then quietly re-fetches to reconcile the projected interest —
 * which the client can't recompute without pulling the server-only interest
 * math into the bundle. Both mutations reject with a message that is safe to
 * show a kid verbatim, mirroring the parent approvals hook.
 */
export function useJars(kidId: string | null): UseJarsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jars, setJars] = useState<JarBalances | null>(null);
  const [interest, setInterest] = useState<JarInterest | null>(null);

  const load = useCallback(
    (showLoading = true) => {
      if (!kidId) {
        // Drop any previously loaded balances so a kid switch (or a transient
        // null id) can't leave stale numbers for the wrong kid on screen.
        setJars(null);
        setInterest(null);
        setLoading(false);
        return;
      }
      if (showLoading) setLoading(true);
      setError("");
      fetch(`/api/kids/${kidId}/jars`, { headers: kidSessionHeaders(kidId) })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
        .then((data) => {
          setJars(data.jars ?? null);
          setInterest(data.interest ?? null);
        })
        .catch(() => setError("Couldn't load your jars. Please try again."))
        .finally(() => {
          if (showLoading) setLoading(false);
        });
    },
    [kidId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const post = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      if (!kidId) throw new Error(GENERIC_ERROR);
      let res: Response;
      try {
        res = await fetch(`/api/kids/${kidId}/jars/${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...kidSessionHeaders(kidId) },
          body: JSON.stringify(body),
        });
      } catch {
        throw new Error(GENERIC_ERROR);
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const reason = typeof data.error === "string" ? data.error.trim() : "";
        throw new Error(res.status >= 500 || !reason ? GENERIC_ERROR : reason);
      }
      return data;
    },
    [kidId]
  );

  const allocate = useCallback(
    async (jarType: JarType, amount: number) => {
      const data = await post("allocate", { jarType, amount });
      setJars((cur) =>
        cur ? { ...cur, spend: data.spend, [jarType]: data.jarBalance } : cur
      );
      load(false); // reconcile projected interest without a loading flash
    },
    [post, load]
  );

  const withdraw = useCallback(
    async (amount: number) => {
      const data = await post("withdraw", { amount });
      setJars((cur) => (cur ? { ...cur, spend: data.spend, save: data.saveBalance } : cur));
      load(false);
    },
    [post, load]
  );

  return { loading, error, jars, interest, allocate, withdraw, refresh: load };
}
