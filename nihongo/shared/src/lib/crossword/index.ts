import type { CrosswordDirection, CrosswordScript } from '@/constants/endpoints.js'
import type { CrosswordCandidate, CrosswordGrid, CrosswordOptions, CrosswordPlacement } from '@/types/crossword.js'

import { toHiragana } from '../ja/furigana/index.js'
import { toKatakana } from '../ja/romaji/index.js'
import { hasHiragana, hasKatakana } from '../ja/script/index.js'

/**
 * A kana crossword, built by placement.
 *
 * Fixed block patterns were the first idea, and most of them cannot be filled
 * from a beginner's vocabulary: only 55 N5 words have five kana, so any pattern
 * with three five-kana slots crossing each other is usually impossible. So the
 * grid is grown instead. One word goes in; each next word must cross a word
 * already there; and every cell no word uses is blacked out at the end. A
 * small word list gives a sparser puzzle instead of no puzzle — the learner's
 * own known words, twenty or thirty of them, still make one.
 *
 * Pure and seeded: the same candidates and seed give the same grid, so the
 * puzzle of the day is the same for everyone and a test can pin a grid down.
 */

// ---------------------------------------------------------------------------
// Kana
// ---------------------------------------------------------------------------

/** Small kana and their full-size letters. */
const FULL_SIZE: Record<string, string> = {
  ぁ: 'あ',
  ぃ: 'い',
  ぅ: 'う',
  ぇ: 'え',
  ぉ: 'お',
  っ: 'つ',
  ゃ: 'や',
  ゅ: 'ゆ',
  ょ: 'よ',
  ゎ: 'わ',
  ゕ: 'か',
  ゖ: 'け',
  ァ: 'ア',
  ィ: 'イ',
  ゥ: 'ウ',
  ェ: 'エ',
  ォ: 'オ',
  ッ: 'ツ',
  ャ: 'ヤ',
  ュ: 'ユ',
  ョ: 'ヨ',
  ヮ: 'ワ',
  ヵ: 'カ',
  ヶ: 'ケ'
}

/**
 * A reading as crossword cells: one kana per cell, small kana written full
 * size. That is how Japanese crosswords are written — しゃしん fills し や し ん —
 * and it is what lets ゃ cross や. ー keeps its own cell.
 */
export function crosswordCells(reading: string): string[] {
  return [...reading.replace(/\s/g, '')].map(char => FULL_SIZE[char] ?? char)
}

/**
 * Which script a reading is written in, or null for a mix (or anything that is
 * not kana). A puzzle is all one script — see `generateCrossword`.
 */
export function crosswordScript(reading: string): CrosswordScript | null {
  const chars = [...reading.replace(/\s/g, '')]
  if (chars.length === 0)
    return null
  if (chars.every(hasHiragana))
    return 'hiragana'
  // ー belongs to the katakana block but cannot start a word.
  if (chars.every(hasKatakana) && chars[0] !== 'ー')
    return 'katakana'
  return null
}

/** One cell's kana with the differences the crossword forgives folded away. */
function fold(kana: string): string {
  return toHiragana(FULL_SIZE[kana] ?? kana)
    // Romaji cannot tell them apart: "tsuzuku" gives つずく for つづく.
    .replace('づ', 'ず')
    .replace('ぢ', 'じ')
}

/**
 * Whether what was typed in a cell is right.
 *
 * Forgiving where the input method, not the learner, is the difference: small
 * or full size, hiragana or katakana, ず for づ, じ for ぢ — and for ー, the
 * long vowel typed as a vowel, which is what "koohii" gives.
 */
export function crosswordCellMatches(answer: string, typed: string): boolean {
  if (!typed)
    return false
  if (answer === 'ー')
    return typed === 'ー' || /^[あいうえおアイウエオ]$/.test(typed)
  return fold(answer) === fold(typed)
}

/** Kana as the cell's script shows them: romaji arrives as hiragana. */
export function inCrosswordScript(kana: string, script: CrosswordScript): string {
  return script === 'katakana' ? toKatakana(kana) : kana
}

// ---------------------------------------------------------------------------
// Randomness
// ---------------------------------------------------------------------------

/** mulberry32: small, fast and seedable — `Math.random` is neither of the last two. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A seed from text — a date and a level, say — so a puzzle can be named by words. */
export function seedFrom(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

// ---------------------------------------------------------------------------
// The grid
// ---------------------------------------------------------------------------

interface Placed {
  candidate: CrosswordCandidate
  row: number
  col: number
  dir: CrosswordDirection
}

type Cells = Array<Array<string | null>>

const step = (dir: CrosswordDirection): [number, number] => dir === 'across' ? [0, 1] : [1, 0]

function cellsOf(p: { row: number, col: number, dir: CrosswordDirection }, length: number): Array<[number, number]> {
  const [dr, dc] = step(p.dir)
  return Array.from({ length }, (_, i) => [p.row + dr * i, p.col + dc * i] as [number, number])
}

/**
 * Whether a grid is a crossword: the runs of two or more filled cells, across
 * and down, are exactly the placed words — no more, no fewer. A run that is no
 * word (two words touching end to end, or side by side) cannot be answered,
 * and a word that is no longer a whole run (はな swallowed by a later はなす)
 * has a clue for letters that are not there.
 */
function valid(cells: Cells, placed: Placed[], size: number): boolean {
  const starts = new Set(placed.map(p => `${p.dir}:${p.row}:${p.col}:${p.candidate.cells.length}`))
  if (starts.size !== placed.length)
    return false
  let runs = 0
  for (const dir of ['across', 'down'] as const) {
    for (let line = 0; line < size; line++) {
      let run = 0
      for (let i = 0; i <= size; i++) {
        const [r, c] = dir === 'across' ? [line, i] : [i, line]
        const filled = i < size && cells[r]![c] !== null
        if (filled) {
          run++
          continue
        }
        if (run >= 2) {
          const [sr, sc] = dir === 'across' ? [line, i - run] : [i - run, line]
          if (!starts.has(`${dir}:${sr}:${sc}:${run}`))
            return false
          runs++
        }
        run = 0
      }
    }
  }
  return runs === placed.length
}

/** Put a word in, or say why not. Returns the new cells and how many it crosses. */
function tryPlace(cells: Cells, placed: Placed[], next: Placed, size: number): { cells: Cells, crossings: number } | null {
  const length = next.candidate.cells.length
  const positions = cellsOf(next, length)
  if (positions.some(([r, c]) => r < 0 || c < 0 || r >= size || c >= size))
    return null

  let crossings = 0
  for (const [i, [r, c]] of positions.entries()) {
    const there = cells[r]![c]
    if (there === null)
      continue
    if (there !== next.candidate.cells[i])
      return null
    crossings++
  }
  // Wholly on top of letters already there — a word inside another, not a new one.
  if (crossings === length)
    return null

  const out = cells.map(row => [...row])
  for (const [i, [r, c]] of positions.entries()) out[r]![c] = next.candidate.cells[i]!
  if (!valid(out, [...placed, next], size))
    return null
  return { cells: out, crossings }
}

/** How well a finished grid interlocks: crossings, unchecked cells, filled cells. */
function measure(cells: Cells, placed: Placed[]): { crossings: number, unchecked: number, filled: number } {
  const uses = new Map<string, number>()
  for (const p of placed) {
    for (const [r, c] of cellsOf(p, p.candidate.cells.length))
      uses.set(`${r}:${c}`, (uses.get(`${r}:${c}`) ?? 0) + 1)
  }
  let crossings = 0
  let unchecked = 0
  for (const n of uses.values()) {
    if (n > 1)
      crossings++
    else
      unchecked++
  }
  return { crossings, unchecked, filled: cells.flat().filter(c => c !== null).length }
}

/** One seeded attempt: grow the grid word by word until nothing more fits. */
function attempt(pool: CrosswordCandidate[], size: number, random: () => number, options: Required<Pick<CrosswordOptions, 'maxShortWords' | 'avoid' | 'prefer'>>): { cells: Cells, placed: Placed[] } | null {
  const order = shuffled(pool, random)
  const fitsFirst = (c: CrosswordCandidate) => c.cells.length >= 3 && c.cells.length <= size
  const first = order.find(c => fitsFirst(c) && options.prefer.has(c.id)) ?? order.find(fitsFirst) ?? order[0]
  if (!first || first.cells.length > size)
    return null

  const dir: CrosswordDirection = random() < 0.5 ? 'across' : 'down'
  const line = Math.floor(random() * size)
  const offset = Math.floor(random() * (size - first.cells.length + 1))
  const seed: Placed = { candidate: first, dir, row: dir === 'across' ? line : offset, col: dir === 'across' ? offset : line }
  let cells: Cells = Array.from({ length: size }, () => Array.from({ length: size }, () => null))
  const placed: Placed[] = []
  const firstFit = tryPlace(cells, placed, seed, size)
  if (!firstFit)
    return null
  cells = firstFit.cells
  placed.push(seed)

  // Which candidates carry which kana, so a crossing is a lookup, not a scan.
  const byKana = new Map<string, Array<{ candidate: CrosswordCandidate, index: number }>>()
  for (const candidate of order) {
    for (const [index, kana] of candidate.cells.entries()) {
      const list = byKana.get(kana) ?? []
      list.push({ candidate, index })
      byKana.set(kana, list)
    }
  }

  for (;;) {
    const usedIds = new Set(placed.map(p => p.candidate.id))
    const usedSpellings = new Set(placed.map(p => p.candidate.cells.join('')))
    const usedClues = new Set(placed.map(p => p.candidate.clue))
    const short = placed.filter(p => p.candidate.cells.length === 2).length

    let best: { next: Placed, cells: Cells, score: number } | null = null
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const kana = cells[r]![c]
        if (kana == null)
          continue
        for (const { candidate, index } of byKana.get(kana) ?? []) {
          if (usedIds.has(candidate.id) || usedSpellings.has(candidate.cells.join('')) || usedClues.has(candidate.clue))
            continue
          if (candidate.cells.length === 2 && short >= options.maxShortWords)
            continue
          for (const d of ['across', 'down'] as const) {
            const [dr, dc] = step(d)
            const next: Placed = { candidate, dir: d, row: r - dr * index, col: c - dc * index }
            const fit = tryPlace(cells, placed, next, size)
            if (!fit)
              continue
            const score = fit.crossings * 4
              + candidate.cells.length
              - (options.avoid.has(candidate.id) ? 3 : 0)
              + (options.prefer.has(candidate.id) ? 3 : 0)
              + random() * 2
            if (!best || score > best.score)
              best = { next, cells: fit.cells, score }
          }
        }
      }
    }
    if (!best)
      break
    cells = best.cells
    placed.push(best.next)
  }

  return { cells, placed }
}

/**
 * Number the entries in reading order, as a printed crossword does: a cell
 * that starts a word gets the next number, shared when it starts two.
 */
function numbered(placed: Placed[], size: number): CrosswordPlacement[] {
  const numbers = new Map<string, number>()
  let next = 1
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (placed.some(p => p.row === r && p.col === c))
        numbers.set(`${r}:${c}`, next++)
    }
  }
  return placed
    .map(p => ({ id: p.candidate.id, row: p.row, col: p.col, dir: p.dir, length: p.candidate.cells.length, number: numbers.get(`${p.row}:${p.col}`)! }))
    .sort((a, b) => a.number - b.number || (a.dir === 'across' ? -1 : 1))
}

/**
 * A word hidden in the solved grid: its kana, each from a different filled
 * cell, labelled A, B, C… in order. Longer words first; never one already in
 * the grid. Null when no candidate fits.
 */
export function pickBonus(
  cells: Cells,
  candidates: CrosswordCandidate[],
  exclude: Set<string>,
  random: () => number
): { id: string, cells: Array<[number, number]> } | null {
  const filled: Array<[number, number]> = []
  cells.forEach((row, r) => row.forEach((kana, c) => {
    if (kana !== null)
      filled.push([r, c])
  }))

  const ordered = shuffled(candidates, random)
    .filter(c => c.cells.length >= 3 && c.cells.length <= 5 && !exclude.has(c.id) && !exclude.has(c.cells.join('')))
    .sort((a, b) => b.cells.length - a.cells.length)

  for (const candidate of ordered) {
    const free = shuffled(filled, random)
    const chosen: Array<[number, number]> = []
    for (const kana of candidate.cells) {
      const at = free.findIndex(([r, c]) => cells[r]![c] === kana)
      if (at === -1)
        break
      chosen.push(free[at]!)
      free.splice(at, 1)
    }
    if (chosen.length === candidate.cells.length)
      return { id: candidate.id, cells: chosen }
  }
  return null
}

/**
 * Build a crossword.
 *
 * Every candidate must already be in the puzzle's one script: crossing cells
 * match exactly, so a katakana word can only ever cross another katakana word,
 * and a puzzle mixing scripts would leave its loanwords unconnected.
 *
 * Best of `attempts` seeded tries, ranked by how well the grid interlocks —
 * crossings minus letters that belong to one word only — then by how full it
 * is. Null when no attempt reaches `minWords`.
 */
export function generateCrossword(candidates: CrosswordCandidate[], options: CrosswordOptions): CrosswordGrid | null {
  const size = options.size ?? 5
  const random = seededRandom(options.seed)
  const pool = candidates.filter(c => c.cells.length >= 2 && c.cells.length <= size)
  const settings = {
    maxShortWords: options.maxShortWords ?? 2,
    avoid: options.avoid ?? new Set<string>(),
    prefer: options.prefer ?? new Set<string>()
  }

  let best: { cells: Cells, placed: Placed[], key: [number, number] } | null = null
  for (let i = 0; i < (options.attempts ?? 15); i++) {
    const result = attempt(pool, size, random, settings)
    if (!result || result.placed.length < (options.minWords ?? 4))
      continue
    const m = measure(result.cells, result.placed)
    const key: [number, number] = [m.crossings - m.unchecked, m.filled]
    if (!best || key[0] > best.key[0] || (key[0] === best.key[0] && key[1] > best.key[1]))
      best = { ...result, key }
  }
  if (!best)
    return null

  const exclude = new Set(best.placed.flatMap(p => [p.candidate.id, p.candidate.cells.join('')]))
  // Tiers in order — the puzzle's own word list first, then the level's — and
  // the first tier with a fit wins.
  let bonus: CrosswordGrid['bonus'] = null
  for (const tier of options.bonusCandidates ?? []) {
    bonus = pickBonus(best.cells, tier, exclude, random)
    if (bonus)
      break
  }

  return { size, cells: best.cells, placements: numbered(best.placed, size), bonus }
}
