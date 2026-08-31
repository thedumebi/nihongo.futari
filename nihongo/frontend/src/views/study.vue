<script setup lang="ts">
import type {
  DialogueTurn,
  FuriganaSegment,
  GlossedToken,
  HandwritingGrade,
  ReferenceStroke,
  StageProgress,
  Stroke,
  StudyDeck,
  StudyQueueItem,
  StudyQueueResponse,
  WordGloss
} from '@nihongo/shared/types'

import { describeScript, gradeAnswer, gradeHandwriting, ratingFromGrade, samplePath, scriptOf, uuidv7 } from '@nihongo/shared/lib'
import { useLocalStorage } from '@vueuse/core'
import { GraduationCap, Layers } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useRoute, useRouter } from 'vue-router'

import type { DropdownOption } from '@/components/ui/dropdown.vue'
import type { SyncState } from '@/offline/sync'

import { getDecks, getQueue } from '@/api/study'
import FuriganaText from '@/components/ja/furigana-text.vue'
import TokenLine from '@/components/ja/token-line.vue'
import WordMeaning from '@/components/ja/word-meaning.vue'
import AppShell from '@/components/layout/app-shell.vue'
import DialogueCard from '@/components/study/dialogue-card.vue'
import Button from '@/components/ui/button.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import WritingCanvas from '@/components/writing/writing-canvas.vue'
import { playAudio } from '@/composables/use-audio'
import { useFurigana } from '@/composables/use-furigana'
import { useLevel } from '@/composables/use-level'
import { ROUTES } from '@/constants'
import { cacheBundle, enqueueAnswer, readBundle, requestPersistence } from '@/offline/db'
import { flush, onSyncChange, startSync } from '@/offline/sync'
import { useLanguageStore } from '@/store/language'

const route = useRoute()

/**
 * `?mode=due` / `?mode=new`.
 *
 * Without it, "Due now" and "Not yet seen" on the progress page both landed on
 * the same mixed queue — two different numbers pointing at one undifferentiated
 * page, which tells the reader nothing about either.
 */
const requestedMode = route.query.mode === 'due' || route.query.mode === 'new'
  ? route.query.mode
  : null

/**
 * Study means NEW. Reviews live on Due now.
 *
 * This used to default to `mixed`, which served due cards alongside new ones —
 * and because due cards are taken first and new ones only get what is left of
 * the session limit, a reader with a normal backlog got a queue of nothing but
 * material they had already seen. Studying stopped introducing anything.
 *
 * The two surfaces now mean two different things, which is the only way either
 * number on the progress page is worth showing: Study brings you what you have
 * never met, Due now brings back what the scheduler asked for.
 */
const mode = ref<'due' | 'new'>(requestedMode ?? 'new')

/**
 * A session entered for one purpose, not the open-ended deck picker.
 *
 * Keyed on the URL having NAMED a mode, not on the mode's value. Deriving it
 * from the mode would mean the ordinary Study page — now `new` by default —
 * counted as focused, and focused sessions hide the deck and level pickers.
 */
const focused = ref(requestedMode !== null)

const focusLabel = computed(() =>
  mode.value === 'due' ? "Reviewing what's due" : 'Learning new cards')

const focusHint = computed(() =>
  mode.value === 'due'
    ? 'Only cards the scheduler asked for. Nothing new is mixed in.'
    : 'Only cards you have never seen. Nothing you already know is mixed in.')

const router = useRouter()

/**
 * Leave the focused session for the ordinary deck picker.
 *
 * Clearing the query is enough — `mode` follows it, the queue reloads, and the
 * deck dropdown comes back.
 */
function clearFocus() {
  mode.value = 'new'
  focused.value = false
  void router.replace({ query: {} })
  void load()
}

const lang = useLanguageStore()
const { mode: furiganaMode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()

// Which deck to study. Remembered, because you usually pick up where you left
// off rather than re-choosing every session.
const decks = ref<StudyDeck[]>([])
const deckId = useLocalStorage('go-deck', 'all')

/**
 * Which JLPT level to study, remembered like the deck.
 *
 * Everything is levelled at import, but nothing filtered on it, so a queue for
 * someone starting at N5 could serve N1 vocabulary. Empty means every level,
 * which stays the default — the filter is there for people who want it, not a
 * gate on the corpus.
 */
// Shared with Grammar, Progress and anywhere else that filters by level.
const { level: levelCode, loadLevel } = useLevel()

// `?level=N5` from the course page wins over the remembered choice, so
// following "Continue" lands where the course said it would.
if (typeof route.query.level === 'string' && route.query.level)
  levelCode.value = route.query.level

const levelOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All levels' },
  ...(lang.current?.levels ?? []).map(l => ({ value: l.code, label: l.code }))
])

const levelIcon = GraduationCap

// Readings are chosen in Settings, not here. A second picker for the same
// value was one control too many on a screen that already carries three.

function selectLevel(code: string) {
  levelCode.value = code
  // Both have to be refetched: the deck counts are per level, and a deck can
  // disappear entirely at a level that has none of it.
  void loadDecks().then(load)
}
const activeDeck = computed(() => decks.value.find(d => d.id === deckId.value))

const deckOptions = computed<DropdownOption[]>(() => {
  const groups: StudyDeck['group'][] = ['kind', 'script', 'scenario']
  return groups.flatMap(group => decks.value
    .filter(d => d.group === group)
    .map(d => ({
      value: d.id,
      label: d.label,
      // "done" only when there is genuinely nothing left. A deck the
      // curriculum has not reached also reports 0 due and 0 unseen, and
      // calling that finished told the reader they had completed 127 grammar
      // cards they had never seen.
      hint: d.due > 0
        ? `${d.due} due`
        : d.unseen > 0
          ? `${d.unseen} new`
          : d.locked > 0 ? 'later' : 'done',
      tooltip: [
        d.description,
        d.locked > 0 && d.due === 0 && d.unseen === 0
          ? `${d.locked} of these open further along the course`
          : `${d.total} cards · ${d.due} due · ${d.unseen} ready to start`
      ].filter(Boolean).join(' — '),
      tooltipPosition: 'right' as const
    })))
})

const deckIcon = Layers

// Offline state, shown in the header strip so a queued answer is never a
// silent mystery.
const sync = ref<SyncState>({ pending: 0, dead: 0, online: navigator.onLine, syncing: false, lastSyncedAt: null })
let stopSync: (() => void) | undefined
let stopSyncListener: (() => void) | undefined

const items = ref<StudyQueueItem[]>([])
const index = ref(0)
const counts = ref({ due: 0, learning: 0, newAvailable: 0, ghost: 0 })

/**
 * Curriculum position, one entry per unfinished level.
 *
 * Without it the gate is invisible: new cards simply stop arriving and nothing
 * explains that it is a stage boundary rather than an empty corpus.
 */
const progress = ref<StageProgress[]>([])

/**
 * Why this deck has no new cards, when the curriculum is the reason.
 *
 * Distinct from an empty deck, and the difference matters: "nothing due" plus
 * a Refresh button is wrong twice over when the material exists and refreshing
 * will never produce it.
 */
const gate = ref<StudyQueueResponse['gate']>(null)

/** The level being studied, or the earliest unfinished one when showing all. */
const stage = computed(() =>
  progress.value.find(p => p.level === levelCode.value) ?? progress.value[0])

/**
 * The stage you just finished, while the congratulation is on screen.
 *
 * Advancing a stage was completely silent. The only sign was the counter in the
 * header changing denominator — 48/50 becoming 0/50 — which reads as the app
 * losing your progress rather than granting you the next set. It is the one
 * genuine milestone in the whole loop and it went unremarked.
 *
 * Progress only refreshes when the queue reloads, so this fires at the end of a
 * batch. That is the moment the app actually learns the stage moved; announcing
 * it earlier would mean guessing.
 */
const stageUp = ref<{ level: string, from: number, to: number, stages: number } | null>(null)

/**
 * The stage this reader was last SHOWN, per level.
 *
 * Persisted, because the first version compared against the previous value of a
 * reactive ref and so could only ever notice a change that happened while the
 * page was open. `progress` refreshes on queue reload, so catching it meant
 * finishing a whole queue at the exact moment the stage tipped; cross a stage
 * and close the app, and on return `previous` is undefined and the guard drops
 * the event silently. That is the common case, and it is why the celebration
 * never appeared.
 *
 * Comparing against what was last shown instead means the transition survives a
 * reload, a background, and a week away.
 */
const seenStage = useLocalStorage<Record<string, number>>('go-seen-stage', {})

watch(stage, (next) => {
  if (!next)
    return
  const before = seenStage.value[next.level]
  // Record first, so a failure to render cannot re-fire this every reload.
  seenStage.value = { ...seenStage.value, [next.level]: next.stage }

  // Nothing remembered yet: this is the first look at the level, not an
  // advance. Celebrating here would congratulate a brand new account.
  if (before === undefined || next.stage <= before)
    return

  stageUp.value = { level: next.level, from: before, to: next.stage, stages: next.stages }
}, { immediate: true })

/**
 * The "not yet" explanation, assembled here rather than in the template.
 *
 * Built as a string because the markup version put the comma on its own line
 * whenever the formatter reflowed it, and Vue renders that as a space before
 * the punctuation — "stage 12 , and you are on stage 1".
 */
const gateSentence = computed(() => {
  const g = gate.value
  if (!g)
    return ''
  const cards = `${g.waiting} ${g.waiting === 1 ? 'card' : 'cards'}`
  const where = stage.value ? `, and you are on stage ${stage.value.stage}` : ''
  return `${cards} here open at stage ${g.opensAtStage}${where}. `
    + 'The course introduces material in order, so these are waiting rather than missing.'
})

/** Decks that still have something to do, for the "what next" prompt. */
const decksWithWork = computed(() =>
  decks.value.filter(d => d.id !== deckId.value && d.id !== 'all' && (d.due + d.learning + d.unseen) > 0))
const loading = ref(true)
const errorMsg = ref('')

const answer = ref('')
const revealed = ref(false)
const wasCorrect = ref(false)
const expected = ref('')
const answerInput = ref<HTMLInputElement>()
const rated = ref(false)

const sessionSeen = ref(0)
const sessionCorrect = ref(0)
const startedAt = ref(Date.now())
const shownAt = ref(Date.now())

/**
 * FSRS ratings offered after the answer is revealed.
 *
 * `Again` is chosen automatically on a miss — nobody should have to grade
 * themselves as wrong twice. On a hit, `Good` is the default and Hard/Easy are
 * one keystroke away, so the common case stays a single Enter.
 */
const RATINGS = [
  { value: 2 as const, label: 'Hard', key: '1' },
  { value: 3 as const, label: 'Good', key: '2' },
  { value: 4 as const, label: 'Easy', key: '3' }
]

const current = computed<StudyQueueItem | undefined>(() => items.value[index.value])
// Kana prompts carry `character`, word prompts carry `word`. One display slot.
const character = computed(() => String(
  current.value?.prompt?.character ?? current.value?.prompt?.word ?? current.value?.prompt?.component ?? ''
))
const subLabel = computed(() => String(current.value?.prompt?.reading ?? ''))
const scriptLabel = computed(() => String(current.value?.prompt?.script ?? current.value?.kind ?? ''))
const isChoice = computed(() => current.value?.inputMode === 'choice')

/**
 * Handwriting cards.
 *
 * The `writing` facet carries its reference strokes in the prompt's assets, so
 * a scheduled writing review grades on the device with no extra request — the
 * same path an offline review takes.
 */
const isCanvas = computed(() => current.value?.inputMode === 'canvas')

/**
 * Cloze cards: a sentence with one word removed.
 *
 * Ruby on the context comes precomputed from the import — the same rule as
 * everywhere else. The blank itself never carries ruby, for the obvious reason.
 */
const isCloze = computed(() => current.value?.prompt?.kind === 'cloze')

/**
 * Grammar cloze: a pre-blanked sentence rather than before/after halves.
 *
 * The blank is already in the string as ＿＿＿＿, so there is nothing to
 * assemble — but it is a THIRD prompt shape, and the view previously rendered
 * nothing at all for it.
 */
/**
 * The example sentence, shown whole.
 *
 * Empty on a cloze, because a cloze prompt carries BOTH the before/after halves
 * and the complete `sentence`. Rendering the complete one under the blank
 * printed the answer the card was asking for.
 */
const grammarSentence = computed(() => {
  if (isCloze.value)
    return ''
  const value = current.value?.prompt?.sentence
  return typeof value === 'string' ? value : ''
})
const grammarPoint = computed(() => {
  const value = current.value?.prompt?.point ?? current.value?.prompt?.pattern
  return typeof value === 'string' ? value : ''
})

/** A grammar sentence with the blank already in it, rather than before/after halves. */
const grammarBlank = computed(() => {
  const value = current.value?.prompt?.sentence
  return current.value?.prompt?.kind === 'grammar' && typeof value === 'string' ? value : ''
})

/**
 * Whether to name the pattern before the answer is given.
 *
 * On a review card the pattern IS the answer, so showing it hands the card
 * over. On a card never seen there is nothing to hand over: the reader has not
 * been taught this pattern yet, and asking them to produce it is a guess, not
 * a test. A first exposure introduces; every one after it examines.
 */
const teaching = computed(() => Boolean(current.value?.isNew))
const grammarGloss = computed(() => {
  const value = current.value?.prompt?.gloss
  return typeof value === 'string' ? value : ''
})

/**
 * Word-order cards: rebuild a sentence from shuffled tiles.
 *
 * Tap to place, tap a placed tile to take it back. The arranged tiles are
 * joined with no separator, because that is how Japanese is written and it is
 * what the `sequence` grader compares against.
 */
const isOrdering = computed(() => current.value?.inputMode === 'ordering')

/**
 * Sound-series cards: which on-reading does this component predict?
 *
 * The examples are shown with the question, because the rule IS the pattern —
 * asking for 青's reading without 晴・清・静 in front of you is just a
 * vocabulary test with extra steps.
 */
const isSeries = computed(() => current.value?.prompt?.kind === 'sound-series')

/**
 * A scripted conversation.
 *
 * Unlike every other card this is not one question — it walks its own turns
 * and grades each learner turn as it reaches them, then reports a single
 * result. It therefore bypasses `gradeAnswer` entirely, the way handwriting
 * already does: the shared grader returns one boolean and one canonical
 * string, and a wrong reply has to carry the reason it is wrong.
 */
const isDialogue = computed(() => current.value?.prompt?.kind === 'dialogue')

const dialogueTurns = computed(() => {
  const turns = current.value?.prompt?.turns
  return Array.isArray(turns) ? turns as DialogueTurn[] : []
})
const seriesExamples = computed<string[]>(() => {
  const examples = current.value?.prompt?.examples
  return Array.isArray(examples) ? examples.map(String) : []
})
// Joined with an ideographic space (U+3000), written as an escape so the
// source has no invisible full-width character in it.
const seriesExampleText = computed(() => seriesExamples.value.join('\u3000'))
const seriesReliability = computed(() => {
  const value = current.value?.prompt?.reliability
  return typeof value === 'number' ? Math.round(value * 100) : null
})
const orderTiles = computed<string[]>(() => {
  const tokens = current.value?.prompt?.tokens
  return Array.isArray(tokens) ? tokens.map(String) : []
})
/**
 * Per-tile furigana, keyed by the tile's own text.
 *
 * The tiles were bare strings, so a sentence containing 静か gave the reader
 * no way in — and unlike the cloze, there is no blank whose reading could be
 * hinted. Keyed by surface because the tiles arrive shuffled.
 */
const tileFurigana = computed<Record<string, FuriganaSegment[]>>(() => {
  const value = current.value?.prompt?.tokenFurigana
  return value && typeof value === 'object' ? value as Record<string, FuriganaSegment[]> : {}
})

/** Indices into orderTiles, in the order the reader placed them. */
const placed = ref<number[]>([])

function placeTile(index: number) {
  if (revealed.value || placed.value.includes(index))
    return
  placed.value.push(index)
  answer.value = placed.value.map(i => orderTiles.value[i]).join('')
}

function removeTile(position: number) {
  if (revealed.value)
    return
  placed.value.splice(position, 1)
  answer.value = placed.value.map(i => orderTiles.value[i]).join('')
}
/**
 * The cloze context, cut into tappable words.
 *
 * Only the sentence AROUND the blank. The word under test is deliberately not
 * glossable: on a reading or meaning card its meaning is the answer, so a tap
 * would hand the card over. The sentence it sits in is there to be understood.
 */
const clozeBeforeTokens = computed(() => (current.value?.prompt?.beforeTokens ?? []) as GlossedToken[])
const clozeAfterTokens = computed(() => (current.value?.prompt?.afterTokens ?? []) as GlossedToken[])

/** Which context word is open: which half, which token, and its meaning. */
const pickedWord = ref<{ half: 'before' | 'after', index: number, word: WordGloss } | null>(null)

function pickWord(half: 'before' | 'after', tokens: GlossedToken[], index: number | null) {
  const word = index === null ? null : tokens[index]?.w
  pickedWord.value = word && index !== null ? { half, index, word } : null
}

function selectedIn(half: 'before' | 'after'): number | null {
  return pickedWord.value?.half === half ? pickedWord.value.index : null
}

const clozeBefore = computed(() => (current.value?.prompt?.beforeFurigana ?? []) as FuriganaSegment[])
const clozeAfter = computed(() => (current.value?.prompt?.afterFurigana ?? []) as FuriganaSegment[])
const clozeTranslation = computed(() => {
  const value = current.value?.prompt?.translation
  return typeof value === 'string' ? value : ''
})

/**
 * Whether to put furigana on the prompt.
 *
 * Never before the reveal on a reading card: the furigana IS the answer there,
 * so showing it would hand over exactly what the card is testing. After the
 * reveal it stops being a giveaway and starts being the lesson.
 */
const showFurigana = computed(() =>
  furiganaMode.value !== 'off' && (revealed.value || current.value?.facet !== 'reading'))
const referenceStrokes = computed<ReferenceStroke[]>(() => {
  const strokes = current.value?.assets?.strokes
  return Array.isArray(strokes) ? strokes as ReferenceStroke[] : []
})
const canvas = ref<InstanceType<typeof WritingCanvas> | null>(null)
const drawnStrokes = ref<Stroke[]>([])
const handwriting = ref<HandwritingGrade | null>(null)
const showGuide = ref(false)

const HANDWRITING_ISSUE_TEXT: Record<string, string> = {
  'too-few-strokes': 'Missing a stroke',
  'too-many-strokes': 'One stroke too many',
  'stroke-order': 'Written out of order',
  'stroke-direction': 'A stroke went the wrong way',
  'stroke-shape': 'A stroke is off shape'
}

/**
 * Options for a multiple-choice card, shuffled once per card.
 *
 * Shuffled on reveal-independent state so the correct answer isn't always in
 * the same position — otherwise you learn the position, not the word.
 */
const choices = ref<string[]>([])
function buildChoices() {
  const item = current.value
  if (!item || item.inputMode !== 'choice') {
    choices.value = []
    return
  }
  const options = [item.answer.primary, ...item.distractors.map(d => String(d))]
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j]!, options[i]!]
  }
  choices.value = options
}
/**
 * The card illustration, where one has been drawn.
 *
 * Only ~3% of vocabulary has one, so the layout must not reserve space for a
 * picture that usually is not there — an empty frame on most cards would look
 * broken rather than sparse.
 */
const imageSrc = computed(() => {
  const src = current.value?.assets?.image
  return typeof src === 'string' ? src : ''
})

/**
 * Whether the card is asking for the English meaning.
 *
 * A drawing of coins beside the options "and / summer vacation / money /
 * overseas student" is not decoration, it is the answer. Decided from the
 * expected answer's own script rather than from the facet name: if what you
 * have to produce is Japanese, a picture of the thing gives nothing away, and
 * if it is English, it gives away everything.
 */
const answerIsEnglish = computed(() => {
  const primary = current.value?.answer?.primary
  return typeof primary === 'string' && scriptOf(primary) === 'other'
})

/**
 * What sits behind the card.
 *
 * The word's own drawing wins where there is one, because it is about this
 * exact card — except on cloze and ordering drills, where the picture would
 * hand over the sentence. Otherwise the deck's scene fills in, so every card in
 * "At a konbini" is quietly set in a convenience store.
 */
const cardArt = computed(() => {
  // Once the answer is on screen there is nothing left to give away, so every
  // word that HAS a drawing shows it — including the cards that must withhold
  // it while the question stands.
  //
  // Those exclusions are all about spoilers, not taste: on a meaning card the
  // drawing IS the answer, and on a cloze or an ordering drill it hands over
  // the sentence. Before the reveal that rules out roughly three cards in five;
  // after it, none. Nine hundred drawings were otherwise sitting unused on the
  // majority of the cards that reference them.
  if (imageSrc.value && (revealed.value || (!isCloze.value && !isOrdering.value && !answerIsEnglish.value)))
    return imageSrc.value
  return focused.value ? '' : (activeDeck.value?.imageUrl ?? '')
})

/**
 * How strongly the backdrop reads.
 *
 * Faint while the question stands so the prompt keeps the eye; stronger once
 * answered, because at that point the picture is the reward rather than a
 * distraction — and at 0.09 it was barely visible enough to count as shown.
 */
const cardArtOpacity = computed(() =>
  revealed.value && imageSrc.value
    ? 'var(--card-art-opacity-revealed)'
    : 'var(--card-art-opacity)')

/** Whether the illustration is open full screen. */
const artOpen = ref(false)

/**
 * Open the picture from anywhere on the card.
 *
 * The backdrop image is absolutely positioned under the content, so the only
 * part of it a tap could ever reach was the thin padding ring around the edge —
 * clicking "the card" did nothing. Listening on the card instead, and ignoring
 * taps that landed on a control, means the obvious gesture works without the
 * image swallowing clicks meant for the answer input or the rating buttons.
 */
function openArt(event: MouseEvent) {
  if (!cardArt.value)
    return
  const target = event.target as HTMLElement | null
  if (target?.closest('button, a, input, textarea, select, label, canvas'))
    return
  artOpen.value = true
}

/**
 * What the input should say it wants.
 *
 * A cloze card's instruction is "Fill in the blank", which does not say whether
 * the grader expects kana, katakana or kanji — and the grader accepts only the
 * surface forms in `accepted`, so guessing the wrong script fails a card the
 * reader actually knew. Derived from those accepted forms rather than stated
 * per prompt, so it cannot drift away from what is really being checked.
 */
const inputHint = computed(() => {
  const instruction = current.value?.prompt?.instruction
  const accepted = current.value?.answer?.accepted ?? []

  // Any prompt that blanks part of a sentence needs the script named. That is
  // the cloze shape AND the grammar shape, whose `kind` is 'grammar' but whose
  // instruction is the same unhelpful "Fill the blank".
  const blanks = isCloze.value || Boolean(grammarBlank.value)
  if (typeof instruction === 'string' && !blanks)
    return instruction

  const described = describeScript(accepted)
  if (described === 'Your answer')
    return typeof instruction === 'string' ? instruction : 'Your answer'
  return described
})

const audioSrc = computed(() => {
  const src = current.value?.assets?.audio
  return typeof src === 'string' ? src : ''
})
const finished = computed(() => !loading.value && !current.value)
const accuracy = computed(() =>
  sessionSeen.value === 0 ? 0 : Math.round((sessionCorrect.value / sessionSeen.value) * 100))
const minutes = computed(() => {
  const mins = Math.round((Date.now() - startedAt.value) / 60000)
  return mins < 1 ? 'under a minute' : `${mins} ${mins === 1 ? 'minute' : 'minutes'}`
})

function play() {
  // A missing clip should not break the session — the drill is the text.
  playAudio(audioSrc.value)
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  // Before the request, not after: the old card's verdict must not survive
  // even the moment the new queue is in flight.
  resetCard()
  try {
    // A focused session ignores the remembered deck. Applying both narrowed
    // "everything due" down to whatever deck was last picked — the page said
    // 3 due and handed over 0, because the deck filter was still on underneath
    // a session the reader had no way of knowing was filtered.
    const deck = focused.value ? undefined : activeDeck.value
    const cacheKey = `${lang.code}:${mode.value}:${levelCode.value}:${deck?.kind ?? ''}:${deck?.unit ?? ''}`
    const queue = await getQueue({
      languageCode: lang.code,
      mode: mode.value,
      limit: 20,
      ...(levelCode.value ? { level: levelCode.value } : {}),
      ...(deck?.kind ? { kind: deck.kind } : {}),
      ...(deck?.unit ? { unit: deck.unit } : {})
    })
    items.value = queue.items
    counts.value = queue.counts
    progress.value = queue.progress
    gate.value = queue.gate
    index.value = 0
    // Keep the last good queue so a session survives losing signal mid-way.
    await cacheBundle(cacheKey, { items: queue.items, counts: queue.counts })
    await focusInput()
  } catch {
    // Offline, or the server is unreachable: fall back to the cached bundle
    // rather than showing an error over a perfectly usable session.
    const deck = focused.value ? undefined : activeDeck.value
    const cached = await readBundle(`${lang.code}:${mode.value}:${levelCode.value}:${deck?.kind ?? ''}:${deck?.unit ?? ''}`)
    if (cached && cached.items.length > 0) {
      items.value = cached.items
      counts.value = cached.counts
      index.value = 0
      // Say so when the cache is standing in while the network is fine. A
      // silent fallback masked a server error that made the whole curriculum
      // gate look like it had no effect — the page kept showing cards the
      // server had stopped returning, and nothing said why.
      errorMsg.value = navigator.onLine
        ? 'Showing your last saved queue — the server did not respond.'
        : ''
      await focusInput()
    } else {
      errorMsg.value = navigator.onLine
        ? 'Could not load your queue.'
        : "You're offline and this deck isn't cached yet."
    }
  } finally {
    loading.value = false
  }
}

async function focusInput() {
  buildChoices()
  await nextTick()
  if (!isChoice.value && !isCanvas.value && !isOrdering.value)
    answerInput.value?.focus()
}

function choose(option: string) {
  if (revealed.value)
    return
  answer.value = option
  check()
}

function check() {
  const item = current.value
  if (!item || revealed.value)
    return

  // A dialogue grades itself as it goes — see onDialogueFinished. Nothing to
  // submit here, and falling through would grade the dialogue's code string
  // against an empty input.
  if (isDialogue.value)
    return

  // Handwriting is the one exercise with a real continuous score, so its
  // rating is derived rather than self-reported — judging your own handwriting
  // is exactly what the grader exists to replace.
  if (isCanvas.value) {
    if (drawnStrokes.value.length === 0)
      return
    const grade = gradeHandwriting(drawnStrokes.value, referenceStrokes.value.map(r => samplePath(r.path)))
    handwriting.value = grade
    wasCorrect.value = grade.passed
    expected.value = item.answer.primary
    revealed.value = true
    sessionSeen.value += 1
    if (grade.passed)
      sessionCorrect.value += 1
    play()
    void submitRating(ratingFromGrade(grade))
    return
  }

  const result = gradeAnswer(item.graderCode, answer.value, item.answer)
  wasCorrect.value = result.correct
  expected.value = result.expected
  revealed.value = true
  sessionSeen.value += 1
  if (result.correct)
    sessionCorrect.value += 1

  // Hearing it at the moment of feedback is when it sticks.
  play()

  // A miss is always Again — there is nothing to self-grade. A hit waits for
  // the rating, which defaults to Good on Enter.
  if (!result.correct)
    void submitRating(1)
}

/**
 * A finished conversation.
 *
 * The rating comes from how much of it went right, not from self-report: the
 * card already knows, and asking again would be asking someone to mark their
 * own paper when the marking has been done.
 */
function onDialogueFinished(result: { correct: number, total: number }) {
  const share = result.total === 0 ? 1 : result.correct / result.total
  wasCorrect.value = share >= 0.8
  expected.value = ''
  revealed.value = true
  sessionSeen.value += 1
  if (wasCorrect.value)
    sessionCorrect.value += 1

  // Same bands the handwriting grade uses, for the same reason: a near-miss
  // and a shambles should not schedule identically.
  void submitRating(share >= 0.95 ? 4 : share >= 0.8 ? 3 : share >= 0.5 ? 2 : 1)
}

async function submitRating(rating: 1 | 2 | 3 | 4) {
  const item = current.value
  if (!item || rated.value)
    return
  rated.value = true
  await send(item, rating, wasCorrect.value)
}

/**
 * Record an answer.
 *
 * Written to the local queue FIRST, always — durability before the network.
 * The flush is then fire-and-forget: online it lands in milliseconds, offline
 * it waits for the next reconnect or tab focus. Either way the session never
 * blocks on a request.
 */
async function send(item: StudyQueueItem, rating: 1 | 2 | 3 | 4, correct: boolean) {
  try {
    await enqueueAnswer({
      id: uuidv7(),
      facetId: item.facetId,
      rating,
      reviewedAt: new Date().toISOString(),
      durationMs: Math.max(0, Date.now() - shownAt.value),
      answerGiven: answer.value,
      isCorrect: correct,
      hintsUsed: 0,
      offline: !navigator.onLine
    })
    void flush()
  } catch {
    errorMsg.value = 'That answer could not be saved locally.'
  }
}

/**
 * Clear everything that belongs to the card on screen.
 *
 * Called from `next()` AND from `load()`. Only `next()` used to do it, so
 * changing deck or level after a wrong answer swapped in a new card while
 * leaving the old verdict and the old typed answer underneath it — "Not quite,
 * it's ああ" sitting under an entirely different character.
 */
function resetCard() {
  answer.value = ''
  revealed.value = false
  rated.value = false
  handwriting.value = null
  drawnStrokes.value = []
  placed.value = []
  showGuide.value = false
  canvas.value?.clear()
  // A meaning left open would hang over the next card, describing a word that
  // is no longer on screen — the same class of bug as the verdict that used to
  // survive a deck change.
  pickedWord.value = null
  shownAt.value = Date.now()
}

/** Whether there is an earlier card in this queue to go back to. */
const canGoBack = computed(() => index.value > 0)

/**
 * Step back to the card before this one.
 *
 * Bounded by the queue in memory, not by history: `next()` reloads at the end
 * of a queue and resets the index, so "back" cannot reach across that boundary
 * and there is nothing to go back TO once it happens.
 */
function back() {
  if (index.value === 0)
    return
  resetCard()
  index.value -= 1
  void focusInput()
}

/**
 * Move on without answering.
 *
 * Deliberately NOT `next()`. That one banks a revealed-but-unrated correct
 * answer as Good so that hitting Enter never loses a review — which is right
 * for finishing a card and wrong for abandoning one. Skipping must record
 * nothing at all: no rating, no review log, no change to the card's schedule.
 *
 * The card is not removed from the queue either, so it comes back around on a
 * later session exactly as if it had never been shown.
 */
async function skip() {
  resetCard()
  index.value += 1
  if (index.value >= items.value.length) {
    await load()
    return
  }
  await focusInput()
}

async function next() {
  // A revealed-but-unrated correct answer still counts as Good, so skipping
  // ahead never silently loses a review.
  if (revealed.value && wasCorrect.value && !rated.value)
    void submitRating(3)
  resetCard()
  index.value += 1
  if (index.value >= items.value.length) {
    await load()
    return
  }
  await focusInput()
}

function onEnter() {
  if (revealed.value)
    void next()
  else check()
}

/**
 * Keyboard-first: the loop is Enter, Enter, Enter. 1/2/3 grade a correct
 * answer, and space replays the audio without leaving the field.
 */
function onKey(e: KeyboardEvent) {
  if (!revealed.value)
    return
  const rating = RATINGS.find(r => r.key === e.key)
  if (rating && wasCorrect.value) {
    e.preventDefault()
    void submitRating(rating.value)
    void next()
    return
  }
  if (e.key === ' ' && audioSrc.value) {
    e.preventDefault()
    play()
  }
}

async function loadDecks() {
  try {
    const data = await getDecks(lang.code, levelCode.value || undefined)
    decks.value = data.decks
    // A remembered deck can vanish when content or the language changes.
    if (!data.decks.some(d => d.id === deckId.value))
      deckId.value = 'all'
  } catch {
    decks.value = []
  }
}

async function selectDeck(id: string) {
  deckId.value = id || 'all'
  sessionSeen.value = 0
  sessionCorrect.value = 0
  startedAt.value = Date.now()
  await load()
}

onMounted(async () => {
  // Cached value renders now; the stored one replaces it when it lands.
  void loadLevel()
  window.addEventListener('keydown', onKey)
  void requestPersistence()
  void loadKnownKanji(lang.code)
  void loadSettings()
  stopSyncListener = onSyncChange((next) => {
    sync.value = next
  })
  stopSync = startSync()
  await loadDecks()
  await load()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  stopSync?.()
  stopSyncListener?.()
})
watch(() => lang.code, async () => {
  await loadDecks()
  await load()
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-6 py-12">
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <!--
          In a focused session the deck picker is hidden on purpose. Leaving it
          there made a due review indistinguishable from an ordinary session:
          the same dropdown, the same "N new" in the counts, and one tap away
          from silently wandering back into everything.
        -->
        <template v-if="focused">
          <span class="inline-flex items-center gap-2 rounded-full border border-[var(--color-text)] px-3 py-1.5 text-sm">
            {{ focusLabel }}
            <button
              type="button"
              class="text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              aria-label="Leave this session and study everything"
              @click="clearFocus"
            >
              &times;
            </button>
          </span>
          <span class="text-sm text-[var(--color-muted)]">
            <template v-if="mode === 'due'">
              {{ counts.due }} due
              <template v-if="counts.learning > 0"> &middot; {{ counts.learning }} learning</template>
            </template>
            <template v-else>{{ counts.newAvailable }} new</template>
          </span>
        </template>

        <template v-else>
          <Dropdown
            :model-value="deckId"
            :options="deckOptions"
            :icon="deckIcon"
            header="What to study"
            placeholder="Choose a deck"
            width-class="w-60"
            @update:model-value="selectDeck"
          />
          <!-- Level sits beside the deck because they narrow the same queue in
               different directions: one by content type, one by difficulty. -->
          <Dropdown
            v-if="levelOptions.length > 1"
            :model-value="levelCode"
            :options="levelOptions"
            :icon="levelIcon"
            header="Level"
            placeholder="All levels"
            width-class="w-36"
            @update:model-value="selectLevel"
          />

          <!--
            All three now count the same way and over the same set: cards, and
            only those the pickers to the left admit. `due` and `learning` used
            to be language-wide while `new` respected the pickers, so the row
            silently mixed scopes and the numbers could not be compared.
          -->
          <Tooltip
            :content="`${counts.due} review card${counts.due === 1 ? '' : 's'} ready · ${counts.learning} still on the short learning steps · ${counts.newAvailable} never seen. Cards, not words — one word can have several. Counted within the filters shown.`"
            position="bottom"
          >
            <span class="text-sm text-[var(--color-muted)]">
              {{ counts.due }} due
              <template v-if="counts.learning > 0"> &middot; {{ counts.learning }} learning</template>
              &middot; {{ counts.newAvailable }} new
            </span>
          </Tooltip>
        </template>

        <!-- Where you are in the course. New cards come from this stage only;
             the next opens once this one is mostly retained. -->
        <Tooltip
          v-if="stage"
          :content="`New cards are drawn from stage ${stage.stage} only. Stage ${stage.stage + 1} opens once most of this one has stuck. The fraction counts CARDS in this stage that have graduated, and every one of the ${stage.total} must graduate before stage ${stage.stage + 1} opens.`"
          position="bottom"
        >
          <span class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <span>{{ stage.level }} &middot; stage {{ stage.stage }}/{{ stage.stages }}</span>
            <span class="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border)]">
              <span
                class="block h-full rounded-full bg-[var(--color-accent)]"
                :style="{ width: `${Math.round((stage.learned / Math.max(stage.total, 1)) * 100)}%` }"
              />
            </span>
            <!--
              Labelled, because a bare "0/50" next to "stage 2/60" reads as a
              second, contradictory stage count. It is neither: it is how much
              of THIS stage has stuck, and it resets each time a stage opens.
            -->
            <span>{{ stage.learned }}/{{ stage.total }} cards</span>
          </span>
        </Tooltip>
        <span v-if="sessionSeen > 0" class="ml-auto text-sm text-[var(--color-muted)]">
          {{ sessionCorrect }}/{{ sessionSeen }} this session
        </span>
        <span
          v-if="!sync.online || sync.pending > 0 || sync.dead > 0"
          class="rounded-full border px-2.5 py-1 text-xs"
          :class="sync.dead > 0 ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
        >
          <template v-if="sync.dead > 0">{{ sync.dead }} couldn't sync</template>
          <template v-else-if="!sync.online">Offline &middot; {{ sync.pending }} saved here</template>
          <template v-else-if="sync.syncing">Syncing…</template>
          <template v-else>{{ sync.pending }} to sync</template>
        </span>
      </div>
      <p v-if="focused" class="mb-6 text-sm text-[var(--color-muted)]">
        {{ focusHint }}
      </p>
      <p v-else-if="activeDeck?.description" class="mb-6 text-sm text-[var(--color-muted)]">
        {{ activeDeck.description }}
      </p>

      <p v-if="loading" class="text-center text-[var(--color-muted)]">
        Loading…
      </p>

      <div v-else-if="finished" class="rounded-xl border border-[var(--color-border)] p-10 text-center">
        <template v-if="gate">
          <p class="text-2xl font-semibold">
            Not yet — this comes later.
          </p>
          <p class="mx-auto mt-3 max-w-md text-sm text-[var(--color-muted)]">
            {{ gateSentence }}
          </p>
        </template>
        <p v-else class="text-2xl font-semibold">
          {{ mode === 'new' ? 'Nothing new right now.' : 'Nothing due right now.' }}
        </p>
        <!--
          Study only ever serves new material now, so running out of it is not
          the same as having nothing to do — and the reader has no way to tell
          unless the empty state says where the rest of the work went.
        -->
        <p v-if="mode === 'new' && !gate && counts.due > 0" class="mx-auto mt-3 max-w-md text-sm text-[var(--color-muted)]">
          You have met everything available at this level for now.
          <router-link :to="`${ROUTES.STUDY}?mode=due`" class="underline">
            {{ counts.due }} {{ counts.due === 1 ? 'card is' : 'cards are' }} due for review.
          </router-link>
        </p>
        <p v-if="counts.learning > 0 && !gate" class="mx-auto mt-3 max-w-md text-sm text-[var(--color-muted)]">
          {{ counts.learning }} {{ counts.learning === 1 ? 'card is' : 'cards are' }} still in learning
          &mdash; those come back within the hour. That short gap is deliberate: seeing something
          again minutes later is what moves it out of short-term memory.
        </p>
        <template v-if="sessionSeen > 0">
          <p class="mt-3 text-[var(--color-muted)]">
            {{ sessionCorrect }} of {{ sessionSeen }} right &middot; {{ accuracy }}% &middot; {{ minutes }}
          </p>
          <p class="mt-2 text-[var(--color-muted)]">
            Come back when the next ones are scheduled.
          </p>
        </template>
        <p v-else-if="!gate" class="mt-3 text-[var(--color-muted)]">
          Everything you've learned is still resting. Check back later.
        </p>
        <Button v-if="!gate" class="mt-6" variant="ghost" @click="load">
          Refresh
        </Button>

        <div v-if="!focused && decksWithWork.length > 0" class="mt-8 border-t border-[var(--color-border)] pt-6">
          <p class="text-sm text-[var(--color-muted)]">
            Or study something else:
          </p>
          <div class="mt-3 flex flex-wrap justify-center gap-2">
            <button
              v-for="d in decksWithWork.slice(0, 6)"
              :key="d.id"
              type="button"
              class="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm transition hover:border-[var(--color-text)]"
              @click="selectDeck(d.id)"
            >
              {{ d.label }}
              <span class="text-[var(--color-muted)]">
                {{ d.due > 0 ? `${d.due} due` : d.unseen > 0 ? `${d.unseen} new` : 'later' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-else-if="current"
        class="relative overflow-hidden rounded-xl border border-[var(--color-border)] p-8"
        :class="cardArt ? 'cursor-zoom-in' : ''"
        @click="openArt"
      >
        <!--
          The illustration is the card's backdrop, not an inset thumbnail.
          `object-contain`, not cover: the drawings are square and the card is
          tall, so covering it crops out most of the picture and leaves a
          zoomed-in slice of whatever happened to be in the middle.
          `aria-hidden` because it is decoration: the drawing IS the answer on a
          meaning card, so announcing it would give the answer away. The tap to
          enlarge is handled on the card, not here — see openArt.
        -->
        <img
          v-if="cardArt"
          :src="cardArt"
          alt=""
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain p-6 transition-opacity duration-500"
          :style="{ opacity: cardArtOpacity }"
          loading="lazy"
        >
        <div class="relative">
          <p class="text-center text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ scriptLabel }}<span v-if="current.isNew"> &middot; new</span>
          </p>

          <!-- A conversation owns the whole card: the prompt, the choices and
               the verdict are one flow, not a question with an answer box. -->
          <DialogueCard
            v-if="isDialogue"
            :title="String(current.prompt?.title ?? '')"
            :situation="String(current.prompt?.situation ?? '')"
            :turns="dialogueTurns"
            :mode="furiganaMode"
            @finished="onDialogueFinished"
          />

          <p
            v-else-if="isCloze"
            class="mt-8 text-center text-3xl leading-relaxed"
            style="font-family: var(--font-jp)"
          >
            <!--
              TokenLine, not FuriganaText: it renders the ruby AND makes each
              word tappable for its meaning. Two components cannot own the same
              run of text, so this one does both. It falls back to the plain
              line when the backend supplied no tokens.
            -->
            <TokenLine
              v-if="clozeBeforeTokens.length"
              :tokens="clozeBeforeTokens"
              :text="String(current.prompt?.before ?? '')"
              reading=""
              :mode="furiganaMode"
              :known-kanji="knownKanji"
              :selected="selectedIn('before')"
              @pick="pickWord('before', clozeBeforeTokens, $event)"
            />
            <FuriganaText
              v-else
              :text="String(current.prompt?.before ?? '')"
              :segments="clozeBefore"
              :mode="furiganaMode"
              :known-kanji="knownKanji"
            />
            <span
              class="mx-1 inline-block min-w-[3ch] border-b-2 px-2 align-bottom"
              :class="revealed ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-muted)]'"
            >{{ revealed ? current.answer.primary : '' }}</span>
            <TokenLine
              v-if="clozeAfterTokens.length"
              :tokens="clozeAfterTokens"
              :text="String(current.prompt?.after ?? '')"
              reading=""
              :mode="furiganaMode"
              :known-kanji="knownKanji"
              :selected="selectedIn('after')"
              @pick="pickWord('after', clozeAfterTokens, $event)"
            />
            <FuriganaText
              v-else
              :text="String(current.prompt?.after ?? '')"
              :segments="clozeAfter"
              :mode="furiganaMode"
              :known-kanji="knownKanji"
            />
          </p>
          <p v-if="isCloze && clozeTranslation" class="mt-4 text-center text-sm text-[var(--color-muted)]">
            {{ clozeTranslation }}
          </p>

          <p v-if="isOrdering && clozeTranslation" class="mt-6 text-center text-lg text-[var(--color-heading)]">
            {{ clozeTranslation }}
          </p>

          <div v-if="isSeries" class="mt-4 text-center">
            <p class="text-2xl tracking-widest text-[var(--color-muted)]" style="font-family: var(--font-jp)">
              {{ seriesExampleText }}
            </p>
            <p v-if="seriesReliability !== null" class="mt-2 text-xs text-[var(--color-muted)]">
              Holds for {{ seriesReliability }}% of the characters that use it
            </p>
          </div>

          <template v-else-if="grammarSentence">
            <p class="mt-8 text-center text-2xl leading-relaxed" style="font-family: var(--font-jp)">
              {{ grammarSentence }}
            </p>
            <!-- Only AFTER the reveal. For a cloze the point IS what goes in the
               blank, so showing it up front hands over the answer. -->
            <p v-if="grammarPoint && (revealed || teaching)" class="mt-3 text-center text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
              {{ grammarPoint }}
            </p>
            <p v-if="grammarGloss" class="mt-1 text-center text-sm text-[var(--color-muted)]">
              {{ grammarGloss }}
            </p>
          </template>

          <p
            v-else-if="!isOrdering && character"
            class="mt-8 text-center leading-none"
            :class="character.length > 3 ? 'text-5xl' : 'text-8xl'"
            style="font-family: var(--font-jp)"
          >
            <FuriganaText
              v-if="showFurigana && subLabel"
              :text="character"
              :reading="subLabel"
              :mode="furiganaMode"
              :known-kanji="knownKanji"
            />
            <template v-else>
              {{ character }}
            </template>
          </p>

          <WordMeaning
            v-if="pickedWord"
            class="mt-4"
            :word="pickedWord.word"
            @close="pickedWord = null"
          />

          <p v-if="subLabel && revealed" class="mt-3 text-center text-lg text-[var(--color-muted)]" style="font-family: var(--font-jp)">
            {{ subLabel }}
          </p>
          <div class="mb-8" />

          <div v-if="audioSrc" class="mb-8 flex justify-center">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              :aria-label="`Hear ${character}`"
              @click="play"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
              Hear it
            </button>
          </div>

          <form v-if="!isDialogue" class="flex flex-col gap-4" @submit.prevent="onEnter">
            <div v-if="isChoice" class="flex flex-col gap-2">
              <button
                v-for="option in choices"
                :key="option"
                type="button"
                class="rounded-lg border px-4 py-3 text-left transition"
                :class="[
                  !revealed ? 'border-[var(--color-border)] hover:border-[var(--color-text)]' : '',
                  revealed && option === current.answer.primary ? 'border-[var(--color-success)] text-[var(--color-success)]' : '',
                  revealed && option === answer && option !== current.answer.primary ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : '',
                  revealed && option !== current.answer.primary && option !== answer ? 'border-[var(--color-border)] opacity-50' : '',
                ]"
                :disabled="revealed"
                @click="choose(option)"
              >
                {{ option }}
              </button>
            </div>

            <div v-else-if="isOrdering" class="flex flex-col gap-4">
              <!-- The line being built. Empty slots make it obvious this is an
                 arrangement rather than a text field. -->
              <div
                class="flex min-h-14 flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] p-3 text-xl"
                style="font-family: var(--font-jp)"
              >
                <button
                  v-for="(tileIndex, position) in placed"
                  :key="`placed-${position}`"
                  type="button"
                  class="rounded-md bg-[var(--color-washi)] px-2.5 py-1 transition hover:opacity-70"
                  :disabled="revealed"
                  @click="removeTile(position)"
                >
                  <FuriganaText
                    :text="orderTiles[tileIndex] ?? ''"
                    :segments="tileFurigana[orderTiles[tileIndex] ?? '']"
                    :mode="furiganaMode"
                    :known-kanji="knownKanji"
                  />
                </button>
                <span v-if="placed.length === 0" class="text-base text-[var(--color-muted)]">
                  Tap the words below
                </span>
              </div>

              <div class="flex flex-wrap gap-1.5" style="font-family: var(--font-jp)">
                <button
                  v-for="(tile, tileIndex) in orderTiles"
                  :key="`tile-${tileIndex}`"
                  type="button"
                  class="rounded-md border border-[var(--color-border)] px-3 py-2 text-xl transition"
                  :class="placed.includes(tileIndex)
                    ? 'invisible'
                    : 'hover:border-[var(--color-text)]'"
                  :disabled="revealed || placed.includes(tileIndex)"
                  @click="placeTile(tileIndex)"
                >
                  <FuriganaText
                    :text="tile"
                    :segments="tileFurigana[tile]"
                    :mode="furiganaMode"
                    :known-kanji="knownKanji"
                  />
                </button>
              </div>
            </div>

            <div v-else-if="isCanvas" class="flex flex-col gap-3">
              <WritingCanvas
                ref="canvas"
                :reference="referenceStrokes"
                :show-guide="showGuide"
                :disabled="revealed"
                @update:strokes="drawnStrokes = $event"
              />
              <div v-if="!revealed" class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm transition hover:border-[var(--color-text)]"
                  :class="showGuide ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
                  @click="showGuide = !showGuide"
                >
                  {{ showGuide ? 'Hide guide' : 'Show guide' }}
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-text)]"
                  @click="canvas?.undo()"
                >
                  Undo
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-text)]"
                  @click="canvas?.clear()"
                >
                  Clear
                </button>
              </div>
            </div>

            <input
              v-else
              ref="answerInput"
              v-model="answer"
              :readonly="revealed"
              class="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-3 text-center text-xl outline-none focus:border-[var(--color-text)]"
              :placeholder="inputHint"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
            >

            <div v-if="revealed && handwriting" class="text-center">
              <p class="font-semibold" :class="handwriting.passed ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
                {{ Math.round(handwriting.score) }}% accuracy
                <span class="ml-1 text-sm font-normal text-[var(--color-muted)]">
                  {{ handwriting.strokeCountDrawn }} of {{ handwriting.strokeCountExpected }} strokes
                </span>
              </p>
              <ul v-if="handwriting.issues.length" class="mt-1 text-sm text-[var(--color-muted)]">
                <li v-for="issue in handwriting.issues" :key="issue">
                  {{ HANDWRITING_ISSUE_TEXT[issue] ?? issue }}
                </li>
              </ul>
              <!-- Which stroke number went wrong is the part that tells you what
                 to do differently next time. -->
              <ol class="mt-2 flex flex-wrap justify-center gap-1.5">
                <li
                  v-for="stroke in handwriting.strokes"
                  :key="stroke.referenceIndex"
                  class="rounded px-1.5 py-0.5 text-xs"
                  :class="stroke.attemptIndex !== null && stroke.score >= 70
                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                    : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'"
                >
                  {{ stroke.referenceIndex + 1 }}
                </li>
              </ol>
            </div>

            <div v-else-if="revealed" class="text-center">
              <p v-if="wasCorrect" class="font-semibold text-[var(--color-success)]">
                Correct
              </p>
              <p v-else class="font-semibold text-[var(--color-danger)]">
                Not quite &mdash; it's <strong>{{ expected }}</strong>
              </p>
            </div>

            <template v-if="revealed && wasCorrect && !isCanvas">
              <div class="flex gap-2">
                <button
                  v-for="r in RATINGS"
                  :key="r.value"
                  type="button"
                  class="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm transition hover:border-[var(--color-text)]"
                  @click="submitRating(r.value); next()"
                >
                  {{ r.label }} <span class="text-[var(--color-muted)]">{{ r.key }}</span>
                </button>
              </div>
              <p class="text-center text-xs text-[var(--color-muted)]">
                Enter for Good &middot; space to replay
              </p>
            </template>
            <Button
              v-else-if="!isChoice || revealed"
              type="submit"
              variant="primary"
              :disabled="isOrdering && !revealed && placed.length !== orderTiles.length"
            >
              {{ revealed ? 'Next' : 'Check' }}
            </Button>

            <!--
              Move through the queue without answering. Quiet styling on
              purpose: this is an escape hatch from a card you do not want right
              now, not a third way to finish one.
            -->
            <div class="flex items-center justify-between pt-1">
              <button
                type="button"
                class="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] transition enabled:hover:text-[var(--color-text)] disabled:opacity-40"
                :disabled="!canGoBack"
                @click="back"
              >
                &larr; Back
              </button>
              <button
                type="button"
                class="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                @click="skip"
              >
                Skip &rarr;
              </button>
            </div>
          </form>
        </div>
      </div>

      <!--
        Reaching a new stage. Dismissible and self-closing on click: this marks
        a moment, it does not ask for a decision.
      -->
      <VueFinalModal
        :model-value="stageUp !== null"
        class="flex items-center justify-center"
        content-class="flex items-center justify-center"
        overlay-class="bg-black/60"
        :click-to-close="true"
        :esc-to-close="true"
        @update:model-value="stageUp = null"
      >
        <div
          v-if="stageUp"
          class="mx-4 max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center"
        >
          <p class="text-3xl">
            🎉
          </p>
          <p class="mt-3 text-xl font-semibold">
            Stage {{ stageUp.from }} complete
          </p>
          <p class="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
            You have retained enough of {{ stageUp.level }} stage {{ stageUp.from }},
            so stage {{ stageUp.to }} is open. New cards now come from there.
          </p>
          <p class="mt-4 text-sm text-[var(--color-muted)]">
            {{ stageUp.level }} &middot; stage {{ stageUp.to }} of {{ stageUp.stages }}
          </p>
          <Button class="mt-6" variant="primary" @click="stageUp = null">
            Keep going
          </Button>
        </div>
      </VueFinalModal>

      <!--
        The illustration, full size. VueFinalModal locks scrolling on the page
        behind it, so the card underneath cannot be scrolled away while the
        picture is open.
      -->
      <VueFinalModal
        v-model="artOpen"
        class="flex items-center justify-center"
        content-class="flex w-screen items-center justify-center"
        overlay-class="bg-black/80"
        :click-to-close="true"
        :esc-to-close="true"
      >
        <!--
          Full width of the viewport, not a boxed thumbnail. The height cap is
          the viewport's, so a square drawing on a wide desktop window still
          fits on screen instead of running off the bottom — on a phone, where
          the drawing is roughly as tall as it is wide, that cap never bites and
          the picture spans edge to edge.
        -->
        <img
          v-if="cardArt"
          :src="cardArt"
          alt=""
          class="max-h-[100dvh] w-screen cursor-zoom-out bg-white object-contain"
          @click="artOpen = false"
        >
      </VueFinalModal>

      <p v-if="errorMsg" class="mt-4 text-center text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>
    </div>
  </AppShell>
</template>
