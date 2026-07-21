# Verification Report

Date: 2026-07-21

## Passed in this environment

- `node scripts/verify-structure.mjs`
  - all required files exist
  - JSON files parse successfully
  - relative source imports resolve, excluding Prisma generated client created at install time
  - Prisma schema declaration/brace checks pass
  - two SQL migration files detected
- `node --test packages/contracts/tests/*.test.mjs`
  - 3/3 phone-normalization tests passed
- JavaScript syntax checks for migration and smoke-test scripts
- YAML parsing:
  - `compose.yaml`
  - `compose.production.yaml`
- TypeScript/TSX parser pass using local `tsc --noResolve`
  - no syntax-class diagnostics were detected

## Not executable in this sandbox

The active environment has Node.js 22 and TypeScript, but does not provide:

- outbound npm registry access for dependency installation
- pnpm package download
- Docker/Podman
- PostgreSQL client/server

Therefore the following must be run on the development machine or Ubuntu server:

```bash
corepack enable
pnpm install
pnpm db:generate
pnpm db:validate
docker compose up -d
pnpm db:migrate
SEED_DEMO_DATA=true pnpm db:seed
pnpm typecheck
pnpm test
pnpm build
pnpm smoke
```

Any dependency-level or Prisma-generated type issue found by those commands should be fixed before production deployment.
