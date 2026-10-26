import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MASCOT_ART, type MascotSlotId } from "@/lib/brand";
import { KidCoinMark } from "@/components/ui/KidCoinLogo";
import { STEP_TONES } from "@/components/ui/StepBadge";

export type MascotSlotProps = {
  /** Which robot: the hero mascot or one of the five step robots. */
  slot: MascotSlotId;
  className?: string;
  /** Pass true for the above-the-fold hero so the PNG loads eagerly. */
  priority?: boolean;
  /** Mark as decorative when nearby text already says the same thing. */
  decorative?: boolean;
};

/**
 * Named slot for a rendered mascot PNG (see MASCOT_ART in src/lib/brand.ts).
 * Until the owner supplies the art, it renders a soft step-tinted tile with
 * the coin mark, carrying the same alt text so nothing is lost.
 */
export function MascotSlot({ slot, className, priority = false, decorative = false }: MascotSlotProps) {
  const art = MASCOT_ART[slot];
  const alt = decorative ? "" : art.alt;

  if (art.src) {
    return (
      <Image
        src={art.src}
        alt={alt}
        width={art.width}
        height={art.height}
        priority={priority}
        data-mascot-slot={slot}
        className={cn("h-auto w-full object-contain", className)}
      />
    );
  }

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative ? true : undefined}
      data-mascot-slot={slot}
      data-placeholder="true"
      className={cn(
        "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-sheet",
        STEP_TONES[slot].tint,
        className
      )}
    >
      <span aria-hidden className={cn("absolute size-3/4 rounded-pill opacity-40 blur-2xl", STEP_TONES[slot].fill)} />
      <KidCoinMark className="relative size-1/2 drop-shadow-xl" />
    </span>
  );
}
