<script setup lang="ts">
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'

/**
 * The end of a game: the score, play again, or back to the games. A game with
 * more to say (what was missed, a heading of its own) puts it in the slot.
 */
interface Props {
  score: number
  total: number
}

defineProps<Props>()

const emit = defineEmits<{
  again: []
}>()
</script>

<template>
  <div class="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
    <p class="text-3xl font-semibold tabular-nums">
      {{ score }} / {{ total }}
    </p>
    <p class="mt-1 text-[var(--color-muted)]">
      {{ score === total ? 'Every one.' : score >= total * 0.7 ? 'Nearly there.' : 'Another round will help.' }}
    </p>
    <slot />
    <div class="mt-5 flex flex-wrap justify-center gap-3">
      <Button @click="emit('again')">
        Play again
      </Button>
      <Button variant="ghost" :to="ROUTES.GAMES">
        All games
      </Button>
    </div>
  </div>
</template>
