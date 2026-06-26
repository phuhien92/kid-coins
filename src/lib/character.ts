import type { CharacterState } from "@/types";

export const AVATAR_COLORS = [
  { value: "#C7E9D4", label: "Mint" },
  { value: "#F8D3B2", label: "Peach" },
  { value: "#F7E68C", label: "Lemon" },
  { value: "#F0A6A0", label: "Coral" },
  { value: "#CDE7F2", label: "Sky" },
  { value: "#F4D34E", label: "Coin" },
] as const;

export const AVATAR_COLOR_VALUES = AVATAR_COLORS.map((c) => c.value);

export const BG_COLORS: Record<string, string> = {
  sky: "#CDE7F2",
  mint: "#C7E9D4",
  lemon: "#F7E68C",
  peach: "#F8D3B2",
  coral: "#F0A6A0",
  lav: "#DEE0FA",
};

export const CHAR_COLORS: Record<string, string> = {
  yellow: "#F4D34E",
  mint: "#C7E9D4",
  sky: "#CDE7F2",
  peach: "#F8D3B2",
  coral: "#F0A6A0",
  lav: "#DEE0FA",
};

export const DEFAULT_CHARACTER: CharacterState = {
  color: "yellow",
  hat: "none",
  eye: "default",
  extra: "none",
  bg: "sky",
};

export const CHARACTER_CATEGORIES = ["Color", "Hat", "Eye", "Extra", "Scene"] as const;
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
  ],
  Scene: Object.keys(BG_COLORS).map((k) => ({ value: k, label: k })),
};

export const CATEGORY_FIELD: Record<CharacterCategory, keyof CharacterState> = {
  Color: "color",
  Hat: "hat",
  Eye: "eye",
  Extra: "extra",
  Scene: "bg",
};

export const CHAR_STORAGE_KEY = "earnie_char";

export function loadCharFromStorage(): CharacterState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAR_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CharacterState;
  } catch {
    return null;
  }
}

export function saveCharToStorage(char: CharacterState) {
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
  };
}

export function isValidAvatarColor(color: string): boolean {
  return AVATAR_COLOR_VALUES.includes(color as (typeof AVATAR_COLOR_VALUES)[number]);
}
