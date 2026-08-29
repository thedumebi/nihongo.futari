import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uniqueIndex
} from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'
import { kana } from './kana.js'
import { languageLevels, languages } from './languages.js'
import { provenance } from './ops.js'

/**
 * Kanji components: Kangxi radicals plus the non-radical pieces KanjiVG and
 * CHISE identify. `character` is nullable because a good number of components
 * have no Unicode codepoint of their own.
 */
export const radicals = pgTable('radicals', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  character: text('character'),
  codepoint: integer('codepoint'),
  kangxiNumber: integer('kangxi_number'),
  nameJa: text('name_ja'),
  nameEn: text('name_en'),
  meaning: text('meaning'),
  strokeCount: integer('stroke_count'),
  variants: jsonb('variants').$type<string[]>().notNull().default([]), // ⺡ for 水
  kvgElement: text('kvg_element'),
  notes: text('notes'),
  ...provenance,
  ...timestamps
}, t => ({
  charIdx: index('radicals_character_idx').on(t.languageId, t.character),
  kangxiIdx: index('radicals_kangxi_idx').on(t.kangxiNumber)
}))

export const kanji = pgTable('kanji', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  character: text('character').notNull(),
  codepoint: integer('codepoint'),
  strokeCount: integer('stroke_count'),
  grade: integer('grade'),
  jouyou: boolean('jouyou').notNull().default(false),
  levelId: text('level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  frequencyRank: integer('frequency_rank'),
  meanings: jsonb('meanings').$type<Array<{ gloss: string, lang: string }>>().notNull().default([]),
  /** Normalised 109x109 KanjiVG document, kept whole for rendering. */
  kanjivgSvg: text('kanjivg_svg'),
  published: boolean('published').notNull().default(false),
  ...provenance,
  ...timestamps
}, t => ({
  charUnique: uniqueIndex('kanji_character_unique').on(t.languageId, t.character),
  levelIdx: index('kanji_level_idx').on(t.languageId, t.levelId, t.frequencyRank)
}))

/**
 * A phonetic series: the ~150 components that predict an on-reading. Learn
 * 青 = セイ and 晴・清・請・精・静 stop being five separate memorisations.
 * `reliability` is the fraction of members that actually follow, so the UI can
 * be honest about the ones that drifted.
 */
export const phoneticSeries = pgTable('phonetic_series', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  componentCharacter: text('component_character').notNull(),
  componentKanjiId: text('component_kanji_id').references(() => kanji.id, { onDelete: 'set null' }),
  primaryReading: text('primary_reading').notNull(),
  alternateReadings: text('alternate_readings').array().notNull().default([]),
  memberCount: integer('member_count').notNull().default(0),
  reliability: numeric('reliability', { precision: 4, scale: 3 }),
  notes: text('notes'),
  published: boolean('published').notNull().default(false),
  ...provenance,
  ...timestamps
}, t => ({
  componentUnique: uniqueIndex('phonetic_series_component_unique').on(t.languageId, t.componentCharacter)
}))

export const phoneticSeriesMembers = pgTable('phonetic_series_members', {
  id: primaryId(),
  seriesId: text('series_id').notNull().references(() => phoneticSeries.id, { onDelete: 'cascade' }),
  kanjiId: text('kanji_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  reading: text('reading').notNull(),
  followsSeries: boolean('follows_series').notNull().default(true),
  exceptionNote: text('exception_note'),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  memberUnique: uniqueIndex('phonetic_series_members_unique').on(t.seriesId, t.kanjiId),
  // The kanji detail page asks the reverse question: which series am I in?
  kanjiIdx: index('phonetic_series_members_kanji_idx').on(t.kanjiId)
}))

export const kanjiReadings = pgTable('kanji_readings', {
  id: primaryId(),
  kanjiId: text('kanji_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // on | kun | nanori
  reading: text('reading').notNull(),
  okurigana: text('okurigana'),
  isCommon: boolean('is_common').notNull().default(false),
  isJouyou: boolean('is_jouyou').notNull().default(false),
  /** Set when this on-reading is explained by a phonetic series. */
  phoneticSeriesId: text('phonetic_series_id').references(() => phoneticSeries.id, { onDelete: 'set null' }),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  kanjiTypeIdx: index('kanji_readings_kanji_type_idx').on(t.kanjiId, t.type)
}))

/** Per-stroke KanjiVG data. Drives stroke-order animation and handwriting grading. */
export const characterStrokes = pgTable('character_strokes', {
  id: primaryId(),
  // Exclusive arc: strokes belong to EXACTLY one of a kanji or a kana. Kana get
  // the same treatment because hiragana is where handwriting practice actually
  // starts — a stroke table covering only kanji would miss the first months of
  // study. Same arc pattern as study_items; never a (type, id) pair.
  kanjiId: text('kanji_id').references(() => kanji.id, { onDelete: 'cascade' }),
  kanaId: text('kana_id').references(() => kana.id, { onDelete: 'cascade' }),
  strokeIndex: integer('stroke_index').notNull(),
  path: text('path').notNull(), // SVG `d`
  startX: numeric('start_x', { precision: 8, scale: 3 }),
  startY: numeric('start_y', { precision: 8, scale: 3 }),
  endX: numeric('end_x', { precision: 8, scale: 3 }),
  endY: numeric('end_y', { precision: 8, scale: 3 }),
  directionDeg: numeric('direction_deg', { precision: 6, scale: 2 }),
  kvgType: text('kvg_type'), // CJK stroke type
  kvgElement: text('kvg_element'),
  kvgRadical: text('kvg_radical'),
  kvgPart: text('kvg_part'),
  ...timestamps
}, t => ({
  exactlyOneOwner: check(
    'character_strokes_exactly_one_owner',
    sql`num_nonnulls(${t.kanjiId}, ${t.kanaId}) = 1`
  ),
  // One partial unique index per arm. A plain composite index would not
  // constrain the other arm at all, since NULLs never collide.
  kanjiStrokeUnique: uniqueIndex('character_strokes_kanji_unique')
    .on(t.kanjiId, t.strokeIndex)
    .where(sql`${t.kanjiId} is not null`),
  kanaStrokeUnique: uniqueIndex('character_strokes_kana_unique')
    .on(t.kanaId, t.strokeIndex)
    .where(sql`${t.kanaId} is not null`)
}))

/**
 * Component decomposition. A component is either a radical or another kanji,
 * never both — hence the check. `role` is the part that matters pedagogically:
 * a phonetic component predicts the reading, a semantic one hints the meaning.
 */
export const kanjiComponents = pgTable('kanji_components', {
  id: primaryId(),
  parentKanjiId: text('parent_kanji_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  componentRadicalId: text('component_radical_id').references(() => radicals.id, { onDelete: 'cascade' }),
  componentKanjiId: text('component_kanji_id').references(() => kanji.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // radical | phonetic | semantic | graphical
  position: text('position'), // left | right | top | bottom | enclosure | ...
  idsExpression: text('ids_expression'), // ⿰氵靑
  source: text('source').notNull(), // kanjivg | chise-ids | edrdg-phonetic
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  exactlyOneComponent: check(
    'kanji_components_exactly_one',
    sql`num_nonnulls(${t.componentRadicalId}, ${t.componentKanjiId}) = 1`
  ),
  parentIdx: index('kanji_components_parent_idx').on(t.parentKanjiId),
  childKanjiIdx: index('kanji_components_child_kanji_idx').on(t.componentKanjiId),
  childRadicalIdx: index('kanji_components_child_radical_idx').on(t.componentRadicalId)
}))

/** Look-alikes and sound-alikes — the distractor pool for multiple choice. */
export const kanjiConfusables = pgTable('kanji_confusables', {
  id: primaryId(),
  kanjiId: text('kanji_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  confusableId: text('confusable_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(), // similar-shape | similar-reading | similar-meaning
  score: numeric('score', { precision: 4, scale: 3 }),
  ...timestamps
}, t => ({
  pairUnique: uniqueIndex('kanji_confusables_unique').on(t.kanjiId, t.confusableId, t.reason)
}))

export const kanjiRelations = relations(kanji, ({ one, many }) => ({
  language: one(languages, { fields: [kanji.languageId], references: [languages.id] }),
  level: one(languageLevels, { fields: [kanji.levelId], references: [languageLevels.id] }),
  readings: many(kanjiReadings),
  strokes: many(characterStrokes)
}))

export const kanjiReadingsRelations = relations(kanjiReadings, ({ one }) => ({
  kanji: one(kanji, { fields: [kanjiReadings.kanjiId], references: [kanji.id] }),
  series: one(phoneticSeries, { fields: [kanjiReadings.phoneticSeriesId], references: [phoneticSeries.id] })
}))

export const phoneticSeriesRelations = relations(phoneticSeries, ({ many }) => ({
  members: many(phoneticSeriesMembers)
}))
