import { describe, expect, it } from 'vitest'

import { countryFlag, countryLabel, countryName } from './countries.js'

describe('countryFlag', () => {
  it('maps a code to its regional-indicator flag', () => {
    // 'NG' -> U+1F1F3 U+1F1EC. The arithmetic is easy to get off by one.
    expect(countryFlag('NG')).toBe('🇳🇬')
    expect(countryFlag('GB')).toBe('🇬🇧')
  })

  it('is case-insensitive', () => {
    expect(countryFlag('ng')).toBe(countryFlag('NG'))
  })

  it('falls back to a globe for null or malformed codes', () => {
    expect(countryFlag(null)).toBe('🌍')
    expect(countryFlag(undefined)).toBe('🌍')
    expect(countryFlag('')).toBe('🌍')
    expect(countryFlag('X')).toBe('🌍')
    expect(countryFlag('123')).toBe('🌍')
    expect(countryFlag('NGA')).toBe('🌍')
  })
})

describe('countryName', () => {
  it('resolves a code to a full name', () => {
    expect(countryName('NG')).toBe('Nigeria')
  })

  it('is case-insensitive', () => {
    expect(countryName('ng')).toBe('Nigeria')
  })

  it('reads null as Unknown — an unresolved IP, not a country', () => {
    expect(countryName(null)).toBe('Unknown')
    expect(countryName(undefined)).toBe('Unknown')
  })

  it('resolves the reserved unknown-region code', () => {
    // 'ZZ' is the standard "unknown region" code — Intl names it rather than
    // failing, so this documents what an odd-but-valid code actually renders as.
    expect(countryName('ZZ')).toBe('Unknown Region')
  })

  it('falls back to the uppercased code for a structurally invalid one', () => {
    // Intl throws RangeError here rather than returning undefined.
    expect(countryName('1')).toBe('1')
    expect(countryName('abcd')).toBe('ABCD')
  })

  it('keeps working after an invalid code — the cache must not be poisoned', () => {
    // A per-code RangeError must not disable the shared Intl.DisplayNames
    // instance for every later lookup.
    expect(countryName('abcd')).toBe('ABCD')
    expect(countryName('NG')).toBe('Nigeria')
  })
})

describe('countryLabel', () => {
  it('combines flag and name', () => {
    expect(countryLabel('NG')).toBe('🇳🇬 Nigeria')
  })

  it('labels an unresolved country', () => {
    expect(countryLabel(null)).toBe('🌍 Unknown')
  })
})
