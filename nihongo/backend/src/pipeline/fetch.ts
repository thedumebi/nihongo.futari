/* eslint-disable no-console */
import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createGunzip } from 'node:zlib'

/**
 * Dataset fetching.
 *
 * Downloads are cached under `.data/` (gitignored) and skipped when the file is
 * already present, so re-running an import doesn't re-pull 10 MB of XML. The
 * checksum is recorded on the import run — that is what makes "did the upstream
 * data actually change?" answerable later.
 */

export interface Dataset {
  code: string
  url: string
  /** Local filename after any decompression. */
  file: string
  gunzip?: boolean
}

export const DATASETS = {
  jmdict: {
    code: 'jmdict',
    url: 'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz',
    file: 'JMdict_e.xml',
    gunzip: true
  },
  kanjidic2: {
    code: 'kanjidic2',
    url: 'http://ftp.edrdg.org/pub/Nihongo/kanjidic2.xml.gz',
    file: 'kanjidic2.xml',
    gunzip: true
  },
  tanaka: {
    code: 'tanaka',
    // The Tanaka Corpus as EDRDG's indexed examples file: each sentence pair
    // comes with a human-checked word-by-word index including readings, which
    // is why this app needs no Japanese tokeniser.
    url: 'http://ftp.edrdg.org/pub/Nihongo/examples.utf.gz',
    file: 'examples.utf',
    gunzip: true
  },
  wiktextract: {
    code: 'wiktextract',
    // Japanese entries from the ENGLISH Wiktionary, machine-extracted. The
    // `etymology_text` field is the only prose etymology source in the whole
    // pipeline, which makes it the thing grounding packets quote from.
    url: 'https://kaikki.org/dictionary/Japanese/kaikki.org-dictionary-Japanese.jsonl',
    file: 'wiktextract-ja.jsonl'
  },
  wiktextractTranslingual: {
    code: 'wiktextract-translingual',
    // Han characters from the TRANSLINGUAL section of English Wiktionary. This
    // is where glyph origin lives — the Japanese extract carries etymologies of
    // the WORDS written with a kanji, which is a different question entirely.
    url: 'https://kaikki.org/dictionary/Translingual/kaikki.org-dictionary-Translingual.jsonl',
    file: 'wiktextract-translingual.jsonl'
  },
  kanjium: {
    code: 'kanjium',
    // Pitch accent as `expression<TAB>reading<TAB>positions`, where a position
    // is the mora AFTER which the pitch drops (0 = no drop at all).
    url: 'https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt',
    file: 'accents.txt'
  },
  kanjivg: {
    code: 'kanjivg',
    // Per-stroke SVG paths in a 109x109 box, in stroke order.
    url: 'https://github.com/KanjiVG/kanjivg/releases/download/r20250816/kanjivg-20250816.xml.gz',
    file: 'kanjivg.xml',
    gunzip: true
  },
  chiseIds: {
    code: 'chise-ids',
    // Ideographic Description Sequences: how each character decomposes.
    // 晴 = ⿰日青, 清 = ⿰氵青 — which is what makes phonetic series derivable
    // rather than scraped off a fragile HTML page.
    url: 'https://raw.githubusercontent.com/cjkvi/cjkvi-ids/master/ids.txt',
    file: 'cjkvi-ids.txt'
  },
  // MIT-licensed. Used ONLY as a level index: which (expression, reading) pairs
  // belong to which JLPT level. Every gloss, part of speech and sense comes from
  // JMdict, which is the canonical, properly-licensed source.
  jlptN1: {
    code: 'jlpt-n1',
    url: 'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n1.csv',
    file: 'jlpt-n1.csv'
  },
  jlptN2: {
    code: 'jlpt-n2',
    url: 'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n2.csv',
    file: 'jlpt-n2.csv'
  },
  jlptN3: {
    code: 'jlpt-n3',
    url: 'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n3.csv',
    file: 'jlpt-n3.csv'
  },
  jlptN4: {
    code: 'jlpt-n4',
    url: 'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n4.csv',
    file: 'jlpt-n4.csv'
  },
  jlptN5: {
    code: 'jlpt-n5',
    url: 'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n5.csv',
    file: 'jlpt-n5.csv'
  }
} as const satisfies Record<string, Dataset>

export function dataDir(): string {
  return path.resolve(process.cwd(), '../../.data')
}

export async function ensureDataset(ds: Dataset): Promise<{ filePath: string, checksum: string, cached: boolean }> {
  const dir = dataDir()
  await mkdir(dir, { recursive: true })
  const filePath = path.join(dir, ds.file)

  let cached = true
  try {
    await stat(filePath)
  } catch {
    cached = false
    console.log(`  ↓ ${ds.code}: downloading ${ds.url}`)
    const res = await fetch(ds.url)
    if (!res.ok || !res.body)
      throw new Error(`${ds.code}: HTTP ${res.status}`)

    const source = Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0])
    if (ds.gunzip) {
      await pipeline(source, createGunzip(), createWriteStream(filePath))
    } else {
      await pipeline(source, createWriteStream(filePath))
    }
  }

  const checksum = createHash('sha256').update(await readFile(filePath)).digest('hex').slice(0, 16)
  const bytes = (await stat(filePath)).size
  console.log(`  ${cached ? '·' : '✓'} ${ds.code}: ${(bytes / 1048576).toFixed(1)} MB  sha256:${checksum}`)
  return { filePath, checksum, cached }
}

/** Write a small JSON artefact beside the datasets (used for debugging a run). */
export async function writeArtefact(name: string, data: unknown): Promise<void> {
  await writeFile(path.join(dataDir(), name), JSON.stringify(data, null, 2))
}
