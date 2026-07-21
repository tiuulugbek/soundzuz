# Soundz Digital Platform

Soundz uchun noldan qurilayotgan hearing-care va Custom In‑Ear Monitor platformasi.

## Hozirgi implementation

Ushbu paketda birinchi ishlaydigan biznes oqimlari yozilgan:

```text
Public Soundz website
→ Lead yoki qabul formasi
→ NestJS API validation
→ PostgreSQL transaction
→ Outbox event
→ Redis/BullMQ worker
→ Telegram xabari
→ JWT bilan himoyalangan admin panel
→ Status, izoh va audit log
```

Bundan tashqari admin orqali filial, xizmat, ish jadvali va filial-xizmat bog‘lanishi boshqariladi.

## Texnologiyalar

- Node.js 24 production baseline
- pnpm workspaces + Turborepo
- Next.js public website va admin panel
- NestJS API
- PostgreSQL + Prisma ORM
- Redis + BullMQ
- Docker Compose + Nginx
- Telegram Bot API

## Ilovalar

| Ilova | Port | Vazifa |
|---|---:|---|
| `apps/web` | 3000 | Public Soundz sayti va formalar |
| `apps/admin` | 3001 | Lead, qabul, filial va xizmat boshqaruvi |
| `apps/api` | 4000 | REST API va Swagger |
| `apps/worker` | — | Outbox va Telegram bildirishnomalari |

## Lokal ishga tushirish

Talablar: Node.js 24, Docker va Corepack.

```bash
cp .env.example .env
# JWT secret va admin parolini albatta almashtiring
corepack enable
pnpm install
pnpm db:generate

docker compose up -d
pnpm db:migrate
SEED_DEMO_DATA=true pnpm db:seed
pnpm dev
```

Manzillar:

- Public sayt: `http://localhost:3000`
- Admin: `http://localhost:3001`
- API: `http://localhost:4000/v1`
- Swagger: `http://localhost:4000/docs`
- MinIO console: `http://localhost:9001`

Demo ma’lumot kerak bo‘lmasa `.env` ichida `SEED_DEMO_DATA=false` qoldiriladi. Haqiqiy filiallar admin panel orqali kiritiladi.

## Telegram sozlash

`.env` ichida:

```env
TELEGRAM_BOT_TOKEN=123456:example
TELEGRAM_LEADS_CHAT_ID=-1001234567890
```

Development muhitida bu qiymatlar bo‘sh bo‘lsa, worker Telegram xabarini konsolda preview qiladi. Production muhitida credentiallar majburiy.

## Database

```bash
pnpm db:generate
pnpm db:validate
pnpm db:migrate
pnpm db:seed
```

Boshlang‘ich admin:

```env
ADMIN_SEED_EMAIL=admin@soundz.uz
ADMIN_SEED_PASSWORD=mustahkam-parol
```

Seed qayta ishlatilganda shu foydalanuvchi upsert qilinadi. Productionda parolni `.env` ichida kuchli qiymatga almashtirish shart.

## Tekshiruv

```bash
pnpm verify:structure
pnpm test
pnpm typecheck
pnpm build
```

`verify:structure` dependency o‘rnatilmagan muhitda ham papkalar, relative importlar, JSON fayllar va Prisma migrationlar mavjudligini tekshiradi.

## Production

```bash
docker compose -f compose.production.yaml build
docker compose -f compose.production.yaml up -d
```

Birinchi deploydan keyin admin seed alohida ishga tushiriladi:

```bash
docker compose -f compose.production.yaml run --rm api pnpm --filter @soundz/database db:seed
```

SSL sertifikat, DNS, backup va server hardening bosqichlari `docs/UBUNTU_DEPLOYMENT.md` ichida.

## Migratsiya

Joriy WordPress/WooCommerce sayt ochilganda:

```bash
pnpm migration:discover
pnpm migration:extract
```

Raw natijalar `data/migration/` papkasiga tushadi. Ular avtomatik public katalogga chiqarilmaydi; avval review va normalizatsiyadan o‘tadi.

## Hujjatlar

- `docs/IMPLEMENTATION_STATUS.md`
- `docs/API_SPECIFICATION.md`
- `docs/LOCAL_DEVELOPMENT.md`
- `docs/UBUNTU_DEPLOYMENT.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/DATABASE_MODEL.md`
- `docs/MIGRATION_PLAN.md`
- `docs/BACKLOG.md`
