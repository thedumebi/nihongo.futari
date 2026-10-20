<script setup lang="ts">
import { Ear, Ghost, Grid3x3, Layers, Link, Puzzle } from 'lucide-vue-next'

import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'

/**
 * The games, in one place. Each is short, built from real words and kanji,
 * and none of them touches the review schedule — they are practice beside it.
 */
const GAMES = [
  { to: ROUTES.CROSSWORD, icon: Grid3x3, title: 'Crossword', text: 'A daily puzzle from the words you know.' },
  { to: ROUTES.GAME_LISTENING, icon: Ear, title: 'Listening', text: 'おばさん or おばあさん? Hear a word and pick which it was: long vowels, small っ and ん.' },
  { to: ROUTES.GAME_VERB_FORMS, icon: Layers, title: 'Verb forms', text: '書く → 書いて, 書きたい, 書きましょう: verbs you know, in the forms you choose or all mixed.' },
  { to: ROUTES.GAME_PARTICLES, icon: Link, title: 'Particles', text: '学校＿勉強します: は, が, を, に, で? Pick the particle that fits the sentence.' },
  { to: ROUTES.GAME_KANJI_BUILD, icon: Puzzle, title: 'Build a kanji', text: 'Put kanji together from their parts, and guess readings from the part that carries the sound.' },
  { to: ROUTES.GAME_GHOST_BOSS, icon: Ghost, title: 'Ghost boss', text: 'The cards that keep slipping, once a week, with where they come from and what they get confused with.' }
]
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        Games
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        Short and built from real words and kanji. Playing never changes your reviews, but it does count as a day's study.
      </p>
      <ul class="mt-8 grid gap-4 sm:grid-cols-2">
        <li v-for="g in GAMES" :key="g.to">
          <router-link :to="g.to" class="block h-full rounded-xl border border-[var(--color-border)] p-5 transition hover:border-[var(--color-text)]">
            <component :is="g.icon" class="h-6 w-6 text-[var(--color-accent)]" />
            <p class="mt-3 font-semibold">
              {{ g.title }}
            </p>
            <p class="mt-1 text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
              {{ g.text }}
            </p>
          </router-link>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
