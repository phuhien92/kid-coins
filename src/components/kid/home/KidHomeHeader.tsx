import { Badge, InitialAvatar } from "@/components/ui";
import type { ReactNode } from "react";

type KidHomeHeaderProps = {
  kidName: string;
  avatarColor: string;
  streak: number;
  trailing?: ReactNode;
};

export function KidHomeHeader({
  kidName,
  avatarColor,
  streak,
  trailing,
}: KidHomeHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <InitialAvatar name={kidName} avatarColor={avatarColor} size="header" />
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-[23px] text-ink leading-tight truncate">
            Hi, {kidName}!
          </h1>
          <p className="font-body font-[800] text-[13px] text-ink-soft mt-0.5">
            Let&apos;s earn some coins ✨
          </p>
        </div>
      </div>
      <Badge variant="streak" aria-label={`${streak}-day streak`}>
        <span aria-hidden>🔥</span> {streak}
      </Badge>
      {trailing}
    </header>
  );
}
