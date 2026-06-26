import { Card, CoinIcon, GoalEmojiBadge, ProgressBar } from "@/components/ui";
import { formatCoins } from "@/lib/utils";

type KidGoalCardProps = {
  emoji: string;
  name: string;
  current: number;
  target: number;
};

export function KidGoalCard({ emoji, name, current, target }: KidGoalCardProps) {
  const goalPercent = Math.round((current / target) * 100);

  return (
    <section aria-label="Goal progress">
      <Card padding="md" radius="lg" className="p-5">
        <div className="flex items-center gap-3 mb-3.5">
          <GoalEmojiBadge emoji={emoji} size="md" />
          <div className="min-w-0">
            <p className="font-display font-semibold text-[19px] text-ink leading-tight truncate">
              {name}
            </p>
            <p className="font-body font-[800] text-[12.5px] text-ink-soft mt-0.5">
              Your big goal
            </p>
          </div>
        </div>
        <ProgressBar
          value={goalPercent}
          color="coin"
          height="md"
          aria-label={`Saving for ${name}: ${current} of ${target} coins`}
        />
        <div className="flex items-center justify-between mt-2.5 font-body font-[800] text-[13px] text-ink-soft">
          <span>{goalPercent}% there</span>
          <span className="text-green-dk inline-flex items-center gap-1">
            <CoinIcon size="sm" />
            {formatCoins(current)} / {formatCoins(target)}
          </span>
        </div>
      </Card>
    </section>
  );
}

type KidGoalStripProps = KidGoalCardProps;

/** Compact pill goal row — legacy hero layout. */
export function KidGoalStrip({ emoji, name, current, target }: KidGoalStripProps) {
  const goalPercent = Math.round((current / target) * 100);

  return (
    <section aria-label="Goal progress" className="w-full max-w-[480px] mt-10">
      <Card compact padding="sm" radius="pill" className="px-4 py-3">
        <div className="flex items-center gap-3 text-left">
          <GoalEmojiBadge emoji={emoji} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-[14px] text-ink leading-tight truncate">
              {name}
            </p>
            <div className="mt-1.5">
              <ProgressBar
                value={goalPercent}
                color="coin"
                height="sm"
                aria-label={`Saving for ${name}: ${current} of ${target} coins`}
              />
            </div>
          </div>
          <span className="font-body font-bold text-[12px] text-ink-soft whitespace-nowrap">
            {current}/{target}
          </span>
        </div>
      </Card>
    </section>
  );
}
