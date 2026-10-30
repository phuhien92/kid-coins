# SQLite migration — staged delivery

Slice 1 adds a disk-backed schema and initializer for all 14 application tables;
slice 2 adds an offline Postgres → SQLite data transfer; slice 3a mirrors the Postgres
relational-query relations in the SQLite schema (a parity test compares them) and adds
the `src/test/sqlite.ts` temporary-database harness. Slice 3b switches the running app
to SQLite at `SQLITE_PATH` (migrate it before `pnpm start`); parent login still uses
Supabase Auth. Slice 3c tests the money paths on real databases, and slice 4 adds
backups, a shutdown checkpoint and refresh tests. The export only reads its
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
`foreign_key_check` before hard-linking the file (mode 600) into place. An existing target or
`-wal`/`-shm`/`-journal` sidecar is refused untouched, and any failure leaves nothing at
`SQLITE_PATH`. The target directory must support hard links. Delete the export once the import is verified.

## Transactions and their tests

Transactions are synchronous better-sqlite3 transactions: callbacks never await, so
each runs to completion before another request's statements, and a thrown error rolls
it back. Money helpers keep their SQL guards (`max(0, …)` replaces `GREATEST`).
Slice 3c tests them on real temporary databases: the helpers in `src/lib/*.test.ts`,
and authorization, tenant isolation, duplicate and concurrent approvals, spends, jar
moves and interest runs in `src/app/api/sqlite-boundary.test.ts`.

## Refresh

The app never used Supabase Realtime or any Postgres subscription, so nothing needed
replacing. Screens fetch on load and after each action: kid screens read
`GET /api/kids/[id]/jars`, and the parent feed reads `GET /api/parent/approvals`.
A change shows on the other side's next fetch (opening or reloading the screen).
`src/app/api/sqlite-refresh.test.ts` checks that approvals, redemptions, interest and
jar moves come back from those endpoints on real SQLite.

## Hosting (decision still open)

Run one long-lived Node process (`pnpm start`) with `SQLITE_PATH` on a persistent local
volume, such as a home server, a small VM, or a container with a mounted volume.
Serverless and ephemeral disks lose the file, and only one app instance may open it.
Supabase Auth for parent login is still required. Before the first start, run
`pnpm db:sqlite:migrate`, and run it again after each upgrade.

The weekly interest job is the `vercel.json` cron (`POST /api/cron/accrue-interest` with
`Authorization: Bearer $CRON_SECRET`, Mondays 00:00 UTC). It only fires on Vercel, so a
self-hosted instance needs its own scheduler, for example a system cron running `curl`
with that header. Missed weeks are paid on the next run, and a repeated run pays nothing
extra. Which host and scheduler to use is still undecided. No deployment or production
migration is part of this work.

## Backup, restore and moving files

The app runs in WAL mode, so recent commits can sit in `SQLITE_PATH-wal` until a
checkpoint. Stopping `pnpm start` (SIGTERM/SIGINT) closes the connection, which
checkpoints the WAL into the main file and removes `-wal` and `-shm`. A cleanly stopped
app is therefore one file. A crash or `kill -9` leaves the sidecars; they belong to that
database, and SQLite replays them the next time it opens the file.

- **Backup (app may be running):** `SQLITE_PATH=/persistent/earnie.sqlite pnpm db:sqlite:backup /backups/earnie-2026-10-30.sqlite`.
  This uses `VACUUM INTO`, which writes one consistent snapshot that includes committed
  WAL pages. The result is a single file with mode 600 that has passed `integrity_check`
  and `foreign_key_check`. The command never overwrites an existing target or sidecar.
- **Restore:** stop the app, then run
  `SQLITE_PATH=/backups/earnie-2026-10-30.sqlite pnpm db:sqlite:backup /persistent/earnie-restored.sqlite`.
  Point `SQLITE_PATH` at the restored file and start the app. The old file stays where it
  is until you remove it.
- **Move:** stop the app and either copy with the backup command or move the main file.
  If `-wal`/`-shm` files are still there after a crash, move them with it, together and
  from the same moment. Never copy only the main file while the app is running, and never
  mix sidecars from different copies.

Backups and exports contain family data (auth UIDs, PIN hashes, balances). Keep them out
of Git (`*.sqlite*` and `*.export.json` are ignored) and off shared or public storage.

Driver references: [Drizzle SQLite](https://orm.drizzle.team/docs/get-started-sqlite),
[better-sqlite3](https://github.com/WiseLibs/better-sqlite3).
The installed Next 16.2.9 `serverExternalPackages` guide lists automatic native handling.
