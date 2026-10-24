# SQLite migration — staged delivery

Slice 1 adds a disk-backed schema and initializer for all 14 application tables.
The running app still uses Postgres, Supabase Auth and its existing refresh behavior.
No source database is read or changed by SQLite commands. Keep `drizzle/` and
`drizzle.config.ts` as the reproducible Postgres history throughout the transfer.

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
enforce enums, nonnegative integer balances and stock bounds. Auth UIDs and PIN
hashes retain their text columns. These files contain sensitive family information.

## Remaining slices (each validated before stacking)

1. Add an explicit offline export/import format and transfer CLI: preserve every
   record, ID, relationship, hash, balance and timestamp. Refuse existing targets;
   validate all input and import atomically. Test invalid-input rollback synthetically.
2. Port money helpers and transaction callbacks coherently to the synchronous driver,
   including savings/interest, pending-state guards and dialect-specific SQL. Switch
   queries and schema relations only with authorization, tenant isolation, duplicate
   approval/spend and concurrent balance/stock tests at the existing API boundary.
   Split preparatory refactors into buildable slices if this exceeds the review limit.
3. Verify refresh behavior and replace any Postgres subscriptions with the smallest
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
