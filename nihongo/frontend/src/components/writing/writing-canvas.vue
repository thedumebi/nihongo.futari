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
  /**
   * Numbered start points and direction arrows on the reference glyph.
   *
   * The ghost alone shows the SHAPE and nothing about how it is produced, which
   * is most of what writing kana and kanji is. Stroke order is not decoration:
   * it decides proportion, where the brush lifts, and whether the character is
   * legible when written quickly — and it is the one thing a learner cannot
   * recover by looking at the finished glyph.
   */
  showOrder?: boolean
  /**
   * Mark only the stroke that comes next, rather than all of them at once.
   *
   * Showing every marker together is a reference chart, and it stops working as
   * one the moment the character is busy: ロ has three strokes and two of them
   * already needed nudging apart, while 曜 has eighteen and there is nowhere for
   * them to go. It also answers the wrong question — the reader is midway
   * through and wants to know what comes NEXT, not to re-read the whole order.
   *
   * Following along means at most one marker on screen, so crowding cannot
   * happen however dense the character, and the guide becomes a prompt rather
   * than a diagram.
   */
  followAlong?: boolean
  /** Number of reference strokes to reveal as a hint. */
  revealStrokes?: number
  disabled?: boolean
}>(), {
  showGuide: true,
  showOrder: true,
  followAlong: true,
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

/**
 * Where each stroke starts, in what order, and which way it travels.
 *
 * A numbered dot at the start of every stroke, and a short arrowhead along its
 * opening direction — the convention every Japanese stroke-order chart uses, so
 * it needs no explaining to anyone who has seen one.
 *
 * The direction is taken from a point a little way in rather than the very next
 * sample, because consecutive samples on a curve are close enough that rounding
 * makes the angle jitter. Ten percent along the stroke is far enough to be
 * stable and near enough to still be the OPENING direction rather than the
 * average of the whole stroke.
 */
function drawStrokeOrder(ctx: CanvasRenderingContext2D, colour: string) {
  const R = 3.8

  ctx.save()
  ctx.lineWidth = 1.4
  ctx.font = `${R * 1.5}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Where each marker ended up, so the next one can avoid it.
  const placed: Point[] = []

  // Which strokes to mark. Following along, that is just the one the reader is
  // about to draw — index equal to how many they have already completed.
  const entries = props.followAlong
    ? referencePoints.value
        .map((points, i) => [i, points] as const)
        .filter(([i]) => i === strokes.value.length)
    : referencePoints.value.map((points, i) => [i, points] as const)

  for (const [i, points] of entries) {
    const first = points[0]
    if (!first)
      continue

    /**
     * Slide the marker along its own stroke until it is clear of the others.
     *
     * Strokes very often share a start: both of ロ's first two begin at the same
     * top-left corner, so their markers landed exactly on top of each other and
     * neither number was readable. Nudging in an arbitrary direction would break
     * the association — a marker floating beside two strokes belongs to neither —
     * whereas a marker further ALONG its own stroke is still unambiguously that
     * stroke's, because it is sitting on it.
     *
     * Falls back to the start point if the whole stroke is crowded, which is
     * better than pushing the marker off the glyph entirely.
     */
    let start = first
    for (let step = 0; step <= 8; step++) {
      const candidate = points[Math.min(points.length - 1, Math.round((points.length - 1) * step * 0.08))]
      if (!candidate)
        break
      const clear = placed.every(q => Math.hypot(q.x - candidate.x, q.y - candidate.y) >= R * 2.3)
      if (clear) {
        start = candidate
        break
      }
    }
    placed.push(start)

    // The arrow first, so the numbered dot sits on top of its tail.
    const from = points.indexOf(start)
    const ahead = points[Math.min(points.length - 1, Math.max(from + 1, from + Math.floor(points.length * 0.1)))]
    if (ahead && (ahead.x !== start.x || ahead.y !== start.y)) {
      const angle = Math.atan2(ahead.y - start.y, ahead.x - start.x)
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      // A thin shaft with a distinct head, rather than one squat triangle.
      // A lone triangle reads as a blob at this size and leaves you guessing
      // which end is the point; a shaft gives the head something to point AWAY
      // from, which is what makes the direction legible at a glance.
      const HEAD = 5.2
      const SPREAD = 0.34
      const tipX = start.x + cos * (R + 8)
      const tipY = start.y + sin * (R + 8)
      const baseX = tipX - cos * HEAD
      const baseY = tipY - sin * HEAD

      ctx.strokeStyle = colour
      ctx.lineWidth = 1.1
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(start.x + cos * R, start.y + sin * R)
      ctx.lineTo(baseX, baseY)
      ctx.stroke()

      // Long and narrow: the length says "this way", the narrowness stops it
      // reading as a diamond when the two wings are similar in size.
      ctx.fillStyle = colour
      ctx.beginPath()
      ctx.moveTo(tipX, tipY)
      ctx.lineTo(baseX - Math.cos(angle - Math.PI / 2) * HEAD * SPREAD, baseY - Math.sin(angle - Math.PI / 2) * HEAD * SPREAD)
      ctx.lineTo(baseX - Math.cos(angle + Math.PI / 2) * HEAD * SPREAD, baseY - Math.sin(angle + Math.PI / 2) * HEAD * SPREAD)
      ctx.closePath()
      ctx.fill()
    }

    ctx.fillStyle = colour
    ctx.beginPath()
    ctx.arc(start.x, start.y, R, 0, Math.PI * 2)
    ctx.fill()

    // Numbered from 1: nobody counts strokes from zero.
    ctx.fillStyle = '#ffffff'
    ctx.fillText(String(i + 1), start.x, start.y + 0.4)
  }

  ctx.restore()
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
    if (props.showOrder)
      drawStrokeOrder(ctx, hint)
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
watch(() => [props.reference, props.showGuide, props.showOrder, props.followAlong, props.revealStrokes], () => draw(), { deep: true })
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
