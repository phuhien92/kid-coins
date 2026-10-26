import * as React from "react";
import { Card } from "@/components/ui";
import { CoinIcon } from "@/components/ui";
import { cn } from "@/lib/utils";

export type JarAccent = "spend" | "save" | "give";

export type JarCardProps = {
  emoji: string;
  label: string;
  balance: number;
  accent?: JarAccent;
  /** Small supporting line under the balance (e.g. projected interest). */
  footnote?: React.ReactNode;
  className?: string;
};

const accentClasses: Record<JarAccent, string> = {
  spend: "bg-coin",
  save: "bg-green-tint",
  give: "bg-lav-pale",
};

/**
 * A single money bucket (Spend, Save, or Give). Composes the design-system
 * Card and CoinIcon; the balance carries `role="status"` so a move is announced
 * to assistive tech, per the coin-balance accessibility rule.
 */
function JarCard({
  emoji,
  label,
  balance,
  accent = "spend",
  footnote,
  className,
}: JarCardProps) {
  return (
    <Card
      compact
      padding="sm"
      className={cn("flex items-center gap-3", className)}
    >
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-pill border-2 border-ink text-2xl shrink-0",
          accentClasses[accent]
        )}
      >
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="font-display font-semibold text-sm text-ink-soft">{label}</p>
        <p
          role="status"
          className="flex items-center gap-1.5 font-display font-bold text-lg text-ink"
        >
          <CoinIcon size="md" />
          {balance}
        </p>
        {footnote ? (
          <p className="font-body text-xs text-ink-soft mt-0.5">{footnote}</p>
        ) : null}
      </div>
    </Card>
  );
}

export { JarCard };
