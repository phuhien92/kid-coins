"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Toggle } from "@/components/ui";
import { createClient } from "@/lib/supabase";
import { clearKidSession } from "@/lib/kid-session";
import { cn } from "@/lib/utils";

type SettingsState = {
  approveRedemptions: boolean;
  weeklyAiSummary: boolean;
  quietHours: boolean;
};

export default function ParentSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsState>({
    approveRedemptions: true,
    weeklyAiSummary: true,
    quietHours: false,
  });
  const [signingOut, setSigningOut] = useState(false);

  function toggle(key: keyof SettingsState) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Best-effort — still redirect even if the API call fails
    } finally {
      if (typeof window !== "undefined") {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("sb-"))
          .forEach((k) => localStorage.removeItem(k));
        clearKidSession();
      }
      router.push("/login");
    }
  }

  return (
    <main className="min-h-screen bg-cream px-5 pt-8 pb-10">
      <div className="max-w-[560px] mx-auto">
        <h1 className="font-display font-black text-3xl text-ink mb-6">
          Settings
        </h1>

        <section
          aria-label="Settings"
          className="bg-cream-card rounded-card shadow-card border border-line overflow-hidden"
        >
          <SettingRow label="Approve every redemption" description="Review before coins are deducted">
            <Toggle checked={settings.approveRedemptions} onChange={() => toggle("approveRedemptions")} />
          </SettingRow>

          <SettingRow label="Weekly AI summary" description="Email recap of your family's progress">
            <Toggle checked={settings.weeklyAiSummary} onChange={() => toggle("weeklyAiSummary")} />
          </SettingRow>

          <SettingRow label="Quiet hours" description="Pause notifications at night">
            <Toggle checked={settings.quietHours} onChange={() => toggle("quietHours")} />
          </SettingRow>

          <SettingRow label="Invite co-parent" description="Share family management access">
            <Button variant="chip" size="sm" className="px-4">
              Invite
            </Button>
          </SettingRow>

          <SettingRow label="Change password" description="We'll send a reset link to your email">
            <Button variant="chip" size="sm" className="px-4">
              Send link
            </Button>
          </SettingRow>

          <div className="border-t border-line">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full font-body font-bold text-sm text-ink-soft hover:text-ink active:text-ink transition-colors px-5 py-4 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
            >
              {signingOut ? "Signing out…" : "← Sign out"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingRow({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 px-5 py-4 border-b border-line last:border-b-0", className)}>
      <div className="flex-1 min-w-0">
        <p className="font-body font-bold text-base text-ink">{label}</p>
        <p className="font-body text-sm text-ink-soft mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}
