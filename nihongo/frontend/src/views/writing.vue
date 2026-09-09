<script setup lang="ts">
import type { HandwritingGrade, Stroke, WritingCharacter } from '@nihongo/shared/types'

import { gradeHandwriting, samplePath } from '@nihongo/shared/lib'
import { Check, ChevronRight, Eraser, Eye, Lightbulb, RotateCcw, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { getQueue } from '@/api/writing'
import AppShell from '@/components/layout/app-shell.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import WritingCanvas from '@/components/writing/writing-canvas.vue'

/**
 * Handwriting practice.
 *
 * Grading runs entirely in the browser against KanjiVG reference strokes — the
 * same pure functions the unit tests use — so a review works offline and gives
 * feedback with no round trip.
 */

const DECKS = [
  { value: 'hiragana', label: 'Hiragana', kind: 'kana' as const, script: 'hiragana' as const },
  { value: 'katakana', label: 'Katakana', kind: 'kana' as const, script: 'katakana' as const },
  { value: 'kanji', label: 'Kanji', kind: 'kanji' as const, script: undefined }
]

const deck = ref('hiragana')
/**
 * The lines chosen, as `${variant}:${row}` keys — 'base:k', 'dakuten:g'.
 *
 * A set rather than one value, because the useful session is "a, k and s, then
 * shuffle through them" and a single-choice dropdown could not say that. Empty
 * means every line, which is also what it starts as.
 */
const chosen = ref<string[]>([])
/** Kanji only. Empty is every level; otherwise the codes chosen. */
const levels = ref<string[]>([])
/** Off by default: stroke order is taught in order, so that is how it starts. */
const shuffle = ref(false)

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']
const all = ref<WritingCharacter[]>([])
const items = ref<WritingCharacter[]>([])
const index = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

const drawn = ref<Stroke[]>([])
const grade = ref<HandwritingGrade | null>(null)
const showGuide = ref(true)
const revealStrokes = ref(0)
const canvas = ref<InstanceType<typeof WritingCanvas> | null>(null)

const current = computed(() => items.value[index.value] ?? null)
const referenceStrokes = computed(() => current.value?.strokes.map(s => samplePath(s.path)) ?? [])

const attempted = ref(0)
const passedCount = ref(0)

async function load() {
  loading.value = true
  error.value = null
  try {
    const config = DECKS.find(d => d.value === deck.value)!
    // Everything for the deck in one request, so switching line is instant and
    // does not cost a round trip.
    const queue = await getQueue({
      kind: config.kind,
      script: config.script,
      levelCode: config.kind === 'kanji' && levels.value.length > 0
        ? levels.value.join(',')
        : undefined,
      // Enough to hold every level at once: N5 through N1 with stroke data is
      // 1,832 characters, and a deck that quietly stopped at 200 would be
      // wrong in a way nothing on screen would show.
      limit: 2000
    })
    all.value = queue.items
    applyLine()
  } catch {
    error.value = 'Could not load characters to practise.'
  } finally {
    loading.value = false
  }
}

/**
 * The lines a learner would name: あ行, か行, が行.
 *
 * Built from what actually loaded rather than from a fixed table, so a deck
 * with no dakuten simply offers none. Kanji have no rows and get no picker.
 */
const lines = computed(() => {
  const seen = new Map<string, { value: string, label: string, glyphs: string }>()
  for (const c of all.value) {
    if (c.variant === null)
      continue
    const key = `${c.variant}:${c.row ?? ''}`
    if (!seen.has(key)) {
      // Named in romaji, not in kana. か行 asks a beginner to read both the
      // kana they came here to learn and the kanji 行 — which is the one thing
      // this page can safely assume they cannot do. The first character's
      // romaji says it plainly: "ka — かきくけこ".
      const members = all.value.filter(m => `${m.variant}:${m.row ?? ''}` === key)
      const romaji = members[0]?.label ?? ''
      seen.set(key, {
        value: key,
        label: c.row ? romaji : 'a i u e o',
        glyphs: members.map(m => m.character).join('')
      })
    }
  }
  return [...seen.values()]
})

/**
 * Fisher-Yates, on a copy.
 *
 * Not seeded and not stable: re-ticking the toggle deals a fresh order, which
 * is the point of asking for one.
 */
function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function applyLine() {
  const picked = chosen.value.length === 0
    ? all.value
    : all.value.filter(c => chosen.value.includes(`${c.variant}:${c.row ?? ''}`))
  items.value = shuffle.value ? shuffled(picked) : picked
  index.value = 0
  reset()
}

function toggleLine(value: string): void {
  chosen.value = chosen.value.includes(value)
    ? chosen.value.filter(v => v !== value)
    : [...chosen.value, value]
}

function toggleLevel(value: string): void {
  levels.value = levels.value.includes(value)
    ? levels.value.filter(v => v !== value)
    : [...levels.value, value]
}

function reset() {
  drawn.value = []
  grade.value = null
  revealStrokes.value = 0
  canvas.value?.clear()
}

function onStrokes(strokes: Stroke[]) {
  drawn.value = strokes
  // Clear a previous verdict as soon as the drawing changes, so the feedback on
  // screen always describes what is currently drawn.
  grade.value = null
}

function check() {
  if (!current.value || drawn.value.length === 0)
    return
  grade.value = gradeHandwriting(drawn.value, referenceStrokes.value)
  attempted.value++
  if (grade.value.passed)
    passedCount.value++
}

function next() {
  if (items.value.length === 0)
    return
  index.value = (index.value + 1) % items.value.length
  reset()
}

/**
 * Back a character.
 *
 * "If I want to write something I have done" — the drill only ever went
 * forwards, so a character you wanted another go at was gone until you had
 * cycled the whole deck. Wraps the same way `next` does.
 */
function prev() {
  if (items.value.length === 0)
    return
  index.value = (index.value - 1 + items.value.length) % items.value.length
  reset()
}

function hint() {
  revealStrokes.value = Math.min(revealStrokes.value + 1, current.value?.strokeCount ?? 0)
}

const ISSUE_TEXT: Record<string, string> = {
  'too-few-strokes': 'Missing a stroke',
  'too-many-strokes': 'One stroke too many',
  'stroke-order': 'Written out of order',
  'stroke-direction': 'A stroke went the wrong way',
  'stroke-shape': 'A stroke is off shape'
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    prev()
  } else if (event.key === 'ArrowRight') {
    next()
  } else if (event.key === 'Enter') {
    grade.value ? next() : check()
  } else if (event.key === 'Backspace') {
    event.preventDefault()
    canvas.value?.undo()
  }
}

watch(deck, () => {
  chosen.value = []
  levels.value = []
  void load()
})
watch(chosen, applyLine, { deep: true })
watch(shuffle, applyLine)
watch(levels, () => {
  if (deck.value === 'kanji')
    void load()
}, { deep: true })
onMounted(() => {
  load()
  window.addEventListener('keydown', onKey)
})
// Without this the shortcut keeps firing on every other page after navigating
// away, because the listener is on `window`, not the view.
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8">
      <header class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-heading">
            Writing
          </h1>
          <p class="text-sm text-muted">
            Trace it, then write it from memory.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Dropdown
            v-model="deck"
            :options="DECKS.map(d => ({ value: d.value, label: d.label }))"
            header="Deck"
            width-class="w-44"
          />
          <label class="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-sm text-muted">
            <input v-model="shuffle" type="checkbox" class="accent-[var(--color-primary)]">
            Shuffle
          </label>
        </div>
      </header>

      <!-- Levels, chosen the same way the lines are: several at once. -->
      <div v-if="deck === 'kanji'" class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm transition"
          :class="levels.length === 0
            ? 'border-[var(--color-text)] font-medium'
            : 'border-[var(--color-border)] text-muted hover:border-[var(--color-text)]'"
          @click="levels = []"
        >
          All
        </button>
        <button
          v-for="l in LEVELS"
          :key="l"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm transition"
          :class="levels.includes(l)
            ? 'border-[var(--color-text)] font-medium'
            : 'border-[var(--color-border)] text-muted hover:border-[var(--color-text)]'"
          @click="toggleLevel(l)"
        >
          {{ l }}
        </button>
      </div>

      <!-- One chip per line of the syllabary. Named in romaji with the kana
           underneath, so the label is readable before the kana are. -->
      <div v-if="lines.length > 1" class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm transition"
          :class="chosen.length === 0
            ? 'border-[var(--color-text)] font-medium'
            : 'border-[var(--color-border)] text-muted hover:border-[var(--color-text)]'"
          @click="chosen = []"
        >
          All
        </button>
        <button
          v-for="l in lines"
          :key="l.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-left text-sm transition"
          :class="chosen.includes(l.value)
            ? 'border-[var(--color-text)] font-medium'
            : 'border-[var(--color-border)] text-muted hover:border-[var(--color-text)]'"
          @click="toggleLine(l.value)"
        >
          {{ l.label }}
          <span class="ml-1.5 opacity-60" style="font-family: var(--font-jp)">{{ l.glyphs }}</span>
        </button>
      </div>

      <p v-if="loading" class="py-16 text-center text-muted">
        Loading…
      </p>
      <p v-else-if="error" class="py-16 text-center text-danger">
        {{ error }}
      </p>
      <p v-else-if="!current" class="py-16 text-center text-muted">
        Nothing to practise in this deck yet.
      </p>

      <div v-else class="space-y-4">
        <div class="flex items-baseline justify-between">
          <div class="min-w-0">
            <span class="text-4xl font-medium text-heading">{{ current.character }}</span>
            <span v-if="current.label && current.kind === 'kana'" class="ml-3 text-muted">{{ current.label }}</span>
            <p v-if="current.label && current.kind === 'kanji'" class="mt-1 text-base text-[var(--color-text)]">
              {{ current.label }}
            </p>
          </div>
          <div class="shrink-0 text-right text-sm text-muted">
            <div>{{ current.strokeCount }} strokes</div>
            <div>{{ index + 1 }} / {{ items.length }}</div>
          </div>
        </div>

        <p v-if="current.readings.length" class="text-sm text-muted">
          {{ current.readings.join('・') }}
        </p>

        <WritingCanvas
          ref="canvas"
          :reference="current.strokes"
          :show-guide="showGuide"
          :reveal-strokes="revealStrokes"
          @update:strokes="onStrokes"
        />

        <div class="flex flex-wrap items-center gap-2">
          <Tooltip content="Show or hide the reference glyph">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-text hover:bg-washi"
              :class="showGuide ? 'bg-washi' : ''"
              @click="showGuide = !showGuide"
            >
              <Eye class="size-4" /> Guide
            </button>
          </Tooltip>
          <Tooltip content="Reveal one more stroke">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-text hover:bg-washi"
              @click="hint"
            >
              <Lightbulb class="size-4" /> Hint
            </button>
          </Tooltip>
          <Tooltip content="Undo the last stroke (Backspace)">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-text hover:bg-washi"
              @click="canvas?.undo()"
            >
              <RotateCcw class="size-4" /> Undo
            </button>
          </Tooltip>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-text hover:bg-washi"
            @click="reset"
          >
            <Eraser class="size-4" /> Clear
          </button>
        </div>

        <!-- Back, then whichever of Check and Next applies, then Skip. Never
             both: before a verdict the middle slot asks for one, after it the
             same slot moves on. The position count lives at the top of the card
             and does not need repeating here.
             -
             A SIBLING of the tool row above, not a child of it: inside that
             wrapping flex container this was just another item, so centring it
             only centred its own contents inside whatever width it had landed
             in. On a phone the three spread to the full width; from `sm` up
             they sit together in the middle. -->
        <div class="flex w-full items-center justify-between gap-3 sm:justify-center">
          <button
            type="button"
            class="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-40"
            :disabled="items.length < 2"
            @click="prev"
          >
            &larr; Back
          </button>
          <button
            v-if="!grade"
            type="button"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-bg disabled:opacity-40"
            :disabled="drawn.length === 0"
            @click="check"
          >
            Check
          </button>
          <button
            v-else
            type="button"
            class="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-bg"
            @click="next"
          >
            Next <ChevronRight class="size-4" />
          </button>
          <button
            type="button"
            class="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-40"
            :disabled="items.length < 2"
            @click="next"
          >
            Skip &rarr;
          </button>
        </div>

        <div
          v-if="grade"
          class="rounded-xl border p-4"
          :class="grade.passed ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5'"
        >
          <div class="flex items-center gap-2">
            <Check v-if="grade.passed" class="size-5 text-success" />
            <X v-else class="size-5 text-danger" />
            <span class="font-medium text-heading">{{ Math.round(grade.score) }}</span>
            <span class="text-sm text-muted">
              {{ grade.strokeCountDrawn }} of {{ grade.strokeCountExpected }} strokes
            </span>
          </div>

          <ul v-if="grade.issues.length" class="mt-2 space-y-1 text-sm text-muted">
            <li v-for="issue in grade.issues" :key="issue">
              {{ ISSUE_TEXT[issue] ?? issue }}
            </li>
          </ul>

          <!-- Per-stroke detail: which stroke number went wrong is the part that
               tells you what to do differently next time. -->
          <ol class="mt-3 flex flex-wrap gap-1.5">
            <li
              v-for="stroke in grade.strokes"
              :key="stroke.referenceIndex"
              class="rounded-md px-2 py-1 text-xs"
              :class="stroke.attemptIndex === null
                ? 'bg-danger/15 text-danger'
                : stroke.score >= 70 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'"
              :title="stroke.attemptIndex === null
                ? 'Not drawn'
                : `${Math.round(stroke.score)}${stroke.reversed ? ' · backwards' : ''}${stroke.outOfOrder ? ' · out of order' : ''}`"
            >
              {{ stroke.referenceIndex + 1 }}
            </li>
          </ol>
        </div>

        <p v-if="attempted > 0" class="text-center text-sm text-muted">
          {{ passedCount }} of {{ attempted }} correct this session
        </p>
      </div>
    </div>
  </AppShell>
</template>
