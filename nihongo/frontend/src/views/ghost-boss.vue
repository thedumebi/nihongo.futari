<script setup lang="ts">
import type { GhostBoss } from '@nihongo/shared/types'

import { Ghost } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import { recordActivity } from '@/api/activities'
import { getGhostBoss } from '@/api/games'
import GameEnd from '@/components/games/game-end.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * The ghost boss: once a week, the cards that keep slipping.
 *
 * First the briefing — each ghost with its sourced explanation (never a
 * mnemonic; those live elsewhere and say they are invented) and the kanji it
 * gets confused with. Then the fight: tell each ghost kanji from its
 * look-alikes. Preparation only — nothing here is a review, so the schedule
 * does not move; the next real review is where it counts.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Reactive State ============
const boss = ref<GhostBoss | null>(null)
const loading = ref(true)
const failed = ref(false)
const stage = ref<'briefing' | 'fight' | 'done'>('briefing')
const index = ref(0)
const picked = ref<string | null>(null)
const score = ref(0)

// ============ Computed Properties ============
const round = computed(() => boss.value?.rounds[index.value] ?? null)

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
async function load() {
  loading.value = true
  failed.value = false
  stage.value = 'briefing'
  index.value = 0
  score.value = 0
  picked.value = null
  try {
    boss.value = await getGhostBoss(lang.code)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function fight() {
  if (boss.value?.rounds.length)
    stage.value = 'fight'
  else
    finish()
}

function pick(option: string) {
  if (picked.value || !round.value)
    return
  picked.value = option
  if (option === round.value.answer)
    score.value++
}

function next() {
  picked.value = null
  index.value++
  if (index.value >= (boss.value?.rounds.length ?? 0))
    finish()
}

function finish() {
  stage.value = 'done'
  if (boss.value)
    void recordActivity({ kind: 'ghost-boss', refId: boss.value.week, score: score.value, total: boss.value.rounds.length }, lang.code)
}

function detailLink(g: GhostBoss['ghosts'][number]): string {
  return g.kind === 'kanji' ? ROUTES.KANJI_DETAIL(g.ref) : ROUTES.WORD_DETAIL(g.ref)
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
        Could not load this week's boss — check your connection.
      </p>

      <div v-else-if="boss && boss.ghosts.length === 0" class="mt-8 rounded-xl border border-[var(--color-border)] p-6 text-center">
        <p class="text-lg">
          No ghosts this week.
        </p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          A ghost is a card you keep forgetting. When some appear, they gather here for a weekly showdown.
        </p>
      </div>

      <template v-else-if="boss">
        <!-- Briefing: know your enemy. -->
        <template v-if="stage === 'briefing'">
          <p class="mt-2 text-[var(--color-muted)]">
            {{ boss.ghosts.length }} {{ boss.ghosts.length === 1 ? 'card keeps' : 'cards keep' }} slipping. Read up on each, then face them.
            This does not change your reviews.
          </p>
          <ul class="mt-6 space-y-3">
            <li v-for="g in boss.ghosts" :key="g.key" class="rounded-xl border border-[var(--color-border)] p-4">
              <div class="flex items-baseline gap-3">
                <router-link :to="detailLink(g)" class="text-3xl underline-offset-4 hover:underline" style="font-family: var(--font-jp)">
                  {{ g.text }}
                </router-link>
                <span v-if="g.reading && g.reading !== g.text" class="text-[var(--color-muted)]" style="font-family: var(--font-jp)">{{ g.reading }}</span>
                <span class="ml-auto text-right text-sm">{{ g.meaning }}</span>
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

        <!-- The fight: pick the ghost out of its look-alikes. -->
        <template v-else-if="stage === 'fight' && round">
          <p class="mt-2 text-sm text-[var(--color-muted)]">
            {{ index + 1 }} of {{ boss.rounds.length }}
          </p>
          <p class="mt-6 text-lg" style="font-family: var(--font-jp)">
            {{ round.question }}
          </p>
          <div class="mt-6 grid gap-3" :class="round.kind === 'meaning' ? 'grid-cols-1' : 'grid-cols-2'">
            <button
              v-for="o in round.options"
              :key="o"
              type="button"
              class="rounded-xl border transition"
              :style="round.kind === 'meaning' ? undefined : 'font-family: var(--font-jp)'"
              :class="[
                round.kind === 'meaning' ? 'px-4 py-3 text-left text-base' : o.length > 1 ? 'py-6 text-3xl' : 'py-6 text-5xl',
                !picked
                  ? 'border-[var(--color-border)] hover:border-[var(--color-text)]'
                  : o === round.answer ? 'border-[var(--color-success)] bg-[var(--color-card)]'
                    : o === picked ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)] opacity-60',
              ]"
              :disabled="Boolean(picked)"
              @click="pick(o)"
            >
              {{ o }}
            </button>
          </div>
          <div v-if="picked" class="mt-6 text-center">
            <Button @click="next">
              Next
            </Button>
          </div>
        </template>

        <!-- The end: the score, play again, or back to the games. The ghosts
             come back in reviews on their own schedule — nothing here moved it. -->
        <template v-else-if="stage === 'done'">
          <GameEnd v-if="boss.rounds.length" :score="score" :total="boss.rounds.length" @again="load" />
          <div v-else class="mt-8 text-center">
            <Button :to="ROUTES.GAMES">
              All games
            </Button>
          </div>
          <p class="mt-4 text-center text-sm text-[var(--color-muted)]">
            {{ boss.ghosts.length === 1 ? 'This card comes' : 'These cards come' }} back in your reviews as usual — you are readier for {{ boss.ghosts.length === 1 ? 'it' : 'them' }} now.
          </p>
        </template>
      </template>
    </div>
  </AppShell>
</template>
