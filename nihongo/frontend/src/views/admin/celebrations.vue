<script setup lang="ts">
import AppShell from '@/components/layout/app-shell.vue'
import { ALL_CELEBRATION_STEPS, celebrationFor } from '@/lib/streak-celebrations'

/**
 * Every celebration for answers in a row, each as the card shows it, so the
 * owner can read and look them over without answering 60 questions first.
 */
const celebrations = ALL_CELEBRATION_STEPS.map(at => ({ at, ...celebrationFor(at) }))
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 class="text-3xl font-semibold">
        Celebrations
      </h1>
      <p class="mt-2 text-sm text-[var(--color-muted)]">
        One opens at every 5 answers right in a row. After 60 they come round again with the real count.
      </p>
      <ul class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="c in celebrations"
          :key="c.at"
          class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center"
        >
          <img :src="c.art" alt="" class="w-full rounded-xl" width="160" height="120">
          <p class="mt-4 text-lg font-semibold">
            {{ c.title }}
          </p>
          <p class="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            {{ c.line }}
          </p>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
