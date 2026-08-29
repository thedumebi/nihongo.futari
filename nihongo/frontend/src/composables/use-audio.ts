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
 * The iPhone's silent switch is NOT a factor here, contrary to the obvious
 * guess: HTML media elements play through it. It is the Web Audio API that the
 * switch mutes — which is one reason this stays on a plain audio element.
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
 * A real file, not a `data:` URI.
 *
 * Mobile Safari's support for data URIs as a media source has always been
 * patchy, and a silent failure here is invisible: the element simply stays
 * locked and every later play is refused.
 */
const SILENCE = '/silence.wav'

/**
 * Teach the element it is allowed to make noise.
 *
 * Playing an inaudible clip inside a real gesture is enough; the browser then
 * treats the element as user-approved for the rest of the page's life.
 *
 * `unlocked` is set only when the play actually RESOLVES. Latching it up front
 * looks harmless and is not: if the attempt is refused, the flag says the job
 * is done, the listeners have already been removed, and the element stays
 * locked for the whole session with nothing to retry it.
 */
function unlock() {
  if (unlocked)
    return
  const audio = el()
  audio.src = SILENCE
  audio.play()
    .then(() => {
      unlocked = true
      audio.pause()
      audio.currentTime = 0
    })
    // Refused. Leave the listeners armed so the next gesture tries again.
    .catch(() => arm())
}

/**
 * Events that actually confer user activation.
 *
 * This is the part that was wrong, and it broke iOS specifically. The spec
 * excludes `touchstart` and a `pointerdown` whose pointerType is touch —
 * deliberately, so that a swipe cannot bless anything. It includes `touchend`
 * and `pointerup`. On a Mac the old list worked, because a trackpad's
 * `pointerdown` IS a mouse event and does confer activation; on a phone the
 * same code could never unlock anything.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/Security/User_activation
 */
const ACTIVATION_EVENTS = ['pointerup', 'touchend', 'click', 'keydown'] as const

function arm() {
  if (typeof window === 'undefined')
    return
  for (const type of ACTIVATION_EVENTS)
    window.addEventListener(type, unlock, { once: true, passive: true })
}

/** Arm the unlock on the first real interaction anywhere in the app. */
export function armAudioUnlock(): void {
  arm()
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
    } catch (err: unknown) {
      // A refusal means the element is not allowed to play at all, so every
      // remaining clip would be refused too. Bail rather than spinning through
      // the whole conversation in a tight loop pretending to play it.
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        if (import.meta.env.DEV)
          console.warn('[audio] queue refused — element not unlocked:', err)
        return
      }
      // Anything else is this one clip's problem: step over it.
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
        audio.removeEventListener('timeupdate', resetStall)
        resolve()
      }

      // Named apart from the unlock's `arm` on purpose: two functions called
      // `arm` in one file, one shadowing the other inside this closure, is a
      // trap for whoever edits it next.
      function resetStall() {
        clearTimeout(stall)
        stall = setTimeout(done, 15_000)
      }

      // Removed explicitly rather than relying on `once`: this element is
      // shared, so a listener left behind by a superseded clip would fire on
      // some later clip's events.
      audio.addEventListener('ended', done)
      audio.addEventListener('error', done)
      audio.addEventListener('timeupdate', resetStall)
      resetStall()
    })
  }
}

/** Stop whatever is playing — for when a card unmounts. */
export function stopAudio(): void {
  token += 1
  element?.pause()
}
