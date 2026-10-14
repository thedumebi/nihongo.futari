import { registerSW } from 'virtual:pwa-register'

/** How often an open app asks whether a new version has been deployed. */
const CHECK_EVERY_MS = 10 * 60 * 1000

/**
 * Register the service worker, and keep asking for new versions.
 *
 * The browser only checks for a new service worker when a page loads — and an
 * installed app on a phone is rarely loaded fresh: it is resumed from memory,
 * so a deploy could go unnoticed for a day. So the app also checks every ten
 * minutes and whenever it comes back to the foreground.
 *
 * `registerType: 'prompt'` rather than auto-update: the caller decides WHEN
 * to swap, so it can wait for a moment that drops nothing (see app.vue).
 */
export function setupServiceWorker(onNeedRefresh: () => void): (reload?: boolean) => Promise<void> {
  return registerSW({
    immediate: true,
    onNeedRefresh,
    onRegisteredSW(_url, registration) {
      if (!registration)
        return
      const check = () => {
        if (navigator.onLine)
          void registration.update().catch(() => {})
      }
      setInterval(check, CHECK_EVERY_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible')
          check()
      })
    },
    onOfflineReady() {
      // Nothing to say — the app simply keeps working.
    }
  })
}
