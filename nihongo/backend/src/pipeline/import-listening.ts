/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  exercisePrompts,
  exerciseTemplates,
  languages,
  studyItemFacets,
  studyItems,
  words,
  wordSenses
} from '@nihongo/shared/db/schema'
import { and, eq } from 'drizzle-orm'

import { listKeys } from './lib/bucket.js'

/**
 * Listening exercises: hear a word, then either choose its meaning or type it.
 *
 * Built on the WORD audio that already exists rather than on sentence audio.
 * At N5 that is also the better drill — transcribing a whole spoken sentence is
 * a much later skill than recognising a word you have met.
 *
 * Two templates share the one `listening` facet, so a listening review is
 * sometimes recognition and sometimes production. The queue already picks one
 * prompt at random per card, which is what makes that work.
 *
 *   pnpm -C nihongo/backend import:listening
 */

const CHOICES = 4

/** Deterministic shuffle, so re-running produces the same distractors. */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items]
  let state = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

async function main() {
  // Which clips exist is a question for the BUCKET, not the filesystem: the
  // local tree is a staging area that gets cleared after upload, so asking disk
  // would report every generated clip as missing.
  const clips = await listKeys('audio/words/')

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const templates = await db
    .select({ id: exerciseTemplates.id, code: exerciseTemplates.code })
    .from(exerciseTemplates)
  const listening = templates.find(t => t.code === 'listening')
  const dictation = templates.find(t => t.code === 'dictation')
  if (!listening || !dictation)
    throw new Error('listening/dictation templates missing — run the seeds')

  const rows = await db
    .select({
      studyItemId: studyItems.id,
      wordId: words.id,
      entSeq: words.entSeq,
      form: words.primaryForm,
      reading: words.primaryReading
    })
    .from(studyItems)
    .innerJoin(words, eq(words.id, studyItems.wordId))
    .where(and(eq(studyItems.languageId, language.id), eq(studyItems.published, true)))

  const glosses = new Map<string, string>()
  for (const sense of await db
    .select({ wordId: wordSenses.wordId, glosses: wordSenses.glosses, sortIndex: wordSenses.sortIndex })
    .from(wordSenses)) {
    if (glosses.has(sense.wordId) && sense.sortIndex !== 0)
      continue
    const first = sense.glosses.find(g => g.lang === 'en')?.text ?? sense.glosses[0]?.text
    if (first)
      glosses.set(sense.wordId, first)
  }
  const glossPool = [...new Set(glosses.values())]

  let facets = 0
  let listeningPrompts = 0
  let dictationPrompts = 0
  let noAudio = 0

  for (const [index, row] of rows.entries()) {
    if (row.entSeq === null)
      continue
    // No audio means no listening exercise. Scheduling one anyway would give a
    // card that cannot be answered.
    if (!clips.has(`audio/words/${row.entSeq}.m4a`)) {
      noAudio++
      continue
    }
    const gloss = glosses.get(row.wordId)
    if (!gloss)
      continue

    const [inserted] = await db.insert(studyItemFacets).values({
      studyItemId: row.studyItemId,
      facet: 'listening',
      enabled: true,
      // Last: recognising a word by ear is harder than by sight, so it should
      // not be the first time you meet it.
      introOrder: 6
    }).onConflictDoNothing().returning({ id: studyItemFacets.id })

    const facetId = inserted?.id ?? (await db
      .select({ id: studyItemFacets.id })
      .from(studyItemFacets)
      .where(and(
        eq(studyItemFacets.studyItemId, row.studyItemId),
        eq(studyItemFacets.facet, 'listening')
      ))
      .limit(1))[0]?.id
    if (!facetId)
      continue
    if (inserted)
      facets++

    const audio = `/audio/words/${row.entSeq}.m4a`
    const distractors = shuffle(glossPool.filter(g => g !== gloss), row.entSeq).slice(0, CHOICES - 1)

    const [heard] = await db.insert(exercisePrompts).values({
      facetId,
      templateId: listening.id,
      languageId: language.id,
      // The word is deliberately NOT in the prompt: showing it would make this
      // a reading exercise with a soundtrack.
      prompt: { kind: 'listening', instruction: 'Listen. What does it mean?' },
      answer: { primary: gloss, accepted: [gloss] },
      distractors,
      assets: { audio }
    }).onConflictDoNothing().returning({ id: exercisePrompts.id })
    if (heard)
      listeningPrompts++

    const [typed] = await db.insert(exercisePrompts).values({
      facetId,
      templateId: dictation.id,
      languageId: language.id,
      prompt: { kind: 'dictation', instruction: 'Listen and type what you hear, in kana', hint: gloss },
      answer: { primary: row.reading, accepted: [row.reading, row.form] },
      assets: { audio }
    }).onConflictDoNothing().returning({ id: exercisePrompts.id })
    if (typed)
      dictationPrompts++

    if (index > 0 && index % 400 === 0)
      console.log(`  …${index}/${rows.length}`)
  }

  console.log(`Listening facets created: ${facets}`)
  console.log(`Listening prompts:        ${listeningPrompts}`)
  console.log(`Dictation prompts:        ${dictationPrompts}`)
  if (noAudio > 0)
    console.log(`Skipped (no audio file):  ${noAudio} — run audio:words first`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
