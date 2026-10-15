<script setup lang="ts">
/**
 * What a sound series is — said once, then a tap away.
 *
 * Without it the series cards were a part beside some kanji and a question
 * nobody had been told how to answer. Shared by the card, the series page and
 * the list of series, so the idea is put the same way everywhere.
 */
withDefaults(defineProps<{ open?: boolean }>(), { open: false })

const emit = defineEmits<{
  /** The reader closed it: they have read it. Opening it again is not news. */
  (e: 'closed'): void
}>()

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
        晴・清・静・精 all contain 青, and all are read セイ (せい).
      </p>
      <p>
        The reading is the <strong>on-reading</strong>, the one that came from Chinese, used mostly in words
        of two or more kanji. Dictionaries write it in katakana. It is a strong hint, not a rule.
      </p>
    </div>
  </details>
</template>
