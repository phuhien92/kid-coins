import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const stampedBase = [
  "inline-flex items-center gap-2 flex-shrink-0 min-h-tap",
  "bg-surface text-fg border border-line",
  "font-display font-extrabold text-sm",
  "rounded-pill shadow-card",
  "hover:bg-surface-sunken active:translate-y-px",
  "transition duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
].join(" ");

export type StampedChipProps = React.ComponentPropsWithoutRef<"button">;

/** Soft pill control chip (switch profile, back links). */
const StampedChip = React.forwardRef<HTMLButtonElement, StampedChipProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        stampedBase,
        "px-3.5 py-2",
        className
      )}
      {...props}
    />
  )
);

StampedChip.displayName = "StampedChip";

export type StampedChipLinkProps = React.ComponentPropsWithoutRef<typeof Link>;

function StampedChipLink({
  className,
  ...props
}: StampedChipLinkProps) {
  return (
    <Link
      className={cn(
        stampedBase,
        "px-3.5 py-2",
        className
      )}
      {...props}
    />
  );
}

export { StampedChip, StampedChipLink };
