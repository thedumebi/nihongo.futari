import { createHash } from 'node:crypto'

/**
 * Words the voices read wrongly when given the written form, and how to spell
 * them for the voice instead. Used only for what `say` is handed: the clip is
 * still named for, and matched against, the text as it is written.
 *
 * Found by ear and confirmed by bytes: Otoya reads 明日行きます exactly as
 * あす行きます (the two recordings are identical), so a learner heard "asu
 * iki…" where the word card teaches あした. あした is the everyday reading and
 * the one taught; あす is formal.
 */
export const SPOKEN_AS: Readonly<Record<string, string>> = {
  明日: 'あした'
}

/** The text as the voice should be given it. */
export function spokenText(text: string): string {
  let out = text
  for (const [written, spoken] of Object.entries(SPOKEN_AS))
    out = out.replaceAll(written, spoken)
  return out
}

/**
 * A version mark for the address of a clip recorded from a respelling, so a
 * device that cached the old (misread) recording fetches the new one. Clips
 * are cached as immutable and keep their names, so without this a phone that
 * once played "asu" would go on playing it. Empty for every other clip.
 */
export function respelledVersion(text: string): string {
  const spoken = spokenText(text)
  return spoken === text ? '' : `?v=${createHash('sha1').update(spoken).digest('hex').slice(0, 8)}`
}
