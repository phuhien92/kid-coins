import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoins(amount: number): string {
  return amount.toLocaleString();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Compact "time since" label for feeds (e.g. "just now", "5m ago", "3h ago").
 * Falls back to a short calendar date once the event is more than a week old.
 */
export function formatRelativeTime(date: Date, now = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
}

/** Unwrap Drizzle/postgres.js errors so API responses show the Postgres cause. */
export function getDbErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "cause" in err) {
    const cause = (err as { cause?: unknown }).cause;
    if (cause instanceof Error) return cause.message;
    if (cause && typeof cause === "object" && "message" in cause) {
      const message = (cause as { message?: unknown }).message;
      if (typeof message === "string" && message.length > 0) return message;
    }
  }
  if (err instanceof Error) return err.message;
  return "Server error";
}
