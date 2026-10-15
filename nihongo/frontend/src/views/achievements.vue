<script setup lang="ts">
import type { AchievementView } from '@nihongo/shared/types'

import { computed, onMounted, ref } from 'vue'

import { listAchievements } from '@/api/progress'
import AppShell from '@/components/layout/app-shell.vue'
import AchievementCard from '@/components/progress/achievement-card.vue'
import Segmented from '@/components/ui/segmented.vue'
import { ROUTES } from '@/constants'

/**
 * Every achievement, grouped by what it is for.
 *
 * Its own page because the shelf outgrew Progress: thirty cards under the
 * stats and the coverage meant a long scroll to find any of them. Progress
 * keeps the latest few and links here. Secret ones stay hidden until earned.
 */

// ============ Reactive State ============
const achievements = ref<AchievementView[]>([])
const loading = ref(true)
const failed = ref(false)
const show = ref<'all' | 'unlocked' | 'locked'>('all')
const SHOW_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'unlocked' as const, label: 'Unlocked' },
  { value: 'locked' as const, label: 'In progress' }
]

// ============ Computed Properties ============
const visible = computed(() => achievements.value
  .filter(a => a.unlockedAt || !a.secret)
  .filter(a => show.value === 'all' || (show.value === 'unlocked') === Boolean(a.unlockedAt)))

/** By category, in the order categories first appear; unlocked first, then nearest to unlocking. */
const groups = computed(() => {
  const out = new Map<string, AchievementView[]>()
  for (const a of visible.value)
    out.set(a.category, [...(out.get(a.category) ?? []), a])
  return [...out.entries()].map(([category, items]) => ({
    category,
    items: items.sort((a, b) => Number(Boolean(b.unlockedAt)) - Number(Boolean(a.unlockedAt)) || b.progress / b.threshold - a.progress / a.threshold)
  }))
})
const unlocked = computed(() => achievements.value.filter(a => a.unlockedAt).length)

// ============ Lifecycle Hooks ============
onMounted(async () => {
  try {
    achievements.value = (await listAchievements()).achievements
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.PROGRESS" class="text-sm underline underline-offset-4">
        &larr; Progress
      </router-link>
      <h1 class="mt-4 text-3xl font-semibold">
        Achievements
      </h1>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-8 text-[var(--color-danger)]">
        Could not load your achievements.
      </p>

      <template v-else>
        <p class="mt-1 text-[var(--color-muted)]">
          {{ unlocked }} of {{ achievements.length }} unlocked.
        </p>
        <Segmented v-model="show" class="mt-6" label="Show" :options="SHOW_OPTIONS" />

        <p v-if="groups.length === 0" class="mt-8 text-[var(--color-muted)]">
          {{ show === 'unlocked' ? 'Nothing unlocked yet. Your first comes with your first review.' : 'Nothing here.' }}
        </p>
        <section v-for="g in groups" :key="g.category" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ g.category }}
          </h2>
          <ul class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li v-for="a in g.items" :key="a.code">
              <AchievementCard :achievement="a" />
            </li>
          </ul>
        </section>
      </template>
    </div>
  </AppShell>
</template>
