import { createReadStream } from 'node:fs'
import { SaxesParser } from 'saxes'

/**
 * JMdict streaming parser.
 *
 * Streamed, not DOM-parsed: the file is ~60 MB of XML and loading it whole
 * would be a needless several hundred MB of heap. The parser emits one entry at
 * a time and the caller decides what to keep.
 *
 * JMdict's shape is entry -> k_ele[] (kanji spellings) / r_ele[] (kana
 * readings) / sense[] (meanings), which is why it maps to four tables rather
 * than one.
 */

export interface JmdictSense {
  glosses: string[]
  pos: string[]
  misc: string[]
  fields: string[]
  dialect: string[]
  info?: string
  restrictedToForms: string[]
  crossRefs: string[]
  antonyms: string[]
  /** `lsource`: the loanword's origin. The factual spine for 外来語 etymology. */
  loanSources: Array<{ lang: string, text?: string, wasei: boolean, partial: boolean }>
}

export interface JmdictEntry {
  entSeq: number
  kanji: Array<{ form: string, tags: string[], common: boolean }>
  readings: Array<{ form: string, tags: string[], common: boolean, noKanji: boolean, restrictedTo: string[] }>
  senses: JmdictSense[]
}

/** JMdict marks frequency with tags like `ichi1`, `news1`, `spec1`, `gai1`. */
function isCommon(tags: string[]): boolean {
  return tags.some(t => /^(?:ichi|news|spec|gai)1$/.test(t))
}

/**
 * A frequency rank from JMdict's own priority tags.
 *
 * JMdict marks how common an entry is and the importer was throwing it away,
 * which left every one of the 8,240 words with a null `frequency_rank` — so
 * nothing could put vocabulary in a teaching order, and a beginner's first
 * cards were ああ and うろうろ.
 *
 * `nfXX` is the authoritative signal: the corpus is split into 500-word bands,
 * nf01 being the commonest 500. Converting the band to the middle of its range
 * gives a rank comparable with the kanji ranks already stored.
 *
 * The other tags are coarser and only used when no nf band is present:
 * ichi1 is the 10,000-word "common words" list, news1 the top half of a
 * newspaper frequency list, spec1 a manual addition of something common that
 * the corpora missed. Their ranks are deliberately placed after every nf band
 * so a measured word always outranks a merely flagged one.
 *
 * Returns undefined when nothing is tagged, which is the honest answer for the
 * long tail — those words are rare, and a made-up number would sort them
 * against measured ones as if it meant something.
 */
export function frequencyRank(tags: string[]): number | undefined {
  const band = tags
    .map(t => /^nf(\d{2})$/.exec(t)?.[1])
    .filter((v): v is string => Boolean(v))
    .map(Number)
    .sort((a, b) => a - b)[0]
  if (band !== undefined)
    return (band - 1) * 500 + 250

  // No measured band. Rank by the coarse lists, after every nf band (24,000).
  if (tags.includes('ichi1'))
    return 25_000
  if (tags.includes('news1'))
    return 26_000
  if (tags.includes('spec1'))
    return 27_000
  if (tags.includes('gai1'))
    return 28_000
  if (tags.some(t => /^(?:ichi|news|spec|gai)2$/.test(t)))
    return 30_000
  return undefined
}

/**
 * JMdict encodes its part-of-speech and misc tags as XML entities —
 * `<pos>&v5k;</pos>`. saxes does not process internal DTD subsets, so those
 * arrive as undefined entities and abort the parse.
 *
 * Rewriting `&v5k;` to the bare text `v5k` before saxes sees it solves both
 * problems at once: the parse succeeds, and the entity NAME is exactly the
 * short code we want to store (`v5k`, `adj-i`, `uk`) rather than the verbose
 * DTD expansion. The five XML built-ins are left alone so real escaping still
 * works.
 */
const BUILT_IN_ENTITIES = new Set(['amp', 'lt', 'gt', 'quot', 'apos'])
const ENTITY_RE = /&([A-Z][\w-]*);/gi

function unwrapEntities(chunk: string): string {
  return chunk.replace(ENTITY_RE, (match, name: string) =>
    BUILT_IN_ENTITIES.has(name) ? match : name)
}

export async function parseJmdict(
  filePath: string,
  onEntry: (entry: JmdictEntry) => void
): Promise<number> {
  const parser = new SaxesParser({ fragment: false })

  let count = 0
  let entry: JmdictEntry | null = null
  let sense: JmdictSense | null = null
  let kEle: JmdictEntry['kanji'][number] | null = null
  let rEle: JmdictEntry['readings'][number] | null = null
  let text = ''
  let currentLsource: { lang: string, text?: string, wasei: boolean, partial: boolean } | null = null

  const stack: string[] = []

  parser.on('opentag', (node) => {
    stack.push(node.name)
    text = ''
    if (node.name === 'entry') {
      entry = { entSeq: 0, kanji: [], readings: [], senses: [] }
    } else if (node.name === 'k_ele') {
      kEle = { form: '', tags: [], common: false }
    } else if (node.name === 'r_ele') {
      rEle = { form: '', tags: [], common: false, noKanji: false, restrictedTo: [] }
    } else if (node.name === 're_nokanji') {
      if (rEle)
        rEle.noKanji = true
    } else if (node.name === 'sense') {
      sense = {
        glosses: [],
        pos: [],
        misc: [],
        fields: [],
        dialect: [],
        restrictedToForms: [],
        crossRefs: [],
        antonyms: [],
        loanSources: []
      }
    } else if (node.name === 'lsource') {
      currentLsource = {
        lang: String(node.attributes['xml:lang'] ?? 'eng'),
        wasei: node.attributes.ls_wasei === 'y',
        partial: node.attributes.ls_type === 'part'
      }
    }
  })

  parser.on('text', (t) => {
    text += t
  })

  parser.on('closetag', (node) => {
    stack.pop()
    const value = text.trim()
    text = ''

    switch (node.name) {
      case 'ent_seq':
        if (entry)
          entry.entSeq = Number(value)
        break

      case 'keb':
        if (kEle)
          kEle.form = value
        break
      case 'ke_inf':
      case 'ke_pri':
        if (kEle)
          kEle.tags.push(value)
        break
      case 'k_ele':
        if (entry && kEle) {
          kEle.common = isCommon(kEle.tags)
          entry.kanji.push(kEle)
        }
        kEle = null
        break

      case 'reb':
        if (rEle)
          rEle.form = value
        break
      case 're_inf':
      case 're_pri':
        if (rEle)
          rEle.tags.push(value)
        break
      case 're_restr':
        if (rEle)
          rEle.restrictedTo.push(value)
        break
      case 'r_ele':
        if (entry && rEle) {
          rEle.common = isCommon(rEle.tags)
          entry.readings.push(rEle)
        }
        rEle = null
        break

      case 'gloss':
        if (sense && value)
          sense.glosses.push(value)
        break
      case 'pos':
        if (sense)
          sense.pos.push(value)
        break
      case 'misc':
        if (sense)
          sense.misc.push(value)
        break
      case 'field':
        if (sense)
          sense.fields.push(value)
        break
      case 'dial':
        if (sense)
          sense.dialect.push(value)
        break
      case 's_inf':
        if (sense)
          sense.info = value
        break
      case 'stagk':
      case 'stagr':
        if (sense)
          sense.restrictedToForms.push(value)
        break
      case 'xref':
        if (sense)
          sense.crossRefs.push(value)
        break
      case 'ant':
        if (sense)
          sense.antonyms.push(value)
        break
      case 'lsource':
        if (sense && currentLsource) {
          sense.loanSources.push({ ...currentLsource, ...(value ? { text: value } : {}) })
        }
        currentLsource = null
        break
      case 'sense':
        if (entry && sense)
          entry.senses.push(sense)
        sense = null
        break

      case 'entry':
        if (entry) {
          onEntry(entry)
          count++
        }
        entry = null
        break
    }
  })

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'utf8' })
    // An entity reference can straddle a chunk boundary, so hold back any
    // trailing `&…` that has no closing `;` yet and prepend it to the next chunk.
    let carry = ''
    parser.on('error', reject)
    stream.on('data', (chunk) => {
      try {
        const text_ = carry + (chunk as string)
        const lastAmp = text_.lastIndexOf('&')
        const split = lastAmp !== -1 && !text_.slice(lastAmp).includes(';')
        carry = split ? text_.slice(lastAmp) : ''
        const body = split ? text_.slice(0, lastAmp) : text_
        parser.write(unwrapEntities(body))
      } catch (err) {
        reject(err)
      }
    })
    stream.on('error', reject)
    stream.on('end', () => {
      // The trailing DTD can upset a strict close; the entries are already out.
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
