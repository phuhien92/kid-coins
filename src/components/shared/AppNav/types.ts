import type * as React from "react";

export type AppNavItem = {
  id: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

/** Kid = green focus ring; parent = purple focus ring (CTA register). Nav pills are identical. */
export type AppNavRegister = "kid" | "parent";

export type AppNavStampedChipRing = "green" | "purple";

export function appNavStampedChipRing(register: AppNavRegister): AppNavStampedChipRing {
  return register === "parent" ? "purple" : "green";
}

export function isNavActive(
  pathname: string | null,
  href: string,
  options?: { homeHref?: string; homeAliases?: readonly string[] }
): boolean {
  if (!pathname) return false;
  if (
    options?.homeHref &&
    href === options.homeHref &&
    options.homeAliases?.includes(pathname)
  ) {
    return true;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function appNavFocusRing(register: AppNavRegister): string {
  return register === "parent"
    ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2"
    : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2";
}
