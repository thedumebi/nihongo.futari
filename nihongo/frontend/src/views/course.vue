<script setup lang="ts">
import type { CourseLevel, CourseStage } from '@nihongo/shared/types'

import { Check, Lock } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import { getCourse } from '@/api/course'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * The course, as a route rather than a filter.
 *
 * The study page is a deck picker over a corpus of 12,000 items — the right
 * tool once you know what you want and no use at all when you are starting.
 * "I don't know where to start from, I am just seeing a bunch of categories"
 * is a fair description of that screen, and it is not a screen this page
 * replaces so much as the one that should have come first.
 */
const lang = useLanguageStore()

const levels = ref<CourseLevel[]>([])
const loading = ref(true)
const errorMsg = ref('')
/** Which level's stages are expanded. Defaults to wherever you actually are. */
const expanded = ref('')

const KIND_LABELS: Record<string, string> = {
  'kana': 'kana',
  'kanji': 'kanji',
  'word': 'words',
  'grammar': 'grammar',
  'sentence': 'sentences',
  'phonetic-series': 'sound series'
}

/**
 * The level to continue in: the first that is not finished.
 *
 * Levels are open regardless — this only decides where the "Continue" button
 * points, and which section starts expanded.
 */
const current = computed(() => levels.value.find(l => l.currentStage !== null) ?? levels.value[0])

/** The stage the "continue" card is about. */
const currentStage = computed(() =>
  current.value?.stages.find(s => s.stage === current.value?.currentStage))

function percent(learned: number, total: number): number {
  return total === 0 ? 0 : Math.round((learned / total) * 100)
}

/** What a stage is made of, in words rather than counts. */
function describe(stage: CourseStage): string {
  return stage.kinds
    .filter(k => k.count > 0)
    .map(k => `${k.count} ${KIND_LABELS[k.kind] ?? k.kind}`)
    .join(' · ')
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    levels.value = (await getCourse(lang.code)).levels
    if (!expanded.value)
      expanded.value = current.value?.level ?? ''
  } catch {
    errorMsg.value = 'Could not load your course.'
    levels.value = []
  } finally {
    loading.value = false
  }
}

watch(() => lang.code, () => {
  expanded.value = ''
  void load()
})

onMounted(load)
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Your course
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        Kana first, then each JLPT level in turn. New material arrives one stage at a time;
        the next stage opens once most of this one has stuck.
      </p>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-10 text-center text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>

      <template v-else>
        <!-- Where to go right now. A beginner should not have to work this out
             from a list of levels. -->
        <div v-if="current" class="mt-8 rounded-xl border border-[var(--color-accent)] p-6">
          <p class="text-sm uppercase tracking-wide text-[var(--color-muted)]">
            Pick up where you left off
          </p>
          <p class="mt-2 text-xl font-semibold">
            {{ current.level }} &middot; stage {{ current.currentStage }}
          </p>
          <p v-if="currentStage" class="mt-1 text-sm text-[var(--color-muted)]">
            {{ describe(currentStage) }}
          </p>
          <!-- Carry the level across, so Continue lands in the level the
               course is talking about rather than whichever one was last
               picked on the study page. -->
          <router-link :to="`${ROUTES.STUDY}?level=${current.level}`" class="mt-4 inline-block">
            <Button variant="primary">
              Continue
            </Button>
          </router-link>
        </div>

        <ol class="mt-8 space-y-3">
          <li
            v-for="level in levels"
            :key="level.level"
            class="rounded-xl border border-[var(--color-border)]"
          >
            <button
              type="button"
              class="flex w-full items-center gap-4 p-4 text-left transition hover:bg-[var(--color-card)]"
              :aria-expanded="expanded === level.level"
              @click="expanded = expanded === level.level ? '' : level.level"
            >
              <span class="text-lg font-semibold">{{ level.level }}</span>
              <span class="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                <span
                  class="block h-full rounded-full bg-[var(--color-accent)]"
                  :style="{ width: `${percent(level.learned, level.total)}%` }"
                />
              </span>
              <span class="shrink-0 text-sm text-[var(--color-muted)]">
                <template v-if="level.currentStage === null">finished</template>
                <template v-else>stage {{ level.currentStage }} of {{ level.stages.length }}</template>
              </span>
            </button>

            <ol v-if="expanded === level.level" class="border-t border-[var(--color-border)]">
              <li
                v-for="stage in level.stages"
                :key="stage.stage"
                class="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0"
                :class="stage.open ? '' : 'opacity-45'"
              >
                <span class="w-8 shrink-0 text-sm text-[var(--color-muted)]">{{ stage.stage }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate" style="font-family: var(--font-jp)">
                    {{ stage.sample.join('  ') }}
                  </span>
                  <span class="block text-xs text-[var(--color-muted)]">{{ describe(stage) }}</span>
                </span>
                <!--
                  Labelled, because a bare fraction next to "stage 2 of 60" reads
                  as a second stage count. It is neither: it is how much of THIS
                  stage has stuck, in the same unit the study header uses.
                -->
                <Tooltip
                  :content="`${stage.learned} of ${stage.total} CARDS in this stage have graduated. Every item has several cards — recognising a kana and writing it are counted separately — so this number is larger than the ${describe(stage)} above it, and every one must graduate before the next stage opens.`"
                  position="left"
                >
                  <span class="shrink-0 text-xs text-[var(--color-muted)]">
                    {{ stage.learned }}/{{ stage.total }} cards
                  </span>
                </Tooltip>
                <Tooltip
                  v-if="!stage.open"
                  content="Opens once the stages before it have mostly stuck."
                  position="left"
                >
                  <Lock class="h-4 w-4 text-[var(--color-muted)]" />
                </Tooltip>
                <Check
                  v-else-if="stage.learned >= stage.total"
                  class="h-4 w-4 shrink-0 text-[var(--color-success)]"
                />
              </li>
            </ol>
          </li>
        </ol>
      </template>
    </div>
  </AppShell>
</template>
