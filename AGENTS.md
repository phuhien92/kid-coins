<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Earnie (kid-coins) — Agent Guide

## Project overview

Earnie is a gamified financial-literacy web app for families. Children complete chores to earn virtual coins; parents manage tasks and approve reward redemptions. The design handoff lives in `design_handoff_earnie/` — treat those HTML prototypes as the living spec.

This file is the lean index. Detailed, task-specific rules live in **skills** (`.claude/skills/`) that you load on demand — keep this file short and let the skills carry the depth.

## Skills — load the right one before you work

Read the matching skill **before** writing code in its area. Each skill carries the full rules plus a link to a canonical reference implementation to copy.

| When you're about to… | Load skill |
|---|---|
| Write or modify any component, page, layout, or styling | `component-authoring` |
| Touch a coin balance, reward stock, or approve/decline a pending record | `financial-safety` |
| Add a new component / page / hook / util / lib / route | `testing` |
| Change the DB schema or write a migration | `db-migrations` |
| Review a PR for compliance with these skills | `pr-skill-compliance` |

## Longer-form docs — dive in when relevant

| Doc | Read when |
|---|---|
| `PRODUCT.md` | You need product context or the design principles behind a feature |
| `DESIGN.md` | Full design-system spec — colors, typography, elevation, component inventory |
| `design_handoff_earnie/` | The living visual spec — HTML prototypes + `README.md` |
| `src/lib/schema.ts` | The DB schema, single source of truth for DB types |
| `src/types/index.ts` | Shared TypeScript types |
| `docs/` | Feature planning docs (e.g. `docs/PLAN-task-reward-system.md`) |

## Keeping docs honest (self-healing)

Docs and skills diverge from reality the moment code moves past them. So, in the same change that moves the code:

- **Change component conventions, tokens, or add/rename a design-system primitive** → update the `component-authoring` skill and `DESIGN.md`.
- **Change money/concurrency handling or add a balance/stock helper** → update the `financial-safety` skill (and its reference-implementation table).
- **Change the testing contract or DB workflow** → update the `testing` / `db-migrations` skill.
- **Find a rule that is wrong, missing, or outdated** → fix the skill as part of your PR; a stale rule is worse than none. Small factual corrections: just make them. Structural rewrites of a skill: flag them for human review.
- Every doc edit should leave the document **shorter or more useful**, never just longer.

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
│   ├── kid-balance.ts  # Atomic coin balance helpers — see financial-safety skill
│   ├── rewards.ts      # Reward stock helpers — see financial-safety skill
│   └── utils.ts        # cn(), formatCoins(), formatDate()
├── context/            # KidContext, ParentContext providers
├── hooks/              # useCoins, useStreak, useTasks, useApprovals
├── types/              # index.ts — shared TypeScript types
└── test/               # setup.ts (Testing Library config)
drizzle/                # Generated SQL migration files
drizzle.config.ts       # Drizzle Kit config
```

## Environment variables

Copy `.env.example` → `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never expose client-side)
- `DATABASE_URL` — use the **transaction pooler** connection string from Supabase for serverless
- `ANTHROPIC_API_KEY`

## Auth model

- **Parents** log in with email + password via Supabase Auth. Their Supabase UID is stored in `families.parentUserId`. A parent may optionally set a 4-digit PIN — hashed (bcrypt) in `families.parentPinHash` — that guards entry to the parent area from the profile picker (verified via `POST /api/parent/verify-pin`). When no PIN is set, the parent tile opens `/parent/home` directly.
- **Kids** authenticate with a 4-digit PIN. PINs are hashed (bcrypt) and stored in `kidProfiles.pinHash`. Kids do not have Supabase Auth accounts. From the (parent-authenticated) profile picker, selecting a kid issues a session token without a PIN via `POST /api/kids/[id]/session`.
- Auth proxy (`src/proxy.ts`) redirects unauthenticated users to `/login`.

## Key patterns

- **Server Components** for data-fetching pages (parent dashboard, task lists)
- **Client Components** (`"use client"`) for anything with Framer Motion, `useState`, or event handlers
- **Optimistic UI** for task completion — update balance in KidContext immediately, then confirm via API
- **Supabase Realtime** for parent→kid sync (approval triggers balance refresh in kid session)
- **`localStorage`** persists character state (`earnie_char`) and streak; always read on mount, write on change
- **Feature flags** via PostHog. When the user requests a new feature, ask if it should be gated behind a PostHog feature flag. Consult https://posthog.com/docs/feature-flags/best-practices for guidelines.

## Financial safety — the rule you cannot get wrong

Coins are real value to kids; the failure mode is silent balance corruption. **Never read-then-write a balance, never spend coins or stock you only checked before the transaction, and always guard a status transition on `status = 'pending'`.** Use the atomic helpers in `src/lib/kid-balance.ts` and `src/lib/rewards.ts` — never inline balance arithmetic. This is not summarizable away: load the **`financial-safety` skill** for the full rules, rationale, and reference implementations before touching money code.

## Common commands

```bash
pnpm dev           # start dev server (localhost:3000)
pnpm build         # production build
pnpm test:run      # run all tests
pnpm db:generate   # generate Drizzle migration from schema changes
pnpm db:migrate    # apply pending migrations
pnpm db:studio     # open Drizzle Studio (DB GUI)
```

## Branching workflow

- **`main`** — production. Deploy-ready at all times. Only merged from `develop` via PR.
- **`develop`** — integration branch. Feature branches merge here first. Must pass CI.
- **Feature branches** — branched from `develop`, merged back via PR.

```
feature/*  →  develop  →  main
```

Before merging to `main`:
- PR must have 1 approval
- All CI checks must pass (`pnpm build`, `pnpm test:run`)
- Branch must be up to date with `main`

## Reference

- Skills: `.claude/skills/` — component-authoring, financial-safety, testing, db-migrations, pr-skill-compliance
- Design spec: `design_handoff_earnie/README.md` · Full design system: `DESIGN.md`
- Product context & design principles: `PRODUCT.md`
- DB schema: `src/lib/schema.ts` · Type definitions: `src/types/index.ts`
