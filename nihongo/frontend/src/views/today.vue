<script setup lang="ts">
import { levelProgress } from '@nihongo/shared/lib'
import { Check, ChevronRight, Flame, Grid3x3, Headphones, Layers, Mic, RotateCcw, ScrollText, Target } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import CoverageBadge from '@/components/ja/coverage-badge.vue'
import AppShell from '@/components/layout/app-shell.vue'
import GettingStarted from '@/components/onboarding/getting-started.vue'
import StageUpModal from '@/components/study/stage-up-modal.vue'
import StageWait from '@/components/study/stage-wait.vue'
import Button from '@/components/ui/button.vue'
import { useLessonFirst } from '@/composables/use-lesson-first'
import { ROUTES } from '@/constants'
import { useAuthStore } from '@/store/auth'
import { useLanguageStore } from '@/store/language'
import { useTodayStore } from '@/store/today'

/**
 * Today: what to do now, in the order worth doing it.
 *
 * Reviews first — they are what keeps what you have learned — then something
 * new: today's lesson, then today's words (a lesson shows how the language
 * works, so the words have somewhere to go), then Speak, reading, games.
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
  'game-1': ROUTES.GAMES,
  'listening-1': ROUTES.GAME_LISTENING,
  'kanji-build-1': ROUTES.GAME_KANJI_BUILD,
  'verb-forms-1': ROUTES.GAME_VERB_FORMS,
  'particles-1': ROUTES.GAME_PARTICLES,
  'ghost-boss-1': ROUTES.GAME_GHOST_BOSS
}

// ============ Stores ============
const auth = useAuthStore()
const lang = useLanguageStore()
const store = useTodayStore()

// ============ Reactive State ============
const { wordsOpen, learnWordsAnyway } = useLessonFirst()

const loading = ref(true)

// ============ Computed Properties ============
const today = computed(() => store.today)
const firstName = computed(() => (auth.user?.name ?? '').split(' ')[0] ?? '')
/**
 * New words still to come today: what is left of the limit, but never more than
 * the stage has to introduce. It used to be the limit alone, so the page said
 * "11 new words for today" while the stage had none left to give.
 */
const newLeft = computed(() => Math.max(0, Math.min(
  (today.value?.newLimit ?? 0) - (today.value?.newToday ?? 0),
  // A Today cached before this field existed has no number: no cap.
  today.value?.newAvailable ?? Number.POSITIVE_INFINITY
)))
/** The stage new words are waiting on, when that is why none are left. */
const stageWait = computed(() => today.value?.stageWait ?? null)
/** A stage passed and not yet shown: reviewing, or on another device. */
const celebrate = computed(() => today.value?.celebrate ?? null)
/** Extra practice (other cards of words already met) still to come once the new words are done. */
const extrasLeft = computed(() => today.value?.extrasLeft ?? 0)
/** Today's lesson, while today's words wait on it. */
const lessonFirst = computed(() => today.value?.lessonFirst ?? null)
/** Words are open: a lesson is done today, none is left, or "Learn words anyway". */
const wordsReady = computed(() => wordsOpen(lessonFirst.value))
/** A lesson was finished today and there are more to take. */
const lessonDone = computed(() => !lessonFirst.value && Boolean(today.value?.nextLesson))

// ============ Lifecycle Hooks ============
onMounted(async () => {
  await store.refresh(lang.code, true)
  loading.value = false
})
</script>

<template>
  <AppShell>
    <StageUpModal :celebration="celebrate" :language-code="lang.code" />
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

        <!-- 2. Learn today: the lesson, then the words. Words wait on a lesson
             so a learner knows how to use them; "anyway" is always there. -->
        <section class="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Layers class="h-4 w-4" /> Learn today
          </div>
          <p v-if="today.nextLesson" class="mt-1 text-sm text-[var(--color-muted)]">
            Lessons teach how Japanese works. Words give you things to say with it. One lesson, then your words, each day.
          </p>

          <!-- Step 1: today's lesson. -->
          <div v-if="lessonFirst" class="mt-4">
            <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              1 · Today's lesson · {{ lessonFirst.level }}
            </p>
            <p class="mt-1 text-xl font-semibold" style="font-family: var(--font-jp)">
              {{ lessonFirst.title }}
            </p>
            <Button class="mt-3" :variant="today.due > 0 ? 'ghost' : 'primary'" :to="ROUTES.LESSON_DETAIL(lessonFirst.slug)">
              Start lesson
            </Button>
          </div>
          <p v-else-if="lessonDone && today.nextLesson" class="mt-4 flex flex-wrap items-center gap-x-2 text-sm">
            <span class="flex items-center gap-1 font-medium text-[var(--color-success)]"><Check class="h-4 w-4" /> Today's lesson done</span>
            <router-link :to="ROUTES.LESSON_DETAIL(today.nextLesson.slug)" class="text-[var(--color-muted)] underline underline-offset-4">
              Take another: <span style="font-family: var(--font-jp)">{{ today.nextLesson.title }}</span>
            </router-link>
          </p>

          <!-- Step 2: today's words. -->
          <div :class="today.nextLesson ? 'mt-5 border-t border-[var(--color-border)] pt-4' : ''">
            <p v-if="today.nextLesson" class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              {{ lessonFirst ? '2 · ' : '' }}Today's words
            </p>
            <template v-if="lessonFirst && !wordsReady && newLeft > 0">
              <p class="mt-1 text-lg">
                {{ newLeft }} new {{ newLeft === 1 ? 'word opens' : 'words open' }} after today's lesson, so you know how to use them.
              </p>
              <button
                type="button"
                class="mt-2 text-sm text-[var(--color-muted)] underline underline-offset-4"
                @click="learnWordsAnyway(lessonFirst)"
              >
                Learn words anyway
              </button>
            </template>
            <template v-else>
              <template v-if="newLeft > 0">
                <p class="mt-2 text-xl font-semibold">
                  {{ newLeft }} new {{ newLeft === 1 ? 'word' : 'words' }} for today
                </p>
                <p class="mt-1 text-sm text-[var(--color-muted)]">
                  {{ today.newToday }} of {{ today.newLimit }} learned so far today.
                </p>
                <Button class="mt-4" :variant="today.due > 0 ? 'ghost' : 'primary'" :to="ROUTES.LEARN">
                  Learn today's words
                </Button>
              </template>
              <template v-else-if="stageWait">
                <StageWait :stage="stageWait" />
                <Button v-if="extrasLeft > 0" class="mt-4" :variant="today.due > 0 ? 'ghost' : 'primary'" :to="ROUTES.LEARN">
                  Keep practising
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
            </template>
          </div>
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
