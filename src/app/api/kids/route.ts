import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { families, kidProfiles } from "@/lib/schema";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const family = await db.query.families.findFirst({
      where: eq(families.parentUserId, user.id),
    });

    if (!family) {
      return NextResponse.json({ kids: [] });
    }

    const kids = await db.query.kidProfiles.findMany({
      where: eq(kidProfiles.familyId, family.id),
      columns: { id: true, name: true, avatarColor: true, balance: true },
      orderBy: (k, { asc }) => [asc(k.createdAt)],
    });

    return NextResponse.json({ kids });
  } catch (err) {
    console.error("GET /api/kids error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
