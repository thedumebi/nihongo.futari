/**
 * Pitch tracking for shadowing: the shape of a voice's melody over a line.
 *
 * A learner records themselves after the speaker, and the two pitch curves are
 * drawn together. There is no score — a number would claim a precision this
 * does not have — but the eye sees at once whether the line rose where the
 * speaker's rose and fell where it fell, which is what Japanese pitch accent is.
 *
 * Plain autocorrelation over short frames, run on the phone. Good enough for a
 * single clean voice; nothing is uploaded.
 */

/** Lowest and highest voice pitch worth looking for, in Hz. */
export const PITCH_MIN_HZ = 70
export const PITCH_MAX_HZ = 500
/** Frames quieter than this (RMS) are silence: no pitch. */
const SILENCE_RMS = 0.01
/** A frame whose best lag correlates worse than this is unvoiced (s, sh, t). */
const VOICED_CORRELATION = 0.6

/** The pitch of one frame in Hz, or null when it is silent or unvoiced. */
export function framePitch(frame: Float32Array, sampleRate: number): number | null {
  const n = frame.length
  let energy = 0
  for (let i = 0; i < n; i++)
    energy += frame[i]! * frame[i]!
  if (Math.sqrt(energy / n) < SILENCE_RMS)
    return null

  const minLag = Math.floor(sampleRate / PITCH_MAX_HZ)
  const maxLag = Math.min(n - 1, Math.ceil(sampleRate / PITCH_MIN_HZ))
  const corr = new Float64Array(maxLag + 2)
  for (let lag = minLag; lag <= maxLag + 1 && lag < n; lag++) {
    let sum = 0
    let a = 0
    let b = 0
    for (let i = 0; i + lag < n; i++) {
      sum += frame[i]! * frame[i + lag]!
      a += frame[i]! * frame[i]!
      b += frame[i + lag]! * frame[i + lag]!
    }
    corr[lag] = a > 0 && b > 0 ? sum / Math.sqrt(a * b) : 0
  }

  // The first strong peak, not the global maximum — the global one is often
  // a multiple of the true period, an octave too low.
  let best = -1
  let bestLag = -1
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    const c = corr[lag]!
    if (c > corr[lag - 1]! && c >= corr[lag + 1]! && c > best) {
      best = c
      bestLag = lag
      if (c > 0.9)
        break
    }
  }
  if (bestLag < 0 || best < VOICED_CORRELATION)
    return null

  // Parabolic interpolation between neighbouring lags for a finer period.
  const y0 = corr[bestLag - 1]!
  const y1 = corr[bestLag]!
  const y2 = corr[bestLag + 1]!
  const denom = y0 - 2 * y1 + y2
  const shift = denom === 0 ? 0 : (y0 - y2) / (2 * denom)
  return sampleRate / (bestLag + shift)
}

/** The pitch every `hopMs` across a clip: Hz, or null where nobody is voicing. */
export function pitchTrack(samples: Float32Array, sampleRate: number, hopMs = 10, frameMs = 40): Array<number | null> {
  const hop = Math.max(1, Math.round(sampleRate * hopMs / 1000))
  const size = Math.round(sampleRate * frameMs / 1000)
  const out: Array<number | null> = []
  for (let start = 0; start + size <= samples.length; start += hop)
    out.push(framePitch(samples.subarray(start, start + size), sampleRate))
  return out
}

/**
 * A track as semitones from its own median, trimmed of the silence either end.
 *
 * A learner's voice and the speaker's can sit an octave apart; what has to
 * match is the movement, so each curve is measured against its own centre.
 * Leading and trailing silence goes too, so two clips line up where the
 * speaking starts rather than where the recording did.
 */
export function relativePitch(track: ReadonlyArray<number | null>): Array<number | null> {
  const first = track.findIndex(v => v !== null)
  if (first < 0)
    return []
  let last = track.length - 1
  while (track[last] === null)
    last--
  const trimmed = track.slice(first, last + 1)
  const voiced = trimmed.filter((v): v is number => v !== null).sort((a, b) => a - b)
  const median = voiced[Math.floor(voiced.length / 2)]!
  return trimmed.map(v => v === null ? null : 12 * Math.log2(v / median))
}

/**
 * Drop isolated octave jumps: a frame more than `maxJump` semitones from both
 * neighbours is a tracking error, not a voice, and becomes a gap.
 */
export function smoothPitch(track: ReadonlyArray<number | null>, maxJump = 7): Array<number | null> {
  return track.map((v, i) => {
    if (v === null)
      return null
    const prev = track[i - 1]
    const next = track[i + 1]
    const far = (n: number | null | undefined) => n === null || n === undefined || Math.abs(n - v) > maxJump
    return far(prev) && far(next) && (prev != null || next != null) ? null : v
  })
}
