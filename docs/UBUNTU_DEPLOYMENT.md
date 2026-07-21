# Ubuntu Production Deployment

## Tavsiya etilgan server

Boshlang‘ich production uchun:

- Ubuntu 24.04 LTS
- 4 vCPU
- 8 GB RAM
- 100 GB SSD
- static public IP

## DNS

Quyidagilar server IP manziliga yo‘naltiriladi:

- `soundz.uz`
- `www.soundz.uz`
- `admin.soundz.uz`
- `api.soundz.uz`

## Server tayyorlash

- non-root deploy user
- SSH key only
- UFW: 22, 80, 443
- Docker Engine va Compose plugin
- fail2ban
- automatic security updates

## Deploy

```bash
git clone <repository> /opt/soundz-platform
cd /opt/soundz-platform
cp .env.example .env
nano .env

docker compose -f compose.production.yaml build
docker compose -f compose.production.yaml up -d
```

`migrate` service API va worker ishga tushishidan oldin Prisma migrationlarni qo‘llaydi.

## Birinchi admin

```bash
docker compose -f compose.production.yaml run --rm api \
  pnpm --filter @soundz/database db:seed
```

Seed tugagach `.env` ichidagi vaqtinchalik admin parolni almashtirish va kelajakda admin parol o‘zgartirish ekranini qo‘shish kerak.

## SSL

Nginx konfiguratsiyasi `/etc/letsencrypt/live/soundz.uz/` ichidagi SAN sertifikatni kutadi. Sertifikat `soundz.uz`, `www`, `admin` va `api` subdomainlarini qamrab olishi kerak.

## Backup

Kamida:

- PostgreSQL daily encrypted dump
- 7 daily + 4 weekly + 6 monthly retention
- media/S3 backup
- off-server nusxa
- har oy restore testi

## Monitoring

Productiondan oldin qo‘shiladi:

- uptime monitor
- API error tracking
- container health alerts
- disk/RAM/CPU alerts
- PostgreSQL backup failure alert
- outbox DEAD event alert

## Release tartibi

1. staging build
2. migration backup
3. image build
4. migration deploy
5. API/worker deploy
6. web/admin deploy
7. smoke test
8. eski sayt URL redirectlari
9. DNS cutover
