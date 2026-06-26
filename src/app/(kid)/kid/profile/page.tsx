"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Modal, Page, Toast } from "@/components/ui";
import { CharacterStudio } from "@/components/kid/CharacterStudio";
import { CharacterSVG } from "@/components/kid/CharacterSVG";
import { SwitchProfileButton } from "@/components/kid/SwitchProfileButton";
import {
  BG_COLORS,
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
  const router = useRouter();
  const [kidId, setKidId] = useState<string | null>(null);
  const [char, setChar] = useState<CharacterState>(DEFAULT_CHARACTER);
  const [studioOpen, setStudioOpen] = useState(false);
  const [draftChar, setDraftChar] = useState<CharacterState>(DEFAULT_CHARACTER);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("earnie_kid_id");
    if (!id) {
      router.replace("/profile-picker");
      return;
    }
    setKidId(id);

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

  const openStudio = useCallback(() => {
    setDraftChar(char);
    setStudioOpen(true);
  }, [char]);

  async function handleSaveCharacter() {
    if (!kidId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/kids/${kidId}/character`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...kidSessionHeaders(kidId),
        },
        body: JSON.stringify(draftChar),
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      setChar(data.character);
      saveCharToStorage(data.character);
      setStudioOpen(false);
      setToastVisible(true);
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) {
    return (
      <Page>
        <Page.Content className="items-center justify-center">
          <p className="font-body text-ink-soft">Loading profile…</p>
        </Page.Content>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Content className="gap-6 pb-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          {/* Character preview */}
          <section className="bg-cream-card border-[3px] border-ink rounded-card shadow-card overflow-hidden">
            <div
              className="relative flex items-center justify-center py-10 px-6 min-h-[240px]"
              style={{ backgroundColor: BG_COLORS[char.bg] ?? "#DEE0FA" }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--color-ink) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
                aria-hidden
              />
              <motion.div
                key={`${char.color}-${char.hat}-${char.eye}-${char.extra}`}
                initial={{ scale: 0.94, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <CharacterSVG char={char} size={150} />
              </motion.div>
            </div>
            <div className="p-5 border-t-[2.5px] border-ink">
              <button
                type="button"
                onClick={openStudio}
                className="w-full py-3.5 bg-green hover:bg-green-dk text-cream font-display font-semibold text-[16px] rounded-control border-[2.5px] border-ink shadow-[0_4px_0_var(--color-green-dk)] active:translate-y-[4px] active:shadow-none transition-[transform,box-shadow] duration-75"
              >
                Edit my character ✏️
              </button>
            </div>
          </section>

          {/* Badges + milestones */}
          <div className="flex flex-col gap-5">
            <section className="bg-cream-card border-[3px] border-ink rounded-card p-5 shadow-card">
              <h2 className="font-display font-semibold text-[17px] text-ink mb-4">
                My badges
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {LOCKED_BADGES.map((badge, index) => (
                  <div
                    key={`${badge.label}-${index}`}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-card border-[2px] border-ink bg-cream text-center",
                      badge.label.startsWith("Locked") && "opacity-40"
                    )}
                  >
                    <span className="text-[28px]" aria-hidden>
                      {badge.emoji}
                    </span>
                    <span className="font-body font-bold text-[11px] text-ink-soft leading-tight">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-cream-card border-[3px] border-ink rounded-card p-5 shadow-card">
              <h2 className="font-display font-semibold text-[17px] text-ink mb-4">
                My journey
              </h2>
              <div className="flex flex-col gap-4">
                {MILESTONES.map((milestone, index) => (
                  <div key={milestone.title} className="flex gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-pill border-[2px] border-ink flex items-center justify-center flex-shrink-0 font-display font-bold text-[13px]",
                        milestone.done
                          ? "bg-green text-cream"
                          : milestone.current
                            ? "bg-coin text-ink"
                            : "bg-cream text-ink-soft"
                      )}
                    >
                      {milestone.done ? "✓" : milestone.current ? "★" : index + 1}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-[14px] text-ink">
                        {milestone.title}
                      </p>
                      <p className="font-body text-[12px] text-ink-soft">
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

      <Modal
        open={studioOpen}
        onClose={() => setStudioOpen(false)}
        width="md"
        aria-label="Character Studio"
      >
        <div className="p-6 pt-8">
          <Modal.Close />
          <Modal.Title className="mb-4">Make it you!</Modal.Title>
          <CharacterStudio
            char={draftChar}
            onChange={setDraftChar}
            onSave={handleSaveCharacter}
            saving={saving}
          />
        </div>
      </Modal>

      <Toast
        message="Character saved!"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </Page>
  );
}
