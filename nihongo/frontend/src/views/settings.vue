<script setup lang="ts">
import type { NotificationPrefs } from '@nihongo/shared/types'

import { FURIGANA_MODES } from '@nihongo/shared/constants'
import { computed, onMounted, ref } from 'vue'

import { getPrefs, savePrefs } from '@/api/notifications'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import Input from '@/components/ui/input.vue'
import { FURIGANA_MODE_LABELS, useFurigana } from '@/composables/use-furigana'
import { useToast } from '@/composables/use-toast'
import { authClient } from '@/lib/auth-client'
import { enablePush, pushSupport } from '@/offline/push'
import { useAuthStore } from '@/store/auth'

const toast = useToast()
const auth = useAuthStore()

// --- Account ---------------------------------------------------------------
//
// There was nowhere at all to change your name, and an invited account never
// had one: the sign-up form collected it and dropped it. The nav then fell
// back to showing an email address.
const displayName = ref('')
const savingName = ref(false)

/**
 * Setting a password when you have never had one.
 *
 * An invited account signs in with an emailed code and no password is ever
 * chosen, so the password sign-in on the login page can never work for them.
 * better-auth's email-OTP plugin has a reset flow that needs no current
 * password, which is exactly this case: send a code, then set the password.
 */
const passwordStep = ref<'idle' | 'code'>('idle')
const passwordOtp = ref('')
const newPassword = ref('')
const passwordBusy = ref(false)

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
    await auth.syncSession()
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
    toast.success('Password set — you can now sign in with it')
  } finally {
    passwordBusy.value = false
  }
}
// Per-device, not per-account: reading comfort changes as you improve, and
// it should be allowed to differ between your phone and your desk.
const { mode: furiganaMode, loadSettings } = useFurigana()

onMounted(() => {
  void loadSettings()
  displayName.value = auth.user?.name ?? ''
})

const prefs = ref<NotificationPrefs | null>(null)
const loading = ref(true)
const saving = ref(false)
const enabling = ref(false)

// Push availability is a browser fact, not a preference — surface WHY when it
// isn't available rather than showing a toggle that silently does nothing.
const support = pushSupport()
const pushReason = ref(support.supported ? '' : support.reason)

const HOURS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: `${String(h).padStart(2, '0')}:00`
}))

/**
 * The Dropdown speaks strings; `reminderHour` is a number on the prefs object.
 * Bridged here rather than loosening the shared component's contract for one
 * caller.
 */
const HOUR_OPTIONS = HOURS.map(h => ({ value: String(h.value ?? h), label: String(h.label ?? h) }))
const reminderHourValue = computed({
  get: () => String(prefs.value?.reminderHour ?? 19),
  set: (v: string) => {
    if (prefs.value)
      prefs.value.reminderHour = Number(v)
  }
})

onMounted(async () => {
  try {
    prefs.value = await getPrefs()
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

      <div class="mt-8 rounded-xl border border-[var(--color-border)] p-6">
        <h2 class="font-semibold">
          Furigana
        </h2>
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
      </div>

      <!-- Account. Kept above the study preferences because a beginner's
           first visit here is usually to fix their own name. -->
      <section class="mt-8 rounded-xl border border-[var(--color-border)] p-6">
        <h2 class="font-semibold">
          Account
        </h2>
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
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            You signed in with an emailed code, so there is no password on this account yet.
            Set one if you would rather sign in with it.
          </p>

          <Button v-if="passwordStep === 'idle'" class="mt-4" variant="ghost" :loading="passwordBusy" @click="startPassword">
            Send me a code
          </Button>

          <form v-else class="mt-4 flex flex-wrap items-end gap-3" @submit.prevent="finishPassword">
            <div class="w-32">
              <Input v-model="passwordOtp" label="Code" autocomplete="one-time-code" required />
            </div>
            <div class="min-w-48 flex-1">
              <Input v-model="newPassword" type="password" label="New password" autocomplete="new-password" required />
            </div>
            <Button type="submit" variant="primary" :loading="passwordBusy">
              Set password
            </Button>
          </form>
        </div>
      </section>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>

      <section v-else-if="prefs" class="mt-8 space-y-6">
        <div class="rounded-xl border border-[var(--color-border)] p-6">
          <h2 class="font-semibold">
            Reminders
          </h2>
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
              :checked="prefs.reminderPushEnabled"
              :disabled="!support.supported"
              @change="($event.target as HTMLInputElement).checked ? turnOnPush() : (prefs.reminderPushEnabled = false, save())"
            >
            <span>
              <span class="font-medium">Push notifications</span>
              <span v-if="pushReason" class="block text-sm text-[var(--color-muted)]">{{ pushReason }}</span>
              <span v-else class="block text-sm text-[var(--color-muted)]">On this device.</span>
            </span>
          </label>

          <label class="mt-5 block">
            <span class="text-sm text-[var(--color-muted)]">Remind me at</span>
            <Dropdown
              v-model="reminderHourValue"
              :options="HOUR_OPTIONS"
              header="Hour"
              width-class="w-32"
            />
          </label>

          <label class="mt-5 flex items-start gap-3">
            <input v-model="prefs.weeklySummaryEnabled" type="checkbox" class="mt-1">
            <span>
              <span class="font-medium">Weekly summary</span>
              <span class="block text-sm text-[var(--color-muted)]">What you learned, once a week.</span>
            </span>
          </label>

          <div class="mt-6">
            <Button variant="primary" :loading="saving || enabling" @click="save">
              Save
            </Button>
          </div>
        </div>
      </section>
    </div>
  </AppShell>
</template>
