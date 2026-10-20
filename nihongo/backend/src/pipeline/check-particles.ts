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

import type { AuthoredParticleSentence, AuthoredParticleSet } from './data/particles/types.js'

import { duplicateGaps, gapFitsTokens, parseGap, particleQuestionProblems } from '../lib/particle-checks.js'
import { kanjiAboveLevel, lineFurigana, spansWordBreak, unspacedParticles } from '../lib/reading-checks.js'
import { tokenProblems } from '../lib/token-checks.js'
import { glossary, glossLine } from '../services/glossary.service.js'
import { PARTICLE_SETS } from './data/particles/index.js'
import { PARTICLE_SENTENCES } from './data/particles/sentences.js'

const LANGUAGE = 'lang-ja'
const FEW = 8

/**
 * Sentences written for Particles: N5 kanji only, a reading that fits word by
 * word, particles spaced in it, every word cut cleanly, no dashes, not a copy
 * of a published sentence, ids unique.
 */
async function checkSentences(written: AuthoredParticleSentence[], problems: string[], warnings: string[]): Promise<void> {
  if (written.length === 0)
    return
  const ranks = new Map((await connection.query<{ character: string, rank: number | null }>(`
    select k.character, lv.rank from kanji k left join language_levels lv on lv.id = k.level_id where k.language_id = $1
  `, [LANGUAGE])).rows.map(r => [r.character, r.rank]))
  const published = new Set((await connection.query<{ text: string }>(
    'select text from sentences where language_id = $1 and published and text = any($2)',
    [LANGUAGE, written.map(w => w.t)]
  )).rows.map(r => r.text))
  const g = await glossary('ja')
  const ids = new Set<string>()
  for (const w of written) {
    const where = `sentence ${w.id} 「${w.t}」`
    if (ids.has(w.id))
      problems.push(`${where}: id used twice`)
    ids.add(w.id)
    if (!/^sent-ptc-[a-z0-9-]+-\d+$/.test(w.id))
      problems.push(`${where}: id must look like sent-ptc-<lesson>-<n>`)
    if (published.has(w.t))
      problems.push(`${where}: already a published sentence; use that one`)
    if (/[—–]/.test(w.t + w.en))
      problems.push(`${where}: uses a dash`)
    if (!w.en.trim())
      problems.push(`${where}: no English`)
    const high = kanjiAboveLevel(w.t, 'N5', ranks)
    if (high.length > 0)
      problems.push(`${where}: above N5: ${high.join(' ')}, write it in kana`)
    const tokens = glossLine(w.t, g, w.r, { regroupKana: true })
    const report = tokenProblems(tokens, true)
    for (const p of [...report.problems, ...lineFurigana(tokens).problems, ...unspacedParticles(glossLine(w.t, g, w.r)), ...spansWordBreak(tokens)])
      problems.push(`${where}: ${p}\n     ${tokens.map(t => t.t).join(' | ')}`)
    for (const warning of report.warnings)
      warnings.push(`${where}: ${warning}`)
  }
}

export async function checkParticles(all: AuthoredParticleSet[], written: AuthoredParticleSentence[] = PARTICLE_SENTENCES): Promise<{ problems: string[], warnings: string[] }> {
  const problems = duplicateGaps(all)
  const warnings: string[] = []
  await checkSentences(written, problems, warnings)

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
  // A sentence written for Particles stands in for a published one: its words
  // cut the way its seed will store them.
  if (written.length) {
    const g = await glossary('ja')
    for (const w of written) {
      let at = 0
      const tokens = glossLine(w.t, g, w.r).map((t) => {
        const charStart = [...w.t.slice(0, w.t.indexOf(t.t, at))].length
        at = w.t.indexOf(t.t, at) + t.t.length
        return { surface: t.t, charStart }
      })
      byText.set(w.t, { text: w.t, english: Boolean(w.en.trim()), audio: true, tokens })
    }
  }
  const used = new Set(all.flatMap(set => set.questions.map(q => parseGap(q.s)?.text)))
  for (const w of written.filter(w => !used.has(w.t)))
    warnings.push(`sentence ${w.id} 「${w.t}」 is not used by any question`)

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
        problems.push(`${set.point}: ${q.s} is not a published sentence, nor one written in sentences.ts, word for word`)
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
