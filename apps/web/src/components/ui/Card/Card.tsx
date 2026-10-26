import * as React from "react";
import { cn } from "@/lib/utils";

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "card" | "tile" | "control" | "sheet" | "pill";

export type CardProps = React.ComponentPropsWithoutRef<"div"> & {
  padding?: CardPadding;
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
  tile: "rounded-tile",
  control: "rounded-control",
  sheet: "rounded-sheet",
  pill: "rounded-pill",
};

/** Soft cream card — the page's primary container. */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", radius = "card", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-surface border border-line shadow-card",
        radiusClasses[radius],
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

export { Card };
