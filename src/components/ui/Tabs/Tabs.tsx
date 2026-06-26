"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

export type TabsVariant = "kid" | "parent";

type TabsRootProps = {
  defaultValue?: string | number;
  value?: string | number;
  onValueChange?: (value: string | number) => void;
  children: React.ReactNode;
  className?: string;
};

type TabsListProps = {
  children: React.ReactNode;
  className?: string;
};

type TabProps = {
  value: string | number;
  children: React.ReactNode;
  className?: string;
  /** "kid" uses green active style; "parent" uses purple. Defaults to "kid". */
  variant?: TabsVariant;
};

type TabsPanelProps = {
  value: string | number;
  children: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
};

/**
 * Compound Tabs component backed by Base UI Tabs.
 * Handles keyboard navigation, ARIA roles, and focus management automatically.
 *
 * Usage:
 *   <Tabs.Root defaultValue="daily">
 *     <Tabs.List>
 *       <Tabs.Tab value="daily" variant="kid">Daily</Tabs.Tab>
 *       <Tabs.Tab value="once"  variant="kid">One-time</Tabs.Tab>
 *     </Tabs.List>
 *     <Tabs.Panel value="daily">…</Tabs.Panel>
 *     <Tabs.Panel value="once">…</Tabs.Panel>
 *   </Tabs.Root>
 */
function TabsRoot({ defaultValue, value, onValueChange, children, className }: TabsRootProps) {
  return (
    <BaseTabs.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("flex flex-col", className)}
    >
      {children}
    </BaseTabs.Root>
  );
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <BaseTabs.List className={cn("flex gap-2.5", className)}>
      {children}
    </BaseTabs.List>
  );
}

const variantActive: Record<TabsVariant, string> = {
  kid:    "data-[selected]:bg-ink data-[selected]:text-cream",
  parent: "data-[selected]:bg-purple data-[selected]:text-white",
};

const variantFocus: Record<TabsVariant, string> = {
  kid:    "focus-visible:ring-green",
  parent: "focus-visible:ring-purple",
};

function Tab({ value, children, className, variant = "kid" }: TabProps) {
  return (
    <BaseTabs.Tab
      value={value}
      className={cn(
        "flex-1 font-display font-semibold text-sm py-3 rounded-tab",
        "border-medium border-ink transition-colors duration-100",
        "bg-white text-ink hover:bg-black/5 active:bg-black/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        variantActive[variant],
        variantFocus[variant],
        className
      )}
    >
      {children}
    </BaseTabs.Tab>
  );
}

function TabsPanel({ value, children, className, keepMounted }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      value={value}
      keepMounted={keepMounted}
      className={cn("flex-1 flex flex-col", className)}
    >
      {children}
    </BaseTabs.Panel>
  );
}

const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab,
  Panel: TabsPanel,
};

export { Tabs };
