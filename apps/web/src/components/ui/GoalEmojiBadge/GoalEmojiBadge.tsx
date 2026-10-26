import * as React from "react";
import { cn } from "@/lib/utils";

export type GoalEmojiBadgeSize = "sm" | "md";

export type GoalEmojiBadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  emoji: string;
  size?: GoalEmojiBadgeSize;
};

const sizeClasses: Record<GoalEmojiBadgeSize, string> = {
  sm: "w-9 h-9 rounded-pill text-[18px] bg-lav-pale border-2",
  md: "w-[50px] h-[50px] rounded-[15px] text-[27px] bg-peach border-[2.5px]",
};

const GoalEmojiBadge = React.forwardRef<HTMLSpanElement, GoalEmojiBadgeProps>(
  ({ emoji, size = "md", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "border-ink flex items-center justify-center flex-shrink-0",
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
