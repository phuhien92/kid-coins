import { describe, it, expect } from "vitest";
import { chain, readAll, readTier, references, resolve } from "./css";
import { CONTRAST_PAIRS, THRESHOLD, contrastRatio } from "./contrast";
import { brandHex, breakpoints, colorRoles, radiusRoles, shadowRoles } from "./index";

const all = readAll();
const isPrimitive = (name: string) => all.get(name)?.tier === "primitives";

describe("tier 1: primitives", () => {
  it("are raw values under the --kc- prefix and reference nothing in the system", () => {
    for (const d of readTier("primitives")) {
      expect(d.name.startsWith("--kc-"), d.name).toBe(true);
      // Fonts may reference the app's next/font face variables, nothing else.
      const refs = references(d.value).filter((r) => !r.startsWith("--font-brand-"));
      expect(refs, `${d.name} must be raw`).toEqual([]);
    }
  });
});

describe("tier 2: semantic roles", () => {
  const semantic = readTier("semantic");

  it("every role resolves to a primitive", () => {
    for (const d of semantic) {
      if (d.name.startsWith("--breakpoint-") || d.value.startsWith("env(")) continue;
      const path = chain(d.name, all);
      expect(isPrimitive(path.at(-1)!), `${d.name} → ${path.join(" → ")}`).toBe(true);
      expect(() => resolve(d.name, all)).not.toThrow();
    }
  });

  it("breakpoints match the --kc-viewport primitives (var() is invalid in @media)", () => {
    const bp = (n: string) => all.get(`--breakpoint-${n}`)!.value;
    expect(bp("ipad")).toBe(resolve("--kc-viewport-ipad-portrait", all));
    expect(bp("ipad-landscape")).toBe(resolve("--kc-viewport-ipad-landscape", all));
    expect(bp("desktop")).toBe(resolve("--kc-viewport-desktop", all));
    for (const [name, px] of Object.entries(breakpoints)) {
      expect(parseFloat(bp(name)) * 16, name).toBe(px);
    }
  });

  it("safe-area insets come from env() with a 0 fallback", () => {
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(all.get(`--spacing-safe-${side}`)?.value).toBe(`env(safe-area-inset-${side}, 0px)`);
    }
  });

  it("the tap target is at least 44px with at least 8px between targets", () => {
    expect(parseFloat(resolve("--spacing-tap", all))).toBeGreaterThanOrEqual(44);
    expect(parseFloat(resolve("--spacing-tap-gap", all))).toBeGreaterThanOrEqual(8);
  });

  it("brandHex matches the resolved CSS roles", () => {
    for (const [role, hex] of Object.entries(brandHex)) {
      expect(resolve(`--color-${role}`, all).toUpperCase(), role).toBe(hex.toUpperCase());
    }
  });

  it("the typed TS export lists exactly the roles in the CSS", () => {
    const names = (prefix: string) =>
      semantic
        .filter((d) => d.name.startsWith(prefix))
        .map((d) => d.name.slice(prefix.length))
        .filter((n) => !n.includes("--"));
    expect(names("--color-").sort()).toEqual([...colorRoles].sort());
    expect(names("--radius-").sort()).toEqual([...radiusRoles].sort());
    expect(names("--shadow-").sort()).toEqual([...shadowRoles].sort());
  });
});

describe("tier 3 + persisted names", () => {
  it("component tokens and persisted names also resolve to primitives", () => {
    for (const d of [...readTier("components"), ...readTier("persisted")]) {
      if (/^var\(--[a-z0-9-]+\)$/.test(d.value)) {
        const path = chain(d.name, all);
        expect(isPrimitive(path.at(-1)!), `${d.name} → ${path.join(" → ")}`).toBe(true);
      } else {
        // Composite (calc + env): every token it reads must be a primitive.
        const refs = references(d.value);
        expect(refs.length, `${d.name} has no token reference`).toBeGreaterThan(0);
        for (const r of refs) expect(isPrimitive(r), `${d.name} reads ${r}`).toBe(true);
      }
    }
  });

  it("keeps every persisted avatar colour name defined", () => {
    // Stored in the DB as var(--color-…); deleting one breaks existing kids.
    for (const n of ["mint", "peach", "lemon", "coral", "sky", "coin", "lav", "lav-pale"]) {
      expect(all.has(`--color-${n}`), n).toBe(true);
    }
  });

  it("the persisted names generate no utilities (they live in :root, not @theme)", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync(new URL("./persisted.css", import.meta.url), "utf8");
    expect(css).not.toMatch(/@theme/);
  });

  it("no token is declared in two tiers", () => {
    expect(() => readAll()).not.toThrow();
  });
});

describe("WCAG 2.1 AA contrast", () => {
  it.each(CONTRAST_PAIRS)("$use ($fg on $bg) meets $level", ({ fg, bg, level }) => {
    const ratio = contrastRatio(resolve(fg, all), resolve(bg, all));
    expect(ratio).toBeGreaterThanOrEqual(THRESHOLD[level]);
  });
});
