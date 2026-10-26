import * as React from "react";
import Link from "next/link";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "chip" | "mini-yes" | "mini-no";
export type ButtonSize = "sm" | "md" | "full";
export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
};
/** Class string for a button look — shared by <Button> and <ButtonLink>. */
declare function buttonClasses(variant?: ButtonVariant, size?: ButtonSize, className?: string): string;
declare const Button: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
} & React.RefAttributes<HTMLButtonElement>>;
export type ButtonLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
};
/** A navigation link that looks like a button. */
declare const ButtonLink: React.ForwardRefExoticComponent<Omit<Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof import("next/link").LinkProps<any>> & import("next/link").LinkProps<any> & {
    children?: React.ReactNode | undefined;
} & React.RefAttributes<HTMLAnchorElement>, "ref"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
} & React.RefAttributes<HTMLAnchorElement>>;
export { Button, ButtonLink, buttonClasses };
