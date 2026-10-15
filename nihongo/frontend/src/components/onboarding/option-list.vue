<script setup lang="ts" generic="T extends string | number">
import { Check } from 'lucide-vue-next'

/**
 * A question's answers as large tap targets, one per line.
 *
 * One component for every onboarding question, so they all look and behave
 * alike: tap to choose, a tick on what is chosen, and with `multiple` any
 * number may be chosen.
 */
interface Option {
  value: T
  label: string
  hint?: string
}

interface Props {
  options: readonly Option[]
  modelValue: T | readonly T[] | null
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), { multiple: false })

const emit = defineEmits<{
  'update:modelValue': [value: T | T[]]
}>()

function chosen(value: T): boolean {
  return Array.isArray(props.modelValue) ? props.modelValue.includes(value) : props.modelValue === value
}

function pick(value: T) {
  if (!props.multiple) {
    emit('update:modelValue', value)
    return
  }
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] as T[] : []
  emit('update:modelValue', current.includes(value) ? current.filter(v => v !== value) : [...current, value])
}
</script>

<template>
  <ul class="space-y-2" :role="multiple ? 'group' : 'radiogroup'">
    <li v-for="o in options" :key="String(o.value)">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition"
        :class="chosen(o.value) ? 'border-[var(--color-text)] bg-[var(--color-card)]' : 'border-[var(--color-border)] hover:border-[var(--color-text)]'"
        :role="multiple ? 'checkbox' : 'radio'"
        :aria-checked="chosen(o.value)"
        @click="pick(o.value)"
      >
        <span class="min-w-0 flex-1">
          <span class="block font-medium">{{ o.label }}</span>
          <span v-if="o.hint" class="block text-sm text-[var(--color-muted)]">{{ o.hint }}</span>
        </span>
        <Check v-if="chosen(o.value)" class="h-5 w-5 shrink-0" />
      </button>
    </li>
  </ul>
</template>
