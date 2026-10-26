import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shell that fills the layout's reserved flex column.
 * Every kid/parent page root should be <Page> instead of a raw div.
 */
function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 flex flex-col", className)}>{children}</div>
  );
}

/**
 * Sticky page top-bar (streak badge, breadcrumb, etc.).
 * Defaults to right-aligned; override with className.
 */
function PageHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-center justify-end px-5 pt-5", className)}>
      {children}
    </header>
  );
}

/**
 * Scrollable body of a page — standard horizontal padding + vertical rhythm.
 */
function PageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 flex flex-col px-5 pt-4 pb-6", className)}>
      {children}
    </div>
  );
}

Page.Header = PageHeader;
Page.Content = PageContent;

export { Page };
