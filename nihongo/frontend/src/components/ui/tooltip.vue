<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

/**
 * Hover tooltip, ported from ofuma, and a tap tooltip on a phone, where
 * there is no hover: a tap on the trigger opens it, a tap anywhere else or a
 * scroll closes it. A tap on a link or button inside the trigger does what
 * that control does instead, so wrapping one in a tooltip changes nothing.
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
  stopListening()
}

/** How the last press began, so a click can tell a mouse from a finger. */
let lastPointer = ''

function onPointerDown(event: PointerEvent) {
  lastPointer = event.pointerType
}

function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'mouse')
    showTooltip()
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'mouse')
    hideTooltip()
}

/** A real mouse on a screen that can hover: the tip already follows the pointer. */
function hoveringMouse(): boolean {
  return lastPointer === 'mouse' && window.matchMedia('(hover: hover)').matches
}

/**
 * A click or tap on the trigger. With a hovering mouse it just shows the tip
 * (hover already would, after a moment). Anywhere else, a phone above all, it
 * toggles, and a press anywhere outside or a scroll closes it. The closing
 * listeners are set whichever way it opened, so an open tip can always be
 * dismissed, even when the browser reports a tap as a mouse.
 */
function onClick(event: MouseEvent) {
  if (props.disabled || !props.content)
    return
  if ((event.target as HTMLElement | null)?.closest('a, button, input, select, textarea, label'))
    return
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (isVisible.value && !hoveringMouse()) {
    hideTooltip()
    return
  }
  isVisible.value = true
  void nextTick(calculatePosition)
  stopListening()
  // Capture, and both pointer and touch: some phones send only one of them.
  document.addEventListener('pointerdown', onOutside, true)
  document.addEventListener('touchstart', onOutside, true)
  window.addEventListener('scroll', hideTooltip, { passive: true, once: true })
}

function onOutside(event: Event) {
  const trigger = triggerRef.value
  if (trigger && Array.from(trigger.children).some(c => c.contains(event.target as Node)))
    return
  hideTooltip()
}

function stopListening() {
  document.removeEventListener('pointerdown', onOutside, true)
  document.removeEventListener('touchstart', onOutside, true)
  window.removeEventListener('scroll', hideTooltip)
}

onBeforeUnmount(stopListening)

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
    class="tooltip-trigger"
    @pointerdown="onPointerDown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @click="onClick"
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

<style>
/*
 * iOS Safari only sends a click to plain text when it looks tappable, so on a
 * touch screen the trigger gets a pointer cursor (which nobody sees there).
 * A mouse keeps the normal cursor.
 */
@media (hover: none) {
  .tooltip-trigger > * {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
