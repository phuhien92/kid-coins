import { Card, CoinIcon, MascotSlot, StepBadge } from "@/components/ui";
import { formatCoins } from "@/lib/utils";

type KidBalanceCardProps = {
  balance: number;
  todayEarned: number;
};

export function KidBalanceCard({ balance, todayEarned }: KidBalanceCardProps) {
  return (
    <section aria-label="Coin balance">
      <Card padding="lg" radius="sheet" className="flex items-center gap-4 overflow-hidden">
        <div className="flex-1 min-w-0">
          <StepBadge step="earn" numbered={false} />
          <p className="mt-4 font-body font-extrabold text-sm text-ink-soft uppercase tracking-wider">
            All my coins
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="font-display font-black text-6xl text-ink leading-none tracking-tight"
              aria-label={`${balance} coins`}
            >
              {formatCoins(balance)}
            </span>
            <CoinIcon size="lg" />
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-mint-tint px-3 py-1 font-body font-extrabold text-sm text-mint-ink">
            <span className="text-ink-soft">Today</span>+{todayEarned} earned
          </p>
        </div>
        <MascotSlot slot="earn" decorative className="hidden sm:flex w-36 shrink-0" />
      </Card>
    </section>
  );
}
