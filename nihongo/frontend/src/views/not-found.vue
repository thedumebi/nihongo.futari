<script setup lang="ts">
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'
</script>

<template>
  <AppShell>
    <section class="mx-auto w-full max-w-3xl px-6 py-20">
      <p class="text-6xl font-semibold">
        404
      </p>
      <h1 class="mt-4 text-3xl font-semibold">
        This page wandered off.
      </h1>
      <p class="mt-3 max-w-md text-lg text-[var(--color-muted)]">
        The page you're looking for doesn't exist, or has moved.
      </p>
      <div class="mt-8">
        <Button :to="ROUTES.HOME" variant="primary">
          Back home
        </Button>
      </div>
    </section>
  </AppShell>
</template>
