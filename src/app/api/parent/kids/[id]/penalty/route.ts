import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthenticatedParentFamily } from "@/lib/parent-auth";
import {
  activityLog,
  coinTransactions,
  kidProfiles,
} from "@/lib/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kidId } = await params;
    const auth = await getAuthenticatedParentFamily();
    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error === 401 ? "Not authenticated" : "Family not found" },
        { status: auth.error }
      );
    }

    const body = await request.json();
    const amount =
      typeof body.amount === "number" && body.amount > 0
        ? Math.floor(body.amount)
        : 0;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!amount || !reason) {
      return NextResponse.json(
        { error: "amount and reason are required" },
        { status: 400 }
      );
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: and(eq(kidProfiles.id, kidId), eq(kidProfiles.familyId, auth.family.id)),
      columns: { id: true, balance: true, name: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const updated = await db.transaction(async (tx) => {
      const nextBalance = Math.max(0, kid.balance - amount);

      const [profile] = await tx
        .update(kidProfiles)
        .set({ balance: nextBalance })
        .where(eq(kidProfiles.id, kidId))
        .returning({ balance: kidProfiles.balance });

      await tx.insert(coinTransactions).values({
        kidId,
        type: "adjusted",
        amount: -amount,
        description: reason,
      });

      await tx.insert(activityLog).values({
        familyId: auth.family.id,
        kidId,
        type: "coins_adjusted",
        payload: { delta: -amount, reason },
      });

      return profile;
    });

    return NextResponse.json({
      kid: {
        id: kidId,
        balance: updated.balance,
      },
    });
  } catch (err) {
    console.error("POST /api/parent/kids/[id]/penalty error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
