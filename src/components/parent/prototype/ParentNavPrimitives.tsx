"use client";

import { AppNavList } from "@/components/shared/AppNav/AppNav";
import { AppNavSidebarFooter } from "@/components/shared/AppNav/AppNavSidebarFooter";
import { ProfileSwitchAction } from "@/components/shared/AppNav/ProfileSwitchAction";
import { EarnieBrand } from "@/components/shared/EarnieBrand";
import { InitialAvatar } from "@/components/ui";
import { PARENT_NAV_ITEMS, MOCK_PARENT, type ParentNavSection } from "./parentNavItems";

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
    <AppNavList
      mode="controlled"
      items={PARENT_NAV_ITEMS}
      register="parent"
      activeId={active}
      onSelect={(id) => onSelect(id as ParentNavSection)}
      showLabels={showLabels}
      compact={compact}
      className={className}
    />
  );
}

export { EarnieBrand };

export function ParentSidebarFooter({ compact = false }: { compact?: boolean }) {
  return (
    <AppNavSidebarFooter
      compact={compact}
      avatar={
        <InitialAvatar
          name="Sam Rivera"
          avatarColor={MOCK_PARENT.avatarColor}
          size="md"
        />
      }
      primaryLabel="Sam Rivera"
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
