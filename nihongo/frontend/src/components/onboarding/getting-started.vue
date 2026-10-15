<script setup lang="ts">
import { Check, ChevronRight, Sparkles, X } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'

import { ROUTES } from '@/constants'
import { useOnboardingStore } from '@/store/onboarding'

/**
 * Onboarding on Today.
 *
 *  - An account from before onboarding existed is OFFERED it, once, with a
 *    way to say no.
 *  - Anyone who answered gets their first-week guide: each step a link to
 *    where it is done, ticked off from what they actually did, until it is
 *    finished or put away.
 */

// ============ Stores ============
const onboarding = useOnboardingStore()

// ============ Constants ============
/** Where each guide step is done. */
const LINKS: Record<string, string> = {
  kana: ROUTES.LESSONS,
  words: ROUTES.LEARN,
  grammar: ROUTES.LESSONS,
  speak: ROUTES.SPEAK,
  review: ROUTES.DUE,
  conversation: ROUTES.CONVERSATIONS,
  reading: ROUTES.READ,
  story: ROUTES.SPEAK,
  recall: ROUTES.RECALL
}

// ============ Computed Properties ============
const state = computed(() => onboarding.state)
const offered = computed(() => state.value?.status === 'offer')
const guide = computed(() => state.value && !state.value.guideHidden ? state.value.guide : [])
const doneCount = computed(() => guide.value.filter(s => s.done).length)

// ============ Lifecycle Hooks ============
// Fresh each visit: steps tick off as they are done elsewhere.
onMounted(() => void onboarding.load(true))
</script>

<template>
  <section v-if="offered" class="mt-4 flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-5">
    <Sparkles class="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-muted)]" />
    <div class="min-w-0 flex-1">
      <p class="font-medium">
        Tailor go to you
      </p>
      <p class="mt-1 text-sm text-[var(--color-muted)]">
        A minute of questions — where you are, what for, how long a day — and a first-week plan to match.
      </p>
      <div class="mt-3 flex flex-wrap gap-4 text-sm">
        <router-link :to="ROUTES.WELCOME" class="font-medium underline underline-offset-4">
          Start
        </router-link>
        <button type="button" class="text-[var(--color-muted)] underline underline-offset-4" @click="onboarding.skip()">
          Not now
        </button>
      </div>
    </div>
  </section>

  <section v-else-if="guide.length" class="mt-4 rounded-xl border border-[var(--color-border)] p-5">
    <div class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
      <Sparkles class="h-4 w-4" /> Your first week · {{ doneCount }} of {{ guide.length }}
      <button type="button" class="ml-auto rounded p-1 hover:text-[var(--color-text)]" aria-label="Put the guide away" @click="onboarding.hideGuide()">
        <X class="h-4 w-4" />
      </button>
    </div>
    <ol class="mt-3 space-y-1">
      <li v-for="s in guide" :key="s.code">
        <component
          :is="s.done ? 'div' : 'router-link'"
          :to="s.done ? undefined : LINKS[s.code]"
          class="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5"
          :class="s.done ? '' : 'transition hover:bg-[var(--color-card)]'"
        >
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
            :class="s.done ? 'border-[var(--color-success)] bg-[var(--color-success)] text-[var(--color-bg)]' : 'border-[var(--color-border)]'"
          >
            <Check v-if="s.done" class="h-3 w-3" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block" :class="s.done ? 'text-[var(--color-muted)] line-through' : ''">{{ s.title }}</span>
            <span v-if="!s.done" class="block text-xs text-[var(--color-muted)]">{{ s.why }}</span>
          </span>
          <ChevronRight v-if="!s.done" class="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
        </component>
      </li>
    </ol>
  </section>
</template>
