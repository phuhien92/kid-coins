import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import { brandHex } from "@kid-coin/tokens";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import "./globals.css";

// Display: heavy, tight, rounded headings (Nunito ExtraBold/Black).
// The variable names are the @kid-coin/tokens font contract.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-brand-display",
});

// Body: friendly humanist sans.
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-brand-body",
});

export const metadata: Metadata = {
  title: "kid-coin",
  description: "Little wins. Big money habits.",
  applicationName: "kid-coin",
  // iOS/iPadOS home-screen install (the manifest covers other browsers).
  appleWebApp: {
    capable: true,
    title: "kid-coin",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  // Next emits the standard `mobile-web-app-capable`; older iPadOS still keys
  // standalone launch off the apple-prefixed tag.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let the layout extend under the notch/home bar; screens pad with the
  // safe-area tokens (pt-safe-top, pb-safe-bottom, …).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brandHex.page },
    { media: "(prefers-color-scheme: dark)", color: brandHex.fg },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
