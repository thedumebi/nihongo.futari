<script setup lang="ts">
/**
 * A labelled text input.
 *
 * Attributes go to the `<input>`, not the label around it: `disabled` used to
 * land on the `<label>`, where it does nothing, so a "disabled" field still
 * took typing.
 *
 * `answer` marks a field where the learner types an answer — romaji or kana.
 * The phone keyboard must leave those alone: iOS autocorrect turns "kimasu"
 * into an English word and the learner is marked wrong for something they
 * never typed.
 */
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue: string
  type?: string
  placeholder?: string
  label?: string
  required?: boolean
  autocomplete?: string
  answer?: boolean
}>()

defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <label class="flex flex-col gap-1 text-sm">
    <span v-if="label" class="text-muted">{{ label }}</span>
    <input
      v-bind="$attrs"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="answer ? 'off' : autocomplete"
      :autocorrect="answer ? 'off' : undefined"
      :autocapitalize="answer ? 'off' : undefined"
      :spellcheck="answer ? false : undefined"
      class="neu-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </label>
</template>
