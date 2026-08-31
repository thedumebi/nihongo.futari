/**
 * Rebuild every conversation from the authored data.
 *
 * The corpus was 100 conversations averaging 3.5 turns — 59 of them exactly
 * three, which is one exchange, not a conversation. The convenience-store
 * dialogue was five lines and never mentioned heating, chopsticks, point cards,
 * bags or payment, so a reader who had studied it was still stranded at a real
 * till. It is now 129 conversations averaging 11.8 turns, each walking a whole
 * interaction including the part where something goes wrong.
 *
 * A `.seed.ts` rather than a `.sql` because the alternative is a second
 * implementation. One conversation expands into a dialogue, its turns, the
 * replies under each learner turn, a study item, a facet and a prompt, with the
 * reply wiring and reading derivation `import-dialogues` already performs.
 * Emitting that as literal INSERTs would mean maintaining the expansion twice
 * and keeping the copies in step; calling the importer reuses the tested path.
 *
 * Safe to re-run, which is what makes this sound as a seed: the importer
 * replaces each dialogue's turns wholesale, keyed by `code`, rather than
 * appending. Interrupted halfway it simply runs again on the next deploy.
 *
 * Audio is NOT produced here. Clips are generated on a laptop by `say` and live
 * in the bucket — see `.claude/rules/media.md`. A turn whose clip is missing
 * renders silently rather than breaking the card.
 */
import { importDialogues } from '@/pipeline/import-dialogues.js'

export async function run(): Promise<void> {
  await importDialogues()
}
