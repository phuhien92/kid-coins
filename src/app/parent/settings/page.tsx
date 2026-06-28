"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toggle } from "@/components/ui";
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
    <div className="max-w-[560px] mx-auto w-full">
        <h2 className="font-display font-bold text-[26px] text-ink mb-6">
          Settings
        </h2>

        <section
          aria-label="Settings"
          className="bg-cream-card rounded-card shadow-card border border-line overflow-hidden"
        >
          <SettingRow label="Approve every redemption" description="Review before coins are deducted">
            <Toggle checked={settings.approveRedemptions} onChange={() => toggle("approveRedemptions")} ring="purple" />
          </SettingRow>

          <SettingRow label="Weekly AI summary" description="Email recap of your family's progress">
            <Toggle checked={settings.weeklyAiSummary} onChange={() => toggle("weeklyAiSummary")} ring="purple" />
          </SettingRow>

          <SettingRow label="Quiet hours" description="Pause notifications at night">
            <Toggle checked={settings.quietHours} onChange={() => toggle("quietHours")} ring="purple" />
          </SettingRow>

          <SettingRow label="Invite co-parent" description="Share family management access">
            <button className="font-body font-bold text-[13px] text-purple border-[2px] border-purple rounded-control px-3 py-1.5 hover:bg-purple/10 active:bg-purple/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1">
              Invite
            </button>
          </SettingRow>

          <SettingRow label="Change password" description="We'll send a reset link to your email">
            <button className="font-body font-bold text-[13px] text-ink-soft border-[2px] border-line rounded-control px-3 py-1.5 hover:bg-black/5 active:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1">
              Send link
            </button>
          </SettingRow>

          <div className="border-t border-line">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full font-body font-bold text-[13px] text-ink-soft hover:text-ink active:text-ink transition-colors px-5 py-4 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-inset"
            >
              {signingOut ? "Signing out…" : "← Sign out"}
            </button>
          </div>
        </section>
    </div>
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
        <p className="font-body font-bold text-[15px] text-ink">{label}</p>
        <p className="font-body text-[13px] text-ink-soft mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}
