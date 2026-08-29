<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getSignupMode, reserveInvite } from '@/api/invites'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import { ROUTES } from '@/constants'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Whether a code is needed comes from the server, so the page reflects the
// SIGNUP_MODE policy without the client deciding anything security-relevant.
const requiresInvite = ref(false)
const signupEnabled = ref(true)
const policyLoaded = ref(false)

const step = ref<'details' | 'code'>('details')
const name = ref('')
const email = ref('')
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
  } catch {
    // Assume the stricter setting if the policy can't be read.
    requiresInvite.value = true
  } finally {
    policyLoaded.value = true
  }
})

async function startSignup() {
  errorMsg.value = ''
  notice.value = ''
  loading.value = true
  try {
    if (requiresInvite.value) {
      const result = await reserveInvite(inviteCode.value, email.value)
      if (!result.ok) {
        errorMsg.value = result.message || 'That invite code was not accepted.'
        return
      }
    }

    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: email.value, type: 'sign-in' })
    if (error) {
      errorMsg.value = error.message || 'Could not send the code.'
      return
    }

    step.value = 'code'
    notice.value = `We sent a 6-digit code to ${email.value}. It expires in 10 minutes.`
  } catch {
    errorMsg.value = 'Could not start sign-up.'
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

    // The name was collected on the first step and then dropped on the floor:
    // the OTP sign-in has no name field, so nothing ever wrote it. Set it now
    // that there is an account to set it on. A failure here must not block the
    // sign-in — the account exists either way, and the name is editable in
    // Settings.
    if (name.value.trim())
      await authClient.updateUser({ name: name.value.trim() }).catch(() => {})

    await auth.syncSession()
    router.push(ROUTES.STUDY)
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
            v-if="requiresInvite"
            v-model="inviteCode"
            label="Invite code"
            autocomplete="off"
            required
          />
          <p class="text-sm text-[var(--color-muted)]">
            We'll email you a one-time code. You won't need a password.
          </p>
          <p v-if="errorMsg" class="text-sm text-[var(--color-danger)]">
            {{ errorMsg }}
          </p>
          <Button type="submit" variant="primary" :loading="loading">
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
          <button
            type="button"
            class="self-center text-sm underline underline-offset-4"
            @click="step = 'details'; otp = ''; errorMsg = ''"
          >
            Go back
          </button>
        </form>
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
