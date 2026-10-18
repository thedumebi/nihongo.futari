<script setup lang="ts">
import type { FuriganaMode, JlptLevel, OnboardingGoal, OnboardingMinutes, OnboardingStart } from '@nihongo/shared/constants'
import type { OnboardingAnswers, PlacementQuestion } from '@nihongo/shared/types'

import { FURIGANA_MODES, STAGE_SIZE } from '@nihongo/shared/constants'
import { guideFor, paceFor, studyLevelFor, suggestedFurigana } from '@nihongo/shared/lib'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { getPrefs } from '@/api/notifications'
import { getPlacement } from '@/api/onboarding'
import { getStudySettings } from '@/api/settings'
import FuriganaText from '@/components/ja/furigana-text.vue'
import OptionList from '@/components/onboarding/option-list.vue'
import PlacementCheck from '@/components/onboarding/placement-check.vue'
import Button from '@/components/ui/button.vue'
import { FURIGANA_MODE_LABELS, useFurigana } from '@/composables/use-furigana'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
import { enablePush, pushOnThisDevice, pushSupport } from '@/offline/push'
import { useLanguageStore } from '@/store/language'
import { useOnboardingStore } from '@/store/onboarding'

/**
 * Welcome: a minute of questions, then a start that fits.
 *
 * Someone invited to go used to land on Today with no idea where to begin. The
 * answers here set what already exists — reading help, level, new cards a day,
 * reminders — and build a short first-week guide that sits on Today and ticks
 * itself off. Skippable at every step, and it can be run again from Settings.
 */

// ============ Stores ============
const onboarding = useOnboardingStore()
const lang = useLanguageStore()

// ============ Composables ============
const router = useRouter()
const toast = useToast()
const { mode: currentMode } = useFurigana()

// ============ Constants ============
type Step = 'hello' | 'start' | 'goals' | 'time' | 'reading' | 'reminder' | 'placement' | 'plan'

const STARTS: Array<{ value: OnboardingStart, label: string, hint: string }> = [
  { value: 'new', label: 'Completely new', hint: 'I can\'t read any Japanese yet.' },
  { value: 'some-kana', label: 'I know some kana', hint: 'A few hiragana, maybe some katakana.' },
  { value: 'kana', label: 'I can read hiragana and katakana', hint: 'But not much kanji.' },
  { value: 'studied', label: 'I\'ve studied before', hint: 'A short check finds your level.' }
]
const GOALS: Array<{ value: OnboardingGoal, label: string }> = [
  { value: 'travel', label: 'Travel' },
  { value: 'media', label: 'Anime, manga, games, TV' },
  { value: 'work', label: 'Work' },
  { value: 'family', label: 'Partner, family or friends' },
  { value: 'exam', label: 'The JLPT exam' },
  { value: 'living', label: 'Living in Japan' }
]
const MINUTES: Array<{ value: OnboardingMinutes, label: string, hint: string }> = [
  { value: 5, label: '5 minutes', hint: '5 new words a day' },
  { value: 15, label: '15 minutes', hint: '10 new words a day' },
  { value: 30, label: '30 minutes', hint: '15 new words a day' },
  { value: 60, label: 'An hour or more', hint: '25 new words a day' }
]
/** A sentence to preview each kind of reading help on: "I study Japanese." */
const SAMPLE = '私は日本語を勉強します。'
const SAMPLE_SEGMENTS = [
  { t: '私', r: 'わたし' },
  { t: 'は' },
  { t: '日本語', r: 'にほんご' },
  { t: 'を' },
  { t: '勉強', r: 'べんきょう' },
  { t: 'します。' }
]
const TOUR = [
  { title: 'Today', body: 'Opens every time: what is due, what to learn next, your streak and three small goals for the day.' },
  { title: 'Review', body: 'Words come back just before you would forget them. A few minutes a day keeps everything you have learned.' },
  { title: 'Learn and Practice', body: 'Learn brings new words in stages, with lessons and writing. Finish most of a stage and the next one opens. Practice is for using them: speaking, conversations, reading and games.' }
]

// ============ Reactive State ============
const step = ref<Step>('hello')
const start = ref<OnboardingStart | null>(null)
const goals = ref<OnboardingGoal[]>([])
const minutes = ref<OnboardingMinutes | null>(null)
const furigana = ref<FuriganaMode>('kana')
const remind = ref(true)
const hour = ref(19)
const minute = ref<0 | 15 | 30 | 45>(0)
const email = ref(true)
const push = ref(false)
/**
 * This device already gets notifications: nothing to ask. The checkbox would
 * only prompt again, and on 15 Oct, run in another copy of the app, it made a
 * second subscription and every reminder arrived twice.
 */
const pushHere = ref(false)
/**
 * Push is on for the account. The device box can only ADD this device, so
 * leaving it unticked must not turn push off everywhere; that is Settings' job.
 */
const accountPush = ref(false)
const level = ref<JlptLevel | null>(null)
/** Extra practice as a multiple of new words (Settings): 2× unless they changed it. */
const extraMultiple = ref(2)
const questions = ref<PlacementQuestion[]>([])
const saving = ref(false)

// ============ Computed Properties ============
const steps = computed<Step[]>(() => [
  'hello',
  'start',
  'goals',
  'time',
  'reading',
  'reminder',
  ...(start.value === 'studied' ? ['placement' as const] : []),
  'plan'
])
const position = computed(() => steps.value.indexOf(step.value))
const canPush = computed(() => pushSupport().supported)
const readingOptions = computed(() => FURIGANA_MODES
  .map(m => ({
    value: m,
    label: FURIGANA_MODE_LABELS[m].label + (start.value && m === suggestedFurigana(start.value) ? ' (suggested)' : ''),
    hint: FURIGANA_MODE_LABELS[m].description
  }))
  .sort((a, b) => Number(b.label.endsWith('suggested')) - Number(a.label.endsWith('suggested'))))
const answers = computed<OnboardingAnswers | null>(() => start.value && minutes.value
  ? {
      start: start.value,
      goals: goals.value,
      minutes: minutes.value,
      furiganaMode: furigana.value,
      level: level.value,
      reminder: remind.value ? { hour: hour.value, minute: minute.value, email: email.value, push: push.value || pushHere.value || accountPush.value } : null
    }
  : null)
const guide = computed(() => answers.value ? guideFor(answers.value) : [])
const plan = computed(() => {
  if (!answers.value)
    return null
  const pace = paceFor(answers.value.minutes)
  return { level: studyLevelFor(answers.value), pace, extras: pace.dailyNewLimit * extraMultiple.value }
})
const canContinue = computed(() => {
  if (step.value === 'start')
    return start.value !== null
  if (step.value === 'time')
    return minutes.value !== null
  return true
})

// ============ Watchers ============
// The suggested reading help follows the starting point, until they choose.
watch(start, (s) => {
  if (s)
    furigana.value = suggestedFurigana(s)
})

// ============ Lifecycle Hooks ============
// Run again from Settings: start from the previous answers.
onMounted(async () => {
  const [state, prefs, here, study] = await Promise.all([
    onboarding.load(),
    getPrefs().catch(() => null),
    pushOnThisDevice(),
    getStudySettings().catch(() => null)
  ])
  pushHere.value = here
  extraMultiple.value = study?.extraPracticeMultiple ?? extraMultiple.value
  accountPush.value = prefs?.reminderPushEnabled ?? false
  const previous = state?.answers
  if (!previous) {
    // Someone already using go, here for the first time: start from the
    // reminders they have, not the defaults, so finishing changes nothing
    // they did not touch.
    if (prefs && (prefs.reminderEmailEnabled || prefs.reminderPushEnabled)) {
      remind.value = true
      hour.value = prefs.reminderHour
      minute.value = (prefs.reminderMinute ?? 0) as 0 | 15 | 30 | 45
      email.value = prefs.reminderEmailEnabled
    }
    return
  }
  start.value = previous.start
  goals.value = [...previous.goals]
  minutes.value = previous.minutes
  level.value = previous.level
  remind.value = previous.reminder !== null
  if (previous.reminder) {
    hour.value = previous.reminder.hour
    minute.value = previous.reminder.minute
    email.value = previous.reminder.email
  }
  // After `start`, whose watcher would otherwise reset it to the suggestion.
  await nextTick()
  furigana.value = previous.furiganaMode
})

// ============ Methods ============
function next() {
  const i = position.value
  if (i < steps.value.length - 1)
    step.value = steps.value[i + 1]!
  if (step.value === 'placement' && questions.value.length === 0)
    void loadPlacement()
}

function back() {
  const i = position.value
  if (i > 0)
    step.value = steps.value[i - 1]!
}

async function loadPlacement() {
  try {
    questions.value = (await getPlacement(lang.code)).questions
  } catch {
    // Without questions there is no check: start them at N5, the safe end.
    level.value = 'N5'
    next()
  }
}

function placed(result: JlptLevel) {
  level.value = result
  next()
}

async function togglePush() {
  if (push.value) {
    push.value = false
    return
  }
  const result = await enablePush()
  push.value = result.ok
  if (!result.ok)
    toast.error('Notifications are not allowed on this device. Email reminders still work.')
}

async function finish() {
  if (!answers.value || saving.value)
    return
  saving.value = true
  try {
    await onboarding.submit(answers.value)
    // The app reads these settings locally too; keep it in step.
    currentMode.value = answers.value.furiganaMode
    await router.push(ROUTES.TODAY)
  } catch {
    toast.error('Could not save that. Try again in a moment.')
  } finally {
    saving.value = false
  }
}

async function skip() {
  try {
    await onboarding.skip()
  } finally {
    await router.push(ROUTES.TODAY)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <div class="mx-auto max-w-md px-4 py-8 sm:py-12">
      <!-- Progress and the way out, on every step. -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex gap-1" aria-hidden="true">
          <span
            v-for="(s, i) in steps"
            :key="s"
            class="h-1.5 w-6 rounded-full"
            :class="i <= position ? 'bg-[var(--color-text)]' : 'bg-[var(--color-border)]'"
          />
        </div>
        <button type="button" class="text-sm text-[var(--color-muted)] underline underline-offset-4" @click="skip">
          Skip for now
        </button>
      </div>

      <section v-if="step === 'hello'" class="mt-12">
        <p class="text-5xl" style="font-family: var(--font-jp)">
          ようこそ
        </p>
        <h1 class="mt-4 text-3xl font-semibold">
          Welcome to go
        </h1>
        <p class="mt-3 text-[var(--color-muted)]">
          A few quick questions so the app starts where you are. About a minute, and you can change any of it later in Settings.
        </p>
      </section>

      <section v-else-if="step === 'start'" class="mt-10">
        <h1 class="text-2xl font-semibold">
          Where are you starting from?
        </h1>
        <OptionList v-model="start" class="mt-6" :options="STARTS" />
      </section>

      <section v-else-if="step === 'goals'" class="mt-10">
        <h1 class="text-2xl font-semibold">
          What are you learning for?
        </h1>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Pick any that fit, or none.
        </p>
        <OptionList v-model="goals" class="mt-6" :options="GOALS" multiple />
      </section>

      <section v-else-if="step === 'time'" class="mt-10">
        <h1 class="text-2xl font-semibold">
          How long a day?
        </h1>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          A little every day beats a lot once a week.
        </p>
        <OptionList v-model="minutes" class="mt-6" :options="MINUTES" />
        <p class="mt-4 text-sm text-[var(--color-muted)]">
          Each new word comes with a few more cards later (reading, writing, listening), so a day is
          more than the new words alone.
        </p>
      </section>

      <section v-else-if="step === 'reading'" class="mt-10">
        <h1 class="text-2xl font-semibold">
          How should Japanese be shown?
        </h1>
        <div class="mt-4 rounded-xl border border-[var(--color-border)] p-4 text-center text-xl leading-[2.2]">
          <FuriganaText :text="SAMPLE" :segments="SAMPLE_SEGMENTS" :mode="furigana" />
          <p class="text-sm text-[var(--color-muted)]">
            I study Japanese.
          </p>
        </div>
        <OptionList v-model="furigana" class="mt-4" :options="readingOptions" />
      </section>

      <section v-else-if="step === 'reminder'" class="mt-10">
        <h1 class="text-2xl font-semibold">
          A daily reminder?
        </h1>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Only on days you have not studied yet.
        </p>
        <OptionList
          :model-value="remind ? 'yes' : 'no'"
          class="mt-6"
          :options="[{ value: 'yes', label: 'Yes, remind me' }, { value: 'no', label: 'No reminders' }]"
          @update:model-value="remind = $event === 'yes'"
        />
        <div v-if="remind" class="mt-4 space-y-3 rounded-xl border border-[var(--color-border)] p-4">
          <label class="flex items-center justify-between gap-3">
            <span>At</span>
            <span class="flex gap-2">
              <select v-model.number="hour" class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1">
                <option v-for="h in 24" :key="h - 1" :value="h - 1">{{ String(h - 1).padStart(2, '0') }}</option>
              </select>
              <select v-model.number="minute" class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1">
                <option v-for="m in [0, 15, 30, 45]" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
              </select>
            </span>
          </label>
          <label class="flex items-center justify-between gap-3">
            <span>By email</span>
            <input v-model="email" type="checkbox" class="h-5 w-5">
          </label>
          <p v-if="pushHere" class="text-sm text-[var(--color-muted)]">
            Notifications are already on for this device.
          </p>
          <label v-else-if="canPush" class="flex items-center justify-between gap-3">
            <span>As a notification on this device</span>
            <input :checked="push" type="checkbox" class="h-5 w-5" @change="togglePush">
          </label>
        </div>
      </section>

      <section v-else-if="step === 'placement'" class="mt-10">
        <h1 class="text-2xl font-semibold">
          A quick check
        </h1>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          A few words from each level, easiest first. It stops as soon as one gets hard.
        </p>
        <PlacementCheck v-if="questions.length" class="mt-6" :questions="questions" @done="placed" />
        <p v-else class="mt-6 text-[var(--color-muted)]">
          Loading…
        </p>
      </section>

      <section v-else-if="step === 'plan' && plan" class="mt-10">
        <h1 class="text-2xl font-semibold">
          Your plan
        </h1>
        <ul class="mt-4 space-y-1 text-[var(--color-muted)]">
          <li>Studying at <strong class="text-[var(--color-text)]">{{ plan.level }}</strong></li>
          <li>
            <strong class="text-[var(--color-text)]">{{ plan.pace.dailyNewLimit }}</strong> new words a day, plus up to
            <strong class="text-[var(--color-text)]">{{ plan.extras }}</strong> cards of extra practice on words you've met
          </li>
          <li>Japanese shown as <strong class="text-[var(--color-text)]">{{ FURIGANA_MODE_LABELS[furigana].label }}</strong></li>
          <li v-if="remind">
            Reminder at <strong class="text-[var(--color-text)]">{{ String(hour).padStart(2, '0') }}:{{ String(minute).padStart(2, '0') }}</strong>
          </li>
        </ul>
        <p class="mt-3 text-sm text-[var(--color-muted)]">
          The course goes in stages of about {{ STAGE_SIZE }} items. When you've met everything in a
          stage, new words pause until you've learned most of it. Study keeps giving you practice in
          the meantime.
        </p>

        <h2 class="mt-8 font-semibold">
          Your first week
        </h2>
        <p class="text-sm text-[var(--color-muted)]">
          This list stays on Today, and ticks itself off as you go.
        </p>
        <ol class="mt-3 space-y-2">
          <li v-for="(s, i) in guide" :key="s.code" class="flex gap-3">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-xs">{{ i + 1 }}</span>
            <span>
              <span class="block font-medium">{{ s.title }}</span>
              <span class="block text-sm text-[var(--color-muted)]">{{ s.why }}</span>
            </span>
          </li>
        </ol>

        <h2 class="mt-8 font-semibold">
          How go works
        </h2>
        <div class="mt-3 space-y-2">
          <div v-for="t in TOUR" :key="t.title" class="rounded-xl border border-[var(--color-border)] p-4">
            <p class="font-medium">
              {{ t.title }}
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]">
              {{ t.body }}
            </p>
          </div>
        </div>
      </section>

      <!-- Placement moves itself on; every other step has Back and Continue. -->
      <div v-if="step !== 'placement'" class="mt-10 flex items-center justify-between gap-3">
        <Button v-if="position > 0" variant="ghost" @click="back">
          Back
        </Button>
        <span v-else />
        <Button v-if="step === 'plan'" :loading="saving" @click="finish">
          Start learning
        </Button>
        <Button v-else :disabled="!canContinue" @click="next">
          {{ step === 'hello' ? 'Let\'s go' : 'Continue' }}
        </Button>
      </div>
    </div>
  </div>
</template>
