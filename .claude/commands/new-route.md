---
name: new-route
description: Scaffold a new backend route domain with all 3 files, endpoint constants, and app registration for a project
argument-hint: "[project] <domain-name>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Scaffold a New Backend Route Domain

## Step 0: Resolve Project

Single-project monorepo — paths are `nihongo/{backend,frontend,shared}` and the package is `@nihongo/shared`. Parse `$ARGUMENTS`:

- If the first whitespace-separated token matches a project listed in the profile's Folder paths table, that's `PROJECT`; the rest is `DOMAIN`.
- `PROJECT` is always `nihongo` (single-project monorepo); entire `$ARGUMENTS` is `DOMAIN`.

Resolve `<backend>`, `<shared>`, `<shared-pkg>` from the profile for `PROJECT`. Use them everywhere below.

Print: `Scaffolding route "<DOMAIN>" for project "<PROJECT>"`.

---

Create a complete backend route domain for **`<DOMAIN>`**.

## Steps

1. **Add endpoint constants** in `<shared>/src/constants/endpoints.ts`:
   - Add to `ROUTE_BASE_PATHS`: the base path for this domain
   - Create `{DOMAIN}_ROUTES` with standard CRUD patterns (LIST, CREATE, GET_BY_ID, UPDATE, DELETE)
   - Add to `API_ENDPOINTS`: full endpoint paths (static strings + dynamic functions for parameterized routes)

2. **Create route files** in `<backend>/src/routes/<DOMAIN>/`:

   a. **`<DOMAIN>.routes.ts`**:
      - Import the route helper from `@nihongo/shared/openapi` (`createPublicRoute` / `createSecuredRoute` / `createAdminRoute`)
      - Import route constants from `<shared-pkg>/constants`
      - Import relevant Zod schemas from `<shared-pkg>/types` or `<shared-pkg>/db/schema`
      - Define routes for: `list`, `create`, `getOne`, `update`, `delete` (at minimum)
      - Export a type for each route: `export type ListRoute = typeof list`

   b. **`<DOMAIN>.handlers.ts`**:
      - Import `AppRouteHandler` from `@/lib/types.js`
      - Import route types from `./<DOMAIN>.routes.js`
      - Import the relevant service from `<shared-pkg>`
      - Implement handlers: take `userId` from `c.var.session` and scope every query by it, validate inputs with `c.req.valid()`, call service methods, return with `c.json()`

   c. **`<DOMAIN>.index.ts`**:
      - Import `ROUTE_BASE_PATHS` from `<shared-pkg>/constants`
      - Import `createRouter` from `@/lib/create-app.js`
      - Import `authMiddleware` from `@/middlewares/auth.js`
      - Import handlers and routes with `* as`
      - Create router with `.basePath(ROUTE_BASE_PATHS.DOMAIN)`
      - Apply auth middleware, mount all routes
      - Export default router

3. **Register in app.ts**:
   - Import the router in `<backend>/src/app.ts`
   - Add to the `routes` array

4. **Verify**: Check that all imports resolve and types are consistent across the 3 files.

## Reference

Look at existing route folders in `nihongo/backend/src/routes/` for the three-file pattern. Paths always come from `ROUTE_BASE_PATHS` / `*_ROUTES` in `nihongo/shared/src/constants/endpoints.ts` — never hard-code a URL.
