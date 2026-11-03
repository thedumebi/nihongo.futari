import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { GrammarProseText } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'
import db from '@nihongo/shared/db'
import { etymologyEntries, grammarFormations, grammarFurigana, grammarMistakes, grammarPoints, languages } from '@nihongo/shared/db/schema'
import { annotate, buildLexicon, hasKanji } from '@nihongo/shared/lib'
import { eq, isNotNull } from 'drizzle-orm'
import { createHash } from 'node:crypto'

/**
 * Precomputed furigana for the grammar pages' prose.
 *
 * Readings are made on a laptop by `seed:grammar-furigana` and ship as a seed
 * (see `grammarFurigana` in the schema). This file only reads them, and lists
 * the prose that needs them, so the seed script and the check that fails CI on
 * a missing reading agree on what "the grammar prose" is.
 */

/** The key a text's readings are stored under: an edit is a new key. */
export function proseKey(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

/** Only text with a kanji in it has anything to read; the rest is shown as it is. */
export function needsReading(text: string): boolean {
  return hasKanji(text)
}

/** No words: splits a text into its English and Japanese runs, and reads nothing. */
const NO_READINGS = buildLexicon([])
const splits = new Map<string, FuriganaSegment[]>()

/**
 * A text's stored segments. Text with no stored reading (no kanji, or one the
 * seed has not reached yet) is still split into its English and Japanese runs,
 * which the page romanises separately, but no kanji is given a reading: no ruby
 * is better than a guessed one, and the CI check refuses a grammar text with a
 * kanji and nothing stored.
 */
export function readingsFor(readings: ReadonlyMap<string, FuriganaSegment[]>, text: string | null): FuriganaSegment[] {
  if (!text)
    return []
  const stored = readings.get(text)
  if (stored)
    return stored
  // Bounded by the grammar content, so kept rather than redone per request.
  let split = splits.get(text)
  if (!split) {
    split = annotate(text, NO_READINGS)
    splits.set(text, split)
  }
  return split
}

let loaded: Promise<ReadonlyMap<string, FuriganaSegment[]>> | null = null

/**
 * Every stored reading, by its text. Loaded once per process: they change only
 * with a seed, and a seed only lands with a deploy.
 */
export function grammarReadings(): Promise<ReadonlyMap<string, FuriganaSegment[]>> {
  if (loaded)
    return loaded
  const loading = db
    .select({ text: grammarFurigana.text, segments: grammarFurigana.segments })
    .from(grammarFurigana)
    .then(rows => new Map(rows.map(r => [r.text, r.segments])))
  loaded = loading
  // Ruby is an aid, not the page: a failed load shows the prose without it
  // (still split by script), and is not kept, so the next request retries.
  return loading.catch((err) => {
    loaded = null
    pino.warn({ err }, 'Loading grammar furigana failed; showing grammar prose without readings')
    return new Map<string, FuriganaSegment[]>()
  })
}

/**
 * Every piece of grammar prose the pages show with ruby, by language: titles,
 * patterns, explanations, formations, mistakes and the grammar etymology's
 * claim and body. Distinct, and only those with a kanji in them.
 */
export async function grammarProseTexts(): Promise<GrammarProseText[]> {
  const [points, formations, mistakes, etymology] = await Promise.all([
    db.select({ id: grammarPoints.id, code: languages.code, title: grammarPoints.title, pattern: grammarPoints.pattern, meaningLong: grammarPoints.meaningLong, nuance: grammarPoints.nuance })
      .from(grammarPoints)
      .innerJoin(languages, eq(languages.id, grammarPoints.languageId)),
    db.select({ pointId: grammarFormations.grammarPointId, ruleTemplate: grammarFormations.ruleTemplate, example: grammarFormations.example, notes: grammarFormations.notes })
      .from(grammarFormations),
    db.select({ pointId: grammarMistakes.grammarPointId, wrong: grammarMistakes.wrong, right: grammarMistakes.right, whyWrong: grammarMistakes.whyWrong, explanation: grammarMistakes.explanation })
      .from(grammarMistakes),
    db.select({ pointId: etymologyEntries.grammarPointId, claim: etymologyEntries.claim, body: etymologyEntries.body })
      .from(etymologyEntries)
      .where(isNotNull(etymologyEntries.grammarPointId))
  ])
  const languageOf = new Map(points.map(p => [p.id, p.code]))

  const seen = new Set<string>()
  const out: GrammarProseText[] = []
  const add = (pointId: string | null, ...texts: Array<string | null>) => {
    const languageCode = pointId ? languageOf.get(pointId) : undefined
    if (!languageCode)
      return
    for (const text of texts) {
      const key = `${languageCode}\u0000${text}`
      if (!text || !needsReading(text) || seen.has(key))
        continue
      seen.add(key)
      out.push({ languageCode, text })
    }
  }
  for (const p of points)
    add(p.id, p.title, p.pattern, p.meaningLong, p.nuance)
  for (const f of formations)
    add(f.pointId, f.ruleTemplate, f.example, f.notes)
  for (const m of mistakes)
    add(m.pointId, m.wrong, m.right, m.whyWrong, m.explanation)
  for (const e of etymology)
    add(e.pointId, e.claim, e.body)
  return out
}
