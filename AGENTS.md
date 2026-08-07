# static-wave

Expo/React Native app for streaming radio via RadioBrowser API. Fully client-side, no backend/auth. pnpm + Turborepo monorepo.

## Monorepo structure

| Path | Purpose |
|---|---|
| `apps/native/` | Mobile app (Expo Router, uniwind, heroui-native, expo-audio, zustand) |
| `apps/web/` | Next.js — privacy policy / TOS / landing page only. **No radio features.** |
| `packages/design/` | Shared design tokens + variants, consumed by both apps (`@static-wave/design`) |
| `packages/types/` | Shared TS types (`@static-wave/types`) |
| `packages/env/` | t3-oss env validation, 3 entrypoints: `server`, `web`, `native` |
| `packages/ui/` | Web-only shadcn/ui. **Native must never import this.** |
| `packages/config/` | Shared tsconfig base |

## Commands (run from root)

| Command | Action |
|---|---|
| `pnpm dev:native` | Expo dev server |
| `pnpm dev:web` | Next.js dev on port 3001 |
| `pnpm dev` | All apps (turbo) |
| `pnpm build` | Build all |
| `pnpm check-types` | Typecheck all packages |
| `pnpm test:native` | Run native tests only (`turbo run test -F native`) |
| `pnpm test` | Run all tests |

## Key constraints

- **One commit per todo.** Feature broken into 1–10 todos; each gets its own commit with descriptive message. No squashing.
- **pnpm only.** `npm install` fails on `catalog:` syntax. Always run from repo root.
- `node-linker=isolated` in `.npmrc`.
- **No backend, no auth.** All data on-device (AsyncStorage/MMKV).
- **`systems/`, `plans/`, `flows/` are gitignored** — contain design specs and build plans. Un-ignore before they're lost.
- **EAS builds from git commit, not working tree.** Uncommitted work silently excluded.

## Native app architecture

- **Entry:** `apps/native/app/_layout.tsx` (Expo Router file-based routing)
- **Structure:** Drawer → Tabs. `(drawer)/_layout.tsx` gates onboarding via declarative `<Redirect>`. `(onboarding)/` for first-run screens.
- **Styling:** uniwind (Tailwind for RN) + heroui-native. Import `@/global.css` first in `_layout.tsx`. Theme via `useUniwind()`.
- **Path alias:** `@/` maps to `apps/native/`
- **State:** Zustand stores in `stores/`. Stores never import each other — cross-store coordination via screen handlers or `lib/services/` service bridges.
- **Screens never format or fetch.** Formatting → `lib/format/`. Data → hooks in `hooks/`. Screens render only.
- **Env:** `EXPO_PUBLIC_*` vars in `apps/native/.env`, validated by `@static-wave/env/native`.

## Critical invariants (do not break)

1. **One audio player, ever.** `stores/audio-player.ts` enforces singleton. Never call `createAudioPlayer` outside this store. Release order: pause → detach lock screen → remove.
2. **Navigation gates are declarative, never both.** Flip the store flag only — pairing `finish()` with `router.replace()` races and cancels.
3. **Font weights need explicit faces.** RN ignores `fontWeight` on custom families. Always use `components/ui/text.tsx`; never set `fontFamily` directly. Fonts: Outfit + IBM Plex Mono from `assets/fonts/`.
4. **Stores never import each other.** See state management above.

## Audio stack

`react-native-track-player` was removed (incompatible with RN 0.86 TurboModules). Replaced with **expo-audio**. `apps/native/index.js` just imports `expo-router/entry` — no playback service registration needed.

**Known regressions vs track-player:** no widgets/Live Activities, no lock-screen next/prev, no remote artwork (bundled icon instead), sleep timer is foreground-accurate only (background-approximate via local notification).