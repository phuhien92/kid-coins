import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verifyKidSession } from "@/lib/kid-session.server";
import { allocateToJar } from "@/lib/jars";
import { activityLog, coinTransactions, jars, kidProfiles } from "@/lib/schema";

const JAR_LABELS: Record<"save" | "give", string> = {
  save: "Save jar",
  give: "Give jar",
};

/**
 * Moves coins from the kid's Spend balance into their Save or Give jar.
 * The affordability guard lives in the SQL UPDATE (via allocateToJar); a
 * losing concurrent move debits no row and we return 400 without crediting
 * the jar — never a fall-through.
 */
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
    const jarType: "save" | "give" | null =
      body.jarType === "save" || body.jarType === "give" ? body.jarType : null;
    const amount =
      typeof body.amount === "number" && Number.isInteger(body.amount) && body.amount > 0
        ? body.amount
        : null;

    if (!jarType) {
      return NextResponse.json({ error: "jarType must be 'save' or 'give'" }, { status: 400 });
    }
    if (amount == null) {
      return NextResponse.json({ error: "amount must be a positive integer" }, { status: 400 });
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: eq(kidProfiles.id, kidId),
      columns: { id: true, familyId: true, balance: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    // Advisory fast-reject; the authoritative guard is inside allocateToJar.
    if (kid.balance < amount) {
      return NextResponse.json({ error: "Not enough coins to move" }, { status: 400 });
    }

    const moved = await db.transaction(async (tx) => {
      const ok = await allocateToJar(tx, kidId, jarType, amount);
      if (!ok) return false;

      await tx.insert(coinTransactions).values({
        kidId,
        type: "allocated",
        amount: -amount, // Spend decreases as coins leave for the jar
        description: `Moved to ${JAR_LABELS[jarType]}`,
      });

      await tx.insert(activityLog).values({
        familyId: kid.familyId,
        kidId,
        type: "coins_allocated",
        payload: { jarType, amount, direction: "deposit" },
      });

      return true;
    });

    if (!moved) {
      return NextResponse.json({ error: "Not enough coins to move" }, { status: 400 });
    }

    const [jar] = await db
      .select({ balance: jars.balance })
      .from(jars)
      .where(and(eq(jars.kidId, kidId), eq(jars.type, jarType)));

    return NextResponse.json({
      jarType,
      moved: amount,
      spend: kid.balance - amount,
      jarBalance: jar?.balance ?? 0,
    });
  } catch (err) {
    console.error("POST /api/kids/[id]/jars/allocate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
