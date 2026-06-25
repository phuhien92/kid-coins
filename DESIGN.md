---
name: Earnie
description: A picture-book ledger for families — kids see a game, parents see a tool, both on the same warm cream paper.
colors:
  # Surfaces
  cream: "#FBF8EF"
  cream-card: "#FCFAF3"
  # Ink (text + linework)
  ink: "#1C1B17"
  ink-soft: "#5C5A50"
  line: "#1C1B171F"
  # Kid CTA — green family
  green: "#2F7A55"
  green-dk: "#245F42"
  green-tint: "#CFE7D8"
  # Parent CTA — purple family
  purple: "#7B6BE6"
  purple-dk: "#5E4FCB"
  lav-pale: "#DEE0FA"
  lav: "#C7CAF4"
  # Coins — the only true highlight color
  coin: "#F4D34E"
  coin-dk: "#E3BE34"
  # Category tints (task-icon backgrounds, never text or borders)
  mint: "#C7E9D4"
  peach: "#F8D3B2"
  lemon: "#F7E68C"
  coral: "#F0A6A0"
  sky: "#CDE7F2"
typography:
  display:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  control: "10px"
  button: "14px"
  card: "16px"
  task: "20px"
  modal: "26px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
components:
  # Buttons — every CTA carries an ink border and a bottom-only press shadow
  button-green:
    backgroundColor: "{colors.green}"
    textColor: "{colors.cream-card}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "15px 18px"
  button-purple:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.cream-card}"
    typography: "{typography.body}"
    rounded: "{rounded.button}"
    padding: "11px 18px"
  button-ghost:
    backgroundColor: "{colors.cream-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.button}"
    padding: "11px 18px"
  button-chip:
    backgroundColor: "{colors.cream-card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
  button-mini-yes:
    backgroundColor: "{colors.green}"
    textColor: "{colors.cream-card}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-mini-no:
    backgroundColor: "{colors.cream-card}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  # Card — the page's primary container
  card:
    backgroundColor: "{colors.cream-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  card-compact:
    backgroundColor: "{colors.cream-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  # Input — a chat-bar pill paired with a green send circle
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "11px 16px"
  # Badges
  badge-streak:
    backgroundColor: "{colors.coin}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  badge-count:
    backgroundColor: "{colors.coin}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-goal-chip:
    backgroundColor: "{colors.green-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  badge-lav:
    backgroundColor: "{colors.lav-pale}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  # Toggle
  toggle-track-off:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    width: "48px"
    height: "28px"
  toggle-track-on:
    backgroundColor: "{colors.green}"
    rounded: "{rounded.pill}"
    width: "48px"
    height: "28px"
  # Progress bar
  progress-track:
    backgroundColor: "{colors.lav-pale}"
    rounded: "{rounded.pill}"
    height: "16px"
  progress-fill-coin:
    backgroundColor: "{colors.coin}"
    rounded: "{rounded.pill}"
    height: "16px"
  # Modal
  modal:
    backgroundColor: "{colors.cream-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.modal}"
    padding: "24px"
---

# Design System: Earnie

## 1. Overview

**Creative North Star: "The Picture-Book Ledger."**

Warmth carries the joy. The interface presses down when you tap it, stays flat when you read it, and never glows or shouts to get attention. Earnie is a picture-book and a ledger at the same time: kids see a game with a chunky coin pip, a customizable mascot, and tasks that "stamp" themselves done; parents see a clear record of what was earned, what's owed, and what's been approved. Both views run on the same cream paper, the same ink linework, the same hand-feel borders. They are two rooms in one house, not two brands.

The system explicitly rejects the **category defaults** for both audiences. The kid app refuses generic-kid-cartoonish (gradient slime, Comic Sans, neon rainbows, drop-shadow text) and toy-store-loud (oversaturated reds, exclamation-mark copy, BUY-NOW energy). The parent app refuses cold-fintech (navy-and-gold, charts-first, adult-banking aesthetic) and sterile-SaaS (gray-on-gray, all-data-no-personality). Joy is carried by warmth — cream paper, rounded Fredoka, the coin yellow — not by volume.

**Key Characteristics:**
- Cream paper body, ink linework borders, one warm green for kid action and one warm purple for parent action
- Chunky 2.5–3px ink borders on every interactive surface (buttons, cards, badges, inputs)
- A two-layer elevation language: soft ambient drop-shadow for resting cards, hard bottom-only "stamp" shadow for primary CTAs
- Fredoka + Nunito only; no decorative or "fun" display fonts
- Coin yellow (`#F4D34E`) is reserved for true money signal — balance, progress, streak. Never decorative.

## 2. Colors

A warm-neutral cream base, ink linework, two CTA hues (green for kid, purple for parent), one coin yellow that earns its visibility by being rare, and a small set of pale category tints for task icons.

### Primary
- **Earnie Green** (`#2F7A55`): The kid-side CTA color. Carries "Collect", "Mark done", "Redeem", and every primary action inside `/(kid)`. Paired with **Green Press** (`#245F42`) as the bottom-shadow color and **Green Tint** (`#CFE7D8`) as a chip / completed-task background.
- **Earnie Purple** (`#7B6BE6`): The parent-side CTA color. Carries "New goal", "Approve", "Add a kid", and every primary action inside `/(parent)`. Paired with **Purple Press** (`#5E4FCB`) as the bottom-shadow color.

### Secondary
- **Coin Yellow** (`#F4D34E`): The system's only true highlight. Used on the coin pip, the balance bar, the progress fill, the streak badge, and the celebration confetti. Never decorative. Paired with **Coin Shadow** (`#E3BE34`) on the streak badge's press stub.

### Tertiary (category tints, soft)
- **Mint** (`#C7E9D4`), **Peach** (`#F8D3B2`), **Lemon** (`#F7E68C`), **Coral** (`#F0A6A0`), **Sky** (`#CDE7F2`), **Lavender Pale** (`#DEE0FA`): Task-icon backgrounds and reward-card emoji headers. Soft enough that an emoji or icon reads as the focal element. Never used for text, borders, or CTA backgrounds.

### Neutral
- **Cream** (`#FBF8EF`): Page background. The paper. Every screen sits on cream.
- **Cream Card** (`#FCFAF3`): Card and modal surface. A half-tone warmer than the page so cards lift visibly without a heavy shadow.
- **Ink** (`#1C1B17`): Primary text, every border, every divider. There is no "black" in this system; ink is a warm near-black that sits inside the cream family.
- **Ink Soft** (`#5C5A50`): Secondary text, captions, "ago" timestamps, mini-no button text. Verified ≥4.5:1 against cream.
- **Line** (`#1C1B171F`): Decorative divider only. Never carries text or icons.

### Named Rules

**The Coin-Yellow Rarity Rule.** `#F4D34E` is reserved for money signal (coin pip, balance bar, progress fill, streak badge, celebration). It never appears as a decoration, a background tint on a non-money card, or a highlight on a text run. Its rarity is what makes earning a coin feel like something.

**The Cream-Paper-First Rule.** Every screen background is `#FBF8EF`. Cards are `#FCFAF3`. We do not introduce a third surface color (no gradient bands, no full-bleed accent strips behind sections). Depth is carried by borders and shadows, not by surface color.

**The Two-Hue Authority Rule.** Green owns kid action. Purple owns parent action. Neither hue appears as decoration in the other shell. A green button in the parent dashboard is a bug, not a flourish.

## 3. Typography

**Display Font:** Fredoka (with `system-ui, sans-serif` fallback).
**Body Font:** Nunito (with `system-ui, sans-serif` fallback).

**Character:** A geometric-rounded display paired with a humanist-rounded body. Both families resolve "g" with a single-story open form, both ride the same x-height neighborhood, and both have generous counters that read at small sizes on a kid's tablet. The pairing carries warmth without ever drifting into "cartoon font" territory.

### Hierarchy

- **Display** (Fredoka 600, 2rem, line-height 1.1, letter-spacing -0.01em): Coin balance numerals, page-level identity titles (the "Earnie" wordmark, the "54" balance on the Home card). Never used for marketing-style heroes; we don't have heroes.
- **Headline** (Fredoka 600, 1.25rem / 20px, line-height 1.2): Promo banner text, modal titles, AI coach question lines.
- **Title** (Fredoka 600, 1.0625rem / 17px, line-height 1.3): Task names, reward names, kid card names, primary button labels (the "Collect" CTA, "Mark done"). The default "this is what this thing is" voice.
- **Body** (Nunito 700, 0.9375rem / 15px, line-height 1.5, max line length 65–75ch for prose): Card content, settings descriptions, AI coach replies, ghost button labels. Nunito 700 (not 400) because cream paper is not white; a lighter weight muddies on warm bg.
- **Label** (Nunito 800, 0.8125rem / 13px, line-height 1.4): Chips, count badges, meta lines (`"5 / 20 coins"`, `"3h ago"`), category tags. Floor; never go smaller.

### Named Rules

**The Fredoka-for-Voice Rule.** Use Fredoka where the system *speaks* (CTAs, task names, balance numerals, mascot dialogue). Use Nunito where the system *records* (body copy, settings, descriptions, timestamps). The two registers of the brand — game and ledger — map directly onto the two type roles.

**The 13px Floor Rule.** The smallest interactive text in the system is 13px Nunito 800. We never ship UI text below this floor. Kids are reading; parents are skimming on phones; the floor protects both.

## 4. Elevation

A deliberate **two-layer** language. Ambient depth lifts resting surfaces a fingertip off the cream; structural depth advertises the bottom edge of every interactive element so taps feel earned.

### Shadow Vocabulary

- **Ambient Card Lift** (`box-shadow: 0 10px 26px -14px rgba(28, 27, 23, 0.30)`): The default card shadow. A soft, far-spread, ink-tinted drop. Cards float about 2–3px off the cream. Applied to all card containers and the modal panel (the modal uses a deeper variant for emphasis: `0 30px 60px -20px rgba(28,27,23,0.5)`).
- **Stamp Press — Green** (`box-shadow: 0 5px 0 var(--color-green-dk)`): Bottom-only solid shadow under the primary green CTA. On `:active`, collapses to `0 1px 0` and the button translates `translateY(4px)`. The combined effect is a physical click-down.
- **Stamp Press — Purple** (`box-shadow: 0 4px 0 var(--color-purple-dk)`): Same idea, parent-side.
- **Stamp Press — Coin** (`box-shadow: 0 3px 0 var(--color-coin-dk)`): On the streak badge. The badge feels like a stamped seal pressed into the cream.
- **Stamp Press — Mini** (`box-shadow: 0 3px 0` of the relevant darker shade): Smaller variant used on mini-yes and chip-style approve buttons.

### Named Rules

**The Two-Layer Rule.** Ambient shadows describe *where a surface rests* (slightly above the page). Stamp shadows describe *how a control responds to a press* (bottom-only, solid, in the control's own darker shade). We never mix them on one element. Cards do not stamp; buttons do not float.

**The Flat-Reading-Surface Rule.** Body text, lists, and read-only data live on flat surfaces inside cards. We do not nest a stamp-shadowed element inside a stamp-shadowed element (never two press shadows in one tap target). Nested cards are forbidden by default.

**The Press-Confirms-Action Rule.** Every primary CTA in the system must have a stamp shadow + active translateY pair. The visual confirmation that "you pressed something" is non-negotiable on a kid-facing app. Ghost buttons are the only exception (they invert with a background tint on active).

## 5. Components

The system has seven primitive components plus the modal. All share the same ink-border grammar; the variants change weight, fill, and shadow.

### Buttons

Six variants. Every variant has an ink border; primary variants add a bottom-only stamp shadow.

- **Shape:** rounded button radius (14px) for primary green/purple/ghost/mini; pill radius (999px) for chip; sm-control radius (10px) for mini variants on tight rows. Border is `2–3px solid var(--color-ink)`.
- **Green (primary, kid):** `bg-green` + white text + Fredoka 600 17px + 3px ink border + 18px radius + `0 5px 0 green-dk` stamp. Active: `translateY(4px)` + shadow collapses to `0 1px 0`.
- **Purple (primary, parent):** `bg-purple` + white text + Fredoka 600 15px + 2.5px ink border + 14px radius + `0 4px 0 purple-dk` stamp. Same active behavior.
- **Ghost (secondary):** white bg + ink text + 2px ink border + 14px radius. No stamp; uses subtle `hover:bg-black/5`, `active:bg-black/10`.
- **Chip:** white bg + ink text + 2.5px ink border + pill radius. Used in horizontal scroller affordances (category picker, kid picker).
- **Mini-yes / Mini-no:** the small-row pair used in inline approval rows. Mini-yes uses the green-stamp grammar at 3px depth; mini-no is a ghost with ink-soft text.
- **Hover:** primary buttons hold their fill on hover (no lighten). Hover state is reserved for ghost/chip variants only.
- **Focus:** every button gets a 3px outline in `ink` at `outline-offset: 3px` on `:focus-visible`. Never rely on a color shift alone.
- **Disabled:** `opacity: 0.5` + `pointer-events: none`.

### Chips

- **Style:** White cream-card background, 2.5px ink border, pill radius, Fredoka 600 14px. A chip is structurally a button at pill radius.
- **State:** Active chip (e.g. selected category, selected daily tab) flips to `bg-ink text-cream` and keeps the pill border. Selection is by inversion, not by accent.

### Cards / Containers

- **Corner Style:** card radius (16px). The kid-app balance card uses an oversized 26px; the modal uses 26px; the task item uses 20px. These are not tokens; they are deliberate per-component decisions and should not be overgeneralized.
- **Background:** `cream-card` (`#FCFAF3`). Never page-color `cream` and never white.
- **Shadow Strategy:** Ambient Card Lift (see Elevation). Modal uses the deeper variant.
- **Border:** 3px solid ink (default Card) or 2.5px solid ink (`compact` Card). The border is the card; the shadow is the lift.
- **Internal Padding:** 16–20px (`md` = 20px, `sm` = 16px, `lg` = 24px). Padding scales with importance, not with content density.

### Inputs / Fields

The system's input is a chat-bar pattern: a pill-radius text field paired with a green send circle.

- **Style:** White fill, 2px ink border, pill radius, Nunito 700 13.5px, `placeholder:text-ink-soft`.
- **Focus:** border shifts from ink to purple (`focus:border-purple`), 150ms transition. No glow.
- **Disabled:** `opacity: 0.5`.
- **Paired send button:** 42×42px circle, 2.5px ink border, green fill, ↑ glyph. Disabled when input is empty.

### Badges

Four variants, all pill-radius with an ink border. The variant communicates the kind of count.

- **Streak** (coin bg, 2.5px ink border, Fredoka 600 16px, `0 3px 0 coin-dk` stamp): The 🔥 12 pill in the kid app top bar. The only badge that gets a stamp shadow.
- **Count** (coin bg, 2px ink border, Nunito 800 11px, no shadow): Approval counts in the parent sidebar nav. Small, dense.
- **Goal-chip** (green-tint bg, 2px ink border, Fredoka 600 12.5px): The goal label on a kid card.
- **Lav** (lav-pale bg, 2px ink border, Fredoka 600 12.5px): A neutral-purple chip for parent-side metadata.

### Toggle

- 48×28 pill track, 2.5px ink border. Off: white track, ink thumb at `left: 2px`. On: green track, white thumb at `left: 22px`. 150ms slide. The track color, not just the thumb position, communicates state — color is not the only signal because the thumb position changes too.

### Progress Bar

- 13–16px height, 2.5px ink border, pill radius, `lav-pale` track. Fill is `coin` (default), `green`, or `purple`. 500ms ease-out width transition on value change. Always paired with a percent-left meta line and a `coin + current / total` right-aligned meta line.

### Navigation

- **Desktop sidebar:** 230px (kid) / 250px (parent), sticky, full height. Items: 14px ink type, 12px radius pill on hover. Active item: `green-tint` background + 2px ink border around the pill.
- **Mobile bottom nav:** 4 items, fixed bottom, `env(safe-area-inset-bottom)` padding. Active icon pill: 46×38 with `green-tint` background + ink border.
- **Tablet (parent):** Collapses to 74px icon rail (no labels). Hamburger reveals full sidebar with dark scrim.

### Modal (Signature Component)

The modal is the signature lifted surface. Used for Character Studio (kid) and AI Coach (parent).

- **Panel:** `cream-card` background, 3px ink border, 26px radius (the largest in the system), deep ambient shadow (`0 30px 60px -20px rgba(28,27,23,0.5)`).
- **Width:** `w-[min(440px,100%)]` default; `min(380px,100%)` for the smaller variant.
- **Scrim:** `rgba(28,27,23,0.45)` with `backdrop-blur-sm`. The blur is functional (focusing attention on the modal), not decorative.
- **Entrance motion:** scale 0.96→1 + translateY 24→0 + opacity 0→1, 300ms with `cubic-bezier(0.2, 1.2, 0.4, 1)`. The slight overshoot (the `1.2` in the curve) is the only place this system uses a non-pure-ease-out — and only here, because a modal opening is one of the few moments that earns it.
- **Reduced motion:** crossfade only; no scale or translate.

## 6. Do's and Don'ts

### Do:
- **Do** keep `#F4D34E` reserved for money signal — coin pip, balance, progress, streak, celebration. The Coin-Yellow Rarity Rule is non-negotiable.
- **Do** put a 2.5–3px solid ink border on every interactive surface. The ink linework is the brand.
- **Do** pair every primary CTA with a bottom-only stamp shadow in the control's own darker shade (`green` + `green-dk`, `purple` + `purple-dk`, `coin` + `coin-dk`).
- **Do** use Fredoka for *voice* (CTAs, task names, balance, mascot) and Nunito for *record* (body, settings, descriptions, timestamps). The Fredoka-for-Voice Rule.
- **Do** keep cards on `cream-card` and pages on `cream`. Two surface colors, not three.
- **Do** verify text on cream hits ≥4.5:1 — `ink` and `ink-soft` are both safe; lighter grays are not.
- **Do** honor `prefers-reduced-motion: reduce` on the celebration overlay, modal entrance, view transitions, and toast slides — crossfade or instant only.
- **Do** add a check glyph + strikethrough to completed tasks, not just a tint change. The Color-Is-Not-The-Only-Signal rule (from PRODUCT.md).
- **Do** keep tap targets ≥44px on the kid app. Most existing components are already 52px+.

### Don't:
- **Don't** introduce a gradient anywhere. No gradient text, no gradient backgrounds, no gradient borders. This system is paper, ink, and flat color.
- **Don't** use Comic Sans, hand-drawn-imitation display fonts, or any third type family. Fredoka and Nunito only.
- **Don't** ship neon, oversaturated reds, or "BUY NOW" / exclamation-mark copy. Toy-store-loud is a banned aesthetic.
- **Don't** stack stamp shadows. One press shadow per tap target. Nested cards are forbidden by default.
- **Don't** use `cream-card` on a page background or `cream` on a card. The two-surface system is the rhythm.
- **Don't** put the coin yellow behind non-money content. It is not a generic highlight color.
- **Don't** introduce a third CTA hue. Green owns kid action; purple owns parent action; nothing else gets that authority.
- **Don't** glassmorph anything. The modal's `backdrop-blur-sm` is functional focus, not decoration; do not extend the pattern.
- **Don't** drop the ink border to ≤1px for "elegance". The chunky border is the brand; thinning it is exactly the cold-fintech move the brand rejects.
- **Don't** use display fonts (Fredoka) for body copy or settings descriptions. That's the generic-kid-cartoonish trap; respect the kid by reading-friendly Nunito for record-keeping text.
- **Don't** add a side-stripe border (`border-left` > 1px as a colored accent). Use a full ink border, a background tint, or a leading icon.
