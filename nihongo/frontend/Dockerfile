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
ARG VITE_APP_TITLE=nihongo
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
# Same-origin API base baked into the SPA. In prod this is "/api" so the
# browser hits the frontend origin and nginx proxies through to the backend.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
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
COPY --from=build /app/nihongo/frontend/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
