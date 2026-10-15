<script setup lang="ts">
import { FileCode, X } from 'lucide-vue-next'
import { ref } from 'vue'

import Button from '@/components/ui/button.vue'

/**
 * Paste HTML and load it into the editor as real formatting.
 *
 * The way to bring in an email drafted somewhere else — in a chat, in another
 * tool. The editor parses it, so headings, lists and links become editable
 * formatting rather than literal tags. As on the blog editor in dmb.futari.
 */
defineProps<{ open: boolean }>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'import': [html: string]
}>()

const html = ref('')

function close() {
  emit('update:open', false)
}

function importContent() {
  const value = html.value.trim()
  if (!value)
    return
  // A pasted full document: keep what is inside <body>.
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(value)?.[1] ?? value
  emit('import', body)
  html.value = ''
  close()
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40" @click="close" />
    <div class="relative flex w-full max-w-2xl flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl">
      <header class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <h2 class="flex items-center gap-2 font-semibold">
          <FileCode class="h-5 w-5" /> Import HTML
        </h2>
        <button type="button" class="text-[var(--color-muted)] hover:text-[var(--color-text)]" aria-label="Close" @click="close">
          <X class="h-5 w-5" />
        </button>
      </header>
      <div class="p-5">
        <p class="mb-3 text-sm text-[var(--color-muted)]">
          Paste HTML below. It becomes editable formatting and <strong>replaces</strong> the current body.
        </p>
        <textarea
          v-model="html"
          rows="12"
          placeholder="<h2>What's new</h2><p>…</p>"
          class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 font-mono text-xs"
        />
      </div>
      <footer class="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">
        <Button variant="ghost" @click="close">
          Cancel
        </Button>
        <Button :disabled="!html.trim()" @click="importContent">
          Import
        </Button>
      </footer>
    </div>
  </div>
</template>
