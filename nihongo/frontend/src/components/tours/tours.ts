import { ANSWER_SCRIPT_INFO } from '@nihongo/shared/lib'

/**
 * What each page's tour says, step by step. Short on purpose: a tour is read
 * once, on a phone, by someone who came to study, not to read about studying.
 *
 * Named "tour" in code so it is never confused with the first-week guide on
 * Today, which is a different thing kept on the server.
 */

export interface TourStep {
  title: string
  body: string
}

export type TourPage = 'study' | 'writing' | 'recall' | 'crossword'

const glyphs = (['romaji', 'kana', 'hiragana', 'katakana', 'kanji', 'english'] as const)
  .map(s => `${ANSWER_SCRIPT_INFO[s].glyph} ${s}`)
  .join(', ')

export const TOURS: Record<TourPage, { title: string, steps: TourStep[] }> = {
  study: {
    title: 'How Study works',
    steps: [
      {
        title: 'One card at a time',
        body: 'The small line at the top says what the card is: a kana, a word, a kanji or a sentence, and which script. Something you have never met is shown to you first, then asked.'
      },
      {
        title: 'What to answer in',
        body: `Above the answer, a badge says what the card wants: ${glyphs}. When it is not the same as the last card it pulses and says so, so a kana card never catches you typing English.`
      },
      {
        title: 'Romaji works for kana',
        body: 'On a kana card you can type romaji: taberu becomes たべる, shown under the box as you type. No Japanese keyboard needed.'
      },
      {
        title: 'Tap a word',
        body: 'Tap any word in a sentence for its meaning. Full entry opens the whole dictionary entry over half the screen, with its verb or adjective forms. Add to reviews keeps the word.'
      },
      {
        title: 'How it went',
        body: 'Right: pick Hard, Good or Easy. That sets how soon the card comes back, sooner for Hard and later for Easy. Missed: press Next, and the card comes back sooner on its own.'
      },
      {
        title: 'Writing cards',
        body: 'Draw in the box. With the guide on, the next stroke is a dotted outline, arrows mark where it turns, and a dot runs along it. A stroke that turns a corner is one stroke: keep the pen down. Undo takes back a stroke, Clear starts over.'
      },
      {
        title: 'Skip and Back',
        body: 'Skip moves on and records nothing: the card comes back another time. Back returns to the card before. On a keyboard, Enter checks and moves on, 1, 2 and 3 rate, and Space plays the sound again.'
      }
    ]
  },
  writing: {
    title: 'How Writing works',
    steps: [
      {
        title: 'Choose what to write',
        body: 'Pick a deck, kana or kanji, then the rows or levels. Shuffle mixes the order.'
      },
      {
        title: 'Follow the guide',
        body: 'The grey character is the guide; Guide turns it on and off. The stroke to draw next is outlined in dots, numbered where it starts, with arrows where it turns, and a dot runs along it. A stroke that turns a corner is one stroke: keep the pen down.'
      },
      {
        title: 'Hint, Undo, Clear',
        body: 'Hint shows one more stroke. Undo takes back your last stroke, Backspace does the same. Clear starts the character over.'
      },
      {
        title: 'Check',
        body: 'Check scores the character. It wants the right number of strokes, in the right order, each going the right way. Each stroke gets a chip, so you can see which one to fix.'
      }
    ]
  },
  recall: {
    title: 'How Recall works',
    steps: [
      {
        title: 'Hands free',
        body: 'Recall plays on its own. You hear the English, then a silence: say the Japanese out loud. Then you hear it in Japanese, and check yourself.'
      },
      {
        title: 'Take your time',
        body: 'Pause during the silence for as long as you need. Press Play and it goes straight to the answer. Pace sets how long the silence is: slower gives more time.'
      },
      {
        title: 'What it plays',
        body: 'Words you are still learning, ones that keep slipping and ones you missed this week. Each comes back a little later. It works with the screen off, and it never changes your reviews.'
      }
    ]
  },
  crossword: {
    title: 'How the crossword works',
    steps: [
      {
        title: 'Fill it in kana',
        body: 'Each clue is a meaning: fill in the Japanese word in kana. Type romaji and it turns into kana, or use a Japanese keyboard. A loanword puzzle wants katakana.'
      },
      {
        title: 'Moving around',
        body: 'Tap a cell to choose a word; tap it again to switch between across and down. The arrows step through the clues.'
      },
      {
        title: 'When you are stuck',
        body: 'Reveal letter gives one kana, Reveal word gives the whole word. Hear it plays the word, and Kanji shows how it is written. Hints are counted, never held against you.'
      },
      {
        title: 'Mistakes and the bonus word',
        body: 'Mark mistakes as I type shows a wrong kana straight away; turn it off to work it out with no marks. The lettered cells spell a hidden bonus word.'
      }
    ]
  }
}
