import type { Dialogue } from './types.js'

/** More of the house: chores, weather, small talk, and the front door. */
export const HOME2: Dialogue[] = [
  // Gotcha: the shoe-removal and slipper offer happen right at the door, before the
  // gift is even out of the bag — a real arrival is several small steps, not one line.
  // Gotcha: agemasu/kuremasu direction trips learners hard when a host insists you
  // take more food — the giving verb has to point the right way or it sounds backwards.
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
      { s: 'other', t: '靴、そこで脱いでね。スリッパ使って。', r: 'くつ、そこ で ぬいで ね。スリッパ つかって。', e: 'Take your shoes off there. Use these slippers.' },
      { s: 'you', t: 'はい、失礼します。', r: 'はい、しつれいします。', e: 'Right, thank you.', wrong: [
        ['はい、失礼しました。', 'はい、しつれいしました。', 'The past tense treats it as already finished. You are only now stepping in, so the plain non-past shitsurei shimasu fits.'],
        ['はい、失礼でした。', 'はい、しつれい でした。', 'shitsurei desu/shimasu is the set apology-phrase for entering. deshita on its own just labels something as rude, which is not what you mean.']
      ] },
      { s: 'you', t: 'これ、つまらないものですが。', r: 'これ、つまらない もの です が。', e: 'A small something for you.', wrong: [
        ['これ、いいものです。', 'これ、いい もの です。', 'Praising your own gift is the opposite of the convention — you play it down, and they insist otherwise.'],
        ['これをください。', 'これ お ください。', 'kudasai asks THEM for it. You are giving.']
      ] },
      { s: 'other', t: 'ありがとう。気を使わせてごめんね。中で開けてもいい？', r: 'ありがとう。き お つかわせて ごめん ね。なか で あけて も いい？', e: 'Thank you, you should not have. Can I open it inside?' },
      { s: 'you', t: 'もちろん、どうぞ。', r: 'もちろん、どうぞ。', e: 'Of course, go ahead.', wrong: [
        ['もちろん、開けてあげます。', 'もちろん、あけて あげます。', 'agemasu here means YOU would open it for them. They are the one asking to open it, so you just grant permission: douzo.'],
        ['もちろん、開けてくれます。', 'もちろん、あけて くれます。', 'kuremasu describes someone doing you a favour. Opening a gift they received is their own action, not one done for you.']
      ] },
      { s: 'other', t: 'さあ、座って座って。もうすぐできるから。', r: 'さあ、すわって すわって。もう すぐ できる から。', e: 'Come on, sit down. It will be ready soon.' },
      { s: 'you', t: '何か手伝いましょうか。', r: 'なにか てつだいましょう か。', e: 'Should I help with anything?', wrong: [
        ['何か手伝ってもらえますか。', 'なにか てつだって もらえます か。', 'temoraemasu asks THEM to help YOU. You are offering to help them, so it is the volitional: tetsudaimashou ka.'],
        ['何か手伝ってあげますか。', 'なにか てつだって あげます か。', 'Adding ka to agemasu sounds like you are asking permission to do them a favour, which reads oddly presumptuous. The natural offer is the plain volitional: tetsudaimashou ka.']
      ] },
      { s: 'other', t: '大丈夫、座ってて。もっと食べてね、遠慮しないで。', r: 'だいじょうぶ、すわってて。もっと たべて ね、えんりょ しないで。', e: 'It is fine, just sit. Eat more, do not be shy.' },
      { s: 'you', t: 'じゃあ、遠慮なくいただきます。', r: 'じゃあ、えんりょ なく いただきます。', e: 'Well then, I will not hold back.', wrong: [
        ['じゃあ、遠慮なくもらいます。', 'じゃあ、えんりょ なく もらいます。', 'moraimasu is plain and fine among friends, but at a meal someone made for you, the humble itadakimasu is what actually gets said.'],
        ['じゃあ、遠慮なくくれます。', 'じゃあ、えんりょ なく くれます。', 'kuremasu describes someone else giving to you — it cannot describe your own act of eating or receiving here.']
      ] }
    ]
  },
  // Gotcha: a real goodbye at a friend's house is a little tug-of-war — you announce
  // you are leaving, they push back at least once, and only then do you actually go.
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
      { s: 'other', t: 'そっか、残念。じゃあ駅まで送ろうか。', r: 'そっか、ざんねん。じゃあ えき まで おくろう か。', e: 'Ah, too bad. Should I walk you to the station?' },
      { s: 'you', t: 'いいよ、すぐそこだから。', r: 'いい よ、すぐ そこ だ から。', e: 'No need, it is right there.', wrong: [
        ['大丈夫よ、すぐそこだから。', 'だいじょうぶ よ、すぐ そこ だ から。', 'daijoubu answers a question about your condition or an offer of help with a slightly different nuance — among close friends turning down a small offer like this, ii yo is the natural, casual line.'],
        ['いいよ、すぐそこにする。', 'いい よ、すぐ そこ に する。', 'suru means "to decide on" or "to make into" — it cannot attach to a plain location like "right there" as a reason.']
      ] },
      { s: 'other', t: '本当に？暗いから気をつけてね。', r: 'ほんとう に？くらい から き お つけて ね。', e: 'Really? It is dark, so be careful.' },
      { s: 'you', t: 'うん、大丈夫。忘れ物ないかな。', r: 'うん、だいじょうぶ。わすれもの ない か な。', e: 'Yeah, I will be fine. Did I forget anything?', wrong: [
        ['うん、大丈夫。忘れ物がないだった。', 'うん、だいじょうぶ。わすれもの が ない だった。', 'nai is an i-adjective in form, so its past is nakatta, not nai + datta.'],
        ['うん、大丈夫。忘れ物を残していない？', 'うん、だいじょうぶ。わすれもの お のこして いない？', 'nokosu means to leave something behind deliberately. Checking you have not forgotten anything by accident is wasuremono, not nokosu.']
      ] },
      { s: 'other', t: 'あ、携帯忘れてるよ。', r: 'あ、けいたい わすれてる よ。', e: 'Oh, you left your phone.' },
      { s: 'you', t: 'あ、ほんとだ。危なかった、ありがとう。', r: 'あ、ほんと だ。あぶなかった、ありがとう。', e: 'Oh, you are right. That was close, thanks.', wrong: [
        ['あ、ほんとだ。危ないだった、ありがとう。', 'あ、ほんと だ。あぶない だった、ありがとう。', 'abunai is an i-adjective — its past is abunakatta, not abunai + datta.'],
        ['あ、ほんとだ。危なそうだった、ありがとう。', 'あ、ほんと だ。あぶなそう だった、ありがとう。', 'abunasou describes something that LOOKS dangerous. You mean the situation actually was close, which is just abunakatta.']
      ] },
      { s: 'other', t: 'そっか。また来てね。', r: 'そっか。また きて ね。', e: 'All right. Come again.' },
      { s: 'you', t: '今日はありがとう。おやすみ。', r: 'きょう わ ありがとう。おやすみ。', e: 'Thanks for today. Good night.', wrong: [
        ['今日はありがとう。おやすみなさい。', 'きょう わ ありがとう。おやすみなさい。', 'Not wrong exactly, but oyasumi nasai is what you say to someone about to sleep in the same place as you. Leaving for the night, close friends just trade the plain oyasumi.'],
        ['今日はありがとう。お休みでした。', 'きょう わ ありがとう。おやすみ でした。', 'oyasumi as a parting phrase is fixed — adding deshita turns it into a statement about a day off, not a goodnight.']
      ] }
    ]
  },
  // Gotcha: small talk about weather never stays on weather for long — it drifts into
  // plans for the day, which is exactly how it goes among people who live together.
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
      { s: 'other', t: '暖房つけようか。', r: 'だんぼう つけよう か。', e: 'Should I turn the heater on?' },
      { s: 'you', t: 'お願いします。足が冷えてきました。', r: 'おねがいします。あし が ひえて きました。', e: 'Please. My feet are getting cold.', wrong: [
        ['お願いします。足が冷えていました。', 'おねがいします。あし が ひえて いました。', 'te imashita describes a past ongoing state that has now ended. Your feet are cold right now and getting colder, which is te kimashita.'],
        ['お願いします。足を冷えてきました。', 'おねがいします。あし お ひえて きました。', 'hieru is intransitive — nothing is acting on the feet, so they take ga, not o.']
      ] },
      { s: 'other', t: '明日は雪だって。', r: 'あした わ ゆき だ って。', e: 'They say snow tomorrow.' },
      { s: 'you', t: '本当ですか。傘を持っていきます。', r: 'ほんとう です か。かさ お もって いきます。', e: 'Really? I will take an umbrella.', wrong: [
        ['本当ですか。傘を持ってきます。', 'ほんとう です か。かさ お もって きます。', 'motte kimasu brings something here. Taking one with you when you leave is motte ikimasu.'],
        ['本当ですか。傘が持っていきます。', 'ほんとう です か。かさ が もって いきます。', 'motsu takes an object, so the umbrella takes o.']
      ] },
      { s: 'other', t: '積もるかな。電車止まったら困るね。', r: 'つもる か な。でんしゃ とまったら こまる ね。', e: 'I wonder if it will settle. It would be a pain if the trains stopped.' },
      { s: 'you', t: '止まったら、歩いて行くしかないですね。', r: 'とまったら、あるいて いく しか ない です ね。', e: 'If they stop, we will just have to walk.', wrong: [
        ['止まると、歩いて行くしかないですね。', 'とまる と、あるいて いく しか ない です ね。', 'to describes an automatic, every-time result. Trains stopping is a one-off possibility, which calls for tara.'],
        ['止まれば、歩いて行くしかないですね。', 'とまれば、あるいて いく しか ない です ね。', 'Not wrong exactly, but reba on a verb like this sounds like weighing a condition in the abstract. tara reads more naturally for a concrete "if that happens tomorrow" situation.']
      ] },
      { s: 'other', t: 'そうだね。早めに出た方がいいかも。', r: 'そう だ ね。はやめ に でた ほう が いい か も。', e: 'True. Maybe we should leave a bit early.' },
      { s: 'you', t: 'じゃあ、いつもより十分早く出ましょう。', r: 'じゃあ、いつも より じゅっぷん はやく でましょう。', e: 'Then let us leave ten minutes earlier than usual.', wrong: [
        ['じゃあ、いつもから十分早く出ましょう。', 'じゃあ、いつも から じゅっぷん はやく でましょう。', 'kara means "from/since". Comparing to the usual time needs yori.'],
        ['じゃあ、いつもより十分早く出します。', 'じゃあ、いつも より じゅっぷん はやく だします。', 'dasu means to take something out or submit it. Leaving the house yourself is deru, and the volitional demashou fits the "let\'s" here.']
      ] }
    ]
  },
  // Gotcha: borrowing rarely ends cleanly the first time — the thing offered is
  // often the wrong size or nearly dead, and that has to get sorted before it works.
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
      { s: 'you', t: 'あれ、これ短くないですか。届かないかも。', r: 'あれ、これ みじかく ない です か。とどかない か も。', e: 'Huh, is this not a bit short? It might not reach.', wrong: [
        ['あれ、これ短くしないですか。届かないかも。', 'あれ、これ みじかく しない です か。とどかない か も。', 'shinai would mean someone is deliberately choosing not to make it short. You are just describing the cable itself: mijikaku nai desu ka.'],
        ['あれ、これ短いじゃないですか。届かないかも。', 'あれ、これ みじかい じゃ ない です か。とどかない か も。', 'ja nai desu ka after a plain adjective needs the copula form: mijikaku nai desu ka, or mijikai n ja nai desu ka with n inserted.']
      ] },
      { s: 'other', t: 'あ、本当だ。ロングタイプもあるよ、待って。', r: 'あ、ほんとう だ。ロングタイプ も ある よ、まって。', e: 'Oh, you are right. I have a long one too, wait.' },
      { s: 'you', t: 'こっちなら足りそうです。', r: 'こっち なら たりそう です。', e: 'This one looks like it will be enough.', wrong: [
        ['こっちなら足りるそうです。', 'こっち なら たりる そう です。', 'sou desu after the dictionary form reports something you heard secondhand. Judging by how it looks yourself is the sou stem: tari-sou desu.'],
        ['こっちに足りそうです。', 'こっち に たりそう です。', 'The topic here is "this one, in contrast to the other", which is the role of nara, not ni.']
      ] },
      { s: 'other', t: 'よかった。それ、うちのバッテリーけっこう遅いから気をつけて。', r: 'よかった。それ、うち の バッテリー けっこう おそい から き お つけて。', e: 'Good. Careful, that charger of mine is pretty slow.' },
      { s: 'you', t: '分かりました。どれくらい充電にかかりますか。', r: 'わかりました。どれくらい じゅうでん に かかります か。', e: 'Got it. About how long does it take to charge?', wrong: [
        ['分かりました。どれくらい充電をかかりますか。', 'わかりました。どれくらい じゅうでん お かかります か。', 'kakaru is intransitive — time simply takes, it is not acted on — so the thing it takes for is marked with ni, not o.'],
        ['分かりました。どれくらい充電がかけますか。', 'わかりました。どれくらい じゅうでん が かけます か。', 'kakeru is the transitive partner of kakaru and needs an object doing the hanging/spending. Asking how long something takes is kakaru: dore kurai kakarimasu ka.']
      ] },
      { s: 'other', t: '一時間くらいかな。夜まで置いておいていいよ。', r: 'いちじかん くらい か な。よる まで おいて おいて いい よ。', e: 'About an hour, I think. You can leave it out until evening.' },
      { s: 'you', t: '助かります。後で返します。', r: 'たすかります。あとで かえします。', e: 'That helps. I will give it back later.', wrong: [
        ['助かります。後で帰します。', 'たすかります。あとで かえします。', 'Same sound, two verbs: kaeru meaning to go home, and kaesu meaning to give back. Only the second takes an object.'],
        ['助かります。後で借ります。', 'たすかります。あとで かります。', 'That says you will borrow it again later.']
      ] }
    ]
  },
  // Gotcha: a noise complaint at home rarely resolves in one exchange — it usually
  // circles back to a bit of negotiation about how loud is actually OK.
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
      { s: 'you', t: '少しだけです。明日早く起きなきゃいけないので。', r: 'すこし だけ です。あした はやく おきなきゃ いけない ので。', e: 'Just a bit. I have to get up early tomorrow.', wrong: [
        ['少しだけです。明日早く起きるなきゃいけないので。', 'すこし だけ です。あした はやく おきる なきゃ いけない ので。', 'nakya attaches to the negative stem, not the dictionary form: okinakya, not okiru + nakya.'],
        ['少しだけです。明日早く起きなくてもいいので。', 'すこし だけ です。あした はやく おきなくて も いい ので。', 'nakute mo ii means it is fine NOT to do something. You mean the opposite, that you must get up early: okinakya ikenai.']
      ] },
      { s: 'other', t: 'このくらいなら大丈夫かな。', r: 'この くらい なら だいじょうぶ か な。', e: 'Is it OK around this level?' },
      { s: 'you', t: 'あ、それくらいなら全然大丈夫です。', r: 'あ、それ くらい なら ぜんぜん だいじょうぶ です。', e: 'Oh, that level is totally fine.', wrong: [
        ['あ、それぐらいなら全然いいです。', 'あ、それ ぐらい なら ぜんぜん いい です。', 'ii desu on its own reads as a soft decline. Confirming that a level is actually acceptable calls for daijoubu desu here.'],
        ['あ、それくらいなら全然大丈夫でした。', 'あ、それ くらい なら ぜんぜん だいじょうぶ でした。', 'The past deshita treats this as a settled, finished matter. You are confirming the current volume right now, so the plain desu fits.']
      ] },
      { s: 'other', t: 'ならよかった。もし夜また聞こえたら言ってね。', r: 'なら よかった。もし よる また きこえたら いって ね。', e: 'Good, then. If you hear it again at night, let me know.' },
      { s: 'you', t: '分かりました。ありがとうございます。', r: 'わかりました。ありがとうございます。', e: 'Will do. Thank you.', wrong: [
        ['分かります。ありがとうございます。', 'わかります。ありがとうございます。', 'wakarimasu states a general ability to understand. Agreeing to what was just said needs the past: wakarimashita.'],
        ['分かりました。ありがとうございました。', 'わかりました。ありがとうございました。', 'Past arigatou gozaimashita closes the thanks as if the matter were over. Since you might still knock again tonight, plain gozaimasu fits better.']
      ] },
      { s: 'other', t: 'いえいえ、こちらこそ気づかなくてごめんね。', r: 'いえいえ、こちら こそ きづかなくて ごめん ね。', e: 'No no, sorry for not noticing myself.' },
      { s: 'you', t: 'いえ、大丈夫です。ありがとうございます。', r: 'いえ、だいじょうぶ です。ありがとうございます。', e: 'No, it is fine. Thank you.', wrong: [
        ['はい、うるさいです。', 'はい、うるさい です。', 'True, perhaps, but they have already apologised and turned it down. Agreeing now is unkind.'],
        ['いえ、うるさくないでした。', 'いえ、うるさく ない でした。', 'The negative nai conjugates like an i-adjective: urusaku nakatta desu.']
      ] }
    ]
  },
  // Gotcha: asking for a recipe pulls in ingredient amounts and technique, not just
  // the one-line method — a real cook explains the bits that are easy to get wrong.
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
      { s: 'you', t: '味付けは何を使っていますか。', r: 'あじつけ わ なに お つかって います か。', e: 'What do you use for the seasoning?', wrong: [
        ['味付けは何を使いますか。', 'あじつけ わ なに お つかいます か。', 'Not wrong, but bare tsukaimasu ka asks in general. tsukatte imasu ka asks specifically what is IN this dish right now.'],
        ['味付けを何が使っていますか。', 'あじつけ お なに が つかって います か。', 'tsukau takes an object with o — the thing being used, nani, needs o here, and ajitsuke becomes the topic with wa.']
      ] },
      { s: 'other', t: '醤油とみりんと、あとは砂糖を少し。', r: 'しょうゆ と みりん と、あと わ さとう お すこし。', e: 'Soy sauce, mirin, and then a little sugar.' },
      { s: 'you', t: 'どれくらいの量ですか。', r: 'どれ くらい の りょう です か。', e: 'About how much of each?', wrong: [
        ['どれくらいが量ですか。', 'どれ くらい が りょう です か。', 'This asks "how much IS the amount", which is circular. You want to know the quantity of what was just named: dore kurai no ryou desu ka.'],
        ['どれくらいを量ですか。', 'どれ くらい お りょう です か。', 'ryou desu ka needs no linking particle here — no connects "how much" to "amount" as a modifier, not o.']
      ] },
      { s: 'other', t: '目分量だから、正確には分からないな。', r: 'めぶんりょう だ から、せいかく に わ わからない な。', e: 'I just eyeball it, so I do not know exactly.' },
      { s: 'you', t: 'なるほど。とりあえず自分でも試してみます。', r: 'なるほど。とりあえず じぶん で も ためして みます。', e: 'I see. I will just try it myself for now.', wrong: [
        ['なるほど。とりあえず自分でも試してあげます。', 'なるほど。とりあえず じぶん で も ためして あげます。', 'te agemasu frames trying it as a favour done for someone else. Trying something yourself, to see, is just te mimasu.'],
        ['なるほど。とりあえず自分でも試したらいいです。', 'なるほど。とりあえず じぶん で も ためしたら いい です。', 'tara ii desu suggests advice to someone else about what they should do. Stating your own intention just needs the plain te mimasu.']
      ] },
      { s: 'other', t: '焦げやすいから、火加減だけ気をつけてね。', r: 'こげやすい から、ひかげん だけ き お つけて ね。', e: 'It burns easily, so just watch the heat.' },
      { s: 'you', t: '分かりました。今度作ってみます。', r: 'わかりました。こんど つくって みます。', e: 'Got it. I will try making it sometime.', wrong: [
        ['分かりました。今度作ってみせます。', 'わかりました。こんど つくって みせます。', 'te-misemasu means to show someone by doing it. Trying something to see how it goes is te-mimasu.'],
        ['分かりました。今度作りましょう。', 'わかりました。こんど つくりましょう。', 'That proposes you both make it, which is a different offer.']
      ] }
    ]
  },
  // Gotcha: not finding an item is rarely the whole story — the size or brand is
  // often wrong too, which is what actually sends someone looking for staff twice.
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
      { s: 'other', t: '三番の棚です。調味料のところです。', r: 'さんばん の たな です。ちょうみりょう の ところ です。', e: 'Aisle three. It is in the seasonings section.' },
      { s: 'you', t: 'ありがとうございます。行ってみます。', r: 'ありがとうございます。いって みます。', e: 'Thank you. I will go take a look.', wrong: [
        ['ありがとうございます。行ってあげます。', 'ありがとうございます。いって あげます。', 'te agemasu frames going as a favour for someone else. Going to check for yourself is just te mimasu.'],
        ['ありがとうございます。行ってくれます。', 'ありがとうございます。いって くれます。', 'kuremasu describes someone else doing something FOR you. You are the one about to go, so this cannot be the verb.']
      ] },
      { s: 'other', t: 'あ、ちいさいボトルのは今切れてて、大きいのしかないんです。', r: 'あ、ちいさい ボトル の わ いま きれてて、おおきい の しか ない ん です。', e: 'Oh, the small bottle is out of stock right now, we only have the big one.' },
      { s: 'you', t: 'そうなんですね。じゃあ大きいのでいいです。', r: 'そう な ん です ね。じゃあ おおきい の で いい です。', e: 'I see. The big one is fine then.', wrong: [
        ['そうなんですね。じゃあ大きいのがいいです。', 'そう な ん です ね。じゃあ おおきい の が いい です。', 'ga ii desu states a genuine preference, as if you actually wanted the big one. Settling for it because it is the only option is X de ii desu.'],
        ['そうなんですね。じゃあ大きいのでいいですか。', 'そう な ん です ね。じゃあ おおきい の で いい です か。', 'Adding ka turns your own decision back into a question to them, when you are the one settling on the big bottle.']
      ] },
      { s: 'other', t: '分かりました。ほかに何かお探しですか。', r: 'わかりました。ほか に なにか おさがし です か。', e: 'Got it. Are you looking for anything else?' },
      { s: 'you', t: 'あ、みりんも探しているんですが、どこにありますか。', r: 'あ、みりん も さがして いる ん です が、どこ に あります か。', e: 'Oh, I am also looking for mirin, where is that?', wrong: [
        ['あ、みりんも探すんですが、どこにありますか。', 'あ、みりん も さがす ん です が、どこ に あります か。', 'sagasu describes searching in general. You are already in the middle of looking, which is the ongoing form: sagashite iru.'],
        ['あ、みりんも探されているんですが、どこにありますか。', 'あ、みりん も さがされて いる ん です が、どこ に あります か。', 'sagasareru is the passive/respectful form, aimed at someone else searching. You are describing your own search, so no honorific is needed.']
      ] },
      { s: 'other', t: 'みりんも同じ棚にありますよ。すぐ隣です。', r: 'みりん も おなじ たな に あります よ。すぐ となり です。', e: 'Mirin is on the same shelf too. Right next to it.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['すみませんでした。', 'すみません でした。', 'An apology. They have helped you, not been wronged.'],
        ['よろしくお願いします。', 'よろしく おねがいします。', 'That opens a relationship or asks a favour of someone going forward. Here the favour is done.']
      ] }
    ]
  },
  // Gotcha: the bag question at the till chains straight into points cards and
  // payment method — a real transaction is a quick sequence of yes/no answers.
  {
    code: 'shopping-bag',
    unit: 'shopping',
    title: 'At the till',
    situation: 'You are paying and they ask about a bag.',
    turns: [
      { s: 'other', t: 'ポイントカードはお持ちですか。', r: 'ポイントカード わ おもち です か。', e: 'Do you have a points card?' },
      { s: 'you', t: 'いいえ、持っていません。', r: 'いいえ、もって いません。', e: 'No, I do not.', wrong: [
        ['いいえ、持ちません。', 'いいえ、もちません。', 'motanai describes a future or habitual choice not to hold something. Not currently possessing one is the ongoing negative: motte imasen.'],
        ['いいえ、持っていないでした。', 'いいえ、もって いない でした。', 'The negative te iru conjugates like an i-adjective, so its past is motte inakatta, not motte inai + deshita.']
      ] },
      { s: 'other', t: '袋はご利用ですか。', r: 'ふくろ わ ごりよう です か。', e: 'Would you like a bag?' },
      { s: 'you', t: 'いいえ、大丈夫です。持っています。', r: 'いいえ、だいじょうぶ です。もって います。', e: 'No thanks, I have one.', wrong: [
        ['いいえ、いいです。持ちます。', 'いいえ、いい です。もちます。', 'ii desu is ambiguous at a till — it can mean yes or no. And motsu says you WILL hold one; having one already is motte imasu.'],
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai then a refusal contradicts itself — they will reach for a bag.']
      ] },
      { s: 'other', t: 'かしこまりました。お会計、千二百三十円になります。', r: 'かしこまりました。おかいけい、せんにひゃくさんじゅうえん に なります。', e: 'Certainly. That comes to 1,230 yen.' },
      { s: 'you', t: 'カードで払ってもいいですか。', r: 'カード で はらって も いい です か。', e: 'Can I pay by card?', wrong: [
        ['カードに払ってもいいですか。', 'カード に はらって も いい です か。', 'harau needs the means marked with de, not ni — de shows what you are paying WITH.'],
        ['カードを払ってもいいですか。', 'カード お はらって も いい です か。', 'The card is not the thing being paid — the bill is. The card is the method, marked with de.']
      ] },
      { s: 'other', t: 'はい、大丈夫です。こちらの機械にどうぞ。', r: 'はい、だいじょうぶ です。こちら の きかい に どうぞ。', e: 'Yes, that is fine. Please use this machine.' },
      { s: 'you', t: 'あ、エラーが出ました。もう一度お願いします。', r: 'あ、エラー が でました。もう いちど おねがいします。', e: 'Oh, it gave an error. Once more, please.', wrong: [
        ['あ、エラーを出ました。もう一度お願いします。', 'あ、エラー お でました。もう いちど おねがいします。', 'deru is intransitive — the error appeared on its own, nothing produced it deliberately, so it takes ga, not o.'],
        ['あ、エラーが出しました。もう一度お願いします。', 'あ、エラー が だしました。もう いちど おねがいします。', 'dasu is the transitive partner of deru and needs someone doing the producing. An error just showing up on the screen is deru: dete kimashita.']
      ] },
      { s: 'other', t: 'あ、こちらの操作でした。すみません。もう一度どうぞ。', r: 'あ、こちら の そうさ でした。すみません。もう いちど どうぞ。', e: 'Ah, that was our mistake with the machine. Sorry. Please try again.' },
      { s: 'you', t: '大丈夫です。あ、今度は通りました。', r: 'だいじょうぶ です。あ、こんど わ とおりました。', e: 'No worries. Oh, it went through this time.', wrong: [
        ['大丈夫です。あ、今度は通しました。', 'だいじょうぶ です。あ、こんど わ とおしました。', 'toosu is transitive and needs someone pushing something through deliberately. The payment simply going through on its own is tooru: toorimashita.'],
        ['大丈夫です。あ、今度は通ってきました。', 'だいじょうぶ です。あ、こんど わ とおって きました。', 'te kimashita suggests something approaching or arriving from elsewhere over time. A card payment clearing right now is just the plain past: toorimashita.']
      ] },
      { s: 'other', t: 'かしこまりました。', r: 'かしこまりました。', e: 'Certainly.' }
    ]
  }
]
