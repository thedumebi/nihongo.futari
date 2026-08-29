import type { EnrichmentDraft, GroundingPacket, ValidationResult } from '../../types/enrichment.js'

/**
 * Mechanical checks on a generated etymology draft.
 *
 * The premise of the why-layer is that an explanation is only worth reading if
 * it is sourced. A reviewer cannot verify that by reading prose — a fabricated
 * citation reads exactly like a real one. So the checks here are the load-
 * bearing part, and they are deliberately mechanical:
 *
 *  1. Every cited source id must be one that was PUT IN the packet. The model
 *     cannot cite a work it was never shown.
 *  2. Every quote must appear VERBATIM in the passage that came with that
 *     source. A quote the model composed itself cannot survive a substring
 *     check against text it did not write.
 *  3. A published-worthy claim needs at least one supporting source.
 *  4. `confidence: unknown` means the packet did not cover the question. Those
 *     are dropped, never queued — shipping a kanji with no etymology is fine;
 *     shipping one with an invented etymology is not.
 *
 * None of this makes the CLAIM true. It makes the CITATION checkable, which is
 * the difference between a reviewer verifying and a reviewer trusting.
 */

/** Collapse whitespace so a re-wrapped quote still matches its source text. */
function normalise(text: string): string {
  return text.replace(/\s+/gu, ' ').trim()
}

export function validateDraft(draft: EnrichmentDraft, packet: GroundingPacket): ValidationResult {
  const failures: string[] = []
  const allowedSourceIds = new Set(packet.sources.map(s => s.sourceId))

  // ALL passages per source id, not one. A source can legitimately supply more
  // than one passage (Wiktionary gives a separate etymology per part of
  // speech), and a plain Map would keep only the last — rejecting a genuine
  // quote from the first as if it were fabricated.
  const passagesBySource = new Map<string, string[]>()
  for (const source of packet.sources) {
    const list = passagesBySource.get(source.sourceId) ?? []
    list.push(normalise(source.passage))
    passagesBySource.set(source.sourceId, list)
  }

  // 4 — an honest "the sources do not cover this" is a success, not a failure.
  if (draft.confidence === 'unknown') {
    return {
      ok: false,
      dropped: true,
      reason: 'model reported the packet does not support a claim',
      failures: [],
      checkedQuotes: 0
    }
  }

  if (draft.citations.length === 0) {
    failures.push('no citations')
  }

  let checkedQuotes = 0

  for (const [index, citation] of draft.citations.entries()) {
    // 1 — no citing a source that was never shown.
    if (!allowedSourceIds.has(citation.sourceId)) {
      failures.push(`citation ${index}: sourceId "${citation.sourceId}" was not in the packet`)
      continue
    }

    // 2 — the quote must be lifted, not composed.
    const passages = passagesBySource.get(citation.sourceId) ?? []
    const quote = normalise(citation.quote)
    if (quote.length === 0) {
      failures.push(`citation ${index}: empty quote`)
      continue
    }
    checkedQuotes++
    if (!passages.some(passage => passage.includes(quote))) {
      failures.push(`citation ${index}: quote is not a substring of the ${citation.sourceId} passage`)
    }
  }

  // 3 — at least one citation that actually supports the claim.
  const supporting = draft.citations.filter(c => c.supports === 'supports')
  if (supporting.length === 0 && draft.citations.length > 0) {
    failures.push('no citation marked as supporting')
  }

  if (!draft.claim.trim())
    failures.push('empty claim')
  if (!draft.body.trim())
    failures.push('empty body')

  // Numbers must come from the passage, not from the model.
  //
  // A verbatim quote proves the CITATION is real; it does not prove the CLAIM
  // follows from it. Prose can cite correctly and still assert more than the
  // source says. Most of that over-reach needs a human to catch — but the
  // numeric case does not, and it is the dangerous one: "80% of members follow"
  // when the passage says 5 of 5 is wrong in a way that does not look wrong.
  const allPassages = packet.sources.map(src => src.passage).join(' ')
  const stated = new Set(allPassages.match(/\d+/gu) ?? [])
  const asserted = new Set(`${draft.claim} ${draft.body}`.match(/\d+/gu) ?? [])
  for (const value of asserted) {
    if (!stated.has(value))
      failures.push(`claims the number "${value}", which no passage states`)
  }

  return {
    ok: failures.length === 0,
    dropped: false,
    reason: failures.length === 0 ? null : failures[0]!,
    failures,
    checkedQuotes
  }
}
