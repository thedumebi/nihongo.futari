<script setup lang="ts">
import { levelProgress } from '@nihongo/shared/lib'
import { BookOpen, Check, ChevronRight, Flame, Grid3x3, Headphones, Layers, Mic, RotateCcw, ScrollText, Target } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import CoverageBadge from '@/components/ja/coverage-badge.vue'
import AppShell from '@/components/layout/app-shell.vue'
import GettingStarted from '@/components/onboarding/getting-started.vue'
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

// ============ Constants ============
/** Where each quest is done, so a quest is a way in rather than a chore list. */
const QUEST_LINKS: Record<string, string> = {
  'reviews-20': ROUTES.DUE,
  'reviews-50': ROUTES.DUE,
  'new-5': ROUTES.LEARN,
  'speak-1': ROUTES.SPEAK,
  'story-1': ROUTES.SPEAK,
  'lesson-1': ROUTES.LESSONS,
  'conversation-2': ROUTES.CONVERSATIONS,
  'shadowing-1': ROUTES.CONVERSATIONS,
  'reading-1': ROUTES.READ,
  'crossword-1': ROUTES.CROSSWORD,
  'recall-1': ROUTES.RECALL,
  'game-1': ROUTES.GAMES
}

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
/** Extra practice (other cards of words already met) still to come once the new words are done. */
const extrasLeft = computed(() => today.value?.extrasLeft ?? 0)

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
            {{ today.streak.current }}-day streak. Today counts.
          </template>
          <template v-else>
            {{ today.streak.current }}-day streak. Study today to keep it.
          </template>
          <router-link :to="ROUTES.PROGRESS" class="ml-auto text-sm underline-offset-4 hover:underline">
            Level {{ today.xp.level }} · {{ levelProgress(today.xp.total).toNext }} XP to {{ today.xp.level + 1 }}
          </router-link>
        </p>

        <!-- Onboarding: the offer, or the first-week guide while it lasts. -->
        <GettingStarted />

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
              Do these first. They are what keeps the words you have learned.
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
          <template v-else-if="extrasLeft > 0">
            <p class="mt-2 text-xl font-semibold">
              Practising words you've met
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]">
              Today's {{ today.newLimit }} new words are done. {{ extrasLeft }} more {{ extrasLeft === 1 ? 'card' : 'cards' }}
              of words you have met: another way to practise each.
            </p>
            <Button class="mt-4" :variant="today.due > 0 ? 'ghost' : 'primary'" :to="ROUTES.LEARN">
              Keep practising
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

        <!-- Today's quests: small goals that nudge variety, the same all day. -->
        <section v-if="today.quests.length" class="mt-4 rounded-xl border border-[var(--color-border)] p-5">
          <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Target class="h-4 w-4" /> Today's quests
          </div>
          <ul class="mt-3 space-y-2">
            <li v-for="q in today.quests" :key="q.code">
              <component
                :is="q.done || !QUEST_LINKS[q.code] ? 'div' : 'router-link'"
                :to="q.done ? undefined : QUEST_LINKS[q.code]"
                class="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1"
                :class="q.done || !QUEST_LINKS[q.code] ? '' : 'transition hover:bg-[var(--color-card)]'"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                  :class="q.done ? 'border-[var(--color-success)] bg-[var(--color-success)] text-[var(--color-bg)]' : 'border-[var(--color-border)]'"
                >
                  <Check v-if="q.done" class="h-3 w-3" />
                </span>
                <span :class="q.done ? 'text-[var(--color-muted)] line-through' : ''">{{ q.title }}</span>
                <span class="ml-auto text-sm tabular-nums text-[var(--color-muted)]">{{ q.progress }}/{{ q.target }}</span>
                <ChevronRight v-if="!q.done && QUEST_LINKS[q.code]" class="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
              </component>
            </li>
          </ul>
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
            v-if="today.suggestedReading"
            :to="ROUTES.READING_DETAIL(today.suggestedReading.code)"
            class="rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]"
          >
            <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <ScrollText class="h-4 w-4" /> Read aloud · {{ today.suggestedReading.level }}
              <CoverageBadge class="ml-auto" :coverage="today.suggestedReading.coverage" />
            </div>
            <p class="mt-2 font-semibold" style="font-family: var(--font-jp)">
              {{ today.suggestedReading.title }}
            </p>
            <p class="text-sm text-[var(--color-muted)]">
              {{ today.suggestedReading.titleEn }}
            </p>
          </router-link>
          <router-link
            :to="ROUTES.RECALL"
            class="rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]"
          >
            <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Headphones class="h-4 w-4" /> Recall · hands-free
            </div>
            <p class="mt-2 font-semibold">
              Say the shaky words out loud
            </p>
          </router-link>
          <router-link
            :to="ROUTES.GAMES"
            class="rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]"
          >
            <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Grid3x3 class="h-4 w-4" /> Games
            </div>
            <p class="mt-2 font-semibold">
              Today's crossword, listening, build a kanji
            </p>
          </router-link>
        </div>
      </template>

      <p v-else class="mt-10 text-center text-[var(--color-muted)]">
        Could not load today. Check your connection.
      </p>
    </div>
  </AppShell>
</template>
