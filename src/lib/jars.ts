import { and, eq, gte, sql } from "drizzle-orm";
import type { Tx } from "@/lib/db";
import { creditBalance, debitBalanceIfAffordable } from "@/lib/kid-balance";
import { jars } from "@/lib/schema";

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
 * jars, atomically, and reports whether it happened. The affordability
 * predicate lives in the Spend UPDATE (via `debitBalanceIfAffordable`), so two
 * concurrent allocations of the same coins cannot both pass an earlier check —
 * the loser debits no row and gets `false`, and the jar is never credited.
 */
export async function allocateToJar(
  tx: Tx,
  kidId: string,
  jarType: "save" | "give",
  amount: number
): Promise<boolean> {
  if (amount <= 0) return false;

  const afforded = await debitBalanceIfAffordable(tx, kidId, amount);
  if (!afforded) return false;

  await tx
    .update(jars)
    .set({ balance: sql`${jars.balance} + ${amount}` })
    .where(and(eq(jars.kidId, kidId), eq(jars.type, jarType)));

  return true;
}

/**
 * Moves `amount` coins from the kid's Save jar back into their spendable Spend
 * balance, atomically, and reports whether it happened. The sufficiency
 * predicate (`balance >= amount`) lives in the jar UPDATE, so a concurrent
 * withdrawal of the same coins matches no row and gets `false`; Spend is only
 * credited once the jar debit is confirmed. Give is one-way and cannot be
 * withdrawn — it is not accepted here.
 */
export async function withdrawFromSaveJar(
  tx: Tx,
  kidId: string,
  amount: number
): Promise<boolean> {
  if (amount <= 0) return false;

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
    .returning({ id: jars.id });

  if (debited.length === 0) return false;

  await creditBalance(tx, kidId, amount);
  return true;
}
