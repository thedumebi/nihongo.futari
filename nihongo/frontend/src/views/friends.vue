<script setup lang="ts">
import type { FriendsResponse } from '@nihongo/shared/types'

import { Check, Flame, Grid3x3, UserPlus, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { acceptFriend, addFriend, getFriends, removeFriend } from '@/api/friends'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import { useConfirm } from '@/composables/use-confirm'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'

/**
 * Friends: who studied today, streaks kept together, crossword times, and a
 * weekly board ranked by days studied. Everything shown is something the
 * friend switched on; anything they did not reads "not shared".
 */

// ============ Stores ============
const route = useRoute()

// ============ Composables ============
const toast = useToast()
const { showConfirm } = useConfirm()

// ============ Reactive State ============
const data = ref<FriendsResponse | null>(null)
const loading = ref(true)
/** A friend's link carries their code: fill it in, ready to send. */
const code = ref(typeof route.query.code === 'string' ? route.query.code : '')
const adding = ref(false)

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
async function load() {
  try {
    data.value = await getFriends()
  } catch {
    data.value = null
  } finally {
    loading.value = false
  }
}

async function add() {
  adding.value = true
  try {
    const result = await addFriend({ code: code.value })
    toast.success(result.status === 'accepted' ? `You and ${result.displayName} are friends.` : `Request sent to ${result.displayName}.`)
    code.value = ''
    await load()
  } catch (e) {
    const message = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    toast.error(message ?? 'Could not send that — check the code.')
  } finally {
    adding.value = false
  }
}

async function accept(id: string) {
  await acceptFriend(id)
  await load()
}

async function remove(id: string, displayName: string, kind: 'friend' | 'request') {
  if (kind === 'friend') {
    const ok = await showConfirm({ title: `Remove ${displayName}?`, message: 'You stop seeing each other here. They are not told.', confirmText: 'Remove', danger: true })
    if (!ok)
      return
  }
  await removeFriend(id)
  await load()
}

function minutes(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        Friends
      </h1>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>

      <div v-else-if="!data?.settings.enabled" class="mt-8 rounded-xl border border-[var(--color-border)] p-6">
        <p class="text-lg">
          Friends are off.
        </p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Turn them on in Settings to get a code to share{{ code ? ', then come back to this link' : '' }}. You choose
          exactly what friends can see; your words and accuracy are never shared.
        </p>
        <Button class="mt-4" :to="ROUTES.SETTINGS">
          Open Settings
        </Button>
      </div>

      <template v-else>
        <form class="mt-6 flex flex-wrap items-end gap-3" @submit.prevent="add">
          <div class="min-w-48 flex-1">
            <Input v-model="code" label="Add a friend by their code" autocomplete="off" autocapitalize="characters" />
          </div>
          <Button type="submit" :loading="adding" :disabled="code.trim().length < 4">
            <UserPlus class="h-4 w-4" /> Add
          </Button>
        </form>
        <p class="mt-2 text-sm text-[var(--color-muted)]">
          Your code is <span class="font-mono tracking-widest text-[var(--color-text)]">{{ data.settings.code }}</span> —
          share it or the link from <router-link :to="ROUTES.SETTINGS" class="underline underline-offset-4">
            Settings
          </router-link>.
        </p>

        <!-- Requests -->
        <section v-if="data.requests.length" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Requests
          </h2>
          <ul class="mt-3 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
            <li v-for="r in data.requests" :key="r.id" class="flex items-center gap-3 p-4">
              <span class="flex-1">
                <span class="font-medium">{{ r.displayName }}</span>
                <span class="block text-sm text-[var(--color-muted)]">{{ r.direction === 'incoming' ? 'wants to be friends' : 'waiting for them to accept' }}</span>
              </span>
              <Button v-if="r.direction === 'incoming'" @click="accept(r.id)">
                <Check class="h-4 w-4" /> Accept
              </Button>
              <Button variant="ghost" :aria-label="r.direction === 'incoming' ? 'Decline' : 'Cancel request'" @click="remove(r.id, r.displayName, 'request')">
                <X class="h-4 w-4" />
              </Button>
            </li>
          </ul>
        </section>

        <!-- Friends -->
        <section class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Friends
          </h2>
          <p v-if="data.friends.length === 0" class="mt-3 text-[var(--color-muted)]">
            No friends yet. Send someone your code.
          </p>
          <ul v-else class="mt-3 space-y-3">
            <li v-for="f in data.friends" :key="f.id" class="rounded-xl border border-[var(--color-border)] p-4">
              <div class="flex items-center gap-3">
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :class="f.studiedToday === null ? 'bg-[var(--color-border)]' : f.studiedToday ? 'bg-[var(--color-success)]' : 'border border-[var(--color-muted)]'"
                  :title="f.studiedToday === null ? 'Not shared' : f.studiedToday ? 'Studied today' : 'Not yet today'"
                />
                <span class="flex-1 font-medium">{{ f.displayName }}</span>
                <button type="button" class="text-sm text-[var(--color-muted)] underline underline-offset-4" @click="remove(f.id, f.displayName, 'friend')">
                  Remove
                </button>
              </div>
              <dl class="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt class="text-[var(--color-muted)]">
                    Today
                  </dt>
                  <dd>{{ f.studiedToday === null ? 'Not shared' : f.studiedToday ? 'Studied' : 'Not yet' }}</dd>
                </div>
                <div>
                  <dt class="flex items-center gap-1 text-[var(--color-muted)]">
                    <Flame class="h-3.5 w-3.5" /> Together
                  </dt>
                  <dd>{{ f.pairStreak === null ? 'Not shared' : `${f.pairStreak} ${f.pairStreak === 1 ? 'day' : 'days'}` }}</dd>
                </div>
                <div>
                  <dt class="flex items-center gap-1 text-[var(--color-muted)]">
                    <Grid3x3 class="h-3.5 w-3.5" /> Crossword
                  </dt>
                  <dd>{{ f.crossword ? `${minutes(f.crossword.seconds)} · ${f.crossword.level}` : 'Not shared or not played' }}</dd>
                </div>
              </dl>
            </li>
          </ul>
        </section>

        <!-- The weekly board: days studied, never points. -->
        <section v-if="data.board.length > 1" class="mt-8">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            This week · days studied
          </h2>
          <ol class="mt-3 space-y-2">
            <li v-for="(b, i) in data.board" :key="`${b.displayName}-${i}`" class="flex items-center gap-3">
              <span class="w-5 text-right text-sm tabular-nums text-[var(--color-muted)]">{{ i + 1 }}</span>
              <span class="w-28 truncate" :class="b.isMe ? 'font-semibold' : ''">{{ b.isMe ? `${b.displayName} (you)` : b.displayName }}</span>
              <span class="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                <span class="block h-full rounded-full bg-[var(--color-accent)]" :style="{ width: `${b.days / 7 * 100}%` }" />
              </span>
              <span class="w-8 text-right text-sm tabular-nums">{{ b.days }}/7</span>
            </li>
          </ol>
        </section>
      </template>
    </div>
  </AppShell>
</template>
