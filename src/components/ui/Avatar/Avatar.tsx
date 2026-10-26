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
  sm: "size-9 text-lg",
  md: "size-10 text-xl",
  lg: "size-12 text-2xl",
};

const colorClasses: Record<AvatarColor, string> = {
  mint: "bg-mint-tint",
  lemon: "bg-gold-tint",
  peach: "bg-save-tint",
  coral: "bg-save",
  sky: "bg-earn-tint",
  lav: "bg-grow",
  coin: "bg-gold",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = "md", color = "mint", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-pill ring-2 ring-cream-card shadow-card flex items-center justify-center flex-shrink-0",
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
