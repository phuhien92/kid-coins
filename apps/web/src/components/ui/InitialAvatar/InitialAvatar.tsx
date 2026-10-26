import * as React from "react";
import { cn } from "@/lib/utils";

export type InitialAvatarSize =
  | "sm"
  | "md"
  | "lg"
  | "header"
  | "profile"
  | "picker";

export type InitialAvatarProps = React.ComponentPropsWithoutRef<"span"> & {
  name: string;
  avatarColor: string;
  size?: InitialAvatarSize;
};

const sizeClasses: Record<InitialAvatarSize, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-base",
  lg: "size-12 text-2xl",
  header: "size-12 text-xl",
  profile: "size-16 text-3xl",
  picker: "size-20 text-4xl",
};

const InitialAvatar = React.forwardRef<HTMLSpanElement, InitialAvatarProps>(
  ({ name, avatarColor, size = "sm", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "rounded-pill ring-2 ring-surface shadow-card flex items-center justify-center font-display font-black text-fg flex-shrink-0",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: avatarColor }}
      aria-hidden
      {...props}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </span>
  )
);

InitialAvatar.displayName = "InitialAvatar";

export { InitialAvatar };
