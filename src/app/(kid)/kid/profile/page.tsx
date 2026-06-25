"use client";

import { useRouter } from "next/navigation";
import { Page } from "@/components/ui";
import { KidComingSoon } from "@/components/kid/KidComingSoon";

export default function KidProfilePage() {
  const router = useRouter();

  function handleSignOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("earnie_char");
      localStorage.removeItem("earnie_kid_id");
      localStorage.removeItem("earnie_kid_name");
    }
    router.push("/profile-picker");
  }

  return (
    <Page>
      <Page.Content>
        <KidComingSoon
          title="Meet Penny — and dress her up"
          body="Hats, glasses, scenes. Your character studio is almost ready."
          emoji="✨"
        />
        <div className="flex justify-center mt-auto pb-2">
          <button
            onClick={handleSignOut}
            className="font-body font-bold text-[13px] text-ink-soft hover:text-ink active:text-ink transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1"
          >
            ← Sign out
          </button>
        </div>
      </Page.Content>
    </Page>
  );
}
