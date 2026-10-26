# Tokens

Every token in [`@kid-coin/tokens`](../packages/tokens/src), with its role and light value, and the measured WCAG 2.1 contrast of every pairing the system promises.
There is no dark theme yet.

- **Tiers:** primitives (`--kc-*`, raw values, no utilities) → semantic roles (Tailwind `@theme`, these become utilities) → component tokens. The persisted avatar colour names are listed last.
- **Utility names:** `--color-X` → `bg-X` / `text-X` / `border-X`; `--radius-X` → `rounded-X`; `--shadow-X` → `shadow-X`; `--spacing-X` → `size-X`, `p-X`, `gap-X`; `--breakpoint-X` → `X:`; `--text-X` → `text-X`.
- **Thresholds:** body text needs 4.5:1. Large text (≥24px, or ≥19px bold) and UI components or focus indicators need 3:1.

The tables below are generated: `pnpm --filter @kid-coin/tokens report`. `pnpm --filter @kid-coin/tokens test` fails if any role stops resolving to a primitive or any pairing drops below its threshold.

<!-- GENERATED:START -->
### Tier 2: semantic roles

| Token | Role | Light value | Resolves via |
|---|---|---|---|
| `--color-page` | Page background | `#FBF8F2` | `--kc-cream-100` |
| `--color-surface` | Cards, sheets, inputs | `#FFFDF9` | `--kc-cream-50` |
| `--color-surface-sunken` | Wells, empty tracks, hover fills | `#F4EEE2` | `--kc-cream-200` |
| `--color-fg` | Primary text (headings, body) | `#0B1A3A` | `--kc-navy-900` |
| `--color-fg-muted` | Secondary text | `#4A5672` | `--kc-navy-600` |
| `--color-fg-inverse` | Text on navy | `#FFFFFF` | `--kc-white` |
| `--color-edge` | Control outlines (inputs, toggles, checkboxes) | `#7C869C` | `--kc-navy-500` |
| `--color-line` | Decorative dividers only (never the sole boundary of a control) | `rgba(11, 26, 58, 0.10)` | `--kc-navy-alpha-10` |
| `--color-action` | Primary action background | `#F5B800` | `--kc-gold-500` |
| `--color-action-hover` | Primary action hover | `#FFC93C` | `--kc-gold-400` |
| `--color-action-pressed` | Primary action pressed | `#E5A800` | `--kc-gold-600` |
| `--color-on-action` | Primary action label | `#0B1A3A` | `--kc-navy-900` |
| `--color-action-secondary` | Secondary action background | `#0B1A3A` | `--kc-navy-900` |
| `--color-action-secondary-hover` | Secondary action hover | `#1B2D57` | `--kc-navy-800` |
| `--color-on-action-secondary` | Secondary action label | `#FFFFFF` | `--kc-white` |
| `--color-focus` | Focus ring | `#1F4FA8` | `--kc-blue-700` |
| `--color-success` | Success text / on-state | `#146B4A` | `--kc-mint-700` |
| `--color-success-tint` | Success background | `#E2F6EC` | `--kc-mint-100` |
| `--color-warning` | Warning text | `#8A4B00` | `--kc-amber-700` |
| `--color-warning-tint` | Warning background | `#FFF1D6` | `--kc-amber-100` |
| `--color-error` | Error text | `#B42318` | `--kc-red-700` |
| `--color-error-tint` | Error background | `#FDE7E4` | `--kc-red-100` |
| `--color-coin` | Coin fill (balance, badges, progress) | `#F5B800` | `--kc-gold-500` |
| `--color-coin-hi` | Coin highlight | `#FFC93C` | `--kc-gold-400` |
| `--color-coin-lo` | Coin shade / rim | `#E5A800` | `--kc-gold-600` |
| `--color-step-do` | Step do: body colour (fills, art) | `#FFD23F` | `--kc-yellow-400` |
| `--color-step-do-tint` | Step do: background tint | `#FFF5CC` | `--kc-yellow-100` |
| `--color-step-do-ink` | Step do: text on tint/page | `#735200` | `--kc-yellow-700` |
| `--color-step-earn` | Step earn: body colour (fills, art) | `#5B9BF5` | `--kc-blue-400` |
| `--color-step-earn-tint` | Step earn: background tint | `#E3EEFE` | `--kc-blue-100` |
| `--color-step-earn-ink` | Step earn: text on tint/page | `#1F4FA8` | `--kc-blue-700` |
| `--color-step-save` | Step save: body colour (fills, art) | `#FF8A75` | `--kc-coral-400` |
| `--color-step-save-tint` | Step save: background tint | `#FFE6E0` | `--kc-coral-100` |
| `--color-step-save-ink` | Step save: text on tint/page | `#A93A26` | `--kc-coral-700` |
| `--color-step-choose` | Step choose: body colour (fills, art) | `#7DD9B0` | `--kc-mint-400` |
| `--color-step-choose-tint` | Step choose: background tint | `#E2F6EC` | `--kc-mint-100` |
| `--color-step-choose-ink` | Step choose: text on tint/page | `#146B4A` | `--kc-mint-700` |
| `--color-step-grow` | Step grow: body colour (fills, art) | `#A890F0` | `--kc-lavender-400` |
| `--color-step-grow-tint` | Step grow: background tint | `#EEE8FD` | `--kc-lavender-100` |
| `--color-step-grow-ink` | Step grow: text on tint/page | `#5636B8` | `--kc-lavender-700` |
| `--radius-control` | Inputs, small buttons, chips in rows | `14px` | `--kc-radius-md` |
| `--radius-tile` | List tiles, task rows | `20px` | `--kc-radius-lg` |
| `--radius-card` | Cards | `24px` | `--kc-radius-xl` |
| `--radius-sheet` | Hero cards, modals | `32px` | `--kc-radius-2xl` |
| `--radius-pill` | Pills, buttons, avatars | `999px` | `--kc-radius-full` |
| `--shadow-card` | Resting card | `0 1px 2px rgba(11, 26, 58, 0.04), 0 12px 32px -18px rgba(11, 26, 58, 0.22)` | `--kc-shadow-1` |
| `--shadow-lift` | Hover / raised surface, bottom nav | `0 2px 4px rgba(11, 26, 58, 0.05), 0 18px 40px -18px rgba(11, 26, 58, 0.30)` | `--kc-shadow-2` |
| `--shadow-sheet` | Modal | `0 30px 60px -20px rgba(11, 26, 58, 0.40)` | `--kc-shadow-3` |
| `--shadow-action` | Glow under gold actions | `0 10px 22px -10px rgba(229, 168, 0, 0.75)` | `--kc-shadow-gold` |
| `--font-display` | Headings, numbers, button labels | `var(--font-brand-display), "Nunito", system-ui, sans-serif` | `--kc-font-display` |
| `--font-body` | Body, descriptions, meta | `var(--font-brand-body), "Nunito Sans", system-ui, sans-serif` | `--kc-font-body` |
| `--text-display` | Type role: display size | `3rem` | `--kc-font-size-48` |
| `--text-display--line-height` | Line height for the size above | `1.1` | `--kc-leading-tight` |
| `--text-title` | Type role: title size | `1.5rem` | `--kc-font-size-24` |
| `--text-title--line-height` | Line height for the size above | `1.3` | `--kc-leading-snug` |
| `--text-body` | Type role: body size | `1rem` | `--kc-font-size-16` |
| `--text-body--line-height` | Line height for the size above | `1.5` | `--kc-leading-normal` |
| `--text-label` | Type role: label size | `0.875rem` | `--kc-font-size-14` |
| `--text-label--line-height` | Line height for the size above | `1.3` | `--kc-leading-snug` |
| `--text-caption` | Type role: caption size | `0.75rem` | `--kc-font-size-12` |
| `--text-caption--line-height` | Line height for the size above | `1.3` | `--kc-leading-snug` |
| `--spacing-tap` | Minimum tap target (44×44) | `44px` | `--kc-space-11` |
| `--spacing-tap-gap` | Minimum gap between adjacent targets | `8px` | `--kc-space-2` |
| `--spacing-safe-top` | Safe-area inset (standalone PWA) | `env(safe-area-inset-top, 0px)` | n/a |
| `--spacing-safe-right` | Safe-area inset | `env(safe-area-inset-right, 0px)` | n/a |
| `--spacing-safe-bottom` | Safe-area inset | `env(safe-area-inset-bottom, 0px)` | n/a |
| `--spacing-safe-left` | Safe-area inset | `env(safe-area-inset-left, 0px)` | n/a |
| `--breakpoint-ipad` | iPad portrait layout (primary) | `48rem` | n/a |
| `--breakpoint-ipad-landscape` | iPad landscape layout (primary) | `64rem` | n/a |
| `--breakpoint-desktop` | Desktop fallback | `80rem` | n/a |
| `--ease-out-soft` | Default easing | `cubic-bezier(0.22, 1, 0.36, 1)` | `--kc-ease-out` |
| `--ease-spring` | Celebration / modal entrance (overshoot) | `cubic-bezier(0.2, 1.2, 0.4, 1)` | `--kc-ease-spring` |
| `--duration-fast` | Hover, press, toggles | `150ms` | `--kc-duration-fast` |
| `--duration-base` | Modals, toasts | `250ms` | `--kc-duration-base` |
| `--duration-slow` | Progress fills | `500ms` | `--kc-duration-slow` |

### Tier 3: component tokens

| Token | Role | Light value | Resolves via |
|---|---|---|---|
| `--spacing-sidebar` | Kid sidebar width | `232px` | `--kc-space-58` |
| `--spacing-bottom-nav` | Space reserved for the phone tab bar | `80px` | `--kc-space-20` |
| `--spacing-bar-bottom` |  | `calc(var(--kc-space-4) + env(safe-area-inset-bottom, 0px))` | n/a |
| `--spacing-toast-offset` |  | `calc(var(--kc-space-8) + env(safe-area-inset-bottom, 0px))` | n/a |
| `--spacing-above-nav` |  | `calc(var(--kc-space-20) + env(safe-area-inset-bottom, 0px))` | n/a |
| `--coin-mark-highlight` | KidCoinMark paint: highlight | `#FFE38A` | `--kc-gold-300` |
| `--coin-mark-body` | KidCoinMark paint: body | `#FFC93C` | `--kc-gold-400` |
| `--coin-mark-rim` | KidCoinMark paint: rim | `#E5A800` | `--kc-gold-600` |
| `--coin-mark-visor-top` | KidCoinMark paint: visor-top | `#1B2D57` | `--kc-navy-800` |
| `--coin-mark-visor` | KidCoinMark paint: visor | `#0B1A3A` | `--kc-navy-900` |
| `--coin-mark-eye` | KidCoinMark paint: eye | `#FFE27A` | `--kc-yellow-300` |
| `--coin-mark-ring` | KidCoinMark paint: ring | `#FFF4D1` | `--kc-gold-100` |
| `--coin-mark-gloss` | KidCoinMark paint: gloss | `#FFFFFF` | `--kc-white` |

### Tier 1: primitives

| Token | Role | Light value | Resolves via |
|---|---|---|---|
| `--kc-navy-950` | navy 950 | `#071230` | n/a |
| `--kc-navy-900` | navy 900 | `#0B1A3A` | n/a |
| `--kc-navy-800` | navy 800 | `#1B2D57` | n/a |
| `--kc-navy-700` | navy 700 | `#2A3E6B` | n/a |
| `--kc-navy-600` | navy 600 | `#4A5672` | n/a |
| `--kc-navy-500` | navy 500 | `#7C869C` | n/a |
| `--kc-navy-300` | navy 300 | `#B8BFCE` | n/a |
| `--kc-navy-100` | navy 100 | `#E6E9F0` | n/a |
| `--kc-navy-alpha-10` | navy alpha 10 | `rgba(11, 26, 58, 0.10)` | n/a |
| `--kc-gold-100` | gold 100 | `#FFF4D1` | n/a |
| `--kc-gold-300` | gold 300 | `#FFE38A` | n/a |
| `--kc-gold-400` | gold 400 | `#FFC93C` | n/a |
| `--kc-gold-500` | gold 500 | `#F5B800` | n/a |
| `--kc-gold-600` | gold 600 | `#E5A800` | n/a |
| `--kc-gold-800` | gold 800 | `#7A5600` | n/a |
| `--kc-cream-50` | cream 50 | `#FFFDF9` | n/a |
| `--kc-cream-100` | cream 100 | `#FBF8F2` | n/a |
| `--kc-cream-200` | cream 200 | `#F4EEE2` | n/a |
| `--kc-white` | white | `#FFFFFF` | n/a |
| `--kc-yellow-100` | yellow 100 | `#FFF5CC` | n/a |
| `--kc-yellow-300` | yellow 300 | `#FFE27A` | n/a |
| `--kc-yellow-400` | yellow 400 | `#FFD23F` | n/a |
| `--kc-yellow-700` | yellow 700 | `#735200` | n/a |
| `--kc-blue-100` | blue 100 | `#E3EEFE` | n/a |
| `--kc-blue-200` | blue 200 | `#CFE3FF` | n/a |
| `--kc-blue-400` | blue 400 | `#5B9BF5` | n/a |
| `--kc-blue-700` | blue 700 | `#1F4FA8` | n/a |
| `--kc-coral-100` | coral 100 | `#FFE6E0` | n/a |
| `--kc-coral-200` | coral 200 | `#FFD3B8` | n/a |
| `--kc-coral-400` | coral 400 | `#FF8A75` | n/a |
| `--kc-coral-700` | coral 700 | `#A93A26` | n/a |
| `--kc-mint-100` | mint 100 | `#E2F6EC` | n/a |
| `--kc-mint-400` | mint 400 | `#7DD9B0` | n/a |
| `--kc-mint-700` | mint 700 | `#146B4A` | n/a |
| `--kc-mint-800` | mint 800 | `#0F5239` | n/a |
| `--kc-lavender-100` | lavender 100 | `#EEE8FD` | n/a |
| `--kc-lavender-300` | lavender 300 | `#D6CBF8` | n/a |
| `--kc-lavender-400` | lavender 400 | `#A890F0` | n/a |
| `--kc-lavender-700` | lavender 700 | `#5636B8` | n/a |
| `--kc-red-100` | red 100 | `#FDE7E4` | n/a |
| `--kc-red-700` | red 700 | `#B42318` | n/a |
| `--kc-amber-100` | amber 100 | `#FFF1D6` | n/a |
| `--kc-amber-700` | amber 700 | `#8A4B00` | n/a |
| `--kc-radius-sm` | radius sm | `10px` | n/a |
| `--kc-radius-md` | radius md | `14px` | n/a |
| `--kc-radius-lg` | radius lg | `20px` | n/a |
| `--kc-radius-xl` | radius xl | `24px` | n/a |
| `--kc-radius-2xl` | radius 2xl | `32px` | n/a |
| `--kc-radius-full` | radius full | `999px` | n/a |
| `--kc-space-1` | space 1 | `4px` | n/a |
| `--kc-space-2` | space 2 | `8px` | n/a |
| `--kc-space-3` | space 3 | `12px` | n/a |
| `--kc-space-4` | space 4 | `16px` | n/a |
| `--kc-space-6` | space 6 | `24px` | n/a |
| `--kc-space-8` | space 8 | `32px` | n/a |
| `--kc-space-11` | space 11 | `44px` | n/a |
| `--kc-space-20` | space 20 | `80px` | n/a |
| `--kc-space-58` | space 58 | `232px` | n/a |
| `--kc-shadow-1` | shadow 1 | `0 1px 2px rgba(11, 26, 58, 0.04), 0 12px 32px -18px rgba(11, 26, 58, 0.22)` | n/a |
| `--kc-shadow-2` | shadow 2 | `0 2px 4px rgba(11, 26, 58, 0.05), 0 18px 40px -18px rgba(11, 26, 58, 0.30)` | n/a |
| `--kc-shadow-3` | shadow 3 | `0 30px 60px -20px rgba(11, 26, 58, 0.40)` | n/a |
| `--kc-shadow-gold` | shadow gold | `0 10px 22px -10px rgba(229, 168, 0, 0.75)` | n/a |
| `--kc-font-size-12` | font size 12 | `0.75rem` | n/a |
| `--kc-font-size-14` | font size 14 | `0.875rem` | n/a |
| `--kc-font-size-16` | font size 16 | `1rem` | n/a |
| `--kc-font-size-18` | font size 18 | `1.125rem` | n/a |
| `--kc-font-size-20` | font size 20 | `1.25rem` | n/a |
| `--kc-font-size-24` | font size 24 | `1.5rem` | n/a |
| `--kc-font-size-30` | font size 30 | `1.875rem` | n/a |
| `--kc-font-size-36` | font size 36 | `2.25rem` | n/a |
| `--kc-font-size-48` | font size 48 | `3rem` | n/a |
| `--kc-font-size-60` | font size 60 | `3.75rem` | n/a |
| `--kc-leading-tight` | leading tight | `1.1` | n/a |
| `--kc-leading-snug` | leading snug | `1.3` | n/a |
| `--kc-leading-normal` | leading normal | `1.5` | n/a |
| `--kc-font-display` | font display | `var(--font-brand-display), "Nunito", system-ui, sans-serif` | n/a |
| `--kc-font-body` | font body | `var(--font-brand-body), "Nunito Sans", system-ui, sans-serif` | n/a |
| `--kc-duration-fast` | duration fast | `150ms` | n/a |
| `--kc-duration-base` | duration base | `250ms` | n/a |
| `--kc-duration-slow` | duration slow | `500ms` | n/a |
| `--kc-ease-out` | ease out | `cubic-bezier(0.22, 1, 0.36, 1)` | n/a |
| `--kc-ease-spring` | ease spring | `cubic-bezier(0.2, 1.2, 0.4, 1)` | n/a |
| `--kc-viewport-ipad-portrait` | viewport ipad portrait | `48rem` | n/a |
| `--kc-viewport-ipad-landscape` | viewport ipad landscape | `64rem` | n/a |
| `--kc-viewport-desktop` | viewport desktop | `80rem` | n/a |

### Persisted colour names

| Token | Role | Light value | Resolves via |
|---|---|---|---|
| `--color-mint` | Persisted avatar/character colour (stored in the DB; never rename) | `#7DD9B0` | `--kc-mint-400` |
| `--color-peach` | Persisted avatar/character colour (stored in the DB; never rename) | `#FFD3B8` | `--kc-coral-200` |
| `--color-lemon` | Persisted avatar/character colour (stored in the DB; never rename) | `#FFE27A` | `--kc-yellow-300` |
| `--color-coral` | Persisted avatar/character colour (stored in the DB; never rename) | `#FF8A75` | `--kc-coral-400` |
| `--color-sky` | Persisted avatar/character colour (stored in the DB; never rename) | `#CFE3FF` | `--kc-blue-200` |
| `--color-lav` | Persisted avatar/character colour (stored in the DB; never rename) | `#D6CBF8` | `--kc-lavender-300` |
| `--color-lav-pale` | Persisted avatar/character colour (stored in the DB; never rename) | `#EEE8FD` | `--kc-lavender-100` |

### Measured contrast (WCAG 2.1)

| Foreground | Background | Use | Ratio | Needs | Result |
|---|---|---|---|---|---|
| `--color-fg` | `--color-page` | Body text on the page | 16.20:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-surface` | Body text on cards | 16.90:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-surface-sunken` | Text in wells / hover fills | 14.86:1 | 4.5:1 | ✅ pass |
| `--color-fg-muted` | `--color-page` | Secondary text on the page | 6.91:1 | 4.5:1 | ✅ pass |
| `--color-fg-muted` | `--color-surface` | Secondary text on cards | 7.21:1 | 4.5:1 | ✅ pass |
| `--color-fg-muted` | `--color-surface-sunken` | Secondary text in wells | 6.34:1 | 4.5:1 | ✅ pass |
| `--color-on-action` | `--color-action` | Primary button label | 9.60:1 | 4.5:1 | ✅ pass |
| `--color-on-action` | `--color-action-hover` | Primary button label (hover) | 11.18:1 | 4.5:1 | ✅ pass |
| `--color-on-action` | `--color-action-pressed` | Primary button label (pressed) | 8.12:1 | 4.5:1 | ✅ pass |
| `--color-on-action-secondary` | `--color-action-secondary` | Secondary button label | 17.17:1 | 4.5:1 | ✅ pass |
| `--color-on-action-secondary` | `--color-action-secondary-hover` | Secondary button label (hover) | 13.47:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-coin` | Text on coin/streak badges | 9.60:1 | 4.5:1 | ✅ pass |
| `--color-success` | `--color-success-tint` | Success message | 5.76:1 | 4.5:1 | ✅ pass |
| `--color-success` | `--color-page` | Success text (e.g. +coins) | 6.13:1 | 4.5:1 | ✅ pass |
| `--color-warning` | `--color-warning-tint` | Warning message | 6.09:1 | 4.5:1 | ✅ pass |
| `--color-error` | `--color-error-tint` | Error message | 5.55:1 | 4.5:1 | ✅ pass |
| `--color-error` | `--color-page` | Inline field error | 6.20:1 | 4.5:1 | ✅ pass |
| `--color-step-do-ink` | `--color-step-do-tint` | Do label on its tint | 6.53:1 | 4.5:1 | ✅ pass |
| `--color-step-earn-ink` | `--color-step-earn-tint` | Earn label on its tint | 6.54:1 | 4.5:1 | ✅ pass |
| `--color-step-save-ink` | `--color-step-save-tint` | Save label on its tint | 5.32:1 | 4.5:1 | ✅ pass |
| `--color-step-choose-ink` | `--color-step-choose-tint` | Choose label on its tint | 5.76:1 | 4.5:1 | ✅ pass |
| `--color-step-grow-ink` | `--color-step-grow-tint` | Grow label on its tint | 6.73:1 | 4.5:1 | ✅ pass |
| `--color-step-do-ink` | `--color-page` | Do label on the page | 6.75:1 | 4.5:1 | ✅ pass |
| `--color-step-earn-ink` | `--color-page` | Earn label / link on the page | 7.22:1 | 4.5:1 | ✅ pass |
| `--color-step-save-ink` | `--color-page` | Save label on the page | 5.97:1 | 4.5:1 | ✅ pass |
| `--color-step-choose-ink` | `--color-page` | Choose label on the page | 6.13:1 | 4.5:1 | ✅ pass |
| `--color-step-grow-ink` | `--color-page` | Grow label on the page | 7.57:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-step-do-tint` | Body text on Do tiles | 15.69:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-step-earn-tint` | Body text on Earn tiles | 14.66:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-step-save-tint` | Body text on Save tiles | 14.43:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-step-choose-tint` | Body text on Choose tiles | 15.23:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-step-grow-tint` | Body text on Grow tiles | 14.39:1 | 4.5:1 | ✅ pass |
| `--color-fg-muted` | `--color-step-grow-tint` | Secondary text on Grow tiles (lowest of the tints) | 6.14:1 | 4.5:1 | ✅ pass |
| `--color-focus` | `--color-page` | Focus ring on the page | 7.22:1 | 3:1 | ✅ pass |
| `--color-focus` | `--color-surface` | Focus ring on cards | 7.54:1 | 3:1 | ✅ pass |
| `--color-edge` | `--color-surface` | Input / toggle outline on cards | 3.60:1 | 3:1 | ✅ pass |
| `--color-edge` | `--color-page` | Input / toggle outline on the page | 3.45:1 | 3:1 | ✅ pass |
| `--color-success` | `--color-surface-sunken` | Toggle 'on' track vs off track | 5.62:1 | 3:1 | ✅ pass |
| `--color-fg-inverse` | `--color-success` | Check mark / thumb on success fill | 6.50:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-step-do` | Step number on its body colour (StepBadge) | 11.89:1 | 3:1 | ✅ pass |
| `--color-fg` | `--color-step-earn` | Step number on Earn body colour | 6.09:1 | 3:1 | ✅ pass |
| `--color-fg` | `--color-step-save` | Step number on Save body colour | 7.48:1 | 3:1 | ✅ pass |
| `--color-fg` | `--color-step-choose` | Step number on Choose body colour | 10.16:1 | 3:1 | ✅ pass |
| `--color-fg` | `--color-step-grow` | Step number on Grow body colour | 6.47:1 | 3:1 | ✅ pass |
| `--color-fg` | `--color-mint` | Avatar initial on persisted Mint | 10.16:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-peach` | Avatar initial on persisted Peach | 12.48:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-lemon` | Avatar initial on persisted Lemon | 13.42:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-coral` | Avatar initial on persisted Coral | 7.48:1 | 4.5:1 | ✅ pass |
| `--color-fg` | `--color-sky` | Avatar initial on persisted Sky | 13.15:1 | 4.5:1 | ✅ pass |
<!-- GENERATED:END -->
