import { and, eq, isNull, or, sql } from "drizzle-orm";
import type { Tx } from "@/lib/db";
import { rewards } from "@/lib/schema";

export function getRemainingStock(
  quantity: number | null,
  quantityUsed: number
): number | null {
  if (quantity == null) return null;
  return Math.max(0, quantity - quantityUsed);
}

export function hasRewardStock(
  quantity: number | null,
  quantityUsed: number
): boolean {
  if (quantity == null) return true;
  return quantityUsed < quantity;
}

export function shouldDeactivateReward(
  quantity: number | null,
  quantityUsed: number
): boolean {
  if (quantity == null) return false;
  return quantityUsed >= quantity;
}

/**
 * Takes one unit of a limited reward's stock, and reports whether stock was
 * left to take. The remaining-stock predicate lives in the UPDATE itself, so
 * concurrent approvals of the same reward cannot both pass an earlier
 * `hasRewardStock` check and push `quantityUsed` past `quantity` — the loser
 * matches no row and gets `false`. Unlimited rewards (`quantity` null) always
 * succeed. Deactivates the reward once the last unit is taken.
 */
export async function claimRewardStock(tx: Tx, rewardId: string): Promise<boolean> {
  const [claimed] = await tx
    .update(rewards)
    .set({ quantityUsed: sql`${rewards.quantityUsed} + 1` })
    .where(
      and(
        eq(rewards.id, rewardId),
        or(
          isNull(rewards.quantity),
          sql`${rewards.quantityUsed} < ${rewards.quantity}`
        )
      )
    )
    .returning({ quantity: rewards.quantity, quantityUsed: rewards.quantityUsed });

  if (!claimed) return false;

  if (shouldDeactivateReward(claimed.quantity, claimed.quantityUsed)) {
    await tx.update(rewards).set({ isActive: false }).where(eq(rewards.id, rewardId));
  }

  return true;
}
