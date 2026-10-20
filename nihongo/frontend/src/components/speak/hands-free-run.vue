<script setup lang="ts">
import type { SpeakStepView } from '@nihongo/shared/types'

import { thinkingTimeMs } from '@nihongo/shared/lib'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import TeacherLine from '@/components/speak/teacher-line.vue'
import Button from '@/components/ui/button.vue'
import { playAudioQueue, prefetchAudio, stopAudio } from '@/composables/use-audio'

/**
 * A session as continuous audio, like the original recordings.
 *
 * The teacher, the prompt, a silence long enough to say the answer, the answer,
 * then on. Pauses are real silence rather than timers, and the lock screen gets
 * play/pause/skip through the Media Session API, so it keeps going with the
 * phone in a pocket. There is no self-check here — this is for practice on the
 * move — so it does not mark the session complete.
 *
 * Recall plays through this too (its words made into steps by `recallSteps`),
 * so both have the same controls, pauses and pace. What differs comes in as
 * props and slots: the intro, a tag per step, the reading under the answer,
 * and what to show at the end.
 */
interface Props {
  steps: SpeakStepView[]
  title: string
  /** The lock screen's second line: "Session 4", "Story 2". */
  album: string
  thinkScale: number
  /** A short label per step, by position: Recall's "again" for a word asked before. */
  tags?: Array<string | null>
  /** Show the reading under the answer when it is written with kanji. */
  showReading?: boolean
}

const props = withDefaults(defineProps<Props>(), { tags: () => [], showReading: false })

const emit = defineEmits<{
  /** Played through to the end — a listen, recorded apart from a scored run. */
  finished: []
}>()

/** Breath after an answer before the teacher moves on. */
const AFTER_ANSWER_MS = 1500
const AFTER_EXPLAIN_MS = 700

// ============ Reactive State ============
const current = ref(0)
const playing = ref(false)
/** Whether the current prompt's answer has been heard yet, so the text can show it. */
const answered = ref(false)
const finished = ref(false)
/**
 * Paused in the silence after a prompt. Resuming then goes on to the answer
 * instead of asking again — pausing there is how you take as long as you like.
 */
const heldInThinking = ref(false)
/** In the silence for the current prompt right now. */
let thinking = false

let run = 0

// ============ Computed Properties ============
const step = computed(() => props.steps[current.value] ?? null)

// ============ Lifecycle Hooks ============
onMounted(() => {
  void prefetchAudio(props.steps.flatMap(clipsOf))
  const session = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined
  if (!session)
    return
  session.metadata = new MediaMetadata({ title: props.title, artist: 'go', album: props.album })
  session.setActionHandler('play', () => void start())
  session.setActionHandler('pause', pause)
  session.setActionHandler('nexttrack', () => skip(1))
  session.setActionHandler('previoustrack', () => skip(-1))
})

onBeforeUnmount(() => {
  run++
  stopAudio()
  const session = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined
  if (!session)
    return
  for (const action of ['play', 'pause', 'nexttrack', 'previoustrack'] as const)
    session.setActionHandler(action, null)
  session.metadata = null
})

// ============ Methods ============
function clipsOf(s: SpeakStepView | undefined): Array<string | null> {
  return s ? [...s.say.map(x => x.audio), s.answerAudio] : []
}

async function start() {
  if (finished.value) {
    finished.value = false
    current.value = 0
  }
  const mine = ++run
  playing.value = true
  setState('playing')

  while (current.value < props.steps.length) {
    const s = props.steps[current.value]!
    answered.value = false
    // The next step's clips, fetched while this one plays, so they are on the
    // phone before they are needed and a locked screen has nothing to wait for.
    void prefetchAudio(clipsOf(props.steps[current.value + 1]))
    const ask = s.say.map(x => x.audio)
    if (s.kind === 'explain') {
      await playAudioQueue([...ask, { pauseMs: AFTER_EXPLAIN_MS }], { silentPauses: true })
    } else if (s.kind === 'narrate') {
      // A story's narration: read aloud, then a breath before the story goes on.
      answered.value = true
      await playAudioQueue([s.answerAudio, { pauseMs: AFTER_ANSWER_MS }], { silentPauses: true })
    } else {
      // Back from a pause in the silence: play means "ready", so straight to the answer.
      if (heldInThinking.value) {
        heldInThinking.value = false
      } else {
        await playAudioQueue(ask)
        if (mine !== run)
          return
        thinking = true
        // A getter, so changing the time to answer mid-pause stretches or cuts the silence already playing.
        await playAudioQueue([{ pauseMs: () => thinkingTimeMs(s.reading ?? '', props.thinkScale) }], { silentPauses: true })
        thinking = false
      }
      if (mine !== run)
        return
      answered.value = true
      await playAudioQueue([s.answerAudio, { pauseMs: AFTER_ANSWER_MS }], { silentPauses: true })
    }
    if (mine !== run)
      return
    current.value++
  }

  playing.value = false
  finished.value = true
  setState('none')
  emit('finished')
}

function pause() {
  heldInThinking.value = thinking
  thinking = false
  run++
  stopAudio()
  playing.value = false
  setState('paused')
}

function skip(by: number) {
  const wasPlaying = playing.value
  run++
  stopAudio()
  current.value = Math.min(props.steps.length - 1, Math.max(0, current.value + by))
  answered.value = false
  finished.value = false
  heldInThinking.value = false
  thinking = false
  if (wasPlaying)
    void start()
}

function setState(state: MediaSessionPlaybackState) {
  if (typeof navigator !== 'undefined' && navigator.mediaSession)
    navigator.mediaSession.playbackState = state
}
</script>

<template>
  <div>
    <slot name="intro">
      <p class="text-sm text-[var(--color-muted)]">
        Plays straight through: the English, a pause for you to say it, then the answer. Works with the
        screen off. Pause during the silence to take as long as you need. Play again gives the answer. Listening does not mark the session done, so run it on screen to check yourself.
      </p>
    </slot>

    <div class="mt-6 min-h-[12rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
        {{ finished ? 'Finished' : `${current + 1} of ${steps.length}` }}
        <span v-if="!finished && tags[current]" class="ml-2 rounded-full border border-[var(--color-border)] px-2 py-0.5 normal-case tracking-normal">{{ tags[current] }}</span>
      </p>
      <p v-if="heldInThinking && !playing" class="mt-1 text-sm text-[var(--color-muted)]">
        Paused. Take as long as you need. Play gives the answer.
      </p>
      <template v-if="step && !finished">
        <TeacherLine :say="step.say" class="mt-2 text-lg" />
        <p
          v-if="step.kind !== 'explain' && step.text"
          class="mt-6 text-center text-2xl transition-opacity"
          :class="answered ? 'opacity-100' : 'opacity-0'"
          style="font-family: var(--font-jp)"
          :aria-hidden="!answered"
        >
          {{ step.text }}
          <span v-if="showReading && step.reading && step.reading !== step.text" class="block text-sm text-[var(--color-muted)]">{{ step.reading }}</span>
        </p>
      </template>
      <slot v-else-if="finished" name="finished" />
    </div>

    <div class="mt-6 flex items-center justify-center gap-3">
      <Button variant="ghost" round aria-label="Previous" @click="skip(-1)">
        <SkipBack class="h-5 w-5" />
      </Button>
      <Button round :aria-label="playing ? 'Pause' : 'Play'" @click="playing ? pause() : start()">
        <Pause v-if="playing" class="h-5 w-5" />
        <Play v-else class="h-5 w-5" />
      </Button>
      <Button variant="ghost" round aria-label="Next" @click="skip(1)">
        <SkipForward class="h-5 w-5" />
      </Button>
    </div>
  </div>
</template>
