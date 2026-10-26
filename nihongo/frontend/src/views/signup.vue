<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getSignupMode, reserveInvite } from '@/api/invites'
import AppShell from '@/components/layout/app-shell.vue'
import ProjectNotice from '@/components/layout/project-notice.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import TurnstileWidget from '@/components/ui/turnstile-widget.vue'
import { useCaptcha } from '@/composables/use-captcha'
import { ROUTES } from '@/constants'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const captcha = useCaptcha()
const { widget: captchaWidget } = captcha

// Whether a code is needed comes from the server, so the page reflects the
// SIGNUP_MODE policy without the client deciding anything security-relevant.
const requiresInvite = ref(false)
const signupEnabled = ref(true)
const policyLoaded = ref(false)

/**
 * How the account is made when it isn't Google.
 *
 * With the emailed code allowed to sign in, the code IS the account: no
 * password. With it switched off, the reader chooses a password and the code
 * only confirms the address, on this same page.
 */
const emailCodeSignIn = ref(true)

const step = ref<'details' | 'code'>('details')
const googleEnabled = ref(false)

/**
 * The address an invite has actually been reserved for.
 *
 * Google is offered only after this exists, because the gate keys on it: the
 * hook that admits a new account looks for a live reservation matching the
 * address Google returns. Offering the button first would send somebody to
 * Google and bounce them back refused, which reads as the app being broken
 * rather than as an invite being required.
 */
const reservedFor = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const inviteCode = ref('')
const otp = ref('')
const loading = ref(false)
const errorMsg = ref('')
const notice = ref('')

onMounted(async () => {
  // A shared invite link carries the code and, when the invite was addressed
  // to someone, their email. Both are conveniences: the server re-checks the
  // reservation against whatever is actually submitted.
  const fromLink = route.query.code
  if (typeof fromLink === 'string')
    inviteCode.value = fromLink

  const invitedEmail = route.query.email
  if (typeof invitedEmail === 'string')
    email.value = invitedEmail

  try {
    const policy = await getSignupMode()
    requiresInvite.value = policy.requiresInvite
    signupEnabled.value = policy.signupEnabled
    googleEnabled.value = policy.googleEnabled
    emailCodeSignIn.value = policy.emailCodeSignIn
    captcha.siteKey.value = policy.turnstileSiteKey
  } catch {
    // Assume the stricter setting if the policy can't be read.
    requiresInvite.value = true
  } finally {
    policyLoaded.value = true
  }
})

async function signUpWithGoogle() {
  errorMsg.value = ''
  const origin = window.location.origin
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: origin + ROUTES.TODAY,
    errorCallbackURL: `${origin}${ROUTES.LOGIN}`
  })
}

async function startSignup() {
  errorMsg.value = ''
  notice.value = ''
  if (!emailCodeSignIn.value && password.value.length < 8) {
    errorMsg.value = 'Use at least 8 characters for the password.'
    return
  }
  loading.value = true
  try {
    if (requiresInvite.value) {
      const result = await reserveInvite(inviteCode.value, email.value)
      if (!result.ok) {
        errorMsg.value = result.message || 'That invite code was not accepted.'
        return
      }
    }
    reservedFor.value = email.value

    // Either way, one email goes out: the sign-in code, or the code that
    // confirms the address of the password account just made.
    const { error } = emailCodeSignIn.value
      ? await authClient.emailOtp.sendVerificationOtp({
          email: email.value,
          type: 'sign-in',
          fetchOptions: captcha.fetchOptions()
        })
      : await authClient.signUp.email({
          name: name.value.trim() || email.value,
          email: email.value,
          password: password.value,
          fetchOptions: captcha.fetchOptions()
        })
    if (error) {
      errorMsg.value = error.code === 'USER_ALREADY_EXISTS' || error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
        ? 'There is already an account for that address. Sign in instead.'
        : error.message || 'Could not start sign-up.'
      return
    }

    step.value = 'code'
    notice.value = `We sent a 6-digit code to ${email.value}. It expires in 10 minutes.`
  } catch {
    errorMsg.value = 'Could not start sign-up.'
  } finally {
    captcha.spent()
    loading.value = false
  }
}

async function resendCode() {
  errorMsg.value = ''
  loading.value = true
  try {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email.value,
      type: emailCodeSignIn.value ? 'sign-in' : 'email-verification',
      fetchOptions: captcha.fetchOptions()
    })
    if (error) {
      errorMsg.value = error.message || 'Could not send the code.'
      return
    }
    notice.value = `We sent a new code to ${email.value}.`
  } catch {
    errorMsg.value = 'Could not send the code.'
  } finally {
    captcha.spent()
    loading.value = false
  }
}

async function verifyCode() {
  errorMsg.value = ''
  loading.value = true
  try {
    // A code sign-in makes the account; a password account already exists
    // and this confirms its address, which signs it in.
    const { error } = emailCodeSignIn.value
      ? await authClient.signIn.emailOtp({ email: email.value, otp: otp.value })
      : await authClient.emailOtp.verifyEmail({ email: email.value, otp: otp.value })
    if (error) {
      errorMsg.value = error.message || 'That code was not accepted.'
      return
    }

    // The name was collected on the first step and then dropped on the floor:
    // the OTP sign-in has no name field, so nothing ever wrote it. Set it now
    // that there is an account to set it on. A failure here must not block the
    // sign-in — the account exists either way, and the name is editable in
    // Settings.
    if (emailCodeSignIn.value && name.value.trim())
      await authClient.updateUser({ name: name.value.trim() }).catch(() => {})

    await auth.syncSession(true)
    router.push(ROUTES.TODAY)
  } catch {
    errorMsg.value = 'That code was not accepted.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-sm px-6 py-20">
      <h1 class="text-center text-3xl font-semibold">
        Create an account
      </h1>

      <ProjectNotice class="mt-6" />

      <div v-if="policyLoaded && !signupEnabled" class="mt-8 rounded-xl border border-[var(--color-border)] p-6 text-center">
        <p class="text-[var(--color-muted)]">
          Sign-ups are closed at the moment. If you're expecting an account, ask the administrator to create one for you.
        </p>
        <router-link :to="ROUTES.LOGIN" class="mt-4 inline-block underline underline-offset-4">
          Back to sign in
        </router-link>
      </div>

      <div v-else class="mt-8 rounded-xl border border-[var(--color-border)] p-6">
        <form v-if="step === 'details'" class="flex flex-col gap-4" @submit.prevent="startSignup">
          <Input v-model="name" label="Name" autocomplete="name" />
          <Input v-model="email" type="email" label="Email" autocomplete="email" required />
          <Input
            v-if="!emailCodeSignIn"
            v-model="password"
            type="password"
            label="Password (at least 8 characters)"
            autocomplete="new-password"
            required
          />
          <Input
            v-if="requiresInvite"
            v-model="inviteCode"
            label="Invite code"
            autocomplete="off"
            required
          />
          <p class="text-sm text-[var(--color-muted)]">
            {{ emailCodeSignIn
              ? "We'll email you a one-time code. You won't need a password."
              : "We'll email you a code to confirm the address is yours." }}
          </p>
          <TurnstileWidget
            v-if="captcha.siteKey.value"
            ref="captchaWidget"
            :site-key="captcha.siteKey.value"
            @token="captcha.token.value = $event"
          />
          <p v-if="errorMsg" class="text-sm text-[var(--color-danger)]">
            {{ errorMsg }}
          </p>
          <Button type="submit" variant="primary" :loading="loading" :disabled="!captcha.ready.value">
            Continue
          </Button>
        </form>

        <form v-else class="flex flex-col gap-4" @submit.prevent="verifyCode">
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
            Create account
          </Button>
          <TurnstileWidget
            v-if="captcha.siteKey.value"
            ref="captchaWidget"
            :site-key="captcha.siteKey.value"
            @token="captcha.token.value = $event"
          />
          <div class="flex justify-between text-sm">
            <!--
              Only before an account exists. With a password the account is
              made at the first step, so going back would try to make it twice.
            -->
            <button
              v-if="emailCodeSignIn"
              type="button"
              class="underline underline-offset-4"
              @click="step = 'details'; otp = ''; errorMsg = ''"
            >
              Go back
            </button>
            <span v-else />
            <button type="button" class="underline underline-offset-4" :disabled="loading || !captcha.ready.value" @click="resendCode">
              Resend code
            </button>
          </div>
        </form>

        <!--
          Under invites, offered only once the code is reserved, and named with
          that address. Google will hand back whichever account the reader
          picks, and if that is a different address there is no reservation
          behind it and the gate refuses — so saying which address this works
          for is the whole point of the sentence. With open sign-up there is
          nothing to reserve, so it is offered from the start. Not after a
          password sign-up: that account already exists unconfirmed, and Google
          will not join an unconfirmed account.
        -->
        <div
          v-if="googleEnabled && (requiresInvite ? step === 'code' && reservedFor && emailCodeSignIn : step === 'details')"
          class="mt-6 flex flex-col gap-3"
        >
          <div class="flex items-center gap-3 text-xs text-[var(--color-muted)]">
            <span class="h-px flex-1 bg-[var(--color-border)]" />
            or
            <span class="h-px flex-1 bg-[var(--color-border)]" />
          </div>
          <Button variant="ghost" @click="signUpWithGoogle">
            Continue with Google
          </Button>
          <p v-if="requiresInvite" class="text-center text-xs text-[var(--color-muted)]">
            Use {{ reservedFor }}. That is the address your invite is held for.
          </p>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-[var(--color-muted)]">
        Already have an account?
        <router-link :to="ROUTES.LOGIN" class="underline underline-offset-4">
          Sign in
        </router-link>
      </p>
    </div>
  </AppShell>
</template>
