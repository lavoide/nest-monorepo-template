# CLAUDE.md - Backend

**IMPORTANT:** Use **bun** instead of npm.

## Tech Stack

NestJS 10, PostgreSQL/Prisma, Passport.js (JWT/Local), AWS S3, class-validator, Swagger/Scalar, Jest.

## Commands

```bash
bun run dev              # Start with watch
bun run test             # Unit tests
bun run lint             # Biome lint + autofix
bun run format           # Biome format
bunx prisma migrate dev  # Run migrations
bunx prisma generate     # Regenerate client
```

## DTO Conventions

DTOs are the source of truth for frontend types — `packages/shared` scans them to generate TypeScript interfaces.

- **Create/Update/Response** DTOs per module, in `dto/*.dto.ts`
- Response DTOs define exact API response shape
- Export all from the module's `dto/index.ts`
- Use `class-validator` + `@ApiProperty()` decorators
- After changes: `cd ../../packages/shared && bun run generate:types`

## Controller Pattern

All controllers extend `BaseController` (`src/common/base.controller.ts`):
- `respondSuccess<T>(data, message)`, `respondCreated<T>(data)`, `respondOk(message)`, `respondNotFound(message)`
- Type assertions: `as unknown as DtoType` (never `as any`)

## Key Constraints

1. DTOs are the source of truth for frontend types
2. All input validated with class-validator
3. Use `BaseController` response methods
4. `as unknown as Type`, never `as any`
5. Strip sensitive fields (passwords, tokens) before returning to clients
