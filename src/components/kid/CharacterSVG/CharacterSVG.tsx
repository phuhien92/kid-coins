import type { CharacterState } from "@/types";
import { CHAR_COLORS } from "@/lib/character";

const INK = "#1C1B17";

export function CharacterSVG({
  char,
  size = 120,
}: {
  char: CharacterState;
  size?: number;
}) {
  const fill = CHAR_COLORS[char.color] ?? "#F4D34E";
  const hasOutfit = char.outfit && char.outfit !== "none";

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
      <line x1="51" y1="90" x2="44" y2="113" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="69" y1="90" x2="76" y2="113" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="41" cy="114" rx="8" ry="4.5" fill={INK} />
      <ellipse cx="79" cy="114" rx="8" ry="4.5" fill={INK} />

      {/* ── Outfit cloak/robe behind coin ── */}
      {char.outfit === "thief" && (
        <path d="M38,30 Q32,54 34,80 Q45,88 60,90 Q75,88 86,80 Q88,54 82,30 Q60,22 38,30Z" fill="#1E2A4A" opacity="0.85" />
      )}
      {char.outfit === "ranger" && (
        <path d="M40,28 Q34,54 36,82 Q48,90 60,91 Q72,90 84,82 Q86,54 80,28 Q60,18 40,28Z" fill="#2D5016" opacity="0.85" />
      )}
      {char.outfit === "monk" && (
        <path d="M22,58 Q18,70 24,84 Q35,96 60,98 Q85,96 96,84 Q102,70 98,58 Q80,50 60,50 Q40,50 22,58Z" fill="#D97706" opacity="0.90" />
      )}
      {char.outfit === "necromancer" && (
        <path d="M32,26 Q20,54 22,85 Q38,98 60,100 Q82,98 98,85 Q100,54 88,26 Q60,12 32,26Z" fill="#111827" opacity="0.92" />
      )}

      {/* ── Arms (behind coin body) ── */}
      <line x1="22" y1="60" x2="36" y2="67" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="84" y1="67" x2="98" y2="60" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />

      {/* ── Coin outer rim ── */}
      <circle cx="60" cy="54" r="38" fill={fill} stroke={INK} strokeWidth="3" />

      {/* ── Coin inner ring — rim depth ── */}
      <circle cx="60" cy="54" r="30" fill={INK} fillOpacity="0.10" stroke={INK} strokeWidth="1.5" />

      {/* ── Blush cheeks ── */}
      <ellipse cx="41" cy="62" rx="7.5" ry="4.5" fill="#F0A6A0" opacity="0.60" />
      <ellipse cx="79" cy="62" rx="7.5" ry="4.5" fill="#F0A6A0" opacity="0.60" />

      {/* ── Outfit face overlays (drawn before eyes) ── */}
      {char.outfit === "dwarf" && (
        <>
          <path d="M38,62 Q36,78 40,86 Q50,96 60,97 Q70,96 80,86 Q84,78 82,62 Q70,58 60,58 Q50,58 38,62Z" fill="#8B4513" stroke={INK} strokeWidth="1.5" />
          <path d="M44,65 Q44,80 48,88" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M54,63 Q52,79 54,89" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M66,63 Q68,79 66,89" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M76,65 Q76,80 72,88" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}
      {char.outfit === "orc" && (
        <>
          <path d="M46,72 Q42,82 44,88 Q48,94 52,90 Q54,84 50,76Z" fill="#F5F0E8" stroke={INK} strokeWidth="1.5" />
          <path d="M74,72 Q78,82 76,88 Q72,94 68,90 Q66,84 70,76Z" fill="#F5F0E8" stroke={INK} strokeWidth="1.5" />
        </>
      )}
      {char.outfit === "necromancer" && (
        <circle cx="60" cy="54" r="30" fill="#111827" fillOpacity="0.18" />
      )}
      {char.outfit === "alchemist" && (
        <>
          <circle cx="50" cy="50" r="8" fill="#D6B68A" stroke={INK} strokeWidth="2" />
          <circle cx="70" cy="50" r="8" fill="#D6B68A" stroke={INK} strokeWidth="2" />
          <line x1="58" y1="50" x2="62" y2="50" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M32,48 Q40,44 42,50" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M78,50 Q80,44 88,48" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Eyes ── */}
      {char.outfit === "monk" ? (
        // Monk always shows peaceful closed-eye arcs
        <>
          <path d="M44,50 Q50,45 56,50" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M64,50 Q70,45 76,50" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : char.eye === "default" ? (
        <>
          <circle cx="50" cy="50" r="5.5" fill={INK} />
          <circle cx="70" cy="50" r="5.5" fill={INK} />
          <circle cx="51.8" cy="48.2" r="2" fill="white" />
          <circle cx="71.8" cy="48.2" r="2" fill="white" />
        </>
      ) : char.eye === "star" ? (
        <>
          <text x="43" y="60" fontSize="14" fill={INK}>★</text>
          <text x="63" y="60" fontSize="14" fill={INK}>★</text>
        </>
      ) : char.eye === "sun" ? (
        <>
          <path d="M44 52 Q50 47 56 52" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M64 52 Q70 47 76 52" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : null}

      {/* Necromancer spectral eye glow */}
      {char.outfit === "necromancer" && (
        <>
          <circle cx="50" cy="50" r="7" fill="none" stroke="#7C3AED" strokeWidth="2" opacity="0.85" />
          <circle cx="70" cy="50" r="7" fill="none" stroke="#7C3AED" strokeWidth="2" opacity="0.85" />
        </>
      )}

      {/* ── Mouth (suppressed by dwarf beard or mustache extra) ── */}
      {char.outfit !== "dwarf" && char.extra !== "mustache" && (
        <path d="M49 66 Q60 76 71 66" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* ── Extras (only when no outfit is active) ── */}
      {!hasOutfit && (
        <>
          {char.extra === "bow" && (
            <>
              <path d="M72 27 Q80 21 82 29 Q80 37 72 29Z" fill="#F0A6A0" stroke={INK} strokeWidth="1.5" />
              <path d="M72 29 Q64 21 62 29 Q64 37 72 29Z" fill="#F0A6A0" stroke={INK} strokeWidth="1.5" />
              <circle cx="72" cy="29" r="3.5" fill="#F4D34E" stroke={INK} strokeWidth="1.5" />
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
            <>
              <rect x="40" y="44" width="18" height="13" rx="5" fill="white" stroke={INK} strokeWidth="2.2" />
              <rect x="62" y="44" width="18" height="13" rx="5" fill="white" stroke={INK} strokeWidth="2.2" />
              <line x1="58" y1="50" x2="62" y2="50" stroke={INK} strokeWidth="2" strokeLinecap="round" />
              <line x1="45" y1="47" x2="45" y2="54" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="50" y1="47" x2="50" y2="54" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="67" y1="47" x2="67" y2="54" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="72" y1="47" x2="72" y2="54" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {char.extra === "mustache" && (
            <>
              <path d="M45 66 Q52 61 60 64 Q68 61 75 66" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M51 72 Q60 80 69 72" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </>
          )}
        </>
      )}

      {/* ── Hat (only when no outfit is active) ── */}
      {!hasOutfit && (
        <>
          {char.hat === "cap" && (
            <>
              <ellipse cx="60" cy="19" rx="36" ry="7.5" fill="#C8922A" stroke={INK} strokeWidth="2.2" />
              <path d="M28,19 Q30,4 60,4 Q90,4 92,19" fill="#E0A830" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M30,19 Q32,13 60,13 Q88,13 90,19" stroke="#8B5E0A" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
          {char.hat === "party" && (
            <>
              <polygon points="60,6 40,32 80,32" fill="#F0A6A0" stroke={INK} strokeWidth="2" />
              <circle cx="60" cy="6" r="4" fill="#F4D34E" stroke={INK} strokeWidth="1.5" />
              <circle cx="54" cy="22" r="2.5" fill="#7B6BE6" opacity="0.85" />
              <circle cx="65" cy="15" r="2" fill="white" opacity="0.9" />
              <circle cx="68" cy="25" r="2" fill="#C7E9D4" opacity="0.85" />
            </>
          )}
          {char.hat === "crown" && (
            <>
              <path d="M36,34 L42,14 L52,26 L60,10 L68,26 L78,14 L84,34 Z" fill="#F4D34E" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              <circle cx="60" cy="18" r="3" fill="#F0A6A0" stroke={INK} strokeWidth="1" />
              <circle cx="44" cy="24" r="2.5" fill="#7B6BE6" stroke={INK} strokeWidth="1" />
              <circle cx="76" cy="24" r="2.5" fill="#C7E9D4" stroke={INK} strokeWidth="1" />
            </>
          )}
        </>
      )}

      {/* ══ OUTFIT HEADGEAR ══ */}

      {char.outfit === "knight" && (
        <>
          <ellipse cx="60" cy="22" rx="26" ry="22" fill="#9CA3AF" stroke={INK} strokeWidth="2" />
          <rect x="34" y="22" width="8" height="18" rx="3" fill="#9CA3AF" stroke={INK} strokeWidth="1.5" />
          <rect x="78" y="22" width="8" height="18" rx="3" fill="#9CA3AF" stroke={INK} strokeWidth="1.5" />
          <rect x="42" y="24" width="36" height="8" rx="2" fill={INK} fillOpacity="0.75" />
          <path d="M48,10 Q55,6 62,8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M58,2 Q54,-4 50,2 Q55,6 60,0Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          <path d="M60,0 Q60,-6 60,0 Q62,-4 64,2 Q60,6 60,0Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          <path d="M62,2 Q66,-4 70,2 Q65,6 60,0Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
        </>
      )}

      {char.outfit === "wizard" && (
        <>
          <ellipse cx="60" cy="30" rx="30" ry="7" fill="#5B21B6" stroke={INK} strokeWidth="2" />
          <path d="M34,30 Q38,10 60,2 Q82,10 86,30Z" fill="#7C3AED" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M34,30 Q60,24 86,30" stroke="#4C1D95" strokeWidth="3" fill="none" />
          <circle cx="55" cy="16" r="2.5" fill="#FCD34D" />
          <circle cx="66" cy="12" r="2" fill="#FCD34D" />
          <circle cx="72" cy="22" r="1.8" fill="#FCD34D" />
          <circle cx="48" cy="23" r="1.8" fill="#FCD34D" />
          <circle cx="60" cy="3" r="3" fill="#FCD34D" opacity="0.9" />
        </>
      )}

      {char.outfit === "elf" && (
        <>
          <path d="M22,46 Q16,38 20,30 Q26,34 28,42Z" fill={fill} stroke={INK} strokeWidth="1.5" />
          <path d="M98,46 Q104,38 100,30 Q94,34 92,42Z" fill={fill} stroke={INK} strokeWidth="1.5" />
          <path d="M36,24 Q44,18 52,22" stroke="#4D7C0F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="38" cy="22" rx="5" ry="3" fill="#65A30D" stroke="#4D7C0F" strokeWidth="1" transform="rotate(-20,38,22)" />
          <ellipse cx="44" cy="18" rx="5" ry="3" fill="#65A30D" stroke="#4D7C0F" strokeWidth="1" transform="rotate(-10,44,18)" />
          <ellipse cx="51" cy="20" rx="5" ry="3" fill="#65A30D" stroke="#4D7C0F" strokeWidth="1" transform="rotate(10,51,20)" />
          <path d="M84,24 Q76,18 68,22" stroke="#4D7C0F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="82" cy="22" rx="5" ry="3" fill="#65A30D" stroke="#4D7C0F" strokeWidth="1" transform="rotate(20,82,22)" />
          <ellipse cx="76" cy="18" rx="5" ry="3" fill="#65A30D" stroke="#4D7C0F" strokeWidth="1" transform="rotate(10,76,18)" />
          <ellipse cx="69" cy="20" rx="5" ry="3" fill="#65A30D" stroke="#4D7C0F" strokeWidth="1" transform="rotate(-10,69,20)" />
          <circle cx="60" cy="18" r="4" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
        </>
      )}

      {char.outfit === "dwarf" && (
        <>
          <ellipse cx="60" cy="20" rx="26" ry="20" fill="#6B7280" stroke={INK} strokeWidth="2" />
          <path d="M36,24 Q26,10 30,2 Q34,8 38,18Z" fill="#9CA3AF" stroke={INK} strokeWidth="1.5" />
          <path d="M84,24 Q94,10 90,2 Q86,8 82,18Z" fill="#9CA3AF" stroke={INK} strokeWidth="1.5" />
          <rect x="34" y="34" width="52" height="6" rx="3" fill="#6B7280" stroke={INK} strokeWidth="1.5" />
          <circle cx="44" cy="18" r="2.5" fill="#9CA3AF" stroke={INK} strokeWidth="1" />
          <circle cx="60" cy="12" r="2.5" fill="#9CA3AF" stroke={INK} strokeWidth="1" />
          <circle cx="76" cy="18" r="2.5" fill="#9CA3AF" stroke={INK} strokeWidth="1" />
          <path d="M46,8 Q54,4 62,6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        </>
      )}

      {char.outfit === "ranger" && (
        <>
          <path d="M32,28 Q34,14 60,10 Q86,14 88,28 Q80,22 60,20 Q40,22 32,28Z" fill="#365314" stroke={INK} strokeWidth="1.5" />
          <path d="M32,28 Q28,40 30,52 Q36,50 36,38 Q44,30 60,28 Q76,30 84,38 Q84,50 90,52 Q92,40 88,28 Q76,22 60,22 Q44,22 32,28Z" fill="#4D7C0F" stroke={INK} strokeWidth="2" />
          <path d="M36,38 Q38,26 60,24 Q82,26 84,38" stroke="#65A30D" strokeWidth="1.5" fill="none" />
        </>
      )}

      {char.outfit === "thief" && (
        <>
          <path d="M30,26 Q26,40 28,54 Q34,52 34,40 Q42,28 60,26 Q78,28 86,40 Q86,52 92,54 Q94,40 90,26 Q76,18 60,18 Q44,18 30,26Z" fill="#1E2A4A" stroke={INK} strokeWidth="2" />
          <ellipse cx="60" cy="44" rx="22" ry="12" fill="#0F172A" fillOpacity="0.25" />
          <path d="M36,40 Q40,28 60,26 Q80,28 84,40" stroke="#374151" strokeWidth="1.5" fill="none" />
        </>
      )}

      {char.outfit === "alchemist" && (
        <>
          <path d="M44,72 Q60,68 76,72" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="46" y="73" width="28" height="14" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
        </>
      )}

      {char.outfit === "monk" && (
        <>
          <path d="M46,80 Q60,76 74,80 Q70,90 60,92 Q50,90 46,80Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <path d="M56,80 Q60,84 64,80" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      {char.outfit === "bard" && (
        <>
          <ellipse cx="60" cy="24" rx="38" ry="8" fill="#7F1D1D" stroke={INK} strokeWidth="2" />
          <path d="M34,24 Q36,6 60,4 Q84,6 86,24Z" fill="#991B1B" stroke={INK} strokeWidth="2" />
          <path d="M34,24 Q60,18 86,24" stroke="#B45309" strokeWidth="2.5" fill="none" />
          <path d="M82,20 Q96,10 100,0 Q92,4 88,14 Q90,8 88,4 Q84,12 82,20Z" fill="#D97706" stroke="#92400E" strokeWidth="1" />
        </>
      )}

      {char.outfit === "shaman" && (
        <>
          <rect x="36" y="24" width="48" height="8" rx="3" fill="#92400E" stroke={INK} strokeWidth="1.5" />
          <path d="M60,24 Q56,8 58,0 Q60,6 62,0 Q64,8 60,24Z" fill="#F5F5F4" stroke="#A8A29E" strokeWidth="1" />
          <path d="M60,24 Q58,8 60,2" stroke="#78716C" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M52,26 Q44,12 42,4 Q46,10 50,6 Q52,14 52,26Z" fill="#D6D3D1" stroke="#A8A29E" strokeWidth="1" />
          <path d="M44,26 Q34,14 30,8 Q36,12 40,10 Q42,18 44,26Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
          <path d="M68,26 Q76,12 78,4 Q74,10 70,6 Q68,14 68,26Z" fill="#D6D3D1" stroke="#A8A29E" strokeWidth="1" />
          <path d="M76,26 Q86,14 90,8 Q84,12 80,10 Q78,18 76,26Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
          <path d="M58,2 Q60,0 62,2" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M42,6 Q44,4 46,6" stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M78,4 Q76,2 74,4" stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="28" r="4" fill="#F5F5F4" stroke={INK} strokeWidth="1.5" />
          <circle cx="58.5" cy="27" r="1" fill={INK} />
          <circle cx="61.5" cy="27" r="1" fill={INK} />
          <path d="M58,30 Q60,32 62,30" stroke={INK} strokeWidth="1" strokeLinecap="round" fill="none" />
        </>
      )}

      {char.outfit === "orc" && (
        <>
          <path d="M52,18 Q50,6 54,0 Q56,8 56,16Z" fill="#374151" stroke={INK} strokeWidth="1" />
          <path d="M57,16 Q56,4 60,0 Q64,4 63,16Z" fill="#1F2937" stroke={INK} strokeWidth="1" />
          <path d="M62,16 Q64,4 68,0 Q68,8 66,16Z" fill="#374151" stroke={INK} strokeWidth="1" />
          <path d="M46,20 Q46,10 50,6 Q50,14 50,20Z" fill="#4B5563" stroke={INK} strokeWidth="1" />
          <path d="M70,20 Q70,10 74,6 Q72,14 70,20Z" fill="#4B5563" stroke={INK} strokeWidth="1" />
        </>
      )}

      {char.outfit === "necromancer" && (
        <>
          <path d="M32,26 Q28,36 30,48 Q36,46 36,36 Q44,26 60,24 Q76,26 84,36 Q84,46 90,48 Q92,36 88,26 Q76,16 60,16 Q44,16 32,26Z" fill="#1F2937" stroke={INK} strokeWidth="2" />
          <circle cx="60" cy="30" r="6" fill="#F9FAFB" stroke={INK} strokeWidth="1.5" />
          <circle cx="57.5" cy="29" r="1.5" fill={INK} />
          <circle cx="62.5" cy="29" r="1.5" fill={INK} />
          <path d="M57,33 Q60,35 63,33" stroke={INK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M57,33 L57,35 M60,34 L60,36 M63,33 L63,35" stroke={INK} strokeWidth="1" strokeLinecap="round" />
          <path d="M36,36 Q40,26 60,24 Q80,26 84,36" stroke="#374151" strokeWidth="1.5" fill="none" />
        </>
      )}

      {/* ══ OUTFIT HELD ITEMS (front layer) ══ */}

      {char.outfit === "knight" && (
        <>
          {/* Sword — left side, raised diagonally */}
          <rect x="6" y="36" width="4" height="26" rx="1.5" fill="#D1D5DB" stroke={INK} strokeWidth="1.2" transform="rotate(-15,8,46)" />
          <rect x="2" y="54" width="14" height="3.5" rx="1.5" fill="#D97706" stroke={INK} strokeWidth="1.2" transform="rotate(-15,8,56)" />
          <rect x="7" y="58" width="3" height="8" rx="1" fill="#92400E" stroke={INK} strokeWidth="1" transform="rotate(-15,8,62)" />
          {/* Shield — right side */}
          <path d="M88,44 L100,44 Q106,44 106,52 L106,66 Q106,74 97,80 Q88,74 88,66 Z" fill="#D97706" stroke={INK} strokeWidth="2" />
          <path d="M94,48 L94,74" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M88,58 L106,58" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="97" cy="58" r="4" fill="#EF4444" stroke={INK} strokeWidth="1" />
        </>
      )}

      {char.outfit === "wizard" && (
        <>
          <rect x="10" y="32" width="4" height="58" rx="2" fill="#92400E" stroke={INK} strokeWidth="1.5" />
          <circle cx="12" cy="30" r="7" fill="#FCD34D" stroke="#D97706" strokeWidth="2" opacity="0.95" />
          <circle cx="12" cy="30" r="4" fill="white" opacity="0.5" />
        </>
      )}

      {char.outfit === "elf" && (
        <>
          {/* Bow — right side */}
          <path d="M94,34 Q106,54 94,74" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
          <line x1="94" y1="34" x2="94" y2="74" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2" />
          {/* Arrow */}
          <line x1="20" y1="52" x2="94" y2="54" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20,52 L24,49 L22,52 L24,55Z" fill="#6B7280" />
          {/* Quiver — left side */}
          <rect x="8" y="44" width="10" height="22" rx="3" fill="#92400E" stroke={INK} strokeWidth="1.5" />
          <line x1="10" y1="46" x2="10" y2="60" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="44" x2="13" y2="58" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {char.outfit === "dwarf" && (
        <>
          <rect x="10" y="56" width="4" height="36" rx="2" fill="#92400E" stroke={INK} strokeWidth="1.5" />
          <rect x="4" y="44" width="16" height="20" rx="3" fill="#6B7280" stroke={INK} strokeWidth="2" />
          <rect x="6" y="46" width="12" height="4" rx="1" fill="#9CA3AF" opacity="0.6" />
        </>
      )}

      {char.outfit === "ranger" && (
        <>
          <path d="M96,36 Q108,56 96,76" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
          <line x1="96" y1="36" x2="96" y2="76" stroke="#D6D3D1" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2" />
          <line x1="22" y1="56" x2="96" y2="56" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <path d="M22,56 L28,52 L26,56 L28,60Z" fill="#6B7280" />
        </>
      )}

      {char.outfit === "thief" && (
        <>
          <rect x="10" y="44" width="3.5" height="20" rx="1.5" fill="#D1D5DB" stroke={INK} strokeWidth="1.2" />
          <rect x="7" y="60" width="10" height="3" rx="1.5" fill="#1F2937" stroke={INK} strokeWidth="1" />
          <rect x="9" y="63" width="5" height="8" rx="1" fill="#374151" stroke={INK} strokeWidth="1" />
        </>
      )}

      {char.outfit === "alchemist" && (
        <>
          {/* Flask — right side */}
          <path d="M96,62 Q90,64 90,72 Q90,80 96,82 Q102,80 102,72 Q102,64 96,62Z" fill="#6EE7B7" stroke={INK} strokeWidth="1.5" />
          <rect x="93" y="52" width="6" height="12" rx="2" fill="#D6D3D1" stroke={INK} strokeWidth="1.5" />
          <circle cx="96" cy="52" r="3" fill="#F5F5F4" stroke={INK} strokeWidth="1" />
          {/* Test tube — left side */}
          <rect x="12" y="50" width="5" height="22" rx="2.5" fill="#FDE68A" stroke={INK} strokeWidth="1.5" />
          <path d="M12,68 Q14.5,74 17,68" fill="#FCD34D" />
        </>
      )}

      {char.outfit === "monk" && (
        // Prayer bead rosary hanging from left arm
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
            const angle = (i / 11) * Math.PI * 2 - Math.PI / 2;
            const bx = 14 + Math.cos(angle) * 10;
            const by = 75 + Math.sin(angle) * 10;
            return <circle key={i} cx={bx} cy={by} r="2.5" fill="#92400E" stroke={INK} strokeWidth="0.8" />;
          })}
          <line x1="14" y1="86" x2="14" y2="95" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="90" x2="18" y2="90" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {char.outfit === "bard" && (
        <>
          {/* Lute — right side */}
          <path d="M94,60 Q88,56 86,64 Q86,74 92,78 Q98,74 98,64 Q96,56 94,60Z" fill="#D97706" stroke={INK} strokeWidth="1.5" />
          <rect x="93" y="40" width="4" height="22" rx="2" fill="#92400E" stroke={INK} strokeWidth="1.2" />
          <line x1="90" y1="62" x2="90" y2="76" stroke="#F5F5F4" strokeWidth="1" />
          <line x1="93" y1="61" x2="93" y2="77" stroke="#F5F5F4" strokeWidth="1" />
          <line x1="96" y1="62" x2="96" y2="76" stroke="#F5F5F4" strokeWidth="1" />
          <text x="100" y="50" fontSize="10" fill="#7C3AED" opacity="0.85">♪</text>
          <text x="106" y="42" fontSize="8" fill="#7C3AED" opacity="0.7">♩</text>
        </>
      )}

      {char.outfit === "shaman" && (
        <>
          <rect x="8" y="60" width="4" height="24" rx="2" fill="#92400E" stroke={INK} strokeWidth="1.5" />
          <path d="M4,52 Q4,44 10,44 Q16,44 16,52 Q16,60 10,60 Q4,60 4,52Z" fill="#D97706" stroke={INK} strokeWidth="1.5" />
          <circle cx="8" cy="50" r="1.5" fill="#FCD34D" />
          <circle cx="12" cy="54" r="1.5" fill="#FCD34D" />
          <circle cx="7" cy="56" r="1.5" fill="#FCD34D" />
        </>
      )}

      {char.outfit === "orc" && (
        <>
          <rect x="94" y="54" width="4" height="34" rx="2" fill="#92400E" stroke={INK} strokeWidth="1.5" />
          <path d="M92,38 Q86,42 88,54 Q94,58 100,54 Q104,44 98,38Z" fill="#6B7280" stroke={INK} strokeWidth="2" />
          <path d="M90,42 Q88,48 90,52" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {char.outfit === "necromancer" && (
        <>
          <rect x="8" y="36" width="4" height="58" rx="2" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <circle cx="10" cy="32" r="8" fill="#F9FAFB" stroke="#9CA3AF" strokeWidth="1.5" />
          <circle cx="7.5" cy="30" r="1.8" fill="#6B7280" />
          <circle cx="12.5" cy="30" r="1.8" fill="#6B7280" />
          <path d="M7,34 Q10,36 13,34" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M7,34 L7,36 M10,35 L10,37 M13,34 L13,36" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
