<script setup lang="ts">
import type { ActivityCounts, FriendsResponse, FriendView } from '@nihongo/shared/types'

import { Check, ChevronDown, Flame, Grid3x3, Info, UserPlus, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { acceptFriend, addFriend, getFriends, removeFriend } from '@/api/friends'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import { useConfirm } from '@/composables/use-confirm'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
import { useTodayStore } from '@/store/today'

/**
 * Friends: who studied today, streaks kept together, crossword times, what
 * each studied (tap a name), and a weekly board ranked by days studied. Everything shown is something the
 * friend switched on; anything they did not reads "not shared".
 */

// ============ Stores ============
const todayStore = useTodayStore()

// ============ Composables ============
const route = useRoute()

const toast = useToast()
const { showConfirm } = useConfirm()

// ============ Reactive State ============
const data = ref<FriendsResponse | null>(null)
const loading = ref(true)
/** A friend's link carries their code: fill it in, ready to send. */
const code = ref(typeof route.query.code === 'string' ? route.query.code : '')
const adding = ref(false)
/** The friend whose card is open, showing what they studied. */
const openId = ref<string | null>(null)

// ============ Constants ============
/** What a friend studied, three to a line, grouped as the menu groups them. */
const COUNTS: Array<{ key: keyof ActivityCounts, label: string }> = [
  { key: 'reviews', label: 'Reviews' },
  { key: 'newWords', label: 'New words' },
  { key: 'lessons', label: 'Lessons' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'reads', label: 'Read' },
  { key: 'speak', label: 'Speak' },
  { key: 'recall', label: 'Recall' },
  { key: 'shadowing', label: 'Shadowing' },
  { key: 'games', label: 'Games' }
]
const BOTH_STUDIED_HELP = 'Days in a row that you and this friend both studied. It counts once you both share "Studied today" in Settings, and today counts once you have both studied.'
const BOARD_HELP = 'The last seven days. Ranked by how many days each of you studied — turning up is what counts — and a tie goes to whoever earned more XP. Only friends who share their week are on it.'

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
async function load() {
  try {
    data.value = await getFriends()
    // Accepting or declining moves the request count the menu shows.
    void todayStore.refresh(undefined, true)
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

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}

/** Why "both studied" is blank, when it is. */
function bothStudied(f: FriendView): string {
  if (f.pairStreak !== null)
    return `${f.pairStreak} ${f.pairStreak === 1 ? 'day' : 'days'}`
  return data.value?.settings.shareStudiedToday ? 'They don\'t share it' : 'Share "Studied today" to see'
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
                <button
                  type="button"
                  class="flex flex-1 items-center gap-1 text-left font-medium"
                  :aria-expanded="openId === f.id"
                  @click="toggle(f.id)"
                >
                  {{ f.displayName }}
                  <ChevronDown class="h-4 w-4 text-[var(--color-muted)] transition" :class="openId === f.id ? 'rotate-180' : ''" />
                </button>
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
                  <Tooltip :content="BOTH_STUDIED_HELP">
                    <dt class="cursor-help text-[var(--color-muted)]">
                      <Flame class="inline h-3.5 w-3.5 align-[-2px]" /> Both studied <Info class="inline h-3 w-3 align-[-1px]" aria-hidden="true" />
                    </dt>
                  </Tooltip>
                  <dd>{{ bothStudied(f) }}</dd>
                </div>
                <div>
                  <dt class="flex items-center gap-1 text-[var(--color-muted)]">
                    <Grid3x3 class="h-3.5 w-3.5" /> Crossword
                  </dt>
                  <dd>{{ f.crossword ? `${minutes(f.crossword.seconds)} · ${f.crossword.level}` : 'Not shared or not played' }}</dd>
                </div>
              </dl>

              <!-- Opened: what they studied, today and over the week. -->
              <div v-if="openId === f.id" class="mt-4 border-t border-[var(--color-border)] pt-4">
                <p v-if="!f.activity" class="text-sm text-[var(--color-muted)]">
                  {{ f.displayName }} doesn't share what they studied.
                </p>
                <template v-else>
                  <div v-for="span in (['today', 'week'] as const)" :key="span" :class="span === 'week' ? 'mt-4' : ''">
                    <h3 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      {{ span === 'today' ? 'Today' : 'Last 7 days' }}<template v-if="span === 'week' && f.weekXp !== null">
                        · {{ f.weekXp }} XP
                      </template>
                    </h3>
                    <dl class="mt-2 grid grid-cols-3 gap-x-3 gap-y-3 text-sm">
                      <div v-for="c in COUNTS" :key="c.key" class="min-w-0">
                        <dt class="truncate text-xs text-[var(--color-muted)]">
                          {{ c.label }}
                        </dt>
                        <dd class="tabular-nums" :class="f.activity[span][c.key] ? 'font-medium' : 'text-[var(--color-muted)]'">
                          {{ f.activity[span][c.key] }}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </template>
              </div>
            </li>
          </ul>
        </section>

        <!-- The weekly board: days studied first, XP to break a tie. -->
        <section v-if="data.board.length > 1" class="mt-8">
          <Tooltip :content="BOARD_HELP">
            <h2 class="flex w-fit cursor-help items-center gap-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Last 7 days · days studied <Info class="h-3 w-3" aria-hidden="true" />
            </h2>
          </Tooltip>
          <ol class="mt-3 space-y-2">
            <li v-for="(b, i) in data.board" :key="`${b.displayName}-${i}`" class="flex items-center gap-3">
              <span class="w-5 text-right text-sm tabular-nums text-[var(--color-muted)]">{{ i + 1 }}</span>
              <span class="w-28 truncate" :class="b.isMe ? 'font-semibold' : ''">{{ b.isMe ? `${b.displayName} (you)` : b.displayName }}</span>
              <span class="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                <span class="block h-full rounded-full bg-[var(--color-accent)]" :style="{ width: `${b.days / 7 * 100}%` }" />
              </span>
              <span class="w-24 text-right text-sm tabular-nums">{{ b.days }}/7 <span class="text-[var(--color-muted)]">· {{ b.xp }} XP</span></span>
            </li>
          </ol>
        </section>
      </template>
    </div>
  </AppShell>
</template>
