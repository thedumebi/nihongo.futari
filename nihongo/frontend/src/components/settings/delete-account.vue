<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@/components/ui/button.vue'
import CollapsibleCard from '@/components/ui/collapsible-card.vue'
import Input from '@/components/ui/input.vue'
import { useConfirm } from '@/composables/use-confirm'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
import { authClient } from '@/lib/auth-client'
import { clearLearnerData } from '@/offline/db'
import { useAuthStore } from '@/store/auth'

/**
 * Deleting your own account, and everything that hangs off it.
 *
 * The server asks for the password, or a sign-in within the last day, before
 * it deletes anything. Someone with no password and an older session is
 * offered a fresh sign-in, which brings them straight back here.
 */

interface Props {
  /** Whether the account has a password; null while unknown. */
  hasPassword: boolean | null
}

const props = defineProps<Props>()

// ============ Stores ============
const auth = useAuthStore()

// ============ Composables ============
const router = useRouter()
const toast = useToast()
const { showConfirm } = useConfirm()

// ============ Reactive State ============
const password = ref('')
const busy = ref(false)
const errorMsg = ref('')
/** The session is too old to delete with, and there is no password to use. */
const needsFreshSignIn = ref(false)

// ============ Methods ============
async function deleteAccount() {
  errorMsg.value = ''
  const confirmed = await showConfirm({
    title: 'Delete your account?',
    message: 'Your reviews, progress, streaks and settings are deleted for good. This cannot be undone.',
    confirmText: 'Delete my account',
    danger: true
  })
  if (!confirmed)
    return

  busy.value = true
  try {
    const { error } = await authClient.deleteUser(props.hasPassword && password.value ? { password: password.value } : {})
    if (error) {
      if (error.code === 'SESSION_EXPIRED') {
        needsFreshSignIn.value = true
        return
      }
      errorMsg.value = error.code === 'INVALID_PASSWORD'
        ? 'That password is not right.'
        : error.message || 'The account could not be deleted.'
      return
    }
    await clearLearnerData().catch(() => {})
    auth.forgetLocally()
    toast.success('Your account has been deleted')
    router.push(ROUTES.HOME)
  } catch {
    errorMsg.value = 'The account could not be deleted.'
  } finally {
    busy.value = false
  }
}

/** Sign out and back in, then land here again with a fresh session. */
async function signInAgain() {
  await auth.logout()
  router.push({ path: ROUTES.LOGIN, query: { redirect: ROUTES.SETTINGS } })
}
</script>

<template>
  <CollapsibleCard class="mt-4" title="Delete account" summary="Remove your account and everything in it">
    <div>
      <p class="mt-1 text-sm text-[var(--color-muted)]">
        This deletes your account and everything stored with it: reviews, progress, streaks, friends and
        settings. It cannot be undone.
      </p>

      <div v-if="needsFreshSignIn" class="mt-4 flex flex-col items-start gap-3">
        <p class="text-sm">
          To keep your account safe, deleting it needs a sign-in from the last day. Sign in again and you will
          come straight back here.
        </p>
        <Button variant="ghost" @click="signInAgain">
          Sign in again
        </Button>
      </div>

      <form v-else class="mt-4 flex flex-wrap items-end gap-3" @submit.prevent="deleteAccount">
        <div v-if="hasPassword" class="min-w-48 flex-1">
          <Input v-model="password" type="password" label="Your password" autocomplete="current-password" />
        </div>
        <Button type="submit" variant="danger" :loading="busy">
          Delete my account
        </Button>
      </form>

      <p v-if="errorMsg" class="mt-3 text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>
    </div>
  </CollapsibleCard>
</template>
