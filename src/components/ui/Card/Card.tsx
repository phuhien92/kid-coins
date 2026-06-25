import * as React from "react";
import { cn } from "@/lib/utils";

export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = React.ComponentPropsWithoutRef<"div"> & {
  padding?: CardPadding;
  compact?: boolean;
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", compact = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-cream-card rounded-card shadow-card",
        compact ? "border-[2.5px] border-ink" : "border-[3px] border-ink",
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

export { Card };
