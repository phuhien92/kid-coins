import * as React from "react";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "card" | "tile" | "control" | "sheet" | "pill";
export type CardProps = React.ComponentPropsWithoutRef<"div"> & {
    padding?: CardPadding;
    radius?: CardRadius;
};
/** Soft cream card — the page's primary container. */
declare const Card: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & {
    padding?: CardPadding;
    radius?: CardRadius;
} & React.RefAttributes<HTMLDivElement>>;
export { Card };
