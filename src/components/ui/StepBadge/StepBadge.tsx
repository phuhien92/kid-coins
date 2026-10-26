import * as React from "react";
import { cn } from "@/lib/utils";
import { getStep, type StepId } from "@/lib/brand";
import { STEP_TONES } from "./stepTones";

export type StepBadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  step: StepId;
  /** Show the step number before the name ("1 Do"). */
  numbered?: boolean;
};

/**
 * Pill naming one of the five steps. The step is always spelled out in text,
 * so its colour is never the only cue.
 */
export function StepBadge({ step, numbered = true, className, ...rest }: StepBadgeProps) {
  const s = getStep(step);
  const tone = STEP_TONES[step];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-display font-extrabold text-sm",
        tone.tint,
        tone.ink,
        className
      )}
      {...rest}
    >
      {numbered && (
        <span
          aria-hidden
          className={cn("inline-flex size-5 items-center justify-center rounded-pill text-xs text-ink", tone.fill)}
        >
          {s.number}
        </span>
      )}
      {numbered && <span className="sr-only">Step {s.number}:</span>}
      {s.name}
    </span>
  );
}
