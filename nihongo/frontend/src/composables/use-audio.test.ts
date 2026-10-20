import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** Every src the element was asked to play, in order. */
let played: string[] = []

/** An audio element that "plays" each clip and ends it on the next tick. */
class FakeAudio extends EventTarget {
  src = ''
  paused = true
  preload = ''
  crossOrigin: string | null = null
  currentTime = 0
  play() {
    played.push(this.src)
    this.paused = false
    setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
    return Promise.resolve()
  }

  pause() {
    this.paused = true
  }
}

/** Downloads that finish only when told to. */
const downloads = new Map<string, (ok: boolean) => void>()

function fakeFetch(url: string) {
  return new Promise<Response>((resolve, reject) => {
    downloads.set(url, ok => ok
      ? resolve(new Response(new Uint8Array([1, 2, 3]), { status: 200 }))
      : reject(new TypeError('offline')))
  })
}

async function load() {
  vi.resetModules()
  return import('./use-audio')
}

/** Let queued clips play until `count` have started. */
async function until(count: number) {
  for (let i = 0; i < 200 && played.length < count; i++)
    await new Promise(resolve => setTimeout(resolve, 0))
}

describe('hands-free queue on a locked phone', () => {
  beforeEach(() => {
    played = []
    downloads.clear()
    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal('fetch', vi.fn(fakeFetch))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('plays silence until a clip still downloading arrives, then the clip', async () => {
    const { playAudioQueue } = await load()
    const done = playAudioQueue(['/audio/new.m4a'], { silentPauses: true })
    await until(3)
    expect(played).toEqual(['/silence-1s.m4a', '/silence-1s.m4a', '/silence-1s.m4a'])
    downloads.get('/audio/new.m4a')!(true)
    await done
    expect(played.at(-1)).toBe('/audio/new.m4a')
    expect(played.filter(p => p === '/audio/new.m4a')).toHaveLength(1)
  })

  it('plays a clip already fetched straight away, with no silence first', async () => {
    const { playAudioQueue, prefetchAudio } = await load()
    const ready = prefetchAudio(['/audio/known.m4a'])
    downloads.get('/audio/known.m4a')!(true)
    await ready
    await playAudioQueue(['/audio/known.m4a'], { silentPauses: true })
    expect(played).toEqual(['/audio/known.m4a'])
  })

  it('still tries a clip whose download failed, rather than dropping it', async () => {
    const { playAudioQueue } = await load()
    const done = playAudioQueue(['/audio/gone.m4a'], { silentPauses: true })
    await until(1)
    downloads.get('/audio/gone.m4a')!(false)
    await done
    expect(played.at(-1)).toBe('/audio/gone.m4a')
  })

  it('does not wait on screen, where a queue plays clips as before', async () => {
    const { playAudioQueue } = await load()
    const done = playAudioQueue(['/audio/new.m4a'])
    await done
    expect(played).toEqual(['/audio/new.m4a'])
  })
})
