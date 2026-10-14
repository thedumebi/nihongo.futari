import { describe, expect, it } from 'vitest'

import { framePitch, pitchTrack, relativePitch, smoothPitch } from './index.js'

const RATE = 16_000

function tone(hz: number, seconds: number, amplitude = 0.5): Float32Array {
  const out = new Float32Array(Math.round(RATE * seconds))
  for (let i = 0; i < out.length; i++)
    out[i] = amplitude * Math.sin(2 * Math.PI * hz * i / RATE)
  return out
}

/** A voice-like tone: a fundamental with two weaker harmonics. */
function voiced(hz: number, seconds: number): Float32Array {
  const out = new Float32Array(Math.round(RATE * seconds))
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE
    out[i] = 0.5 * Math.sin(2 * Math.PI * hz * t) + 0.25 * Math.sin(4 * Math.PI * hz * t) + 0.1 * Math.sin(6 * Math.PI * hz * t)
  }
  return out
}

describe('framePitch', () => {
  it('finds the frequency of a pure tone within a hertz', () => {
    expect(framePitch(tone(220, 0.04), RATE)).toBeCloseTo(220, 0)
    expect(framePitch(tone(140, 0.04), RATE)).toBeCloseTo(140, 0)
  })

  it('finds the fundamental of a tone with harmonics, not an octave off', () => {
    expect(framePitch(voiced(180, 0.04), RATE)).toBeCloseTo(180, 0)
  })

  it('calls silence and noise unvoiced', () => {
    expect(framePitch(new Float32Array(640), RATE)).toBeNull()
    let seed = 1
    const noise = new Float32Array(640).map(() => {
      seed = (seed * 16807) % 2147483647
      return (seed / 2147483647 - 0.5)
    })
    expect(framePitch(noise, RATE)).toBeNull()
  })
})

describe('pitchTrack', () => {
  it('follows a step from low to high', () => {
    const clip = new Float32Array([...tone(150, 0.2), ...tone(250, 0.2)])
    const track = pitchTrack(clip, RATE)
    expect(track[2]).toBeCloseTo(150, 0)
    expect(track.at(-2)).toBeCloseTo(250, 0)
  })
})

describe('relativePitch', () => {
  it('trims silence at both ends and measures in semitones from the median', () => {
    expect(relativePitch([null, 100, 200, 200, null])).toEqual([-12, 0, 0])
  })

  it('makes the same melody an octave apart identical', () => {
    expect(relativePitch([110, 220, 165])).toEqual(relativePitch([220, 440, 330]))
  })

  it('returns nothing for a silent track', () => {
    expect(relativePitch([null, null])).toEqual([])
  })
})

describe('smoothPitch', () => {
  it('drops a lone octave jump and keeps the line around it', () => {
    expect(smoothPitch([0, 1, 13, 1, 0])).toEqual([0, 1, null, 1, 0])
  })

  it('keeps a frame that has one close neighbour', () => {
    expect(smoothPitch([0, 1, 12, 12.5, 1, 0])).toEqual([0, 1, 12, 12.5, 1, 0])
  })
})
