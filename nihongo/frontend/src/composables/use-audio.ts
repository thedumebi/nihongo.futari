/**
 * One audio element for the whole app, unlocked on the first tap.
 *
 * iOS will not play audio from an element it has never seen a user gesture
 * against. A `new Audio(src)` constructed inside a click handler is fine, but
 * one constructed anywhere else — on mount, after an `await`, in a timer — is
 * silently refused: `play()` rejects with NotAllowedError and nothing sounds.
 * Desktop browsers are far more permissive, which is why this only ever showed
 * up on a phone.
 *
 * The way round it is to keep ONE element for the session, let the first user
 * gesture unlock it, and afterwards only ever change its `src`. An element that
 * has been unlocked stays unlocked, so the conversation can play a line when it
 * arrives rather than only when something is tapped.
 *
 * What this cannot fix: the iPhone's physical silent switch. HTML audio obeys
 * it, so a muted phone plays nothing and reports no error. Only the Web Audio
 * API can override that, which is a much bigger hammer than this needs.
 */

let element: HTMLAudioElement | null = null
let unlocked = false

/**
 * Bumped by every new playback request. A queue that finds the token changed
 * underneath it knows something else took over and stops.
 */
let token = 0

/** The shared element, created on first use. */
function el(): HTMLAudioElement {
  if (!element) {
    element = new Audio()
    element.preload = 'auto'
  }
  return element
}

/**
 * Teach the element it is allowed to make noise.
 *
 * Playing an all-but-empty clip inside a real gesture is enough; iOS then
 * treats the element as user-approved for the rest of the page's life. The
 * silent WAV below is 44 bytes and is never heard.
 */
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

function unlock() {
  if (unlocked)
    return
  unlocked = true
  const audio = el()
  audio.src = SILENCE
  // Failure is fine and expected on browsers that need no unlocking at all.
  audio.play().then(() => audio.pause()).catch(() => {})
}

/**
 * Arm the unlock on the first interaction anywhere in the app.
 *
 * `once` so it costs nothing afterwards, and three event types because a tap
 * on iOS may surface as any of them depending on what was touched.
 */
export function armAudioUnlock(): void {
  if (typeof window === 'undefined')
    return
  for (const type of ['pointerdown', 'touchstart', 'keydown'] as const)
    window.addEventListener(type, unlock, { once: true, passive: true })
}

/** Play one clip, replacing whatever was playing. */
export function playAudio(src: string | null | undefined): void {
  if (!src)
    return
  // Supersede any queue in flight. Without this, tapping one line while the
  // conversation is playing would let the queue resume over the top of it: the
  // queue waits on `ended`, and the clip just started fires exactly that.
  token += 1
  const audio = el()
  audio.pause()
  audio.src = src
  // A missing clip must never break the page around it — but swallowing the
  // reason outright is how a Safari-only failure went unnoticed for so long,
  // so development gets told.
  audio.play().catch((err: unknown) => {
    if (import.meta.env.DEV)
      console.warn('[audio] play refused:', err)
  })
}

/**
 * Play several clips back to back.
 *
 * Returns when the run finishes or is superseded. Each clip waits for the one
 * before it; a clip that will not load is stepped over rather than stalling
 * the queue, and the whole run is abandoned if something else starts playing.
 */
export async function playAudioQueue(sources: Array<string | null | undefined>): Promise<void> {
  const audio = el()
  // Any newer call to playAudio/playAudioQueue changes this, which is how a
  // superseded run notices it should stop.
  const run = ++token

  for (const src of sources) {
    if (!src || run !== token)
      return

    audio.pause()
    audio.src = src
    try {
      await audio.play()
    } catch {
      continue
    }
    if (run !== token)
      return

    await new Promise<void>((resolve) => {
      // A STALL watchdog, not a time limit. A flat timeout would cut off any
      // clip longer than it — silently, mid-word — and "long" is a property of
      // the content, not something this should have an opinion about. Instead
      // the timer is re-armed on every `timeupdate`, so it only fires when a
      // clip has genuinely stopped making progress.
      let stall: ReturnType<typeof setTimeout>

      const done = () => {
        clearTimeout(stall)
        audio.removeEventListener('ended', done)
        audio.removeEventListener('error', done)
        audio.removeEventListener('timeupdate', arm)
        resolve()
      }

      function arm() {
        clearTimeout(stall)
        stall = setTimeout(done, 15_000)
      }

      // Removed explicitly rather than relying on `once`: this element is
      // shared, so a listener left behind by a superseded clip would fire on
      // some later clip's events.
      audio.addEventListener('ended', done)
      audio.addEventListener('error', done)
      audio.addEventListener('timeupdate', arm)
      arm()
    })
  }
}

/** Stop whatever is playing — for when a card unmounts. */
export function stopAudio(): void {
  token += 1
  element?.pause()
}
