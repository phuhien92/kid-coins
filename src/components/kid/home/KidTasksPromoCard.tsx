import { PromoLink } from "@/components/ui";
import { PennyMascot } from "@/components/kid/PennyMascot";
import type { ReactNode } from "react";

type KidTasksPromoCardProps = {
  href: string;
  pendingTaskCount: number;
  taskCopy: string;
};

export function KidTasksPromoCard({
  href,
  pendingTaskCount,
  taskCopy,
}: KidTasksPromoCardProps) {
  return (
    <PromoLink href={href} variant="card">
      <span
        className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-pill bg-ink text-white font-display font-black text-xl leading-none"
        aria-hidden
      >
        →
      </span>
      <p className="font-body font-extrabold text-xs uppercase tracking-wider text-ink/80">
        Small tasks. Real progress.
      </p>
      <p className="mt-1 font-display font-black text-2xl leading-tight pr-12">
        {pendingTaskCount} {taskCopy} to earn
        <br />
        coins today!
      </p>
      <div className="flex items-center mt-4" aria-hidden>
        <PennyMascot className="size-14" />
      </div>
    </PromoLink>
  );
}

type KidTasksBottomCtaProps = {
  href: string;
  pendingTaskCount: number;
  taskCopy: string;
  trailing?: ReactNode;
};

/** Full-bleed bottom tasks CTA — legacy hero layout. */
export function KidTasksBottomCta({
  href,
  pendingTaskCount,
  taskCopy,
  trailing,
}: KidTasksBottomCtaProps) {
  return (
    <PromoLink href={href} variant="bar">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-body font-extrabold text-xs uppercase tracking-wider text-ink/80">
            Today
          </p>
          <p className="font-display font-black text-2xl leading-tight">
            {pendingTaskCount} {taskCopy} to earn coins
          </p>
        </div>
        {trailing ?? (
          <div
            className="size-14 rounded-pill bg-ink text-white flex items-center justify-center font-display font-black text-2xl flex-shrink-0"
            aria-hidden
          >
            →
          </div>
        )}
      </div>
    </PromoLink>
  );
}
