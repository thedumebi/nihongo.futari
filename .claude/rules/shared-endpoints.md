---
paths:
  - "*/shared/src/constants/**/*.ts"
---

# Endpoint & Constants Rules

> **Project Resolution.** Applies to any project's `<project>/shared/src/constants/` folder. Frontend code imports from the matching `@<project>/shared/constants` package.

## Three-Level Endpoint System

### 1. Route Base Paths (backend router base)

```typescript
export const ROUTE_BASE_PATHS = {
  PROMPTS: '/prompts',
  EVALUATIONS: '/evaluations',
  NEW_DOMAIN: '/new-domain',
} as const
```

### 2. Domain Route Patterns (route-level paths)

```typescript
export const NEW_DOMAIN_ROUTES = {
  LIST: '/',
  CREATE: '/',
  GET_BY_ID: '/:id',
  UPDATE: '/:id',
  DELETE: '/:id',
  // Nested resources
  LIST_CHILDREN: '/:id/children',
} as const
```

### 3. API Endpoints (full paths for frontend/SDK)

```typescript
export const API_ENDPOINTS = {
  NEW_DOMAIN: {
    LIST: `${ROUTE_BASE_PATHS.NEW_DOMAIN}${NEW_DOMAIN_ROUTES.LIST}`,
    CREATE: `${ROUTE_BASE_PATHS.NEW_DOMAIN}${NEW_DOMAIN_ROUTES.CREATE}`,
    GET_BY_ID: (id: string) =>
      `${ROUTE_BASE_PATHS.NEW_DOMAIN}${NEW_DOMAIN_ROUTES.GET_BY_ID.replace(':id', id)}`,
    UPDATE: (id: string) =>
      `${ROUTE_BASE_PATHS.NEW_DOMAIN}${NEW_DOMAIN_ROUTES.UPDATE.replace(':id', id)}`,
    DELETE: (id: string) =>
      `${ROUTE_BASE_PATHS.NEW_DOMAIN}${NEW_DOMAIN_ROUTES.DELETE.replace(':id', id)}`,
  },
}
```

## Conventions

- Base paths: `SCREAMING_SNAKE_CASE` keys, lowercase path values
- Route patterns: relative paths starting with `/`
- API endpoints: static paths are strings, dynamic paths are functions that take the param and return interpolated string
- All constants use `as const` for literal types
- When adding a new domain, add entries at ALL three levels
- Frontend imports from `@<project>/shared/constants`, backend uses `ROUTE_BASE_PATHS` + domain routes
