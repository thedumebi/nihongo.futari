import type { FuriganaSegment, WordDetail } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  etymologyEntries,
  etymologySources,
  kanji,
  languageLevels,
  languages,
  sentences,
  sentenceTokens,
  sentenceTranslations,
  sources,
  words,
  wordSenses
} from '@nihongo/shared/db/schema'
import { classifyPitch, countMorae, pitchShape, sentenceFurigana } from '@nihongo/shared/lib'
import { and, asc, eq, sql } from 'drizzle-orm'

import { assetUrl } from '@/lib/assets.js'

/**
 * One word, everything known about it.
 *
 * The pitch shape is computed here rather than stored: the database keeps the
 * downstep position, which is meaningless without the mora count, and deriving
 * the two together in one place stops them disagreeing.
 */
export async function getWordDetail(languageCode: string, id: string): Promise<WordDetail | null> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  if (!language)
    return null

  const [row] = await db
    .select({
      id: words.id,
      form: words.primaryForm,
      reading: words.primaryReading,
      isCommon: words.isCommon,
      pitchAccent: words.pitchAccent,
      level: languageLevels.code
    })
    .from(words)
    .leftJoin(languageLevels, eq(languageLevels.id, words.levelId))
    .where(and(eq(words.languageId, language.id), eq(words.id, id)))
    .limit(1)
  if (!row)
    return null

  const senseRows = await db
    .select({ glosses: wordSenses.glosses, pos: wordSenses.pos })
    .from(wordSenses)
    .where(eq(wordSenses.wordId, row.id))
    .orderBy(asc(wordSenses.sortIndex))

  const kanjiRows = await db
    .select({ character: kanji.character, meanings: kanji.meanings })
    .from(kanji)
    .where(and(
      eq(kanji.languageId, language.id),
      eq(kanji.published, true),
      sql`position(${kanji.character} in ${row.form}) > 0`
    ))

  const etymologyRows = await db
    .select({
      id: etymologyEntries.id,
      claim: etymologyEntries.claim,
      body: etymologyEntries.body,
      confidence: etymologyEntries.confidence,
      status: etymologyEntries.status
    })
    .from(etymologyEntries)
    .where(eq(etymologyEntries.wordId, row.id))

  const citationRows = etymologyRows.length === 0
    ? []
    : await db
        .select({
          etymologyId: etymologySources.etymologyId,
          label: sources.title,
          locator: etymologySources.locator,
          quote: etymologySources.quote
        })
        .from(etymologySources)
        .innerJoin(sources, eq(sources.id, etymologySources.sourceId))
        .where(sql`${etymologySources.etymologyId} in ${etymologyRows.map(e => e.id)}`)
        .orderBy(asc(etymologySources.sortIndex))

  // Sentences that actually contain this word, via the token link — not a text
  // match, which would pull in every sentence where the form appears inside a
  // different word.
  const exampleRows = await db
    .selectDistinct({ id: sentences.id, text: sentences.text })
    .from(sentenceTokens)
    .innerJoin(sentences, eq(sentences.id, sentenceTokens.sentenceId))
    .where(and(eq(sentenceTokens.wordId, row.id), eq(sentences.published, true)))
    .limit(4)

  const exampleIds = exampleRows.map(e => e.id)
  const tokenRows = exampleIds.length === 0
    ? []
    : await db
        .select({
          sentenceId: sentenceTokens.sentenceId,
          charStart: sentenceTokens.charStart,
          charEnd: sentenceTokens.charEnd,
          furigana: sentenceTokens.furigana
        })
        .from(sentenceTokens)
        .where(sql`${sentenceTokens.sentenceId} in ${exampleIds}`)
        .orderBy(asc(sentenceTokens.index))

  const translationRows = exampleIds.length === 0
    ? []
    : await db
        .select({ sentenceId: sentenceTranslations.sentenceId, text: sentenceTranslations.text })
        .from(sentenceTranslations)
        .where(and(sql`${sentenceTranslations.sentenceId} in ${exampleIds}`, eq(sentenceTranslations.lang, 'en')))

  const stored = row.pitchAccent?.[0]
  const morae = countMorae(row.reading)
  const position = stored?.positions?.[0]

  return {
    id: row.id,
    form: row.form,
    reading: row.reading,
    level: row.level ?? null,
    isCommon: row.isCommon,
    senses: senseRows.map(s => ({
      glosses: s.glosses.filter(g => g.lang === 'en').map(g => g.text),
      pos: s.pos
    })),
    pitch: stored && position !== undefined && morae > 0
      ? {
          reading: stored.reading,
          positions: stored.positions,
          pattern: classifyPitch(position, morae),
          shape: pitchShape(position, morae)
        }
      : null,
    kanji: kanjiRows.map(k => ({
      character: k.character,
      meanings: (k.meanings ?? []).filter(m => m.lang === 'en').map(m => m.gloss).slice(0, 3)
    })),
    etymology: etymologyRows.map(e => ({
      claim: e.claim,
      body: e.body ?? '',
      confidence: e.confidence ?? 'unknown',
      published: e.status === 'published',
      citations: citationRows.filter(c => c.etymologyId === e.id).map(c => ({
        label: c.label,
        locator: c.locator,
        quote: c.quote
      }))
    })),
    examples: exampleRows.map(s => ({
      text: s.text,
      translation: translationRows.find(t => t.sentenceId === s.id)?.text ?? null,
      furigana: sentenceFurigana(s.text, tokenRows.filter(t => t.sentenceId === s.id)) as FuriganaSegment[],
      audio: assetUrl(`/audio/sentences/${s.id}.m4a`)
    }))
  }
}
