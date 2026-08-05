# Build from the monorepo root: docker build -f apps/web/Dockerfile .
#
# Adapted from the excuseless web image — same stack and monorepo shape (pnpm workspaces using
# the `catalog:` protocol, a Next.js app fed by shared packages/). That file carries fixes for
# failures already hit in real deployments, so the reasoning behind some lines isn't visible
# from this codebase alone; each is commented rather than left to look like cruft.
#
# Two differences from the excuseless reference:
#
#   1. packages/design is copied as well. apps/web depends on @static-wave/ui, and that package
#      depends on @static-wave/design — packages/ui/src/styles/globals.css does
#      `@import "@static-wave/design/theme.css"`. Omitting it makes the Tailwind build fail on a
#      missing import rather than anything that names the real cause.
#   2. apps/native is never copied. The Expo app shares packages/design and packages/types with
#      the web app but is not part of this image; pulling it in would drag the whole React Native
#      dependency tree into a build that doesn't use it.
#
# Like excuseless, this app is database-free: no packages/db, no Prisma, no openssl.
FROM node:22-slim AS builder

WORKDIR /app

# corepack rather than `npm install -g pnpm@11`: package.json pins packageManager to pnpm@11.4.0,
# and a floating `@11` can resolve to a newer patch than the one that wrote pnpm-lock.yaml, which
# makes --frozen-lockfile fail for no useful reason.
RUN corepack enable && corepack prepare pnpm@11.4.0 --activate

# Some platforms (Coolify, Dokku and similar) inject NODE_ENV=production as a *build-time*
# variable. pnpm reads that the same as `--prod` and silently skips devDependencies — here that
# would drop typescript, tailwindcss and @tailwindcss/postcss, all of which `next build` needs.
#
# Scoped to the install step only, and flipped back to production before `next build` below:
# leaving it as development through the build makes Next warn about a non-standard NODE_ENV and
# then fail prerendering /_global-error, because the build runs against React's development
# bundle. NODE_ENV only affects what pnpm *installs*, so switching it afterwards is safe —
# devDependencies are already on disk by then.
ENV NODE_ENV=development

# Workspace manifests + lockfile first, so the install layer survives source edits.
# .npmrc matters here: it sets node-linker=isolated, and installing without it produces a
# different node_modules layout than the one the app is developed against.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/config/package.json packages/config/
COPY packages/design/package.json packages/design/
COPY packages/env/package.json packages/env/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/

# `--filter web...` installs the web app and everything it depends on, and nothing else. Without
# it pnpm would also resolve apps/native, which pulls in Expo and React Native for an image that
# never builds them.
#
# No build ARGs: the site is privacy policy and terms only, with no API calls, so
# packages/env/src/web.ts declares an empty schema and `next build` needs nothing injected. If a
# NEXT_PUBLIC_* var is ever added there, it must also be added here as an ARG/ENV pair —
# env-nextjs validates at build time and bakes the value into the client bundle, so a missing one
# fails the build rather than the run.
RUN pnpm install --frozen-lockfile --filter web...

# Source after install for better layer caching.
COPY packages/config/ packages/config/
COPY packages/design/ packages/design/
COPY packages/env/ packages/env/
COPY packages/types/ packages/types/
COPY packages/ui/ packages/ui/
COPY apps/web/ apps/web/

# Back to production for the build itself — see the NODE_ENV note above.
ENV NODE_ENV=production

RUN pnpm --filter web build

# ---- Runner ----
FROM node:22-slim AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.4.0 --activate

# next.config.ts doesn't set `output: "standalone"`, so `next start` needs the full node_modules
# tree rather than a pruned bundle — copied wholesale from the builder instead of reinstalled
# here (a fresh `pnpm install --prod` would drop next itself from the workspace links).
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /app/apps/web

EXPOSE 3001

CMD ["pnpm", "start"]
