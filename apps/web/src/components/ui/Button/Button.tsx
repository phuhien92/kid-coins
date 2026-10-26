"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "chip"
  | "mini-yes"
  | "mini-no";

export type ButtonSize = "sm" | "md" | "full";

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base = [
  // min-h-tap: every button is at least a 44pt touch target.
  "inline-flex items-center justify-center gap-2 min-h-tap font-display font-extrabold",
  "transition duration-150 active:translate-y-px",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page",
  "disabled:opacity-50 disabled:pointer-events-none",
].join(" ");

const variantClasses: Record<ButtonVariant, string> = {
  // Gold — the primary action everywhere (kid and parent).
  primary: "bg-action text-on-action text-lg rounded-pill shadow-action hover:bg-action-hover active:bg-action-pressed",
  // Navy — confident secondary / parent action.
  secondary: "bg-action-secondary text-on-action-secondary text-base rounded-pill shadow-card hover:bg-action-secondary-hover",
  ghost: "bg-surface text-fg text-base rounded-pill border border-line hover:bg-surface-sunken",
  chip: "bg-surface text-fg text-sm rounded-pill border border-line hover:bg-surface-sunken",
  "mini-yes": "bg-action text-on-action text-sm rounded-control shadow-action hover:bg-action-hover active:bg-action-pressed",
  "mini-no": "bg-surface text-fg-muted text-sm rounded-control border border-line hover:bg-surface-sunken hover:text-fg",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2",
  md: "px-5 py-2.5",
  full: "w-full px-5 py-3.5",
};

/** Class string for a button look — shared by <Button> and <ButtonLink>. */
function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variantClasses[variant], sizeClasses[size], className);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
  )
);

Button.displayName = "Button";

export type ButtonLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** A navigation link that looks like a button. */
const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <Link ref={ref} className={buttonClasses(variant, size, className)} {...props} />
  )
);

ButtonLink.displayName = "ButtonLink";

export { Button, ButtonLink, buttonClasses };
