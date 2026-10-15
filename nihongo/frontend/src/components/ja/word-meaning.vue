<script setup lang="ts">
import type { WordGloss } from '@nihongo/shared/types'

import { kanaLineToRomaji } from '@nihongo/shared/lib'
import { Check, Plus, X } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useWordReview } from '@/composables/use-word-review'

/**
 * The word you tapped, in a sheet pinned to the bottom of the screen.
 *
 * It used to sit inline under whatever was being read, which put it below the
 * fold for any line near the top: tap a word, see nothing, scroll to find out
 * what it meant. Pinned to the viewport it is always where you are looking,
 * whatever the page, and it needs no positioning maths to stay on a phone
 * screen. Shared by conversations, lessons, the study card and the reader so
 * the same tap teaches the same thing everywhere.
 *
 * Non-modal: the page stays live underneath, so tapping the next word swaps
 * the sheet straight over. A tap anywhere else, or Escape, closes it.
 *
 * "Add to reviews" is built in, for any word the dictionary can review, and
 * says where the word already stands when it is in review. It used to be an
 * action only the reader passed in, so the same word tapped in a conversation,
 * a lesson or a review card could be looked up but never kept. The default
 * slot is still there for anything else a page wants beside it.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{ word: WordGloss }>()

const emit = defineEmits<{ (e: 'close'): void }>()

const sheet = ref<HTMLElement | null>(null)
const { status, saving, add, dueText } = useWordReview(computed(() => props.word.wordId), computed(() => props.word.form))

const WORD_BUTTON = 'button[aria-label^="What does"]'

/** The last word pressed, so a sheet that lands on top of it can move it. */
let lastWord: Element | null = null
function rememberWord(event: PointerEvent) {
  lastWord = (event.target as Element | null)?.closest?.(WORD_BUTTON) ?? lastWord
}

/**
 * Lift the tapped word clear of the sheet when the sheet covers it.
 *
 * On a short screen, a word in the lower part of the page ends up under the
 * sheet that explains it. `scrollIntoView` moves whichever containers need it —
 * the page, or the reader's own scrolling stage — so this works everywhere.
 */
async function revealWord() {
  await nextTick()
  const top = sheet.value?.getBoundingClientRect().top
  const word = lastWord?.isConnected ? lastWord.getBoundingClientRect() : null
  if (top !== undefined && word && word.bottom > top - 8)
    lastWord!.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

watch(() => props.word, revealWord)

/** Tapping another word replaces the sheet; tapping anything else closes it. */
function onPointerDown(event: PointerEvent) {
  const target = event.target as Element | null
  if (!target || sheet.value?.contains(target) || target.closest('button[aria-label^="What does"]'))
    return
  emit('close')
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    emit('close')
}

onMounted(() => {
  void revealWord()
  document.addEventListener('pointerdown', rememberWord, true)
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', rememberWord, true)
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        ref="sheet"
        role="region"
        aria-label="Word meaning"
        aria-live="polite"
        class="sheet pointer-events-auto w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-left shadow-lg"
      >
        <div class="flex items-start gap-3">
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-baseline gap-x-2">
              <span class="text-lg" style="font-family: var(--font-jp)">{{ word.form }}</span>
              <span class="text-sm text-[var(--color-muted)]">{{ kanaLineToRomaji(word.reading) }}</span>
              <span v-if="word.pos" class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                {{ word.pos }}
              </span>
            </p>
            <p v-if="word.meanings.length > 0" class="mt-1 text-sm leading-relaxed">
              {{ word.meanings.join('; ') }}
            </p>
            <p v-else class="mt-1 text-sm text-[var(--color-muted)]">
              Not in the dictionary as one word.
            </p>
            <!--
              What the word is made of, for one the dictionary only knows in
              pieces — 山本, 大黒柱 — so the reader sees the whole word and its
              parts from one tap instead of tapping each piece.
            -->
            <div v-if="word.parts?.length" class="mt-3 border-t border-[var(--color-border)] pt-2">
              <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Made of
              </p>
              <ul class="mt-1 space-y-1">
                <li v-for="(part, i) in word.parts" :key="i" class="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span style="font-family: var(--font-jp)">{{ part.form }}</span>
                  <span v-if="part.reading" class="text-xs text-[var(--color-muted)]">{{ kanaLineToRomaji(part.reading) }}</span>
                  <span :class="part.meanings.length ? '' : 'text-[var(--color-muted)]'">
                    {{ part.meanings.length ? part.meanings.slice(0, 2).join('; ') : '-' }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <button
            type="button"
            class="shrink-0 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            aria-label="Close"
            @click="emit('close')"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <div v-if="$slots.default || status?.reviewable" class="mt-3 flex items-center justify-end gap-3">
          <slot />
          <p v-if="status?.inReview" class="flex items-center gap-1 text-sm text-[var(--color-muted)]">
            <Check class="h-4 w-4" />
            In your reviews{{ status.ghost ? ' · keeps slipping' : '' }} · {{ dueText }}
          </p>
          <button
            v-else-if="status?.reviewable"
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition hover:border-[var(--color-text)] disabled:opacity-50"
            :disabled="saving"
            @click="add"
          >
            <Plus class="h-4 w-4" /> Add to reviews
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet {
  animation: sheet-in 160ms ease-out;
}

@keyframes sheet-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheet {
    animation: none;
  }
}
</style>
