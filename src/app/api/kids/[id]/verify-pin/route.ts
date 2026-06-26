import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { families, kidProfiles } from "@/lib/schema";
import { issueKidSessionToken } from "@/lib/kid-session.server";

export async function POST(
  request: Request,
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

    const body = await request.json();
    const pin: unknown = body.pin;

    if (typeof pin !== "string" || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 });
    }

    const family = await db.query.families.findFirst({
      where: eq(families.parentUserId, user.id),
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    const kid = await db.query.kidProfiles.findFirst({
      where: and(eq(kidProfiles.id, id), eq(kidProfiles.familyId, family.id)),
      columns: { id: true, pinHash: true },
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(pin, kid.pinHash);

    if (!valid) {
      // Constant-time rejection — no timing oracle
      return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
    }

    const sessionToken = issueKidSessionToken(kid.id);
    return NextResponse.json({ success: true, sessionToken });
  } catch (err) {
    console.error("POST /api/kids/[id]/verify-pin error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
