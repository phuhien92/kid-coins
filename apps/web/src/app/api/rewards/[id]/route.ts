import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
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

    const existing = await db.query.rewards.findFirst({
      where: and(eq(rewards.id, id), eq(rewards.familyId, auth.family.id)),
    });

    if (!existing) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Partial<typeof rewards.$inferInsert> = {};

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if (typeof body.emoji === "string" && body.emoji.trim()) {
      updates.emoji = body.emoji.trim();
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim() || null;
    }
    if (typeof body.coinCost === "number" && body.coinCost > 0) {
      updates.coinCost = Math.floor(body.coinCost);
    }
    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }
    if (body.quantity === null) {
      updates.quantity = null;
    } else if (typeof body.quantity === "number" && body.quantity > 0) {
      updates.quantity = Math.floor(body.quantity);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const [reward] = await db
      .update(rewards)
      .set(updates)
      .where(eq(rewards.id, id))
      .returning();

    return NextResponse.json({ reward: serializeReward(reward) });
  } catch (err) {
    console.error("PATCH /api/rewards/[id] error:", err);
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

    const existing = await db.query.rewards.findFirst({
      where: and(eq(rewards.id, id), eq(rewards.familyId, auth.family.id)),
    });

    if (!existing) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const [reward] = await db
      .update(rewards)
      .set({ isActive: false })
      .where(eq(rewards.id, id))
      .returning();

    return NextResponse.json({ reward: serializeReward(reward) });
  } catch (err) {
    console.error("DELETE /api/rewards/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
