<script lang="ts">
import { useElementSize, useMediaQuery } from '@vueuse/core'
import { onBeforeUnmount, ref, watchEffect } from 'vue'

/**
 * The room fixed bars take, kept free at the end of the page (style.css).
 * Shared, because a card going and the next one coming can mount one bar
 * before the other's goes: the last to leave must not take the room away.
 */
const reserved = new Map<symbol, number>()

function reserve(id: symbol, px: number | null) {
  if (px === null)
    reserved.delete(id)
  else
    reserved.set(id, px)
  const most = Math.max(0, ...reserved.values())
  document.documentElement.style.setProperty('--answer-bar-height', `${Math.ceil(most)}px`)
}
</script>

<script setup lang="ts">
/**
 * The buttons that answer: Check, Next, Hard / Good / Easy.
 *
 * They came after everything a revealed card shows (the verdict, other
 * meanings, the picture), so on a phone they sat below the screen and every
 * card took a scroll to finish.
 *
 * On a phone the bar is fixed to the foot of the screen, the same place on
 * every card and every game, and the page gets that much room at its end so
 * nothing is left under it. From `sm` up there is room for the card, so the
 * bar is sticky instead: right under a short answer, at the foot of the screen
 * for a long one. Sticky holds only within its parent, so put the bar as a
 * child of the element that holds the whole question.
 *
 * `contentClass` lays out the buttons; a class on the component itself is for
 * spacing around it.
 *
 * The click stops here so a tap on the bar's own padding is not a tap on the
 * card around it (the study card opens its picture on a tap).
 */

interface Props {
  contentClass?: string
}

defineProps<Props>()

// ============ Composables ============
/** Tailwind's `sm` breakpoint, below which the bar is fixed. */
const phone = useMediaQuery('(max-width: 639.98px)')

// ============ Reactive State ============
const bar = ref<HTMLElement | null>(null)
const { height } = useElementSize(bar, undefined, { box: 'border-box' })
/** Where the bar sits in the page: the width its buttons had before it was fixed. */
const place = ref<HTMLElement | null>(null)
const { width } = useElementSize(place)
const id = Symbol('answer-bar')

// ============ Watchers ============
watchEffect(() => reserve(id, phone.value ? height.value : 0))

// ============ Lifecycle Hooks ============
onBeforeUnmount(() => reserve(id, null))
</script>

<template>
  <div ref="place" class="sm:sticky sm:bottom-0 sm:z-20 sm:bg-[var(--color-bg)]" @click.stop>
    <div
      ref="bar"
      class="answer-bar bg-[var(--color-bg)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-30 max-sm:border-t max-sm:border-[var(--color-border)] max-sm:px-4"
    >
      <!-- Fixed, the bar spans the screen; its buttons keep the width of the
           space they sit in, so they are the size they were in the page. -->
      <div class="mx-auto max-w-xl" :class="contentClass" :style="phone && width ? { width: `${width}px` } : undefined">
        <slot />
      </div>
      <div v-if="$slots.hint" class="mt-2 text-center text-xs text-[var(--color-muted)]">
        <slot name="hint" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* From `sm` up, a fade above the sticky bar, so what scrolls under it does
   not end in a hard line. A phone's fixed bar has a border instead. */
@media (min-width: 640px) {
  .answer-bar {
    position: relative;
  }

  .answer-bar::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: 100%;
    height: 1rem;
    background: linear-gradient(to top, var(--color-bg), transparent);
    pointer-events: none;
  }
}
</style>
