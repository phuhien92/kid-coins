import { MascotSlot, STEP_TONES } from "@/components/ui";
import { getStep, type StepId } from "@/lib/brand";
import { cn } from "@/lib/utils";

type StepCardProps = {
  step: StepId;
  className?: string;
};

/** One chapter of the Do → Earn → Save → Choose → Grow story, with its robot. */
export function StepCard({ step, className }: StepCardProps) {
  const s = getStep(step);
  const tone = STEP_TONES[step];
  return (
    <article className={cn("flex items-center gap-4 rounded-card p-5 sm:flex-col sm:items-stretch", tone.tint, className)}>
      <MascotSlot slot={step} className="w-24 shrink-0 bg-surface/60 sm:w-full" />
      <div className="min-w-0">
        <p className={cn("font-display font-black text-sm uppercase tracking-wider", tone.ink)}>
          <span className="sr-only">Step </span>
          {s.number} · {s.name}
        </p>
        <h3 className="mt-1 font-display font-black text-xl text-fg leading-tight">{s.headline}</h3>
        <p className="mt-2 font-body text-sm text-fg-muted">{s.body}</p>
      </div>
    </article>
  );
}
