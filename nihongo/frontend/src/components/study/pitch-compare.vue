<script setup lang="ts">
import { computed } from 'vue'

/**
 * Two melodies over one line, drawn together: the speaker's and yours.
 *
 * Each is stretched to the full width, so a slower reading still lines up, and
 * measured from its own centre, so a deeper voice still lines up. What is left
 * to compare is the shape — where the line rises and where it falls.
 */
interface Props {
  speaker: Array<number | null>
  mine?: Array<number | null> | null
}

const props = withDefaults(defineProps<Props>(), { mine: null })

const WIDTH = 300
const HEIGHT = 80
/** Semitones shown either side of the centre line. */
const RANGE = 8

const speakerPath = computed(() => path(props.speaker))
const minePath = computed(() => props.mine ? path(props.mine) : '')

/** An SVG path that lifts the pen across unvoiced gaps. */
function path(track: Array<number | null>): string {
  if (track.length < 2)
    return ''
  let d = ''
  let pen = false
  track.forEach((v, i) => {
    if (v === null) {
      pen = false
      return
    }
    const x = (i / (track.length - 1)) * WIDTH
    const y = HEIGHT / 2 - (Math.max(-RANGE, Math.min(RANGE, v)) / RANGE) * (HEIGHT / 2 - 4)
    d += `${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `
    pen = true
  })
  return d
}
</script>

<template>
  <figure>
    <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="h-24 w-full" preserveAspectRatio="none" role="img" aria-label="Pitch of the speaker and of your recording">
      <line x1="0" :x2="WIDTH" :y1="HEIGHT / 2" :y2="HEIGHT / 2" stroke="var(--color-border)" stroke-dasharray="3 4" vector-effect="non-scaling-stroke" />
      <path :d="speakerPath" fill="none" stroke="var(--color-muted)" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
      <path v-if="minePath" :d="minePath" fill="none" stroke="var(--color-accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <figcaption class="mt-1 flex gap-4 text-xs text-[var(--color-muted)]">
      <span class="flex items-center gap-1.5"><span class="inline-block h-0.5 w-4 bg-[var(--color-muted)]" /> Speaker</span>
      <span v-if="mine" class="flex items-center gap-1.5"><span class="inline-block h-0.5 w-4 bg-[var(--color-accent)]" /> You</span>
    </figcaption>
  </figure>
</template>
