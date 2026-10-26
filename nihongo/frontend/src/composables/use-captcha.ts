import { computed, ref } from 'vue'

/** The header the server's email-send guard reads the Turnstile token from. */
export const CAPTCHA_HEADER = 'x-captcha-response'

/**
 * The Turnstile token a form holds, and how to spend it.
 *
 * `siteKey` null means the server does not check, so there is no widget and
 * nothing to wait for. Otherwise a send waits for a token, carries it in a
 * header, and then asks the widget for a new one, because Cloudflare accepts
 * each token once.
 */
export function useCaptcha() {
  const siteKey = ref<string | null>(null)
  const token = ref<string | null>(null)
  const widget = ref<{ reset: () => void } | null>(null)

  /** True when a send can go now: no check configured, or a token in hand. */
  const ready = computed(() => !siteKey.value || Boolean(token.value))

  /** better-auth's `fetchOptions`, carrying the token when there is one. */
  function fetchOptions() {
    return token.value ? { headers: { [CAPTCHA_HEADER]: token.value } } : {}
  }

  /** The token has gone with a request; fetch the next. */
  function spent() {
    token.value = null
    widget.value?.reset()
  }

  return { siteKey, token, widget, ready, fetchOptions, spent }
}
