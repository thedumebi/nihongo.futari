/* eslint-disable no-console */
import type { FuriganaSegment } from '@nihongo/shared/types'

import db, { connection } from '@nihongo/shared/db'
import {
  exercisePrompts,
  exerciseTemplates,
  languages,
  sentences,
  sentenceTokens,
  sentenceTranslations,
  studyItemFacets,
  studyItems,
  words
} from '@nihongo/shared/db/schema'
import { sentenceFurigana } from '@nihongo/shared/lib'
import { and, asc, eq } from 'drizzle-orm'

/**
 * Turn imported sentences into typed-cloze exercises.
 *
 * Producing an answer beats recognising one, which is why typed-cloze is the
 * default template — but it had no content, because it needs sentences and
 * there were none.
 *
 * The blank is chosen by CHARACTER OFFSET from `sentence_tokens`, never by
 * string replacement: 日 appears inside 日本 and 今日, and a naive replace would
 * blank the wrong half of a different word.
 *
 *   pnpm -C nihongo/backend import:cloze
 */

/** Enough examples to vary the drill, few enough to stay a drill. */
const MAX_PER_WORD = 3

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const [template] = await db
    .select({ id: exerciseTemplates.id })
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.code, 'typed-cloze'))
    .limit(1)
  if (!template)
    throw new Error('typed-cloze template missing — run the seeds')

  // Every token that points at a word, with the sentence it sits in.
  const rows = await db
    .select({
      wordId: sentenceTokens.wordId,
      surface: sentenceTokens.surface,
      charStart: sentenceTokens.charStart,
      charEnd: sentenceTokens.charEnd,
      sentenceId: sentences.id,
      text: sentences.text,
      wordForm: words.primaryForm,
      wordReading: words.primaryReading,
      studyItemId: studyItems.id
    })
    .from(sentenceTokens)
    .innerJoin(sentences, eq(sentences.id, sentenceTokens.sentenceId))
    .innerJoin(words, eq(words.id, sentenceTokens.wordId))
    .innerJoin(studyItems, eq(studyItems.wordId, words.id))
    .where(and(eq(sentences.languageId, language.id), eq(sentences.published, true)))
    .orderBy(asc(sentences.text))

  // All tokens per sentence: the cloze CONTEXT gets ruby too, and per the rule
  // that applies everywhere, it is precomputed here rather than aligned in the
  // browser at render time.
  const tokensBySentence = new Map<string, Array<{ charStart: number, charEnd: number, furigana: FuriganaSegment[] }>>()
  for (const token of await db
    .select({
      sentenceId: sentenceTokens.sentenceId,
      charStart: sentenceTokens.charStart,
      charEnd: sentenceTokens.charEnd,
      furigana: sentenceTokens.furigana
    })
    .from(sentenceTokens)
    .innerJoin(sentences, eq(sentences.id, sentenceTokens.sentenceId))
    .where(eq(sentences.languageId, language.id))) {
    const list = tokensBySentence.get(token.sentenceId) ?? []
    list.push({ charStart: token.charStart, charEnd: token.charEnd, furigana: token.furigana })
    tokensBySentence.set(token.sentenceId, list)
  }

  const translations = new Map<string, string>()
  for (const row of await db
    .select({ sentenceId: sentenceTranslations.sentenceId, text: sentenceTranslations.text })
    .from(sentenceTranslations)
    .where(eq(sentenceTranslations.lang, 'en'))) {
    translations.set(row.sentenceId, row.text)
  }

  const perWord = new Map<string, number>()
  let facets = 0
  let prompts = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.wordId)
      continue
    const used = perWord.get(row.wordId) ?? 0
    if (used >= MAX_PER_WORD)
      continue

    const chars = [...row.text]
    const before = chars.slice(0, row.charStart).join('')
    const blanked = chars.slice(row.charStart, row.charEnd).join('')
    const after = chars.slice(row.charEnd).join('')

    // The offsets come from the import, but a mismatch here would silently
    // produce a cloze whose answer is not the text that was removed.
    if (blanked !== row.surface) {
      skipped++
      continue
    }
    // A sentence that is nothing but the answer tests nothing.
    if (!before && !after)
      continue

    // Split the sentence's ruby at the blank. The blank is itself a token, so
    // the boundary is exact and no segment straddles it.
    const allTokens = tokensBySentence.get(row.sentenceId) ?? []
    const beforeFurigana = sentenceFurigana(before, allTokens.filter(t => t.charEnd <= row.charStart))
    const afterFurigana = sentenceFurigana(
      after,
      allTokens
        .filter(t => t.charStart >= row.charEnd)
        .map(t => ({ ...t, charStart: t.charStart - row.charEnd, charEnd: t.charEnd - row.charEnd }))
    )

    // How the BLANK itself is read, taken from the same ruby.
    //
    // The dictionary form's reading is not enough when the sentence spells the
    // word differently. A sentence writing 1つ has the dictionary entry 一つ
    // behind it, so `ひとつ` was only accepted if the linked word happened to
    // carry it — and a reader typing `hitotsu`, the correct reading of what is
    // on screen, was told they were wrong. Whatever is actually written in the
    // blank, the way it is READ is a right answer.
    const blankReading = sentenceFurigana(
      blanked,
      allTokens
        .filter(t => t.charStart >= row.charStart && t.charEnd <= row.charEnd)
        .map(t => ({ ...t, charStart: t.charStart - row.charStart, charEnd: t.charEnd - row.charStart }))
    ).map(seg => seg.r ?? seg.t).join('')

    const [inserted] = await db.insert(studyItemFacets).values({
      studyItemId: row.studyItemId,
      facet: 'production',
      enabled: true,
      // After meaning and reading: you should know what a word means before
      // being asked to produce it inside a sentence.
      introOrder: 4
    }).onConflictDoNothing().returning({ id: studyItemFacets.id })

    const facetId = inserted?.id ?? (await db
      .select({ id: studyItemFacets.id })
      .from(studyItemFacets)
      .where(and(
        eq(studyItemFacets.studyItemId, row.studyItemId),
        eq(studyItemFacets.facet, 'production')
      ))
      .limit(1))[0]?.id
    if (!facetId)
      continue
    if (inserted)
      facets++

    const [prompt] = await db.insert(exercisePrompts).values({
      facetId,
      templateId: template.id,
      languageId: language.id,
      version: used + 1,
      prompt: {
        kind: 'cloze',
        before,
        after,
        beforeFurigana,
        afterFurigana,
        sentence: row.text,
        translation: translations.get(row.sentenceId) ?? null,
        hint: row.wordReading,
        instruction: 'Fill in the blank'
      },
      // The inflected surface is the answer, not the dictionary form: the
      // sentence asks for the form that fits it.
      //
      // The kana reading is accepted too. Without it a cloze on お茶 demanded
      // the kanji and rejected おちゃ — which tests writing 茶, not knowing the
      // word. Producing the character is what the `writing` facet is for; this
      // drill is vocabulary in context. The dictionary form was already
      // accepted alongside the inflected one, so the same latitude applies.
      answer: {
        primary: row.surface,
        accepted: [...new Set([row.surface, row.wordForm, row.wordReading, blankReading].filter(Boolean))]
      },
      assets: { sentenceId: row.sentenceId }
    }).onConflictDoUpdate({
      target: [exercisePrompts.facetId, exercisePrompts.templateId, exercisePrompts.version],
      set: {
        answer: {
          primary: row.surface,
          accepted: [...new Set([row.surface, row.wordForm, row.wordReading, blankReading].filter(Boolean))]
        },
        updatedAt: new Date()
      }
    }).returning({ id: exercisePrompts.id })

    if (prompt) {
      prompts++
      perWord.set(row.wordId, used + 1)
    }
  }

  console.log(`Production facets created: ${facets}`)
  console.log(`Cloze prompts written:     ${prompts}`)
  console.log(`Offset mismatches skipped: ${skipped}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
