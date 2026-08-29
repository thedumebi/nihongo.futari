<script setup lang="ts">
defineProps<{
  modelValue: string
  type?: string
  placeholder?: string
  label?: string
  required?: boolean
  autocomplete?: string
}>()

defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <label class="flex flex-col gap-1 text-sm">
    <span v-if="label" class="text-muted">{{ label }}</span>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      class="neu-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </label>
</template>
