import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { grammarPoints } from './grammar.js'
import { kanji, phoneticSeries, radicals } from './kanji.js'
import { languages } from './languages.js'
import { words } from './words.js'

/**
 * Deduplicated bibliography. `reliabilityTier` is what stops a crowd-sourced
 * wiki entry from being cited with the same weight as a scholarly reference:
 *   1 = scholarly reference (日本国語大辞典, Frellesvig, Schuessler)
 *   2 = reputable secondary (KANJIDIC, JMdict, published textbooks)
 *   3 = community / crowd-sourced (Wiktionary)
 */
export const sources = pgTable('sources', {
  id: primaryId(),
  slug: text('slug').notNull().unique(),
  kind: text('kind').notNull(), // dictionary | academic-paper | book | database | corpus | web
  title: text('title').notNull(),
  abbreviation: text('abbreviation'),
  authors: text('authors').array().notNull().default([]),
  publisher: text('publisher'),
  year: integer('year'),
  isbn: text('isbn'),
  url: text('url'),
  accessedAt: timestamp('accessed_at'),
  license: text('license'),
  citation: text('citation'),
  reliabilityTier: smallint('reliability_tier').notNull().default(3),
  notes: text('notes'),
  ...timestamps
})

/**
 * ONE ROW PER THEORY, not per target. Kanji etymology is genuinely contested —
 * Shirakawa and the traditional readings disagree constantly, and the popular
 * app ecosystem presents invented origins as settled fact. Entries sharing a
 * `competingGroupId` render together as "Theory 1 / Theory 2" rather than the
 * app silently picking a winner.
 *
 * The two CHECK constraints below are the integrity story: an etymology with
 * no source, or with no human reviewer, CANNOT be published. Not by
 * convention — by constraint.
 */
export const etymologyEntries = pgTable('etymology_entries', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),

  // Exclusive arc — exactly one target. Real FKs, real cascades.
  kanjiId: text('kanji_id').references(() => kanji.id, { onDelete: 'cascade' }),
  wordId: text('word_id').references(() => words.id, { onDelete: 'cascade' }),
  grammarPointId: text('grammar_point_id').references(() => grammarPoints.id, { onDelete: 'cascade' }),
  phoneticSeriesId: text('phonetic_series_id').references(() => phoneticSeries.id, { onDelete: 'cascade' }),
  radicalId: text('radical_id').references(() => radicals.id, { onDelete: 'cascade' }),

  aspect: text('aspect').notNull(),
  /** One sentence: "です contracts にてあります via であります". */
  claim: text('claim').notNull(),
  body: text('body'),
  /** Machine-readable facts, e.g. {"base":"はな","voiced":"ばな","lymanBlocked":false}. */
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  period: text('period'), // Old Japanese | Nara | Heian | Kamakura | Edo | Meiji | modern
  confidence: text('confidence').notNull().default('unknown'),
  isDisputed: boolean('is_disputed').notNull().default(false),
  /** The theory we lead with, when several compete. */
  isPrimary: boolean('is_primary').notNull().default(false),
  competingGroupId: text('competing_group_id'),
  supersedesId: text('supersedes_id'),

  status: text('status').notNull().default('draft'),
  generatedBy: text('generated_by').notNull().default('human'), // import | ai | human
  /** Maintained by the service on every etymology_sources write. */
  sourceCount: integer('source_count').notNull().default(0),

  model: text('model'),
  promptVersion: text('prompt_version'),
  enrichmentRunId: text('enrichment_run_id'),

  reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  publishedAt: timestamp('published_at'),
  ...timestamps
}, t => ({
  exactlyOneTarget: check(
    'etymology_exactly_one_target',
    sql`num_nonnulls(${t.kanjiId}, ${t.wordId}, ${t.grammarPointId}, ${t.phoneticSeriesId}, ${t.radicalId}) = 1`
  ),
  // An unsourced etymology cannot be published. Ever.
  publishNeedsSource: check(
    'etymology_publish_needs_source',
    sql`${t.status} <> 'published' or ${t.sourceCount} > 0`
  ),
  // Nor can an unreviewed one — this is what makes "AI never ships unchecked" structural.
  publishNeedsReviewer: check(
    'etymology_publish_needs_reviewer',
    sql`${t.status} <> 'published' or ${t.reviewedBy} is not null`
  ),
  kanjiAspectIdx: index('etymology_kanji_aspect_idx').on(t.kanjiId, t.aspect, t.isPrimary),
  wordIdx: index('etymology_word_idx').on(t.wordId, t.aspect),
  grammarIdx: index('etymology_grammar_idx').on(t.grammarPointId, t.aspect),
  competingIdx: index('etymology_competing_idx').on(t.competingGroupId),
  statusIdx: index('etymology_status_idx').on(t.status)
}))

/**
 * The citation join — and `quote` is the load-bearing column.
 *
 * It does double duty: it is the grounding text handed to the model, and it is
 * what the UI renders under "the source says". Because the validator asserts
 * every returned quote is a literal substring of the input packet, a fabricated
 * citation is mechanically detectable rather than a matter of reviewer
 * vigilance.
 */
export const etymologySources = pgTable('etymology_sources', {
  etymologyId: text('etymology_id').notNull().references(() => etymologyEntries.id, { onDelete: 'cascade' }),
  sourceId: text('source_id').notNull().references(() => sources.id, { onDelete: 'restrict' }),
  locator: text('locator').notNull().default(''), // page / entry
  quote: text('quote'),
  supports: text('supports').notNull().default('supports'), // supports | contradicts | partial
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.etymologyId, t.sourceId, t.locator] }),
  sourceIdx: index('etymology_sources_source_idx').on(t.sourceId)
}))

/**
 * Deliberately a DIFFERENT TABLE WITH A DIFFERENT SHAPE from etymology.
 *
 * No `sources`. No `confidence`. No `period`. A mnemonic is an invented memory
 * aid and the schema says so, so the API response shape differs, the Vue
 * component differs, and the card is always labelled "Memory aid — invented,
 * not historical". They share zero code. That is the point: you cannot
 * accidentally render one as the other, which is precisely what WaniKani does
 * and gets criticised for.
 */
export const mnemonics = pgTable('mnemonics', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),

  kanjiId: text('kanji_id').references(() => kanji.id, { onDelete: 'cascade' }),
  wordId: text('word_id').references(() => words.id, { onDelete: 'cascade' }),
  grammarPointId: text('grammar_point_id').references(() => grammarPoints.id, { onDelete: 'cascade' }),

  text: text('text').notNull(),
  imagery: text('imagery'),
  kind: text('kind').notNull().default('story'), // story | keyword | visual | sound-alike
  componentsUsed: jsonb('components_used').$type<string[]>().notNull().default([]),
  /** Null author = system-provided. */
  authorUserId: text('author_user_id').references(() => users.id, { onDelete: 'cascade' }),
  visibility: text('visibility').notNull().default('system'), // system | private | shared
  isOfficial: boolean('is_official').notNull().default(false),
  generatedBy: text('generated_by').notNull().default('human'),
  status: text('status').notNull().default('draft'),
  upvotes: integer('upvotes').notNull().default(0),
  ...timestamps
}, t => ({
  exactlyOneTarget: check(
    'mnemonics_exactly_one_target',
    sql`num_nonnulls(${t.kanjiId}, ${t.wordId}, ${t.grammarPointId}) = 1`
  ),
  // One private mnemonic per user per kanji — their own beats the system one.
  onePrivatePerKanji: uniqueIndex('mnemonics_one_private_per_kanji')
    .on(t.kanjiId, t.authorUserId)
    .where(sql`${t.visibility} = 'private'`),
  kanjiIdx: index('mnemonics_kanji_idx').on(t.kanjiId, t.visibility)
}))

export const etymologyEntriesRelations = relations(etymologyEntries, ({ one, many }) => ({
  language: one(languages, { fields: [etymologyEntries.languageId], references: [languages.id] }),
  kanji: one(kanji, { fields: [etymologyEntries.kanjiId], references: [kanji.id] }),
  word: one(words, { fields: [etymologyEntries.wordId], references: [words.id] }),
  grammarPoint: one(grammarPoints, { fields: [etymologyEntries.grammarPointId], references: [grammarPoints.id] }),
  citations: many(etymologySources)
}))

export const etymologySourcesRelations = relations(etymologySources, ({ one }) => ({
  entry: one(etymologyEntries, { fields: [etymologySources.etymologyId], references: [etymologyEntries.id] }),
  source: one(sources, { fields: [etymologySources.sourceId], references: [sources.id] })
}))
