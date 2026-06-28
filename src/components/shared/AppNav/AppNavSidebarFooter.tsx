import * as React from "react";
import { cn } from "@/lib/utils";

export type AppNavSidebarFooterProps = {
  avatar: React.ReactNode;
  primaryLabel: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
};

/** Canonical sidebar footer — avatar, identity lines, and profile-switch action. */
export function AppNavSidebarFooter({
  avatar,
  primaryLabel,
  action,
  compact = false,
  className,
}: AppNavSidebarFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 border-2 border-ink rounded-card bg-cream-card",
        compact && "justify-center p-2",
        className
      )}
    >
      {avatar}
      {!compact && (
        <>
          <p className="min-w-0 flex-1 font-display font-semibold text-sm text-ink truncate">
            {primaryLabel}
          </p>
          {action}
        </>
      )}
    </div>
  );
}
