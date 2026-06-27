"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MockShellContent } from "./MockShellContent";
import { ShellStatePanel, type ShellPrototypeState, type ViewportBucket } from "./ShellStatePanel";
import { FocusRailShell, KidParityShell, SpecShell, TopNavShell } from "./ShellVariants";
import type { ParentNavSection } from "./parentNavItems";
import { parseVariant, VariantSwitcherBar } from "./VariantSwitcherBar";

const FEATURES: Record<ShellPrototypeState["variant"], string[]> = {
  spec: [
    "250px sidebar at lg+",
    "74px icon rail at md–lg",
    "Sticky topbar with greeting + AI CTA",
    "Hamburger drawer + bottom nav on mobile",
  ],
  "kid-parity": [
    "230px sidebar mirrors KidLayoutShell",
    "No persistent topbar — page owns title",
    "Bottom tabs only below md",
    "Profile picker chip in mobile header slot",
  ],
  "top-nav": [
    "Horizontal nav in header — no sidebar",
    "Greeting band below nav row",
    "Mobile collapses to hamburger dropdown",
    "Contrast: feels more SaaS, less Earnie",
  ],
  "focus-rail": [
    "Icon rail on all sm+ viewports",
    "Slim family strip instead of greeting block",
    "Content capped at max-w-5xl",
    "Maximum horizontal space for dashboards",
  ],
};

function useViewportBucket(): ViewportBucket {
  const [bucket, setBucket] = React.useState<ViewportBucket>("desktop");

  React.useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 768) setBucket("mobile");
      else if (w < 1024) setBucket("tablet");
      else setBucket("desktop");
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bucket;
}

function ParentShellPrototypeInner() {
  const searchParams = useSearchParams();
  const variant = parseVariant(searchParams.get("variant"));
  const [activeSection, setActiveSection] = React.useState<ParentNavSection>("home");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const viewport = useViewportBucket();

  const state: ShellPrototypeState = {
    variant,
    activeSection,
    viewport,
    drawerOpen,
    features: FEATURES[variant],
  };

  const shellProps = {
    activeSection,
    onSelect: setActiveSection,
    onDrawerChange: setDrawerOpen,
  };

  const content = (
    <div className="flex flex-col gap-6">
      <ShellStatePanel state={state} />
      <MockShellContent section={activeSection} />
    </div>
  );

  let shell: React.ReactNode;
  switch (variant) {
    case "kid-parity":
      shell = <KidParityShell {...shellProps}>{content}</KidParityShell>;
      break;
    case "top-nav":
      shell = <TopNavShell {...shellProps}>{content}</TopNavShell>;
      break;
    case "focus-rail":
      shell = <FocusRailShell {...shellProps}>{content}</FocusRailShell>;
      break;
    default:
      shell = <SpecShell {...shellProps}>{content}</SpecShell>;
  }

  return (
    <>
      <div className="bg-purple text-white text-center py-2 font-display font-semibold text-sm">
        PROTOTYPE — HIE-17 parent dashboard shell · not production
      </div>
      {shell}
      <VariantSwitcherBar />
    </>
  );
}

export function ParentShellPrototype() {
  return (
    <Suspense fallback={<p className="p-8 font-body text-ink-soft">Loading prototype…</p>}>
      <ParentShellPrototypeInner />
    </Suspense>
  );
}
