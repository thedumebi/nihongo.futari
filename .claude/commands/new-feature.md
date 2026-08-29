---
name: new-feature
description: Plan and scaffold a full-stack feature across all layers (schema, types, service, routes, API, view) for a project
argument-hint: "[project] <feature-name>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Full-Stack Feature Scaffold

## Step 0: Resolve Project

Single-project monorepo — paths are `nihongo/{backend,frontend,shared}` and the package is `@nihongo/shared`. Parse `$ARGUMENTS`:

- If the first whitespace-separated token of `$ARGUMENTS` matches a project listed in the profile's Folder paths table, that's `PROJECT`; the remaining tokens are `FEATURE`.
- `PROJECT` is always `nihongo` (single-project monorepo); entire `$ARGUMENTS` is `FEATURE`.

Then resolve `<backend>`, `<frontend>`, `<shared>`, `<shared-pkg>` from the profile for `PROJECT`. All paths and imports below use those resolved values.

Print one line: `Scaffolding feature "<FEATURE>" for project "<PROJECT>"` so it's clear which target you're building against.

> **Note:** this project is young — many building blocks do not exist yet. Check a file exists before assuming it does; create the analogue or skip the step with a note rather than inventing a pattern that contradicts `CLAUDE.md`.

---

## Implementation Order

Plan and implement the **`<FEATURE>`** feature across all layers of the selected project. Work through each layer in order, ensuring types flow correctly from database to frontend.

### Layer 1: Database Schema (`<shared>/src/db/schema/`)
- Define table(s) with `pgTable()`
- Define relations
- Derive Zod insert/select schemas with `drizzle-zod`
- Export types, schemas, and table from barrel exports
- Update `<shared>/src/db/schema/index.ts`
- Run `pnpm drizzle:generate` for migration

### Layer 2: Types (`<shared>/src/types/`)
- Create or update type file for the domain
- Import base schemas from DB and extend with `.openapi()` metadata
- Define request schemas (Create, Update, Query)
- Define response schemas (may include joined/computed fields)
- Export both Zod schemas AND inferred TypeScript types
- Update `<shared>/src/types/index.ts` barrel export

### Layer 3: Service (`<shared>/src/services/`)
- Create service class with static methods
- Implement CRUD operations using Drizzle ORM
- Throw `ApiError` for business logic errors
- Export from `<shared>/src/index.ts`

### Layer 4: Endpoint Constants (`<shared>/src/constants/endpoints.ts`)
- Add `ROUTE_BASE_PATHS` entry
- Add `{DOMAIN}_ROUTES` patterns
- Add `API_ENDPOINTS` full paths (static + dynamic functions)

### Layer 5: Backend Routes (`<backend>/src/routes/`)
- Create the 3-file route domain:
  - `*.routes.ts` - route definitions with `createOrganizationRoute()` (or the project's equivalent route helper)
  - `*.handlers.ts` - handlers typed with `AppRouteHandler<RouteType>`
  - `*.index.ts` - router setup with auth middleware
- Register in `<backend>/src/app.ts`

### Layer 6: Frontend API (`<frontend>/src/api/`)
- Create API module importing types from `<shared-pkg>/types`
- Use `API_ENDPOINTS` from `<shared-pkg>/constants`
- Implement async functions returning typed promises

### Layer 7: Frontend View (`<frontend>/src/views/`)
- Create view component with `<script setup lang="ts">`
- Follow section ordering (stores, composables, state, computed, watchers, lifecycle, methods)
- Use `lucide-vue-next` icon components and the `@theme` colour tokens
- Add route to `<frontend>/src/constants/routes.ts` and `<frontend>/src/router/index.ts`

### Layer 8: Navigation
- Add sidebar link in `<frontend>/src/components/app-layout.vue` (or equivalent layout component)
- Import the icon component from `lucide-vue-next`

## Verification Checklist
- [ ] Types flow from DB schema through to frontend without duplication
- [ ] All endpoints use constants (no hardcoded strings)
- [ ] All icons in constants (no inline SVGs)
- [ ] Olive color for primary actions
- [ ] Route types exported from routes file
- [ ] Handlers use services (no direct DB access)
- [ ] Frontend API functions have explicit return types
