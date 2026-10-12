<script setup lang="ts" generic="T extends string">
/**
 * A row of mutually exclusive choices, shown all at once.
 *
 * For a handful of short options where a dropdown would hide what the choices
 * are. A radiogroup to assistive tech, with the arrow keys moving between
 * options the way a native radio group does.
 */
interface Props {
  label: string
  options: Array<{ value: T, label: string, title?: string }>
}

const props = defineProps<Props>()

const model = defineModel<T>({ required: true })

function move(step: number) {
  const i = props.options.findIndex(o => o.value === model.value)
  const next = props.options[(i + step + props.options.length) % props.options.length]
  if (next)
    model.value = next.value
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-1 text-sm">
    <span class="text-[var(--color-muted)]">{{ label }}</span>
    <div
      role="radiogroup"
      :aria-label="label"
      class="inline-flex w-fit max-w-full overflow-x-auto rounded-lg border border-[var(--color-border)] p-0.5"
      @keydown.right.prevent="move(1)"
      @keydown.down.prevent="move(1)"
      @keydown.left.prevent="move(-1)"
      @keydown.up.prevent="move(-1)"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="model === option.value"
        :tabindex="model === option.value ? 0 : -1"
        :title="option.title"
        class="whitespace-nowrap rounded-md px-3 py-1 transition"
        :class="model === option.value
          ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'"
        @click="model = option.value"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
