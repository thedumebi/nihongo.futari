import { registerSW } from 'virtual:pwa-register'

/**
 * Register the service worker.
 *
 * `registerType: 'prompt'` rather than auto-update: silently swapping the app
 * out from under someone mid-session would drop the card they are answering.
 * The callback lets the UI offer a reload instead.
 */
export function setupServiceWorker(onNeedRefresh: () => void): (reload?: boolean) => Promise<void> {
  return registerSW({
    immediate: true,
    onNeedRefresh,
    onOfflineReady() {
      // Nothing to say — the app simply keeps working.
    }
  })
}
