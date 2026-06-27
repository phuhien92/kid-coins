import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import { getRemainingStock } from "@/lib/rewards";
import { rewards } from "@/lib/schema";

function serializeReward(reward: typeof rewards.$inferSelect) {
  return {
    id: reward.id,
    familyId: reward.familyId,
    title: reward.title,
    description: reward.description,
    coinCost: reward.coinCost,
    emoji: reward.emoji,
    quantity: reward.quantity,
    quantityUsed: reward.quantityUsed,
    remainingStock: getRemainingStock(reward.quantity, reward.quantityUsed),
    isActive: reward.isActive,
    createdAt: reward.createdAt.toISOString(),
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

    const familyRewards = await db.query.rewards.findMany({
      where: eq(rewards.familyId, auth.family.id),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    return NextResponse.json({
      rewards: familyRewards.map(serializeReward),
    });
  } catch (err) {
    console.error("GET /api/rewards error:", err);
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
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "🎁";
    const description =
      typeof body.description === "string" ? body.description.trim() : undefined;
    const coinCost =
      typeof body.coinCost === "number" && body.coinCost > 0
        ? Math.floor(body.coinCost)
        : 0;
    const quantity =
      typeof body.quantity === "number" && body.quantity > 0
        ? Math.floor(body.quantity)
        : null;

    if (!title || coinCost <= 0) {
      return NextResponse.json(
        { error: "title and positive coinCost are required" },
        { status: 400 }
      );
    }

    const [reward] = await db
      .insert(rewards)
      .values({
        familyId: auth.family.id,
        title,
        emoji,
        description,
        coinCost,
        quantity,
      })
      .returning();

    return NextResponse.json({ reward: serializeReward(reward) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/rewards error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
