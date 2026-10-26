import type { MascotSlotId } from "@/lib/brand";

export type StepTone = {
  /** Soft background for tiles, chips and active states. */
  tint: string;
  /** Solid body colour (illustration, dots, fills). */
  fill: string;
  /** AA-contrast text on the tint or on cream. */
  ink: string;
};

/** Do · Earn · Save · Choose · Grow → yellow · blue · coral · mint · lavender. */
export const STEP_TONES: Record<MascotSlotId, StepTone> = {
  hero: { tint: "bg-step-do-tint", fill: "bg-coin", ink: "text-step-do-ink" },
  do: { tint: "bg-step-do-tint", fill: "bg-step-do", ink: "text-step-do-ink" },
  earn: { tint: "bg-step-earn-tint", fill: "bg-step-earn", ink: "text-step-earn-ink" },
  save: { tint: "bg-step-save-tint", fill: "bg-step-save", ink: "text-step-save-ink" },
  choose: { tint: "bg-step-choose-tint", fill: "bg-step-choose", ink: "text-step-choose-ink" },
  grow: { tint: "bg-step-grow-tint", fill: "bg-step-grow", ink: "text-step-grow-ink" },
};
