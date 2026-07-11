"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutAccount } from "@/lib/auth-sign-out";
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
      await signOutAccount();
    } finally {
      router.push("/login");
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={cn(
        "font-body font-bold text-[13px] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1 disabled:opacity-50",
        variant === "text"
          ? "text-ink-soft hover:text-ink active:text-ink"
          : "text-ink border-[2px] border-line px-3 py-1.5 hover:bg-black/5 active:bg-black/10",
        className
      )}
    >
      {signingOut ? "Signing out…" : "← Sign out"}
    </button>
  );
}
