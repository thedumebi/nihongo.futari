<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { SpeakStepView, WordGloss } from '@nihongo/shared/types'

import { thinkingTimeMs } from '@nihongo/shared/lib'
import { Check, Pause, Play, RotateCcw, Volume2, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import TokenLine from '@/components/ja/token-line.vue'
import WordMeaning from '@/components/ja/word-meaning.vue'
import TeacherLine from '@/components/speak/teacher-line.vue'
import Button from '@/components/ui/button.vue'
import { playAudio, playAudioQueue, prefetchAudio, stopAudio } from '@/composables/use-audio'

/**
 * A session, one step at a time, on screen.
 *
 * Each prompt runs: the teacher asks (spoken), a thinking pause sized to the
 * answer, then the answer — written and spoken — and the learner says honestly
 * whether they got it. Anything they did not comes back once at the end, the
 * way the method keeps bringing pieces round again.
 */
interface Props {
  steps: SpeakStepView[]
  mode: FuriganaMode
  knownKanji?: Set<string>
  /** Thinking-time multiplier. A change applies to the pause already running. */
  thinkScale: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  finished: [result: { gotIt: number, total: number }]
}>()

type Phase = 'explain' | 'asking' | 'thinking' | 'answer' | 'done'

// ============ Reactive State ============
/** Positions into `steps`, in the order they will be met; misses are appended. */
const order = ref<number[]>(props.steps.map((_, i) => i))
const position = ref(0)
const phase = ref<Phase>('explain')
/** First-try result per prompt index. */
const firstTry = ref(new Map<number, boolean>())
const retried = ref(new Set<number>())
/** When the current thinking pause began, and how far through it is (0–1) for the ring. */
const thinkStarted = ref(0)
const thinkDone = ref(0)
/** Holding the thinking pause: no reveal until resumed, however long that takes. */
const held = ref(false)
let heldAt = 0
const word = ref<WordGloss | null>(null)
const picked = ref<number | null>(null)

let run = 0
let timer: ReturnType<typeof setTimeout> | null = null
let frame = 0

// ============ Computed Properties ============
const step = computed(() => props.steps[order.value[position.value] ?? -1] ?? null)
const isRetry = computed(() => step.value !== null && position.value >= props.steps.length)
const prompts = computed(() => props.steps.filter(s => s.kind === 'prompt').length)
const progress = computed(() => Math.min(1, position.value / order.value.length))
/** The whole pause for this answer at the CURRENT setting — not the one it started with. */
const thinkMs = computed(() => thinkingTimeMs(step.value?.reading ?? '', props.thinkScale))

// ============ Watchers ============
// Changing the time to answer mid-pause moves the reveal: what has already
// elapsed counts, and the rest is whatever the new length leaves.
watch(() => props.thinkScale, () => {
  if (phase.value !== 'thinking')
    return
  if (held.value)
    thinkDone.value = Math.min(1, (heldAt - thinkStarted.value) / thinkMs.value)
  else
    schedule(run)
})

watch(() => props.steps, () => {
  order.value = props.steps.map((_, i) => i)
  position.value = 0
  firstTry.value = new Map()
  retried.value = new Set()
  void prefetchAudio(props.steps.flatMap(s => [...s.say.map(x => x.audio), s.answerAudio]))
  void enter()
}, { immediate: true })

// ============ Lifecycle Hooks ============
onBeforeUnmount(() => {
  run++
  clearTimer()
  stopAudio()
})

// ============ Methods ============
function clearTimer() {
  if (timer)
    clearTimeout(timer)
  timer = null
  cancelAnimationFrame(frame)
}

/** (Re)arm the reveal for the time left at the current setting, and keep the ring moving. */
function schedule(current: number) {
  clearTimer()
  const tick = () => {
    thinkDone.value = Math.min(1, (performance.now() - thinkStarted.value) / thinkMs.value)
    if (thinkDone.value < 1)
      frame = requestAnimationFrame(tick)
  }
  tick()
  timer = setTimeout(() => {
    if (current === run)
      reveal()
  }, Math.max(0, thinkStarted.value + thinkMs.value - performance.now()))
}

async function enter() {
  const current = ++run
  clearTimer()
  word.value = null
  picked.value = null
  held.value = false
  const s = step.value
  if (!s) {
    phase.value = 'done'
    const answered = [...firstTry.value.values()]
    emit('finished', { gotIt: answered.filter(Boolean).length, total: answered.length })
    return
  }
  if (s.kind === 'explain') {
    phase.value = 'explain'
    await playAudioQueue(s.say.map(x => x.audio))
    return
  }
  phase.value = 'asking'
  await playAudioQueue(s.say.map(x => x.audio))
  if (current !== run)
    return
  phase.value = 'thinking'
  thinkStarted.value = performance.now()
  schedule(current)
}

/** Stop the thinking clock where it is, or start it again from there. */
function toggleHold() {
  if (phase.value !== 'thinking')
    return
  if (held.value) {
    // The time spent held does not count against the pause.
    thinkStarted.value += performance.now() - heldAt
    held.value = false
    schedule(run)
  } else {
    heldAt = performance.now()
    held.value = true
    clearTimer()
  }
}

function reveal() {
  held.value = false
  clearTimer()
  stopAudio()
  phase.value = 'answer'
  playAudio(step.value?.answerAudio)
}

function next() {
  stopAudio()
  position.value++
  void enter()
}

function answer(gotIt: boolean) {
  const index = order.value[position.value]!
  if (!isRetry.value)
    firstTry.value = new Map(firstTry.value).set(index, gotIt)
  // A miss comes round once more at the end — not forever.
  if (!gotIt && !retried.value.has(index)) {
    retried.value = new Set(retried.value).add(index)
    order.value = [...order.value, index]
  }
  next()
}

function replay() {
  const s = step.value
  if (!s)
    return
  if (phase.value === 'answer')
    playAudio(s.answerAudio)
  else
    void playAudioQueue(s.say.map(x => x.audio))
}

function onPick(index: number | null) {
  picked.value = index
  word.value = index === null ? null : step.value?.tokens[index]?.w ?? null
}

function restart() {
  order.value = props.steps.map((_, i) => i)
  position.value = 0
  firstTry.value = new Map()
  retried.value = new Set()
  void enter()
}

defineExpose({ restart, prompts })
</script>

<template>
  <div>
    <div class="h-1 overflow-hidden rounded-full bg-[var(--color-border)]" aria-hidden="true">
      <div class="h-full bg-[var(--color-primary)] transition-all" :style="{ width: `${progress * 100}%` }" />
    </div>

    <div v-if="step && phase !== 'done'" class="mt-6 min-h-[16rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <p v-if="isRetry" class="mb-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
        Once more
      </p>

      <TeacherLine :say="step.say" :class="step.kind === 'prompt' ? 'text-lg font-medium' : 'text-lg'" />

      <!-- The pause: a ring that empties as the thinking time runs out. -->
      <div v-if="phase === 'thinking'" class="mt-8 flex flex-col items-center gap-3">
        <svg viewBox="0 0 36 36" class="h-16 w-16 -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-border)" stroke-width="3" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="3"
            stroke-dasharray="100.5"
            :stroke-dashoffset="100.5 * thinkDone"
          />
        </svg>
        <p class="text-sm text-[var(--color-muted)]">
          {{ held ? 'Paused — take as long as you need' : 'Say it out loud' }}
        </p>
      </div>

      <div v-if="phase === 'answer' && step.text" class="mt-8 text-center">
        <p class="text-2xl leading-[2.2] sm:text-3xl">
          <TokenLine
            :tokens="step.tokens"
            :text="step.text"
            :reading="step.reading ?? ''"
            :mode="mode"
            :known-kanji="knownKanji"
            :selected="picked"
            @pick="onPick"
          />
        </p>
        <p v-if="step.note" class="mt-3 text-sm text-[var(--color-muted)]">
          {{ step.note }}
        </p>
      </div>
    </div>

    <div v-if="phase !== 'done'" class="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Button variant="ghost" round aria-label="Hear it again" @click="replay">
        <Volume2 class="h-5 w-5" />
      </Button>
      <Button v-if="phase === 'explain'" @click="next">
        Next
      </Button>
      <template v-else-if="phase === 'asking' || phase === 'thinking'">
        <Button
          v-if="phase === 'thinking'"
          variant="ghost"
          round
          :aria-label="held ? 'Carry on the countdown' : 'Pause the countdown'"
          @click="toggleHold"
        >
          <Play v-if="held" class="h-5 w-5" />
          <Pause v-else class="h-5 w-5" />
        </Button>
        <Button @click="reveal">
          Show answer
        </Button>
      </template>
      <template v-else-if="phase === 'answer'">
        <Button variant="ghost" @click="answer(false)">
          <X class="h-4 w-4" />
          Not quite
        </Button>
        <Button @click="answer(true)">
          <Check class="h-4 w-4" />
          Got it
        </Button>
      </template>
      <Button variant="ghost" round aria-label="Start the session again" @click="restart">
        <RotateCcw class="h-5 w-5" />
      </Button>
    </div>

    <WordMeaning v-if="word" :word="word" @close="onPick(null)" />
  </div>
</template>
