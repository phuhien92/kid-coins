import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveCharToStorage,
  loadCharFromStorage,
  BG_COLORS,
  CHAR_COLORS,
  AVATAR_COLORS,
  CHAR_STORAGE_KEY,
  DEFAULT_CHARACTER,
  CATEGORY_FIELD,
  CHARACTER_OPTIONS,
  OUTFIT_UNLOCK_COSTS,
  FREE_OUTFITS,
  randomCharacter,
} from "./character";

beforeEach(() => {
  localStorage.clear();
});

describe("saveCharToStorage / loadCharFromStorage", () => {
  it("round-trips a character through localStorage", () => {
    saveCharToStorage(DEFAULT_CHARACTER);
    expect(loadCharFromStorage()).toEqual(DEFAULT_CHARACTER);
  });

  it("overwrites a previous value", () => {
    saveCharToStorage(DEFAULT_CHARACTER);
    const updated = { ...DEFAULT_CHARACTER, hat: "crown" };
    saveCharToStorage(updated);
    expect(loadCharFromStorage()).toEqual(updated);
  });

  it("loadCharFromStorage returns null when nothing is stored", () => {
    expect(loadCharFromStorage()).toBeNull();
  });

  it("loadCharFromStorage returns null for corrupted JSON", () => {
    localStorage.setItem(CHAR_STORAGE_KEY, "not-valid-json{{");
    expect(loadCharFromStorage()).toBeNull();
  });

  it("saveCharToStorage is a no-op when window is undefined", () => {
    const setSpy = vi.spyOn(Storage.prototype, "setItem");
    // Simulate server environment by temporarily hiding window
    const originalWindow = globalThis.window;
    // @ts-expect-error intentional
    delete globalThis.window;
    saveCharToStorage(DEFAULT_CHARACTER);
    expect(setSpy).not.toHaveBeenCalled();
    globalThis.window = originalWindow;
    setSpy.mockRestore();
  });
});

describe("DEFAULT_CHARACTER includes outfit", () => {
  it("has outfit field defaulting to none", () => {
    expect(DEFAULT_CHARACTER.outfit).toBe("none");
  });
});

describe("CATEGORY_FIELD includes Outfit", () => {
  it("maps Outfit category to outfit field", () => {
    expect(CATEGORY_FIELD["Outfit"]).toBe("outfit");
  });
});

describe("CHARACTER_OPTIONS Outfit tab", () => {
  it("includes none and wizard as free options", () => {
    const outfitValues = CHARACTER_OPTIONS["Outfit"].map((o) => o.value);
    expect(outfitValues).toContain("none");
    expect(outfitValues).toContain("wizard");
  });

  it("includes all 13 outfit options", () => {
    expect(CHARACTER_OPTIONS["Outfit"]).toHaveLength(13);
  });
});

describe("OUTFIT_UNLOCK_COSTS", () => {
  it("marks none and wizard as free", () => {
    expect(OUTFIT_UNLOCK_COSTS["none"]).toBe("free");
    expect(OUTFIT_UNLOCK_COSTS["wizard"]).toBe("free");
  });

  it("locks non-free outfits with XP costs", () => {
    const locked = ["knight", "elf", "ranger", "thief", "dwarf", "alchemist", "bard", "monk", "shaman", "orc", "necromancer"];
    for (const slug of locked) {
      const cost = OUTFIT_UNLOCK_COSTS[slug];
      expect(cost).not.toBe("free");
      expect(typeof cost).toBe("object");
    }
  });
});

describe("FREE_OUTFITS", () => {
  it("contains none and wizard only", () => {
    expect(FREE_OUTFITS).toEqual(expect.arrayContaining(["none", "wizard"]));
    expect(FREE_OUTFITS).toHaveLength(2);
  });
});

describe("randomCharacter", () => {
  it("returns a character with outfit from FREE_OUTFITS", () => {
    for (let i = 0; i < 30; i++) {
      const char = randomCharacter();
      expect(FREE_OUTFITS).toContain(char.outfit);
    }
  });
});

describe("loadCharFromStorage backfill", () => {
  it("backfills outfit=none for chars saved without outfit field", () => {
    const old = { color: "yellow", hat: "none", eye: "default", extra: "none", bg: "sky" };
    localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(old));
    const loaded = loadCharFromStorage();
    expect(loaded?.outfit).toBe("none");
  });
});

describe("color maps use CSS custom properties", () => {
  it("BG_COLORS values are CSS variable references", () => {
    for (const value of Object.values(BG_COLORS)) {
      expect(value).toMatch(/^var\(--color-/);
    }
  });

  it("CHAR_COLORS values are CSS variable references", () => {
    for (const value of Object.values(CHAR_COLORS)) {
      expect(value).toMatch(/^var\(--color-/);
    }
  });

  it("AVATAR_COLORS values are CSS variable references", () => {
    for (const { value } of AVATAR_COLORS) {
      expect(value).toMatch(/^var\(--color-/);
    }
  });
});
