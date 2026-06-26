import * as React from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

function SkeletonBlock({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("rounded-pill bg-ink/8 animate-pulse", className)}
      aria-hidden
      {...props}
    />
  );
}

function SkeletonCircle({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "w-7 h-7" : size === "lg" ? "w-[46px] h-[46px]" : "w-10 h-10";

  return (
    <SkeletonBlock className={cn(dim, "rounded-pill", className)} />
  );
}

/** Pulse placeholder matching {@link ProgressBar} `sm` track geometry. */
function SkeletonProgressBar({ className }: { className?: string }) {
  return (
    <ProgressBar
      value={0}
      height="sm"
      className={cn("animate-pulse [&>div]:opacity-0", className)}
      aria-label="Loading progress"
    />
  );
}

export const Skeleton = {
  Block: SkeletonBlock,
  Circle: SkeletonCircle,
  ProgressBar: SkeletonProgressBar,
};
