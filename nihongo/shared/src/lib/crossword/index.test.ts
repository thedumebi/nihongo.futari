import { describe, expect, it } from 'vitest'

import type { CrosswordCandidate, CrosswordGrid } from '@/types/crossword.js'

import {
  crosswordCellMatches,
  crosswordCells,
  crosswordScript,
  generateCrossword,
  inCrosswordScript,
  pickBonus,
  seededRandom,
  seedFrom
} from './index.js'

/** A word list shaped like the real one: everyday N5 words in hiragana. */
const READINGS = [
  'ほん',
  'いえ',
  'やま',
  'かわ',
  'そら',
  'あめ',
  'ねこ',
  'いぬ',
  'はな',
  'みず',
  'たべる',
  'のむ',
  'みる',
  'いく',
  'くる',
  'かう',
  'よむ',
  'かく',
  'きく',
  'はなす',
  'あさ',
  'ひる',
  'よる',
  'くるま',
  'でんしゃ',
  'がっこう',
  'せんせい',
  'ともだち',
  'たまご',
  'さかな',
  'くつ',
  'かさ',
  'つくえ',
  'いす',
  'まど',
  'とけい',
  'しんぶん',
  'ざっし',
  'てがみ',
  'きって',
  'あかい',
  'あおい',
  'しろい',
  'くろい',
  'おおきい',
  'ちいさい',
  'たかい',
  'やすい',
  'あたらしい',
  'ふるい',
  'おかね',
  'さいふ',
  'かばん',
  'めがね',
  'ぼうし',
  'うた',
  'えいが',
  'おんがく',
  'しゃしん',
  'りょこう'
]

function candidates(readings: string[]): CrosswordCandidate[] {
  return readings.map((r, i) => ({ id: `w${i}`, cells: crosswordCells(r), clue: `clue ${r}` }))
}

const POOL = candidates(READINGS)

/** Every maximal run of 2+ filled cells, across and down. */
function runs(grid: CrosswordGrid): string[] {
  const out: string[] = []
  for (const dir of ['across', 'down'] as const) {
    for (let line = 0; line < grid.size; line++) {
      let start = 0
      for (let i = 0; i <= grid.size; i++) {
        const [r, c] = dir === 'across' ? [line, i] : [i, line]
        if (i < grid.size && grid.cells[r]![c] !== null)
          continue
        if (i - start >= 2)
          out.push(`${dir}:${dir === 'across' ? line : start}:${dir === 'across' ? start : line}:${i - start}`)
        start = i + 1
      }
    }
  }
  return out.sort()
}

describe('crosswordCells', () => {
  it('writes small kana full size, one kana a cell, and keeps ー', () => {
    expect(crosswordCells('しゃしん')).toEqual(['し', 'や', 'し', 'ん'])
    expect(crosswordCells('きって')).toEqual(['き', 'つ', 'て'])
    expect(crosswordCells('コーヒー')).toEqual(['コ', 'ー', 'ヒ', 'ー'])
  })
})

describe('crosswordScript', () => {
  it('names one script, or null for a mix', () => {
    expect(crosswordScript('ほん')).toBe('hiragana')
    expect(crosswordScript('コーヒー')).toBe('katakana')
    expect(crosswordScript('ほンだ')).toBeNull()
    expect(crosswordScript('ーア')).toBeNull()
  })
})

describe('crosswordCellMatches', () => {
  it('forgives what the input method changes, not what the learner gets wrong', () => {
    expect(crosswordCellMatches('や', 'ゃ')).toBe(true)
    expect(crosswordCellMatches('コ', 'こ')).toBe(true)
    expect(crosswordCellMatches('づ', 'ず')).toBe(true)
    expect(crosswordCellMatches('ぢ', 'じ')).toBe(true)
    expect(crosswordCellMatches('ー', 'お')).toBe(true)
    expect(crosswordCellMatches('ー', 'ー')).toBe(true)
    expect(crosswordCellMatches('か', 'が')).toBe(false)
    expect(crosswordCellMatches('ー', 'か')).toBe(false)
    expect(crosswordCellMatches('か', '')).toBe(false)
  })

  it('shows typed kana in the cell\'s script', () => {
    expect(inCrosswordScript('こーひー', 'katakana')).toBe('コーヒー')
    expect(inCrosswordScript('ほん', 'hiragana')).toBe('ほん')
  })
})

describe('seededRandom', () => {
  it('repeats for the same seed and differs for another', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    const c = seededRandom(43)
    const first = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(first)
    expect([c(), c(), c()]).not.toEqual(first)
    expect(seedFrom('N5:2026-10-13')).toBe(seedFrom('N5:2026-10-13'))
    expect(seedFrom('N5:2026-10-13')).not.toBe(seedFrom('N5:2026-10-14'))
  })
})

describe('generateCrossword', () => {
  it('gives the same grid for the same seed', () => {
    const a = generateCrossword(POOL, { seed: 7 })
    const b = generateCrossword(POOL, { seed: 7 })
    expect(a).not.toBeNull()
    expect(b).toEqual(a)
  })

  // 200 generated grids: a second or two on a laptop, over 6s on a CI runner.
  it('makes every run of two or more cells exactly one placed word, across many seeds', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const grid = generateCrossword(POOL, { seed })
      expect(grid, `seed ${seed}`).not.toBeNull()
      const placed = grid!.placements.map(p => `${p.dir}:${p.row}:${p.col}:${p.length}`).sort()
      expect(runs(grid!), `seed ${seed}`).toEqual(placed)
    }
  }, 30_000)

  it('spells each placed word in its cells, uses no word twice, and keeps every word crossing another', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const grid = generateCrossword(POOL, { seed })!
      const ids = grid.placements.map(p => p.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(grid.placements.length).toBeGreaterThanOrEqual(4)

      const cellsOf = (p: typeof grid.placements[number]) => Array.from({ length: p.length }, (_, i) =>
        p.dir === 'across' ? `${p.row}:${p.col + i}` : `${p.row + i}:${p.col}`)
      for (const p of grid.placements) {
        const word = POOL.find(c => c.id === p.id)!
        const spelled = cellsOf(p).map((key) => {
          const [r, c] = key.split(':').map(Number)
          return grid.cells[r!]![c!]
        })
        expect(spelled).toEqual(word.cells)
        const others = new Set(grid.placements.filter(o => o !== p).flatMap(cellsOf))
        expect(cellsOf(p).some(key => others.has(key)), `seed ${seed} ${p.id}`).toBe(true)
      }
    }
  })

  it('numbers starts in reading order, one number per starting cell', () => {
    const grid = generateCrossword(POOL, { seed: 11 })!
    const starts = [...new Map(grid.placements.map(p => [`${p.row}:${p.col}`, p])).values()]
      .sort((a, b) => a.row - b.row || a.col - b.col)
    expect(starts.map(p => p.number)).toEqual(starts.map((_, i) => i + 1))
  })

  it('still makes a puzzle from a small word list, and gives up below the minimum', () => {
    const small = candidates(['ほん', 'はな', 'なつ', 'つくえ', 'えき', 'きた', 'たまご', 'ごはん', 'んー', 'かさ', 'さかな', 'なか'])
    const grid = generateCrossword(small, { seed: 3, minWords: 3 })
    expect(grid?.placements.length).toBeGreaterThanOrEqual(3)
    expect(generateCrossword(candidates(['ほん', 'いぬ']), { seed: 3 })).toBeNull()
  })

  it('keeps two-kana words to the cap', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const grid = generateCrossword(POOL, { seed, maxShortWords: 1 })!
      expect(grid.placements.filter(p => p.length === 2).length).toBeLessThanOrEqual(1)
    }
  })

  it('never puts two entries with the same clue in one puzzle', () => {
    const twins = POOL.map((c, i) => ({ ...c, clue: `clue ${i % 20}` }))
    for (let seed = 1; seed <= 50; seed++) {
      const grid = generateCrossword(twins, { seed })!
      const clues = grid.placements.map(p => twins.find(c => c.id === p.id)!.clue)
      expect(new Set(clues).size).toBe(clues.length)
    }
  })
})

describe('pickBonus', () => {
  const cells = [
    ['う', 'れ', null],
    ['し', null, 'い'],
    ['ほ', 'ん', null]
  ]

  it('finds a word whose kana sit in different cells, in order', () => {
    const bonus = pickBonus(cells, candidates(['うれしい']), new Set(), seededRandom(1))
    expect(bonus?.cells.map(([r, c]) => cells[r]![c])).toEqual(['う', 'れ', 'し', 'い'])
    expect(new Set(bonus!.cells.map(([r, c]) => `${r}:${c}`)).size).toBe(4)
  })

  it('needs a cell for every kana, repeats included', () => {
    expect(pickBonus(cells, candidates(['しし', 'ほんほん']), new Set(), seededRandom(1))).toBeNull()
  })

  it('skips words already in the grid', () => {
    expect(pickBonus(cells, candidates(['うれしい']), new Set(['w0']), seededRandom(1))).toBeNull()
  })

  it('takes the first tier that fits when the generator is given tiers', () => {
    // The same seed builds the same grid, so a word made of its first three
    // filled cells is certain to fit; the first tier never can.
    const plain = generateCrossword(POOL, { seed: 5 })!
    const kana = plain.cells.flat().filter((k): k is string => k !== null).slice(0, 3)
    const hidden = { id: 'hidden', cells: kana, clue: 'hidden' }
    const grid = generateCrossword(POOL, {
      seed: 5,
      bonusCandidates: [candidates(['ぬぬぬぬ']), [hidden]]
    })!
    expect(grid.placements).toEqual(plain.placements)
    expect(grid.bonus?.id).toBe('hidden')
    expect(grid.bonus!.cells.map(([r, c]) => grid.cells[r]![c])).toEqual(kana)
  })
})
