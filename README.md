# kid-coins
a web app teaches children responsibility and financial basics through fun daily tasks and gamified rewards. Kids complete chores, homework, hygiene routines or self-care activities to earn coins, which can later be converted to real money or rewards. The app combines education with motivation

Design Inspired: https://dribbble.com/shots/27139208-Kids-Educational-App-Branding

## Development

pnpm + Turborepo monorepo. The Next.js app lives in `apps/web`.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase / Anthropic keys
pnpm dev                                        # http://localhost:3000
pnpm check                                      # lint, typecheck, test, build (same as CI)
```

See `AGENTS.md` for the full guide.
