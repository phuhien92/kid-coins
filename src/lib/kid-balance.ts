import { and, eq, gte, sql } from "drizzle-orm";
import { db, type Tx } from "@/lib/db";
import { kidProfiles, redemptionRequests } from "@/lib/schema";

export async function getKidEffectiveBalance(kidId: string): Promise<number | null> {
  const kid = await db.query.kidProfiles.findFirst({
    where: eq(kidProfiles.id, kidId),
    columns: { balance: true },
  });

  if (!kid) return null;

  const [pending] = await db
    .select({
      reserved: sql<number>`coalesce(sum(${redemptionRequests.coinsSpent}), 0)`,
    })
    .from(redemptionRequests)
    .where(
      and(
        eq(redemptionRequests.kidId, kidId),
        eq(redemptionRequests.status, "pending")
      )
    );

  return kid.balance - Number(pending?.reserved ?? 0);
}

export async function creditBalance(tx: Tx, kidId: string, amount: number) {
  await tx
    .update(kidProfiles)
    .set({ balance: sql`${kidProfiles.balance} + ${amount}` })
    .where(eq(kidProfiles.id, kidId));
}

export async function debitBalance(tx: Tx, kidId: string, amount: number) {
  await tx
    .update(kidProfiles)
    .set({ balance: sql`GREATEST(0, ${kidProfiles.balance} - ${amount})` })
    .where(eq(kidProfiles.id, kidId));
}

/**
 * Debits only if the kid can still afford the amount, and reports whether it
 * happened. The balance predicate lives in the UPDATE itself, so concurrent
 * spends of the same coins cannot both pass an earlier affordability check —
 * the loser matches no row and gets `false`.
 */
export async function debitBalanceIfAffordable(
  tx: Tx,
  kidId: string,
  amount: number
): Promise<boolean> {
  const debited = await tx
    .update(kidProfiles)
    .set({ balance: sql`${kidProfiles.balance} - ${amount}` })
    .where(and(eq(kidProfiles.id, kidId), gte(kidProfiles.balance, amount)))
    .returning({ id: kidProfiles.id });

  return debited.length > 0;
}
