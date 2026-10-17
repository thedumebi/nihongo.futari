<script setup lang="ts">
import type { NotificationPrefs, PushDevice } from '@nihongo/shared/types'

import { FURIGANA_MODES } from '@nihongo/shared/constants'
import { computed, onMounted, ref } from 'vue'

import { getPrefs, listPushDevices, removePushDevice, savePrefs } from '@/api/notifications'
import { getStudySettings, updateStudySettings } from '@/api/settings'
import AppShell from '@/components/layout/app-shell.vue'
import FriendsSettings from '@/components/settings/friends-settings.vue'
import Button from '@/components/ui/button.vue'
import CollapsibleCard from '@/components/ui/collapsible-card.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import Input from '@/components/ui/input.vue'
import Segmented from '@/components/ui/segmented.vue'
import { FURIGANA_MODE_LABELS, useFurigana } from '@/composables/use-furigana'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
import { authClient } from '@/lib/auth-client'
import { deviceId } from '@/offline/db'
import { disablePushHere, enablePush, pushSupport, syncPushSubscription } from '@/offline/push'
import { useAuthStore } from '@/store/auth'
import { useLanguageStore } from '@/store/language'
import { useTodayStore } from '@/store/today'

const toast = useToast()
const auth = useAuthStore()
const lang = useLanguageStore()
const todayStore = useTodayStore()

// --- Account ---------------------------------------------------------------
//
// There was nowhere at all to change your name, and an invited account never
// had one: the sign-up form collected it and dropped it. The nav then fell
// back to showing an email address.
const displayName = ref('')
const savingName = ref(false)

/**
 * Setting a password when you have never had one, or changing it.
 *
 * An invited account signs in with an emailed code and no password is ever
 * chosen, so the password sign-in on the login page can never work for them.
 * better-auth's email-OTP plugin has a reset flow that needs no current
 * password, which serves both: send a code, then set the password.
 *
 * Whether there is a password already is asked of the account, not assumed.
 * This always said "no password yet", even to someone who had set one and was
 * signing in with it. Null until known, so neither wording shows by mistake.
 */
const hasPassword = ref<boolean | null>(null)
const passwordStep = ref<'idle' | 'code'>('idle')
const passwordOtp = ref('')
const newPassword = ref('')
const passwordBusy = ref(false)

/** better-auth keeps a password as a "credential" account beside the user. */
async function loadHasPassword() {
  try {
    const { data } = await authClient.listAccounts()
    hasPassword.value = (data ?? []).some(a => a.providerId === 'credential')
  } catch {
    hasPassword.value = null
  }
}

async function saveName() {
  const next = displayName.value.trim()
  if (!next)
    return
  savingName.value = true
  try {
    const { error } = await authClient.updateUser({ name: next })
    if (error) {
      toast.error(error.message || 'Could not save your name.')
      return
    }
    await auth.syncSession(true)
    toast.success('Name saved')
  } finally {
    savingName.value = false
  }
}

async function startPassword() {
  const address = auth.user?.email
  if (!address)
    return
  passwordBusy.value = true
  try {
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: address, type: 'forget-password' })
    if (error) {
      toast.error(error.message || 'Could not send the code.')
      return
    }
    passwordStep.value = 'code'
    toast.success(`Code sent to ${address}`)
  } finally {
    passwordBusy.value = false
  }
}

async function finishPassword() {
  const address = auth.user?.email
  if (!address || newPassword.value.length < 8) {
    toast.error('Use at least 8 characters.')
    return
  }
  passwordBusy.value = true
  try {
    const { error } = await authClient.emailOtp.resetPassword({
      email: address,
      otp: passwordOtp.value,
      password: newPassword.value
    })
    if (error) {
      toast.error(error.message || 'That code was not accepted.')
      return
    }
    passwordStep.value = 'idle'
    passwordOtp.value = ''
    newPassword.value = ''
    toast.success(hasPassword.value ? 'Password changed' : 'Password set. You can now sign in with it')
    hasPassword.value = true
  } finally {
    passwordBusy.value = false
  }
}
// Per-device, not per-account: reading comfort changes as you improve, and
// it should be allowed to differ between your phone and your desk.
const { mode: furiganaMode, loadSettings } = useFurigana()

/**
 * New words a day. Per account (it shapes the schedule, which lives on the
 * server), saved as soon as it is picked.
 */
const dailyNewLimit = ref<number | null>(null)
const DAILY_OPTIONS = ['5', '10', '15', '20', '30'].map(n => ({ value: n, label: n }))
/** What each choice means in practice, so the hint speaks to the learner's own pace. */
const PACE: Record<number, string> = {
  5: '5 a day is a gentle pace: easy to keep up on a busy day, and reviews stay light.',
  10: '10 a day is a steady pace: new words every day without the reviews piling up.',
  15: '15 a day is a brisk pace: quicker progress, with noticeably more reviews a few days later.',
  20: '20 a day is a fast pace: plenty of new words, and a heavier review load to match.',
  30: '30 a day is a very fast pace: best if you have time for long reviews every day.'
}
/**
 * Extra practice: the other cards of words already met (another way to
 * practise each), as a multiple of the new words. They come beside the new
 * words, and keep going once those are done, up to this many a day.
 */
const extraPracticeMultiple = ref<number | null>(null)
const EXTRA_OPTIONS = [1, 2, 3].map(n => ({ value: String(n), label: `${n}×` }))

/**
 * When a new study day starts, in the learner's own timezone: midnight unless
 * they choose a later hour, so a session past midnight counts for the evening
 * it began in. Applied at once — the server reads it on every request — and
 * Today is refreshed so quests, new words and the streak move straight away.
 */
const dayBoundaryHour = ref<number | null>(null)
const BOUNDARY_OPTIONS = [0, 1, 2, 3, 4, 5, 6].map(h => ({ value: String(h), label: h === 0 ? 'Midnight' : `${h}am` }))
/** The device's zone — the one the server is kept in step with. */
const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

async function setDayBoundary(value: string) {
  const next = Number(value)
  const before = dayBoundaryHour.value
  dayBoundaryHour.value = next
  try {
    await updateStudySettings({ dayBoundaryHour: next })
    void todayStore.refresh(lang.code, true)
  } catch {
    dayBoundaryHour.value = before
    toast.error('Could not save that. Try again.')
  }
}

async function setDailyLimit(value: string) {
  const next = Number(value)
  const before = dailyNewLimit.value
  dailyNewLimit.value = next
  try {
    await updateStudySettings({ dailyNewLimit: next })
    void todayStore.refresh(lang.code, true)
  } catch {
    dailyNewLimit.value = before
    toast.error('Could not save that. Try again.')
  }
}

async function setExtraPractice(value: string) {
  const next = Number(value)
  const before = extraPracticeMultiple.value
  extraPracticeMultiple.value = next
  try {
    await updateStudySettings({ extraPracticeMultiple: next })
    void todayStore.refresh(lang.code, true)
  } catch {
    extraPracticeMultiple.value = before
    toast.error('Could not save that. Try again.')
  }
}

onMounted(() => {
  void loadSettings()
  void loadHasPassword()
  displayName.value = auth.user?.name ?? ''
  void getStudySettings().then((s) => {
    dailyNewLimit.value = s.dailyNewLimit
    extraPracticeMultiple.value = s.extraPracticeMultiple
    dayBoundaryHour.value = s.dayBoundaryHour
  }).catch(() => {})
})

const prefs = ref<NotificationPrefs | null>(null)
const loading = ref(true)
const saving = ref(false)
const enabling = ref(false)
/** Every device that gets this account's push, this one marked. */
const pushDevices = ref<PushDevice[]>([])
const thisPushDevice = computed(() => pushDevices.value.find(d => d.thisDevice) ?? null)
const otherPushDevices = computed(() => pushDevices.value.filter(d => !d.thisDevice))

// Push availability is a browser fact, not a preference — surface WHY when it
// isn't available rather than showing a toggle that silently does nothing.
const support = pushSupport()
const pushReason = ref(support.supported ? '' : support.reason)

const HOURS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  // No ":00" — a minute picker sits beside this one, and "23:00" next to ":15"
  // reads as two different times rather than one.
  label: String(h).padStart(2, '0')
}))

/**
 * The Dropdown speaks strings; `reminderHour` is a number on the prefs object.
 * Bridged here rather than loosening the shared component's contract for one
 * caller.
 */
const HOUR_OPTIONS = HOURS.map(h => ({ value: String(h.value ?? h), label: String(h.label ?? h) }))
/** The Reminders section folded: which channels are on, and when. */
const remindersSummary = computed(() => {
  const p = prefs.value
  if (!p)
    return ''
  const channels = [p.reminderEmailEnabled ? 'Email' : null, p.reminderPushEnabled ? 'Push' : null].filter(Boolean)
  if (channels.length === 0)
    return 'Off'
  return `${channels.join(' and ')} at ${String(p.reminderHour).padStart(2, '0')}:${String(p.reminderMinute ?? 0).padStart(2, '0')}`
})

const reminderHourValue = computed({
  get: () => String(prefs.value?.reminderHour ?? 19),
  set: (v: string) => {
    if (prefs.value)
      prefs.value.reminderHour = Number(v)
  }
})

/**
 * Minutes past the hour, in quarters.
 *
 * Quarters rather than free minutes because the cron fires every fifteen
 * minutes: offering 11:07 would promise a precision the scheduler cannot keep,
 * and the reminder would arrive at some point in the following quarter anyway.
 */
const MINUTE_OPTIONS = [0, 15, 30, 45].map(m => ({
  value: String(m),
  label: `:${String(m).padStart(2, '0')}`
}))
const reminderMinuteValue = computed({
  get: () => String(prefs.value?.reminderMinute ?? 0),
  set: (v: string) => {
    if (prefs.value)
      prefs.value.reminderMinute = Number(v) as 0 | 15 | 30 | 45
  }
})

onMounted(async () => {
  try {
    prefs.value = await getPrefs()
    // So this device's row is current and marked as this device.
    await syncPushSubscription()
    await loadPushDevices()
  } catch {
    toast.error('Could not load your settings.')
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!prefs.value)
    return
  saving.value = true
  try {
    prefs.value = await savePrefs(prefs.value)
    toast.success('Settings saved')
  } catch {
    toast.error('Could not save your settings.')
  } finally {
    saving.value = false
  }
}

async function loadPushDevices() {
  try {
    pushDevices.value = (await listPushDevices(deviceId())).devices
  } catch {
    pushDevices.value = []
  }
}

/** Off on this device: unsubscribed here, and off for the account if no device is left. */
async function turnOffPushHere() {
  enabling.value = true
  try {
    await disablePushHere()
    await loadPushDevices()
    if (prefs.value && pushDevices.value.length === 0) {
      prefs.value.reminderPushEnabled = false
      await save()
    }
  } finally {
    enabling.value = false
  }
}

async function removeOtherDevice(id: string) {
  await removePushDevice(id)
  await loadPushDevices()
}

async function removeAllOtherDevices() {
  await Promise.all(otherPushDevices.value.map(d => removePushDevice(d.id)))
  await loadPushDevices()
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

async function turnOnPush() {
  enabling.value = true
  try {
    const result = await enablePush()
    if (!result.ok) {
      pushReason.value = result.reason ?? 'Could not enable notifications.'
      if (prefs.value)
        prefs.value.reminderPushEnabled = false
      return
    }
    if (prefs.value) {
      prefs.value.reminderPushEnabled = true
      await save()
    }
    await loadPushDevices()
    toast.success('Notifications on')
  } finally {
    enabling.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Settings
      </h1>

      <!-- The welcome questions, again: new answers re-tailor everything below. -->
      <router-link
        :to="ROUTES.WELCOME"
        class="mt-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-text)]"
      >
        <span>
          <span class="block font-medium">Tailor go to you</span>
          <span class="block text-sm text-[var(--color-muted)]">Answer the welcome questions again: your level, pace, reading help and first-week plan.</span>
        </span>
        <span aria-hidden="true">→</span>
      </router-link>

      <CollapsibleCard
        class="mt-4"
        title="New words a day"
        :summary="dailyNewLimit === null ? '' : `${dailyNewLimit} a day${extraPracticeMultiple ? `, extra practice ${extraPracticeMultiple}×` : ''}`"
      >
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          How many words you have never seen New words introduces each day. More now means more
          reviews in a few days.<template v-if="dailyNewLimit">
            {{ ` ${PACE[dailyNewLimit] ?? `${dailyNewLimit} a day.`}` }}
          </template>
          You can always ask for a few more on the day.
        </p>
        <Segmented
          v-if="dailyNewLimit !== null"
          class="mt-4"
          label="Per day"
          :model-value="String(dailyNewLimit)"
          :options="DAILY_OPTIONS"
          @update:model-value="setDailyLimit"
        />
        <p class="mt-5 text-sm font-medium">
          Extra practice
        </p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Each word has more than one card: its meaning, its reading, how it sounds. A new word's
          first card counts towards your new words. Its other cards come later as extra practice, on
          top of your new words.<template v-if="dailyNewLimit && extraPracticeMultiple">
            With {{ dailyNewLimit }} new words and {{ extraPracticeMultiple }}×, a full day is
            {{ dailyNewLimit }} new words plus up to {{ dailyNewLimit * extraPracticeMultiple }} extra cards.
          </template>
        </p>
        <Segmented
          v-if="extraPracticeMultiple !== null"
          class="mt-3"
          label="Extra practice"
          :model-value="String(extraPracticeMultiple)"
          :options="EXTRA_OPTIONS"
          @update:model-value="setExtraPractice"
        />
      </CollapsibleCard>

      <CollapsibleCard
        class="mt-4"
        title="Your day"
        :summary="dayBoundaryHour === null ? '' : `Starts at ${dayBoundaryHour === 0 ? 'midnight' : `${dayBoundaryHour}am`} · ${deviceTimezone}`"
      >
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          When a new day starts for quests, new words and your streak. It follows the timezone your
          phone is in (now {{ deviceTimezone }}), so travelling moves it with you. Pick a
          later hour if you often study past midnight and want that to count for the evening before.
        </p>
        <Segmented
          v-if="dayBoundaryHour !== null"
          class="mt-4"
          label="A new day starts at"
          :model-value="String(dayBoundaryHour)"
          :options="BOUNDARY_OPTIONS"
          @update:model-value="setDayBoundary"
        />
      </CollapsibleCard>

      <CollapsibleCard class="mt-4" title="Furigana" :summary="FURIGANA_MODE_LABELS[furiganaMode].description">
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Readings printed above kanji.
        </p>
        <label
          v-for="option in FURIGANA_MODES"
          :key="option"
          class="mt-4 flex items-start gap-3"
        >
          <input
            v-model="furiganaMode"
            type="radio"
            :value="option"
            class="mt-1"
          >
          <span>
            <span class="font-medium">{{ FURIGANA_MODE_LABELS[option].label }}</span>
            <span class="block text-sm text-[var(--color-muted)]">{{ FURIGANA_MODE_LABELS[option].description }}</span>
          </span>
        </label>
      </CollapsibleCard>

      <!-- Account. Kept above the study preferences because a beginner's
           first visit here is usually to fix their own name. -->
      <CollapsibleCard class="mt-4" title="Account" :summary="`${auth.user?.name ? `${auth.user.name} · ` : ''}${auth.user?.email ?? ''}`">
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Signed in as {{ auth.user?.email }}.
        </p>

        <form class="mt-5 flex flex-wrap items-end gap-3" @submit.prevent="saveName">
          <div class="min-w-48 flex-1">
            <Input v-model="displayName" label="Your name" autocomplete="name" />
          </div>
          <Button type="submit" variant="ghost" :loading="savingName" :disabled="!displayName.trim()">
            Save name
          </Button>
        </form>

        <div class="mt-6 border-t border-[var(--color-border)] pt-5">
          <p class="font-medium">
            Password
          </p>
          <p v-if="hasPassword === true" class="mt-1 text-sm text-[var(--color-muted)]">
            You have a password, so you can sign in with it or with an emailed code. To change it,
            we email you a code first.
          </p>
          <p v-else-if="hasPassword === false" class="mt-1 text-sm text-[var(--color-muted)]">
            There is no password on this account yet. You sign in with an emailed code.
            Set one if you would rather sign in with it.
          </p>

          <Button v-if="passwordStep === 'idle' && hasPassword !== null" class="mt-4" variant="ghost" :loading="passwordBusy" @click="startPassword">
            {{ hasPassword ? 'Change password' : 'Send me a code' }}
          </Button>

          <form v-else class="mt-4 flex flex-wrap items-end gap-3" @submit.prevent="finishPassword">
            <div class="w-32">
              <Input v-model="passwordOtp" label="Code" autocomplete="one-time-code" required />
            </div>
            <div class="min-w-48 flex-1">
              <Input v-model="newPassword" type="password" label="New password" autocomplete="new-password" required />
            </div>
            <Button type="submit" variant="primary" :loading="passwordBusy">
              {{ hasPassword ? 'Change password' : 'Set password' }}
            </Button>
          </form>
        </div>
      </CollapsibleCard>

      <FriendsSettings />

      <p v-if="loading" class="mt-4 text-[var(--color-muted)]">
        Loading…
      </p>

      <CollapsibleCard v-else-if="prefs" class="mt-4" title="Reminders" :summary="remindersSummary">
        <div>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            A nudge when cards are waiting. Sent at your chosen hour, in your own timezone.
          </p>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="prefs.reminderEmailEnabled" type="checkbox" class="mt-1">
            <span>
              <span class="font-medium">Email me</span>
              <span class="block text-sm text-[var(--color-muted)]">One message a day, at most.</span>
            </span>
          </label>

          <label class="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              class="mt-1"
              :checked="prefs.reminderPushEnabled && thisPushDevice !== null"
              :disabled="!support.supported || enabling"
              @change="($event.target as HTMLInputElement).checked ? turnOnPush() : turnOffPushHere()"
            >
            <span>
              <span class="font-medium">Push notifications on this device</span>
              <span v-if="pushReason" class="block text-sm text-[var(--color-muted)]">{{ pushReason }}</span>
              <span v-else-if="thisPushDevice" class="block text-sm text-[var(--color-muted)]">{{ thisPushDevice.label }}, since {{ shortDate(thisPushDevice.createdAt) }}.</span>
            </span>
          </label>

          <!--
            Every other device that gets push. Web push cannot tell the server
            which subscriptions share a phone, so the learner sees them all and
            removes what is not theirs any more: one notification per device.
          -->
          <div v-if="otherPushDevices.length" class="mt-3 ml-7 rounded-lg border border-[var(--color-border)] p-3 text-sm">
            <p class="text-[var(--color-muted)]">
              Also on {{ otherPushDevices.length }} other {{ otherPushDevices.length === 1 ? 'device' : 'devices' }}:
            </p>
            <ul class="mt-2 space-y-2">
              <li v-for="d in otherPushDevices" :key="d.id" class="flex items-center justify-between gap-3">
                <span>{{ d.label }} <span class="text-[var(--color-muted)]">· last seen {{ shortDate(d.lastSeenAt) }}</span></span>
                <button type="button" class="text-[var(--color-muted)] underline underline-offset-4" @click="removeOtherDevice(d.id)">
                  Remove
                </button>
              </li>
            </ul>
            <button v-if="otherPushDevices.length > 1" type="button" class="mt-3 text-[var(--color-muted)] underline underline-offset-4" @click="removeAllOtherDevices">
              Remove all other devices
            </button>
          </div>

          <label class="mt-5 block">
            <span class="text-sm text-[var(--color-muted)]">Remind me at</span>
            <Dropdown
              v-model="reminderHourValue"
              :options="HOUR_OPTIONS"
              header="Hour"
              width-class="w-24"
            />
            <Dropdown
              v-model="reminderMinuteValue"
              :options="MINUTE_OPTIONS"
              header="Minute"
              width-class="w-24"
            />
          </label>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="prefs.weeklySummaryEnabled" type="checkbox" class="mt-1">
            <span>
              <span class="font-medium">Weekly summary</span>
              <span class="block text-sm text-[var(--color-muted)]">What you learned, once a week.</span>
            </span>
          </label>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="prefs.streakRiskEnabled" type="checkbox" class="mt-1">
            <span>
              <span class="font-medium">Streak at risk</span>
              <span class="block text-sm text-[var(--color-muted)]">A push at 8pm if you have a streak of 3+ days and nothing studied yet today.</span>
            </span>
          </label>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="prefs.ghostAlertEnabled" type="checkbox" class="mt-1">
            <span>
              <span class="font-medium">Cards that keep slipping</span>
              <span class="block text-sm text-[var(--color-muted)]">A push on Saturday morning when five or more cards keep being forgotten.</span>
            </span>
          </label>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="prefs.dueAlertEnabled" type="checkbox" class="mt-1">
            <span>
              <span class="font-medium">Reviews ready</span>
              <span class="block text-sm text-[var(--color-muted)]">A push during the day when 10 or more reviews are waiting. At most once a day, never close to your daily reminder, and not right after you have studied.</span>
            </span>
          </label>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="prefs.productUpdatesEmail" type="checkbox" class="mt-1">
            <span>
              <span class="font-medium">Product updates by email</span>
              <span class="block text-sm text-[var(--color-muted)]">An occasional email when something in go changes or is new. Every one has an unsubscribe link.</span>
            </span>
          </label>

          <div class="mt-6">
            <Button variant="primary" :loading="saving || enabling" @click="save">
              Save
            </Button>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  </AppShell>
</template>
