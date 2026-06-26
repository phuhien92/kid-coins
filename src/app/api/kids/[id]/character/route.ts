import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verifyKidSession } from "@/lib/kid-session.server";
import { characters } from "@/lib/schema";

const CHARACTER_FIELDS = ["color", "hat", "eye", "extra", "bg"] as const;

type CharacterField = (typeof CHARACTER_FIELDS)[number];

function pickCharacterFields(body: Record<string, unknown>) {
  const result: Partial<Record<CharacterField, string>> = {};
  for (const field of CHARACTER_FIELDS) {
    const value = body[field];
    if (typeof value === "string" && value.trim()) {
      result[field] = value.trim();
    }
  }
  return result;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!verifyKidSession(request, id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const character = await db.query.characters.findFirst({
      where: eq(characters.kidId, id),
      columns: { color: true, hat: true, eye: true, extra: true, bg: true },
    });

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json({ character });
  } catch (err) {
    console.error("GET /api/kids/[id]/character error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!verifyKidSession(request, id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates = pickCharacterFields(body);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const existing = await db.query.characters.findFirst({
      where: eq(characters.kidId, id),
    });

    let character;

    if (existing) {
      [character] = await db
        .update(characters)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(characters.kidId, id))
        .returning({
          color: characters.color,
          hat: characters.hat,
          eye: characters.eye,
          extra: characters.extra,
          bg: characters.bg,
        });
    } else {
      [character] = await db
        .insert(characters)
        .values({ kidId: id, ...updates })
        .returning({
          color: characters.color,
          hat: characters.hat,
          eye: characters.eye,
          extra: characters.extra,
          bg: characters.bg,
        });
    }

    return NextResponse.json({ character });
  } catch (err) {
    console.error("PUT /api/kids/[id]/character error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
