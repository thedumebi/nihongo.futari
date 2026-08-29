<script setup lang="ts">
import type { Point, ReferenceStroke, Stroke } from '@nihongo/shared/types'

import { samplePath } from '@nihongo/shared/lib'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * The writing surface.
 *
 * One pointer-events code path covers mouse, trackpad, touch and pencil —
 * `pointerdown`/`move`/`up` with `setPointerCapture`, rather than three
 * near-identical mouse/touch/pen handlers that drift apart.
 *
 * The canvas is drawn at devicePixelRatio and sized by CSS, so strokes stay
 * crisp on a phone. Points are stored in the 109x109 KanjiVG space, not device
 * pixels: the grader normalises anyway, but keeping one space means a resize
 * mid-attempt cannot corrupt strokes already drawn.
 */

const props = withDefaults(defineProps<{
  reference: ReferenceStroke[]
  /** Faint reference glyph under the writing surface. */
  showGuide?: boolean
  /** Number of reference strokes to reveal as a hint. */
  revealStrokes?: number
  disabled?: boolean
}>(), {
  showGuide: true,
  revealStrokes: 0,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:strokes', strokes: Stroke[]): void
  (e: 'strokeEnd', strokes: Stroke[]): void
}>()

/** KanjiVG's box. Every coordinate below is in this space. */
const BOX = 109

const canvas = ref<HTMLCanvasElement | null>(null)
const strokes = ref<Stroke[]>([])
const active = ref<Point[] | null>(null)

const referencePoints = computed(() => props.reference.map(s => samplePath(s.path)))

function toBoxSpace(event: PointerEvent): Point {
  const rect = canvas.value!.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * BOX,
    y: ((event.clientY - rect.top) / rect.height) * BOX
  }
}

function drawPolyline(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 0)
    return
  ctx.beginPath()
  ctx.moveTo(points[0]!.x, points[0]!.y)
  // A dot still needs to leave a mark, so a single point draws a tiny segment.
  if (points.length === 1)
    ctx.lineTo(points[0]!.x + 0.01, points[0]!.y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y)
  ctx.stroke()
}

function draw() {
  const el = canvas.value
  if (!el)
    return
  const ctx = el.getContext('2d')
  if (!ctx)
    return

  const ratio = window.devicePixelRatio || 1
  const size = el.clientWidth
  if (size === 0)
    return
  if (el.width !== Math.round(size * ratio)) {
    el.width = Math.round(size * ratio)
    el.height = Math.round(size * ratio)
  }

  const styles = getComputedStyle(el)
  const ink = styles.getPropertyValue('--canvas-ink').trim() || '#1b2a33'
  const guide = styles.getPropertyValue('--canvas-guide').trim() || '#dce6ec'
  const hint = styles.getPropertyValue('--canvas-hint').trim() || '#8fb4c8'

  ctx.save()
  ctx.clearRect(0, 0, el.width, el.height)
  // One transform from the 109-box to device pixels; everything below draws in
  // box coordinates.
  ctx.scale(el.width / BOX, el.height / BOX)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Quadrant guides — the crosshair a Japanese practice grid has, which is what
  // makes proportion learnable rather than guessed.
  ctx.strokeStyle = guide
  ctx.lineWidth = 0.4
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(BOX / 2, 0)
  ctx.lineTo(BOX / 2, BOX)
  ctx.moveTo(0, BOX / 2)
  ctx.lineTo(BOX, BOX / 2)
  ctx.stroke()
  ctx.setLineDash([])

  if (props.showGuide) {
    ctx.strokeStyle = guide
    ctx.lineWidth = 5
    for (const stroke of referencePoints.value) drawPolyline(ctx, stroke)
  }

  // Revealed hint strokes sit above the ghost but below the user's ink.
  if (props.revealStrokes > 0) {
    ctx.strokeStyle = hint
    ctx.lineWidth = 5
    for (const stroke of referencePoints.value.slice(0, props.revealStrokes)) drawPolyline(ctx, stroke)
  }

  ctx.strokeStyle = ink
  ctx.lineWidth = 4.5
  for (const stroke of strokes.value) drawPolyline(ctx, stroke)
  if (active.value)
    drawPolyline(ctx, active.value)

  ctx.restore()
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled)
    return
  event.preventDefault()
  // Capture so a stroke that leaves the canvas still ends properly, instead of
  // hanging until the next pointerdown. Capture is a nicety, not a
  // prerequisite: it throws if the pointer is already gone, and letting that
  // propagate would abort the handler and lose the stroke entirely.
  try {
    canvas.value?.setPointerCapture(event.pointerId)
  } catch {
    // Drawing still works without capture.
  }
  active.value = [toBoxSpace(event)]
  draw()
}

function onPointerMove(event: PointerEvent) {
  if (!active.value || props.disabled)
    return
  event.preventDefault()
  const point = toBoxSpace(event)
  const last = active.value[active.value.length - 1]!
  // Drop sub-pixel jitter: it adds points without adding shape, and resampling
  // would only smooth it away later.
  if (Math.hypot(point.x - last.x, point.y - last.y) < 0.4)
    return
  active.value.push(point)
  draw()
}

function onPointerUp(event: PointerEvent) {
  if (!active.value)
    return
  try {
    canvas.value?.releasePointerCapture(event.pointerId)
  } catch {
    // Capture was never taken, or the pointer already went away.
  }
  // A stray tap is not a stroke.
  if (active.value.length > 1)
    strokes.value.push(active.value as Stroke)
  active.value = null
  draw()
  emit('update:strokes', strokes.value)
  emit('strokeEnd', strokes.value)
}

function undo() {
  strokes.value.pop()
  draw()
  emit('update:strokes', strokes.value)
}

function clear() {
  strokes.value = []
  active.value = null
  draw()
  emit('update:strokes', strokes.value)
}

const observer = new ResizeObserver(() => draw())
watch(canvas, (el) => {
  observer.disconnect()
  if (el) {
    observer.observe(el)
    draw()
  }
}, { immediate: true })
watch(() => [props.reference, props.showGuide, props.revealStrokes], () => draw(), { deep: true })
onBeforeUnmount(() => observer.disconnect())

defineExpose({ undo, clear })
</script>

<template>
  <canvas
    ref="canvas"
    class="aspect-square w-full touch-none rounded-2xl border border-line bg-card [--canvas-guide:var(--color-washi)] [--canvas-hint:var(--color-hover)] [--canvas-ink:var(--color-ink)]"
    :class="disabled ? 'cursor-not-allowed' : 'cursor-crosshair'"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  />
</template>
