<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

/**
 * Hover tooltip, ported from ofuma.
 *
 * Teleported to <body> and positioned against the trigger's first child, so it
 * escapes any `overflow: hidden` ancestor — which is why the wrapper uses
 * `display: contents` rather than adding a box to the layout.
 */
interface Props {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
  maxWidth?: string
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  disabled: false,
  maxWidth: '20rem',
  delay: 200
})

const isVisible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
let showTimeout: number | null = null

function showTooltip() {
  if (props.disabled || !props.content)
    return

  showTimeout = window.setTimeout(() => {
    isVisible.value = true
    // Wait for next tick to calculate position
    nextTick(() => {
      calculatePosition()
    })
  }, props.delay)
}

function hideTooltip() {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  isVisible.value = false
}

function calculatePosition() {
  if (!triggerRef.value || !tooltipRef.value)
    return

  // When using display:contents, we need to get the bounding rect from the first child
  const firstChild = triggerRef.value.firstElementChild as HTMLElement
  if (!firstChild)
    return

  const triggerRect = firstChild.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const spacing = 8 // Space between trigger and tooltip
  const arrowSize = 6 // Arrow height

  let top = 0
  let left = 0

  switch (props.position) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - spacing - arrowSize
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + spacing + arrowSize
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - tooltipRect.width - spacing - arrowSize
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + spacing + arrowSize
      break
  }

  // Keep tooltip within viewport
  const viewportPadding = 8
  if (left < viewportPadding) {
    left = viewportPadding
  }
  if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
    left = window.innerWidth - tooltipRect.width - viewportPadding
  }
  if (top < viewportPadding) {
    top = viewportPadding
  }
  if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
    top = window.innerHeight - tooltipRect.height - viewportPadding
  }

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

const arrowClasses = computed(() => {
  const baseClasses = 'absolute w-0 h-0 border-solid'

  switch (props.position) {
    case 'top':
      return `${baseClasses} bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[var(--color-border)]`
    case 'bottom':
      return `${baseClasses} top-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[var(--color-border)]`
    case 'left':
      return `${baseClasses} right-[-6px] top-1/2 -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-[var(--color-border)]`
    case 'right':
      return `${baseClasses} left-[-6px] top-1/2 -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-[var(--color-border)]`
    default:
      return baseClasses
  }
})

const arrowFillClasses = computed(() => {
  const baseClasses = 'absolute w-0 h-0 border-solid'

  switch (props.position) {
    case 'top':
      return `${baseClasses} bottom-[-5px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[var(--color-card)]`
    case 'bottom':
      return `${baseClasses} top-[-5px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[var(--color-card)]`
    case 'left':
      return `${baseClasses} right-[-5px] top-1/2 -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-[var(--color-card)]`
    case 'right':
      return `${baseClasses} left-[-5px] top-1/2 -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-[var(--color-card)]`
    default:
      return baseClasses
  }
})
</script>

<template>
  <div
    ref="triggerRef"
    style="display: contents;"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        ref="tooltipRef"
        class="pointer-events-none fixed rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] shadow-lg"
        style="z-index: 5000;"
        :style="{ ...tooltipStyle, maxWidth }"
      >
        {{ content }}
        <!-- Arrow border -->
        <div :class="arrowClasses" />
        <!-- Arrow fill -->
        <div :class="arrowFillClasses" />
      </div>
    </Transition>
  </Teleport>
</template>
