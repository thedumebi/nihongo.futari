<script setup lang="ts">
import type { GlossedToken, StudyLesson, WordGloss } from '@nihongo/shared/types'

import { useLocalStorage } from '@vueuse/core'
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import JaProse from '@/components/ja/ja-prose.vue'
import TokenLine from '@/components/ja/token-line.vue'
import WordMeaning from '@/components/ja/word-meaning.vue'
import Button from '@/components/ui/button.vue'
import { playAudio } from '@/composables/use-audio'
import { useFurigana } from '@/composables/use-furigana'

/**
 * Learn the point, THEN answer questions about it.
 *
 * The complaint this exists for: "everything is a quiz, nothing teaches me
 * stuff before quizzing me". A grammar point's whole study experience was one
 * multiple-choice question — pick the English gloss from four — while
 * `meaningLong`, `nuance`, how it attaches and the mistakes it invites all sat
 * in the database, rendered only on a reference page nothing linked to.
 *
 * A deck of small cards rather than one long page, because that is the shape
 * that gets read. A wall of prose in front of a queue is a wall you dismiss.
 *
 * Reused rather than duplicated: the same component is the lesson before a
 * question and the lesson opened from the Course, so the two cannot drift.
 */
const props = withDefaults(defineProps<{
  lesson: StudyLesson
  /** Wording for the last card's button — a quiz follows, or nothing does. */
  finishLabel?: string
  /**
   * Readings for the Japanese inside the explanation, keyed by the run.
   *
   * Optional because the study introduction shows this same deck without
   * fetching a lesson; there the prose renders as it always did, unruby'd,
   * rather than not at all.
   */
  prose?: Record<string, { text: string, reading: string, tokens: GlossedToken[] }>
}>(), { prose: () => ({}) })

const emit = defineEmits<{ (e: 'done'): void }>()

const { mode, knownKanji } = useFurigana()

/**
 * Whether translations show.
 *
 * Bunpo makes English optional, and it is the right call: reading the Japanese
 * and then checking is a different exercise from reading both at once. Per
 * device rather than per account — it is a reading preference for the moment
 * you are in, not a profile setting, and it changes several times a session.
 */
const showEnglish = useLocalStorage('go-lesson-english', true)

/** Which example has a word open, and which word. `null` closes the strip. */
const picked = ref<{ example: number, token: number } | null>(null)

const pickedWord = computed<WordGloss | null>(() => {
  if (!picked.value)
    return null
  return props.lesson.examples[picked.value.example]?.tokens[picked.value.token]?.w ?? null
})

function pick(example: number, token: number | null): void {
  picked.value = token === null ? null : { example, token }
}

function selectedIn(example: number): number | null {
  return picked.value?.example === example ? picked.value.token : null
}

/**
 * The cards, built from whatever this point actually has.
 *
 * Every section is optional because the corpus is uneven — 353 points all carry
 * `meaningLong` and `nuance`, only 20 carry a formation and 20 a mistake. A
 * point with nothing but its meaning still gets a lesson; it is simply a short
 * one, rather than a deck of empty headings.
 */
type Card
  = | { kind: 'meaning' }
    | { kind: 'formation' }
    | { kind: 'examples' }
    | { kind: 'nuance' }
    | { kind: 'mistake' }

const cards = computed<Card[]>(() => {
  const list: Card[] = [{ kind: 'meaning' }]
  if (props.lesson.formations.length > 0)
    list.push({ kind: 'formation' })
  if (props.lesson.examples.length > 0)
    list.push({ kind: 'examples' })
  if (props.lesson.nuance)
    list.push({ kind: 'nuance' })
  if (props.lesson.mistake)
    list.push({ kind: 'mistake' })
  return list
})

const index = ref(0)
const card = computed(() => cards.value[index.value])
const last = computed(() => index.value >= cards.value.length - 1)

// A different point means a different lesson, read from the top.
watch(() => props.lesson.slug, () => {
  index.value = 0
  picked.value = null
})

function next(): void {
  if (last.value) {
    emit('done')
    return
  }
  index.value += 1
  picked.value = null
}

function back(): void {
  if (index.value > 0)
    index.value -= 1
  picked.value = null
}

/**
 * `**bold**` and blank-line paragraphs, and nothing else.
 *
 * The explanations are authored prose, and the ones that teach a system rather
 * than a single pattern need headings — the verb-class lesson is three groups
 * with a name each. Rendering the two markers here is a dozen lines; reaching
 * for a markdown library to get them would ship a parser and an HTML sink into
 * a page that only ever needs emphasis.
 */
function paragraphs(text: string): Array<Array<{ text: string, bold: boolean }>> {
  return text.split(/\n\s*\n/).map(para =>
    para.split('**').map((part, i) => ({ text: part, bold: i % 2 === 1 })).filter(p => p.text !== '')
  )
}

const swipeStart = ref<number | null>(null)

function onTouchStart(e: TouchEvent): void {
  swipeStart.value = e.changedTouches[0]?.clientX ?? null
}

/** A deliberate horizontal drag, not the tail of a vertical scroll or a tap. */
function onTouchEnd(e: TouchEvent): void {
  const from = swipeStart.value
  swipeStart.value = null
  const to = e.changedTouches[0]?.clientX
  if (from === null || to === undefined)
    return
  const dx = to - from
  if (Math.abs(dx) < 60)
    return
  if (dx < 0)
    next()
  else back()
}
</script>

<template>
  <div
    class="mx-auto flex max-w-md flex-col"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <p class="text-center text-sm text-[var(--color-muted)]">
      Something new — here it is first.
    </p>

    <!-- The point itself stays on screen across every card in the deck, so you
         never have to remember what is being explained. -->
    <div class="mt-6 text-center">
      <p class="text-4xl leading-tight" style="font-family: var(--font-jp)">
        {{ lesson.title }}
      </p>
      <p class="mt-2 text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
        {{ lesson.pattern }}
      </p>
    </div>

    <div class="mt-6 min-h-[13rem] text-left">
      <template v-if="card?.kind === 'meaning'">
        <p class="text-center text-xl">
          {{ lesson.meaningShort }}
        </p>
        <div v-if="lesson.meaningLong" class="mt-5 space-y-3">
          <p
            v-for="(para, i) in paragraphs(lesson.meaningLong)"
            :key="i"
            class="text-sm leading-relaxed text-[var(--color-muted)]"
          >
            <template v-for="(run, j) in para" :key="j">
              <strong v-if="run.bold" class="text-[var(--color-text)]">
                <JaProse :text="run.text" :prose="prose" :mode="mode" :known-kanji="knownKanji" />
              </strong>
              <JaProse v-else :text="run.text" :prose="prose" :mode="mode" :known-kanji="knownKanji" />
            </template>
          </p>
        </div>
      </template>

      <template v-else-if="card?.kind === 'formation'">
        <h3 class="text-sm font-medium">
          How it attaches
        </h3>
        <ul class="mt-3 space-y-3">
          <li v-for="(f, i) in lesson.formations" :key="i">
            <p class="text-sm" style="font-family: var(--font-jp)">
              {{ f.ruleTemplate }}
            </p>
            <p v-if="f.example" class="mt-1 text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
              {{ f.example }}
            </p>
          </li>
        </ul>
      </template>

      <template v-else-if="card?.kind === 'examples'">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-medium">
            In use
          </h3>
          <button
            type="button"
            class="text-xs text-[var(--color-muted)] underline underline-offset-4 transition hover:text-[var(--color-text)]"
            @click="showEnglish = !showEnglish"
          >
            {{ showEnglish ? 'Hide English' : 'Show English' }}
          </button>
        </div>
        <ul class="mt-3 space-y-4">
          <li v-for="(ex, i) in lesson.examples" :key="ex.sentenceId">
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
              <p class="text-base leading-relaxed">
                <!-- TokenLine and not FuriganaText: it draws the ruby AND makes
                     each word tappable, which is the same affordance a
                     conversation line has. -->
                <TokenLine
                  :tokens="(ex.tokens as GlossedToken[])"
                  :text="ex.text"
                  :reading="ex.reading ?? ''"
                  :mode="mode"
                  :known-kanji="knownKanji"
                  :selected="selectedIn(i)"
                  @pick="t => pick(i, t)"
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
      </template>

      <template v-else-if="card?.kind === 'nuance'">
        <h3 class="text-sm font-medium">
          Worth knowing
        </h3>
        <p class="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
          <JaProse :text="lesson.nuance ?? ''" :prose="prose" :mode="mode" :known-kanji="knownKanji" />
        </p>
      </template>

      <template v-else-if="card?.kind === 'mistake' && lesson.mistake">
        <h3 class="text-sm font-medium">
          A common mistake
        </h3>
        <p class="mt-3 text-sm text-[var(--color-danger)]" style="font-family: var(--font-jp)">
          ✗ {{ lesson.mistake.wrong }}
        </p>
        <p class="mt-1 text-sm text-[var(--color-success)]" style="font-family: var(--font-jp)">
          ✓ {{ lesson.mistake.right }}
        </p>
        <p class="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
          {{ lesson.mistake.whyWrong }}
        </p>
      </template>
    </div>

    <!-- Where you are in the deck. Dots rather than "3 of 5" because the
         question is only ever "is there more", and a lesson is never long. -->
    <div v-if="cards.length > 1" class="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        class="text-[var(--color-muted)] transition enabled:hover:text-[var(--color-text)] disabled:opacity-30"
        :disabled="index === 0"
        aria-label="Previous"
        @click="back"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>
      <div class="flex gap-1.5">
        <span
          v-for="(_, i) in cards"
          :key="i"
          class="h-1.5 w-1.5 rounded-full transition"
          :class="i === index ? 'bg-[var(--color-text)]' : 'bg-[var(--color-border)]'"
        />
      </div>
      <button
        type="button"
        class="text-[var(--color-muted)] transition enabled:hover:text-[var(--color-text)] disabled:opacity-30"
        :disabled="last"
        aria-label="Next"
        @click="next"
      >
        <ChevronRight class="h-5 w-5" />
      </button>
    </div>

    <div class="mt-8 text-center">
      <Button variant="primary" @click="next">
        {{ last ? (finishLabel ?? 'Got it — quiz me') : 'Next' }}
      </Button>
      <p class="mt-4">
        <RouterLink
          :to="lesson.href"
          class="text-xs text-[var(--color-muted)] underline underline-offset-4 transition hover:text-[var(--color-text)]"
        >
          Read the full explanation
        </RouterLink>
      </p>
    </div>
  </div>
</template>
