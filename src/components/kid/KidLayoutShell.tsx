"use client";

import { usePathname } from "next/navigation";
import { KidProvider } from "@/context/KidContext";
import { KidSidebar, KidBottomTabs, KidMobileHeader } from "@/components/kid/KidNav";

export function KidLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideMobileSwitch = pathname === "/kid/home";

  return (
    <KidProvider>
      <div className="min-h-screen bg-cream flex">
        <KidSidebar />
        <main className="flex-1 min-w-0 min-h-screen flex flex-col pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-0">
          {!hideMobileSwitch && <KidMobileHeader />}
          {children}
        </main>
        <KidBottomTabs />
      </div>
    </KidProvider>
  );
}
