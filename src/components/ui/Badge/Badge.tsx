import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "streak" | "count" | "goal-chip" | "lav";

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  streak: "bg-gold text-ink shadow-gold font-display font-extrabold text-base px-3.5 py-1.5 gap-1",
  count: "bg-gold text-ink font-body font-extrabold text-xs px-2 py-0.5",
  "goal-chip": "bg-mint-tint text-mint-ink font-display font-extrabold text-xs px-3 py-1 gap-1",
  lav: "bg-grow-tint text-grow-ink font-display font-extrabold text-xs px-3 py-1",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "streak", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex items-center rounded-pill", variantClasses[variant], className)}
      {...props}
    />
  )
);

Badge.displayName = "Badge";

export { Badge };
