/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  languageLevels,
  languages,
  sentences,
  sentenceTokens,
  sentenceTranslations,
  words
} from '@nihongo/shared/db/schema'
import { alignInflected } from '@nihongo/shared/lib'
import { and, asc, desc, eq } from 'drizzle-orm'

import type { TanakaSentence } from './sources/tanaka.js'

import { DATASETS, ensureDataset } from './fetch.js'
import { parseTanaka } from './sources/tanaka.js'

/**
 * Import example sentences from the Tanaka Corpus.
 *
 * Only sentences a learner at this level can actually read are kept, and the
 * bar is KANJI: every token containing a kanji must be a word already in the
 * curriculum. Kana-only tokens pass, because particles and auxiliaries are
 * readable once the syllabary is.
 *
 * Furigana is aligned HERE, once, and stored — never at render time. Client-side
 * alignment produces visible garbage on words like 大人, in front of the person
 * trying to learn them.
 *
 *   pnpm -C nihongo/backend import:sentences
 */

/** Sentences longer than this stop being examples and start being homework. */
const MAX_LENGTH = 40
/** Per level, so one common word cannot supply a hundred near-identical examples. */
const MAX_PER_WORD = 4
const LICENSE = 'CC BY-SA 3.0'
const ATTRIBUTION = 'Example sentences from the Tanaka Corpus, distributed by the EDRDG, used under CC BY-SA 3.0.'

const KANJI = /[\u3400-\u4DBF\u4E00-\u9FFF]/

interface WordRow {
  id: string
  form: string
  reading: string
  entSeq: number | null
}

async function main() {
  const dataset = await ensureDataset(DATASETS.tanaka)

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const [level] = await db
    .select({ id: languageLevels.id })
    .from(languageLevels)
    .where(and(eq(languageLevels.languageId, language.id), eq(languageLevels.code, 'N5')))
    .limit(1)

  const wordRows = await db
    .select({
      id: words.id,
      form: words.primaryForm,
      reading: words.primaryReading,
      entSeq: words.entSeq
    })
    .from(words)
    .where(eq(words.languageId, language.id))
    // Ordered best-first, because homographs decide what ruby a learner sees:
    // 塩 is both しお (common) and えん (rare). Last-write-wins put えん over
    // the salt in every sentence it appeared in.
    .orderBy(desc(words.isCommon), asc(words.frequencyRank))

  const byForm = new Map<string, WordRow>()
  const byEntSeq = new Map<number, WordRow>()
  for (const row of wordRows) {
    // First wins: the query already put the best candidate first.
    if (!byForm.has(row.form))
      byForm.set(row.form, row)
    if (row.entSeq !== null)
      byEntSeq.set(row.entSeq, row)
  }
  console.log(`Curriculum vocabulary: ${wordRows.length} words`)

  const parsed = await parseTanaka(dataset.filePath)
  console.log(`Tanaka Corpus: ${parsed.length} sentences`)

  function lookup(lemma: string, entSeq: number | null): WordRow | undefined {
    return (entSeq !== null ? byEntSeq.get(entSeq) : undefined) ?? byForm.get(lemma)
  }

  /** Readable at this level, and every token locatable in the raw text. */
  function usable(sentence: TanakaSentence): boolean {
    if (sentence.japanese.length > MAX_LENGTH)
      return false

    let cursor = 0
    for (const token of sentence.tokens) {
      // Every token must be findable in order, or the character offsets the
      // cloze engine depends on would be wrong.
      const at = sentence.japanese.indexOf(token.surface, cursor)
      if (at < 0)
        return false
      cursor = at + token.surface.length

      // Kanji is the barrier: a token carrying one must be taught vocabulary.
      if (KANJI.test(token.surface) && !lookup(token.lemma, token.entSeq))
        return false
    }
    return true
  }

  const usableSentences = parsed.filter(usable)
  console.log(`Readable at this level: ${usableSentences.length}`)

  // Spread coverage across the vocabulary instead of taking the first N, which
  // would bury rare words under a pile of です sentences.
  const perWord = new Map<string, number>()
  const chosen: Array<{ sentence: TanakaSentence, wordIds: Set<string> }> = []

  for (const sentence of usableSentences.sort((a, b) => a.japanese.length - b.japanese.length)) {
    const wordIds = new Set<string>()
    for (const token of sentence.tokens) {
      const word = lookup(token.lemma, token.entSeq)
      if (word)
        wordIds.add(word.id)
    }
    if (wordIds.size === 0)
      continue

    // Keep it only if it still teaches a word that is under quota.
    const useful = [...wordIds].some(id => (perWord.get(id) ?? 0) < MAX_PER_WORD)
    if (!useful)
      continue

    for (const id of wordIds) perWord.set(id, (perWord.get(id) ?? 0) + 1)
    chosen.push({ sentence, wordIds })
  }

  console.log(`Selected: ${chosen.length} sentences covering ${perWord.size} words`)

  // Idempotent by wholesale replacement. `sentences` has no unique index on
  // source_ref_external, so ON CONFLICT DO NOTHING would not dedupe and a second
  // run would simply double the corpus. Tokens and translations cascade.
  const removed = await db
    .delete(sentences)
    .where(and(eq(sentences.languageId, language.id), eq(sentences.source, 'tatoeba')))
    .returning({ id: sentences.id })
  if (removed.length > 0)
    console.log(`Replacing ${removed.length} previously imported sentences`)

  let inserted = 0
  let tokenCount = 0
  let lowConfidence = 0

  for (const { sentence } of chosen) {
    const [row] = await db.insert(sentences).values({
      languageId: language.id,
      text: sentence.japanese,
      levelId: level?.id ?? null,
      source: 'tatoeba',
      sourceRefExternal: sentence.id,
      license: LICENSE,
      attribution: ATTRIBUTION,
      published: true
    }).returning({ id: sentences.id })
    if (!row)
      continue
    inserted++

    await db.insert(sentenceTranslations).values({
      sentenceId: row.id,
      lang: 'en',
      text: sentence.english,
      source: 'tatoeba',
      license: LICENSE,
      attribution: ATTRIBUTION
    })

    let cursor = 0
    const tokenRows = sentence.tokens.map((token, index) => {
      const charStart = sentence.japanese.indexOf(token.surface, cursor)
      cursor = charStart + token.surface.length

      const word = lookup(token.lemma, token.entSeq)
      // The corpus reading is the LEMMA's; alignInflected carries it onto the
      // inflected surface rather than mismatching the two.
      const reading = token.reading ?? word?.reading ?? null
      const aligned = reading
        ? alignInflected(token.surface, token.lemma, reading)
        : { segments: [{ t: token.surface }], confidence: 1 }

      if (aligned.confidence === 0)
        lowConfidence++

      return {
        sentenceId: row.id,
        index,
        surface: token.surface,
        reading,
        lemma: token.lemma,
        wordId: word?.id ?? null,
        charStart,
        charEnd: charStart + token.surface.length,
        furigana: aligned.segments,
        alignmentConfidence: String(aligned.confidence)
      }
    })

    await db.insert(sentenceTokens).values(tokenRows)
    tokenCount += tokenRows.length
  }

  console.log(`Inserted ${inserted} sentences, ${tokenCount} tokens`)
  console.log(`Ruby alignment fell back to whole-token on ${lowConfidence} tokens`)
  console.log('\nNext: pnpm -C nihongo/backend import:cloze')
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
