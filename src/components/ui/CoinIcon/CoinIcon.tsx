import * as React from "react";
import { cn } from "@/lib/utils";

export type CoinIconSize = "sm" | "md" | "lg";

export type CoinIconProps = {
  size?: CoinIconSize;
  className?: string;
};

const sizeClasses: Record<CoinIconSize, string> = {
  sm: "w-[1em] h-[1em]",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

function CoinIcon({ size = "sm", className }: CoinIconProps) {
  return (
    <span
      aria-label="coin"
      role="img"
      className={cn(
        "inline-block rounded-pill bg-coin border-[1.6px] border-ink",
        "shadow-[inset_-0.12em_-0.12em_0_rgba(28,27,23,0.12)]",
        "flex-shrink-0",
        sizeClasses[size],
        className
      )}
    />
  );
}

export { CoinIcon };
