<script setup lang="ts">
import type { SpeakSessionKind } from '@nihongo/shared/constants'
import type { SpeakListResponse } from '@nihongo/shared/types'

import { useLocalStorage } from '@vueuse/core'
import { BookOpen, Check, ChevronRight, Headphones } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import { listSpeak } from '@/api/speak'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import LevelTabs from '@/components/ui/level-tabs.vue'
import Segmented from '@/components/ui/segmented.vue'
import { useLevel } from '@/composables/use-level'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Speak: the course, and stories told with it.
 *
 * Two clear choices, the way Read picks a level: Course or Stories first,
 * then the level. The course is linear on purpose — each session builds on
 * the last — so it still leads with where to carry on. Stories teach nothing
 * new; they use what a level has taught, and sit apart so they never read as
 * more course sessions.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Composables ============
const { level: studyLevel, loadLevel } = useLevel()

// ============ Constants ============
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

const KIND_TEXT: Record<SpeakSessionKind, string> = {
  course: 'Numbered sessions, each building on the last. Hear it in English, say it in Japanese, then hear it said.',
  story: 'Short tales told with what the course has taught. You say the sentences; now and then the narrator reads the story on, and you listen.'
}

// ============ Reactive State ============
const data = ref<SpeakListResponse>({ sessions: [], next: null })
const loading = ref(true)
const errorMsg = ref('')
/** Course or stories. A per-device convenience, so localStorage. */
const kind = useLocalStorage<SpeakSessionKind>('go-speak-kind', 'course')
/** The level picked here; empty until one is picked. */
const picked = ref('')

// ============ Computed Properties ============
const ofKind = computed(() => data.value.sessions.filter(s => s.kind === kind.value))

const kindOptions = computed(() => (['course', 'story'] as const).map(k => ({
  value: k,
  label: `${k === 'course' ? 'Course' : 'Stories'} · ${data.value.sessions.filter(s => s.kind === k).length}`
})))

const counts = computed(() => {
  const out = new Map<string, number>()
  for (const s of ofKind.value)
    out.set(s.level, (out.get(s.level) ?? 0) + 1)
  return out
})

/** Picked, else the study level, else the easiest level that has anything. */
const level = computed(() => {
  if (picked.value)
    return picked.value
  if (studyLevel.value && counts.value.has(studyLevel.value))
    return studyLevel.value
  return LEVELS.find(l => counts.value.has(l)) ?? 'N5'
})

const shown = computed(() => ofKind.value.filter(s => s.level === level.value))

const nextSession = computed(() => data.value.sessions.find(s => s.code === data.value.next) ?? null)

// ============ Watchers ============
watch(() => lang.code, load)

// ============ Lifecycle Hooks ============
onMounted(() => {
  void loadLevel()
  void load()
})

// ============ Methods ============
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    data.value = await listSpeak(lang.code)
  } catch {
    errorMsg.value = 'Could not load the course. Try again in a moment.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        Speak
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        Say Japanese out loud, built up a piece at a time. Nothing to memorise &mdash; just say it.
      </p>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-10 text-center text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>
      <p v-else-if="data.sessions.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        No sessions yet.
      </p>

      <template v-else>
        <!-- Course or Stories, then the level — as clear as Read's level picker. -->
        <Segmented v-model="kind" class="mt-8" label="Show" :options="kindOptions" />
        <p class="mt-2 text-sm text-[var(--color-muted)]">
          {{ KIND_TEXT[kind] }}
        </p>

        <div v-if="kind === 'course' && nextSession" class="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ nextSession.progress ? 'Again' : 'Up next' }} &middot; {{ nextSession.level }} session {{ nextSession.number }}
          </p>
          <p class="mt-1 text-xl font-semibold">
            {{ nextSession.titleEn }}
          </p>
          <Button class="mt-4" :to="ROUTES.SPEAK_SESSION(nextSession.code)">
            <Headphones class="h-4 w-4" />
            {{ data.sessions.some(s => s.kind === 'course' && s.progress) ? 'Continue' : 'Start' }}
          </Button>
        </div>

        <LevelTabs class="mt-6" :model-value="level" :levels="LEVELS" :counts="counts" @update:model-value="picked = $event" />

        <p v-if="shown.length === 0" class="mt-8 text-center text-[var(--color-muted)]">
          No {{ level }} {{ kind === 'story' ? 'stories' : 'sessions' }} yet.
        </p>
        <ol v-else class="mt-4 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
          <li v-for="s in shown" :key="s.code">
            <router-link
              :to="ROUTES.SPEAK_SESSION(s.code)"
              class="flex items-center gap-4 p-4 transition hover:bg-[var(--color-card)]"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm"
                :class="s.progress ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
                :aria-label="s.progress ? 'Done' : `${kind === 'story' ? 'Story' : 'Session'} ${s.number}`"
              >
                <Check v-if="s.progress" class="h-4 w-4" />
                <BookOpen v-else-if="s.kind === 'story'" class="h-4 w-4" />
                <template v-else>{{ s.number }}</template>
              </span>
              <div class="min-w-0 flex-1">
                <p class="font-medium">
                  {{ s.titleEn }}
                </p>
                <p class="text-sm text-[var(--color-muted)]">
                  <span style="font-family: var(--font-jp)">{{ s.title }}</span>
                  &middot; {{ s.promptCount }} to say
                  <template v-if="s.progress">
                    &middot; {{ s.progress.gotIt }}/{{ s.progress.total }} first time
                  </template>
                </p>
              </div>
              <ChevronRight class="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
            </router-link>
          </li>
        </ol>

        <router-link
          :to="ROUTES.RECALL"
          class="mt-8 flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-text)]"
        >
          <Headphones class="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
          <span>
            <span class="block font-semibold">Recall</span>
            <span class="block text-sm text-[var(--color-muted)]">The same method over your own shaky words and missed prompts, hands-free.</span>
          </span>
        </router-link>
      </template>
    </div>
  </AppShell>
</template>
