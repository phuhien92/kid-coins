# kid-coin brand

> Little wins. Big money habits.

Sub-lines: *Earn. Save. Grow together.* · *Make everyday progress feel rewarding.* · *Every little step counts.*

## Name and logo
- **Wordmark:** "kid-coin", all lowercase, in a heavy rounded geometric sans. The letters are deep navy (~`#0B1A3A`). The hyphen is a short rounded gold pill.
- **Mark:** a glossy gold coin with a dark navy visor face, two glowing yellow happy-arc eyes, a small smile and a little gold star on its lower right.

## Palette

| Use | Colour | Token role |
|---|---|---|
| Text and headings | deep navy `#0B1A3A`, slate `#4A5672` | `fg`, `fg-muted` |
| Coins, accents, the primary action | warm gold `#F5B800` → `#FFC93C` | `coin`, `action` |
| Backgrounds | warm cream `#FBF8F2`, `#FFFDF9` | `page`, `surface` |
| Secondary accent (growth) | soft mint `#7DD9B0` | `step-choose`, `success` |

Gold is **never text**: it is 1.7:1 on cream. Put navy on gold (9.6:1).

## Type
- **Headings:** very heavy, tight and rounded: Nunito ExtraBold/Black (Baloo 2 is an acceptable alternative).
- **Body:** a friendly humanist sans in slate/navy grey: Nunito Sans.

## Mascot
A cute glossy robot with a dark visor face and glowing arc eyes, holding a star coin. Each step has its own body colour.

## The five steps (the product's mental model)

| # | Step | Colour | Robot | Headline | Line |
|---|---|---|---|---|---|
| 1 | **Do** | yellow (`step-do`) | holding a checklist | Small tasks. Real progress. | Build confidence, one everyday responsibility at a time. |
| 2 | **Earn** | blue (`step-earn`) | holding a star coin | Celebrate the effort. | Turn completed tasks into a moment to feel proud. |
| 3 | **Save** | coral (`step-save`) | holding a jar of coins | Dream a little bigger. | Practice setting coins aside for something special. |
| 4 | **Choose** | mint (`step-choose`) | holding a shopping cart and a sneaker | Learn through decisions. | Explore the difference between spending now and saving. |
| 5 | **Grow** | lavender (`step-grow`) | beside a coin plant in a pot | Build habits together. | Make room for family conversations and little celebrations. |

Each step has three tokens: a body colour for fills and art, a `-tint` for backgrounds, and an `-ink` for text, which is AA on its tint and on the page.

## Feel
Warm, soft and celebratory. Generous rounded corners, soft shadows, lots of whitespace. **Not** fintech (cold, charts first) and **not** cartoon-noisy (neon, shouty copy).

## Platform and touch rules (iPad-first PWA)

The product targets the web, **iPad-first, installed as a PWA**. A native app is deferred. If one is built later, it would be Expo under `apps/mobile`, consuming `packages/tokens`.

1. **Tap targets are at least 44×44pt, with at least 8pt between adjacent targets.** Tokens: `--spacing-tap` (`size-tap`, `min-h-tap`, `min-w-tap`) and `--spacing-tap-gap` (`gap-tap-gap`).
2. **iPad layouts come first.** Portrait (~768–834px, `ipad:`) and landscape (~1024–1194px, `ipad-landscape:`) are the primary layouts. Phone is secondary (the base styles). Desktop (`desktop:`) is a supported fallback.
3. **No hover-only interactions.** Every hover affordance has a tap or focus equivalent. Nothing important appears only on `:hover`.
4. **Respect safe-area insets** (`env(safe-area-inset-*)`) in standalone mode. Tokens: `--spacing-safe-{top,right,bottom,left}` (`pt-safe-top`, `pb-safe-bottom`, …).
5. **Respect `prefers-reduced-motion`** for celebration animations (confetti, coin bob, mascot float). Use a crossfade or no motion.

## Accessibility (non-negotiable)
- WCAG 2.1 AA contrast: 4.5:1 for body text, 3:1 for large text and UI. The token tests enforce every pairing; see [tokens.md](tokens.md).
- Keyboard focus is always visible (`focus` ring), and selection never reuses the focus ring.
- Meaning is never carried by colour alone. Pair every colour state with text, an icon or a shape.
