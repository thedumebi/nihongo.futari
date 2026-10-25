import art05 from '@/assets/celebrations/streak-05.svg'
import art10 from '@/assets/celebrations/streak-10.svg'
import art15 from '@/assets/celebrations/streak-15.svg'
import art20 from '@/assets/celebrations/streak-20.svg'
import art25 from '@/assets/celebrations/streak-25.svg'
import art30 from '@/assets/celebrations/streak-30.svg'
import art35 from '@/assets/celebrations/streak-35.svg'
import art40 from '@/assets/celebrations/streak-40.svg'
import art45 from '@/assets/celebrations/streak-45.svg'
import art50 from '@/assets/celebrations/streak-50.svg'
import art55 from '@/assets/celebrations/streak-55.svg'
import art60 from '@/assets/celebrations/streak-60.svg'
import { STREAK_STEP } from '@/composables/use-answer-streak'

/**
 * What each celebration says and shows, from 5 in a row to 60. The drawings
 * build as the run grows, a high five first and a trophy last. Past 60
 * they come round again with the real count in the headline, so no line names
 * a number: `{n}` in a headline is the run.
 *
 * The drawings are hand-authored SVG in the house style (`.claude/rules/media.md`):
 * UI rather than course content, so they ship with the app and work offline.
 */
const CELEBRATIONS = [
  { art: art05, title: 'やった！ {n} in a row', line: 'Hands up for a high five. A bright start, keep going.', alt: 'Two hands meeting in a high five' },
  { art: art10, title: 'わあ！ {n} in a row', line: 'The ball bursts open and the streamers fly. Keep that streak rolling.', alt: 'A festival ball bursting open with streamers' },
  { art: art15, title: 'いいね {n} in a row', line: 'The lucky cat is waving at you. Nicely done, keep the answers coming.', alt: 'A lucky cat waving one paw' },
  { art: art20, title: 'えらい！ {n} in a row', line: 'Both eyes painted in means a wish come true. Well done, keep going.', alt: 'A beaming daruma with both eyes painted' },
  { art: art25, title: 'どん！ {n} in a row', line: 'Dead centre, right on the beat. Keep the rhythm going.', alt: 'A taiko drum struck mid-beat' },
  { art: art30, title: 'きれい {n} in a row', line: 'Fireworks, just for you. What a lovely run, keep it glowing.', alt: 'Festival fireworks over the river' },
  { art: art35, title: 'ばんざい {n} in a row', line: 'Arms up, you earned this. Keep going while it feels this good.', alt: 'Someone throwing both arms up in joy' },
  { art: art40, title: 'かっこいい {n} in a row', line: 'A medal for steady, careful answers. Keep going.', alt: 'A rosette medal with ribbons' },
  { art: art45, title: 'のぼった！ {n} in a row', line: 'Flag planted at the top. Enjoy the view, then keep climbing.', alt: 'A climber planting a flag on top of Mount Fuji' },
  { art: art50, title: 'ハイタッチ {n} in a row', line: 'That is a high five in Japanese, and you have earned one. Keep going.', alt: 'Two friends jumping for a high five' },
  { art: art55, title: 'すごい！ {n} in a row', line: 'Up you go, carried high by cheering friends. Keep going.', alt: 'Friends tossing a cheering person into the air' },
  { art: art60, title: 'さいこう {n} in a row', line: 'A trophy for your whole run. You are brilliant, keep going.', alt: 'A trophy with confetti and petals' }
] as const

/** The celebration for a run of `count` right (a multiple of 5): its drawing, headline and line. */
export function celebrationFor(count: number): { art: string, title: string, line: string, alt: string } {
  const step = Math.max(1, Math.floor(count / STREAK_STEP))
  const c = CELEBRATIONS[(step - 1) % CELEBRATIONS.length]!
  return { art: c.art, title: c.title.replace('{n}', String(count)), line: c.line, alt: c.alt }
}

/** Every celebration once, in order, as the admin preview shows them. */
export const ALL_CELEBRATION_STEPS = CELEBRATIONS.map((_, i) => (i + 1) * STREAK_STEP)
