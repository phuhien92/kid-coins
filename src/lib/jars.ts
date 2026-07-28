import { and, eq, gte, sql } from "drizzle-orm";
import type { Tx } from "@/lib/db";
import { creditBalance, debitBalanceIfAffordable } from "@/lib/kid-balance";
import { jars, kidProfiles } from "@/lib/schema";

/** Post-move balances, read authoritatively inside the same transaction. */
export type JarMoveResult = { spend: number; jarBalance: number };

/** How many whole 7-day weeks have elapsed between two instants. */
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function weeksElapsed(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / WEEK_MS);
}

/**
 * Interest earned on a Save-jar balance after `weeks` of compounding at
 * `bps` basis points per week (500 = 5.00%/week). Integer coins only —
 * each week rounds down, so a balance too small to earn a whole coin never
 * grows. Returns the total interest to credit (compounded balance minus the
 * starting balance), never negative.
 */
export function calculateInterest(
  balance: number,
  bps: number,
  weeks: number
): number {
  if (balance <= 0 || bps <= 0 || weeks <= 0) return 0;
  let current = balance;
  for (let i = 0; i < weeks; i++) {
    const weekly = Math.floor((current * bps) / 10000);
    if (weekly <= 0) break; // too small to ever grow; stop early
    current += weekly;
  }
  return current - balance;
}

/**
 * Moves `amount` coins from the kid's spendable Spend balance into one of their
 * jars, atomically. Returns the post-move balances, or `null` when the move
 * couldn't be afforded (or the amount was non-positive).
 *
 * The affordability predicate lives in the Spend UPDATE (via
 * `debitBalanceIfAffordable`), so two concurrent allocations of the same coins
 * cannot both pass an earlier check — the loser debits no row and gets `null`,
 * and the jar is never credited. The jar credit is itself a guarded
 * `UPDATE ... RETURNING`: if the (kid, type) jar row is absent (a data-integrity
 * violation) after Spend was already debited, this throws to roll the whole
 * transaction back rather than silently losing the coins.
 */
export async function allocateToJar(
  tx: Tx,
  kidId: string,
  jarType: "save" | "give",
  amount: number
): Promise<JarMoveResult | null> {
  if (amount <= 0) return null;

  const afforded = await debitBalanceIfAffordable(tx, kidId, amount);
  if (!afforded) return null;

  const credited = await tx
    .update(jars)
    .set({ balance: sql`${jars.balance} + ${amount}` })
    .where(and(eq(jars.kidId, kidId), eq(jars.type, jarType)))
    .returning({ balance: jars.balance });

  if (credited.length === 0) {
    // Spend was already debited; the missing jar row means we'd lose the coins.
    // Throw so the transaction rolls the debit back.
    throw new Error(`Missing ${jarType} jar for kid ${kidId}`);
  }

  const [kid] = await tx
    .select({ balance: kidProfiles.balance })
    .from(kidProfiles)
    .where(eq(kidProfiles.id, kidId));

  return { spend: kid?.balance ?? 0, jarBalance: credited[0].balance };
}

/**
 * Moves `amount` coins from the kid's Save jar back into their spendable Spend
 * balance, atomically. Returns the post-move balances, or `null` when the Save
 * jar didn't hold enough (or the amount was non-positive). The sufficiency
 * predicate (`balance >= amount`) lives in the jar UPDATE, so a concurrent
 * withdrawal of the same coins matches no row and gets `null`; Spend is only
 * credited once the jar debit is confirmed. Give is one-way and cannot be
 * withdrawn — it is not accepted here.
 */
export async function withdrawFromSaveJar(
  tx: Tx,
  kidId: string,
  amount: number
): Promise<JarMoveResult | null> {
  if (amount <= 0) return null;

  const debited = await tx
    .update(jars)
    .set({ balance: sql`${jars.balance} - ${amount}` })
    .where(
      and(
        eq(jars.kidId, kidId),
        eq(jars.type, "save"),
        gte(jars.balance, amount)
      )
    )
    .returning({ balance: jars.balance });

  if (debited.length === 0) return null;

  await creditBalance(tx, kidId, amount);

  const [kid] = await tx
    .select({ balance: kidProfiles.balance })
    .from(kidProfiles)
    .where(eq(kidProfiles.id, kidId));

  return { spend: kid?.balance ?? 0, jarBalance: debited[0].balance };
}
