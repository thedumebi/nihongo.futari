---
paths:
  - "*/backend/src/routes/**/*.ts"
  - "*/backend/src/services/**/*.ts"
---

# Backend Routes & Services

## The three-file trio

Every domain is exactly three files under `backend/src/routes/<domain>/`:

| File | Contains |
|---|---|
| `<domain>.routes.ts` | `createRoute` configs + `export type XRoute = typeof x` |
| `<domain>.handlers.ts` | Typed handlers keyed to those route types |
| `<domain>.index.ts` | `createRouter().basePath(...)` and the registrations |

Register the router in `backend/src/app.ts`.

## Path registration order matters

Literal paths go **before** parameterised ones, or `/queue` gets swallowed by
`/:id`:

```ts
router.openapi(routes.listDue, handlers.listDue)   // /queue
router.openapi(routes.getById, handlers.getById)   // /:id   <- last
```

## Paths come from constants

Never write a URL string. Everything is in
`shared/src/constants/endpoints.ts` — `ROUTE_BASE_PATHS`, `<DOMAIN>_ROUTES`,
`API_ENDPOINTS`. A PreToolUse hook blocks hardcoded API paths.

## Route helpers

Use `createPublicRoute` / `createSecuredRoute` / `createAdminRoute` from
`@nihongo/shared/openapi`. Middleware goes inline in the route config, not
wrapped around the handler.

## All DB access lives in services

Handlers do: read validated input, call a service, shape the response. They do
not build queries. Services live in `backend/src/services/<domain>.service.ts`
and are the only place Drizzle is imported outside the schema.

## Scope by user — every time

Every query touching `srs_cards`, `srs_review_logs`, `user_*`, `handwriting_attempts`
or progress MUST filter by `userId` from `c.var.session`. A missing user scope
is a data-leak bug, not a style nit. Reviewers should treat it as blocking.

## Content publication gates

Anything user-facing that originated from an importer or the model is only
visible when `published`/`status = 'published'`. Never let a route return
`draft` or `ai-drafted` content to a non-admin caller.
