"use client";

import { motion } from "framer-motion";
import { Badge, Button, CoinIcon, InitialAvatar } from "@/components/ui";
import { Card } from "@/components/ui/Card";
import { cn, formatCoins } from "@/lib/utils";

export type ApprovalCardProps = {
  kidName: string;
  avatarColor: string;
  title: string;
  /** Short kind label, e.g. "Task completed" or "Reward redemption". */
  subtitle: string;
  coins: number;
  /** Human-friendly submission time, e.g. "5m ago". */
  timeLabel: string;
  /** The kid's current coin balance, kept live as approvals settle. */
  kidBalance?: number;
  /** Disables both actions while a request is in flight. */
  busy?: boolean;
  onApprove: () => void;
  onDecline: () => void;
  className?: string;
};

/**
 * A single pending-approval row (task completion or reward redemption).
 *
 * Wrapped in a Framer Motion element so the parent's <AnimatePresence> can
 * slide it out when it's approved or declined.
 */
export function ApprovalCard({
  kidName,
  avatarColor,
  title,
  subtitle,
  coins,
  timeLabel,
  kidBalance,
  busy = false,
  onApprove,
  onDecline,
  className,
}: ApprovalCardProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ duration: 0.2 }}
      className="list-none"
    >
      <Card compact padding="none" radius="parent" className={cn("p-4", className)}>
        <div className="flex items-start gap-3">
          <InitialAvatar name={kidName} avatarColor={avatarColor} size="lg" />

          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-[16px] text-ink leading-tight truncate">
              <span>{kidName}</span>
              <span className="text-ink-soft"> · </span>
              <span>{title}</span>
            </p>
            <p className="font-body font-[800] text-[12px] text-ink-soft mt-0.5">
              {subtitle} · {timeLabel}
            </p>
          </div>

          <div className="flex items-center gap-1 text-green-dk flex-shrink-0">
            <CoinIcon size="sm" />
            <span className="font-body font-bold text-[13px]">{formatCoins(coins)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t-2 border-line">
          {kidBalance !== undefined && (
            <Badge
              variant="goal-chip"
              role="status"
              aria-label={`${kidName}'s balance: ${formatCoins(kidBalance)} coins`}
            >
              <CoinIcon size="sm" />
              <span>{formatCoins(kidBalance)}</span>
            </Badge>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="mini-no"
              size="sm"
              disabled={busy}
              onClick={onDecline}
            >
              Not now
            </Button>
            <Button
              type="button"
              variant="mini-yes"
              size="sm"
              disabled={busy}
              onClick={onApprove}
            >
              ✓ Approve
            </Button>
          </div>
        </div>
      </Card>
    </motion.li>
  );
}
