"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Page, Toast } from "@/components/ui";
import { FantasyGuildCharacter } from "@/components/kid/FantasyGuildCharacter";
import { SwitchProfileButton } from "@/components/kid/SwitchProfileButton";
import { KidJarsSection } from "@/components/kid/KidJarsSection";
import {
  BG_COLORS,
  CHAR_COLORS,
  DEFAULT_CHARACTER,
  loadCharFromStorage,
  saveCharToStorage,
} from "@/lib/character";
import { kidSessionHeaders } from "@/lib/kid-session";
import type { CharacterState } from "@/types";
import { cn } from "@/lib/utils";

const LOCKED_BADGES = [
  { emoji: "🔥", label: "Streaker" },
  { emoji: "💪", label: "Helper" },
  { emoji: "⭐", label: "Star saver" },
  { emoji: "🏆", label: "Locked" },
  { emoji: "🎯", label: "Locked" },
];

const MILESTONES = [
  { title: "First 100 coins", detail: "Unlocked Sept 12", done: true },
  { title: "7-day streak", detail: "You did it!", done: true },
  { title: "Halfway to the bike", detail: "50 coins to go!", current: true },
  { title: "New bike day", detail: "2,500 coins", done: false },
];

export default function KidProfilePage() {
  return (
    <Suspense fallback={<LoadingProfile />}>
      <KidProfileContent />
    </Suspense>
  );
}

function LoadingProfile() {
  return (
    <Page>
      <Page.Content className="items-center justify-center">
        <p className="font-body text-fg-muted">Loading profile…</p>
      </Page.Content>
    </Page>
  );
}

function KidProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [char, setChar] = useState<CharacterState>(DEFAULT_CHARACTER);
  const [toastVisible, setToastVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("earnie_kid_id");
    if (!id) {
      router.replace("/profile-picker");
      return;
    }

    const cached = loadCharFromStorage();
    if (cached) {
      setChar(cached);
      setHydrated(true);
      return;
    }

    fetch(`/api/kids/${id}/character`, {
      headers: kidSessionHeaders(id),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.character) {
          setChar(data.character);
          saveCharToStorage(data.character);
        }
      })
      .finally(() => setHydrated(true));
  }, [router]);

  useEffect(() => {
    if (searchParams.get("saved") === "1") {
      setToastVisible(true);
      router.replace("/kid/profile");
    }
  }, [searchParams, router]);

  if (!hydrated) {
    return (
      <Page>
        <Page.Content className="items-center justify-center">
          <p className="font-body text-fg-muted">Loading profile…</p>
        </Page.Content>
      </Page>
    );
  }

  const previewOutfit =
    char.outfit && char.outfit !== "none" ? char.outfit : "wizard";
  const previewSkin = CHAR_COLORS[char.color] ?? CHAR_COLORS.yellow;
  const previewBg = BG_COLORS[char.bg] ?? BG_COLORS.sky;

  return (
    <Page>
      <Page.Content className="gap-6 pb-8">
        <KidJarsSection />

        <div className="grid gap-6 ipad-landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] ipad-landscape:items-start">
          <section className="bg-surface border border-line rounded-card shadow-card overflow-hidden">
            <div
              className="relative flex items-center justify-center py-10 px-6 min-h-60"
              style={{ backgroundColor: previewBg }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--color-fg) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
                aria-hidden
              />
              <motion.div
                key={`${previewOutfit}-${char.color}`}
                initial={{ scale: 0.94, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <FantasyGuildCharacter
                  outfit={previewOutfit}
                  mode="coin"
                  skinColor={previewSkin}
                  size={150}
                />
              </motion.div>
            </div>
            <div className="p-5 border-t border-line">
              <Link
                href="/kid/profile/character"
                className="block w-full py-3.5 bg-action hover:bg-action-hover active:bg-action-pressed text-on-action font-display font-extrabold text-base text-center rounded-control border border-line shadow-card active:translate-y-px active:shadow-none transition-[transform,box-shadow] duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                Edit my character ✏️
              </Link>
            </div>
          </section>

          <div className="flex flex-col gap-5">
            <section className="bg-surface border border-line rounded-card p-5 shadow-card">
              <h2 className="font-display font-extrabold text-lg text-fg mb-4">
                My badges
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {LOCKED_BADGES.map((badge, index) => (
                  <div
                    key={`${badge.label}-${index}`}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-card border text-center",
                      badge.label.startsWith("Locked")
                        ? "border-dashed border-edge bg-surface-sunken"
                        : "border-line bg-step-do-tint"
                    )}
                  >
                    <span
                      className={cn("text-3xl", badge.label.startsWith("Locked") && "grayscale opacity-50")}
                      aria-hidden
                    >
                      {badge.emoji}
                    </span>
                    <span className="font-body font-bold text-xs text-fg-muted leading-tight">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface border border-line rounded-card p-5 shadow-card">
              <h2 className="font-display font-extrabold text-lg text-fg mb-4">
                My journey
              </h2>
              <div className="flex flex-col gap-4">
                {MILESTONES.map((milestone, index) => (
                  <div key={milestone.title} className="flex gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-pill border border-line flex items-center justify-center flex-shrink-0 font-display font-black text-sm",
                        milestone.done
                          ? "bg-coin text-fg"
                          : milestone.current
                            ? "bg-coin text-fg"
                            : "bg-page text-fg-muted"
                      )}
                    >
                      {milestone.done ? "✓" : milestone.current ? "★" : index + 1}
                    </div>
                    <div>
                      <p className="font-display font-extrabold text-sm text-fg">
                        {milestone.title}
                      </p>
                      <p className="font-body text-xs text-fg-muted">
                        {milestone.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-center mt-auto pt-4">
          <SwitchProfileButton size="full" className="max-w-[280px]" />
        </div>
      </Page.Content>

      <Toast
        message="Character saved!"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </Page>
  );
}
