import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { getOrCreateFamily } from "@/lib/family";
import { families } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : (user.user_metadata?.family_name as string | undefined) ?? "My Family";

    const existing = await db.query.families.findFirst({
      where: eq(families.parentUserId, user.id),
      columns: { id: true },
    });

    if (existing) {
      return NextResponse.json({ success: true, created: false });
    }

    await getOrCreateFamily(user.id, name);

    return NextResponse.json({ success: true, created: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
