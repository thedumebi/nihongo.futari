<script setup lang="ts">
import type { ActivityKind } from '@nihongo/shared/constants'
import type { StreakDay } from '@nihongo/shared/types'

import { Snowflake } from 'lucide-vue-next'
import { DateTime } from 'luxon'
import { computed } from 'vue'

/**
 * What a learner did on one day of the streak calendar: reviews, then every
 * other kind of study, and whether a freeze covered the day or was earned on it.
 */
interface Props {
  /** YYYY-MM-DD. */
  date: string
  today: string
  /** Null for a day with nothing to show. */
  day: StreakDay | null
}

const props = defineProps<Props>()

const MS_PER_MINUTE = 60_000

/** Each kind as a thing done, singular and plural. */
const ACTIVITY_NAMES: Record<ActivityKind, [string, string]> = {
  'lesson': ['grammar lesson', 'grammar lessons'],
  'kana-lesson': ['kana lesson', 'kana lessons'],
  'speak': ['Speak session', 'Speak sessions'],
  'speak-listen': ['Speak session listened through', 'Speak sessions listened through'],
  'crossword': ['crossword', 'crosswords'],
  'conversation': ['conversation practised', 'conversations practised'],
  'reading': ['speech read aloud', 'speeches read aloud'],
  'recall': ['Recall session', 'Recall sessions'],
  'shadowing': ['conversation shadowed', 'conversations shadowed'],
  'listening-game': ['round of Listening', 'rounds of Listening'],
  'kanji-build': ['round of Build a kanji', 'rounds of Build a kanji'],
  'ghost-boss': ['ghost boss fight', 'ghost boss fights'],
  'story': ['Speak story', 'Speak stories'],
  'verb-forms': ['round of Verb forms', 'rounds of Verb forms'],
  'particles': ['round of Particles', 'rounds of Particles']
}

// ============ Computed Properties ============
const heading = computed(() => props.date === props.today ? 'Today' : DateTime.fromISO(props.date).toFormat('cccc d LLLL'))

/** One line per thing done, reviews first. */
const lines = computed(() => {
  const d = props.day
  if (!d)
    return []
  const out: string[] = []
  if (d.reviews > 0) {
    const minutes = Math.round(d.reviewMs / MS_PER_MINUTE)
    out.push(`${d.reviews} ${d.reviews === 1 ? 'review' : 'reviews'}${minutes > 0 ? `, ${minutes} min` : ''}`)
  }
  if (d.newCards > 0)
    out.push(`${d.newCards} new ${d.newCards === 1 ? 'card' : 'cards'}`)
  for (const a of d.activities) {
    const [one, many] = ACTIVITY_NAMES[a.kind]
    out.push(`${a.count} ${a.count === 1 ? one : many}`)
  }
  return out
})

const nothing = computed(() => props.date === props.today ? 'Nothing yet today.' : 'Nothing studied this day.')
</script>

<template>
  <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5" aria-live="polite">
    <h2 class="font-semibold">
      {{ heading }}
    </h2>

    <ul v-if="lines.length > 0" class="mt-3 space-y-1.5">
      <li v-for="line in lines" :key="line" class="flex items-center gap-2">
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
        {{ line }}
      </li>
    </ul>
    <p v-else-if="!day?.freezeUsed" class="mt-2 text-[var(--color-muted)]">
      {{ nothing }}
    </p>

    <p v-if="day?.freezeUsed" class="mt-3 flex items-center gap-2">
      <Snowflake class="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
      A freeze covered this day, so your streak carried on.
    </p>
    <p v-if="day?.freezeEarned" class="mt-3 flex items-center gap-2 text-[var(--color-muted)]">
      <Snowflake class="h-4 w-4 shrink-0" />
      You earned a freeze this day.
    </p>
  </section>
</template>
