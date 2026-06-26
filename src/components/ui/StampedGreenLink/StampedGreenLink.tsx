import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type StampedGreenLinkVariant = "card" | "bar";

export type StampedGreenLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  variant?: StampedGreenLinkVariant;
};

const variantClasses: Record<StampedGreenLinkVariant, string> = {
  card: cn(
    "relative block bg-green text-white border-[3px] border-ink rounded-[24px] p-5",
    "shadow-[0_6px_0_var(--color-green-dk)]",
    "active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-green-dk)]",
    "transition-[transform,box-shadow] duration-75 overflow-hidden",
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-2"
  ),
  bar: cn(
    "block bg-green text-white border-t-[3px] border-ink px-6 pt-5 pb-7",
    "shadow-[inset_0_4px_0_var(--color-green-dk)] active:bg-green-dk transition-colors",
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-[-6px]"
  ),
};

const StampedGreenLink = React.forwardRef<HTMLAnchorElement, StampedGreenLinkProps>(
  ({ variant = "card", className, ...props }, ref) => (
    <Link
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
);

StampedGreenLink.displayName = "StampedGreenLink";

export { StampedGreenLink };
