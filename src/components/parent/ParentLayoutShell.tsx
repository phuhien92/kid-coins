"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ParentBottomTabs,
  ParentGreeting,
  ParentNavList,
  ParentSidebarFooter,
  ParentTopbarActions,
} from "./ParentNav";
import { EarnieBrand } from "@/components/shared/EarnieBrand";

type ParentLayoutShellProps = {
  children: React.ReactNode;
};

/**
 * Production parent shell (HIE-17 verdict: spec variant).
 * Full sidebar at lg+, icon rail at md–lg, mobile drawer + bottom nav.
 */
export function ParentLayoutShell({ children }: ParentLayoutShellProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-cream flex">
      <aside
        aria-label="Primary navigation"
        className="hidden lg:flex sticky top-0 self-start h-screen w-60 flex-col gap-2 px-4 py-5 bg-cream-card border-r-2 border-ink"
      >
        <EarnieBrand href="/parent/home" register="parent" />
        <ParentNavList className="flex-1" />
        <ParentSidebarFooter />
      </aside>

      <aside
        aria-label="Primary navigation compact"
        className="hidden md:flex lg:hidden sticky top-0 self-start h-screen w-20 flex-col items-center gap-2 px-2 py-5 bg-cream-card border-r-2 border-ink"
      >
        <EarnieBrand href="/parent/home" register="parent" className="block text-center w-full" />
        <ParentNavList showLabels={false} compact className="flex-1 w-full" />
        <ParentSidebarFooter compact />
      </aside>

      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-40 bg-ink/45"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        aria-label="Mobile navigation menu"
        aria-hidden={!drawerOpen}
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-60 flex flex-col gap-2 px-4 py-5 bg-cream-card border-r-2 border-ink transition-transform",
          drawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <EarnieBrand href="/parent/home" register="parent" />
        <ParentNavList
          className="flex-1"
          onNavigate={() => setDrawerOpen(false)}
        />
        <ParentSidebarFooter />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-4 bg-cream/90 backdrop-blur-sm border-b border-line">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className={cn(
              "md:hidden w-11 h-11 rounded-control border-2 border-ink bg-cream-card",
              "flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2"
            )}
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

      <ParentBottomTabs />
    </div>
  );
}
