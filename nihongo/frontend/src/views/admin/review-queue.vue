<script setup lang="ts">
import type { ReviewKind } from '@nihongo/shared/constants'
import type { ReviewItem } from '@nihongo/shared/types'

import { computed, onMounted, ref } from 'vue'

import { bulkApprove, bulkReject, listPending, removeParticleQuestion } from '@/api/review-queue'
import CorrectionDiff from '@/components/admin/correction-diff.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'

const toast = useToast()

const items = ref<ReviewItem[]>([])
const pending = ref(0)
const loading = ref(true)
const working = ref(false)
const kindFilter = ref<ReviewKind | undefined>(undefined)
const offset = ref(0)
const PAGE = 25

const selected = ref(new Set<string>())
const expanded = ref(new Set<string>())

const allSelected = computed(() => items.value.length > 0 && selected.value.size === items.value.length)
const selectedCount = computed(() => selected.value.size)

/** Tier 1 is scholarly, tier 3 crowd-sourced. Reviewers should see which. */
function tierLabel(tier: number) {
  return tier === 1 ? 'scholarly' : tier === 2 ? 'reference' : 'community'
}

async function load() {
  loading.value = true
  try {
    const data = await listPending({ limit: PAGE, offset: offset.value, kind: kindFilter.value })
    items.value = data.items
    pending.value = data.pending
    selected.value = new Set()
  } catch {
    toast.error('Could not load the review queue.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function toggle(id: string) {
  const next = new Set(selected.value)
  if (next.has(id))
    next.delete(id)
  else next.add(id)
  selected.value = next
}

function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(items.value.map(i => i.id))
}

function toggleExpanded(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id))
    next.delete(id)
  else next.add(id)
  expanded.value = next
}

/** Select every item of one kind — the usual way you work through a batch. */
async function selectKind(kind: ReviewKind | undefined) {
  // Filters the LIST. Previously this only ticked checkboxes, and because every
  // loaded item was the same kind that just checked "select all" — which looked
  // like the buttons were broken. 265 of 315 items are etymology, so without a
  // real filter the 50 grammar points were unreachable past page one.
  kindFilter.value = kind
  offset.value = 0
  await load()
}

async function goToPage(next: number) {
  offset.value = Math.max(0, next)
  await load()
}

/** Take one bad question out of a Particles set; the rest stay to be approved. */
async function removeQuestion(item: ReviewItem, questionId: string) {
  if (!item.particles || working.value)
    return
  working.value = true
  try {
    await removeParticleQuestion(questionId)
    item.particles.questions = item.particles.questions.filter(q => q.id !== questionId)
    toast.success('Question removed.')
  } catch {
    toast.error('Could not remove that question.')
  } finally {
    working.value = false
  }
}

async function decide(action: 'approve' | 'reject') {
  if (selected.value.size === 0 || working.value)
    return
  working.value = true
  try {
    const ids = [...selected.value]
    const result = action === 'approve' ? await bulkApprove(ids) : await bulkReject(ids)
    if (result.failed.length > 0) {
      toast.error(`${result.succeeded.length} ${action}d, ${result.failed.length} failed.`)
    } else {
      toast.success(`${result.succeeded.length} ${action}d.`)
    }
    await load()
  } catch {
    toast.error(`Could not ${action} those items.`)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-4xl px-6 py-12">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <h1 class="text-3xl font-semibold">
          Review queue
        </h1>
        <span class="text-sm text-[var(--color-muted)]">{{ pending }} pending</span>
      </div>
      <p class="mt-2 text-sm text-[var(--color-muted)]">
        Nothing here reaches a reader until you approve it. Etymology is checked against its
        sources; grammar prose just needs a read. A Particles entry is one lesson's questions:
        remove any that are wrong, then approve the rest together. A correction changes something already live:
        approving it applies the change everywhere it appears.
      </p>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>

      <div v-else-if="items.length === 0" class="mt-8 rounded-xl border border-[var(--color-border)] p-10 text-center">
        <p class="text-xl font-semibold">
          Nothing waiting.
        </p>
      </div>

      <template v-else>
        <!-- Selection bar. Sticky so the actions stay reachable in a long list. -->
        <div class="sticky top-0 z-10 mt-6 flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)] py-3">
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" :checked="allSelected" @change="toggleAll">
            Select all
          </label>
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm transition"
            :class="kindFilter === undefined ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            @click="selectKind(undefined)"
          >
            All
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm transition"
            :class="kindFilter === 'grammar' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            @click="selectKind('grammar')"
          >
            Grammar
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm transition"
            :class="kindFilter === 'etymology' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            @click="selectKind('etymology')"
          >
            Etymology
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm transition"
            :class="kindFilter === 'reading' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            @click="selectKind('reading')"
          >
            Speeches
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm transition"
            :class="kindFilter === 'speak' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            @click="selectKind('speak')"
          >
            Speak
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm transition"
            :class="kindFilter === 'particles' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            @click="selectKind('particles')"
          >
            Particles
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm transition"
            :class="kindFilter === 'correction' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            @click="selectKind('correction')"
          >
            Corrections
          </button>

          <div class="ml-auto flex items-center gap-3">
            <span class="text-sm text-[var(--color-muted)]">{{ selectedCount }} selected</span>
            <Button variant="primary" :disabled="selectedCount === 0" :loading="working" @click="decide('approve')">
              Approve
            </Button>
            <Button variant="ghost" :disabled="selectedCount === 0" :loading="working" @click="decide('reject')">
              Reject
            </Button>
          </div>
        </div>

        <ul class="divide-y divide-[var(--color-border)]">
          <li v-for="item in items" :key="item.id" class="py-4">
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                class="mt-1.5"
                :checked="selected.has(item.id)"
                @change="toggle(item.id)"
              >
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  <span class="rounded border border-[var(--color-border)] px-1.5 py-0.5">{{ item.kind }}</span>
                  <span style="font-family: var(--font-jp)">{{ item.subject }}</span>
                  <template v-if="item.kind === 'reading' && item.reading">
                    <span>&middot; {{ item.reading.level }}</span>
                  </template>
                  <template v-if="item.kind === 'speak' && item.speak">
                    <span>&middot; {{ item.speak.level }} &middot; session {{ item.speak.number }}</span>
                  </template>
                  <template v-if="item.kind === 'particles' && item.particles">
                    <span>&middot; {{ item.particles.level }} &middot; {{ item.particles.questions.length }} questions</span>
                  </template>
                  <template v-if="item.kind === 'etymology'">
                    <span>&middot; {{ item.aspect }}</span>
                    <span>&middot; {{ item.confidence }}</span>
                    <span
                      v-if="item.citations.length === 0"
                      class="rounded bg-[var(--color-danger)] px-1.5 py-0.5 text-[var(--color-bg)]"
                    >no sources</span>
                  </template>
                </div>

                <!-- A correction is small enough to judge at a glance: always shown. -->
                <CorrectionDiff v-if="item.kind === 'correction' && item.correction" :correction="item.correction" />

                <p v-if="item.kind !== 'correction' && item.kind !== 'particles'" class="mt-2 font-medium">
                  {{ item.kind === 'etymology' ? item.claim : item.kind === 'reading' ? item.reading?.titleEn : item.kind === 'speak' ? item.speak?.titleEn : item.meaningShort }}
                </p>
                <!-- Read it the way a learner will: scrolling, tappable, with the reading aid. -->
                <router-link
                  v-if="item.kind === 'reading' && item.reading"
                  :to="ROUTES.READING_DETAIL(item.reading.code)"
                  class="mt-2 mr-4 inline-block text-sm underline underline-offset-4"
                >
                  Open in the reader
                </router-link>
                <!-- Hear it the way a learner will, prompts, pauses and all. -->
                <router-link
                  v-if="item.kind === 'speak' && item.speak"
                  :to="ROUTES.SPEAK_SESSION(item.speak.code)"
                  class="mt-2 mr-4 inline-block text-sm underline underline-offset-4"
                >
                  Open the session
                </router-link>

                <button
                  v-if="item.kind !== 'correction'"
                  type="button"
                  class="mt-2 text-sm text-[var(--color-muted)] underline underline-offset-4"
                  @click="toggleExpanded(item.id)"
                >
                  {{ expanded.has(item.id) ? 'Hide detail' : 'Show detail' }}
                </button>

                <!-- A Particles set: every question as the game asks it, the gap filled
                     in green, with what else would do, what is offered as wrong, and why. -->
                <ol v-if="expanded.has(item.id) && item.kind === 'particles' && item.particles" class="mt-3 space-y-4">
                  <li v-for="q in item.particles.questions" :key="q.id" class="rounded-lg border border-[var(--color-border)] p-3">
                    <div class="flex items-start justify-between gap-3">
                      <p class="text-lg" style="font-family: var(--font-jp)">
                        {{ q.before }}<span class="font-semibold text-[var(--color-success)] underline underline-offset-4">{{ q.answer }}</span>{{ q.after }}
                      </p>
                      <button
                        type="button"
                        class="shrink-0 text-sm text-[var(--color-muted)] underline underline-offset-4"
                        :disabled="working"
                        @click="removeQuestion(item, q.id)"
                      >
                        Remove
                      </button>
                    </div>
                    <p v-if="q.translation" class="text-sm text-[var(--color-muted)]">
                      {{ q.translation }}
                    </p>
                    <p v-if="q.newSentence" class="mt-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
                      New sentence: approving publishes it
                    </p>
                    <p class="mt-2 text-sm" style="font-family: var(--font-jp)">
                      <span class="text-[var(--color-muted)]">Wrong:</span> {{ q.wrong.join(', ') }}
                      <template v-if="q.alsoRight.length">
                        <span class="ml-3 text-[var(--color-muted)]">Also right, never offered:</span> {{ q.alsoRight.join(', ') }}
                      </template>
                    </p>
                    <p class="mt-1 text-sm text-[var(--color-muted)]">
                      {{ q.note }}
                    </p>
                  </li>
                </ol>

                <div v-if="expanded.has(item.id) && item.kind === 'reading' && item.reading" class="mt-3 space-y-4">
                  <div v-for="(stanza, s) in item.reading.stanzas" :key="s" class="space-y-2">
                    <div v-for="(line, l) in stanza" :key="l">
                      <p style="font-family: var(--font-jp)">
                        {{ line.text }}
                      </p>
                      <p class="text-xs text-[var(--color-muted)]" style="font-family: var(--font-jp)">
                        {{ line.reading }}
                      </p>
                      <p class="text-sm text-[var(--color-muted)]">
                        {{ line.translation }}
                      </p>
                    </div>
                  </div>
                </div>

                <ol v-if="expanded.has(item.id) && item.kind === 'speak' && item.speak" class="mt-3 space-y-3">
                  <li v-for="(step, s) in item.speak.steps" :key="s">
                    <p :class="step.kind === 'explain' ? 'text-sm text-[var(--color-muted)]' : 'text-sm font-medium'">
                      {{ step.en }}
                    </p>
                    <template v-if="step.kind === 'prompt'">
                      <p style="font-family: var(--font-jp)">
                        {{ step.text }}
                      </p>
                      <p class="text-xs text-[var(--color-muted)]" style="font-family: var(--font-jp)">
                        {{ step.reading }}
                      </p>
                      <p v-if="step.note" class="text-xs text-[var(--color-muted)]">
                        {{ step.note }}
                      </p>
                    </template>
                  </li>
                </ol>

                <div v-if="expanded.has(item.id) && item.kind !== 'reading' && item.kind !== 'speak' && item.kind !== 'particles' && item.kind !== 'correction'" class="mt-3 space-y-4">
                  <p v-if="item.kind === 'grammar' && item.pattern" class="text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
                    {{ item.pattern }}
                  </p>
                  <p v-if="item.body || item.meaningLong" class="whitespace-pre-line text-sm leading-relaxed">
                    {{ item.kind === 'etymology' ? item.body : item.meaningLong }}
                  </p>
                  <p v-if="item.kind === 'grammar' && item.nuance" class="whitespace-pre-line text-sm text-[var(--color-muted)]">
                    <strong>Nuance:</strong> {{ item.nuance }}
                  </p>

                  <!-- Sources beside the claim. Reviewing without them is rubber-stamping. -->
                  <div v-if="item.citations.length > 0" class="rounded-lg border border-[var(--color-border)] p-4">
                    <p class="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      What the sources say
                    </p>
                    <ul class="mt-2 space-y-3">
                      <li v-for="(c, i) in item.citations" :key="i" class="text-sm">
                        <span class="font-medium">{{ c.abbreviation || c.source }}</span>
                        <span class="text-[var(--color-muted)]"> {{ c.locator }} &middot; {{ tierLabel(c.reliabilityTier) }}</span>
                        <p v-if="c.quote" class="mt-1 border-l-2 border-[var(--color-border)] pl-3 italic text-[var(--color-muted)]">
                          {{ c.quote }}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="pending > PAGE" class="mt-6 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
          <button
            type="button"
            class="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm disabled:opacity-40"
            :disabled="offset === 0"
            @click="goToPage(offset - PAGE)"
          >
            Previous
          </button>
          <span class="text-sm text-[var(--color-muted)]">
            {{ offset + 1 }}&ndash;{{ Math.min(offset + PAGE, pending) }} of {{ pending }}
          </span>
          <button
            type="button"
            class="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm disabled:opacity-40"
            :disabled="offset + PAGE >= pending"
            @click="goToPage(offset + PAGE)"
          >
            Next
          </button>
        </div>
      </template>
    </div>
  </AppShell>
</template>
