/* eslint-disable no-console */
/**
 * Check every authored read-aloud speech.
 *
 *   pnpm -C nihongo/backend check:readings
 *   pnpm -C nihongo/backend check:readings -- --level N5     # one level only
 *
 * The mechanical gate, run before any model or person reviews a speech:
 *
 *   1. no kanji above the speech's level — an N5 speech is kana plus N5 kanji
 *   2. no line copied from another speech, except stock greetings
 *   3. the line and its spoken reading agree — every kanji gets ruby
 *   4. every word cuts cleanly into a tappable token (the `check:examples` rules),
 *      and every particle is spaced off in the reading
 *   5. the shape is complete — English on every line, unique kebab-case codes
 *
 * Exits non-zero on any failure. Warnings (marked ⚠) need a human look but do
 * not fail the run.
 */
import type { FuriganaSegment } from '@nihongo/shared/types'

import db, { connection } from '@nihongo/shared/db'
import { kanji, languageLevels, languages } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'

import type { AuthoredReading } from './data/readings/types.js'

import { kanjiAboveLevel, lineFurigana, recycledText, spansWordBreak, unspacedParticles, wellFormed } from '../lib/reading-checks.js'
import { tokenProblems } from '../lib/token-checks.js'
import { glossary, glossLine } from '../services/glossary.service.js'
import { READINGS } from './data/readings/index.js'

const LANGUAGE = 'ja'

/** `${code}:${index}` → the ruby the importer stores for that line. */
type FuriganaByLine = Map<string, FuriganaSegment[]>

/** Every kanji with a JLPT level, as its rank (N5 = 1); null when unlevelled. */
async function kanjiRanks(): Promise<Map<string, number | null>> {
  const rows = await db
    .select({ character: kanji.character, rank: languageLevels.rank })
    .from(kanji)
    .innerJoin(languages, eq(languages.id, kanji.languageId))
    .leftJoin(languageLevels, eq(languageLevels.id, kanji.levelId))
    .where(eq(languages.code, LANGUAGE))
  return new Map(rows.map(r => [r.character, r.rank]))
}

export async function checkReadings(all: AuthoredReading[]): Promise<{
  problems: string[]
  warnings: string[]
  furigana: FuriganaByLine
}> {
  const problems = wellFormed(all)
  const warnings: string[] = []
  const furigana: FuriganaByLine = new Map()

  // Across the WHOLE corpus, not just the level being checked: copying a line
  // from an N5 speech into an N3 one is exactly the thing being refused.
  const recycled = recycledText(READINGS)
  const inScope = new Set(all.map(r => r.code))
  for (const line of recycled.lines) {
    if (line.codes.some(c => inScope.has(c)))
      problems.push(`line used in ${line.codes.join(', ')}: ${line.text}`)
  }
  for (const pair of recycled.pairs) {
    if (inScope.has(pair.a) || inScope.has(pair.b))
      problems.push(`${pair.a} and ${pair.b} share ${Math.round(pair.ratio * 100)}% of their lines — write a new speech`)
  }

  const ranks = await kanjiRanks()
  const g = await glossary(LANGUAGE)

  for (const reading of all) {
    const titleAbove = kanjiAboveLevel(reading.title, reading.level, ranks)
    if (titleAbove.length > 0)
      problems.push(`${reading.code} title: above ${reading.level}: ${titleAbove.join(' ')}`)

    for (const [index, line] of reading.stanzas.flat().entries()) {
      const where = `${reading.code} line ${index} 「${line.t}」`

      const above = kanjiAboveLevel(line.t, reading.level, ranks)
      if (above.length > 0)
        problems.push(`${where}: above ${reading.level}: ${above.join(' ')} — write it in kana`)

      const tokens = glossLine(line.t, g, line.r, { regroupKana: true })
      const spacing = unspacedParticles(glossLine(line.t, g, line.r))
      const report = tokenProblems(tokens, true)
      const ruby = lineFurigana(tokens)
      for (const p of [...report.problems, ...ruby.problems, ...spacing, ...spansWordBreak(tokens)])
        problems.push(`${where}: ${p}\n     ${tokens.map(t => t.t).join(' | ')}`)
      for (const w of report.warnings)
        warnings.push(`${where}: ${w}`)

      furigana.set(`${reading.code}:${index}`, ruby.segments)
    }
  }

  return { problems, warnings, furigana }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2).filter(a => a !== '--')
  const levelArg = argv[argv.indexOf('--level') + 1]
  const level = argv.includes('--level') ? levelArg?.toUpperCase() : undefined
  const scope = level ? READINGS.filter(r => r.level === level) : READINGS

  const { problems, warnings } = await checkReadings(scope)

  for (const p of problems) console.log(`✗ ${p}`)
  for (const w of warnings) console.log(`⚠ ${w}`)

  const lines = scope.reduce((n, r) => n + r.stanzas.flat().length, 0)
  console.log(`\n${scope.length} speeches, ${lines} lines${level ? ` at ${level}` : ''}.`)
  console.log(problems.length === 0 ? 'All checks pass.' : `${problems.length} problem(s).`)
  if (warnings.length > 0)
    console.log(`${warnings.length} to look over — marked ⚠, not counted as failures.`)
  process.exitCode = problems.length > 0 ? 1 : 0
}

// Only when run directly. The importer imports `checkReadings`.
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
