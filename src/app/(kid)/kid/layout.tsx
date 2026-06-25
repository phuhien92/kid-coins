import { KidProvider } from "@/context/KidContext";
import { KidSidebar, KidBottomTabs } from "@/components/kid/KidNav";

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
  return (
    <KidProvider>
      <div className="min-h-screen bg-cream flex">
        <KidSidebar />
        {/*
         * `min-h-screen flex flex-col` gives child pages a vertical box to
         * fill with `flex-1`. The mobile bottom padding reserves the strip
         * the fixed bottom tabs cover, plus iOS safe-area inset, so a page's
         * last row stays visible above the tabs on iPhone X+.
         */}
        <main className="flex-1 min-w-0 min-h-screen flex flex-col pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>
        <KidBottomTabs />
      </div>
    </KidProvider>
  );
}
