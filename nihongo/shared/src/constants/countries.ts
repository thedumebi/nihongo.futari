/**
 * Display helpers for the per-country view analytics.
 *
 * Views store an ISO 3166-1 alpha-2 country code (e.g. `NG`), or null when the
 * country couldn't be resolved. These turn a code into a human label and a flag
 * emoji for the admin breakdown. No data table to maintain: country NAMES come
 * from the runtime's Intl database, and flags are derived from the code itself.
 */

// A country code -> flag emoji, by mapping each ASCII letter to its Regional
// Indicator Symbol (U+1F1E6..). 'NG' -> 🇳🇬. Returns a globe for null/invalid.
export function countryFlag(code: string | null | undefined): string {
  if (!code || !/^[a-z]{2}$/i.test(code))
    return '🌍'
  const A = 0x1F1E6
  const up = code.toUpperCase()
  return String.fromCodePoint(A + (up.charCodeAt(0) - 65), A + (up.charCodeAt(1) - 65))
}

// Built once and reused — countryName is called per row in the analytics tables.
// `undefined` = not built yet, `null` = this runtime has no Intl.DisplayNames.
let regionNames: Intl.DisplayNames | null | undefined

function getRegionNames(): Intl.DisplayNames | null {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    } catch {
      // Only a CONSTRUCTION failure disables the cache. A malformed code making
      // .of() throw must not poison it for every later lookup.
      regionNames = null
    }
  }
  return regionNames
}

// A country code -> full name via Intl. Falls back to the raw code if the
// runtime can't resolve it, and to "Unknown" for null (unresolved IP / legacy).
export function countryName(code: string | null | undefined): string {
  if (!code)
    return 'Unknown'
  const upper = code.toUpperCase()
  try {
    return getRegionNames()?.of(upper) ?? upper
  } catch {
    // Structurally invalid code — Intl throws RangeError rather than returning.
    return upper
  }
}

// Convenience: "🇳🇬 Nigeria", or "🌍 Unknown" for null.
export function countryLabel(code: string | null | undefined): string {
  return `${countryFlag(code)} ${countryName(code)}`
}
