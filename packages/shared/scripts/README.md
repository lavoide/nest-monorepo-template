# Automatic Type Generation

This script automatically generates TypeScript interfaces from backend DTOs, ensuring type consistency across the monorepo.

## How it works

1. The `generate-types.ts` script scans all `*.dto.ts` files in the backend
2. It extracts class properties and converts them to TypeScript interfaces
3. All decorators (@ApiProperty, @IsEmail, etc.) are stripped
4. Generated interfaces are saved to `packages/shared/src/types/generated/`

## Usage

### Manual generation
```bash
npm run generate:types
```

### Watch mode (for development)
```bash
npm run watch:types
```

### Automatic generation
Types are automatically generated when:
- Building the backend (`npm run build:backend`)
- Building the shared package (`npm run build`)

## Type mapping rules

- Classes become interfaces (e.g., `class AuthDto` → `interface AuthDto`)
- NestJS/class-validator decorators are removed
- Optional properties remain optional
- Prisma enums are imported from shared package
- Special types are handled:
  - `Json` → `any`
  - `OrderDirectionConstants` → `'ASC' | 'DESC'`

## Adding new DTOs

1. Create your DTO in the backend following the standard pattern
2. Run `npm run generate:types` or build the backend
3. The interface will be automatically available in `@monorepo/shared`

## Example

Backend DTO:
```typescript
export class RegisterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
```

Generated interface:
```typescript
export interface RegisterDto {
  name: string;
  email: string;
}
```