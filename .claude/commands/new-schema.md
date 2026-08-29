---
name: new-schema
description: Scaffold a new Drizzle DB schema with table, relations, Zod schemas, and barrel exports for a project
argument-hint: "[project] <domain/table-name>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Scaffold a New Database Schema

## Step 0: Resolve Project

Single-project monorepo — paths are `nihongo/{backend,frontend,shared}` and the package is `@nihongo/shared`. Parse `$ARGUMENTS`:

- If the first whitespace-separated token matches a project listed in the profile's Folder paths table, that's `PROJECT`; the rest is `TARGET` (the `domain/table-name`).
- `PROJECT` is always `nihongo` (single-project monorepo); entire `$ARGUMENTS` is `TARGET`.

Resolve `<shared>` from the profile for `PROJECT`. Use it everywhere below.

Print: `Scaffolding schema "<TARGET>" for project "<PROJECT>"`.

---

Create a new Drizzle ORM schema for **`<TARGET>`**.

## Schema-First Workflow

Schema files are the source of truth for the database. You define the table in TypeScript, export it, then Drizzle generates the SQL migration from it. Never write raw SQL to create or alter tables.

## Steps

1. **Determine location**: If this is a new domain, create a folder at `<shared>/src/db/schema/<TARGET>/`. If it belongs to an existing domain, add a new file to the existing folder.

2. **Create the schema file** (e.g., `<shared>/src/db/schema/<TARGET>/{table-name}.ts`):

   ```typescript
   import { relations } from 'drizzle-orm'
   import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
   import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
   ```

   - Define the table with `pgTable()`:
     - UUID primary key: `id: uuid('id').defaultRandom().primaryKey()`
     - Foreign keys with cascade: `.references(() => table.id, { onDelete: 'cascade' })`
     - Timestamps: `createdAt` (required, defaultNow), `updatedAt` (optional)
     - Indexes in the third argument
   - Define relations with `relations()`
   - Derive Zod schemas with `createInsertSchema()` / `createSelectSchema()`
     - `.omit()` auto-generated fields (id, createdAt, updatedAt)
   - Export types with `z.infer<>`
   - Export the table as `default`

3. **Create or update the domain barrel export** (`index.ts` in the domain folder):
   ```typescript
   export {
     default as tableName,
     insertSchema,
     selectSchema,
     tableRelations,
     type InsertType,
     type SelectType
   } from './table-name.js'
   ```

4. **Update the main schema index** at `<shared>/src/db/schema/index.ts`:
   - Add `export * from './<TARGET>/index.js'` (or the specific file if no domain folder)

5. **Generate migration**: Run `pnpm drizzle:generate` to create the SQL migration. Run from the relevant project's backend folder if needed.

## Reference

Look at existing schema files in `nihongo/shared/src/db/schema/` for working examples — `kanji.ts` and `srs.ts` are the most representative. Remember: schema files export tables and relations ONLY; the derived types live in `nihongo/shared/src/types/`.
