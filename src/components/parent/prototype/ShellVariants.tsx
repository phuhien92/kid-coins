"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AppNavBottomTabs } from "@/components/shared/AppNav/AppNav";
import { AppNavItemControl } from "@/components/shared/AppNav/AppNavItemControl";
import { MOCK_PARENT } from "./parentNavItems";
import {
  EarnieBrand,
  ParentGreeting,
  ParentNavList,
  ParentSidebarFooter,
  ParentTopbarActions,
} from "./ParentNavPrimitives";
import type { ParentNavSection } from "./parentNavItems";
import { PARENT_NAV_ITEMS } from "./parentNavItems";

type ShellFrameProps = {
  activeSection: ParentNavSection;
  onSelect: (section: ParentNavSection) => void;
  children: React.ReactNode;
  onDrawerChange?: (open: boolean) => void;
};

/** Design-handoff shell: full sidebar → tablet icon rail → mobile drawer + bottom nav. */
export function SpecShell({ activeSection, onSelect, children, onDrawerChange }: ShellFrameProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    onDrawerChange?.(drawerOpen);
  }, [drawerOpen, onDrawerChange]);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop sidebar */}
      <aside
        aria-label="Primary navigation"
        className="hidden lg:flex sticky top-0 self-start h-screen w-60 flex-col gap-2 px-4 py-5 bg-cream-card border-r-2 border-ink"
      >
        <EarnieBrand href="/parent/home" register="parent" />
        <p className="font-body font-extrabold text-xs text-ink-soft uppercase tracking-wide px-3 pt-2">
          Menu
        </p>
        <ParentNavList active={activeSection} onSelect={onSelect} className="flex-1" />
        <ParentSidebarFooter />
      </aside>

      {/* Tablet icon rail */}
      <aside
        aria-label="Primary navigation"
        className="hidden md:flex lg:hidden sticky top-0 self-start h-screen w-20 flex-col items-center gap-2 px-2 py-5 bg-cream-card border-r-2 border-ink"
      >
        <EarnieBrand href="/parent/home" register="parent" className="block text-center w-full" />
        <ParentNavList active={activeSection} onSelect={onSelect} showLabels={false} compact className="flex-1 w-full" />
        <ParentSidebarFooter compact />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-40 bg-ink/45"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-60 flex flex-col gap-2 px-4 py-5 bg-cream-card border-r-2 border-ink transition-transform",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <EarnieBrand href="/parent/home" register="parent" />
        <ParentNavList active={activeSection} onSelect={(s) => { onSelect(s); setDrawerOpen(false); }} className="flex-1" />
        <ParentSidebarFooter />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-4 bg-cream/90 backdrop-blur-sm border-b border-line">
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden w-11 h-11 rounded-control border-2 border-ink bg-cream-card flex items-center justify-center"
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <ParentGreeting />
          <div className="flex-1" />
          <ParentTopbarActions />
        </header>
        <main className="flex-1 px-4 md:px-6 py-6">{children}</main>
      </div>

      <AppNavBottomTabs
        mode="controlled"
        items={PARENT_NAV_ITEMS}
        register="parent"
        activeId={activeSection}
        onSelect={(id) => onSelect(id as ParentNavSection)}
        className="md:hidden"
      />
    </div>
  );
}

/** Mirrors KidLayoutShell — sidebar + bottom tabs, pages own headers. */
export function KidParityShell({ activeSection, onSelect, children }: ShellFrameProps) {
  return (
    <div className="min-h-screen bg-cream flex">
      <aside
        aria-label="Primary navigation"
        className="hidden md:flex sticky top-0 self-start h-screen w-56 flex-col gap-6 px-5 py-6 bg-cream border-r border-line"
      >
        <EarnieBrand href="/parent/home" register="parent" />
        <ParentNavList active={activeSection} onSelect={onSelect} />
        <div className="mt-auto border-t border-line pt-4">
          <ParentSidebarFooter />
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0">
        <div className="md:hidden flex items-center justify-end px-5 pt-4 pb-2">
          <button type="button" className="font-display font-semibold text-sm text-purple-dk border-2 border-ink rounded-pill px-3 py-1.5 bg-lav-pale">
            Profile picker →
          </button>
        </div>
        {children}
      </main>

      <AppNavBottomTabs
        mode="controlled"
        items={PARENT_NAV_ITEMS}
        register="parent"
        activeId={activeSection}
        onSelect={(id) => onSelect(id as ParentNavSection)}
        className="md:hidden"
      />
    </div>
  );
}

/** Conventional top-nav — no sidebar on any breakpoint. */
export function TopNavShell({ activeSection, onSelect, children, onDrawerChange }: ShellFrameProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    onDrawerChange?.(menuOpen);
  }, [menuOpen, onDrawerChange]);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-30 bg-cream-card border-b-2 border-ink">
        <div className="flex items-center gap-3 px-4 py-3">
          <EarnieBrand href="/parent/home" register="parent" />
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1">
            {PARENT_NAV_ITEMS.map((item) => (
              <AppNavItemControl
                key={item.id}
                item={item}
                active={activeSection === item.id}
                compact
                register="parent"
                mode="button"
                onSelect={() => onSelect(item.id)}
              />
            ))}
          </div>
          <ParentTopbarActions />
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden w-11 h-11 rounded-control border-2 border-ink bg-cream flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-line px-4 py-3 flex flex-col gap-1">
            <ParentNavList active={activeSection} onSelect={(s) => { onSelect(s); setMenuOpen(false); }} />
          </div>
        )}
        <div className="px-4 pb-4 md:px-6">
          <ParentGreeting />
        </div>
      </header>
      <main className="flex-1 px-4 md:px-6 py-6">{children}</main>
    </div>
  );
}

/** Permanent narrow icon rail — max content width on desktop. */
export function FocusRailShell({ activeSection, onSelect, children }: ShellFrameProps) {
  return (
    <div className="min-h-screen bg-cream flex">
      <aside
        aria-label="Primary navigation"
        className="hidden sm:flex sticky top-0 self-start h-screen w-20 flex-col items-center gap-3 px-2 py-5 bg-cream-card border-r-2 border-ink"
      >
        <EarnieBrand href="/parent/home" register="parent" className="block text-center w-full" />
        <ParentNavList active={activeSection} onSelect={onSelect} showLabels={false} compact className="flex-1 w-full" />
        <ParentSidebarFooter compact />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col pb-20 sm:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-cream/90 backdrop-blur-sm">
          <p className="font-body font-extrabold text-xs text-ink-soft uppercase tracking-wide">
            {MOCK_PARENT.family}
          </p>
          <ParentTopbarActions />
        </header>
        <main className="flex-1 px-4 md:px-8 py-6 max-w-5xl">{children}</main>
      </div>

      <AppNavBottomTabs
        mode="controlled"
        items={PARENT_NAV_ITEMS}
        register="parent"
        activeId={activeSection}
        onSelect={(id) => onSelect(id as ParentNavSection)}
        className="sm:hidden"
      />
    </div>
  );
}
