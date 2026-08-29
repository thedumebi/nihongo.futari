/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'

import type { Dialogue } from './data/dialogues/types.js'

import { DIALOGUES } from './data/dialogues/index.js'

/**
 * Build the conversations from the authored data.
 *
 * Idempotent: re-run after any edit. Everything a dialogue owns is replaced
 * wholesale rather than diffed — turns and replies are cheap, nothing
 * human-edited lives on them, and a diff would have to reconcile reply
 * identity across an edit that reordered them.
 *
 * The embedded prompt is rebuilt at the end. That snapshot is what makes a
 * conversation work offline, and it is also the thing most likely to go stale:
 * an edit to a turn leaves the prompt holding the old text until this runs.
 *
 *   pnpm -C nihongo/backend import:dialogues
 */

const LANGUAGE = 'lang-ja'
const LEVEL = 'lvl-ja-n5'

function assertWellFormed(d: Dialogue): void {
  const learner = d.turns.filter(t => t.s === 'you')
  if (learner.length === 0)
    throw new Error(`${d.code}: no learner turns — nothing to answer`)

  for (const [i, turn] of d.turns.entries()) {
    if (turn.s === 'you' && (!turn.wrong || turn.wrong.length === 0))
      throw new Error(`${d.code} turn ${i}: a learner turn needs wrong options`)
    if (turn.s === 'other' && turn.wrong)
      throw new Error(`${d.code} turn ${i}: only a learner turn takes options`)
    for (const [text, , why] of turn.wrong ?? []) {
      if (!why.trim())
        throw new Error(`${d.code} turn ${i}: "${text}" has no reason`)
    }
  }
}

async function main() {
  const codes = new Set<string>()
  for (const d of DIALOGUES) {
    if (codes.has(d.code))
      throw new Error(`Duplicate dialogue code: ${d.code}`)
    codes.add(d.code)
    assertWellFormed(d)
  }
  console.log(`${DIALOGUES.length} dialogues, all well-formed`)

  let turns = 0
  let replies = 0

  for (const [index, d] of DIALOGUES.entries()) {
    const id = `dlg-ja-${d.code}`

    await db.execute(sql`
      insert into dialogues (id, language_id, level_id, unit_id, code, title, situation, published, sort_index)
      values (
        ${id}, ${LANGUAGE}, ${LEVEL},
        (select cu.id from curriculum_units cu where cu.language_id = ${LANGUAGE} and cu.code = ${d.unit}),
        ${d.code}, ${d.title}, ${d.situation}, true, ${index}
      )
      on conflict (language_id, code) do update set
        title = excluded.title,
        situation = excluded.situation,
        unit_id = excluded.unit_id,
        sort_index = excluded.sort_index,
        updated_at = now()
    `)

    // Replaced wholesale — replies cascade from turns.
    await db.execute(sql`delete from dialogue_turns where dialogue_id = ${id}`)

    for (const [i, turn] of d.turns.entries()) {
      const turnId = `${id}-t${i}`
      await db.execute(sql`
        insert into dialogue_turns (id, dialogue_id, index, speaker, text, reading_kana, translation)
        values (${turnId}, ${id}, ${i}, ${turn.s === 'you' ? 'learner' : 'other'}, ${turn.t}, ${turn.r}, ${turn.e})
      `)
      turns++

      if (turn.s !== 'you')
        continue

      // The right answer is the turn itself, always first.
      await db.execute(sql`
        insert into dialogue_replies (id, turn_id, text, reading_kana, translation, is_correct, why_wrong, sort_index)
        values (${`${turnId}-r0`}, ${turnId}, ${turn.t}, ${turn.r}, ${turn.e}, true, null, 0)
      `)
      replies++

      for (const [j, [text, reading, why]] of (turn.wrong ?? []).entries()) {
        await db.execute(sql`
          insert into dialogue_replies (id, turn_id, text, reading_kana, translation, is_correct, why_wrong, sort_index)
          values (${`${turnId}-r${j + 1}`}, ${turnId}, ${text}, ${reading}, null, false, ${why}, ${j + 1})
        `)
        replies++
      }
    }
  }

  console.log(`Turns: ${turns}  Replies: ${replies}`)

  // --- Schedulable -----------------------------------------------------------
  await db.execute(sql`
    insert into study_items (id, language_id, kind, dialogue_id, level_id, sort_index, published, active)
    select 'si-'||d.id, d.language_id, 'dialogue', d.id, d.level_id, 4000 + d.sort_index, d.published, true
    from dialogues d where d.language_id = ${LANGUAGE}
    on conflict (id) do nothing
  `)
  await db.execute(sql`
    insert into study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
    select 'sif-'||si.id||'-usage', si.id, 'usage', true, 1, 0
    from study_items si where si.kind = 'dialogue'
    on conflict (study_item_id, facet) do nothing
  `)

  // --- The embedded snapshot -------------------------------------------------
  const promptJson = sql`
    jsonb_build_object(
      'kind', 'dialogue',
      'title', d.title,
      'situation', d.situation,
      'instruction', 'Choose your reply',
      'turns', (
        select jsonb_agg(turn order by (turn->>'index')::int)
        from (
          select jsonb_build_object(
            'index', t.index, 'speaker', t.speaker, 'text', t.text,
            'reading', t.reading_kana, 'translation', t.translation,
            -- A ROOT-RELATIVE path, prefixed at serve time by withDialogueAudio.
            -- Baking the bucket in here would make moving it a re-import.
            'audio', '/audio/dialogues/'||t.id||'.m4a',
            'replies', coalesce((
              select jsonb_agg(jsonb_build_object(
                'id', r.id, 'text', r.text, 'reading', r.reading_kana,
                'translation', r.translation, 'isCorrect', r.is_correct, 'whyWrong', r.why_wrong,
                'audio', '/audio/dialogues/'||r.id||'.m4a'
              ) order by r.sort_index)
              from dialogue_replies r where r.turn_id = t.id), '[]'::jsonb)
          ) as turn
          from dialogue_turns t where t.dialogue_id = d.id
        ) turns
      )
    )`

  await db.execute(sql`
    insert into exercise_prompts (id, facet_id, template_id, language_id, prompt, answer, distractors, status)
    select 'ep-'||f.id, f.id, 'tpl-dialogue-reply', d.language_id, ${promptJson},
           jsonb_build_object('primary', d.code, 'accepted', jsonb_build_array(d.code)),
           '[]'::jsonb, 'published'
    from study_item_facets f
    join study_items si on si.id = f.study_item_id
    join dialogues d on d.id = si.dialogue_id
    where f.facet = 'usage'
    on conflict (facet_id, template_id, version) do update set
      prompt = excluded.prompt, updated_at = now()
  `)

  const [{ count } = { count: 0 }] = (await db.execute(sql`
    select count(*)::int as count from exercise_prompts where prompt->>'kind' = 'dialogue'
  `)).rows as Array<{ count: number }>
  console.log(`Prompts written/refreshed: ${count}`)
  console.log('\nRun build:curriculum to place them in the level.')
}

main()
  .catch((err) => {
    console.error('Failed:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
