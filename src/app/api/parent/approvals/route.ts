import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import {
  kidProfiles,
  redemptionRequests,
  taskCompletions,
} from "@/lib/schema";

/**
 * GET /api/parent/approvals
 *
 * Family-wide feed of everything awaiting the parent's review:
 * pending task completions and pending reward redemptions, plus each kid's
 * current balance/avatar so the client can render rows and reflect credited
 * coins after an approval without a second round-trip.
 */
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
      columns: { id: true, name: true, avatarColor: true, balance: true },
      orderBy: (k, { asc }) => [asc(k.createdAt)],
    });

    if (kids.length === 0) {
      return NextResponse.json({ taskCompletions: [], redemptions: [], kids: [] });
    }

    const kidIds = kids.map((kid) => kid.id);

    const [completions, redemptions] = await Promise.all([
      db.query.taskCompletions.findMany({
        where: and(
          inArray(taskCompletions.kidId, kidIds),
          eq(taskCompletions.status, "pending")
        ),
        with: {
          task: { columns: { title: true } },
          kid: { columns: { name: true } },
        },
        orderBy: (c, { asc }) => [asc(c.completedAt)],
      }),
      db.query.redemptionRequests.findMany({
        where: and(
          inArray(redemptionRequests.kidId, kidIds),
          eq(redemptionRequests.status, "pending")
        ),
        with: {
          reward: { columns: { title: true } },
          kid: { columns: { name: true } },
        },
        orderBy: (r, { asc }) => [asc(r.createdAt)],
      }),
    ]);

    return NextResponse.json({
      taskCompletions: completions.map((completion) => ({
        id: completion.id,
        taskId: completion.taskId,
        taskTitle: completion.task?.title ?? "Task",
        kidId: completion.kidId,
        kidName: completion.kid?.name ?? "Kid",
        coinsEarned: completion.coinsEarned,
        paymentPercent: completion.paymentPercent,
        bonusCoins: completion.bonusCoins,
        status: completion.status,
        completedAt: completion.completedAt.toISOString(),
      })),
      redemptions: redemptions.map((redemption) => ({
        id: redemption.id,
        kidId: redemption.kidId,
        kidName: redemption.kid?.name ?? "Kid",
        rewardId: redemption.rewardId,
        rewardTitle: redemption.reward?.title ?? "Reward",
        coinsSpent: redemption.coinsSpent,
        status: redemption.status,
        createdAt: redemption.createdAt.toISOString(),
      })),
      kids,
    });
  } catch (err) {
    console.error("GET /api/parent/approvals error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
