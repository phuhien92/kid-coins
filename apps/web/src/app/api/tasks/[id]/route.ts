import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import { getTaskExpiresAt } from "@/lib/tasks";
import { kidProfiles, tasks } from "@/lib/schema";

async function getFamilyTask(taskId: string, familyId: string) {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) return null;

  const kid = await db.query.kidProfiles.findFirst({
    where: and(eq(kidProfiles.id, task.kidId), eq(kidProfiles.familyId, familyId)),
    columns: { id: true, name: true },
  });

  if (!kid) return null;

  return { task, kid };
}

function serializeTask(
  task: typeof tasks.$inferSelect,
  kidName?: string
) {
  const expiresAt = getTaskExpiresAt(task.scheduledStartAt, task.durationDays);
  return {
    id: task.id,
    kidId: task.kidId,
    kidName,
    title: task.title,
    emoji: task.emoji,
    type: task.type,
    coinReward: task.coinReward,
    scheduledStartAt: task.scheduledStartAt?.toISOString() ?? null,
    durationDays: task.durationDays,
    expiresAt: expiresAt?.toISOString() ?? null,
    isActive: task.isActive,
    createdAt: task.createdAt.toISOString(),
  };
}

export async function PATCH(
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

    const existing = await getFamilyTask(id, auth.family.id);
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Partial<typeof tasks.$inferInsert> = {};

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if (typeof body.emoji === "string" && body.emoji.trim()) {
      updates.emoji = body.emoji.trim();
    }
    if (body.type === "daily" || body.type === "once") {
      updates.type = body.type;
    }
    if (typeof body.coinReward === "number" && body.coinReward > 0) {
      updates.coinReward = Math.floor(body.coinReward);
    }
    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }
    if (body.scheduledStartAt === null) {
      updates.scheduledStartAt = null;
    } else if (typeof body.scheduledStartAt === "string" && body.scheduledStartAt) {
      const date = new Date(body.scheduledStartAt);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid scheduledStartAt" }, { status: 400 });
      }
      updates.scheduledStartAt = date;
    }
    if (body.durationDays === null) {
      updates.durationDays = null;
    } else if (typeof body.durationDays === "number" && body.durationDays > 0) {
      updates.durationDays = Math.floor(body.durationDays);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();

    return NextResponse.json({ task: serializeTask(task, existing.kid.name) });
  } catch (err) {
    console.error("PATCH /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await getFamilyTask(id, auth.family.id);
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await db.delete(tasks).where(eq(tasks.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
