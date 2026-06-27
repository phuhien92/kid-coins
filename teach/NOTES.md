# Teaching Notes

## Codebase state (as of onboarding)

- **KidContext is mocked.** `useMockKidSession()` returns hardcoded data. The real Supabase-backed implementation is the #1 pending integration task.
- **Parent app pages** exist at `src/app/parent/` (outside the `(parent)` route group — note the inconsistency vs `(kid)`).
- **`/api/ai/coach`** calls `claude-haiku-4-5-20251001`. The client (`src/lib/ai.ts`) wraps the Anthropic SDK.
- **Drizzle ORM** is the DB layer; never write raw SQL. Always run `pnpm db:generate` after schema changes.
- **`pnpm` only** — never npm or yarn in this project.

## Things that will surprise you

1. Tasks are assigned **per kid**, not per family. A `tasks` row has a `kid_id` FK.
2. Rewards are assigned **per family**, not per kid. A `rewards` row has a `family_id` FK. Multiple kids share the same reward catalog.
3. `coinTransactions` is an **immutable ledger** — never update or delete rows. Balance lives in `kidProfiles.balance` as a derived cache.
4. `characters` is 1:1 with `kidProfiles` (unique FK). It's a separate table so character state can be synced independently.
5. The `activityLog` payload field is freeform JSON — its shape depends on the `type` enum. See schema.ts comments for examples.
6. The parent optional PIN (`families.parentPinHash`) is *different* from the kid PIN (`kidProfiles.pinHash`) — same bcrypt algorithm, different purpose.

## Learning records

Add a file to `learning-records/` each time you discover something non-obvious. Format: `YYYY-MM-DD-topic.md`.
