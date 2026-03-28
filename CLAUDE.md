# HONS - Cross-Store Book Ownership Dashboard

## Project Overview

HONS is a monorepo for tracking book ownership across Amazon and Kindle. It consists of a Chrome extension that detects books on Amazon/Kindle pages and a Next.js web dashboard that displays the user's library.

## Architecture

```
hons/
├── extension/   # Chrome Extension (Vite + CRXJS, Manifest V3)
├── web/         # Web Dashboard (Next.js 16, App Router)
└── shared/      # Shared types and utilities (TypeScript library)
```

### Communication Flow

```
Amazon/Kindle page ──content script──► background worker ──chrome.runtime──► Google Books API
                                           │
Web Dashboard ◄──window.postMessage──► Extension (webDashboardBridge)
```

Message protocol is defined in `shared/src/types/bridge.ts` (GET_SNAPSHOT, START_SYNC, SNAPSHOT, etc.).

## Tech Stack

- **Runtime**: Node.js 20, pnpm 10 (workspaces)
- **Web**: Next.js 16, React 19, TailwindCSS 4, shadcn/ui, Vitest
- **Extension**: Vite 7 + CRXJS, React 19, Chrome Manifest V3
- **Shared**: TypeScript library (types + utils, no runtime deps)
- **Linting/Formatting**: ESLint 9, Prettier 3.8 (organize-imports + tailwindcss plugins)
- **CI**: GitHub Actions (lint, format:check, test, build:all)

## Commands

```bash
# Development
pnpm dev                  # Web dev server
pnpm dev:extension        # Extension watch build
pnpm dev:extension:hot    # Extension hot reload

# Build
pnpm build:all            # Build web + extension
pnpm build:web            # Build web only
pnpm build:extension      # Build extension only

# Quality
pnpm test                 # Run all tests (Vitest)
pnpm test:web             # Web tests only
pnpm typecheck            # TypeScript check all workspaces
pnpm lint                 # ESLint all workspaces
pnpm format               # Prettier format all
pnpm format:check         # Check formatting
pnpm fix                  # Lint + format all
```

## Code Conventions

- **Language**: TypeScript strict mode, ES2022 target
- **Formatting**: Prettier (2 spaces, single quotes, trailing commas, 120 print width)
- **Path aliases**: `@/*` maps to `./src/*` in web package
- **Shared package imports**: `@hons/shared`, `@hons/shared/types/book`, `@hons/shared/types/bridge`, `@hons/shared/utils/volume`
- **Styling**: TailwindCSS with CSS variables, shadcn/ui (new-york style, neutral theme)
- **Testing**: Vitest with jsdom environment, @testing-library/react for web

## Key Files

| File | Purpose |
|------|---------|
| `shared/src/types/book.ts` | BookMetadata interface, OwnershipStatus type |
| `shared/src/types/bridge.ts` | Extension-Web message protocol |
| `shared/src/utils/volume.ts` | Volume number extraction (Japanese/English) |
| `extension/src/manifest.ts` | Chrome extension manifest |
| `extension/src/background.ts` | Service worker (message routing, enrichment) |
| `extension/src/content.tsx` | Content script (Amazon/Kindle/Dashboard modes) |
| `web/src/components/dashboard/DashboardClient.tsx` | Main dashboard client component |
