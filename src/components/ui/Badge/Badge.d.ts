import * as React from "react";
export type BadgeVariant = "streak" | "count" | "goal-chip" | "lav";
export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
    variant?: BadgeVariant;
};
declare const Badge: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "ref"> & {
    variant?: BadgeVariant;
} & React.RefAttributes<HTMLSpanElement>>;
export { Badge };
