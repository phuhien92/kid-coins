"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { KidCoinMark } from "@/components/ui";
import { cn } from "@/lib/utils";

export type PennyMascotProps = {
  className?: string;
  /**
   * When true, the mascot idles with a subtle Y-translate + rotate loop (3s).
   * Automatically suppressed when the user requests reduced motion.
   */
  float?: boolean;
};

/**
 * Penny — the kid-coin coin face (navy visor, glowing arc eyes, gold star),
 * used as an inline mascot until the rendered robot art lands.
 *
 * Decorative (`aria-hidden`). If used as the sole identifier of an element,
 * provide a label on the parent.
 */
export function PennyMascot({ className, float = false }: PennyMascotProps) {
  const reduce = useReducedMotion();
  const animate =
    float && !reduce
      ? { y: [0, -4, 0, 4, 0], rotate: [-1.5, 1.5, -1.5] }
      : undefined;

  return (
    <motion.span
      aria-hidden
      className={cn("inline-block", className)}
      animate={animate}
      transition={
        animate
          ? { duration: 3, ease: "easeInOut", repeat: Infinity }
          : undefined
      }
      style={{ transformOrigin: "50% 60%" }}
    >
      <KidCoinMark className="size-full drop-shadow-lg" />
    </motion.span>
  );
}
