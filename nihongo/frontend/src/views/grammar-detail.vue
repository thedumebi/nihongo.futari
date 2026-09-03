<script setup lang="ts">
import type { GrammarPointView } from '@nihongo/shared/types'

import { useLocalStorage } from '@vueuse/core'
import { Volume2 } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getGrammarPoint } from '@/api/grammar'
import FuriganaText from '@/components/ja/furigana-text.vue'
import TokenLine from '@/components/ja/token-line.vue'
import WordMeaning from '@/components/ja/word-meaning.vue'
import AppShell from '@/components/layout/app-shell.vue'
import { playAudio } from '@/composables/use-audio'
import { useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

const route = useRoute()
const lang = useLanguageStore()
// The same reading setting as the study card — one choice, honoured everywhere.
const { mode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()
const point = ref<GrammarPointView | null>(null)
const loading = ref(true)
const notFound = ref(false)

async function load() {
  loading.value = true
  notFound.value = false
  try {
    point.value = await getGrammarPoint(String(route.params.slug))
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

/**
 * Whether translations show. The same key the study lesson uses, so the choice
 * follows the reader between the two places an example is met.
 */
const showEnglish = useLocalStorage('go-lesson-english', true)

/** Which example has a word open. */
const picked = ref<{ example: number, token: number } | null>(null)

const pickedWord = computed(() =>
  picked.value ? point.value?.examples[picked.value.example]?.tokens[picked.value.token]?.w ?? null : null)

// A different point means different examples; nothing should stay open.
watch(() => route.params.slug, () => {
  picked.value = null
})

/** Tier 1 is scholarly, tier 3 crowd-sourced. Readers deserve to know which. */
function tierLabel(tier: number) {
  return tier === 1 ? 'scholarly' : tier === 2 ? 'reference' : 'community'
}

onMounted(() => {
  void loadKnownKanji(lang.code)
  void loadSettings()
  void load()
})
watch(() => route.params.slug, load)
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <router-link :to="ROUTES.GRAMMAR" class="text-sm text-[var(--color-muted)] underline underline-offset-4">
        ← All grammar
      </router-link>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="notFound" class="mt-8 text-[var(--color-muted)]">
        That grammar point doesn't exist.
      </p>

      <article v-else-if="point" class="mt-6">
        <h1 class="text-4xl font-semibold" style="font-family: var(--font-jp)">
          {{ point.title }}
        </h1>
        <p class="mt-2 text-lg text-[var(--color-muted)]">
          {{ point.meaningShort }}
        </p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          <FuriganaText :text="point.pattern" :segments="point.furigana.pattern" :mode="mode" :known-kanji="knownKanji" />
          <template v-if="point.register">
            &middot; {{ point.register }}
          </template>
          <template v-if="point.level">
            &middot; {{ point.level }}
          </template>
        </p>

        <p v-if="point.inReview" class="mt-4 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)]">
          Draft — this explanation hasn't been signed off yet.
        </p>

        <p v-if="point.meaningLong" class="mt-6 whitespace-pre-line leading-relaxed">
          <FuriganaText :text="point.meaningLong" :segments="point.furigana.meaningLong" :mode="mode" :known-kanji="knownKanji" />
        </p>

        <section v-if="point.formations.length" class="mt-8">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            How it attaches
          </h2>
          <ul class="mt-3 space-y-2">
            <li v-for="(f, i) in point.formations" :key="i" class="rounded-lg border border-[var(--color-border)] p-3">
              <p style="font-family: var(--font-jp)">
                <FuriganaText :text="f.ruleTemplate" :segments="point.furigana.formations[i]?.ruleTemplate" :mode="mode" :known-kanji="knownKanji" />
              </p>
              <p v-if="f.example" class="mt-1 text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
                <FuriganaText :text="f.example" :segments="point.furigana.formations[i]?.example" :mode="mode" :known-kanji="knownKanji" />
              </p>
            </li>
          </ul>
        </section>

        <!--
          The half of a grammar lesson this page never had. Tappable, because a
          worked example whose vocabulary you cannot read teaches only the
          pattern — and the same tap teaches the same thing in a conversation.
        -->
        <section v-if="point.examples.length" class="mt-8">
          <div class="flex items-baseline justify-between">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              In use
            </h2>
            <button
              type="button"
              class="text-xs text-[var(--color-muted)] underline underline-offset-4 transition hover:text-[var(--color-text)]"
              @click="showEnglish = !showEnglish"
            >
              {{ showEnglish ? 'Hide English' : 'Show English' }}
            </button>
          </div>
          <ul class="mt-3 space-y-4">
            <li v-for="(ex, i) in point.examples" :key="ex.sentenceId">
              <div class="flex items-start gap-2">
                <button
                  v-if="ex.audio"
                  type="button"
                  class="mt-1 shrink-0 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                  :aria-label="`Hear ${ex.text}`"
                  @click="playAudio(ex.audio)"
                >
                  <Volume2 class="h-4 w-4" />
                </button>
                <p class="leading-relaxed">
                  <TokenLine
                    :tokens="ex.tokens"
                    :text="ex.text"
                    :reading="ex.reading ?? ''"
                    :mode="mode"
                    :known-kanji="knownKanji"
                    :selected="picked?.example === i ? picked.token : null"
                    @pick="t => picked = t === null ? null : { example: i, token: t }"
                  />
                </p>
              </div>
              <p v-if="showEnglish && ex.translation" class="mt-1 pl-6 text-sm text-[var(--color-muted)]">
                {{ ex.translation }}
              </p>
            </li>
          </ul>
          <WordMeaning
            v-if="pickedWord"
            class="mt-4"
            :word="pickedWord"
            @close="picked = null"
          />
        </section>

        <section v-if="point.nuance" class="mt-8">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Nuance
          </h2>
          <p class="mt-3 leading-relaxed">
            <FuriganaText :text="point.nuance" :segments="point.furigana.nuance" :mode="mode" :known-kanji="knownKanji" />
          </p>
        </section>

        <!--
          The why layer. Deliberately rendered differently from a mnemonic:
          it carries a claim, a confidence, a period and its sources. Only
          entries a human has approved reach this point.
        -->
        <section v-if="point.etymology.length" class="mt-10 rounded-xl border border-[var(--color-accent)] p-6">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            Why it's like this
          </h2>
          <div v-for="(e, j) in point.etymology" :key="e.id" class="mt-4">
            <p class="text-lg font-medium">
              <FuriganaText :text="e.claim" :segments="point.furigana.etymology[j]?.claim" :mode="mode" :known-kanji="knownKanji" />
            </p>
            <p class="mt-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              {{ e.confidence }}<template v-if="e.period">
                &middot; {{ e.period }}
              </template>
              <template v-if="e.isDisputed">
                &middot; disputed
              </template>
            </p>
            <p v-if="e.body" class="mt-3 whitespace-pre-line leading-relaxed">
              <FuriganaText :text="e.body" :segments="point.furigana.etymology[j]?.body" :mode="mode" :known-kanji="knownKanji" />
            </p>

            <div v-if="e.citations.length" class="mt-4 border-t border-[var(--color-border)] pt-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Sources
              </p>
              <ul class="mt-2 space-y-2">
                <li v-for="(c, i) in e.citations" :key="i" class="text-sm">
                  <span class="font-medium">{{ c.abbreviation || c.source }}</span>
                  <span class="text-[var(--color-muted)]"> {{ c.locator }} &middot; {{ tierLabel(c.reliabilityTier) }}</span>
                  <p v-if="c.quote" class="mt-1 border-l-2 border-[var(--color-border)] pl-3 italic text-[var(--color-muted)]">
                    {{ c.quote }}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section v-if="point.related.length" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Don't confuse this with
          </h2>
          <ul class="mt-2 space-y-3">
            <li v-for="rel in point.related" :key="rel.slug + rel.kind" class="border-t border-[var(--color-border)] pt-3">
              <router-link
                :to="ROUTES.GRAMMAR_DETAIL(rel.slug)"
                class="text-lg underline underline-offset-4"
                style="font-family: var(--font-jp)"
              >
                {{ rel.title }}
              </router-link>
              <span class="ml-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">{{ rel.kind }}</span>
              <p v-if="rel.note" class="mt-1 text-sm text-[var(--color-text)]">
                {{ rel.note }}
              </p>
            </li>
          </ul>
        </section>

        <section v-if="point.mistakes.length" class="mt-10">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Common mistakes
          </h2>
          <ul class="mt-3 space-y-3">
            <li v-for="(m, k) in point.mistakes" :key="k" class="rounded-lg border border-[var(--color-border)] p-4">
              <p class="text-[var(--color-danger)]" style="font-family: var(--font-jp)">
                ✗ <FuriganaText :text="m.wrong" :segments="point.furigana.mistakes[k]?.wrong" :mode="mode" :known-kanji="knownKanji" />
              </p>
              <p class="mt-1 text-[var(--color-success)]" style="font-family: var(--font-jp)">
                ✓ <FuriganaText :text="m.right" :segments="point.furigana.mistakes[k]?.right" :mode="mode" :known-kanji="knownKanji" />
              </p>
              <p class="mt-2 text-sm font-medium">
                <FuriganaText :text="m.whyWrong" :segments="point.furigana.mistakes[k]?.whyWrong" :mode="mode" :known-kanji="knownKanji" />
              </p>
              <p v-if="m.explanation" class="mt-1 text-sm text-[var(--color-muted)]">
                <FuriganaText :text="m.explanation" :segments="point.furigana.mistakes[k]?.explanation" :mode="mode" :known-kanji="knownKanji" />
              </p>
            </li>
          </ul>
        </section>
      </article>
    </div>
  </AppShell>
</template>
