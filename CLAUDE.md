# CLAUDE.md

**IMPORTANT:** Use **bun** instead of npm whenever possible.

## Project Overview

Turborepo monorepo template:
- **backend** (`apps/backend`): NestJS API + PostgreSQL/Prisma
- **frontend** (`apps/frontend`): React + Vite
- **website** (`apps/website`): Astro marketing site
- **shared** (`packages/shared`): cross-package types, utils, and DTO-generated interfaces

## Commands

```bash
# Local dev services (Postgres on :5434, Redis on :6379)
bun run docker       # Smart startup — skips services already on those ports

# Development
bun run dev          # All apps dev mode
bun run build        # Build all
bun run lint         # Lint all (Biome)
bun run type-check   # Type check all
bun run format       # Format all (Biome)
bun run check        # Biome check + autofix
turbo dev --filter=@monorepo/backend    # Single app
turbo dev --filter=@monorepo/frontend
```

## Deployment

- `Dockerfile`: multi-stage build (deps → builder → runner) on `node:22-slim` + `bun@1.3.9`. Prisma client is generated in the deps stage so `nest build` can resolve types.
- `.github/workflows/build-deploy.yml`: on push to `master`/`dev`, builds + pushes to ghcr.io tagged `prod`/`dev` + SHA. Defaults to `linux/amd64` — add `linux/arm64` (and `docker/setup-qemu-action`) for ARM hosts.

## Tooling

- **Linting/formatting**: Biome (single `biome.json` at root). No Prettier, no ESLint.
- **Build/task runner**: Turborepo. See `turbo.json`.
- **Workspaces**: `apps/*` and `packages/*`.

## Type Generation

`packages/shared` auto-generates TypeScript interfaces from backend DTOs:

```bash
cd packages/shared && bun run generate:types
```

- Scans `apps/backend/src/**/dto/*.dto.ts` → writes to `packages/shared/src/types/generated/`
- Frontend imports from `@monorepo/shared`
- **After DTO changes:** generate types → rebuild shared → frontend picks up new types

## App Documentation

- Backend: `apps/backend/CLAUDE.md`
- Frontend: `apps/frontend/CLAUDE.md`
- Website: `apps/website/CLAUDE.md`
