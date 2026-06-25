"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
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
  { href: "/kid/home", label: "Home", icon: <HomeIcon /> },
  { href: "/kid/tasks", label: "Tasks", icon: <TasksIcon /> },
  { href: "/kid/rewards", label: "Rewards", icon: <RewardsIcon /> },
  { href: "/kid/profile", label: "Profile", icon: <ProfileIcon /> },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/kid/home" && pathname === "/kid") return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop sidebar, 230px sticky. Visible md+. */
export function KidSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("earnie_char");
      localStorage.removeItem("earnie_kid_id");
      localStorage.removeItem("earnie_kid_name");
    }
    router.push("/profile-picker");
  }

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex sticky top-0 self-start h-screen w-[230px] flex-col gap-6 px-5 py-6 bg-cream border-r-[2px] border-line"
    >
      <Link href="/kid/home" className="font-display font-semibold text-[22px] text-ink leading-none">
        Earnie
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
                "inline-flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors duration-150",
                "font-display font-semibold text-[15px] text-ink",
                active
                  ? "bg-green-tint border-[2px] border-ink"
                  : "border-[2px] border-transparent hover:bg-black/5"
              )}
            >
              <span className="w-6 h-6 flex items-center justify-center" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-line pt-4">
        <button
          onClick={handleSignOut}
          className="font-body font-bold text-[13px] text-ink-soft hover:text-ink active:text-ink transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1"
        >
          ← Sign out
        </button>
      </div>
    </aside>
  );
}

/** Mobile bottom tab bar. Visible below md. Respects safe-area inset. */
export function KidBottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream border-t-[2px] border-line"
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
                className="flex flex-col items-center gap-1 py-1"
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-[46px] h-[38px] rounded-[14px] transition-colors duration-150",
                    active
                      ? "bg-green-tint border-[2px] border-ink text-ink"
                      : "text-ink-soft"
                  )}
                  aria-hidden
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    "font-body font-bold text-[11px]",
                    active ? "text-ink" : "text-ink-soft"
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
