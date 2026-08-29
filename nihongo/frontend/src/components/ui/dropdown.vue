<script setup lang="ts">
import type { Component } from 'vue'

import { Check, ChevronDown } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import Tooltip from '@/components/ui/tooltip.vue'

/**
 * Dropdown, ported from ofuma's page-dropdown.
 *
 * Differences from the original: colours come from the `@theme` tokens rather
 * than hardcoded greys, and the icon is a lucide component rather than an SVG
 * path from an ICONS map, since that's how this project does icons.
 */
export interface DropdownOption<T extends string = string> {
  value: T
  label: string
  /** Shown on hover. Good for explaining what a mode actually drills. */
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** Rendered after the label, e.g. an item count. */
  hint?: string
  disabled?: boolean
}

interface Props {
  modelValue: string | null | undefined
  options: DropdownOption[]
  placeholder?: string
  header?: string
  /** Label for the "no selection" entry. Empty string hides it. */
  allLabel?: string
  icon?: Component
  widthClass?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select…',
  header: 'Select',
  allLabel: '',
  icon: undefined,
  widthClass: 'w-56',
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOpen = ref(false)
const dropdownId = `dropdown-${Math.random().toString(36).slice(2, 8)}`

const selectedLabel = computed(() => {
  if (props.modelValue) {
    return props.options.find(o => o.value === props.modelValue)?.label ?? props.placeholder
  }
  return props.allLabel || props.placeholder
})

function toggle() {
  if (props.disabled)
    return
  isOpen.value = !isOpen.value
}

function select(option: DropdownOption) {
  if (option.disabled)
    return
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest(`[data-dropdown-id="${dropdownId}"]`))
    isOpen.value = false
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape')
    isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div class="relative" :class="widthClass" :data-dropdown-id="dropdownId">
    <button
      type="button"
      :disabled="disabled"
      class="inline-flex w-full items-center gap-x-2 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
      @click="toggle"
    >
      <component :is="icon" v-if="icon" class="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
      <span class="flex-1 truncate text-left">{{ selectedLabel }}</span>
      <ChevronDown class="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 z-50 mt-2 w-full min-w-max origin-top-left rounded-md border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg"
      style="top: 100%;"
      @click.stop
    >
      <div class="py-1">
        <div class="border-b border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {{ header }}
        </div>

        <button
          v-if="allLabel"
          type="button"
          class="flex w-full items-center px-4 py-2 text-left text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          :class="{ 'text-[var(--color-text)]': !modelValue }"
          @click="select({ value: '', label: allLabel })"
        >
          {{ allLabel }}
          <Check v-if="!modelValue" class="ml-auto h-4 w-4 shrink-0 text-[var(--color-accent)]" />
        </button>

        <Tooltip
          v-for="option in options"
          :key="option.value"
          :content="option.tooltip ?? ''"
          :disabled="!option.tooltip"
          :position="option.tooltipPosition ?? 'right'"
          max-width="18rem"
        >
          <button
            type="button"
            :disabled="option.disabled"
            class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
            :class="{ 'text-[var(--color-text)]': modelValue === option.value }"
            @click="select(option)"
          >
            <span class="truncate">{{ option.label }}</span>
            <span v-if="option.hint" class="text-xs text-[var(--color-muted)]">{{ option.hint }}</span>
            <Check v-if="modelValue === option.value" class="ml-auto h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          </button>
        </Tooltip>

        <div v-if="options.length === 0" class="px-4 py-3 text-center text-sm text-[var(--color-muted)]">
          Nothing available
        </div>
      </div>
    </div>
  </div>
</template>
