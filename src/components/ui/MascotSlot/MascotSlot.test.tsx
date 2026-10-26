import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MASCOT_ART } from "@/lib/brand";
import { MascotSlot } from "./MascotSlot";

const originalHero = { ...MASCOT_ART.hero };

afterEach(() => {
  MASCOT_ART.hero = { ...originalHero };
});

describe("MascotSlot", () => {
  it("renders a labelled placeholder until the art is supplied", () => {
    render(<MascotSlot slot="save" />);
    const slot = screen.getByRole("img", { name: MASCOT_ART.save.alt });
    expect(slot).toHaveAttribute("data-placeholder", "true");
    expect(slot).toHaveAttribute("data-mascot-slot", "save");
  });

  it("renders the supplied PNG with its alt text", () => {
    MASCOT_ART.hero = { ...originalHero, src: "/brand/mascot-hero.png" };
    render(<MascotSlot slot="hero" />);
    const img = screen.getByRole("img", { name: originalHero.alt });
    expect(img.tagName).toBe("IMG");
    expect(img).not.toHaveAttribute("data-placeholder");
  });

  it("is hidden from assistive tech when decorative", () => {
    render(<MascotSlot slot="grow" decorative />);
    expect(screen.queryByRole("img")).toBeNull();
  });
});
