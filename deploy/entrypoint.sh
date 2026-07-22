#!/usr/bin/env bash
set -euo pipefail

if [[ "${WAIT_FOR_DATABASE:-true}" == "true" ]]; then
  DB_HOST="${DB_HOST:-postgres}"
  DB_PORT="${DB_PORT:-5432}"
  echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
  until nc -z "$DB_HOST" "$DB_PORT"; do sleep 2; done
fi

if [[ "${RUN_DATABASE_MIGRATIONS:-false}" == "true" ]]; then
  echo "Applying Prisma migrations..."
  pnpm --filter @soundz/database db:deploy
fi

exec "$@"
