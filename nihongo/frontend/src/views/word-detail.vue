<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import WordEntry from '@/components/ja/word-entry.vue'
import AppShell from '@/components/layout/app-shell.vue'

/**
 * The dictionary's page for one word. The entry itself is `WordEntry`, shared
 * with the half-screen sheet a tapped word opens.
 */

// ============ Composables ============
const route = useRoute()

// ============ Computed Properties ============
const wordId = computed(() => String(route.params.id))
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8">
      <WordEntry :word-id="wordId" />
    </div>
  </AppShell>
</template>
