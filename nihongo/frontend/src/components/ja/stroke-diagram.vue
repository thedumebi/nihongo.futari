<script setup lang="ts">
import type { ReferenceStroke } from '@nihongo/shared/types'

import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * Stroke order as a static diagram.
 *
 * Each stroke is drawn in sequence with earlier strokes faded, so the order
 * reads at a glance without an animation to wait through. A learner checking
 * "which stroke comes third" should not have to watch anything.
 */
const props = withDefaults(defineProps<{
  strokes: ReferenceStroke[]
  /** How many to show per row before wrapping. */
  size?: number
  /** Offer a play control that draws the strokes in order. */
  animated?: boolean
}>(), { size: 56, animated: true })

const VIEW_BOX = 109
const steps = computed(() => props.strokes.map((_, i) => i))

/**
 * Playback.
 *
 * The filmstrip above stays the primary view — someone checking "which stroke
 * is third" should not have to wait through a replay. The animation is for the
 * different question, "how does the hand move", and it is opt-in for that
 * reason.
 */
const playingTo = ref<number | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

function stop() {
  clearTimeout(timer)
  timer = undefined
  playingTo.value = null
}

function play() {
  stop()
  playingTo.value = 0
  const advance = () => {
    if (playingTo.value === null)
      return
    if (playingTo.value >= props.strokes.length) {
      // Hold the finished character briefly, then clear.
      timer = setTimeout(stop, 900)
      return
    }
    playingTo.value += 1
    timer = setTimeout(advance, 420)
  }
  timer = setTimeout(advance, 200)
}

// A new character mid-playback would otherwise animate the wrong strokes.
watch(() => props.strokes, stop)
onBeforeUnmount(stop)
</script>

<template>
  <div>
    <div v-if="animated && strokes.length > 1" class="mb-2">
      <button
        type="button"
        class="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] transition hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
        @click="playingTo === null ? play() : stop()"
      >
        {{ playingTo === null ? 'Play stroke order' : 'Stop' }}
      </button>
    </div>

    <!-- Playback surface, only while playing. -->
    <svg
      v-if="playingTo !== null"
      :width="size * 2.4"
      :height="size * 2.4"
      :viewBox="`0 0 ${VIEW_BOX} ${VIEW_BOX}`"
      class="mb-2 rounded-md border border-[var(--color-border)] bg-[var(--color-card)]"
      role="img"
      aria-label="Stroke order playing"
    >
      <g stroke="var(--color-line)" stroke-width="0.6" stroke-dasharray="3 3">
        <line :x1="VIEW_BOX / 2" y1="0" :x2="VIEW_BOX / 2" :y2="VIEW_BOX" />
        <line x1="0" :y1="VIEW_BOX / 2" :x2="VIEW_BOX" :y2="VIEW_BOX / 2" />
      </g>
      <path
        v-for="drawn in strokes.slice(0, playingTo)"
        :key="`a-${drawn.index}`"
        :d="drawn.path"
        fill="none"
        stroke="var(--color-ink)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <div class="flex flex-wrap gap-1.5">
      <svg
        v-for="step in steps"
        :key="step"
        :width="size"
        :height="size"
        :viewBox="`0 0 ${VIEW_BOX} ${VIEW_BOX}`"
        class="rounded-md border border-[var(--color-border)] bg-[var(--color-card)]"
        role="img"
        :aria-label="`Stroke ${step + 1} of ${strokes.length}`"
      >
        <!-- Guides, faint: the same crosshair a practice grid has. -->
        <g stroke="var(--color-line)" stroke-width="0.6" stroke-dasharray="3 3">
          <line :x1="VIEW_BOX / 2" y1="0" :x2="VIEW_BOX / 2" :y2="VIEW_BOX" />
          <line x1="0" :y1="VIEW_BOX / 2" :x2="VIEW_BOX" :y2="VIEW_BOX / 2" />
        </g>
        <!-- Strokes already made, faded. -->
        <path
          v-for="prior in strokes.slice(0, step)"
          :key="`p-${prior.index}`"
          :d="prior.path"
          fill="none"
          stroke="var(--color-line)"
          stroke-width="4.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- The stroke this frame is about. -->
        <path
          :d="strokes[step]!.path"
          fill="none"
          stroke="var(--color-accent)"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>
