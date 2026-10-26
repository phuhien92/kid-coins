import * as React from "react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";
import { KidCoinMark } from "./KidCoinMark";

export type KidCoinLogoSize = "sm" | "md" | "lg";

export type KidCoinLogoProps = React.ComponentPropsWithoutRef<"span"> & {
  size?: KidCoinLogoSize;
  /** Hide the coin mark and show only the wordmark. */
  wordmarkOnly?: boolean;
};

const sizes: Record<KidCoinLogoSize, { mark: string; text: string; pill: string; gap: string }> = {
  sm: { mark: "size-8", text: "text-2xl", pill: "w-2.5 h-1.5 mx-0.5", gap: "gap-2" },
  md: { mark: "size-12", text: "text-4xl", pill: "w-4 h-2 mx-1", gap: "gap-3" },
  lg: { mark: "size-20", text: "text-6xl", pill: "w-6 h-3 mx-1.5", gap: "gap-4" },
};

/**
 * The kid-coin lockup: coin mark + lowercase heavy wordmark whose hyphen is a
 * short rounded gold pill. Screen readers hear "kid-coin" once.
 */
export function KidCoinLogo({ size = "md", wordmarkOnly = false, className, ...rest }: KidCoinLogoProps) {
  const s = sizes[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, className)} {...rest}>
      {!wordmarkOnly && <KidCoinMark className={s.mark} />}
      <span className="sr-only">{BRAND_NAME}</span>
      <span
        aria-hidden
        className={cn("inline-flex items-center font-display font-black text-fg leading-none tracking-tight", s.text)}
      >
        kid
        <span className={cn("inline-block rounded-pill bg-coin mt-1", s.pill)} />
        coin
      </span>
    </span>
  );
}
