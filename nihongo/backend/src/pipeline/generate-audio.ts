/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { dialogueReplies, dialogues, dialogueTurns, kana, sentences, words } from '@nihongo/shared/db/schema'
import { asc, eq } from 'drizzle-orm'
import { execFile } from 'node:child_process'
import { access, mkdir, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path, { basename } from 'node:path'
import { promisify } from 'node:util'

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
 * Skips anything already present, so it is cheap to re-run after adding content.
 */

const VOICE = 'Kyoko'

/**
 * The second speaker in a conversation.
 *
 * A dialogue read entirely in one voice is a monologue with line breaks — you
 * cannot hear whose turn it is, which is most of what makes a conversation
 * followable. Kyoko speaks the other party; this one speaks your own lines and
 * the replies you choose between.
 */
const VOICE_LEARNER = 'Reed (Japanese (Japan))'

/**
 * How long a single clip may take before it is abandoned.
 *
 * `say` has been seen to hang indefinitely on a particular input — a words run
 * sat for eight hours having produced nothing. A stuck clip must cost one
 * timeout, not the whole run.
 */
const CLIP_TIMEOUT_MS = 20_000
const PUBLIC_AUDIO = path.resolve(process.cwd(), '../frontend/public/audio')

async function exists(file: string): Promise<boolean> {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

async function synthesise(text: string, outFile: string, voice = VOICE): Promise<boolean> {
  // The intermediate AIFF goes to the system temp directory, NOT next to the
  // output. It used to live in public/audio, which the frontend build copies
  // wholesale into dist — so any build running while this does died with
  // ENOENT on a temp file that had already been converted and deleted.
  const tmp = path.join(tmpdir(), `${basename(outFile)}.aiff`)
  try {
    await run('say', ['-v', voice, '-o', tmp, text], { timeout: CLIP_TIMEOUT_MS })
    await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '32000', tmp, outFile], { timeout: CLIP_TIMEOUT_MS })
    return true
  } catch {
    return false
  } finally {
    await unlink(tmp).catch(() => {})
  }
}

type AudioKind = 'kana' | 'words' | 'sentences' | 'dialogues'

async function generate(kind: AudioKind) {
  const dir = path.join(PUBLIC_AUDIO, kind)
  await mkdir(dir, { recursive: true })

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
    const outFile = path.join(dir, `${t.name}.m4a`)
    if (await exists(outFile)) {
      skipped++
      continue
    }
    if (await synthesise(t.text, outFile, t.voice ?? VOICE))
      made++
    else failed++
  }

  console.log(`${kind}: ${made} generated, ${skipped} already present, ${failed} failed`)
  if (failed > 0) {
    console.log('  (failures usually mean the Kyoko voice is missing — install it in')
    console.log('   System Settings → Accessibility → Spoken Content → System Voice)')
  }
}

const KINDS: AudioKind[] = ['kana', 'words', 'sentences', 'dialogues']

const requested = process.argv[2]
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
