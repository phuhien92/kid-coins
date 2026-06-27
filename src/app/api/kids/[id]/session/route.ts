import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { families, kidProfiles } from "@/lib/schema";
import { issueKidSessionToken } from "@/lib/kid-session.server";

/**
 * Issues a kid session token on behalf of an authenticated parent.
 * No kid PIN is required here — the parent has already authenticated via Supabase
 * and is consciously choosing which child profile to open. The route validates that
 * the requested kid belongs to the parent's own family before issuing the token.
 *
 * NOTE: A child using an authenticated device could reach this endpoint directly.
 * If stricter access control is needed in future, require the parent PIN before
 * issuing the token (see /api/parent/verify-pin).
 */
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
