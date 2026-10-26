<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Cloudflare Turnstile: the "are you a person" check in front of anything that
 * sends an email while nobody is signed in.
 *
 * Most people see a tick and nothing else. It hands back a token the server
 * trades with Cloudflare; a token is good for ONE request, so the parent calls
 * `reset()` after every send and waits for the next one.
 */

interface Props {
  siteKey: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  token: [value: string | null]
}>()

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

// One script for the whole app, however many forms mount a widget.
let scriptLoading: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile)
    return Promise.resolve(window.turnstile)
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not load'))
    script.onerror = () => {
      scriptLoading = null
      reject(new Error('Turnstile did not load'))
    }
    document.head.appendChild(script)
  })
  return scriptLoading
}

// ============ Reactive State ============
const container = ref<HTMLElement | null>(null)
const failed = ref(false)
let widgetId: string | null = null

// ============ Lifecycle Hooks ============
onMounted(async () => {
  try {
    const turnstile = await loadTurnstile()
    if (!container.value)
      return
    widgetId = turnstile.render(container.value, {
      'sitekey': props.siteKey,
      'theme': 'auto',
      'size': 'flexible',
      'callback': (token: string) => emit('token', token),
      'expired-callback': () => emit('token', null),
      'error-callback': () => emit('token', null)
    })
  } catch {
    failed.value = true
  }
})

onBeforeUnmount(() => {
  if (widgetId && window.turnstile)
    window.turnstile.remove(widgetId)
})

// ============ Methods ============
/** A token has been spent; ask for a fresh one. */
function reset() {
  emit('token', null)
  if (widgetId && window.turnstile)
    window.turnstile.reset(widgetId)
}

defineExpose({ reset })
</script>

<template>
  <div>
    <div ref="container" />
    <p v-if="failed" class="text-sm text-[var(--color-danger)]">
      The check that keeps out bots did not load. Turn off any blocker for challenges.cloudflare.com and reload.
    </p>
  </div>
</template>
