# Implementation Backlog

## P0 — Foundation

- [x] Project context and decisions
- [x] Initial public audit
- [x] Migration discovery script
- [x] WordPress public extraction script
- [x] Local PostgreSQL/Redis/MinIO compose
- [x] Initialize pnpm/Turborepo apps
- [x] Initialize NestJS API with strict TypeScript
- [x] Initialize Prisma package and first migration
- [x] Environment validation package
- [x] CI lint/typecheck/test pipeline

## P0 — First vertical slice

- [x] Contact model
- [x] Lead model and enums
- [x] Lead status history
- [x] OutboxEvent and NotificationDelivery
- [x] Public lead submit endpoint
- [x] phone normalization and validation
- [x] rate limiting/idempotency
- [x] Telegram worker
- [x] admin login
- [x] admin lead list/detail
- [x] status update and notes
- [x] audit log

## P0 — Appointment slice

- [x] Branch/service/schedule models
- [x] available slots endpoint
- [x] appointment create transaction
- [x] conflict prevention
- [x] appointment admin calendar/list
- [ ] reschedule/cancel/status history
- [x] Telegram appointment template

## P1 — Catalog

- [ ] product/category/brand schema
- [ ] translations
- [ ] price visibility
- [ ] branch availability
- [ ] attributes
- [ ] media uploads
- [ ] admin catalog CRUD/review/publish
- [ ] public catalog/product pages

## P1 — Content and SEO

- [ ] pages/articles/FAQ
- [ ] metadata and structured data
- [ ] sitemap/robots
- [ ] redirects
- [ ] analytics events and UTM attribution

## P1 — Migration

- [ ] run discovery when source available
- [ ] authenticated WooCommerce adapter if needed
- [ ] XML/database adapter
- [ ] media downloader
- [ ] normalization schema
- [ ] staging importer
- [ ] review UI
- [ ] redirect generator
- [ ] verification report

## P2

- [ ] product compare
- [ ] hearing aid questionnaire
- [ ] IEM production workflow
- [ ] SMS integration
- [ ] CRM integration
- [ ] advanced funnel analytics
