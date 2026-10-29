---
name: db-migrations
description: >-
  How to change the database schema in Earnie. Load this whenever you add or alter
  a table or column, change a Drizzle type, or need to generate/apply a migration.
  The Drizzle schema in src/lib/schema.ts is the single source of truth for DB types;
  never hand-edit generated SQL or migrate outside the pnpm scripts.
---

# Database migrations

Runtime database is a **SQLite** file at `SQLITE_PATH` via **Drizzle ORM** (better-sqlite3).
Offline data transfer from the legacy Postgres database is `pnpm db:export:postgres`
then `pnpm db:sqlite:import` (see `docs/SQLITE-MIGRATION.md`).

## Reference files

| Thing | File |
|---|---|
| Schema — single source of truth for DB types | `src/lib/sqlite/schema.ts` |
| Drizzle client | `src/lib/db.ts` |
| Drizzle Kit config | `drizzle.sqlite.config.ts` |
| Generated migrations (do not hand-edit) | `drizzle-sqlite/` |
| Legacy Postgres schema + history (transfer only) | `src/lib/schema.ts`, `drizzle/` |

Shared TypeScript types derive from the schema — see `src/types/index.ts`.

## Workflow — to add a column or table

1. Edit the schema in `src/lib/sqlite/schema.ts`.
2. `pnpm db:sqlite:generate` — creates a migration file in `drizzle-sqlite/`.
3. `pnpm db:sqlite:migrate` — applies it (requires an absolute `SQLITE_PATH`).

Other DB commands: `pnpm db:sqlite:studio` opens Drizzle Studio (DB GUI) on `SQLITE_PATH`; `pnpm db:studio` is the legacy Postgres GUI.

## Rules

- **Never** hand-write or hand-edit the SQL in `drizzle/` or `drizzle-sqlite/` — it is generated from
  the schema. If the SQL is wrong, fix `schema.ts` and regenerate.
- Any code that mutates a coin balance or reward stock as part of a schema-touching
  change must still obey the `financial-safety` skill — schema changes don't exempt
  you from the atomic-write helpers.
- If a schema change alters money math or record status transitions, update the
  affected route/lib tests (see the `testing` skill).
