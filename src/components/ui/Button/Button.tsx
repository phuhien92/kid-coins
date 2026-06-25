"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "green"
  | "purple"
  | "ghost"
  | "chip"
  | "mini-yes"
  | "mini-no";

export type ButtonSize = "sm" | "md" | "full";

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  green: [
    "bg-green text-white border-[3px] border-ink font-display font-semibold text-[17px]",
    "rounded-[18px] shadow-[0_5px_0_var(--color-green-dk)]",
    "active:translate-y-1 active:shadow-[0_1px_0_var(--color-green-dk)]",
    "transition-all duration-[80ms] disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  purple: [
    "bg-purple text-white border-[2.5px] border-ink font-display font-semibold text-[15px]",
    "rounded-[14px] shadow-[0_4px_0_var(--color-purple-dk)]",
    "active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-purple-dk)]",
    "transition-all duration-[80ms] disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  ghost: [
    "bg-white text-ink border-[2px] border-ink font-display font-semibold text-[15px]",
    "rounded-[14px]",
    "hover:bg-black/5 active:bg-black/10",
    "transition-colors duration-[80ms] disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  chip: [
    "bg-white text-ink border-[2.5px] border-ink font-display font-semibold text-[14px]",
    "rounded-pill",
    "hover:bg-black/5 active:bg-black/10",
    "transition-colors duration-[80ms] disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  "mini-yes": [
    "bg-green text-white border-[2px] border-ink font-display font-semibold text-[13px]",
    "rounded-control shadow-[0_3px_0_var(--color-green-dk)]",
    "active:translate-y-[3px] active:shadow-[0_0px_0_var(--color-green-dk)]",
    "transition-all duration-[80ms] disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  "mini-no": [
    "bg-white text-ink-soft border-[2px] border-ink font-display font-semibold text-[13px]",
    "rounded-control",
    "hover:bg-black/5",
    "transition-colors duration-[80ms] disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-[9px] py-[8px]",
  md: "px-[18px] py-[11px]",
  full: "w-full px-[18px] py-[15px]",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "green", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };
