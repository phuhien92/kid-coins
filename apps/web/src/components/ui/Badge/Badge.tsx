import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "streak" | "count" | "goal-chip" | "lav";

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  streak: [
    "bg-coin border-[2.5px] border-ink rounded-pill",
    "font-display font-semibold text-[16px] text-ink",
    "px-[14px] py-[7px]",
    "shadow-[0_3px_0_var(--color-coin-dk)]",
    "inline-flex items-center gap-1",
  ].join(" "),
  count: [
    "bg-coin border-[2px] border-ink rounded-pill",
    "font-body font-[800] text-[11px] text-ink",
    "px-[8px] py-[2px]",
    "inline-flex items-center",
  ].join(" "),
  "goal-chip": [
    "bg-green-tint border-[2px] border-ink rounded-pill",
    "font-display font-semibold text-[12.5px] text-ink",
    "px-[12px] py-[5px]",
    "inline-flex items-center gap-1",
  ].join(" "),
  lav: [
    "bg-lav-pale border-[2px] border-ink rounded-pill",
    "font-display font-semibold text-[12.5px] text-ink",
    "px-[12px] py-[5px]",
    "inline-flex items-center",
  ].join(" "),
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "streak", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
);

Badge.displayName = "Badge";

export { Badge };
