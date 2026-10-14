import { pitchTrack, relativePitch, smoothPitch } from '@nihongo/shared/lib'
import { onBeforeUnmount, ref } from 'vue'

/**
 * Record a short clip from the microphone, for shadowing.
 *
 * The clip stays on the phone as a blob URL — it is never uploaded. MP4 where
 * the browser offers it (Safari records nothing else), WebM otherwise.
 */

/** Rate the clips are analysed at: plenty for a voice, and keeps the tracker fast. */
const ANALYSIS_RATE = 16_000
/** A recording stops itself after this long, in case stop is never pressed. */
const MAX_RECORD_MS = 15_000

export function useRecorder() {
  const recording = ref(false)
  /** The last clip, as a blob URL, until the next recording replaces it. */
  const clip = ref<string | null>(null)
  const error = ref<string | null>(null)

  let recorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let stopTimer: ReturnType<typeof setTimeout> | undefined
  let done: ((url: string | null) => void) | null = null

  async function start(): Promise<boolean> {
    error.value = null
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch {
      error.value = 'The microphone is blocked. Allow it for this site in your browser settings.'
      return false
    }
    const mimeType = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported(t))
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    chunks = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0)
        chunks.push(e.data)
    }
    recorder.onstop = () => {
      for (const track of stream.getTracks())
        track.stop()
      if (clip.value)
        URL.revokeObjectURL(clip.value)
      clip.value = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder?.mimeType || mimeType })) : null
      recording.value = false
      done?.(clip.value)
      done = null
    }
    recorder.start()
    recording.value = true
    stopTimer = setTimeout(() => void stop(), MAX_RECORD_MS)
    return true
  }

  /** Stop, and resolve with the new clip's URL. */
  function stop(): Promise<string | null> {
    clearTimeout(stopTimer)
    if (!recorder || recorder.state === 'inactive')
      return Promise.resolve(clip.value)
    return new Promise((resolve) => {
      done = resolve
      recorder!.stop()
    })
  }

  onBeforeUnmount(() => {
    clearTimeout(stopTimer)
    if (recorder && recorder.state !== 'inactive')
      recorder.stop()
    if (clip.value)
      URL.revokeObjectURL(clip.value)
  })

  return { recording, clip, error, start, stop }
}

/**
 * A clip's melody, as semitones from its own centre, ready to draw.
 *
 * Decoded straight to 16 kHz mono by an offline audio context, which resamples
 * whatever the source rate was. Null when the clip cannot be fetched or decoded.
 */
export async function pitchCurve(url: string): Promise<Array<number | null> | null> {
  try {
    const bytes = await (await fetch(url)).arrayBuffer()
    // Length is a placeholder: decodeAudioData only needs the rate.
    const context = new OfflineAudioContext(1, ANALYSIS_RATE, ANALYSIS_RATE)
    const buffer = await context.decodeAudioData(bytes)
    return smoothPitch(relativePitch(pitchTrack(buffer.getChannelData(0), ANALYSIS_RATE)))
  } catch {
    return null
  }
}
