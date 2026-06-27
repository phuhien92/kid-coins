import type { CharacterState } from "@/types";

export const AVATAR_COLORS = [
  { value: "var(--color-mint)", label: "Mint" },
  { value: "var(--color-peach)", label: "Peach" },
  { value: "var(--color-lemon)", label: "Lemon" },
  { value: "var(--color-coral)", label: "Coral" },
  { value: "var(--color-sky)", label: "Sky" },
  { value: "var(--color-coin)", label: "Coin" },
] as const;

export const AVATAR_COLOR_VALUES = AVATAR_COLORS.map((c) => c.value);

export const BG_COLORS: Record<string, string> = {
  sky: "var(--color-sky)",
  mint: "var(--color-mint)",
  lemon: "var(--color-lemon)",
  peach: "var(--color-peach)",
  coral: "var(--color-coral)",
  lav: "var(--color-lav-pale)",
};

export const CHAR_COLORS: Record<string, string> = {
  yellow: "var(--color-coin)",
  mint: "var(--color-mint)",
  sky: "var(--color-sky)",
  peach: "var(--color-peach)",
  coral: "var(--color-coral)",
  lav: "var(--color-lav-pale)",
};

export const DEFAULT_CHARACTER: CharacterState = {
  color: "yellow",
  hat: "none",
  eye: "default",
  extra: "none",
  bg: "sky",
  outfit: "none",
};

export const CHARACTER_CATEGORIES = ["Color", "Hat", "Eye", "Extra", "Outfit", "Scene"] as const;
export type CharacterCategory = (typeof CHARACTER_CATEGORIES)[number];

export const CHARACTER_OPTIONS: Record<
  CharacterCategory,
  { value: string; label: string }[]
> = {
  Color: Object.keys(CHAR_COLORS).map((k) => ({ value: k, label: k })),
  Hat: [
    { value: "none", label: "None" },
    { value: "cap", label: "Cap" },
    { value: "party", label: "Party" },
    { value: "crown", label: "Crown" },
  ],
  Eye: [
    { value: "default", label: "Round" },
    { value: "star", label: "Star" },
    { value: "sun", label: "Sun" },
  ],
  Extra: [
    { value: "none", label: "None" },
    { value: "bow", label: "Bow" },
    { value: "freckles", label: "Freckles" },
    { value: "sunglasses", label: "Shades" },
    { value: "mustache", label: "Stache" },
  ],
  Outfit: [
    { value: "none",        label: "None" },
    { value: "wizard",      label: "Wizard" },
    { value: "knight",      label: "Knight" },
    { value: "elf",         label: "Elf" },
    { value: "dwarf",       label: "Dwarf" },
    { value: "ranger",      label: "Ranger" },
    { value: "thief",       label: "Thief" },
    { value: "alchemist",   label: "Alchemist" },
    { value: "monk",        label: "Monk" },
    { value: "bard",        label: "Bard" },
    { value: "shaman",      label: "Shaman" },
    { value: "orc",         label: "Orc" },
    { value: "necromancer", label: "Necro" },
  ],
  Scene: Object.keys(BG_COLORS).map((k) => ({ value: k, label: k })),
};

export const CATEGORY_FIELD: Record<CharacterCategory, keyof CharacterState> = {
  Color: "color",
  Hat: "hat",
  Eye: "eye",
  Extra: "extra",
  Outfit: "outfit",
  Scene: "bg",
};

// "free" = unlocked by default; otherwise XP or coin cost required
export const OUTFIT_UNLOCK_COSTS: Record<string, { xp?: number; coins?: number } | "free"> = {
  none:        "free",
  wizard:      "free",
  knight:      { xp: 300 },
  elf:         { xp: 300 },
  ranger:      { xp: 400 },
  thief:       { xp: 400 },
  dwarf:       { xp: 500 },
  alchemist:   { xp: 500 },
  bard:        { xp: 600 },
  monk:        { xp: 600 },
  shaman:      { xp: 700 },
  orc:         { xp: 700 },
  necromancer: { xp: 900 },
};

export const FREE_OUTFITS = Object.entries(OUTFIT_UNLOCK_COSTS)
  .filter(([, cost]) => cost === "free")
  .map(([key]) => key);

export const CHAR_STORAGE_KEY = "earnie_char";

export function loadCharFromStorage(): CharacterState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CharacterState;
    // Backfill outfit for characters saved before this field existed
    if (!parsed.outfit) parsed.outfit = "none";
    return parsed;
  } catch {
    return null;
  }
}

export function saveCharToStorage(char: CharacterState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(char));
}

export function randomCharacter(): CharacterState {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return {
    color: pick(Object.keys(CHAR_COLORS)),
    hat: pick(["none", "cap", "party", "crown"]),
    eye: pick(["default", "star", "sun"]),
    extra: pick(["none", "bow", "freckles"]),
    bg: pick(Object.keys(BG_COLORS)),
    outfit: pick(FREE_OUTFITS),
  };
}

export function isValidAvatarColor(color: string): boolean {
  return AVATAR_COLOR_VALUES.includes(color as (typeof AVATAR_COLOR_VALUES)[number]);
}
