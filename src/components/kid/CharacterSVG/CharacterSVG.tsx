import type { CharacterState } from "@/types";
import { CHAR_COLORS } from "@/lib/character";

export function CharacterSVG({
  char,
  size = 120,
}: {
  char: CharacterState;
  size?: number;
}) {
  const fill = CHAR_COLORS[char.color] ?? "#F4D34E";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="60"
        cy="58"
        r="36"
        fill={fill}
        stroke="#1C1B17"
        strokeWidth="2.5"
      />
      {char.eye === "default" && (
        <>
          <circle cx="50" cy="56" r="5" fill="#1C1B17" />
          <circle cx="70" cy="56" r="5" fill="#1C1B17" />
          <circle cx="52" cy="54" r="1.5" fill="white" />
          <circle cx="72" cy="54" r="1.5" fill="white" />
        </>
      )}
      {char.eye === "star" && (
        <>
          <text x="44" y="62" fontSize="12" fill="#1C1B17">
            ★
          </text>
          <text x="64" y="62" fontSize="12" fill="#1C1B17">
            ★
          </text>
        </>
      )}
      {char.eye === "sun" && (
        <>
          <text x="44" y="62" fontSize="12" fill="#F4D34E">
            ☀
          </text>
          <text x="64" y="62" fontSize="12" fill="#F4D34E">
            ☀
          </text>
        </>
      )}
      <path
        d="M50 68 Q60 76 70 68"
        stroke="#1C1B17"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse
        cx="48"
        cy="96"
        rx="10"
        ry="6"
        fill={fill}
        stroke="#1C1B17"
        strokeWidth="2"
      />
      <ellipse
        cx="72"
        cy="96"
        rx="10"
        ry="6"
        fill={fill}
        stroke="#1C1B17"
        strokeWidth="2"
      />
      {char.hat === "cap" && (
        <>
          <rect
            x="36"
            y="28"
            width="48"
            height="14"
            rx="7"
            fill="#7B6BE6"
            stroke="#1C1B17"
            strokeWidth="2"
          />
          <rect
            x="30"
            y="38"
            width="60"
            height="6"
            rx="3"
            fill="#5E4FCB"
            stroke="#1C1B17"
            strokeWidth="1.5"
          />
        </>
      )}
      {char.hat === "party" && (
        <>
          <polygon
            points="60,8 48,32 72,32"
            fill="#F0A6A0"
            stroke="#1C1B17"
            strokeWidth="2"
          />
          <circle
            cx="60"
            cy="8"
            r="3"
            fill="#F4D34E"
            stroke="#1C1B17"
            strokeWidth="1.5"
          />
        </>
      )}
      {char.hat === "crown" && (
        <polygon
          points="40,34 48,18 60,28 72,18 80,34"
          fill="#F4D34E"
          stroke="#1C1B17"
          strokeWidth="2"
        />
      )}
      {char.extra === "bow" && (
        <>
          <path
            d="M68 36 Q76 28 80 36 Q76 44 68 36Z"
            fill="#F0A6A0"
            stroke="#1C1B17"
            strokeWidth="1.5"
          />
          <path
            d="M68 36 Q60 28 56 36 Q60 44 68 36Z"
            fill="#F0A6A0"
            stroke="#1C1B17"
            strokeWidth="1.5"
          />
          <circle
            cx="68"
            cy="36"
            r="3"
            fill="#F4D34E"
            stroke="#1C1B17"
            strokeWidth="1.5"
          />
        </>
      )}
      {char.extra === "freckles" && (
        <>
          <circle cx="46" cy="64" r="2" fill="#E3BE34" opacity="0.6" />
          <circle cx="52" cy="66" r="2" fill="#E3BE34" opacity="0.6" />
          <circle cx="68" cy="64" r="2" fill="#E3BE34" opacity="0.6" />
          <circle cx="74" cy="66" r="2" fill="#E3BE34" opacity="0.6" />
        </>
      )}
    </svg>
  );
}
