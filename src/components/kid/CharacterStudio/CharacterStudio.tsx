"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CharacterState } from "@/types";
import {
  BG_COLORS,
  CHAR_COLORS,
  CHARACTER_CATEGORIES,
  CHARACTER_OPTIONS,
  CATEGORY_FIELD,
  type CharacterCategory,
  randomCharacter,
} from "@/lib/character";
import { cn } from "@/lib/utils";
import { CharacterSVG } from "@/components/kid/CharacterSVG";

type CharacterStudioProps = {
  char: CharacterState;
  onChange: (char: CharacterState) => void;
  onSave: () => void;
  saving?: boolean;
};

export function CharacterStudio({
  char,
  onChange,
  onSave,
  saving = false,
}: CharacterStudioProps) {
  const [activeCategory, setActiveCategory] = useState<CharacterCategory>("Color");
  const [popKey, setPopKey] = useState(0);
  const options = CHARACTER_OPTIONS[activeCategory];
  const field = CATEGORY_FIELD[activeCategory];
  const currentValue = char[field];

  function pick(value: string) {
    onChange({ ...char, [field]: value });
  }

  function handleRandomize() {
    onChange(randomCharacter());
    setPopKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-[13px] text-ink-soft">Customize your look</p>
        <button
          type="button"
          onClick={handleRandomize}
          className="w-10 h-10 rounded-control border-[2.5px] border-ink bg-cream-card flex items-center justify-center text-[20px] hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1"
          aria-label="Randomize character"
        >
          🎲
        </button>
      </div>

      <motion.div
        key={popKey}
        initial={popKey > 0 ? { scale: 0.92 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        className="flex items-center justify-center rounded-card border-[2.5px] border-ink py-6"
        style={{ backgroundColor: BG_COLORS[char.bg] ?? "#CDE7F2" }}
      >
        <CharacterSVG char={char} size={110} />
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CHARACTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-control border-[2.5px] border-ink font-display font-semibold text-[13px] transition-colors",
              activeCategory === cat ? "bg-ink text-cream" : "bg-cream-card text-ink"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {options.map((opt) => {
          const selected = currentValue === opt.value;
          const isColor = activeCategory === "Color";
          const isBg = activeCategory === "Scene";

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              aria-label={opt.label}
              aria-pressed={selected}
              className={cn(
                "aspect-square rounded-card border-[2.5px] border-ink flex items-center justify-center text-[11px] font-body font-bold relative overflow-hidden transition-colors",
                selected ? "bg-green-tint" : "bg-cream-card"
              )}
              style={
                isColor
                  ? { backgroundColor: CHAR_COLORS[opt.value] }
                  : isBg
                    ? { backgroundColor: BG_COLORS[opt.value] }
                    : undefined
              }
            >
              {!isColor && !isBg && (
                <span className="text-center leading-tight px-1">{opt.label}</span>
              )}
              {selected && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green flex items-center justify-center text-[9px] text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="w-full py-3.5 bg-green hover:bg-green-dk disabled:opacity-40 text-cream font-display font-semibold text-[16px] rounded-control border-[2.5px] border-ink shadow-[0_4px_0_var(--color-green-dk)] active:translate-y-[4px] active:shadow-none transition-[transform,box-shadow] duration-75"
      >
        {saving ? "Saving…" : "Save character"}
      </button>
    </div>
  );
}
