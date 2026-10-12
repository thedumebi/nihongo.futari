<script setup lang="ts">
import type { SpeakStepView } from '@nihongo/shared/types'

/**
 * What the teacher says, with the Japanese inside it set as Japanese.
 *
 * The line arrives already cut into English and Japanese runs — the same cut
 * the audio was recorded from — so this only has to style them.
 */
const props = defineProps<{ say: SpeakStepView['say'] }>()

/**
 * A space between runs, except before one that opens with punctuation — the
 * runs are trimmed when the line is cut, so "is {です}." would otherwise
 * render as "is です ." with the full stop adrift.
 */
function gap(i: number): string {
  const next = props.say[i + 1]
  return next && !/^[.,!?;:'"…)\]]/.test(next.text) ? ' ' : ''
}
</script>

<template>
  <p class="leading-relaxed">
    <template v-for="(segment, i) in say" :key="i">
      <span
        v-if="segment.lang === 'ja'"
        class="font-medium"
        style="font-family: var(--font-jp)"
      >{{ segment.text }}</span>
      <template v-else>
        {{ segment.text }}
      </template>
      {{ gap(i) }}
    </template>
  </p>
</template>
