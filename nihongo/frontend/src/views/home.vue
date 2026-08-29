<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { ROUTES } from '@/constants'
import { SITE_MARK, SITE_NAME, SITE_TAGLINE } from '@/constants/site'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
    <p class="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
      <span class="text-[var(--color-accent)]" style="font-family: var(--font-jp)">{{ SITE_MARK }}</span>
      {{ SITE_NAME }}
    </p>
    <h1 class="text-4xl font-semibold tracking-tight">
      {{ SITE_TAGLINE }}
    </h1>
    <p class="max-w-lg text-lg text-[var(--color-muted)]">
      Not just <em>what</em> a word means, but where it came from &mdash; sourced, cited,
      and never confused with an invented mnemonic.
    </p>
    <div class="flex gap-4">
      <RouterLink
        :to="auth.isAuthenticated ? ROUTES.STUDY : ROUTES.LOGIN"
        class="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-[var(--color-bg)]"
      >
        {{ auth.isAuthenticated ? 'Continue studying' : 'Sign in' }}
      </RouterLink>
    </div>
  </main>
</template>
