"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppNavBottomTabControl, AppNavItemControl } from "./AppNavItemControl";
import { isNavActive, type AppNavItem, type AppNavRegister } from "./types";

type AppNavListBaseProps = {
  items: AppNavItem[];
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
  register?: AppNavRegister;
};

type AppNavListRouteProps = AppNavListBaseProps & {
  mode?: "route";
  homeHref?: string;
  homeAliases?: readonly string[];
  onNavigate?: () => void;
};

type AppNavListControlledProps = AppNavListBaseProps & {
  mode: "controlled";
  activeId: string;
  onSelect: (id: string) => void;
};

export type AppNavListProps = AppNavListRouteProps | AppNavListControlledProps;

export function AppNavList(props: AppNavListProps) {
  const pathname = usePathname();
  const {
    items,
    showLabels = true,
    compact = false,
    className,
    register = "kid",
  } = props;

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active =
          props.mode === "controlled"
            ? props.activeId === item.id
            : isNavActive(pathname, item.href, {
                homeHref: props.homeHref,
                homeAliases: props.homeAliases,
              });

        return (
          <AppNavItemControl
            key={item.id}
            item={item}
            active={active}
            showLabel={showLabels}
            compact={compact}
            register={register}
            mode={props.mode === "controlled" ? "button" : "link"}
            onNavigate={props.mode === "controlled" ? undefined : props.onNavigate}
            onSelect={
              props.mode === "controlled" ? () => props.onSelect(item.id) : undefined
            }
          />
        );
      })}
    </nav>
  );
}

type AppNavBottomTabsBaseProps = {
  items: AppNavItem[];
  register?: AppNavRegister;
  className?: string;
};

type AppNavBottomTabsRouteProps = AppNavBottomTabsBaseProps & {
  mode?: "route";
  homeHref?: string;
  homeAliases?: readonly string[];
};

type AppNavBottomTabsControlledProps = AppNavBottomTabsBaseProps & {
  mode: "controlled";
  activeId: string;
  onSelect: (id: string) => void;
};

export type AppNavBottomTabsProps = AppNavBottomTabsRouteProps | AppNavBottomTabsControlledProps;

export function AppNavBottomTabs(props: AppNavBottomTabsProps) {
  const pathname = usePathname();
  const { items, register = "kid", className } = props;

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-card border-t-2 border-ink",
        className
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex justify-around px-2 pt-2 pb-2">
        {items.map((item) => {
          const active =
            props.mode === "controlled"
              ? props.activeId === item.id
              : isNavActive(pathname, item.href, {
                  homeHref: props.homeHref,
                  homeAliases: props.homeAliases,
                });

          return (
            <li key={item.id} className="flex-1">
              <AppNavBottomTabControl
                item={item}
                active={active}
                register={register}
                mode={props.mode === "controlled" ? "button" : "link"}
                onSelect={
                  props.mode === "controlled" ? () => props.onSelect(item.id) : undefined
                }
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { isNavActive, type AppNavItem, type AppNavRegister } from "./types";
