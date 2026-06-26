import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { families, kidProfiles } from "@/lib/schema";
import { issueKidSessionToken } from "@/lib/kid-session.server";

/** Issues a kid session token without requiring a PIN.
 *  Only callable by an authenticated parent (Supabase session required).
 *  The profile picker page is only reachable when the parent is logged in,
 *  so this is safe — the parent is consciously selecting a kid profile. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: and(eq(kidProfiles.id, id), eq(kidProfiles.familyId, family.id)),
      columns: { id: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const sessionToken = issueKidSessionToken(kid.id);
    return NextResponse.json({ sessionToken });
  } catch (err) {
    console.error("POST /api/kids/[id]/session error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
