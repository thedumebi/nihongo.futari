import type { CrosswordEntry, CrosswordPuzzle } from '@nihongo/shared/types'

import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useCrossword } from './use-crossword'

/**
 * がっこう across the top, うしろ down the right, sharing the う:
 *
 *   が つ こ う  (small kana are written full size in a grid)
 *   .  .  .  し
 *   .  .  .  ろ
 */
function entry(fields: Pick<CrosswordEntry, 'number' | 'direction' | 'row' | 'col' | 'answer' | 'clue'>): CrosswordEntry {
  return { ...fields, audio: null } as CrosswordEntry
}

const PUZZLE: CrosswordPuzzle = {
  puzzleKey: 'test-gakkou-ushiro',
  level: 'N5',
  source: 'daily',
  script: 'hiragana',
  size: 4,
  cells: [
    ['が', 'つ', 'こ', 'う'],
    [null, null, null, 'し'],
    [null, null, null, 'ろ'],
    [null, null, null, null]
  ],
  entries: [
    entry({ number: 1, direction: 'across', row: 0, col: 0, answer: ['が', 'つ', 'こ', 'う'], clue: 'school' }),
    entry({ number: 2, direction: 'down', row: 0, col: 3, answer: ['う', 'し', 'ろ'], clue: 'behind' })
  ],
  bonus: null,
  knownCount: null,
  note: null,
  completed: null
}

function play() {
  return useCrossword(ref<CrosswordPuzzle | null>(structuredClone(PUZZLE)))
}

const topRow = (game: ReturnType<typeof play>) => game.typed.value[0]!.join('')
const rightColumn = (game: ReturnType<typeof play>) => game.typed.value.map(row => row[3]).join('')

function typeKeys(game: ReturnType<typeof play>, keys: string) {
  for (const key of keys)
    game.type(key)
}

describe('crossword typing', () => {
  beforeEach(() => localStorage.clear())

  it('moves on to the next word once one is finished, so the next word is not typed into its last cell', () => {
    const game = play()
    typeKeys(game, 'gakkou')
    expect(topRow(game)).toBe('がつこう')
    expect(game.selected.value).toEqual({ row: 1, col: 3, dir: 'down' })
    typeKeys(game, 'shiro')
    expect(rightColumn(game)).toBe('うしろ')
  })

  it('keeps the kana when the keyboard turns the word into kanji', () => {
    const game = play()
    game.compositionStart()
    game.composition('が')
    game.composition('がっこう')
    game.composition('学校')
    expect(topRow(game)).toBe('がつこう')
    game.compositionEnd('学校')
    expect(topRow(game)).toBe('がつこう')
    expect(game.selected.value).toEqual({ row: 1, col: 3, dir: 'down' })
  })

  it('keeps the whole reading when a suggestion mixes kana and kanji', () => {
    const game = play()
    game.compositionStart()
    game.composition('がっ')
    game.compositionEnd('が子')
    expect(game.typed.value[0]!.slice(0, 2).join('')).toBe('がつ')
  })

  it('draws a word the keyboard carries on with though it never said it began', () => {
    const game = play()
    game.composition('がっ')
    expect(game.typed.value[0]!.slice(0, 2).join('')).toBe('がつ')
  })

  it('does not draw the rest of a word the learner tapped away from', () => {
    const game = play()
    game.compositionStart()
    game.composition('が')
    game.select(1, 3)
    game.composition('がっ')
    game.compositionEnd('がっ')
    expect(topRow(game)).toBe('が')
    expect(rightColumn(game)).toBe('')
  })

  it('reads romaji in a composition as kana', () => {
    const game = play()
    game.compositionStart()
    game.composition('ga')
    game.compositionEnd('ga')
    expect(game.typed.value[0]![0]).toBe('が')
  })

  it('ignores the space after a swiped word, and reads full-width letters as romaji', () => {
    const game = play()
    game.type('ga ')
    game.type('ｔｔ')
    expect(game.typed.value[0]!.slice(0, 2).join('')).toBe('がつ')
    expect(game.pending.value).toBe('t')
  })
})
