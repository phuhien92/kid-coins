import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verifyKidSession } from "@/lib/kid-session.server";
import { isTaskVisible } from "@/lib/tasks";
import {
  activityLog,
  coinTransactions,
  familySettings,
  kidProfiles,
  taskCompletions,
  tasks,
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
    const taskId = typeof body.taskId === "string" ? body.taskId : "";

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: eq(kidProfiles.id, kidId),
      columns: { id: true, familyId: true, balance: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.kidId, kidId)),
    });

    if (!task || !isTaskVisible(task)) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const settings = await db.query.familySettings.findFirst({
      where: eq(familySettings.familyId, kid.familyId),
    });

    const autoApprove = settings?.requireTaskApproval === false;

    const completion = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(taskCompletions)
        .values({
          taskId: task.id,
          kidId,
          coinsEarned: task.coinReward,
          status: autoApprove ? "approved" : "pending",
          paymentPercent: 100,
          bonusCoins: 0,
          resolvedAt: autoApprove ? new Date() : null,
        })
        .returning();

      if (!autoApprove) {
        await tx.insert(activityLog).values({
          familyId: kid.familyId,
          kidId,
          type: "task_completed",
          payload: {
            taskTitle: task.title,
            completionId: inserted.id,
            coinsEarned: task.coinReward,
          },
        });
        return inserted;
      }

      await tx
        .update(kidProfiles)
        .set({ balance: kid.balance + task.coinReward })
        .where(eq(kidProfiles.id, kidId));

      await tx.insert(coinTransactions).values({
        kidId,
        type: "earned",
        amount: task.coinReward,
        description: task.title,
      });

      await tx.insert(activityLog).values({
        familyId: kid.familyId,
        kidId,
        type: "task_approved",
        payload: {
          taskTitle: task.title,
          completionId: inserted.id,
          coinsEarned: task.coinReward,
        },
      });

      return inserted;
    });

    return NextResponse.json(
      {
        completion: {
          id: completion.id,
          taskId: completion.taskId,
          kidId: completion.kidId,
          coinsEarned: completion.coinsEarned,
          paymentPercent: completion.paymentPercent,
          bonusCoins: completion.bonusCoins,
          status: completion.status,
          completedAt: completion.completedAt.toISOString(),
          resolvedAt: completion.resolvedAt?.toISOString() ?? null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/kids/[id]/task-completions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
