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
    const queue = await getQueue({ kind: config.kind, script: config.script, limit: 50 })
    items.value = queue.items
    index.value = 0
    reset()
  } catch {
    error.value = 'Could not load characters to practise.'
  } finally {
    loading.value = false
  }
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
  if (event.key === 'Enter') {
    grade.value ? next() : check()
  } else if (event.key === 'Backspace') {
    event.preventDefault()
    canvas.value?.undo()
  }
}

watch(deck, load)
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
        <Dropdown
          v-model="deck"
          :options="DECKS.map(d => ({ value: d.value, label: d.label }))"
          header="Deck"
          width-class="w-44"
        />
      </header>

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
          <div>
            <span class="text-4xl font-medium text-heading">{{ current.character }}</span>
            <span v-if="current.label" class="ml-3 text-muted">{{ current.label }}</span>
          </div>
          <div class="text-right text-sm text-muted">
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

          <div class="ml-auto flex gap-2">
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
          </div>
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
