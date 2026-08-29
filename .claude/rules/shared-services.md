---
paths:
  - "*/shared/src/services/**/*.ts"
---

# Shared Service Layer Rules

> **Project Resolution.** Applies to any project's `<project>/shared/src/services/` folder. Local `@/...` imports resolve within the same shared package. The auth-scope assumption (`teamId`) is **nihongo-specific** — other projects may scope by user, organization, or not at all. Mirror the auth pattern used by existing services in the same project rather than copying nihongo's verbatim.

## Service Class Pattern

Services use static methods by default:

```typescript
import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { CreateItemRequest } from '@/types/items.js'
import { HttpStatusCodes } from '@/constants/index.js'
import db from '@/db/index.js'
import { items } from '@/db/schema/index.js'
import { ApiError } from '@/lib/api-errors.js'

export class ItemService {
  static async list(teamId: string, query: PaginationQuery) {
    const { page, pageSize, search } = query
    const offset = (page - 1) * pageSize

    const conditions = [eq(items.teamId, teamId)]
    if (search) {
      conditions.push(ilike(items.name, `%${search}%`))
    }

    const where = and(...conditions)
    const [totalResult] = await db.select({ value: count() }).from(items).where(where)
    const data = await db.query.items.findMany({
      where,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: pageSize,
      offset
    })

    return { data, pagination: buildPaginationMeta(query, totalResult?.value ?? 0) }
  }

  static async create(data: CreateItemRequest, teamId: string, userId: string) {
    const [item] = await db.insert(items).values({
      name: data.name,
      description: data.description,
      teamId,
      createdBy: userId
    }).returning()

    if (!item) {
      throw new ApiError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'internal_error',
        'failed_to_create',
        'Failed to create item'
      )
    }

    return item
  }

  static async delete(id: string, teamId: string) {
    const existing = await db.select().from(items)
      .where(and(eq(items.id, id), eq(items.teamId, teamId)))
      .limit(1)

    if (!existing.length) {
      throw new ApiError(404, 'NOT_FOUND', 'ITEM_NOT_FOUND', 'Item not found')
    }

    await db.delete(items).where(eq(items.id, id))
  }
}
```

## Conventions

- All database access happens ONLY in services (never in backend handlers)
- Use static methods for stateless services
- Use constructor pattern (with `db` injection) for services that need instance state
- Import DB from `@/db/index.js` and schemas from `@/db/schema/index.js`
- Throw `ApiError` for business logic errors (not generic `Error`)
- Use Drizzle relational queries (`db.query.tableName.findMany()`) instead of raw SQL or Drizzle query builder when possible
- Use Drizzle query builder when you cannot make use of drizzle relational queries (`db.select()`, `db.insert()`, `db.update()`, `db.delete()`)
- Helper function pattern: `export function createXxxService() { return new XxxService(db) }`
- Barrel export from domain `index.ts` and register in `<project>/shared/src/index.ts`
- Make use of DateTime from `luxon` for any date manipulation logic in services
