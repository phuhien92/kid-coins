"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CharacterState } from "@/types";
import { Button } from "@/components/ui/Button";
import { FantasyGuildCharacter } from "@/components/kid/FantasyGuildCharacter";
import { AccessoryChips } from "@/components/parent/new-kid-profile/GuildAccessoryArt";
import { FREE_OUTFITS } from "@/lib/character";
import {
  COLOR_SWATCHES,
  GUILD_LOADOUTS,
  OUTFIT_OPTIONS,
  outfitSceneBg,
  outfitXpCost,
} from "@/lib/guild-loadouts";
import { cn } from "@/lib/utils";

type StudioTab = "class" | "skin";
type StudioLayout = "compact" | "page";

type CharacterStudioProps = {
  char: CharacterState;
  onChange: (char: CharacterState) => void;
  onSave: () => void;
  saving?: boolean;
  layout?: StudioLayout;
  unlockedOutfits?: string[];
};

function skinColor(char: CharacterState): string {
  return (
    COLOR_SWATCHES.find((sw) => sw.key === char.color)?.value ?? "var(--color-coin)"
  );
}

function activeOutfit(char: CharacterState): string {
  return char.outfit && char.outfit !== "none" ? char.outfit : "wizard";
}

export function CharacterStudio({
  char,
  onChange,
  onSave,
  saving = false,
  layout = "compact",
  unlockedOutfits = FREE_OUTFITS,
}: CharacterStudioProps) {
  const [tab, setTab] = useState<StudioTab>("class");
  const outfitOptions = OUTFIT_OPTIONS.filter((opt) => opt.value !== "none");
  const currentOutfit = activeOutfit(char);
  const selectedLabel =
    OUTFIT_OPTIONS.find((opt) => opt.value === currentOutfit)?.label ?? "Wizard";
  const loadout = GUILD_LOADOUTS[currentOutfit] ?? GUILD_LOADOUTS.wizard;
  const isPage = layout === "page";

  function pickOutfit(outfit: string) {
    const cost = outfitXpCost(outfit);
    const locked = cost !== null && !unlockedOutfits.includes(outfit);
    if (locked) return;

    onChange({
      ...char,
      outfit,
      bg: outfitSceneBg(outfit),
    });
  }

  function pickColor(color: string) {
    onChange({ ...char, color });
  }

  const preview = (
    <motion.div
      key={`${currentOutfit}-${char.color}`}
      initial={{ scale: 0.96, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "flex items-center justify-center rounded-card border border-line bg-page",
        isPage ? "py-8" : "py-6"
      )}
    >
      <FantasyGuildCharacter
        outfit={currentOutfit}
        mode="coin"
        skinColor={skinColor(char)}
        size={isPage ? 180 : 140}
      />
    </motion.div>
  );

  const tabs = (
    <div className="flex gap-2">
      {(
        [
          { id: "class" as const, label: "Class" },
          { id: "skin" as const, label: "Skin" },
        ] as const
      ).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setTab(item.id)}
          aria-pressed={tab === item.id}
          className={cn(
            "flex-1 min-h-tap px-3 py-2 rounded-control border border-line font-display font-extrabold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
            tab === item.id ? "bg-action-secondary text-on-action-secondary" : "bg-surface text-fg"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  const classPanel = (
    <div className="flex flex-col gap-4">
      <p className="font-body text-sm text-fg-muted">
        Pick your guild class. Locked classes unlock with earned XP.
      </p>
      <ul
        className={cn(
          "grid gap-3",
          isPage
            ? "grid-cols-2 sm:grid-cols-3 ipad-landscape:grid-cols-2 desktop:grid-cols-3"
            : "grid-cols-2 max-h-64 overflow-y-auto pr-1"
        )}
      >
        {outfitOptions.map((opt) => {
          const xp = outfitXpCost(opt.value);
          const selected = currentOutfit === opt.value;
          const locked = xp !== null && !unlockedOutfits.includes(opt.value);

          return (
            <li key={opt.value}>
              <button
                type="button"
                disabled={locked}
                onClick={() => pickOutfit(opt.value)}
                aria-pressed={selected}
                aria-label={locked ? `${opt.label} — locked (${xp} XP)` : opt.label}
                className={cn(
                  "w-full min-h-36 flex flex-col items-center rounded-card border border-line p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  selected && "ring-2 ring-coin-lo ring-offset-2",
                  locked
                    ? "border-dashed border-edge bg-surface-sunken grayscale cursor-not-allowed"
                    : selected
                      ? "bg-step-do-tint"
                      : "bg-surface hover:bg-step-grow-tint"
                )}
              >
                <FantasyGuildCharacter
                  outfit={opt.value}
                  mode="coin"
                  skinColor={skinColor(char)}
                  size={72}
                />
                <span className="font-display font-black text-sm text-fg mt-1">
                  {opt.label}
                </span>
                {xp === null ? (
                  <span className="font-body text-xs text-success font-bold">Free</span>
                ) : locked ? (
                  <span className="font-body text-xs text-fg-muted">{xp} XP</span>
                ) : (
                  <span className="font-body text-xs text-success font-bold">Unlocked</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="rounded-control border border-line bg-success-tint p-3">
        <p className="font-display font-black text-sm text-fg">{selectedLabel} starter kit</p>
        <AccessoryChips items={loadout.starter} className="mt-2" />
      </div>
    </div>
  );

  const skinPanel = (
    <div className="flex flex-col gap-3">
      <p className="font-body text-sm text-fg-muted">
        Choose a coin body color for your class character.
      </p>
      <div className={cn("grid gap-3", isPage ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-3")}>
        {COLOR_SWATCHES.map((sw) => (
          <button
            key={sw.key}
            type="button"
            onClick={() => pickColor(sw.key)}
            aria-pressed={char.color === sw.key}
            aria-label={sw.label}
            className={cn(
              "min-h-20 rounded-card border border-line bg-page p-2 font-body text-xs font-bold text-fg transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              char.color === sw.key && "ring-4 ring-fg ring-offset-2"
            )}
          >
            <span
              className="mx-auto mb-2 block h-9 w-9 rounded-pill border border-line"
              style={{ backgroundColor: sw.value }}
            />
            {sw.label}
          </button>
        ))}
      </div>
    </div>
  );

  const saveButton = (
    <Button
      type="button"
      variant="primary"
      size="full"
      onClick={onSave}
      disabled={saving}
    >
      {saving ? "Saving…" : "Save character"}
    </Button>
  );

  if (isPage) {
    return (
      <div className="flex flex-col gap-6 pb-24 ipad-landscape:pb-6">
        <section className="grid gap-6 ipad-landscape:grid-cols-[320px_1fr] ipad-landscape:items-start">
          <div className="rounded-card border border-line bg-surface p-5 shadow-card ipad-landscape:sticky ipad-landscape:top-6">
            <p className="font-display font-black text-2xl text-fg">Your character</p>
            <p className="font-body text-sm text-fg-muted mt-1">
              Class: <span className="font-bold text-fg">{selectedLabel}</span>
            </p>
            <div className="mt-5">{preview}</div>
            <div className="mt-4 rounded-control border border-line bg-success-tint p-3">
              <p className="font-display font-black text-sm text-fg">Starter kit</p>
              <AccessoryChips items={loadout.starter} className="mt-2" />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <section className="rounded-card border border-line bg-surface p-5 shadow-card">
              <h2 className="font-display font-black text-xl text-fg mb-4">Customize</h2>
              {tabs}
              <div className="mt-4">{tab === "class" ? classPanel : skinPanel}</div>
            </section>
            <div className="hidden ipad-landscape:block">{saveButton}</div>
          </div>
        </section>

        <div className="fixed bottom-above-nav left-0 right-0 border-t border-fg/10 bg-page px-5 py-4 ipad-landscape:hidden">
          {saveButton}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {preview}
      {tabs}
      {tab === "class" ? classPanel : skinPanel}
      {saveButton}
    </div>
  );
}
