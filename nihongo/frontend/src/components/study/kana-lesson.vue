<script setup lang="ts">
/**
 * The teach half of a writing-system lesson: one row of the syllabary.
 *
 * Deliberately not the grammar deck. A grammar topic is one pattern explained
 * at length across several slides; a kana row is five characters, and what a
 * reader needs is to see each one large, hear it, and say it back. Bending one
 * component to do both would make both worse.
 *
 * No furigana here, for the obvious reason: this IS the furigana. The romaji
 * sits under each character permanently rather than following the display
 * setting, because someone on this lesson has nothing else to read it with.
 */
import type { LessonDetail } from '@nihongo/shared/types'

import { Volume2 } from 'lucide-vue-next'
import { ref } from 'vue'

import Button from '@/components/ui/button.vue'
import { playAudio, playAudioQueue } from '@/composables/use-audio'

const props = defineProps<{
  kana: NonNullable<LessonDetail['kana']>
  /** Wording for the last card's button — a quiz follows, or nothing does. */
  finishLabel?: string
}>()

defineEmits<{ (e: 'done'): void }>()

const playing = ref<string | null>(null)

function say(character: string, audio: string | null | undefined) {
  playing.value = character
  playAudio(audio)
  window.setTimeout(() => {
    playing.value = null
  }, 600)
}

/** The whole row, in order — the way the rows are actually memorised. */
function sayAll() {
  void playAudioQueue(props.kana.characters.map(c => c.audio))
}
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <p class="text-sm text-[var(--color-muted)]">
      {{ kana.script === 'hiragana' ? 'Hiragana' : 'Katakana' }} · {{ kana.rowLabel }}
    </p>

    <p class="max-w-md text-center text-sm text-[var(--color-muted)]">
      Tap a character to hear it. These are the letters the readings above kanji
      are written in, so they are worth knowing cold.
    </p>

    <div class="flex flex-wrap justify-center gap-3">
      <button
        v-for="c in kana.characters"
        :key="c.character"
        type="button"
        class="flex h-24 w-20 flex-col items-center justify-center rounded-xl border transition"
        :class="playing === c.character
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
          : 'border-[var(--color-border)]'"
        @click="say(c.character, c.audio)"
      >
        <span class="text-4xl" style="font-family: var(--font-jp)">{{ c.character }}</span>
        <span class="mt-1 text-xs text-[var(--color-muted)]">{{ c.romaji }}</span>
      </button>
    </div>

    <button
      type="button"
      class="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]"
      @click="sayAll"
    >
      <Volume2 class="h-4 w-4" />
      Hear the whole row
    </button>

    <Button variant="primary" @click="$emit('done')">
      {{ finishLabel ?? 'Got it' }}
    </Button>
  </div>
</template>
