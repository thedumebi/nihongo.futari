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
import { classifyVerb, conjugate } from '@nihongo/shared/lib'
import { and, eq } from 'drizzle-orm'

/**
 * Conjugation drills for the imported verbs.
 *
 * Adds a `production` facet to every verb and one prompt per target form. The
 * queue picks ONE prompt per facet per session, so a verb is a single card that
 * asks a different form each time — which is the point: you should recall the
 * rule, not one memorised output.
 *
 *   pnpm -C nihongo/backend import:conjugation
 */

/** The four forms an N5 learner actually needs cold. */
const FORMS = [
  { form: 'masu' as const, label: 'polite (〜ます)' },
  { form: 'te' as const, label: 'te-form (〜て)' },
  { form: 'ta' as const, label: 'plain past (〜た)' },
  { form: 'nai' as const, label: 'plain negative (〜ない)' }
]

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const [template] = await db
    .select({ id: exerciseTemplates.id })
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.code, 'conjugation-drill'))
    .limit(1)
  if (!template)
    throw new Error('conjugation-drill template missing — run db:seed first')

  const rows = await db
    .select({
      wordId: words.id,
      surface: words.primaryForm,
      reading: words.primaryReading,
      pos: wordSenses.pos,
      studyItemId: studyItems.id
    })
    .from(words)
    .innerJoin(wordSenses, and(eq(wordSenses.wordId, words.id), eq(wordSenses.sortIndex, 0)))
    .innerJoin(studyItems, eq(studyItems.wordId, words.id))
    .where(and(eq(words.languageId, language.id), eq(words.published, true)))

  let verbs = 0
  let prompts = 0
  let skipped = 0

  for (const row of rows) {
    const verbClass = classifyVerb(row.pos)
    if (!verbClass)
      continue

    // Every target form must be producible before a facet is created —
    // a drill that can't be answered is worse than no drill.
    const conjugations = FORMS.map(f => ({ ...f, result: conjugate({ surface: row.surface, reading: row.reading, verbClass }, f.form) }))
    if (conjugations.some(c => !c.result)) {
      skipped++
      continue
    }

    const [facet] = await db
      .insert(studyItemFacets)
      .values({ studyItemId: row.studyItemId, facet: 'production', enabled: true, introOrder: 2 })
      .onConflictDoNothing()
      .returning({ id: studyItemFacets.id })

    const facetId = facet?.id ?? (await db
      .select({ id: studyItemFacets.id })
      .from(studyItemFacets)
      .where(and(eq(studyItemFacets.studyItemId, row.studyItemId), eq(studyItemFacets.facet, 'production')))
      .limit(1))[0]?.id
    if (!facetId)
      continue
    verbs++

    for (const [i, c] of conjugations.entries()) {
      const answer = c.result!
      const [p] = await db
        .insert(exercisePrompts)
        .values({
          facetId,
          templateId: template.id,
          languageId: language.id,
          // Versioned rather than separate facets: same card, different ask.
          version: i + 1,
          prompt: {
            kind: 'conjugation',
            word: row.surface,
            reading: row.reading,
            verbClass,
            targetForm: c.form,
            instruction: `Give the ${c.label}`
          },
          answer: {
            primary: answer.surface,
            // The kana form is always acceptable — writing 書いて or かいて both
            // demonstrate the same knowledge.
            accepted: [answer.surface, answer.reading]
          }
        })
        .onConflictDoNothing()
        .returning({ id: exercisePrompts.id })
      if (p)
        prompts++
    }
  }

  console.log(`Verbs: ${verbs} given a conjugation facet`)
  console.log(`Prompts: ${prompts} written`)
  if (skipped > 0)
    console.log(`Skipped: ${skipped} (at least one form could not be produced)`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
