<script setup lang="ts">
import type { WordDetail } from '@nihongo/shared/types'

import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getWord } from '@/api/words'
import FuriganaText from '@/components/ja/furigana-text.vue'
import PitchAccent from '@/components/ja/pitch-accent.vue'
import AppShell from '@/components/layout/app-shell.vue'
import { playAudio } from '@/composables/use-audio'
import { useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'

/**
 * One word, everything known about it.
 *
 * Pitch accent and example sentences were both built and had nowhere to render.
 * The pitch shape is unreadable as a stored number, and a gloss without a
 * sentence is not yet something you could say.
 */

const route = useRoute()
const { mode: furiganaMode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()

const word = ref<WordDetail | null>(null)
const loading = ref(true)
const errorMsg = ref('')
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    word.value = await getWord(String(route.params.id))
  } catch {
    errorMsg.value = 'No such word.'
    word.value = null
  } finally {
    loading.value = false
  }
}

function play(src: string) {
  // A missing clip is normal — audio is generated per corpus run, not per word.
  playAudio(src)
}

onMounted(() => {
  void load()
  void loadKnownKanji()
  void loadSettings()
})
watch(() => route.params.id, load)
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

      <template v-else-if="word">
        <header>
          <h1 class="text-4xl text-[var(--color-heading)]" style="font-family: var(--font-jp)">
            {{ word.form }}
          </h1>
          <p class="mt-1 text-lg text-[var(--color-muted)]" style="font-family: var(--font-jp)">
            {{ word.reading }}
          </p>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            <template v-if="word.level">
              {{ word.level }}
            </template>
            <template v-if="word.isCommon">
              &middot; common
            </template>
          </p>
        </header>

        <section v-if="word.pitch" class="mt-6 rounded-xl border border-[var(--color-border)] p-5">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Pitch accent
          </h2>
          <div class="mt-3">
            <PitchAccent :reading="word.pitch.reading" :shape="word.pitch.shape" :pattern="word.pitch.pattern" />
          </div>
        </section>

        <section class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Meaning
          </h2>
          <ol class="mt-2 space-y-2">
            <li v-for="(sense, i) in word.senses" :key="i" class="flex gap-3">
              <span class="text-sm text-[var(--color-muted)]">{{ i + 1 }}</span>
              <span>
                {{ sense.glosses.join('; ') }}
                <span v-if="sense.pos.length" class="ml-1 text-xs text-[var(--color-muted)]">{{ sense.pos.join(', ') }}</span>
              </span>
            </li>
          </ol>
        </section>

        <section v-if="word.kanji.length" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Kanji used
          </h2>
          <div class="mt-2 flex flex-wrap gap-2">
            <router-link
              v-for="k in word.kanji"
              :key="k.character"
              :to="ROUTES.KANJI_DETAIL(k.character)"
              class="flex items-baseline gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 transition hover:border-[var(--color-text)]"
            >
              <span class="text-2xl" style="font-family: var(--font-jp)">{{ k.character }}</span>
              <span class="text-xs text-[var(--color-muted)]">{{ k.meanings.join(', ') }}</span>
            </router-link>
          </div>
        </section>

        <!-- Drafts are badged. An unreviewed etymology shown as fact is the
             failure this layer exists to prevent. -->
        <section v-if="word.etymology.length" class="mt-8 space-y-5">
          <article v-for="(e, i) in word.etymology" :key="i" class="rounded-xl border border-[var(--color-border)] p-5">
            <div class="flex items-center gap-2">
              <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Word origin
              </h2>
              <span
                v-if="!e.published"
                class="rounded bg-[var(--color-washi)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-muted)]"
              >Draft</span>
            </div>
            <p class="mt-2 font-medium text-[var(--color-heading)]">
              {{ e.claim }}
            </p>
            <p class="mt-2 text-sm text-[var(--color-text)]">
              {{ e.body }}
            </p>
            <ul v-if="e.citations.length" class="mt-3 space-y-1 border-t border-[var(--color-border)] pt-3">
              <li v-for="(c, ci) in e.citations" :key="ci" class="text-xs text-[var(--color-muted)]">
                {{ c.label }}<template v-if="c.locator">
                  — {{ c.locator }}
                </template>
                <span v-if="c.quote" class="block italic">&ldquo;{{ c.quote }}&rdquo;</span>
              </li>
            </ul>
          </article>
        </section>

        <section v-if="word.examples.length" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            In a sentence
          </h2>
          <ul class="mt-2 space-y-4">
            <li v-for="(ex, i) in word.examples" :key="i" class="border-t border-[var(--color-border)] pt-3">
              <p class="text-lg leading-relaxed" style="font-family: var(--font-jp)">
                <FuriganaText
                  :text="ex.text"
                  :segments="ex.furigana"
                  :mode="furiganaMode"
                  :known-kanji="knownKanji"
                />
              </p>
              <p v-if="ex.translation" class="mt-1 text-sm text-[var(--color-muted)]">
                {{ ex.translation }}
              </p>
              <button
                v-if="ex.audio"
                type="button"
                class="mt-1 text-xs text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-text)]"
                @click="play(ex.audio)"
              >
                Hear it
              </button>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </AppShell>
</template>
