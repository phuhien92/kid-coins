"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ShellVariant } from "./ShellStatePanel";

const VARIANTS: { id: ShellVariant; label: string }[] = [
  { id: "spec", label: "Spec" },
  { id: "kid-parity", label: "Kid parity" },
  { id: "top-nav", label: "Top nav" },
  { id: "focus-rail", label: "Focus rail" },
];

export function VariantSwitcherBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("variant") as ShellVariant) || "spec";

  function setVariant(id: ShellVariant) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Shell variant switcher"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 p-1.5 bg-ink rounded-pill shadow-card"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {VARIANTS.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => setVariant(v.id)}
          className={cn(
            "px-3 py-2 rounded-pill font-display font-semibold text-xs transition-colors",
            current === v.id
              ? "bg-purple text-white"
              : "text-cream hover:bg-white/10"
          )}
        >
          {v.label}
        </button>
      ))}
    </nav>
  );
}

export function parseVariant(raw: string | null): ShellVariant {
  if (raw === "kid-parity" || raw === "top-nav" || raw === "focus-rail") return raw;
  return "spec";
}
