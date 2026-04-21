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
