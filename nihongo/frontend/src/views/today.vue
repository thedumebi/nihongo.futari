<script setup lang="ts">
import { BookOpen, Flame, Grid3x3, Layers, Mic, RotateCcw } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'
import { useAuthStore } from '@/store/auth'
import { useLanguageStore } from '@/store/language'
import { useTodayStore } from '@/store/today'

/**
 * Today: what to do now, in the order worth doing it.
 *
 * Reviews first — they are what keeps what you have learned — then something
 * new: today's words, the next lesson, the next Speak session, the crossword.
 * The app opened on a sales page and then a choice of thirteen tabs; this is
 * the one screen that answers "where do I start".
 */

// ============ Stores ============
const auth = useAuthStore()
const lang = useLanguageStore()
const store = useTodayStore()

// ============ Reactive State ============
const loading = ref(true)

// ============ Computed Properties ============
const today = computed(() => store.today)
const firstName = computed(() => (auth.user?.name ?? '').split(' ')[0] ?? '')
const newLeft = computed(() => Math.max(0, (today.value?.newLimit ?? 0) - (today.value?.newToday ?? 0)))

// ============ Lifecycle Hooks ============
onMounted(async () => {
  await store.refresh(lang.code, true)
  loading.value = false
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        {{ firstName ? `Hi, ${firstName}` : 'Today' }}
      </h1>

      <p v-if="loading && !today" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>

      <template v-else-if="today">
        <!-- The streak, said plainly. -->
        <p class="mt-2 flex items-center gap-1.5 text-[var(--color-muted)]">
          <Flame class="h-4 w-4" :class="today.streak.studiedToday ? 'text-[var(--color-accent)]' : ''" />
          <template v-if="today.streak.current === 0">
            Start a streak today.
          </template>
          <template v-else-if="today.streak.studiedToday">
            {{ today.streak.current }}-day streak — today counts.
          </template>
          <template v-else>
            {{ today.streak.current }}-day streak — study today to keep it.
          </template>
          <span class="ml-auto text-sm">Level {{ today.xp.level }}</span>
        </p>

        <!-- 1. Reviews: keep what you have. -->
        <section class="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <RotateCcw class="h-4 w-4" /> Review
          </div>
          <template v-if="today.due > 0">
            <p class="mt-2 text-xl font-semibold">
              {{ today.due }} {{ today.due === 1 ? 'item is' : 'items are' }} waiting
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]">
              Do these first — they are what keeps the words you have learned.
            </p>
            <Button class="mt-4" :to="ROUTES.REVIEW">
              Review now
            </Button>
          </template>
          <p v-else class="mt-2 text-lg">
            Nothing due. Everything you have learned is resting.
          </p>
        </section>

        <!-- 2. New words, within today's limit. -->
        <section class="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Layers class="h-4 w-4" /> Learn
          </div>
          <template v-if="newLeft > 0">
            <p class="mt-2 text-xl font-semibold">
              {{ newLeft }} new {{ newLeft === 1 ? 'word' : 'words' }} for today
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]">
              {{ today.newToday }} of {{ today.newLimit }} learned so far today.
            </p>
            <Button class="mt-4" :variant="today.due > 0 ? 'ghost' : 'primary'" :to="ROUTES.LEARN">
              Learn new words
            </Button>
          </template>
          <template v-else>
            <p class="mt-2 text-lg">
              You have learned today's {{ today.newLimit }} new words.
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]">
              Letting them settle beats piling on more. You can change the daily number in
              <router-link :to="ROUTES.SETTINGS" class="underline underline-offset-4">
                Settings
              </router-link>.
            </p>
          </template>
        </section>

        <!-- 3. Something to work through. -->
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <router-link
            v-if="today.nextLesson"
            :to="ROUTES.LESSON_DETAIL(today.nextLesson.slug)"
            class="rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]"
          >
            <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <BookOpen class="h-4 w-4" /> Next lesson · {{ today.nextLesson.level }}
            </div>
            <p class="mt-2 font-semibold" style="font-family: var(--font-jp)">
              {{ today.nextLesson.title }}
            </p>
          </router-link>
          <router-link
            v-if="today.nextSpeak"
            :to="ROUTES.SPEAK_SESSION(today.nextSpeak.code)"
            class="rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]"
          >
            <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Mic class="h-4 w-4" /> Speak · {{ today.nextSpeak.level }} session {{ today.nextSpeak.number }}
            </div>
            <p class="mt-2 font-semibold">
              {{ today.nextSpeak.titleEn }}
            </p>
          </router-link>
          <router-link
            :to="ROUTES.CROSSWORD"
            class="rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]"
          >
            <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Grid3x3 class="h-4 w-4" /> Crossword
            </div>
            <p class="mt-2 font-semibold">
              Today's puzzle
            </p>
          </router-link>
        </div>
      </template>

      <p v-else class="mt-10 text-center text-[var(--color-muted)]">
        Could not load today — check your connection.
      </p>
    </div>
  </AppShell>
</template>
