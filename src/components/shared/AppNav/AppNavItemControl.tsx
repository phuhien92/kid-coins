"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { appNavFocusRing, type AppNavItem, type AppNavRegister } from "./types";

type AppNavItemControlProps = {
  item: AppNavItem;
  active: boolean;
  showLabel?: boolean;
  compact?: boolean;
  register?: AppNavRegister;
  mode: "link" | "button";
  href?: string;
  onNavigate?: () => void;
  onSelect?: () => void;
};

export function AppNavItemControl({
  item,
  active,
  showLabel = true,
  compact = false,
  register = "kid",
  mode,
  href,
  onNavigate,
  onSelect,
}: AppNavItemControlProps) {
  const className = cn(
    "relative inline-flex items-center gap-3 transition-colors duration-150",
    compact ? "justify-center p-3 rounded-control" : "px-3 py-2.5 rounded-control w-full",
    "font-display font-semibold text-sm text-ink",
    appNavFocusRing(register),
    active
      ? "bg-green-tint border-2 border-ink text-ink"
      : "border-2 border-transparent hover:bg-black/5 text-ink-soft hover:text-ink"
  );

  const content = (
    <>
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
    </>
  );

  if (mode === "button") {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        title={item.label}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href ?? item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={className}
    >
      {content}
    </Link>
  );
}

type AppNavBottomTabControlProps = {
  item: AppNavItem;
  active: boolean;
  register?: AppNavRegister;
  mode: "link" | "button";
  href?: string;
  onSelect?: () => void;
};

export function AppNavBottomTabControl({
  item,
  active,
  register = "kid",
  mode,
  href,
  onSelect,
}: AppNavBottomTabControlProps) {
  const tabClassName = cn(
    "w-full flex flex-col items-center gap-1 py-1 rounded-control",
    appNavFocusRing(register)
  );

  const iconPill = (
    <span
      className={cn(
        "inline-flex items-center justify-center w-12 h-10 rounded-control relative",
        active ? "bg-green-tint border-2 border-ink text-ink" : "text-ink-soft"
      )}
    >
      {item.icon}
      {item.badge != null && item.badge > 0 && (
        <Badge variant="count" className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-xs">
          {item.badge}
        </Badge>
      )}
    </span>
  );

  const label = (
    <span className={cn("font-display font-semibold text-xs", active ? "text-ink" : "text-ink-soft")}>
      {item.label}
    </span>
  );

  if (mode === "button") {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className={tabClassName}
      >
        {iconPill}
        {label}
      </button>
    );
  }

  return (
    <Link href={href ?? item.href} aria-current={active ? "page" : undefined} className={tabClassName}>
      {iconPill}
      {label}
    </Link>
  );
}
