# Local Development

## 1. Talablar

- Node.js 24
- Corepack
- Docker Compose
- Git

## 2. Environment

```bash
cp .env.example .env
```

Quyidagilarni almashtiring:

- `JWT_ACCESS_SECRET`
- `ADMIN_SEED_PASSWORD`
- `POSTGRES_PASSWORD`
- `MINIO_ROOT_PASSWORD`

## 3. Dependency va generated client

```bash
corepack enable
pnpm install
pnpm db:generate
```

## 4. Infrastructure

```bash
docker compose up -d
```

## 5. Migration va seed

```bash
pnpm db:migrate
SEED_DEMO_DATA=true pnpm db:seed
```

Demo data bir placeholder filial, bitta audiometriya xizmati va Dushanba–Shanba 09:00–18:00 jadval yaratadi.

## 6. Development servers

```bash
pnpm dev
```

## 7. Test oqimi

1. `localhost:3000` orqali lead yuboring.
2. Worker konsolida Telegram previewni ko‘ring.
3. `localhost:3001` orqali admin panelga kiring.
4. Lead statusini o‘zgartiring va izoh qo‘shing.
5. Public saytda qabul slotini tanlab yoziling.
6. Admin `Qabullar` sahifasida qabulni tasdiqlang.

## 8. Telegram real test

BotFather tokeni va chat ID `.env` ga kiritiladi, so‘ng worker restart qilinadi:

```bash
pnpm --filter @soundz/worker dev
```
