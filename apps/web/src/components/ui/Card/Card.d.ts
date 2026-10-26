import * as React from "react";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardProps = React.ComponentPropsWithoutRef<"div"> & {
    padding?: CardPadding;
    compact?: boolean;
};
declare const Card: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & {
    padding?: CardPadding;
    compact?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
export { Card };
