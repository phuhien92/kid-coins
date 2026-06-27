"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { PARENT_NAV_ITEMS, type ParentNavSection } from "./parentNavItems";

type NavButtonProps = {
  section: ParentNavSection;
  active: boolean;
  onSelect: (section: ParentNavSection) => void;
  showLabel?: boolean;
  compact?: boolean;
};

export function ParentNavButton({
  section,
  active,
  onSelect,
  showLabel = true,
  compact = false,
}: NavButtonProps) {
  const item = PARENT_NAV_ITEMS.find((i) => i.id === section)!;

  return (
    <button
      type="button"
      onClick={() => onSelect(section)}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={cn(
        "relative inline-flex items-center gap-3 transition-colors duration-150",
        compact ? "justify-center p-3 rounded-control" : "px-3 py-2.5 rounded-control w-full",
        "font-display font-semibold text-sm text-ink",
        active
          ? "bg-green-tint border-2 border-ink"
          : "border-2 border-transparent hover:bg-black/5 text-ink-soft hover:text-ink"
      )}
    >
      <span className="w-6 h-6 flex items-center justify-center shrink-0" aria-hidden>
        {item.icon}
      </span>
      {showLabel && <span>{item.label}</span>}
      {item.badge != null && item.badge > 0 && (
        <Badge
          variant="count"
          className={cn(
            "min-w-5 h-5 text-xs",
            showLabel ? "ml-auto" : "absolute top-1 right-1"
          )}
        >
          {item.badge}
        </Badge>
      )}
    </button>
  );
}

export function ParentNavList({
  active,
  onSelect,
  showLabels = true,
  compact = false,
  className,
}: {
  active: ParentNavSection;
  onSelect: (section: ParentNavSection) => void;
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {PARENT_NAV_ITEMS.map((item) => (
        <ParentNavButton
          key={item.id}
          section={item.id}
          active={active === item.id}
          onSelect={onSelect}
          showLabel={showLabels}
          compact={compact}
        />
      ))}
    </div>
  );
}

export function ParentBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", compact && "justify-center")}>
      <span className="w-9 h-9 rounded-full bg-coin border-2 border-ink shrink-0" aria-hidden />
      {!compact && (
        <span className="font-display font-bold text-xl text-ink">
          Earnie<span className="text-green">.</span>
        </span>
      )}
    </div>
  );
}

export function ParentSidebarFooter({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 border-2 border-ink rounded-card bg-cream-card",
        compact && "justify-center p-2"
      )}
    >
      <span className="w-10 h-10 rounded-full border-2 border-ink bg-lav flex items-center justify-center text-lg shrink-0" aria-hidden>
        🧑
      </span>
      {!compact && (
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm text-ink truncate">Sam Rivera</p>
          <p className="font-body font-bold text-xs text-ink-soft truncate">The Rivera family</p>
        </div>
      )}
    </div>
  );
}

export function ParentTopbarActions() {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        type="button"
        aria-label="Notifications"
        className="relative w-11 h-11 rounded-control border-2 border-ink bg-cream-card flex items-center justify-center hover:bg-black/5 transition-colors"
      >
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-coral border-2 border-cream-card" />
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 font-display font-semibold text-sm text-white bg-purple border-2 border-ink rounded-control px-4 py-2.5 shadow-[0_4px_0_var(--color-purple-dk)] active:translate-y-0.5 active:shadow-none transition-transform"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden>
          <path d="M12 3v18M3 12h18" />
        </svg>
        <span className="hidden sm:inline">Set a goal with AI</span>
      </button>
    </div>
  );
}

export function ParentGreeting({ showSub = true }: { showSub?: boolean }) {
  return (
    <div className="min-w-0">
      <h1 className="font-display font-bold text-xl md:text-2xl text-ink leading-tight">
        Good morning, Sam
      </h1>
      {showSub && (
        <p className="font-body font-extrabold text-xs text-ink-soft mt-1 hidden sm:block">
          The Rivera family · 2 kids · 3 active goals
        </p>
      )}
    </div>
  );
}
