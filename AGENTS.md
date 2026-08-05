# static-wave — AGENTS.md

## Project

A mobile app (Expo/React Native) for listening to any radio station via the RadioBrowser API. Fully client-side, no backend/auth.

## Monorepo structure

- `apps/native/` — Main mobile app (Expo Router, uniwind, heroui-native)
- `apps/web/` — Next.js app for privacy policy/TOS/landing page
- `packages/ui/` — Shared shadcn/ui components (web only, NOT used in native)
- `packages/env/` — `@t3-oss/env-core` env validation (3 entrypoints: server, web, native)
- `packages/config/` — Shared tsconfig base

## Commands (run from root)

| Command | What it does |
|---|---|
| `pnpm dev:native` | Start Expo dev server (native app) |
| `pnpm dev:web` | Start Next.js dev on port 3001 |
| `pnpm check-types` | Typecheck all packages |
| `pnpm test` | Run tests (jest-expo, native app) |
| `pnpm dev` | Start all apps (turbo) |

## Committing convention

**One commit per todo.** A feature is broken into 1–10 todos; each todo gets its own commit with a descriptive message. No squashing.

## Native app conventions

- **Entry**: `apps/native/app/_layout.tsx` (Expo Router file-based routing)
- **Routing**: Expo Router with drawer → tabs structure
  - `app/(drawer)/(tabs)/` — Main tab screens
  - `app/(drawer)/index.tsx` — Drawer home screen
- **Styling**: uniwind (Tailwind CSS for React Native) + heroui-native components
  - Import order: `@/global.css` at the top of `_layout.tsx`
  - Tailwind classes via `className` prop
  - Theme via `uniwind` with `useUniwind()` hook
- **Path alias**: `@/` maps to `apps/native/` root
- **Env**: `EXPO_PUBLIC_*` vars in `apps/native/.env`, validated by `@static-wave/env/native`
- **Audio**: `react-native-track-player` (background audio, lock screen controls, remote events). Playback service registered in `apps/native/index.js`
- **Data source**: RadioBrowser API (direct from device, no backend)

## Key constraints

- No auth, no backend, no RevenueCat during open beta
- All data stored locally on-device (favorites, history, settings, sleep timer)
- Web app is NOT for radio features — only privacy policy/TOS/landing page
- `packages/ui/` is web-only shadcn/ui; native uses `heroui-native` + uniwind
- `npmrc` uses `node-linker=isolated`
- **Do not** create documentation (`*.md`) or README files unless explicitly requested
