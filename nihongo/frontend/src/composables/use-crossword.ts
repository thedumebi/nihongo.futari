import type { CrosswordDirection } from '@nihongo/shared/constants'
import type { CrosswordEntry, CrosswordPuzzle } from '@nihongo/shared/types'
import type { Ref } from 'vue'

import { consumeRomaji, crosswordCellMatches, crosswordCells, inCrosswordScript } from '@nihongo/shared/lib'
import { useDocumentVisibility, useIntervalFn, useLocalStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

/**
 * Playing a crossword: what has been typed, where the cursor is, the timer
 * and the hints.
 *
 * Kept apart from the view so the grid, the clue bar and the finish screen
 * all read one state. Progress is saved per puzzle on the device, keyed by
 * the puzzle's own key, so leaving and coming back finds the grid as it was —
 * the key names the grid itself, so it cannot be applied to a different one.
 */

interface Saved {
  typed: string[][]
  revealed: string[]
  hints: number
  seconds: number
}

const key = (r: number, c: number) => `${r}:${c}`

export function useCrossword(puzzle: Ref<CrosswordPuzzle | null>) {
  // ============ Reactive State ============
  const typed = ref<string[][]>([])
  /** Cells a hint filled in; they cannot be typed over. */
  const revealed = ref(new Set<string>())
  const hints = ref(0)
  const seconds = ref(0)
  const selected = ref<{ row: number, col: number, dir: CrosswordDirection } | null>(null)
  /** Romaji typed but not yet a whole kana — shown in the cell as it is typed. */
  const pending = ref('')
  /** Mark wrong kana as they are typed. A per-device preference. */
  const checkAsYouGo = useLocalStorage('go-crossword-check', true)

  // ============ Computed Properties ============
  function entryAt(row: number, col: number, dir: CrosswordDirection): CrosswordEntry | undefined {
    return puzzle.value?.entries.find(e => e.direction === dir && (dir === 'across'
      ? e.row === row && col >= e.col && col < e.col + e.answer.length
      : e.col === col && row >= e.row && row < e.row + e.answer.length))
  }

  function cellsOf(entry: CrosswordEntry): Array<[number, number]> {
    return entry.answer.map((_, i) => entry.direction === 'across' ? [entry.row, entry.col + i] : [entry.row + i, entry.col])
  }

  const current = computed(() => {
    const s = selected.value
    if (!s)
      return undefined
    return entryAt(s.row, s.col, s.dir) ?? entryAt(s.row, s.col, s.dir === 'across' ? 'down' : 'across')
  })

  const currentCells = computed(() => new Set(current.value ? cellsOf(current.value).map(([r, c]) => key(r, c)) : []))

  const answerAt = (r: number, c: number) => puzzle.value?.cells[r]?.[c] ?? null

  function isWrong(r: number, c: number): boolean {
    const answer = answerAt(r, c)
    const value = typed.value[r]?.[c] ?? ''
    return checkAsYouGo.value && answer !== null && value !== '' && !crosswordCellMatches(answer, value)
  }

  const solved = computed(() => {
    const p = puzzle.value
    if (!p || typed.value.length === 0)
      return false
    return p.cells.every((row, r) => row.every((answer, c) => answer === null || crosswordCellMatches(answer, typed.value[r]?.[c] ?? '')))
  })

  /** The bonus word's kana as far as the grid has been filled. */
  const bonusLetters = computed(() => (puzzle.value?.bonus?.cells ?? []).map(([r, c]) => typed.value[r]?.[c] ?? ''))

  /** "1 of 7" — how much of the grid is right, for the progress line. */
  const filledRight = computed(() => {
    const p = puzzle.value
    if (!p)
      return { right: 0, total: 0 }
    let right = 0
    let total = 0
    p.cells.forEach((row, r) => row.forEach((answer, c) => {
      if (answer === null)
        return
      total++
      if (crosswordCellMatches(answer, typed.value[r]?.[c] ?? ''))
        right++
    }))
    return { right, total }
  })

  // ============ Timer ============
  const visibility = useDocumentVisibility()
  useIntervalFn(() => {
    // Paused while the app is in the background — time away is not time spent.
    if (puzzle.value && !solved.value && visibility.value === 'visible')
      seconds.value++
  }, 1000)

  // ============ Saving progress ============
  const storageKey = (p: CrosswordPuzzle) => `go-crossword:${p.puzzleKey}`

  function load(p: CrosswordPuzzle) {
    const blank = Array.from({ length: p.size }, () => Array.from({ length: p.size }, () => ''))
    let saved: Saved | null = null
    try {
      const raw = localStorage.getItem(storageKey(p))
      saved = raw ? JSON.parse(raw) as Saved : null
    } catch {
      saved = null
    }
    typed.value = saved?.typed?.length === p.size ? saved.typed : blank
    revealed.value = new Set(saved?.revealed ?? [])
    hints.value = saved?.hints ?? 0
    seconds.value = saved?.seconds ?? 0
    pending.value = ''
    const first = p.entries[0]
    selected.value = first ? { row: first.row, col: first.col, dir: first.direction } : null
  }

  function save() {
    const p = puzzle.value
    if (!p)
      return
    try {
      localStorage.setItem(storageKey(p), JSON.stringify({ typed: typed.value, revealed: [...revealed.value], hints: hints.value, seconds: seconds.value } satisfies Saved))
    } catch {
      // Private mode or a full disk: the puzzle still plays, it just will not resume.
    }
  }

  watch(puzzle, (p) => {
    if (p)
      load(p)
  }, { immediate: true })
  watch([typed, hints, seconds], save, { deep: true })

  // ============ Moving ============
  function select(row: number, col: number) {
    if (answerAt(row, col) === null)
      return
    flush()
    const s = selected.value
    const across = entryAt(row, col, 'across')
    const down = entryAt(row, col, 'down')
    // Tapping the selected cell again switches direction, where there is one to switch to.
    if (s && s.row === row && s.col === col && across && down) {
      selected.value = { row, col, dir: s.dir === 'across' ? 'down' : 'across' }
      return
    }
    const keep = s?.dir === 'down' ? (down ? 'down' : 'across') : (across ? 'across' : 'down')
    selected.value = { row, col, dir: keep }
  }

  /** Go to a clue: its first empty cell, or its first cell if it is full. */
  function selectEntry(entry: CrosswordEntry) {
    flush()
    const cells = cellsOf(entry)
    const [row, col] = cells.find(([r, c]) => !typed.value[r]?.[c]) ?? cells[0]!
    selected.value = { row, col, dir: entry.direction }
  }

  function stepClue(by: number) {
    const entries = puzzle.value?.entries ?? []
    if (entries.length === 0)
      return
    const at = current.value ? entries.indexOf(current.value) : -1
    selectEntry(entries[(at + by + entries.length) % entries.length]!)
  }

  /** The next (or previous) cell along the current word, if there is one. */
  function neighbour(by: 1 | -1): [number, number] | null {
    const entry = current.value
    const s = selected.value
    if (!entry || !s)
      return null
    const cells = cellsOf(entry)
    const at = cells.findIndex(([r, c]) => r === s.row && c === s.col)
    return cells[at + by] ?? null
  }

  function moveTo(cell: [number, number] | null) {
    if (cell && selected.value)
      selected.value = { ...selected.value, row: cell[0], col: cell[1], dir: current.value?.direction ?? selected.value.dir }
  }

  // ============ Typing ============
  function setCell(r: number, c: number, value: string) {
    const next = typed.value.map(row => [...row])
    next[r]![c] = value
    typed.value = next
  }

  /** Put kana in, one per cell, along the current word. */
  function write(kana: string) {
    const p = puzzle.value
    const s = selected.value
    if (!p || !s)
      return
    for (const raw of crosswordCells(kana)) {
      const here = selected.value!
      if (!revealed.value.has(key(here.row, here.col)))
        setCell(here.row, here.col, inCrosswordScript(raw, p.script))
      const next = neighbour(1)
      if (!next)
        break
      moveTo(next)
    }
  }

  /** A key pressed or a character typed: kana go straight in, romaji waits for a whole syllable. */
  function type(text: string) {
    if (solved.value)
      return
    if (/^[a-z'-]+$/i.test(text)) {
      const { kana, rest } = consumeRomaji(pending.value + text)
      pending.value = rest
      if (kana)
        write(kana)
      return
    }
    flush()
    write(text)
  }

  /** A waiting `n` becomes ん when the word or the cell changes. */
  function flush() {
    if (!pending.value)
      return
    const { kana } = consumeRomaji(pending.value, { final: true })
    pending.value = ''
    if (kana)
      write(kana)
  }

  function backspace() {
    if (pending.value) {
      pending.value = pending.value.slice(0, -1)
      return
    }
    const s = selected.value
    if (!s)
      return
    if (typed.value[s.row]?.[s.col] && !revealed.value.has(key(s.row, s.col))) {
      setCell(s.row, s.col, '')
      return
    }
    const back = neighbour(-1)
    if (back) {
      moveTo(back)
      if (!revealed.value.has(key(back[0], back[1])))
        setCell(back[0], back[1], '')
    }
  }

  // ============ Hints ============
  function reveal(cells: Array<[number, number]>) {
    let used = false
    for (const [r, c] of cells) {
      const answer = answerAt(r, c)
      if (answer === null || crosswordCellMatches(answer, typed.value[r]?.[c] ?? ''))
        continue
      setCell(r, c, answer)
      revealed.value = new Set(revealed.value).add(key(r, c))
      used = true
    }
    if (used)
      hints.value++
  }

  function revealCell() {
    const s = selected.value
    if (s)
      reveal([[s.row, s.col]])
  }

  function revealWord() {
    if (current.value)
      reveal(cellsOf(current.value))
  }

  /** A hint that shows nothing on the grid — hearing the word, seeing its kanji. */
  function countHint() {
    hints.value++
  }

  return {
    typed,
    revealed,
    hints,
    seconds,
    selected,
    pending,
    checkAsYouGo,
    current,
    currentCells,
    solved,
    bonusLetters,
    filledRight,
    isWrong,
    select,
    selectEntry,
    stepClue,
    type,
    flush,
    backspace,
    revealCell,
    revealWord,
    countHint
  }
}
