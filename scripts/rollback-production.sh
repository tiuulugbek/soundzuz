#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
PREVIOUS_FILE="${PREVIOUS_FILE:-.previous-production-image}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

if [[ ! -f "$PREVIOUS_FILE" ]]; then
  echo "No previous image reference found in $PREVIOUS_FILE"
  exit 1
fi

PREVIOUS_IMAGE="$(cat "$PREVIOUS_FILE")"
if [[ -z "$PREVIOUS_IMAGE" || "$PREVIOUS_IMAGE" == "<none>:<none>" ]]; then
  echo "Previous image reference is invalid"
  exit 1
fi

IMAGE_NAME="${PREVIOUS_IMAGE%:*}"
IMAGE_TAG="${PREVIOUS_IMAGE##*:}"
export IMAGE_NAME IMAGE_TAG

echo "Rolling application containers back to ${IMAGE_NAME}:${IMAGE_TAG}"
echo "Database migrations are forward-only. This script does not revert schema changes."

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-build --remove-orphans api worker web admin nginx

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
