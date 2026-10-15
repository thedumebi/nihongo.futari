<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { unsubscribeProductUpdates } from '@/api/email-campaigns'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'

/**
 * Stop product-update emails, from the link in one. No sign-in needed — the
 * link is signed for the person it was sent to.
 *
 * A button, not an automatic unsubscribe on load: mail scanners open links to
 * check them, and that must not unsubscribe anyone.
 */

// ============ Composables ============
const route = useRoute()

// ============ Reactive State ============
const state = ref<'ask' | 'working' | 'done' | 'invalid'>('ask')

// ============ Computed Properties ============
const u = computed(() => String(route.query.u ?? ''))
const t = computed(() => String(route.query.t ?? ''))

// ============ Methods ============
async function unsubscribe() {
  if (!u.value || !t.value) {
    state.value = 'invalid'
    return
  }
  state.value = 'working'
  try {
    await unsubscribeProductUpdates(u.value, t.value)
    state.value = 'done'
  } catch {
    state.value = 'invalid'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <div class="mx-auto max-w-md px-4 py-16 text-center">
      <p class="text-4xl" style="font-family: var(--font-jp)">
        語
      </p>
      <template v-if="state === 'done'">
        <h1 class="mt-6 text-2xl font-semibold">
          You're unsubscribed
        </h1>
        <p class="mt-3 text-[var(--color-muted)]">
          No more product-update emails. Study reminders are separate. Change those in Settings.
        </p>
      </template>
      <template v-else-if="state === 'invalid'">
        <h1 class="mt-6 text-2xl font-semibold">
          That link didn't work
        </h1>
        <p class="mt-3 text-[var(--color-muted)]">
          It may have been cut short when it was copied. You can turn product updates off in Settings, under Reminders.
        </p>
      </template>
      <template v-else>
        <h1 class="mt-6 text-2xl font-semibold">
          Stop product-update emails?
        </h1>
        <p class="mt-3 text-[var(--color-muted)]">
          You'll stop getting emails about what's new in go. Study reminders aren't affected.
        </p>
        <Button class="mt-6" :loading="state === 'working'" @click="unsubscribe">
          Unsubscribe
        </Button>
      </template>
      <p class="mt-10 text-sm">
        <router-link :to="ROUTES.SETTINGS" class="underline underline-offset-4">
          Go to Settings
        </router-link>
      </p>
    </div>
  </div>
</template>
