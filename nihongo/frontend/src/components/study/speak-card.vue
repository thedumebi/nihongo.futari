<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { SpeakPrompt, WordGloss } from '@nihongo/shared/types'

import { Check, Volume2, X } from 'lucide-vue-next'
import { onBeforeUnmount, ref, watch } from 'vue'

import TokenLine from '@/components/ja/token-line.vue'
import WordMeaning from '@/components/ja/word-meaning.vue'
import TeacherLine from '@/components/speak/teacher-line.vue'
import AnswerBar from '@/components/ui/answer-bar.vue'
import Button from '@/components/ui/button.vue'
import { playAudio, playAudioQueue, stopAudio } from '@/composables/use-audio'

/**
 * A Speak prompt you missed, back as a review.
 *
 * The same beat as in the session: hear the English, say the Japanese out
 * loud, then see and hear the answer and say honestly whether you had it. No
 * countdown — in review you take as long as you need — and the self-check is
 * the grade, as it was when you missed it.
 */
interface Props {
  prompt: SpeakPrompt
  mode: FuriganaMode
  knownKanji?: Set<string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  finished: [gotIt: boolean]
}>()

// ============ Reactive State ============
const revealed = ref(false)
const word = ref<WordGloss | null>(null)
const picked = ref<number | null>(null)

// ============ Watchers ============
watch(() => props.prompt, () => {
  revealed.value = false
  onPick(null)
  void playAudioQueue(props.prompt.say.map(s => s.audio))
}, { immediate: true })

// ============ Lifecycle Hooks ============
onBeforeUnmount(stopAudio)

// ============ Methods ============
function reveal() {
  revealed.value = true
  playAudio(props.prompt.answerAudio)
}

function replay() {
  if (revealed.value)
    playAudio(props.prompt.answerAudio)
  else
    void playAudioQueue(props.prompt.say.map(s => s.audio))
}

function onPick(index: number | null) {
  picked.value = index
  word.value = index === null ? null : props.prompt.tokens[index]?.w ?? null
}
</script>

<template>
  <div>
    <!-- The page labels the card SPEAK already; this says which session. -->
    <p class="mt-1 text-center text-xs text-[var(--color-muted)]">
      Session {{ prompt.session.number }} &middot; {{ prompt.session.titleEn }}
    </p>

    <TeacherLine :say="prompt.say" class="mt-6 text-lg font-medium" />

    <p v-if="!revealed" class="mt-8 text-center text-sm text-[var(--color-muted)]">
      Say it out loud, then check.
    </p>

    <div v-else class="mt-8 text-center">
      <p class="text-2xl leading-[2.2] sm:text-3xl">
        <TokenLine
          :tokens="prompt.tokens"
          :text="prompt.text"
          :reading="prompt.reading"
          :mode="mode"
          :known-kanji="knownKanji"
          :selected="picked"
          @pick="onPick"
        />
      </p>
      <p v-if="prompt.note" class="mt-3 text-sm text-[var(--color-muted)]">
        {{ prompt.note }}
      </p>
    </div>

    <AnswerBar class="mt-8" content-class="flex flex-wrap items-center justify-center gap-3">
      <Button variant="ghost" round aria-label="Hear it again" @click="replay">
        <Volume2 class="h-5 w-5" />
      </Button>
      <Button v-if="!revealed" variant="primary" @click="reveal">
        Show answer
      </Button>
      <template v-else>
        <Button variant="ghost" @click="emit('finished', false)">
          <X class="h-4 w-4" />
          Not quite
        </Button>
        <Button variant="primary" @click="emit('finished', true)">
          <Check class="h-4 w-4" />
          Got it
        </Button>
      </template>
    </AnswerBar>

    <WordMeaning v-if="word" :word="word" @close="onPick(null)" />
  </div>
</template>
