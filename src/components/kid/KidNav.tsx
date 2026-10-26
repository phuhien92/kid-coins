"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SwitchProfileButton } from "@/components/kid/SwitchProfileButton";
import { KidCoinLogo, STEP_TONES } from "@/components/ui";
import type { StepId } from "@/lib/brand";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Brand step this area belongs to — tints its active state. */
  step: StepId;
};

// Heroicons-style stroke icons, 24×24, stroke-width 2.2.
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}
function TasksIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}
function RewardsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 7h-4a3 3 0 0 0-4-3 3 3 0 0 0-4 3H4v4h16V7z" />
      <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M12 4v17" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}

const items: NavItem[] = [
  { href: "/kid/home", label: "Home", icon: <HomeIcon />, step: "earn" },
  { href: "/kid/tasks", label: "Tasks", icon: <TasksIcon />, step: "do" },
  { href: "/kid/rewards", label: "Rewards", icon: <RewardsIcon />, step: "choose" },
  { href: "/kid/profile", label: "Profile", icon: <ProfileIcon />, step: "grow" },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/kid/home" && pathname === "/kid") return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

/** Desktop sidebar, 230px sticky. Visible md+. */
export function KidSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex sticky top-0 self-start h-screen w-[230px] flex-col gap-8 px-5 py-6 bg-cream-card border-r border-line"
    >
      <Link href="/kid/home" className={cn("self-start rounded-control", focusRing)}>
        <KidCoinLogo size="sm" />
      </Link>

      <nav className="flex flex-col gap-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors duration-150",
                "font-display text-base",
                focusRing,
                active
                  ? cn(STEP_TONES[item.step].tint, "font-black text-ink")
                  : "font-bold text-ink-soft hover:bg-cream-deep hover:text-ink"
              )}
            >
              {/* Active marker — a shape cue, so state never relies on colour alone. */}
              {active && (
                <span aria-hidden className={cn("absolute left-0 inset-y-2 w-1 rounded-pill", STEP_TONES[item.step].fill)} />
              )}
              <span className="w-6 h-6 flex items-center justify-center" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-line pt-4">
        <SwitchProfileButton size="full" />
      </div>
    </aside>
  );
}

/** Mobile top bar with switch profile. Visible below md (hidden on home — inline there). */
export function KidMobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-end px-5 pt-4 pb-2">
      <SwitchProfileButton />
    </div>
  );
}

/** Mobile bottom tab bar. Visible below md. Respects safe-area inset. */
export function KidBottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-card border-t border-line shadow-lift"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-stretch justify-around px-2 pt-2 pb-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-1 py-1 rounded-control", focusRing)}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-12 h-9 rounded-pill transition-colors duration-150",
                    active ? cn(STEP_TONES[item.step].tint, "text-ink") : "text-ink-soft"
                  )}
                  aria-hidden
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    "font-body text-xs",
                    active ? "font-extrabold text-ink underline decoration-2 underline-offset-4" : "font-semibold text-ink-soft"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
