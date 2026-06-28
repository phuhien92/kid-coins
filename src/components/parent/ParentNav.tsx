"use client";

import * as React from "react";
import { AppNavBottomTabs, AppNavList } from "@/components/shared/AppNav/AppNav";
import { AppNavSidebarFooter } from "@/components/shared/AppNav/AppNavSidebarFooter";
import { ProfileSwitchAction } from "@/components/shared/AppNav/ProfileSwitchAction";
import { InitialAvatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PARENT_NAV_ITEMS, PARENT_SHELL_PLACEHOLDER } from "./parentNavItems";

export { isNavActive as isParentNavActive } from "@/components/shared/AppNav/types";

export function ParentNavList({
  showLabels = true,
  compact = false,
  className,
  onNavigate,
}: {
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <AppNavList
      items={PARENT_NAV_ITEMS}
      register="parent"
      homeHref="/parent/home"
      showLabels={showLabels}
      compact={compact}
      className={className}
      onNavigate={onNavigate}
    />
  );
}

export function ParentSidebarFooter({ compact = false }: { compact?: boolean }) {
  const { fullName, avatarColor } = PARENT_SHELL_PLACEHOLDER;

  return (
    <AppNavSidebarFooter
      compact={compact}
      avatar={
        <InitialAvatar
          name={fullName}
          avatarColor={avatarColor}
          size="md"
        />
      }
      primaryLabel={fullName}
      action={<ProfileSwitchAction register="parent" />}
    />
  );
}

export function ParentTopbarActions() {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        type="button"
        aria-label="Notifications"
        className={cn(
          "relative w-11 h-11 rounded-control border-2 border-ink bg-cream-card",
          "flex items-center justify-center hover:bg-black/5 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2"
        )}
      >
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-coral border-2 border-cream-card" aria-hidden />
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Set a goal with AI"
        className={cn(
          "inline-flex items-center gap-2 font-display font-semibold text-sm text-white",
          "bg-purple border-2 border-ink rounded-control px-4 py-2.5",
          "shadow-[0_4px_0_var(--color-purple-dk)] active:translate-y-0.5 active:shadow-none transition-transform",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2"
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden>
          <path d="M12 3v18M3 12h18" />
        </svg>
        <span className="hidden sm:inline">Set a goal with AI</span>
      </button>
    </div>
  );
}

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function ParentGreeting() {
  const [greeting, setGreeting] = React.useState(() =>
    greetingForHour(new Date().getHours())
  );

  React.useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  const { name, family, kidCount, goalCount } = PARENT_SHELL_PLACEHOLDER;

  return (
    <div className="min-w-0">
      <h1 className="font-display font-bold text-xl md:text-2xl text-ink leading-tight">
        {greeting}, {name}
      </h1>
      <p className="font-body font-extrabold text-xs text-ink-soft mt-1 hidden sm:block">
        {family} · {kidCount} kids · {goalCount} active goals
      </p>
    </div>
  );
}

export function ParentBottomTabs() {
  return (
    <AppNavBottomTabs
      items={PARENT_NAV_ITEMS}
      register="parent"
      homeHref="/parent/home"
    />
  );
}
