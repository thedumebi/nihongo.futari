import { createReadStream } from 'node:fs'
import { SaxesParser } from 'saxes'

/**
 * KANJIDIC2 streaming parser.
 *
 * Gives readings, meanings, stroke counts, grade and frequency. Note it is NOT
 * an etymology source — the readings are factual, but nothing here explains
 * where a glyph came from. That belongs to the sourced "why" layer, separately.
 */

export interface KanjidicEntry {
  character: string
  codepoint?: number
  strokeCount?: number
  grade?: number
  jlpt?: number
  frequency?: number
  meanings: string[]
  onReadings: string[]
  kunReadings: string[]
  nanori: string[]
  radicalNumber?: number
}

export async function parseKanjidic2(
  filePath: string,
  onEntry: (entry: KanjidicEntry) => void
): Promise<number> {
  const parser = new SaxesParser({ fragment: false })

  let count = 0
  let entry: KanjidicEntry | null = null
  let text = ''
  let readingType = ''
  let meaningLang = 'en'
  let inRmgroup = false
  let cpType = ''
  let radType = ''

  parser.on('opentag', (node) => {
    text = ''
    if (node.name === 'character') {
      entry = { character: '', meanings: [], onReadings: [], kunReadings: [], nanori: [] }
    } else if (node.name === 'rmgroup') {
      inRmgroup = true
    } else if (node.name === 'reading') {
      readingType = String(node.attributes.r_type ?? '')
    } else if (node.name === 'meaning') {
      meaningLang = String(node.attributes.m_lang ?? 'en')
    } else if (node.name === 'cp_value') {
      cpType = String(node.attributes.cp_type ?? '')
    } else if (node.name === 'rad_value') {
      radType = String(node.attributes.rad_type ?? '')
    }
  })

  parser.on('text', (t) => {
    text += t
  })

  parser.on('closetag', (node) => {
    const value = text.trim()
    text = ''
    if (!entry)
      return

    switch (node.name) {
      case 'literal':
        entry.character = value
        break
      case 'cp_value':
        if (cpType === 'ucs')
          entry.codepoint = Number.parseInt(value, 16)
        break
      case 'stroke_count':
        // The first stroke_count is the accepted one; later ones are variants.
        if (entry.strokeCount === undefined)
          entry.strokeCount = Number(value)
        break
      case 'grade':
        entry.grade = Number(value)
        break
      case 'jlpt':
        entry.jlpt = Number(value)
        break
      case 'freq':
        entry.frequency = Number(value)
        break
      case 'rad_value':
        if (radType === 'classical')
          entry.radicalNumber = Number(value)
        break
      case 'reading':
        if (!inRmgroup)
          break
        if (readingType === 'ja_on')
          entry.onReadings.push(value)
        else if (readingType === 'ja_kun')
          entry.kunReadings.push(value)
        break
      case 'meaning':
        // English only; the file also carries fr, es and pt.
        if (inRmgroup && meaningLang === 'en' && value)
          entry.meanings.push(value)
        meaningLang = 'en'
        break
      case 'nanori':
        entry.nanori.push(value)
        break
      case 'rmgroup':
        inRmgroup = false
        break
      case 'character':
        if (entry.character) {
          onEntry(entry)
          count++
        }
        entry = null
        break
    }
  })

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'utf8' })
    parser.on('error', reject)
    stream.on('data', (chunk) => {
      try {
        parser.write(chunk as string)
      } catch (err) {
        reject(err)
      }
    })
    stream.on('error', reject)
    stream.on('end', () => {
      // A strict close can trip on trailing DTD content; the entries are out.
      try {
        parser.close()
      } catch {
        // ignore
      }
      resolve()
    })
  })

  return count
}
