# Earth Keeper - Nature-Themed Game Gateway

## Overview

Earth Keeper is an immersive, nature-themed 2D arcade game where players act as guardians of nature, cleaning pollution from the sky. Features include:

- Cinematic story intro (4-scene animated sequence: nature → pollution → darkness → keeper awakens)
- Difficulty selection (Calm Nature / Balanced Earth / Nature in Crisis)
- Full 2D arcade game with auto-shooting, A/D movement, garbage container collection, 4 power-up types
- Wind weather effects pushing garbage, combo multiplier system, screen shake on damage
- 10 named levels (Awakening → Gaia's Chosen), progressive difficulty scaling
- Glassmorphism HUD with health, score, level progress, difficulty badge, wind indicator, combo display
- Pause menu with Resume, Restart Level, Exit to Home
- Player profile creation via Firebase Realtime Database
- Story/lore page, controls page, leaderboard from Firebase

The project uses a full-stack TypeScript architecture with an Express backend and React frontend, though the primary data layer is Firebase (not the PostgreSQL database). The Postgres database and Drizzle ORM are scaffolded but minimally used — Firebase handles player profiles and leaderboard data on the client side.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Location**: `client/src/`
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router) with pages at `client/src/pages/`
- **State Management**: TanStack React Query for async data, React useState/useEffect for local state
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, located in `client/src/components/ui/`
- **Styling**: Tailwind CSS with custom CSS variables for a dark, forest-green theme. Custom fonts: Cinzel (display), Lora (body), Montserrat (sans)
- **Animations**: Framer Motion for page transitions, floating particles, and interactive elements
- **Icons**: Lucide React

### Backend (Express)
- **Location**: `server/`
- **Framework**: Express 5 on Node.js with TypeScript (run via tsx)
- **API**: Minimal — just a `/api/status` health check endpoint. Most data operations happen client-side via Firebase
- **Storage**: `MemStorage` class in `server/storage.ts` provides in-memory user storage (not actively used by the app)
- **Dev Server**: Vite dev server integrated as Express middleware (`server/vite.ts`) for HMR during development
- **Production**: Static file serving from `dist/public` via `server/static.ts`

### Database Layer
- **PostgreSQL + Drizzle ORM**: Configured in `drizzle.config.ts` and `server/db.ts`. Schema defined in `shared/schema.ts` with a basic `users` table. Currently scaffolded but not the primary data store.
- **Firebase Realtime Database**: The actual data layer for the app. Player profiles (nickname, visit timestamps) and leaderboard data are read/written directly from the client via Firebase SDK. Configuration is in `client/src/lib/firebase.ts`.

### Key Design Decisions

1. **Firebase as primary data store instead of Postgres**: The game profile and leaderboard features use Firebase Realtime Database directly from the client. This avoids needing server-side API routes for player data. The Postgres/Drizzle setup exists as scaffolding but isn't the active data path.

2. **Client-side routing with Wouter**: Lightweight alternative to React Router. Pages: Home (`/`), Controls (`/controls`), Leaderboard (`/leaderboard`), Story (`/story`).

3. **Immersive visual design**: Dark forest theme with glassmorphism panels (`glass-panel` CSS class), animated floating particles via Framer Motion, and gradient light shaft effects. All defined through CSS custom properties in `client/src/index.css`.

4. **Profile persistence via localStorage + Firebase**: A unique ID is stored in localStorage (`earth_keeper_id`) and maps to a Firebase record. This provides anonymous, persistent profiles without authentication. See `client/src/hooks/use-game-profile.ts`.

### Build & Development
- **Dev**: `npm run dev` — runs tsx with Vite middleware for HMR
- **Build**: `npm run build` — Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **DB Push**: `npm run db:push` — pushes Drizzle schema to Postgres (requires DATABASE_URL)
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

## External Dependencies

### Firebase Realtime Database
- **Purpose**: Stores player profiles (nickname, first/last visit timestamps) and serves as the leaderboard data source
- **Config**: Hardcoded in `client/src/lib/firebase.ts` (project: `wysi-game`)
- **Client-side only**: All Firebase reads/writes happen in the browser via hooks (`use-game-profile.ts`, `use-leaderboard.ts`)

### PostgreSQL (via Drizzle ORM)
- **Purpose**: Scaffolded relational database with a basic `users` table
- **Connection**: Requires `DATABASE_URL` environment variable
- **ORM**: Drizzle with `drizzle-zod` for schema validation
- **Status**: Set up but not actively used by the application's core features

### Key NPM Packages
- `firebase` — Firebase SDK for Realtime Database access
- `framer-motion` — Animation library for immersive UI effects
- `three` / `@react-three/fiber` / `@react-three/drei` — Three.js 3D WebGL scene for immersive background (fireflies, particles, terrain, energy orbs, vine spirals, stars). Gracefully degrades if WebGL unavailable.
- `wouter` — Lightweight client-side routing
- `@tanstack/react-query` — Server state management and caching
- `nanoid` — Generates unique player IDs
- `drizzle-orm` / `drizzle-kit` — Database ORM and migration tooling
- `connect-pg-simple` — PostgreSQL session store (available but not actively used)
- Full shadcn/ui component library with Radix UI primitives