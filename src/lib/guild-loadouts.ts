import {
  CHARACTER_OPTIONS,
  CHAR_COLORS,
  FREE_OUTFITS,
  OUTFIT_UNLOCK_COSTS,
} from "@/lib/character";

export type GuildAccessory = {
  slot: "Hat" | "Weapon" | "Armor" | "Tool" | "Trinket";
  name: string;
};

export type GuildUpgrade = {
  slot: "Hat" | "Weapon" | "Armor";
  name: string;
  coins: number;
};

export type GuildLoadout = {
  starter: GuildAccessory[];
  upgrades: GuildUpgrade[];
};

export const OUTFIT_OPTIONS = CHARACTER_OPTIONS.Outfit;

export const COLOR_SWATCHES = Object.entries(CHAR_COLORS).map(([key, value]) => ({
  key,
  value,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

/** Scene backdrop key per outfit — maps to BG_COLORS tokens */
export const OUTFIT_SCENE_BG: Record<string, string> = {
  none: "sky",
  wizard: "lav",
  knight: "sky",
  elf: "mint",
  dwarf: "sky",
  ranger: "mint",
  thief: "lav",
  alchemist: "lemon",
  monk: "peach",
  bard: "coral",
  shaman: "lemon",
  orc: "mint",
  necromancer: "lav",
};

export const GUILD_LOADOUTS: Record<string, GuildLoadout> = {
  wizard: {
    starter: [
      { slot: "Hat", name: "Apprentice hat" },
      { slot: "Weapon", name: "Twig wand" },
      { slot: "Trinket", name: "Tiny spellbook" },
    ],
    upgrades: [
      { slot: "Hat", name: "Starfall hat", coins: 80 },
      { slot: "Weapon", name: "Glow staff", coins: 120 },
      { slot: "Armor", name: "Moon robe", coins: 180 },
    ],
  },
  knight: {
    starter: [
      { slot: "Hat", name: "Tin helm" },
      { slot: "Weapon", name: "Wooden sword" },
      { slot: "Armor", name: "Training shield" },
    ],
    upgrades: [
      { slot: "Hat", name: "Plumed helm", coins: 90 },
      { slot: "Weapon", name: "Lion sword", coins: 130 },
      { slot: "Armor", name: "Castle plate", coins: 210 },
    ],
  },
  shaman: {
    starter: [
      { slot: "Hat", name: "Feather band" },
      { slot: "Weapon", name: "Seed rattle" },
      { slot: "Trinket", name: "Pebble pouch" },
    ],
    upgrades: [
      { slot: "Hat", name: "Eagle crown", coins: 100 },
      { slot: "Weapon", name: "Thunder rattle", coins: 140 },
      { slot: "Armor", name: "Spirit cloak", coins: 200 },
    ],
  },
  orc: {
    starter: [
      { slot: "Hat", name: "Soft mohawk" },
      { slot: "Weapon", name: "Foam axe" },
      { slot: "Trinket", name: "Tiny banner" },
    ],
    upgrades: [
      { slot: "Hat", name: "Bone band", coins: 85 },
      { slot: "Weapon", name: "Boss axe", coins: 135 },
      { slot: "Armor", name: "Hide vest", coins: 190 },
    ],
  },
  elf: {
    starter: [
      { slot: "Hat", name: "Leaf crown" },
      { slot: "Weapon", name: "Practice bow" },
      { slot: "Trinket", name: "Mini quiver" },
    ],
    upgrades: [
      { slot: "Hat", name: "Moonleaf crown", coins: 85 },
      { slot: "Weapon", name: "Forest bow", coins: 125 },
      { slot: "Armor", name: "Vine cloak", coins: 180 },
    ],
  },
  dwarf: {
    starter: [
      { slot: "Hat", name: "Horn cap" },
      { slot: "Weapon", name: "Toy hammer" },
      { slot: "Armor", name: "Soft boots" },
    ],
    upgrades: [
      { slot: "Hat", name: "Forge helm", coins: 95 },
      { slot: "Weapon", name: "Rune hammer", coins: 145 },
      { slot: "Armor", name: "Stone boots", coins: 205 },
    ],
  },
  thief: {
    starter: [
      { slot: "Hat", name: "Practice hood" },
      { slot: "Weapon", name: "Foam dagger" },
      { slot: "Trinket", name: "Jingle keys" },
    ],
    upgrades: [
      { slot: "Hat", name: "Shadow hood", coins: 90 },
      { slot: "Weapon", name: "Sneak dagger", coins: 130 },
      { slot: "Armor", name: "Quiet cloak", coins: 190 },
    ],
  },
  alchemist: {
    starter: [
      { slot: "Hat", name: "Safety goggles" },
      { slot: "Tool", name: "Bubble flask" },
      { slot: "Armor", name: "Pocket apron" },
    ],
    upgrades: [
      { slot: "Hat", name: "Crystal goggles", coins: 90 },
      { slot: "Weapon", name: "Fizz wand", coins: 135 },
      { slot: "Armor", name: "Lab apron", coins: 185 },
    ],
  },
  monk: {
    starter: [
      { slot: "Hat", name: "Calm beads" },
      { slot: "Weapon", name: "Walking stick" },
      { slot: "Trinket", name: "Tiny scroll" },
    ],
    upgrades: [
      { slot: "Hat", name: "Lotus beads", coins: 80 },
      { slot: "Weapon", name: "Balance staff", coins: 120 },
      { slot: "Armor", name: "Sun sash", coins: 170 },
    ],
  },
  ranger: {
    starter: [
      { slot: "Hat", name: "Green hood" },
      { slot: "Weapon", name: "Practice bow" },
      { slot: "Trinket", name: "Compass charm" },
    ],
    upgrades: [
      { slot: "Hat", name: "Trail hood", coins: 90 },
      { slot: "Weapon", name: "Longbow", coins: 140 },
      { slot: "Armor", name: "Forest cape", coins: 200 },
    ],
  },
  necromancer: {
    starter: [
      { slot: "Hat", name: "Soft skull hood" },
      { slot: "Weapon", name: "Bone staff" },
      { slot: "Trinket", name: "Spooky book" },
    ],
    upgrades: [
      { slot: "Hat", name: "Night hood", coins: 110 },
      { slot: "Weapon", name: "Skull staff", coins: 160 },
      { slot: "Armor", name: "Shadow robe", coins: 240 },
    ],
  },
  bard: {
    starter: [
      { slot: "Hat", name: "Feather cap" },
      { slot: "Weapon", name: "Tiny lute" },
      { slot: "Trinket", name: "Song scroll" },
    ],
    upgrades: [
      { slot: "Hat", name: "Encore cap", coins: 85 },
      { slot: "Weapon", name: "Golden lute", coins: 135 },
      { slot: "Armor", name: "Stage vest", coins: 185 },
    ],
  },
};

export function upgradeXpRequirement(upgrade: GuildUpgrade): number {
  if (upgrade.slot === "Hat") return 120;
  if (upgrade.slot === "Weapon") return 260;
  return 520;
}

export function outfitXpCost(outfit: string): number | null {
  const cost = OUTFIT_UNLOCK_COSTS[outfit];
  if (cost === "free") return null;
  return cost.xp ?? null;
}

export function isOutfitFreeAtSignup(outfit: string): boolean {
  return FREE_OUTFITS.includes(outfit);
}

export function outfitSceneBg(outfit: string): string {
  return OUTFIT_SCENE_BG[outfit] ?? "sky";
}
