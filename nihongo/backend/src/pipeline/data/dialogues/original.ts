import type { Dialogue } from './types.js'

/**
 * The first six, moved here from seeds 028–034.
 *
 * They were authored as raw SQL across four files — the content, a gap fix, a
 * respacing pass and two prompt rebuilds. Keeping them there and new ones here
 * would mean two places to edit and two ways to get it wrong.
 *
 * Each of these was originally 4-7 turns — a single exchange, not the whole
 * interaction. Extended so each now runs the real situation start to finish:
 * what is said before and after the original fragment, the fast follow-up
 * questions, a branch where something is refused or unavailable, and how it
 * closes. Every original turn below is untouched; the new ones are woven
 * around it.
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
      { s: 'you', t: 'すみません、カレーはありますか。', r: 'すみません、カレー わ あります か。', e: 'Excuse me, do you have curry?', wrong: [
        ['すみません、カレーをありますか。', 'すみません、カレー お あります か。', 'arimasu is an existence verb, not one that takes a direct object — o has nothing to attach to. Existence is marked with wa or ga.'],
        ['すみません、カレーがいますか。', 'すみません、カレー が います か。', 'imasu is for living things, people and animals. Curry is not alive, so its existence takes arimasu, not imasu.']
      ] },
      { s: 'other', t: 'すみません、カレーは今売り切れです。', r: 'すみません、カレー わ いま うりきれ です。', e: 'Sorry, the curry is sold out right now.' },
      { s: 'you', t: 'じゃあ、おすすめは何ですか。', r: 'じゃあ、おすすめ わ なん です か。', e: 'Then what do you recommend?', wrong: [
        ['じゃあ、おすすめが何ですか。', 'じゃあ、おすすめ が なん です か。', 'nan desu ka already asks the question. The thing you are asking about — osusume — takes wa, and ga here would clash with it.'],
        ['じゃあ、おすすめは誰ですか。', 'じゃあ、おすすめ わ だれ です か。', 'dare asks about a person. You want to know which DISH is recommended, so nan, not dare.']
      ] },
      { s: 'other', t: 'この定食が人気です。', r: 'この ていしょく が にんき です。', e: 'This set meal is popular.' },
      { s: 'you', t: 'これをお願いします。', r: 'これ お おねがいします。', e: 'This one, please.', wrong: [
        ['それをお願いします。', 'それ お おねがいします。', 'sore is "that one, near you". The menu is in your hands, so kore is the one you want.'],
        ['これはお願いします。', 'これ わ おねがいします。', 'wa makes kore the topic — "as for this one" — which sets up a contrast you never finish. Ordering takes o.']
      ] },
      { s: 'other', t: 'お飲み物は。', r: 'おのみもの わ。', e: 'And to drink?' },
      { s: 'you', t: 'お水をお願いします。', r: 'おみず お おねがいします。', e: 'Water, please.', wrong: [
        ['お水がほしいです。', 'おみず が ほしい です。', 'hoshii states your own desire and is blunt to a stranger. onegaishimasu asks, which is what you want with someone serving you.'],
        ['お水をお願います。', 'おみず お おねがいます。', 'onegaishimasu comes from negau, so the stem is negai — onegaimasu drops the i and is not a word.']
      ] },
      { s: 'other', t: 'かしこまりました。他にご注文は。', r: 'かしこまりました。ほか に ごちゅうもん わ。', e: 'Certainly. Anything else to order?' },
      { s: 'you', t: 'いいえ、大丈夫です。', r: 'いいえ、だいじょうぶ です。', e: 'No, that will be all, thank you.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai answers yes, but daijoubu desu here is turning down more food — pairing hai with a decline phrase contradicts your own answer.'],
        ['いいえ、いいです。', 'いいえ、いい です。', 'ii desu swings between "that is good" and "no thanks" depending on tone, and a busy waiter may hear it as you wanting something after all. daijoubu desu is the unambiguous decline.']
      ] },
      { s: 'other', t: 'かしこまりました。少々お待ちください。', r: 'かしこまりました。しょうしょう おまち ください。', e: 'Certainly. Please wait a moment.' }
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
      { s: 'you', t: '別々に払えますか。', r: 'べつべつ に はらえます か。', e: 'Can we pay separately?', wrong: [
        ['別々を払えますか。', 'べつべつ お はらえます か。', 'harau takes o for the thing being paid, like the bill. "Separately" describes HOW you pay, not a thing being paid, so it takes ni.'],
        ['別々が払えますか。', 'べつべつ が はらえます か。', 'ga would make "separately" the subject doing the paying, which makes no sense. ni marks it as the manner of the payment.']
      ] },
      { s: 'other', t: 'すみません、別々払いはできません。', r: 'すみません、べつべつばらい わ できません。', e: 'Sorry, we cannot split the bill.' },
      { s: 'you', t: 'わかりました。じゃあ一緒でお願いします。', r: 'わかりました。じゃあ いっしょ で おねがいします。', e: 'Understood. Together then, please.', wrong: [
        ['じゃあ一緒をお願いします。', 'じゃあ いっしょ お おねがいします。', 'de marks the manner of payment — paying AS one group. o would treat issho as an object being handed to you, and nothing called that is.'],
        ['じゃあ一緒がお願いします。', 'じゃあ いっしょ が おねがいします。', 'ga would make issho the one doing the asking. You are the one requesting; de marks the method of the payment you want.']
      ] },
      { s: 'other', t: 'かしこまりました。', r: 'かしこまりました。', e: 'Certainly.' },
      { s: 'you', t: 'カードでいいですか。', r: 'カード で いい です か。', e: 'Is a card all right?', wrong: [
        ['カードをいいですか。', 'カード お いい です か。', 'ii is an adjective, not a verb, so it takes no object. de marks the means — paying BY card.'],
        ['カードがいいですか。', 'カード が いい です か。', 'ga here asks which THEY would prefer, as if offering them a choice. de asks whether your card is acceptable.']
      ] },
      { s: 'other', t: 'はい、大丈夫です。', r: 'はい、だいじょうぶ です。', e: 'Yes, that is fine.' },
      { s: 'other', t: 'レシートはご利用ですか。', r: 'レシート わ ごりよう です か。', e: 'Would you like the receipt?' },
      { s: 'you', t: 'いいえ、大丈夫です。', r: 'いいえ、だいじょうぶ です。', e: 'No, that is all right.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai says yes, but daijoubu desu here is declining the receipt — pairing hai with a decline phrase sends the opposite message from what you mean.'],
        ['いいえ、いります。', 'いいえ、いります。', 'irimasu means "I need it". Pairing iie (no) with a phrase that means "I need it" contradicts itself — the decline here is irimasen or daijoubu desu.']
      ] },
      { s: 'other', t: 'かしこまりました。ありがとうございました。', r: 'かしこまりました。ありがとうございました。', e: 'Certainly. Thank you very much.' },
      { s: 'you', t: 'ごちそうさまでした。', r: 'ごちそうさま でした。', e: 'Thank you for the meal.', wrong: [
        ['いただきます。', 'いただきます。', 'itadakimasu is said BEFORE eating. Afterwards it is gochisousama deshita.'],
        ['おいしいでした。', 'おいしい でした。', 'oishii is an i-adjective and carries its own past: oishikatta desu. i-adjectives never take deshita.']
      ] },
      { s: 'other', t: 'またお越しくださいませ。', r: 'また おこし くださいませ。', e: 'Please come again.' }
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
      { s: 'other', t: '袋はご利用ですか。', r: 'ふくろ わ ごりよう です か。', e: 'Would you like a bag?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'daijoubu desu is how you decline something offered. Pairing hai with it muddies whether you want the bag — onegaishimasu accepts cleanly.'],
        ['はい、いいです。', 'はい、いい です。', 'ii desu swings between accepting and declining depending on tone, so it risks being heard as "no, I am fine". onegaishimasu leaves no doubt.']
      ] },
      { s: 'other', t: 'スプーンもお付けしますか。', r: 'スプーン も おつけ します か。', e: 'Shall I add a spoon too?' },
      { s: 'you', t: 'いいえ、大丈夫です。', r: 'いいえ、だいじょうぶ です。', e: 'No, that is all right.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai says yes, but daijoubu desu here is turning the spoon down — pairing them contradicts your own answer.'],
        ['いいえ、お願いします。', 'いいえ、おねがいします。', 'onegaishimasu is a request/acceptance phrase. Pairing iie (no) with it says the opposite of what you mean.']
      ] },
      { s: 'other', t: '五百円です。', r: 'ごひゃく えん です。', e: 'That is 500 yen.' },
      { s: 'you', t: '千円でもいいですか。', r: 'せん えん でも いい です か。', e: 'Is a 1,000 yen note okay?', wrong: [
        ['千円をいいですか。', 'せん えん お いい です か。', 'ii is an adjective, not a verb, so it takes no object. demo marks the note as one option among possible ones, not o.'],
        ['千円がいいですか。', 'せん えん が いい です か。', 'ga would ask whether a 1,000 yen note is what THEY would prefer. demo asks whether it is acceptable as what you are offering.']
      ] },
      { s: 'other', t: 'はい、大丈夫です。', r: 'はい、だいじょうぶ です。', e: 'Yes, that is fine.' },
      { s: 'you', t: 'はい、どうぞ。', r: 'はい、どうぞ。', e: 'Here you go.', wrong: [
        ['はい、ください。', 'はい、ください。', 'kudasai asks THEM to give you something. You are the one handing money over, so douzo.'],
        ['はい、お願いします。', 'はい、おねがいします。', 'onegaishimasu asks for a favour. Nothing is being requested here — you are simply offering the money.']
      ] },
      { s: 'other', t: 'ありがとうございます。五百円のお返しです。', r: 'ありがとうございます。ごひゃく えん の おかえし です。', e: 'Thank you. Here is 500 yen change.' },
      { s: 'you', t: 'どうも、ありがとうございます。', r: 'どうも、ありがとうございます。', e: 'Thanks very much.', wrong: [
        ['どうも、ありがとうございました。', 'どうも、ありがとうございました。', 'gozaimashita closes something already finished. You are taking the change right now, so the present gozaimasu fits.'],
        ['どうも、すみません。', 'どうも、すみません。', 'sumimasen doubles as thanks in some contexts, but paired with doumo it reads as an apology for the trouble rather than gratitude for the change just handed to you.']
      ] },
      { s: 'other', t: 'ありがとうございました。', r: 'ありがとうございました。', e: 'Thank you very much.' }
    ]
  },
  {
    code: 'konbini-warm',
    unit: 'konbini',
    title: 'Asking them to heat it',
    situation: 'You would like your bento warmed up.',
    turns: [
      { s: 'other', t: 'お弁当とサラダ、お二つですね。', r: 'おべんとう と サラダ、おふたつ です ね。', e: 'A bento and a salad — two items, right?' },
      { s: 'other', t: 'お弁当は温めますか。', r: 'おべんとう わ あたためます か。', e: 'Shall I warm the bento?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes please.', wrong: [
        ['はい、温めます。', 'はい、あたためます。', 'That says YOU will warm it. They offered to do it, so you accept rather than announce.'],
        ['はい、ありがとう。', 'はい、ありがとう。', 'Thanking them before they have done it is odd, and plain arigatou is too casual for a shop.']
      ] },
      { s: 'other', t: 'サラダも温めますか。', r: 'サラダ も あたためます か。', e: 'Shall I warm the salad too?' },
      { s: 'you', t: 'いいえ、それはそのままで大丈夫です。', r: 'いいえ、それ わ そのまま で だいじょうぶ です。', e: 'No, that one is fine as it is.', wrong: [
        ['はい、それはそのままで大丈夫です。', 'はい、それ わ そのまま で だいじょうぶ です。', 'hai says yes, but daijoubu desu here declines the extra warming — pairing hai with a decline phrase contradicts your own answer.'],
        ['いいえ、それはそのままでいいです。', 'いいえ、それ わ そのまま で いい です。', 'ii desu swings between accepting and declining depending on tone. daijoubu desu removes that ambiguity when what you mean is no.']
      ] },
      { s: 'other', t: 'お箸はいりますか。', r: 'おはし わ いります か。', e: 'Do you need chopsticks?' },
      { s: 'you', t: 'いいえ、大丈夫です。', r: 'いいえ、だいじょうぶ です。', e: 'No, I am fine.', wrong: [
        ['いいえ、いりません。', 'いいえ、いりません。', 'Correct Japanese, but flat — it is the tone of refusing a form you did not ask for. daijoubu desu softens it.'],
        ['いいえ、いいです。', 'いいえ、いい です。', 'ii desu is genuinely ambiguous — it can mean "yes, good" or "no thanks" — and shop staff often have to ask again.']
      ] },
      { s: 'other', t: '温めに少しお時間がかかります。', r: 'あたため に すこし おじかん が かかります。', e: 'The warming will take a little time.' },
      { s: 'you', t: 'はい、待ちます。', r: 'はい、まちます。', e: 'Yes, I will wait.', wrong: [
        ['はい、待てます。', 'はい、まてます。', 'matemasu is the potential form — "I am able to wait". Answering a statement about wait time that way misses the mark; machimasu simply states that you will wait.'],
        ['はい、待ちません。', 'はい、まちません。', 'machimasen is the negative — "I will not wait" — flatly reversing the meaning you intend while still starting with hai.']
      ] },
      { s: 'other', t: 'お待たせしました。どうぞ。', r: 'おまたせしました。どうぞ。', e: 'Sorry to keep you waiting. Here you are.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['ありがとうございました。', 'ありがとうございました。', 'gozaimashita closes something already finished. You are taking the bento from them at this very moment, so the present gozaimasu fits.'],
        ['どういたしまして。', 'どういたしまして。', 'douitashimashite means "you are welcome" — it is what THEY would say back to your thanks, not something you say after receiving the bento.']
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
      { s: 'you', t: '新幹線で行けますか。', r: 'しんかんせん で いけます か。', e: 'Can I get there by shinkansen?', wrong: [
        ['新幹線に行けますか。', 'しんかんせん に いけます か。', 'ni marks a destination you arrive at — going TO the shinkansen makes no sense. de marks the means of travel, going BY shinkansen.'],
        ['新幹線が行けますか。', 'しんかんせん が いけます か。', 'ga would make the shinkansen itself the one doing the going, as a subject. de marks it as the method you would use, which is what you mean.']
      ] },
      { s: 'other', t: 'すみません、ここから新幹線は出ていません。在来線だけです。', r: 'すみません、ここ から しんかんせん わ でて いません。ざいらいせん だけ です。', e: 'Sorry, there is no shinkansen from here. Only the local line.' },
      { s: 'you', t: 'わかりました。じゃあ、在来線でお願いします。', r: 'わかりました。じゃあ、ざいらいせん で おねがいします。', e: 'I see. The local line then, please.', wrong: [
        ['じゃあ、在来線をお願いします。', 'じゃあ、ざいらいせん お おねがいします。', 'o would treat the local line as a direct object handed to you, like a menu item. de marks it as the means of travel you are choosing.'],
        ['じゃあ、在来線がお願いします。', 'じゃあ、ざいらいせん が おねがいします。', 'ga would make the local line the one doing the requesting, which makes no sense. de marks the method you want, and you are the one asking.']
      ] },
      { s: 'other', t: 'かしこまりました。', r: 'かしこまりました。', e: 'Certainly.' },
      { s: 'you', t: '切符を二枚ください。', r: 'きっぷ お にまい ください。', e: 'Two tickets, please.', wrong: [
        ['切符を二つください。', 'きっぷ お ふたつ ください。', 'tsu is the general counter. A ticket is flat, and flat things take mai — nimai.'],
        ['二枚切符をください。', 'にまい きっぷ お ください。', 'The counter goes after the thing it counts: kippu o nimai, not nimai kippu o.']
      ] },
      { s: 'other', t: 'はい、二千八百円です。', r: 'はい、にせん はっぴゃく えん です。', e: 'Right, 2,800 yen.' },
      { s: 'you', t: '一万円でもいいですか。', r: 'いちまん えん でも いい です か。', e: 'Is a 10,000 yen note okay too?', wrong: [
        ['一万円をいいですか。', 'いちまん えん お いい です か。', 'ii is an adjective, not a verb, so it takes no object. demo marks the note as one option among possible ones, not o.'],
        ['一万円がいいですか。', 'いちまん えん が いい です か。', 'ga would ask whether a 10,000 yen note is what THEY would prefer. demo asks whether it is acceptable as what you are offering.']
      ] },
      { s: 'other', t: 'はい、大丈夫です。', r: 'はい、だいじょうぶ です。', e: 'Yes, that is fine.' },
      { s: 'other', t: '七千二百円のお返しです。', r: 'ななせん にひゃく えん の おかえし です。', e: 'Here is 7,200 yen change.' },
      { s: 'you', t: 'どうも、ありがとうございます。', r: 'どうも、ありがとうございます。', e: 'Thanks very much.', wrong: [
        ['どうも、ありがとうございました。', 'どうも、ありがとうございました。', 'gozaimashita closes something already finished. You are taking the change right now, so the present gozaimasu fits.'],
        ['どうも、すみませんでした。', 'どうも、すみませんでした。', 'sumimasen deshita apologises for a finished inconvenience. You have nothing to apologise for — you are thanking them for the change.']
      ] },
      { s: 'other', t: '良い旅を。', r: 'よい たび お。', e: 'Have a good trip.' }
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
      { s: 'you', t: '三番線はどちらですか。', r: 'さんばんせん わ どちら です か。', e: 'Which way is platform three?', wrong: [
        ['三番線がどちらですか。', 'さんばんせん が どちら です か。', 'dochira desu ka already asks the question. The thing you are asking about — platform three — takes wa, and ga here would clash with it.'],
        ['三番線はどこにですか。', 'さんばんせん わ どこ に です か。', 'doko ni desu ka is not a complete question — ni needs a verb to attach to. Asking "which way" pairs dochira directly with desu ka, no ni needed.']
      ] },
      { s: 'other', t: 'あの階段を上がってください。', r: 'あの かいだん お あがって ください。', e: 'Go up those stairs there.' },
      { s: 'you', t: 'わかりました、助かります。', r: 'わかりました、たすかります。', e: 'Got it, that helps.', wrong: [
        ['わかりました、助けます。', 'わかりました、たすけます。', 'tasukemasu means "I will help someone" — it says YOU will do the helping. tasukarimasu is the form for something helping or benefiting YOU, which is what you mean.'],
        ['わかりました、助けてください。', 'わかりました、たすけて ください。', 'tasukete kudasai asks for more help. They have already told you the way; you are thanking them for the help already given.']
      ] },
      { s: 'other', t: 'いえいえ。', r: 'いえいえ。', e: 'Not at all.' },
      { s: 'you', t: '何時に出ますか。', r: 'なんじ に でます か。', e: 'What time does it leave?', wrong: [
        ['何時は出ますか。', 'なんじ わ でます か。', 'A question word can never take wa — you cannot make a topic of the thing you are asking about.'],
        ['いつに出ますか。', 'いつ に でます か。', 'itsu takes no ni, and it asks "when" in general. For a clock time the word is nanji.']
      ] },
      { s: 'other', t: '十時半です。', r: 'じゅうじはん です。', e: 'Half past ten.' },
      { s: 'other', t: '急行ではなく、各駅停車ですのでご注意ください。', r: 'きゅうこう では なく、かくえきていしゃ です ので ごちゅうい ください。', e: 'It is not an express — it is a local, so please note that.' },
      { s: 'you', t: '急行はありますか。', r: 'きゅうこう わ あります か。', e: 'Is there an express?', wrong: [
        ['急行をありますか。', 'きゅうこう お あります か。', 'arimasu is an existence verb and takes no direct object — existence is marked with wa or ga, not o.'],
        ['急行がいますか。', 'きゅうこう が います か。', 'imasu is for living things. A train is not alive, so its existence is asked with arimasu, not imasu.']
      ] },
      { s: 'other', t: '次の急行は十一時です。', r: 'つぎ の きゅうこう わ じゅういち じ です。', e: 'The next express is at eleven.' },
      { s: 'you', t: 'じゃあ、各駅停車に乗ります。', r: 'じゃあ、かくえきていしゃ に のります。', e: 'Then I will take the local.', wrong: [
        ['じゃあ、各駅停車を乗ります。', 'じゃあ、かくえきていしゃ お のります。', 'noru takes ni for the vehicle you get onto — you move ONTO it. o is for things acted on directly, not the vehicle you board.'],
        ['じゃあ、各駅停車で乗ります。', 'じゃあ、かくえきていしゃ で のります。', 'de marks the vehicle used to do something else, like going somewhere BY train. When the verb is noru itself, the vehicle takes ni, not de.']
      ] },
      { s: 'other', t: '承知しました。', r: 'しょうちしました。', e: 'Understood.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you very much.', wrong: [
        ['ありがとうございました。', 'ありがとうございました。', 'The past form closes something finished. They have just told you the time and you are about to walk to the platform, so the present fits.'],
        ['すみません。', 'すみません。', 'sumimasen does double duty as thanks, but after someone has actually helped you it reads as another apology rather than gratitude.']
      ] }
    ]
  }
]
