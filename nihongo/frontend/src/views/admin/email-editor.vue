<script setup lang="ts">
import type { EmailAudience } from '@nihongo/shared/constants'
import type { EmailCampaignInput, EmailCampaignView, EmailPreview } from '@nihongo/shared/types'

import { useDebounceFn } from '@vueuse/core'
import { Monitor, Smartphone } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createCampaign, deleteCampaign, getCampaign, previewCampaign, sendCampaign, sendTestCampaign, updateCampaign } from '@/api/email-campaigns'
import EmailBodyEditor from '@/components/admin/email-body-editor.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Segmented from '@/components/ui/segmented.vue'
import { useConfirm } from '@/composables/use-confirm'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'

/**
 * Write an email, see it as it will arrive, test it on yourself, send it once.
 *
 * The preview is the real thing — rendered by the server in the same template,
 * personalised for you — shown at desktop and phone width, with the plain-text
 * version beside it. Once sent, an email is read-only: a record of what went
 * out, with its progress.
 */

// ============ Composables ============
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { showConfirm } = useConfirm()

// ============ Constants ============
const AUDIENCES: Array<{ value: EmailAudience, label: string }> = [
  { value: 'all', label: 'Everyone' },
  { value: 'learners', label: 'Learners' },
  { value: 'admins', label: 'Admins' }
]
type View = 'desktop' | 'phone' | 'text'
const VIEWS: Array<{ value: View, label: string }> = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Plain text' }
]

// ============ Reactive State ============
const campaign = ref<EmailCampaignView | null>(null)
const subject = ref('')
const preheader = ref('')
const bodyHtml = ref('')
const audience = ref<EmailAudience>('all')
const preview = ref<EmailPreview | null>(null)
const view = ref<View>('desktop')
const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const sending = ref(false)
let poll: ReturnType<typeof setInterval> | null = null

// ============ Computed Properties ============
const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const editable = computed(() => isNew.value || campaign.value?.status === 'draft')
const input = computed<EmailCampaignInput>(() => ({
  subject: subject.value,
  preheader: preheader.value,
  bodyHtml: bodyHtml.value,
  audience: audience.value
}))
const dirty = computed(() => !campaign.value
  || campaign.value.subject !== subject.value
  || campaign.value.preheader !== preheader.value
  || campaign.value.bodyHtml !== bodyHtml.value
  || campaign.value.audience !== audience.value)

// ============ Watchers ============
const refreshPreview = useDebounceFn(async () => {
  if (!subject.value.trim())
    return
  try {
    preview.value = await previewCampaign(input.value)
  } catch {
    // The editor still works; the preview catches up on the next change.
  }
}, 600)
watch(input, () => void refreshPreview(), { deep: true })

// ============ Lifecycle Hooks ============
onMounted(load)
onBeforeUnmount(() => {
  if (poll)
    clearInterval(poll)
})

// ============ Methods ============
async function load() {
  loading.value = true
  try {
    if (!isNew.value)
      apply(await getCampaign(id.value))
  } catch {
    toast.error('Could not load that email.')
  } finally {
    loading.value = false
  }
}

function apply(c: EmailCampaignView) {
  campaign.value = c
  subject.value = c.subject
  preheader.value = c.preheader
  bodyHtml.value = c.bodyHtml
  audience.value = c.audience
  void refreshPreview()
  // While it is going out, keep the progress current.
  if (c.status === 'sending' && !poll)
    poll = setInterval(() => void getCampaign(c.id).then(apply), 3000)
  if (c.status !== 'sending' && poll) {
    clearInterval(poll)
    poll = null
  }
}

async function save(): Promise<EmailCampaignView | null> {
  if (!subject.value.trim()) {
    toast.error('Give it a subject first.')
    return null
  }
  saving.value = true
  try {
    const saved = isNew.value ? await createCampaign(input.value) : await updateCampaign(id.value, input.value)
    apply(saved)
    if (isNew.value)
      await router.replace(ROUTES.ADMIN_EMAIL_EDIT(saved.id))
    return saved
  } catch {
    toast.error('Could not save it.')
    return null
  } finally {
    saving.value = false
  }
}

async function test() {
  const saved = dirty.value ? await save() : campaign.value
  if (!saved)
    return
  testing.value = true
  try {
    await sendTestCampaign(saved.id)
    toast.success('Test sent to you.')
  } catch {
    toast.error('Could not send the test.')
  } finally {
    testing.value = false
  }
}

async function send() {
  const saved = dirty.value ? await save() : campaign.value
  if (!saved)
    return
  const ok = await showConfirm({
    title: 'Send this email?',
    message: `It goes to ${saved.recipients} ${saved.recipients === 1 ? 'person' : 'people'} now, and cannot be edited or sent again.`,
    confirmText: `Send to ${saved.recipients}`
  })
  if (!ok)
    return
  sending.value = true
  try {
    apply(await sendCampaign(saved.id))
    toast.success('Sending.')
  } catch {
    toast.error('Could not send it.')
  } finally {
    sending.value = false
  }
}

async function remove() {
  if (!campaign.value)
    return
  const ok = await showConfirm({ message: 'Delete this draft?', confirmText: 'Delete', danger: true })
  if (!ok)
    return
  await deleteCampaign(campaign.value.id)
  await router.push(ROUTES.ADMIN_EMAILS)
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <router-link :to="ROUTES.ADMIN_EMAILS" class="text-sm text-[var(--color-muted)] underline underline-offset-4">
        ← All emails
      </router-link>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>

      <div v-else class="mt-4 grid gap-8 lg:grid-cols-2">
        <!-- Writing. -->
        <section>
          <h1 class="text-2xl font-semibold">
            {{ isNew ? 'New email' : editable ? 'Edit email' : 'Sent email' }}
          </h1>
          <p v-if="campaign && !editable" class="mt-1 text-sm text-[var(--color-muted)]">
            {{ campaign.status === 'sending' ? 'Sending' : 'Sent' }} — {{ campaign.sent }} of {{ campaign.recipients }} delivered<template v-if="campaign.failed">
              , {{ campaign.failed }} failed
            </template>.
          </p>

          <fieldset :disabled="!editable" class="mt-4 space-y-4">
            <label class="block">
              <span class="text-sm font-medium">Subject</span>
              <input v-model="subject" type="text" maxlength="200" class="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
            </label>
            <label class="block">
              <span class="text-sm font-medium">Preview text</span>
              <span class="block text-xs text-[var(--color-muted)]">The line inboxes show after the subject.</span>
              <input v-model="preheader" type="text" maxlength="200" class="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
            </label>
            <div>
              <span class="text-sm font-medium">Send to</span>
              <Segmented v-model="audience" class="mt-1" label="Audience" :options="AUDIENCES" />
            </div>
            <div>
              <span class="text-sm font-medium">Body</span>
              <span class="block text-xs text-[var(--color-muted)]">{{ '{' + '{name}' + '}' }} becomes each reader's name.</span>
              <EmailBodyEditor v-if="editable" v-model="bodyHtml" class="mt-1" />
            </div>
          </fieldset>

          <div v-if="editable" class="mt-6 flex flex-wrap gap-3">
            <Button :loading="sending" @click="send">
              Send{{ preview ? ` to ${preview.recipients}` : '' }}
            </Button>
            <Button variant="ghost" :loading="testing" @click="test">
              Send a test to me
            </Button>
            <Button variant="ghost" :loading="saving" :disabled="!dirty" @click="save">
              Save draft
            </Button>
            <Button v-if="campaign" variant="ghost" class="ml-auto" @click="remove">
              Delete
            </Button>
          </div>
        </section>

        <!-- As it will arrive. -->
        <section>
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="font-semibold">
              Preview
            </h2>
            <Segmented v-model="view" class="ml-auto" label="Preview as" :options="VIEWS" />
          </div>
          <p v-if="preview" class="mt-2 text-sm">
            <span class="font-medium">{{ preview.subject }}</span>
            <span class="text-[var(--color-muted)]"> — {{ preheader }}</span>
          </p>
          <div v-if="!preview" class="mt-3 rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-muted)]">
            Give it a subject and the preview appears here.
          </div>
          <pre v-else-if="view === 'text'" class="mt-3 max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--color-border)] p-4 text-sm">{{ preview.text }}</pre>
          <div v-else class="mt-3 flex justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
            <span v-if="view === 'phone'" class="sr-only">Phone width</span>
            <iframe
              :srcdoc="preview.html"
              title="Email preview"
              sandbox=""
              class="h-[70vh] rounded-lg bg-white"
              :style="{ width: view === 'phone' ? '375px' : '100%' }"
            />
          </div>
          <p class="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Monitor v-if="view === 'desktop'" class="h-3.5 w-3.5" />
            <Smartphone v-else-if="view === 'phone'" class="h-3.5 w-3.5" />
            Personalised for you. Each reader sees their own name and their own unsubscribe link.
          </p>
        </section>
      </div>
    </div>
  </AppShell>
</template>
