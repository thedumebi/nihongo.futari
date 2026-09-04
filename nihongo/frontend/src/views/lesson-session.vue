<script setup lang="ts">
import type { LessonDetail, LessonQuestion } from '@nihongo/shared/types'

import { gradeAnswer } from '@nihongo/shared/lib'
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { completeLesson, getLesson } from '@/api/lessons'
import { markLessonSeen } from '@/api/study'
import AppShell from '@/components/layout/app-shell.vue'
import ChoiceInput from '@/components/study/choice-input.vue'
import GrammarLesson from '@/components/study/grammar-lesson.vue'
import OrderInput from '@/components/study/order-input.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import { useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * One lesson: learn it, then answer questions on it.
 *
 * Graded here, in the browser, and never sent to the scheduler. A question
 * answered half a minute after reading the explanation says nothing about
 * whether it will be remembered next week, and `srs_cards` is a fold over the
 * review log — one fabricated entry inflates every interval after it, forever.
 * What IS sent, on completion, is the score and the list of questions missed:
 * enough for the topic to enter review and for the missed ones to come back
 * first.
 */
const route = useRoute()
const router = useRouter()
const lang = useLanguageStore()
const { mode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()

type Phase = 'teach' | 'quiz' | 'done'

const detail = shallowRef<LessonDetail | null>(null)
const loading = ref(true)
const phase = ref<Phase>('teach')

/** The questions still to ask. Missed ones are pushed back on for a second go. */
const queue = ref<LessonQuestion[]>([])
const answered = ref(0)
const firstTimeRight = ref(0)
/** Every question missed at any point, which is what comes back in review. */
const missed = ref<Set<string>>(new Set())
/**
 * How many times each question has been asked this session.
 *
 * A missed question is asked again, as Bunpo does — but only once more. Asking
 * until it is right sounds kinder and is a trap: a typed question you cannot
 * answer becomes an infinite loop with no way out but leaving, and the reader
 * who most needs to move on is the one held there. Two attempts, then the
 * lesson continues; the miss is recorded either way, so review brings it back.
 */
const attempts = ref<Map<string, number>>(new Map())

const answer = ref('')
const placed = ref<number[]>([])
const revealed = ref(false)
const correct = ref(false)

const question = computed(() => queue.value[0])
const total = computed(() => detail.value?.questions.length ?? 0)

const isChoice = computed(() => question.value?.inputMode === 'choice')
const isOrdering = computed(() => question.value?.inputMode === 'ordering')

const choices = computed(() => {
  const q = question.value
  if (!q)
    return []
  const options = [q.answer.primary, ...q.distractors.filter((d): d is string => typeof d === 'string')]
  // Stable per question rather than per render, or the options reshuffle under
  // the reader's finger between clicking and the reveal.
  return [...new Set(options)].sort((a, b) => a.localeCompare(b))
})

const orderTiles = computed(() => {
  const t = question.value?.prompt?.tokens
  return Array.isArray(t) ? t.filter((x): x is string => typeof x === 'string') : []
})
const tileFurigana = computed(() =>
  (question.value?.prompt?.tokenFurigana ?? {}) as Record<string, never>)

const promptText = computed(() => {
  const p = question.value?.prompt ?? {}
  const str = (v: unknown) => (typeof v === 'string' ? v : '')

  // A grammar cloze stores its whole sentence with the gap marked by ＿, where
  // a vocabulary cloze stores `before`/`after` either side of it. Reading only
  // the second shape rendered every grammar fill-the-blank as a bare
  // instruction and an empty box — unanswerable unless you already knew the
  // topic. `study.vue` had always handled both; the lesson view dropped one.
  const sentence = str(p.sentence)
  const [gapBefore, gapAfter] = sentence.includes('＿')
    ? [sentence.slice(0, sentence.indexOf('＿')), sentence.slice(sentence.lastIndexOf('＿') + 1)]
    : ['', '']

  return {
    instruction: str(p.instruction),
    subject: str(p.character) || str(p.word) || '',
    before: str(p.before) || gapBefore,
    after: str(p.after) || gapAfter,
    // `gloss` on a grammar cloze, `translation` on a vocabulary one.
    translation: str(p.translation) || str(p.gloss)
  }
})

function reset() {
  answer.value = ''
  placed.value = []
  revealed.value = false
  correct.value = false
}

function submit() {
  const q = question.value
  if (!q || revealed.value)
    return

  const given = isOrdering.value
    ? placed.value.map(i => orderTiles.value[i]).join('')
    : answer.value

  correct.value = gradeAnswer(q.graderCode, given, q.answer).correct
  revealed.value = true
  if (correct.value && !missed.value.has(q.id))
    firstTimeRight.value += 1
  if (!correct.value)
    missed.value.add(q.id)
}

function next() {
  const q = queue.value.shift()
  if (!q)
    return
  const tries = (attempts.value.get(q.id) ?? 0) + 1
  attempts.value.set(q.id, tries)

  if (!correct.value && tries < 2) {
    // Bunpo's loop: a missed question is asked again before the lesson ends.
    queue.value.push(q)
  } else {
    answered.value += 1
  }
  reset()
  if (queue.value.length === 0)
    void finish()
}

async function finish() {
  phase.value = 'done'
  const slug = String(route.params.slug)
  const score = total.value === 0 ? 100 : Math.round((firstTimeRight.value / total.value) * 100)
  try {
    await completeLesson(slug, { score, missedPromptIds: [...missed.value] }, lang.code)
  } catch {
    // The lesson still happened. Losing the record costs a status chip and a
    // re-ask, which is not worth blocking the reader on.
  }
}

function startQuiz() {
  // Reading the explanation is what admits a topic to review, so record it the
  // moment the deck is finished rather than waiting for the quiz. Someone who
  // reads a lesson and walks away has still met it, and should meet it again in
  // review rather than be shown it cold as though it were new.
  if (detail.value)
    void markLessonSeen(detail.value.studyItemId).catch(() => {})

  queue.value = [...(detail.value?.questions ?? [])]
  phase.value = queue.value.length > 0 ? 'quiz' : 'done'
  if (queue.value.length === 0)
    void finish()
}

const score = computed(() =>
  total.value === 0 ? 100 : Math.round((firstTimeRight.value / total.value) * 100))

onMounted(async () => {
  void loadKnownKanji(lang.code)
  void loadSettings()
  try {
    detail.value = await getLesson(String(route.params.slug), lang.code)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <p v-if="loading" class="text-[var(--color-muted)]">
        Loading…
      </p>

      <template v-else-if="detail">
        <!-- TEACH — the same deck the study introduction shows, so a topic
             reads identically wherever you meet it. -->
        <GrammarLesson
          v-if="phase === 'teach'"
          :lesson="detail.lesson"
          :finish-label="detail.questions.length > 0 ? 'Got it — quiz me' : 'Got it'"
          @done="startQuiz"
        />

        <!-- QUIZ -->
        <div v-else-if="phase === 'quiz' && question" class="flex flex-col gap-6">
          <div class="flex items-baseline justify-between text-xs text-[var(--color-muted)]">
            <span style="font-family: var(--font-jp)">{{ detail.lesson.title }}</span>
            <span>{{ answered }}/{{ total }}</span>
          </div>

          <p v-if="promptText.instruction" class="text-center text-sm text-[var(--color-muted)]">
            {{ promptText.instruction }}
          </p>

          <p v-if="promptText.subject" class="text-center text-5xl leading-tight" style="font-family: var(--font-jp)">
            {{ promptText.subject }}
          </p>

          <p v-else-if="promptText.before || promptText.after" class="text-center text-2xl leading-relaxed" style="font-family: var(--font-jp)">
            {{ promptText.before }}<span
              class="mx-1 inline-block min-w-[3ch] border-b-2 px-2 align-bottom"
              :class="revealed ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-muted)]'"
            >{{ revealed ? question.answer.primary : '' }}</span>{{ promptText.after }}
          </p>

          <p v-if="promptText.translation" class="text-center text-sm text-[var(--color-muted)]">
            {{ promptText.translation }}
          </p>

          <form class="flex flex-col gap-4" @submit.prevent="revealed ? next() : submit()">
            <ChoiceInput
              v-if="isChoice"
              :options="choices"
              :correct="question.answer.primary"
              :chosen="answer"
              :revealed="revealed"
              @choose="(o) => { answer = o; submit() }"
            />

            <OrderInput
              v-else-if="isOrdering"
              :tiles="orderTiles"
              :tile-furigana="tileFurigana"
              :placed="placed"
              :revealed="revealed"
              :mode="mode"
              :known-kanji="knownKanji"
              @place="(i) => placed.push(i)"
              @remove="(p) => placed.splice(p, 1)"
            />

            <Input
              v-else
              v-model="answer"
              :disabled="revealed"
              placeholder="Your answer"
              autocomplete="off"
            />

            <p v-if="revealed" class="text-center font-semibold" :class="correct ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
              {{ correct ? 'Correct' : `Not quite — ${question.answer.primary}` }}
            </p>

            <Button type="submit" variant="primary">
              {{ revealed ? (queue.length > 1 || !correct ? 'Next' : 'Finish') : 'Check' }}
            </Button>
          </form>
        </div>

        <!-- DONE -->
        <div v-else class="py-10 text-center">
          <p class="text-sm text-[var(--color-muted)]">
            Lesson complete
          </p>
          <p class="mt-3 text-4xl" style="font-family: var(--font-jp)">
            {{ detail.lesson.title }}
          </p>
          <p v-if="total > 0" class="mt-6 text-2xl">
            {{ score }}%
          </p>
          <p class="mx-auto mt-3 max-w-sm text-sm text-[var(--color-muted)]">
            <template v-if="missed.size > 0">
              {{ missed.size }} {{ missed.size === 1 ? 'question' : 'questions' }} to see again — you'll get
              {{ missed.size === 1 ? 'it' : 'them' }} first next time this comes round in review.
            </template>
            <template v-else>
              Nothing missed. This topic is now open for review, and will come back
              as the curriculum reaches it.
            </template>
          </p>
          <div class="mt-8 flex justify-center gap-3">
            <Button variant="primary" @click="router.push(ROUTES.LESSONS)">
              Back to lessons
            </Button>
          </div>
        </div>
      </template>

      <p v-else class="text-[var(--color-muted)]">
        That lesson doesn't exist.
      </p>
    </div>
  </AppShell>
</template>
