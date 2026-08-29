<script setup lang="ts">
import type { KanjiDetail } from '@nihongo/shared/types'

import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getKanji } from '@/api/dictionary'
import StrokeDiagram from '@/components/ja/stroke-diagram.vue'
import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'

/**
 * One kanji, everything known about it.
 *
 * This page is where the why-layer becomes visible. Readings, the sound series
 * that predicts them, stroke order and sourced etymology have all been sitting
 * in the database with nowhere to render — each separately useless, and
 * together the argument for the app.
 */

const route = useRoute()
const kanji = ref<KanjiDetail | null>(null)
const loading = ref(true)
const errorMsg = ref('')

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    kanji.value = await getKanji(String(route.params.character))
  } catch {
    errorMsg.value = 'No such kanji.'
    kanji.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.params.character, load)

const ASPECT_LABEL: Record<string, string> = {
  'glyph-origin': 'Where the character comes from',
  'reading-logic': 'Why it reads this way',
  'historical-grammar': 'History',
  'word-origin': 'Word origin'
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8">
      <p v-if="loading" class="py-16 text-center text-[var(--color-muted)]">
        Loading&hellip;
      </p>
      <p v-else-if="errorMsg" class="py-16 text-center text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>

      <template v-else-if="kanji">
        <header class="flex items-start gap-6">
          <span class="text-7xl leading-none text-[var(--color-heading)]" style="font-family: var(--font-jp)">
            {{ kanji.character }}
          </span>
          <div class="pt-1">
            <p class="text-lg text-[var(--color-text)]">
              {{ kanji.meanings.slice(0, 5).join(', ') }}
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]">
              <template v-if="kanji.level">
                {{ kanji.level }} &middot;
              </template>
              {{ kanji.strokeCount }} strokes
              <template v-if="kanji.grade">
                &middot; grade {{ kanji.grade }}
              </template>
            </p>
          </div>
        </header>

        <section class="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              On-reading
            </h2>
            <p class="mt-1 text-lg" style="font-family: var(--font-jp)">
              {{ kanji.readings.on.join('・') || '—' }}
            </p>
          </div>
          <div>
            <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Kun-reading
            </h2>
            <p class="mt-1 text-lg" style="font-family: var(--font-jp)">
              {{ kanji.readings.kun.join('・') || '—' }}
            </p>
          </div>
        </section>

        <!-- The sound series. Reliability and exceptions are shown, because a
             rule presented without them costs a learner more than it saves. -->
        <section v-if="kanji.series" class="mt-8 rounded-xl border border-[var(--color-border)] p-5">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Sound series
          </h2>
          <p class="mt-2 text-lg">
            <router-link
              :to="ROUTES.SOUND_SERIES_DETAIL(kanji.series.component)"
              class="underline underline-offset-4"
              style="font-family: var(--font-jp)"
            >
              {{ kanji.series.component }}
            </router-link>
            <span class="text-[var(--color-muted)]"> predicts </span>
            <span style="font-family: var(--font-jp)">{{ kanji.series.reading }}</span>
          </p>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            Holds for {{ Math.round((kanji.series.reliability ?? 0) * 100) }}% of
            {{ kanji.series.memberCount }} characters that use it.
          </p>
          <p
            v-if="!kanji.series.follows"
            class="mt-2 rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]"
          >
            {{ kanji.character }} is an exception.
            <template v-if="kanji.series.exceptionNote">
              {{ kanji.series.exceptionNote }}
            </template>
          </p>
        </section>

        <section v-if="kanji.strokes.length" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Stroke order
          </h2>
          <StrokeDiagram :strokes="kanji.strokes" class="mt-2" />
        </section>

        <!-- Sourced explanation. Drafts are marked as drafts: an unreviewed
             etymology rendered as fact is the failure this layer exists to
             prevent. -->
        <section v-if="kanji.etymology.length" class="mt-8 space-y-5">
          <article
            v-for="(entry, i) in kanji.etymology"
            :key="i"
            class="rounded-xl border border-[var(--color-border)] p-5"
          >
            <div class="flex items-center gap-2">
              <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                {{ ASPECT_LABEL[entry.aspect] ?? entry.aspect }}
              </h2>
              <span
                v-if="!entry.published"
                class="rounded bg-[var(--color-washi)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-muted)]"
              >Draft</span>
              <span v-if="entry.isDisputed" class="text-[10px] uppercase tracking-wide text-[var(--color-danger)]">
                Disputed
              </span>
            </div>
            <p class="mt-2 font-medium text-[var(--color-heading)]">
              {{ entry.claim }}
            </p>
            <p class="mt-2 whitespace-pre-line text-sm text-[var(--color-text)]">
              {{ entry.body }}
            </p>
            <ul v-if="entry.citations.length" class="mt-3 space-y-1 border-t border-[var(--color-border)] pt-3">
              <li v-for="(c, ci) in entry.citations" :key="ci" class="text-xs text-[var(--color-muted)]">
                {{ c.label }}<template v-if="c.locator">
                  — {{ c.locator }}
                </template>
                <span v-if="c.quote" class="block italic">&ldquo;{{ c.quote }}&rdquo;</span>
              </li>
            </ul>
          </article>
        </section>

        <section v-if="kanji.words.length" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Words using it
          </h2>
          <ul class="mt-2 divide-y divide-[var(--color-border)]">
            <li v-for="w in kanji.words" :key="w.form" class="flex items-baseline gap-3 py-2">
              <span class="text-lg" style="font-family: var(--font-jp)">{{ w.form }}</span>
              <span class="text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">{{ w.reading }}</span>
              <span class="flex-1 truncate text-sm">{{ w.gloss }}</span>
              <span v-if="w.level" class="text-xs text-[var(--color-muted)]">{{ w.level }}</span>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </AppShell>
</template>
