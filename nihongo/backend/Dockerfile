# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:22.17.0-alpine AS base
RUN npm install -g pnpm@10.13.1
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY nihongo/shared/package.json ./nihongo/shared/
COPY nihongo/backend/package.json ./nihongo/backend/
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY packages ./packages
COPY nihongo/shared ./nihongo/shared
COPY nihongo/backend ./nihongo/backend
ENV DOCKER_BUILD=1
RUN pnpm --filter @nihongo/shared build
RUN pnpm --filter backend build

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/nihongo/shared/dist ./nihongo/shared/dist
COPY --from=build /app/nihongo/shared/package.json ./nihongo/shared/package.json
COPY --from=build /app/nihongo/shared/node_modules ./nihongo/shared/node_modules
COPY --from=build /app/nihongo/backend/dist ./nihongo/backend/dist
COPY --from=build /app/nihongo/backend/package.json ./nihongo/backend/package.json
COPY --from=build /app/nihongo/backend/node_modules ./nihongo/backend/node_modules
# Ship the generated SQL migrations — the run-migrations init container resolves
# them at ../../../shared/src/db/migrations relative to dist/db/migrate.js.
COPY --from=build /app/nihongo/shared/src/db/migrations ./nihongo/shared/src/db/migrations
# Ship the .sql seed files — seed.js resolves them at ../../src/db/seeds
# relative to dist/db/seed.js.
COPY --from=build /app/nihongo/backend/src/db/seeds ./nihongo/backend/src/db/seeds
WORKDIR /app/nihongo/backend
EXPOSE 3008
CMD ["node", "dist/index.js"]
