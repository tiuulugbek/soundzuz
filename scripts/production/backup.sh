#!/usr/bin/env sh
# Soundz — production zaxira nusxasi.
#
# Oladi: PostgreSQL dump, Redis snapshot, yuklangan media fayllar va .env nusxasi.
# Media ALBATTA kerak: `local` drayverda rasmlar faqat `media_storage` volume'ida
# turadi, ya'ni baza dump'i o'zi ularni tiklamaydi.
#
# Ishlatish:  cd /var/www/soundz-new && sh scripts/production/backup.sh
# Cron:       har kuni — `crontab -l` bilan ko'ring.
set -eu

cd "$(dirname "$0")/../.."

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE="docker compose --env-file $ENV_FILE -f docker-compose.production.yml"
BACKUP_DIR=${BACKUP_DIR:-./backups}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
TARGET="$BACKUP_DIR/$STAMP"

mkdir -p "$TARGET"

# Yarim yozilgan zaxira "bor" deb qolmasligi uchun: xato bo'lsa papka o'chiriladi.
cleanup_on_failure() {
  rc=$?
  if [ "$rc" -ne 0 ]; then
    printf 'ZAXIRA MUVAFFAQIYATSIZ (kod %s) — chala papka o%s chirildi: %s\n' "$rc" "'" "$TARGET" >&2
    rm -rf "$TARGET"
  fi
  exit "$rc"
}
trap cleanup_on_failure EXIT

# --- PostgreSQL -------------------------------------------------------------
$COMPOSE exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$TARGET/database.dump"

# Dump haqiqatan o'qiladimi? Buzuq faylni zaxira deb hisoblamaymiz.
# `pg_restore --list` custom formatda SEEK qiladi — shu sabab quvur (stdin) emas,
# konteynerga nusxalangan HAQIQIY fayl ustida tekshiriladi.
$COMPOSE cp "$TARGET/database.dump" postgres:/tmp/backup-verify.dump
if ! $COMPOSE exec -T postgres pg_restore --list /tmp/backup-verify.dump > /dev/null 2>&1; then
  $COMPOSE exec -T postgres rm -f /tmp/backup-verify.dump || true
  echo "database.dump o'qib bo'lmadi — zaxira yaroqsiz" >&2
  exit 1
fi
$COMPOSE exec -T postgres rm -f /tmp/backup-verify.dump

# --- Redis ------------------------------------------------------------------
$COMPOSE exec -T redis redis-cli --rdb /data/dump.rdb >/dev/null
$COMPOSE cp redis:/data/dump.rdb "$TARGET/redis.rdb"

# --- Yuklangan media --------------------------------------------------------
# api konteyneridagi media papkasi (MEDIA_STORAGE_PATH) tar sifatida saqlanadi.
MEDIA_PATH=$(grep -E '^MEDIA_STORAGE_PATH=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
MEDIA_PATH=${MEDIA_PATH:-/app/storage/media}
if $COMPOSE exec -T api sh -c "[ -d '$MEDIA_PATH' ]" 2>/dev/null; then
  $COMPOSE exec -T api sh -c "tar -cf - -C '$MEDIA_PATH' ." > "$TARGET/media.tar"
else
  # Hali birorta rasm yuklanmagan bo'lsa — bu xato emas.
  : > "$TARGET/media.tar"
fi

# --- Muhit sozlamalari ------------------------------------------------------
cp "$ENV_FILE" "$TARGET/environment.snapshot" 2>/dev/null || true
chmod 600 "$TARGET"/* 2>/dev/null || true

# --- Eski zaxiralarni tozalash ---------------------------------------------
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} +

trap - EXIT
printf 'Zaxira tayyor: %s (%s)\n' "$TARGET" "$(du -sh "$TARGET" | cut -f1)"
