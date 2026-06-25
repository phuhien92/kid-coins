import * as React from "react";
import { cn } from "@/lib/utils";

export type ProgressBarColor = "coin" | "green" | "purple";
export type ProgressBarHeight = "sm" | "md";

export type ProgressBarProps = {
  value: number;
  color?: ProgressBarColor;
  height?: ProgressBarHeight;
  className?: string;
  "aria-label"?: string;
};

const fillClasses: Record<ProgressBarColor, string> = {
  coin: "bg-coin",
  green: "bg-green",
  purple: "bg-purple",
};

const heightClasses: Record<ProgressBarHeight, string> = {
  sm: "h-[13px]",
  md: "h-4",
};

function ProgressBar({
  value,
  color = "coin",
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
        "w-full rounded-pill border-[2.5px] border-ink bg-lav-pale overflow-hidden",
        heightClasses[height],
        className
      )}
    >
      <div
        className={cn("h-full rounded-pill transition-all duration-500", fillClasses[color])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { ProgressBar };
