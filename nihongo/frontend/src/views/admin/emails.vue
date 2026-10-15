<script setup lang="ts">
import type { EmailCampaignView } from '@nihongo/shared/types'

import { Mail, Plus } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

import { listCampaigns } from '@/api/email-campaigns'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'

/**
 * Admin emails: drafts and sent ones, newest first.
 */

// ============ Composables ============
const toast = useToast()

// ============ Constants ============
const STATUS: Record<EmailCampaignView['status'], string> = { draft: 'Draft', sending: 'Sending', sent: 'Sent' }
const AUDIENCE: Record<EmailCampaignView['audience'], string> = { all: 'Everyone', learners: 'Learners', admins: 'Admins' }

// ============ Reactive State ============
const campaigns = ref<EmailCampaignView[]>([])
const loading = ref(true)

// ============ Lifecycle Hooks ============
onMounted(async () => {
  try {
    campaigns.value = (await listCampaigns()).campaigns
  } catch {
    toast.error('Could not load the emails.')
  } finally {
    loading.value = false
  }
})

// ============ Methods ============
function when(iso: string | null) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-3xl font-semibold">
          Emails
        </h1>
        <Button :to="ROUTES.ADMIN_EMAIL_EDIT('new')">
          <Plus class="h-4 w-4" /> New email
        </Button>
      </div>
      <p class="mt-2 text-sm text-[var(--color-muted)]">
        Product updates and news, sent to learners who have product updates on. Every email has a one-click unsubscribe.
      </p>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>
      <div v-else-if="campaigns.length === 0" class="mt-8 rounded-xl border border-[var(--color-border)] p-10 text-center">
        <Mail class="mx-auto h-8 w-8 text-[var(--color-muted)]" />
        <p class="mt-3 font-medium">
          No emails yet
        </p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Write one, or import HTML drafted elsewhere.
        </p>
      </div>
      <ul v-else class="mt-6 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
        <li v-for="c in campaigns" :key="c.id">
          <router-link :to="ROUTES.ADMIN_EMAIL_EDIT(c.id)" class="flex items-center gap-4 p-4 transition hover:bg-[var(--color-card)]">
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">
                {{ c.subject }}
              </p>
              <p class="text-sm text-[var(--color-muted)]">
                {{ AUDIENCE[c.audience] }} ·
                <template v-if="c.status === 'draft'">
                  would reach {{ c.recipients }} · edited {{ when(c.updatedAt) }}
                </template>
                <template v-else>
                  {{ c.sent }} of {{ c.recipients }} sent<template v-if="c.failed">
                    · {{ c.failed }} failed
                  </template>
                  <template v-if="c.sentAt">
                    · {{ when(c.sentAt) }}
                  </template>
                </template>
              </p>
            </div>
            <span
              class="shrink-0 rounded-full border px-2 py-0.5 text-xs"
              :class="c.status === 'sent' ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
            >{{ STATUS[c.status] }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
