import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CharacterSVG } from "./CharacterSVG";
import { DEFAULT_CHARACTER } from "@/lib/character";
import type { CharacterState } from "@/types";

const base: CharacterState = { ...DEFAULT_CHARACTER };

const ALL_OUTFITS = [
  "none", "wizard", "knight", "elf", "dwarf", "ranger",
  "thief", "alchemist", "monk", "bard", "shaman", "orc", "necromancer",
];

describe("CharacterSVG", () => {
  it("renders without errors for each outfit", () => {
    for (const outfit of ALL_OUTFITS) {
      const { container } = render(<CharacterSVG char={{ ...base, outfit }} />);
      expect(container.querySelector("svg")).not.toBeNull();
    }
  });

  it("does not render a regular hat when outfit is active", () => {
    const { container } = render(
      <CharacterSVG char={{ ...base, outfit: "wizard", hat: "crown" }} />
    );
    const svg = container.querySelector("svg")!;
    // Crown hat is a polygon; wizard outfit has no polygon
    expect(svg.querySelector("polygon")).toBeNull();
  });

  it("renders regular hat when outfit is none", () => {
    const { container } = render(
      <CharacterSVG char={{ ...base, outfit: "none", hat: "party" }} />
    );
    expect(container.querySelector("polygon")).not.toBeNull();
  });

  it("does not render extras when outfit is active", () => {
    // Bow extra adds two paths with pink fill; outfit overrides suppress it
    const { container } = render(
      <CharacterSVG char={{ ...base, outfit: "knight", extra: "bow" }} />
    );
    // Check that the bow's center circle (cx=72 cy=29 r=3.5) is absent
    const circles = Array.from(container.querySelectorAll("circle"));
    const bowCenter = circles.find(
      (c) => c.getAttribute("cx") === "72" && c.getAttribute("cy") === "29"
    );
    expect(bowCenter).toBeUndefined();
  });

  it("monk outfit renders peaceful closed-eye arcs regardless of char.eye", () => {
    const { container } = render(
      <CharacterSVG char={{ ...base, outfit: "monk", eye: "star" }} />
    );
    const svg = container.querySelector("svg")!;
    // Star eyes use <text> elements; monk should not have those
    expect(svg.querySelectorAll("text")).toHaveLength(0);
  });

  it("dwarf outfit suppresses mouth", () => {
    const { container } = render(
      <CharacterSVG char={{ ...base, outfit: "dwarf" }} />
    );
    // Mouth is a <path> with d starting "M49 66". Should not be present.
    const paths = Array.from(container.querySelectorAll("path"));
    const mouth = paths.find((p) => p.getAttribute("d")?.startsWith("M49 66"));
    expect(mouth).toBeUndefined();
  });

  it("accepts a custom size prop", () => {
    const { container } = render(<CharacterSVG char={base} size={80} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("80");
    expect(svg.getAttribute("height")).toBe("80");
  });
});
