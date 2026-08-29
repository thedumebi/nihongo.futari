/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  exercisePrompts,
  exerciseTemplates,
  languageLevels,
  languages,
  studyItemFacets,
  studyItems,
  words,
  wordSenses
} from '@nihongo/shared/db/schema'
import { and, asc, eq } from 'drizzle-orm'

/**
 * Turn imported words into things the scheduler can actually serve.
 *
 * Takes the level as an argument so one importer serves N5 through N1 rather
 * than five near-identical copies drifting apart.
 *
 * A word becomes one `study_item` with two facets:
 *   reading  — see 食べる, type たべる   (production; typed, so you recall it)
 *   meaning  — see 食べる, pick "to eat" (recognition; multiple choice)
 *
 * Multiple choice is used for meaning and nothing else. Typing an English gloss
 * can't be graded fairly — "to eat" vs "eat" vs "to have a meal" are all right —
 * whereas a reading has exactly one correct answer, so that one is typed.
 *
 *   pnpm -C nihongo/backend import:vocab-study N5
 */

const CHOICES = 4

function shuffle<T>(list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j]!, list[i]!]
  }
  return list
}

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const levelCode = (process.argv[2] ?? 'N5').toUpperCase()
  const [level] = await db
    .select({ id: languageLevels.id })
    .from(languageLevels)
    .where(and(eq(languageLevels.languageId, language.id), eq(languageLevels.code, levelCode)))
    .limit(1)
  if (!level)
    throw new Error(`${levelCode} level row missing`)
  console.log(`Building study items for ${levelCode}`)

  const templates = await db.select({ id: exerciseTemplates.id, code: exerciseTemplates.code }).from(exerciseTemplates)
  const mcq = templates.find(t => t.code === 'mcq')
  const readingInput = templates.find(t => t.code === 'reading-input')
  if (!mcq || !readingInput)
    throw new Error('exercise templates missing — run db:seed first')

  const rows = await db
    .select({
      id: words.id,
      form: words.primaryForm,
      reading: words.primaryReading,
      entSeq: words.entSeq,
      isCommon: words.isCommon
    })
    .from(words)
    .where(and(eq(words.languageId, language.id), eq(words.levelId, level.id), eq(words.published, true)))
    .orderBy(asc(words.primaryForm))

  // First gloss of the first sense is the headline meaning.
  const senses = await db
    .select({ wordId: wordSenses.wordId, glosses: wordSenses.glosses, sortIndex: wordSenses.sortIndex })
    .from(wordSenses)
  const primaryGloss = new Map<string, string>()
  for (const s of senses) {
    if (s.sortIndex !== 0)
      continue
    const first = s.glosses[0]?.text
    if (first)
      primaryGloss.set(s.wordId, first)
  }

  const glossPool = [...primaryGloss.values()]
  console.log(`Words: ${rows.length}, with a headline gloss: ${glossPool.length}`)

  let items = 0
  let prompts = 0

  for (const [index, w] of rows.entries()) {
    const gloss = primaryGloss.get(w.id)
    if (!gloss)
      continue

    const [item] = await db.insert(studyItems).values({
      languageId: language.id,
      kind: 'word',
      wordId: w.id,
      levelId: level.id,
      // Common words first; sort_index drives which get introduced.
      sortIndex: (w.isCommon ? 0 : 100000) + index,
      published: true,
      active: true
    }).onConflictDoNothing().returning({ id: studyItems.id })

    const studyItemId = item?.id ?? (await db
      .select({ id: studyItems.id })
      .from(studyItems)
      .where(eq(studyItems.wordId, w.id))
      .limit(1))[0]?.id
    if (!studyItemId)
      continue
    if (item)
      items++

    const audio = `/audio/words/${w.entSeq}.m4a`

    for (const facet of ['reading', 'meaning'] as const) {
      const [f] = await db.insert(studyItemFacets).values({
        studyItemId,
        facet,
        enabled: true,
        introOrder: facet === 'meaning' ? 0 : 1
      }).onConflictDoNothing().returning({ id: studyItemFacets.id })

      const facetId = f?.id ?? (await db
        .select({ id: studyItemFacets.id })
        .from(studyItemFacets)
        .where(and(eq(studyItemFacets.studyItemId, studyItemId), eq(studyItemFacets.facet, facet)))
        .limit(1))[0]?.id
      if (!facetId)
        continue

      if (facet === 'reading') {
        const [p] = await db.insert(exercisePrompts).values({
          facetId,
          templateId: readingInput.id,
          languageId: language.id,
          prompt: { kind: 'word', word: w.form, instruction: 'Type the reading in kana' },
          answer: { primary: w.reading, accepted: [w.reading] },
          assets: { audio }
        }).onConflictDoNothing().returning({ id: exercisePrompts.id })
        if (p)
          prompts++
      } else {
        // Distractors from other words AT THIS LEVEL, so a wrong option is
        // always plausible for the level rather than obviously absurd.
        const wrong = shuffle(glossPool.filter(g => g !== gloss)).slice(0, CHOICES - 1)
        const [p] = await db.insert(exercisePrompts).values({
          facetId,
          templateId: mcq.id,
          languageId: language.id,
          prompt: { kind: 'word', word: w.form, reading: w.reading, instruction: 'What does this mean?' },
          answer: { primary: gloss, accepted: [gloss] },
          distractors: wrong,
          assets: { audio }
        }).onConflictDoNothing().returning({ id: exercisePrompts.id })
        if (p)
          prompts++
      }
    }
  }

  console.log(`Study items: ${items} created, ${prompts} prompts written`)
  console.log('\nNext: pnpm -C nihongo/backend audio:words')
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
