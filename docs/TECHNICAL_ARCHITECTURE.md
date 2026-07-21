# Technical Architecture

## 1. Architecture style

MVP uchun **modular monolith** tanlanadi. Bu tez ishlab chiqish, transactional consistency va operational soddalik beradi. Modul chegaralari keyinchalik mustaqil servisga ajratish mumkin bo‘ladigan darajada aniq bo‘ladi.

## 2. Monorepo

```text
soundz-platform/
  apps/
    web/          Next.js public website
    admin/        Next.js admin application
    api/          NestJS REST API
    worker/       Queue/outbox jobs (initially can share API code)
  packages/
    database/     Prisma schema/client
    contracts/    Shared DTO schemas/API types
    ui/           Shared design-system primitives
    config/       Env and shared configuration
    eslint-config/
    tsconfig/
  scripts/
    migration/
  infrastructure/
  docs/
```

## 3. API modules

- Auth
- Users
- RolesPermissions
- Branches
- Specialists
- Services
- Catalog
- Pricing
- Inventory
- Leads
- Appointments
- Customers
- Notifications
- Telegram
- Media
- Content
- SEO
- Imports
- Audit
- AnalyticsEvents
- Health

## 4. Data consistency

### Lead/appointment submit

Bitta PostgreSQL transaction ichida:

1. normalized contact topiladi/yaratiladi;
2. lead yaratiladi;
3. appointment kerak bo‘lsa yaratiladi;
4. status history yaratiladi;
5. outbox event yaratiladi.

Telegram network call transaction ichida bajarilmaydi.

## 5. Authentication

- admin-only authentication;
- short-lived access token;
- rotating refresh session stored server-side;
- HttpOnly secure cookies preferred for browser admin;
- password hashing with modern memory-hard algorithm;
- optional 2FA later;
- brute force protection;
- session revoke.

## 6. Authorization

- RBAC + branch scope;
- permission examples: `lead.read`, `lead.update`, `product.publish`, `appointment.manage`;
- user-branch assignment;
- query level branch filter mandatory;
- super-admin bypass explicit and audited.

## 7. Queue/outbox

- PostgreSQL outbox is source of truth;
- Redis queue dispatches jobs;
- idempotent job handlers;
- retry/backoff;
- dead-letter state;
- notification delivery log.

## 8. Media

- S3-compatible object storage;
- DB stores metadata, key, mime, size, hash, dimensions, alt text;
- signed admin upload;
- public optimized variants;
- checksum deduplication;
- source legacy URL preserved.

## 9. Internationalization

Domain record va translation record ajratiladi:

- Product + ProductTranslation;
- Category + CategoryTranslation;
- Page + PageTranslation;
- Branch + BranchTranslation.

Uzbek mandatory; Russian publish readiness separately validated.

## 10. SEO

- Next.js SSR/SSG/ISR strategy per page type;
- API-driven editable metadata;
- canonical and hreflang;
- redirect table cached;
- structured data rendered server-side;
- sitemap split by content type.

## 11. Observability

- JSON structured logs;
- request correlation ID;
- error monitoring;
- health, readiness and metrics;
- audit logs separate from operational logs;
- PII redaction in logs.

## 12. Deployment

```text
Internet
→ Cloudflare/DNS
→ Nginx
→ web/admin/api containers
→ PostgreSQL/Redis
→ S3-compatible storage
```

Productionda database va object storage uchun backup va off-server copy talab qilinadi.

## 13. Security baseline

- TLS only;
- strict CORS;
- CSRF strategy for cookie auth;
- input validation;
- rate limits;
- phone/email normalization;
- upload mime/size validation;
- admin actions audited;
- database least privilege;
- secrets outside repository;
- dependency and container scanning in CI.
