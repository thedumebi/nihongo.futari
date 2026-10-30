<script setup lang="ts">
import type { Point, ReferenceStroke, Stroke, StrokeCorner } from '@nihongo/shared/types'

import { pathLength, samplePath, strokeCorners } from '@nihongo/shared/lib'
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
/** Where each stroke turns without the pen lifting: 口's right-then-down, フ, a hook. */
const referenceCorners = computed(() => referencePoints.value.map(points => strokeCorners(points)))

/**
 * The stroke to draw next, while following along with the guide on. It is
 * painted whole, in the hint colour, so a stroke that turns a corner reads as
 * ONE line: the ghost alone draws 口's second stroke exactly like two strokes
 * meeting, and nothing said the pen does not lift.
 */
const nextStroke = computed(() => props.showGuide && props.followAlong && !props.disabled
  ? referencePoints.value[strokes.value.length] ?? null
  : null)

/** The next stroke's length, worked out once rather than on every frame of the trace. */
const nextLength = computed(() => pathLength(nextStroke.value ?? []))

/** How far along the next stroke the tracing pen is, 0 to 1, or null when it is not moving. */
const trace = ref<number | null>(null)

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

/** A small open chevron centred on a point, pointing along `heading`. */
function drawChevron(ctx: CanvasRenderingContext2D, at: Point, heading: number, colour: string) {
  const SIZE = 2.2
  const back = heading + Math.PI
  ctx.save()
  ctx.strokeStyle = colour
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(at.x + Math.cos(back - 0.7) * SIZE, at.y + Math.sin(back - 0.7) * SIZE)
  ctx.lineTo(at.x + Math.cos(heading) * SIZE * 0.6, at.y + Math.sin(heading) * SIZE * 0.6)
  ctx.lineTo(at.x + Math.cos(back + 0.7) * SIZE, at.y + Math.sin(back + 0.7) * SIZE)
  ctx.stroke()
  ctx.restore()
}

/** The part of a stroke from its start to `fraction` of its `total` length, and where that ends. */
function strokeUpTo(points: Point[], total: number, fraction: number): { part: Point[], tip: Point } {
  const target = total * fraction
  const part: Point[] = [points[0]!]
  let run = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (run + seg >= target) {
      const t = seg === 0 ? 0 : (target - run) / seg
      const tip = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
      part.push(tip)
      return { part, tip }
    }
    run += seg
    part.push(b)
  }
  return { part, tip: points[points.length - 1]! }
}

/**
 * The next stroke, whole, with a chevron at every corner pointing the way it
 * goes on and an arrowhead at its end, so the path reads start to finish
 * without the pen lifting. The tracing pen runs along it on top.
 */
function drawNextStroke(ctx: CanvasRenderingContext2D, points: Point[], corners: StrokeCorner[], hint: string, ink: string, mark: string) {
  ctx.strokeStyle = hint
  ctx.lineWidth = 6
  drawPolyline(ctx, points)

  if (trace.value !== null) {
    const { part, tip } = strokeUpTo(points, nextLength.value, trace.value)
    ctx.save()
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = ink
    ctx.lineWidth = 3
    drawPolyline(ctx, part)
    ctx.globalAlpha = 1
    ctx.fillStyle = ink
    ctx.beginPath()
    ctx.arc(tip.x, tip.y, 2.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (const corner of corners)
    drawChevron(ctx, corner.at, corner.heading, mark)

  // The end: which way the stroke is travelling when the pen lifts.
  const last = points[points.length - 1]
  const before = points[Math.max(0, points.length - 4)]
  if (last && before && (last.x !== before.x || last.y !== before.y))
    drawChevron(ctx, last, Math.atan2(last.y - before.y, last.x - before.x), mark)
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

/** The theme's colours for the canvas, as CSS custom properties on it. */
function readPalette(el: HTMLCanvasElement) {
  const styles = getComputedStyle(el)
  return {
    ink: styles.getPropertyValue('--canvas-ink').trim() || '#1b2a33',
    guide: styles.getPropertyValue('--canvas-guide').trim() || '#dce6ec',
    hint: styles.getPropertyValue('--canvas-hint').trim() || '#8fb4c8',
    mark: styles.getPropertyValue('--canvas-mark').trim() || '#ffffff'
  }
}
let palette: ReturnType<typeof readPalette> | null = null

function draw(fromTrace = false) {
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

  // Read from the theme on every ordinary draw; a frame of the trace reuses the last read.
  if (!fromTrace || !palette)
    palette = readPalette(el)
  const { ink, guide, hint, mark } = palette

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
    if (nextStroke.value)
      drawNextStroke(ctx, nextStroke.value, referenceCorners.value[strokes.value.length] ?? [], hint, ink, mark)
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

/**
 * The tracing pen: a dot runs the next stroke from start to end in one go,
 * then waits, then runs it again, until the stroke is drawn. Watching it go
 * round 口's corner without stopping is what says "one stroke" best.
 * Paused while the reader is drawing, and off for reduced motion.
 */
/** The rest between runs of the pen, and the wait after the reader stops drawing. */
const TRACE_PAUSE_MS = 1400
/** A run of the pen takes about as long as a steady hand: so long per unit, within bounds. */
const TRACE_MS_PER_UNIT = 11
const TRACE_MIN_MS = 500
const TRACE_MAX_MS = 1400
let traceFrame = 0
let traceTimer: ReturnType<typeof setTimeout> | null = null

function stopTrace() {
  cancelAnimationFrame(traceFrame)
  if (traceTimer)
    clearTimeout(traceTimer)
  traceTimer = null
  trace.value = null
}

function startTrace() {
  stopTrace()
  const points = nextStroke.value
  if (!points || points.length < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    return
  // Nobody is watching a hidden tab: check back later instead of drawing.
  if (document.hidden) {
    traceTimer = setTimeout(startTrace, TRACE_PAUSE_MS)
    return
  }
  const duration = Math.min(TRACE_MAX_MS, Math.max(TRACE_MIN_MS, nextLength.value * TRACE_MS_PER_UNIT))
  const started = performance.now()
  const step = (now: number) => {
    if (active.value) {
      // The reader is drawing: get out of the way, and try again after.
      trace.value = null
      draw()
      traceTimer = setTimeout(startTrace, TRACE_PAUSE_MS)
      return
    }
    trace.value = Math.min(1, (now - started) / duration)
    draw(true)
    if (trace.value < 1) {
      traceFrame = requestAnimationFrame(step)
      return
    }
    traceTimer = setTimeout(() => {
      trace.value = null
      draw(true)
      traceTimer = setTimeout(startTrace, TRACE_PAUSE_MS / 2)
    }, TRACE_PAUSE_MS / 2)
  }
  traceFrame = requestAnimationFrame(step)
}

watch(nextStroke, startTrace, { immediate: true })

const observer = new ResizeObserver(() => draw())
watch(canvas, (el) => {
  observer.disconnect()
  if (el) {
    observer.observe(el)
    draw()
  }
}, { immediate: true })
watch(() => [props.reference, props.showGuide, props.showOrder, props.followAlong, props.revealStrokes], () => draw(), { deep: true })
onBeforeUnmount(() => {
  observer.disconnect()
  stopTrace()
})

defineExpose({ undo, clear })
</script>

<template>
  <canvas
    ref="canvas"
    class="aspect-square w-full touch-none rounded-2xl border border-line bg-card [--canvas-guide:var(--color-washi)] [--canvas-hint:var(--color-hover)] [--canvas-ink:var(--color-ink)] [--canvas-mark:var(--color-card)]"
    :class="disabled ? 'cursor-not-allowed' : 'cursor-crosshair'"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  />
</template>
