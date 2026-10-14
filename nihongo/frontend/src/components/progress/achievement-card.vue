<script setup lang="ts">
import type { AchievementView } from '@nihongo/shared/types'

import { Award, Lock } from 'lucide-vue-next'

/** One achievement: earned, or locked with how far along it is. */
interface Props {
  achievement: AchievementView
}

defineProps<Props>()
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-xl border p-4"
    :class="achievement.unlockedAt ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] opacity-80'"
  >
    <component
      :is="achievement.unlockedAt ? Award : Lock"
      class="mt-0.5 h-5 w-5 shrink-0"
      :class="achievement.unlockedAt ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'"
    />
    <div class="min-w-0 flex-1">
      <p class="font-medium">
        {{ achievement.title }}
      </p>
      <p class="text-sm text-[var(--color-muted)]">
        {{ achievement.description }}
      </p>
      <template v-if="!achievement.unlockedAt">
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div class="h-full bg-[var(--color-primary)]" :style="{ width: `${Math.round(achievement.progress / achievement.threshold * 100)}%` }" />
        </div>
        <p class="mt-1 text-xs tabular-nums text-[var(--color-muted)]">
          {{ achievement.progress }} / {{ achievement.threshold }}
        </p>
      </template>
    </div>
  </div>
</template>
