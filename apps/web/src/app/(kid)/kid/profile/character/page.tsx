"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Page } from "@/components/ui/Page";
import { CharacterStudio } from "@/components/kid/CharacterStudio";
import {
  DEFAULT_CHARACTER,
  loadCharFromStorage,
  saveCharToStorage,
} from "@/lib/character";
import { outfitSceneBg } from "@/lib/guild-loadouts";
import { kidSessionHeaders } from "@/lib/kid-session";
import type { CharacterState } from "@/types";

function normalizeCharacter(char: CharacterState): CharacterState {
  if (char.outfit && char.outfit !== "none") return char;
  return { ...char, outfit: "wizard", bg: outfitSceneBg("wizard") };
}

export default function KidCharacterStudioPage() {
  const router = useRouter();
  const [kidId, setKidId] = useState<string | null>(null);
  const [char, setChar] = useState<CharacterState>(DEFAULT_CHARACTER);
  const [saving, setSaving] = useState(false);
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
      setChar(normalizeCharacter(cached));
      setHydrated(true);
      return;
    }

    fetch(`/api/kids/${id}/character`, {
      headers: kidSessionHeaders(id),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.character) {
          const next = normalizeCharacter(data.character);
          setChar(next);
          saveCharToStorage(next);
        }
      })
      .finally(() => setHydrated(true));
  }, [router]);

  async function handleSave() {
    if (!kidId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/kids/${kidId}/character`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...kidSessionHeaders(kidId),
        },
        body: JSON.stringify(char),
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      saveCharToStorage(data.character);
      router.push("/kid/profile?saved=1");
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) {
    return (
      <Page>
        <Page.Content className="items-center justify-center">
          <p className="font-body text-ink-soft">Loading studio…</p>
        </Page.Content>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Content className="max-w-5xl mx-auto w-full gap-4 pb-8">
        <header className="flex items-center gap-3 border-b border-ink/10 pb-4">
          <Link
            href="/kid/profile"
            className="font-body text-sm text-ink-soft hover:text-ink transition-colors"
          >
            ← Back to profile
          </Link>
        </header>

        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Guild studio</h1>
          <p className="font-body text-sm text-ink-soft mt-1">
            Pick your class and coin color, then save when you are happy.
          </p>
        </div>

        <CharacterStudio
          char={char}
          onChange={setChar}
          onSave={handleSave}
          saving={saving}
          layout="page"
        />
      </Page.Content>
    </Page>
  );
}
