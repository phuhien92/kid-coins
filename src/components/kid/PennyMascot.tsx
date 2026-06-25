"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type PennyMascotProps = Omit<
  React.SVGAttributes<SVGSVGElement>,
  // framer-motion's MotionProps collide with these SVG attribute names.
  | "onAnimationStart"
  | "onDrag"
  | "onDragEnd"
  | "onDragStart"
  | "values"
> & {
  className?: string;
  /**
   * When true, Penny idles with a subtle Y-translate + rotate loop (3s).
   * Automatically suppressed when the user requests reduced motion.
   */
  float?: boolean;
};

/**
 * Penny — the round, coin-faced kid mascot.
 *
 * Inline SVG so it's:
 *   - Crisp at any size
 *   - Recolorable via CSS custom properties (--color-coin, --color-ink, --color-coral)
 *   - One network request fewer than a sprite
 *
 * Decorative by default (`aria-hidden`). If used as the sole identifier of an
 * element (e.g. an avatar), wrap it and provide a label on the parent.
 */
export function PennyMascot({
  className,
  float = false,
  ...rest
}: PennyMascotProps) {
  const reduce = useReducedMotion();
  const animate =
    float && !reduce
      ? { y: [0, -4, 0, 4, 0], rotate: [-1.5, 1.5, -1.5] }
      : undefined;

  return (
    <motion.svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      className={cn("inline-block", className)}
      animate={animate}
      transition={
        animate
          ? { duration: 3, ease: "easeInOut", repeat: Infinity }
          : undefined
      }
      style={{ transformOrigin: "50% 60%" }}
      {...rest}
    >
      {/* Body */}
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="var(--color-coin)"
        stroke="var(--color-ink)"
        strokeWidth="3.5"
      />
      {/* Inner ring — coin texture */}
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity="0.5"
      />
      {/* Eyes */}
      <circle cx="46" cy="55" r="4" fill="var(--color-ink)" />
      <circle cx="74" cy="55" r="4" fill="var(--color-ink)" />
      {/* Cheeks */}
      <circle cx="40" cy="68" r="4" fill="var(--color-coral)" opacity="0.75" />
      <circle cx="80" cy="68" r="4" fill="var(--color-coral)" opacity="0.75" />
      {/* Smile */}
      <path
        d="M50 72 Q60 80 70 72"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}
