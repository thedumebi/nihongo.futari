/* eslint-disable no-console */
/**
 * Check every authored Particles question against the database.
 *
 *   pnpm -C nihongo/backend check:particles
 *
 * Fails on: a malformed gap, an option that is not a game particle, a wrong
 * option that is also right, a dash in the why, the same gap twice, a lesson
 * slug that does not exist, a sentence that is not published word for word,
 * a sentence with no English, and a gap that does not start a word.
 *
 * Warns (⚠) on a sentence with no current recording (it plays nothing after
 * answering) and on a set with fewer than eight questions.
 */
import { connection } from '@nihongo/shared/db'

import type { AuthoredParticleSet } from './data/particles/types.js'

import { duplicateGaps, gapFitsTokens, parseGap, particleQuestionProblems } from '../lib/particle-checks.js'
import { PARTICLE_SETS } from './data/particles/index.js'

const LANGUAGE = 'lang-ja'
const FEW = 8

export async function checkParticles(all: AuthoredParticleSet[]): Promise<{ problems: string[], warnings: string[] }> {
  const problems = duplicateGaps(all)
  const warnings: string[] = []

  const slugs = [...new Set(all.map(s => s.point))]
  const points = new Set((await connection.query<{ slug: string }>(
    'select slug from grammar_points where language_id = $1 and slug = any($2)',
    [LANGUAGE, slugs]
  )).rows.map(r => r.slug))

  const texts = [...new Set(all.flatMap(s => s.questions.map(q => parseGap(q.s)?.text).filter(t => t !== undefined)))]
  const sentences = (await connection.query<{ text: string, english: boolean, audio: boolean, tokens: Array<{ surface: string, charStart: number }> }>(`
    select distinct on (s.text) s.text,
      exists (select 1 from sentence_translations t where t.sentence_id = s.id and t.lang = 'en') as english,
      (s.audio_text = s.text and s.audio_voice is not null) as audio,
      coalesce((select json_agg(json_build_object('surface', k.surface, 'charStart', k.char_start) order by k.char_start)
        from sentence_tokens k where k.sentence_id = s.id), '[]') as tokens
    from sentences s
    where s.language_id = $1 and s.published and s.text = any($2)
    order by s.text, s.created_at, s.id
  `, [LANGUAGE, texts])).rows
  const byText = new Map(sentences.map(s => [s.text, s]))

  for (const set of all) {
    if (!points.has(set.point))
      problems.push(`${set.point}: no such grammar point`)
    if (set.questions.length < FEW)
      warnings.push(`${set.point}: only ${set.questions.length} question(s)`)
    for (const q of set.questions) {
      for (const p of particleQuestionProblems(q))
        problems.push(`${set.point}: ${q.s} ${p}`)
      const gap = parseGap(q.s)
      if (!gap)
        continue
      const sentence = byText.get(gap.text)
      if (!sentence) {
        problems.push(`${set.point}: ${q.s} is not a published sentence, word for word`)
        continue
      }
      if (!sentence.english)
        problems.push(`${set.point}: ${q.s} has no English translation`)
      if (!gapFitsTokens(gap, sentence.tokens))
        problems.push(`${set.point}: ${q.s} the gap does not start a word (${sentence.tokens.map(t => t.surface).join(' ')})`)
      if (!sentence.audio)
        warnings.push(`${set.point}: ${q.s} has no current recording`)
    }
  }
  return { problems, warnings }
}

async function main(): Promise<void> {
  const { problems, warnings } = await checkParticles(PARTICLE_SETS)
  for (const p of problems) console.log(`✗ ${p}`)
  for (const w of warnings) console.log(`⚠ ${w}`)
  console.log(`\n${PARTICLE_SETS.length} sets, ${PARTICLE_SETS.reduce((n, s) => n + s.questions.length, 0)} questions.`)
  console.log(problems.length === 0 ? 'All checks pass.' : `${problems.length} problem(s).`)
  process.exitCode = problems.length > 0 ? 1 : 0
}

// Only when run directly. The seed generator imports `checkParticles`.
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((err) => {
      console.error('Failed:', err instanceof Error ? err.message : err)
      process.exitCode = 1
    })
    .finally(async () => {
      await connection.end()
    })
}
