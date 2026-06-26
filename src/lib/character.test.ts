import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveCharToStorage,
  loadCharFromStorage,
  BG_COLORS,
  CHAR_COLORS,
  AVATAR_COLORS,
  CHAR_STORAGE_KEY,
  DEFAULT_CHARACTER,
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
