"use client";

import { StampedChip } from "@/components/ui";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { cn } from "@/lib/utils";
import { appNavStampedChipRing, type AppNavRegister } from "./types";

type ProfileSwitchActionProps = {
  register: AppNavRegister;
  label?: string;
  className?: string;
  "aria-label"?: string;
};

/** Shared profile-switch control — clears kid session, then opens the profile picker. */
export function ProfileSwitchAction({
  register,
  label = "Switch profile",
  className,
  "aria-label": ariaLabel,
}: ProfileSwitchActionProps) {
  const switchProfile = useProfileSwitch();

  return (
    <StampedChip
      ring={appNavStampedChipRing(register)}
      onClick={switchProfile}
      aria-label={ariaLabel}
      className={cn("shrink-0 text-xs px-3 py-1.5", className)}
    >
      {label}
    </StampedChip>
  );
}
