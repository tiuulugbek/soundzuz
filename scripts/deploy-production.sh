#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy .env.production.example and fill production secrets."
  exit 1
fi

if [[ ! -f deploy/certs/fullchain.pem || ! -f deploy/certs/privkey.pem ]]; then
  echo "Missing TLS files in deploy/certs/. See deploy/certs/README.md."
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

: "${IMAGE_NAME:?IMAGE_NAME is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

CURRENT_IMAGE="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" images -q api 2>/dev/null || true)"
if [[ -n "$CURRENT_IMAGE" ]]; then
  docker image inspect "$CURRENT_IMAGE" --format '{{index .RepoTags 0}}' > .previous-production-image || true
fi

echo "Pulling ${IMAGE_NAME}:${IMAGE_TAG}..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull || true

echo "Building image when registry image is unavailable..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

echo "Applying database migrations..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm api pnpm db:deploy

echo "Starting production stack..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

echo "Waiting for API healthcheck..."
for attempt in $(seq 1 30); do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T api curl -fsS http://localhost:4000/v1/health >/dev/null; then
    echo "Deployment is healthy."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
    exit 0
  fi
  sleep 5
done

echo "Deployment healthcheck failed. Showing recent logs."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=200 api web admin worker nginx
exit 1
