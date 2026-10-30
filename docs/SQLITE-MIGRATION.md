# SQLite migration — staged delivery

Slice 1 adds a disk-backed schema and initializer for all 14 application tables;
slice 2 adds an offline Postgres → SQLite data transfer; slice 3a mirrors the Postgres
relational-query relations in the SQLite schema (a parity test compares them) and adds
the `src/test/sqlite.ts` temporary-database harness. Slice 3b switches the running app
to SQLite at `SQLITE_PATH` (migrate it before `pnpm start`); parent login still uses
Supabase Auth and refresh behavior is unchanged. The export only reads its
source; no command writes to Postgres. Keep `drizzle/` and `drizzle.config.ts` as the
reproducible Postgres history throughout the transfer.

## Initialize a development database

Use Node 22 (the CI version) and pnpm 9. Install dependencies with `pnpm install`.
The pinned Drizzle 0.45.2 provides the direct `better-sqlite3` adapter; it has no
`node:sqlite` adapter, so this slice adds the native driver without an ORM upgrade.
The parent directory must already exist; choose private persistent storage outside
the checkout, `.next`, `out`, and other build output. Run from the repository root:

```sh
SQLITE_PATH=/absolute/persistent/earnie.sqlite pnpm db:sqlite:migrate
pnpm db:sqlite:generate  # after editing src/lib/sqlite/schema.ts; generated SQL only
```

Migration replay preserves existing rows. `SQLITE_PATH` must be passed explicitly;
neither importing the module nor building Next opens a database. Connections enable
foreign keys, WAL, FULL synchronization and a five-second busy timeout.
UUIDs remain text; new ORM inserts generate UUIDs in Node. Explicit existing IDs
are preserved. Dates use UTC epoch milliseconds and round-trip as `Date` objects;
booleans use integers and JSON uses text with Drizzle conversion. SQLite checks
enforce enums, nonnegative integer balances and stock. Auth UIDs and PIN
hashes retain their text columns. These files contain sensitive family information.

## Transfer existing data

Stop app writers first so the snapshot is final. Both paths must be absolute and new:

```sh
DATABASE_URL=postgres://... pnpm db:export:postgres /secure/dir/family.export.json
SQLITE_PATH=/persistent/earnie.sqlite pnpm db:sqlite:import /secure/dir/family.export.json
```

The export reads all 14 tables in one read-only, repeatable-read transaction and
writes versioned JSON (`earnie-sqlite-transfer` v1, mode 600). It keeps IDs,
relationships, auth UIDs, PIN hashes, balances, stock and payloads; dates become ISO
UTC strings at the millisecond precision the app already reads. The import validates
every table, column and value type, then migrates a private sibling file and inserts
all rows in one transaction. It checks row counts, `integrity_check` and
`foreign_key_check` before hard-linking the file into place. An existing target or
`-wal`/`-shm`/`-journal` sidecar is refused untouched, and any failure leaves nothing at
`SQLITE_PATH`. The target directory must support hard links. Delete the export once the import is verified.

## Transactions and their tests

Transactions are synchronous better-sqlite3 transactions: callbacks never await, so
each runs to completion before another request's statements, and a thrown error rolls
it back. Money helpers keep their SQL guards (`max(0, …)` replaces `GREATEST`).
Slice 3c tests them on real temporary databases: the helpers in `src/lib/*.test.ts`,
and authorization, tenant isolation, duplicate and concurrent approvals, spends, jar
moves and interest runs in `src/app/api/sqlite-boundary.test.ts`.

## Remaining slices (each validated before stacking)

1. Verify refresh behavior and replace any Postgres subscriptions with the smallest
   equivalent refresh; complete end-to-end cutover verification and operational docs.

Database portability will still require Supabase Auth for parent login; kid sessions
and PIN authorization stay intact. Target one persistent Node instance with a local
persistent volume. Ephemeral/serverless disks cannot retain this database. The existing
`vercel.json` weekly interest cron needs a later hosting/scheduler decision; no deployment
or production migration is included here.

## Backup, restore and moving files

Stop all app, CLI and scheduler writers before copying or restoring. Close every
SQLite connection so WAL is checkpointed; if journal, `-wal` or `-shm` files remain,
keep the database and its sidecars together from that same stopped state. Never copy
only the main file while a WAL writer is running, or mix sidecars from different
backups. For online backups use SQLite's backup API. Restore into an unused location,
verify `PRAGMA integrity_check` and `PRAGMA foreign_key_check`, then point the stopped
app at the restored file. Protect backups/exports like secrets and keep them out of Git.

Driver references: [Drizzle SQLite](https://orm.drizzle.team/docs/get-started-sqlite),
[better-sqlite3](https://github.com/WiseLibs/better-sqlite3).
The installed Next 16.2.9 `serverExternalPackages` guide lists automatic native handling.
