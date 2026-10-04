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
COPY nihongo/frontend/package.json ./nihongo/frontend/
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
# Built ONCE with placeholders, not real values: env.sh replaces them when the
# container starts, from runtime-env/<NODE_ENV>.env. So the same image serves
# production and staging (nagaya sets NODE_ENV), and the values live in this
# repo, per environment. DOCKER_BUILD=1 below skips vite.config's URL check,
# which a placeholder would fail; the browser still validates the real values.
ENV VITE_APP_TITLE=NIHONGO_APP_TITLE
ENV VITE_API_URL=NIHONGO_API_URL
ENV DOCKER_BUILD=1
COPY packages ./packages
COPY nihongo/shared ./nihongo/shared
COPY nihongo/frontend ./nihongo/frontend
RUN pnpm --filter @nihongo/shared build
RUN pnpm --filter frontend build

# ---- Runner (unprivileged nginx) ----
# nginx-unprivileged runs as non-root (uid 101) and listens on 8080, so the
# pod can drop root without the "bind :80 permission denied" problem.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner
COPY nihongo/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/nihongo/frontend/dist /usr/share/nginx/html
# Runtime configuration (see env.sh). The stock entrypoint runs everything in
# /docker-entrypoint.d/ before starting nginx.
COPY --chmod=755 nihongo/frontend/env.sh /docker-entrypoint.d/40-runtime-env.sh
COPY nihongo/frontend/runtime-env /etc/app-env
# env.sh rewrites the built files in place as the unprivileged nginx user
# (uid 101), so it needs to own them and their directory.
USER root
RUN chown -R 101:101 /usr/share/nginx/html
USER 101
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
