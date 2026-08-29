<script setup lang="ts">
import type { DialogueView } from '@nihongo/shared/types'

import { Volume2 } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getDialogue } from '@/api/dialogues'
import AppShell from '@/components/layout/app-shell.vue'
import DialogueCard from '@/components/study/dialogue-card.vue'
import Button from '@/components/ui/button.vue'
import { useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * One conversation, played from the menu rather than the review queue.
 *
 * Uses the same card the study page does, so the two paths cannot drift. What
 * differs is what happens at the end: nothing is scheduled here. Practising a
 * conversation deliberately should not reschedule it as though the SRS had
 * asked — that would let someone quietly wreck their own review timing by
 * doing the thing the app is encouraging.
 */
const route = useRoute()
const lang = useLanguageStore()
const { mode, loadSettings } = useFurigana()

const dialogue = ref<DialogueView | null>(null)
const loading = ref(true)
const notFound = ref(false)
const result = ref<{ correct: number, total: number } | null>(null)
/** Bumped to remount the card, which is how "try again" restarts it. */
const attempt = ref(0)
const card = ref<InstanceType<typeof DialogueCard> | null>(null)

async function load() {
  loading.value = true
  notFound.value = false
  result.value = null
  try {
    dialogue.value = await getDialogue(String(route.params.code), lang.code)
  } catch {
    notFound.value = true
    dialogue.value = null
  } finally {
    loading.value = false
  }
}

function again() {
  result.value = null
  attempt.value += 1
}

onMounted(() => {
  void loadSettings()
  void load()
})
watch(() => route.params.code, load)
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <router-link :to="ROUTES.CONVERSATIONS" class="text-sm underline underline-offset-4">
        &larr; All conversations
      </router-link>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="notFound" class="mt-10 text-center text-[var(--color-muted)]">
        That conversation does not exist.
      </p>

      <template v-else-if="dialogue">
        <!--
          The drawing, uncropped. It earns more space here than in a list row:
          this is the one page about this one conversation, and the picture sets
          the moment before the first line is read.
        -->
        <img
          v-if="dialogue.image"
          :src="dialogue.image"
          alt=""
          aria-hidden="true"
          class="mx-auto mt-6 aspect-[4/3] w-full max-w-xs rounded-xl border border-[var(--color-border)] object-contain"
        >

        <div class="mt-6 flex items-start justify-between gap-4">
          <h1 class="text-3xl font-semibold">
            {{ dialogue.title }}
          </h1>
          <!-- Listening straight through gives the answers away, so it sits
               here rather than inside the exercise. -->
          <button
            type="button"
            class="mt-1 flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            @click="card?.playAll()"
          >
            <Volume2 class="h-4 w-4" />
            Listen
          </button>
        </div>

        <div class="mt-8 rounded-xl border border-[var(--color-border)] p-6">
          <DialogueCard
            ref="card"
            :key="attempt"
            :title="dialogue.title"
            :situation="dialogue.situation"
            :turns="dialogue.turns"
            :mode="mode"
            @finished="result = $event"
          />
        </div>

        <div v-if="result" class="mt-6 text-center">
          <p class="text-lg font-semibold">
            {{ result.correct }} of {{ result.total }} right.
          </p>
          <Button class="mt-4" variant="ghost" @click="again">
            Try it again
          </Button>
        </div>
      </template>
    </div>
  </AppShell>
</template>
