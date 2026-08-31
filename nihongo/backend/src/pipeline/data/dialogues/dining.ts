import type { Dialogue } from './types.js'

/**
 * Restaurant, café, izakaya, ramen counter and fast-food conversations —
 * arriving, ordering, handling an allergy, reordering mid-meal, and paying.
 *
 * These run long (8 to 14 turns) because a real counter or table interaction
 * is never one question and one answer. Staff fire off a chain of quick
 * questions in a single visit — smoking or not, hot or iced, size, eat-in or
 * takeaway, then a full repeat-back of the order — and the customer's only
 * tools are a handful of two- or three-word answers reused again and again:
 * X de, daijoubu desu, ijou de. A three-turn dialogue can only ever teach one
 * of those in isolation; it takes a full scene, with the questions arriving
 * back to back the way they really do, to drill the instant de-answer
 * (hotto de, M de, betsubetsu de) as a reflex instead of a fact learned once
 * and forgotten.
 *
 * Staff keigo throughout (kashikomarimashita, ikaga nasaimasu ka, o-sage
 * shite mo yoroshii desu ka) is written out in full for the learner to
 * RECOGNISE — it never appears as something the learner is asked to say.
 * The learner's own lines stay in plain-polite register the whole way
 * through, because that is what a real customer actually produces.
 */
export const DINING: Dialogue[] = [
  // Gotcha: nanmeisama comes instantly, often before you have fully stepped in — turn 2
  // must be reflexive, not a pause-then-answer.
  // Gotcha: kaunta-de-mo-yoroshii-desu-ka is a real fork — a vague reply gets you put on
  // the waiting list instead of seated right away.
  {
    code: 'famiresu-entry-wait',
    unit: 'restaurant',
    title: 'Waiting for a table',
    situation: 'A family restaurant is full on a Sunday and you have to wait for a table.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。何名様でしょうか。', r: 'いらっしゃいませ。なんめいさま でしょう か。', e: 'Welcome. How many people?' },
      { s: 'you', t: '二人です。', r: 'ふたり です。', e: 'Two.', wrong: [
        ['二人がいます。', 'ふたり が います。', 'imasu reports that people exist somewhere else. Stating your own party size is just desu: futari desu.'],
        ['二人をお願いします。', 'ふたり お おねがいします。', 'onegaishimasu asks them for something. The headcount is simply stated: futari desu.']
      ] },
      { s: 'other', t: 'ただいま満席となっておりまして、お待ちいただくかたちになりますが、よろしいでしょうか。', r: 'ただいま まんせき と なって おりまして、おまち いただく かたち に なります が、よろしい でしょう か。', e: 'We are currently full, so there will be a wait. Is that all right?' },
      { s: 'you', t: 'どのくらい待ちますか。', r: 'どのくらい まちます か。', e: 'About how long is the wait?', wrong: [
        ['どのくらい待っていますか。', 'どのくらい まって います か。', 'matte imasu describes an ongoing state, so this asks how long you have already been waiting, not how long the wait will be.'],
        ['どのくらい待たれますか。', 'どのくらい またれます か。', 'mataremasu is respectful language aimed at THEM waiting. You are asking about your own wait: machimasu ka.']
      ] },
      { s: 'other', t: 'そうですね、十五分ほどかと思います。こちらの用紙にお名前と人数のご記入をお願いいたします。', r: 'そう です ね、じゅうごふん ほど か と おもいます。こちら の ようし に おなまえ と にんずう の ごきにゅう お おねがい いたします。', e: 'Let me think, I would say about 15 minutes. Please write your name and party size on this form.' },
      { s: 'you', t: 'はい、分かりました。', r: 'はい、わかりました。', e: 'OK, got it.', wrong: [
        ['はい、知りました。', 'はい、しりました。', 'shiru is learning a brand-new fact. Acknowledging an instruction you were just given is wakarimashita.'],
        ['はい、分かります。', 'はい、わかります。', 'wakarimasu states a general ability to understand. Confirming you just understood these instructions needs the past: wakarimashita.']
      ] },
      { s: 'other', t: 'カウンター席でしたら、すぐにご案内できますが、いかがなさいますか。', r: 'カウンターせき でしたら、すぐ に ごあんない できます が、いかが なさいます か。', e: 'If a counter seat is okay, we can seat you right away. What would you like to do?' },
      { s: 'you', t: 'あ、じゃあカウンターで大丈夫です。', r: 'あ、じゃあ カウンター で だいじょうぶ です。', e: 'Oh, then the counter is fine.', wrong: [
        ['あ、じゃあカウンターは大丈夫です。', 'あ、じゃあ カウンター わ だいじょうぶ です。', 'wa here reads as contrasting the counter against something else, and daijoubu desu alone usually means no thank you — together it sounds like you are turning the counter down, not taking it.'],
        ['あ、じゃあカウンターでお願いしません。', 'あ、じゃあ カウンター で おねがいしません。', 'onegaishimasen negates a request you never made. Accepting an offered option is X de daijoubu desu, not a negative onegai.']
      ] },
      { s: 'other', t: 'かしこまりました。それでは、お席にご案内いたします。こちらへどうぞ。', r: 'かしこまりました。それでは、おせき に ごあんない いたします。こちら え どうぞ。', e: 'Certainly. Then let me show you to your seat. This way, please.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['ありがとうございました。', 'ありがとうございました。', 'The past tense treats the thanks as closed, as if you were leaving. You are only now being shown to your seat.'],
        ['どうもすみません。', 'どうも すみません。', 'sumimasen apologises for causing trouble. Being seated is not an inconvenience to apologise for — plain thanks fits: arigatou gozaimasu.']
      ] }
    ]
  },
  // Gotcha: otoshi is a seating charge the customer never ordered and generally cannot
  // refuse; the learner's only job is to receive it gracefully, not to question it.
  // Gotcha: drinks are ordered first and fast, before the food menu is even opened —
  // dithering while staff wait is the awkward moment "toriaezu nama" exists to solve.
  {
    code: 'izakaya-first-drinks',
    unit: 'restaurant',
    title: 'Izakaya first drinks',
    situation: 'Three of you walk into an izakaya and order your first round.',
    turns: [
      { s: 'other', t: 'いらっしゃいませー。何名様ですか。', r: 'いらっしゃいませー。なんめいさま です か。', e: 'Welcome! How many people?' },
      { s: 'you', t: '三人です。', r: 'さんにん です。', e: 'Three.', wrong: [
        ['三人がいます。', 'さんにん が います。', 'imasu reports that people exist somewhere else. Stating your own party size is just desu: sannin desu.'],
        ['三人をお願いします。', 'さんにん お おねがいします。', 'onegaishimasu asks them for something. The headcount is simply stated: sannin desu.']
      ] },
      { s: 'other', t: 'おタバコはお吸いになりますか。', r: 'おタバコ わ おすい に なります か。', e: 'Do you smoke?' },
      { s: 'you', t: '吸いません。', r: 'すいません。', e: 'We do not smoke.', wrong: [
        ['飲みません。', 'のみません。', 'nomu is to drink. Tobacco is inhaled, suu, so "we do not smoke" is suimasen.'],
        ['吸えません。', 'すえません。', 'suemasen is the potential, "unable to smoke". Choosing not to is the plain negative: suimasen.']
      ] },
      { s: 'other', t: '禁煙のお席にご案内します。こちらへどうぞ。お荷物はこちらのカゴをお使いください。', r: 'きんえん の おせき に ごあんない します。こちら え どうぞ。おにもつ わ こちら の カゴ お おつかい ください。', e: 'I will take you to a non-smoking table. This way. Please use this basket for your bags.' },
      { s: 'other', t: 'お先にお飲み物だけお伺いしてもよろしいですか。', r: 'おさき に おのみもの だけ おうかがい して も よろしい です か。', e: 'May I just take your drink order first?' },
      { s: 'you', t: 'とりあえず、生三つお願いします。', r: 'とりあえず、なま みっつ おねがいします。', e: 'To start, three draft beers, please.', wrong: [
        ['とりあえず、生三本お願いします。', 'とりあえず、なま さんぼん おねがいします。', 'hon counts long thin objects like bottles. Draft beer glasses take the generic counter tsu: mittsu.'],
        ['とりあえず、生三個お願いします。', 'とりあえず、なま さんこ おねがいします。', 'ko is the generic counter for small objects, not drinks ordered by the glass — mittsu is the natural count here.']
      ] },
      { s: 'other', t: '生三つですね、かしこまりました。少々お待ちください。', r: 'なま みっつ です ね、かしこまりました。しょうしょう おまち ください。', e: 'Three drafts, certainly. One moment please.' },
      { s: 'other', t: 'お待たせしました。生ビールです。あと、こちらお通しになります。', r: 'おまたせ しました。なま ビール です。あと、こちら おとおし に なります。', e: 'Sorry for the wait. Here are your beers. And this is the otoshi.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['ありがとうございました。', 'ありがとうございました。', 'The past tense treats the thanks as closed, as if the visit were over. The meal is only just starting.'],
        ['いただきます。', 'いただきます。', 'itadakimasu is said just before you eat, to the food itself, not as thanks to the server for bringing it.']
      ] },
      { s: 'other', t: 'お料理のご注文がお決まりになりましたら、そちらのボタンでお呼びください。', r: 'おりょうり の ごちゅうもん が おきまり に なりましたら、そちら の ボタン で および ください。', e: 'When you have decided on food, please call us with that button.' },
      { s: 'you', t: 'はーい。', r: 'はーい。', e: 'OK.', wrong: [
        ['はい、そうです。', 'はい、そう です。', 'sou desu confirms a fact you were told. This was an instruction, not something to affirm — a plain hai fits better.'],
        ['分かります。', 'わかります。', 'wakarimasu states a general ability to understand. Acknowledging an instruction just given is wakarimashita, or here simply hai.']
      ] }
    ]
  },
  // Gotcha: the repeat-back arrives fast as a wall of keigo — the only job is to catch
  // the numbers and say hai; a mistake is fixed with sumimasen, X janakute Y desu.
  // Gotcha: ijou de yoroshii desu ka closes every order everywhere in Japan — it is the
  // single highest-frequency staff question in this whole unit.
  {
    code: 'famiresu-order-button',
    unit: 'restaurant',
    title: 'Ordering by the table button',
    situation: 'You are seated and ready to order using the table’s call button.',
    turns: [
      { s: 'other', t: 'こちらのお席へどうぞ。おしぼりとお冷でございます。', r: 'こちら の おせき え どうぞ。おしぼり と おひや で ございます。', e: 'Here is your table. Your wet towel and water.' },
      { s: 'other', t: 'ご注文がお決まりになりましたら、そちらのボタンでお呼びください。', r: 'ごちゅうもん が おきまり に なりましたら、そちら の ボタン で および ください。', e: 'When you have decided, please press that button to call us.' },
      { s: 'you', t: 'はい、ありがとうございます。', r: 'はい、ありがとうございます。', e: 'OK, thank you.', wrong: [
        ['はい、ありがとうございました。', 'はい、ありがとうございました。', 'The past tense closes the thanks off as finished, but you have not even ordered yet.'],
        ['はい、すみません。', 'はい、すみません。', 'sumimasen apologises for a bother. They have just served you politely — plain thanks fits, not an apology.']
      ] },
      { s: 'other', t: 'お待たせいたしました。ご注文をお伺いいたします。', r: 'おまたせ いたしました。ごちゅうもん お おうかがい いたします。', e: 'Sorry to keep you waiting. I will take your order.' },
      { s: 'you', t: 'このチーズインハンバーグを一つと、ミックスグリルを一つお願いします。', r: 'この チーズインハンバーグ お ひとつ と、ミックスグリル お ひとつ おねがいします。', e: 'One of this cheese-stuffed hamburg steak, and one mixed grill, please.', wrong: [
        ['このチーズインハンバーグが一つと、ミックスグリルが一つお願いします。', 'この チーズインハンバーグ が ひとつ と、ミックスグリル が ひとつ おねがいします。', 'What you order is the object of onegaishimasu, so it takes o, not ga.'],
        ['このチーズインハンバーグを一つと、ミックスグリルを一つあります。', 'この チーズインハンバーグ お ひとつ と、ミックスグリル お ひとつ あります。', 'arimasu states that something exists. Placing an order needs onegaishimasu, not a statement of existence.']
      ] },
      { s: 'other', t: 'チーズインハンバーグがお一つ、ミックスグリルがお一つですね。ドリンクバーはお付けしますか。', r: 'チーズインハンバーグ が おひとつ、ミックスグリル が おひとつ です ね。ドリンクバー わ おつけ します か。', e: 'One cheese hamburg, one mixed grill. Shall I add the drink bar?' },
      { s: 'you', t: 'お願いします。二つで。', r: 'おねがいします。ふたつ で。', e: 'Yes please. Two.', wrong: [
        ['お願いします。二つを。', 'おねがいします。ふたつ お。', 'A bare quantity answering "how many" is stated with de, not left dangling on o with nothing for it to attach to — futatsu de is the clipped answer pattern.'],
        ['お願いします。二つが。', 'おねがいします。ふたつ が。', 'The same clipped-answer shape takes de here, not ga, with nothing following it.']
      ] },
      { s: 'other', t: 'かしこまりました。ご注文は以上でよろしいでしょうか。', r: 'かしこまりました。ごちゅうもん わ いじょう で よろしい でしょう か。', e: 'Certainly. Will that be all?' },
      { s: 'you', t: 'はい、以上で。', r: 'はい、いじょう で。', e: 'Yes, that is all.', wrong: [
        ['はい、以上を。', 'はい、いじょう お。', 'ijou is not something being acted on here — it is the state you are affirming, marked with de like other short customer answers, not o.'],
        ['はい、以上です、ください。', 'はい、いじょう です、ください。', 'Tacking kudasai onto a completed statement asks for nothing in particular — ijou de alone is the whole, standard closing answer.']
      ] },
      { s: 'other', t: 'ご注文を繰り返します。チーズインハンバーグがお一つ、ミックスグリルがお一つ、ドリンクバーがお二つ。以上でお間違いないでしょうか。', r: 'ごちゅうもん お くりかえします。チーズインハンバーグ が おひとつ、ミックスグリル が おひとつ、ドリンクバー が おふたつ。いじょう で おまちがい ない でしょう か。', e: 'I will repeat your order back: one cheese hamburg, one mixed grill, two drink bars. Is everything correct?' },
      { s: 'you', t: 'はい、大丈夫です。', r: 'はい、だいじょうぶ です。', e: 'Yes, that is right.', wrong: [
        ['はい、大丈夫でした。', 'はい、だいじょうぶ でした。', 'The past tense makes it sound like something that was fine earlier but might not be now. Confirming the order right now is the plain daijoubu desu.'],
        ['はい、大丈夫します。', 'はい、だいじょうぶ します。', 'daijoubu is a na-adjective, not a verb — it pairs with desu, never with suru.']
      ] },
      { s: 'other', t: 'かしこまりました。少々お待ちくださいませ。', r: 'かしこまりました。しょうしょう おまち ください ませ。', e: 'Certainly. Please wait a moment.' }
    ]
  },
  // Gotcha: shokugo-ni-nasaimasu-ka catches learners completely — they hear it, do not
  // parse it, and say hai without knowing they just agreed to delay their drink.
  // Gotcha: free upsize offers (oomori muryou) arrive fast and sound like an obligation;
  // futsuu de is the clean way to decline one without refusing anything.
  {
    code: 'teishoku-set-meal',
    unit: 'restaurant',
    title: 'Ordering a teishoku set',
    situation: 'You are ordering a teishoku set meal with several options along the way.',
    turns: [
      { s: 'other', t: 'ご注文はお決まりでしょうか。', r: 'ごちゅうもん わ おきまり でしょう か。', e: 'Have you decided on your order?' },
      { s: 'you', t: 'サバの塩焼き定食をお願いします。', r: 'サバ の しおやき ていしょく お おねがいします。', e: 'The grilled salted mackerel set, please.', wrong: [
        ['サバの塩焼き定食がお願いします。', 'サバ の しおやき ていしょく が おねがいします。', 'What you are ordering is the object of onegaishimasu, so it takes o, not ga.'],
        ['サバの塩焼き定食をください、お願いします。', 'サバ の しおやき ていしょく お ください、おねがいします。', 'Stacking kudasai and onegaishimasu together is redundant. The set phrase for ordering here is X o onegaishimasu.']
      ] },
      { s: 'other', t: 'かしこまりました。ライスのサイズはいかがなさいますか。大盛りは無料です。', r: 'かしこまりました。ライス の サイズ わ いかが なさいます か。おおもり わ むりょう です。', e: 'Certainly. What size rice would you like? Large is free.' },
      { s: 'you', t: 'じゃあ、大盛りでお願いします。', r: 'じゃあ、おおもり で おねがいします。', e: 'Then large, please.', wrong: [
        ['じゃあ、大盛りをお願いします。', 'じゃあ、おおもり お おねがいします。', 'Choosing among options offered at the counter is marked with de, the same short pattern as hotto de and M de.'],
        ['じゃあ、大盛りがお願いします。', 'じゃあ、おおもり が おねがいします。', 'onegaishimasu takes de for the chosen option, not ga.']
      ] },
      { s: 'other', t: 'お味噌汁は、プラス百円で豚汁に変更もできますが、いかがなさいますか。', r: 'おみそしる わ、プラス ひゃく えん で とんじる に へんこう も できます が、いかが なさいます か。', e: 'For an extra 100 yen you can change the miso soup to pork miso soup. Would you like that?' },
      { s: 'you', t: '普通のお味噌汁で大丈夫です。', r: 'ふつう の おみそしる で だいじょうぶ です。', e: 'Regular miso soup is fine.', wrong: [
        ['普通のお味噌汁がいいです。', 'ふつう の おみそしる が いい です。', 'This states a preference between options, but here you are declining an upgrade. daijoubu desu is the clean no thank you, not a comparison with ga ii.'],
        ['普通のお味噌汁をお願いします。', 'ふつう の おみそしる お おねがいします。', 'onegaishimasu here sounds like you are actively requesting a change back. Declining the upsell is X de daijoubu desu.']
      ] },
      { s: 'other', t: 'お飲み物はいかがなさいますか。', r: 'おのみもの わ いかが なさいます か。', e: 'Would you like anything to drink?' },
      { s: 'you', t: 'ホットコーヒーをお願いします。', r: 'ホットコーヒー お おねがいします。', e: 'A hot coffee, please.', wrong: [
        ['ホットコーヒーでお願いします。', 'ホットコーヒー で おねがいします。', 'de marks a choice among alternatives already on the table, like hot versus iced. Naming the whole item as your answer takes o.'],
        ['ホットコーヒーがお願いします。', 'ホットコーヒー が おねがいします。', 'onegaishimasu takes o for what you are requesting, not ga.']
      ] },
      { s: 'other', t: 'お飲み物は食後になさいますか。', r: 'おのみもの わ しょくご に なさいます か。', e: 'Would you like your drink after the meal?' },
      { s: 'you', t: '食後でお願いします。', r: 'しょくご で おねがいします。', e: 'After the meal, please.', wrong: [
        ['食後をお願いします。', 'しょくご お おねがいします。', 'Choosing when, among the offered timings, is marked with de, the same short pattern as hotto de — not o.'],
        ['食後にお願いします。', 'しょくご に おねがいします。', 'ni would mark a destination or a specific point being requested. Picking between two offered timings uses de.']
      ] },
      { s: 'other', t: 'かしこまりました。ご注文を繰り返します。サバの塩焼き定食、ライス大盛り、食後にホットコーヒー。以上でよろしいでしょうか。', r: 'かしこまりました。ごちゅうもん お くりかえします。サバ の しおやき ていしょく、ライス おおもり、しょくご に ホットコーヒー。いじょう で よろしい でしょう か。', e: 'Certainly. I will repeat your order: grilled mackerel set, large rice, hot coffee after the meal. Will that be all?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、お願いしました。', 'はい、おねがいしました。', 'The past tense makes the request sound already completed and over. Confirming it now is the plain onegaishimasu.'],
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'Here daijoubu desu risks being heard as declining the whole order rather than confirming it. Approving what was just read back is hai, or hai, onegaishimasu.']
      ] }
    ]
  },
  // Gotcha: staff-initiated "arerugii wa gozaimasu ka" is standard at course meals and
  // kids' menus — recognise it and answer with X no arerugii ga arimasu or nai desu.
  // Gotcha: moushiwake gozaimasen + dekinai n desu IS a refusal. Learners hear the
  // apology, miss the negative, and wait for a dish that is never coming.
  {
    code: 'allergy-and-changes',
    unit: 'restaurant',
    title: 'An allergy and a substitution',
    situation: 'You have a nut allergy and need to adjust the menu.',
    turns: [
      { s: 'other', t: 'ご注文はお決まりでしょうか。', r: 'ごちゅうもん わ おきまり でしょう か。', e: 'Have you decided?' },
      { s: 'you', t: 'すみません、このサラダにナッツは入っていますか。ナッツアレルギーがあって。', r: 'すみません、この サラダ に ナッツ わ はいって います か。ナッツ アレルギー が あって。', e: 'Excuse me, does this salad have nuts in it? I have a nut allergy.', wrong: [
        ['すみません、このサラダにナッツを入っていますか。ナッツアレルギーがあって。', 'すみません、この サラダ に ナッツ お はいって います か。ナッツ アレルギー が あって。', 'hairu is intransitive. What is inside something takes ga or, as here, the topic wa, never o.'],
        ['すみません、このサラダにナッツは入れていますか。ナッツアレルギーがあって。', 'すみません、この サラダ に ナッツ わ いれて います か。ナッツ アレルギー が あって。', 'ireru means someone actively puts something in. Asking what a dish contains is haitte imasu ka.']
      ] },
      { s: 'other', t: '確認してまいりますので、少々お待ちくださいませ。', r: 'かくにん して まいります ので、しょうしょう おまち ください ませ。', e: 'I will go and check. One moment, please.' },
      { s: 'other', t: 'お待たせいたしました。クルミが入っておりますが、抜きでお作りすることもできますが。', r: 'おまたせ いたしました。クルミ が はいって おります が、ぬき で おつくり する こと も できます が。', e: 'Sorry for the wait. It contains walnuts, but we can make it without.' },
      { s: 'you', t: 'じゃあ、ナッツ抜きでお願いします。', r: 'じゃあ、ナッツ ぬき で おねがいします。', e: 'Then without nuts, please.', wrong: [
        ['じゃあ、ナッツ抜きをお願いします。', 'じゃあ、ナッツ ぬき お おねがいします。', 'nuki de is the fixed removal pattern, as in tamanegi nuki de or wasabi nuki de. The modification is marked with de, not o.'],
        ['じゃあ、ナッツが抜きでお願いします。', 'じゃあ、ナッツ が ぬき で おねがいします。', 'nuki attaches directly to the thing being removed with no particle before it: nattsu nuki de, not nattsu ga nuki de.']
      ] },
      { s: 'other', t: 'かしこまりました。他にご注文はございますか。', r: 'かしこまりました。ほか に ごちゅうもん わ ございます か。', e: 'Certainly. Anything else?' },
      { s: 'you', t: 'マルゲリータを一つ。あと、辛いのが苦手なんですが、このアラビアータ、辛さ控えめにできますか。', r: 'マルゲリータ お ひとつ。あと、からい の が にがて な ん です が、この アラビアータ、からさ ひかえめ に できます か。', e: 'One margherita. Also, I am not good with spicy food. Can you make this arrabbiata less spicy?', wrong: [
        ['マルゲリータを一つ。あと、辛いのが苦手なんですが、このアラビアータ、辛さ控えめができますか。', 'マルゲリータ お ひとつ。あと、からい の が にがて な ん です が、この アラビアータ、からさ ひかえめ が できます か。', 'The way you want it made is the target of dekimasu, marked with ni: hikaeme ni dekimasu ka, not ga.'],
        ['マルゲリータを一つ。あと、辛いのを苦手なんですが、このアラビアータ、辛さ控えめにできますか。', 'マルゲリータ お ひとつ。あと、からい の お にがて な ん です が、この アラビアータ、からさ ひかえめ に できます か。', 'nigate is a na-adjective describing what you are bad at, and that thing takes ga, not o.']
      ] },
      { s: 'other', t: '申し訳ございません、ソースの辛さはお変えできないんです。', r: 'もうしわけ ございません、ソース の からさ わ おかえ できない ん です。', e: 'I am very sorry, we cannot change the spiciness of the sauce.' },
      { s: 'you', t: '分かりました。じゃあ、アラビアータはやめて、カルボナーラにします。', r: 'わかりました。じゃあ、アラビアータ わ やめて、カルボナーラ に します。', e: 'I see. Then instead of the arrabbiata I will have the carbonara.', wrong: [
        ['分かりました。じゃあ、アラビアータをやめて、カルボナーラをします。', 'わかりました。じゃあ、アラビアータ お やめて、カルボナーラ お します。', 'Naming the dish you are settling on uses ni suru, to decide on it, not o suru — carbonara ni shimasu.'],
        ['分かりました。じゃあ、アラビアータが辞めて、カルボナーラにします。', 'わかりました。じゃあ、アラビアータ が やめて、カルボナーラ に します。', 'yameru is a plain transitive verb. What you are dropping takes o, not ga: arabiaata o yamete.']
      ] },
      { s: 'other', t: 'かしこまりました。以上でよろしいでしょうか。', r: 'かしこまりました。いじょう で よろしい でしょう か。', e: 'Certainly. Will that be all?' },
      { s: 'you', t: 'はい、以上です。', r: 'はい、いじょう です。', e: 'Yes, that is all.', wrong: [
        ['はい、以上でした。', 'はい、いじょう でした。', 'The past tense makes it sound like the order is already over and done, rather than confirming it right now.'],
        ['はい、以上があります。', 'はい、いじょう が あります。', 'ijou here is a closing phrase meaning "that is all", not a thing that exists, so it does not take ga arimasu.']
      ] }
    ]
  },
  // Gotcha: payment already happened at the ticket machine — there is no bill and no
  // register, and looking for one is where a learner hovers awkwardly at the end.
  // Gotcha: counter Japanese gets clipped, "katasa wa?" instead of the full question —
  // it is the same question as the polite full version, just shorter.
  {
    code: 'ramen-ticket-counter',
    unit: 'restaurant',
    title: 'Ramen counter and kaedama',
    situation: 'You are at a ramen counter, ticket already bought at the machine by the door.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。食券お預かりします。', r: 'いらっしゃいませ。しょっけん おあずかり します。', e: 'Welcome! I will take your ticket.' },
      { s: 'you', t: 'お願いします。', r: 'おねがいします。', e: 'Here you go.', wrong: [
        ['ください。', 'ください。', 'kudasai asks THEM for something. Handing your ticket over is onegaishimasu, or just douzo.'],
        ['どうも。', 'どうも。', 'Fine among friends, but handing something to staff at a counter normally takes onegaishimasu, not a bare doumo.']
      ] },
      { s: 'other', t: '麺の硬さはどうしますか。', r: 'めん の かたさ わ どう します か。', e: 'How firm do you want the noodles?' },
      { s: 'you', t: '普通でお願いします。', r: 'ふつう で おねがいします。', e: 'Regular, please.', wrong: [
        ['普通をお願いします。', 'ふつう お おねがいします。', 'Choosing among named options, like yawa, futsuu, katame, is marked with de, the same short pattern as hotto de and M de.'],
        ['普通がお願いします。', 'ふつう が おねがいします。', 'onegaishimasu takes de for the option you are picking, not ga.']
      ] },
      { s: 'other', t: 'お冷とお茶はセルフサービスになってます。', r: 'おひや と おちゃ わ セルフサービス に なって ます。', e: 'Water and tea are self-service.' },
      { s: 'you', t: 'はい。', r: 'はい。', e: 'OK.', wrong: [
        ['はい、そうです。', 'はい、そう です。', 'sou desu confirms a fact you already knew, but they just told you something new — a plain hai fits better than affirming it as known.'],
        ['分かります。', 'わかります。', 'wakarimasu is a general statement of ability to understand. Acknowledging an instruction just given is wakarimashita, or simply hai.']
      ] },
      { s: 'other', t: 'お待たせしました。ラーメンです。', r: 'おまたせ しました。ラーメン です。', e: 'Here is your ramen.' },
      { s: 'you', t: 'すみません、替え玉お願いします。', r: 'すみません、かえだま おねがいします。', e: 'Excuse me, a noodle refill, please.', wrong: [
        ['すみません、替え玉をください、お願いします。', 'すみません、かえだま お ください、おねがいします。', 'Stacking kudasai and onegaishimasu is redundant. The standard order-request pattern here is just X onegaishimasu.'],
        ['すみません、替え玉が欲しいです。', 'すみません、かえだま が ほしい です。', 'hoshii states a desire in the abstract. Actually placing the order at the counter is X onegaishimasu.']
      ] },
      { s: 'other', t: '硬さは。', r: 'かたさ わ。', e: 'Firmness?' },
      { s: 'you', t: 'かためで。', r: 'かため で。', e: 'Firm.', wrong: [
        ['かためを。', 'かため お。', 'A bare choice answering "which one" is marked with de, not o, the same short pattern as hotto de.'],
        ['かためが。', 'かため が。', 'The same clipped-answer shape takes de here, not ga.']
      ] },
      { s: 'you', t: 'ごちそうさまでした。', r: 'ごちそうさま でした。', e: 'Thanks for the meal.', wrong: [
        ['ありがとうございました。', 'ありがとうございました。', 'Fine on its own, but leaving after a meal has its own set phrase, gochisousama deshita, which thanks for the food itself.'],
        ['いただきました。', 'いただきました。', 'itadakimasu is said before eating. The phrase on finishing and leaving is gochisousama deshita.']
      ] },
      { s: 'other', t: 'ありがとうございました。', r: 'ありがとうございました。', e: 'Thank you very much!' }
    ]
  },
  // Gotcha: turns 1 through 9 arrive as rapid consecutive questions, each answered in two
  // or three words with de. This de-answer pattern is the single highest-value habit
  // this whole unit teaches: hotto de, M de, ten’nai de, PayPay de.
  // Gotcha: a vibrating pager instead of a number stand is a common variation — recognise
  // only, "kochira ga narimashitara, kaunta made okoshi kudasai".
  {
    code: 'cafe-counter',
    unit: 'restaurant',
    title: 'Café counter order',
    situation: 'You are ordering at a café counter.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。店内でお召し上がりですか、お持ち帰りですか。', r: 'いらっしゃいませ。てんない で おめしあがり です か、おもちかえり です か。', e: 'Welcome. Eating in, or takeaway?' },
      { s: 'you', t: '店内で。', r: 'てんない で。', e: 'Eating in.', wrong: [
        ['店内です。', 'てんない です。', 'desu names the place as a fact, but you are choosing between two offered options. The answer pattern here is X de, matching hotto de and M de.'],
        ['店内を。', 'てんない お。', 'o marks a direct object being acted on. Choosing where you will eat is marked with de, not o.']
      ] },
      { s: 'other', t: 'ご注文をどうぞ。', r: 'ごちゅうもん お どうぞ。', e: 'Go ahead with your order.' },
      { s: 'you', t: 'ブレンドコーヒーと、ミラノサンドのAをお願いします。', r: 'ブレンドコーヒー と、ミラノサンド の エー お おねがいします。', e: 'A blend coffee and the Milano Sand A, please.', wrong: [
        ['ブレンドコーヒーと、ミラノサンドのAでお願いします。', 'ブレンドコーヒー と、ミラノサンド の エー で おねがいします。', 'de marks a choice among alternatives already raised in the conversation. Naming your whole order from scratch takes o.'],
        ['ブレンドコーヒーと、ミラノサンドのAがお願いします。', 'ブレンドコーヒー と、ミラノサンド の エー が おねがいします。', 'onegaishimasu takes o for what you are ordering, not ga.']
      ] },
      { s: 'other', t: 'コーヒーはホットとアイス、どちらになさいますか。', r: 'コーヒー わ ホット と アイス、どちら に なさいます か。', e: 'Hot or iced for the coffee?' },
      { s: 'you', t: 'ホットで。', r: 'ホット で。', e: 'Hot.', wrong: [
        ['ホットです。', 'ホット です。', 'desu states hot as a fact about the coffee. Choosing between two named options uses de, the reflexive counter-answer this whole scene trains.'],
        ['ホットを。', 'ホット お。', 'o marks a direct object. Picking between hot and iced is marked with de, not o.']
      ] },
      { s: 'other', t: 'サイズはいかがなさいますか。', r: 'サイズ わ いかが なさいます か。', e: 'What size?' },
      { s: 'you', t: 'Mで。', r: 'エム で。', e: 'Medium.', wrong: [
        ['Mです。', 'エム です。', 'desu states a fact. Choosing a size from the offered set is the same de-answer as hotto de: M de.'],
        ['Mを。', 'エム お。', 'o marks a direct object. Choosing a size among options takes de, not o.']
      ] },
      { s: 'other', t: 'お砂糖とミルクはお使いになりますか。', r: 'おさとう と ミルク わ おつかい に なります か。', e: 'Will you use sugar and milk?' },
      { s: 'you', t: 'ミルクだけお願いします。', r: 'ミルク だけ おねがいします。', e: 'Just milk, please.', wrong: [
        ['ミルクだけでお願いします。', 'ミルク だけ で おねがいします。', 'dake already narrows it to milk alone. Adding de on top of dake is not how this request is built — the item simply takes o or is left bare before onegaishimasu.'],
        ['ミルクしかお願いします。', 'ミルク しか おねがいします。', 'shika must pair with a negative verb, as in shika arimasen or shika irimasen. It cannot end a sentence in onegaishimasu on its own.']
      ] },
      { s: 'other', t: '以上でよろしいでしょうか。お会計、六百八十円でございます。', r: 'いじょう で よろしい でしょう か。おかいけい、ろっぴゃく はちじゅう えん で ございます。', e: 'Will that be all? That is 680 yen.' },
      { s: 'you', t: 'PayPayで。', r: 'ペイペイ で。', e: 'By PayPay.', wrong: [
        ['PayPayです。', 'ペイペイ です。', 'desu states a fact. Naming how you will pay, among the possible methods, is the same de-answer pattern as hotto de.'],
        ['PayPayを。', 'ペイペイ お。', 'o marks a direct object being acted on. The method of payment is marked with de, not o.']
      ] },
      { s: 'other', t: 'サンドイッチはお席までお持ちしますので、こちらの番号札を見えるところにお置きください。', r: 'サンドイッチ わ おせき まで おもち します ので、こちら の ばんごうふだ お みえる ところ に おき ください。', e: 'We will bring the sandwich to your table, so please put this number stand somewhere visible.' },
      { s: 'you', t: '分かりました。ありがとうございます。', r: 'わかりました。ありがとうございます。', e: 'Got it, thank you.', wrong: [
        ['分かります。ありがとうございます。', 'わかります。ありがとうございます。', 'wakarimasu is a general statement of ability to understand. Acknowledging what was just said needs the past: wakarimashita.'],
        ['知りました。ありがとうございます。', 'しりました。ありがとうございます。', 'shiru is learning a brand-new fact. Confirming you understood an instruction is wakarimashita.']
      ] }
    ]
  },
  // Gotcha: the set upsell chain is where learners get railroaded into a size they did
  // not want because they said hai to a question they did not fully parse.
  // Gotcha: numbers are called out in Japanese only — the learner has to hold their own
  // receipt number in their head and recognise it spoken, not just read it.
  {
    code: 'fast-food-set',
    unit: 'restaurant',
    title: 'Fast food and the size-up',
    situation: 'You are ordering fast food to take away.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ、こんにちは。店内でお召し上がりですか。', r: 'いらっしゃいませ、こんにちは。てんない で おめしあがり です か。', e: 'Welcome! Eating in?' },
      { s: 'you', t: '持ち帰りで。', r: 'もちかえり で。', e: 'Takeaway.', wrong: [
        ['持ち帰りです。', 'もちかえり です。', 'desu states a fact. Choosing between eating in and takeaway is the de-answer pattern: mochikaeri de.'],
        ['持ち帰りを。', 'もちかえり お。', 'o marks a direct object. Choosing how you will eat is marked with de.']
      ] },
      { s: 'other', t: 'ご注文をどうぞ。', r: 'ごちゅうもん お どうぞ。', e: 'Your order, please.' },
      { s: 'you', t: 'てりやきバーガーのセットを一つお願いします。', r: 'てりやき バーガー の セット お ひとつ おねがいします。', e: 'One teriyaki burger set, please.', wrong: [
        ['てりやきバーガーのセットが一つお願いします。', 'てりやき バーガー の セット が ひとつ おねがいします。', 'What you are ordering is the object of onegaishimasu: o, not ga.'],
        ['てりやきバーガーのセットを一つでお願いします。', 'てりやき バーガー の セット お ひとつ で おねがいします。', 'de marks choosing among alternatives already raised. Naming your whole order from scratch takes o, with no de needed.']
      ] },
      { s: 'other', t: 'セットのお飲み物は何になさいますか。', r: 'セット の おのみもの わ なに に なさいます か。', e: 'What drink for the set?' },
      { s: 'you', t: 'コーラで。', r: 'コーラ で。', e: 'Cola.', wrong: [
        ['コーラです。', 'コーラ です。', 'desu states a fact. Choosing a drink from the set options is the de-answer: koora de.'],
        ['コーラを。', 'コーラ お。', 'o marks a direct object. Picking your drink among the offered choices is marked with de.']
      ] },
      { s: 'other', t: 'ポテトとお飲み物、プラス五十円でLサイズにできますが、いかがですか。', r: 'ポテト と おのみもの、プラス ごじゅう えん で エル サイズ に できます が、いかが です か。', e: 'For 50 yen more you can upsize the fries and drink to L. Would you like that?' },
      { s: 'you', t: 'そのままで大丈夫です。', r: 'そのまま で だいじょうぶ です。', e: 'As it is, is fine.', wrong: [
        ['そのままがいいです。', 'そのまま が いい です。', 'ga ii compares this against another option you are choosing between. You are declining an upsell, which is the clean X de daijoubu desu.'],
        ['そのままをお願いします。', 'そのまま お おねがいします。', 'onegaishimasu here sounds like an active request rather than turning down the upsize. Declining is X de daijoubu desu, not onegaishimasu.']
      ] },
      { s: 'other', t: 'かしこまりました。以上でよろしいでしょうか。', r: 'かしこまりました。いじょう で よろしい でしょう か。', e: 'Certainly. Will that be all?' },
      { s: 'you', t: 'はい。', r: 'はい。', e: 'Yes.', wrong: [
        ['はい、そうです。', 'はい、そう です。', 'sou desu affirms a fact stated to you. This was a yes-or-no question about your order, so a plain hai answers it directly.'],
        ['大丈夫です。', 'だいじょうぶ です。', 'daijoubu desu here risks being heard as declining the whole order rather than confirming it. A plain hai is the unambiguous yes.']
      ] },
      { s: 'other', t: 'お会計、七百五十円でございます。お作りしてお呼びしますので、レシートの番号でお待ちください。', r: 'おかいけい、ななひゃく ごじゅう えん で ございます。おつくり して および します ので、レシート の ばんごう で おまち ください。', e: 'That is 750 yen. We will call you when it is ready, so please wait for the number on your receipt.' },
      { s: 'you', t: 'はい。', r: 'はい。', e: 'OK.', wrong: [
        ['分かります。', 'わかります。', 'wakarimasu is a general statement of comprehension. Acknowledging an instruction just given is wakarimashita, or simply hai.'],
        ['そうですね。', 'そう です ね。', 'ne seeks agreement about something you both already know. This is new information they just gave you, so a plain hai fits.']
      ] },
      { s: 'other', t: 'お待たせいたしました。二十三番のレシートをお持ちのお客様ー。', r: 'おまたせ いたしました。にじゅうさん ばん の レシート お おもち の おきゃくさま ー。', e: 'Sorry for the wait. Customer with receipt number 23!' },
      { s: 'you', t: 'はい。ありがとうございます。', r: 'はい。ありがとうございます。', e: 'Yes, thank you.', wrong: [
        ['はい。ありがとうございました。', 'はい。ありがとうございました。', 'The past tense closes the thanks off as finished, but you are only now taking your food.'],
        ['はい。いただきます。', 'はい。いただきます。', 'itadakimasu is said just before eating, not as thanks to staff for calling your number.']
      ] }
    ]
  },
  // Gotcha: o-sage shite mo yoroshii desu ka arrives mid-conversation and mid-bite — the
  // misread is nodding at a glass you wanted to keep. "Mada nonde imasu" is the save.
  // Gotcha: rasuto oodaa is genuinely the final call; silence at last order means you get
  // nothing more, unlike a normal pause in the conversation.
  {
    code: 'during-meal-lastorder',
    unit: 'restaurant',
    title: 'Ordering more mid-meal',
    situation: 'You are an hour into a meal at an izakaya and want to order more.',
    turns: [
      { s: 'other', t: 'お待たせしました。ご注文お伺いします。', r: 'おまたせ しました。ごちゅうもん おうかがい します。', e: 'Sorry for the wait. Your order?' },
      { s: 'you', t: '生をもう一つと、枝豆お願いします。', r: 'なま お もう ひとつ と、えだまめ おねがいします。', e: 'One more draft beer and edamame, please.', wrong: [
        ['生がもう一つと、枝豆お願いします。', 'なま が もう ひとつ と、えだまめ おねがいします。', 'What you are ordering again is the object of onegaishimasu, so it takes o, not ga.'],
        ['生をもう一つと、枝豆をください、お願いします。', 'なま お もう ひとつ と、えだまめ お ください、おねがいします。', 'Stacking kudasai onto onegaishimasu is redundant. One request verb is enough for the whole order.']
      ] },
      { s: 'other', t: 'かしこまりました。', r: 'かしこまりました。', e: 'Certainly.' },
      { s: 'other', t: 'お済みのお皿、お下げしてもよろしいですか。', r: 'おすみ の おさら、おさげ して も よろしい です か。', e: 'May I clear the finished plates?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'daijoubu desu here would be heard as declining, as if you want the plates left. Agreeing to have them cleared is hai, onegaishimasu.'],
        ['はい、お願いしました。', 'はい、おねがいしました。', 'The past tense makes the request sound already finished. Agreeing right now is the plain onegaishimasu.']
      ] },
      { s: 'other', t: 'こちらのグラスもお下げしてよろしいですか。', r: 'こちら の グラス も おさげ して よろしい です か。', e: 'This glass too?' },
      { s: 'you', t: 'あ、それはまだ飲んでるので。', r: 'あ、それ わ まだ のんでる ので。', e: 'Ah, I am still drinking that one.', wrong: [
        ['あ、それはまだ飲んでいないので。', 'あ、それ わ まだ のんで いない ので。', 'This says you have NOT started it yet. You are mid-drink, and the phrase for an ongoing action is nonde iru, not its negative.'],
        ['あ、それはまだ飲むので。', 'あ、それ わ まだ のむ ので。', 'The plain form nomu states a future or general action. Being in the middle of drinking right now needs the te-iru form: nonde iru.']
      ] },
      { s: 'other', t: '失礼いたしました。', r: 'しつれい いたしました。', e: 'My apologies.' },
      { s: 'other', t: 'お客様、まもなくラストオーダーのお時間ですが、追加のご注文はいかがでしょうか。', r: 'おきゃくさま、まもなく ラストオーダー の おじかん です が、ついか の ごちゅうもん わ いかが でしょう か。', e: 'Excuse me, it is nearly last orders. Would you like anything else?' },
      { s: 'you', t: 'じゃあ、ハイボールを一つだけお願いします。', r: 'じゃあ、ハイボール お ひとつ だけ おねがいします。', e: 'Then just one highball, please.', wrong: [
        ['じゃあ、ハイボールが一つだけお願いします。', 'じゃあ、ハイボール が ひとつ だけ おねがいします。', 'The drink you are ordering is the object of onegaishimasu: o, not ga.'],
        ['じゃあ、ハイボールを一つでお願いします。', 'じゃあ、ハイボール お ひとつ で おねがいします。', 'de marks choosing among alternatives already raised in conversation, not naming a fresh item you want. The thing ordered takes o.']
      ] },
      { s: 'other', t: 'かしこまりました。以降のご注文はお受けできませんので、ご了承ください。', r: 'かしこまりました。いこう の ごちゅうもん わ おうけ できません ので、ごりょうしょう ください。', e: 'Certainly. Please note we cannot take orders after this.' },
      { s: 'you', t: 'はい、大丈夫です。', r: 'はい、だいじょうぶ です。', e: 'That is fine.', wrong: [
        ['はい、大丈夫でした。', 'はい、だいじょうぶ でした。', 'The past tense treats it as a fact settled earlier, but you are agreeing to the notice right now: plain daijoubu desu.'],
        ['はい、大丈夫します。', 'はい、だいじょうぶ します。', 'daijoubu is a na-adjective and pairs with desu, never with suru.']
      ] }
    ]
  },
  // Gotcha: where you pay is the fork foreigners miss — teeburu-kaikei (staff bring a tray
  // to the table) versus reji-kaikei (you take the denpyou up yourself), the default here.
  // Gotcha: "reshiito no goriyou wa yoroshii desu ka" inverts the polarity — learners answer
  // hai meaning "yes I want it" and watch it get binned. Onegaishimasu asks to receive it;
  // daijoubu desu or ii desu here both decline it.
  {
    code: 'paying-till-split',
    unit: 'restaurant',
    title: 'Paying at the till',
    situation: 'You are paying for the meal at the till, splitting it with a friend.',
    turns: [
      { s: 'you', t: 'すみません、お会計お願いします。', r: 'すみません、おかいけい おねがいします。', e: 'Excuse me, the bill please.', wrong: [
        ['すみません、お会計をください、お願いします。', 'すみません、おかいけい お ください、おねがいします。', 'Stacking kudasai onto onegaishimasu is redundant. The standard request pattern here is just X onegaishimasu.'],
        ['すみません、お会計です。', 'すみません、おかいけい です。', 'desu just labels the bill as a fact. Asking for it is a request: onegaishimasu.']
      ] },
      { s: 'other', t: 'お会計ですね。伝票をお持ちになって、レジでお願いいたします。', r: 'おかいけい です ね。でんぴょう お おもち に なって、レジ で おねがい いたします。', e: 'The bill. Please take your slip to the register.' },
      { s: 'you', t: '分かりました。', r: 'わかりました。', e: 'Got it.', wrong: [
        ['分かります。', 'わかります。', 'wakarimasu is a general statement of ability. Acknowledging the instruction just given is the past: wakarimashita.'],
        ['知りました。', 'しりました。', 'shiru is learning a brand-new fact. Confirming you understood an instruction is wakarimashita.']
      ] },
      { s: 'other', t: '伝票お預かりします。お会計はご一緒でよろしいですか。', r: 'でんぴょう おあずかり します。おかいけい わ ごいっしょ で よろしい です か。', e: 'I will take your slip. Is it all together?' },
      { s: 'you', t: '別々でお願いします。', r: 'べつべつ で おねがいします。', e: 'Separately, please.', wrong: [
        ['別々をお願いします。', 'べつべつ お おねがいします。', 'The manner of paying, together or separately, is marked with de, not o.'],
        ['別々がお願いします。', 'べつべつ が おねがいします。', 'onegaishimasu takes de for how you want it done, not ga.']
      ] },
      { s: 'other', t: 'かしこまりました。お先のお客様、二千百四十円でございます。', r: 'かしこまりました。おさき の おきゃくさま、にせん ひゃく よんじゅう えん で ございます。', e: 'Certainly. First customer: 2,140 yen.' },
      { s: 'other', t: 'お支払いは、いかがなさいますか。', r: 'おしはらい わ、いかが なさいます か。', e: 'How will you be paying?' },
      { s: 'you', t: 'カードで。', r: 'カード で。', e: 'By card.', wrong: [
        ['カードです。', 'カード です。', 'desu states a fact. Naming your payment method among the possible options is the de-answer: kaado de.'],
        ['カードを。', 'カード お。', 'o marks a direct object. The method of payment is marked with de, not o.']
      ] },
      { s: 'other', t: 'こちらの端末にタッチをお願いします。', r: 'こちら の たんまつ に タッチ お おねがいします。', e: 'Please tap on this terminal.' },
      { s: 'other', t: 'レシートのご利用はよろしいですか。', r: 'レシート の ごりよう わ よろしい です か。', e: 'Do you need the receipt?' },
      { s: 'you', t: 'お願いします。', r: 'おねがいします。', e: 'Yes please.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'The question is phrased as "is it fine without it", so daijoubu desu here answers yes to not needing one, the opposite of what you want. Asking to receive it needs onegaishimasu.'],
        ['いいです。', 'いい です。', 'ii desu in answer to an offer usually declines it, the same trap as daijoubu desu. Asking to receive the receipt needs onegaishimasu.']
      ] },
      { s: 'other', t: 'ありがとうございました。またお越しくださいませ。', r: 'ありがとうございました。また おこし くださいませ。', e: 'Thank you very much. Please come again.' },
      { s: 'you', t: 'ごちそうさまでした。', r: 'ごちそうさま でした。', e: 'Thanks for the meal.', wrong: [
        ['いただきました。', 'いただきました。', 'itadakimasu is said before eating. Leaving after the meal is finished uses gochisousama deshita.'],
        ['ありがとうございました。', 'ありがとうございました。', 'Fine on its own, but on leaving after a meal the set phrase specifically thanking for the food is gochisousama deshita.']
      ] }
    ]
  }
]
