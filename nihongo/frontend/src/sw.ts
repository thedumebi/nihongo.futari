import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

/**
 * Service worker.
 *
 * `injectManifest` rather than `generateSW` because this file needs custom
 * logic — audio caching now, push handling shortly.
 *
 * Deliberately NOT here: the outbound answer queue. That lives in the page
 * (see offline/sync.ts) because Background Sync does not exist in Safari, so a
 * worker-based queue would silently never fire on iPhone.
 */

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Drop the audio cache this worker used to keep. Anyone who visited before is
// carrying up to 12,000 clips that nothing will ever read again, and on a
// phone that is most of the app's storage budget.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.delete('go-audio'))
})

// Audio is deliberately NOT cached by this service worker.
//
// It used to be, with CacheFirst — and that broke playback in Safari on both
// macOS and iOS while working fine in Chrome. Safari asks for media with a
// `Range` header and expects a 206 with `Content-Range`. A plain CacheFirst
// answers from the cache with the whole file and a 200, which Safari rejects.
// It fails silently: no console error, and the network panel shows the request
// succeeding, because as far as the page is concerned it did.
//
// Workbox's answer is `workbox-range-requests`, but it can only slice a
// response it can read, so it needs `crossOrigin="anonymous"` on the element
// and a bucket that answers the resulting CORS preflight. The bucket currently
// returns 403 to `OPTIONS`, so wiring the plugin without also widening the R2
// CORS policy would swap one silent failure for another.
//
// So: audio goes straight to the bucket. Those objects are served
// `immutable` with a one-year max-age, so the browser's own HTTP cache still
// spares the network on every replay. What is lost is audio while OFFLINE —
// see BACKLOG. Text, grading and scheduling are unaffected and still work
// offline, which is the part that matters most on a train.
//
// See: https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video

// Illustrations, on the same terms as the audio and for the same reason.
//
// They used to be precached: they lived in `public/` and the injectManifest
// glob swept up every SVG. They are served from the bucket now and excluded
// from the image, so precaching cannot reach them and a runtime cache is what
// keeps the scene art on a deck showing offline.
//
// Cheaper than the audio in every way — 63 files, 252 KB — so the cap is small
// and the age generous.
registerRoute(
  ({ url }) => url.pathname.startsWith('/images/'),
  new CacheFirst({
    cacheName: 'go-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 180 * 24 * 60 * 60,
        purgeOnQuotaError: true
      })
    ]
  })
)

// The review queue: serve fresh when possible, fall back to the last response
// when offline. Mutating calls are never cached — the app queues those itself.
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.includes('/study/'),
  new NetworkFirst({
    cacheName: 'go-study',
    networkTimeoutSeconds: 4,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })]
  })
)

interface PushPayload {
  title?: string
  body?: string
  url?: string
}

self.addEventListener('push', (event) => {
  // A push with no readable payload still deserves a notification: on some
  // platforms a silent push burns the user's permission grant.
  let payload: PushPayload = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    payload = {}
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Time to study', {
      body: payload.body ?? 'You have cards waiting.',
      icon: '/logo192.png',
      badge: '/logo192.png',
      // Same tag = a new reminder replaces the old one rather than stacking
      // three days of unread nudges.
      tag: 'go-reminder',
      data: { url: payload.url ?? '/study' }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data?.url as string | undefined) ?? '/study'

  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    // Focus an existing tab rather than opening a duplicate.
    for (const client of clients) {
      if ('focus' in client) {
        await client.focus()
        if ('navigate' in client)
          await client.navigate(target)
        return
      }
    }
    await self.clients.openWindow(target)
  })())
})

// Let the page trigger an immediate activation after an update.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING')
    void self.skipWaiting()
})

self.addEventListener('activate', () => {
  void self.clients.claim()
})
