"use client";

import { AppNavBottomTabs, AppNavList } from "@/components/shared/AppNav/AppNav";
import { EarnieBrand } from "@/components/shared/EarnieBrand";
import { KID_NAV_ITEMS } from "@/components/shared/kidNavItems";
import { KidSidebarFooter } from "@/components/kid/KidSidebarFooter";
import { SwitchProfileButton } from "@/components/kid/SwitchProfileButton";

const KID_NAV_ROUTE_OPTS = {
  homeHref: "/kid/home",
  homeAliases: ["/kid"],
} as const;

/** Desktop sidebar, 230px sticky. Visible md+. */
export function KidSidebar() {
  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex sticky top-0 self-start h-screen w-[230px] flex-col gap-6 px-5 py-6 bg-cream border-r-2 border-line"
    >
      <EarnieBrand href="/kid/home" register="kid" />

      <AppNavList
        items={KID_NAV_ITEMS}
        register="kid"
        {...KID_NAV_ROUTE_OPTS}
        className="flex-1 gap-1.5"
      />

      <KidSidebarFooter />
    </aside>
  );
}

/** Mobile top bar with switch profile. Visible below md (hidden on home — inline there). */
export function KidMobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-end px-5 pt-4 pb-2">
      <SwitchProfileButton />
    </div>
  );
}

/** Mobile bottom tab bar. Visible below md. */
export function KidBottomTabs() {
  return (
    <AppNavBottomTabs
      items={KID_NAV_ITEMS}
      register="kid"
      {...KID_NAV_ROUTE_OPTS}
    />
  );
}
