"use client";

import type { ReactNode } from "react";

type FantasyGuildCharacterProps = {
  outfit: string;
  mode?: "coin" | "gear" | "hybrid";
  skinColor?: string;
  size?: number;
};

const INK = "var(--color-ink)";
const COIN = "var(--color-coin)";
const COIN_DK = "var(--color-coin-dk)";
const CREAM = "var(--color-cream-card)";
const LAV = "var(--color-lav-pale)";
const PURPLE = "var(--color-purple)";
const MINT = "var(--color-mint)";
const PEACH = "var(--color-peach)";
const CORAL = "var(--color-coral)";
const GREEN = "var(--color-green)";

export function FantasyGuildCharacter({
  outfit,
  mode = "coin",
  skinColor = COIN,
  size = 132,
}: FantasyGuildCharacterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {mode === "gear" ? (
        <GearKit outfit={outfit} />
      ) : (
        <>
          {mode === "hybrid" && <FloatingGear outfit={outfit} />}
          <CoinBody outfit={outfit} skinColor={skinColor} />
          <WornGear outfit={outfit} />
        </>
      )}
    </svg>
  );
}

function CoinBody({ outfit, skinColor }: { outfit: string; skinColor: string }) {
  const expression = expressionFor(outfit);

  return (
    <>
      <line x1="66" y1="112" x2="56" y2="148" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <line x1="94" y1="112" x2="104" y2="148" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="52" cy="148" rx="12" ry="6" fill={INK} />
      <ellipse cx="108" cy="148" rx="12" ry="6" fill={INK} />
      <line x1="37" y1="82" x2="18" y2="70" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <line x1="123" y1="82" x2="142" y2="70" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="80" cy="76" r="50" fill={skinColor} stroke={INK} strokeWidth="5" />
      <circle cx="80" cy="76" r="39" fill={COIN_DK} fillOpacity="0.28" stroke={INK} strokeWidth="2" />
      <ellipse cx="55" cy="89" rx="9" ry="6" fill={CORAL} fillOpacity="0.75" />
      <ellipse cx="105" cy="89" rx="9" ry="6" fill={CORAL} fillOpacity="0.75" />
      {expression}
    </>
  );
}

function expressionFor(outfit: string) {
  if (outfit === "wizard") {
    return (
      <>
        <path d="M56 66 Q63 59 70 66" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M90 66 Q97 59 104 66" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M62 93 Q80 107 98 93" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      </>
    );
  }
  if (outfit === "orc") {
    return (
      <>
        <path d="M53 65 Q60 59 67 63" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M93 63 Q100 59 107 65" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M58 99 Q80 86 102 99" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M60 93 L67 107 L74 94" fill={CREAM} stroke={INK} strokeWidth="2" />
        <path d="M86 94 L93 107 L100 93" fill={CREAM} stroke={INK} strokeWidth="2" />
      </>
    );
  }
  if (outfit === "shaman") {
    return (
      <>
        <path d="M57 70 Q64 76 71 70" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M89 70 Q96 76 103 70" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M65 98 Q80 90 95 98" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      </>
    );
  }
  if (outfit === "monk") {
    return (
      <>
        <path d="M53 68 Q62 62 71 68" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M89 68 Q98 62 107 68" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M64 94 Q80 104 96 94" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      </>
    );
  }
  return (
    <>
      <circle cx="62" cy="71" r="7" fill={INK} />
      <circle cx="98" cy="71" r="7" fill={INK} />
      <circle cx="64" cy="68" r="2.5" fill={CREAM} />
      <circle cx="100" cy="68" r="2.5" fill={CREAM} />
      <path d="M62 96 Q80 111 98 96" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  );
}

function WornGear({ outfit }: { outfit: string }) {
  switch (outfit) {
    case "knight":
      return (
        <>
          <ellipse cx="80" cy="38" rx="38" ry="23" fill={LAV} stroke={INK} strokeWidth="4" />
          <rect x="43" y="39" width="74" height="18" rx="6" fill={LAV} stroke={INK} strokeWidth="4" />
          <rect x="55" y="45" width="50" height="9" rx="2" fill={INK} fillOpacity="0.72" />
          <path d="M73 13 Q58 4 50 16 Q64 22 80 18 Q94 22 110 16 Q100 4 87 13" fill={CORAL} stroke={INK} strokeWidth="3" />
          <Sword x={12} y={48} />
          <Shield x={113} y={79} />
        </>
      );
    case "wizard":
      return (
        <>
          <ellipse cx="80" cy="38" rx="48" ry="10" fill={PURPLE} stroke={INK} strokeWidth="4" />
          <path d="M39 39 Q48 11 79 3 Q113 11 121 39Z" fill={PURPLE} stroke={INK} strokeWidth="4" />
          <circle cx="68" cy="22" r="4" fill={COIN} />
          <circle cx="86" cy="16" r="3" fill={COIN} />
          <circle cx="100" cy="30" r="3" fill={COIN} />
          <Staff x={132} y={43} />
          <Book x={19} y={85} />
        </>
      );
    case "shaman":
      return (
        <>
          <FeatherCrown />
          <Mask x={18} y={89} />
          <Rattle x={135} y={61} />
          <Pouch x={119} y={105} />
        </>
      );
    case "orc":
      return (
        <>
          <path d="M64 30 Q67 8 75 2 Q79 17 78 31Z" fill={INK} stroke={INK} strokeWidth="2" />
          <path d="M79 29 Q82 7 92 1 Q94 18 91 32Z" fill={INK} stroke={INK} strokeWidth="2" />
          <Axe x={121} y={46} />
          <Flag x={133} y={80} />
        </>
      );
    case "elf":
      return (
        <>
          <path d="M32 77 Q15 54 28 38 Q39 51 44 69Z" fill={COIN} stroke={INK} strokeWidth="3" />
          <path d="M128 77 Q145 54 132 38 Q121 51 116 69Z" fill={COIN} stroke={INK} strokeWidth="3" />
          <LeafCrown />
          <Bow x={119} y={67} />
          <Quiver x={24} y={92} />
        </>
      );
    case "dwarf":
      return (
        <>
          <ellipse cx="80" cy="36" rx="37" ry="23" fill={LAV} stroke={INK} strokeWidth="4" />
          <path d="M45 44 Q32 20 39 6 Q48 20 53 39Z" fill={LAV} stroke={INK} strokeWidth="3" />
          <path d="M115 44 Q128 20 121 6 Q112 20 107 39Z" fill={LAV} stroke={INK} strokeWidth="3" />
          <path d="M48 84 Q50 116 80 132 Q110 116 112 84 Q94 95 80 94 Q66 95 48 84Z" fill={PEACH} stroke={INK} strokeWidth="4" />
          <path d="M58 91 Q58 115 66 122 M80 92 L80 131 M102 91 Q102 115 94 122" stroke={INK} strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
          <Hammer x={125} y={70} />
        </>
      );
    case "thief":
      return (
        <>
          <path d="M38 47 Q45 19 80 15 Q115 19 122 47 Q112 43 104 58 Q96 48 80 48 Q64 48 56 58 Q48 43 38 47Z" fill={INK} stroke={INK} strokeWidth="4" />
          <path d="M42 54 Q80 30 118 54" stroke={LAV} strokeWidth="4" strokeLinecap="round" />
          <Dagger x={20} y={82} />
          <Keys x={125} y={91} />
        </>
      );
    case "alchemist":
      return (
        <>
          <circle cx="61" cy="69" r="14" fill={CREAM} stroke={INK} strokeWidth="4" />
          <circle cx="99" cy="69" r="14" fill={CREAM} stroke={INK} strokeWidth="4" />
          <line x1="75" y1="69" x2="85" y2="69" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <rect x="56" y="104" width="48" height="31" rx="7" fill={PEACH} stroke={INK} strokeWidth="4" />
          <Flask x={20} y={85} />
          <Flask x={127} y={89} />
        </>
      );
    case "monk":
      return (
        <>
          <path d="M36 96 Q48 128 80 132 Q112 128 124 96 Q96 82 80 82 Q64 82 36 96Z" fill={CORAL} stroke={INK} strokeWidth="4" />
          <Beads />
          <Staff x={130} y={67} />
        </>
      );
    case "ranger":
      return (
        <>
          <path d="M33 49 Q42 21 80 19 Q118 21 127 49 Q113 44 105 62 Q94 52 80 52 Q66 52 55 62 Q47 44 33 49Z" fill={GREEN} stroke={INK} strokeWidth="4" />
          <Bow x={122} y={54} />
          <Quiver x={21} y={91} />
          <path d="M56 101 Q80 111 104 101" stroke={GREEN} strokeWidth="7" strokeLinecap="round" />
        </>
      );
    case "necromancer":
      return (
        <>
          <path d="M32 42 Q47 9 80 7 Q113 9 128 42 Q119 106 80 134 Q41 106 32 42Z" fill={INK} stroke={INK} strokeWidth="4" />
          <circle cx="80" cy="70" r="30" fill={CREAM} stroke={INK} strokeWidth="4" />
          <circle cx="68" cy="66" r="8" fill={INK} />
          <circle cx="92" cy="66" r="8" fill={INK} />
          <path d="M68 88 Q80 96 92 88" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <SkullStaff x={18} y={51} />
        </>
      );
    case "bard":
      return (
        <>
          <ellipse cx="80" cy="40" rx="50" ry="10" fill={CORAL} stroke={INK} strokeWidth="4" />
          <path d="M43 40 Q50 13 80 10 Q110 13 117 40Z" fill={CORAL} stroke={INK} strokeWidth="4" />
          <path d="M112 33 Q133 19 142 5 Q125 8 119 27Z" fill={PEACH} stroke={INK} strokeWidth="3" />
          <Lute x={104} y={88} />
          <text x="132" y="65" fill={INK} fontSize="18" fontFamily="var(--font-display)">♪</text>
          <text x="17" y="53" fill={INK} fontSize="15" fontFamily="var(--font-display)">♬</text>
        </>
      );
    default:
      return null;
  }
}

function FloatingGear({ outfit }: { outfit: string }) {
  return (
    <g opacity="0.95">
      <GearKit outfit={outfit} compact />
    </g>
  );
}

function GearKit({ outfit, compact = false }: { outfit: string; compact?: boolean }) {
  const scale = compact ? 0.72 : 1;
  const origin = compact ? "translate(18 18)" : "";
  const items: Record<string, ReactNode> = {
    knight: (
      <>
        <Sword x={20} y={18} />
        <Shield x={82} y={30} />
        <Helmet x={48} y={16} />
      </>
    ),
    wizard: (
      <>
        <WizardHat x={45} y={3} />
        <Book x={25} y={78} />
        <Staff x={112} y={34} />
        <Flask x={104} y={100} />
      </>
    ),
    shaman: (
      <>
        <FeatherCrown />
        <Mask x={34} y={76} />
        <Rattle x={116} y={88} />
        <Pouch x={78} y={113} />
      </>
    ),
    orc: (
      <>
        <Axe x={29} y={22} />
        <Flag x={111} y={28} />
        <Horn x={56} y={96} />
      </>
    ),
    elf: (
      <>
        <LeafCrown />
        <Bow x={92} y={56} />
        <Quiver x={35} y={72} />
      </>
    ),
    dwarf: (
      <>
        <Hammer x={28} y={34} />
        <Hammer x={88} y={23} />
        <Pouch x={62} y={102} />
      </>
    ),
    thief: (
      <>
        <Dagger x={28} y={30} />
        <Dagger x={76} y={28} />
        <Keys x={94} y={74} />
        <Pouch x={44} y={105} />
      </>
    ),
    alchemist: (
      <>
        <Flask x={28} y={30} />
        <Flask x={92} y={34} />
        <rect x="50" y="80" width="58" height="51" rx="8" fill={PEACH} stroke={INK} strokeWidth="4" />
        <line x1="62" y1="96" x2="96" y2="96" stroke={INK} strokeWidth="3" />
      </>
    ),
    monk: (
      <>
        <Beads />
        <Staff x={123} y={37} />
        <Scroll x={34} y={111} />
      </>
    ),
    ranger: (
      <>
        <Bow x={73} y={28} />
        <Quiver x={37} y={76} />
        <Compass x={100} y={105} />
      </>
    ),
    necromancer: (
      <>
        <SkullStaff x={28} y={28} />
        <rect x="69" y="38" width="57" height="78" rx="8" fill={INK} stroke={INK} strokeWidth="4" />
        <circle cx="97" cy="70" r="17" fill={CREAM} stroke={INK} strokeWidth="3" />
        <circle cx="91" cy="68" r="4" fill={INK} />
        <circle cx="103" cy="68" r="4" fill={INK} />
      </>
    ),
    bard: (
      <>
        <Lute x={56} y={40} />
        <text x="120" y="37" fill={INK} fontSize="22" fontFamily="var(--font-display)">♪</text>
        <text x="24" y="92" fill={INK} fontSize="18" fontFamily="var(--font-display)">♬</text>
        <Scroll x={81} y={104} />
      </>
    ),
  };

  return (
    <g transform={`${origin} scale(${scale})`}>
      {items[outfit] ?? items.wizard}
    </g>
  );
}

function Sword({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-14 11 34)`}>
      <path d="M10 0 L18 43 L11 55 L4 43Z" fill={LAV} stroke={INK} strokeWidth="3" />
      <rect x="2" y="42" width="20" height="6" rx="3" fill={PEACH} stroke={INK} strokeWidth="3" />
      <rect x="8" y="48" width="7" height="19" rx="3" fill={PEACH} stroke={INK} strokeWidth="3" />
    </g>
  );
}

function Shield({ x, y }: { x: number; y: number }) {
  return (
    <path
      transform={`translate(${x} ${y})`}
      d="M0 0 L35 8 L31 49 Q18 61 5 49Z"
      fill={LAV}
      stroke={INK}
      strokeWidth="4"
    />
  );
}

function Helmet({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="34" cy="27" rx="32" ry="23" fill={LAV} stroke={INK} strokeWidth="4" />
      <rect x="8" y="31" width="52" height="13" rx="5" fill={INK} fillOpacity="0.7" />
    </g>
  );
}

function WizardHat({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="32" cy="48" rx="39" ry="9" fill={PURPLE} stroke={INK} strokeWidth="4" />
      <path d="M2 48 Q9 14 32 0 Q58 12 62 48Z" fill={PURPLE} stroke={INK} strokeWidth="4" />
      <circle cx="27" cy="23" r="4" fill={COIN} />
      <circle cx="43" cy="31" r="3" fill={COIN} />
    </g>
  );
}

function Staff({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="8" y1="18" x2="8" y2="86" stroke={PEACH} strokeWidth="6" strokeLinecap="round" />
      <circle cx="8" cy="12" r="10" fill={COIN} stroke={INK} strokeWidth="3" />
      <circle cx="8" cy="12" r="4" fill={CREAM} fillOpacity="0.7" />
    </g>
  );
}

function Book({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-8 25 19)`}>
      <rect x="0" y="0" width="48" height="38" rx="6" fill={CREAM} stroke={INK} strokeWidth="4" />
      <line x1="24" y1="4" x2="24" y2="34" stroke={INK} strokeWidth="2" />
      <path d="M8 10 H18 M8 18 H18 M30 10 H40 M30 18 H40" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function FeatherCrown() {
  const feathers = [26, 42, 58, 74, 90, 106, 122];
  return (
    <g>
      {feathers.map((x, i) => (
        <path
          key={x}
          d={`M${x} 45 Q${x - 8} ${14 + (i % 2) * 7} ${x + 4} 1 Q${x + 16} ${17 + (i % 2) * 5} ${x + 7} 48Z`}
          fill={i % 2 ? CREAM : PEACH}
          stroke={INK}
          strokeWidth="3"
        />
      ))}
      <rect x="37" y="45" width="86" height="12" rx="6" fill={PEACH} stroke={INK} strokeWidth="4" />
      <circle cx="52" cy="51" r="7" fill={COIN_DK} stroke={INK} strokeWidth="3" />
      <circle cx="108" cy="51" r="7" fill={COIN_DK} stroke={INK} strokeWidth="3" />
    </g>
  );
}

function Mask({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 H32 V42 Q16 54 0 42Z" fill={GREEN} stroke={INK} strokeWidth="3" />
      <circle cx="10" cy="17" r="4" fill={INK} />
      <circle cx="23" cy="17" r="4" fill={INK} />
      <path d="M8 33 Q16 26 24 33" stroke={INK} strokeWidth="3" fill="none" />
    </g>
  );
}

function Rattle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="8" y1="21" x2="8" y2="64" stroke={PEACH} strokeWidth="5" strokeLinecap="round" />
      <circle cx="8" cy="13" r="12" fill={COIN_DK} stroke={INK} strokeWidth="3" />
      <path d="M0 13 H16" stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Pouch({ x, y }: { x: number; y: number }) {
  return <path transform={`translate(${x} ${y})`} d="M8 0 Q24 7 22 29 Q15 38 4 29 Q0 8 8 0Z" fill={PEACH} stroke={INK} strokeWidth="3" />;
}

function Axe({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(14 14 33)`}>
      <line x1="14" y1="18" x2="14" y2="88" stroke={PEACH} strokeWidth="6" strokeLinecap="round" />
      <path d="M14 4 Q38 6 34 31 Q22 23 14 30 Q6 22 -6 31 Q-8 6 14 4Z" fill={LAV} stroke={INK} strokeWidth="4" />
    </g>
  );
}

function Flag({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="8" y1="0" x2="8" y2="68" stroke={PEACH} strokeWidth="5" strokeLinecap="round" />
      <path d="M8 3 H42 Q33 22 42 42 H8Z" fill={PEACH} stroke={INK} strokeWidth="3" />
    </g>
  );
}

function Horn({ x, y }: { x: number; y: number }) {
  return <path transform={`translate(${x} ${y})`} d="M0 31 Q34 13 66 0 Q62 32 21 45Z" fill={PEACH} stroke={INK} strokeWidth="4" />;
}

function LeafCrown() {
  return (
    <g>
      <path d="M38 43 Q56 22 80 32 Q104 22 122 43" stroke={GREEN} strokeWidth="6" strokeLinecap="round" fill="none" />
      {[48, 62, 98, 112].map((x, i) => (
        <ellipse key={x} cx={x} cy={35 - (i % 2) * 8} rx="11" ry="6" fill={MINT} stroke={GREEN} strokeWidth="3" transform={`rotate(${i < 2 ? -22 : 22} ${x} ${35 - (i % 2) * 8})`} />
      ))}
    </g>
  );
}

function Bow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M14 0 Q43 32 14 64" stroke={PEACH} strokeWidth="6" strokeLinecap="round" fill="none" />
      <line x1="14" y1="0" x2="14" y2="64" stroke={CREAM} strokeWidth="2" />
      <line x1="-42" y1="32" x2="33" y2="32" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M-42 32 L-31 26 L-34 32 L-31 38Z" fill={GREEN} stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Quiver({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-14 13 25)`}>
      <rect x="0" y="13" width="25" height="55" rx="7" fill={PEACH} stroke={INK} strokeWidth="4" />
      <path d="M5 6 L5 24 M13 0 L13 24 M21 7 L21 24" stroke={GREEN} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Hammer({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-16 15 30)`}>
      <line x1="15" y1="22" x2="15" y2="76" stroke={PEACH} strokeWidth="6" strokeLinecap="round" />
      <rect x="0" y="6" width="30" height="26" rx="5" fill={LAV} stroke={INK} strokeWidth="4" />
    </g>
  );
}

function Dagger({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-22 8 25)`}>
      <path d="M8 0 L15 34 L8 45 L1 34Z" fill={LAV} stroke={INK} strokeWidth="3" />
      <rect x="-1" y="32" width="18" height="5" rx="2" fill={INK} />
      <rect x="5" y="37" width="6" height="16" rx="3" fill={PEACH} stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Keys({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="14" cy="12" r="10" fill="none" stroke={INK} strokeWidth="4" />
      <line x1="14" y1="22" x2="14" y2="55" stroke={INK} strokeWidth="4" />
      <path d="M14 42 H29 M14 51 H24" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Flask({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="11" y="0" width="14" height="22" rx="5" fill={CREAM} stroke={INK} strokeWidth="3" />
      <path d="M18 20 Q3 35 7 54 Q18 66 30 54 Q34 35 18 20Z" fill={MINT} stroke={INK} strokeWidth="3" />
      <path d="M8 48 Q18 41 30 48" stroke={GREEN} strokeWidth="3" />
    </g>
  );
}

function Beads() {
  return (
    <g>
      {Array.from({ length: 13 }).map((_, i) => {
        const angle = (i / 13) * Math.PI * 1.65 + 0.82;
        const x = 80 + Math.cos(angle) * 48;
        const y = 72 + Math.sin(angle) * 48;
        return <circle key={i} cx={x} cy={y} r="5" fill={PEACH} stroke={INK} strokeWidth="2" />;
      })}
    </g>
  );
}

function Scroll({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-8 23 11)`}>
      <rect x="0" y="0" width="46" height="24" rx="6" fill={CREAM} stroke={INK} strokeWidth="3" />
      <line x1="12" y1="8" x2="35" y2="8" stroke={INK} strokeWidth="2" />
      <line x1="12" y1="15" x2="30" y2="15" stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="19" cy="19" r="18" fill={CREAM} stroke={INK} strokeWidth="4" />
      <path d="M19 5 L26 24 L10 31Z" fill={CORAL} stroke={INK} strokeWidth="2" />
    </g>
  );
}

function SkullStaff({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="16" y1="33" x2="16" y2="101" stroke={PEACH} strokeWidth="6" strokeLinecap="round" />
      <circle cx="16" cy="18" r="17" fill={CREAM} stroke={INK} strokeWidth="4" />
      <circle cx="10" cy="16" r="4" fill={INK} />
      <circle cx="22" cy="16" r="4" fill={INK} />
      <path d="M10 27 Q16 31 22 27" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Lute({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(12 17 30)`}>
      <ellipse cx="22" cy="54" rx="22" ry="28" fill={PEACH} stroke={INK} strokeWidth="4" />
      <rect x="18" y="0" width="8" height="47" rx="4" fill={PEACH} stroke={INK} strokeWidth="3" />
      <circle cx="22" cy="54" r="8" fill={INK} />
      <line x1="16" y1="22" x2="16" y2="78" stroke={CREAM} strokeWidth="2" />
      <line x1="22" y1="22" x2="22" y2="78" stroke={CREAM} strokeWidth="2" />
      <line x1="28" y1="22" x2="28" y2="78" stroke={CREAM} strokeWidth="2" />
    </g>
  );
}
