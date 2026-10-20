/* eslint-disable no-console */
import { connection } from '@nihongo/shared/db'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { sentenceAudioPath, voiceForClip } from '../lib/audio-key.js'
import { tokenise, tokensSql, wordIdsByForm } from '../lib/authored-tokens.js'
import { parseGap } from '../lib/particle-checks.js'
import { glossary } from '../services/glossary.service.js'
import { checkParticles } from './check-particles.js'
import { PARTICLE_SETS } from './data/particles/index.js'
import { PARTICLE_SENTENCES } from './data/particles/sentences.js'
import { listKeys } from './lib/bucket.js'

/**
 * Write the next numbered seed carrying every Particles set no earlier seed has.
 *
 *   pnpm -C nihongo/backend seed:particles
 *
 * A deploy runs the seed. Each set arrives UNPUBLISHED with one pending row in
 * the admin review queue, so a lesson's questions are read and approved
 * together; approving is the only thing that puts them in the game.
 *
 * Refuses to write anything if `check:particles` fails, or while a written
 * sentence has no recording in the bucket (run `audio:sentences` first). A NEW
 * file every time (seed_history is by filename).
 *
 * What goes in: every set, question and written sentence no earlier seed has.
 * Questions are keyed by their place in the set, so new ones go at the END of
 * a set's list. New questions for a set already shipped come with a fresh
 * review-queue row for it: approving it publishes the set's written
 * sentences, the only thing that does, so they are never live unreviewed.
 * Published sentences are found by their text, since ids differ between
 * databases; written ones carry their own ids.
 * Idempotent should it be re-applied: every insert is ON CONFLICT DO NOTHING
 * or guarded by NOT EXISTS.
 */

const SEEDS = path.resolve(process.cwd(), 'src/db/seeds')
const LANGUAGE = 'lang-ja'

const q = (value: string) => `'${value.replace(/'/g, '\'\'')}'`
const array = (values: readonly string[]) => `ARRAY[${values.map(q).join(', ')}]::text[]`

async function main(): Promise<void> {
  const files = (await readdir(SEEDS)).filter(f => /^\d{3}-/.test(f)).sort()
  const shipped = (await Promise.all(files.filter(f => f.endsWith('.sql')).map(f => readFile(path.join(SEEDS, f), 'utf8')))).join('\n')
  const isShipped = (id: string) => shipped.includes(q(id))
  const next = String(Number.parseInt(files.at(-1)?.slice(0, 3) ?? '0', 10) + 1).padStart(3, '0')

  const sets = PARTICLE_SETS.map(set => ({
    set,
    id: `pts-ja-${set.point}`,
    fresh: set.questions.map((question, i) => ({ question, i })).filter(({ i }) => !isShipped(`pts-ja-${set.point}-q${i}`))
  })).filter(s => s.fresh.length > 0)
  const sentences = PARTICLE_SENTENCES.filter(s => !isShipped(s.id))
  if (sets.length === 0 && sentences.length === 0) {
    console.log('Every set, question and sentence is already in a seed. Nothing to write.')
    return
  }

  const { problems } = await checkParticles(PARTICLE_SETS)
  if (problems.length > 0) {
    for (const p of problems) console.error(`✗ ${p}`)
    throw new Error(`${problems.length} problem(s), fix them before seeding`)
  }

  const statements: string[] = []

  if (sentences.length) {
    const clips = await listKeys('audio/sentences/')
    const silent = sentences.filter(s => !clips.has(sentenceAudioPath(s.t, voiceForClip(s.id)).slice(1)))
    if (silent.length)
      throw new Error(`${silent.length} written sentence(s) not recorded yet (${silent.map(s => s.id).join(', ')}): run \`pnpm audio:sentences\` first`)
    const values = sentences.map(s => `  (${q(s.id)}, ${q(s.t)}, ${q(s.r)}, ${q(s.en)}, ${q(voiceForClip(s.id))})`)
    statements.push(`-- Sentences written for the Particles lessons: unpublished until their set is approved.
INSERT INTO sentences (id, language_id, text, reading_kana, level_id, source, published, audio_text, audio_voice)
SELECT v.id, ${q(LANGUAGE)}, v.text, v.reading, ll.id, 'authored', false, v.text, v.voice
FROM (VALUES
${values.join(',\n')}
) AS v(id, text, reading, en, voice)
JOIN language_levels ll ON ll.language_id = ${q(LANGUAGE)} AND ll.code = 'N5'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sentence_translations (id, sentence_id, lang, text, source)
SELECT 'st-' || v.id, v.id, 'en', v.en, 'authored'
FROM (VALUES
${values.join(',\n')}
) AS v(id, text, reading, en, voice)
WHERE EXISTS (SELECT 1 FROM sentences WHERE id = v.id)
ON CONFLICT (id) DO NOTHING;`)
    const g = await glossary('ja')
    const ids = await wordIdsByForm()
    const tokens = sentences.flatMap(s => tokenise(s.id, s.t, s.r, g, ids))
    statements.push(`-- Their words, cut as every page cuts them.\n${tokensSql(sentences.map(s => s.id), tokens)}`)
  }

  sets.forEach(({ set, id, fresh }, n) => {
    const firstTime = !isShipped(id)
    if (firstTime) {
      statements.push(`-- ${set.point}: ${set.questions.length} questions
INSERT INTO particle_sets (id, language_id, grammar_point_id, published)
SELECT ${q(id)}, ${q(LANGUAGE)}, g.id, false
FROM grammar_points g
WHERE g.language_id = ${q(LANGUAGE)} AND g.slug = ${q(set.point)}
ON CONFLICT DO NOTHING;`)
    } else {
      statements.push(`-- ${set.point}: ${fresh.length} more questions`)
    }

    const values = fresh.map(({ question, i }) => {
      const gap = parseGap(question.s)!
      return `  (${q(`${id}-q${i}`)}, ${q(gap.text)}, ${gap.start}, ${gap.end}, ${q(gap.answer)}, ${array(question.also ?? [])}, ${array(question.wrong)}, ${q(question.why)}, ${i})`
    })
    // A published sentence first; a written one is found by its text too.
    statements.push(`INSERT INTO particle_questions (id, set_id, sentence_id, blank_start, blank_end, answer, also_right, wrong, note, sort_index)
SELECT v.id, ${q(id)}, s.id, v.blank_start, v.blank_end, v.answer, v.also_right, v.wrong, v.note, v.sort_index
FROM (VALUES
${values.join(',\n')}
) AS v(id, text, blank_start, blank_end, answer, also_right, wrong, note, sort_index)
CROSS JOIN LATERAL (
  SELECT id FROM sentences
  WHERE language_id = ${q(LANGUAGE)} AND text = v.text
  ORDER BY published DESC, created_at, id LIMIT 1
) s
WHERE EXISTS (SELECT 1 FROM particle_sets WHERE id = ${q(id)})
ON CONFLICT DO NOTHING;`)

    // First time: the set waits unpublished. Later: a fresh row, so the new
    // questions (and the sentences written for them) are reviewed too.
    const queueId = firstTime ? `crq-${id}` : `crq-${id}-${next}`
    const guard = firstTime
      ? `EXISTS (SELECT 1 FROM particle_sets WHERE id = ${q(id)} AND NOT published)
  AND NOT EXISTS (SELECT 1 FROM content_review_queue WHERE target_table = 'particle_sets' AND target_id = ${q(id)})`
      : `EXISTS (SELECT 1 FROM particle_sets WHERE id = ${q(id)})
  AND NOT EXISTS (SELECT 1 FROM content_review_queue WHERE target_table = 'particle_sets' AND target_id = ${q(id)} AND status = 'pending')`
    statements.push(`INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT ${q(queueId)}, ${q(LANGUAGE)}, 'particle_sets', ${q(id)}, ${q(firstTime ? 'create' : 'update')}, ${q(JSON.stringify({ point: set.point, questions: fresh.length }))}::jsonb, 'ai', ${1500 + n}, 'pending'
WHERE ${guard}
ON CONFLICT DO NOTHING;`)
  })

  const name = `${next}-particles.sql`
  const total = sets.reduce((n, s) => n + s.fresh.length, 0)
  const header = `-- Particles game: ${sets.length} sets, ${total} questions, ${sentences.length} written sentences.
--
-- Generated by \`pnpm -C nihongo/backend seed:particles\` from
-- backend/src/pipeline/data/particles. Do not edit: change the data and
-- generate a new seed.
--
-- Every set, and every set given new questions, has a pending row in the admin
-- review queue. Approving it is the only thing that puts its questions in the
-- game and publishes the sentences written for them.
--
-- Idempotent: nothing here overwrites a set, a question, a sentence or a
-- review decision.

`
  await writeFile(path.join(SEEDS, name), `${header}${statements.join('\n\n')}\n`)
  console.log(`Wrote src/db/seeds/${name}: ${sets.length} sets, ${total} questions, ${sentences.length} sentences`)
}

main()
  .catch((err) => {
    console.error('Failed:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
