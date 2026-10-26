import { cn } from "@/lib/utils";
import {
  upgradeXpRequirement,
  type GuildAccessory,
  type GuildUpgrade,
} from "@/lib/guild-loadouts";

export function AccessoryChips({
  items,
  className,
}: {
  items: GuildAccessory[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <span
          key={`${item.slot}-${item.name}`}
          className="rounded-pill border-2 border-ink bg-green-tint px-3 py-1 font-body text-xs font-bold text-ink"
        >
          {item.slot}: {item.name}
        </span>
      ))}
    </div>
  );
}

export function AccessoryImage({
  slot,
  name,
}: {
  slot: GuildAccessory["slot"] | GuildUpgrade["slot"];
  name: string;
}) {
  const title = `${slot}: ${name}`;
  const key = name.toLowerCase();

  return (
    <span className="mb-3 flex h-20 w-full items-center justify-center rounded-control border-2 border-ink bg-cream-card">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={title}
        role="img"
      >
        {renderAccessoryArt(slot, key)}
      </svg>
    </span>
  );
}

export function renderAccessoryArt(
  slot: GuildAccessory["slot"] | GuildUpgrade["slot"],
  key: string
) {
  if (key.includes("goggle")) return <GogglesArt upgraded={key.includes("crystal")} />;
  if (key.includes("helm")) return <HelmArt plume={key.includes("plumed")} forge={key.includes("forge")} />;
  if (key.includes("crown")) return <CrownArt leaf={key.includes("leaf")} eagle={key.includes("eagle")} />;
  if (key.includes("hood")) return <HoodArt shadow={key.includes("shadow") || key.includes("night")} />;
  if (key.includes("hat") || key.includes("cap") || key.includes("band") || key.includes("beads")) {
    return (
      <HatArt
        stars={key.includes("star")}
        feather={key.includes("feather") || key.includes("encore")}
        bone={key.includes("bone")}
        beads={key.includes("beads")}
        mohawk={key.includes("mohawk")}
      />
    );
  }
  if (key.includes("wand")) return <WandArt glow={key.includes("glow") || key.includes("fizz")} />;
  if (key.includes("staff")) return <StaffArt skull={key.includes("skull") || key.includes("bone")} balance={key.includes("balance")} />;
  if (key.includes("sword")) return <SwordArt lion={key.includes("lion")} wooden={key.includes("wooden")} />;
  if (key.includes("axe")) return <AxeArt boss={key.includes("boss")} foam={key.includes("foam")} />;
  if (key.includes("bow")) return <BowArt long={key.includes("long") || key.includes("forest")} practice={key.includes("practice")} />;
  if (key.includes("hammer")) return <HammerArt rune={key.includes("rune")} toy={key.includes("toy")} />;
  if (key.includes("dagger")) return <DaggerArt sneak={key.includes("sneak")} />;
  if (key.includes("lute")) return <LuteArt golden={key.includes("golden")} tiny={key.includes("tiny")} />;
  if (key.includes("rattle")) return <RattleArt thunder={key.includes("thunder")} />;
  if (key.includes("flask")) return <FlaskArt bubble={key.includes("bubble")} />;
  if (key.includes("robe")) return <RobeArt moon={key.includes("moon")} shadow={key.includes("shadow")} />;
  if (key.includes("plate") || key.includes("shield")) return <ShieldArt plate={key.includes("plate")} />;
  if (key.includes("cloak") || key.includes("cape")) return <CloakArt forest={key.includes("forest") || key.includes("vine")} spirit={key.includes("spirit")} />;
  if (key.includes("vest") || key.includes("apron") || key.includes("sash")) return <VestArt lab={key.includes("lab")} sash={key.includes("sash")} />;
  if (key.includes("boots")) return <BootsArt stone={key.includes("stone")} />;
  if (key.includes("book")) return <BookArt spooky={key.includes("spooky")} spell={key.includes("spell")} />;
  if (key.includes("pouch")) return <PouchArt pebble={key.includes("pebble")} />;
  if (key.includes("banner")) return <BannerArt />;
  if (key.includes("quiver")) return <QuiverArt />;
  if (key.includes("keys")) return <KeysArt />;
  if (key.includes("scroll")) return <ScrollArt song={key.includes("song")} />;
  if (key.includes("compass") || key.includes("charm")) return <CompassArt charm={key.includes("charm")} />;

  if (slot === "Armor") return <ShieldArt />;
  if (slot === "Tool") return <FlaskArt />;
  if (slot === "Trinket") return <CoinCharmArt />;
  if (slot === "Weapon") return <SwordArt />;
  return <HatArt />;
}

export function HatArt({
  stars = false,
  feather = false,
  bone = false,
  beads = false,
  mohawk = false,
}: {
  stars?: boolean;
  feather?: boolean;
  bone?: boolean;
  beads?: boolean;
  mohawk?: boolean;
}) {
  return (
    <>
      {mohawk && <path d="M26 28 Q35 4 46 28" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="3" />}
      {beads ? (
        <g>
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx={18 + i * 4.5} cy={38 + Math.sin(i) * 8} r="4" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="2" />
          ))}
        </g>
      ) : (
        <>
          <ellipse cx="36" cy="48" rx="26" ry="7" fill="var(--color-purple)" stroke="var(--color-ink)" strokeWidth="3" />
          <path d="M14 48 Q19 22 36 10 Q56 21 58 48Z" fill={bone ? "var(--color-peach)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
        </>
      )}
      {stars && (
        <>
          <circle cx="31" cy="28" r="3" fill="var(--color-coin)" />
          <circle cx="44" cy="38" r="2.5" fill="var(--color-coin)" />
        </>
      )}
      {feather && <path d="M49 18 Q66 7 63 27 Q55 29 49 18Z" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="2" />}
      {bone && <path d="M27 34 H47" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />}
    </>
  );
}

export function HelmArt({ plume = false, forge = false }: { plume?: boolean; forge?: boolean }) {
  return (
    <>
      {plume && <path d="M32 9 Q18 0 14 14 Q27 20 40 15 Q50 20 62 14 Q58 0 44 9" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="3" />}
      <ellipse cx="36" cy="35" rx="26" ry="22" fill={forge ? "var(--color-peach)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="16" y="39" width="40" height="12" rx="4" fill="var(--color-ink)" fillOpacity="0.65" />
      {forge && <path d="M26 24 H46 M30 18 H42" stroke="var(--color-coin-dk)" strokeWidth="3" strokeLinecap="round" />}
    </>
  );
}

export function CrownArt({ leaf = false, eagle = false }: { leaf?: boolean; eagle?: boolean }) {
  return (
    <>
      <path d="M14 51 L20 20 L31 42 L36 14 L42 42 L53 20 L58 51Z" fill={leaf ? "var(--color-mint)" : "var(--color-coin)"} stroke="var(--color-ink)" strokeWidth="3" />
      {leaf && <path d="M18 37 Q36 20 54 37" stroke="var(--color-green)" strokeWidth="4" strokeLinecap="round" fill="none" />}
      {eagle && <path d="M25 28 Q36 10 47 28" stroke="var(--color-peach)" strokeWidth="4" strokeLinecap="round" fill="none" />}
    </>
  );
}

export function HoodArt({ shadow = false }: { shadow?: boolean }) {
  return (
    <>
      <path d="M13 54 Q18 15 36 9 Q54 15 59 54 Q50 45 36 45 Q22 45 13 54Z" fill={shadow ? "var(--color-ink)" : "var(--color-green)"} stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M24 47 Q36 36 48 47" stroke={shadow ? "var(--color-lav-pale)" : "var(--color-mint)"} strokeWidth="3" fill="none" />
    </>
  );
}

export function GogglesArt({ upgraded = false }: { upgraded?: boolean }) {
  return (
    <>
      <rect x="8" y="27" width="24" height="18" rx="6" fill={upgraded ? "var(--color-sky)" : "var(--color-cream-card)"} stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="40" y="27" width="24" height="18" rx="6" fill={upgraded ? "var(--color-sky)" : "var(--color-cream-card)"} stroke="var(--color-ink)" strokeWidth="3" />
      <line x1="32" y1="36" x2="40" y2="36" stroke="var(--color-ink)" strokeWidth="3" />
      {upgraded && <path d="M15 32 L26 29 M47 32 L58 29" stroke="white" strokeWidth="2" strokeLinecap="round" />}
    </>
  );
}

export function WandArt({ glow = false }: { glow?: boolean }) {
  return (
    <>
      <line x1="21" y1="56" x2="49" y2="18" stroke="var(--color-peach)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="52" cy="15" r={glow ? 10 : 6} fill="var(--color-coin)" stroke="var(--color-ink)" strokeWidth="3" />
      {glow && <circle cx="52" cy="15" r="16" fill="var(--color-coin)" fillOpacity="0.18" />}
    </>
  );
}

export function StaffArt({ skull = false, balance = false }: { skull?: boolean; balance?: boolean }) {
  return (
    <>
      <line x1="36" y1="16" x2="36" y2="65" stroke="var(--color-peach)" strokeWidth="6" strokeLinecap="round" />
      {skull ? (
        <>
          <circle cx="36" cy="13" r="12" fill="var(--color-cream-card)" stroke="var(--color-ink)" strokeWidth="3" />
          <circle cx="31" cy="12" r="3" fill="var(--color-ink)" />
          <circle cx="41" cy="12" r="3" fill="var(--color-ink)" />
        </>
      ) : (
        <circle cx="36" cy="12" r="10" fill={balance ? "var(--color-green-tint)" : "var(--color-coin)"} stroke="var(--color-ink)" strokeWidth="3" />
      )}
    </>
  );
}

export function SwordArt({ lion = false, wooden = false }: { lion?: boolean; wooden?: boolean }) {
  return (
    <>
      <path d="M35 6 L43 42 L36 54 L29 42Z" fill={wooden ? "var(--color-peach)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="22" y="41" width="28" height="7" rx="3" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="32" y="47" width="8" height="18" rx="3" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="3" />
      {lion && <circle cx="36" cy="35" r="5" fill="var(--color-coin)" stroke="var(--color-ink)" strokeWidth="2" />}
    </>
  );
}

export function AxeArt({ boss = false, foam = false }: { boss?: boolean; foam?: boolean }) {
  return (
    <>
      <line x1="36" y1="18" x2="36" y2="65" stroke="var(--color-peach)" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 8 Q61 11 58 31 Q45 25 36 32 Q27 25 14 31 Q11 11 36 8Z" fill={foam ? "var(--color-sky)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
      {boss && <path d="M25 15 L36 4 L47 15" stroke="var(--color-coral)" strokeWidth="3" strokeLinecap="round" />}
    </>
  );
}

export function BowArt({ long = false, practice = false }: { long?: boolean; practice?: boolean }) {
  return (
    <>
      <path d={long ? "M48 5 Q67 36 48 67" : "M47 13 Q62 36 47 59"} stroke={practice ? "var(--color-peach)" : "var(--color-green)"} strokeWidth="5" strokeLinecap="round" fill="none" />
      <line x1="48" y1={long ? 5 : 13} x2="48" y2={long ? 67 : 59} stroke="var(--color-ink)" strokeWidth="2" />
      <line x1="12" y1="36" x2="58" y2="36" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 36 L22 31 L20 36 L22 41Z" fill="var(--color-green)" stroke="var(--color-ink)" strokeWidth="2" />
    </>
  );
}

export function HammerArt({ rune = false, toy = false }: { rune?: boolean; toy?: boolean }) {
  return (
    <>
      <line x1="36" y1="30" x2="36" y2="66" stroke="var(--color-peach)" strokeWidth="6" strokeLinecap="round" />
      <rect x="19" y="12" width="34" height="24" rx="5" fill={toy ? "var(--color-sky)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
      {rune && <path d="M30 18 L42 30 M42 18 L30 30" stroke="var(--color-purple)" strokeWidth="3" strokeLinecap="round" />}
    </>
  );
}

export function DaggerArt({ sneak = false }: { sneak?: boolean }) {
  return (
    <>
      <path d="M37 8 L44 37 L36 49 L28 37Z" fill={sneak ? "var(--color-ink)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="24" y="36" width="24" height="6" rx="3" fill="var(--color-purple)" stroke="var(--color-ink)" strokeWidth="2" />
      <rect x="32" y="42" width="8" height="18" rx="3" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="2" />
    </>
  );
}

export function LuteArt({ golden = false, tiny = false }: { golden?: boolean; tiny?: boolean }) {
  return (
    <>
      <ellipse cx="36" cy="48" rx={tiny ? 13 : 17} ry={tiny ? 17 : 22} fill={golden ? "var(--color-coin)" : "var(--color-peach)"} stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="33" y="8" width="7" height="33" rx="3" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="3" />
      <circle cx="36" cy="48" r="6" fill="var(--color-ink)" />
      <path d="M28 17 H45" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export function RattleArt({ thunder = false }: { thunder?: boolean }) {
  return (
    <>
      <line x1="36" y1="29" x2="36" y2="64" stroke="var(--color-peach)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="36" cy="20" r="14" fill={thunder ? "var(--color-coin)" : "var(--color-peach)"} stroke="var(--color-ink)" strokeWidth="3" />
      {thunder && <path d="M34 12 L28 23 H36 L32 33 L44 18 H36Z" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="2" />}
    </>
  );
}

export function FlaskArt({ bubble = false }: { bubble?: boolean }) {
  return (
    <>
      <rect x="30" y="7" width="12" height="21" rx="4" fill="var(--color-cream-card)" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M36 26 Q17 43 23 59 Q36 69 49 59 Q55 43 36 26Z" fill="var(--color-mint)" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M23 54 Q36 46 49 54" stroke="var(--color-green)" strokeWidth="3" />
      {bubble && <circle cx="51" cy="17" r="5" fill="var(--color-sky)" stroke="var(--color-ink)" strokeWidth="2" />}
    </>
  );
}

export function RobeArt({ moon = false, shadow = false }: { moon?: boolean; shadow?: boolean }) {
  return (
    <>
      <path d="M22 12 H50 L58 63 H14Z" fill={shadow ? "var(--color-ink)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
      {moon && <path d="M40 25 Q27 30 36 43 Q25 39 25 28 Q25 17 40 25Z" fill="var(--color-coin)" />}
      {shadow && <circle cx="36" cy="31" r="6" fill="var(--color-purple)" />}
    </>
  );
}

export function ShieldArt({ plate = false }: { plate?: boolean }) {
  return (
    <>
      <path d="M18 13 L36 7 L54 13 V40 Q48 58 36 64 Q24 58 18 40Z" fill={plate ? "var(--color-lav-pale)" : "var(--color-sky)"} stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M36 11 V59" stroke="var(--color-ink)" strokeWidth="2" />
      <path d="M22 30 H50" stroke="var(--color-purple)" strokeWidth="3" strokeLinecap="round" />
      {plate && <path d="M25 21 H47 M26 39 H46" stroke="var(--color-coin-dk)" strokeWidth="2" strokeLinecap="round" />}
    </>
  );
}

export function CloakArt({ forest = false, spirit = false }: { forest?: boolean; spirit?: boolean }) {
  return (
    <>
      <path d="M20 14 Q36 4 52 14 Q57 42 50 64 Q36 55 22 64 Q15 42 20 14Z" fill={forest ? "var(--color-green)" : spirit ? "var(--color-lav-pale)" : "var(--color-ink)"} stroke="var(--color-ink)" strokeWidth="3" />
      {forest && <path d="M27 28 Q36 18 45 28 M29 43 Q36 33 43 43" stroke="var(--color-mint)" strokeWidth="3" strokeLinecap="round" />}
      {spirit && <circle cx="36" cy="34" r="8" fill="var(--color-coin)" fillOpacity="0.7" />}
    </>
  );
}

export function VestArt({ lab = false, sash = false }: { lab?: boolean; sash?: boolean }) {
  return (
    <>
      <path d="M21 14 H51 L57 62 H15Z" fill={lab ? "var(--color-cream-card)" : sash ? "var(--color-coral)" : "var(--color-peach)"} stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M36 15 V62" stroke="var(--color-ink)" strokeWidth="2" />
      {lab && <circle cx="45" cy="39" r="5" fill="var(--color-mint)" stroke="var(--color-ink)" strokeWidth="2" />}
      {sash && <path d="M19 51 Q36 32 53 19" stroke="var(--color-coin)" strokeWidth="5" strokeLinecap="round" />}
    </>
  );
}

export function BootsArt({ stone = false }: { stone?: boolean }) {
  return (
    <>
      <path d="M18 17 H34 V49 Q28 58 15 55 V47 H24 V17Z" fill={stone ? "var(--color-lav-pale)" : "var(--color-peach)"} stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M38 17 H54 V47 H63 V55 Q50 58 44 49 V17Z" fill={stone ? "var(--color-lav-pale)" : "var(--color-peach)"} stroke="var(--color-ink)" strokeWidth="3" />
    </>
  );
}

export function BookArt({ spooky = false, spell = false }: { spooky?: boolean; spell?: boolean }) {
  return (
    <>
      <rect x="16" y="15" width="40" height="46" rx="6" fill={spooky ? "var(--color-ink)" : "var(--color-lav-pale)"} stroke="var(--color-ink)" strokeWidth="3" />
      {spooky ? (
        <circle cx="36" cy="37" r="10" fill="var(--color-cream-card)" stroke="var(--color-ink)" strokeWidth="2" />
      ) : (
        <path d="M24 28 H47 M24 37 H44 M24 46 H39" stroke={spell ? "var(--color-purple)" : "var(--color-ink)"} strokeWidth="3" strokeLinecap="round" />
      )}
    </>
  );
}

export function PouchArt({ pebble = false }: { pebble?: boolean }) {
  return (
    <>
      <path d="M26 14 Q36 22 46 14 Q56 32 49 55 Q36 67 23 55 Q16 32 26 14Z" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M24 28 H48" stroke="var(--color-ink)" strokeWidth="3" />
      {pebble && <circle cx="36" cy="43" r="8" fill="var(--color-lav-pale)" stroke="var(--color-ink)" strokeWidth="2" />}
    </>
  );
}

export function BannerArt() {
  return (
    <>
      <line x1="20" y1="9" x2="20" y2="64" stroke="var(--color-peach)" strokeWidth="5" strokeLinecap="round" />
      <path d="M20 13 H56 Q46 29 56 46 H20Z" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="3" />
    </>
  );
}

export function QuiverArt() {
  return (
    <>
      <rect x="24" y="24" width="24" height="38" rx="7" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M27 8 L27 29 M36 4 L36 29 M45 8 L45 29" stroke="var(--color-green)" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

export function KeysArt() {
  return (
    <>
      <circle cx="29" cy="19" r="10" fill="none" stroke="var(--color-ink)" strokeWidth="4" />
      <line x1="29" y1="29" x2="29" y2="61" stroke="var(--color-ink)" strokeWidth="4" />
      <path d="M29 48 H48 M29 57 H42" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

export function ScrollArt({ song = false }: { song?: boolean }) {
  return (
    <>
      <rect x="11" y="23" width="50" height="28" rx="7" fill="var(--color-cream-card)" stroke="var(--color-ink)" strokeWidth="3" />
      {song ? (
        <text x="25" y="43" fill="var(--color-ink)" fontSize="18" fontFamily="var(--font-display)">♪</text>
      ) : (
        <path d="M23 32 H49 M23 41 H44" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
      )}
    </>
  );
}

export function CompassArt({ charm = false }: { charm?: boolean }) {
  return (
    <>
      <circle cx="36" cy="37" r={charm ? 18 : 23} fill="var(--color-cream-card)" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M36 18 L45 43 L27 51Z" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="2" />
      {charm && <line x1="36" y1="6" x2="36" y2="18" stroke="var(--color-ink)" strokeWidth="3" />}
    </>
  );
}

export function CoinCharmArt() {
  return (
    <>
      <circle cx="36" cy="36" r="24" fill="var(--color-coin)" stroke="var(--color-ink)" strokeWidth="3" />
      <circle cx="36" cy="36" r="15" fill="var(--color-coin-dk)" fillOpacity="0.35" stroke="var(--color-ink)" strokeWidth="2" />
      <path d="M27 39 Q36 47 45 39" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="31" r="3" fill="var(--color-ink)" />
      <circle cx="42" cy="31" r="3" fill="var(--color-ink)" />
    </>
  );
}

export function UpgradeRail({
  upgrades,
  className,
}: {
  upgrades: GuildUpgrade[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {upgrades.map((upgrade) => (
        <div
          key={`${upgrade.slot}-${upgrade.name}`}
          className="rounded-control border-2 border-ink bg-lav-pale p-2"
        >
          <AccessoryImage slot={upgrade.slot} name={upgrade.name} />
          <p className="font-body text-xs font-bold text-purple-dk">{upgrade.slot}</p>
          <p className="font-display font-bold text-sm text-ink leading-tight">
            {upgrade.name}
          </p>
          <p className="font-body text-xs text-ink-soft mt-1">
            {upgradeXpRequirement(upgrade)} XP · {upgrade.coins} coins
          </p>
        </div>
      ))}
    </div>
  );
}
