/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { dialogueReplies, dialogues, dialogueTurns, kana, languageLevels, sentences, studyItems, words, wordSenses } from '@nihongo/shared/db/schema'
import { recallGloss, speakSegments, speakSpoken } from '@nihongo/shared/lib'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { execFile } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path, { basename } from 'node:path'
import { promisify } from 'node:util'

import { audioKeyFor, englishVoiceFor, GLOSS_AUDIO_LEVELS, VOICE_LEARNER as LEARNER_VOICE, VOICE_OTHER, VOICE_RECALL, voiceForClip } from '../lib/audio-key.js'
import { READINGS } from './data/readings/index.js'
import { SPEAK } from './data/speak/index.js'
import { japaneseLine, teacherLine } from './data/speak/types.js'
import { CONTENT_TYPES, listKeys, putAsset } from './lib/bucket.js'

const run = promisify(execFile)

/**
 * Pre-generate pronunciation audio.
 *
 * Real files rather than the browser's SpeechSynthesis: the synthetic voice
 * differs per device, is unavailable offline, and cannot be shadowed against.
 * Generated once, served statically.
 *
 * Uses macOS `say` (Kyoko and Otoya for Japanese), so this is a LOCAL step — the same as
 * the importers. Production audio is meant to live on R2; this script is what
 * produces it. On a non-macOS machine, swap the two commands below for any TTS
 * that writes AIFF and any encoder that writes AAC.
 *
 *   pnpm -C nihongo/backend audio:kana
 *   pnpm -C nihongo/backend audio:words
 *   pnpm -C nihongo/backend audio:sentences
 *   pnpm -C nihongo/backend audio:dialogues
 *   pnpm -C nihongo/backend audio:speak
 *   pnpm -C nihongo/backend audio:all
 *
 * After sentences or words, run `seed:clip-audio`: it writes the seed that
 * tells production which recordings exist, and until it is deployed a new or
 * reworded item plays nothing.
 *
 * Clips go straight to the bucket. They used to be written into
 * `frontend/public/audio`, which grew to 103 MB and eleven thousand files — a
 * tree nothing served from, since the app reads media from R2. Nothing is left
 * on disk but the temporary AIFF each clip is converted from.
 *
 * Skips anything the BUCKET already holds, so it is cheap to re-run after
 * adding content, and clearing the old local tree does not cause every clip to
 * be regenerated. That is the whole reason existence is asked of R2 rather than
 * the filesystem.
 */

const VOICE = VOICE_OTHER

/**
 * The second speaker in a conversation.
 *
 * A dialogue read entirely in one voice is a monologue with line breaks — you
 * cannot hear whose turn it is, which is most of what makes a conversation
 * followable. Kyoko speaks the other party; this one speaks your own lines and
 * the replies you choose between.
 */
const VOICE_LEARNER = LEARNER_VOICE

/**
 * How long a single clip may take before it is abandoned.
 *
 * `say` has been seen to hang indefinitely on a particular input — a words run
 * sat for eight hours having produced nothing. A stuck clip must cost one
 * timeout, not the whole run.
 */
const CLIP_TIMEOUT_MS = 20_000

/** Clips recorded at once. `say` and the upload each leave the CPU idle, so four keep it busy. */
const CONCURRENCY = 4

/**
 * Synthesise one clip and put it in the bucket.
 *
 * Both intermediates live in the system temp directory and are removed however
 * this exits. Nothing is written to the repo — a clip that is generated but not
 * uploaded would be invisible to the next run's bucket listing and silently
 * regenerated forever.
 */
async function synthesise(text: string, key: string, voice = VOICE): Promise<boolean> {
  const stem = path.join(tmpdir(), basename(key))
  const aiff = `${stem}.aiff`
  const m4a = `${stem}.m4a`
  try {
    await run('say', ['-v', voice, '-o', aiff, text], { timeout: CLIP_TIMEOUT_MS })
    await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '32000', aiff, m4a], { timeout: CLIP_TIMEOUT_MS })
    await putAsset(key, await readFile(m4a), CONTENT_TYPES.audio!)
    return true
  } catch {
    return false
  } finally {
    await unlink(aiff).catch(() => {})
    await unlink(m4a).catch(() => {})
  }
}

// Comma-separated ids: `audio:sentences -- --redo sent-ex-desu-3,sent-ex-masu-2`
const redoArg = process.argv.find(a => a.startsWith('--redo='))
  ?? (process.argv.includes('--redo') ? process.argv[process.argv.indexOf('--redo') + 1] : undefined)
const redo = new Set((redoArg?.replace(/^--redo=/, '') ?? '').split(',').map(s => s.trim()).filter(Boolean))
// A `--redo` that names nothing re-records nothing, and every clip is then
// skipped as already present — the run reports success having done exactly
// what it was told not to do. Say so instead.
if (process.argv.some(a => a === '--redo' || a.startsWith('--redo=')) && redo.size === 0) {
  console.error('--redo needs comma-separated ids, e.g. --redo sent-ex-desu-3,sent-ex-masu-2')
  process.exit(1)
}

type AudioKind = 'kana' | 'words' | 'sentences' | 'dialogues' | 'speak' | 'readings' | 'glosses'

async function generate(kind: AudioKind) {
  // One listing for the run rather than a HEAD per clip: at eleven thousand
  // files the difference is seconds against most of an hour.
  const stored = await listKeys(`audio/${kind}/`)

  let targets: Array<{ name: string, text: string, voice?: string }>
  if (kind === 'kana') {
    targets = (await db
      .select({ script: kana.script, romaji: kana.romaji, text: kana.character })
      .from(kana))
      .map(r => ({ name: `${r.script}-${r.romaji}`, text: r.text }))
  } else if (kind === 'words') {
    targets = (await db
      .select({ entSeq: words.entSeq, text: words.primaryReading })
      .from(words)
      .where(eq(words.published, true)))
      .filter(r => r.entSeq !== null)
      .map(r => ({ name: String(r.entSeq), text: r.text, voice: voiceForClip(r.entSeq!) }))
  } else if (kind === 'sentences') {
    // Named by the row id, not the Tanaka id: the file has to be findable from
    // a prompt, and prompts carry sentence ids.
    targets = (await db
      .select({ id: sentences.id, text: sentences.text })
      .from(sentences)
      .where(eq(sentences.published, true)))
      .map(r => ({ name: r.id, text: r.text, voice: voiceForClip(r.id) }))
  } else if (kind === 'readings') {
    // Every line of every speech, from the authored data — a speech is
    // approved by listening to it, so its audio exists before it is published.
    const lines = new Map<string, { text: string, voice: string }>()
    for (const reading of READINGS) {
      for (const stanza of reading.stanzas) {
        for (const line of stanza)
          lines.set(audioKeyFor(line.t, VOICE), { text: line.t, voice: VOICE })
      }
    }
    targets = [...lines].map(([name, line]) => ({ name, ...line }))
  } else if (kind === 'glosses') {
    // The English prompt for each word a Recall session can ask: words at the
    // recorded levels that have a study item, said by one teacher voice.
    const rows = await db
      .select({ glosses: wordSenses.glosses })
      .from(words)
      .innerJoin(languageLevels, eq(languageLevels.id, words.levelId))
      .innerJoin(wordSenses, and(eq(wordSenses.wordId, words.id), eq(wordSenses.sortIndex, 0)))
      .innerJoin(studyItems, and(eq(studyItems.wordId, words.id), eq(studyItems.published, true)))
      .where(and(eq(words.published, true), inArray(languageLevels.code, [...GLOSS_AUDIO_LEVELS])))
    const lines = new Map<string, { text: string, voice: string }>()
    for (const r of rows) {
      const text = recallGloss(r.glosses.filter(g => g.lang === 'en').map(g => g.text))
      if (text)
        lines.set(audioKeyFor(text, VOICE_RECALL), { text, voice: VOICE_RECALL })
    }
    targets = [...lines].map(([name, line]) => ({ name, ...line }))
  } else if (kind === 'speak') {
    // From the authored data, not the database: a session is unpublished until
    // it is approved, and its clips have to exist BEFORE that, so the reviewer
    // hears what learners will. Every teacher line is recorded run by run —
    // English in the session's teacher voice, each {Japanese} run in Kyoko — and every
    // answer in Kyoko.
    const lines = new Map<string, { text: string, voice: string }>()
    const add = (text: string, voice: string) => lines.set(audioKeyFor(text, voice), { text, voice })
    for (const session of SPEAK) {
      for (const step of session.steps) {
        for (const segment of speakSegments(teacherLine(step)).filter(speakSpoken))
          add(segment.text, segment.lang === 'ja' ? VOICE : englishVoiceFor(session.number))
        const ja = japaneseLine(step)
        if (ja)
          add(ja, VOICE)
      }
    }
    targets = [...lines].map(([name, line]) => ({ name, ...line }))
  } else {
    // Every line of every conversation, plus every reply you can pick — a wrong
    // one is worth hearing too, since hearing why it sounds off is half the
    // lesson. Named by row id, which is what the API hands the player.
    const turnRows = await db
      .select({
        id: dialogueTurns.id,
        speaker: dialogueTurns.speaker,
        text: dialogueTurns.text
      })
      .from(dialogueTurns)
      .innerJoin(dialogues, eq(dialogues.id, dialogueTurns.dialogueId))
      .where(eq(dialogues.published, true))
      .orderBy(asc(dialogueTurns.id))

    const replyRows = await db
      .select({ id: dialogueReplies.id, text: dialogueReplies.text })
      .from(dialogueReplies)
      .innerJoin(dialogueTurns, eq(dialogueTurns.id, dialogueReplies.turnId))
      .innerJoin(dialogues, eq(dialogues.id, dialogueTurns.dialogueId))
      .where(eq(dialogues.published, true))
      .orderBy(asc(dialogueReplies.id))

    targets = [
      ...turnRows.map(r => ({
        name: r.id,
        text: r.text,
        voice: r.speaker === 'learner' ? VOICE_LEARNER : VOICE
      })),
      // Replies are always your own lines, so they take the learner voice.
      ...replyRows.map(r => ({ name: r.id, text: r.text, voice: VOICE_LEARNER }))
    ]
  }

  let made = 0
  let skipped = 0
  let failed = 0

  // Everything but kana is named for its text and voice, so an edited line
  // asks for a new file instead of inheriting the old recording. A clip
  // already in the bucket is skipped: safe because the name is the text, so a
  // reworded sentence has a new name and is recorded again. (Filed by id, as
  // sentences and words once were, a reworded one was skipped as present and
  // went on saying the old words.) `--redo` re-records one on purpose.
  const todo = new Map<string, { text: string, voice: string }>()
  for (const t of targets) {
    const key = kind === 'kana'
      ? `audio/${kind}/${t.name}.m4a`
      : `audio/${kind}/${audioKeyFor(t.text, t.voice ?? VOICE)}.m4a`
    if (stored.has(key) && !redo.has(t.name))
      skipped++
    else
      todo.set(key, { text: t.text, voice: t.voice ?? VOICE })
  }

  // A few at once: one at a time, eleven thousand clips took most of a day.
  const queue = [...todo.entries()]
  async function worker() {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const [key, { text, voice }] = next
      if (await synthesise(text, key, voice)) {
        made++
      } else {
        failed++
        // Name it: a clip that fails every run is a text `say` cannot speak,
        // not bad luck, and "4 failed" alone gives nothing to fix.
        console.log(`  failed: ${JSON.stringify(text)} (${voice})`)
      }
      if ((made + failed) % 250 === 0)
        console.log(`  ${kind}: ${made} uploaded, ${failed} failed, ${queue.length} to go…`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(`${kind}: ${made} generated and uploaded, ${skipped} already in the bucket, ${failed} failed`)
  if (failed > 0) {
    console.log('  (failures usually mean the Kyoko voice is missing — install it in')
    console.log('   System Settings → Accessibility → Spoken Content → System Voice)')
  }
}

const KINDS: AudioKind[] = ['kana', 'words', 'sentences', 'dialogues', 'speak', 'readings', 'glosses']

// The first argument that is not a flag. `--redo` takes a value, so reading
// argv[2] positionally let `--redo sent-ex-desu-3` occupy the kind slot and the
// script quietly generated KANA instead of what was asked for.
const requested = process.argv.slice(2).find((a, i, all) =>
  !a.startsWith('--') && all[i - 1] !== '--redo' && a !== '--')

// `tsx generate-audio.ts --redo sent-ex-desu-3` names ids but no kind, and the
// unrecognised-kind fallback would quietly run a full KANA pass while the ids
// sat unused. Re-recording is deliberate enough to deserve an error.
if (redo.size > 0 && !requested) {
  console.error('--redo also needs a kind, e.g. `sentences --redo sent-ex-desu-3`')
  process.exit(1)
}
// `all` runs the lot in order, which is what a fresh machine wants; anything
// unrecognised still falls back to kana, as it always did.
const wanted: AudioKind[] = requested === 'all'
  ? KINDS
  : [KINDS.find(k => k === requested) ?? 'kana']

async function main() {
  for (const kind of wanted)
    await generate(kind)
}

main()
  .catch((err) => {
    console.error('Audio generation failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
