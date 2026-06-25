import * as React from "react";
export type ButtonVariant = "green" | "purple" | "ghost" | "chip" | "mini-yes" | "mini-no";
export type ButtonSize = "sm" | "md" | "full";
export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
};
declare const Button: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
} & React.RefAttributes<HTMLButtonElement>>;
export { Button };
