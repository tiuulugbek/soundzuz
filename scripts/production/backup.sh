#!/usr/bin/env sh
set -eu

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE="docker compose --env-file $ENV_FILE -f docker-compose.production.yml"
BACKUP_DIR=${BACKUP_DIR:-./backups}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
TARGET="$BACKUP_DIR/$STAMP"

mkdir -p "$TARGET"

$COMPOSE exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$TARGET/database.dump"
$COMPOSE exec -T redis redis-cli --rdb /data/dump.rdb >/dev/null
$COMPOSE cp redis:/data/dump.rdb "$TARGET/redis.rdb"
cp "$ENV_FILE" "$TARGET/environment.snapshot" 2>/dev/null || true
chmod 600 "$TARGET"/* 2>/dev/null || true

find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} +
printf 'Backup created: %s\n' "$TARGET"
