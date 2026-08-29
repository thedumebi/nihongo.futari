<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

function afterSignIn() {
  const redirect = route.query.redirect
  router.push(typeof redirect === 'string' ? redirect : ROUTES.STUDY)
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
