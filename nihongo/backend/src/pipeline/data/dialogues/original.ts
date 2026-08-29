import type { Dialogue } from './types.js'

/**
 * The first six, moved here from seeds 028–034.
 *
 * They were authored as raw SQL across four files — the content, a gap fix, a
 * respacing pass and two prompt rebuilds. Keeping them there and new ones here
 * would mean two places to edit and two ways to get it wrong.
 */
export const ORIGINAL: Dialogue[] = [
  {
    code: 'restaurant-order',
    unit: 'restaurant',
    title: 'Ordering a meal',
    situation: 'You sit down at a small restaurant. A waiter comes over.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。', r: 'いらっしゃいませ。', e: 'Welcome!' },
      { s: 'you', t: 'すみません、メニューをください。', r: 'すみません、メニュー お ください。', e: 'Excuse me, the menu please.', wrong: [
        ['すみません、メニューがください。', 'すみません、メニュー が ください。', 'kudasai takes o, not ga. ga marks the thing doing something; you are asking FOR the menu, not saying the menu acts.'],
        ['すみません、メニューをくれ。', 'すみません、メニュー お くれ。', 'kure is the bare command form of kureru. It is what you say to a younger brother, not to someone serving you.']
      ] },
      { s: 'other', t: 'はい、どうぞ。', r: 'はい、どうぞ。', e: 'Here you are.' },
      { s: 'you', t: 'これをお願いします。', r: 'これ お おねがいします。', e: 'This one, please.', wrong: [
        ['それをお願いします。', 'それ お おねがいします。', 'sore is "that one, near you". The menu is in your hands, so kore is the one you want.'],
        ['これはお願いします。', 'これ わ おねがいします。', 'wa makes kore the topic — "as for this one" — which sets up a contrast you never finish. Ordering takes o.']
      ] },
      { s: 'other', t: 'お飲み物は。', r: 'おのみもの わ。', e: 'And to drink?' },
      { s: 'you', t: 'お水をお願いします。', r: 'おみず お おねがいします。', e: 'Water, please.', wrong: [
        ['お水がほしいです。', 'おみず が ほしい です。', 'hoshii states your own desire and is blunt to a stranger. onegaishimasu asks, which is what you want with someone serving you.'],
        ['お水をお願います。', 'おみず お おねがいます。', 'onegaishimasu comes from negau, so the stem is negai — onegaimasu drops the i and is not a word.']
      ] }
    ]
  },
  {
    code: 'restaurant-pay',
    unit: 'restaurant',
    title: 'Paying the bill',
    situation: 'You have finished eating and want to pay.',
    turns: [
      { s: 'you', t: 'すみません、お会計をお願いします。', r: 'すみません、おかいけい お おねがいします。', e: 'Excuse me, the bill please.', wrong: [
        ['すみません、お金をお願いします。', 'すみません、おかね お おねがいします。', 'okane is money itself — this asks them to give you some. The bill is okaikei.'],
        ['すみません、お会計をください。', 'すみません、おかいけい お ください。', 'Understandable, but kudasai asks for an object handed over. For a service — settling up — onegaishimasu is what is said.']
      ] },
      { s: 'other', t: '千二百円です。', r: 'せん にひゃく えん です。', e: 'That is 1,200 yen.' },
      { s: 'you', t: 'カードでいいですか。', r: 'カード で いい です か。', e: 'Is a card all right?', wrong: [
        ['カードをいいですか。', 'カード お いい です か。', 'ii is an adjective, not a verb, so it takes no object. de marks the means — paying BY card.'],
        ['カードがいいですか。', 'カード が いい です か。', 'ga here asks which THEY would prefer, as if offering them a choice. de asks whether your card is acceptable.']
      ] },
      { s: 'other', t: 'はい、大丈夫です。', r: 'はい、だいじょうぶ です。', e: 'Yes, that is fine.' },
      { s: 'you', t: 'ごちそうさまでした。', r: 'ごちそうさま でした。', e: 'Thank you for the meal.', wrong: [
        ['いただきます。', 'いただきます。', 'itadakimasu is said BEFORE eating. Afterwards it is gochisousama deshita.'],
        ['おいしいでした。', 'おいしい でした。', 'oishii is an i-adjective and carries its own past: oishikatta desu. i-adjectives never take deshita.']
      ] }
    ]
  },
  {
    code: 'konbini-buy',
    unit: 'konbini',
    title: 'Buying lunch',
    situation: 'You take a bento to the counter at a convenience store.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。', r: 'いらっしゃいませ。', e: 'Welcome!' },
      { s: 'other', t: 'お弁当は一つですか。', r: 'おべんとう わ ひとつ です か。', e: 'Just the one bento?' },
      { s: 'you', t: 'はい、一つです。', r: 'はい、ひとつ です。', e: 'Yes, one.', wrong: [
        ['はい、一個です。', 'はい、いっこ です。', 'Not wrong exactly, but they asked with hitotsu. Answering with the counter they used is what a native does.'],
        ['はい、一人です。', 'はい、ひとり です。', 'nin counts people. A bento takes tsu — Japanese counters classify by what is being counted.']
      ] },
      { s: 'other', t: '五百円です。', r: 'ごひゃく えん です。', e: 'That is 500 yen.' },
      { s: 'you', t: 'はい、どうぞ。', r: 'はい、どうぞ。', e: 'Here you go.', wrong: [
        ['はい、ください。', 'はい、ください。', 'kudasai asks THEM to give you something. You are the one handing money over, so douzo.'],
        ['はい、お願いします。', 'はい、おねがいします。', 'onegaishimasu asks for a favour. Nothing is being requested here — you are simply offering the money.']
      ] }
    ]
  },
  {
    code: 'konbini-warm',
    unit: 'konbini',
    title: 'Asking them to heat it',
    situation: 'You would like your bento warmed up.',
    turns: [
      { s: 'other', t: 'お弁当は温めますか。', r: 'おべんとう わ あたためます か。', e: 'Shall I warm the bento?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes please.', wrong: [
        ['はい、温めます。', 'はい、あたためます。', 'That says YOU will warm it. They offered to do it, so you accept rather than announce.'],
        ['はい、ありがとう。', 'はい、ありがとう。', 'Thanking them before they have done it is odd, and plain arigatou is too casual for a shop.']
      ] },
      { s: 'other', t: 'お箸はいりますか。', r: 'おはし わ いります か。', e: 'Do you need chopsticks?' },
      { s: 'you', t: 'いいえ、大丈夫です。', r: 'いいえ、だいじょうぶ です。', e: 'No, I am fine.', wrong: [
        ['いいえ、いりません。', 'いいえ、いりません。', 'Correct Japanese, but flat — it is the tone of refusing a form you did not ask for. daijoubu desu softens it.'],
        ['いいえ、いいです。', 'いいえ、いい です。', 'ii desu is genuinely ambiguous — it can mean "yes, good" or "no thanks" — and shop staff often have to ask again.']
      ] }
    ]
  },
  {
    code: 'station-ticket',
    unit: 'station',
    title: 'Buying a ticket',
    situation: 'You are at a station and need to get to Kyoto.',
    turns: [
      { s: 'you', t: 'すみません、京都までいくらですか。', r: 'すみません、きょうと まで いくら です か。', e: 'Excuse me, how much is it to Kyoto?', wrong: [
        ['すみません、京都にいくらですか。', 'すみません、きょうと に いくら です か。', 'ni marks a destination you arrive at. A fare covers the distance travelled, so it takes made — as far as Kyoto.'],
        ['すみません、京都までいくつですか。', 'すみません、きょうと まで いくつ です か。', 'ikutsu asks how MANY. Price is ikura — the two look alike and mean quite different things.']
      ] },
      { s: 'other', t: '千四百円です。', r: 'せん よんひゃく えん です。', e: 'It is 1,400 yen.' },
      { s: 'you', t: '切符を二枚ください。', r: 'きっぷ お にまい ください。', e: 'Two tickets, please.', wrong: [
        ['切符を二つください。', 'きっぷ お ふたつ ください。', 'tsu is the general counter. A ticket is flat, and flat things take mai — nimai.'],
        ['二枚切符をください。', 'にまい きっぷ お ください。', 'The counter goes after the thing it counts: kippu o nimai, not nimai kippu o.']
      ] },
      { s: 'other', t: 'はい、二千八百円です。', r: 'はい、にせん はっぴゃく えん です。', e: 'Right, 2,800 yen.' }
    ]
  },
  {
    code: 'station-lost',
    unit: 'station',
    title: 'Finding the right platform',
    situation: 'You cannot find your platform and ask for help.',
    turns: [
      { s: 'you', t: 'すみません、京都行きはどこですか。', r: 'すみません、きょうとゆき わ どこ です か。', e: 'Excuse me, where is the train for Kyoto?', wrong: [
        ['すみません、京都行きがどこですか。', 'すみません、きょうとゆき が どこ です か。', 'doko is the question word, so ga belongs with it — doko desu ka already asks. The thing you are asking about takes wa.'],
        ['すみません、京都はどこに行きますか。', 'すみません、きょうと わ どこ に いきます か。', 'That asks where Kyoto goes. You want the platform, so ask about kyouto-yuki — the Kyoto-bound train.']
      ] },
      { s: 'other', t: '三番線です。', r: 'さんばんせん です。', e: 'Platform three.' },
      { s: 'you', t: '何時に出ますか。', r: 'なんじ に でます か。', e: 'What time does it leave?', wrong: [
        ['何時は出ますか。', 'なんじ わ でます か。', 'A question word can never take wa — you cannot make a topic of the thing you are asking about.'],
        ['いつに出ますか。', 'いつ に でます か。', 'itsu takes no ni, and it asks "when" in general. For a clock time the word is nanji.']
      ] },
      { s: 'other', t: '十時半です。', r: 'じゅうじはん です。', e: 'Half past ten.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you very much.', wrong: [
        ['ありがとうございました。', 'ありがとうございました。', 'The past form closes something finished. They have just told you the time and you are about to walk to the platform, so the present fits.'],
        ['すみません。', 'すみません。', 'sumimasen does double duty as thanks, but after someone has actually helped you it reads as another apology rather than gratitude.']
      ] }
    ]
  }
]
