import { NextResponse } from "next/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  WEEK_MS,
  calculateInterest,
  weeksElapsed,
} from "@/lib/jars";
import { activityLog, coinTransactions, jars } from "@/lib/schema";

/**
 * Weekly Save-jar interest accrual, driven by an external scheduler
 * (Vercel Cron / pg_cron) that sends `Authorization: Bearer <CRON_SECRET>`.
 *
 * For each Save jar, interest compounds over the whole weeks elapsed since the
 * last accrual (or the jar's creation, the first time). The per-jar UPDATE
 * guards on the previous `lastInterestAt` value, so a double-fired cron cannot
 * pay the same week twice — the second run matches no row. `lastInterestAt`
 * advances by exactly `weeks × 7 days` rather than to "now", preserving the
 * partial-week remainder for the next run.
 */
export async function POST(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saveJars = await db.query.jars.findMany({
      where: eq(jars.type, "save"),
      columns: { id: true, kidId: true, balance: true, lastInterestAt: true, createdAt: true },
      with: {
        kid: {
          columns: { familyId: true },
          with: {
            family: {
              columns: { id: true },
              with: { settings: { columns: { saveInterestBps: true } } },
            },
          },
        },
      },
    });

    const now = new Date();
    let jarsPaid = 0;
    let coinsPaid = 0;

    for (const jar of saveJars) {
      const bps = jar.kid?.family?.settings?.saveInterestBps ?? 0;
      const familyId = jar.kid?.family?.id;
      if (bps <= 0 || !familyId) continue;

      const baseline = jar.lastInterestAt ?? jar.createdAt;
      const weeks = weeksElapsed(baseline, now);
      if (weeks < 1) continue;

      const interest = calculateInterest(jar.balance, bps, weeks);
      const nextInterestAt = new Date(baseline.getTime() + weeks * WEEK_MS);

      const applied = await db.transaction(async (tx) => {
        // Idempotency guard: only advance from the lastInterestAt we read.
        const updated = await tx
          .update(jars)
          .set({
            balance: interest > 0 ? sql`${jars.balance} + ${interest}` : jar.balance,
            lastInterestAt: nextInterestAt,
          })
          .where(
            and(
              eq(jars.id, jar.id),
              jar.lastInterestAt === null
                ? isNull(jars.lastInterestAt)
                : eq(jars.lastInterestAt, jar.lastInterestAt)
            )
          )
          .returning({ id: jars.id });

        if (updated.length === 0) return false; // lost the race; skip ledger writes

        if (interest > 0) {
          await tx.insert(coinTransactions).values({
            kidId: jar.kidId,
            type: "interest",
            amount: interest,
            description: "Savings interest",
          });

          await tx.insert(activityLog).values({
            familyId,
            kidId: jar.kidId,
            type: "interest_paid",
            payload: { interest, rateBps: bps, weeks },
          });
        }

        return true;
      });

      if (applied && interest > 0) {
        jarsPaid += 1;
        coinsPaid += interest;
      }
    }

    return NextResponse.json({ jarsPaid, coinsPaid });
  } catch (err) {
    console.error("POST /api/cron/accrue-interest error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
