# Architectural Decision Log

## ADR-001 — Modular monolith for MVP

**Decision:** NestJS modular monolith, not microservices.  
**Reason:** transactional lead/appointment flows, small operations team, simpler deploy and debugging.  
**Future:** modules and outbox events keep extraction possible.

## ADR-002 — Next.js for both public and admin

**Decision:** two separate Next.js apps.  
**Reason:** public SEO and admin release/access boundaries differ; shared UI remains possible.

## ADR-003 — No checkout in MVP

**Decision:** public prices and lead/appointment CTAs; payment at branch.  
**Reason:** confirmed business process and fitting/consultation requirements.

## ADR-004 — Reliable Telegram through outbox

**Decision:** save lead and outbox event atomically; worker sends Telegram.  
**Reason:** Telegram downtime must not lose customer data.

## ADR-005 — PostgreSQL as source of truth

**Decision:** leads, appointments, catalog, content control and audit live in PostgreSQL.  
**Reason:** relational constraints, reporting and transaction needs.

## ADR-006 — Imported data defaults to review

**Decision:** legacy products/content cannot auto-publish.  
**Reason:** current catalog contains outdated or unavailable items.

## ADR-007 — Translation tables

**Decision:** translatable content is stored in dedicated translation records.  
**Reason:** Uzbek primary, Russian secondary, future English.

## ADR-008 — Branch-scoped permissions

**Decision:** permission + branch scope, not role-only checks.  
**Reason:** branch managers/operators must not automatically see all branch data.

## ADR-009 — Node.js 24 LTS baseline

**Decision:** production baseline Node.js 24 LTS.  
**Reason:** supported LTS baseline for a new 2026 project; avoid Current release for initial production.
