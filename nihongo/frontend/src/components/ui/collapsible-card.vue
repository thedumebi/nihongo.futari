<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * A card that folds to its title and a one-line summary.
 *
 * For long pages of settings: closed, each section says what it is and where
 * it stands ("10 a day", "Friends are off"), so the page reads as a list and
 * only the section being changed takes room. The content stays mounted when
 * folded (v-show), so a half-filled form is not lost by closing it.
 */
interface Props {
  title: string
  /** Where this section stands, shown under the title. */
  summary?: string
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), { summary: '', defaultOpen: false })

const open = ref(props.defaultOpen)
</script>

<template>
  <section class="rounded-xl border border-[var(--color-border)]">
    <button
      type="button"
      class="flex w-full items-center gap-3 p-5 text-left"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="min-w-0 flex-1">
        <span class="block font-semibold">{{ title }}</span>
        <span v-if="summary" class="block truncate text-sm text-[var(--color-muted)]">{{ summary }}</span>
      </span>
      <ChevronDown class="h-5 w-5 shrink-0 text-[var(--color-muted)] transition" :class="open ? 'rotate-180' : ''" />
    </button>
    <div v-show="open" class="border-t border-[var(--color-border)] px-6 pb-6 pt-4">
      <slot />
    </div>
  </section>
</template>
