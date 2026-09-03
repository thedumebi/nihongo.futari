import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { RangeRequestsPlugin } from 'workbox-range-requests'
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

// Drop the audio cache built by the worker that had no range support. Those
// entries are opaque and unsliceable, so they would break playback exactly as
// before; the cache refills with readable ones.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.delete('go-audio'))
})

// Audio, cached for offline — but only with a plugin that can answer a Range
// request.
//
// Safari asks for media with a `Range` header and expects a 206 with
// `Content-Range`. A plain CacheFirst answers from the Cache API with the whole
// file and a 200, which Safari rejects — silently, with the network panel
// showing success. That is what broke playback in Safari on macOS and iOS while
// Chrome was fine. `RangeRequestsPlugin` slices the cached body and builds the
// 206 the browser asked for.
//
// Slicing needs a body the worker can READ, so these responses must not be
// opaque: the element sets `crossOrigin="anonymous"` (see composables/use-audio)
// and the bucket's CORS policy allows the `Range` request header and exposes
// `Content-Range`. All three have to hold together — drop any one and playback
// fails quietly again.
//
// See https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video
registerRoute(
  ({ url }) => url.pathname.startsWith('/audio/'),
  new CacheFirst({
    cacheName: 'go-audio',
    plugins: [
      new RangeRequestsPlugin(),
      // 200 only. Status 0 would let an OPAQUE response into the cache, and an
      // opaque body cannot be sliced — which is the previous bug wearing a
      // different hat. With CORS in place these are readable, so an opaque
      // response now means something is wrong and should not be stored.
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        // Above the full corpus: 10,208 kana, word and sentence clips plus 927
        // conversation lines and replies.
        maxEntries: 12000,
        maxAgeSeconds: 90 * 24 * 60 * 60,
        purgeOnQuotaError: true
      })
    ]
  })
)

// Illustrations, on the same terms as the audio and for the same reason.
//
// They used to be precached: they lived in `public/` and the injectManifest
// glob swept up every SVG. They are served from the bucket now and excluded
// from the image, so precaching cannot reach them and a runtime cache is what
// keeps the scene art on a deck showing offline.
//
// Cheaper than the audio in every way — around 1 KB per drawing — so the cap is
// generous and the age long.
//
// The cap was 500 when there were 63 scene and conversation drawings. Per-word
// vocabulary art then took it past that on its own, and an entries cap below
// the size of the set does not bound anything useful: it evicts the drawing you
// are about to see to make room for the one you just saw. Sized here for the
// whole illustrated vocabulary with room to grow, which even at several
// thousand files is a few megabytes.
registerRoute(
  ({ url }) => url.pathname.startsWith('/images/'),
  new CacheFirst({
    cacheName: 'go-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 12000,
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

// Grammar lessons, on the same terms.
//
// Only `/study/` was cached, so the explanations were the one thing that
// vanished on a train — the half of the app that is pure reading, and the half
// most worth having offline. The example audio is already covered by the
// `/audio/` route above.
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.includes('/grammar'),
  new NetworkFirst({
    cacheName: 'go-grammar',
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
