/**
 * Rasterises public/brand/kid-coin-mark.svg into the PWA / home-screen icons.
 * Run after changing the mark:  pnpm --filter web icons
 *
 *   public/icons/icon-192.png            any-purpose, transparent
 *   public/icons/icon-512.png            any-purpose, transparent
 *   public/icons/icon-maskable-512.png   maskable: cream bleed, mark inside the 80% safe zone
 *   src/app/apple-icon.png               180×180, opaque cream (iOS ignores transparency)
 *   src/app/icon.png                     48×48 favicon fallback for browsers without SVG favicons
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const svg = readFileSync(`${root}public/brand/kid-coin-mark.svg`, "utf8");
const CREAM = "#FBF8F2"; // brandHex.page in @kid-coin/tokens

const targets = [
  { out: "public/icons/icon-192.png", size: 192, scale: 0.94, bg: null },
  { out: "public/icons/icon-512.png", size: 512, scale: 0.94, bg: null },
  { out: "public/icons/icon-maskable-512.png", size: 512, scale: 0.62, bg: CREAM },
  { out: "src/app/apple-icon.png", size: 180, scale: 0.78, bg: CREAM },
  { out: "src/app/icon.png", size: 48, scale: 1, bg: null },
];

// Optional: point at a specific Chromium (e.g. a preinstalled one in CI/sandboxes).
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: t.size, height: t.size } });
  const inner = Math.round(t.size * t.scale);
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${t.size}px;height:${t.size}px;display:grid;place-items:center;background:${t.bg ?? "transparent"}">
    <div style="width:${inner}px;height:${inner}px">${svg.replace("<svg ", '<svg width="100%" height="100%" ')}</div></body></html>`);
  await page.screenshot({ path: `${root}${t.out}`, omitBackground: t.bg === null });
  await page.close();
  console.log("wrote", t.out);
}
await browser.close();
