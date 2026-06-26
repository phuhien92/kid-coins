import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { isValidAvatarColor } from "@/lib/character";
import { getOrCreateFamily } from "@/lib/family";
import { getDbErrorMessage } from "@/lib/utils";
import { activityLog, characters, families, kidProfiles } from "@/lib/schema";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("GET /api/kids: DATABASE_URL is not set");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

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
    return NextResponse.json({ error: getDbErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("POST /api/kids: DATABASE_URL is not set");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const pin = typeof body.pin === "string" ? body.pin : "";
    const avatarColor =
      typeof body.avatarColor === "string" ? body.avatarColor : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits" },
        { status: 400 }
      );
    }

    if (!isValidAvatarColor(avatarColor)) {
      return NextResponse.json({ error: "Invalid avatar color" }, { status: 400 });
    }

    const family = await getOrCreateFamily(
      user.id,
      (user.user_metadata?.family_name as string | undefined) ?? "My Family"
    );

    const pinHash = await bcrypt.hash(pin, 10);

    const kid = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(kidProfiles)
        .values({
          familyId: family.id,
          name,
          avatarColor,
          pinHash,
        })
        .returning({
          id: kidProfiles.id,
          name: kidProfiles.name,
          avatarColor: kidProfiles.avatarColor,
          balance: kidProfiles.balance,
        });

      await tx.insert(characters).values({ kidId: inserted.id });

      await tx.insert(activityLog).values({
        familyId: family.id,
        kidId: inserted.id,
        type: "kid_added",
        payload: { kidName: name },
      });

      return inserted;
    });

    return NextResponse.json({ kid }, { status: 201 });
  } catch (err) {
    console.error("POST /api/kids error:", err);
    return NextResponse.json({ error: getDbErrorMessage(err) }, { status: 500 });
  }
}
