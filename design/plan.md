# Redesign plan

Restyle Earnie into **kid-coin** (see [brand.md](brand.md)) without changing behaviour or data flow.

## PR order (each stacked on the one before)

| # | PR | Scope |
|---|---|---|
| 1 | Monorepo | Move the app to `apps/web` under pnpm + Turborepo. A pure move with no behaviour change. |
| 2 | Design foundation (this) | `packages/tokens` (three tiers + tests), `packages/config` (shared tsconfig), and these `design/` docs. Screens are untouched; only the token layer moves, so the palette shifts onto brand primitives. |
| 3 | Screen restyle | Every screen moves onto the semantic roles, plus the logo, the mascot slots, the touch rules and the PWA setup. |

## Screens, in order

Highest-traffic screens and shared chrome go first, so later screens inherit the primitives.

1. **Shared chrome:** root layout (fonts, safe areas), the kid shell (sidebar on iPad, bottom tabs on phone), the parent page header
2. **Profile picker** (`/profile-picker`): the first screen every session sees
3. **Kid home** (`/kid/home`): balance (Earn), goal (Save), tasks promo (Do)
4. **Kid tasks + celebration** (`/kid/tasks`): Do → Earn
5. **Parent approvals** (`/parent/approvals`): Earn, money-critical, tap-heavy
6. **Parent dashboard** (`/parent/home`): step-tinted area tiles
7. **Parent tasks, kids, new-kid flow, settings**
8. **Kid profile + character studio** (Grow), **rewards** (Choose, still "coming soon")
9. **Auth:** login, signup, forgot password, verify email
10. **Landing** (`/`): the tagline hero plus the five-step story

## Components touched (`apps/web/src/components/ui`)

| Component | Change |
|---|---|
| Button | `green`/`purple` → `primary` (gold, navy label) / `secondary` (navy); pill radius; soft shadow instead of stamp; `min-h-tap`; new `ButtonLink` |
| Card | soft surface + `line` border + `shadow-card`; radius roles (`card/tile/control/sheet/pill`) |
| Badge, ProgressBar, Toggle, Tabs, Input, Modal, Toast | onto semantic roles. Tabs gets a selected state that actually shows (it was keyed on `data-selected`; Base UI emits `data-active`/`aria-selected`) |
| Avatar, InitialAvatar, CoinIcon, GoalEmojiBadge, DashedActionCard, StampedChip | soft rings instead of ink borders; tap-size hit areas |
| New: KidCoinMark / KidCoinLogo | SVG mark plus lowercase wordmark with the gold pill hyphen |
| New: StepBadge, MascotSlot | step naming plus placeholder slots for the robot PNGs |
| StampedGreenLink → PromoLink | gold promo card |

Kid shell/nav, the profile-picker tiles, the approval/task cards and the forms all move to the semantic roles, `size-tap` and the `ipad:`/`ipad-landscape:` layouts.

## Rules every screen follows

These are the touch rules from [brand.md](brand.md#platform-and-touch-rules-ipad-first-pwa):

- **Tap targets:** at least 44×44pt (`size-tap` / `min-h-tap`), with at least 8pt between them (`gap-tap-gap`).
- **Viewports:** iPad portrait (`ipad:`, 768–834) and landscape (`ipad-landscape:`, 1024–1194) are primary. Phone is the base styles. Desktop (`desktop:`) is a fallback.
- **Hover:** no hover-only interactions. Every hover affordance also exists on tap or focus.
- **Safe areas:** respect safe-area insets in standalone mode (`pt-safe-top`, `pb-safe-bottom`, …).
- **Motion:** `prefers-reduced-motion` turns off the celebration motion (confetti, coin bob, mascot float).
- **Contrast and focus:** WCAG 2.1 AA contrast, a visible focus ring, and meaning never carried by colour alone.

## Risks

| Risk | Mitigation |
|---|---|
| **Persisted colour names.** Kid avatar colours are stored as `var(--color-mint)` etc. Renaming a token breaks existing kids. | They are kept permanently in `persisted.css`, and a test asserts they exist. |
| **Palette shift before the restyle.** PR 2 re-pointed the old utility names onto brand primitives, so screens changed colour, but not layout, before PR 3. | PR 3 moved every screen onto the semantic roles and deleted the transitional aliases. Only the persisted names remain. |
| **Breakpoints can't use `var()`** inside `@media`. | They are literals, and a test checks them against the `--kc-viewport-*` primitives. |
| **Stale Turbopack dev cache** after token edits. | The fix (delete `apps/web/.next/dev`) is documented in [README](README.md). |
| **Vercel Root Directory** must become `apps/web`. | Called out in PR 1 as an owner action. |
| **Tailwind's default palette** is still available (`bg-red-600`, …). | PR 3 migrates the remaining uses. A follow-up can drop the defaults with `--color-*: initial`. |

## Deferred
- **`packages/ui`:** shared components stay in `apps/web/src/components/ui`. Extract a `packages/ui` only once a **second consumer** exists (for example, an Expo `apps/mobile`). Until then it adds build and versioning cost and removes no duplication.
- **Native app:** deferred. If it happens, it would be Expo under `apps/mobile`, consuming `packages/tokens` (the typed TS export is the start of that).
- **Dark mode:** the roles are named so a dark theme can be added as a second set of role values. Not in scope.
- **PWA service worker, offline mode and push notifications:** after PR 3's manifest and icons.
- **Features the brand implies** (in PR 3's follow-ups): the Choose shop, a richer Save goal flow, Grow family prompts.
