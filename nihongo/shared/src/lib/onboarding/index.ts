import type { FuriganaMode, JlptLevel, OnboardingGoal, OnboardingMinutes, OnboardingStart } from '@/constants/endpoints.js'

import { JLPT_LEVELS } from '@/constants/endpoints.js'

/**
 * Onboarding: a minute of questions, and a start that fits the answers.
 *
 * Someone invited to go landed on Today with no idea where to begin — and a
 * learner who has never seen a kana wants a different first week from one
 * heading for N3. These turn the answers into settings and a short checklist.
 * Pure, so the welcome flow, the server and the tests agree.
 */

/** What a learner tells us, before the answers are applied. */
export interface OnboardingProfile {
  start: OnboardingStart
  goals: readonly OnboardingGoal[]
  minutes: OnboardingMinutes
  /** The level from the placement check, or the one they picked; null for a beginner. */
  level: JlptLevel | null
}

/**
 * The reading help a learner should start with.
 *
 * Someone who cannot read kana yet needs romaji to read anything at all; one
 * who reads hiragana but no kanji gets kanji spelled out in hiragana; anyone
 * further on gets readings only over kanji they have not learned.
 */
export function suggestedFurigana(start: OnboardingStart): FuriganaMode {
  if (start === 'new')
    return 'romaji'
  if (start === 'studied')
    return 'unknown-only'
  return 'kana'
}

/** How much a day's time buys: new cards a day, and cards in a session. */
const PACE: Record<OnboardingMinutes, { dailyNewLimit: number, sessionLength: number }> = {
  5: { dailyNewLimit: 5, sessionLength: 10 },
  15: { dailyNewLimit: 10, sessionLength: 20 },
  30: { dailyNewLimit: 15, sessionLength: 30 },
  60: { dailyNewLimit: 25, sessionLength: 50 }
}

export function paceFor(minutes: OnboardingMinutes): { dailyNewLimit: number, sessionLength: number } {
  return PACE[minutes]
}

/** The level to study at: the placed one, or N5 for anyone starting out. */
export function studyLevelFor(profile: Pick<OnboardingProfile, 'start' | 'level'>): JlptLevel {
  return profile.start === 'studied' && profile.level ? profile.level : 'N5'
}

/**
 * One step of the first-week guide. `code` is how the server knows it is done
 * (see onboarding.service) and the page knows where it leads.
 */
export interface GuideStep {
  code: GuideCode
  title: string
  why: string
}

export type GuideCode = 'kana' | 'words' | 'grammar' | 'speak' | 'review' | 'conversation' | 'reading' | 'story' | 'recall'

const STEPS: Record<GuideCode, Omit<GuideStep, 'code'>> = {
  kana: { title: 'Learn the kana, a row at a time', why: 'Hiragana and katakana are the sounds everything else is written with.' },
  words: { title: 'Learn your first 10 words', why: 'New words come a few a day; the app brings each back just before you would forget it.' },
  grammar: { title: 'Take your first grammar lesson', why: 'A short lesson, then a quiz on what it taught.' },
  speak: { title: 'Do a Speak session', why: 'Say real sentences out loud, built up a piece at a time.' },
  review: { title: 'Come back tomorrow and review', why: 'Reviewing on the day it is due is what makes words stick.' },
  conversation: { title: 'Practise a conversation', why: 'Everyday exchanges (ordering, asking the way) to try for yourself.' },
  reading: { title: 'Read a speech aloud at your level', why: 'Short passages, with every word tappable.' },
  story: { title: 'Say a Speak story', why: 'A short tale told with what you have learned.' },
  recall: { title: 'Try Recall, hands-free', why: 'Your shaky words, said aloud, good for a walk or a commute.' }
}

/** What each starting point needs first. A lesson comes before words, as it does every day. */
const BY_START: Record<OnboardingStart, GuideCode[]> = {
  'new': ['kana', 'grammar', 'words', 'speak', 'review'],
  'some-kana': ['kana', 'grammar', 'words', 'speak', 'review'],
  'kana': ['grammar', 'words', 'speak', 'conversation', 'review'],
  'studied': ['grammar', 'words', 'reading', 'conversation', 'review']
}

/** What each goal adds, if the start did not already include it. */
const BY_GOAL: Record<OnboardingGoal, GuideCode> = {
  travel: 'conversation',
  media: 'reading',
  work: 'conversation',
  family: 'story',
  exam: 'grammar',
  living: 'recall'
}

/** At most this many steps: a first week, not a syllabus. */
export const GUIDE_MAX = 6

/** The first-week guide for a profile, in the order to do it. */
export function guideFor(profile: Pick<OnboardingProfile, 'start' | 'goals'>): GuideStep[] {
  const codes = [...BY_START[profile.start]]
  for (const goal of profile.goals) {
    const extra = BY_GOAL[goal]
    // Before "come back tomorrow", which is always last.
    if (!codes.includes(extra))
      codes.splice(codes.length - 1, 0, extra)
  }
  const kept = codes.length > GUIDE_MAX ? [...codes.slice(0, GUIDE_MAX - 1), 'review' as const] : codes
  return kept.map(code => ({ code, ...STEPS[code] }))
}

/** How many placement questions each level asks, and how many must be right to pass it. */
export const PLACEMENT_PER_LEVEL = 4
export const PLACEMENT_PASS = 3

/**
 * The level to start at, from a placement check.
 *
 * Levels are tried from N5 up and the check stops at the first one failed, so
 * the learner starts at the level they could not yet pass — or N1 if they
 * passed everything. Levels never asked count as not passed.
 */
export function placedLevel(right: Partial<Record<JlptLevel, number>>): JlptLevel {
  for (const level of JLPT_LEVELS) {
    if ((right[level] ?? 0) < PLACEMENT_PASS)
      return level
  }
  return 'N1'
}

/** What a learner has done, counted — enough to tick off every guide step. */
export interface GuideCounts {
  /** Activities by kind (learning_activities). */
  activities: Partial<Record<string, number>>
  /** Words with a card. */
  words: number
  /** Distinct days with a review. */
  reviewDays: number
}

/** Kana lessons that make "learn the kana" done: half the hiragana rows. */
export const GUIDE_KANA_LESSONS = 5
/** Words that make "learn your first 10 words" done. */
export const GUIDE_WORDS = 10

/**
 * Whether a guide step is done, from what the learner has actually done — not
 * from a box they ticked. "Come back tomorrow" is a second day with reviews.
 */
export function guideDone(code: GuideCode, counts: GuideCounts): boolean {
  const did = (...kinds: string[]) => kinds.reduce((n, k) => n + (counts.activities[k] ?? 0), 0)
  switch (code) {
    case 'kana': return did('kana-lesson') >= GUIDE_KANA_LESSONS
    case 'words': return counts.words >= GUIDE_WORDS
    case 'grammar': return did('lesson') >= 1
    case 'speak': return did('speak', 'speak-listen') >= 1
    case 'review': return counts.reviewDays >= 2
    case 'conversation': return did('conversation') >= 1
    case 'reading': return did('reading') >= 1
    case 'story': return did('story') >= 1
    case 'recall': return did('recall') >= 1
  }
}
