<script setup lang="ts">
import type { AudioStatus } from '@nihongo/shared/types'

import { onMounted, ref } from 'vue'

import { getAudioStatus } from '@/api/audio'
import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'

// ============ Reactive State ============
/** Sentences and words that play nothing until the next recording run. */
const audio = ref<AudioStatus | null>(null)

// ============ Lifecycle Hooks ============
onMounted(async () => {
  try {
    audio.value = await getAudioStatus()
  } catch {
    audio.value = null
  }
})
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
          <router-link :to="ROUTES.ADMIN_EMAILS" class="font-medium underline underline-offset-4">
            Emails
          </router-link>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            Write, preview and send an email to learners: product updates and news.
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
        <li class="p-4">
          <router-link :to="ROUTES.ADMIN_CELEBRATIONS" class="font-medium underline underline-offset-4">
            Celebrations
          </router-link>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            Every "in a row" celebration, as learners see it.
          </p>
        </li>
        <!-- Audio: a reworded sentence plays nothing (never its old words) until it is recorded again. -->
        <li v-if="audio" class="p-4">
          <p class="font-medium">
            Audio
          </p>
          <p v-if="audio.sentencesWaiting + audio.wordsWaiting === 0" class="mt-1 text-sm text-[var(--color-muted)]">
            Every sentence and word has a recording of what it says.
          </p>
          <p v-else class="mt-1 text-sm text-[var(--color-muted)]">
            {{ audio.sentencesWaiting }} {{ audio.sentencesWaiting === 1 ? 'sentence' : 'sentences' }} and
            {{ audio.wordsWaiting }} {{ audio.wordsWaiting === 1 ? 'word' : 'words' }} waiting for a recording.
            Until then they play nothing. On the laptop: <code>audio:sentences</code>, <code>audio:words</code>,
            then <code>seed:clip-audio</code>, and deploy.
          </p>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
