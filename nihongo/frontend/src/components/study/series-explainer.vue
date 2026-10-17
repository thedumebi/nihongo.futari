<script setup lang="ts">
/**
 * What a sound series is — said once, then a tap away.
 *
 * Without it the series cards were a part beside some kanji and a question
 * nobody had been told how to answer. Shared by the card, the series page and
 * the list of series, so the idea is put the same way everywhere.
 */
import { toHiragana } from '@nihongo/shared/lib'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  open?: boolean
  /**
   * The family on screen, to give as the example: on 曽's page, 曽's kanji.
   * Without one (the list of every series) it falls back to 青.
   */
  example?: { component: string, reading: string, kanji: Array<{ character: string, reading: string }> }
  /**
   * A series the example must not be: the one a quiz is asking about, whose
   * reading the explainer would otherwise give away.
   */
  avoid?: string
}>(), { open: false })

const emit = defineEmits<{
  /** The reader closed it: they have read it. Opening it again is not news. */
  (e: 'closed'): void
}>()

const FALLBACKS = [
  { component: '青', reading: 'セイ', kanji: ['晴', '清', '静', '精'].map(character => ({ character, reading: 'セイ' })) },
  { component: '工', reading: 'コウ', kanji: ['紅', '功', '攻', '巧'].map(character => ({ character, reading: 'コウ' })) }
]

/** Up to four kanji of the family, and whether any are read a little differently (ゾウ beside ソウ). */
const shown = computed(() => {
  const e = props.example && props.example.kanji.length >= 2
    ? props.example
    : FALLBACKS.find(f => f.component !== props.avoid)!
  const kanji = e.kanji.slice(0, 4)
  return {
    component: e.component,
    reading: e.reading,
    kana: toHiragana(e.reading),
    list: kanji.map(k => k.character).join('・'),
    varies: kanji.some(k => k.reading !== e.reading)
  }
})

/** Browsers fire `toggle` when the box first renders open, too — only a close counts. */
function onToggle(event: Event) {
  if (!(event.target as HTMLDetailsElement).open)
    emit('closed')
}
</script>

<template>
  <details :open="open" class="rounded-lg border border-[var(--color-border)] p-4 text-left text-sm" @toggle="onToggle">
    <summary class="cursor-pointer font-medium">
      What is a sound series?
    </summary>
    <div class="mt-2 space-y-2 leading-relaxed text-[var(--color-muted)]">
      <p>
        Most kanji are built from two parts: one hints at the <strong>meaning</strong>, the other at the
        <strong>sound</strong>. Kanji that share a sound part usually share a reading.
      </p>
      <p style="font-family: var(--font-jp)">
        {{ shown.list }} all contain {{ shown.component }}, and all are read {{ shown.reading }} ({{ shown.kana }}){{ shown.varies ? ' or close to it' : '' }}.
      </p>
      <p>
        The reading is the <strong>on-reading</strong>, the one that came from Chinese, used mostly in words
        of two or more kanji. Dictionaries write it in katakana. It is a strong hint, not a rule.
      </p>
    </div>
  </details>
</template>
