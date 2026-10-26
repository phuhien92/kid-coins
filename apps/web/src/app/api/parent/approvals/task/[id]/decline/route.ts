import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import {
  activityLog,
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
    columns: { id: true, name: true, familyId: true },
  });

  if (!kid) return null;

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, completion.taskId),
    columns: { title: true },
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

    const body = await request.json().catch(() => ({}));
    const reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : undefined;

    const updated = await db.transaction(async (tx) => {
      const [completion] = await tx
        .update(taskCompletions)
        .set({
          status: "denied",
          paymentPercent: 0,
          bonusCoins: 0,
          coinsEarned: 0,
          rejectionReason: reason,
          resolvedAt: new Date(),
        })
        .where(and(eq(taskCompletions.id, id), eq(taskCompletions.status, "pending")))
        .returning();

      if (!completion) return null;

      await tx.insert(activityLog).values({
        familyId: auth.family.id,
        kidId: record.kid.id,
        type: "task_denied",
        payload: {
          taskTitle: record.task.title,
          completionId: completion.id,
          reason,
        },
      });

      return completion;
    });

    if (!updated) {
      return NextResponse.json({ error: "Completion already resolved" }, { status: 409 });
    }

    return NextResponse.json({
      completion: {
        id: updated.id,
        status: updated.status,
        rejectionReason: updated.rejectionReason,
        resolvedAt: updated.resolvedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("POST /api/parent/approvals/task/[id]/decline error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
