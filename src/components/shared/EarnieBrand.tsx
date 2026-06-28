import Link from "next/link";
import { appNavFocusRing, type AppNavRegister } from "@/components/shared/AppNav/types";
import { cn } from "@/lib/utils";

/** Canonical Earnie wordmark — same markup and styling in every app shell. */
export function EarnieBrand({
  href,
  register = "kid",
  className,
}: {
  href: string;
  register?: AppNavRegister;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-display font-semibold text-[22px] text-ink leading-none",
        appNavFocusRing(register),
        "rounded-control",
        className
      )}
    >
      Earnie
    </Link>
  );
}
