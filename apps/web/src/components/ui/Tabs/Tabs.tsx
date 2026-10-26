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
  /** "kid" selects in gold; "parent" selects in navy. Defaults to "kid". */
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
    <BaseTabs.List className={cn("flex gap-tap-gap", className)}>
      {children}
    </BaseTabs.List>
  );
}

const variantActive: Record<TabsVariant, string> = {
  kid:    "aria-selected:bg-action aria-selected:text-on-action aria-selected:border-action aria-selected:shadow-action",
  parent: "aria-selected:bg-action-secondary aria-selected:text-on-action-secondary aria-selected:border-fg",
};

function Tab({ value, children, className, variant = "kid" }: TabProps) {
  return (
    <BaseTabs.Tab
      value={value}
      className={cn(
        "flex-1 min-h-tap font-display font-extrabold text-base py-2.5 rounded-pill",
        "border border-line transition-colors duration-150",
        "bg-surface text-fg-muted hover:bg-surface-sunken hover:text-fg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
        variantActive[variant],
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
