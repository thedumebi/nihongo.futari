<script setup lang="ts">
import type { DialogueTurn, WordPitch } from '@nihongo/shared/types'

import { Circle, Mic, Play, Square, Volume2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import { getWordPitches } from '@/api/words'
import PitchAccent from '@/components/ja/pitch-accent.vue'
import TokenLine from '@/components/ja/token-line.vue'
import PitchCompare from '@/components/study/pitch-compare.vue'
import Button from '@/components/ui/button.vue'
import { playAudio, playAudioQueue, stopAudio } from '@/composables/use-audio'
import { useFurigana } from '@/composables/use-furigana'
import { pitchCurve, useRecorder } from '@/composables/use-recorder'

/**
 * Shadowing: hear a line, say it straight after, compare.
 *
 * The comparison is by ear — the speaker and you back to back — and by eye,
 * with both pitch curves drawn together. There is no score: a number would
 * pretend to a precision a phone microphone does not have. Recordings never
 * leave the phone.
 */
interface Props {
  turns: DialogueTurn[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** The first line recorded and compared. */
  practised: []
}>()

// ============ Composables ============
const recorder = useRecorder()
const { mode } = useFurigana()

// ============ Reactive State ============
const selected = ref(0)
const speakerCurve = ref<Array<number | null> | null>(null)
const myCurve = ref<Array<number | null> | null>(null)
const analysing = ref(false)
/** The dictionary's pitch for each word in the line, in order — what the curve should follow. */
const wordPitches = ref<Array<{ form: string, pitch: WordPitch }>>([])
let practised = false

// ============ Computed Properties ============
const turn = computed(() => props.turns[selected.value] ?? null)

// ============ Methods ============
/** A line's words without their glosses, so none renders as a button inside the line's own. */
function plain(t: DialogueTurn) {
  return (t.tokens ?? []).map(({ w: _w, ...token }) => token)
}

async function pick(index: number) {
  stopAudio()
  if (recorder.recording.value)
    await recorder.stop()
  selected.value = index
  myCurve.value = null
  if (recorder.clip.value)
    URL.revokeObjectURL(recorder.clip.value)
  recorder.clip.value = null
  speakerCurve.value = null
  const t = turn.value
  if (!t)
    return
  void playAudio(t.audio)
  void loadWordPitches(t)
  speakerCurve.value = await pitchCurve(t.audio)
}

async function loadWordPitches(t: DialogueTurn) {
  wordPitches.value = []
  const words = t.tokens.flatMap(tok => tok.w?.wordId ? [{ id: tok.w.wordId, form: tok.w.form }] : [])
  try {
    const pitches = await getWordPitches([...new Set(words.map(w => w.id))])
    // Only for the line still showing — a quick second pick wins.
    if (turn.value?.index !== t.index)
      return
    const seen = new Set<string>()
    wordPitches.value = words.flatMap((w) => {
      const pitch = pitches[w.id]
      if (!pitch || seen.has(w.id))
        return []
      seen.add(w.id)
      return [{ form: w.form, pitch }]
    })
  } catch {
    wordPitches.value = []
  }
}

async function toggleRecord() {
  if (recorder.recording.value) {
    const url = await recorder.stop()
    if (!url)
      return
    analysing.value = true
    myCurve.value = await pitchCurve(url)
    analysing.value = false
    if (!practised) {
      practised = true
      emit('practised')
    }
    void compare()
    return
  }
  stopAudio()
  myCurve.value = null
  await recorder.start()
}

/** The speaker, a breath, then you. */
function compare() {
  const t = turn.value
  if (!t || !recorder.clip.value)
    return
  return playAudioQueue([t.audio, { pauseMs: 400 }, recorder.clip.value])
}
</script>

<template>
  <div>
    <p class="text-sm text-[var(--color-muted)]">
      Pick a line and hear it, then record yourself saying it the same way. You will hear the two
      back to back, with both melodies drawn. Match where it rises and falls. Nothing you record
      leaves this phone.
    </p>

    <ol class="mt-4 space-y-1">
      <li v-for="(t, i) in turns" :key="t.index">
        <button
          type="button"
          class="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-card)]"
          :class="i === selected && speakerCurve !== null ? 'bg-[var(--color-card)] ring-1 ring-[var(--color-accent)]' : ''"
          @click="pick(i)"
        >
          <span class="text-xs text-[var(--color-muted)]">{{ t.speaker === 'learner' ? 'You say' : 'They say' }}</span>
          <!-- In the reader's furigana mode, like every other line. Words are
               not tappable here: the whole line is already a button. -->
          <span class="block text-lg"><TokenLine :tokens="plain(t)" :text="t.text" :reading="t.reading ?? ''" :mode="mode" /></span>
          <span class="block text-sm text-[var(--color-muted)]">{{ t.translation }}</span>
        </button>
      </li>
    </ol>

    <div v-if="turn && speakerCurve" class="sticky bottom-4 mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
      <p class="text-lg">
        <TokenLine :tokens="plain(turn)" :text="turn.text" :reading="turn.reading ?? ''" :mode="mode" />
      </p>
      <PitchCompare class="mt-2" :speaker="speakerCurve" :mine="myCurve" />
      <!-- The dictionary's pattern for each word: where the pitch should drop. -->
      <details v-if="wordPitches.length" class="mt-2 text-sm">
        <summary class="cursor-pointer text-[var(--color-muted)]">
          Dictionary pitch for each word
        </summary>
        <div class="mt-2 flex flex-wrap gap-x-6 gap-y-3">
          <div v-for="w in wordPitches" :key="w.form">
            <p class="text-xs text-[var(--color-muted)]" style="font-family: var(--font-jp)">
              {{ w.form }}
            </p>
            <PitchAccent :reading="w.pitch.reading" :shape="w.pitch.shape" :pattern="w.pitch.pattern" />
          </div>
        </div>
      </details>
      <p v-if="analysing" class="text-sm text-[var(--color-muted)]">
        Reading your melody…
      </p>
      <p v-if="recorder.error.value" class="mt-2 text-sm text-[var(--color-danger)]">
        {{ recorder.error.value }}
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="ghost" @click="playAudio(turn.audio)">
          <Volume2 class="h-4 w-4" /> Hear it
        </Button>
        <Button :variant="recorder.recording.value ? 'primary' : 'ghost'" @click="toggleRecord">
          <template v-if="recorder.recording.value">
            <Square class="h-4 w-4" /> Stop
          </template>
          <template v-else>
            <Mic class="h-4 w-4" /> {{ recorder.clip.value ? 'Record again' : 'Record' }}
          </template>
        </Button>
        <Button v-if="recorder.clip.value && !recorder.recording.value" variant="ghost" @click="compare">
          <Play class="h-4 w-4" /> Both again
        </Button>
        <span v-if="recorder.recording.value" class="flex items-center gap-1 text-sm text-[var(--color-danger)]">
          <Circle class="h-3 w-3 animate-pulse fill-current" /> Recording
        </span>
      </div>
    </div>
  </div>
</template>
