# static-wave — Handover

Context for picking this up cold. Read this before touching anything.

---

## 1. What we're building

An Expo/React Native app for streaming any radio station worldwide via the
**RadioBrowser API**. Fully client-side — no backend, no auth, no accounts.
Favorites, history, sleep timer and onboarding answers all live on-device.

pnpm + Turborepo monorepo:

- `apps/native/` — the app (Expo Router, uniwind, heroui-native)
- `apps/web/` — Next.js, **only** privacy policy / TOS / landing
- `packages/design/` — shared design tokens + variants (consumed by both apps)
- `packages/types/`, `packages/env/`, `packages/config/`
- `packages/ui/` — web-only shadcn. **Native must never import this.**

Read `AGENTS.md` first. Note its convention: **one commit per todo**.

---

## 2. Read these before writing code

| File | Why |
|---|---|
| `AGENTS.md` | Conventions, commands, constraints |
| `systems/screen-specs.md` | **Every measurement** for the 5 content screens, extracted verbatim from the design file |
| `systems/screen-architecture.md` | The build plan, shared components, rules |
| `systems/state-management.md` | Store patterns + the service-bridge rule |
| `systems/background-playback.md` | ⚠️ **STALE** — still describes react-native-track-player, which was removed |

### ⚠️ `systems/`, `plans/` and `flows/` are gitignored

They are **not in git**. `screen-specs.md` cost significant effort to extract and
exists only on this machine. **Un-ignore `systems/` early**, or back it up.

---

## 3. Design source of truth

Two files, uploaded by the user, are the authority for all UI:

- `StaticWave Screens.html` — 5 content screens, light + dark
- `Onboarding.html` — 6 onboarding screens, light + dark

They are **JS-bundled pages**: the real markup is a gzipped, base64 blob inside
`<script type="__bundler/manifest">`, and the rendered HTML is a JSON string in
`<script type="__bundler/template">`. To read them:

```python
import re, json, pathlib
src = pathlib.Path("StaticWave Screens.html").read_text(encoding="utf-8", errors="replace")
tpl = json.loads(re.search(r'<script type="__bundler/template">(.*?)</script>', src, re.S).group(1).strip())
# tpl is plain HTML with inline styles — walk it for exact values
```

**Do not estimate design values.** The user has been explicit: build what's in
the design verbatim. Everything already extracted is in `systems/screen-specs.md`.

---

## 4. Current state

### Done and believed working (user tested onboarding on device)

- All 6 onboarding screens, light + dark
- Onboarding gate, store, and completion
- Design token package (`@static-wave/design`) wired into both apps
- Shared UI: `Text`/`Eyebrow`, `Button`, `Chip`/`Badge`, `StationAvatar`,
  `Screen`, `StationRow`, `AsyncBoundary`/`SectionHeader`/`Skeleton`
- **Favorites screen** — first content screen, complete
- 6 Zustand stores + 3 service bridges
- API layer: search, metadata, `/json/stats`, retry with backoff
- Formatters: avatar initials, station meta, relative time
- Deep linking (`static-wave://`)
- Jest set up with native-module mocks; tests for retry, formatters, storage,
  sleep timer, error classification

### Not built

- **Search**, **Dashboard**, **Station Details**, **Player** screens
- The floating tab bar (it's a pill, not a standard tab bar — see §5)
- Now Playing bar (two variants — see §5)
- `/recently-played` route (the Dashboard "See all" target)
- Sleep timer bottom sheet

### ⚠️ Unverified

**`pnpm check-types` has not been run since the expo-audio migration.** Run it
first. Likely failure points:

1. **expo-audio API names** — `setAudioModeAsync` options
   (`playsInSilentMode`, `shouldPlayInBackground`, `interruptionMode`), the
   `playbackStatusUpdate` payload shape, and `setActiveForLockScreen`'s
   signature were all written without being able to compile against the real types.
2. `LinearGradient` colour tuple casts (`as unknown as [string, string]`).
3. `HeroUINativeProvider config={{ theme: heroUITheme }}` — prop name unconfirmed.

`pnpm test` also hasn't been run end to end. The mocks in `jest.setup.js` are the
likeliest source of failures.

---

## 5. Things the design does that will surprise you

Read these before building the remaining screens.

- **The tab bar is a floating pill**, not a tab bar: `left/right 52, bottom 34`,
  height 66, radius 26, glass fill. The active tab is an inner gradient pill,
  and the gradient differs per tab (Search `#8B3DFF→#2E7BFF`,
  Favorites `#FF2FD6→#8B3DFF`).
- **The Now Playing bar is two different components.** Dashboard: 66px tall,
  radius 24, bottom 34. Search: 62px, radius 22, bottom 118 (above the tab bar).
  Different avatar sizes too (44 vs 42).
- **Station Details has no glow** — it has a 330px gradient hero with
  `border-radius: 0 0 40px 40px`. Structurally unlike every other screen.
- **Selected genre chips cycle three gradients**, they don't share one.
- **The primary CTA is 58px tall with a 20px radius** — not a pill. This was
  wrong in `packages/design` and is now fixed; don't reintroduce it.
- Light mode background is `#FFFFFF`, not `#FAFAFC`.

---

## 6. Data that does not exist

The design shows three metrics RadioBrowser cannot provide. Do not fabricate them.

| Design | Reality | Use instead |
|---|---|---|
| `UPTIME 99.6%` | No uptime field; only `lastcheckok` (0/1) | `getStationStatus()` → Online/Offline + "Checked 2h ago" |
| `TRENDING #6 IN FRANCE` | No per-country rank | `getTrendLabel()` → "Trending up · +142 today", null when flat |
| `248 RESULTS` | Search returns a page, no total | `resultLabel` from `useStationSearch` → "30+ results" |

**Decided:** Station Details' info grid uses **two cards, not three** — drop UPTIME.

`1,284 VOTES` is real (`votes`). Catalogue size ("48,000 stations", "200
countries") is real via `lib/api/stats.ts`.

---

## 7. Invariants — do not break these

### 7.1 One audio player, ever

`stores/audio-player.ts` enforces this. Earlier, repeated `play()` calls stacked
orphaned native players; audio kept going **after the app was killed** and only
uninstalling stopped it.

The three rules, all load-bearing:

1. `teardown()` clears the module reference **before** releasing, so concurrent
   calls can't double-release or skip one.
2. Release order is **pause → detach lock screen → remove**. `remove()` alone
   does not silence a player.
3. A `playToken` counter invalidates in-flight calls; every created player is
   tracked in `livePlayers` so nothing can be orphaned.

**Never call `createAudioPlayer` outside this store.**

### 7.2 Navigation gates are declarative, never both

Onboarding is gated by `<Redirect>` in `(drawer)/_layout.tsx` and
`(onboarding)/_layout.tsx`, driven by `useOnboarding.complete`.

Calling `finish()` **and** `router.replace()` makes the imperative navigation
race the declarative redirect and they cancel — this broke the final onboarding
step and looked like a dead button. Flip the flag only.

### 7.3 Font weights need explicit faces

React Native ignores `fontWeight` on custom families (Android) or fakes it (iOS).
`lib/fonts.ts` → `getFontFamily(family, weight)` resolves the real PostScript
name. Always go through `components/ui/text.tsx`; never set `fontFamily` directly.

### 7.4 Stores never import each other

Cross-store coordination is either a screen-level handler or a service bridge in
`lib/services/`. See `systems/state-management.md`.

### 7.5 Screens never format or fetch

Formatting → `lib/format/`. Data → a hook in `hooks/`. Screens render.

---

## 8. Audio stack history — don't undo this

The app **used** `react-native-track-player`. It was removed. Do not add it back.

Its latest release (4.1.2) targets RN 0.68; this app is on RN 0.86. It needed two
patches — a `Bundle?` nullability fix, then 36 methods rewritten for TurboModule
interop — and still crashed at runtime because its `@ReactMethod`s return `Job`,
not `void`, which the New Architecture rejects.

Replaced with **expo-audio**. Consequences, agreed with the user:

- **Cut:** widgets + Live Activity, lock-screen next/previous, remote station
  artwork (bundled icon instead — expo/expo#44496 crashes on rapid remote
  artwork updates), volume slider.
- **Sleep timer is foreground-accurate, background-approximate.** expo-audio has
  no background JS. A local notification fires at expiry; playback pauses when
  the app is next foregrounded. The Player UI must say so — don't imply precision.
- `expo-widgets` and `react-native-android-widget` were uninstalled.
  The latter also caused a duplicate-class build failure
  (`androidx.work` 2.8.1 vs `work-runtime-ktx` 2.7.1).

---

## 9. Build order for what's left

From `systems/screen-architecture.md`. Each step is testable.

| # | Task | Notes |
|---|---|---|
| 1 | `pnpm check-types` + `pnpm test`, fix fallout | Blocks everything |
| 2 | Point `components/onboarding/chrome.tsx` at the promoted modules | It still has duplicate theme + glow copies |
| 3 | Search screen | `useStationSearch` already handles debounce, pagination, staleness |
| 4 | Floating tab bar + Now Playing bar (both variants) | In `(tabs)/_layout.tsx`, not per screen |
| 5 | Dashboard | FEATURED card, carousel, suggestions |
| 6 | `/recently-played` route | Dashboard's "See all" target |
| 7 | Station Details | 330px hero; two-card info grid |
| 8 | Player + sleep timer bottom sheet | `@gorhom/bottom-sheet` installed |

---

## 10. Environment

- **pnpm only.** `npm install` fails on `catalog:` syntax. Always run from the
  repo root — `workspace:*` deps only link from there.
- Fonts (Outfit, IBM Plex Mono) are embedded via the `expo-font` plugin from
  `assets/fonts/<Family>/`. Changing them needs a rebuild.
- Dev builds: `eas build --profile development --platform android`.
- EAS builds from the **git commit**, not the working tree. Uncommitted work is
  silently excluded — check `git status` before building.

---

## 11. Open questions

1. `systems/` is gitignored — un-ignore it, or the specs are lost.
2. `systems/background-playback.md`, `plans/audio.md`, `flows/03`, `flows/07`
   still describe track-player. They need rewriting for expo-audio.
3. Does audio survive an Android task-swipe? expo-audio gives no equivalent of
   track-player's `appKilledPlaybackBehavior`. Untested.
4. The Dashboard "See all" route isn't in `plans/navigation.md` — decided to add
   it, not yet designed.
