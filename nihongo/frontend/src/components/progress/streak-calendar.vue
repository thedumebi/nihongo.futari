<script setup lang="ts">
import type { StreakDay } from '@nihongo/shared/types'

import { ChevronLeft, ChevronRight, Snowflake } from 'lucide-vue-next'
import { DateTime } from 'luxon'
import { computed } from 'vue'

/**
 * One month of the streak, Monday first. A day studied carries a dot, a day a
 * freeze covered carries a snowflake, and a day with nothing carries nothing.
 * Tapping a day up to today selects it; the page shows what was done.
 */
interface Props {
  /** YYYY-MM. */
  month: string
  /** The learner's study day, YYYY-MM-DD. */
  today: string
  /** Days with something to show; any other day is drawn bare. */
  days: StreakDay[]
  /** YYYY-MM-DD, the day whose detail is open. */
  selected: string
  canGoBack: boolean
  canGoForward: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { loading: false })

const emit = defineEmits<{
  select: [date: string]
  back: []
  forward: []
}>()

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ============ Computed Properties ============
const first = computed(() => DateTime.fromISO(`${props.month}-01`))
const title = computed(() => first.value.toFormat('LLLL yyyy'))
const byDate = computed(() => new Map(props.days.map(d => [d.date, d])))

/** Blanks before the 1st, so it falls under its weekday. */
const leading = computed(() => first.value.weekday - 1)

const cells = computed(() => Array.from({ length: first.value.daysInMonth ?? 0 }, (_, i) => {
  const date = first.value.plus({ days: i }).toISODate()!
  const day = byDate.value.get(date)
  return {
    date,
    number: i + 1,
    studied: day?.studied ?? false,
    freezeUsed: day?.freezeUsed ?? false,
    future: date > props.today,
    isToday: date === props.today
  }
}))

// ============ Methods ============
/** What the day held, for a screen reader. */
function statusOf(cell: typeof cells.value[number]): string {
  if (cell.studied)
    return 'studied'
  if (cell.freezeUsed)
    return 'covered by a freeze'
  return 'nothing studied'
}

function label(cell: typeof cells.value[number]): string {
  const when = DateTime.fromISO(cell.date).toFormat('cccc d LLLL')
  return cell.future ? when : `${when}, ${statusOf(cell)}`
}
</script>

<template>
  <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="rounded-lg p-2 transition hover:bg-[var(--color-washi)] disabled:opacity-30 disabled:hover:bg-transparent"
        :disabled="!canGoBack || loading"
        aria-label="Previous month"
        @click="emit('back')"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>
      <h2 class="font-semibold" aria-live="polite">
        {{ title }}
      </h2>
      <button
        type="button"
        class="rounded-lg p-2 transition hover:bg-[var(--color-washi)] disabled:opacity-30 disabled:hover:bg-transparent"
        :disabled="!canGoForward || loading"
        aria-label="Next month"
        @click="emit('forward')"
      >
        <ChevronRight class="h-5 w-5" />
      </button>
    </div>

    <div class="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-[var(--color-muted)]">
      <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
    </div>

    <div class="mt-1 grid grid-cols-7 gap-1" :class="loading ? 'opacity-50' : ''">
      <span v-for="n in leading" :key="`blank-${n}`" aria-hidden="true" />
      <button
        v-for="cell in cells"
        :key="cell.date"
        type="button"
        class="flex aspect-square flex-col items-center justify-center rounded-lg text-sm tabular-nums transition"
        :class="[
          cell.future ? 'text-[var(--color-muted)] opacity-40' : 'hover:bg-[var(--color-washi)]',
          cell.date === selected ? 'bg-[var(--color-washi)] font-semibold' : '',
          cell.isToday ? 'ring-1 ring-[var(--color-accent)]' : '',
        ]"
        :disabled="cell.future"
        :aria-pressed="cell.date === selected"
        :aria-label="label(cell)"
        @click="emit('select', cell.date)"
      >
        {{ cell.number }}
        <span class="mt-0.5 flex h-3 items-center" aria-hidden="true">
          <Snowflake v-if="cell.freezeUsed" class="h-3 w-3 text-[var(--color-accent)]" />
          <span v-else-if="cell.studied" class="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        </span>
      </button>
    </div>

    <p class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
      <span class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" /> Studied</span>
      <span class="flex items-center gap-1.5"><Snowflake class="h-3 w-3 text-[var(--color-accent)]" /> A freeze covered it</span>
    </p>
  </section>
</template>
