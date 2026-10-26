import * as React from "react";
import { cn } from "@/lib/utils";

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "card" | "parent" | "control" | "xl" | "lg" | "pill";

export type CardProps = React.ComponentPropsWithoutRef<"div"> & {
  padding?: CardPadding;
  compact?: boolean;
  radius?: CardRadius;
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const radiusClasses: Record<CardRadius, string> = {
  card: "rounded-card",
  parent: "rounded-[20px]",
  control: "rounded-control",
  xl: "rounded-[26px]",
  lg: "rounded-[24px]",
  pill: "rounded-pill",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", compact = false, radius = "card", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-cream-card shadow-card",
        radiusClasses[radius],
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
