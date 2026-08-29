---
paths:
  - "*/frontend/src/router/**"
  - "*/frontend/src/constants/routes.ts"
  - "*/web/src/router/**"
  - "*/web/src/constants/routes.ts"
---

# Frontend Router Rules

> **Project Resolution.** Applies to any project's frontend router (`<project>/<frontend>/src/router/`) and routes constant (`<project>/<frontend>/src/constants/routes.ts`). See `.claude/project-profiles.md`.

## Route Definition

Routes are defined as `RouteRecordRaw` objects using path strings from the `ROUTES` constant:

```typescript
{
  path: ROUTES.DASHBOARD,
  name: 'Dashboard',
  component: Dashboard,
  meta: { requiresAuth: true }
}
```

## Naming Conventions

- Route `name`: PascalCase matching the component name (e.g., `'PromptEditor'`)
- Route `path`: comes from `ROUTES` constant, never hardcoded

## Meta Fields

- `requiresAuth: true` - route requires authentication
- `isAdmin: true` - route requires admin role
- (Other meta fields may be project-specific — check existing route definitions before adding new ones.)

## ROUTES Constant Pattern (in `<project>/<frontend>/src/constants/routes.ts`)

```typescript
export const ROUTES = {
  // Static paths
  DASHBOARD: '/dashboard',

  // Dynamic paths (functions for navigation)
  PROMPT_EDITOR: (id: string) => `/prompts/${id}`,

  // Template paths (strings for Vue Router definitions)
  PROMPT_EDITOR_TEMPLATE: '/prompts/:id',
} as const
```

- Static routes: plain string constants
- Dynamic routes for navigation: functions that return interpolated strings
- Template routes for router definitions: strings with `:param` syntax, suffixed with `_TEMPLATE`

## Navigation in Components

```typescript
import { ROUTES } from '@/constants'

// Static navigation
router.push(ROUTES.DASHBOARD)

// Dynamic navigation
router.push(ROUTES.PROMPT_EDITOR(prompt.id))
```
