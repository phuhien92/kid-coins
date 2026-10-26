import * as React from "react";
import { cn } from "@/lib/utils";

export type ProgressBarColor = "gold" | "mint" | "grow";
export type ProgressBarHeight = "sm" | "md";

export type ProgressBarProps = {
  value: number;
  color?: ProgressBarColor;
  height?: ProgressBarHeight;
  className?: string;
  "aria-label"?: string;
};

const fillClasses: Record<ProgressBarColor, string> = {
  gold: "bg-gold",
  mint: "bg-mint",
  grow: "bg-grow",
};

const heightClasses: Record<ProgressBarHeight, string> = {
  sm: "h-3",
  md: "h-4",
};

function ProgressBar({
  value,
  color = "gold",
  height = "md",
  className,
  "aria-label": ariaLabel = "Progress",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(
        "w-full rounded-pill bg-cream-deep overflow-hidden",
        heightClasses[height],
        className
      )}
    >
      <div
        className={cn("h-full rounded-pill transition-[width] duration-500", fillClasses[color])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { ProgressBar };
