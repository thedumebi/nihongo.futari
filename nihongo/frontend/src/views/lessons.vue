<script setup lang="ts">
import type { LessonListResponse, LessonStatus, LessonSummary } from '@nihongo/shared/types'

import { KANA_LESSON_PREFIX } from '@nihongo/shared/constants'
import { BookOpen, Check, ChevronDown, CircleDot } from 'lucide-vue-next'
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

/**
 * Which sections the reader has folded shut, and which folded themselves.
 *
 * A section the reader has touched is remembered by key; everything else falls
 * back to `finished`, so a group whose lessons are all done starts collapsed.
 * The ask was "all lessons done should be collapsed so I don't have to scroll
 * too much", and the writing system is the case that makes it urgent — 71 kana
 * rows above everything else.
 */
const toggled = ref<Record<string, boolean>>({})

function groupKey(levelCode: string, code: string | null): string {
  return `${levelCode}:${code ?? 'ungrouped'}`
}

function isFinished(lessons: LessonSummary[]): boolean {
  return lessons.length > 0
    && lessons.every(l => l.status === 'known' || l.status === 'learned')
}

function isOpen(levelCode: string, group: { code: string | null, lessons: LessonSummary[] }): boolean {
  const chosen = toggled.value[groupKey(levelCode, group.code)]
  return chosen ?? !isFinished(group.lessons)
}

function toggle(levelCode: string, group: { code: string | null, lessons: LessonSummary[] }): void {
  const key = groupKey(levelCode, group.code)
  toggled.value = { ...toggled.value, [key]: !isOpen(levelCode, group) }
}

function doneCount(lessons: LessonSummary[]): number {
  return lessons.filter(l => l.status === 'known' || l.status === 'learned').length
}
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
  return lesson.exampleCount === 0 && !lesson.slug.startsWith(KANA_LESSON_PREFIX)
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
          <button
            v-if="group.title"
            type="button"
            class="flex w-full items-center gap-2 py-1 text-left"
            :aria-expanded="isOpen(level!.level, group)"
            @click="toggle(level!.level, group)"
          >
            <ChevronDown
              class="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform"
              :class="isOpen(level!.level, group) ? '' : '-rotate-90'"
            />
            <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {{ group.title }}
            </h2>
            <span class="text-xs text-[var(--color-muted)] opacity-70">
              {{ doneCount(group.lessons) }}/{{ group.lessons.length }}
            </span>
          </button>
          <ul
            v-show="isOpen(level!.level, group)"
            class="mt-3 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]"
          >
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
