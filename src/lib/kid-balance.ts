import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
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
