import type { Dialogue } from './types.js'

/** More of the house: chores, weather, small talk, and the front door. */
export const HOME2: Dialogue[] = [
  {
    code: 'home-guest-arrive',
    unit: 'home',
    title: 'Arriving as a guest',
    situation: 'You have been invited round for dinner.',
    turns: [
      { s: 'other', t: 'いらっしゃい。どうぞ上がって。', r: 'いらっしゃい。どうぞ あがって。', e: 'Come in, come on up.' },
      { s: 'you', t: 'おじゃまします。', r: 'おじゃまします。', e: 'Thank you, excuse me.', wrong: [
        ['ただいま。', 'ただいま。', 'tadaima is for coming into your OWN home.'],
        ['いらっしゃいませ。', 'いらっしゃいませ。', 'That is what a host or a shop says to you. As the guest, ojama shimasu.']
      ] },
      { s: 'you', t: 'これ、つまらないものですが。', r: 'これ、つまらない もの です が。', e: 'A small something for you.', wrong: [
        ['これ、いいものです。', 'これ、いい もの です。', 'Praising your own gift is the opposite of the convention — you play it down, and they insist otherwise.'],
        ['これをください。', 'これ お ください。', 'kudasai asks THEM for it. You are giving.']
      ] },
      { s: 'other', t: 'ありがとう。気を使わせてごめんね。', r: 'ありがとう。き お つかわせて ごめん ね。', e: 'Thank you, you should not have.' }
    ]
  },
  {
    code: 'home-guest-leave',
    unit: 'home',
    title: 'Leaving a friend\'s house',
    situation: 'It is getting late and you should go.',
    turns: [
      { s: 'you', t: 'そろそろ失礼します。', r: 'そろそろ しつれいします。', e: 'I should be going.', wrong: [
        ['そろそろ帰ります。', 'そろそろ かえります。', 'Not wrong, but blunter — it states a fact rather than excusing yourself. shitsurei shimasu is the polite exit.'],
        ['そろそろいってきます。', 'そろそろ いってきます。', 'ittekimasu says you are going out and coming back, which is for your own home.']
      ] },
      { s: 'other', t: 'もう？ゆっくりしていってよ。', r: 'もう？ゆっくり して いって よ。', e: 'Already? Stay a while.' },
      { s: 'you', t: 'ありがとう。でも、明日早いので。', r: 'ありがとう。でも、あした はやい ので。', e: 'Thanks, but I have an early start.', wrong: [
        ['ありがとう。でも、明日早いですから。', 'ありがとう。でも、あした はやい です から。', 'Understandable, but kara states a reason bluntly. Trailing off with node is the softer way to decline.'],
        ['ありがとう。でも、明日は早いでした。', 'ありがとう。でも、あした わ はやい でした。', 'hayai is an i-adjective — and tomorrow has not happened, so the past makes no sense either.']
      ] },
      { s: 'other', t: 'そっか。また来てね。', r: 'そっか。また きて ね。', e: 'All right. Come again.' }
    ]
  },
  {
    code: 'home-weather',
    unit: 'home',
    title: 'Talking about the weather',
    situation: 'You are both looking out of the window.',
    turns: [
      { s: 'other', t: '今日は寒いね。', r: 'きょう わ さむい ね。', e: 'Cold today.' },
      { s: 'you', t: 'そうですね。昨日より寒いです。', r: 'そう です ね。きのう より さむい です。', e: 'It is. Colder than yesterday.', wrong: [
        ['そうですね。昨日から寒いです。', 'そう です ね。きのう から さむい です。', 'kara means "since yesterday". To compare, it is yori.'],
        ['そうですね。昨日は寒いです。', 'そう です ね。きのう わ さむい です。', 'That says yesterday IS cold, in the present. Comparison needs yori.']
      ] },
      { s: 'other', t: '明日は雪だって。', r: 'あした わ ゆき だ って。', e: 'They say snow tomorrow.' },
      { s: 'you', t: '本当ですか。傘を持っていきます。', r: 'ほんとう です か。かさ お もって いきます。', e: 'Really? I will take an umbrella.', wrong: [
        ['本当ですか。傘を持ってきます。', 'ほんとう です か。かさ お もって きます。', 'motte kimasu brings something here. Taking one with you when you leave is motte ikimasu.'],
        ['本当ですか。傘が持っていきます。', 'ほんとう です か。かさ が もって いきます。', 'motsu takes an object, so the umbrella takes o.']
      ] }
    ]
  },
  {
    code: 'home-borrow',
    unit: 'home',
    title: 'Borrowing something',
    situation: 'You need a charger.',
    turns: [
      { s: 'you', t: 'すみません、充電器を貸してもらえますか。', r: 'すみません、じゅうでんき お かして もらえます か。', e: 'Could I borrow a charger?', wrong: [
        ['すみません、充電器を借りてもらえますか。', 'すみません、じゅうでんき お かりて もらえます か。', 'kariru is to borrow — that asks them to borrow one. You want them to lend: kasu.'],
        ['すみません、充電器を貸します。', 'すみません、じゅうでんき お かします。', 'That offers to lend them yours.']
      ] },
      { s: 'other', t: 'いいよ。はい、どうぞ。', r: 'いい よ。はい、どうぞ。', e: 'Sure, here.' },
      { s: 'you', t: '助かります。後で返します。', r: 'たすかります。あとで かえします。', e: 'That helps. I will give it back later.', wrong: [
        ['助かります。後で帰します。', 'たすかります。あとで かえします。', 'Same sound, two verbs: kaeru meaning to go home, and kaesu meaning to give back. Only the second takes an object.'],
        ['助かります。後で借ります。', 'たすかります。あとで かります。', 'That says you will borrow it again later.']
      ] }
    ]
  },
  {
    code: 'home-noise',
    unit: 'home',
    title: 'Asking someone to be quieter',
    situation: 'The television is loud and you have work in the morning.',
    turns: [
      { s: 'you', t: 'すみません、少し音を小さくしてもらえますか。', r: 'すみません、すこし おと お ちいさく して もらえます か。', e: 'Could you turn it down a bit?', wrong: [
        ['すみません、少し音を小さいしてもらえますか。', 'すみません、すこし おと お ちいさい して もらえます か。', 'An i-adjective becomes an adverb by dropping i and taking ku: chiisaku.'],
        ['すみません、少し音が小さくしてもらえますか。', 'すみません、すこし おと が ちいさく して もらえます か。', 'suru takes an object — the sound is what is being made smaller, so o.']
      ] },
      { s: 'other', t: 'あ、ごめん。うるさかった？', r: 'あ、ごめん。うるさかった？', e: 'Oh, sorry. Was it loud?' },
      { s: 'you', t: 'いえ、大丈夫です。ありがとうございます。', r: 'いえ、だいじょうぶ です。ありがとうございます。', e: 'No, it is fine. Thank you.', wrong: [
        ['はい、うるさいです。', 'はい、うるさい です。', 'True, perhaps, but they have already apologised and turned it down. Agreeing now is unkind.'],
        ['いえ、うるさくないでした。', 'いえ、うるさく ない でした。', 'The negative nai conjugates like an i-adjective: urusaku nakatta desu.']
      ] }
    ]
  },
  {
    code: 'cooking-recipe',
    unit: 'cooking',
    title: 'Asking how it is made',
    situation: 'Dinner was good and you want the recipe.',
    turns: [
      { s: 'you', t: 'これ、どうやって作るんですか。', r: 'これ、どうやって つくる ん です か。', e: 'How do you make this?', wrong: [
        ['これ、どうやって作りますか。', 'これ、どうやって つくります か。', 'Not wrong, but bare -masu ka asks for a fact. n desu ka asks for an explanation, which is what a recipe is.'],
        ['これ、何で作るんですか。', 'これ、なんで つくる ん です か。', 'nan de asks what it is made OF, or why. For method it is dou yatte.']
      ] },
      { s: 'other', t: '簡単だよ。切って、炒めるだけ。', r: 'かんたん だ よ。きって、いためる だけ。', e: 'It is easy. Just chop and fry.' },
      { s: 'you', t: '今度作ってみます。', r: 'こんど つくって みます。', e: 'I will try making it sometime.', wrong: [
        ['今度作ってみせます。', 'こんど つくって みせます。', 'te-misemasu means to show someone by doing it. Trying something to see how it goes is te-mimasu.'],
        ['今度作りましょう。', 'こんど つくりましょう。', 'That proposes you both make it, which is a different offer.']
      ] }
    ]
  },
  {
    code: 'shopping-supermarket',
    unit: 'shopping',
    title: 'At the supermarket',
    situation: 'You cannot find the soy sauce.',
    turns: [
      { s: 'you', t: 'すみません、醤油はどこにありますか。', r: 'すみません、しょうゆ わ どこ に あります か。', e: 'Excuse me, where is the soy sauce?', wrong: [
        ['すみません、醤油はどこでありますか。', 'すみません、しょうゆ わ どこ で あります か。', 'de is where an action happens. For where something exists, aru takes ni.'],
        ['すみません、醤油をどこにありますか。', 'すみません、しょうゆ お どこ に あります か。', 'aru is intransitive — nothing acts on the soy sauce.']
      ] },
      { s: 'other', t: '三番の棚です。', r: 'さんばん の たな です。', e: 'Aisle three.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['すみませんでした。', 'すみません でした。', 'An apology. They have helped you, not been wronged.'],
        ['よろしくお願いします。', 'よろしく おねがいします。', 'That opens a relationship or asks a favour of someone going forward. Here the favour is done.']
      ] }
    ]
  },
  {
    code: 'shopping-bag',
    unit: 'shopping',
    title: 'At the till',
    situation: 'You are paying and they ask about a bag.',
    turns: [
      { s: 'other', t: '袋はご利用ですか。', r: 'ふくろ わ ごりよう です か。', e: 'Would you like a bag?' },
      { s: 'you', t: 'いいえ、大丈夫です。持っています。', r: 'いいえ、だいじょうぶ です。もって います。', e: 'No thanks, I have one.', wrong: [
        ['いいえ、いいです。持ちます。', 'いいえ、いい です。もちます。', 'ii desu is ambiguous at a till — it can mean yes or no. And motsu says you WILL hold one; having one already is motte imasu.'],
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai then a refusal contradicts itself — they will reach for a bag.']
      ] },
      { s: 'other', t: 'かしこまりました。', r: 'かしこまりました。', e: 'Certainly.' }
    ]
  }
]
