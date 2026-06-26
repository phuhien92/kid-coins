"use client";

import { useRouter } from "next/navigation";
import { InitialAvatar, StampedChip } from "@/components/ui";
import { useKid } from "@/context/KidContext";
import { clearKidSession } from "@/lib/kid-session";
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
  const router = useRouter();
  const { kid } = useKid();

  function handleClick() {
    clearKidSession();
    router.push("/profile-picker");
  }

  return (
    <StampedChip
      onClick={handleClick}
      ring="green"
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
