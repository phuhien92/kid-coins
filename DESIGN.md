---
name: kid-coin
description: Little wins. Big money habits. Warm, soft and celebratory. Not fintech, and not cartoon-noisy.
source_of_truth: src/app/globals.css (@theme block). This file catalogues it; if the two disagree, globals.css wins and this file is stale.
colors:
  cream: "#FBF8F2"        # page
  cream-card: "#FFFDF9"   # cards, sheets, inputs
  cream-deep: "#F4EEE2"   # wells, empty tracks, hover fills
  ink: "#0B1A3A"          # deep navy, headings + body (16.2:1 on cream)
  ink-soft: "#4A5672"     # slate, secondary text (6.9:1)
  edge: "#7C869C"         # input/control outlines (≥3:1 non-text)
  line: "rgba(11,26,58,0.10)"  # decorative dividers only
  gold: "#F5B800"         # coins, accents, primary action, FILL ONLY
  gold-lt: "#FFC93C"
  gold-dk: "#E5A800"
  gold-tint: "#FFF4D1"
  gold-ink: "#7A5600"     # gold-family text (6.3:1)
  mint: "#7DD9B0"         # secondary accent: growth / success
  mint-tint: "#E2F6EC"
  mint-ink: "#146B4A"
  earn: "#5B9BF5"
  earn-tint: "#E3EEFE"
  earn-ink: "#1F4FA8"
  save: "#FF8A75"
  save-tint: "#FFE6E0"
  save-ink: "#A93A26"
  grow: "#A890F0"
  grow-tint: "#EEE8FD"
  grow-ink: "#5636B8"
  danger: "#B42318"
  danger-tint: "#FDE7E4"
  focus: "#1F4FA8"
rounded: { control: 14px, tile: 20px, card: 24px, sheet: 32px, pill: 999px }
shadow:
  card: "soft navy ambient, resting surfaces"
  lift: "hover/raised surfaces, bottom nav"
  gold: "warm glow under gold primary actions"
  sheet: "modals"
fonts:
  display: "Nunito 800/900 (font-display): heavy, tight, rounded headings"
  body: "Nunito Sans 400–800 (font-body): friendly humanist body"
---

# Design System: kid-coin

## 1. The story is the structure

Everything maps onto five steps. Use the step's colour when a surface belongs to it,
and always say the step's name in text too.

| Step | Colour | Headline | In the app |
|---|---|---|---|
| 1 Do | yellow (`gold`) | Small tasks. Real progress. | Kid Tasks, parent Tasks |
| 2 Earn | blue (`earn`) | Celebrate the effort. | Balance card, celebration, Approvals |
| 3 Save | coral (`save`) | Dream a little bigger. | Goal card, savings jars |
| 4 Choose | mint (`mint`) | Learn through decisions. | Rewards / shop |
| 5 Grow | lavender (`grow`) | Build habits together. | Profile, parent Kids, parent tile |

Copy, step names and mascot slots live in `src/lib/brand.ts`. Tone classes per step
(`tint` / `fill` / `ink`) live in `STEP_TONES` (`src/components/ui/StepBadge/stepTones.ts`).

## 2. Colour rules

- **Navy ink for text.** `ink` for headings and body, `ink-soft` for secondary. Never lighter.
- **Gold is a fill, never text.** It is 1.7:1 on cream. Put `ink` on gold (9.6:1). For
  gold-family text use `gold-ink`.
- **Step tints are backgrounds**, step `-ink` colours are the only step colours used for text
  (all ≥5:1 on their tint and on cream). Step body colours (`earn`, `save` …) are for
  illustration, dots and progress fills.
- **Never carry meaning by colour alone.** Pair every colour state with text, an icon or a shape:
  active nav = tint + bar marker + heavier label (+ underline on mobile); done task =
  tint + ✓ + strikethrough; locked = dashed border + "Locked" label; selected swatch =
  thick navy ring + `aria-pressed`.
- **Inputs and toggles** use a 2px `edge` outline so their boundary clears 3:1.
- **Legacy colour names are persisted data.** Kid avatar/character colours are stored in
  the DB as `var(--color-mint)`, `var(--color-coral)`, `var(--color-peach)` and so on, and the SVG
  character art reads them. They are defined as plain CSS variables in `globals.css`
  (no utilities). Retune their values, but never rename or delete them.

## 3. Type

- `font-display` (Nunito ExtraBold/Black, −0.015em tracking) for headings, numbers,
  button labels and anything the brand *says*. Use `font-extrabold` by default and `font-black`
  for page titles and balances.
- `font-body` (Nunito Sans) for descriptions, settings and meta text.
- Use the Tailwind type scale (`text-xs` … `text-6xl`), not bracket sizes. `text-xs` (12px)
  is the floor and is only for meta labels.

## 4. Shape and elevation

Generous radii, soft shadows, no hard offset "stamp" shadows, no thick ink borders.

- Cards: `bg-cream-card border border-line shadow-card rounded-card`.
- Hover lifts (`-translate-y-0.5 shadow-lift`), press nudges (`active:translate-y-px`).
- Gold primary actions carry `shadow-gold`.

## 5. Components (src/components/ui)

| Component | Notes |
|---|---|
| `Button` / `ButtonLink` | `primary` (gold, navy text) for the main action on kid and parent screens · `secondary` (navy) · `ghost` · `chip` · `mini-yes` / `mini-no` for inline approval rows. Pill radius. |
| `Card` | `padding` sm/md/lg, `radius` card/tile/control/sheet/pill. |
| `Badge` | `streak` (gold), `count`, `goal-chip` (mint), `lav` (grow). |
| `Tabs` | Base UI. Selected = `aria-selected:`. `kid` selects in gold, `parent` in navy. |
| `Toggle` | Base UI Switch. Off = cream track with edge outline, slate thumb on the left. On = mint-ink track, white thumb on the right. |
| `ProgressBar` | `gold` / `mint` / `grow` fill on a `cream-deep` track. |
| `KidCoinLogo` / `KidCoinMark` | The lockup (mark + lowercase "kid-coin" with a gold pill hyphen) and the SVG coin mark (navy visor, glowing arc eyes, smile, star). Screen readers hear "kid-coin" once. |
| `StepBadge` | A pill that names a step ("1 Do"). |
| `MascotSlot` | Named slot for the robot PNGs. Renders a tinted placeholder until `MASCOT_ART[slot].src` is set in `src/lib/brand.ts`. |
| `PromoLink` | Full-bleed gold CTA card/bar (kid home). |
| `StampedChip` / `StampedChipLink` | Soft pill chips (switch profile, profile picker). |
| `Modal`, `Toast`, `Input`, `Avatar`, `InitialAvatar`, `CoinIcon`, `GoalEmojiBadge`, `DashedActionCard`, `Skeleton`, `Page` | Restyled to the tokens above. APIs are unchanged. |

## 6. Focus and motion

- Every interactive element shows `focus-visible:ring-2 ring-focus ring-offset-2`, and there is a global
  `:focus-visible` outline fallback in `globals.css`. Never remove it without a replacement.
- Selection must look different from focus (gold/navy ring or fill, not the blue focus ring).
- Respect `prefers-reduced-motion`. The coin bob/blink and Penny's float switch off.

## 7. Don'ts

- Don't add bracket values (`text-[13px]`, `bg-[#…]`). Add a token or use the scale.
- Don't put gold or step body colours behind text, or use them as text.
- Don't bring back thick ink borders or hard offset shadows. That is the old "picture-book ledger" look.
- Don't drift into fintech (charts first, cold greys) or toy-store-loud (neon, shouty copy).
