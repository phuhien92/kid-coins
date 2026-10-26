import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import manifest from "./manifest";

describe("web app manifest", () => {
  const m = manifest();

  it("installs as a standalone app with the brand colours", () => {
    expect(m.display).toBe("standalone");
    expect(m.background_color).toBe("#FBF8F2"); // cream page
    expect(m.theme_color).toBe("#0B1A3A"); // navy
    expect(m.name).toBe("kid-coin");
  });

  it("ships 192, 512 and maskable icons that exist on disk", () => {
    const icons = m.icons ?? [];
    expect(icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(icons.some((i) => i.purpose === "maskable")).toBe(true);
    for (const icon of icons) {
      expect(existsSync(join(__dirname, "../../public", icon.src)), icon.src).toBe(true);
    }
  });
});
