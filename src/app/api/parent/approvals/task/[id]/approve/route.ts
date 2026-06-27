import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import {
  calculateCoinsEarned,
  isValidApprovalTier,
} from "@/lib/tasks";
import {
  activityLog,
  coinTransactions,
  kidProfiles,
  taskCompletions,
  tasks,
} from "@/lib/schema";

async function getFamilyCompletion(completionId: string, familyId: string) {
  const completion = await db.query.taskCompletions.findFirst({
    where: eq(taskCompletions.id, completionId),
  });

  if (!completion || completion.status !== "pending") return null;

  const kid = await db.query.kidProfiles.findFirst({
    where: and(
      eq(kidProfiles.id, completion.kidId),
      eq(kidProfiles.familyId, familyId)
    ),
    columns: { id: true, balance: true, name: true, familyId: true },
  });

  if (!kid) return null;

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, completion.taskId),
  });

  if (!task) return null;

  return { completion, kid, task };
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

    const record = await getFamilyCompletion(id, auth.family.id);
    if (!record) {
      return NextResponse.json({ error: "Completion not found" }, { status: 404 });
    }

    const body = await request.json();
    const paymentPercent =
      typeof body.paymentPercent === "number" ? body.paymentPercent : 100;
    const bonusCoins =
      typeof body.bonusCoins === "number" && body.bonusCoins > 0
        ? Math.floor(body.bonusCoins)
        : 0;

    if (!isValidApprovalTier(paymentPercent)) {
      return NextResponse.json({ error: "Invalid paymentPercent" }, { status: 400 });
    }

    const coinsEarned = calculateCoinsEarned(
      record.task.coinReward,
      paymentPercent,
      bonusCoins
    );

    const updated = await db.transaction(async (tx) => {
      const [completion] = await tx
        .update(taskCompletions)
        .set({
          status: "approved",
          paymentPercent,
          bonusCoins,
          coinsEarned,
          resolvedAt: new Date(),
        })
        .where(eq(taskCompletions.id, id))
        .returning();

      if (coinsEarned > 0) {
        await tx
          .update(kidProfiles)
          .set({ balance: record.kid.balance + coinsEarned })
          .where(eq(kidProfiles.id, record.kid.id));

        await tx.insert(coinTransactions).values({
          kidId: record.kid.id,
          type: "earned",
          amount: coinsEarned,
          description: record.task.title,
        });
      }

      await tx.insert(activityLog).values({
        familyId: auth.family.id,
        kidId: record.kid.id,
        type: "task_approved",
        payload: {
          taskTitle: record.task.title,
          completionId: completion.id,
          coinsEarned,
          paymentPercent,
          bonusCoins,
        },
      });

      return completion;
    });

    return NextResponse.json({
      completion: {
        id: updated.id,
        status: updated.status,
        coinsEarned: updated.coinsEarned,
        paymentPercent: updated.paymentPercent,
        bonusCoins: updated.bonusCoins,
        resolvedAt: updated.resolvedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("POST /api/parent/approvals/task/[id]/approve error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
