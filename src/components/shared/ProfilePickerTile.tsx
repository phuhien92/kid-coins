import { Card, CoinIcon, InitialAvatar, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

type ProfilePickerKid = {
  name: string;
  avatarColor: string;
  balance: number;
};

type ProfilePickerTileProps = {
  kid: ProfilePickerKid;
  onClick: () => void;
};

/** Stamped profile tile for the kid profile picker grid. */
export function ProfilePickerTile({ kid, onClick }: ProfilePickerTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-3 p-5 w-full text-left",
        "bg-cream-card border-[3px] border-ink rounded-card",
        "shadow-[0_5px_0_var(--color-ink)]",
        "active:translate-y-[5px] active:shadow-none",
        "transition-[transform,box-shadow] duration-75 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
      )}
    >
      <InitialAvatar
        name={kid.name}
        avatarColor={kid.avatarColor}
        size="picker"
      />

      <div className="text-center">
        <p className="font-display font-semibold text-[17px] text-ink leading-snug truncate max-w-[120px]">
          {kid.name}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <CoinIcon size="sm" />
          <span className="font-body font-bold text-[13px] text-ink-soft">
            {kid.balance}
          </span>
        </div>
      </div>
    </button>
  );
}

export function ProfilePickerTileSkeleton({ className }: { className?: string }) {
  return (
    <Card
      padding="md"
      className={cn("flex flex-col items-center gap-3 border-ink/10 animate-pulse", className)}
    >
      <Skeleton.Circle size="lg" className="w-[76px] h-[76px]" />
      <div className="flex flex-col items-center gap-2 w-full">
        <Skeleton.Block className="h-4 w-16" />
        <Skeleton.Block className="h-3 w-10" />
      </div>
    </Card>
  );
}
