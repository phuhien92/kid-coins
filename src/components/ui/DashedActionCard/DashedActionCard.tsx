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
    "bg-lav-pale border-[2.5px] border-dashed border-purple rounded-[20px]",
    "hover:bg-lav-pale/80 focus-visible:ring-purple"
  ),
  picker: cn(
    "bg-cream border-[3px] border-dashed border-ink/25 rounded-card",
    "hover:border-ink/40 hover:bg-cream-card focus-visible:ring-green"
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "parent" ? "min-h-[150px]" : "min-h-[156px] gap-3 p-5",
        variantClasses[variant],
        className
      )}
    >
      <span
        className={cn(
          "rounded-pill border-[2.5px] border-ink bg-white flex items-center justify-center font-display font-semibold text-ink",
          variant === "parent"
            ? "w-[46px] h-[46px] text-[26px]"
            : "w-[52px] h-[52px] text-[24px] text-ink-soft border-ink/30"
        )}
        aria-hidden
      >
        +
      </span>
      <span
        className={cn(
          "font-display font-semibold text-ink",
          variant === "parent" ? "text-[15px]" : "text-[14px] text-ink-soft leading-tight"
        )}
      >
        {title}
      </span>
      {description && (
        <span className="font-body font-[800] text-[12px] text-ink-soft max-w-[200px]">
          {description}
        </span>
      )}
    </Link>
  );
}

export { DashedActionCard };
