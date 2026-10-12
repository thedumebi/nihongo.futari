/* eslint-disable no-console */
import { connection } from '@nihongo/shared/db'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { LEVEL_RANK } from '../lib/reading-checks.js'
import { checkSpeak } from './check-speak.js'
import { SPEAK } from './data/speak/index.js'

/**
 * Write the next numbered seed carrying every Speak session no earlier seed has.
 *
 *   pnpm -C nihongo/backend seed:speak
 *
 * How sessions reach production: a deploy runs pending seeds, never a pipeline
 * script. Each session arrives UNPUBLISHED with a pending row in the admin
 * review queue, and approving it there is the only thing that publishes it.
 *
 * Refuses to write anything if `check:speak` fails — including when a clip has
 * not been generated, because a session is approved by listening to it and
 * hands-free mode is nothing but its audio. Run `pnpm audio:speak` first.
 *
 * A NEW file every time, never an edit (seed_history is by filename). A session
 * already in an earlier seed is left out; to revise one after it has shipped,
 * give it a new code. Idempotent should it be re-applied: every insert is ON
 * CONFLICT DO NOTHING or guarded by NOT EXISTS.
 */

const SEEDS = path.resolve(process.cwd(), 'src/db/seeds')
const LANGUAGE = 'lang-ja'

const q = (value: string) => `'${value.replace(/'/g, '\'\'')}'`

/**
 * Every Speak prompt as a study item, so a miss can become a review card.
 *
 * Built in SQL from the steps already in the database rather than from the
 * data files, so it covers every session — including ones an earlier seed
 * shipped before study items existed — and every seed can carry it whole: it
 * only ever adds what is missing.
 *
 * - One item per prompt (`speak_step_id`), published exactly when its session
 *   is. Approving a session publishes them too (review-queue.service).
 * - One facet, `production`: hear the English, say the Japanese.
 * - One prompt holding the content only. Clips and word cuts are worked out
 *   when the card is served, so a new teacher voice or a dictionary fix
 *   reaches cards already in review.
 *
 * The queue never introduces these (srs.service `introducedByQueue`), and the
 * curriculum builder leaves them out of stages: a card exists only for a
 * learner who answered that prompt "Not quite".
 */
const STUDY_ITEMS = `-- Speak prompts as study items, for every session in the database.
INSERT INTO exercise_templates
  (id, code, language_id, name, applies_to_kinds, applies_to_facets, input_mode, grader_code, requires, first_exposure_only, config, weight, active)
VALUES
  ('tpl-speak-say', 'speak-say', NULL, 'Say it aloud',
   ARRAY['speak'], ARRAY['production'],
   'none', 'self-check', '{"audio": true}', false, '{}', 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO study_items (id, language_id, kind, speak_step_id, level_id, sort_index, published, active)
SELECT 'si-'||st.id, ss.language_id, 'speak', st.id, ss.level_id, 90000 + ss.number * 100 + st.index, ss.published, true
FROM speak_steps st
JOIN speak_sessions ss ON ss.id = st.session_id
WHERE st.kind = 'prompt'
ON CONFLICT (id) DO NOTHING;

INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
SELECT 'sif-'||si.id||'-production', si.id, 'production', true, 1, 0
FROM study_items si
WHERE si.kind = 'speak'
ON CONFLICT (study_item_id, facet) DO NOTHING;

INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, prompt, answer, distractors, status)
SELECT
  'ep-'||f.id,
  f.id,
  'tpl-speak-say',
  ss.language_id,
  jsonb_build_object(
    'kind', 'speak',
    'en', st.en,
    'text', st.text,
    'reading', st.reading_kana,
    'note', st.note,
    'session', jsonb_build_object('code', ss.code, 'number', ss.number, 'titleEn', ss.title_en)
  ),
  jsonb_build_object('primary', st.text, 'accepted', jsonb_build_array(st.text)),
  '[]'::jsonb,
  'published'
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN speak_steps st ON st.id = si.speak_step_id
JOIN speak_sessions ss ON ss.id = st.session_id
WHERE f.facet = 'production'
ON CONFLICT (facet_id, template_id, version) DO NOTHING;`
const orNull = (value: string | undefined) => value === undefined ? 'NULL' : q(value)

async function main(): Promise<void> {
  const files = (await readdir(SEEDS)).filter(f => /^\d{3}-/.test(f)).sort()
  const shipped = (await Promise.all(files.filter(f => f.endsWith('.sql')).map(f => readFile(path.join(SEEDS, f), 'utf8')))).join('\n')
  const fresh = SPEAK.filter(s => !shipped.includes(q(`spk-ja-${s.code}`)))
  if (fresh.length === 0) {
    console.log('Every session is already in a seed. Nothing to write.')
    return
  }

  // The whole course, not only what is new: numbering, and patterns taught
  // before they are used, are properties of the sequence. Checking sessions
  // 11-20 alone saw a course starting at 11.
  const { problems } = await checkSpeak(SPEAK, { audio: true })
  if (problems.length > 0) {
    for (const p of problems) console.error(`✗ ${p}`)
    throw new Error(`${problems.length} problem(s) — fix them before seeding`)
  }

  const statements: string[] = []
  for (const s of fresh) {
    const id = `spk-ja-${s.code}`
    statements.push(`-- ${s.level} · ${s.number} · ${s.titleEn}
INSERT INTO speak_sessions (id, language_id, level_id, code, number, title, title_en, published)
SELECT ${q(id)}, ${q(LANGUAGE)}, ll.id, ${q(s.code)}, ${s.number}, ${q(s.title)}, ${q(s.titleEn)}, false
FROM language_levels ll
WHERE ll.language_id = ${q(LANGUAGE)} AND ll.code = ${q(s.level)}
ON CONFLICT (language_id, code) DO NOTHING;`)

    const values = s.steps.map((step, i) => 'x' in step
      ? `  (${q(`${id}-s${i}`)}, ${q(id)}, ${i}, 'explain', ${q(step.x)}, NULL, NULL, NULL)`
      : `  (${q(`${id}-s${i}`)}, ${q(id)}, ${i}, 'prompt', ${q(step.q)}, ${q(step.t)}, ${q(step.r)}, ${orNull(step.n)})`)
    statements.push(`INSERT INTO speak_steps (id, session_id, index, kind, en, text, reading_kana, note)
SELECT v.* FROM (VALUES
${values.join(',\n')}
) AS v(id, session_id, index, kind, en, text, reading_kana, note)
WHERE EXISTS (SELECT 1 FROM speak_sessions WHERE id = ${q(id)})
ON CONFLICT (session_id, index) DO NOTHING;`)

    // Priority: level, then session number — the queue lists the course in order.
    statements.push(`INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT ${q(`crq-${id}`)}, ${q(LANGUAGE)}, 'speak_sessions', ${q(id)}, 'create', ${q(JSON.stringify({ code: s.code, level: s.level, number: s.number }))}::jsonb, 'ai', ${LEVEL_RANK[s.level] * 1000 + s.number}, 'pending'
WHERE EXISTS (SELECT 1 FROM speak_sessions WHERE id = ${q(id)} AND NOT published)
  AND NOT EXISTS (SELECT 1 FROM content_review_queue WHERE target_table = 'speak_sessions' AND target_id = ${q(id)})
ON CONFLICT DO NOTHING;`)
  }

  const next = String(Number.parseInt(files.at(-1)?.slice(0, 3) ?? '0', 10) + 1).padStart(3, '0')
  const name = `${next}-speak.sql`
  const header = `-- Speak sessions: ${fresh.length} of them, ${[...new Set(fresh.map(s => s.level))].join(', ')}.
--
-- Generated by \`pnpm -C nihongo/backend seed:speak\` from
-- backend/src/pipeline/data/speak. Do not edit: change the data and generate a
-- new seed. Audio was confirmed in the bucket when this was written.
--
-- Every session arrives UNPUBLISHED with a pending row in the admin review
-- queue. Approving it there is the only thing that publishes it.
--
-- Then every prompt in the database — these sessions and all earlier ones — as
-- a study item, so a prompt answered "Not quite" can come back in reviews.
--
-- Idempotent: nothing here overwrites an existing session, its steps, a study
-- item, or a review decision already made.

`
  await writeFile(path.join(SEEDS, name), `${header}${[...statements, STUDY_ITEMS].join('\n\n')}\n`)
  console.log(`Wrote src/db/seeds/${name}: ${fresh.length} sessions, ${fresh.reduce((n, s) => n + s.steps.length, 0)} steps`)
}

main()
  .catch((err) => {
    console.error('Failed:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
