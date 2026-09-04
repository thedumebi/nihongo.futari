<script setup lang="ts">
import type { LessonListResponse, LessonStatus, LessonSummary } from '@nihongo/shared/types'

import { BookOpen, Check, CircleDot } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import { getLessons } from '@/api/lessons'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * The course, as a list of things to learn.
 *
 * Bunpo's shape and the owner's ask: pick a level, pick a topic, learn it, get
 * quizzed on it. Every tile is tappable — reading ahead is allowed, being
 * quizzed ahead is not, and that distinction lives in the review queue rather
 * than in a padlock here. The stage gate that locks Course has caused enough
 * confusion already.
 */
const lang = useLanguageStore()
const data = ref<LessonListResponse>({ levels: [], next: null })
const loading = ref(true)
const active = ref('')

const level = computed(() => data.value.levels.find(l => l.level === active.value) ?? data.value.levels[0])

const STATUS: Record<LessonStatus, { label: string, tone: string }> = {
  'not-started': { label: '', tone: '' },
  'seen': { label: 'opened', tone: 'text-[var(--color-muted)]' },
  'learned': { label: 'done', tone: 'text-[var(--color-success)]' },
  'known': { label: 'known', tone: 'text-[var(--color-success)]' }
}

/** A lesson with no examples is an explanation and one question. Say so. */
function isShort(lesson: LessonSummary): boolean {
  // "short" warns that a GRAMMAR topic has no example sentences yet, so its
  // lesson is the explanation and one question. A writing-system lesson has no
  // example sentences by nature — it teaches five characters — so the marker
  // would read as a gap where there is none.
  return lesson.exampleCount === 0 && !lesson.slug.startsWith('kana-')
}

onMounted(async () => {
  try {
    data.value = await getLessons(lang.code)
    active.value = data.value.next?.level ?? data.value.levels[0]?.level ?? ''
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Lessons
      </h1>
      <p class="mt-2 text-sm text-[var(--color-muted)]">
        Each one teaches a pattern, then asks you about it. Take them in any order.
      </p>

      <p v-if="loading" class="mt-10 text-[var(--color-muted)]">
        Loading…
      </p>

      <template v-else>
        <!-- Where to go next, so the list never asks "which of 355?". -->
        <div
          v-if="data.next"
          class="mt-8 rounded-xl border border-[var(--color-border)] p-5"
        >
          <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Continue
          </p>
          <p class="mt-1 text-xl" style="font-family: var(--font-jp)">
            {{ data.next.title }}
          </p>
          <router-link :to="ROUTES.LESSON_DETAIL(data.next.slug)" class="mt-4 inline-block">
            <Button variant="primary">
              Start this lesson
            </Button>
          </router-link>
        </div>

        <div class="mt-8 flex flex-wrap gap-2">
          <button
            v-for="l in data.levels"
            :key="l.level"
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm transition"
            :class="l.level === level?.level
              ? 'border-[var(--color-text)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'"
            @click="active = l.level"
          >
            {{ l.level }}
            <span class="ml-1 opacity-70">{{ l.completed }}/{{ l.total }}</span>
          </button>
        </div>

        <section v-for="group in level?.groups ?? []" :key="group.code ?? 'ungrouped'" class="mt-8">
          <h2 v-if="group.title" class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {{ group.title }}
          </h2>
          <ul class="mt-3 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            <li v-for="lesson in group.lessons" :key="lesson.slug">
              <router-link
                :to="ROUTES.LESSON_DETAIL(lesson.slug)"
                class="group flex items-center gap-4 py-3"
              >
                <Check v-if="lesson.status === 'known' || lesson.status === 'learned'" class="h-4 w-4 shrink-0 text-[var(--color-success)]" />
                <CircleDot v-else-if="lesson.status === 'seen'" class="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                <BookOpen v-else class="h-4 w-4 shrink-0 text-[var(--color-muted)] opacity-40" />

                <span class="min-w-0 flex-1">
                  <span class="text-lg group-hover:underline" style="font-family: var(--font-jp)">{{ lesson.title }}</span>
                  <span class="ml-2 text-sm text-[var(--color-muted)]">{{ lesson.meaningShort }}</span>
                </span>

                <span
                  v-if="isShort(lesson)"
                  class="shrink-0 text-xs text-[var(--color-muted)] opacity-70"
                  title="No example sentences yet — this lesson is the explanation and one question."
                >short</span>

                <span class="w-16 shrink-0 text-right text-xs" :class="STATUS[lesson.status].tone">
                  {{ STATUS[lesson.status].label }}
                </span>
              </router-link>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </AppShell>
</template>
