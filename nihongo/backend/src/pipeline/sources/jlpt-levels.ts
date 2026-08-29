import { readFile } from 'node:fs/promises'

/**
 * The JLPT level index.
 *
 * A list of which words sit at which level is a FACT about the exam syllabus,
 * not authored prose, so using it is uncontroversial. We deliberately take
 * nothing else from this source — the glosses, parts of speech and senses all
 * come from JMdict.
 */
export interface JlptEntry {
  expression: string
  reading: string
}

/** Minimal CSV reader: the file is well-formed and only quotes the gloss column. */
function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

export async function loadJlptLevel(filePath: string): Promise<JlptEntry[]> {
  const text = await readFile(filePath, 'utf8')
  const lines = text.split('\n').filter(Boolean)
  const header = parseCsvLine(lines[0]!)
  const iExpr = header.indexOf('expression')
  const iRead = header.indexOf('reading')

  const seen = new Set<string>()
  const entries: JlptEntry[] = []
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line)
    const expression = cols[iExpr]?.trim()
    const reading = cols[iRead]?.trim()
    if (!expression || !reading)
      continue
    const key = `${expression}|${reading}`
    if (seen.has(key))
      continue
    seen.add(key)
    entries.push({ expression, reading })
  }
  return entries
}
