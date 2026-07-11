import { eq } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { families } from "@/lib/schema";

type AuthError = { error: 401 };
type FamilyError = { error: 404 };
type AuthSuccess = {
  user: { id: string };
  family: { id: string; parentUserId: string; name: string };
};

export type ParentAuthResult = AuthError | FamilyError | AuthSuccess;

export async function getAuthenticatedParentFamily(): Promise<ParentAuthResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 401 };
  }

  const family = await db.query.families.findFirst({
    where: eq(families.parentUserId, user.id),
  });

  if (!family) {
    return { error: 404 };
  }

  return { user: { id: user.id }, family };
}
