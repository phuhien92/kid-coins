"use client";

import { appNavStampedChipRing } from "@/components/shared/AppNav/types";
import { InitialAvatar, StampedChip } from "@/components/ui";
import { useKid } from "@/context/KidContext";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { cn } from "@/lib/utils";

type SwitchProfileButtonProps = {
  className?: string;
  label?: string;
  /** full = sidebar width; default = compact chip */
  size?: "default" | "full";
};

export function SwitchProfileButton({
  className,
  label = "Switch profile",
  size = "default",
}: SwitchProfileButtonProps) {
  const switchProfile = useProfileSwitch();
  const { kid } = useKid();

  return (
    <StampedChip
      onClick={switchProfile}
      ring={appNavStampedChipRing("kid")}
      aria-label={`Switch profile (signed in as ${kid.name})`}
      className={cn(
        "gap-2.5",
        size === "full" ? "w-full px-3 py-2 justify-center" : "px-2.5 py-1.5 pr-3.5",
        className
      )}
    >
      <InitialAvatar name={kid.name} avatarColor={kid.avatarColor} />
      <span className="truncate">{label}</span>
    </StampedChip>
  );
}
