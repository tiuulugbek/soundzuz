# Implementation Status — Phase 2

## Tayyor

### Foundation

- pnpm/Turborepo monorepo
- strict TypeScript konfiguratsiyasi
- Next.js public va admin ilovalari
- NestJS API
- Prisma 7/PostgreSQL package
- Redis, PostgreSQL va MinIO local Compose
- production Compose va Nginx konfiguratsiyasi
- GitHub Actions CI skeleton
- environment validation

### CRM-lite vertical slice

- public lead form
- Uzbek telefon raqamini normalizatsiya qilish
- Redis rate limiting
- idempotency key
- Contact va Lead transaction
- lead status history
- internal notes
- audit log
- JWT admin login
- admin lead list va detail
- UTM attribution
- outbox pattern
- BullMQ Telegram worker
- retry va dead-event holatlari

### Appointment vertical slice

- Branch
- Service
- BranchService
- BranchSchedule
- BranchClosure
- bo‘sh slotlar endpointi
- Asia/Tashkent timezone
- public appointment form
- transaction ichida Lead + Appointment + Outbox
- active slot uchun database partial unique protection
- appointment status history
- admin appointment list va status update
- Telegram appointment xabari

### Operating settings

- admin orqali filial yaratish/tahrirlash API
- xizmat yaratish/tahrirlash API
- filialga xizmat biriktirish
- ish jadvalini saqlash
- admin filial/xizmat sahifasi

## Hozircha qilinmagan

- real filial va mahsulot ma’lumotlari
- refresh token/session revocation
- operatorga lead assignment UI
- appointment reschedule uchun yangi slot tanlash UI
- specialist/audiologist schedule
- SMS confirmation
- katalog va mahsulot CRUD
- media upload/MinIO integration
- Uzbek/Russian content CMS
- SEO management va redirect UI
- WordPress data normalizer/importer
- analytics dashboard

## Muhim vaqtinchalik qarorlar

- Bir slotning capacity qiymati MVPda `1`.
- Appointment partial unique index raw SQL orqali yaratilgan. Keyingi Prisma migrationlar yaratilganda bu custom index qo‘lda tekshirilishi kerak.
- Mahsulot va filial haqiqiy ma’lumotlari ixtiro qilinmagan.
- `SEED_DEMO_DATA=true` faqat lokal tekshiruv uchun placeholder filial yaratadi.
- Public site hozir final brend dizayni emas, funksional high-fidelity boshlang‘ich konsept.

## Keyingi development milestone

`Catalog + CMS foundation`:

1. Product/category/brand schema
2. hearing-aid va IEM atribut tizimi
3. narx va filial mavjudligi
4. media storage
5. admin catalog CRUD/review/publish
6. public catalog va product detail
7. Uzbek/Russian translation layer
