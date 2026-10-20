<script setup lang="ts">
import type { GhostBoss, GhostBossEntry, GhostRound } from '@nihongo/shared/types'

import { Ghost, Volume2 } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { recordActivity } from '@/api/activities'
import { getGhostBoss } from '@/api/games'
import ChoiceGrid from '@/components/games/choice-grid.vue'
import GameEnd from '@/components/games/game-end.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { playAudio, stopAudio } from '@/composables/use-audio'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * The ghost boss: once a week, the cards that keep slipping.
 *
 * Ghosts first, then (while there are only a few) cards nearly haunting:
 * answered Again or Hard twice in two weeks. The briefing is each one with
 * what to read up on: a sourced explanation (never a mnemonic), look-alikes,
 * a grammar point's pattern and example. Then the fight: two rounds each,
 * the side that keeps failing first, and a miss comes back once at the end.
 * Preparation only: nothing here is a review, so the schedule does not move.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Reactive State ============
const boss = ref<GhostBoss | null>(null)
const loading = ref(true)
const failed = ref(false)
const stage = ref<'briefing' | 'fight' | 'done'>('briefing')
/** The rounds in play: the boss's own, then each missed one once more. */
const rounds = ref<GhostRound[]>([])
const index = ref(0)
const picked = ref<string | null>(null)
/** Right on the first try, out of the boss's own rounds. */
const score = ref(0)
/** Per round asked: whether it was right, in the order asked. */
const results = ref<Array<{ round: GhostRound, right: boolean }>>([])

// ============ Computed Properties ============
const round = computed(() => rounds.value[index.value] ?? null)
const isRetry = computed(() => Boolean(boss.value) && index.value >= (boss.value?.rounds.length ?? 0))
const ghostOf = computed(() => new Map((boss.value?.ghosts ?? []).map(g => [g.key, g])))
const ghostCount = computed(() => boss.value?.ghosts.filter(g => g.status === 'ghost').length ?? 0)
const nearlyCount = computed(() => boss.value?.ghosts.filter(g => g.status === 'nearly').length ?? 0)
const intro = computed(() => {
  const ghosts = ghostCount.value
  const nearly = nearlyCount.value
  const close = `${nearly} ${nearly === 1 ? 'is' : 'are'} close to it`
  if (!ghosts)
    return `${nearly} ${nearly === 1 ? 'card is' : 'cards are'} close to haunting you.`
  return `${ghosts} ${ghosts === 1 ? 'card keeps' : 'cards keep'} slipping${nearly ? `, and ${close}` : ''}.`
})
/** Beaten: every round about it was right by the end, on the retry if not before. */
const outcome = computed(() => (boss.value?.ghosts ?? []).map((g) => {
  const asked = results.value.filter(r => r.round.ghost === g.key)
  const lastByRound = new Map(asked.map(r => [`${r.round.kind}|${r.round.question}`, r.right]))
  return { ghost: g, beaten: asked.length > 0 && [...lastByRound.values()].every(Boolean) }
}))

// ============ Lifecycle Hooks ============
onMounted(load)

onBeforeUnmount(stopAudio)

// ============ Methods ============
async function load() {
  loading.value = true
  failed.value = false
  stage.value = 'briefing'
  try {
    boss.value = await getGhostBoss(lang.code)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function fight() {
  if (!boss.value?.rounds.length) {
    finish()
    return
  }
  rounds.value = [...boss.value.rounds]
  index.value = 0
  score.value = 0
  results.value = []
  picked.value = null
  stage.value = 'fight'
  hear()
}

function hear() {
  if (round.value?.audio)
    void playAudio(round.value.audio)
}

function pick(option: string) {
  if (picked.value || !round.value)
    return
  picked.value = option
  const right = option === round.value.answer
  results.value = [...results.value, { round: round.value, right }]
  if (right && !isRetry.value)
    score.value++
  // A miss comes round once more at the end, not forever.
  if (!right && !isRetry.value)
    rounds.value = [...rounds.value, round.value]
}

function next() {
  stopAudio()
  picked.value = null
  index.value++
  if (index.value >= rounds.value.length)
    finish()
  else
    hear()
}

function finish() {
  stage.value = 'done'
  if (boss.value)
    void recordActivity({ kind: 'ghost-boss', refId: boss.value.week, score: score.value, total: boss.value.rounds.length }, lang.code)
}

function detailLink(g: GhostBossEntry): string | null {
  if (g.kind === 'kanji')
    return ROUTES.KANJI_DETAIL(g.ref)
  if (g.kind === 'word')
    return ROUTES.WORD_DETAIL(g.ref)
  if (g.kind === 'grammar' && g.ref)
    return ROUTES.GRAMMAR_DETAIL(g.ref)
  return null
}

/** What part of it keeps slipping, in words. */
function sideOf(g: GhostBossEntry): string {
  const sides: Record<string, string> = {
    meaning: 'its meaning',
    reading: g.kind === 'kana' ? 'reading it' : 'its reading',
    production: 'saying it from English',
    listening: 'hearing it',
    writing: 'writing it',
    usage: 'using it'
  }
  return sides[g.facet] ?? 'it'
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.GAMES" class="text-sm underline underline-offset-4">
        &larr; Games
      </router-link>
      <h1 class="mt-4 flex items-center gap-2 text-3xl font-semibold">
        <Ghost class="h-7 w-7" /> Ghost boss
      </h1>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-10 text-center text-[var(--color-muted)]">
        Could not load this week's boss. Check your connection.
      </p>

      <div v-else-if="boss && boss.ghosts.length === 0" class="mt-8 rounded-xl border border-[var(--color-border)] p-6 text-center">
        <p class="text-lg">
          No ghosts this week.
        </p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          A ghost is a card you keep forgetting. When some appear, or cards you keep marking Again or Hard, they gather here for a weekly showdown.
        </p>
      </div>

      <template v-else-if="boss">
        <!-- Briefing: know your enemy. -->
        <template v-if="stage === 'briefing'">
          <p class="mt-2 text-[var(--color-muted)]">
            {{ intro }} Read up on each, then face them. This does not change your reviews.
          </p>
          <ul class="mt-6 space-y-3">
            <li v-for="g in boss.ghosts" :key="g.key" class="rounded-xl border border-[var(--color-border)] p-4">
              <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                {{ g.status === 'ghost' ? 'Ghost' : 'Nearly haunting' }} · {{ sideOf(g) }}
              </p>
              <div class="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <component
                  :is="detailLink(g) ? 'router-link' : 'span'"
                  :to="detailLink(g) ?? undefined"
                  class="text-3xl underline-offset-4"
                  :class="detailLink(g) ? 'hover:underline' : ''"
                  style="font-family: var(--font-jp)"
                >
                  {{ g.text }}
                </component>
                <span v-if="g.reading && g.reading !== g.text" class="text-[var(--color-muted)]" :style="g.kind === 'kana' ? undefined : 'font-family: var(--font-jp)'">{{ g.reading }}</span>
                <span v-if="g.meaning" class="ml-auto text-right text-sm">{{ g.meaning }}</span>
              </div>

              <div v-if="g.grammar" class="mt-3 space-y-1 text-sm">
                <p v-if="g.grammar.pattern" class="text-[var(--color-muted)]" style="font-family: var(--font-jp)">
                  {{ g.grammar.pattern }}
                </p>
                <template v-if="g.grammar.example">
                  <p style="font-family: var(--font-jp)">
                    {{ g.grammar.example.text }}
                  </p>
                  <p v-if="g.grammar.example.translation" class="text-[var(--color-muted)]">
                    {{ g.grammar.example.translation }}
                  </p>
                </template>
              </div>

              <div v-if="g.etymology" class="mt-3 border-l-2 border-[var(--color-accent)] pl-3 text-sm">
                <p>{{ g.etymology.claim }}</p>
                <p class="mt-1 text-xs text-[var(--color-muted)]">
                  Sourced{{ g.etymology.source ? ` · ${g.etymology.source}` : '' }} · confidence: {{ g.etymology.confidence }}{{ g.etymology.isDisputed ? ' · disputed' : '' }}
                </p>
              </div>
              <p v-if="g.lookAlikes.length" class="mt-3 text-sm text-[var(--color-muted)]">
                Not to be confused with:
                <span v-for="l in g.lookAlikes" :key="l.character" class="ml-2 whitespace-nowrap">
                  <span class="text-lg text-[var(--color-text)]" style="font-family: var(--font-jp)">{{ l.character }}</span> {{ l.meaning }}
                </span>
              </p>
            </li>
          </ul>
          <Button class="mt-6" @click="fight">
            {{ boss.ghosts.length === 1 ? 'Face it' : 'Face them' }}
          </Button>
        </template>

        <!-- The fight. -->
        <template v-else-if="stage === 'fight' && round">
          <p class="mt-2 text-sm text-[var(--color-muted)]">
            <template v-if="isRetry">
              Once more
            </template>
            <template v-else>
              {{ index + 1 }} of {{ boss.rounds.length }}
            </template>
            <template v-if="ghostOf.get(round.ghost)?.status === 'nearly'">
              · nearly haunting
            </template>
          </p>
          <p class="mt-6 text-lg" style="font-family: var(--font-jp)">
            {{ round.question }}
          </p>
          <div v-if="round.audio" class="mt-4 flex justify-center">
            <Button round aria-label="Hear it again" @click="hear">
              <Volume2 class="h-6 w-6" />
            </Button>
          </div>

          <ChoiceGrid
            class="mt-6"
            :options="round.options"
            :answer="round.answer"
            :picked="picked"
            :jp="round.script === 'ja'"
            @pick="pick"
          >
            <template #default="{ option }">
              <span :class="round.script === 'ja' ? 'text-2xl' : 'text-base'">{{ option }}</span>
            </template>
          </ChoiceGrid>

          <div v-if="picked" class="mt-6 text-center">
            <p class="font-semibold" :class="picked === round.answer ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
              {{ picked === round.answer ? 'Right.' : `It was ${round.answer}.` }}
            </p>
            <Button class="mt-4" @click="next">
              {{ index + 1 >= rounds.length ? 'See how you did' : 'Next' }}
            </Button>
          </div>
        </template>

        <!-- The end: each ghost beaten or still haunting. Nothing here moved
             the schedule: they come back in reviews on their own. -->
        <template v-else-if="stage === 'done'">
          <GameEnd v-if="boss.rounds.length" :score="score" :total="boss.rounds.length" @again="fight">
            <ul class="mt-5 space-y-2 text-left">
              <li v-for="o in outcome" :key="o.ghost.key" class="flex items-baseline justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm">
                <span class="text-lg" style="font-family: var(--font-jp)">{{ o.ghost.text }}</span>
                <span :class="o.beaten ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
                  {{ o.beaten ? 'Beaten' : 'Still haunting' }}
                </span>
              </li>
            </ul>
          </GameEnd>
          <div v-else class="mt-8 text-center">
            <Button :to="ROUTES.GAMES">
              All games
            </Button>
          </div>
          <p class="mt-4 text-center text-sm text-[var(--color-muted)]">
            {{ boss.ghosts.length === 1 ? 'This card comes' : 'These cards come' }} back in your reviews as usual. You are readier for {{ boss.ghosts.length === 1 ? 'it' : 'them' }} now.
          </p>
        </template>
      </template>
    </div>
  </AppShell>
</template>
