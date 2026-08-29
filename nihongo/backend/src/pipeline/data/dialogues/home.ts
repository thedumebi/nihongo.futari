import type { Dialogue } from './types.js'

/** Around the house, and the comings and goings that bracket a day. */
export const HOME: Dialogue[] = [
  {
    code: 'home-morning',
    unit: 'home',
    title: 'Waking up',
    situation: 'You come into the kitchen. Your host mother is already up.',
    turns: [
      { s: 'other', t: 'おはよう。よく寝た？', r: 'おはよう。よく ねた？', e: 'Morning. Sleep well?' },
      { s: 'you', t: 'おはようございます。よく寝ました。', r: 'おはようございます。よく ねました。', e: 'Good morning. I slept well.', wrong: [
        ['おやすみなさい。', 'おやすみなさい。', 'oyasuminasai is said going TO bed. In the morning it is ohayou.'],
        ['こんにちは。よく寝ました。', 'こんにちは。よく ねました。', 'konnichiwa starts around ten. Before that it is ohayou, and to someone older, ohayou gozaimasu.']
      ] },
      { s: 'other', t: '朝ごはんは？', r: 'あさごはん わ？', e: 'Breakfast?' },
      { s: 'you', t: 'いただきます。', r: 'いただきます。', e: 'Thank you, I will.', wrong: [
        ['ごちそうさまでした。', 'ごちそうさまでした。', 'That closes a meal. You have not started one.'],
        ['おいしいです。', 'おいしい です。', 'You have not tasted it yet — this is the moment for itadakimasu.']
      ] }
    ]
  },
  {
    code: 'home-leaving',
    unit: 'comings',
    title: 'Leaving the house',
    situation: 'You are on your way out.',
    turns: [
      { s: 'you', t: 'いってきます。', r: 'いってきます。', e: "I'm off.", wrong: [
        ['さようなら。', 'さようなら。', 'sayounara is a real parting — it carries the sense of not meeting again soon. Leaving your own house for the day does not.'],
        ['いってらっしゃい。', 'いってらっしゃい。', 'That is the reply, said BY the person staying. The one leaving says ittekimasu.']
      ] },
      { s: 'other', t: 'いってらっしゃい。気をつけて。', r: 'いってらっしゃい。き お つけて。', e: 'Off you go. Take care.' },
      { s: 'you', t: 'はい、行ってきます。', r: 'はい、いってきます。', e: 'Yes, see you later.', wrong: [
        ['はい、ただいま。', 'はい、ただいま。', 'tadaima is for arriving home, not leaving it.'],
        ['はい、おかえりなさい。', 'はい、おかえりなさい。', 'okaerinasai welcomes someone back. You are the one going out.']
      ] }
    ]
  },
  {
    code: 'home-returning',
    unit: 'comings',
    title: 'Coming home',
    situation: 'You get back in the evening.',
    turns: [
      { s: 'you', t: 'ただいま。', r: 'ただいま。', e: "I'm home.", wrong: [
        ['おかえりなさい。', 'おかえりなさい。', 'That is what you will hear back. The one arriving says tadaima.'],
        ['こんばんは。', 'こんばんは。', 'konbanwa greets someone you are meeting. Coming into your own home takes tadaima.']
      ] },
      { s: 'other', t: 'おかえりなさい。遅かったね。', r: 'おかえりなさい。おそかった ね。', e: 'Welcome back. You are late.' },
      { s: 'you', t: 'すみません、仕事が忙しかったです。', r: 'すみません、しごと が いそがしかった です。', e: 'Sorry, work was busy.', wrong: [
        ['すみません、仕事が忙しいでした。', 'すみません、しごと が いそがしい でした。', 'isogashii is an i-adjective and carries its own past: isogashikatta desu. i-adjectives never take deshita.'],
        ['すみません、仕事は忙しかったです。', 'すみません、しごと わ いそがしかった です。', 'wa would contrast work with something else, as if other things were fine. ga simply states the cause.']
      ] }
    ]
  },
  {
    code: 'home-bed',
    unit: 'comings',
    title: 'Going to bed',
    situation: 'It is late and you are turning in.',
    turns: [
      { s: 'you', t: 'お先に休みます。おやすみなさい。', r: 'おさきに やすみます。おやすみなさい。', e: 'I am turning in. Good night.', wrong: [
        ['さようなら。おやすみなさい。', 'さようなら。おやすみなさい。', 'sayounara is for parting company. You are both still in the house.'],
        ['いってきます。おやすみなさい。', 'いってきます。おやすみなさい。', 'ittekimasu says you are going out. You are going to bed.']
      ] },
      { s: 'other', t: 'おやすみ。', r: 'おやすみ。', e: 'Night.' }
    ]
  },
  {
    code: 'home-lost-item',
    unit: 'home',
    title: 'Looking for something',
    situation: 'You cannot find your phone.',
    turns: [
      { s: 'you', t: 'すみません、私の携帯を見ませんでしたか。', r: 'すみません、わたし の けいたい お みません でした か。', e: 'Excuse me, have you seen my phone?', wrong: [
        ['すみません、私の携帯が見ませんでしたか。', 'すみません、わたし の けいたい が みません でした か。', 'miru takes an object, so the phone takes o. ga would make the phone the one doing the looking.'],
        ['すみません、私は携帯を見ませんでしたか。', 'すみません、わたし わ けいたい お みません でした か。', 'That asks whether YOU saw it, which you already know. The question is about them.']
      ] },
      { s: 'other', t: 'テーブルの上にあるよ。', r: 'テーブル の うえ に ある よ。', e: 'It is on the table.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['どういたしまして。', 'どういたしまして。', 'That is the reply TO thanks. You are the one being helped.'],
        ['すみませんでした。', 'すみません でした。', 'An apology, not thanks — it suggests you did something wrong by asking.']
      ] }
    ]
  },
  {
    code: 'home-rubbish',
    unit: 'home',
    title: 'Taking out the rubbish',
    situation: 'Bin day is tomorrow and you are not sure which one.',
    turns: [
      { s: 'you', t: '明日のごみは何ごみですか。', r: 'あした の ごみ わ なんごみ です か。', e: 'Which rubbish is it tomorrow?', wrong: [
        ['明日のごみは何ですか。', 'あした の ごみ わ なん です か。', 'That asks what rubbish IS. You want which category — nan-gomi.'],
        ['明日はごみが何ごみですか。', 'あした わ ごみ が なんごみ です か。', 'Two topics fighting. The subject is the rubbish, so ashita modifies it with no: ashita no gomi.']
      ] },
      { s: 'other', t: '燃えるごみです。', r: 'もえる ごみ です。', e: 'Burnable.' },
      { s: 'you', t: '分かりました。出しておきます。', r: 'わかりました。だして おきます。', e: 'Got it. I will put it out.', wrong: [
        ['分かりました。出しています。', 'わかりました。だして います。', 'te-imasu says you are doing it right now. te-okimasu says you will do it in advance and leave it done, which is what putting the bins out is.'],
        ['分かりました。出しました。', 'わかりました。だしました。', 'Past tense — that claims it is already done.']
      ] }
    ]
  },
  {
    code: 'home-laundry',
    unit: 'home',
    title: 'The washing',
    situation: 'It looks like rain and the washing is out.',
    turns: [
      { s: 'other', t: '雨が降りそうだね。', r: 'あめ が ふりそう だ ね。', e: 'Looks like rain.' },
      { s: 'you', t: '洗濯物を取り込みましょうか。', r: 'せんたくもの お とりこみましょう か。', e: 'Shall I bring the washing in?', wrong: [
        ['洗濯物を取り込みますか。', 'せんたくもの お とりこみます か。', 'That asks whether you are going to, as a fact. mashou ka offers to do it, which is the point.'],
        ['洗濯物が取り込みましょうか。', 'せんたくもの が とりこみましょう か。', 'torikomu takes an object, so the washing takes o.']
      ] },
      { s: 'other', t: 'お願いします。助かります。', r: 'おねがいします。たすかります。', e: 'Please do. That helps.' }
    ]
  },
  {
    code: 'home-visitor',
    unit: 'home',
    title: 'Someone at the door',
    situation: 'A neighbour has come round with a parcel.',
    turns: [
      { s: 'other', t: 'すみません、隣の田中です。', r: 'すみません、となり の たなか です。', e: 'Excuse me, it is Tanaka from next door.' },
      { s: 'you', t: 'あ、こんにちは。いつもお世話になっております。', r: 'あ、こんにちは。いつも おせわ に なって おります。', e: 'Oh, hello. Thank you for everything.', wrong: [
        ['あ、こんにちは。はじめまして。', 'あ、こんにちは。はじめまして。', 'hajimemashite is for a first meeting. They live next door.'],
        ['あ、こんにちは。おかえりなさい。', 'あ、こんにちは。おかえりなさい。', 'okaerinasai welcomes someone back into their own home. This is your door.']
      ] },
      { s: 'other', t: '荷物を預かりました。', r: 'にもつ お あずかりました。', e: 'I took in a parcel for you.' },
      { s: 'you', t: 'ありがとうございます。ご迷惑をおかけしました。', r: 'ありがとうございます。ごめいわく お おかけしました。', e: 'Thank you. Sorry for the trouble.', wrong: [
        ['ありがとうございます。迷惑です。', 'ありがとうございます。めいわく です。', 'That says THEY are a nuisance. The apology is for the trouble you caused: gomeiwaku o okake shimashita.'],
        ['どうも。よろしく。', 'どうも。よろしく。', 'Far too casual for a neighbour doing you a favour.']
      ] }
    ]
  }
]
