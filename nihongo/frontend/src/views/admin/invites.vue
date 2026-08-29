<script setup lang="ts">
import type { InviteResponse } from '@nihongo/shared/types'

import { computed, onMounted, ref } from 'vue'

import { createInvite, listInvites, revokeInvite } from '@/api/invites'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import { useToast } from '@/composables/use-toast'

const toast = useToast()

const invites = ref<InviteResponse[]>([])
const signupMode = ref('')
const loading = ref(true)
const creating = ref(false)

const email = ref('')
const note = ref('')
const role = ref<'user' | 'admin'>('user')
const maxUses = ref(1)
const expiresInDays = ref(30)

/** A code is spent, revoked or past its expiry — anything but usable. */
function isDead(i: InviteResponse) {
  return Boolean(i.revokedAt) || i.useCount >= i.maxUses || (i.expiresAt !== null && new Date(i.expiresAt) < new Date())
}

const live = computed(() => invites.value.filter(i => !isDead(i)))
const spent = computed(() => invites.value.filter(isDead))

async function load() {
  loading.value = true
  try {
    const data = await listInvites()
    invites.value = data.invites
    signupMode.value = data.signupMode
  } finally {
    loading.value = false
  }
}

async function mint() {
  creating.value = true
  try {
    const created = await createInvite({
      ...(email.value ? { email: email.value } : {}),
      ...(note.value ? { note: note.value } : {}),
      role: role.value,
      maxUses: maxUses.value,
      expiresInDays: expiresInDays.value
    })
    invites.value = [created, ...invites.value]
    email.value = ''
    note.value = ''
    await copy(created.url)
  } catch {
    toast.error('Could not create the invite.')
  } finally {
    creating.value = false
  }
}

async function copy(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Invite link copied')
  } catch {
    // Clipboard needs a secure context; the link is on screen either way.
    toast.warning('Copy the link from the list below')
  }
}

async function revoke(i: InviteResponse) {
  try {
    await revokeInvite(i.id)
    await load()
  } catch {
    toast.error('Could not revoke that invite.')
  }
}

onMounted(load)
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Invites
      </h1>
      <p class="mt-2 text-sm text-[var(--color-muted)]">
        Sign-up mode is <strong>{{ signupMode }}</strong>.
        <template v-if="signupMode === 'open'">
          Anyone can register without a code &mdash; these are optional.
        </template>
        <template v-else-if="signupMode === 'closed'">
          Self-signup is off entirely, so codes won't work until you change <code>SIGNUP_MODE</code>.
        </template>
        <template v-else>
          A code is required to sign up.
        </template>
      </p>

      <form class="mt-8 grid gap-4 rounded-xl border border-[var(--color-border)] p-6 sm:grid-cols-2" @submit.prevent="mint">
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-[var(--color-muted)]">Email (optional)</span>
          <input v-model="email" type="email" placeholder="Binds the code to one address" class="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2">
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-[var(--color-muted)]">Note (optional)</span>
          <input v-model="note" placeholder="Who is this for?" class="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2">
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-[var(--color-muted)]">Role</span>
          <Dropdown
            v-model="role"
            :options="[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }]"
            header="Role"
            width-class="w-36"
          />
        </label>
        <div class="grid grid-cols-2 gap-4">
          <label class="flex flex-col gap-1 text-sm">
            <span class="text-[var(--color-muted)]">Uses</span>
            <input v-model.number="maxUses" type="number" min="1" max="100" class="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2">
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="text-[var(--color-muted)]">Expires (days)</span>
            <input v-model.number="expiresInDays" type="number" min="1" max="365" class="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2">
          </label>
        </div>
        <div class="sm:col-span-2">
          <Button type="submit" variant="primary" :loading="creating">
            Create invite
          </Button>
        </div>
      </form>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>

      <template v-else>
        <section class="mt-10">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Usable ({{ live.length }})
          </h2>
          <p v-if="live.length === 0" class="mt-3 text-[var(--color-muted)]">
            None yet. Create one above and send someone the link.
          </p>
          <ul v-else class="mt-3 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
            <li v-for="i in live" :key="i.id" class="flex flex-wrap items-center gap-3 p-4">
              <code class="font-mono text-lg">{{ i.code }}</code>
              <span class="text-sm text-[var(--color-muted)]">
                {{ i.email || 'anyone' }} &middot; {{ i.useCount }}/{{ i.maxUses }} used
                <template v-if="i.role !== 'user'"> &middot; <strong>{{ i.role }}</strong></template>
                <template v-if="i.note"> &middot; {{ i.note }}</template>
              </span>
              <div class="ml-auto flex gap-3 text-sm">
                <button type="button" class="underline underline-offset-4" @click="copy(i.url)">
                  Copy link
                </button>
                <button type="button" class="text-[var(--color-danger)] underline underline-offset-4" @click="revoke(i)">
                  Revoke
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section v-if="spent.length > 0" class="mt-10">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Spent or revoked ({{ spent.length }})
          </h2>
          <ul class="mt-3 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] opacity-60">
            <li v-for="i in spent" :key="i.id" class="flex flex-wrap items-center gap-3 p-4">
              <code class="font-mono">{{ i.code }}</code>
              <span class="text-sm text-[var(--color-muted)]">
                {{ i.revokedAt ? 'revoked' : i.useCount >= i.maxUses ? 'used up' : 'expired' }}
                <template v-if="i.email"> &middot; {{ i.email }}</template>
              </span>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </AppShell>
</template>
