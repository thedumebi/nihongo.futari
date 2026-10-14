<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { GlossedToken } from '@nihongo/shared/types'

import { hasKanji, kanaLineToRomaji, kanaTokenToRomaji } from '@nihongo/shared/lib'
import { computed } from 'vue'

import FuriganaText from '@/components/ja/furigana-text.vue'

/**
 * One line of Japanese, cut into words you can tap.
 *
 * The reader asked to point at a word in a conversation and be told what it
 * means. The backend does the cutting — it has the dictionary — so all this
 * has to do is render the pieces and say which one was pressed.
 *
 * A token the dictionary did not recognise still renders; it simply is not a
 * button. Nothing is invented to fill the gap, so a particle or an inflection
 * ending sits there as plain text, exactly as it would have before.
 */
const props = defineProps<{
  tokens: GlossedToken[]
  /** The whole line, used when there is nothing better to fall back to. */
  text: string
  reading: string
  mode: FuriganaMode
  /** Which token is open, so it can be shown as pressed. */
  selected?: number | null
  /**
   * Kanji the reader already knows, for `unknown-only` furigana.
   *
   * Present so this can REPLACE FuriganaText rather than sit beside it. A
   * conversation line and a cloze sentence both need ruby AND tappable words;
   * two components cannot own the same run of text, so this one does both.
   */
  knownKanji?: Set<string>
}>()

const emit = defineEmits<{
  (e: 'pick', index: number | null): void
}>()

const romaji = computed(() => props.mode === 'romaji')

/**
 * Whether the line can be romanised word by word.
 *
 * Per-token readings come from splitting the line's kana along the token
 * boundaries, which fails on a line the backend could not line up. Falling
 * back to romanising the whole line keeps romaji mode readable — it just is
 * not tappable for that one line.
 */
const perToken = computed(() => {
  if (props.tokens.length === 0)
    return false
  // Romaji is the one mode that NEEDS a per-token reading; without one the
  // line can only be romanised whole. Every other mode renders the surface, so
  // tokens are usable — and tappable — with or without readings.
  return romaji.value ? props.tokens.some(t => t.r) : true
})

/**
 * Whether to hand the token to FuriganaText: a real furigana mode and
 * something to align against. In kana mode only a token WITH kanji goes there,
 * to have them spelled out; a kana token is already what it should be. Its
 * reading is phonetic — は is written わ there — so using it would teach the
 * wrong spelling.
 */
function ruby(token: GlossedToken): boolean {
  if (props.mode === 'kana')
    return Boolean(token.r) && hasKanji(token.t)
  return !romaji.value && props.mode !== 'off' && Boolean(token.r)
}

/**
 * The author's word break, kept in kana mode only.
 *
 * Hiragana with no kanji has nothing to show where a word ends, which is why
 * children's books in kana leave spaces. The breaks come from the reading,
 * the same place romaji gets them.
 */
function gap(token: GlossedToken, i: number): boolean {
  // Not after 、 or 。 — the punctuation already marks the break.
  return props.mode === 'kana' && i > 0 && /^\s/.test(token.r ?? '')
    && !/[、。！？「」]$/.test(props.tokens[i - 1]?.t ?? '')
}

const wholeLine = computed(() => romaji.value ? kanaLineToRomaji(props.reading) : props.text)

/**
 * A token as it should read.
 *
 * Word spacing is not decided here. Each token's reading arrives with the
 * author's own spaces already in it — the corpus writes `これ お おねがいします`
 * — so romanising it puts the breaks exactly where they were meant. Inferring
 * them instead got これを wrong as `koreo`, because を is not in the dictionary
 * and so looked like the middle of a word.
 */
function label(token: GlossedToken): string {
  // Kana mode, a word inside a run of kanji whose reading rode on the word
  // before: that reading already spelled it out, so printing the kanji too
  // doubled it — `じかんえいご英語`.
  if (props.mode === 'kana' && token.r === '' && hasKanji(token.t))
    return ''
  if (!romaji.value)
    return token.t
  // Per TOKEN, so the three particles read as they are spoken — を as `o`, は
  // as `wa`, へ as `e`. A whole-line converter cannot do that safely, which is
  // why cards used to show `tamago wo` and `watashi ha`. It also preserves the
  // leading space that marks a word boundary.
  return kanaTokenToRomaji(token.r ?? token.t)
}

function pick(index: number, token: GlossedToken) {
  if (!token.w)
    return
  emit('pick', props.selected === index ? null : index)
}
</script>

<template>
  <span v-if="!perToken" :style="romaji ? undefined : { fontFamily: 'var(--font-jp)' }">{{ wholeLine }}</span>

  <span v-else :style="romaji ? undefined : { fontFamily: 'var(--font-jp)' }"><template
    v-for="(token, i) in tokens"
    :key="i"
  ><span v-if="gap(token, i)" class="whitespace-pre">{{ " " }}</span><button
    v-if="token.w"
    type="button"
    class="whitespace-pre rounded underline decoration-dotted decoration-[var(--color-border)] underline-offset-4 transition hover:decoration-[var(--color-text)]"
    :class="selected === i ? 'bg-[var(--color-card)] decoration-[var(--color-text)]' : ''"
    :aria-label="`What does ${token.t} mean?`"
    @click.stop="pick(i, token)"
  ><template v-if="ruby(token)"><FuriganaText
    :text="token.t"
    :reading="token.r"
    :mode="mode"
    :known-kanji="knownKanji"
  /></template><template v-else>{{ label(token) }}</template></button><span
    v-else
    class="whitespace-pre-wrap"
  ><template v-if="ruby(token)"><FuriganaText
    :text="token.t"
    :reading="token.r"
    :mode="mode"
    :known-kanji="knownKanji"
  /></template><template v-else>{{ label(token) }}</template></span></template></span>
</template>
