<script setup lang="ts">
import type { CrosswordSource } from '@nihongo/shared/constants'
import type { CrosswordPuzzle } from '@nihongo/shared/types'

import { hasKanji } from '@nihongo/shared/lib'
import { useLocalStorage } from '@vueuse/core'
import { isAxiosError } from 'axios'
import { ChevronLeft, ChevronRight, Eye, Languages, RefreshCw, Type, Volume2 } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import { getCrossword, saveCrosswordResult } from '@/api/crossword'
import CrosswordFinish from '@/components/crossword/crossword-finish.vue'
import CrosswordGrid from '@/components/crossword/crossword-grid.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Segmented from '@/components/ui/segmented.vue'
import { useAnswerStreak } from '@/composables/use-answer-streak'
import { playAudio, prefetchAudio } from '@/composables/use-audio'
import { useCrossword } from '@/composables/use-crossword'
import { useLevel } from '@/composables/use-level'
import { useLanguageStore } from '@/store/language'

/**
 * A kana crossword.
 *
 * Every word is one the learner can meet again: the clue is its meaning, the
 * answer its reading, and the finish screen puts any of them into reviews.
 * The puzzle of the day is the same for everyone; a new puzzle comes from the
 * words the learner picks — ones they know, ones they have not met, both, or
 * loanwords in katakana.
 */

// ============ Stores ============
const { recordAnswer } = useAnswerStreak()
const lang = useLanguageStore()

// ============ Composables ============
const { level: studyLevel, loadLevel } = useLevel()

// ============ Reactive State ============
const puzzle = ref<CrosswordPuzzle | null>(null)
const loading = ref(true)
const errorMsg = ref('')
/** Set when "words I know" cannot be built yet: how many there are. */
const knownShort = ref<number | null>(null)
const level = ref<'N5' | 'N4'>('N5')
/** Which words. Kept on the device so a puzzle in progress resumes, but every visit starts on Today. */
const source = useLocalStorage<CrosswordSource>('go-crossword-source', 'daily')
/** Entries whose kanji has been shown, and whose word has been heard, as hints — each counted once. */
const kanjiShown = ref(new Set<string>())
const heard = ref(new Set<string>())
/** Said once, when today's puzzle was already done and a new one opened instead. */
const moved = ref('')
const best = ref<boolean | null>(null)
const input = ref<HTMLInputElement | null>(null)

const LEVELS = [
  { value: 'N5' as const, label: 'N5' },
  { value: 'N4' as const, label: 'N4' }
]
const SOURCES = [
  { value: 'daily' as const, label: 'Today', title: 'The puzzle of the day, the same for everyone' },
  { value: 'new' as const, label: 'New words', title: 'Words you have not met yet' },
  { value: 'known' as const, label: 'Words I know', title: 'Words you have learned in reviews' },
  { value: 'mix' as const, label: 'Mix', title: 'Words you know, topped up with new ones' },
  { value: 'loanwords' as const, label: 'Loanwords', title: 'A katakana puzzle' }
]
/** No word highlighted — the finished board shows none. */
const NOTHING = new Set<string>()
/** One character kept in the hidden input, so a backspace always has something to delete. */
const SENTINEL = ' '
/**
 * A Japanese keyboard is mid-word. The input must not be touched then: iOS
 * drops the word, and stops sending it, if the text under it is reset.
 */
let composing = false
/** When the last word was confirmed: Safari sends its Enter just after, which is not a request to move on. */
let composedAt = 0

const game = useCrossword(puzzle)
const { selected, current, currentCells, typed, revealed, pending, hints, seconds, solved, bonusLetters, wordsDone, checkAsYouGo } = game

/** True only for the first load after opening the page. */
let opening = true
/** Set while the page itself moves on from a finished daily, so the note survives that one change. */
let movingOn = false

// ============ Computed Properties ============
const clueLabel = computed(() => {
  const e = current.value
  if (!e)
    return ''
  return `${e.number}${e.direction === 'across' ? 'A' : 'D'}`
})

/**
 * Today's puzzle, done — by the server's record — but not on this device (another
 * phone, or storage the phone cleared). Say so rather than show an empty grid,
 * unless the learner chooses to play it again.
 */
const replaying = ref(false)
const doneElsewhere = computed(() => Boolean(puzzle.value?.source === 'daily' && puzzle.value.completed && !solved.value && !replaying.value))

const time = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`)

// ============ Watchers ============
// Each word filled in by hand counts as one answer right in a row. Words
// already done when the puzzle loads are not news, and nothing here is
// wrong unless the grid says so, so a crossword only adds to a run.
let credited: Set<number> | null = null
watch(puzzle, () => {
  credited = null
})
watch(game.wordsByHand, (now) => {
  if (credited === null) {
    credited = new Set(now)
    return
  }
  for (const i of now) {
    if (!credited.has(i)) {
      credited.add(i)
      recordAnswer(true)
    }
  }
})
watch(solved, async (done) => {
  const p = puzzle.value
  if (!done || !p)
    return
  game.flush()
  best.value = null
  try {
    const result = await saveCrosswordResult({
      puzzleKey: p.puzzleKey,
      level: p.level,
      source: p.source,
      seconds: seconds.value,
      hintsUsed: hints.value,
      wordIds: p.entries.map(e => e.wordId).filter((id): id is string => Boolean(id))
    }, lang.code)
    best.value = result.best
  } catch {
    // The puzzle is done either way; only the record of it is missing.
  }
})

// The hidden input's text is set by hand, never bound: a bound value is
// re-applied on every render (the timer renders once a second), which reset it
// under a word being typed on a Japanese keyboard and lost the word.
watch(input, (el) => {
  if (el)
    el.value = SENTINEL
})

watch([level, source], () => {
  // The note belongs to the one automatic move; any later change clears it.
  if (!movingOn)
    moved.value = ''
  movingOn = false
  void load()
})

// ============ Lifecycle Hooks ============
onMounted(async () => {
  await loadLevel()
  if (studyLevel.value === 'N4')
    level.value = 'N4'
  // Every visit starts on today's puzzle. The tab used to be remembered, and
  // finishing a daily moved it to Mix — so the next day the page opened on Mix
  // and today's puzzle went unseen. load() still moves on to a new puzzle when
  // today's is already done. Changing the tab triggers the load itself.
  if (source.value !== 'daily')
    source.value = 'daily'
  else
    void load()
})

// ============ Methods ============
const currentKey = () => `go-crossword-current:${lang.code}:${level.value}:${source.value}`

/**
 * Open a puzzle: today's is always fetched (it is the same one until the day
 * turns, and the saved progress follows it by key); any other kind resumes
 * the last one if it was left unfinished, unless a new one is asked for.
 */

async function load(fresh = false) {
  loading.value = true
  errorMsg.value = ''
  knownShort.value = null
  kanjiShown.value = new Set()
  heard.value = new Set()
  replaying.value = false
  best.value = null
  try {
    if (!fresh && source.value !== 'daily') {
      const saved = readCurrent()
      if (saved) {
        puzzle.value = saved
        void prefetchAudio([...saved.entries.map(e => e.audio), saved.bonus?.audio])
        return
      }
    }
    const next = await getCrossword({ languageCode: lang.code, level: level.value, source: source.value })
    // Opening the page on a puzzle already done: go to the next undone one
    // instead of showing it again. Choosing Today on purpose still shows it.
    if (opening && next.source === 'daily' && next.completed) {
      opening = false
      movingOn = true
      moved.value = 'You have done today\'s puzzle. Here is a new one, from words you know and new ones.'
      source.value = 'mix'
      return
    }
    puzzle.value = next
    void prefetchAudio([...next.entries.map(e => e.audio), next.bonus?.audio])
    try {
      localStorage.setItem(currentKey(), JSON.stringify(next))
    } catch {
      // Without storage it still plays; it just will not resume.
    }
  } catch (e) {
    puzzle.value = null
    if (isAxiosError(e) && e.response?.status === 422) {
      const data = e.response.data as { message?: string, knownCount?: number }
      errorMsg.value = data.message ?? 'Could not build a puzzle from these words.'
      knownShort.value = data.knownCount ?? null
    } else {
      errorMsg.value = 'Could not load a puzzle. Check your connection and try again.'
    }
  } finally {
    loading.value = false
    if (puzzle.value)
      opening = false
  }
}

/**
 * Another puzzle. Today's puzzle is one a day, so "another" from there means a
 * new one — the Mix tab — rather than fetching today's again.
 */
function another() {
  moved.value = ''
  if (source.value === 'daily')
    source.value = 'mix'
  else
    void load(true)
}

function readCurrent(): CrosswordPuzzle | null {
  try {
    const raw = localStorage.getItem(currentKey())
    if (!raw)
      return null
    const saved = JSON.parse(raw) as CrosswordPuzzle
    // A finished one is not resumed — the learner wants the next.
    const progress = localStorage.getItem(`go-crossword:${saved.puzzleKey}`)
    const typedCells = progress ? (JSON.parse(progress) as { typed: string[][] }).typed : []
    const done = saved.cells.every((row, r) => row.every((answer, c) => answer === null || Boolean(typedCells[r]?.[c])))
    return done ? null : saved
  } catch {
    return null
  }
}

/** Tap a cell: select it and bring up the keyboard. */
function pick(row: number, col: number) {
  game.select(row, col)
  focusInput()
}

function focusInput() {
  const el = input.value
  if (!el)
    return
  // Moving on mid-word: finish the word where it is (blurring ends it), so
  // the reset below cannot land under it.
  if (composing) {
    el.blur()
    composing = false
  }
  el.value = SENTINEL
  // Synchronously, inside the tap: iOS only raises the keyboard for a focus
  // made in a user gesture.
  el.focus({ preventScroll: true })
}

function onBeforeInput(e: InputEvent) {
  // Inside a word the keyboard owns its own text, backspace included.
  if (e.isComposing || composing)
    return
  if (e.inputType === 'insertText' && e.data) {
    e.preventDefault()
    game.type(e.data)
  } else if (e.inputType === 'deleteContentBackward') {
    e.preventDefault()
    game.backspace()
  }
  // Composition (a Japanese keyboard) cannot be cancelled; it lands on compositionend.
}

/** While a Japanese keyboard composes, draw what it has so far into the cells. */
function onInput(e: Event) {
  if ((e as InputEvent).isComposing && input.value)
    game.composition(input.value.value.replace(SENTINEL, ''))
}

function onCompositionStart() {
  composing = true
  game.compositionStart()
}

function onCompositionEnd(e: CompositionEvent) {
  composing = false
  composedAt = Date.now()
  game.compositionEnd(e.data ?? '')
  // After this event, and only if no new word has started in the meantime.
  setTimeout(() => {
    if (input.value && !composing)
      input.value.value = SENTINEL
  }, 0)
}

function onKeydown(e: KeyboardEvent) {
  // Keys inside a word belong to the keyboard (229 is "the keyboard is
  // composing"), and the Enter Safari sends right after confirming one is
  // the confirmation, not "next clue".
  if (e.isComposing || composing || e.keyCode === 229 || Date.now() - composedAt < 100)
    return
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    game.stepClue(e.shiftKey ? -1 : 1)
  }
}

const entryKey = (e: { number: number, direction: string }) => `${e.number}${e.direction}`

/** Hearing a word is a hint only once it is actually heard, and only once per word. */
async function hear() {
  const e = current.value
  if (!e?.audio)
    return
  const played = await playAudio(e.audio)
  if (played && !heard.value.has(entryKey(e))) {
    heard.value = new Set(heard.value).add(entryKey(e))
    game.countHint()
  }
}

function showKanji() {
  const e = current.value
  if (!e || kanjiShown.value.has(entryKey(e)))
    return
  kanjiShown.value = new Set(kanjiShown.value).add(entryKey(e))
  game.countHint()
}

const kanjiVisible = computed(() => Boolean(current.value && kanjiShown.value.has(entryKey(current.value))))
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        Crossword
      </h1>
      <p class="mt-1 text-[var(--color-muted)]">
        Read the meaning, fill in the word in kana. Type romaji or use a Japanese keyboard.
      </p>

      <div class="mt-6 flex flex-col gap-4">
        <Segmented v-model="level" label="Level" :options="LEVELS" />
        <Segmented v-model="source" label="Words" :options="SOURCES" />
      </div>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Making a puzzle…
      </p>

      <div v-else-if="errorMsg" class="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
        <p>{{ errorMsg }}</p>
        <p v-if="knownShort !== null" class="mt-2 text-sm text-[var(--color-muted)]">
          You know {{ knownShort }} {{ level }} word{{ knownShort === 1 ? '' : 's' }} that fit a puzzle so far.
        </p>
        <div class="mt-4 flex justify-center gap-3">
          <Button v-if="source === 'known'" variant="primary" @click="source = 'new'">
            Try new words
          </Button>
          <Button variant="ghost" @click="load(true)">
            Try again
          </Button>
        </div>
      </div>

      <template v-else-if="puzzle">
        <div class="mt-6 flex items-center justify-between text-sm text-[var(--color-muted)]">
          <span class="tabular-nums">{{ time }}</span>
          <span>{{ wordsDone.done }} of {{ wordsDone.total }} words</span>
          <button
            type="button"
            class="inline-flex items-center gap-1 underline-offset-4 hover:underline"
            @click="another"
          >
            <RefreshCw class="h-3.5 w-3.5" /> Another puzzle
          </button>
        </div>
        <p v-if="moved" class="mt-2 text-sm text-[var(--color-muted)]">
          {{ moved }}
        </p>
        <p v-if="puzzle.note" class="mt-2 text-sm text-[var(--color-muted)]">
          {{ puzzle.note }}
        </p>
        <p v-if="puzzle.source === 'loanwords' && source !== 'loanwords'" class="mt-2 text-sm text-[var(--color-muted)]">
          A loanword puzzle this time: answers in katakana.
        </p>

        <div v-if="doneElsewhere" class="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
          <p class="text-xl font-semibold">
            Today's puzzle is done
          </p>
          <p class="mt-2 text-[var(--color-muted)]">
            Your best time: {{ Math.floor(puzzle.completed!.bestSeconds / 60) }}:{{ String(puzzle.completed!.bestSeconds % 60).padStart(2, '0') }}. A new one comes tomorrow.
          </p>
          <div class="mt-5 flex justify-center gap-3">
            <Button variant="ghost" @click="replaying = true">
              Play it again
            </Button>
            <Button variant="primary" @click="another">
              Another puzzle
            </Button>
          </div>
        </div>

        <!-- Solved: the finished board stays, at rest, with the words under it. -->
        <template v-else-if="solved">
          <div class="mx-auto mt-6 max-w-md">
            <CrosswordGrid
              :puzzle="puzzle"
              :typed="typed"
              :selected="null"
              :current="NOTHING"
              :revealed="revealed"
              pending=""
              :is-wrong="game.isWrong"
            />
          </div>
          <CrosswordFinish
            class="mt-6"
            :entries="puzzle.entries"
            :bonus="puzzle.bonus"
            :seconds="seconds"
            :hints="hints"
            :best="best"
            @again="another"
          />
        </template>

        <template v-else>
          <!-- The clue for the word being answered, with ‹ › through the rest. -->
          <div class="mt-4 flex items-stretch gap-2">
            <Button variant="ghost" round aria-label="Previous clue" @click="game.stepClue(-1); focusInput()">
              <ChevronLeft class="h-5 w-5" />
            </Button>
            <button
              type="button"
              class="min-h-[3.5rem] flex-1 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-left text-[var(--color-bg)]"
              @click="focusInput"
            >
              <span class="font-semibold">{{ clueLabel }}</span>
              <span class="ml-2">{{ current?.clue }}</span>
              <span class="ml-1 opacity-70">({{ current?.answer.length }})</span>
              <span v-if="kanjiVisible && current && hasKanji(current.form)" class="ml-2" style="font-family: var(--font-jp)">· {{ current.form }}</span>
            </button>
            <Button variant="ghost" round aria-label="Next clue" @click="game.stepClue(1); focusInput()">
              <ChevronRight class="h-5 w-5" />
            </Button>
          </div>

          <div class="mx-auto mt-4 max-w-md">
            <CrosswordGrid
              :puzzle="puzzle"
              :typed="typed"
              :selected="selected"
              :current="currentCells"
              :revealed="revealed"
              :pending="pending"
              :is-wrong="game.isWrong"
              @pick="pick"
            />
          </div>

          <!-- Off screen but focusable: it is what raises the phone keyboard. -->
          <input
            ref="input"
            class="pointer-events-none fixed -left-[9999px] top-0 h-px w-px opacity-0"
            type="text"
            inputmode="text"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            aria-label="Type the answer"
            @beforeinput="onBeforeInput"
            @compositionstart="onCompositionStart"
            @input="onInput"
            @compositionend="onCompositionEnd"
            @keydown="onKeydown"
          >

          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="ghost" @click="game.revealCell(); focusInput()">
              <Type class="h-4 w-4" /> Reveal letter
            </Button>
            <Button variant="ghost" @click="game.revealWord(); focusInput()">
              <Eye class="h-4 w-4" /> Reveal word
            </Button>
            <Button v-if="current?.audio" variant="ghost" @click="hear">
              <Volume2 class="h-4 w-4" /> Hear it
            </Button>
            <Button v-if="current && hasKanji(current.form)" variant="ghost" :disabled="kanjiVisible" @click="showKanji(); focusInput()">
              <Languages class="h-4 w-4" /> Kanji
            </Button>
          </div>
          <p class="mt-2 text-center text-xs text-[var(--color-muted)]">
            {{ hints === 0 ? 'No hints used' : `${hints} hint${hints === 1 ? '' : 's'} used` }}
            ·
            <label class="inline-flex items-center gap-1">
              <input v-model="checkAsYouGo" type="checkbox"> Mark mistakes as I type
            </label>
          </p>

          <!-- The bonus word: its letters fill in from the grid as it is solved. -->
          <div v-if="puzzle.bonus" class="mt-6 rounded-xl border border-[var(--color-border)] p-4">
            <p class="text-sm font-semibold">
              Bonus word
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]">
              The lettered cells spell a hidden word. Its meaning: {{ puzzle.bonus.clue }} ({{ puzzle.bonus.answer.length }})
            </p>
            <div class="mt-3 flex gap-2">
              <div
                v-for="(letter, i) in bonusLetters"
                :key="i"
                class="relative flex h-10 w-10 items-center justify-center rounded border border-[var(--color-border)] text-xl"
                style="font-family: var(--font-jp)"
              >
                <span class="absolute bottom-0.5 right-1 text-[0.6rem] font-semibold text-[var(--color-accent)]" style="font-family: inherit">{{ String.fromCharCode(65 + i) }}</span>
                {{ letter }}
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </AppShell>
</template>
