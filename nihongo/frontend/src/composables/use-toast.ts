import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning'

interface ToastState {
  show: boolean
  message: string
  type: ToastType
  duration: number
}

const toast = ref<ToastState>({
  show: false,
  message: '',
  type: 'success',
  duration: 4000
})

export function useToast() {
  function showToast(message: string, type: ToastType = 'success', duration = 4000) {
    toast.value = { show: true, message, type, duration }
  }

  function success(message: string, duration = 3000) {
    showToast(message, 'success', duration)
  }

  function error(message: string, duration = 5000) {
    showToast(message, 'error', duration)
  }

  function warning(message: string, duration = 4000) {
    showToast(message, 'warning', duration)
  }

  function hideToast() {
    toast.value = { ...toast.value, show: false }
  }

  return { toast, showToast, success, error, warning, hideToast }
}
