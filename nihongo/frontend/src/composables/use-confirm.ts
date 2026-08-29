import { ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

const isVisible = ref(false)
const currentOptions = ref<ConfirmOptions>({ message: '' })
let resolvePromise: ((value: boolean) => void) | null = null

export function useConfirm() {
  function showConfirm(options: ConfirmOptions): Promise<boolean> {
    currentOptions.value = options
    isVisible.value = true
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleConfirm() {
    resolvePromise?.(true)
    resolvePromise = null
    isVisible.value = false
  }

  function handleCancel() {
    resolvePromise?.(false)
    resolvePromise = null
    isVisible.value = false
  }

  return { isVisible, currentOptions, showConfirm, handleConfirm, handleCancel }
}
