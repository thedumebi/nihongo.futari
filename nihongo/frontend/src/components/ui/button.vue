<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import { computed } from 'vue'

// Renders a <button> by default, or a <router-link> when `to` is given.
// `variant` maps to the .btn-* classes in style.css.
const props = defineProps<{
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  to?: RouteLocationRaw
  round?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
}>()

const classes = computed(() => [
  'btn',
  `btn-${props.variant ?? 'primary'}`,
  { round: props.round }
])
</script>

<template>
  <router-link v-if="to" :to="to" :class="classes">
    <slot />
  </router-link>
  <button
    v-else
    :type="type ?? 'button'"
    :class="classes"
    :disabled="disabled || loading"
  >
    <!--
      The label stays put while loading. Replacing it with "…" moved the
      button's own text out from under the cursor mid-click, gave no clue what
      was happening, and made every pending button in the app look identical.
      A spinner beside the unchanged label says the same thing without taking
      anything away.
    -->
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot />
    <span v-if="loading" class="btn-sr">, working</span>
  </button>
</template>

<style scoped>
/* Announced to a screen reader, invisible to everyone else. Scoped here
   because nothing else in the app needs it yet. */
.btn-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.btn-spinner {
  width: 0.85em;
  height: 0.85em;
  margin-right: 0.5em;
  border: 2px solid currentColor;
  /* Three sides at low opacity and one at full: the gap is what reads as
     motion. A fully opaque ring looks static however fast it turns. */
  border-top-color: transparent;
  border-radius: 50%;
  display: inline-block;
  vertical-align: -0.1em;
  animation: btn-spin 0.6s linear infinite;
}

/* Respect a reader who has asked for less movement: keep the ring as a static
   marker that something is pending rather than removing the only signal. */
@media (prefers-reduced-motion: reduce) {
  .btn-spinner {
    animation: none;
    opacity: 0.5;
  }
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
