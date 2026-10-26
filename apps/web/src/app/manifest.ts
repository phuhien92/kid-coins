import type { MetadataRoute } from "next";
import { brandHex } from "@kid-coin/tokens";
import { BRAND_NAME, TAGLINE } from "@/lib/brand";

/**
 * Web app manifest. kid-coin is iPad-first and installed to the home screen,
 * so it opens standalone (no browser chrome). There's no service worker or
 * offline mode yet; see design/plan.md.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description: TAGLINE,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: brandHex.page,
    theme_color: brandHex.fg,
    categories: ["education", "finance", "kids"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
