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
      { s: 'other', t: '昨日は何時に寝たの？', r: 'きのう わ なんじ に ねた の？', e: 'What time did you go to bed last night?' },
      { s: 'you', t: '十二時ごろ寝ました。ちょっと遅かったです。', r: 'じゅうにじ ごろ ねました。ちょっと おそかった です。', e: 'I went to bed around midnight. A bit late.', wrong: [
        ['十二時ごろ寝ています。', 'じゅうにじ ごろ ねて います。', 'te-imasu describes an ongoing or habitual state. Reporting when you actually fell asleep last night is a one-off past event: nemashita.'],
        ['十二時ごろ寝ますでした。', 'じゅうにじ ごろ ねます でした。', 'masu never takes deshita for the past. The polite past of a verb is mashita, not masu deshita.']
      ] },
      { s: 'other', t: '朝ごはんは？', r: 'あさごはん わ？', e: 'Breakfast?' },
      { s: 'you', t: 'いただきます。', r: 'いただきます。', e: 'Thank you, I will.', wrong: [
        ['ごちそうさまでした。', 'ごちそうさまでした。', 'That closes a meal. You have not started one.'],
        ['おいしいです。', 'おいしい です。', 'You have not tasted it yet — this is the moment for itadakimasu.']
      ] },
      { s: 'other', t: '今日は卵焼きだよ。たくさん食べてね。', r: 'きょう わ たまごやき だ よ。たくさん たべて ね。', e: "It's rolled omelette today. Eat plenty." },
      { s: 'you', t: 'わあ、大好きです。ありがとうございます。', r: 'わあ、だいすき です。ありがとうございます。', e: 'Wow, I love it. Thank you.', wrong: [
        ['わあ、大好きでした。ありがとうございます。', 'わあ、だいすき でした。ありがとうございます。', 'daisuki is a na-adjective, and deshita puts it in the past as if you no longer feel that way. Your liking it is a present fact, so it stays daisuki desu.'],
        ['わあ、大好きします。ありがとうございます。', 'わあ、だいすき します。ありがとうございます。', 'daisuki is a na-adjective, not a verb — it never takes suru. It pairs with desu.']
      ] },
      { s: 'other', t: 'あ、そうだ。牛乳がもうないの。帰りに買ってきてくれる？', r: 'あ、そう だ。ぎゅうにゅう が もう ない の。かえり に かって きて くれる？', e: "Oh, that reminds me. There's no milk left. Can you buy some on your way back?" },
      { s: 'you', t: 'はい、分かりました。買ってきます。', r: 'はい、わかりました。かって きます。', e: "Sure, got it. I'll buy some.", wrong: [
        ['はい、分かりました。買ってあげます。', 'はい、わかりました。かって あげます。', 'te-agemasu frames it as YOU granting a favor from above. Answering a small request from your host mother just needs the plain verb, not a favor-giving form aimed at her.'],
        ['はい、分かりました。買ってくれます。', 'はい、わかりました。かって くれます。', 'kuremasu marks someone ELSE doing a favor for you. You are the one buying it for her, so this reverses who benefits.']
      ] },
      { s: 'other', t: '助かるよ。あ、今日は燃えるごみの日だから、出しておいてね。', r: 'たすかる よ。あ、きょう わ もえる ごみ の ひ だ から、だして おいて ね。', e: "That helps. Oh, today's burnable-trash day, so put it out before you go." },
      { s: 'you', t: '分かりました。出しておきます。行ってきます。', r: 'わかりました。だして おきます。いってきます。', e: "Got it. I'll put it out. I'm off.", wrong: [
        ['分かりました。出しています。行ってきます。', 'わかりました。だして います。いってきます。', 'te-imasu says the action is happening right now. Putting the bins out before leaving needs te-okimasu, which sets it up in advance and leaves it done.'],
        ['分かりました。出します。行ってきます。', 'わかりました。だします。いってきます。', 'Plain dashimasu is just a bare future action, with none of the "do it now and leave it done for later" sense that okimasu adds.']
      ] }
    ]
  },
  {
    code: 'home-leaving',
    unit: 'comings',
    title: 'Leaving the house',
    situation: 'You are on your way out.',
    turns: [
      { s: 'other', t: '今日は何時に帰るの？', r: 'きょう わ なんじ に かえる の？', e: 'What time are you back today?' },
      { s: 'you', t: '六時ごろ帰ります。友達とご飯を食べます。', r: 'ろくじ ごろ かえります。ともだち と ごはん お たべます。', e: "I'll be back around six. I'm having dinner with a friend.", wrong: [
        ['六時ごろ帰ります。友達がご飯を食べます。', 'ろくじ ごろ かえります。ともだち が ごはん お たべます。', 'to marks who you are doing the activity WITH. Swapping in ga makes the friend the one eating, and drops you out of the sentence entirely.'],
        ['六時ごろ帰ります。友達とご飯を食べています。', 'ろくじ ごろ かえります。ともだち と ごはん お たべて います。', 'te-imasu describes something happening right now. This is a plan for later today, which needs the plain future: tabemasu.']
      ] },
      { s: 'other', t: '分かった。晩ご飯はいらないね。', r: 'わかった。ばんごはん わ いらない ね。', e: "Got it. So you won't need dinner here." },
      { s: 'you', t: 'いってきます。', r: 'いってきます。', e: "I'm off.", wrong: [
        ['さようなら。', 'さようなら。', 'sayounara is a real parting — it carries the sense of not meeting again soon. Leaving your own house for the day does not.'],
        ['いってらっしゃい。', 'いってらっしゃい。', 'That is the reply, said BY the person staying. The one leaving says ittekimasu.']
      ] },
      { s: 'other', t: 'いってらっしゃい。気をつけて。', r: 'いってらっしゃい。き お つけて。', e: 'Off you go. Take care.' },
      { s: 'you', t: 'はい、行ってきます。', r: 'はい、いってきます。', e: 'Yes, see you later.', wrong: [
        ['はい、ただいま。', 'はい、ただいま。', 'tadaima is for arriving home, not leaving it.'],
        ['はい、おかえりなさい。', 'はい、おかえりなさい。', 'okaerinasai welcomes someone back. You are the one going out.']
      ] },
      { s: 'other', t: 'あ、傘を持って行った方がいいよ。雨が降りそうだから。', r: 'あ、かさ お もって いった ほう が いい よ。あめ が ふりそう だ から。', e: "Oh, you should take an umbrella. It looks like it'll rain." },
      { s: 'you', t: '大丈夫です。傘は要りません。', r: 'だいじょうぶ です。かさ わ いりません。', e: "I'm fine, I don't need an umbrella.", wrong: [
        ['いいです。傘、要ります。', 'いい です。かさ、いります。', 'ii desu declines the umbrella. Following it by asking for one contradicts the polarity of your own answer.'],
        ['大丈夫です。傘をください。', 'だいじょうぶ です。かさ お ください。', 'daijoubu desu already turns the offer down. Following it with kudasai asks for the very thing you just declined.']
      ] },
      { s: 'other', t: 'そう、分かった。楽しんできてね。', r: 'そう、わかった。たのしんで きて ね。', e: 'OK. Have fun.' },
      { s: 'you', t: 'ありがとうございます。行ってきます。', r: 'ありがとうございます。いってきます。', e: "Thanks. I'm off.", wrong: [
        ['ありがとうございます。行きます。', 'ありがとうございます。いきます。', 'ikimasu just states going somewhere. Ittekimasu is the set phrase for stepping out, promising to return.'],
        ['ありがとうございます。ただいま。', 'ありがとうございます。ただいま。', 'tadaima announces arriving home. You are heading the opposite direction.']
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
      ] },
      { s: 'other', t: 'そう、大変だったね。ご飯、もう食べた？', r: 'そう、たいへん だった ね。ごはん、もう たべた？', e: 'That sounds rough. Have you eaten yet?' },
      { s: 'you', t: 'いいえ、まだです。お腹が空いています。', r: 'いいえ、まだ です。おなか が すいて います。', e: "No, not yet. I'm hungry.", wrong: [
        ['いいえ、まだです。お腹が空けています。', 'いいえ、まだ です。おなか が あけて います。', 'akeru is transitive, "to open something." Hunger uses the intransitive suku, "to become empty," not akeru.'],
        ['いいえ、まだです。お腹を空いています。', 'いいえ、まだ です。おなか お すいて います。', 'suku is intransitive, so its subject takes ga. o would need a transitive verb acting on onaka.']
      ] },
      { s: 'other', t: 'じゃあ、すぐご飯にしよう。今日は誰が洗い物する？', r: 'じゃあ、すぐ ごはん に しよう。きょう わ だれ が あらいもの する？', e: "OK, let's eat right away then. Who's doing the washing-up today?" },
      { s: 'you', t: '今日は私がやります。昨日は姉がやってくれたので。', r: 'きょう わ わたし が やります。きのう わ あね が やって くれた ので。', e: "I'll do it today. My sister did it for me yesterday.", wrong: [
        ['今日は私がやります。昨日は姉がやってあげたので。', 'きょう わ わたし が やります。きのう わ あね が やって あげた ので。', 'yatte ageta frames your sister as doing the favor for someone else, from her own viewpoint. Since the benefit came to you, the speaker, it must be yatte kureta.'],
        ['今日は私がやります。昨日は姉がやっています。', 'きょう わ わたし が やります。きのう わ あね が やって います。', 'te-imasu describes an ongoing or habitual action. Yesterday was a one-time completed chore, which needs the past yatte kureta, not the progressive.']
      ] },
      { s: 'other', t: 'ありがとう。優しいね。', r: 'ありがとう。やさしい ね。', e: "Thanks. That's kind of you." },
      { s: 'you', t: 'いいえ、当然です。あ、お風呂は入りましたか。', r: 'いいえ、とうぜん です。あ、おふろ わ はいりました か。', e: 'Not at all, it only makes sense. Oh, have you had your bath?', wrong: [
        ['いいえ、当然です。あ、お風呂を入りましたか。', 'いいえ、とうぜん です。あ、おふろ お はいりました か。', 'hairu, "to get in," is intransitive and takes ni, not o. o would need a transitive verb like ireru.'],
        ['いいえ、当然です。あ、お風呂に入れましたか。', 'いいえ、とうぜん です。あ、おふろ に いれました か。', 'ireru is the transitive "put something in." Asking whether she bathed needs the intransitive hairu, not ireru.']
      ] },
      { s: 'other', t: 'ううん、まだ。先にご飯にしましょう。', r: 'ううん、まだ。さきに ごはん に しましょう。', e: "No, not yet. Let's eat first." },
      { s: 'you', t: 'はい、そうしましょう。いただきます。', r: 'はい、そう しましょう。いただきます。', e: "OK, let's do that. Thanks for the food.", wrong: [
        ['はい、そうでしょう。いただきます。', 'はい、そう でしょう。いただきます。', 'deshou guesses at or seeks agreement about a fact. Agreeing to a suggested plan calls for mashou, "let\'s," not a conjecture form.'],
        ['はい、そうしました。いただきます。', 'はい、そう しました。いただきます。', 'shimashita, past tense, claims you already did it. You are agreeing to do it now.']
      ] },
      { s: 'other', t: 'あ、そういえば、暖房の調子が悪いのよね。', r: 'あ、そう いえば、だんぼう の ちょうし が わるい の よ ね。', e: "Oh, that reminds me, the heater's not working right." },
      { s: 'you', t: '本当ですか。管理会社に連絡した方がいいですね。', r: 'ほんとう です か。かんりがいしゃ に れんらく した ほう が いい です ね。', e: 'Really? We should probably contact the management company.', wrong: [
        ['本当ですか。管理会社が連絡した方がいいですね。', 'ほんとう です か。かんりがいしゃ が れんらく した ほう が いい です ね。', 'renraku suru takes its target with ni, "to contact someone." ga would make the management company the one doing the contacting, not the one being contacted.'],
        ['本当ですか。管理会社に連絡する方がいいでした。', 'ほんとう です か。かんりがいしゃ に れんらく する ほう が いい でした。', 'hou ga ii is a fixed advice pattern taking desu for a present suggestion. deshita wrongly puts the advice itself in the past.']
      ] },
      { s: 'other', t: 'そうね。明日の朝、電話してみる。', r: 'そう ね。あした の あさ、でんわ して みる。', e: "Good idea. I'll try calling tomorrow morning." }
    ]
  },
  {
    code: 'home-bed',
    unit: 'comings',
    title: 'Going to bed',
    situation: 'It is late and you are turning in.',
    turns: [
      { s: 'other', t: 'そろそろ寝る時間だね。', r: 'そろそろ ねる じかん だ ね。', e: "It's about time for bed." },
      { s: 'you', t: 'そうですね。眠くなってきました。', r: 'そう です ね。ねむく なって きました。', e: "Yeah. I'm getting sleepy.", wrong: [
        ['そうですね。眠くしてきました。', 'そう です ね。ねむく して きました。', 'suru is transitive, "to make something so." Becoming sleepy on your own needs the intransitive naru, not suru.'],
        ['そうですね。眠いになってきました。', 'そう です ね。ねむい に なって きました。', 'An i-adjective attaches to naru with ku, not ni: nemuku naru, never nemui ni naru.']
      ] },
      { s: 'other', t: '電気、消してから寝てね。', r: 'でんき、けして から ねて ね。', e: 'Turn off the light before you sleep, OK?' },
      { s: 'you', t: 'はい、消しておきます。', r: 'はい、けして おきます。', e: "OK, I'll turn it off.", wrong: [
        ['はい、消えておきます。', 'はい、きえて おきます。', 'kieru is intransitive — a light going out on its own. Switching it off yourself needs the transitive kesu.'],
        ['はい、消しています。', 'はい、けして います。', 'te-imasu reports the action happening now. This is a plan for before sleeping, which needs te-okimasu, not the progressive.']
      ] },
      { s: 'other', t: '玄関の鍵、閉めた？', r: 'げんかん の かぎ、しめた？', e: 'Did you lock the front door?' },
      { s: 'you', t: 'あ、まだでした。今から閉めます。', r: 'あ、まだ でした。いま から しめます。', e: "Oh, not yet. I'll lock it now.", wrong: [
        ['あ、まだでした。今から閉まります。', 'あ、まだ でした。いま から しまります。', 'shimaru is intransitive — a door closing on its own. Locking it yourself is an action you do, which needs the transitive shimeru.'],
        ['あ、まだでした。今から閉めています。', 'あ、まだ でした。いま から しめて います。', 'te-imasu describes an action already in progress. You have not started yet — plain shimemasu.']
      ] },
      { s: 'other', t: 'お願い。あと、明日は何時に起きるの？', r: 'おねがい。あと、あした わ なんじ に おきる の？', e: 'Thanks. Also, what time are you getting up tomorrow?' },
      { s: 'you', t: '六時に起きます。アラームをかけておきます。', r: 'ろくじ に おきます。アラーム お かけて おきます。', e: "I'll get up at six. I'll set an alarm.", wrong: [
        ['六時に起こします。アラームをかけておきます。', 'ろくじ に おこします。アラーム お かけて おきます。', 'okosu is transitive, "to wake someone else up." Waking up yourself is the intransitive okiru.'],
        ['六時に起きます。アラームがかけておきます。', 'ろくじ に おきます。アラーム が かけて おきます。', 'kakeru takes its object with o. ga would make the alarm the one doing the setting.']
      ] },
      { s: 'other', t: 'じゃあ、そろそろ寝ようか。', r: 'じゃあ、そろそろ ねよう か。', e: "Well, let's turn in soon then." },
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
      ] },
      { s: 'other', t: 'また携帯探してたの？よく忘れるね。', r: 'また けいたい さがしてた の？よく わすれる ね。', e: 'Looking for your phone again? You lose it a lot.' },
      { s: 'you', t: 'すみません、気をつけます。', r: 'すみません、き お つけます。', e: "Sorry, I'll be more careful.", wrong: [
        ['すみません、気がつけます。', 'すみません、き が つけます。', 'ki o tsukeru is a set phrase — the object ki takes o, not ga.'],
        ['すみません、気をつきます。', 'すみません、き お つきます。', 'The set phrase pairs ki with tsukeru, a transitive verb. tsuku is the intransitive counterpart and does not fit here.']
      ] },
      { s: 'other', t: 'あ、そういえば、リモコンも見当たらないんだけど。', r: 'あ、そう いえば、リモコン も みあたらない ん だ けど。', e: "Oh, come to think of it, I can't find the remote either." },
      { s: 'you', t: '私は使っていません。ソファーの下は見ましたか。', r: 'わたし わ つかって いません。ソファー の した わ みました か。', e: "I haven't used it. Have you looked under the sofa?", wrong: [
        ['私は使いませんでした。ソファーの下は見ましたか。', 'わたし わ つかいません でした。ソファー の した わ みました か。', 'tsukaimasen deshita reports a completed one-time non-event in the past. The point here is your current state of not having touched it, which needs tsukatte imasen.'],
        ['私に使っていません。ソファーの下は見ましたか。', 'わたし に つかって いません。ソファー の した わ みました か。', 'The person doing the using takes wa, not ni. ni would mark a target or recipient, not the doer.']
      ] },
      { s: 'other', t: 'あ、あった！ソファーの下にあった。ありがとう。', r: 'あ、あった！ソファー の した に あった。ありがとう。', e: 'Oh, found it! It was under the sofa. Thanks.' },
      { s: 'you', t: 'よかったです。あ、そのリモコン、電池が切れていませんか。', r: 'よかった です。あ、その リモコン、でんち が きれて いません か。', e: "Glad to hear it. Oh, isn't the battery in that remote dead?", wrong: [
        ['よかったです。あ、そのリモコン、電池を切れていませんか。', 'よかった です。あ、その リモコン、でんち お きれて いません か。', 'kireru, "to run out," is intransitive, so its subject takes ga, not o.'],
        ['よかったです。あ、そのリモコン、電池が切っていませんか。', 'よかった です。あ、その リモコン、でんち が きって いません か。', 'kiru is the transitive "to cut something." A battery running out on its own needs the intransitive kireru.']
      ] },
      { s: 'other', t: 'あ、そうだ。掃除機の後ろも見てくれる？そこによく物が挟まるから。', r: 'あ、そう だ。そうじき の うしろ も みて くれる？そこ に よく もの が はさまる から。', e: 'Oh right. Can you check behind the vacuum too? Things get stuck there a lot.' },
      { s: 'you', t: '分かりました、見てみます。ついでに、電気もつけてもらえますか。暗くて見えません。', r: 'わかりました、みて みます。ついでに、でんき も つけて もらえます か。くらくて みえません。', e: "Got it, I'll take a look. While you're at it, could you turn the light on too? It's too dark to see.", wrong: [
        ['分かりました、見てみます。ついでに、電気もつけろ。暗くて見えません。', 'わかりました、みて みます。ついでに、でんき も つけろ。くらくて みえません。', 'tsukero is the bare imperative — blunt enough to sound like an order. Asking a housemate for a small favor needs the te-form request tsukete moraemasu ka, not a command.'],
        ['分かりました、見てみます。ついでに、電気もつけてあげますか。暗くて見えません。', 'わかりました、みて みます。ついでに、でんき も つけて あげます か。くらくて みえません。', 'te-agemasu ka asks whether YOU should do it FOR them, reversing who benefits. You are the one asking for help, so it needs moraemasu ka.']
      ] },
      { s: 'other', t: 'そうかも。テレビがつかないと思ってたんだ。', r: 'そう かも。テレビ が つかない と おもってた ん だ。', e: "Maybe so. I was wondering why the TV wouldn't turn on." },
      { s: 'you', t: '後で新しい電池を買ってきます。', r: 'あとで あたらしい でんち お かって きます。', e: "I'll buy new batteries later.", wrong: [
        ['後で新しい電池を買ってあげます。', 'あとで あたらしい でんち お かって あげます。', 'te-agemasu can sound like you are granting a favor from above. Offering a small errand to a housemate is plainer as kaimasu or katte kimasu.'],
        ['後で新しい電池が買ってきます。', 'あとで あたらしい でんち が かって きます。', 'kau takes its object with o. ga would make the batteries the ones doing the buying.']
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
      ] },
      { s: 'other', t: 'ネットも忘れないでね。カラスが来るから。', r: 'ネット も わすれない で ね。カラス が くる から。', e: "Don't forget the net either. The crows come." },
      { s: 'you', t: 'はい、ネットをかけておきます。何時までに出せばいいですか。', r: 'はい、ネット お かけて おきます。なんじ まで に だせば いい です か。', e: "OK, I'll put the net over it. By what time should I put it out?", wrong: [
        ['はい、ネットにかけておきます。何時までに出せばいいですか。', 'はい、ネット に かけて おきます。なんじ まで に だせば いい です か。', 'kakeru takes its object with o. ni would mark a location or target, not the thing being draped.'],
        ['はい、ネットをかかっておきます。何時までに出せばいいですか。', 'はい、ネット お かかって おきます。なんじ まで に だせば いい です か。', 'kakaru is intransitive, "to hang on its own." Actively draping the net over the bags needs the transitive kakeru.']
      ] },
      { s: 'other', t: '朝八時までですよ。あと、資源ごみは来週だから、今日は出さないでね。', r: 'あさ はちじ まで です よ。あと、しげんごみ わ らいしゅう だ から、きょう わ ださない で ね。', e: "By eight in the morning. Also, recyclables are next week, so don't put those out today." },
      { s: 'you', t: '分かりました。ペットボトルは資源ごみですよね？', r: 'わかりました。ペットボトル わ しげんごみ です よ ね？', e: 'Got it. Plastic bottles are recyclables, right?', wrong: [
        ['分かりました。ペットボトルが資源ごみですよね？', 'わかりました。ペットボトル が しげんごみ です よ ね？', 'ga would single out the bottles as the answer to "what is," as if you had no idea. wa fits a category you already believe and are just confirming.'],
        ['分かりました。ペットボトルは資源ごみでしたよね？', 'わかりました。ペットボトル わ しげんごみ でした よ ね？', 'deshita treats it as a past state that may no longer hold. Recycling categories are an ongoing fact, so desu is right.']
      ] },
      { s: 'other', t: 'そう、ペットボトルとか缶とか瓶だよ。あ、指定の袋、使ってる？', r: 'そう、ペットボトル とか かん とか びん だ よ。あ、していの ふくろ、つかってる？', e: 'Right, things like bottles, cans, and glass. Oh, are you using the designated bags?' },
      { s: 'you', t: 'あ、まだ普通の袋に入れていました。すみません。', r: 'あ、まだ ふつう の ふくろ に いれて いました。すみません。', e: "Oh, I've been putting it in a regular bag. Sorry.", wrong: [
        ['あ、まだ普通の袋に入っていました。すみません。', 'あ、まだ ふつう の ふくろ に はいって いました。すみません。', 'hairu is intransitive, something going in on its own. You were the one placing the rubbish in the bag, which needs the transitive ireru.'],
        ['あ、まだ普通の袋が入れていました。すみません。', 'あ、まだ ふつう の ふくろ が いれて いました。すみません。', 'ireru takes its object with o. ga would make the bag itself the one doing the placing.']
      ] },
      { s: 'other', t: '大丈夫、コンビニに売ってるから買っておいて。', r: 'だいじょうぶ、コンビニ に うってる から かって おいて。', e: "It's fine, they sell them at the convenience store, so pick some up." },
      { s: 'you', t: 'はい、帰りに買っておきます。', r: 'はい、かえり に かって おきます。', e: "OK, I'll pick some up on the way back.", wrong: [
        ['はい、帰りに買っています。', 'はい、かえり に かって います。', 'te-imasu reports an action underway now. This is a plan for later, which needs te-okimasu, not the progressive.'],
        ['はい、帰りが買っておきます。', 'はい、かえり が かって おきます。', 'kaeri, "the way back," is a time expression here and needs ni. ga would wrongly mark it as the one doing the buying.']
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
      { s: 'other', t: 'お願いします。助かります。', r: 'おねがいします。たすかります。', e: 'Please do. That helps.' },
      { s: 'you', t: '取り込みました。たたんでおきましょうか。', r: 'とりこみました。たたんで おきましょう か。', e: "I've brought it in. Shall I fold it too?", wrong: [
        ['取り込みました。たたみておきましょうか。', 'とりこみました。たたみて おきましょう か。', 'tatamu is a mu-verb, so its te-form is tatande, not tatamite. mu-row verbs take -nde, like nomu becoming nonde.'],
        ['取り込みました。たたんでいますか。', 'とりこみました。たたんで います か。', 'te-imasu ka asks about an action already underway. Offering to do it needs mashou ka.']
      ] },
      { s: 'other', t: 'ありがとう。じゃあ、私はアイロンをかけるね。', r: 'ありがとう。じゃあ、わたし わ アイロン お かける ね。', e: "Thanks. I'll do the ironing then." },
      { s: 'you', t: '分かりました。靴下はどこに置きますか。', r: 'わかりました。くつした わ どこ に おきます か。', e: 'Got it. Where should I put the socks?', wrong: [
        ['分かりました。靴下はどこに置いていますか。', 'わかりました。くつした わ どこ に おいて います か。', 'te-imasu asks about an ongoing state or habit. Asking where to put them now needs the plain okimasu.'],
        ['分かりました。靴下がどこに置きますか。', 'わかりました。くつした が どこ に おきます か。', 'oku takes its object with o. ga would make the socks the one doing the placing.']
      ] },
      { s: 'other', t: '引き出しに入れておいて。あ、明日も洗濯物、干す予定？', r: 'ひきだし に いれて おいて。あ、あした も せんたくもの、ほす よてい？', e: 'Put them in the drawer. Oh, are you planning to hang out more laundry tomorrow?' },
      { s: 'you', t: 'はい、明日晴れたら干します。', r: 'はい、あした はれたら ほします。', e: "Yes, if it's sunny tomorrow I'll hang it out.", wrong: [
        ['はい、明日晴れると干します。', 'はい、あした はれる と ほします。', 'to implies an automatic, inevitable consequence. A personal choice depending on the weather calls for the conditional tara, not to.'],
        ['はい、明日晴れたら干しています。', 'はい、あした はれたら ほして います。', 'te-imasu describes an ongoing or habitual action. This is a one-off plan for tomorrow, which needs the plain hoshimasu.']
      ] },
      { s: 'other', t: '分かった。じゃあ、洗剤がもうすぐ切れそうだから、買っておいてくれる？', r: 'わかった。じゃあ、せんざい が もうすぐ きれそう だ から、かって おいて くれる？', e: 'Got it. Oh, the detergent is about to run out, can you pick some up?' },
      { s: 'you', t: 'はい、今日買ってきます。', r: 'はい、きょう かって きます。', e: "Sure, I'll buy some today.", wrong: [
        ['はい、今日買ってあげます。', 'はい、きょう かって あげます。', 'te-agemasu frames it as a favor you grant from above. A small household errand answered plainly is katte kimasu, not the favor-emphasizing ageru form.'],
        ['はい、今日買ってくれます。', 'はい、きょう かって くれます。', 'kureru marks someone ELSE doing a favor for you. You are the one buying it, so this reverses the direction of the favor.']
      ] },
      { s: 'other', t: 'それと、洗濯機の調子も悪いみたい。排水がうまくいかないの。', r: 'それと、せんたくき の ちょうし も わるい みたい。はいすい が うまく いかない の。', e: "Also, the washing machine seems off too. The drainage isn't working right." },
      { s: 'you', t: 'それは困りますね。管理会社に修理をお願いしましょうか。', r: 'それ わ こまります ね。かんりがいしゃ に しゅうり お おねがいしましょう か。', e: "That's a problem. Shall we ask the management company to repair it?", wrong: [
        ['それは困りますね。管理会社が修理をお願いしましょうか。', 'それ わ こまります ね。かんりがいしゃ が しゅうり お おねがいしましょう か。', "onegai suru's target takes ni, asking a favor OF someone. ga would wrongly make the management company the one doing the asking."],
        ['それは困りますね。管理会社に修理をお願いしていました。', 'それ わ こまります ね。かんりがいしゃ に しゅうり お おねがい して いました。', "te-imashita reports something already arranged in the past. You haven't contacted them yet, so this falsely claims the request already happened."]
      ] },
      { s: 'other', t: 'そうしましょう。電話して、来週の火曜日に来てもらうことになったの。', r: 'そう しましょう。でんわ して、らいしゅう の かようび に きて もらう こと に なった の。', e: "Let's do that. I called, and it's been arranged for them to come next Tuesday." },
      { s: 'you', t: '分かりました。火曜日は家にいるようにします。', r: 'わかりました。かようび わ いえ に いる よう に します。', e: "Got it. I'll make sure to be home on Tuesday.", wrong: [
        ['分かりました。火曜日は家にいるようになります。', 'わかりました。かようび わ いえ に いる よう に なります。', 'you naru describes a change that happens on its own over time. A deliberate arrangement to be home needs you ni shimasu, "make it so."'],
        ['分かりました。火曜日は家にいてあげます。', 'わかりました。かようび わ いえ に いて あげます。', "te-agemasu frames simply staying home as a favor granted to someone. There's no one being done a favor here — it's just your own arrangement."]
      ] }
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
      ] },
      { s: 'other', t: 'あと、来週工事でうるさくなるかもしれません。すみません。', r: 'あと、らいしゅう こうじ で うるさく なる かもしれません。すみません。', e: 'Also, it might get noisy next week because of construction. Sorry about that.' },
      { s: 'you', t: '教えてくださってありがとうございます。大丈夫ですよ。', r: 'おしえて くださって ありがとうございます。だいじょうぶ です よ。', e: "Thanks for letting me know. It's fine.", wrong: [
        ['教えていただいてありがとうございます。大丈夫でした。', 'おしえて いただいて ありがとうございます。だいじょうぶ でした。', 'deshita puts your reassurance in the past, as if it no longer applies. The ongoing fact that it is fine needs desu.'],
        ['教えてくださってありがとうございます。いいです。', 'おしえて くださって ありがとうございます。いい です。', 'ii desu reads as a polite decline, not as "it is all fine." For reassurance you want daijoubu desu, not the phrase that turns things down.']
      ] },
      { s: 'other', t: 'いえいえ、こちらこそすみません。あ、そういえば、来週から資源ごみの日が変わるんですよ。', r: 'いえいえ、こちら こそ すみません。あ、そう いえば、らいしゅう から しげんごみ の ひ が かわる ん です よ。', e: 'Not at all, sorry for the disturbance myself. Oh, that reminds me, the recycling day is changing from next week.' },
      { s: 'you', t: 'え、知りませんでした。何曜日になるんですか。', r: 'え、しりません でした。なにようび に なる ん です か。', e: "Oh, I didn't know. What day will it become?", wrong: [
        ['え、知っていませんでした。何曜日になるんですか。', 'え、しって いません でした。なにようび に なる ん です か。', 'shirimasen deshita is the standard polite past of "did not know." Stacking shitte imasen deshita double-marks the negative and is not the natural form.'],
        ['え、知りませんでした。何曜日になっているんですか。', 'え、しりません でした。なにようび に なって いる ん です か。', "natte iru describes a change already complete and in effect now. The day hasn't changed yet — it needs the plain future naru."]
      ] },
      { s: 'other', t: '木曜日になるそうです。掲示板にも貼ってありますよ。', r: 'もくようび に なる そう です。けいじばん に も はって あります よ。', e: "It's supposed to become Thursday. It's posted on the notice board too." },
      { s: 'you', t: '分かりました。教えてくれて助かりました。', r: 'わかりました。おしえて くれて たすかりました。', e: 'Got it. Thanks for telling me, that helps.', wrong: [
        ['分かりました。教えてあげて助かりました。', 'わかりました。おしえて あげて たすかりました。', 'te-agete describes YOU doing someone else a favor. Tanaka told YOU, so the favor runs toward you, which needs kurete, not agete.'],
        ['分かりました。教えてくれて助かっています。', 'わかりました。おしえて くれて たすかって います。', 'te-imasu describes an ongoing state. The help was a one-time completed event just now, so it needs the plain past tasukarimashita, not the progressive.']
      ] },
      { s: 'other', t: 'どういたしまして。あ、これ、うちで作りすぎたので、よろしければどうぞ。', r: 'どう いたしまして。あ、これ、うち で つくりすぎた ので、よろしければ どうぞ。', e: "You're welcome. Oh, we made too much of this, so please have some if you'd like." },
      { s: 'you', t: 'わあ、いいんですか。ありがとうございます、いただきます。', r: 'わあ、いい ん です か。ありがとうございます、いただきます。', e: "Wow, are you sure? Thank you, I'll take it.", wrong: [
        ['わあ、大丈夫です。ありがとうございます。', 'わあ、だいじょうぶ です。ありがとうございます。', 'daijoubu desu declines an offer. You want to accept the food, so this politely refuses the very thing you mean to take.'],
        ['わあ、いいです。ありがとうございます。', 'わあ、いい です。ありがとうございます。', 'ii desu also functions as a polite decline. Accepting the offer needs itadakimasu or a clear yes, not this refusal phrase.']
      ] },
      { s: 'other', t: 'どうぞどうぞ。それでは、また。', r: 'どうぞ どうぞ。それでは、また。', e: 'Please, go ahead. Well then, see you.' },
      { s: 'you', t: 'はい、ありがとうございました。失礼します。', r: 'はい、ありがとうございました。しつれいします。', e: "Thank you so much. I'll say goodbye now.", wrong: [
        ['はい、ありがとうございました。失礼しました。', 'はい、ありがとうございました。しつれいしました。', 'shitsurei shimashita closes out a past intrusion after the fact. The set closing line for ending this exchange right now is the present shitsurei shimasu.'],
        ['はい、ありがとうございました。さようなら。', 'はい、ありがとうございました。さようなら。', 'sayounara suits a real, longer parting. With a neighbour you will see again at the door or in the building, shitsurei shimasu is the natural close.']
      ] }
    ]
  }
]
