#!/usr/bin/env bash
# Apply Drizzle migrations to production. Requires explicit DATABASE_URL.
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: Set DATABASE_URL to your production direct connection first."
  echo ""
  echo "  export DATABASE_URL='postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres'"
  echo "  pnpm db:migrate:prod"
  exit 1
fi

if [[ "$DATABASE_URL" == *"127.0.0.1"* ]] || [[ "$DATABASE_URL" == *"localhost"* ]]; then
  echo "ERROR: DATABASE_URL points at localhost — use db-migrate:local for local dev."
  exit 1
fi

# Show target host only (never print credentials)
HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^/:]+).*|\1|')
echo "About to run Drizzle migrations against: $HOST"
echo ""
read -r -p "Type 'migrate-production' to continue: " CONFIRM
if [[ "$CONFIRM" != "migrate-production" ]]; then
  echo "Aborted."
  exit 1
fi

pnpm exec drizzle-kit migrate
