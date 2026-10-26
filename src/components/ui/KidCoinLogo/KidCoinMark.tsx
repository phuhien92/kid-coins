import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export type KidCoinMarkProps = Omit<React.SVGAttributes<SVGSVGElement>, "children"> & {
  /** Accessible name. Omit when the mark sits next to visible brand text. */
  title?: string;
  className?: string;
};

// Five-point star centred on (0,0): outer radius 7, inner radius 3.1.
const STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 7 : 3.1;
  const a = (Math.PI / 5) * i - Math.PI / 2;
  return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

/**
 * The kid-coin mark: a glossy gold coin with a navy visor face, two glowing
 * happy-arc eyes, a small smile and a gold star on its lower right.
 *
 * Decorative (aria-hidden) unless a `title` is passed.
 */
export function KidCoinMark({ title, className, ...rest }: KidCoinMarkProps) {
  const id = useId().replace(/:/g, "");
  const coin = `${id}-coin`;
  const visor = `${id}-visor`;
  const glow = `${id}-glow`;
  const labelled = Boolean(title);

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? title : undefined}
      focusable="false"
      className={cn("inline-block shrink-0", className)}
      {...rest}
    >
      <defs>
        <radialGradient id={coin} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFE38A" />
          <stop offset="45%" stopColor="var(--color-gold-lt)" />
          <stop offset="80%" stopColor="var(--color-gold)" />
          <stop offset="100%" stopColor="var(--color-gold-dk)" />
        </radialGradient>
        <linearGradient id={visor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B2D57" />
          <stop offset="100%" stopColor="var(--color-ink)" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Coin body + rim */}
      <circle cx="31" cy="31" r="28" fill={`url(#${coin})`} />
      <circle cx="31" cy="31" r="27" stroke="var(--color-gold-dk)" strokeWidth="2" />
      <circle cx="31" cy="31" r="22.5" stroke="#FFF3C4" strokeOpacity="0.6" strokeWidth="1.25" />

      {/* Visor face */}
      <rect x="12" y="18" width="38" height="25" rx="12.5" fill={`url(#${visor})`} />
      <path d="M17 23.5 Q31 19 45 23.5" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />

      {/* Glowing happy-arc eyes */}
      <g filter={`url(#${glow})`} stroke="#FFE066" strokeWidth="3.2" strokeLinecap="round">
        <path d="M19.5 32.5 Q23.5 26.5 27.5 32.5" />
        <path d="M34.5 32.5 Q38.5 26.5 42.5 32.5" />
      </g>
      {/* Small smile */}
      <path d="M28 37.2 Q31 39.6 34 37.2" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" />

      {/* Gloss */}
      <ellipse cx="21" cy="11.5" rx="8" ry="3.2" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(-24 21 11.5)" />

      {/* Gold star, lower right */}
      <g transform="translate(51 51) rotate(12)">
        <polygon points={STAR_POINTS} fill="var(--color-gold-lt)" stroke="var(--color-gold-dk)" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="-1.6" cy="-1.8" r="1.1" fill="#FFFFFF" fillOpacity="0.8" />
      </g>
    </svg>
  );
}
