<script setup lang="ts">
import type { SpeakListResponse } from '@nihongo/shared/types'

import { Check, ChevronRight, Headphones } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import { listSpeak } from '@/api/speak'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * The Speak course: numbered sessions, in order.
 *
 * Linear on purpose. The method works because each session builds on the last,
 * so the page leads with where to carry on rather than offering a menu.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Reactive State ============
const data = ref<SpeakListResponse>({ sessions: [], next: null })
const loading = ref(true)
const errorMsg = ref('')

// ============ Computed Properties ============
const groups = computed(() => {
  const out = new Map<string, SpeakListResponse['sessions']>()
  for (const s of data.value.sessions) {
    if (!out.has(s.level))
      out.set(s.level, [])
    out.get(s.level)!.push(s)
  }
  return [...out.entries()].map(([level, sessions]) => ({ level, sessions }))
})

const nextSession = computed(() => data.value.sessions.find(s => s.code === data.value.next) ?? null)

// ============ Watchers ============
watch(() => lang.code, load)

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    data.value = await listSpeak(lang.code)
  } catch {
    errorMsg.value = 'Could not load the course. Try again in a moment.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        Speak
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        Hear it in English, say it in Japanese, then hear it said. Each answer is the last one plus a
        piece, so the sentences build themselves. Nothing to memorise &mdash; just say it out loud.
      </p>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-10 text-center text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>
      <p v-else-if="data.sessions.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        No sessions yet.
      </p>

      <template v-else>
        <div v-if="nextSession" class="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ nextSession.progress ? 'Again' : 'Up next' }} &middot; Session {{ nextSession.number }}
          </p>
          <p class="mt-1 text-xl font-semibold">
            {{ nextSession.titleEn }}
          </p>
          <Button class="mt-4" :to="ROUTES.SPEAK_SESSION(nextSession.code)">
            <Headphones class="h-4 w-4" />
            {{ data.sessions.some(s => s.progress) ? 'Continue' : 'Start' }}
          </Button>
        </div>

        <router-link
          :to="ROUTES.RECALL"
          class="mt-4 flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-text)]"
        >
          <Headphones class="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
          <span>
            <span class="block font-semibold">Recall</span>
            <span class="block text-sm text-[var(--color-muted)]">The same method over your own shaky words and missed prompts, hands-free.</span>
          </span>
        </router-link>

        <section v-for="group in groups" :key="group.level" class="mt-8">
          <h2 class="text-sm uppercase tracking-wide text-[var(--color-muted)]">
            {{ group.level }}
          </h2>
          <ol class="mt-3 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
            <li v-for="s in group.sessions" :key="s.code">
              <router-link
                :to="ROUTES.SPEAK_SESSION(s.code)"
                class="flex items-center gap-4 p-4 transition hover:bg-[var(--color-card)]"
              >
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm"
                  :class="s.progress ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
                  :aria-label="s.progress ? 'Done' : `Session ${s.number}`"
                >
                  <Check v-if="s.progress" class="h-4 w-4" />
                  <template v-else>{{ s.number }}</template>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="font-medium">
                    {{ s.titleEn }}
                  </p>
                  <p class="text-sm text-[var(--color-muted)]">
                    <span style="font-family: var(--font-jp)">{{ s.title }}</span>
                    &middot; {{ s.promptCount }} to say
                    <template v-if="s.progress">
                      &middot; {{ s.progress.gotIt }}/{{ s.progress.total }} first time
                    </template>
                  </p>
                </div>
                <ChevronRight class="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
              </router-link>
            </li>
          </ol>
        </section>
      </template>
    </div>
  </AppShell>
</template>
