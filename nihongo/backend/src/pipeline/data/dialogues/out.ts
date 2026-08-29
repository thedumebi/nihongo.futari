import type { Dialogue } from './types.js'

/** Shopping, errands and travelling. */
export const OUT: Dialogue[] = [
  {
    code: 'shopping-size',
    unit: 'shopping',
    title: 'Asking for a size',
    situation: 'You have found a shirt you like.',
    turns: [
      { s: 'other', t: '何かお探しですか。', r: 'なにか おさがし です か。', e: 'Looking for anything in particular?' },
      { s: 'you', t: 'これのMサイズはありますか。', r: 'これ の エム サイズ わ あります か。', e: 'Do you have this in medium?', wrong: [
        ['これのMサイズがありますか。', 'これ の エム サイズ が あります か。', 'Asking whether a shop stocks something makes it the topic: wa. ga would single it out against other sizes you had already discussed.'],
        ['これはMサイズをありますか。', 'これ わ エム サイズ お あります か。', 'aru is intransitive. The thing that exists takes ga or wa, never o.']
      ] },
      { s: 'other', t: '少々お待ちください。', r: 'しょうしょう おまち ください。', e: 'One moment please.' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Thank you.', wrong: [
        ['はい、待ちます。', 'はい、まちます。', 'Grammatical but odd — announcing that you will wait. onegai shimasu is what is said.'],
        ['はい、急いでください。', 'はい、いそいで ください。', 'That tells them to hurry up.']
      ] }
    ]
  },
  {
    code: 'shopping-try-on',
    unit: 'shopping',
    title: 'Trying it on',
    situation: 'They have found your size.',
    turns: [
      { s: 'you', t: '試着してもいいですか。', r: 'しちゃく して も いい です か。', e: 'May I try it on?', wrong: [
        ['試着しますか。', 'しちゃく します か。', 'That asks whether THEY will try it on.'],
        ['試着したいです。', 'しちゃく したい です。', 'States a want rather than asking permission. In a shop, te mo ii desu ka.']
      ] },
      { s: 'other', t: 'どうぞ、こちらへ。', r: 'どうぞ、こちら え。', e: 'Of course, this way.' },
      { s: 'you', t: '少し大きいですね。一つ下はありますか。', r: 'すこし おおきい です ね。ひとつ した わ あります か。', e: 'A little big. Do you have one size down?', wrong: [
        ['少し大きいでした。一つ下はありますか。', 'すこし おおきい でした。ひとつ した わ あります か。', 'ookii is an i-adjective and never takes deshita — and it is big now, so the present is right.'],
        ['少し大きいですね。一つ小さいはありますか。', 'すこし おおきい です ね。ひとつ ちいさい わ あります か。', 'chiisai is an adjective and cannot stand as a noun. The idiom is hitotsu shita — one below.']
      ] }
    ]
  },
  {
    code: 'services-post',
    unit: 'services',
    title: 'At the post office',
    situation: 'You are sending a parcel home.',
    turns: [
      { s: 'you', t: 'これをイギリスまで送りたいのですが。', r: 'これ お イギリス まで おくりたい の です が。', e: 'I would like to send this to the UK.', wrong: [
        ['これをイギリスに送りたいのですが。', 'これ お イギリス に おくりたい の です が。', 'Not wrong, but made stresses the distance covered, which is what a postal counter is pricing. ni would just name the destination.'],
        ['これがイギリスまで送りたいのですが。', 'これ が イギリス まで おくりたい の です が。', 'okuru takes an object — the parcel is what you are sending, so o.']
      ] },
      { s: 'other', t: '船便と航空便、どちらにしますか。', r: 'ふなびん と こうくうびん、どちら に します か。', e: 'Surface or air?' },
      { s: 'you', t: '航空便でお願いします。', r: 'こうくうびん で おねがいします。', e: 'Air, please.', wrong: [
        ['航空便をお願いします。', 'こうくうびん お おねがいします。', 'Understandable, but de marks the means — sending BY air. o would make the airmail itself the thing you are requesting.'],
        ['航空便がお願いします。', 'こうくうびん が おねがいします。', 'ga marks a subject; nothing here is acting.']
      ] }
    ]
  },
  {
    code: 'services-haircut',
    unit: 'services',
    title: 'At the hairdresser',
    situation: 'You sit down and they ask what you want.',
    turns: [
      { s: 'other', t: '今日はどうしますか。', r: 'きょう わ どう します か。', e: 'What are we doing today?' },
      { s: 'you', t: '少し短くしてください。', r: 'すこし みじかく して ください。', e: 'A little shorter, please.', wrong: [
        ['少し短いしてください。', 'すこし みじかい して ください。', 'To make something an adverb, an i-adjective drops i and takes ku: mijikaku.'],
        ['少し短くしましょう。', 'すこし みじかく しましょう。', 'mashou proposes doing it together, as if you were both holding the scissors.']
      ] },
      { s: 'other', t: '前髪はどうしますか。', r: 'まえがみ わ どう します か。', e: 'And the fringe?' },
      { s: 'you', t: 'そのままでお願いします。', r: 'そのまま で おねがいします。', e: 'Leave it as it is, please.', wrong: [
        ['そのままをお願いします。', 'そのまま お おねがいします。', 'sonomama is a state, not an object — it takes de, the particle of manner.'],
        ['いいです。', 'いい です。', 'ii desu is genuinely ambiguous: it can mean "that is fine" or "no thank you", and a hairdresser will have to ask again.']
      ] }
    ]
  },
  {
    code: 'travel-hotel-checkin',
    unit: 'travel',
    title: 'Checking into a hotel',
    situation: 'You arrive at the front desk.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。ご予約は？', r: 'いらっしゃいませ。ごよやく わ？', e: 'Welcome. Do you have a reservation?' },
      { s: 'you', t: 'はい、田中で予約しています。', r: 'はい、たなか で よやく して います。', e: 'Yes, under Tanaka.', wrong: [
        ['はい、田中に予約しています。', 'はい、たなか に よやく して います。', 'ni would make Tanaka the person you booked FOR. Booking under a name takes de.'],
        ['はい、田中を予約しています。', 'はい、たなか お よやく して います。', 'That says you have reserved a person called Tanaka.']
      ] },
      { s: 'other', t: '二泊でよろしいですか。', r: 'にはく で よろしい です か。', e: 'Two nights, is that right?' },
      { s: 'you', t: 'はい、そうです。', r: 'はい、そう です。', e: 'Yes, that is right.', wrong: [
        ['はい、あります。', 'はい、あります。', 'aru states that something exists. Confirming what someone said is sou desu.'],
        ['はい、います。', 'はい、います。', 'Same problem, and iru is for animate things.']
      ] }
    ]
  },
  {
    code: 'travel-taxi',
    unit: 'travel',
    title: 'Taking a taxi',
    situation: 'You get in and the door closes itself.',
    turns: [
      { s: 'other', t: 'どちらまで。', r: 'どちら まで。', e: 'Where to?' },
      { s: 'you', t: '東京駅までお願いします。', r: 'とうきょうえき まで おねがいします。', e: 'Tokyo Station, please.', wrong: [
        ['東京駅にお願いします。', 'とうきょうえき に おねがいします。', 'A fare covers the distance travelled, so it takes made. ni would name a destination without the journey.'],
        ['東京駅までください。', 'とうきょうえき まで ください。', 'kudasai asks for an object handed over. A ride is a service: onegai shimasu.']
      ] },
      { s: 'other', t: '高速を使いますか。', r: 'こうそく お つかいます か。', e: 'Shall I take the expressway?' },
      { s: 'you', t: 'はい、お願いします。急いでいますので。', r: 'はい、おねがいします。いそいで います ので。', e: 'Yes please, I am in a hurry.', wrong: [
        ['はい、お願いします。急ぎますので。', 'はい、おねがいします。いそぎます ので。', 'isogimasu says you will start hurrying. Being in a hurry now is a state: isoide imasu.'],
        ['はい、お願いします。急いでください。', 'はい、おねがいします。いそいで ください。', 'That orders the driver to hurry, which is not the same as explaining why.']
      ] }
    ]
  },
  {
    code: 'travel-directions',
    unit: 'travel',
    title: 'Asking the way',
    situation: 'You are lost near the station.',
    turns: [
      { s: 'you', t: 'すみません、郵便局はどこですか。', r: 'すみません、ゆうびんきょく わ どこ です か。', e: 'Excuse me, where is the post office?', wrong: [
        ['すみません、郵便局がどこですか。', 'すみません、ゆうびんきょく が どこ です か。', 'The question word doko already carries the focus. What you are asking about takes wa.'],
        ['すみません、郵便局はどこにありますか。', 'すみません、ゆうびんきょく わ どこ に あります か。', 'Grammatical, and a little long-winded; doko desu ka is what is actually said.']
      ] },
      { s: 'other', t: 'あの信号を右に曲がってください。', r: 'あの しんごう お みぎ に まがって ください。', e: 'Turn right at those lights.' },
      { s: 'you', t: '右ですね。ありがとうございます。', r: 'みぎ です ね。ありがとうございます。', e: 'Right, got it. Thank you.', wrong: [
        ['右ですよ。ありがとうございます。', 'みぎ です よ。ありがとうございます。', 'yo tells them something they did not know — but they just told you. ne confirms.'],
        ['右ですか。ありがとうございます。', 'みぎ です か。ありがとうございます。', 'Not wrong, but ka asks again as though you had not heard. ne shows you followed.']
      ] }
    ]
  }
]
