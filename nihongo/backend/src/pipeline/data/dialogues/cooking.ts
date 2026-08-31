import type { Dialogue } from './types.js'

/** Cooking, meals and the bath — the domestic evening. */
export const COOKING: Dialogue[] = [
  {
    code: 'cooking-whats-for-dinner',
    unit: 'cooking',
    title: 'What is for dinner',
    situation: 'You come into the kitchen and something smells good.',
    turns: [
      { s: 'you', t: '今晩は何ですか。', r: 'こんばん わ なん です か。', e: 'What is for dinner tonight?', wrong: [
        ['今晩は何ましたか。', 'こんばん わ なん ました か。', 'nan is a noun; it cannot take a verb ending. The copula does the work: nan desu ka.'],
        ['今晩が何ですか。', 'こんばん が なん です か。', 'ga would single tonight out against other nights. Simply asking about tonight takes wa.']
      ] },
      { s: 'other', t: 'カレーだよ。', r: 'カレー だ よ。', e: 'Curry.' },
      { s: 'you', t: '何人分を作りますか。', r: 'なんにんぶん お つくります か。', e: 'How many portions are you making?', wrong: [
        ['何人作りますか。', 'なんにん つくります か。', '-nin counts people themselves, not servings of food; a portion is counted with -ninbun.'],
        ['何人分は作りますか。', 'なんにんぶん わ つくります か。', 'wa marks a topic already known to both speakers. An interrogative phrase like nan-ninbun asks for new information, and question words never take wa.'],
        ['何人分を作りませんか。', 'なんにんぶん お つくりません か。', 'Negative masen ka is an invitation — "shall we make it together?" — not a question about quantity.']
      ] },
      { s: 'other', t: '三人分だよ。', r: 'さんにんぶん だ よ。', e: 'Three portions.' },
      { s: 'you', t: '手伝いましょうか。', r: 'てつだいましょう か。', e: 'Shall I help?', wrong: [
        ['手伝いますか。', 'てつだいます か。', 'That asks whether THEY will help. To offer, use mashou ka.'],
        ['手伝ってください。', 'てつだって ください。', 'That asks them to help YOU — the opposite of an offer.']
      ] },
      { s: 'other', t: 'じゃあ、野菜を切って。', r: 'じゃあ、やさい お きって。', e: 'Then cut the vegetables.' },
      { s: 'you', t: '玉ねぎは何個要りますか。', r: 'たまねぎ わ なんこ いります か。', e: 'How many onions do we need?', wrong: [
        ['玉ねぎは何本要りますか。', 'たまねぎ わ なんぼん いります か。', 'hon counts long thin things like bottles or sticks. Onions are round, so the counter is ko.'],
        ['玉ねぎは何個ありますか。', 'たまねぎ わ なんこ あります か。', 'arimasu asks what already exists. You are asking how many are needed, which is the verb iru.'],
        ['玉ねぎを何個要りますか。', 'たまねぎ お なんこ いります か。', 'iru marks the thing needed with ga, not wo — wo is for the object of a transitive action, and needing is not one.']
      ] },
      { s: 'other', t: '一個でいいよ。もう切ってあるから。', r: 'いっこ で いい よ。もう きって ある から。', e: 'One is enough. It is already cut.' },
      { s: 'you', t: 'あ、じゃあ、にんじんを切ります。', r: 'あ、じゃあ、にんじん お きります。', e: 'Oh, then I will cut the carrots.', wrong: [
        ['にんじんが切ります。', 'にんじん が きります。', 'kiru is transitive; the thing being cut takes wo. ga would need the intransitive kireru instead.'],
        ['にんじんを切れます。', 'にんじん お きれます。', 'kireru is the potential/spontaneous form ("can cut" or "cuts easily"). Stating what you will do next needs the plain kirimasu.'],
        ['にんじんを切ってあります。', 'にんじん お きって あります。', 'te-arimasu describes something already prepared by someone. You are announcing what you are about to do, not a finished state.']
      ] },
      { s: 'other', t: 'ありがとう。助かる。', r: 'ありがとう。たすかる。', e: 'Thanks, that helps.' }
    ]
  },
  {
    code: 'cooking-fridge',
    unit: 'cooking',
    title: 'What is in the fridge',
    situation: 'You are checking whether anything needs using up.',
    turns: [
      { s: 'you', t: '冷蔵庫に卵がありますか。', r: 'れいぞうこ に たまご が あります か。', e: 'Are there any eggs in the fridge?', wrong: [
        ['冷蔵庫で卵がありますか。', 'れいぞうこ で たまご が あります か。', 'de marks where an action happens. For where something exists, aru takes ni.'],
        ['冷蔵庫に卵をありますか。', 'れいぞうこ に たまご お あります か。', 'aru is intransitive — nothing acts on the eggs. The thing that exists takes ga.']
      ] },
      { s: 'other', t: '二つだけあるよ。', r: 'ふたつ だけ ある よ。', e: 'Only two.' },
      { s: 'you', t: 'オムレツには三つ要りますね。', r: 'オムレツ に わ みっつ いります ね。', e: 'We will need three for an omelette.', wrong: [
        ['オムレツには三本要りますね。', 'オムレツ に わ さんぼん いります ね。', 'hon counts long thin objects. Eggs are counted with the native series hitotsu, futatsu, mittsu, not hon.'],
        ['オムレツには三つ要りますか。', 'オムレツ に わ みっつ いります か。', 'ka turns this into a plain yes/no question. You are stating what is needed and inviting agreement, which is what ne does.'],
        ['オムレツを三つ要りますね。', 'オムレツ お みっつ いります ね。', 'ni marks the omelette as what the eggs are for. Switching to wo makes the omelette itself the thing needed, as if you needed three omelettes.']
      ] },
      { s: 'other', t: 'じゃあ、買い物に行かないと。', r: 'じゃあ、かいもの に いかない と。', e: 'Then I had better go shopping.' },
      { s: 'you', t: 'じゃあ、買ってきます。', r: 'じゃあ、かって きます。', e: 'I will go and buy some then.', wrong: [
        ['じゃあ、買っていきます。', 'じゃあ、かって いきます。', 'te-ikimasu goes and does not come back. Fetching something means returning with it: katte kimasu.'],
        ['じゃあ、買いました。', 'じゃあ、かいました。', 'Past tense claims you already have.']
      ] },
      { s: 'other', t: 'ついでに牛乳もお願い。', r: 'ついでに ぎゅうにゅう も おねがい。', e: 'While you are at it, milk too, please.' },
      { s: 'you', t: 'はい。牛乳は何本要りますか。', r: 'はい。ぎゅうにゅう わ なんぼん いります か。', e: 'Sure. How many do we need?', wrong: [
        ['はい。牛乳は何個要りますか。', 'はい。ぎゅうにゅう わ なんこ いります か。', 'ko is for small round objects. Milk comes in bottles or cartons, so the counter is hon.'],
        ['はい。牛乳は何本ありますか。', 'はい。ぎゅうにゅう わ なんぼん あります か。', 'arimasu asks what already exists. You are asking how many to buy, which is the verb iru.'],
        ['はい。牛乳が何本要りますか。', 'はい。ぎゅうにゅう が なんぼん いります か。', 'Milk was just mentioned by the other person, so it is already the topic and takes wa — ga would treat it as brand-new information.']
      ] },
      { s: 'other', t: '一本でいいよ。', r: 'いっぽん で いい よ。', e: 'One is fine.' },
      { s: 'you', t: 'ただいま。卵、売り切れだったので、代わりに豆腐を買いました。', r: 'ただいま。たまご、うりきれ だった ので、かわりに とうふ お かいました。', e: 'I am back. The eggs were sold out, so I bought tofu instead.', wrong: [
        ['ただいま。卵、売り切っただったので、代わりに豆腐を買いました。', 'ただいま。たまご、うりきった だった ので、かわりに とうふ お かいました。', 'urikiru is transitive — the shop sells something out. The eggs being unavailable is the intransitive urikireru, and da cannot attach to the plain past uritta anyway.'],
        ['ただいま。卵、売り切れだったので、代わりに豆腐が買いました。', 'ただいま。たまご、うりきれ だった ので、かわりに とうふ が かいました。', 'ga would make the tofu the one doing the buying. You bought it, so tofu is the object: wo.'],
        ['ただいま。卵、売り切れだったので、代わりに豆腐をあげました。', 'ただいま。たまご、うりきれ だった ので、かわりに とうふ お あげました。', 'ageru is for giving something to someone else. You bought the tofu for the meal — kaimashita, not agemashita.']
      ] },
      { s: 'other', t: 'お帰り。豆腐？いいね、それで作ろう。', r: 'おかえり。とうふ？いい ね、それ で つくろう。', e: 'Welcome back. Tofu? Good, let us make it with that.' },
      { s: 'you', t: 'はい、じゃあ、始めましょう。', r: 'はい、じゃあ、はじめましょう。', e: 'Yes, let us get started then.', wrong: [
        ['はい、じゃあ、始まりましょう。', 'はい、じゃあ、はじまりましょう。', 'hajimaru is intransitive — it begins by itself. You are the one starting the cooking, which needs the transitive hajimeru.'],
        ['はい、じゃあ、始めります。', 'はい、じゃあ、はじめります。', 'hajimeru is an ichidan verb; its volitional is hajimeyou or hajimemashou, not a godan-style hajimerimasu.'],
        ['はい、じゃあ、始めます。', 'はい、じゃあ、はじめます。', 'hajimemasu just states a future fact. Proposing to start together needs the volitional mashou.']
      ] }
    ]
  },
  {
    code: 'cooking-table',
    unit: 'cooking',
    title: 'Laying the table',
    situation: 'Dinner is nearly ready.',
    turns: [
      { s: 'other', t: 'お皿を出してくれる？', r: 'おさら お だして くれる？', e: 'Could you get the plates out?' },
      { s: 'you', t: 'はい。何枚要りますか。', r: 'はい。なんまい いります か。', e: 'Yes. How many do I need?', wrong: [
        ['はい。何個要りますか。', 'はい。なんこ いります か。', 'ko counts small round things. Plates are flat, so mai.'],
        ['はい。いくら要りますか。', 'はい。いくら いります か。', 'ikura asks a price. For a count it is nan- plus a counter.']
      ] },
      { s: 'other', t: '四枚お願い。', r: 'よんまい おねがい。', e: 'Four, please.' },
      { s: 'you', t: 'お箸も出しましょうか。', r: 'おはし も だしましょう か。', e: 'Shall I get the chopsticks out too?', wrong: [
        ['お箸も出しますか。', 'おはし も だします か。', 'That asks whether THEY will get the chopsticks out. To offer yourself, use mashou ka.'],
        ['お箸も出してもいいですか。', 'おはし も だして も いい です か。', 'te mo ii desu ka asks permission for your own sake. Offering to do something for someone else uses mashou ka.'],
        ['お箸が出しましょうか。', 'おはし が だしましょう か。', 'dasu is transitive; the thing taken out is the object, marked wo (here mo replacing it), not ga.']
      ] },
      { s: 'other', t: 'うん、お願い。あと、コップも四つ。', r: 'うん、おねがい。あと、コップ も よっつ。', e: 'Yeah, please. Oh, and four cups too.' },
      { s: 'you', t: 'コップは大きいのと小さいの、どちらがいいですか。', r: 'コップ わ おおきい の と ちいさい の、どちら が いい です か。', e: 'Big cups or small ones, which is better?', wrong: [
        ['コップは大きいのと小さいの、どれがいいですか。', 'コップ わ おおきい の と ちいさい の、どれ が いい です か。', 'dore asks "which one" among three or more choices. Choosing between exactly two takes dochira.'],
        ['コップは大きいのと小さいの、どちらでいいですか。', 'コップ わ おおきい の と ちいさい の、どちら で いい です か。', 'de here would mean "is either one acceptable" in general. Asking which of the two is preferred needs ga.'],
        ['コップは大きいと小さい、どちらがいいですか。', 'コップ わ おおきい と ちいさい、どちら が いい です か。', 'Dropping no leaves 大きい and 小さい with nothing to modify — no stands in for koppu and has to stay.']
      ] },
      { s: 'other', t: '小さいのでいいよ。', r: 'ちいさい の で いい よ。', e: 'The small ones are fine.' },
      { s: 'you', t: 'できました。座ってください。', r: 'できました。すわって ください。', e: 'It is ready. Please sit down.', wrong: [
        ['できます。座ってください。', 'できます。すわって ください。', 'dekimasu is present/future — "will be ready." The food is done now, so the past dekimashita is needed.'],
        ['できました。座らせてください。', 'できました。すわらせて ください。', 'sasete kudasai means "please let ME sit" — asking permission for yourself. Telling THEM to sit is the plain te-kudasai.'],
        ['できました。座ってあげてください。', 'できました。すわって あげて ください。', 'te-agete-kudasai frames sitting down as a favour done for someone else\'s benefit, which does not fit a plain request to sit.']
      ] },
      { s: 'other', t: 'ありがとう。じゃあ、いただきます。', r: 'ありがとう。じゃあ、いただきます。', e: 'Thanks. Well then, let us eat.' },
      { s: 'you', t: 'いただきます。', r: 'いただきます。', e: 'Let us eat.', wrong: [
        ['食べます。', 'たべます。', 'taberu just states the plain fact of eating. Itadakimasu is the fixed phrase said before a meal, thanking whoever made it.'],
        ['ごちそうさまでした。', 'ごちそうさま でした。', 'That phrase closes a meal, after eating. You are only just about to start.'],
        ['いただきました。', 'いただきました。', 'Past tense claims you have already eaten. The phrase said at the start of a meal is the non-past itadakimasu.']
      ] }
    ]
  },
  {
    code: 'cooking-taste',
    unit: 'cooking',
    title: 'Tasting it',
    situation: 'They hand you a spoon.',
    turns: [
      { s: 'other', t: 'ちょっと味見して。', r: 'ちょっと あじみ して。', e: 'Have a taste.' },
      { s: 'you', t: 'おいしいです。でも、少し辛いですね。', r: 'おいしい です。でも、すこし からい です ね。', e: 'It is good. A little spicy though.', wrong: [
        ['おいしいです。でも、少し辛いでした。', 'おいしい です。でも、すこし からい でした。', 'karai is an i-adjective: its past is karakatta desu, never karai deshita. And it is spicy now, so the present is right anyway.'],
        ['おいしいでした。でも、少し辛いです。', 'おいしい でした。でも、すこし からい です。', 'Same mistake on oishii — i-adjectives never take deshita.']
      ] },
      { s: 'other', t: 'じゃあ、水を足そう。', r: 'じゃあ、みず お たそう。', e: 'I will add some water then.' },
      { s: 'you', t: 'あと、塩も少々入れたほうがいいかもしれません。', r: 'あと、しお も しょうしょう いれた ほう が いい かも しれません。', e: 'We might want a little salt too, actually.', wrong: [
        ['あと、塩も少々入るほうがいいかもしれません。', 'あと、しお も しょうしょう はいる ほう が いい かも しれません。', 'hairu is intransitive — it goes in by itself. Adding salt is something you do, which needs the transitive ireru.'],
        ['あと、塩が少々入れたほうがいいかもしれません。', 'あと、しお が しょうしょう いれた ほう が いい かも しれません。', 'shio is what gets put in — the object of ireru, marked wo (here mo replacing it), not ga.'],
        ['あと、塩も少々入れるほうがいいかもしれません。', 'あと、しお も しょうしょう いれる ほう が いい かも しれません。', 'Recommending a specific action right now takes the plain-past + hou ga ii (ireta hou ga ii). The plain non-past ireru hou ga ii reads as a general habit, not this pot.']
      ] },
      { s: 'other', t: 'そう？じゃあ、少々だけね。', r: 'そう？じゃあ、しょうしょう だけ ね。', e: 'Really? Just a pinch then.' },
      { s: 'you', t: 'もう一度味見してもいいですか。', r: 'もう いちど あじみ して も いい です か。', e: 'Can I taste it one more time?', wrong: [
        ['もう一度味見しましょうか。', 'もう いちど あじみ しましょう か。', 'mashou ka offers to do something for the other person. You want permission to taste it yourself, which is te mo ii desu ka.'],
        ['もう一度味見してくれますか。', 'もう いちど あじみ して くれます か。', 'kuremasu ka asks the OTHER person to taste it for you. You want to taste it yourself.'],
        ['もう一度味見をしていいですか。', 'もう いちど あじみ お して いい です か。', 'Dropping mo breaks the fixed permission pattern te mo ii desu ka — mo cannot be left out.']
      ] },
      { s: 'other', t: 'どうぞ。', r: 'どうぞ。', e: 'Go ahead.' },
      { s: 'you', t: 'うん、今度はちょうどいいです。', r: 'うん、こんど わ ちょうど いい です。', e: 'Yeah, it is just right this time.', wrong: [
        ['うん、今度はちょうどいいでした。', 'うん、こんど わ ちょうど いい でした。', 'ii is irregular; its past is yokatta, from the older yoi. It never becomes ii deshita.'],
        ['うん、今度もちょうどいいです。', 'うん、こんど も ちょうど いい です。', 'mo ("also") implies it was already fine before, too. Contrasting THIS time with the earlier too-spicy taste needs wa.'],
        ['うん、今度がちょうどいいです。', 'うん、こんど が ちょうど いい です。', 'ga would single "this time" out competitively against other times. Simply describing how it turned out takes wa.']
      ] },
      { s: 'other', t: 'よかった。これで完成だね。', r: 'よかった。これ で かんせい だ ね。', e: 'Good. That is it, done.' }
    ]
  },
  {
    code: 'cooking-leftovers',
    unit: 'cooking',
    title: 'Leftovers',
    situation: 'There is food left after dinner.',
    turns: [
      { s: 'other', t: '残ったの、どうする？', r: 'のこった の、どう する？', e: 'What shall we do with what is left?' },
      { s: 'you', t: '明日食べるので、冷蔵庫に入れておきます。', r: 'あした たべる ので、れいぞうこ に いれて おきます。', e: 'I will eat it tomorrow, so I will put it in the fridge.', wrong: [
        ['明日食べるから、冷蔵庫に入れます。', 'あした たべる から、れいぞうこ に いれます。', 'Understandable, but te-okimasu is the form for doing something now for later — which is exactly what putting food away is.'],
        ['明日食べるので、冷蔵庫で入れておきます。', 'あした たべる ので、れいぞうこ で いれて おきます。', 'de marks where an action happens, but the fridge is the destination the food goes INTO, so ni.']
      ] },
      { s: 'other', t: 'ラップかタッパー、どっちがいい？', r: 'ラップ か タッパー、どっち が いい？', e: 'Cling film or tupperware, which is better?' },
      { s: 'you', t: 'タッパーがあるなら、そっちのほうが楽です。', r: 'タッパー が ある なら、そっち の ほう が らく です。', e: 'If there is tupperware, that would be easier.', wrong: [
        ['タッパーがいるなら、そっちのほうが楽です。', 'タッパー が いる なら、そっち の ほう が らく です。', 'iru means "to need." You mean "if it exists/is available," which is aru, not iru.'],
        ['タッパーはあるなら、そっちのほうが楽です。', 'タッパー わ ある なら、そっち の ほう が らく です。', 'wa presents tupperware as an established topic. You are floating a hypothetical condition, so it needs ga to introduce it.'],
        ['タッパーがあるなら、そっちのほうが楽でした。', 'タッパー が ある なら、そっち の ほう が らく でした。', 'deshita claims this was true in the past. You are describing the present situation, so desu.']
      ] },
      { s: 'other', t: 'じゃあ、これ使って。', r: 'じゃあ、これ つかって。', e: 'Here, use this.' },
      { s: 'you', t: 'ありがとうございます。あ、これ少し傷んでいますね。捨てたほうがいいかもしれません。', r: 'ありがとうございます。あ、これ すこし いたんで います ね。すてた ほう が いい かも しれません。', e: 'Thanks. Oh, this has gone off a little — maybe we should throw it out.', wrong: [
        ['ありがとうございます。あ、これ少し傷めていますね。捨てたほうがいいかもしれません。', 'ありがとうございます。あ、これ すこし いためて います ね。すてた ほう が いい かも しれません。', 'itameru is transitive — someone spoils something. Food going bad by itself is the intransitive itamu: itande imasu.'],
        ['ありがとうございます。あ、これ少し傷んでいますね。捨てるほうがいいかもしれません。', 'ありがとうございます。あ、これ すこし いたんで います ね。すてる ほう が いい かも しれません。', 'The "better to" recommendation for this one piece of food needs plain-past + hou ga ii (suteta hou ga ii). The plain non-past reads as a general habit.'],
        ['ありがとうございます。あ、これ少し傷んでいますね。捨てさせたほうがいいかもしれません。', 'ありがとうございます。あ、これ すこし いたんで います ね。すてさせた ほう が いい かも しれません。', 'sutesaseta is causative — having someone else throw it away. You mean simply throwing it away, not making someone do it.']
      ] },
      { s: 'other', t: 'え、本当？じゃあ、それは捨てて。', r: 'え、ほんとう？じゃあ、それ わ すてて。', e: 'Really? Then throw that one out.' },
      { s: 'you', t: 'はい、捨てます。', r: 'はい、すてます。', e: 'Okay, I will throw it out.', wrong: [
        ['はい、捨てられます。', 'はい、すてられます。', 'suterareru is the potential/passive form — "can be thrown away" or "gets thrown away." Stating what YOU will do is the plain sutemasu.'],
        ['はい、捨てています。', 'はい、すてて います。', 'te imasu describes an ongoing or habitual action. You are about to do it now, which is the plain sutemasu.'],
        ['はい、捨てました。', 'はい、すてました。', 'Past tense claims you have already thrown it away. Agreeing to do it now needs the non-past sutemasu.']
      ] },
      { s: 'other', t: '皿洗い、手伝おうか？', r: 'さらあらい、てつだおう か？', e: 'Want a hand with the dishes?' },
      { s: 'you', t: '大丈夫です。すぐ終わります。', r: 'だいじょうぶ です。すぐ おわります。', e: 'It is fine, I will be done soon.', wrong: [
        ['はい、大丈夫です。すぐ終わります。', 'はい、だいじょうぶ です。すぐ おわります。', 'hai here reads as accepting the offer, but daijoubu desu on its own already declines it — pairing them contradicts itself.'],
        ['大丈夫です。すぐ終わっています。', 'だいじょうぶ です。すぐ おわって います。', 'owatte imasu describes an ongoing state of already being finished. You mean the plain future owarimasu — it WILL be done soon.'],
        ['いいですよ。すぐ終わります。', 'いい です よ。すぐ おわります。', 'ii desu yo here sounds like accepting their offer to help — the opposite of declining. daijoubu desu is what says "no need."']
      ] }
    ]
  },
  {
    code: 'bath-ready',
    unit: 'bath',
    title: 'The bath is ready',
    situation: 'Someone calls from the corridor.',
    turns: [
      { s: 'other', t: 'お風呂が沸きましたよ。', r: 'おふろ が わきました よ。', e: 'The bath is ready.' },
      { s: 'you', t: 'ありがとうございます。先にどうぞ。', r: 'ありがとうございます。さきに どうぞ。', e: 'Thank you. You go first.', wrong: [
        ['ありがとうございます。先に行きます。', 'ありがとうございます。さきに いきます。', 'That announces YOU are going first, which in a Japanese household is the opposite of polite when someone has just told you it is ready.'],
        ['ありがとうございます。お先に失礼します。', 'ありがとうございます。おさきに しつれいします。', 'That phrase is for leaving somewhere ahead of others — an office, a gathering. Not for the bath.']
      ] },
      { s: 'other', t: 'いいえ、どうぞお先に。', r: 'いいえ、どうぞ おさきに。', e: 'No, you go ahead.' },
      { s: 'you', t: 'では、お先にいただきます。', r: 'では、おさきに いただきます。', e: 'Then I will go first, thank you.', wrong: [
        ['では、お先に食べます。', 'では、おさきに たべます。', 'taberu is for food. The bath is received as a favour, which is why itadakimasu covers it too.'],
        ['では、さようなら。', 'では、さようなら。', 'You are going to the bathroom, not leaving for good.']
      ] },
      { s: 'other', t: 'タオルは棚にありますよ。', r: 'タオル わ たな に あります よ。', e: 'The towels are on the shelf.' },
      { s: 'you', t: 'ありがとうございます。お湯の温度は大丈夫ですか。', r: 'ありがとうございます。おゆ の おんど わ だいじょうぶ です か。', e: 'Thank you. Is the water temperature okay?', wrong: [
        ['ありがとうございます。お湯の温度は大丈夫でしたか。', 'ありがとうございます。おゆ の おんど わ だいじょうぶ でした か。', 'deshita ka asks about the past. The bath is ready now and you are asking about its current state, so desu ka.'],
        ['ありがとうございます。お湯の温度に大丈夫ですか。', 'ありがとうございます。おゆ の おんど に だいじょうぶ です か。', 'daijoubu is a na-adjective describing the temperature itself, which needs wa or ga — ni would mark a location or target, not the thing being described.'],
        ['ありがとうございます。お湯が温度は大丈夫ですか。', 'ありがとうございます。おゆ が おんど わ だいじょうぶ です か。', 'The possessive "the water\'s temperature" needs no linking the two nouns — stacking ga then wa without it breaks the sentence.']
      ] },
      { s: 'other', t: 'ちょっと熱いかもしれません。水を足してくださいね。', r: 'ちょっと あつい かも しれません。みず お たして ください ね。', e: 'It might be a bit hot. Add some cold water, okay?' },
      { s: 'you', t: 'わかりました。じゃあ、行ってきます。', r: 'わかりました。じゃあ、いって きます。', e: 'Got it. I will get going then.', wrong: [
        ['わかりました。じゃあ、行きました。', 'わかりました。じゃあ、いきました。', 'Past tense claims you already went. You are about to go now, so the set phrase is the non-past itte kimasu.'],
        ['わかりました。じゃあ、行っています。', 'わかりました。じゃあ、いって います。', 'itte imasu describes being in a state of having gone — currently away. Leaving with the intent to return is itte kimasu.'],
        ['わかりました。じゃあ、行っていきます。', 'わかりました。じゃあ、いって いきます。', 'itte ikimasu means going somewhere and not coming back. Since you will return after bathing, it is itte kimasu.']
      ] },
      { s: 'other', t: 'ゆっくり入ってね。', r: 'ゆっくり はいって ね。', e: 'Take your time in there.' }
    ]
  },
  {
    code: 'bath-after',
    unit: 'bath',
    title: 'After the bath',
    situation: 'You come out warm and pink.',
    turns: [
      { s: 'other', t: 'どうだった？', r: 'どう だった？', e: 'How was it?' },
      { s: 'you', t: 'とても気持ちよかったです。', r: 'とても きもちよかった です。', e: 'It felt wonderful.', wrong: [
        ['とても気持ちいいでした。', 'とても きもち いい でした。', 'ii is irregular: its past is yokatta, from the older yoi. kimochi ii becomes kimochi yokatta.'],
        ['とても気持ちよかったでした。', 'とても きもち よかった でした。', 'The past is already in yokatta — adding deshita doubles it.']
      ] },
      { s: 'other', t: 'よかった。お湯はまだ温かいよ。', r: 'よかった。おゆ わ まだ あたたかい よ。', e: 'Good. The water is still warm.' },
      { s: 'you', t: 'じゃあ、お母さんも入ったらどうですか。', r: 'じゃあ、おかあさん も はいったら どう です か。', e: 'Why do not you go in too then, Mum?', wrong: [
        ['じゃあ、お母さんも入れたらどうですか。', 'じゃあ、おかあさん も いれたら どう です か。', 'ireru is transitive — putting something IN. A person entering the bath themselves is the intransitive hairu.'],
        ['じゃあ、お母さんも入ってどうですか。', 'じゃあ、おかあさん も はいって どう です か。', 'The suggestion pattern is plain-past + tara + dou desu ka. The bare te-form does not attach to dou desu ka this way.'],
        ['じゃあ、お母さんが入ったらどうですか。', 'じゃあ、おかあさん が はいったら どう です か。', 'Okaasan is who you are already talking to — established, so wa or mo (as used correctly here) fits. ga would introduce her as brand-new information.']
      ] },
      { s: 'other', t: 'そうする。髪、ちゃんと乾かした？', r: 'そう する。かみ、ちゃんと かわかした？', e: 'I will. Did you dry your hair properly?' },
      { s: 'you', t: 'あ、まだです。今から乾かします。', r: 'あ、まだ です。いま から かわかします。', e: 'Oh, not yet. I will dry it now.', wrong: [
        ['あ、まだです。今から乾きます。', 'あ、まだ です。いま から かわきます。', 'kawaku is intransitive — it dries by itself. You are the one drying your hair, which needs the transitive kawakasu.'],
        ['あ、まだです。今から乾かせます。', 'あ、まだ です。いま から かわかせます。', 'kawakasemasu is causative — making or letting something dry. Drying your own hair is just the plain kawakashimasu.'],
        ['あ、まだです。今から乾かしています。', 'あ、まだ です。いま から かわかして います。', 'te imasu describes an action already in progress. You have not started, so the plain future kawakashimasu is right.']
      ] },
      { s: 'other', t: '風邪ひくよ。早く乾かして。', r: 'かぜ ひく よ。はやく かわかして。', e: 'You will catch a cold. Dry it quickly.' },
      { s: 'you', t: 'はい、すぐ乾かします。', r: 'はい、すぐ かわかします。', e: 'Okay, I will dry it right away.', wrong: [
        ['はい、すぐ乾きます。', 'はい、すぐ かわきます。', 'kawakimasu is intransitive, describing hair drying on its own. Drying it yourself takes the transitive kawakashimasu.'],
        ['はい、すぐ乾かしました。', 'はい、すぐ かわかしました。', 'Past tense claims you have already dried it. Agreeing to do it right away is the non-past kawakashimasu.'],
        ['はい、すぐ乾かしてあります。', 'はい、すぐ かわかして あります。', 'te arimasu describes a state someone already deliberately prepared. You are about to do it now, not describing a finished state.']
      ] },
      { s: 'other', t: 'お水、飲む？お風呂の後は喉が渇くから。', r: 'おみず、のむ？おふろ の あと わ のど が かわく から。', e: 'Want some water? You get thirsty after a bath.' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'daijoubu desu here would decline the offer — the opposite of what you mean. Accepting it is onegaishimasu.'],
        ['いいえ、お願いします。', 'いいえ、おねがいします。', 'iie ("no") directly contradicts the acceptance onegaishimasu implies. Agreeing to the offer takes hai.'],
        ['はい、お願いしました。', 'はい、おねがいしました。', 'Past tense claims you already asked for it. Accepting an offer just made uses the plain onegaishimasu.']
      ] }
    ]
  },
  {
    code: 'bath-asking',
    unit: 'bath',
    title: 'Asking to use the bath',
    situation: 'You are staying with a family and it is getting late.',
    turns: [
      { s: 'you', t: 'お風呂を借りてもいいですか。', r: 'おふろ お かりて も いい です か。', e: 'May I use the bath?', wrong: [
        ['お風呂を借りたいです。', 'おふろ お かりたい です。', 'That states what you want. In someone else\'s house you ask permission: te mo ii desu ka.'],
        ['お風呂を借ります。', 'おふろ お かります。', 'That announces you are going to, without asking.']
      ] },
      { s: 'other', t: 'どうぞどうぞ。タオルはそこにあります。', r: 'どうぞ どうぞ。タオル わ そこ に あります。', e: 'Please do. Towels are there.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['失礼します。', 'しつれいします。', 'That is for entering or leaving a room, not for thanks.'],
        ['おじゃまします。', 'おじゃまします。', 'That is said on entering someone\'s home, at the door.']
      ] },
      { s: 'other', t: '石鹸とシャンプーもそこにあるから、自由に使ってね。', r: 'せっけん と シャンプー も そこ に ある から、じゆう に つかって ね。', e: 'Soap and shampoo are there too, so use them freely.' },
      { s: 'you', t: 'ありがとうございます。使ったタオルはどこに置けばいいですか。', r: 'ありがとうございます。つかった タオル わ どこ に おけば いい です か。', e: 'Thank you. Where should I put the towel after I use it?', wrong: [
        ['ありがとうございます。使ったタオルはどこに置いてもいいですか。', 'ありがとうございます。つかった タオル わ どこ に おいて も いい です か。', 'te mo ii ka asks blanket permission — "is it okay anywhere." Asking WHERE specifically needs the doko + ba-form + ii desu ka pattern.'],
        ['ありがとうございます。使ったタオルはどこで置けばいいですか。', 'ありがとうございます。つかった タオル わ どこ で おけば いい です か。', 'de marks where an action happens in general. Choosing the towel\'s destination takes ni, not de.'],
        ['ありがとうございます。使ったタオルはどこに置くばいいですか。', 'ありがとうございます。つかった タオル わ どこ に おく ば いい です か。', 'The conditional -ba attaches to the e-row stem of a godan verb — oke-ba, not the plain dictionary form oku-ba.']
      ] },
      { s: 'other', t: '洗濯機の横のかごに入れてね。', r: 'せんたくき の よこ の かご に いれて ね。', e: 'Put it in the basket next to the washing machine.' },
      { s: 'you', t: 'わかりました。じゃあ、入ってきます。', r: 'わかりました。じゃあ、はいって きます。', e: 'Got it. I will go in then.', wrong: [
        ['わかりました。じゃあ、入っていきます。', 'わかりました。じゃあ、はいって いきます。', 'te-ikimasu describes going somewhere and not returning here. You will come back after bathing, so it is te-kimasu.'],
        ['わかりました。じゃあ、入れてきます。', 'わかりました。じゃあ、いれて きます。', 'ireru is transitive — putting something IN. A person getting into the bath themselves is the intransitive hairu.'],
        ['わかりました。じゃあ、入りました。', 'わかりました。じゃあ、はいりました。', 'Past tense claims you have already gotten in. You are about to go now, so the non-past haitte kimasu.']
      ] },
      { s: 'other', t: 'うん、ゆっくりね。', r: 'うん、ゆっくり ね。', e: 'Sure, take your time.' }
    ]
  }
]
