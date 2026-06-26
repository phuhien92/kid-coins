import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
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

    const body = await request.json();
    const pin: unknown = body.pin;

    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 });
    }

    const family = await db.query.families.findFirst({
      where: eq(families.parentUserId, user.id),
      columns: { parentPinHash: true },
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    if (!family.parentPinHash) {
      return NextResponse.json({ error: "No PIN set" }, { status: 400 });
    }

    const valid = await bcrypt.compare(pin, family.parentPinHash);

    if (!valid) {
      return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/parent/verify-pin error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
