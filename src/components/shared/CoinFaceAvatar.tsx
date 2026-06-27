"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type CoinFaceAvatarProps = {
  className?: string;
};

/** Animated gold coin character with eyes, smile, and mustache.
 *  Used as the parent profile tile avatar on the profile picker. */
export function CoinFaceAvatar({ className }: CoinFaceAvatarProps) {
  const gradId = useId();

  return (
    <span
      aria-label="Parent coin"
      role="img"
      style={{ width: 52, height: 52 }}
      className={cn(
        "rounded-full border-[2.5px] border-ink flex-shrink-0 block",
        "shadow-[0_2px_0_var(--color-ink)]",
        "coin-face-bob",
        className
      )}
    >
      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={52}
        height={52}
        style={{ display: "block" }}
      >
        {/* Gold coin background */}
        <defs>
          <radialGradient id={gradId} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE97A" />
            <stop offset="55%" stopColor="#F4D34E" />
            <stop offset="100%" stopColor="#E3BE34" />
          </radialGradient>
        </defs>

        <circle cx="26" cy="26" r="26" fill={`url(#${gradId})`} />

        {/* Left eye */}
        <ellipse
          cx="18.5"
          cy="20"
          rx="2.6"
          ry="3.2"
          fill="#1C1B17"
          className="coin-eye"
        />
        {/* Right eye */}
        <ellipse
          cx="33.5"
          cy="20"
          rx="2.6"
          ry="3.2"
          fill="#1C1B17"
          className="coin-eye coin-eye-r"
        />

        {/* Mustache */}
        <path
          d="M14 28.5 Q18 25.5 22 27.5 Q26 29.5 30 27.5 Q34 25.5 38 28.5"
          stroke="#1C1B17"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Smile */}
        <path
          d="M18 35 Q26 40.5 34 35"
          stroke="#1C1B17"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
