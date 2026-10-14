/* eslint-disable no-console */
/**
 * Check every authored Speak session.
 *
 *   pnpm -C nihongo/backend check:speak
 *   pnpm -C nihongo/backend check:speak -- --audio     # and every clip is in the bucket
 *
 * Fails on: kanji above the session's level, an answer whose reading does not
 * fit it, a particle run into the word before it in the reading, a word the
 * dictionary cannot cut, a pattern used before the session that teaches it,
 * and malformed sessions. With --audio, on any clip not yet generated.
 *
 * Warns (⚠) when a prompt adds more than two new words — the build-up should
 * grow by a piece at a time, but a human decides whether a jump is fine.
 */
import db, { connection } from '@nihongo/shared/db'
import { kanji, languageLevels, languages } from '@nihongo/shared/db/schema'
import { speakSegments, speakSpoken } from '@nihongo/shared/lib'
import { eq } from 'drizzle-orm'

import type { AuthoredSpeakSession } from './data/speak/types.js'

import { audioKeyFor, englishVoiceFor, VOICE_OTHER } from '../lib/audio-key.js'
import { kanjiAboveLevel, LEVEL_RANK, lineFurigana, spansWordBreak, unspacedParticles } from '../lib/reading-checks.js'
import { patternsBeforeTaught, speakWellFormed, tooManyNewWords } from '../lib/speak-checks.js'
import { tokenProblems } from '../lib/token-checks.js'
import { glossary, glossLine } from '../services/glossary.service.js'
import { SPEAK } from './data/speak/index.js'
import { japaneseLine, teacherLine } from './data/speak/types.js'
import { listKeys } from './lib/bucket.js'

const LANGUAGE = 'ja'

/** Every clip a session needs, as bucket keys. */
export function speakClipKeys(all: AuthoredSpeakSession[]): Set<string> {
  const keys = new Set<string>()
  for (const session of all) {
    for (const step of session.steps) {
      for (const segment of speakSegments(teacherLine(step)).filter(speakSpoken))
        keys.add(`audio/speak/${audioKeyFor(segment.text, segment.lang === 'ja' ? VOICE_OTHER : englishVoiceFor(session.number))}.m4a`)
      const ja = japaneseLine(step)
      if (ja)
        keys.add(`audio/speak/${audioKeyFor(ja, VOICE_OTHER)}.m4a`)
    }
  }
  return keys
}

export async function checkSpeak(all: AuthoredSpeakSession[], { audio = false } = {}): Promise<{ problems: string[], warnings: string[] }> {
  const problems = [...speakWellFormed(all), ...patternsBeforeTaught(SPEAK).filter(p => all.some(s => p.startsWith(`${s.code} `)))]
  const warnings: string[] = []

  const ranks = new Map((await db
    .select({ character: kanji.character, rank: languageLevels.rank })
    .from(kanji)
    .innerJoin(languages, eq(languages.id, kanji.languageId))
    .leftJoin(languageLevels, eq(languageLevels.id, kanji.levelId))
    .where(eq(languages.code, LANGUAGE))).map(r => [r.character, r.rank]))
  const g = await glossary(LANGUAGE)

  // Words carry over from session to session: the course is cumulative, and a
  // closing session that mixes everything adds nothing new.
  const seen = new Set<string>()
  for (const session of [...all].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || Number(a.kind === 'story') - Number(b.kind === 'story') || a.number - b.number)) {
    const above = kanjiAboveLevel(session.title, session.level, ranks)
    if (above.length > 0)
      problems.push(`${session.code} title: above ${session.level}: ${above.join(' ')}`)

    const built: Array<{ index: number, tokens: ReturnType<typeof glossLine>, said: ReturnType<typeof glossLine> }> = []
    let said: ReturnType<typeof glossLine> = []
    for (const [i, step] of session.steps.entries()) {
      // Japanese the teacher says aloud counts as heard.
      for (const segment of speakSegments(teacherLine(step))) {
        if (segment.lang === 'ja')
          said = [...said, ...glossLine(segment.text, g)]
      }
      const ja = japaneseLine(step)
      if (!ja || 'x' in step)
        continue

      const where = `${session.code} step ${i} 「${ja}」`
      const high = kanjiAboveLevel(ja, session.level, ranks)
      if (high.length > 0)
        problems.push(`${where}: above ${session.level}: ${high.join(' ')} — write it in kana`)

      const tokens = glossLine(ja, g, step.r, { regroupKana: true })
      const report = tokenProblems(tokens, true)
      const ruby = lineFurigana(tokens)
      for (const p of [...report.problems, ...ruby.problems, ...unspacedParticles(glossLine(ja, g, step.r)), ...spansWordBreak(tokens)])
        problems.push(`${where}: ${p}\n     ${tokens.map(t => t.t).join(' | ')}`)
      for (const w of report.warnings)
        warnings.push(`${where}: ${w}`)

      // A narration is heard, not said: its words join what the learner has
      // met, and it is not a step that adds words to an answer.
      if ('s' in step) {
        said = [...said, ...tokens]
        continue
      }
      built.push({ index: i, tokens, said })
      said = []
    }

    for (const jump of tooManyNewWords(built, seen))
      warnings.push(`${session.code} step ${jump.index}: adds ${jump.added.length} new words at once (${jump.added.join(', ')})`)
  }

  if (audio) {
    const stored = await listKeys('audio/speak/')
    const missing = [...speakClipKeys(all)].filter(k => !stored.has(k))
    if (missing.length > 0)
      problems.push(`${missing.length} clip(s) not in the bucket — run \`pnpm audio:speak\``)
  }

  return { problems, warnings }
}

async function main(): Promise<void> {
  const { problems, warnings } = await checkSpeak(SPEAK, { audio: process.argv.includes('--audio') })
  for (const p of problems) console.log(`✗ ${p}`)
  for (const w of warnings) console.log(`⚠ ${w}`)
  const prompts = SPEAK.reduce((n, s) => n + s.steps.filter(st => 'q' in st).length, 0)
  console.log(`\n${SPEAK.length} sessions, ${prompts} prompts.`)
  console.log(problems.length === 0 ? 'All checks pass.' : `${problems.length} problem(s).`)
  if (warnings.length > 0)
    console.log(`${warnings.length} to look over — marked ⚠, not counted as failures.`)
  process.exitCode = problems.length > 0 ? 1 : 0
}

// Only when run directly. The seed generator imports `checkSpeak`.
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
