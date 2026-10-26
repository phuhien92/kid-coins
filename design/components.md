# Components and screen rules

How the screens use the tokens. Primitives live in `apps/web/src/components/ui` (paths below are relative to `apps/web/`).
The brand lives in [brand.md](brand.md) and every token is in [tokens.md](tokens.md).

## The story is the structure

| Step | Role prefix | In the app |
|---|---|---|
| 1 Do | `step-do` | Kid Tasks, parent Tasks |
| 2 Earn | `step-earn` | Kid balance card, task celebration, parent Approvals |
| 3 Save | `step-save` | Goal card, savings jars |
| 4 Choose | `step-choose` | Rewards / shop |
| 5 Grow | `step-grow` | Kid Profile, parent Kids, the parent tile |

Copy, step names and mascot slots live in `src/lib/brand.ts`. Per-step class triples (`tint` / `fill` / `ink`) live in `STEP_TONES` (`src/components/ui/StepBadge/stepTones.ts`). Use those; don't hand-pick step classes.

## Primitives

| Component | Notes |
|---|---|
| `Button` / `ButtonLink` | `primary` (`bg-action` + `text-on-action`, `shadow-action`) for the main action on kid and parent screens. `secondary` (navy). `ghost`, `chip`, and `mini-yes` / `mini-no` for inline approval rows. Every size is `min-h-tap`. |
| `Card` | `bg-surface border-line shadow-card`. `padding` sm/md/lg; `radius` card/tile/control/sheet/pill. |
| `Badge` | `streak` (coin), `count`, `goal-chip` (success), `lav` (step-grow). |
| `Tabs` | Base UI. Selected is styled with `aria-selected:`. `kid` selects in gold, `parent` in navy. Each tab is `min-h-tap`, with `gap-tap-gap` between tabs. |
| `Toggle` | Base UI Switch. Off: sunken track, `edge` outline, slate thumb on the left. On: `success` track, white thumb on the right. The label is the 44pt hit area. |
| `ProgressBar` | `gold` / `mint` / `grow` fill on a `surface-sunken` track. |
| `KidCoinLogo` / `KidCoinMark` | The lockup and the SVG mark. Its paint comes from the `--coin-mark-*` component tokens. Screen readers hear "kid-coin" once. The static copy for icons is `public/brand/kid-coin-mark.svg`; run `pnpm --filter web icons` after changing it. |
| `StepBadge` | Names a step ("1 Do"), so colour is never the only cue. |
| `MascotSlot` | Named slot for a robot PNG (`MASCOT_ART` in `src/lib/brand.ts`). Renders a tinted placeholder until `src` is set. |
| `PromoLink` | Full-bleed gold CTA card or bar (kid home). |
| `StampedChip` / `StampedChipLink` | Soft pill chips, `min-h-tap`. |
| `Modal`, `Toast`, `Input`, `Avatar`, `InitialAvatar`, `CoinIcon`, `GoalEmojiBadge`, `DashedActionCard`, `Skeleton`, `Page` | On the semantic roles. The modal close button and the input's send button are `size-tap`. The toast sits at `bottom-toast-offset`, which clears the home indicator. |

## Screen rules

- **Layouts:**
  - The **kid shell** shows bottom tabs on phone and iPad portrait, and a sidebar (`w-sidebar`) from `ipad-landscape:` up.
  - **Auth** shows its brand panel from `ipad-landscape:` up.
  - Use `ipad:`, `ipad-landscape:` and `desktop:`, not `md:`, `lg:` or `xl:`.
- **Touch:** every control is at least 44pt (`min-h-tap`, `size-tap`), with at least 8pt between adjacent controls (`gap-tap-gap`). The one exception is inline links inside a sentence.
- **No hover-only affordances:** every `hover:` lift or tint has a `focus-visible:` and/or `active:` equivalent. Nothing is revealed only on hover.
- **Safe areas:** `body` pads with `--spacing-safe-*`. Fixed bars pad themselves: `pb-safe-bottom` for the tab bar, `pb-bar-bottom` for action bars, `bottom-above-nav` for anything above the tab bar.
- **Motion:** a global `prefers-reduced-motion` rule calms CSS motion. Framer Motion celebrations check `useReducedMotion()`, so there's no confetti and no mascot float.
- **Colour:** gold and the step body colours are fills, never text. Never carry state by colour alone:
  - active nav: tint, a bar marker and a heavier label (plus an underline on phone)
  - done task: ✓ and strikethrough
  - locked: a dashed `edge` border and the label "Locked"
  - selected swatch: a thick navy ring and `aria-pressed`
- **Focus:** `focus-visible:ring-2 ring-focus ring-offset-2` on every control, plus a global `:focus-visible` outline fallback. Selection uses a gold or navy ring, never the focus ring.
- **No bracket values for tokens.** Add a semantic or component token instead. What remains is layout geometry: grid track ratios, `min()` modal widths and Base UI `data-[…]` variants.
