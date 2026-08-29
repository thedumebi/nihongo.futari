<script setup lang="ts">
import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Admin
      </h1>
      <ul class="mt-6 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
        <li class="p-4">
          <router-link :to="ROUTES.ADMIN_INVITES" class="font-medium underline underline-offset-4">
            Invites
          </router-link>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            Mint and revoke sign-up codes.
          </p>
        </li>
        <li class="p-4">
          <router-link :to="ROUTES.ADMIN_REVIEW_QUEUE" class="font-medium underline underline-offset-4">
            Review queue
          </router-link>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            Sign off sourced explanations. Nothing reaches a reader until you do.
          </p>
        </li>
      </ul>
      <p class="mt-6 text-sm text-[var(--color-muted)]">
        Import runs land here next &mdash; the <code>/imports</code> API exists, the screen doesn't yet.
      </p>
    </div>
  </AppShell>
</template>
