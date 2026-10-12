<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { ReadingLineView, WordGloss } from '@nihongo/shared/types'

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import TokenLine from '@/components/ja/token-line.vue'

/**
 * A speech scrolling up the screen, for reading aloud.
 *
 * Native scrolling underneath, driven forward a fraction of a pixel per frame.
 * That keeps manual scrolling, the scroll wheel and the keyboard working for
 * free: any of them simply pauses the drive and leaves the text where the
 * reader put it, and play resumes from there.
 *
 * Every line is still a row of tappable words. Tapping one pauses — you cannot
 * read a definition off a moving target — and pressing and holding a line
 * shows its English underneath it.
 */
interface Props {
  stanzas: ReadingLineView[][]
  mode: FuriganaMode
  knownKanji?: Set<string>
  /** Pixels per second. */
  speed: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  pick: [word: WordGloss | null]
  end: []
}>()

const playing = defineModel<boolean>('playing', { required: true })

// ============ Reactive State ============
const viewport = ref<HTMLElement | null>(null)
/** The open word, as (line index, token index), so it renders pressed. */
const picked = ref<{ line: number, token: number } | null>(null)
/** Lines whose English is showing. */
const translated = ref(new Set<number>())

/** Long-press within this long shows a line's English. */
const HOLD_MS = 450
/** A press that moves further than this is a scroll, not a hold. */
const HOLD_SLOP_PX = 10

let frame = 0
let last = 0
/** Sub-pixel position. `scrollTop` rounds on some browsers, so it is not read back mid-run. */
let position = 0
let holdTimer: ReturnType<typeof setTimeout> | null = null
let holdStart: { x: number, y: number } | null = null
/** Set when a hold fired, so the click that ends it does not also open a word. */
let swallowClick = false

// ============ Watchers ============
watch(playing, (on) => {
  cancelAnimationFrame(frame)
  const el = viewport.value
  if (!on || !el)
    return
  // Pressing play at the end starts again from the top.
  if (Math.ceil(el.scrollTop) >= el.scrollHeight - el.clientHeight)
    el.scrollTop = 0
  position = el.scrollTop
  last = 0
  frame = requestAnimationFrame(tick)
})

// ============ Lifecycle Hooks ============
onMounted(() => {
  document.addEventListener('visibilitychange', pauseWhenHidden)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  clearHold()
  document.removeEventListener('visibilitychange', pauseWhenHidden)
})

// ============ Methods ============
function tick(now: number) {
  const el = viewport.value
  if (!playing.value || !el)
    return
  // The first frame only sets the clock; a frame gap after a pause would
  // otherwise jump the text by however long the pause lasted.
  const seconds = last ? Math.min(now - last, 100) / 1000 : 0
  last = now
  position += props.speed * seconds

  const end = el.scrollHeight - el.clientHeight
  if (position >= end) {
    el.scrollTop = end
    playing.value = false
    emit('end')
    return
  }
  el.scrollTop = position
  frame = requestAnimationFrame(tick)
}

function pause() {
  playing.value = false
}

function pauseWhenHidden() {
  if (document.hidden)
    pause()
}

function restart() {
  if (viewport.value)
    viewport.value.scrollTop = 0
  position = 0
}

function onPick(line: number, tokens: ReadingLineView['tokens'], token: number | null) {
  if (swallowClick) {
    swallowClick = false
    return
  }
  pause()
  picked.value = token === null ? null : { line, token }
  emit('pick', token === null ? null : tokens[token]?.w ?? null)
}

function clearPick() {
  picked.value = null
}

function startHold(line: number, event: PointerEvent) {
  clearHold()
  swallowClick = false
  holdStart = { x: event.clientX, y: event.clientY }
  holdTimer = setTimeout(() => {
    holdTimer = null
    swallowClick = true
    pause()
    const next = new Set(translated.value)
    if (next.has(line))
      next.delete(line)
    else
      next.add(line)
    translated.value = next
  }, HOLD_MS)
}

function moveHold(event: PointerEvent) {
  if (!holdStart)
    return
  if (Math.hypot(event.clientX - holdStart.x, event.clientY - holdStart.y) > HOLD_SLOP_PX)
    clearHold()
}

function clearHold() {
  if (holdTimer)
    clearTimeout(holdTimer)
  holdTimer = null
  holdStart = null
}

/** A click that ends a hold must not reach the word underneath. */
function guardClick(event: MouseEvent) {
  if (!swallowClick)
    return
  swallowClick = false
  event.stopPropagation()
  event.preventDefault()
}

function selectedOn(line: number): number | null {
  return picked.value?.line === line ? picked.value.token : null
}

defineExpose({ restart, clearPick })
</script>

<template>
  <div
    ref="viewport"
    class="stage relative overflow-y-auto overscroll-contain select-none"
    tabindex="0"
    aria-label="Speech. Scroll, or use the play button to scroll it automatically."
    @wheel.passive="pause"
    @touchstart.passive="pause"
    @keydown.up="pause"
    @keydown.down="pause"
    @keydown.page-up="pause"
    @keydown.page-down="pause"
    @keydown.space.prevent="playing = !playing"
  >
    <div class="stage-inner mx-auto max-w-xl px-4 text-center">
      <section v-for="(stanza, s) in stanzas" :key="s" class="mb-12 last:mb-0">
        <div
          v-for="line in stanza"
          :key="line.index"
          class="line rounded-lg py-1"
          @pointerdown="startHold(line.index, $event)"
          @pointermove="moveHold"
          @pointerup="clearHold"
          @pointercancel="clearHold"
          @pointerleave="clearHold"
          @click.capture="guardClick"
          @contextmenu.prevent
        >
          <p class="text-2xl sm:text-3xl" :class="mode === 'romaji' ? 'leading-relaxed' : 'leading-[2.3]'">
            <TokenLine
              :tokens="line.tokens"
              :text="line.text"
              :reading="line.reading"
              :mode="mode"
              :known-kanji="knownKanji"
              :selected="selectedOn(line.index)"
              @pick="onPick(line.index, line.tokens, $event)"
            />
          </p>
          <p v-if="translated.has(line.index)" class="mt-1 text-base text-[var(--color-muted)]">
            {{ line.translation }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.stage {
  --stage-h: min(55svh, 560px);
  height: var(--stage-h);
  scrollbar-width: none;
  /* The reel look: lines fade in at the bottom and out at the top. */
  mask-image: linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent);
  -webkit-touch-callout: none;
}

.stage::-webkit-scrollbar {
  display: none;
}

.stage:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

/* Half a stage of space either side, so the first line starts in the middle
   and the last one can scroll up to it. */
.stage-inner {
  padding-block: calc(var(--stage-h) * 0.45);
}
</style>
