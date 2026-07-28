import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verifyKidSession } from "@/lib/kid-session.server";
import { calculateInterest } from "@/lib/jars";
import { familySettings, jars, kidProfiles } from "@/lib/schema";

/**
 * Returns the kid's three buckets: Spend (kidProfiles.balance), Save, and Give,
 * plus the interest the Save jar would earn over the next week at the family's
 * current rate — the projected-interest nudge that makes compounding visible.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kidId } = await params;

    if (!verifyKidSession(request, kidId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: eq(kidProfiles.id, kidId),
      columns: { id: true, familyId: true, balance: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const kidJars = await db.query.jars.findMany({
      where: eq(jars.kidId, kidId),
      columns: { type: true, balance: true },
    });

    const settings = await db.query.familySettings.findFirst({
      where: eq(familySettings.familyId, kid.familyId),
      columns: { saveInterestBps: true },
    });

    const save = kidJars.find((j) => j.type === "save")?.balance ?? 0;
    const give = kidJars.find((j) => j.type === "give")?.balance ?? 0;
    const rateBps = settings?.saveInterestBps ?? 0;

    return NextResponse.json({
      jars: {
        spend: kid.balance,
        save,
        give,
      },
      interest: {
        rateBps,
        projectedNextWeek: calculateInterest(save, rateBps, 1),
      },
    });
  } catch (err) {
    console.error("GET /api/kids/[id]/jars error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
