import { createClient } from "@/lib/supabase";
import { clearKidSession } from "@/lib/kid-session";

/** Clears Supabase auth and all Earnie browser session keys. Best-effort API call. */
export async function signOutAccount(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Still clear local state and redirect when the API call fails.
  }

  if (typeof window === "undefined") return;

  Object.keys(localStorage)
    .filter((k) => k.startsWith("sb-") || k.startsWith("earnie_"))
    .forEach((k) => localStorage.removeItem(k));

  clearKidSession();
}
