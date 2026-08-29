import type { Dialogue } from './types.js'

/** Hotels, hot springs, hobbies, apologies — the last of the everyday set. */
export const LIFE: Dialogue[] = [
  {
    code: 'travel-hotel-checkout',
    unit: 'travel',
    title: 'Checking out',
    situation: 'You are leaving in the morning and want to leave your bags.',
    turns: [
      { s: 'you', t: 'チェックアウトをお願いします。', r: 'チェックアウト お おねがいします。', e: 'Checking out, please.', wrong: [
        ['チェックアウトをします。', 'チェックアウト お します。', 'A flat announcement of what you are about to do. At a counter, onegai shimasu is the request.'],
        ['チェックアウトがお願いします。', 'チェックアウト が おねがいします。', 'onegai suru takes an object, so it is o.']
      ] },
      { s: 'other', t: 'お部屋の鍵をお預かりします。', r: 'おへや の かぎ お おあずかり します。', e: 'I will take your room key.' },
      { s: 'you', t: '荷物を夕方まで預かってもらえますか。', r: 'にもつ お ゆうがた まで あずかって もらえます か。', e: 'Could you hold my bags until this evening?', wrong: [
        ['荷物を夕方まで預けてもらえますか。', 'にもつ お ゆうがた まで あずけて もらえます か。', 'azukeru is to hand something over for safekeeping — that is what YOU do. Them holding it is azukaru.'],
        ['荷物を夕方までに預かってもらえますか。', 'にもつ お ゆうがた まで に あずかって もらえます か。', 'made ni is a deadline by which something happens. A stretch of time you want it held FOR is plain made.']
      ] },
      { s: 'other', t: 'かしこまりました。こちらの札をお持ちください。', r: 'かしこまりました。こちら の ふだ お おもち ください。', e: 'Certainly. Please keep this tag.' }
    ]
  },
  {
    code: 'travel-hotel-ask',
    unit: 'travel',
    title: 'Asking about breakfast',
    situation: 'You want to know the times.',
    turns: [
      { s: 'you', t: '朝食は何時からですか。', r: 'ちょうしょく わ なんじ から です か。', e: 'What time does breakfast start?', wrong: [
        ['朝食は何時までですか。', 'ちょうしょく わ なんじ まで です か。', 'made asks when it ENDS. The start is kara.'],
        ['朝食が何時からですか。', 'ちょうしょく が なんじ から です か。', 'Breakfast is your topic, so wa.']
      ] },
      { s: 'other', t: '七時から十時までです。', r: 'しちじ から じゅうじ まで です。', e: 'Seven to ten.' },
      { s: 'you', t: '部屋で食べてもいいですか。', r: 'へや で たべて も いい です か。', e: 'May I eat in the room?', wrong: [
        ['部屋に食べてもいいですか。', 'へや に たべて も いい です か。', 'ni marks a destination. Where an action happens is de.'],
        ['部屋で食べたいですか。', 'へや で たべたい です か。', 'That asks whether THEY want to eat in the room. -tai desu ka about another person is odd anyway.']
      ] }
    ]
  },
  {
    code: 'bath-onsen',
    unit: 'bath',
    title: 'At the hot spring',
    situation: 'It is your first visit and you check the rules.',
    turns: [
      { s: 'you', t: 'タオルは持って入ってもいいですか。', r: 'タオル わ もって はいって も いい です か。', e: 'May I take a towel in?', wrong: [
        ['タオルを持って入ってもいいですか。', 'タオル お もって はいって も いい です か。', 'Grammatical, but the towel is what you are asking ABOUT, so wa marks it as the topic under question.'],
        ['タオルは持って入りたいですか。', 'タオル わ もって はいりたい です か。', 'That asks about their wishes rather than the rule.']
      ] },
      { s: 'other', t: '小さいタオルは大丈夫ですが、湯船には入れないでください。', r: 'ちいさい タオル わ だいじょうぶ です が、ゆぶね に わ いれない で ください。', e: 'A small towel is fine, but do not put it in the water.' },
      { s: 'you', t: 'わかりました。体を洗ってから入りますね。', r: 'わかりました。からだ お あらって から はいります ね。', e: 'Understood. I will wash first, then get in.', wrong: [
        ['わかりました。体を洗って入りますね。', 'わかりました。からだ お あらって はいります ね。', 'Just the te-form links the two. To say explicitly that one comes AFTER the other, it is te kara.'],
        ['わかりました。体が洗ってから入りますね。', 'わかりました。からだ が あらって から はいります ね。', 'arau takes an object: o.']
      ] }
    ]
  },
  {
    code: 'station-delay',
    unit: 'station',
    title: 'A delayed train',
    situation: 'The board says the line has stopped.',
    turns: [
      { s: 'you', t: 'すみません、電車はいつ動きますか。', r: 'すみません、でんしゃ わ いつ うごきます か。', e: 'Excuse me, when will the trains run?', wrong: [
        ['すみません、電車をいつ動きますか。', 'すみません、でんしゃ お いつ うごきます か。', 'ugoku is intransitive — the train moves by itself.'],
        ['すみません、電車はいつ動かしますか。', 'すみません、でんしゃ わ いつ うごかします か。', 'ugokasu means to move something. The train moving is ugoku.']
      ] },
      { s: 'other', t: '一時間ほどかかる見込みです。', r: 'いちじかん ほど かかる みこみ です。', e: 'About an hour, we expect.' },
      { s: 'you', t: '振替輸送はありますか。', r: 'ふりかえ ゆそう わ あります か。', e: 'Is there an alternative route?', wrong: [
        ['振替輸送はいますか。', 'ふりかえ ゆそう わ います か。', 'iru is for animate things.'],
        ['振替輸送をありますか。', 'ふりかえ ゆそう お あります か。', 'aru is intransitive.']
      ] }
    ]
  },
  {
    code: 'station-lost-item',
    unit: 'station',
    title: 'Lost property',
    situation: 'You left a bag on the train.',
    turns: [
      { s: 'you', t: '電車に鞄を忘れてしまったんですが。', r: 'でんしゃ に かばん お わすれて しまった ん です が。', e: 'I left my bag on the train.', wrong: [
        ['電車で鞄を忘れてしまったんですが。', 'でんしゃ で かばん お わすれて しまった ん です が。', 'de is where an action happens. Leaving something BEHIND somewhere takes ni.'],
        ['電車に鞄が忘れてしまったんですが。', 'でんしゃ に かばん が わすれて しまった ん です が。', 'wasureru takes an object: o.']
      ] },
      { s: 'other', t: '何時ごろの電車ですか。', r: 'なんじごろ の でんしゃ です か。', e: 'Roughly what time was the train?' },
      { s: 'you', t: '八時ごろだったと思います。', r: 'はちじごろ だった と おもいます。', e: 'Around eight, I think.', wrong: [
        ['八時ごろだと思いました。', 'はちじごろ だ と おもいました。', 'omoimashita puts the THINKING in the past. You think so now about a past event: datta to omoimasu.'],
        ['八時ごろでしたと思います。', 'はちじごろ でした と おもいます。', 'Before to omou the clause takes the plain form: datta, not deshita.']
      ] }
    ]
  },
  {
    code: 'social-hobby',
    unit: 'social',
    title: 'Talking about hobbies',
    situation: 'Someone asks what you do at weekends.',
    turns: [
      { s: 'other', t: '休みの日は何をしていますか。', r: 'やすみ の ひ わ なに お して います か。', e: 'What do you do on your days off?' },
      { s: 'you', t: '料理をするのが好きです。', r: 'りょうり お する の が すき です。', e: 'I like cooking.', wrong: [
        ['料理をするのを好きです。', 'りょうり お する の お すき です。', 'suki is an adjective — what you like takes ga.'],
        ['料理をするが好きです。', 'りょうり お する が すき です。', 'A verb needs no to become a noun before ga.']
      ] },
      { s: 'other', t: 'いいですね。何を作るんですか。', r: 'いい です ね。なに お つくる ん です か。', e: 'Nice. What do you make?' },
      { s: 'you', t: '最近はカレーばかり作っています。', r: 'さいきん わ カレー ばかり つくって います。', e: 'Lately nothing but curry.', wrong: [
        ['最近はカレーだけ作っています。', 'さいきん わ カレー だけ つくって います。', 'dake states a plain limit. bakari carries the wry "nothing but", which is what makes the line a joke.'],
        ['最近はカレーばかり作ります。', 'さいきん わ カレー ばかり つくります。', 'The plain present is a habit in general. An ongoing recent stretch is te imasu.']
      ] }
    ]
  },
  {
    code: 'social-photo',
    unit: 'social',
    title: 'Asking for a photo',
    situation: 'You want someone to take your picture.',
    turns: [
      { s: 'you', t: 'すみません、写真を撮ってもらえますか。', r: 'すみません、しゃしん お とって もらえます か。', e: 'Excuse me, could you take a photo?', wrong: [
        ['すみません、写真を撮ってあげますか。', 'すみません、しゃしん お とって あげます か。', 'te-ageru offers to do it FOR them. You are asking to receive the favour.'],
        ['すみません、写真が撮ってもらえますか。', 'すみません、しゃしん が とって もらえます か。', 'toru takes an object: o.']
      ] },
      { s: 'other', t: 'いいですよ。ここを押せばいいですか。', r: 'いい です よ。ここ お おせば いい です か。', e: 'Sure. Just press here?' },
      { s: 'you', t: 'はい、お願いします。後ろの建物も入れてください。', r: 'はい、おねがいします。うしろ の たてもの も いれて ください。', e: 'Yes please. Get the building behind us in too.', wrong: [
        ['はい、お願いします。後ろの建物も入ってください。', 'はい、おねがいします。うしろ の たてもの も はいって ください。', 'hairu is the building entering by itself. Including it in the frame is ireru.'],
        ['はい、お願いします。後ろの建物を入れてください。', 'はい、おねがいします。うしろ の たてもの お いれて ください。', 'You are ADDING the building to yourselves, so mo, not o.']
      ] }
    ]
  },
  {
    code: 'work-apology',
    unit: 'work',
    title: 'Apologising for a mistake',
    situation: 'You sent the wrong file.',
    turns: [
      { s: 'you', t: 'ファイルを間違えてしまいました。申し訳ありません。', r: 'ファイル お まちがえて しまいました。もうしわけ ありません。', e: 'I sent the wrong file. I am very sorry.', wrong: [
        ['ファイルが間違えてしまいました。', 'ファイル が まちがえて しまいました。', 'machigaeru is transitive — YOU mistook it, so the file takes o.'],
        ['ファイルを間違いました。', 'ファイル お まちがいました。', 'machigai is the noun. The verb is machigaeru: machigaemashita.']
      ] },
      { s: 'other', t: '大丈夫ですよ。正しいものを送ってください。', r: 'だいじょうぶ です よ。ただしい もの お おくって ください。', e: 'It is fine. Send the right one.' },
      { s: 'you', t: 'すぐにお送りします。', r: 'すぐに おおくりします。', e: 'I will send it right away.', wrong: [
        ['すぐにお送りになります。', 'すぐに おおくり に なります。', 'o-...-ni naru elevates the OTHER person. Humbling yourself is o-...-suru.'],
        ['すぐに送っていただきます。', 'すぐに おくって いただきます。', 'te-itadaku is receiving a favour — that says they will send it for you.']
      ] }
    ]
  },
  {
    code: 'work-thanks',
    unit: 'work',
    title: 'Thanking someone for help',
    situation: 'A colleague stayed late to help you.',
    turns: [
      { s: 'you', t: '昨日は手伝ってくださってありがとうございました。', r: 'きのう わ てつだって くださって ありがとうございました。', e: 'Thank you for helping me yesterday.', wrong: [
        ['昨日は手伝ってあげてありがとうございました。', 'きのう わ てつだって あげて ありがとうございました。', 'te-ageru is you doing them a favour. They helped you: te-kudasaru.'],
        ['昨日は手伝ってくださってありがとうございます。', 'きのう わ てつだって くださって ありがとうございます。', 'The help is finished, so the thanks takes the past: gozaimashita.']
      ] },
      { s: 'other', t: 'いえいえ、こちらこそ。', r: 'いえいえ、こちらこそ。', e: 'Not at all.' },
      { s: 'you', t: 'おかげさまで間に合いました。', r: 'おかげさま で まにあいました。', e: 'Thanks to you I made it in time.', wrong: [
        ['おかげさまで間に合わせました。', 'おかげさま で まにあわせました。', 'maniawaseru is to force something to fit the deadline. Making it in time is maniau.'],
        ['おかげさまで間に合います。', 'おかげさま で まにあいます。', 'The deadline has passed, so it takes the past.']
      ] }
    ]
  },
  {
    code: 'school-explain-again',
    unit: 'school',
    title: 'Asking the teacher',
    situation: 'You did not follow the explanation.',
    turns: [
      { s: 'you', t: 'すみません、もう一度説明していただけますか。', r: 'すみません、もう いちど せつめい して いただけます か。', e: 'Sorry, could you explain once more?', wrong: [
        ['すみません、もう一度説明してくれますか。', 'すみません、もう いちど せつめい して くれます か。', 'Not wrong, but te-kureru is casual. To a teacher, te-itadakemasu ka.'],
        ['すみません、もう一度説明してあげますか。', 'すみません、もう いちど せつめい して あげます か。', 'That offers to explain it to THEM.']
      ] },
      { s: 'other', t: 'もちろん。どこがわかりませんでしたか。', r: 'もちろん。どこ が わかりません でした か。', e: 'Of course. Which part?' },
      { s: 'you', t: '最後のところがわかりませんでした。', r: 'さいご の ところ が わかりません でした。', e: 'The last part.', wrong: [
        ['最後のところをわかりませんでした。', 'さいご の ところ お わかりません でした。', 'wakaru takes ga.'],
        ['最後のところがわかりました。', 'さいご の ところ が わかりました。', 'That says you DID understand it.']
      ] }
    ]
  },
  {
    code: 'school-homework-late',
    unit: 'school',
    title: 'Handing in late work',
    situation: 'The homework is a day late.',
    turns: [
      { s: 'you', t: '宿題が遅れてすみません。', r: 'しゅくだい が おくれて すみません。', e: 'Sorry the homework is late.', wrong: [
        ['宿題を遅れてすみません。', 'しゅくだい お おくれて すみません。', 'okureru is intransitive — the homework is late by itself.'],
        ['宿題が遅らせてすみません。', 'しゅくだい が おくらせて すみません。', 'okuraseru is to delay something deliberately. Being late is okureru.']
      ] },
      { s: 'other', t: '次からは気をつけてくださいね。', r: 'つぎ から わ き お つけて ください ね。', e: 'Be careful from now on.' },
      { s: 'you', t: 'はい、気をつけます。', r: 'はい、き お つけます。', e: 'Yes, I will.', wrong: [
        ['はい、気をつけました。', 'はい、き お つけました。', 'The past says you already were careful, which contradicts the apology.'],
        ['はい、気がつけます。', 'はい、き が つけます。', 'The set phrase is ki o tsukeru — ki ga tsuku means to notice something, a different idiom entirely.']
      ] }
    ]
  },
  {
    code: 'cooking-shopping-list',
    unit: 'cooking',
    title: 'What to buy for dinner',
    situation: 'Deciding at home before going out.',
    turns: [
      { s: 'other', t: '今晩、何食べたい。', r: 'こんばん、なに たべたい。', e: 'What do you fancy tonight?' },
      { s: 'you', t: 'カレーが食べたいな。', r: 'カレー が たべたい な。', e: 'I fancy curry.', wrong: [
        ['カレーを食べたいな。', 'カレー お たべたい な。', 'Heard often, but with -tai the thing wanted normally takes ga.'],
        ['カレーが食べたいだ。', 'カレー が たべたい だ。', 'tabetai is an i-adjective and takes no da.']
      ] },
      { s: 'other', t: 'じゃあ、じゃがいも買ってきて。', r: 'じゃあ、じゃがいも かって きて。', e: 'Get some potatoes, then.' },
      { s: 'you', t: 'うん、行ってくる。', r: 'うん、いって くる。', e: 'All right, back in a bit.', wrong: [
        ['うん、行ってきた。', 'うん、いって きた。', 'The past says you already went.'],
        ['うん、行っていく。', 'うん、いって いく。', 'te-iku moves away with no return. Going and coming back is itte kuru.']
      ] }
    ]
  },
  {
    code: 'comings-late-home',
    unit: 'comings',
    title: 'Coming home late',
    situation: 'It is past midnight and someone waited up.',
    turns: [
      { s: 'you', t: 'ただいま。遅くなってごめん。', r: 'ただいま。おそく なって ごめん。', e: 'I am home. Sorry I am late.', wrong: [
        ['ただいま。遅いなってごめん。', 'ただいま。おそい なって ごめん。', 'Before naru an i-adjective drops i and takes ku: osoku.'],
        ['ただいま。遅くしてごめん。', 'ただいま。おそく して ごめん。', 'osoku suru means you made something else late. Becoming late yourself is osoku naru.']
      ] },
      { s: 'other', t: 'おかえり。ご飯は。', r: 'おかえり。ごはん わ。', e: 'Welcome back. Have you eaten?' },
      { s: 'you', t: 'もう食べてきた。ありがとう。', r: 'もう たべて きた。ありがとう。', e: 'Already ate, thanks.', wrong: [
        ['もう食べていった。ありがとう。', 'もう たべて いった。ありがとう。', 'te-iku heads away from here. Having eaten before coming home is tabete kita.'],
        ['もう食べてくる。ありがとう。', 'もう たべて くる。ありがとう。', 'The present says you will go and eat. You already have.']
      ] }
    ]
  },
  {
    code: 'comings-see-off',
    unit: 'comings',
    title: 'Seeing someone off',
    situation: 'They are leaving for work.',
    turns: [
      { s: 'other', t: '行ってきます。', r: 'いって きます。', e: 'I am off.' },
      { s: 'you', t: '行ってらっしゃい。気をつけてね。', r: 'いって らっしゃい。き お つけて ね。', e: 'Take care, see you later.', wrong: [
        ['行ってきます。気をつけてね。', 'いって きます。き お つけて ね。', 'ittekimasu is what the person LEAVING says. The one staying answers itterasshai.'],
        ['お帰りなさい。気をつけてね。', 'おかえりなさい。き お つけて ね。', 'okaerinasai welcomes someone back. They are going out.']
      ] },
      { s: 'other', t: 'うん、行ってきます。', r: 'うん、いって きます。', e: 'Right, off I go.' }
    ]
  }
]
