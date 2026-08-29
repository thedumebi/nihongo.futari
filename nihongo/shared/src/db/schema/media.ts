import { sql } from 'drizzle-orm'
import { check, index, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { kana } from './kana.js'
import { kanji } from './kanji.js'
import { languages } from './languages.js'
import { sentences } from './sentences.js'
import { words } from './words.js'

/**
 * Pre-generated audio on R2. Batch-produced once at import (Kokoro locally, or
 * WaveNet for ~$2 total) and then free forever — zero egress, no per-play cost,
 * and it works offline.
 *
 * Never `SpeechSynthesis` for content: no offline support and the voice
 * changes per device, which makes shadowing worthless.
 *
 * The unique on (textHash, voice, provider) dedupes across words and sentences
 * that happen to share text.
 */
export const mediaAssets = pgTable('media_assets', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // tts-word | tts-sentence | tts-kana | human | stroke-svg
  storageKey: text('storage_key').notNull(), // R2 object key
  url: text('url'),
  mime: text('mime'),
  durationMs: integer('duration_ms'),
  bytes: integer('bytes'),
  voice: text('voice'),
  provider: text('provider'), // kokoro | google-wavenet | azure | human
  textHash: text('text_hash'),
  license: text('license'),
  ...timestamps
}, t => ({
  dedupe: uniqueIndex('media_assets_dedupe')
    .on(t.textHash, t.voice, t.provider)
    .where(sql`${t.textHash} is not null`)
}))

/** Attach an asset to content. `role` distinguishes normal / slow / alt-voice takes. */
export const contentAudio = pgTable('content_audio', {
  id: primaryId(),
  assetId: text('asset_id').notNull().references(() => mediaAssets.id, { onDelete: 'cascade' }),
  kanaId: text('kana_id').references(() => kana.id, { onDelete: 'cascade' }),
  wordId: text('word_id').references(() => words.id, { onDelete: 'cascade' }),
  sentenceId: text('sentence_id').references(() => sentences.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('primary'), // primary | slow | male | female
  ...timestamps
}, t => ({
  exactlyOneTarget: check(
    'content_audio_exactly_one_target',
    sql`num_nonnulls(${t.kanaId}, ${t.wordId}, ${t.sentenceId}) = 1`
  ),
  wordIdx: index('content_audio_word_idx').on(t.wordId, t.role),
  sentenceIdx: index('content_audio_sentence_idx').on(t.sentenceId, t.role)
}))

/**
 * Handwriting attempts. `strokes` holds resampled points for grader debugging
 * and is aged out by a retention job — it is diagnostic data, not user content.
 */
export const handwritingAttempts = pgTable('handwriting_attempts', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kanjiId: text('kanji_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  cardId: text('card_id'),
  logId: text('log_id'),
  score: numeric('score', { precision: 4, scale: 3 }),
  perStroke: jsonb('per_stroke').$type<Array<{
    index: number
    matched: boolean
    orderCorrect: boolean
    directionCorrect: boolean
    dtw: number
  }>>().notNull().default([]),
  strokeCountGiven: integer('stroke_count_given'),
  strokes: jsonb('strokes').$type<Array<Array<{ x: number, y: number }>>>(),
  expiresAt: timestamp('expires_at'),
  ...timestamps
}, t => ({
  userKanjiIdx: index('handwriting_attempts_user_kanji_idx').on(t.userId, t.kanjiId, t.createdAt)
}))
