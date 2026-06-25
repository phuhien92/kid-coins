<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Earnie (kid-coins) — Agent Guide

## Project overview

Earnie is a gamified financial-literacy web app for families. Children complete chores to earn virtual coins; parents manage tasks and approve reward redemptions. The design handoff lives in `design_handoff_earnie/` — treat those HTML prototypes as the living spec.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (design tokens in `globals.css`) |
| Animations | Framer Motion |
| State | React Context (`src/context/`) |
| Database | Supabase (Postgres) via Drizzle ORM |
| Auth | Supabase Auth (parent: email/password; kid: 4-digit PIN) |
| AI Coach | Anthropic Claude (`claude-haiku-4-5-20251001`) |
| Testing | Vitest + Testing Library |
| Package manager | **pnpm** — always use `pnpm`, never npm or yarn |

## Repository layout

```
src/
├── app/
│   ├── (auth)/         # login + profile picker
│   ├── (kid)/          # kid-facing app (home, tasks, rewards, profile)
│   ├── (parent)/       # parent app (home, approvals, kids, settings)
│   └── api/            # Route handlers (tasks, coins, rewards, ai/coach)
├── components/
│   ├── ui/             # Design system primitives (Button, Card, Modal, Toast, Badge)
│   ├── kid/            # Kid-specific components
│   ├── parent/         # Parent-specific components
│   └── shared/         # Cross-app components (CoinDisplay, GoalTracker, StreakBadge)
├── lib/
│   ├── schema.ts       # Drizzle ORM schema (single source of truth for DB types)
│   ├── db.ts           # Drizzle client (postgres-js driver)
│   ├── supabase.ts     # Supabase browser + server clients
│   ├── ai.ts           # Anthropic client + model constant
│   └── utils.ts        # cn(), formatCoins(), formatDate()
├── context/            # KidContext, ParentContext providers
├── hooks/              # useCoins, useStreak, useTasks, useApprovals
├── types/              # index.ts — shared TypeScript types
└── test/               # setup.ts (Testing Library config)
drizzle/                # Generated SQL migration files
drizzle.config.ts       # Drizzle Kit config
```

## Design system

All color, radius, and shadow tokens are defined in `src/app/globals.css` under `@theme`. Use semantic names:

- **Backgrounds**: `bg-cream`, `bg-cream-card`
- **Text**: `text-ink`, `text-ink-soft`
- **Kid CTA (green)**: `bg-green`, `bg-green-dk`, `text-green`, `bg-green-tint`
- **Parent CTA (purple)**: `bg-purple`, `bg-purple-dk`
- **Coins**: `bg-coin`, `text-coin`, `bg-coin-dk`
- **Radius**: `rounded-card` (16px), `rounded-control` (10px), `rounded-pill`
- **Shadow**: `shadow-card`
- **Fonts**: `font-display` (Fredoka — headings), `font-body` (Nunito — body)

Do not add hex color values inline; always use the token classes.

## Component authoring rules

When building UI components, act as a Senior Staff Frontend Engineer targeting WCAG 2.2 AA and a reusable design-system API.

**Tokens & styling**
- Use Tailwind utility classes that match token names exactly (`bg-cream`, `text-ink`, `rounded-card`, `font-display`, etc.). Never hardcode hex values or pixel sizes.
- Dark variants for interactive states: `bg-green` → `hover:bg-green-dk`; focus rings use `focus-visible:ring-purple` (parent) or `focus-visible:ring-green` (kid).

**Component API**
- Functional components with TypeScript-typed props only.
- Always accept an optional `className` prop and merge it with `cn()` from `src/lib/utils.ts` so callers can override layout.
- Prefer composable sub-components (e.g. `<Card>` + `<Card.Header>`) over monolithic props-only components for anything beyond a simple primitive.

**Interactive states**
- Explicitly implement `:hover`, `:focus-visible`, and `:active` for every interactive element.
- Use `transition-colors` or `transition-transform` (not arbitrary durations) to animate state changes.

**Accessibility**
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.) — never `<div onClick>`.
- Add ARIA attributes where semantics are ambiguous (e.g. `aria-label` on icon-only buttons, `role="status"` on coin balance updates).
- Ensure full keyboard navigability; test tab order mentally before shipping.

## Environment variables

Copy `.env.example` → `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never expose client-side)
- `DATABASE_URL` — use the **transaction pooler** connection string from Supabase for serverless
- `ANTHROPIC_API_KEY`

## Database

Schema is in `src/lib/schema.ts` (Drizzle). To add a column or table:
1. Edit the schema
2. `pnpm db:generate` — creates a migration file in `drizzle/`
3. `pnpm db:migrate` — applies it (requires `DATABASE_URL`)

## Auth model

- **Parents** log in with email + password via Supabase Auth. Their Supabase UID is stored in `families.parentUserId`.
- **Kids** authenticate with a 4-digit PIN. PINs are hashed (bcrypt) and stored in `kidProfiles.pinHash`. Kids do not have Supabase Auth accounts.
- Auth proxy (`src/proxy.ts`) redirects unauthenticated users to `/login`.

## Testing

Use **colocated Vitest files** (`*.test.ts` / `*.test.tsx`) next to the code they test.

- Pure logic (utils, hooks, formatters): `*.test.ts`
- React components: `*.test.tsx` with Testing Library
- API routes and DB queries: mock Supabase/Drizzle at the boundary

Manual E2E passes should be narrow: identify the one user-visible behavior to verify, run the minimal path to confirm it, and stop. Do not use manual E2E as a substitute for automated tests.

```bash
pnpm test          # watch mode
pnpm test:run      # single run (CI)
pnpm test:coverage # coverage report
```

## Common commands

```bash
pnpm dev           # start dev server (localhost:3000)
pnpm build         # production build
pnpm test:run      # run all tests
pnpm db:generate   # generate Drizzle migration from schema changes
pnpm db:migrate    # apply pending migrations
pnpm db:studio     # open Drizzle Studio (DB GUI)
```

## Key patterns

- **Server Components** for data-fetching pages (parent dashboard, task lists)
- **Client Components** (`"use client"`) for anything with Framer Motion, `useState`, or event handlers
- **Optimistic UI** for task completion — update balance in KidContext immediately, then confirm via API
- **Supabase Realtime** for parent→kid sync (approval triggers balance refresh in kid session)
- **`localStorage`** persists character state (`earnie_char`) and streak; always read on mount, write on change

## Reference

- Design spec: `design_handoff_earnie/README.md`
- Interactive prototypes: `design_handoff_earnie/Earnie - *.html`
- DB schema: `src/lib/schema.ts`
- Type definitions: `src/types/index.ts`
- Product context & design principles: `PRODUCT.md`
- Full design system spec (colors, typography, elevation, components): `DESIGN.md`
