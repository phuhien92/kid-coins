import { KidLayoutShell } from "@/components/kid/KidLayoutShell";

/**
 * Shell for every kid-facing route.
 *
 * - `<KidProvider>` supplies session state (balance, streak, goal, tasks).
 * - `<KidSidebar>` shows a 230px sticky sidebar at md+ widths.
 * - `<KidBottomTabs>` shows a fixed 4-item tab bar below md.
 *
 * The content column pads its bottom on mobile so the last row clears the
 * tab bar; md+ has no bottom tabs so the padding is reset.
 */
export default function KidLayout({ children }: { children: React.ReactNode }) {
  return <KidLayoutShell>{children}</KidLayoutShell>;
}
