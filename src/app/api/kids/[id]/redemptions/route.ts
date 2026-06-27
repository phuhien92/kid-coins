import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verifyKidSession } from "@/lib/kid-session.server";
import { getKidEffectiveBalance } from "@/lib/kid-balance";
import { hasRewardStock } from "@/lib/rewards";
import {
  activityLog,
  kidProfiles,
  redemptionRequests,
  rewards,
} from "@/lib/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kidId } = await params;

    if (!verifyKidSession(request, kidId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rewardId = typeof body.rewardId === "string" ? body.rewardId : "";

    if (!rewardId) {
      return NextResponse.json({ error: "rewardId is required" }, { status: 400 });
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: eq(kidProfiles.id, kidId),
      columns: { id: true, familyId: true, name: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const reward = await db.query.rewards.findFirst({
      where: and(eq(rewards.id, rewardId), eq(rewards.familyId, kid.familyId)),
    });

    if (!reward || !reward.isActive) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    if (!hasRewardStock(reward.quantity, reward.quantityUsed)) {
      return NextResponse.json({ error: "Reward is sold out" }, { status: 400 });
    }

    const effectiveBalance = await getKidEffectiveBalance(kidId);
    if (effectiveBalance == null || effectiveBalance < reward.coinCost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const redemption = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(redemptionRequests)
        .values({
          kidId,
          rewardId: reward.id,
          coinsSpent: reward.coinCost,
          status: "pending",
        })
        .returning();

      await tx.insert(activityLog).values({
        familyId: kid.familyId,
        kidId,
        type: "reward_redeemed",
        payload: {
          rewardTitle: reward.title,
          requestId: inserted.id,
          coinsSpent: reward.coinCost,
        },
      });

      return inserted;
    });

    return NextResponse.json(
      {
        redemption: {
          id: redemption.id,
          kidId: redemption.kidId,
          rewardId: redemption.rewardId,
          rewardTitle: reward.title,
          coinsSpent: redemption.coinsSpent,
          status: redemption.status,
          createdAt: redemption.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/kids/[id]/redemptions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
