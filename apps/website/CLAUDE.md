# CLAUDE.md - Website

Marketing/docs site.

## Tech Stack

- **Framework**: Astro 5 + React islands
- **Styling**: Tailwind CSS

## Commands

```bash
bun run dev      # Start dev server (localhost:4321)
bun run build    # Build for production
bun run preview  # Preview production build
```

## Client Directives

- `client:load` — interactive components (menus, toggles)
- `client:only="react"` — SSR-incompatible components (forms with hooks, browser-only APIs)

Default to static Astro where possible; add a directive only when interactivity is required.
