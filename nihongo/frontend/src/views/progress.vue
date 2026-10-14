<script setup lang="ts">
import type { AchievementView, Readiness } from '@nihongo/shared/types'

import { ChevronRight } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import type { ProgressSummary } from '@/api/progress'

import { getReadiness, getSummary, listAchievements } from '@/api/progress'
import AppShell from '@/components/layout/app-shell.vue'
import AchievementCard from '@/components/progress/achievement-card.vue'
import LevelCard from '@/components/progress/level-card.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import { useLevel } from '@/composables/use-level'
import { ROUTES } from '@/constants'

const summary = ref<ProgressSummary | null>(null)
const loading = ref(true)
const errorMsg = ref('')

const stats = computed(() => {
  const s = summary.value
  if (!s)
    return []
  return [
    {
      label: 'Day streak',
      value: s.currentStreak,
      tip: 'Consecutive days you reviewed something. The day rolls over at 4am local, not midnight, so a late-night session still counts for that day.',
      to: null
    },
    {
      label: 'Longest streak',
      value: s.longestStreak,
      tip: 'The best run you have had. Kept as a record even after a streak breaks.',
      to: null
    },
    {
      // Says "cards" because it counts cards. It read "Items started" over a
      // card count, on the same page as a "Due now" measured in items — 38
      // against 25 real words. Every number here now names its own unit.
      label: 'Cards started',
      value: s.started,
      tip: 'Individual cards you have met at least once. A word is three or four cards — recognising it, reading it and hearing it are separate skills — so this is larger than the number of words. Starting a card is not the same as retaining it, which is why the stricter count sits beside it.',
      to: null
    },
    {
      label: 'Cards learned',
      value: s.learned,
      tip: 'Cards that graduated past the short learning steps, so they are genuinely retained rather than seen once. This is the number the JLPT coverage below counts, and it is in cards for the same reason that panel is.',
      to: null
    },
    {
      // One number, one definition, shared by Study, the due list and the
      // reminder email. It used to be this page's own — review-state only —
      // which is why it read 0 straight after a session, when every card sits
      // in a learning step, while the list it links to showed a full page.
      label: 'Due now',
      value: s.due,
      tip: s.due > 0
        ? `${s.due} ${s.due === 1 ? 'item' : 'items'} waiting — ${s.dueCards} ${s.dueCards === 1 ? 'card' : 'cards'} in total, since a word is several. ${s.learning > 0 ? `${s.learning} of them are still on short learning steps. ` : ''}The same number Study and the reminder show. Click to see exactly which ones.`
        : 'Nothing is due for review right now. New material is still available whenever you want it.',
      to: ROUTES.DUE
    },
    {
      label: 'Cards not yet seen',
      value: s.newAvailable,
      tip: 'Cards in the curriculum you have never met. Click to learn new ones only. Introduced a few a day rather than all at once, so reviews stay manageable.',
      to: `${ROUTES.STUDY}?mode=new`
    },
    {
      label: 'XP',
      value: s.totalXp,
      tip: 'Points from reviews, lessons, Speak, conversations, speeches, crosswords and quests. Recomputed from what you did, so it stays correct even when an offline session syncs late.',
      to: null
    }
  ]
})

/**
 * A glimpse of the shelf: the latest few earned, topped up with the nearest to
 * unlocking. The full shelf is its own page — it was a long scroll here.
 */
const SHELF_SIZE = 3
const achievements = ref<AchievementView[]>([])
const shelf = computed(() => {
  const earned = achievements.value
    .filter(a => a.unlockedAt)
    .sort((a, b) => b.unlockedAt!.localeCompare(a.unlockedAt!))
  const nearest = achievements.value
    .filter(a => !a.unlockedAt && !a.secret)
    .sort((a, b) => b.progress / b.threshold - a.progress / a.threshold)
  return [...earned, ...nearest].slice(0, SHELF_SIZE)
})

/**
 * Where each kind of content lives, at the level being shown — so a coverage
 * row leads to the things it counts instead of being a number about nothing.
 * Kinds without a browsing page of their own open on their Study deck.
 */
function coverageLink(kind: string, lvl: string): { label: string, to: string | { path: string, query: Record<string, string> } } {
  const deck = (label: string) => ({ label, to: { path: ROUTES.STUDY, query: { level: lvl, deck: `kind:${kind}` } } })
  switch (kind) {
    case 'dialogue': return { label: 'Conversations', to: { path: ROUTES.CONVERSATIONS, query: { level: lvl } } }
    case 'grammar': return { label: 'Grammar', to: ROUTES.GRAMMAR }
    case 'speak': return { label: 'Speak', to: ROUTES.SPEAK }
    case 'phonetic-series': return { label: 'Sound families', to: ROUTES.SOUND_SERIES }
    case 'word': return deck('Words')
    case 'sentence': return deck('Sentences')
    case 'kanji': return deck('Kanji')
    case 'kana': return deck('Kana')
    default: return deck(kind)
  }
}

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']
// Shared, but this page reports on exactly ONE level, so an empty shared
// value (meaning "all") falls back to N5 rather than sending no filter.
const { level: sharedLevel, loadLevel } = useLevel()
const level = computed({
  get: () => sharedLevel.value || 'N5',
  set: (v: string) => { sharedLevel.value = v }
})
const readiness = ref<Readiness | null>(null)

async function loadReadiness() {
  try {
    readiness.value = await getReadiness(level.value)
  } catch {
    readiness.value = null
  }
}

watch(level, loadReadiness)

onMounted(async () => {
  // Cached value renders now; the stored one replaces it when it lands.
  void loadLevel()
  void loadReadiness()
  void listAchievements().then((list) => {
    achievements.value = list.achievements
  }).catch(() => {})
  try {
    summary.value = await getSummary()
  } catch {
    errorMsg.value = 'Could not load your progress.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Progress
      </h1>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-8 text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>

      <dl v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Tooltip v-for="stat in stats" :key="stat.label" :content="stat.tip" position="top">
          <component
            :is="stat.to ? 'router-link' : 'div'"
            :to="stat.to ?? undefined"
            class="block rounded-xl border border-[var(--color-border)] p-5 transition"
            :class="stat.to ? 'hover:border-[var(--color-text)]' : ''"
          >
            <dt class="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              {{ stat.label }}
              <span v-if="stat.to" aria-hidden="true">&rarr;</span>
            </dt>
            <dd class="mt-1 text-3xl font-semibold tabular-nums">
              {{ stat.value }}
            </dd>
          </component>
        </Tooltip>
      </dl>

      <LevelCard v-if="summary" class="mt-8" :total-xp="summary.totalXp" />

      <!-- The course map left the menu: it is a view of progress, not a place to study. -->
      <router-link
        :to="ROUTES.COURSE"
        class="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]"
      >
        <span>
          <span class="block font-semibold">Course map</span>
          <span class="block text-sm text-[var(--color-muted)]">Every stage of words, kanji and kana that New words takes you through, and where you are.</span>
        </span>
        <ChevronRight class="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
      </router-link>

      <section class="mt-10">
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            JLPT coverage
          </h2>
          <Dropdown
            v-model="level"
            :options="LEVELS.map(l => ({ value: l, label: l }))"
            header="Level"
            width-class="w-28"
          />
        </div>

        <template v-if="readiness">
          <p class="mt-3 text-4xl font-semibold text-[var(--color-heading)]">
            {{ readiness.percent }}<span class="text-xl text-[var(--color-muted)]">%</span>
          </p>
          <!-- Said plainly: a share of this app's content is not a share of the
                 exam, and dressing it up as a score prediction would be a lie. -->
          <p class="mt-1 text-xs text-[var(--color-muted)]">
            {{ readiness.curriculumNote }}
          </p>

          <ul class="mt-4 space-y-2">
            <li v-for="c in readiness.coverage" :key="c.kind" class="text-sm">
              <router-link :to="coverageLink(c.kind, level).to" class="group -mx-2 block rounded-lg px-2 py-1 transition hover:bg-[var(--color-card)]">
                <div class="flex items-baseline justify-between">
                  <span class="flex items-center gap-1">
                    {{ coverageLink(c.kind, level).label }}
                    <ChevronRight class="h-3.5 w-3.5 text-[var(--color-muted)] transition group-hover:translate-x-0.5" />
                  </span>
                  <span class="text-[var(--color-muted)]">{{ c.known }} / {{ c.total }} cards</span>
                </div>
                <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-washi)]">
                  <div
                    class="h-full rounded-full bg-[var(--color-accent)]"
                    :style="{ width: `${c.total === 0 ? 0 : (c.known / c.total) * 100}%` }"
                  />
                </div>
              </router-link>
            </li>
          </ul>

          <p v-if="readiness.weakest" class="mt-4 text-sm text-[var(--color-muted)]">
            Weakest area:
            <router-link :to="coverageLink(readiness.weakest, level).to" class="text-[var(--color-text)] underline underline-offset-4">
              {{ coverageLink(readiness.weakest, level).label }}
            </router-link>
          </p>
        </template>
        <p v-else class="mt-3 text-sm text-[var(--color-muted)]">
          No coverage data for {{ level }} yet.
        </p>
      </section>

      <section v-if="achievements.length" class="mt-10">
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="text-xl font-semibold">
            Achievements
          </h2>
          <router-link :to="ROUTES.ACHIEVEMENTS" class="text-sm underline underline-offset-4">
            See all
          </router-link>
        </div>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          {{ achievements.filter(a => a.unlockedAt).length }} of {{ achievements.length }} unlocked.
        </p>
        <ul class="mt-4 grid grid-cols-1 gap-3">
          <li v-for="a in shelf" :key="a.code">
            <AchievementCard :achievement="a" />
          </li>
        </ul>
      </section>
    </div>
  </AppShell>
</template>
