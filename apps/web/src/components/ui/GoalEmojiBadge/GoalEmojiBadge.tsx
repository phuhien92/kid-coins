import * as React from "react";
import { cn } from "@/lib/utils";

export type GoalEmojiBadgeSize = "sm" | "md";

export type GoalEmojiBadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  emoji: string;
  size?: GoalEmojiBadgeSize;
};

const sizeClasses: Record<GoalEmojiBadgeSize, string> = {
  sm: "size-9 rounded-pill text-lg bg-step-grow-tint",
  md: "size-12 rounded-control text-3xl bg-step-save-tint",
};

const GoalEmojiBadge = React.forwardRef<HTMLSpanElement, GoalEmojiBadgeProps>(
  ({ emoji, size = "md", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex items-center justify-center flex-shrink-0",
        sizeClasses[size],
        className
      )}
      aria-hidden
      {...props}
    >
      {emoji}
    </span>
  )
);

GoalEmojiBadge.displayName = "GoalEmojiBadge";

export { GoalEmojiBadge };
