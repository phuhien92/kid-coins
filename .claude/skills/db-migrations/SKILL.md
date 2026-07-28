---
name: db-migrations
description: >-
  How to change the database schema in Earnie. Load this whenever you add or alter
  a table or column, change a Drizzle type, or need to generate/apply a migration.
  The Drizzle schema in src/lib/schema.ts is the single source of truth for DB types;
  never hand-edit generated SQL or migrate outside the pnpm scripts.
---

# Database migrations

Database is **Supabase (Postgres)** via **Drizzle ORM** (postgres-js driver).

## Reference files

| Thing | File |
|---|---|
| Schema — single source of truth for DB types | `src/lib/schema.ts` |
| Drizzle client | `src/lib/db.ts` |
| Drizzle Kit config | `drizzle.config.ts` |
| Generated migrations (do not hand-edit) | `drizzle/` |

Shared TypeScript types derive from the schema — see `src/types/index.ts`.

## Workflow — to add a column or table

1. Edit the schema in `src/lib/schema.ts`.
2. `pnpm db:generate` — creates a migration file in `drizzle/`.
3. `pnpm db:migrate` — applies it (requires `DATABASE_URL`).

Other DB commands: `pnpm db:studio` opens Drizzle Studio (DB GUI).

## Rules

- **Never** hand-write or hand-edit the SQL in `drizzle/` — it is generated from
  the schema. If the SQL is wrong, fix `schema.ts` and regenerate.
- `DATABASE_URL` for serverless must be the Supabase **transaction pooler**
  connection string.
- Any code that mutates a coin balance or reward stock as part of a schema-touching
  change must still obey the `financial-safety` skill — schema changes don't exempt
  you from the atomic-write helpers.
- If a schema change alters money math or record status transitions, update the
  affected route/lib tests (see the `testing` skill).
