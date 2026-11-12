<script setup lang="ts">
import type { StreakCalendar } from '@nihongo/shared/types'

import { FREEZE_CAP, FREEZE_EARN_EVERY } from '@nihongo/shared/lib'
import { DateTime } from 'luxon'
import { computed, onMounted, ref } from 'vue'

import { getStreakCalendar } from '@/api/progress'
import AppShell from '@/components/layout/app-shell.vue'
import StreakCalendarView from '@/components/progress/streak-calendar.vue'
import StreakDayDetail from '@/components/progress/streak-day-detail.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import { useLanguageStore } from '@/store/language'

/**
 * The streak, and a month-by-month calendar of what was done each day. Tap a
 * day to see it: the reviews, the lessons and sessions, and whether a freeze
 * covered it.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Reactive State ============
/** Months already read, so paging back and forth asks once each. */
const months = ref(new Map<string, StreakCalendar>())
const month = ref<string | null>(null)
const selected = ref<string | null>(null)
const loading = ref(true)
const failed = ref(false)

const freezeTip = `A freeze covers a day you miss, so your streak carries on. You earn one for every ${FREEZE_EARN_EVERY} days you study, and hold ${FREEZE_CAP} at most. Miss more days in a row than you have freezes and the streak starts again.`

// ============ Computed Properties ============
const shown = computed(() => (month.value ? months.value.get(month.value) : undefined) ?? null)
/** The latest read, for the numbers at the top: they are about today, whichever month is open. */
const latest = computed(() => [...months.value.values()].at(-1) ?? null)
const today = computed(() => latest.value?.today ?? '')
const selectedDay = computed(() => shown.value?.days.find(d => d.date === selected.value) ?? null)
const canGoBack = computed(() => {
  const firstDay = latest.value?.firstDay
  return Boolean(month.value && firstDay && firstDay.slice(0, 7) < month.value)
})
const canGoForward = computed(() => Boolean(month.value && today.value && month.value < today.value.slice(0, 7)))

// ============ Lifecycle Hooks ============
onMounted(() => load())

// ============ Methods ============
async function load(target?: string) {
  failed.value = false
  if (target && months.value.has(target)) {
    open(target)
    return
  }
  loading.value = true
  try {
    const calendar = await getStreakCalendar(target, lang.code)
    months.value.set(calendar.month, calendar)
    open(calendar.month)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

/** Show a month, keeping the selection inside it: today in this month, else its last day so far. */
function open(target: string) {
  month.value = target
  if (selected.value?.startsWith(target))
    return
  const end = DateTime.fromISO(`${target}-01`).endOf('month').toISODate()!
  selected.value = today.value.startsWith(target) ? today.value : end
}

function step(by: number) {
  if (month.value)
    void load(DateTime.fromISO(`${month.value}-01`).plus({ months: by }).toFormat('yyyy-MM'))
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        Streak
      </h1>

      <p v-if="loading && !latest" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed && !latest" class="mt-8 text-[var(--color-danger)]">
        Could not load your streak.
      </p>

      <template v-else-if="latest">
        <dl class="mt-6 grid grid-cols-3 gap-3">
          <div class="rounded-xl border border-[var(--color-border)] p-4">
            <dt class="text-sm text-[var(--color-muted)]">
              Current
            </dt>
            <dd class="mt-1 text-2xl font-semibold tabular-nums">
              {{ latest.currentStreak }} <span class="text-sm font-normal text-[var(--color-muted)]">{{ latest.currentStreak === 1 ? 'day' : 'days' }}</span>
            </dd>
          </div>
          <div class="rounded-xl border border-[var(--color-border)] p-4">
            <dt class="text-sm text-[var(--color-muted)]">
              Longest
            </dt>
            <dd class="mt-1 text-2xl font-semibold tabular-nums">
              {{ latest.longestStreak }} <span class="text-sm font-normal text-[var(--color-muted)]">{{ latest.longestStreak === 1 ? 'day' : 'days' }}</span>
            </dd>
          </div>
          <div class="rounded-xl border border-[var(--color-border)] p-4">
            <dt class="text-sm text-[var(--color-muted)]">
              <Tooltip :content="freezeTip" position="bottom">
                <span class="underline decoration-dotted underline-offset-4">Freezes</span>
              </Tooltip>
            </dt>
            <dd class="mt-1 text-2xl font-semibold tabular-nums">
              {{ latest.freezes }} <span class="text-sm font-normal text-[var(--color-muted)]">of {{ FREEZE_CAP }}</span>
            </dd>
          </div>
        </dl>

        <StreakCalendarView
          v-if="shown && selected"
          class="mt-6"
          :month="shown.month"
          :today="today"
          :days="shown.days"
          :selected="selected"
          :can-go-back="canGoBack"
          :can-go-forward="canGoForward"
          :loading="loading"
          @select="selected = $event"
          @back="step(-1)"
          @forward="step(1)"
        />
        <p v-if="failed" class="mt-3 text-sm text-[var(--color-danger)]">
          Could not load that month.
        </p>

        <StreakDayDetail v-if="shown && selected" class="mt-4" :date="selected" :today="today" :day="selectedDay" />
      </template>
    </div>
  </AppShell>
</template>
