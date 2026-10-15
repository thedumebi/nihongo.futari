<script setup lang="ts">
import type { FriendSettings, UpdateFriendSettingsInput } from '@nihongo/shared/types'

import { Copy, RefreshCw } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import { getFriends, rotateFriendCode, updateFriendSettings } from '@/api/friends'
import Button from '@/components/ui/button.vue'
import CollapsibleCard from '@/components/ui/collapsible-card.vue'
import Input from '@/components/ui/input.vue'
import { useConfirm } from '@/composables/use-confirm'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'

/**
 * Friends, opt-in. Off by default and off means off: no profile, no code, no
 * way to be found. Each share is its own switch, also off by default, and the
 * page says plainly what can never be shared.
 */

// ============ Composables ============
const toast = useToast()
const { showConfirm } = useConfirm()

// ============ Reactive State ============
const settings = ref<FriendSettings | null>(null)
const name = ref('')
const busy = ref(false)

// ============ Computed Properties ============
const link = computed(() => settings.value?.code ? `${location.origin}${ROUTES.FRIENDS}?code=${settings.value.code}` : '')

// ============ Lifecycle Hooks ============
onMounted(async () => {
  try {
    settings.value = (await getFriends()).settings
    name.value = settings.value.displayName ?? ''
  } catch {
    settings.value = null
  }
})

// ============ Methods ============
async function change(input: UpdateFriendSettingsInput) {
  busy.value = true
  try {
    settings.value = await updateFriendSettings(input)
    name.value = settings.value.displayName ?? ''
  } catch {
    toast.error('Could not save that. Try again.')
  } finally {
    busy.value = false
  }
}

async function toggle(on: boolean) {
  if (!on) {
    const ok = await showConfirm({
      title: 'Turn friends off?',
      message: 'Your friend code stops working and every friendship is removed. Your study is not touched.',
      confirmText: 'Turn off',
      danger: true
    })
    if (!ok)
      return
  }
  await change({ enabled: on })
}

async function rotate() {
  const ok = await showConfirm({
    title: 'New code?',
    message: 'Links and codes you have given out stop working. Existing friends stay.',
    confirmText: 'New code'
  })
  if (!ok)
    return
  try {
    settings.value = await rotateFriendCode()
  } catch {
    toast.error('Could not make a new code. Try again.')
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(link.value)
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy. Select the link instead.')
  }
}
</script>

<template>
  <CollapsibleCard class="mt-4" title="Friends" :summary="!settings ? '' : settings.enabled ? `On · your code ${settings.code}` : 'Off'">
    <p class="mt-1 text-sm text-[var(--color-muted)]">
      Study alongside friends: see who has studied today, keep a streak together, compare crossword times.
      Off unless you turn it on. Your words, accuracy and the cards you find hard are never shared.
    </p>

    <p v-if="!settings" class="mt-4 text-sm text-[var(--color-muted)]">
      Loading…
    </p>

    <template v-else>
      <label class="mt-5 flex items-start gap-3">
        <input type="checkbox" class="mt-1" :checked="settings.enabled" :disabled="busy" @change="toggle(($event.target as HTMLInputElement).checked)">
        <span>
          <span class="font-medium">Use friends</span>
          <span class="block text-sm text-[var(--color-muted)]">Gives you a code to share. No one can find you any other way.</span>
        </span>
      </label>

      <template v-if="settings.enabled">
        <form class="mt-5 flex flex-wrap items-end gap-3" @submit.prevent="change({ displayName: name.trim() })">
          <div class="min-w-48 flex-1">
            <Input v-model="name" label="Name friends see" maxlength="40" />
          </div>
          <Button type="submit" variant="ghost" :loading="busy" :disabled="!name.trim() || name.trim() === settings.displayName">
            Save name
          </Button>
        </form>

        <div class="mt-5">
          <p class="text-sm text-[var(--color-muted)]">
            Your code
          </p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <span class="rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-mono text-lg tracking-widest">{{ settings.code }}</span>
            <Button variant="ghost" @click="copyLink">
              <Copy class="h-4 w-4" /> Copy link
            </Button>
            <Button variant="ghost" @click="rotate">
              <RefreshCw class="h-4 w-4" /> New code
            </Button>
          </div>
        </div>

        <p class="mt-6 font-medium">
          What friends can see
        </p>
        <label class="mt-3 flex items-start gap-3">
          <input type="checkbox" class="mt-1" :checked="settings.shareStudiedToday" :disabled="busy" @change="change({ shareStudiedToday: ($event.target as HTMLInputElement).checked })">
          <span>
            <span class="font-medium">Whether I studied today</span>
            <span class="block text-sm text-[var(--color-muted)]">Also lets you keep a streak together with friends who share it too.</span>
          </span>
        </label>
        <label class="mt-3 flex items-start gap-3">
          <input type="checkbox" class="mt-1" :checked="settings.shareCrossword" :disabled="busy" @change="change({ shareCrossword: ($event.target as HTMLInputElement).checked })">
          <span>
            <span class="font-medium">My time on the daily crossword</span>
          </span>
        </label>
        <label class="mt-3 flex items-start gap-3">
          <input type="checkbox" class="mt-1" :checked="settings.shareWeekly" :disabled="busy" @change="change({ shareWeekly: ($event.target as HTMLInputElement).checked })">
          <span>
            <span class="font-medium">How many days I studied this week</span>
            <span class="block text-sm text-[var(--color-muted)]">Puts you on the weekly board, ranked by days, with XP to break a tie.</span>
          </span>
        </label>
        <label class="mt-3 flex items-start gap-3">
          <input type="checkbox" class="mt-1" :checked="settings.shareActivity" :disabled="busy" @change="change({ shareActivity: ($event.target as HTMLInputElement).checked })">
          <span>
            <span class="font-medium">What I studied</span>
            <span class="block text-sm text-[var(--color-muted)]">Counts only: reviews, new words, lessons, conversations and so on. Never which words, never how well.</span>
          </span>
        </label>
        <p class="mt-6 text-sm font-medium">
          Tell me
        </p>
        <label class="mt-2 flex items-start gap-3">
          <input type="checkbox" class="mt-1" :checked="settings.notifyBoard" :disabled="busy" @change="change({ notifyBoard: ($event.target as HTMLInputElement).checked })">
          <span>
            <span class="font-medium">When a friend passes me on the weekly board</span>
            <span class="block text-sm text-[var(--color-muted)]">Or comes up close behind. A push notification, during the day only, if notifications are on.</span>
          </span>
        </label>

        <Button class="mt-6" variant="ghost" :to="ROUTES.FRIENDS">
          Go to friends
        </Button>
      </template>
    </template>
  </CollapsibleCard>
</template>
