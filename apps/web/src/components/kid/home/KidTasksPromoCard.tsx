import { StampedGreenLink } from "@/components/ui";
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
    <StampedGreenLink href={href} variant="card">
      <span
        className="absolute top-4 right-4 font-display font-bold text-[24px] leading-none"
        aria-hidden
      >
        ›
      </span>
      <p className="font-display font-semibold text-[20px] leading-[1.15] pr-8">
        {pendingTaskCount} {taskCopy} to earn
        <br />
        coins today!
      </p>
      <div className="flex items-center mt-3.5 -space-x-2" aria-hidden>
        <PennyMascot className="w-[52px] h-[52px]" />
      </div>
    </StampedGreenLink>
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
    <StampedGreenLink href={href} variant="bar">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-body font-bold text-[12px] uppercase tracking-wider opacity-85">
            Today
          </p>
          <p className="font-display font-semibold text-[22px] leading-tight">
            {pendingTaskCount} {taskCopy} to earn coins
          </p>
        </div>
        {trailing ?? (
          <div
            className="w-14 h-14 rounded-pill border-[2.5px] border-ink bg-white text-ink flex items-center justify-center font-display font-bold text-[24px] flex-shrink-0"
            aria-hidden
          >
            →
          </div>
        )}
      </div>
    </StampedGreenLink>
  );
}
