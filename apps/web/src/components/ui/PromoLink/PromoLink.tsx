import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PromoLinkVariant = "card" | "bar";

export type PromoLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  variant?: PromoLinkVariant;
};

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const variantClasses: Record<PromoLinkVariant, string> = {
  card: cn(
    "relative block overflow-hidden rounded-card p-5",
    "bg-linear-to-br from-action-hover to-action text-fg shadow-action",
    "hover:shadow-lift active:translate-y-px transition duration-150",
    focus
  ),
  bar: cn(
    "block bg-action text-on-action px-6 pt-5 pb-7",
    "hover:bg-action-hover active:bg-action-pressed transition-colors duration-150",
    focus
  ),
};

/** Full-bleed gold call-to-action link (kid home "tasks to earn" promo). */
const PromoLink = React.forwardRef<HTMLAnchorElement, PromoLinkProps>(
  ({ variant = "card", className, ...props }, ref) => (
    <Link
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
);

PromoLink.displayName = "PromoLink";

export { PromoLink };
