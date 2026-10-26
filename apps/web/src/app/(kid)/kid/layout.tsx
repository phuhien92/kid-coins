import { KidLayoutShell } from "@/components/kid/KidLayoutShell";

/**
 * Shell for every kid-facing route.
 *
 * - `<KidProvider>` supplies session state (balance, streak, goal, tasks).
 * - `<KidSidebar>` shows a sticky sidebar from iPad landscape (`ipad-landscape:`) up.
 * - `<KidBottomTabs>` shows a fixed 4-item tab bar on phone and iPad portrait.
 *
 * The content column pads its bottom (`pb-bottom-nav`) so the last row clears
 * the tab bar; iPad landscape and up have no bottom tabs, so it resets.
 */
export default function KidLayout({ children }: { children: React.ReactNode }) {
  return <KidLayoutShell>{children}</KidLayoutShell>;
}
