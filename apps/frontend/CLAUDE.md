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
6. **i18n**: `useTranslation()` from `react-i18next`. All user-facing strings must go through `t()`. Locale files live in `packages/shared/locales/{en,uk}.json`
7. **API errors**: Use `getApiErrorMessage(error, t, fallbackKey)` from `src/lib/api-error.ts` — backend sends i18n keys (e.g. `errors.auth.wrongCreds`), this resolves them via `t()`. Never display raw `error.message`
8. **Multilingual backend fields**: Use `getLocalizedValue(value, currentLocale)` from `src/lib/i18n-utils.ts` for fields shaped `{en: string, uk: string}`
9. **Language switching**: `useI18n().changeLanguage(lang)` — persists to localStorage automatically
