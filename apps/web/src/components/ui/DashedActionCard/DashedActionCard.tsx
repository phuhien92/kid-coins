import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type DashedActionCardVariant = "parent" | "picker";

export type DashedActionCardProps = {
  href: string;
  title: string;
  description?: string;
  variant?: DashedActionCardVariant;
  className?: string;
};

const variantClasses: Record<DashedActionCardVariant, string> = {
  parent: cn(
    "bg-step-grow-tint border-2 border-dashed border-step-grow-ink/40 rounded-tile",
    "hover:border-step-grow-ink/70"
  ),
  picker: cn(
    "bg-page border-2 border-dashed border-edge rounded-card",
    "hover:border-fg-muted hover:bg-surface"
  ),
};

/** Dashed CTA tile for “add” flows (profile picker, parent kids). */
function DashedActionCard({
  href,
  title,
  description,
  variant = "parent",
  className,
}: DashedActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center p-[18px]",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
        variant === "parent" ? "min-h-[150px]" : "min-h-[156px] gap-3 p-5",
        variantClasses[variant],
        className
      )}
    >
      <span
        className={cn(
          "rounded-pill bg-surface shadow-card flex items-center justify-center font-display font-extrabold text-fg",
          variant === "parent"
            ? "size-12 text-2xl"
            : "size-12 text-2xl text-fg-muted"
        )}
        aria-hidden
      >
        +
      </span>
      <span
        className={cn(
          "font-display font-extrabold text-fg",
          variant === "parent" ? "text-base" : "text-sm text-fg-muted leading-tight"
        )}
      >
        {title}
      </span>
      {description && (
        <span className="font-body font-extrabold text-xs text-fg-muted max-w-[200px]">
          {description}
        </span>
      )}
    </Link>
  );
}

export { DashedActionCard };
