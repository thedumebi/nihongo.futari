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

// Audio is immutable once generated and is the bulk of what makes a session
// work offline. Cache-first, capped so a long study history can't grow without
// bound.
//
// The match is on PATHNAME, with no origin test, which is deliberate: the
// bucket is the only source now, in development as in production, and its
// paths are the same ones the database stores.
//
// Status 0 is accepted so an opaque cross-origin response still caches, but
// the bucket sends CORS, so responses are readable and ExpirationPlugin can
// measure them against the quota below.
registerRoute(
  ({ url }) => url.pathname.startsWith('/audio/'),
  new CacheFirst({
    cacheName: 'go-audio',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        // Above the full corpus: every published kana, word and sentence is
        // 10,208 clips, plus 927 conversation lines and replies. The old 3,200
        // was set when only the N5 set existed and would have started evicting
        // the moment the rest was generated — silently, and worst for the
        // heaviest user.
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
