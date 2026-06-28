"use client";

import { AppNavSidebarFooter } from "@/components/shared/AppNav/AppNavSidebarFooter";
import { ProfileSwitchAction } from "@/components/shared/AppNav/ProfileSwitchAction";
import { InitialAvatar } from "@/components/ui";
import { useKid } from "@/context/KidContext";

export function KidSidebarFooter({ compact = false }: { compact?: boolean }) {
  const { kid } = useKid();

  return (
    <AppNavSidebarFooter
      compact={compact}
      avatar={
        <InitialAvatar name={kid.name} avatarColor={kid.avatarColor} size="md" />
      }
      primaryLabel={kid.name}
      action={
        <ProfileSwitchAction
          register="kid"
          aria-label={`Switch profile (signed in as ${kid.name})`}
        />
      }
    />
  );
}
