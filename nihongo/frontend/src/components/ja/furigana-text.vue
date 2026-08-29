<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { FuriganaSegment } from '@nihongo/shared/types'

import { alignFurigana, kanaToRomaji } from '@nihongo/shared/lib'
import { computed } from 'vue'

/**
 * Japanese text with real `<ruby>` furigana.
 *
 * Real ruby, not stacked spans: it copies as plain text, screen readers handle
 * it, and browsers position it correctly at any font size.
 *
 * Four states, because a fixed choice is wrong for everyone eventually:
 *  - `off`     — no ruby. What reading practice actually requires.
 *  - `always`       — ruby everywhere.
 *  - `unknown-only` — ruby only over kanji you have not learned yet, the state
 *                     that keeps a sentence readable without doing the reading
 *                     work for you.
 *  - `romaji`       — the same readings, in latin letters, and over kana too.
 *                     Furigana assumes the kana are already fluent; in the
 *                     first weeks they are not, and ruby then explains one
 *                     unknown script with another. Unconditional: everything
 *                     that can be romanised is, whether or not the reader has
 *                     met it before.
 *
 * Pre-aligned `segments` are preferred; passing `reading` aligns on the fly,
 * which is only safe for single words whose alignment was already checked.
 */
const props = withDefaults(defineProps<{
  text: string
  /** Pre-computed alignment, as stored on sentence_tokens.furigana. */
  segments?: FuriganaSegment[]
  /** Fallback when no segments exist. */
  reading?: string
  mode?: FuriganaMode
  /** Kanji the reader already knows. Only consulted in `unknown-only` mode. */
  knownKanji?: Set<string>
}>(), {
  segments: undefined,
  reading: '',
  mode: 'unknown-only',
  knownKanji: undefined
})

/** Kana and kanji. Anything else cannot carry a reading. */
const JAPANESE = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/

/**
 * The ruby text for a segment, in whichever script the mode asks for.
 *
 * Converted at render rather than stored twice: the kana reading is the one
 * source of truth, and a stored romaji column would be a second copy to keep
 * in step for no gain.
 */
function rubyFor(segment: FuriganaSegment): string {
  if (props.mode !== 'romaji')
    return segment.r ?? ''
  // In romaji mode a kana-only segment romanises ITSELF. It carries no `r`
  // because kana need no furigana — but the whole point of this mode is that
  // the kana are not fluent yet, so leaving は bare is the one thing it must
  // not do.
  return kanaToRomaji(segment.r ?? segment.t)
}

const resolved = computed<FuriganaSegment[]>(() => {
  if (props.segments?.length)
    return props.segments
  if (props.reading)
    return alignFurigana(props.text, props.reading).segments
  return [{ t: props.text }]
})

/** Whether a segment should render ruby right now. */
function showsRuby(segment: FuriganaSegment): boolean {
  if (props.mode === 'off')
    return false

  // Romaji covers kana as well as kanji, so a segment with no reading of its
  // own still gets ruby — as long as romanising it changes anything at all.
  // Punctuation and latin text come back unchanged and are left alone.
  // Romaji does NOT fade as characters are learned. It was doing so, on the
  // reasoning that a reading you no longer need is noise — but the point of
  // picking romaji is to be able to read the page, and a page where some words
  // carry a reading and others do not is harder to read than either extreme.
  // Selected means everywhere.
  if (props.mode === 'romaji') {
    // A segment with no Japanese in it has nothing to romanise, and putting
    // ruby over English is worse than putting none over anything.
    if (!segment.r && !JAPANESE.test(segment.t))
      return false
    return Boolean(segment.r) || kanaToRomaji(segment.t) !== segment.t
  }

  if (!segment.r)
    return false
  if (props.mode === 'always')
    return true
  return !isKnown(segment)
}

/**
 * Whether every character in a segment is already known.
 *
 * A multi-character run keeps its ruby unless the WHOLE run is familiar, since
 * the reading covers the run rather than any one character in it.
 *
 * With no set supplied, nothing counts as known — showing a reading the reader
 * did not need is a smaller failure than withholding one they did.
 */
function isKnown(segment: FuriganaSegment): boolean {
  const known = props.knownKanji
  if (!known)
    return false
  return [...segment.t].every(char => known.has(char))
}
</script>

<template>
  <span>
    <template v-for="(segment, i) in resolved" :key="i">
      <ruby v-if="showsRuby(segment)">{{ segment.t }}<rp>(</rp><rt>{{ rubyFor(segment) }}</rt><rp>)</rp></ruby>
      <template v-else>{{ segment.t }}</template>
    </template>
  </span>
</template>

<style scoped>
ruby {
  ruby-position: over;
}

rt {
  font-size: 0.5em;
  /* Ruby sits tight to the glyph by default and reads as noise; a little air
     makes it legible without pushing the line height around. */
  line-height: 1.2;
  opacity: 0.75;
  user-select: none;
}
</style>
