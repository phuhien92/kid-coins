# Earnie Design System

Earnie is a gamified financial-literacy app for families. Children complete chores to earn virtual coins; parents approve tasks and redemptions. The UI splits cleanly into two audiences: **kid-facing** (green primary actions, playful tone) and **parent-facing** (purple primary actions, calm tone).

## Design language

- **Backgrounds**: `bg-cream` (#FBF8EF) for page and card fill; `bg-cream-card` for elevated cards
- **Text**: `text-ink` (dark, high-contrast) for headings; `text-ink-soft` (muted) for supporting text
- **Borders & shadows**: cards use a 2.5px dark border and `shadow-card` (soft drop shadow) with `rounded-card` (16px radius)
- **Controls**: inputs, toggles, chips use `rounded-control` (10px); pill-shaped elements use `rounded-pill`

## Color tokens

| Use | Token class |
|---|---|
| Kid primary action | `bg-green` / `bg-green-dk` (hover) / `text-green` / `bg-green-tint` |
| Parent primary action | `bg-purple` / `bg-purple-dk` (hover) |
| Coin / balance display | `bg-coin` / `text-coin` / `bg-coin-dk` |
| Streak / reward badge | `bg-coin` (gold/amber) |
| Lavender / status | `bg-purple` at lower opacity or dedicated lavender variant |

**Never use hex values inline.** Always use the token class names above.

## Typography

- `font-display` — Fredoka (rounded, friendly); use for headings, button labels, coin amounts, badge text
- `font-body` — Nunito (clean, readable); use for body copy, input placeholders, descriptions

Both fonts are loaded at runtime via `next/font/google`; they resolve automatically in the hosted app. In preview cards they may fall back to system sans-serif — this is expected and not a defect.

## Components

### Button
- `variant="green"` — kid primary CTA (green fill, dark border)
- `variant="purple"` — parent primary CTA (purple fill, dark border)
- `variant="ghost"` — secondary / cancel action (white fill, dark border)
- `variant="chip"` — pill-shaped tag or filter (white fill, dark border)
- `size="mini"` — compact approve/decline inline action

### Card
- Default: `bg-cream-card`, 2.5px dark border, `rounded-card`, `shadow-card`
- `compact` prop: thinner inner spacing
- No-padding (composable): slot child content flush to the edge; add your own `p-*` per section

### Modal
- Overlay dialog with backdrop. Accepts title, content slot, and confirm/cancel actions
- Confirm button: `variant="green"`; cancel: `variant="ghost"`
- Use `SmallWidth` variant for compact confirmation dialogs

### Toast
- Ephemeral notification pill: `bg-ink text-cream rounded-pill font-display`
- Appears at viewport bottom-center via `position:fixed`. Auto-dismisses after 2.2 s
- Trigger: set `visible={true}` and supply `message`; provide `onDismiss` to reset

### Badge
- `variant="streak"` — flame emoji + day count; gold/amber background
- `variant="count"` — circular coin-colored counter
- `variant="goalChip"` — pill with icon + label; green-tint background
- `variant="lavender"` — pill for status labels; muted purple background

### Input
- Single-line text entry + circular send button (green when value is non-empty)
- Placeholder: `Ask the coach…` pattern; `disabled` state: grayed border and button

### Avatar
- Circular emoji-character avatar with colored ring
- Color props: `"green"`, `"yellow"`, `"peach"`, `"pink"`, `"blue"`, `"lavender"`, `"gold"`
- Size props: `"sm"` (24px), `"md"` (40px), `"lg"` (64px)

### CoinIcon
- Gold circular SVG icon representing Earnie coins
- Sizes: `"sm"` (inline, 16px), `"md"` (24px), `"lg"` (40px)
- Commonly paired with a coin amount: `<CoinIcon size="sm" /> 450 coins`

### ProgressBar
- Horizontal pill progress bar; fill color controlled by `color` prop
- Colors: `"coin"` (gold, default), `"green"`, `"purple"`
- `small` prop for a thinner variant

### Toggle
- Standard on/off toggle; `on` state: `bg-green`; `off` state: white with dark border
- Accepts optional `label` string; `disabled` prop grays the control

## Composition patterns

- **Task card**: `<Card>` with a task title (`font-display text-ink`), coin reward (`<CoinIcon> + text-coin`), and a `<Button variant="green" size="mini">` approve action
- **Goal tracker**: `<Card>` wrapping `<ProgressBar color="coin">` beneath a goal label + `<CoinIcon>` balance
- **Streak display**: `<Badge variant="streak">` paired with a short motivational label in `font-body text-ink-soft`
- **Notification**: `<Toast>` triggered on task completion or coin credit

## What the agent should NOT do

- Do not use raw hex or RGB values for color — use token classes only
- Do not use `font-sans` or `font-serif` — always `font-display` or `font-body`
- Do not mix kid-green and parent-purple CTAs on the same surface
- Do not place `<Toast>` inside a card — it is a viewport-level overlay
