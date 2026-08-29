<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { DialogueTurn, GlossedToken, WordGloss } from '@nihongo/shared/types'

import { kanaLineToRomaji } from '@nihongo/shared/lib'
import { Volume2, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import TokenLine from '@/components/ja/token-line.vue'
import Button from '@/components/ui/button.vue'
import { playAudio, playAudioQueue, stopAudio } from '@/composables/use-audio'

/**
 * A scripted conversation, one turn at a time.
 *
 * The feature came from a target user: *"the ask is conversational flows with
 * no characters. Want to have conversations. I do want to know though how to
 * know it is correct."* Those pull against each other — the more open-ended an
 * exchange, the less a verdict means — so the script is fixed and the reply
 * options are known. "Correct" is then a fact rather than a judgement, and a
 * wrong choice can say WHY.
 *
 * That last part is the whole reason this is worth building rather than
 * bolting on a chatbot. A model can hold a conversation; it cannot reliably
 * tell you which particle you got wrong.
 */
type Reply = DialogueTurn['replies'][number]

const props = defineProps<{
  title: string
  situation: string
  turns: DialogueTurn[]
  mode: FuriganaMode
}>()

const emit = defineEmits<{
  /** Fired once the whole exchange is done, with how many turns went right. */
  (e: 'finished', result: { correct: number, total: number }): void
}>()

/**
 * Which word is open: which line, which token in it, and the gloss itself.
 *
 * One selection for the whole card rather than one per line — two open at once
 * would be two answers to a question the reader asked once, and the panel is a
 * single strip under the exchange. The gloss is carried along rather than
 * looked up again, so the panel cannot go stale if the line beneath it changes.
 */
const picked = ref<{ line: string, index: number, word: WordGloss } | null>(null)

function pick(line: string, tokens: GlossedToken[], index: number | null) {
  const word = index === null ? null : tokens[index]?.w
  picked.value = word && index !== null ? { line, index, word } : null
}

/** The token index open on this line, for the pressed state. */
function selectedOn(line: string): number | null {
  return picked.value?.line === line ? picked.value.index : null
}

/** How far through the script we are. Turns before this one are history. */
const position = ref(0)
/** Which reply was picked for the turn on screen, if any. */
const chosen = ref<Reply | null>(null)
const correctCount = ref(0)
const learnerTurns = computed(() => props.turns.filter(t => t.speaker === 'learner').length)

/**
 * Everything up to and including the current turn.
 *
 * A conversation only makes sense in order, so the earlier turns stay on
 * screen — hiding them would turn each reply into an isolated quiz question,
 * which is what this exists not to be.
 */
const visible = computed(() => props.turns.slice(0, position.value + 1))
const current = computed(() => props.turns[position.value])
const isLearnerTurn = computed(() => current.value?.speaker === 'learner')

/**
 * Rendering a line moved into `TokenLine`, which draws it word by word so each
 * one can be tapped for its meaning. It keeps the rule this component used to
 * hold: in romaji mode the Japanese is REPLACED, not annotated, because
 * someone who cannot read kana is not helped by ruby over glyphs they cannot
 * read either.
 */

/**
 * Hearing it.
 *
 * A conversation you can only read is a transcript. The other speaker's lines
 * play as they arrive, so the exchange runs at the pace of speech rather than
 * of tapping, and every line keeps a button to hear it again — including the
 * replies on offer, since choosing between them by ear is the point.
 *
 * One element, reused: two clips overlapping sound like neither.
 */
const play = playAudio

onBeforeUnmount(stopAudio)

/**
 * The whole exchange, start to finish, in the voices it is meant to be heard in.
 *
 * Learner turns are read with their correct reply — which does give the answer
 * away, so this is offered before you start and not during. Someone who wants
 * to hear the conversation should be able to just hear it.
 */
async function playAll() {
  await speak(props.turns.map(t =>
    (t.speaker === 'learner' ? t.replies.find(r => r.isCorrect)?.audio : t.audio) ?? ''))
}

defineExpose({ playAll })

function choose(reply: Reply) {
  if (chosen.value)
    return
  chosen.value = reply
  if (reply.isCorrect)
    correctCount.value += 1
}

function advance() {
  chosen.value = null
  picked.value = null
  position.value += 1

  // Walk past the other speaker's lines automatically — there is nothing to
  // decide on those, and making the reader tap through them is friction.
  // They are still spoken, so skipping the tap does not skip the listening.
  const spoken: string[] = []
  while (position.value < props.turns.length && props.turns[position.value]?.speaker !== 'learner') {
    const turn = props.turns[position.value]
    if (turn)
      spoken.push(turn.audio)
    position.value += 1
  }
  void speak(spoken)

  if (position.value >= props.turns.length)
    emit('finished', { correct: correctCount.value, total: learnerTurns.value })
}

/**
 * Play a run of lines back to back.
 *
 * Several of the other speaker's turns can arrive at once, and firing them all
 * at the same moment would play the last one over the first. Each waits for
 * the one before, and a clip that will not load is stepped over rather than
 * stalling the queue.
 */
async function speak(sources: string[]) {
  await playAudioQueue(sources)
}

// A new dialogue means starting over rather than resuming someone else's.
watch(() => props.turns, () => {
  stopAudio()
  position.value = 0
  chosen.value = null
  picked.value = null
  correctCount.value = 0
  const spoken: string[] = []
  while (position.value < props.turns.length && props.turns[position.value]?.speaker !== 'learner') {
    const turn = props.turns[position.value]
    if (turn)
      spoken.push(turn.audio)
    position.value += 1
  }
  // Autoplay before any interaction is blocked in most browsers; the catch in
  // speak() swallows that, and the per-line buttons are the way back in.
  void speak(spoken)
}, { immediate: true })
</script>

<template>
  <div>
    <p class="text-center text-sm text-[var(--color-muted)]">
      {{ situation }}
    </p>

    <!-- The exchange so far. -->
    <ol class="mt-6 space-y-4">
      <li
        v-for="turn in visible"
        :key="turn.index"
        class="flex gap-3"
        :class="turn.speaker === 'learner' ? 'flex-row-reverse text-right' : ''"
      >
        <span
          class="mt-1 shrink-0 text-xs uppercase tracking-wide text-[var(--color-muted)]"
          :class="turn.speaker === 'learner' ? '' : 'w-12'"
        >
          {{ turn.speaker === 'learner' ? 'you' : '' }}
        </span>

        <span class="min-w-0 flex-1">
          <!-- A learner turn not yet answered shows nothing: the reply is the
               question. -->
          <template v-if="turn.speaker !== 'learner' || (turn === current ? chosen : true)">
            <span
              class="flex items-center gap-2"
              :class="turn.speaker === 'learner' ? 'flex-row-reverse' : ''"
            >
              <span class="text-lg">
                <TokenLine
                  v-if="turn === current && chosen"
                  :tokens="chosen.tokens"
                  :text="chosen.text"
                  :reading="chosen.reading"
                  :mode="mode"
                  :selected="selectedOn(`c${turn.index}`)"
                  @pick="pick(`c${turn.index}`, chosen.tokens, $event)"
                />
                <TokenLine
                  v-else
                  :tokens="turn.tokens"
                  :text="turn.text"
                  :reading="turn.reading"
                  :mode="mode"
                  :selected="selectedOn(`t${turn.index}`)"
                  @pick="pick(`t${turn.index}`, turn.tokens, $event)"
                />
              </span>
              <button
                type="button"
                class="shrink-0 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                aria-label="Hear this line"
                @click="play(turn === current && chosen ? chosen.audio : turn.audio)"
              >
                <Volume2 class="h-4 w-4" />
              </button>
            </span>
            <!--
              A wrong reply gets its OWN translation, or none. Showing the
              turn's translation under it captioned the mistake with the
              correct meaning — "sumimasen, menyuu ga kudasai" labelled
              "Excuse me, the menu please", which is precisely what it does
              not say.
            -->
            <span
              v-if="turn === current && chosen ? chosen.translation : turn.translation"
              class="block text-sm text-[var(--color-muted)]"
            >{{ turn === current && chosen ? chosen.translation : turn.translation }}</span>
          </template>
          <span v-else class="block text-lg text-[var(--color-muted)]">…</span>
        </span>
      </li>
    </ol>

    <!-- The choice. -->
    <div v-if="isLearnerTurn && !chosen" class="mt-6 flex flex-col gap-2">
      <!--
        A DIV, not a button — and that is load-bearing rather than a style
        choice. This row contains two other interactive things: the speaker,
        and every tappable word inside TokenLine. A <button> may not contain
        another button; the markup is invalid and WebKit responds by not
        dispatching the inner clicks at all, so on Safari the speaker and the
        words simply did nothing.
      -->
      <div
        v-for="reply in current!.replies"
        :key="reply.id"
        class="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-border)] px-4 py-3 text-left transition hover:border-[var(--color-text)]"
        role="button"
        tabindex="0"
        @click="choose(reply)"
        @keydown.enter.prevent="choose(reply)"
        @keydown.space.prevent="choose(reply)"
      >
        <!-- Hearing an option must not count as picking it. -->
        <button
          type="button"
          class="shrink-0 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
          aria-label="Hear this reply"
          @click.stop="play(reply.audio)"
        >
          <Volume2 class="h-4 w-4" />
        </button>
        <span class="min-w-0 flex-1">
          <TokenLine
            :tokens="reply.tokens"
            :text="reply.text"
            :reading="reply.reading"
            :mode="mode"
            :selected="selectedOn(`r${reply.id}`)"
            @pick="pick(`r${reply.id}`, reply.tokens, $event)"
          />
        </span>
      </div>
    </div>

    <!-- The verdict. This is the part the feature exists for: not "wrong", but
         which mistake and why. -->
    <div v-else-if="chosen" class="mt-6">
      <p
        class="font-semibold"
        :class="chosen.isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
      >
        {{ chosen.isCorrect ? 'That works.' : 'Not quite.' }}
      </p>
      <p v-if="chosen.whyWrong" class="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        {{ chosen.whyWrong }}
      </p>
      <p v-if="!chosen.isCorrect" class="mt-3 text-sm">
        <span class="text-[var(--color-muted)]">Say instead:</span>
        <span class="ml-2">
          <TokenLine
            :tokens="current!.replies.find(r => r.isCorrect)!.tokens"
            :text="current!.replies.find(r => r.isCorrect)!.text"
            :reading="current!.replies.find(r => r.isCorrect)!.reading"
            :mode="mode"
            :selected="selectedOn('say-instead')"
            @pick="pick('say-instead', current!.replies.find(r => r.isCorrect)!.tokens, $event)"
          />
        </span>
      </p>

      <Button class="mt-5 w-full" variant="primary" @click="advance">
        {{ position >= turns.length - 1 ? 'Finish' : 'Continue' }}
      </Button>
    </div>

    <!--
      No score here. The card reports its result upward with `finished`, and
      both callers render it themselves — the conversation page as a heading
      with "Try it again", the study page as its own verdict — so printing one
      here too showed "2 of 3 right." twice, one line under the other.
    -->

    <!--
      The word you tapped. A strip under the exchange rather than a floating
      popover: it needs no positioning maths, it cannot land off the edge of a
      phone, and the line you were reading stays where it was.
    -->
    <div
      v-if="picked"
      class="mt-4 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4"
    >
      <div class="min-w-0 flex-1">
        <p class="flex flex-wrap items-baseline gap-x-2">
          <span class="text-lg" style="font-family: var(--font-jp)">{{ picked.word.form }}</span>
          <span class="text-sm text-[var(--color-muted)]">{{ kanaLineToRomaji(picked.word.reading) }}</span>
          <span v-if="picked.word.pos" class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ picked.word.pos }}
          </span>
        </p>
        <p class="mt-1 text-sm leading-relaxed">
          {{ picked.word.meanings.join('; ') }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
        aria-label="Close"
        @click="picked = null"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
