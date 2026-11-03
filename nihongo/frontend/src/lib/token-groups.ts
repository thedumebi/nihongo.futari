/**
 * Tokens that must not be split across a line, as runs of token indices.
 *
 * Each tappable word is its own inline box, and a browser may break a line
 * between any two boxes, so a 。 or 」 could wrap onto a line by itself and a
 * 「 could be left hanging at the end of one. Japanese typesetting forbids
 * both. A closing mark rides with the token before it, an opening bracket with
 * the token after it, and the caller keeps each run on one line.
 */
const CLOSING = /^[、。，．,.！？!?」』）)〉》】〕］\]｝}…ー]/
const OPENING = /[「『（(〈《【〔［[｛{]$/

export function tokenGroups(texts: readonly string[]): number[][] {
  const groups: number[][] = []
  let joinNext = false
  texts.forEach((text, i) => {
    const last = groups.at(-1)
    if (last && (joinNext || CLOSING.test(text)))
      last.push(i)
    else
      groups.push([i])
    joinNext = OPENING.test(text)
  })
  return groups
}
