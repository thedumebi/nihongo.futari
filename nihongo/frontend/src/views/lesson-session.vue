<script setup lang="ts">
import type { FuriganaSegment, GlossedToken, LessonDetail, LessonQuestion } from '@nihongo/shared/types'

import { gradeAnswer } from '@nihongo/shared/lib'
import { Volume2 } from 'lucide-vue-next'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { completeLesson, getLesson, getLessons } from '@/api/lessons'
import { markLessonSeen } from '@/api/study'
import AppShell from '@/components/layout/app-shell.vue'
import ChoiceInput from '@/components/study/choice-input.vue'
import ClozePrompt from '@/components/study/cloze-prompt.vue'
import GrammarLesson from '@/components/study/grammar-lesson.vue'
import KanaLesson from '@/components/study/kana-lesson.vue'
import OrderInput from '@/components/study/order-input.vue'
import AnswerBar from '@/components/ui/answer-bar.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import { useAnswerStreak } from '@/composables/use-answer-streak'
import { playAudio } from '@/composables/use-audio'
import { useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'
import { isNetworkError, queueAction } from '@/offline/queue'
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
const { recordAnswer, releaseCelebration } = useAnswerStreak()
const route = useRoute()
const router = useRouter()
const lang = useLanguageStore()
const { mode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()

type Phase = 'teach' | 'quiz' | 'done'

const detail = shallowRef<LessonDetail | null>(null)
/** The lesson to go on to once this one is done. */
const nextLesson = ref<{ slug: string, title: string } | null>(null)
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
// Dictation and listening ask about the SOUND, so the clip is the question
// rather than a hint beside it.
const isListening = computed(() =>
  question.value?.templateCode === 'dictation' || question.value?.templateCode === 'listening')

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

/** The cloze sentence's words and furigana, attached by the server. */
const clozeTokens = computed(() => ({
  before: (question.value?.prompt?.beforeTokens ?? []) as GlossedToken[],
  after: (question.value?.prompt?.afterTokens ?? []) as GlossedToken[]
}))
const clozeSegments = computed(() => ({
  before: (question.value?.prompt?.beforeFurigana ?? []) as FuriganaSegment[],
  after: (question.value?.prompt?.afterFurigana ?? []) as FuriganaSegment[]
}))

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

/**
 * This question's clip, where it has one.
 *
 * A dictation question is "listen and type what you hear", and the lesson had
 * no audio code at all — so it asked the reader to transcribe silence. The clip
 * was in the prompt's assets the whole time; nothing ever played it.
 */
const audioSrc = computed(() => {
  const src = question.value?.assets?.audio
  return typeof src === 'string' && src ? src : ''
})

// Played on arrival for a listening question, because that IS the question.
// Anything else offers the button and stays quiet.
watch(question, (q) => {
  if (q && audioSrc.value && isListening.value)
    playAudio(audioSrc.value)
}, { immediate: true })

// Shown only after the answer — see the note beside it in the template.
const explanation = computed(() => {
  const v = question.value?.prompt?.explanation
  return typeof v === 'string' ? v : ''
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
  recordAnswer(correct.value, { hold: true })
  if (correct.value && !missed.value.has(q.id))
    firstTimeRight.value += 1
  if (!correct.value)
    missed.value.add(q.id)
}

/**
 * Whether pressing on asks this question again. A miss comes back once — the
 * second miss moves on — so on the last question "Next" is only true for a
 * first miss; a second one finishes the lesson and must say so.
 */
const willRetry = computed(() => {
  const q = queue.value[0]
  return !correct.value && q !== undefined && (attempts.value.get(q.id) ?? 0) + 1 < 2
})

async function next() {
  // Moving on: a celebration the last answer earned opens first, and the next question waits for it.
  await releaseCelebration()
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
  } catch (e) {
    // The lesson still happened. Offline, it is queued and sent once the
    // phone is back — it used to be lost, and the topic never reached review.
    if (isNetworkError(e))
      await queueAction({ type: 'lessonComplete', languageCode: lang.code, slug, score, missedPromptIds: [...missed.value] })
  }
  // What comes after, so the done screen leads somewhere instead of back to a list.
  try {
    const next = (await getLessons(lang.code)).next
    nextLesson.value = next && next.slug !== slug ? next : null
  } catch {
    nextLesson.value = null
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
        <KanaLesson
          v-if="phase === 'teach' && detail.kana"
          :kana="detail.kana"
          :finish-label="detail.questions.length > 0 ? 'Got it, quiz me' : 'Got it'"
          @done="startQuiz"
        />

        <GrammarLesson
          v-else-if="phase === 'teach' && detail.lesson"
          :lesson="detail.lesson"
          :prose="detail.prose"
          :finish-label="detail.questions.length > 0 ? 'Got it, quiz me' : 'Got it'"
          @done="startQuiz"
        />

        <!-- QUIZ -->
        <div v-else-if="phase === 'quiz' && question" class="flex flex-col gap-6">
          <div class="flex items-baseline justify-between text-xs text-[var(--color-muted)]">
            <span style="font-family: var(--font-jp)">{{ detail.lesson?.title ?? detail.kana?.rowLabel }}</span>
            <span>{{ answered }}/{{ total }}</span>
          </div>

          <p v-if="promptText.instruction" class="text-center text-sm text-[var(--color-muted)]">
            {{ promptText.instruction }}
          </p>

          <p v-if="promptText.subject" class="text-center text-5xl leading-tight" style="font-family: var(--font-jp)">
            {{ promptText.subject }}
          </p>

          <!-- The sentence in the reader's furigana mode, as Review shows it. -->
          <ClozePrompt
            v-else-if="(promptText.before || promptText.after) && (clozeTokens.before.length || clozeTokens.after.length || clozeSegments.before.length || clozeSegments.after.length)"
            :before="promptText.before"
            :after="promptText.after"
            :before-tokens="clozeTokens.before"
            :after-tokens="clozeTokens.after"
            :before-segments="clozeSegments.before"
            :after-segments="clozeSegments.after"
            :answer="question.answer.primary"
            :revealed="revealed"
            :mode="mode"
            :known-kanji="knownKanji"
            :selected-before="null"
            :selected-after="null"
          />
          <p v-else-if="promptText.before || promptText.after" class="text-center text-2xl leading-relaxed" style="font-family: var(--font-jp)">
            {{ promptText.before }}<span
              class="mx-1 inline-block min-w-[3ch] border-b-2 px-2 align-bottom"
              :class="revealed ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-muted)]'"
            >{{ revealed ? question.answer.primary : '' }}</span>{{ promptText.after }}
          </p>

          <p v-if="promptText.translation" class="text-center text-sm text-[var(--color-muted)]">
            {{ promptText.translation }}
          </p>

          <!--
            Replay. A listening question plays itself on arrival, but once is
            rarely enough to transcribe a sentence, and there was previously no
            way to hear it a second time — or a first, since nothing played at
            all.
          -->
          <button
            v-if="audioSrc"
            type="button"
            class="mx-auto flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]"
            @click="playAudio(audioSrc)"
          >
            <Volume2 class="h-4 w-4" />
            {{ isListening ? 'Play again' : 'Listen' }}
          </button>

          <form id="lesson-answer" class="flex flex-col gap-4" @submit.prevent="revealed ? next() : submit()">
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
              answer
            />

            <p v-if="revealed" class="text-center font-semibold" :class="correct ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
              {{ correct ? 'Correct' : `Not quite: ${question.answer.primary}` }}
            </p>

            <!--
              Why the wrong one is wrong, and only once the answer is in.

              It used to ride along as the question's subtitle, where "く-verbs
              take いて, but 行く is irregular" sat above 行くて and 行って and
              answered the question for you. The explanation is the valuable
              part of a mistake question; it just has to come second.
            -->
            <p v-if="revealed && explanation" class="text-center text-sm text-[var(--color-muted)]">
              {{ explanation }}
            </p>
          </form>

          <!-- Outside the form, as the quiz's last child, so it stays in view
               on a long question; it submits through form="lesson-answer". -->
          <AnswerBar>
            <Button type="submit" form="lesson-answer" variant="primary" class="w-full">
              {{ revealed ? (queue.length > 1 || willRetry ? 'Next' : 'Finish') : 'Check' }}
            </Button>
          </AnswerBar>
        </div>

        <!-- DONE -->
        <div v-else class="py-10 text-center">
          <p class="text-sm text-[var(--color-muted)]">
            Lesson complete
          </p>
          <p class="mt-3 text-4xl" style="font-family: var(--font-jp)">
            {{ detail.lesson?.title ?? detail.kana?.characters.map(c => c.character).join('') }}
          </p>
          <p v-if="total > 0" class="mt-6 text-2xl">
            {{ score }}%
          </p>
          <p class="mx-auto mt-3 max-w-sm text-sm text-[var(--color-muted)]">
            <template v-if="missed.size > 0">
              {{ missed.size }} {{ missed.size === 1 ? 'question' : 'questions' }} to see again. You'll get
              {{ missed.size === 1 ? 'it' : 'them' }} first next time this comes round in review.
            </template>
            <template v-else>
              Nothing missed. This topic is now open for review, and will come back
              as the curriculum reaches it.
            </template>
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <!-- A missed question is due straight away: review it while the
                 lesson is fresh, rather than meet it cold days later. -->
            <Button v-if="missed.size > 0" :variant="nextLesson ? 'ghost' : 'primary'" :to="ROUTES.REVIEW">
              Review the {{ missed.size === 1 ? 'one' : 'ones' }} you missed
            </Button>
            <Button v-if="nextLesson" :to="ROUTES.LESSON_DETAIL(nextLesson.slug)">
              Next: <span style="font-family: var(--font-jp)">{{ nextLesson.title }}</span>
            </Button>
            <Button variant="ghost" @click="router.push(ROUTES.LESSONS)">
              All lessons
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
