<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import WordEntry from '@/components/ja/word-entry.vue'
import BottomSheet from '@/components/ui/bottom-sheet.vue'
import { useWordEntrySheet } from '@/composables/use-word-entry-sheet'
import { ROUTES } from '@/constants'

/**
 * The full dictionary entry over the bottom half of the screen, opened from a
 * tapped word's "Full entry". Mounted once, in `app.vue`.
 *
 * A kanji chip or "Open full page" leaves the page, so the sheet closes with
 * the route: nobody wants it still up over the page they went to.
 */

// ============ Composables ============
const route = useRoute()
const { wordId, isOpen, close } = useWordEntrySheet()

// ============ Reactive State ============
/** The last word opened, kept while the sheet slides away so it does not empty first. */
const shown = ref<string | null>(null)
/** Each opening loads afresh, so an entry that failed offline is tried again. */
const opened = ref(0)

// ============ Watchers ============
watch(wordId, (id) => {
  if (!id)
    return
  shown.value = id
  opened.value += 1
})
watch(() => route.fullPath, close)
</script>

<template>
  <BottomSheet :open="isOpen" label="Dictionary entry" @close="close">
    <template #header>
      <div class="flex items-baseline justify-between gap-3">
        <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          Dictionary
        </p>
        <RouterLink
          v-if="shown"
          :to="ROUTES.WORD_DETAIL(shown)"
          class="text-xs text-[var(--color-muted)] underline underline-offset-4 transition hover:text-[var(--color-text)]"
        >
          Open full page
        </RouterLink>
      </div>
    </template>
    <WordEntry v-if="shown" :key="opened" :word-id="shown" compact />
  </BottomSheet>
</template>
