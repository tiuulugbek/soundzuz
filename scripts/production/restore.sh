#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 backups/YYYYMMDDTHHMMSSZ" >&2
  exit 2
fi

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE="docker compose --env-file $ENV_FILE -f docker-compose.production.yml"
SOURCE=$1

[ -f "$SOURCE/database.dump" ] || { echo "database.dump not found" >&2; exit 1; }

printf 'This replaces the production database. Type RESTORE to continue: '
read confirmation
[ "$confirmation" = "RESTORE" ] || { echo "Cancelled"; exit 1; }

$COMPOSE stop api worker web admin
$COMPOSE exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" --if-exists "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
cat "$SOURCE/database.dump" | $COMPOSE exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner'
$COMPOSE run --rm api pnpm db:deploy
$COMPOSE up -d api worker web admin

# Yuklangan rasmlar. `local` drayverda ular faqat volume'da turadi — bazani
# tiklashning o'zi yetarli emas, aks holda katalogdagi rasmlar yo'qoladi.
if [ -s "$SOURCE/media.tar" ]; then
  MEDIA_PATH=$(grep -E '^MEDIA_STORAGE_PATH=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
  MEDIA_PATH=${MEDIA_PATH:-/app/storage/media}
  # api sog'lom bo'lgunicha kutamiz, so'ng arxivni ichiga yozamiz.
  i=0
  while [ "$i" -lt 30 ]; do
    $COMPOSE exec -T api sh -c 'exit 0' 2>/dev/null && break
    i=$((i + 1)); sleep 2
  done
  $COMPOSE exec -T api sh -c "mkdir -p '$MEDIA_PATH' && tar -xf - -C '$MEDIA_PATH'" < "$SOURCE/media.tar"
  echo "Media fayllar tiklandi."
fi

$COMPOSE ps
