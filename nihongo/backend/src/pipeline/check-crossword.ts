/* eslint-disable no-console */
/**
 * Build many crosswords from the real word lists and report how they come out.
 *
 *   pnpm -C nihongo/backend check:crossword
 *
 * For each level and source: how many failed, words and filled cells per
 * puzzle, how often there was a bonus word, and how long one took. Run after a
 * change to the generator, the clue filter, or the dictionary.
 */
import { connection } from '@nihongo/shared/db'

import { getCrossword } from '../services/crossword.service.js'

const RUNS = 200
/** No such user: no known words, no recent puzzles, the UTC day. */
const NOBODY = 'check-crossword'

async function main(): Promise<void> {
  for (const level of ['N5', 'N4']) {
    for (const source of ['new', 'loanwords'] as const) {
      let failed = 0
      let bonus = 0
      const sizes: number[] = []
      const filled: number[] = []
      const ms: number[] = []
      const sample: string[] = []
      for (let i = 0; i < RUNS; i++) {
        const started = performance.now()
        const puzzle = await getCrossword(NOBODY, { languageCode: 'ja', level, source })
        ms.push(performance.now() - started)
        if ('error' in puzzle) {
          failed++
          continue
        }
        sizes.push(puzzle.entries.length)
        filled.push(puzzle.cells.flat().filter(c => c !== null).length)
        if (puzzle.bonus)
          bonus++
        if (sample.length === 0 && puzzle.source === source) {
          sample.push(puzzle.cells.map(r => r.map(c => c ?? '■').join('')).join('\n'))
          sample.push(...puzzle.entries.map(e => `  ${e.number}${e.direction === 'across' ? 'A' : 'D'} ${e.clue} (${e.answer.length}) — ${e.answer.join('')}`))
          if (puzzle.bonus)
            sample.push(`  bonus: ${puzzle.bonus.clue} — ${puzzle.bonus.answer.join('')}`)
        }
      }
      const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0
      console.log(`\n${level} ${source}: ${failed}/${RUNS} failed · words ${median(sizes)} (min ${Math.min(...sizes)}) · cells ${median(filled)}/25 · bonus ${Math.round(bonus / RUNS * 100)}% · ${median(ms).toFixed(0)} ms`)
      console.log(sample.join('\n'))
    }
  }
}

main()
  .catch((err) => {
    console.error('Failed:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
