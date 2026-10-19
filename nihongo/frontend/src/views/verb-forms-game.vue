<script setup lang="ts">
import type { DrillForm, VerbFormsGame, VerbFormsRound } from '@nihongo/shared/types'

import { buildVerbFormRounds, gradeAnswer, VERB_FORM_INFO } from '@nihongo/shared/lib'
import { Heart } from 'lucide-vue-next'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { recordActivity } from '@/api/activities'
import { getVerbFormsGame } from '@/api/games'
import GameEnd from '@/components/games/game-end.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Verb forms: a verb you know, a form to put it in, three hearts.
 *
 * Pick the forms to play (or all of them mixed); only forms a grammar lesson
 * has taught are open. The wrong answers are real mistakes (帰て, 書って,
 * 書かます), so a right pick means knowing the rule, and every answer shows
 * the rule after. Tap by default; typing is a switch away and is graded like
 * Study, so romaji and kana count.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Constants ============
const ROUND_SIZE = 15
const HEARTS = 3
/** Per device: whether to type answers rather than tap them. */
const TYPE_KEY = 'go.verb-forms.type'

// ============ Reactive State ============
const game = ref<VerbFormsGame | null>(null)
const loading = ref(true)
const failed = ref(false)
const selected = ref<DrillForm[]>([])
const typing = ref(readTyping())
const rounds = ref<VerbFormsRound[]>([])
const playing = ref(false)
const index = ref(0)
const picked = ref<string | null>(null)
const typed = ref('')
const correct = ref<boolean | null>(null)
const score = ref(0)
const hearts = ref(HEARTS)
const combo = ref(0)
const bestCombo = ref(0)
const missed = ref<VerbFormsRound[]>([])
const answerInput = ref<HTMLInputElement | null>(null)

// ============ Computed Properties ============
const openForms = computed(() => game.value?.forms.filter(f => f.unlocked).map(f => f.form) ?? [])
const lockedForms = computed(() => game.value?.forms.filter(f => !f.unlocked) ?? [])
const mixed = computed(() => openForms.value.length > 0 && selected.value.length === openForms.value.length)
const round = computed(() => rounds.value[index.value] ?? null)
/** Out of questions, or out of hearts once the last answer has been read. */
const finished = computed(() => playing.value && (index.value >= rounds.value.length || (hearts.value === 0 && correct.value === null)))
/** One missed question per form, for the end screen's rules. */
const missedForms = computed(() => {
  const seen = new Map<DrillForm, VerbFormsRound>()
  for (const r of missed.value) {
    if (!seen.has(r.form))
      seen.set(r.form, r)
  }
  return [...seen.values()]
})

// ============ Watchers ============
watch(typing, (on) => {
  try {
    localStorage.setItem(TYPE_KEY, on ? '1' : '0')
  } catch {
    // Private mode: the switch still works, it just is not remembered.
  }
})

watch(finished, (done) => {
  if (done && rounds.value.length) {
    const refId = mixed.value ? 'mixed' : [...selected.value].sort().join(',')
    void recordActivity({ kind: 'verb-forms', refId, score: score.value, total: rounds.value.length }, lang.code)
  }
})

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
function readTyping(): boolean {
  try {
    return localStorage.getItem(TYPE_KEY) === '1'
  } catch {
    return false
  }
}

async function load() {
  loading.value = true
  failed.value = false
  try {
    game.value = await getVerbFormsGame(lang.code)
    selected.value = [...openForms.value]
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function toggle(form: DrillForm) {
  // From "all of them", a tap means "just this one".
  if (mixed.value && openForms.value.length > 1)
    selected.value = [form]
  else if (selected.value.includes(form))
    selected.value = selected.value.filter(f => f !== form)
  else
    selected.value = [...selected.value, form]
}

function chooseMixed() {
  selected.value = [...openForms.value]
}

function start(forms: DrillForm[] = selected.value) {
  if (!game.value || !forms.length)
    return
  selected.value = [...forms]
  rounds.value = buildVerbFormRounds(game.value.verbs, forms, ROUND_SIZE)
  index.value = 0
  score.value = 0
  hearts.value = HEARTS
  combo.value = 0
  bestCombo.value = 0
  missed.value = []
  playing.value = true
  resetAnswer()
}

function resetAnswer() {
  picked.value = null
  typed.value = ''
  correct.value = null
  if (typing.value)
    void nextTick(() => answerInput.value?.focus())
}

function settle(right: boolean) {
  correct.value = right
  if (right) {
    score.value++
    combo.value++
    bestCombo.value = Math.max(bestCombo.value, combo.value)
  } else {
    hearts.value--
    combo.value = 0
    missed.value = [...missed.value, round.value!]
  }
}

function pick(option: string) {
  if (correct.value !== null || !round.value)
    return
  picked.value = option
  settle(option === round.value.answer.reading)
}

function check() {
  if (correct.value !== null || !round.value || !typed.value.trim())
    return
  const r = round.value
  settle(gradeAnswer('normalised-jp', typed.value, { primary: r.answer.surface, accepted: r.accepted }).correct)
}

function next() {
  index.value++
  resetAnswer()
}

function backToSetup() {
  playing.value = false
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.GAMES" class="text-sm underline underline-offset-4">
        &larr; Games
      </router-link>
      <h1 class="mt-4 text-3xl font-semibold">
        Verb forms
      </h1>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-10 text-center text-[var(--color-muted)]">
        Could not load a game. Check your connection.
      </p>

      <!-- Choosing the forms. -->
      <template v-else-if="game && !playing">
        <p class="mt-2 text-[var(--color-muted)]">
          Put verbs you know into a form. Three hearts, {{ ROUND_SIZE }} verbs.
        </p>

        <p v-if="!openForms.length" class="mt-8 rounded-xl border border-[var(--color-border)] p-5 text-sm text-[var(--color-muted)]">
          No verb forms are open yet. They open as Study teaches them, starting with 〜ます.
        </p>
        <p v-else-if="!game.verbs.length" class="mt-8 text-center text-[var(--color-muted)]">
          No verbs to play yet.
        </p>

        <template v-else>
          <p class="mt-8 text-sm font-semibold">
            Which forms?
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border px-4 py-2 text-sm transition"
              :class="mixed ? 'border-[var(--color-text)] bg-[var(--color-card)] font-semibold' : 'border-[var(--color-border)]'"
              :aria-pressed="mixed"
              @click="chooseMixed"
            >
              Mixed
            </button>
            <button
              v-for="form in openForms"
              :key="form"
              type="button"
              class="rounded-full border px-4 py-2 text-sm transition"
              :class="!mixed && selected.includes(form) ? 'border-[var(--color-text)] bg-[var(--color-card)] font-semibold' : 'border-[var(--color-border)]'"
              :aria-pressed="!mixed && selected.includes(form)"
              style="font-family: var(--font-jp)"
              @click="toggle(form)"
            >
              {{ VERB_FORM_INFO[form].label }}
            </button>
          </div>

          <label class="mt-6 flex items-center gap-3 text-sm">
            <input v-model="typing" type="checkbox" class="h-4 w-4">
            Type the answers instead of tapping
          </label>

          <Button class="mt-6 w-full" :disabled="!selected.length" @click="start()">
            Play
          </Button>
        </template>

        <details v-if="lockedForms.length" class="mt-10 text-sm">
          <summary class="cursor-pointer text-[var(--color-muted)]">
            {{ lockedForms.length }} {{ lockedForms.length === 1 ? 'form opens' : 'forms open' }} as Study teaches them
          </summary>
          <ul class="mt-3 space-y-2">
            <li v-for="f in lockedForms" :key="f.form" class="flex flex-wrap items-baseline justify-between gap-2">
              <span style="font-family: var(--font-jp)">{{ VERB_FORM_INFO[f.form].label }}</span>
              <router-link v-if="f.lesson" :to="ROUTES.GRAMMAR_DETAIL(f.lesson.slug)" class="text-[var(--color-muted)] underline underline-offset-4">
                Learn {{ f.lesson.title }} first
              </router-link>
            </li>
          </ul>
        </details>
      </template>

      <!-- The end. -->
      <GameEnd v-else-if="finished" :score="score" :total="rounds.length" @again="start()">
        <p v-if="hearts === 0" class="mt-1 text-sm text-[var(--color-muted)]">
          Out of hearts after {{ index }} of {{ rounds.length }}.
        </p>
        <p v-if="bestCombo > 1" class="mt-1 text-sm text-[var(--color-muted)]">
          Best combo: {{ bestCombo }} in a row
        </p>
        <div v-if="missedForms.length" class="mt-5 space-y-3 text-left">
          <p class="text-sm font-semibold">
            To go over
          </p>
          <div v-for="r in missedForms" :key="r.form" class="rounded-lg border border-[var(--color-border)] p-3 text-sm">
            <p style="font-family: var(--font-jp)">
              <span class="font-semibold">{{ VERB_FORM_INFO[r.form].label }}</span>
              · {{ r.verb.surface }} → {{ r.answer.surface }}
            </p>
            <p class="mt-1 text-[var(--color-muted)]" style="font-family: var(--font-jp)">
              {{ r.rule }}
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-3 pt-1">
            <Button variant="ghost" @click="start(missedForms.map(r => r.form))">
              Play these again
            </Button>
            <Button variant="ghost" @click="backToSetup">
              Choose forms
            </Button>
          </div>
        </div>
      </GameEnd>

      <!-- A question. -->
      <template v-else-if="round">
        <div class="mt-2 flex items-center justify-between text-sm text-[var(--color-muted)]">
          <span>{{ index + 1 }} of {{ rounds.length }}</span>
          <span v-if="combo > 1" class="font-semibold text-[var(--color-accent)]">{{ combo }} in a row</span>
          <span class="flex gap-1" :aria-label="`${hearts} of ${HEARTS} hearts left`">
            <Heart
              v-for="h in HEARTS"
              :key="h"
              class="h-5 w-5"
              :class="h <= hearts ? 'fill-[var(--color-danger)] text-[var(--color-danger)]' : 'text-[var(--color-border)]'"
            />
          </span>
        </div>

        <div class="mt-8 text-center">
          <p class="text-4xl" style="font-family: var(--font-jp)">
            {{ round.verb.surface }}
          </p>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            <span style="font-family: var(--font-jp)">{{ round.verb.reading }}</span> · {{ round.verb.meaning }}
          </p>
          <p class="mt-6 text-lg">
            Make it <span class="font-semibold" style="font-family: var(--font-jp)">{{ VERB_FORM_INFO[round.form].label }}</span>
          </p>
          <p class="mx-auto mt-1 max-w-sm text-sm text-[var(--color-muted)]">
            {{ VERB_FORM_INFO[round.form].what }}
          </p>
        </div>

        <form v-if="typing" class="mt-8" @submit.prevent="check">
          <input
            ref="answerInput"
            v-model="typed"
            :readonly="correct !== null"
            class="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-3 text-center text-xl outline-none focus:border-[var(--color-text)]"
            placeholder="Kana, kanji or romaji"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            style="font-family: var(--font-jp)"
          >
          <Button v-if="correct === null" type="submit" class="mt-4 w-full" :disabled="!typed.trim()">
            Check
          </Button>
        </form>

        <div v-else class="mt-8 grid grid-cols-2 gap-3">
          <button
            v-for="o in round.options"
            :key="o"
            type="button"
            class="rounded-xl border p-4 text-center text-2xl transition"
            style="font-family: var(--font-jp)"
            :class="correct === null
              ? 'border-[var(--color-border)] hover:border-[var(--color-text)]'
              : o === round.answer.reading
                ? 'border-[var(--color-success)] bg-[var(--color-card)]'
                : o === picked ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)] opacity-60'"
            :disabled="correct !== null"
            @click="pick(o)"
          >
            {{ o }}
          </button>
        </div>

        <div v-if="correct !== null" class="mt-6 text-center">
          <p class="font-semibold" :class="correct ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
            {{ correct ? 'Right.' : 'Not quite.' }}
            <span style="font-family: var(--font-jp)">{{ round.verb.surface }} → {{ round.answer.surface }}</span>
            <span v-if="round.answer.surface !== round.answer.reading" class="font-normal" style="font-family: var(--font-jp)"> ({{ round.answer.reading }})</span>
          </p>
          <p class="mt-1 text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
            {{ round.rule }}
          </p>
          <Button class="mt-4" @click="next">
            {{ hearts === 0 || index + 1 >= rounds.length ? 'See how you did' : 'Next' }}
          </Button>
        </div>
      </template>
    </div>
  </AppShell>
</template>
