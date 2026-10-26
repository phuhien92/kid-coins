---
name: component-authoring
description: >-
  How to author or modify UI in Earnie — React components, pages, and design-system
  primitives. Load this BEFORE writing any JSX/TSX, adding an interactive component
  (dialog, tabs, toggle, select, popover, tooltip), touching layout, or choosing
  colors/spacing/radius classes. Covers component discovery, the Base UI headless
  foundation, design tokens (no arbitrary bracket values), the component API
  contract, interactive states, and WCAG 2.2 AA accessibility.
---

# Component authoring

> Paths below (`src/…`, `drizzle/`, `e2e/`) are relative to the app workspace, `apps/web/`.

Act as a Senior Staff Frontend Engineer targeting **WCAG 2.2 AA** and a reusable
design-system API.

## Reference implementations — read these first

| Pattern | Canonical file |
|---|---|
| Structural page primitive (never hand-roll page layout divs) | `src/components/ui/Page/Page.tsx` |
| Interactive component built on Base UI (focus trap, ARIA, transitions) | `src/components/ui/Modal/Modal.tsx`, `src/components/ui/Toggle/`, `src/components/ui/Tabs/` |
| `className` merge helper | `cn()` in `src/lib/utils.ts` |
| The full token set (colors, radius, shadow, type, touch, breakpoints) | `packages/tokens/src/semantic.css` (repo root), catalogued in `design/tokens.md`; screen rules in `design/components.md` |
| A component test that asserts on user-visible behavior | `src/components/parent/ApprovalCard.test.tsx` |

Full design-system spec (colors, typography, elevation, component inventory):
`DESIGN.md`. Design intent and the living prototypes: `design_handoff_earnie/`.

## Component discovery — check `src/components/ui/` first

- Before writing any UI layout or HTML tags, scan `src/components/ui/` for an existing match.
- Do not use raw HTML elements (`<div>`, `<button>`, `<a>`, `<input>`) when a design-system component already exists for that purpose.
- If an existing component needs a minor adjustment, **extend its props interface** rather than wrapping it in a new heavily-styled container.
- Never write `<div className="flex-1 flex flex-col">` or similar structural divs directly in pages — use `<Page>`, `<Page.Header>`, `<Page.Content>` from `src/components/ui/Page/`.
- Never write raw `<div onClick>` or hand-rolled tab buttons — use the design-system primitives.

## Headless foundation — Base UI

- All interactive primitives (dialogs, tabs, toggles, selects, etc.) must be built on **Base UI** (`@base-ui/react`). Import subpaths: `@base-ui/react/dialog`, `/tabs`, `/switch`, etc. Style Base UI state with ARIA variants (`aria-selected:`, `aria-checked:`) or the attributes the installed version actually emits (`data-active`, `data-checked`). Check `node_modules/@base-ui/react/<part>/*DataAttributes*` before you guess.
- Never hand-roll focus trapping, keyboard navigation, or ARIA roles for components that Base UI already covers. The existing `Modal`, `Toggle`, and `Tabs` are already Base UI-backed — use and extend them, don't duplicate.
- When adding a new interactive component type (select, popover, tooltip, etc.), check Base UI first and wrap it with the kid-coin design tokens.

## Tokens & styling

- Use the utility classes generated from the **semantic roles** in `@kid-coin/tokens` (`bg-page`, `text-fg`, `rounded-card`, `font-display`, …). Never hardcode hex values or pixel sizes.
- **Never use arbitrary bracket syntax.** `bg-[#f3f4f6]`, `p-[13px]`, `w-[32vw]` are all forbidden. Every size, color, spacing, and radius value must map to a token in `packages/tokens` or a Tailwind scale step. If a component needs a value no role covers, add a component token (`packages/tokens/src/components.css`).
- Interactive states: `bg-action` → `hover:bg-action-hover` → `active:bg-action-pressed`. Every focus ring is `focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2`. Selection never reuses the focus ring.
- **Touch (iPad-first):** every control is `min-h-tap` / `size-tap` (44pt), with `gap-tap-gap` (8pt) or more between adjacent controls. There are no hover-only affordances. Layouts use `ipad:` / `ipad-landscape:` / `desktop:`. Fixed bars respect the safe-area tokens. See `design/components.md`.

### Token quick reference

Full table: `design/tokens.md`.

- Surfaces: `bg-page`, `bg-surface`, `bg-surface-sunken`. Text: `text-fg`, `text-fg-muted`, `text-fg-inverse`. Lines: `border-edge` (controls, ≥3:1), `border-line` (decorative)
- Actions: `bg-action` + `text-on-action` (gold, **fill only**), `bg-action-secondary` + `text-on-action-secondary` (navy), `shadow-action`
- Money: `bg-coin`, `from-coin-hi`, `to-coin-lo`. Feedback: `text-success` / `bg-success-tint`, `text-warning` / `bg-warning-tint`, `text-error` / `bg-error-tint`
- Steps: `bg-step-{do,earn,save,choose,grow}` (fills/art), `-tint` (backgrounds), `-ink` (text). Prefer `STEP_TONES` from `@/components/ui`.
- Radius: `rounded-control` (14), `rounded-tile` (20), `rounded-card` (24), `rounded-sheet` (32), `rounded-pill`. Shadow: `shadow-card`, `shadow-lift`, `shadow-sheet`, `shadow-action`
- Touch and layout: `size-tap` / `min-h-tap`, `gap-tap-gap`, `pt-safe-top` … `pb-safe-bottom`, `ipad:`, `ipad-landscape:`, `desktop:`
- Fonts: `font-display` (Nunito), `font-body` (Nunito Sans)
- **Persisted names** (`--color-mint`, `--color-coral`, … in `persisted.css`) are DB data for avatar colours. Never rename them, and don't use them in new UI.

## Tailwind bloat prevention

- Do not generate deep trees of generic containers with long utility strings.
- If a single element needs more than 5 Tailwind utility classes, first check `src/components/ui/` for a structural primitive (Card, Page, Stack, etc.); if none fits, extract the block into a named sub-component.
- If a layout pattern appears more than once, extract it into a component in `src/components/ui/`.
- Prefer semantic HTML (`<section>`, `<article>`, `<aside>`, `<nav>`) over a plain `<div>` whenever a generic container is unavoidable.

## Component API

- Functional components with TypeScript-typed props only.
- Always accept an optional `className` prop and merge it with `cn()` from `src/lib/utils.ts` so callers can override layout.
- Prefer composable sub-components (`<Card>` + `<Card.Header>`, `<Tabs.Root>` + `<Tabs.Tab>`) over monolithic props-only components for anything beyond a simple primitive.

## Interactive states

- Explicitly implement `:hover`, `:focus-visible`, and `:active` for every interactive element.
- Use `transition-colors` or `transition-transform` (not arbitrary durations) to animate state changes.

## Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.) — never `<div onClick>`.
- Add ARIA attributes where semantics are ambiguous (`aria-label` on icon-only buttons, `role="status"` on coin balance updates).
- Ensure full keyboard navigability; test tab order mentally before shipping.

## Pre-completion checklist

1. `src/components/ui/` was checked — no existing component was reinvented.
2. Zero arbitrary bracket values introduced (no `[…]` in class strings).
3. All colors and sizes trace back to a token in `packages/tokens`.
4. Every control is at least 44pt, and nothing is hover-only.
5. Every new component ships with a colocated `*.test.tsx` (see the `testing` skill).
