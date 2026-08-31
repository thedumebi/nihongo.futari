import type { Dialogue } from './types.js'

/** Banks, cafés, gyms, the barber, the vet — the rest of an ordinary week. */
export const MORE: Dialogue[] = [
  {
    code: 'services-bank',
    unit: 'services',
    title: 'At the bank',
    situation: 'You want to open an account.',
    turns: [
      { s: 'other', t: '本日はどのようなご用件でしょうか。', r: 'ほんじつ わ どのような ごようけん でしょう か。', e: 'How can we help today?' },
      { s: 'you', t: '口座を作りたいのですが。', r: 'こうざ お つくりたい の です が。', e: 'I would like to open an account.', wrong: [
        ['口座を開けたいのですが。', 'こうざ お あけたい の です が。', 'akeru opens a door or a lid. An account is made: tsukuru.'],
        ['口座を作ります。', 'こうざ お つくります。', 'A flat announcement. At a counter, -tai no desu ga makes it a request.']
      ] },
      { s: 'other', t: '身分証明書はお持ちですか。', r: 'みぶん しょうめいしょ わ おもち です か。', e: 'Do you have identification?' },
      { s: 'you', t: 'はい、在留カードがあります。', r: 'はい、ざいりゅう カード が あります。', e: 'Yes, I have my residence card.', wrong: [
        ['はい、在留カードをあります。', 'はい、ざいりゅう カード お あります。', 'aru is intransitive — the card takes ga.'],
        ['はい、在留カードがいます。', 'はい、ざいりゅう カード が います。', 'iru is for animate things. A card takes aru.']
      ] },
      { s: 'other', t: 'ありがとうございます。こちらの用紙にご住所とお電話番号もご記入ください。', r: 'ありがとう ございます。こちら の ようし に ごじゅうしょ と おでんわ ばんごう も ごきにゅう ください。', e: 'Thank you. Please also fill in your address and phone number on this form.' },
      { s: 'you', t: 'わかりました。ボールペンをお借りしてもいいですか。', r: 'わかりました。ボールペン お おかり して も いい です か。', e: 'Understood. Could I borrow a pen?', wrong: [
        ['わかりました。ボールペンを貸してもいいですか。', 'わかりました。ボールペン お かして も いい です か。', 'kasu is to lend — that is what THEY would do. Borrowing it yourself is kariru.'],
        ['わかりました。ボールペンをあげてもいいですか。', 'わかりました。ボールペン お あげて も いい です か。', 'ageru means giving something away. You want to use their pen, not give it to them.']
      ] },
      { s: 'other', t: 'キャッシュカードにデビット機能もおつけしますか。', r: 'キャッシュカード に デビット きのう も おつけ します か。', e: 'Shall we add a debit function to the cash card as well?' },
      { s: 'you', t: 'いえ、大丈夫です。カードだけで結構です。', r: 'いえ、だいじょうぶ です。カード だけ で けっこう です。', e: 'No, that is fine — just the card is enough.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'daijoubu desu is itself a decline — hai in front of it contradicts your own refusal.'],
        ['いいですよ、お願いします。', 'いい です よ、おねがいします。', 'ii desu turns the offer down; it cannot be followed by onegaishimasu asking for the thing you just refused.']
      ] },
      { s: 'other', t: '承知しました。初回のご入金はおいくらになさいますか。', r: 'しょうち しました。しょかい の ごにゅうきん わ おいくら に なさいます か。', e: 'Understood. How much would you like for the initial deposit?' },
      { s: 'you', t: '一万円をお願いします。', r: 'いちまん えん お おねがいします。', e: 'Ten thousand yen, please.', wrong: [
        ['一万円がお願いします。', 'いちまん えん が おねがいします。', 'onegai suru takes an object, so it is o, not ga.'],
        ['一万円でお願いします。', 'いちまん えん で おねがいします。', 'de marks a means, like paying BY cash. The amount you want deposited is what you are asking for, so it takes o.']
      ] },
      { s: 'other', t: 'かしこまりました。カードは一週間ほどでご自宅に届きます。以上でご案内は終わりです。', r: 'かしこまりました。カード わ いっしゅうかん ほど で ごじたく に とどきます。いじょう で ごあんない わ おわり です。', e: 'Certainly. The card will arrive at your home in about a week. That concludes everything.' },
      { s: 'you', t: 'ありがとうございました。よろしくお願いします。', r: 'ありがとう ございました。よろしく おねがいします。', e: 'Thank you very much. I appreciate it.', wrong: [
        ['ありがとうございます。よろしくお願いします。', 'ありがとう ございます。よろしく おねがいします。', 'The service is finished, so as a closing thanks it takes the past: arigatou gozaimashita.'],
        ['どうもすみませんでした。よろしくお願いします。', 'どうも すみません でした。よろしく おねがいします。', 'sumimasen deshita apologizes; nothing here calls for an apology, only thanks.']
      ] }
    ]
  },
  {
    code: 'cafe-order',
    unit: 'services',
    title: 'In a café',
    situation: 'You are ordering coffee to drink in.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。ご注文は何になさいますか。', r: 'いらっしゃいませ。ごちゅうもん わ なに に なさいます か。', e: 'Welcome. What would you like to order?' },
      { s: 'you', t: 'カフェラテをお願いします。', r: 'カフェラテ お おねがいします。', e: 'A caffè latte, please.', wrong: [
        ['カフェラテがお願いします。', 'カフェラテ が おねがいします。', 'onegai suru takes an object, so it is o, not ga.'],
        ['カフェラテをいただきます。', 'カフェラテ お いただきます。', 'itadakimasu announces you are about to receive something already given. At the counter you are still ordering: onegaishimasu.']
      ] },
      { s: 'other', t: 'ホットとアイス、どちらになさいますか。', r: 'ホット と アイス、どちら に なさいます か。', e: 'Hot or iced?' },
      { s: 'you', t: 'ホットをお願いします。', r: 'ホット お おねがいします。', e: 'Hot, please.', wrong: [
        ['ホットでお願いします。', 'ホット で おねがいします。', 'de marks a means or a place of action. Choosing between offered options takes o.'],
        ['ホットがお願いします。', 'ホット が おねがいします。', 'onegai suru takes an object: o, not ga.']
      ] },
      { s: 'other', t: 'こちらでお召し上がりですか。', r: 'こちら で おめしあがり です か。', e: 'Drinking in?' },
      { s: 'you', t: 'はい、ここで飲みます。', r: 'はい、ここ で のみます。', e: 'Yes, here.', wrong: [
        ['はい、ここに飲みます。', 'はい、ここ に のみます。', 'ni marks a destination or a point. Where an action happens is de.'],
        ['はい、持ち帰ります。', 'はい、もちかえります。', 'That is takeaway — the opposite of what you just agreed to.']
      ] },
      { s: 'other', t: 'サイズはいかがなさいますか。', r: 'サイズ わ いかが なさいます か。', e: 'What size?' },
      { s: 'you', t: '一番小さいのをお願いします。', r: 'いちばん ちいさい の お おねがいします。', e: 'The smallest, please.', wrong: [
        ['一番小さいをお願いします。', 'いちばん ちいさい お おねがいします。', 'chiisai is an adjective and cannot stand alone as a thing. no turns it into "the small one".'],
        ['もっと小さいのをお願いします。', 'もっと ちいさい の お おねがいします。', 'motto compares against something already offered. Nothing has been offered yet.']
      ] },
      { s: 'other', t: 'ポイントカードはお作りになりますか。', r: 'ポイントカード わ おつくり に なります か。', e: 'Would you like to make a point card?' },
      { s: 'you', t: 'あ、いいです。', r: 'あ、いい です。', e: 'Oh, no thanks.', wrong: [
        ['あ、いいですよ、お願いします。', 'あ、いい です よ、おねがいします。', 'ii desu here declines the offer — following it with onegaishimasu asks for the very thing you just turned down.'],
        ['あ、いいですね、作ります。', 'あ、いい です ね、つくります。', 'ii desu ne agrees enthusiastically. Turning the offer down just needs plain ii desu.']
      ] },
      { s: 'other', t: 'かしこまりました。それでは五百円になります。', r: 'かしこまりました。それでは ごひゃく えん に なります。', e: 'Certainly. That will be 500 yen.' },
      { s: 'you', t: 'あ、すみません、カードで払えますか。', r: 'あ、すみません、カード で はらえます か。', e: 'Oh, sorry — can I pay by card?', wrong: [
        ['カードを払えますか。', 'カード お はらえます か。', 'harau takes what you are paying as its object, like the price. The method of payment takes de.'],
        ['カードに払えますか。', 'カード に はらえます か。', 'ni does not mark a method. Paying BY something takes de.']
      ] },
      { s: 'other', t: 'はい、こちらの機械にどうぞ。', r: 'はい、こちら の きかい に どうぞ。', e: 'Yes, please tap it here.' },
      { s: 'you', t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you.', wrong: [
        ['ありがとうございます。', 'ありがとう ございます。', 'The purchase is finished, so as a parting thanks it takes the past: arigatou gozaimashita.'],
        ['どういたしまして。', 'どういたしまして。', 'That means "you are welcome" — it responds to thanks, it does not give thanks.']
      ] }
    ]
  },
  {
    code: 'services-drycleaner',
    unit: 'services',
    title: 'At the dry cleaner',
    situation: 'You are dropping off a coat.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。本日はどうされますか。', r: 'いらっしゃいませ。ほんじつ わ どう されます か。', e: 'Welcome. What can I do for you today?' },
      { s: 'you', t: 'これ、お願いできますか。', r: 'これ、おねがい できます か。', e: 'Could you do this one?', wrong: [
        ['これ、してください。', 'これ、して ください。', 'Grammatical but abrupt over a counter — and vague about what you want done.'],
        ['これ、お願いします。', 'これ、おねがいします。', 'Fine in a shop, but dekimasu ka acknowledges they might not take it, which is politer at a cleaner.']
      ] },
      { s: 'other', t: '拝見しますね。あ、ここに染みがありますね。', r: 'はいけん します ね。あ、ここ に しみ が あります ね。', e: 'Let me take a look. Ah, there is a stain here.' },
      { s: 'you', t: 'あ、はい。コーヒーをこぼしてしまって。', r: 'あ、はい。コーヒー お こぼして しまって。', e: 'Oh, yes. I spilled coffee on it.', wrong: [
        ['コーヒーをこぼれてしまって。', 'コーヒー お こぼれて しまって。', 'koboreru is intransitive — coffee spilling by itself does not take an object. Saying YOU spilled it needs the transitive kobosu.'],
        ['コーヒーがこぼしてしまって。', 'コーヒー が こぼして しまって。', 'kobosu is transitive and takes o for what was spilled, not ga.']
      ] },
      { s: 'other', t: '承知しました。染み抜きもご希望ですか。追加料金がかかりますが。', r: 'しょうち しました。しみぬき も ごきぼう です か。ついか りょうきん が かかります が。', e: 'Understood. Would you like stain removal too? There is an extra charge.' },
      { s: 'you', t: 'はい、お願いします。いくらですか。', r: 'はい、おねがいします。いくら です か。', e: 'Yes, please. How much is it?', wrong: [
        ['はい、いいです。いくらですか。', 'はい、いい です。いくら です か。', 'ii desu declines the offer — pairing it with hai contradicts your own answer.'],
        ['はい、お願いしました。いくらですか。', 'はい、おねがいしました。いくら です か。', 'The request is happening right now, not finished, so onegai shimasu, not the past onegai shimashita.']
      ] },
      { s: 'other', t: 'プラス三百円になります。', r: 'プラス さんびゃく えん に なります。', e: 'That will be an extra 300 yen.' },
      { s: 'you', t: 'わかりました、それでお願いします。', r: 'わかりました、それ で おねがいします。', e: 'Understood, please go ahead with that.', wrong: [
        ['わかりました、それをお願いします。', 'わかりました、それ お おねがいします。', 'You are agreeing to a way of proceeding, not asking for "that" as a thing — the basis you are agreeing on takes de.'],
        ['わかりました、それはお願いします。', 'わかりました、それ わ おねがいします。', 'wa would make "that" a contrastive topic, implying something else is being treated differently. You are simply confirming, which is de.']
      ] },
      { s: 'other', t: 'かしこまりました。金曜日にできます。', r: 'かしこまりました。きんようび に できます。', e: 'Certainly. It will be ready Friday.' },
      { s: 'you', t: '金曜日の何時からですか。', r: 'きんようび の なんじ から です か。', e: 'From what time on Friday?', wrong: [
        ['金曜日の何時までですか。', 'きんようび の なんじ まで です か。', 'made asks when it stops being available. You want when it starts: kara.'],
        ['金曜日は何時ですか。', 'きんようび わ なんじ です か。', 'That asks what the time is on Friday, which is not a question anyone can answer.']
      ] },
      { s: 'other', t: '午前十時からです。引換券をお渡ししますので、なくさないでくださいね。', r: 'ごぜん じゅうじ から です。ひきかえけん お おわたし します ので、なくさないで ください ね。', e: 'From 10 in the morning. I will give you a claim ticket, so please do not lose it.' },
      { s: 'you', t: 'はい、わかりました。お願いします。', r: 'はい、わかりました。おねがいします。', e: 'Yes, understood. Thank you.', wrong: [
        ['はい、わかりません。お願いします。', 'はい、わかりません。おねがいします。', 'wakarimasen says you do NOT understand — the opposite of confirming you got it.'],
        ['はい、わかっていました。お願いします。', 'はい、わかって いました。おねがいします。', 'watte imashita reports something you already knew beforehand. Just now understanding what they said is wakarimashita.']
      ] }
    ]
  },
  {
    code: 'gym-join',
    unit: 'services',
    title: 'At the gym',
    situation: 'You are asking about membership.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。初めてですか。', r: 'いらっしゃいませ。はじめて です か。', e: 'Welcome. First time here?' },
      { s: 'you', t: 'はい、初めてです。', r: 'はい、はじめて です。', e: 'Yes, first time.', wrong: [
        ['はい、初めます。', 'はい、はじめます。', 'hajimemasu means "I will begin [something]" and needs an object. Saying it is your first visit is hajimete desu.'],
        ['はい、初めてでした。', 'はい、はじめて でした。', 'You are standing here right now on your first visit — deshita puts it in the past as though it already ended.']
      ] },
      { s: 'other', t: '何かお探しですか。', r: 'なに か おさがし です か。', e: 'Looking for something in particular?' },
      { s: 'you', t: '見学してもいいですか。', r: 'けんがく して も いい です か。', e: 'May I look around?', wrong: [
        ['見学したいです。', 'けんがく したい です。', 'States a want. Asking permission on someone else\'s premises is te mo ii desu ka.'],
        ['見学しましょうか。', 'けんがく しましょう か。', 'That offers to look round WITH them, as though it were a joint activity.']
      ] },
      { s: 'other', t: 'どうぞ。月会費は八千円です。', r: 'どうぞ。げっかいひ わ はっせん えん です。', e: 'Please do. It is 8,000 yen a month.' },
      { s: 'you', t: '一週間に何回まで来られますか。', r: 'いっしゅうかん に なんかい まで こられます か。', e: 'How many times a week can I come?', wrong: [
        ['何回一週間に来られますか。', 'なんかい いっしゅうかん に こられます か。', 'The period comes first and the count second — isshuukan ni nankai, which is the reverse of English.'],
        ['一週間で何回まで来られますか。', 'いっしゅうかん で なんかい まで こられます か。', 'For a rate — so many times PER week — the particle is ni.']
      ] },
      { s: 'other', t: '何回でも来られますよ。ただ、シャワーの利用は別料金です。', r: 'なんかい でも こられます よ。ただ、シャワー の りよう わ べつりょうきん です。', e: 'You can come as many times as you like. Though shower use is a separate charge.' },
      { s: 'you', t: 'そうなんですか。タオルのレンタルもありますか。', r: 'そう なん です か。タオル の レンタル も あります か。', e: 'Is that right. Is there towel rental too?', wrong: [
        ['そうなんですか。タオルのレンタルもいますか。', 'そう なん です か。タオル の レンタル も います か。', 'iru is for animate things — a rental service takes aru.'],
        ['そうなんですか。タオルのレンタルもおりますか。', 'そう なん です か。タオル の レンタル も おります か。', 'oru is the humble form a PERSON uses for their own presence. A rental service takes aru.']
      ] },
      { s: 'other', t: 'はい、一回二百円です。体験レッスンもできますが、いかがですか。', r: 'はい、いっかい にひゃく えん です。たいけん レッスン も できます が、いかが です か。', e: 'Yes, 200 yen a time. There is also a trial lesson available — would you like one?' },
      { s: 'you', t: '今日はちょっと、大丈夫です。また今度お願いします。', r: 'きょう わ ちょっと、だいじょうぶ です。また こんど おねがいします。', e: 'Not today, thanks. Maybe another time.', wrong: [
        ['今日はちょっと、いいですね。また今度お願いします。', 'きょう わ ちょっと、いい です ね。また こんど おねがいします。', 'ii desu ne agrees enthusiastically — it does not fit right after chotto, which is already signalling a decline.'],
        ['今日はちょっと、大丈夫ですね。また今度お願いします。', 'きょう わ ちょっと、だいじょうぶ です ね。また こんど おねがいします。', 'ne asks the listener to agree with you about something already shared. Declining an offer is just plain daijoubu desu.']
      ] },
      { s: 'other', t: 'わかりました。それでは、こちらが入会案内です。ご検討ください。', r: 'わかりました。それでは、こちら が にゅうかい あんない です。ごけんとう ください。', e: 'Understood. Here is the membership guide. Please have a look.' },
      { s: 'you', t: 'はい、ありがとうございます。また来ます。', r: 'はい、ありがとう ございます。また きます。', e: 'Thank you. I will come back.', wrong: [
        ['はい、ありがとうございます。また来ました。', 'はい、ありがとう ございます。また きました。', 'kimashita is past tense — you have not come back yet. Planning to is kimasu.'],
        ['はい、ありがとうございました。また来ます。', 'はい、ありがとう ございました。また きます。', 'The conversation is not over yet — gozaimashita closes something out, but you are still mid-visit here.']
      ] }
    ]
  },
  {
    code: 'travel-airport',
    unit: 'travel',
    title: 'At the airport',
    situation: 'You are checking in a bag.',
    turns: [
      { s: 'other', t: 'パスポートと搭乗券の控えをお願いします。', r: 'パスポート と とうじょうけん の ひかえ お おねがいします。', e: 'Your passport and reservation, please.' },
      { s: 'you', t: 'はい、どうぞ。', r: 'はい、どうぞ。', e: 'Here you go.', wrong: [
        ['はい、どうも。', 'はい、どうも。', 'doumo alone is a casual thanks or greeting. Handing something to airline staff calls for the neutral douzo.'],
        ['はい、これです。', 'はい、これ です。', 'Grammatical, but bare kore desu while holding something out is blunt at a counter — douzo is the polite way to offer it.']
      ] },
      { s: 'other', t: 'ロンドン行きでお間違いないですか。', r: 'ロンドン ゆき で おまちがい ない です か。', e: 'Confirming — this is for London, correct?' },
      { s: 'you', t: 'はい、間違いありません。', r: 'はい、まちがい ありません。', e: "Yes, that's correct.", wrong: [
        ['はい、間違いです。', 'はい、まちがい です。', 'That says the booking itself IS a mistake — the opposite of confirming it is right.'],
        ['はい、間違えました。', 'はい、まちがえました。', 'machigaemashita says YOU made an error just now. You are confirming the destination is correct, not admitting a mistake.']
      ] },
      { s: 'other', t: 'お預けのお荷物はございますか。', r: 'おあずけ の おにもつ わ ございます か。', e: 'Any bags to check?' },
      { s: 'you', t: 'はい、一つあります。', r: 'はい、ひとつ あります。', e: 'Yes, one.', wrong: [
        ['はい、一個います。', 'はい、いっこ います。', 'iru is for animate things; a bag takes aru. And tsu is the counter that answers here.'],
        ['はい、一枚あります。', 'はい、いちまい あります。', 'mai counts flat things. A suitcase takes tsu or ko.']
      ] },
      { s: 'other', t: 'お荷物をこちらに乗せてください。二十三キロまでです。', r: 'おにもつ お こちら に のせて ください。にじゅうさん キロ まで です。', e: 'Please put your bag here. The limit is 23 kilos.' },
      { s: 'you', t: 'はい……あ、ちょっと重いかもしれません。', r: 'はい……あ、ちょっと おもい かもしれません。', e: 'Sure... oh, it might be a bit heavy.', wrong: [
        ['はい……あ、ちょっと重いそうです。', 'はい……あ、ちょっと おもい そう です。', 'omoi sou desu reports what you heard FROM someone else. This is your own guess, so kamoshiremasen.'],
        ['はい……あ、ちょっと重いでしょう。', 'はい……あ、ちょっと おもい でしょう。', 'deshou pushes for the listener to agree with a shared guess. Voicing your own uncertain worry is kamoshiremasen.']
      ] },
      { s: 'other', t: '二十五キロですね。少し超過していますが、今回は大丈夫ですよ。', r: 'にじゅうご キロ です ね。すこし ちょうか して います が、こんかい わ だいじょうぶ です よ。', e: "That's 25 kilos. It's a little over, but it's fine this time." },
      { s: 'you', t: 'よかったです、ありがとうございます。', r: 'よかった です、ありがとう ございます。', e: 'What a relief, thank you.', wrong: [
        ['よかったです、ありがとうございました。', 'よかった です、ありがとう ございました。', 'Check-in is still going — gozaimashita closes out something that has already finished.'],
        ['よくできました、ありがとうございます。', 'よく できました、ありがとう ございます。', 'yoku dekimashita is praise, the way a teacher gives a student for doing well. It does not fit thanking staff for a favour.']
      ] },
      { s: 'other', t: '通路側と窓側、どちらがよろしいですか。', r: 'つうろがわ と まどがわ、どちら が よろしい です か。', e: 'Aisle or window?' },
      { s: 'you', t: '窓側をお願いします。', r: 'まどがわ お おねがいします。', e: 'Window, please.', wrong: [
        ['窓側がお願いします。', 'まどがわ が おねがいします。', 'ga marks a subject. What you are asking for takes o.'],
        ['窓側でお願いします。', 'まどがわ で おねがいします。', 'de marks a means or a place of action. Choosing between offered options takes o.']
      ] },
      { s: 'other', t: '搭乗は十時からです。こちらが搭乗券です。良いご旅行を。', r: 'とうじょう わ じゅうじ から です。こちら が とうじょうけん です。よい ごりょこう お。', e: 'Boarding starts at 10. Here is your boarding pass — have a good trip.' },
      { s: 'you', t: 'ありがとうございます。行ってきます。', r: 'ありがとう ございます。いって きます。', e: "Thank you. I'm off, then.", wrong: [
        ['ありがとうございます。行ってらっしゃい。', 'ありがとう ございます。いって らっしゃい。', 'itterasshai is what you say to someone ELSE who is leaving. You are the one going, so ittekimasu.'],
        ['ありがとうございます。ただいま。', 'ありがとう ございます。ただいま。', 'tadaima announces a RETURN home — you are heading off on a trip, the opposite direction.']
      ] }
    ]
  },
  {
    code: 'travel-bus',
    unit: 'travel',
    title: 'On the bus',
    situation: 'You are not sure this bus goes where you want.',
    turns: [
      { s: 'you', t: 'あの、すみません。市役所前まで行きたいんですが、このバス停で合っていますか。', r: 'あの、すみません。しやくしょまえ まで いきたい ん です が、この バスてい で あって います か。', e: 'Um, excuse me — I want to get to City Hall. Is this the right stop?', wrong: [
        ['あの、すみません。市役所前まで行きたいんですが、このバス停に合っていますか。', 'あの、すみません。しやくしょまえ まで いきたい ん です が、この バスてい に あって います か。', 'ni marks a destination or target. Checking whether you are at the right stop uses de, the same de as kono homu de atte imasu ka.'],
        ['あの、すみません。市役所前まで行きたいんですが、このバス停が合っていますか。', 'あの、すみません。しやくしょまえ まで いきたい ん です が、この バスてい が あって います か。', 'Naming the stop itself as the subject asks whether the STOP is correct in the abstract. Asking whether YOU are right to be at it takes de.']
      ] },
      { s: 'other', t: 'ええ、合っていますよ。', r: 'ええ、あって います よ。', e: "Yes, that's right." },
      { s: 'you', t: 'すみません、このバスは市役所に行きますか。', r: 'すみません、この バス わ しやくしょ に いきます か。', e: 'Does this bus go to the city hall?', wrong: [
        ['すみません、このバスが市役所に行きますか。', 'すみません、この バス が しやくしょ に いきます か。', 'You are asking about this bus as your topic, so wa. ga would be picking it out from several buses you had discussed.'],
        ['すみません、このバスは市役所を行きますか。', 'すみません、この バス わ しやくしょ お いきます か。', 'iku takes ni for a destination. o with a motion verb means travelling THROUGH a place.']
      ] },
      { s: 'other', t: 'いいえ、次のバスですよ。', r: 'いいえ、つぎ の バス です よ。', e: 'No, it is the next one.' },
      { s: 'you', t: '次のバスはいつ来ますか。', r: 'つぎ の バス わ いつ きます か。', e: 'When does the next one come?', wrong: [
        ['次のバスはいつ着きますか。', 'つぎ の バス わ いつ つきます か。', 'tsuku is for something arriving at a destination. Asking when the bus itself will show up here is kuru.'],
        ['次のバスをいつ来ますか。', 'つぎ の バス お いつ きます か。', 'kuru is intransitive — the bus takes wa or ga, not o.']
      ] },
      { s: 'other', t: '十分後くらいですね。', r: 'じゅっぷんご くらい です ね。', e: "About ten minutes, I'd say." },
      { s: 'you', t: '運賃はいくらですか。', r: 'うんちん わ いくら です か。', e: 'How much is the fare?', wrong: [
        ['運賃にいくらですか。', 'うんちん に いくら です か。', 'ni does not mark the thing you are asking about — the fare is the topic, wa, not ni.'],
        ['運賃をいくらですか。', 'うんちん お いくら です か。', 'ikura desu ka is not a verb taking a direct object — there is nothing here for o to attach to.']
      ] },
      { s: 'other', t: '二百十円です。ICカードも使えますよ。', r: 'にひゃくじゅう えん です。アイシー カード も つかえます よ。', e: '210 yen. You can use an IC card too.' },
      { s: 'you', t: 'そうですか。ありがとうございます。', r: 'そう です か。ありがとうございます。', e: 'I see. Thank you.', wrong: [
        ['そうですね。ありがとうございます。', 'そう です ね。ありがとうございます。', 'ne seeks agreement about something you both know. You have just been told something new, which is sou desu ka.'],
        ['そうですよ。ありがとうございます。', 'そう です よ。ありがとうございます。', 'yo tells THEM — it contradicts the person who just informed you.']
      ] },
      { s: 'other', t: 'どういたしまして。気をつけて。', r: 'どういたしまして。き お つけて。', e: 'You are welcome. Take care.' }
    ]
  },
  {
    code: 'social-invite',
    unit: 'social',
    title: 'Inviting someone',
    situation: 'You want to ask a colleague to lunch.',
    turns: [
      { s: 'you', t: '田中さん、今お時間大丈夫ですか。', r: 'たなか さん、いま おじかん だいじょうぶ です か。', e: 'Tanaka-san, do you have a moment?', wrong: [
        ['田中さん、今お時間大丈夫でした。', 'たなか さん、いま おじかん だいじょうぶ でした。', 'You are asking about right now, so the present daijoubu desu ka — deshita puts the question in the past.'],
        ['田中さん、今お時間大丈夫にですか。', 'たなか さん、いま おじかん だいじょうぶ に です か。', 'Na-adjectives like daijoubu do not take ni before desu ka — it is just daijoubu desu ka.']
      ] },
      { s: 'other', t: 'はい、大丈夫ですよ。何ですか。', r: 'はい、だいじょうぶ です よ。なん です か。', e: "Sure. What's up?" },
      { s: 'you', t: 'よかったら、一緒に昼ごはんを食べませんか。', r: 'よかったら、いっしょに ひるごはん お たべません か。', e: 'If you like, shall we have lunch together?', wrong: [
        ['よかったら、一緒に昼ごはんを食べましょう。', 'よかったら、いっしょに ひるごはん お たべましょう。', 'mashou assumes agreement — it decides for both of you. An invitation that leaves room to decline is masen ka.'],
        ['よかったら、一緒に昼ごはんを食べたいです。', 'よかったら、いっしょに ひるごはん お たべたい です。', 'That states YOUR wish rather than inviting them.']
      ] },
      { s: 'other', t: 'いいですね。何時にしますか。', r: 'いい です ね。なんじ に します か。', e: 'Good idea. What time?' },
      { s: 'you', t: '十二時半はどうですか。', r: 'じゅうにじはん わ どう です か。', e: 'How about half twelve?', wrong: [
        ['十二時半にどうですか。', 'じゅうにじはん に どう です か。', 'The time itself is what you are proposing, so it is the topic: wa.'],
        ['十二時半でどうですか。', 'じゅうにじはん で どう です か。', 'de marks a means or a place. A proposed time takes wa.']
      ] },
      { s: 'other', t: 'いいですよ。どこにしましょうか。', r: 'いい です よ。どこ に しましょう か。', e: 'Sounds good. Where shall we go?' },
      { s: 'you', t: '駅前の新しいパスタ屋はどうですか。', r: 'えきまえ の あたらしい パスタや わ どう です か。', e: 'How about the new pasta place by the station?', wrong: [
        ['駅前の新しいパスタ屋はどうでしたか。', 'えきまえ の あたらしい パスタや わ どう でした か。', 'You have not been there — deshita asks about a past experience. Proposing it now is dou desu ka.'],
        ['駅前の新しいパスタ屋がどうですか。', 'えきまえ の あたらしい パスタや が どう です か。', 'The place you are proposing is what you are both discussing, so it is the topic: wa.']
      ] },
      { s: 'other', t: 'あ、そこ辛いものが多くないですか。私、ちょっと苦手で。', r: 'あ、そこ からい もの が おおくない です か。わたし、ちょっと にがて で。', e: "Oh, isn't that place mostly spicy food? I'm not great with spicy." },
      { s: 'you', t: 'あ、そうなんですね。じゃあ、別の店にしましょうか。', r: 'あ、そう なん です ね。じゃあ、べつ の みせ に しましょう か。', e: "Oh, I see. Let's pick somewhere else, then.", wrong: [
        ['あ、そうなんですね。じゃあ、別の店になりましょうか。', 'あ、そう なん です ね。じゃあ、べつ の みせ に なりましょう か。', 'naru is becoming something by itself. Deciding on a restaurant is suru: betsu no mise ni shimashou ka.'],
        ['あ、そうなんですね。じゃあ、別の店がしましょうか。', 'あ、そう なん です ね。じゃあ、べつ の みせ が しましょう か。', 'The thing being decided on takes ni with suru, not ga.']
      ] },
      { s: 'other', t: 'そうですね、駅の反対側にあるうどん屋はどうですか。あそこなら大丈夫です。', r: 'そう です ね、えき の はんたいがわ に ある うどんや わ どう です か。あそこ なら だいじょうぶ です。', e: 'Let me think — how about the udon place on the other side of the station? That one is fine for me.' },
      { s: 'you', t: 'いいですね、それにしましょう。十二時半に駅で。', r: 'いい です ね、それ に しましょう。じゅうにじはん に えき で。', e: "Sounds good, let's go with that. 12:30 at the station.", wrong: [
        ['いいですね、それになりましょう。十二時半に駅で。', 'いい です ね、それ に なりましょう。じゅうにじはん に えき で。', 'naru is becoming by itself; deciding on the restaurant needs suru: sore ni shimashou.'],
        ['いいですね、それにしましょう。十二時半で駅で。', 'いい です ね、それ に しましょう。じゅうにじはん で えき で。', 'A specific clock time as a meeting point takes ni, not de.']
      ] }
    ]
  },
  {
    code: 'social-cancel',
    unit: 'social',
    title: 'Cancelling on a friend',
    situation: 'You are not going to make tonight.',
    turns: [
      { s: 'you', t: 'ねえ、今日のことなんだけど、ちょっと話せる？', r: 'ねえ、きょう の こと なん だけど、ちょっと はなせる？', e: 'Hey, about tonight — got a sec to talk?', wrong: [
        ['ねえ、今日のことなんだけど、ちょっと話せば？', 'ねえ、きょう の こと なん だけど、ちょっと はなせば？', 'hanaseba is advice — "you should talk." You are asking whether THEY are free right now, which is the potential hanaseru?'],
        ['ねえ、今日のことなんだけど、ちょっと話す？', 'ねえ、きょう の こと なん だけど、ちょっと はなす？', 'hanasu just asks if they will speak at all. Asking whether they are free to talk needs the potential form hanaseru.']
      ] },
      { s: 'other', t: 'うん、大丈夫。どうしたの？', r: 'うん、だいじょうぶ。どう した の？', e: "Sure, go ahead. What's up?" },
      { s: 'you', t: 'ごめん、今日はどうしても行けなくなった。', r: 'ごめん、きょう わ どうしても いけなく なった。', e: 'Sorry, I cannot make it today after all.', wrong: [
        ['ごめん、今日はどうしても行きません。', 'ごめん、きょう わ どうしても いきません。', 'That says you are choosing not to go. ikenaku natta says something changed and now you cannot — which is what an apology needs.'],
        ['ごめん、今日はどうしても行けない。', 'ごめん、きょう わ どうしても いけない。', 'Close, but natta carries the change of state: you COULD, and now you cannot.']
      ] },
      { s: 'other', t: 'え、何かあったの？', r: 'え、なに か あった の？', e: 'Huh, did something happen?' },
      { s: 'you', t: 'うん、急に仕事が入っちゃって。', r: 'うん、きゅうに しごと が はいっちゃって。', e: 'Yeah, work suddenly came up.', wrong: [
        ['うん、急に仕事を入っちゃって。', 'うん、きゅうに しごと お はいっちゃって。', 'hairu is intransitive — work coming up by itself takes ga, not o.'],
        ['うん、急に仕事が入れちゃって。', 'うん、きゅうに しごと が いれちゃって。', 'ireru is transitive, for putting something in yourself. Work turning up on its own is hairu.']
      ] },
      { s: 'other', t: '大丈夫だよ。また今度ね。', r: 'だいじょうぶ だ よ。また こんど ね。', e: 'No problem. Another time.' },
      { s: 'you', t: '本当にごめん。埋め合わせするね。', r: 'ほんとうに ごめん。うめあわせ する ね。', e: 'Really sorry. I will make it up to you.', wrong: [
        ['本当にごめん。埋め合わせします。', 'ほんとうに うめあわせ します。', 'Mixing plain gomen with polite shimasu in one breath is jarring — keep one register.'],
        ['本当にごめんなさい。埋め合わせするね。', 'ほんとうに ごめんなさい。うめあわせ する ね。', 'Not wrong, but gomen nasai to a close friend over a cancelled drink is heavier than the situation.']
      ] },
      { s: 'other', t: 'いいっていいって。じゃあ来週はどう？', r: 'いい って いい って。じゃあ らいしゅう わ どう？', e: "It's really fine. So, how about next week?" },
      { s: 'you', t: 'うん、来週なら空いてる。楽しみにしてるね。', r: 'うん、らいしゅう なら あいてる。たのしみ に してる ね。', e: "Yeah, I'm free next week. Looking forward to it.", wrong: [
        ['うん、来週なら空いている。楽しみにしてね。', 'うん、らいしゅう なら あいて いる。たのしみ に して ね。', 'shite ne here tells THEM to look forward to it. You mean YOU are looking forward, which is tanoshimi ni shiteru ne.'],
        ['うん、来週が空いてる。楽しみにしてるね。', 'うん、らいしゅう が あいてる。たのしみ に してる ね。', 'nara marks the condition your friend just raised ("if it is next week"). ga would just name the subject and lose that link.']
      ] }
    ]
  },
  {
    code: 'work-meeting',
    unit: 'work',
    title: 'Joining a meeting late',
    situation: 'You slip into a meeting that has started.',
    turns: [
      { s: 'you', t: '遅れて申し訳ありません。', r: 'おくれて もうしわけ ありません。', e: 'Sorry I am late.', wrong: [
        ['遅れてごめんなさい。', 'おくれて ごめんなさい。', 'gomen nasai is personal. In a meeting the register is moushiwake arimasen.'],
        ['遅れました。', 'おくれました。', 'A statement of fact with no apology in it.']
      ] },
      { s: 'other', t: 'どうぞ、お座りください。', r: 'どうぞ、おすわり ください。', e: 'Please, take a seat.' },
      { s: 'you', t: '失礼します。', r: 'しつれいします。', e: 'Excuse me.', wrong: [
        ['お邪魔します。', 'おじゃまします。', 'ojama shimasu is for entering someone\'s home.'],
        ['いただきます。', 'いただきます。', 'That is for receiving something, usually food.']
      ] },
      { s: 'other', t: '今、資料の三ページ目を見ているところです。', r: 'いま、しりょう の さん ページめ お みて いる ところ です。', e: "We're just looking at page three of the handout." },
      { s: 'you', t: 'あ、はい。資料、いただいてもいいですか。', r: 'あ、はい。しりょう、いただいて も いい です か。', e: 'Oh, right. Could I get a copy of the handout?', wrong: [
        ['あ、はい。資料、くださってもいいですか。', 'あ、はい。しりょう、くださって も いい です か。', 'kudasaru is the honorific for THEM giving something. Asking for permission to receive it yourself is itadaku.'],
        ['あ、はい。資料、あげてもいいですか。', 'あ、はい。しりょう、あげて も いい です か。', 'ageru is giving something away. You are asking to receive a copy, which is itadaku.']
      ] },
      { s: 'other', t: 'はい、どうぞ。要点だけ言うと、来月の予算の話です。', r: 'はい、どうぞ。ようてん だけ いう と、らいげつ の よさん の はなし です。', e: "Here you go. In short, it's about next month's budget." },
      { s: 'you', t: 'わかりました。この件、もう決まったんですか。', r: 'わかりました。この けん、もう きまった ん です か。', e: 'I see. Has this already been decided?', wrong: [
        ['わかりました。この件、もう決めたんですか。', 'わかりました。この けん、もう きめた ん です か。', 'kimeta asks whether someone deliberately DECIDED it. Asking whether it has already settled by itself is kimatta.'],
        ['わかりました。この件、もう決まっているですか。', 'わかりました。この けん、もう きまって いる です か。', '-teiru needs na before n desu ka: kimatte iru n desu ka.']
      ] },
      { s: 'other', t: 'いえ、まだこれからです。田中さんの意見も聞きたいそうです。', r: 'いえ、まだ これから です。たなか さん の いけん も ききたい そう です。', e: 'No, not yet. Apparently they want to hear your take too.' },
      { s: 'you', t: 'そうですか、わかりました。ありがとうございます。', r: 'そう です か、わかりました。ありがとう ございます。', e: 'I see, understood. Thank you.', wrong: [
        ['そうですか、わかりません。ありがとうございます。', 'そう です か、わかりません。ありがとう ございます。', 'wakarimasen says you do NOT understand — the opposite of what you mean here.'],
        ['そうですか、わかりました。ありがとうございました。', 'そう です か、わかりました。ありがとう ございました。', 'The meeting is still going — gozaimashita closes out something already finished.']
      ] }
    ]
  },
  {
    code: 'school-absent',
    unit: 'school',
    title: 'Explaining an absence',
    situation: 'You missed yesterday\'s class.',
    turns: [
      { s: 'you', t: '昨日は休んですみませんでした。', r: 'きのう わ やすんで すみません でした。', e: 'Sorry I was away yesterday.', wrong: [
        ['昨日は休みですみませんでした。', 'きのう わ やすみ で すみません でした。', 'yasumi is the noun. Joining a reason to what follows needs the te-form: yasunde.'],
        ['昨日は休んですみません。', 'きのう わ やすんで すみません。', 'The absence is over, so the apology takes the past: sumimasen deshita.']
      ] },
      { s: 'other', t: '大丈夫ですか。体調は。', r: 'だいじょうぶ です か。たいちょう わ。', e: 'Are you all right? How are you feeling?' },
      { s: 'you', t: 'もうよくなりました。ありがとうございます。', r: 'もう よく なりました。ありがとうございます。', e: 'Much better now, thank you.', wrong: [
        ['もういいなりました。', 'もう いい なりました。', 'ii is irregular: as an adverb before naru it becomes yoku — yoku narimashita.'],
        ['もうよくなっています。', 'もう よく なって います。', 'Not wrong, but narimashita reports the change as complete, which is what "better now" means.']
      ] },
      { s: 'other', t: 'それならよかったです。昨日は宿題を出したんですが、聞いていますか。', r: 'それなら よかった です。きのう わ しゅくだい お だした ん です が、きいて います か。', e: 'Glad to hear it. I gave out homework yesterday — did you hear about it?' },
      { s: 'you', t: 'いいえ、まだ聞いていません。何番ですか。', r: 'いいえ、まだ きいて いません。なんばん です か。', e: "No, I haven't heard yet. Which numbers?", wrong: [
        ['いいえ、まだ聞きません。何番ですか。', 'いいえ、まだ ききません。なんばん です か。', 'kikimasen is a flat future refusal to listen. Reporting you have not YET heard needs the -te iru form: kiite imasen.'],
        ['いいえ、まだ聞こえません。何番ですか。', 'いいえ、まだ きこえません。なんばん です か。', 'kikoemasen is about sound not reaching your ears. Not having been informed is kiite imasen.']
      ] },
      { s: 'other', t: '教科書の問題五番と六番です。', r: 'きょうかしょ の もんだい ごばん と ろくばん です。', e: 'Textbook questions five and six.' },
      { s: 'you', t: 'わかりました。プリントもありますか。', r: 'わかりました。プリント も あります か。', e: 'Understood. Is there a handout too?', wrong: [
        ['わかりました。プリントもいますか。', 'わかりました。プリント も います か。', 'iru is for animate things — a handout takes aru.'],
        ['わかりました。プリントもおりますか。', 'わかりました。プリント も おります か。', 'oru is the humble form a PERSON uses for their own presence. An object takes aru.']
      ] },
      { s: 'other', t: 'ありますよ。あと、放課後に少し復習を手伝いましょうか。', r: 'あります よ。あと、ほうかご に すこし ふくしゅう お てつだいましょう か。', e: 'There is. Also, shall I help you review a bit after school?' },
      { s: 'you', t: 'あ、大丈夫です。自分でやってみます。', r: 'あ、だいじょうぶ です。じぶん で やって みます。', e: "Oh, that's all right. I'll try it myself.", wrong: [
        ['あ、いいですね。自分でやってみます。', 'あ、いい です ね。じぶん で やって みます。', 'ii desu ne enthusiastically agrees — it does not fit turning the offer down.'],
        ['あ、大丈夫ですね。自分でやってみます。', 'あ、だいじょうぶ です ね。じぶん で やって みます。', 'ne asks the listener to agree about something you both already know. Declining an offer is just plain daijoubu desu.']
      ] },
      { s: 'other', t: 'わかりました。何かわからないことがあったら、いつでも聞いてくださいね。', r: 'わかりました。なに か わからない こと が あったら、いつでも きいて ください ね。', e: 'Understood. If anything is unclear, feel free to ask any time.' }
    ]
  }
]
