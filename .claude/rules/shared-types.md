---
paths:
  - "*/shared/src/types/**/*.ts"
---

# Shared Types

**This is the rule to break least in this repo: every shape has exactly one
definition, and everything else derives from it.**

All exported types and interfaces live here — one file per domain, re-exported
from `types/index.ts`. Not in schema files, not in route files, not in
components, not in services.

## Persisted shapes derive from the Drizzle table

```ts
// shared/src/types/kanji.ts
import type { kanji, kanjiReadings } from '@/db/schema/kanji.js'

export type Kanji = typeof kanji.$inferSelect
export type NewKanji = typeof kanji.$inferInsert
export type KanjiReading = typeof kanjiReadings.$inferSelect
```

`$inferSelect` / `$inferInsert` appear **only in this folder**. A PreToolUse
hook blocks them anywhere else — if it fires, move the derivation here and
import from `@nihongo/shared/types`, don't work around it.

## Runtime-validated shapes derive from the Zod schema

Anything crossing a trust boundary — request bodies, API responses, enrichment
output, offline sync payloads — is a Zod schema first, and the type comes from
`z.infer`:

```ts
import { z } from '@hono/zod-openapi'

export const answerSchema = z.object({
  cardId: z.string(),
  rating: z.number().int().min(1).max(4),
  reviewedAt: z.iso.datetime()
}).openapi('Answer')

export type AnswerInput = z.infer<typeof answerSchema>
```

Use the `z` re-exported from `@hono/zod-openapi` so `.openapi()` is available
and the schema doubles as an OpenAPI component.

`drizzle-zod`'s `createSelectSchema` / `createInsertSchema` are fine when you
need a **runtime** schema for a table. Then the type comes from `z.infer` of
that — and you do **not** also add an `$inferSelect` alias for the same shape.

> Gotcha: `drizzle-zod@0.5.1` resolves its own `zod` instance, so `.openapi()`
> is **not** chainable off `createSelectSchema(...)`. Rebuild with the
> `@hono/zod-openapi` `z` if you need OpenAPI metadata on it.

## Never restate a shape

```ts
// ✗ WRONG — duplicates Kanji
interface KanjiDto { character: string, strokeCount: number }

// ✓ RIGHT — narrow the existing type
export type KanjiSummary = Pick<Kanji, 'id' | 'character' | 'strokeCount'>
```

Reach for `Pick`, `Omit`, `Partial`, and intersections. If you are typing the
same field list a second time, the second one is a bug.

## Checklist

- [ ] Does this shape already exist somewhere? Search before you write.
- [ ] Is it persisted? Derive from the table.
- [ ] Is it validated at runtime? Derive from the Zod schema.
- [ ] Is it a subset of an existing type? `Pick`/`Omit`, don't retype.
- [ ] Is it exported from `types/index.ts`?
