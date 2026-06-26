import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const stampedBase = [
  "inline-flex items-center gap-2 flex-shrink-0",
  "bg-cream-card text-ink border-[2.5px] border-ink",
  "font-display font-semibold text-[14px]",
  "rounded-control shadow-[0_3px_0_var(--color-ink)]",
  "hover:bg-white active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-ink)]",
  "transition-[transform,box-shadow,background-color] duration-75",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
].join(" ");

export type StampedChipProps = React.ComponentPropsWithoutRef<"button"> & {
  ring?: "green" | "purple";
};

/** Ink-stamped control chip (kid green or parent purple focus ring). */
const StampedChip = React.forwardRef<HTMLButtonElement, StampedChipProps>(
  ({ ring = "green", className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        stampedBase,
        "px-3.5 py-2",
        ring === "green" ? "focus-visible:ring-green" : "focus-visible:ring-purple",
        className
      )}
      {...props}
    />
  )
);

StampedChip.displayName = "StampedChip";

export type StampedChipLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  ring?: "green" | "purple";
};

function StampedChipLink({
  ring = "purple",
  className,
  ...props
}: StampedChipLinkProps) {
  return (
    <Link
      className={cn(
        stampedBase,
        "px-3.5 py-2",
        ring === "green" ? "focus-visible:ring-green" : "focus-visible:ring-purple",
        className
      )}
      {...props}
    />
  );
}

export { StampedChip, StampedChipLink };
