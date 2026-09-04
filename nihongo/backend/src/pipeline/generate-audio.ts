/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { dialogueReplies, dialogues, dialogueTurns, kana, sentences, words } from '@nihongo/shared/db/schema'
import { asc, eq } from 'drizzle-orm'
import { execFile } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path, { basename } from 'node:path'
import { promisify } from 'node:util'

import { audioKeyFor, VOICE_LEARNER as LEARNER_VOICE, VOICE_OTHER } from '../lib/audio-key.js'
import { CONTENT_TYPES, listKeys, putAsset } from './lib/bucket.js'

const run = promisify(execFile)

/**
 * Pre-generate pronunciation audio.
 *
 * Real files rather than the browser's SpeechSynthesis: the synthetic voice
 * differs per device, is unavailable offline, and cannot be shadowed against.
 * Generated once, served statically.
 *
 * Uses macOS `say` with the Kyoko voice, so this is a LOCAL step — the same as
 * the importers. Production audio is meant to live on R2; this script is what
 * produces it. On a non-macOS machine, swap the two commands below for any TTS
 * that writes AIFF and any encoder that writes AAC.
 *
 *   pnpm -C nihongo/backend audio:kana
 *   pnpm -C nihongo/backend audio:words
 *   pnpm -C nihongo/backend audio:sentences
 *   pnpm -C nihongo/backend audio:dialogues
 *   pnpm -C nihongo/backend audio:all
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

type AudioKind = 'kana' | 'words' | 'sentences' | 'dialogues'

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
      .map(r => ({ name: String(r.entSeq), text: r.text }))
  } else if (kind === 'sentences') {
    // Named by the row id, not the Tanaka id: the file has to be findable from
    // a prompt, and prompts carry sentence ids.
    targets = (await db
      .select({ id: sentences.id, text: sentences.text })
      .from(sentences)
      .where(eq(sentences.published, true)))
      .map(r => ({ name: r.id, text: r.text }))
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

  for (const t of targets) {
    // Dialogue clips are named for their TEXT, so an edited line asks for a
    // different file instead of inheriting one recorded for the sentence that
    // used to sit at this index. Everything else is keyed by a stable id whose
    // content genuinely never changes.
    const key = kind === 'dialogues'
      ? `audio/dialogues/${audioKeyFor(t.text, t.voice ?? VOICE)}.m4a`
      : `audio/${kind}/${t.name}.m4a`
    // `--redo` re-records a clip that is already in the bucket.
    //
    // The skip above rests on ids being stable AND their text never changing,
    // which holds right up until a sentence is REWORDED — then the id still
    // resolves, the clip is skipped as present, and it goes on speaking the old
    // wording forever. Silent, and worst in dictation, where the learner types
    // what they hear and is marked wrong for getting it right.
    if (stored.has(key) && !redo.has(t.name)) {
      skipped++
      continue
    }
    if (await synthesise(t.text, key, t.voice ?? VOICE))
      made++
    else failed++
    if ((made + failed) % 250 === 0 && made + failed > 0)
      console.log(`  ${kind}: ${made} uploaded, ${failed} failed…`)
  }

  console.log(`${kind}: ${made} generated and uploaded, ${skipped} already in the bucket, ${failed} failed`)
  if (failed > 0) {
    console.log('  (failures usually mean the Kyoko voice is missing — install it in')
    console.log('   System Settings → Accessibility → Spoken Content → System Voice)')
  }
}

const KINDS: AudioKind[] = ['kana', 'words', 'sentences', 'dialogues']

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
