import { Card, CoinIcon } from "@/components/ui";
import { formatCoins } from "@/lib/utils";

type KidBalanceCardProps = {
  balance: number;
  todayEarned: number;
};

export function KidBalanceCard({ balance, todayEarned }: KidBalanceCardProps) {
  return (
    <section aria-label="Coin balance">
      <Card padding="md" radius="xl" className="p-5">
        <p className="font-body font-[800] text-[13px] text-ink-soft uppercase tracking-[0.07em]">
          All my coins
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span
            className="font-display font-bold text-[clamp(2.75rem,12vw,3.375rem)] text-ink leading-none tracking-tight"
            aria-label={`${balance} coins`}
          >
            {formatCoins(balance)}
          </span>
          <CoinIcon size="lg" className="relative top-0.5" />
        </div>
        <p className="font-body font-[800] text-[13px] text-green-dk mt-3 flex items-center gap-1.5">
          <span className="text-ink-soft">Today</span>+{todayEarned} earned
        </p>
      </Card>
    </section>
  );
}
