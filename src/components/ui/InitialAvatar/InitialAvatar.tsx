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
  sm: "w-7 h-7 text-[12px] border-2",
  md: "w-9 h-9 text-[15px] border-2",
  lg: "w-[46px] h-[46px] text-[23px] border-[2.5px]",
  header: "w-12 h-12 text-[20px] border-[3px]",
  profile: "w-[60px] h-[60px] text-[26px] border-[2.5px]",
  picker: "w-[76px] h-[76px] text-[32px] border-[3px]",
};

const InitialAvatar = React.forwardRef<HTMLSpanElement, InitialAvatarProps>(
  ({ name, avatarColor, size = "sm", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "rounded-pill border-ink flex items-center justify-center font-display font-bold text-ink flex-shrink-0",
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
