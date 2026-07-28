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

Act as a Senior Staff Frontend Engineer targeting **WCAG 2.2 AA** and a reusable
design-system API.

## Reference implementations — read these first

| Pattern | Canonical file |
|---|---|
| Structural page primitive (never hand-roll page layout divs) | `src/components/ui/Page/Page.tsx` |
| Interactive component built on Base UI (focus trap, ARIA, transitions) | `src/components/ui/Modal/Modal.tsx`, `src/components/ui/Toggle/`, `src/components/ui/Tabs/` |
| `className` merge helper | `cn()` in `src/lib/utils.ts` |
| The full token set (colors, radius, shadow, fonts) | `@theme` block in `src/app/globals.css`, catalogued in `DESIGN.md` |
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

- All interactive primitives (dialogs, tabs, toggles, selects, etc.) must be built on **Base UI** (`@base-ui-components/react`). Import subpaths: `@base-ui-components/react/dialog`, `/tabs`, `/switch`, etc.
- Never hand-roll focus trapping, keyboard navigation, or ARIA roles for components that Base UI already covers. The existing `Modal`, `Toggle`, and `Tabs` are already Base UI-backed — use and extend them, don't duplicate.
- When adding a new interactive component type (select, popover, tooltip, etc.), check Base UI first and wrap it with Earnie's design tokens.

## Tokens & styling

- Use Tailwind utility classes that match token names exactly (`bg-cream`, `text-ink`, `rounded-card`, `font-display`, etc.). Never hardcode hex values or pixel sizes.
- **Never use arbitrary bracket syntax.** `bg-[#f3f4f6]`, `p-[13px]`, `w-[32vw]` are all forbidden. Every size, color, spacing, and radius value must map to a token in `globals.css` or a Tailwind scale step.
- Dark variants for interactive states: `bg-green` → `hover:bg-green-dk`; focus rings use `focus-visible:ring-purple` (parent) or `focus-visible:ring-green` (kid).

### Token quick reference

- Backgrounds: `bg-cream`, `bg-cream-card`
- Text: `text-ink`, `text-ink-soft`
- Kid CTA (green): `bg-green`, `bg-green-dk`, `text-green`, `bg-green-tint`
- Parent CTA (purple): `bg-purple`, `bg-purple-dk`
- Coins: `bg-coin`, `text-coin`, `bg-coin-dk`
- Radius: `rounded-card` (16px), `rounded-control` (10px), `rounded-pill`
- Shadow: `shadow-card` — Fonts: `font-display` (Fredoka), `font-body` (Nunito)

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
3. All colors and sizes trace back to a token in `globals.css`.
4. Every new component ships with a colocated `*.test.tsx` (see the `testing` skill).
