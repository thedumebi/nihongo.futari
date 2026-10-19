<script setup lang="ts">
import type { ActivityKind } from '@nihongo/shared/constants'

import { levelProgress, QUEST_XP } from '@nihongo/shared/lib'
import { XP_FOR_ACTIVITY, XP_RULES } from '@nihongo/shared/types'
import { ChevronDown } from 'lucide-vue-next'
import { computed, ref } from 'vue'

/**
 * Your level, how far to the next, and how XP is earned.
 *
 * The level was a bare "Lv 2" with nothing saying what it measured or how to
 * move it. The list below is built from the same tables the server awards
 * from, so it cannot drift from what actually happens.
 */
interface Props {
  totalXp: number
  /** Show the earning table open, not behind a toggle. */
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), { open: false })

const ACTIVITY_LABELS: Partial<Record<ActivityKind, string>> = {
  'lesson': 'Finish a lesson',
  'speak': 'Finish a Speak session',
  'crossword': 'Solve the crossword',
  'ghost-boss': 'Beat the ghost boss',
  'conversation': 'Practise a conversation',
  'reading': 'Read a speech aloud',
  'recall': 'Finish a Recall session',
  'shadowing': 'Shadow a conversation',
  'speak-listen': 'Listen through a Speak session',
  'listening-game': 'Play Listening',
  'kanji-build': 'Play Build a kanji',
  'verb-forms': 'Play Verb forms',
  'story': 'Say a Speak story'
}

const showHow = ref(props.open)
const progress = computed(() => levelProgress(props.totalXp))

const earning = computed(() => [
  { label: 'Learn a new card', xp: XP_RULES.NEW_ITEM },
  { label: 'Get a review right', xp: XP_RULES.CORRECT },
  { label: 'Get a review wrong (showing up counts)', xp: XP_RULES.INCORRECT },
  { label: 'Complete a daily quest', xp: QUEST_XP },
  ...(Object.entries(ACTIVITY_LABELS) as Array<[ActivityKind, string]>)
    .map(([kind, label]) => ({ label, xp: XP_FOR_ACTIVITY[kind] }))
].sort((a, b) => b.xp - a.xp))
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] p-5">
    <div class="flex items-baseline justify-between gap-4">
      <p class="text-xl font-semibold">
        Level {{ progress.level }}
      </p>
      <p class="text-sm tabular-nums text-[var(--color-muted)]">
        {{ totalXp.toLocaleString() }} XP
      </p>
    </div>
    <div class="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
      <div class="h-full rounded-full bg-[var(--color-accent)]" :style="{ width: `${Math.round(progress.into / progress.span * 100)}%` }" />
    </div>
    <p class="mt-2 text-sm text-[var(--color-muted)]">
      {{ progress.toNext }} XP to level {{ progress.level + 1 }}. Each level takes 100 XP more than the last.
    </p>

    <button
      type="button"
      class="mt-3 flex items-center gap-1 text-sm underline underline-offset-4"
      :aria-expanded="showHow"
      @click="showHow = !showHow"
    >
      How to earn XP
      <ChevronDown class="h-4 w-4 transition" :class="showHow ? 'rotate-180' : ''" />
    </button>
    <ul v-if="showHow" class="mt-3 divide-y divide-[var(--color-border)] text-sm">
      <li v-for="row in earning" :key="row.label" class="flex justify-between gap-4 py-1.5">
        <span>{{ row.label }}</span>
        <span class="tabular-nums text-[var(--color-muted)]">+{{ row.xp }}</span>
      </li>
    </ul>
    <p v-if="showHow" class="mt-2 text-xs text-[var(--color-muted)]">
      Finishing the same lesson or game twice in a day counts once. Everything is recounted from what you did, so a session saved offline still counts when it syncs.
    </p>
  </div>
</template>
