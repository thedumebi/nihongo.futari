<script setup lang="ts">
import type { AnswerScript } from '@nihongo/shared/constants'

import { ANSWER_SCRIPT_INFO, takesRomaji } from '@nihongo/shared/lib'
import { computed } from 'vue'

/**
 * What this card wants, said where the eye is before answering.
 *
 * The placeholder used to carry this alone and it vanished on the first key,
 * so a kana card after a romaji card looked the same as the one before it. The
 * chip's glyph is what reads at a glance; the pulse only says it changed.
 */

interface Props {
  script: AnswerScript
  /** The prompt's own instruction, shown under the label. */
  instruction?: string
  /** The last card wanted something else. */
  changed?: boolean
}

const props = withDefaults(defineProps<Props>(), { instruction: '', changed: false })

// ============ Computed Properties ============
const info = computed(() => ANSWER_SCRIPT_INFO[props.script])
const romajiNote = computed(() => takesRomaji(props.script))
</script>

<template>
  <div class="flex flex-col items-center gap-1 text-center" :class="{ changed }">
    <p
      class="cue inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium"
      :class="changed ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)]'"
      :data-script="script"
    >
      <span
        class="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-xs font-semibold leading-6 text-[var(--color-card)]"
        style="font-family: var(--font-jp)"
        aria-hidden="true"
      >{{ info.glyph }}</span>
      {{ info.label }}
    </p>
    <p v-if="changed" class="text-xs text-[var(--color-accent)]">
      Not the same as the last card
    </p>
    <p v-if="instruction" class="text-sm text-[var(--color-muted)]">
      {{ instruction }}
    </p>
    <p v-if="romajiNote" class="text-xs text-[var(--color-muted)]">
      Romaji works too: it turns into kana.
    </p>
  </div>
</template>

<style scoped>
.changed .cue {
  animation: cue-pop 600ms ease-out 1;
}

@keyframes cue-pop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .changed .cue {
    animation: none;
  }
}
</style>
