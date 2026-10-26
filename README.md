# kid-coin

> Little wins. Big money habits.

A web app that teaches children responsibility and money basics through everyday tasks and gamified rewards. Kids complete chores, homework, hygiene routines or self-care activities to earn coins, which they can save, spend on parent-approved rewards, or convert to real money. Parents create tasks and approve what kids submit.

The product follows five steps: **Do → Earn → Save → Choose → Grow**.

It targets the web, **iPad-first, installed as a PWA** (Add to Home Screen). Phone is supported, and desktop is a fallback.

Design inspiration: https://dribbble.com/shots/27139208-Kids-Educational-App-Branding

## Repository

A pnpm + Turborepo monorepo:

| Path | What |
|---|---|
| `apps/web` | The Next.js app (workspace `web`) |
| `packages/tokens` | `@kid-coin/tokens`: design tokens (primitives → semantic roles → component tokens) as a Tailwind v4 theme, with contrast tests |
| `packages/config` | `@kid-coin/config`: shared tsconfig base |
| `design/` | Brand spec, component and screen rules, every token with measured contrast, the redesign plan |

## Development

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase / Anthropic keys
pnpm dev                                        # http://localhost:3000
pnpm check                                      # lint, typecheck, test, build (same as CI)
```

Other useful commands:

```bash
pnpm --filter @kid-coin/tokens test     # token tier + WCAG contrast checks
pnpm --filter @kid-coin/tokens report   # regenerate the tables in design/tokens.md
pnpm --filter web icons                 # rebuild PWA icons from public/brand/kid-coin-mark.svg
```

If a token change doesn't show up in `pnpm dev`, delete `apps/web/.next/dev` and restart.

## Design

Start at [`design/README.md`](design/README.md). It covers how to change a token and the iPad-first touch rules: 44pt tap targets, safe areas, no hover-only interactions, and reduced motion.

**Mascot art:** the hero and the five step robots render as placeholders until the PNGs are added. Drop them in `apps/web/public/brand/` and set `src` in `MASCOT_ART` (`apps/web/src/lib/brand.ts`).

## Deployment

Vercel, with the project's **Root Directory set to `apps/web`**. The weekly interest cron lives in `apps/web/vercel.json`.

See [`AGENTS.md`](AGENTS.md) for the full contributor and agent guide.
