import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { families } from "@/lib/schema";

/**
 * Returns the parent's family row, creating one if the account predates
 * family provisioning or signup never completed the insert.
 */
export async function getOrCreateFamily(
  parentUserId: string,
  name = "My Family"
) {
  const existing = await db.query.families.findFirst({
    where: eq(families.parentUserId, parentUserId),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(families)
    .values({
      parentUserId,
      name: name.trim() || "My Family",
    })
    .returning();

  return created;
}
