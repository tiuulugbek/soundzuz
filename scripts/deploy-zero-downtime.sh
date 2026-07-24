#!/usr/bin/env bash
# Soundz — 502'siz, uzilishsiz production deploy.
#
# Kafolatlar:
#  - `docker compose down` ISHLATILMAYDI, volume/bazaga tegilmaydi.
#  - Migratsiya faqat `prisma migrate deploy` (production-safe), servis start'idan OLDIN.
#  - Yangi konteynerlar HEALTHY bo'lgach gina davom etadi; aks holda AVTOMATIK ROLLBACK.
#  - Deploy oxirida gateway Nginx reload qilinadi — yangi web IP resolve bo'ladi (502 yo'q).
#  - Yakunda new.soundz.uz + API health tekshiriladi.
#
# Ishlatish:  cd /var/www/soundz-new && bash scripts/deploy-zero-downtime.sh
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
GATEWAY="${GATEWAY:-soundz-alt-gateway}"       # web'ga proxy qiluvchi Docker Nginx konteyner nomi
SITE_URL="${SITE_URL:-https://new.soundz.uz}"
DC="docker compose --env-file ${ENV_FILE} -f ${COMPOSE_FILE}"

c(){ printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn(){ printf '\033[1;33m  ! %s\033[0m\n' "$*"; }

[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }
set -a; . "./$ENV_FILE"; set +a
: "${IMAGE_NAME:?IMAGE_NAME kerak}"; : "${IMAGE_TAG:?IMAGE_TAG kerak}"

# Rollback uchun joriy (ishlab turgan) image ID'sini saqlaymiz.
PREV_IMAGE="$(docker inspect --format '{{.Image}}' "$($DC ps -q api 2>/dev/null | head -1)" 2>/dev/null || true)"

wait_healthy(){ # $1=service  $2=tries
  local svc="$1" tries="${2:-40}" cid st
  for _ in $(seq 1 "$tries"); do
    cid="$($DC ps -q "$svc" 2>/dev/null | head -1)"
    if [ -n "$cid" ]; then
      st="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || echo starting)"
      if [ "$st" = "healthy" ] || { [ "$st" = "running" ] && ! docker inspect --format '{{if .State.Health}}has{{end}}' "$cid" | grep -q has; }; then
        echo "  $svc: $st"; return 0
      fi
    fi
    sleep 3
  done
  echo "  $svc HEALTHY bo'lmadi"; return 1
}

reload_gateway(){
  if docker ps --format '{{.Names}}' | grep -qx "$GATEWAY"; then
    c "Gateway ($GATEWAY) reload — yangi web IP resolve"
    docker exec "$GATEWAY" nginx -t 2>/dev/null && docker exec "$GATEWAY" nginx -s reload 2>/dev/null \
      || docker restart "$GATEWAY" >/dev/null
  else
    warn "$GATEWAY topilmadi — gateway reload o'tkazib yuborildi (GATEWAY=... bilan nom bering)"
  fi
}

rollback(){
  warn "ROLLBACK — eski image'ga qaytamiz ($PREV_IMAGE)"
  if [ -n "$PREV_IMAGE" ]; then
    docker tag "$PREV_IMAGE" "${IMAGE_NAME}:${IMAGE_TAG}"
    $DC up -d --no-build --no-deps api worker web admin || true
    wait_healthy api 20 || true
    wait_healthy web 20 || true
  fi
  reload_gateway
  echo "Rollback yakunlandi — eski, ishlaydigan versiya jonli."
}
trap 'rc=$?; [ $rc -ne 0 ] && rollback; exit $rc' ERR

c "1/6 Yangi :latest image pull (ishlab turgan konteynerlarga tegmasdan)"
$DC pull api web admin worker

c "2/6 DB migratsiya — prisma migrate deploy (servis start'idan oldin)"
$DC run --rm api pnpm db:deploy

c "3/6 Infra (postgres/redis) — down EMAS, volume saqlanadi"
$DC up -d --no-build --no-deps postgres redis

c "4/6 api/worker yangilanadi va healthcheck"
$DC up -d --no-build --no-deps api worker
wait_healthy api

c "5/6 web/admin yangilanadi va healthcheck"
$DC up -d --no-build --no-deps web admin
wait_healthy web

reload_gateway

c "6/6 Yakuniy tekshiruv"
ok=1
if $DC exec -T api curl -fsS http://localhost:4000/v1/health >/dev/null 2>&1; then echo "  API health: OK"; else echo "  API health: FAIL"; ok=0; fi
code="$(curl -fsS -o /dev/null -w '%{http_code}' "$SITE_URL/" 2>/dev/null || echo 000)"
echo "  $SITE_URL -> $code"
[ "$code" = "200" ] || ok=0
if [ "$ok" != "1" ]; then rollback; exit 1; fi

trap - ERR
$DC ps
c "Deploy muvaffaqiyatli — sayt uzilmadi, 502 yo'q."
