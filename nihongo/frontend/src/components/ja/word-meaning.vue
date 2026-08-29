<script setup lang="ts">
import type { WordGloss } from '@nihongo/shared/types'

import { kanaLineToRomaji } from '@nihongo/shared/lib'
import { X } from 'lucide-vue-next'

/**
 * The word you tapped.
 *
 * A strip rather than a floating popover: it needs no positioning maths, it
 * cannot land off the edge of a phone, and the line you were reading stays
 * where it was. Shared by conversations and the study card so the two cannot
 * drift apart — the same tap should teach the same thing wherever you are.
 */
defineProps<{ word: WordGloss }>()

defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-left">
    <div class="min-w-0 flex-1">
      <p class="flex flex-wrap items-baseline gap-x-2">
        <span class="text-lg" style="font-family: var(--font-jp)">{{ word.form }}</span>
        <span class="text-sm text-[var(--color-muted)]">{{ kanaLineToRomaji(word.reading) }}</span>
        <span v-if="word.pos" class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          {{ word.pos }}
        </span>
      </p>
      <p class="mt-1 text-sm leading-relaxed">
        {{ word.meanings.join('; ') }}
      </p>
    </div>
    <button
      type="button"
      class="shrink-0 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
      aria-label="Close"
      @click="$emit('close')"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
