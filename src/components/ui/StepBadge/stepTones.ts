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
  hero: { tint: "bg-gold-tint", fill: "bg-gold", ink: "text-gold-ink" },
  do: { tint: "bg-gold-tint", fill: "bg-gold", ink: "text-gold-ink" },
  earn: { tint: "bg-earn-tint", fill: "bg-earn", ink: "text-earn-ink" },
  save: { tint: "bg-save-tint", fill: "bg-save", ink: "text-save-ink" },
  choose: { tint: "bg-mint-tint", fill: "bg-mint", ink: "text-mint-ink" },
  grow: { tint: "bg-grow-tint", fill: "bg-grow", ink: "text-grow-ink" },
};
