import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import {
  activityLog,
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
    columns: { id: true, name: true },
  });

  if (!kid) return null;

  const reward = await db.query.rewards.findFirst({
    where: and(eq(rewards.id, redemption.rewardId), eq(rewards.familyId, familyId)),
    columns: { title: true },
  });

  if (!reward) return null;

  return { redemption, kid, reward };
}

export async function POST(
  request: Request,
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

    const body = await request.json().catch(() => ({}));
    const reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : undefined;

    const updated = await db.transaction(async (tx) => {
      const [redemption] = await tx
        .update(redemptionRequests)
        .set({
          status: "denied",
          rejectionReason: reason,
          resolvedAt: new Date(),
        })
        .where(
          and(
            eq(redemptionRequests.id, id),
            eq(redemptionRequests.status, "pending")
          )
        )
        .returning();

      if (!redemption) return null;

      await tx.insert(activityLog).values({
        familyId: auth.family.id,
        kidId: record.kid.id,
        type: "reward_denied",
        payload: {
          rewardTitle: record.reward.title,
          requestId: redemption.id,
          reason,
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
        rejectionReason: updated.rejectionReason,
        resolvedAt: updated.resolvedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("POST /api/parent/approvals/redemption/[id]/decline error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
