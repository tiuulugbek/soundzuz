# Soundz production deployment

## Domains

Point these DNS records to the production server:

- `soundz.uz` and `www.soundz.uz` → public website
- `admin.soundz.uz` → administration panel
- `api.soundz.uz` → NestJS API
- `media.soundz.uz` → Cloudflare R2 public/custom domain

## Server prerequisites

- Ubuntu 24.04 LTS
- Docker Engine with Compose v2
- At least 4 GB RAM, 2 vCPU and 40 GB SSD for the initial workload
- Firewall ports 22, 80 and 443 only
- Cloudflare Origin Certificate or another TLS certificate covering the web, admin and API domains

## First deployment

```bash
git clone <repository-url> soundzuz
cd soundzuz
cp .env.production.example .env.production
nano .env.production
```

Add certificates:

```text
deploy/certs/fullchain.pem
deploy/certs/privkey.pem
```

Deploy:

```bash
bash scripts/deploy-production.sh
```

The script performs the following sequence:

1. validates the environment and TLS files;
2. stores the previous application image reference;
3. pulls or builds the selected image;
4. runs `prisma migrate deploy`;
5. starts PostgreSQL, Redis, API, worker, web, admin and Nginx;
6. waits for the API health endpoint.

## Updating production

Use an immutable image tag such as the Git commit SHA:

```dotenv
IMAGE_TAG=sha-0123456
```

Then run:

```bash
bash scripts/deploy-production.sh
```

Do not use `latest` for controlled releases.

## Database backup

Before important releases:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml \
  exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
  > "soundz-$(date +%F-%H%M).dump"
```

Store encrypted backups outside the server. Test restore procedures regularly.

## Application rollback

```bash
bash scripts/rollback-production.sh
```

This rolls API, worker, web and admin containers back to the previous image. Prisma migrations are forward-only; schema rollback requires a reviewed corrective migration or restoring a database backup.

## Health and logs

```bash
pnpm prod:logs
curl -fsS https://api.soundz.uz/v1/health
```

Check services:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

## Cloudflare R2

Set:

```dotenv
MEDIA_STORAGE_DRIVER=r2
MEDIA_S3_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
MEDIA_S3_REGION=auto
MEDIA_S3_BUCKET=soundz-media
MEDIA_S3_ACCESS_KEY_ID=...
MEDIA_S3_SECRET_ACCESS_KEY=...
MEDIA_PUBLIC_BASE_URL=https://media.soundz.uz
```

The R2 bucket should not allow arbitrary public writes. Only the API credentials should have object write permission.

## Security checklist

- replace every `CHANGE_ME` value;
- use a random JWT secret of at least 32 characters;
- change the seeded admin password immediately;
- enable Cloudflare proxy and rate limiting;
- do not expose PostgreSQL or Redis ports publicly;
- keep `.env.production` and TLS private keys outside Git;
- configure automated encrypted PostgreSQL backups;
- monitor API health, container restarts and disk usage.
