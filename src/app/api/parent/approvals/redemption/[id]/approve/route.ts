import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { debitBalance } from "@/lib/kid-balance";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import { hasRewardStock, shouldDeactivateReward } from "@/lib/rewards";
import {
  activityLog,
  coinTransactions,
  kidProfiles,
  redemptionRequests,
  rewards,
} from "@/lib/schema";

async function getFamilyRedemption(requestId: string, familyId: string) {
  const redemption = await db.query.redemptionRequests.findFirst({
    where: eq(redemptionRequests.id, requestId),
  });

  if (!redemption || redemption.status !== "pending") return null;

  const kid = await db.query.kidProfiles.findFirst({
    where: and(
      eq(kidProfiles.id, redemption.kidId),
      eq(kidProfiles.familyId, familyId)
    ),
    columns: { id: true, balance: true, name: true },
  });

  if (!kid) return null;

  const reward = await db.query.rewards.findFirst({
    where: and(eq(rewards.id, redemption.rewardId), eq(rewards.familyId, familyId)),
  });

  if (!reward) return null;

  return { redemption, kid, reward };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedParentFamily();
    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error === 401 ? "Not authenticated" : "Family not found" },
        { status: auth.error }
      );
    }

    const record = await getFamilyRedemption(id, auth.family.id);
    if (!record) {
      return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
    }

    if (record.kid.balance < record.redemption.coinsSpent) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (!hasRewardStock(record.reward.quantity, record.reward.quantityUsed)) {
      return NextResponse.json({ error: "Reward is sold out" }, { status: 400 });
    }

    const updated = await db.transaction(async (tx) => {
      const [redemption] = await tx
        .update(redemptionRequests)
        .set({ status: "approved", resolvedAt: new Date() })
        .where(
          and(
            eq(redemptionRequests.id, id),
            eq(redemptionRequests.status, "pending")
          )
        )
        .returning();

      if (!redemption) return null;

      await debitBalance(tx, record.kid.id, record.redemption.coinsSpent);

      const nextQuantityUsed = record.reward.quantityUsed + 1;
      const rewardUpdates: Partial<typeof rewards.$inferInsert> = {
        quantityUsed: nextQuantityUsed,
      };

      if (shouldDeactivateReward(record.reward.quantity, nextQuantityUsed)) {
        rewardUpdates.isActive = false;
      }

      await tx
        .update(rewards)
        .set(rewardUpdates)
        .where(eq(rewards.id, record.reward.id));

      await tx.insert(coinTransactions).values({
        kidId: record.kid.id,
        type: "redeemed",
        amount: -record.redemption.coinsSpent,
        description: record.reward.title,
      });

      await tx.insert(activityLog).values({
        familyId: auth.family.id,
        kidId: record.kid.id,
        type: "reward_approved",
        payload: {
          rewardTitle: record.reward.title,
          requestId: redemption.id,
          coinsSpent: record.redemption.coinsSpent,
        },
      });

      return redemption;
    });

    if (!updated) {
      return NextResponse.json({ error: "Redemption already resolved" }, { status: 409 });
    }

    return NextResponse.json({
      redemption: {
        id: updated.id,
        status: updated.status,
        resolvedAt: updated.resolvedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("POST /api/parent/approvals/redemption/[id]/approve error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
