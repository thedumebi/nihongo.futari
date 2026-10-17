/**
 * Words granted past today's limit ("learn 5 more anyway"), added up for the
 * day and kept on this device under today's date: the study page sends it
 * with every request, and so does Today, so both count the same limit. It
 * used to be sent once and cleared, so the next refill counted the day afresh
 * and the wall came straight back. A new day has its own key, so it starts
 * from zero.
 */
const key = (languageCode: string) => `go-more-new:${languageCode}:${new Date().toLocaleDateString('en-CA')}`
/** Held in memory too, for a browser that refuses storage: it then lasts the visit. */
const here = new Map<string, number>()

export function readMoreNew(languageCode: string): number {
  const k = key(languageCode)
  try {
    return Number(localStorage.getItem(k) ?? here.get(k) ?? 0) || 0
  } catch {
    return here.get(k) ?? 0
  }
}

export function addMoreNew(languageCode: string, by: number): number {
  const k = key(languageCode)
  const next = readMoreNew(languageCode) + by
  here.set(k, next)
  try {
    localStorage.setItem(k, String(next))
  } catch {
    // Without storage it still holds for this visit.
  }
  return next
}
