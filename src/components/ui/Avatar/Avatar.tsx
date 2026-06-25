import * as React from "react";
import { cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarColor =
  | "mint"
  | "lemon"
  | "peach"
  | "coral"
  | "sky"
  | "lav"
  | "coin";

export type AvatarProps = React.ComponentPropsWithoutRef<"div"> & {
  size?: AvatarSize;
  color?: AvatarColor;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-[34px] h-[34px] text-[17px] border-[2px]",
  md: "w-10 h-10 text-[20px] border-[2.5px]",
  lg: "w-12 h-12 text-[23px] border-[2.5px]",
};

const colorClasses: Record<AvatarColor, string> = {
  mint: "bg-mint",
  lemon: "bg-lemon",
  peach: "bg-peach",
  coral: "bg-coral",
  sky: "bg-sky",
  lav: "bg-lav",
  coin: "bg-coin",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = "md", color = "mint", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-pill border-ink flex items-center justify-center flex-shrink-0",
        "overflow-hidden",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    />
  )
);

Avatar.displayName = "Avatar";

export { Avatar };
