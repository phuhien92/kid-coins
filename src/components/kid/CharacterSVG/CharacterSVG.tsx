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
      {/* ── Legs (behind coin body) ── */}
      <line x1="51" y1="90" x2="44" y2="113" stroke="#1C1B17" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="69" y1="90" x2="76" y2="113" stroke="#1C1B17" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="41" cy="114" rx="8" ry="4.5" fill="#1C1B17" />
      <ellipse cx="79" cy="114" rx="8" ry="4.5" fill="#1C1B17" />

      {/* ── Arms (behind coin body) ── */}
      <line x1="22" y1="60" x2="36" y2="67" stroke="#1C1B17" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="84" y1="67" x2="98" y2="60" stroke="#1C1B17" strokeWidth="3.5" strokeLinecap="round" />

      {/* ── Coin outer rim ── */}
      <circle cx="60" cy="54" r="38" fill={fill} stroke="#1C1B17" strokeWidth="3" />

      {/* ── Coin inner ring — creates rim depth and darker face area ── */}
      <circle cx="60" cy="54" r="30" fill="#1C1B17" fillOpacity="0.10" stroke="#1C1B17" strokeWidth="1.5" />

      {/* ── Blush cheeks ── */}
      <ellipse cx="41" cy="62" rx="7.5" ry="4.5" fill="#F0A6A0" opacity="0.60" />
      <ellipse cx="79" cy="62" rx="7.5" ry="4.5" fill="#F0A6A0" opacity="0.60" />

      {/* ── Eyes ── */}
      {char.eye === "default" && (
        <>
          <circle cx="50" cy="50" r="5.5" fill="#1C1B17" />
          <circle cx="70" cy="50" r="5.5" fill="#1C1B17" />
          <circle cx="51.8" cy="48.2" r="2" fill="white" />
          <circle cx="71.8" cy="48.2" r="2" fill="white" />
        </>
      )}
      {char.eye === "star" && (
        <>
          <text x="43" y="60" fontSize="14" fill="#1C1B17">★</text>
          <text x="63" y="60" fontSize="14" fill="#1C1B17">★</text>
        </>
      )}
      {char.eye === "sun" && (
        // Happy squint (^‿^)
        <>
          <path d="M44 52 Q50 47 56 52" stroke="#1C1B17" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M64 52 Q70 47 76 52" stroke="#1C1B17" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Mouth (suppressed when mustache is active) ── */}
      {char.extra !== "mustache" && (
        <path d="M49 66 Q60 76 71 66" stroke="#1C1B17" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* ── Extras ── */}
      {char.extra === "bow" && (
        // Hair bow, top-right of coin
        <>
          <path d="M72 27 Q80 21 82 29 Q80 37 72 29Z" fill="#F0A6A0" stroke="#1C1B17" strokeWidth="1.5" />
          <path d="M72 29 Q64 21 62 29 Q64 37 72 29Z" fill="#F0A6A0" stroke="#1C1B17" strokeWidth="1.5" />
          <circle cx="72" cy="29" r="3.5" fill="#F4D34E" stroke="#1C1B17" strokeWidth="1.5" />
        </>
      )}
      {char.extra === "freckles" && (
        <>
          <circle cx="43" cy="65" r="2" fill="#D4A520" opacity="0.65" />
          <circle cx="49" cy="67" r="2" fill="#D4A520" opacity="0.65" />
          <circle cx="71" cy="65" r="2" fill="#D4A520" opacity="0.65" />
          <circle cx="77" cy="67" r="2" fill="#D4A520" opacity="0.65" />
        </>
      )}
      {char.extra === "sunglasses" && (
        // Wide white sunglasses with shine stripes
        <>
          <rect x="40" y="44" width="18" height="13" rx="5" fill="white" stroke="#1C1B17" strokeWidth="2.2" />
          <rect x="62" y="44" width="18" height="13" rx="5" fill="white" stroke="#1C1B17" strokeWidth="2.2" />
          <line x1="58" y1="50" x2="62" y2="50" stroke="#1C1B17" strokeWidth="2" strokeLinecap="round" />
          <line x1="45" y1="47" x2="45" y2="54" stroke="#1C1B17" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="47" x2="50" y2="54" stroke="#1C1B17" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="67" y1="47" x2="67" y2="54" stroke="#1C1B17" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="72" y1="47" x2="72" y2="54" stroke="#1C1B17" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {char.extra === "mustache" && (
        <>
          <path d="M45 66 Q52 61 60 64 Q68 61 75 66" stroke="#1C1B17" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M51 72 Q60 80 69 72" stroke="#1C1B17" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Hat ── */}
      {char.hat === "cap" && (
        // Bucket / straw hat
        <>
          <ellipse cx="60" cy="19" rx="36" ry="7.5" fill="#C8922A" stroke="#1C1B17" strokeWidth="2.2" />
          <path d="M28,19 Q30,4 60,4 Q90,4 92,19" fill="#E0A830" stroke="#1C1B17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30,19 Q32,13 60,13 Q88,13 90,19" stroke="#8B5E0A" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {char.hat === "party" && (
        <>
          <polygon points="60,6 40,32 80,32" fill="#F0A6A0" stroke="#1C1B17" strokeWidth="2" />
          <circle cx="60" cy="6" r="4" fill="#F4D34E" stroke="#1C1B17" strokeWidth="1.5" />
          <circle cx="54" cy="22" r="2.5" fill="#7B6BE6" opacity="0.85" />
          <circle cx="65" cy="15" r="2" fill="white" opacity="0.9" />
          <circle cx="68" cy="25" r="2" fill="#C7E9D4" opacity="0.85" />
        </>
      )}
      {char.hat === "crown" && (
        <>
          <path
            d="M36,34 L42,14 L52,26 L60,10 L68,26 L78,14 L84,34 Z"
            fill="#F4D34E"
            stroke="#1C1B17"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="18" r="3" fill="#F0A6A0" stroke="#1C1B17" strokeWidth="1" />
          <circle cx="44" cy="24" r="2.5" fill="#7B6BE6" stroke="#1C1B17" strokeWidth="1" />
          <circle cx="76" cy="24" r="2.5" fill="#C7E9D4" stroke="#1C1B17" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}
