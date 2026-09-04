<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getSignupMode } from '@/api/invites'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import { ROUTES } from '@/constants'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Passwordless is the default. Nobody should have to invent a password to
// practise vocabulary; the password form is there for people who prefer a
// password manager, not because anything requires it.
const mode = ref<'otp' | 'password'>('otp')
const step = ref<'email' | 'code'>('email')

const email = ref('')
const otp = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const notice = ref('')
const googleEnabled = ref(false)

onMounted(async () => {
  // Whether the button can work at all is a fact about the server's env.
  try {
    googleEnabled.value = (await getSignupMode()).googleEnabled
  } catch { /* the button simply does not appear */ }

  // A rejected Google sign-in comes back here with the reason in the URL, and
  // the page used to read `redirect` and ignore `error` — so somebody turned
  // away by the invite gate landed on a silent form with no idea why.
  // A query key can arrive as a string or an array of them.
  const raw = route.query.error
  const error = Array.isArray(raw) ? raw.find(Boolean) : raw
  if (typeof error === 'string' && error)
    errorMsg.value = googleMessage(error)
})

/**
 * What to say when Google hands the reader back.
 *
 * better-auth puts its own message in the URL when it has one — the invite
 * gate's refusal reaches here that way. Anything else is ours to explain, and
 * the likeliest cause by far is an address with no invite behind it.
 */
const GOOGLE_ERRORS: Record<string, string> = {
  INVITE_REQUIRED: 'Google sign-in could not finish. This app is invite-only — redeem your invite code on the sign-up page first, then try Google again with the same email address.',
  SIGNUPS_CLOSED: 'Sign-ups are closed at the moment. Ask an administrator to create your account.',
  DOMAIN_NOT_ALLOWED: 'That email domain is not allowed to register here.',
  signup_disabled: 'Sign-ups are closed at the moment. Ask an administrator to create your account.',
  access_denied: 'Google sign-in was cancelled.'
}

/**
 * What to say when Google hands the reader back.
 *
 * better-auth puts a CODE in the URL, not a sentence — the refusal's own
 * message never travels — so the wording lives here. Anything unrecognised
 * falls back to the likeliest cause, which is an address with no invite behind
 * it.
 */
function googleMessage(raw: string): string {
  const code = decodeURIComponent(raw)
  return GOOGLE_ERRORS[code] ?? GOOGLE_ERRORS.INVITE_REQUIRED!
}

async function signInWithGoogle() {
  errorMsg.value = ''
  const origin = window.location.origin
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ROUTES.PROGRESS
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: origin + redirect,
    // No `?error=` of our own: better-auth APPENDS one, and two of the same
    // key parse as an ARRAY — which the reader below then failed the
    // `typeof === 'string'` test on, so nothing was ever shown.
    errorCallbackURL: `${origin}${ROUTES.LOGIN}`
  })
}

function afterSignIn() {
  const redirect = route.query.redirect
  router.push(typeof redirect === 'string' ? redirect : ROUTES.PROGRESS)
}

async function sendCode() {
  errorMsg.value = ''
  notice.value = ''
  loading.value = true
  try {
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: email.value, type: 'sign-in' })
    if (error) {
      errorMsg.value = error.message || 'Could not send the code.'
      return
    }
    step.value = 'code'
    notice.value = `We sent a 6-digit code to ${email.value}. It expires in 10 minutes.`
  } catch {
    errorMsg.value = 'Could not send the code.'
  } finally {
    loading.value = false
  }
}

async function verifyCode() {
  errorMsg.value = ''
  loading.value = true
  try {
    const { error } = await authClient.signIn.emailOtp({ email: email.value, otp: otp.value })
    if (error) {
      errorMsg.value = error.message || 'That code was not accepted.'
      return
    }
    await auth.syncSession(true)
    afterSignIn()
  } catch {
    errorMsg.value = 'That code was not accepted.'
  } finally {
    loading.value = false
  }
}

async function signInWithPassword() {
  errorMsg.value = ''
  loading.value = true
  try {
    const { error } = await authClient.signIn.email({ email: email.value, password: password.value })
    if (error) {
      errorMsg.value = error.message || 'Sign in failed.'
      return
    }
    await auth.syncSession(true)
    afterSignIn()
  } catch {
    errorMsg.value = 'Sign in failed.'
  } finally {
    loading.value = false
  }
}

function useAnotherEmail() {
  step.value = 'email'
  otp.value = ''
  notice.value = ''
  errorMsg.value = ''
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-sm px-6 py-20">
      <h1 class="text-center text-3xl font-semibold">
        Sign in
      </h1>
      <p class="mt-2 text-center text-sm text-[var(--color-muted)]">
        Welcome back.
      </p>

      <div class="mt-8 rounded-xl border border-[var(--color-border)] p-6">
        <!-- Passwordless: ask for the address, then the emailed code. -->
        <form v-if="mode === 'otp' && step === 'email'" class="flex flex-col gap-4" @submit.prevent="sendCode">
          <Input v-model="email" type="email" label="Email" autocomplete="email" required />
          <p class="text-sm text-[var(--color-muted)]">
            We'll email you a one-time code. No password needed.
          </p>
          <p v-if="errorMsg" class="text-sm text-[var(--color-danger)]">
            {{ errorMsg }}
          </p>
          <Button type="submit" variant="primary" :loading="loading">
            Email me a code
          </Button>
        </form>

        <form v-else-if="mode === 'otp' && step === 'code'" class="flex flex-col gap-4" @submit.prevent="verifyCode">
          <p v-if="notice" class="text-sm text-[var(--color-muted)]">
            {{ notice }}
          </p>
          <Input
            v-model="otp"
            label="6-digit code"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            required
          />
          <p v-if="errorMsg" class="text-sm text-[var(--color-danger)]">
            {{ errorMsg }}
          </p>
          <Button type="submit" variant="primary" :loading="loading">
            Sign in
          </Button>
          <div class="flex justify-between text-sm">
            <button type="button" class="underline underline-offset-4" @click="useAnotherEmail">
              Use a different email
            </button>
            <button type="button" class="underline underline-offset-4" :disabled="loading" @click="sendCode">
              Resend code
            </button>
          </div>
        </form>

        <form v-else class="flex flex-col gap-4" @submit.prevent="signInWithPassword">
          <Input v-model="email" type="email" label="Email" autocomplete="email" required />
          <Input v-model="password" type="password" label="Password" autocomplete="current-password" required />
          <p v-if="errorMsg" class="text-sm text-[var(--color-danger)]">
            {{ errorMsg }}
          </p>
          <Button type="submit" variant="primary" :loading="loading">
            Sign in
          </Button>
        </form>

        <!--
          Google sits below the form rather than above it, because the emailed
          code is the path most people here already use and the one the invite
          system was built around.
        -->
        <div v-if="googleEnabled" class="mt-6 flex flex-col gap-3">
          <div class="flex items-center gap-3 text-xs text-[var(--color-muted)]">
            <span class="h-px flex-1 bg-[var(--color-border)]" />
            or
            <span class="h-px flex-1 bg-[var(--color-border)]" />
          </div>
          <Button variant="ghost" @click="signInWithGoogle">
            Continue with Google
          </Button>
        </div>

        <div class="mt-6 border-t border-[var(--color-border)] pt-4 text-center text-sm">
          <button
            v-if="mode === 'otp'"
            type="button"
            class="text-[var(--color-muted)] underline underline-offset-4"
            @click="mode = 'password'; errorMsg = ''"
          >
            Use a password instead
          </button>
          <button
            v-else
            type="button"
            class="text-[var(--color-muted)] underline underline-offset-4"
            @click="mode = 'otp'; step = 'email'; errorMsg = ''"
          >
            Email me a code instead
          </button>
        </div>
      </div>

      <!--
        No link to /signup. Accounts are created by invitation only, and the
        only legitimate route to that page is the emailed invite link, which
        carries the code. Advertising it sent people to a form that would
        refuse them.
      -->
    </div>
  </AppShell>
</template>
