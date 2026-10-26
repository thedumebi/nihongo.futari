<script setup lang="ts">
import { ROUTES } from '@/constants'

/**
 * What go is, said before anyone relies on it: one person's free project,
 * still being built. Shown where someone decides to join (sign-up) and where
 * they arrive (welcome), with the full story on the privacy page.
 */
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm">
    <p class="font-medium">
      A personal project, still being built
    </p>
    <p class="mt-1 text-[var(--color-muted)]">
      go is free and made by one person. Things will change, and now and then something will break.
      Your progress is saved and backed up, but this is not a company.
      <router-link :to="ROUTES.PRIVACY" class="underline underline-offset-4">
        What that means for your data
      </router-link>
    </p>
  </div>
</template>
