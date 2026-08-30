/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { curriculumUnits, dialogues, languages, words } from '@nihongo/shared/db/schema'
import { and, eq, sql } from 'drizzle-orm'

import { listKeys } from './lib/bucket.js'

/**
 * Attach hand-drawn illustrations to the content that should show them.
 *
 * The SVGs were on disk and referenced by nothing, so no card ever rendered
 * one. Files keyed by JMdict ent_seq, matching the audio convention
 * (/audio/words/<entSeq>.m4a, /images/vocab/<entSeq>.svg).
 *
 * Only attaches what EXISTS, and existence is a question for the BUCKET rather
 * than the filesystem. The local tree is a staging area that gets cleared once
 * its contents are uploaded, so asking disk would report every already-drawn
 * illustration as missing and quietly strip the art off every card.
 *
 * A missing drawing must leave the card unchanged rather than pointing at a
 * 404 — an image slot that sometimes breaks is worse than a card with none.
 *
 *   pnpm -C nihongo/backend import:images
 */

async function main() {
  // One listing for the whole run. Asking the bucket per file would be a round
  // trip each for several thousand words.
  const stored = await listKeys('images/')
  console.log(`${stored.size} illustrations in the bucket`)

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  // ---- Vocabulary illustrations ---------------------------------------------
  const wordRows = await db
    .select({ entSeq: words.entSeq, wordId: words.id, form: words.primaryForm })
    .from(words)
    .where(and(eq(words.languageId, language.id), eq(words.published, true)))

  let attached = 0
  let missing = 0

  for (const row of wordRows) {
    if (row.entSeq === null)
      continue
    if (!stored.has(`images/vocab/${row.entSeq}.svg`)) {
      missing++
      continue
    }
    const url = `/images/vocab/${row.entSeq}.svg`

    // Merge into assets rather than replacing: audio already lives there.
    const result = await db.execute(sql`
      update exercise_prompts p
      set assets = p.assets || ${JSON.stringify({ image: url })}::jsonb,
          updated_at = now()
      from study_item_facets f
      join study_items si on si.id = f.study_item_id
      where p.facet_id = f.id
        and si.word_id = ${row.wordId}
        and coalesce(p.assets->>'image', '') <> ${url}
    `)
    if ((result.rowCount ?? 0) > 0)
      attached += result.rowCount ?? 0
  }

  // ---- Scenario scenes ------------------------------------------------------
  const units = await db
    .select({ id: curriculumUnits.id, code: curriculumUnits.code })
    .from(curriculumUnits)

  let scenes = 0
  for (const unit of units) {
    if (!stored.has(`images/scenes/${unit.code}.svg`))
      continue
    await db.execute(sql`
      update curriculum_units
      set image_url = ${`/images/scenes/${unit.code}.svg`}, updated_at = now()
      where id = ${unit.id}
    `)
    scenes++
  }

  // ---- Conversation illustrations -------------------------------------------
  // One per conversation, keyed by its code. Unit art was tried first and read
  // badly: fourteen conversations in a unit all showed the same drawing, so the
  // picture took the space of information and carried none.
  const dialogueRows = await db
    .select({ id: dialogues.id, code: dialogues.code })
    .from(dialogues)
    .where(eq(dialogues.languageId, language.id))

  let drawn = 0
  let undrawn = 0

  for (const row of dialogueRows) {
    if (!stored.has(`images/dialogues/${row.code}.svg`)) {
      undrawn++
      continue
    }
    await db.execute(sql`
      update dialogues
      set image_url = ${`/images/dialogues/${row.code}.svg`}, updated_at = now()
      where id = ${row.id}
    `)
    drawn++
  }

  console.log(`Vocabulary prompts given an image: ${attached}`)
  console.log(`Words with no drawing yet:         ${missing}`)
  console.log(`Scenario units given a scene:      ${scenes}`)
  console.log(`Conversations given a drawing:     ${drawn}`)
  if (undrawn > 0)
    console.log(`Conversations still without one:   ${undrawn}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
