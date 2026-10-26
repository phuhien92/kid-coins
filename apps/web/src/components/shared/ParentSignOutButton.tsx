"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ParentSignOutButtonProps = {
  className?: string;
  variant?: "text" | "button";
};

export function ParentSignOutButton({
  className,
  variant = "text",
}: ParentSignOutButtonProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Best-effort — still redirect even if the API call fails
    } finally {
      if (typeof window !== "undefined") {
        Object.keys(localStorage)
          .filter(
            (k) =>
              k.startsWith("sb-") ||
              k.startsWith("earnie_")
          )
          .forEach((k) => localStorage.removeItem(k));
      }
      router.push("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={cn(
        "inline-flex min-h-tap items-center justify-center font-body font-bold text-sm transition-colors rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 disabled:opacity-50",
        variant === "text"
          ? "px-3 text-fg-muted hover:text-fg active:text-fg"
          : "text-fg border-2 border-line px-4 hover:bg-surface-sunken active:bg-surface-sunken",
        className
      )}
    >
      {signingOut ? "Signing out…" : "← Sign out"}
    </button>
  );
}
