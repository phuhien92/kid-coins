import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/utils";

/**
 * Lightweight DB probe for production diagnostics.
 * Gated by service-role key to avoid leaking operational info publicly.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not set" },
      { status: 503 }
    );
  }

  try {
    const [row] = await db.execute<{ reg: string | null }>(
      sql`SELECT to_regclass('public.families') AS reg`
    );

    return NextResponse.json({
      ok: true,
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
