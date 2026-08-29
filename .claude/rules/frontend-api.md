---
paths:
  - "*/frontend/src/api/**/*.ts"
  - "*/web/src/api/**/*.ts"
---

# Frontend API Layer Rules

> **Project Resolution.** Paths use `<project>` and `<frontend>` placeholders — `<project>` is the leading folder of the file you're editing, `<frontend>` is `frontend/` for nihongo or `web/` for doca and projects from `/new-project`. Resolve `@<project>/shared/...` imports to the matching scope. See `.claude/project-profiles.md`.

## File Structure

One API file per logical domain (e.g., `prompts.ts`, `evaluations.ts`, `repos.ts` — whatever domains the project has).

## Import Pattern

```typescript
import type {
  PromptListResponseType,
  CreatePromptType,
  PromptResponseType
} from '@<project>/shared/types'

import { API_ENDPOINTS } from '@<project>/shared/constants'
import apiClient from './axios'
```

- Types: ALWAYS import from `@<project>/shared/types` (use `import type`)
- Endpoints: ALWAYS import from `@<project>/shared/constants` - never hardcode URL strings
- HTTP client: ALWAYS use `apiClient` from `./axios` (or whatever the project's HTTP client wrapper is named)

## Function Pattern

```typescript
// GET (list)
export async function listPrompts(filter: PromptListQueryType): Promise<PromptListResponseType[]> {
  const response = await apiClient.get(API_ENDPOINTS.PROMPTS.LIST, { params: filter })
  return response.data
}

// GET (single, with dynamic endpoint)
export async function getPrompt(id: string): Promise<PromptResponseType> {
  const response = await apiClient.get<PromptResponseType>(API_ENDPOINTS.PROMPTS.GET_BY_ID(id))
  return response.data
}

// POST
export async function createPrompt(data: CreatePromptType): Promise<CreatePromptResponseType> {
  const response = await apiClient.post<CreatePromptResponseType>(API_ENDPOINTS.PROMPTS.CREATE, data)
  return response.data
}

// PATCH
export async function updatePrompt(id: string, data: UpdateType): Promise<PromptResponseType> {
  const response = await apiClient.patch<PromptResponseType>(API_ENDPOINTS.PROMPTS.UPDATE(id), data)
  return response.data
}

// DELETE
export async function deletePrompt(promptId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.PROMPTS.DELETE, { data: { promptId } })
}
```

## Rules

- All functions MUST be `async` with explicit `Promise<ReturnType>` return type
- ALWAYS return `response.data` (not the full axios response)
- Use named function exports (not arrow functions or default exports)
- Endpoint paths come from `API_ENDPOINTS` constants, NEVER hardcode strings
- For streaming endpoints, use native `fetch` instead of axios (see `use-stream.ts` composable if the project has one)
