import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verifyKidSession } from "@/lib/kid-session.server";
import { withdrawFromSaveJar } from "@/lib/jars";
import { activityLog, coinTransactions, kidProfiles } from "@/lib/schema";

/**
 * Moves coins from the kid's Save jar back into their spendable Spend balance.
 * Give is one-way and cannot be withdrawn. The sufficiency guard lives in the
 * SQL UPDATE (via withdrawFromSaveJar); a losing concurrent withdrawal matches
 * no row and we return 400 without crediting Spend — never a fall-through.
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
    const amount =
      typeof body.amount === "number" && Number.isInteger(body.amount) && body.amount > 0
        ? body.amount
        : null;

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

    const result = await db.transaction(async (tx) => {
      const balances = await withdrawFromSaveJar(tx, kidId, amount);
      if (!balances) return null;

      await tx.insert(coinTransactions).values({
        kidId,
        type: "allocated",
        amount, // Spend increases as coins return from the Save jar
        description: "Moved from Save jar",
      });

      await tx.insert(activityLog).values({
        familyId: kid.familyId,
        kidId,
        type: "coins_allocated",
        payload: { jarType: "save", amount, direction: "withdraw" },
      });

      return balances;
    });

    if (!result) {
      return NextResponse.json({ error: "Not enough coins in the Save jar" }, { status: 400 });
    }

    return NextResponse.json({
      moved: amount,
      spend: result.spend,
      saveBalance: result.jarBalance,
    });
  } catch (err) {
    console.error("POST /api/kids/[id]/jars/withdraw error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
