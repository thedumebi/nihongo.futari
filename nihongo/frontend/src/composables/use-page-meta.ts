import { onBeforeUnmount } from 'vue'

// Lightweight document <head> manager (no SSR). Sets the title + Open Graph /
// Twitter meta tags for the current page and restores them on unmount.
//
// NOTE: social scrapers (LinkedIn, X, Facebook) do NOT run JavaScript, so these
// client-set tags only benefit in-app navigation and JS-aware consumers. Rich
// link previews for shared article URLs require the tags to be present in the
// server-rendered HTML — see the OG bot route (backend/src/routes/og).

export interface PageMeta {
  title?: string
  description?: string | null
  image?: string | null
  url?: string
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta(get: () => PageMeta) {
  const originalTitle = typeof document !== 'undefined' ? document.title : ''

  function apply() {
    if (typeof document === 'undefined')
      return
    const m = get()
    if (m.title)
      document.title = m.title
    if (m.title) {
      setMeta('property', 'og:title', m.title)
      setMeta('name', 'twitter:title', m.title)
    }
    if (m.description) {
      setMeta('name', 'description', m.description)
      setMeta('property', 'og:description', m.description)
      setMeta('name', 'twitter:description', m.description)
    }
    if (m.image) {
      setMeta('property', 'og:image', m.image)
      setMeta('name', 'twitter:image', m.image)
      setMeta('name', 'twitter:card', 'summary_large_image')
    }
    if (m.url)
      setMeta('property', 'og:url', m.url)
    setMeta('property', 'og:type', 'article')
  }

  onBeforeUnmount(() => {
    if (typeof document !== 'undefined')
      document.title = originalTitle
  })

  return { apply }
}
