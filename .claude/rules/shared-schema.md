---
paths:
  - "*/shared/src/db/schema/**/*.ts"
---

# Drizzle Schema

## Export tables and relations only

**No `export type` in this folder.** Derived types live in
`shared/src/types/<domain>.ts`. A PreToolUse hook enforces this.

## Table idiom

```ts
export const kanji = pgTable('kanji', {
  id: primaryId(),                                   // text UUID, from columns.ts
  languageId: text('language_id').notNull()
    .references(() => languages.id, { onDelete: 'cascade' }),
  character: text('character').notNull(),
  ...provenance,                                     // importable tables only
  ...timestamps
}, t => ({
  charUnique: uniqueIndex('kanji_character_unique').on(t.languageId, t.character)
}))
```

- `primaryId()` and `timestamps` come from `./columns.js`.
- `provenance` comes from `./ops.js` and goes on **every table an importer
  writes to** — it is what makes re-imports non-destructive.
- Enums are `text` plus a union in `shared/src/constants/endpoints.ts`. **No
  `pgEnum`** — altering one in Postgres is painful and the app-level union is
  what the frontend needs anyway.
- FSRS floats are `doublePrecision`, never `real`, so replay reproduces
  bit-identical values.

## Polymorphism is an exclusive arc

N nullable FKs plus `CHECK (num_nonnulls(...) = 1)`, plus one partial unique
index per arm. Never a `(target_type, target_id)` string pair — that throws away
foreign keys, cascades and join ergonomics.

```ts
exactlyOneTarget: check('study_items_exactly_one_target',
  sql`num_nonnulls(${t.kanaId}, ${t.kanjiId}, ${t.wordId}, ...) = 1`)
```

**If a new content kind doesn't fit, add a table and an arm. Never add
`payload jsonb`.** That is the generic-blob failure mode arriving by the back
door, and this design exists to prevent it.

## Constraints over convention

Where an invariant matters, express it as a CHECK so the database refuses bad
data — don't rely on a service remembering. The etymology publish gates are the
model:

```ts
publishNeedsSource: check('etymology_publish_needs_source',
  sql`${t.status} <> 'published' or ${t.sourceCount} > 0`)
```

## Migrations

`pnpm -C nihongo/shared drizzle:generate`, then read the generated SQL before
committing it. **Never `drizzle-kit push`** — this database holds a large
imported corpus and `push` will eventually propose a destructive alter.

After adding a table, register it in `schema/index.ts`.
