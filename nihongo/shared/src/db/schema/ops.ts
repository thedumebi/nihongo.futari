import { relations, sql } from 'drizzle-orm'
import { boolean, index, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { languages } from './languages.js'

/** Upstream open datasets. One row per dataset, not per download. */
export const importSources = pgTable('import_sources', {
  id: primaryId(),
  code: text('code').notNull().unique(), // jmdict | kanjidic2 | kanjivg | tatoeba | kanjium | chise-ids | wiktextract | edrdg-phonetic
  name: text('name').notNull(),
  url: text('url'),
  homepage: text('homepage'),
  license: text('license').notNull(),
  attributionText: text('attribution_text').notNull(),
  active: boolean('active').notNull().default(true),
  ...timestamps
})

/**
 * The provenance quintet.
 *
 * Spread into every table an importer writes to. It is what makes re-imports
 * safe: an importer may only overwrite a row whose `sourceHash` differs AND
 * which is neither `humanEdited` nor has the target field in `lockedFields`.
 * Anything else becomes an `import_conflicts` row instead of a silent
 * overwrite. `upstreamRemovedAt` exists because upstream datasets merge and
 * retire entries (JMdict does this routinely) and a hard delete would take
 * reviewed local work with it.
 */
export const provenance = {
  sourceId: text('source_id').references(() => importSources.id, { onDelete: 'set null' }),
  sourceRef: text('source_ref'),
  sourceHash: text('source_hash'),
  humanEdited: boolean('human_edited').notNull().default(false),
  lockedFields: text('locked_fields').array().notNull().default([]),
  upstreamRemovedAt: timestamp('upstream_removed_at')
}

export const importRuns = pgTable('import_runs', {
  id: primaryId(),
  sourceId: text('source_id').notNull().references(() => importSources.id, { onDelete: 'cascade' }),
  languageId: text('language_id').references(() => languages.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('running'), // running | succeeded | failed | partial
  datasetVersion: text('dataset_version'),
  datasetChecksum: text('dataset_checksum'),
  rowsRead: integer('rows_read').notNull().default(0),
  rowsInserted: integer('rows_inserted').notNull().default(0),
  rowsUpdated: integer('rows_updated').notNull().default(0),
  rowsSkipped: integer('rows_skipped').notNull().default(0),
  rowsConflicted: integer('rows_conflicted').notNull().default(0),
  log: jsonb('log').$type<unknown[]>().notNull().default([]),
  error: text('error'),
  triggeredBy: text('triggered_by').references(() => users.id, { onDelete: 'set null' }),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  finishedAt: timestamp('finished_at'),
  ...timestamps
}, t => ({
  sourceIdx: index('import_runs_source_idx').on(t.sourceId, t.startedAt)
}))

/** Row-level audit of what an import run did, and why. */
export const importRecords = pgTable('import_records', {
  id: primaryId(),
  runId: text('run_id').notNull().references(() => importRuns.id, { onDelete: 'cascade' }),
  sourceId: text('source_id').notNull().references(() => importSources.id, { onDelete: 'cascade' }),
  sourceRef: text('source_ref').notNull(),
  targetTable: text('target_table').notNull(),
  targetId: text('target_id'),
  contentHash: text('content_hash'),
  action: text('action').notNull(), // insert | update | skip-unchanged | skip-locked | conflict
  ...timestamps
}, t => ({
  runIdx: index('import_records_run_idx').on(t.runId, t.action),
  targetIdx: index('import_records_target_idx').on(t.targetTable, t.targetId)
}))

/**
 * Where a re-import wanted to overwrite human work. Nothing is applied — the
 * row is parked here for a person to resolve, which is what makes the whole
 * import pipeline safe to re-run.
 */
export const importConflicts = pgTable('import_conflicts', {
  id: primaryId(),
  runId: text('run_id').notNull().references(() => importRuns.id, { onDelete: 'cascade' }),
  targetTable: text('target_table').notNull(),
  targetId: text('target_id').notNull(),
  field: text('field').notNull(),
  currentValue: jsonb('current_value'),
  incomingValue: jsonb('incoming_value'),
  resolution: text('resolution').notNull().default('pending'), // pending | keep-current | take-incoming | merged
  resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolvedAt: timestamp('resolved_at'),
  ...timestamps
}, t => ({
  pendingIdx: index('import_conflicts_pending_idx').on(t.resolution, t.createdAt)
}))

/** One Claude enrichment pass. Batch API jobs record their batch id here. */
export const enrichmentRuns = pgTable('enrichment_runs', {
  id: primaryId(),
  kind: text('kind').notNull(), // grammar-prose | etymology-draft | mnemonic | example-selection | distractor-gen | mistake-gen | level-tagging
  languageId: text('language_id').references(() => languages.id, { onDelete: 'set null' }),
  model: text('model').notNull(),
  promptVersion: text('prompt_version').notNull(),
  promptHash: text('prompt_hash'),
  status: text('status').notNull().default('pending'),
  itemCount: integer('item_count').notNull().default(0),
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  costUsd: numeric('cost_usd', { precision: 10, scale: 4 }),
  batchId: text('batch_id'),
  triggeredBy: text('triggered_by').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps
})

/**
 * One generated item. `inputContext` is the exact grounding packet the model
 * was given — kept verbatim because it is both the audit trail and the text
 * the validator checks returned quotes against. `validation` records which
 * mechanical checks passed, so a reviewer can see why something was
 * auto-rejected without re-running anything.
 */
export const enrichmentItems = pgTable('enrichment_items', {
  id: primaryId(),
  runId: text('run_id').notNull().references(() => enrichmentRuns.id, { onDelete: 'cascade' }),
  targetTable: text('target_table').notNull(),
  targetId: text('target_id').notNull(),
  inputContext: jsonb('input_context').$type<Record<string, unknown>>().notNull(),
  output: jsonb('output').$type<Record<string, unknown>>(),
  outputHash: text('output_hash'),
  validation: jsonb('validation').$type<Record<string, unknown>>().notNull().default({}),
  status: text('status').notNull().default('pending'), // pending | generated | auto-rejected | queued | approved | rejected | edited
  error: text('error'),
  ...timestamps
}, t => ({
  runIdx: index('enrichment_items_run_idx').on(t.runId, t.status),
  targetIdx: index('enrichment_items_target_idx').on(t.targetTable, t.targetId)
}))

/**
 * The human gate. Everything an importer or the model proposes for a
 * human-facing field lands here first. The partial unique index means one
 * pending proposal per target at a time, so a re-run can't stack duplicates
 * on the reviewer.
 */
export const contentReviewQueue = pgTable('content_review_queue', {
  id: primaryId(),
  languageId: text('language_id').references(() => languages.id, { onDelete: 'set null' }),
  targetTable: text('target_table').notNull(),
  targetId: text('target_id').notNull(),
  changeType: text('change_type').notNull().default('update'), // create | update
  proposed: jsonb('proposed').$type<Record<string, unknown>>().notNull(),
  current: jsonb('current').$type<Record<string, unknown>>(),
  diff: jsonb('diff').$type<Record<string, unknown>>(),
  origin: text('origin').notNull(), // ai | import | human
  enrichmentItemId: text('enrichment_item_id').references(() => enrichmentItems.id, { onDelete: 'set null' }),
  importRunId: text('import_run_id').references(() => importRuns.id, { onDelete: 'set null' }),
  priority: integer('priority').notNull().default(0),
  status: text('status').notNull().default('pending'), // pending | claimed | approved | rejected | changes-requested
  claimedBy: text('claimed_by').references(() => users.id, { onDelete: 'set null' }),
  claimedAt: timestamp('claimed_at'),
  reviewerId: text('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  reviewerNotes: text('reviewer_notes'),
  appliedAt: timestamp('applied_at'),
  ...timestamps
}, t => ({
  workQueueIdx: index('content_review_queue_work_idx').on(t.languageId, t.status, t.priority, t.createdAt),
  onePendingPerTarget: uniqueIndex('content_review_queue_one_pending')
    .on(t.targetTable, t.targetId)
    .where(sql`${t.status} = 'pending'`)
}))

export const importRunsRelations = relations(importRuns, ({ one, many }) => ({
  source: one(importSources, { fields: [importRuns.sourceId], references: [importSources.id] }),
  records: many(importRecords),
  conflicts: many(importConflicts)
}))

export const enrichmentRunsRelations = relations(enrichmentRuns, ({ many }) => ({
  items: many(enrichmentItems)
}))
