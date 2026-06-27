import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import { getTaskExpiresAt } from "@/lib/tasks";
import { kidProfiles, tasks } from "@/lib/schema";

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

export async function GET() {
  try {
    const auth = await getAuthenticatedParentFamily();
    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error === 401 ? "Not authenticated" : "Family not found" },
        { status: auth.error }
      );
    }

    const kids = await db.query.kidProfiles.findMany({
      where: eq(kidProfiles.familyId, auth.family.id),
      columns: { id: true, name: true },
    });

    if (kids.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    const kidIds = kids.map((kid) => kid.id);
    const kidNameById = new Map(kids.map((kid) => [kid.id, kid.name]));

    const familyTasks = await db.query.tasks.findMany({
      where: inArray(tasks.kidId, kidIds),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    return NextResponse.json({
      tasks: familyTasks.map((task) =>
        serializeTask(task, kidNameById.get(task.kidId))
      ),
    });
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedParentFamily();
    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error === 401 ? "Not authenticated" : "Family not found" },
        { status: auth.error }
      );
    }

    const body = await request.json();
    const kidId = typeof body.kidId === "string" ? body.kidId : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "✅";
    const type = body.type === "once" ? "once" : "daily";
    const coinReward =
      typeof body.coinReward === "number" && body.coinReward > 0
        ? Math.floor(body.coinReward)
        : 10;
    const scheduledStartAt =
      typeof body.scheduledStartAt === "string" && body.scheduledStartAt
        ? new Date(body.scheduledStartAt)
        : null;
    const durationDays =
      typeof body.durationDays === "number" && body.durationDays > 0
        ? Math.floor(body.durationDays)
        : null;

    if (!kidId || !title) {
      return NextResponse.json(
        { error: "kidId and title are required" },
        { status: 400 }
      );
    }

    if (scheduledStartAt && Number.isNaN(scheduledStartAt.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledStartAt" }, { status: 400 });
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: and(eq(kidProfiles.id, kidId), eq(kidProfiles.familyId, auth.family.id)),
      columns: { id: true, name: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const [task] = await db
      .insert(tasks)
      .values({
        kidId,
        title,
        emoji,
        type,
        coinReward,
        scheduledStartAt,
        durationDays,
      })
      .returning();

    return NextResponse.json({ task: serializeTask(task, kid.name) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
