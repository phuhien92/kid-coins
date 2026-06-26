import { Card, CoinIcon, InitialAvatar } from "@/components/ui";
import { DashedActionCard } from "@/components/ui/DashedActionCard";
import { cn, formatCoins } from "@/lib/utils";

export type ParentKid = {
  id: string;
  name: string;
  avatarColor: string;
  balance: number;
};

type ParentKidCardProps = {
  kid: ParentKid;
  className?: string;
};

/**
 * Parent kids management card — horizontal layout per design handoff
 * (Earnie - Parent Web App.html §KIDS). Not the profile-picker tile grid.
 */
export function ParentKidCard({ kid, className }: ParentKidCardProps) {
  return (
    <Card
      compact
      padding="none"
      radius="parent"
      className={cn(
        "p-[18px] transition-transform duration-150 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3.5">
        <InitialAvatar
          name={kid.name}
          avatarColor={kid.avatarColor}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-[18px] text-ink leading-tight truncate">
            {kid.name}
          </p>
          <p className="font-body font-[800] text-[12px] text-ink-soft mt-0.5">
            Kid profile
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 font-body font-[800] text-[12.5px] text-ink-soft">
        <span>Coin balance</span>
        <span className="text-green-dk inline-flex items-center gap-1">
          <CoinIcon size="sm" />
          {formatCoins(kid.balance)}
        </span>
      </div>
    </Card>
  );
}

export function ParentAddKidCard({ className }: { className?: string }) {
  return (
    <DashedActionCard
      href="/parent/kids/new"
      title="Add a kid"
      description="Create a profile and set their PIN"
      variant="parent"
      className={className}
    />
  );
}
