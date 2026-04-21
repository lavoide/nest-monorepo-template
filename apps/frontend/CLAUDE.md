# CLAUDE.md - Frontend

**IMPORTANT:** Use **bun** instead of npm.

## Tech Stack

React 19, Vite 5, React Router, Zustand, TanStack Query, Axios, Tailwind CSS, Radix UI, Vitest, Cypress.

## Commands

```bash
bun run dev          # Vite dev server
bun run build        # Production build
bun run test.unit    # Vitest
bun run test.e2e     # Cypress
bun run lint         # Biome
bun run lint:fix     # Biome + autofix
```

## Project Structure

```
src/
├── components/      # Reusable components + ui/ (Radix-based)
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── lib/             # Utilities (api client, cn, etc.)
├── pages/           # Page components
├── services/        # API service layer
├── store/           # Zustand stores
└── theme/           # Theme configuration
```

## Key Conventions

1. **React imports**: Named imports, never `import * as React`
2. **Types**: Import from `@monorepo/shared` for API types — DO NOT duplicate backend types
3. **Styling**: Tailwind utilities, use `cn()` helper for conditional classes
4. **Data fetching**: TanStack Query for all server data. Zustand only for client state
5. **API client**: Single axios instance in `src/lib/api.ts`. Never instantiate axios elsewhere
