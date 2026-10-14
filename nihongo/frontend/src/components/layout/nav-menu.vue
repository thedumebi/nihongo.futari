<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * One group in the top nav — Learn, Practise, your account — as a small menu.
 *
 * Closes on a pick, a click outside, Escape, or any navigation. Lit when the
 * current page is one of its own, so the row still says where you are.
 */
export interface NavMenuItem {
  label: string
  to: string
  /** A quieter line under the label, saying what the page is for. */
  hint?: string
}

interface Props {
  label: string
  items: NavMenuItem[]
  active?: boolean
  /** Open towards the left edge, for a menu at the right of the bar. */
  alignRight?: boolean
}

withDefaults(defineProps<Props>(), { active: false, alignRight: false })

const route = useRoute()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

watch(() => route.fullPath, () => {
  open.value = false
})

function onDocumentClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node))
    open.value = false
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape')
    open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-0.5 whitespace-nowrap text-sm transition hover:text-[var(--color-text)]"
      :class="active || open ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="open = !open"
    >
      <slot name="label">
        {{ label }}
      </slot>
      <ChevronDown class="h-3.5 w-3.5 transition" :class="open ? 'rotate-180' : ''" />
    </button>
    <div
      v-if="open"
      class="absolute top-full z-40 mt-2 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 shadow-lg"
      :class="alignRight ? 'right-0' : 'left-0'"
      role="menu"
    >
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        role="menuitem"
        class="block rounded-lg px-3 py-2 transition hover:bg-[var(--color-card)]"
      >
        <span class="block text-sm text-[var(--color-text)]">{{ item.label }}</span>
        <span v-if="item.hint" class="block text-xs text-[var(--color-muted)]">{{ item.hint }}</span>
      </router-link>
      <slot name="footer" />
    </div>
  </div>
</template>
