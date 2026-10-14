/**
 * Kanji as shapes: their parts, from an IDS expression (⿰彳寺 — 彳 left of
 * 寺), and which kanji look alike because they share them.
 */

/** Ideographic description characters, ⿰ through ⿻, spelled out. */
const IDS_OPERATORS = new Set(['⿰', '⿱', '⿲', '⿳', '⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺', '⿻'])
const isOperator = (ch: string) => IDS_OPERATORS.has(ch)
/** Operators that take three parts; the rest take two. */
const TERNARY = new Set(['⿲', '⿳'])

export interface KanjiShape {
  /** How the parts sit: ⿰ side by side, ⿱ stacked, ⿵ enclosed, … */
  layout: string
  parts: string[]
}

/**
 * A flat IDS expression as its layout and parts, or null when it nests
 * (⿱⿰AB C) or uses a part outside the basic plane — a part a font cannot
 * draw cannot be a tile to pick.
 */
export function parseIds(ids: string | null | undefined): KanjiShape | null {
  if (!ids)
    return null
  const chars = [...ids]
  const layout = chars[0]
  if (!layout || !isOperator(layout))
    return null
  const parts = chars.slice(1)
  const expected = TERNARY.has(layout) ? 3 : 2
  if (parts.length !== expected)
    return null
  if (parts.some(p => isOperator(p) || p.codePointAt(0)! > 0xFFFF))
    return null
  return { layout, parts }
}

export interface ShapeEntry {
  character: string
  shape: KanjiShape
}

export interface LookAlike {
  character: string
  confusable: string
  /** 0–1: how much of the shape is shared, weighted towards distinctive parts. */
  score: number
}

/**
 * Kanji that look alike: same layout, sharing a part. A part that turns up in
 * hundreds of kanji (亻, 口) says little on its own, so shared parts are
 * weighted by rarity, and each kanji keeps only its `perKanji` closest.
 * Symmetric: if 待 lists 持, 持 lists 待 when it has room.
 */
export function lookAlikes(entries: readonly ShapeEntry[], perKanji = 3, minScore = 0.3): LookAlike[] {
  const frequency = new Map<string, number>()
  for (const e of entries) {
    for (const p of new Set(e.shape.parts))
      frequency.set(p, (frequency.get(p) ?? 0) + 1)
  }
  const weight = (part: string) => 1 / Math.log2(1 + (frequency.get(part) ?? 1))

  const byPart = new Map<string, ShapeEntry[]>()
  for (const e of entries) {
    for (const p of new Set(e.shape.parts))
      byPart.set(p, [...(byPart.get(p) ?? []), e])
  }

  const out: LookAlike[] = []
  for (const e of entries) {
    const candidates = new Map<string, number>()
    for (const part of new Set(e.shape.parts)) {
      for (const other of byPart.get(part) ?? []) {
        if (other.character === e.character || other.shape.layout !== e.shape.layout)
          continue
        // Same part in the same slot looks more alike than the same part moved.
        const sameSlot = other.shape.parts.indexOf(part) === e.shape.parts.indexOf(part)
        candidates.set(other.character, (candidates.get(other.character) ?? 0) + weight(part) * (sameSlot ? 1 : 0.5))
      }
    }
    const total = e.shape.parts.reduce((sum, p) => sum + weight(p), 0)
    const ranked = [...candidates.entries()]
      .map(([character, shared]) => ({ character, score: Math.min(1, shared / total) }))
      .filter(c => c.score >= minScore)
      .sort((a, b) => b.score - a.score || a.character.localeCompare(b.character))
      .slice(0, perKanji)
    for (const c of ranked)
      out.push({ character: e.character, confusable: c.character, score: Math.round(c.score * 1000) / 1000 })
  }
  return out
}
