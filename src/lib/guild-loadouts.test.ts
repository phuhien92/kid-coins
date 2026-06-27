import { describe, it, expect } from "vitest";
import {
  isOutfitFreeAtSignup,
  outfitSceneBg,
  outfitXpCost,
  upgradeXpRequirement,
} from "./guild-loadouts";

describe("guild-loadouts", () => {
  it("marks wizard as free at signup", () => {
    expect(isOutfitFreeAtSignup("wizard")).toBe(true);
    expect(outfitXpCost("wizard")).toBeNull();
  });

  it("marks paid classes with XP costs", () => {
    expect(isOutfitFreeAtSignup("knight")).toBe(false);
    expect(outfitXpCost("knight")).toBe(300);
  });

  it("maps outfits to scene backgrounds", () => {
    expect(outfitSceneBg("wizard")).toBe("lav");
    expect(outfitSceneBg("unknown")).toBe("sky");
  });

  it("returns higher XP gates for armor upgrades", () => {
    const upgrade = { slot: "Armor" as const, name: "Moon robe", coins: 180 };
    expect(upgradeXpRequirement(upgrade)).toBe(520);
  });
});
