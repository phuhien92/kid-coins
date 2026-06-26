"use client";

import * as React from "react";
import type { KidProfile, Task, Goal } from "@/types";

/**
 * Shape of the kid-session state held by KidContext.
 *
 * INTEGRATION POINT: today this is fed by `useMockKidSession()`. Once the kid
 * auth flow (4-digit PIN against `kidProfiles.pinHash`) and Supabase queries
 * land, swap that hook for a real one that reads `kid_profiles`, `tasks`,
 * `goals`, and a derived `streak`. The provider's public surface stays the
 * same — consumers (`useKid`, `useKidHomeData`) won't change.
 */
export type KidSession = {
  kid: KidProfile;
  streak: number;
  /** Coins earned today, computed from today's completed tasks. */
  todayEarned: number;
  goal: Goal & { current: number; target: number };
  tasks: Task[];
  /** Optimistic balance update — call after marking a task done. */
  addCoins: (delta: number) => void;
};

const KidContext = React.createContext<KidSession | null>(null);

export function KidProvider({ children }: { children: React.ReactNode }) {
  const session = useMockKidSession();
  return <KidContext.Provider value={session}>{children}</KidContext.Provider>;
}

/**
 * Read the full kid session.
 *
 * Throws if used outside `<KidProvider>` so the boundary error is obvious
 * during development — preferable to silently rendering broken UI.
 */
export function useKid(): KidSession {
  const ctx = React.useContext(KidContext);
  if (!ctx) {
    throw new Error("useKid must be used inside <KidProvider>.");
  }
  return ctx;
}

/**
 * Tasks-page-shaped selector.
 */
export function useKidTasksData() {
  const { tasks, addCoins, streak } = useKid();
  return {
    tasks: tasks.filter((t) => t.isActive),
    addCoins,
    streak,
  };
}

/**
 * Home-page-shaped selector. Keeps the page free of the broader session shape.
 */
export function useKidHomeData() {
  const { kid, streak, todayEarned, goal, tasks } = useKid();
  return {
    kidName: kid.name,
    avatarColor: kid.avatarColor,
    balance: kid.balance,
    streak,
    todayEarned,
    goal: {
      emoji: goal.emoji,
      name: goal.title,
      current: goal.current,
      target: goal.target,
    },
    pendingTaskCount: tasks.filter((t) => !t.completedToday).length,
  };
}

/* ------------------------------------------------------------------ */
/* Mocked session — REPLACE WITH SUPABASE-BACKED IMPLEMENTATION       */
/* ------------------------------------------------------------------ */

function useMockKidSession(): KidSession {
  const [balance, setBalance] = React.useState(54);
  const [kidName, setKidName] = React.useState("Friend");
  const [avatarColor, setAvatarColor] = React.useState("#F4D34E");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedName = localStorage.getItem("earnie_kid_name");
    const storedColor = localStorage.getItem("earnie_kid_avatar_color");
    if (storedName) setKidName(storedName);
    if (storedColor) setAvatarColor(storedColor);
  }, []);

  const kid: KidProfile = {
    id: "mock-kid-1",
    name: kidName,
    balance,
    avatarColor,
    familyId: "mock-family-1",
  };

  const goal: KidSession["goal"] = {
    id: "mock-goal-1",
    kidId: "mock-kid-1",
    title: "Switch game",
    emoji: "🎮",
    targetAmount: 200,
    currentAmount: 54,
    isActive: true,
    current: 54,
    target: 200,
  };

  const tasks: Task[] = [
    { id: "t1", kidId: "mock-kid-1", title: "Brush teeth (morning)", type: "daily", coinReward: 1, isActive: true, completedToday: true },
    { id: "t2", kidId: "mock-kid-1", title: "Make your bed", type: "daily", coinReward: 2, isActive: true, completedToday: false },
    { id: "t3", kidId: "mock-kid-1", title: "Read for 20 minutes", type: "daily", coinReward: 5, isActive: true, completedToday: false },
    { id: "t4", kidId: "mock-kid-1", title: "Help set the table", type: "daily", coinReward: 3, isActive: true, completedToday: false },
    { id: "t5", kidId: "mock-kid-1", title: "Clean your room", type: "once", coinReward: 10, isActive: true, completedToday: false },
  ];

  const todayEarned = tasks
    .filter((t) => t.completedToday)
    .reduce((sum, t) => sum + t.coinReward, 0) + 7; // +7 stands in for earlier-today earnings

  const addCoins = React.useCallback(
    (delta: number) => setBalance((b) => b + delta),
    []
  );

  return { kid, streak: 12, todayEarned, goal, tasks, addCoins };
}
