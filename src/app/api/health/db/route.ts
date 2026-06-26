import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/utils";

/** Lightweight DB probe — surfaces the real Postgres error in production. */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not set" },
      { status: 503 }
    );
  }

  try {
    const host = new URL(process.env.DATABASE_URL).host;
    const [row] = await db.execute<{ reg: string | null }>(
      sql`SELECT to_regclass('public.families') AS reg`
    );

    return NextResponse.json({
      ok: true,
      host,
      familiesTable: row?.reg ?? null,
    });
  } catch (err) {
    console.error("GET /api/health/db error:", err);
    return NextResponse.json(
      { ok: false, error: getDbErrorMessage(err) },
      { status: 500 }
    );
  }
}
