import type { Dialogue } from './types.js'

/** The ward office, the post office, the barber, the library — errands with counters. */
export const ERRANDS: Dialogue[] = [
  {
    code: 'ward-moving-in',
    unit: 'ward-office',
    title: 'Registering an address',
    situation: 'You have just moved and must register at the ward office.',
    turns: [
      { s: 'other', t: '本日はどのようなご用件ですか。', r: 'ほんじつ わ どのような ごようけん です か。', e: 'What can we do for you today?' },
      { s: 'you', t: '転入届を出しに来ました。', r: 'てんにゅうとどけ お だし に きました。', e: 'I have come to file a moving-in notification.', wrong: [
        ['転入届を出して来ました。', 'てんにゅうとどけ お だして きました。', 'te-kimashita says you already filed it somewhere and came back. Coming in order to do something is the stem plus ni kimashita.'],
        ['転入届を出しに行きました。', 'てんにゅうとどけ お だし に いきました。', 'ikimashita is going away from here. You are here: kimashita.']
      ] },
      { s: 'other', t: '在留カードをお願いします。', r: 'ざいりゅう カード お おねがいします。', e: 'Your residence card, please.' },
      { s: 'you', t: 'はい、どうぞ。', r: 'はい、どうぞ。', e: 'Here you are.', wrong: [
        ['はい、ください。', 'はい、ください。', 'kudasai asks THEM for something. Handing yours over is douzo.'],
        ['はい、いただきます。', 'はい、いただきます。', 'That is receiving, not giving.']
      ] }
    ]
  },
  {
    code: 'ward-insurance',
    unit: 'ward-office',
    title: 'Health insurance',
    situation: 'You are asked whether you want to enrol.',
    turns: [
      { s: 'other', t: '国民健康保険に加入されますか。', r: 'こくみん けんこう ほけん に かにゅう されます か。', e: 'Will you enrol in national health insurance?' },
      { s: 'you', t: 'はい、お願いします。手続きは今日できますか。', r: 'はい、おねがいします。てつづき わ きょう できます か。', e: 'Yes please. Can I do the paperwork today?', wrong: [
        ['はい、お願いします。手続きが今日できますか。', 'はい、おねがいします。てつづき が きょう できます か。', 'You are raising the paperwork as your topic, so wa.'],
        ['はい、お願いします。手続きは今日しますか。', 'はい、おねがいします。てつづき わ きょう します か。', 'That asks whether THEY will do it today. Asking if it is possible is dekimasu ka.']
      ] },
      { s: 'other', t: 'はい、こちらで承ります。', r: 'はい、こちら で うけたまわります。', e: 'Yes, we can handle it here.' }
    ]
  },
  {
    code: 'ward-form-help',
    unit: 'ward-office',
    title: 'Asking for help with a form',
    situation: 'A box on the form makes no sense.',
    turns: [
      { s: 'you', t: 'すみません、ここの書き方がわかりません。', r: 'すみません、ここ の かきかた が わかりません。', e: 'Sorry, I do not know how to fill this in.', wrong: [
        ['すみません、ここの書き方をわかりません。', 'すみません、ここ の かきかた お わかりません。', 'wakaru takes ga, not o — what is understood is the subject.'],
        ['すみません、ここの書き方が知りません。', 'すみません、ここ の かきかた が しりません。', 'shiru takes o, and for not grasping something the verb is wakaru.']
      ] },
      { s: 'other', t: 'こちらは前のご住所です。', r: 'こちら わ まえ の ごじゅうしょ です。', e: 'That is your previous address.' },
      { s: 'you', t: 'なるほど。ありがとうございます。', r: 'なるほど。ありがとうございます。', e: 'I see. Thank you.', wrong: [
        ['なるほどですね。', 'なるほど です ね。', 'naruhodo desu ne is not standard — naruhodo stands alone.'],
        ['そうしましょう。', 'そう しましょう。', 'That proposes a course of action. They explained a fact.']
      ] }
    ]
  },
  {
    code: 'post-send',
    unit: 'services',
    title: 'At the post office',
    situation: 'You are sending a parcel abroad.',
    turns: [
      { s: 'you', t: 'これをイギリスまで送りたいのですが。', r: 'これ お イギリス まで おくりたい の です が。', e: 'I would like to send this to the UK.', wrong: [
        ['これをイギリスで送りたいのですが。', 'これ お イギリス で おくりたい の です が。', 'de is where the sending happens — that says you post it while in the UK.'],
        ['これがイギリスまで送りたいのですが。', 'これ が イギリス まで おくりたい の です が。', 'What you send takes o.']
      ] },
      { s: 'other', t: '船便と航空便、どちらになさいますか。', r: 'ふなびん と こうくうびん、どちら に なさいます か。', e: 'Surface or air?' },
      { s: 'you', t: '航空便でお願いします。', r: 'こうくうびん で おねがいします。', e: 'Air, please.', wrong: [
        ['航空便をお願いします。', 'こうくうびん お おねがいします。', 'Passable, but the method of sending takes de.'],
        ['航空便にお願いします。', 'こうくうびん に おねがいします。', 'ni marks a destination or a choice-target with suru — with onegai the means is de.']
      ] },
      { s: 'other', t: '中身は何でしょうか。', r: 'なかみ わ なん でしょう か。', e: 'What are the contents?' },
      { s: 'you', t: '本と服です。', r: 'ほん と ふく です。', e: 'Books and clothes.', wrong: [
        ['本や服です。', 'ほん や ふく です。', 'ya implies "among other things", which a customs declaration should not. List exhaustively with to.'],
        ['本も服です。', 'ほん も ふく です。', 'mo says the book is ALSO clothes.']
      ] }
    ]
  },
  {
    code: 'barber-cut',
    unit: 'services',
    title: 'At the barber',
    situation: 'You are explaining what you want.',
    turns: [
      { s: 'other', t: '今日はどうしますか。', r: 'きょう わ どう します か。', e: 'What are we doing today?' },
      { s: 'you', t: '全体的に短くしてください。', r: 'ぜんたいてき に みじかく して ください。', e: 'Shorter all over, please.', wrong: [
        ['全体的に短いしてください。', 'ぜんたいてき に みじかい して ください。', 'Before suru an i-adjective becomes an adverb: mijikaku.'],
        ['全体的に短くなってください。', 'ぜんたいてき に みじかく なって ください。', 'naru is to become by itself — that asks the barber to get shorter.']
      ] },
      { s: 'other', t: '横はどのくらい。', r: 'よこ わ どのくらい。', e: 'How much off the sides?' },
      { s: 'you', t: '耳が見えるくらいでお願いします。', r: 'みみ が みえる くらい で おねがいします。', e: 'Enough to see my ears.', wrong: [
        ['耳を見えるくらいでお願いします。', 'みみ お みえる くらい で おねがいします。', 'mieru is something being visible, so it takes ga. o would need miru.'],
        ['耳が見るくらいでお願いします。', 'みみ が みる くらい で おねがいします。', 'miru is to look AT something. Ears being visible is mieru.']
      ] }
    ]
  },
  {
    code: 'library-card',
    unit: 'services',
    title: 'At the library',
    situation: 'You want to borrow books.',
    turns: [
      { s: 'you', t: '本を借りたいのですが、カードは要りますか。', r: 'ほん お かりたい の です が、カード わ いります か。', e: 'I would like to borrow books. Do I need a card?', wrong: [
        ['本を貸したいのですが、カードは要りますか。', 'ほん お かしたい の です が、カード わ いります か。', 'kasu is to lend. You want to borrow: kariru.'],
        ['本を借りたいのですが、カードが要りますか。', 'ほん お かりたい の です が、カード が いります か。', 'The card is the new topic of the second clause, so wa.']
      ] },
      { s: 'other', t: 'はい。身分証明書があれば作れます。', r: 'はい。みぶん しょうめいしょ が あれば つくれます。', e: 'Yes. We can make one if you have ID.' },
      { s: 'you', t: '何冊まで借りられますか。', r: 'なんさつ まで かりられます か。', e: 'How many can I borrow?', wrong: [
        ['何個まで借りられますか。', 'なんこ まで かりられます か。', 'ko is the general counter; books take satsu.'],
        ['何冊まで借りますか。', 'なんさつ まで かります か。', 'That asks how many you intend to. Asking the limit needs the potential: kariraremasu.']
      ] }
    ]
  },
  {
    code: 'atm-trouble',
    unit: 'services',
    title: 'The cash machine ate your card',
    situation: 'You need help at the ATM.',
    turns: [
      { s: 'you', t: 'すみません、カードが出てこないんです。', r: 'すみません、カード が でて こない ん です。', e: 'Excuse me, my card will not come out.', wrong: [
        ['すみません、カードを出てこないんです。', 'すみません、カード お でて こない ん です。', 'deru is intransitive — the card comes out by itself, so ga.'],
        ['すみません、カードが出さないんです。', 'すみません、カード が ださない ん です。', 'dasu means someone puts it out. The card not emerging is dete konai.']
      ] },
      { s: 'other', t: '少々お待ちください。係の者を呼びます。', r: 'しょうしょう おまち ください。かかり の もの お よびます。', e: 'One moment, I will call someone.' },
      { s: 'you', t: 'お願いします。急いでいるんです。', r: 'おねがいします。いそいで いる ん です。', e: 'Please. I am in a hurry.', wrong: [
        ['お願いします。急ぎます。', 'おねがいします。いそぎます。', 'isogimasu says you will hurry. Being in a hurry right now is isoide iru.'],
        ['お願いします。速いんです。', 'おねがいします。はやい ん です。', 'hayai is fast in speed. Being pressed for time is isoide iru.']
      ] }
    ]
  },
  {
    code: 'phone-shop',
    unit: 'services',
    title: 'At the phone shop',
    situation: 'Your data ran out.',
    turns: [
      { s: 'you', t: 'データが足りないので、プランを変えたいのですが。', r: 'データ が たりない ので、プラン お かえたい の です が。', e: 'I do not have enough data, so I would like to change plan.', wrong: [
        ['データを足りないので、プランを変えたいのですが。', 'データ お たりない ので、プラン お かえたい の です が。', 'tariru is intransitive — what is insufficient takes ga.'],
        ['データが足りないので、プランが変えたいのですが。', 'データ が たりない ので、プラン が かえたい の です が。', 'kaeru takes an object: the plan takes o.']
      ] },
      { s: 'other', t: '今のプランはどちらですか。', r: 'いま の プラン わ どちら です か。', e: 'Which plan are you on now?' },
      { s: 'you', t: '一番安いものです。', r: 'いちばん やすい もの です。', e: 'The cheapest one.', wrong: [
        ['一番安いです。', 'いちばん やすい です。', 'That says "it is cheapest" as a quality. Naming which one needs mono or no.'],
        ['もっと安いものです。', 'もっと やすい もの です。', 'motto compares against something. You are naming an absolute: ichiban.']
      ] }
    ]
  },
  {
    code: 'laundry-coin',
    unit: 'services',
    title: 'At the coin laundry',
    situation: 'You cannot work the machine.',
    turns: [
      { s: 'you', t: 'すみません、使い方を教えてもらえますか。', r: 'すみません、つかいかた お おしえて もらえます か。', e: 'Excuse me, could you show me how it works?', wrong: [
        ['すみません、使い方が教えてもらえますか。', 'すみません、つかいかた が おしえて もらえます か。', 'oshieru takes an object: o.'],
        ['すみません、使い方を教えてあげますか。', 'すみません、つかいかた お おしえて あげます か。', 'te-ageru is you doing THEM a favour. You want to receive one: te-moraeru.']
      ] },
      { s: 'other', t: 'ここにお金を入れて、このボタンを押すだけです。', r: 'ここ に おかね お いれて、この ボタン お おす だけ です。', e: 'Put money in here and press this button, that is all.' },
      { s: 'you', t: '乾燥もできますか。', r: 'かんそう も できます か。', e: 'Can it dry too?', wrong: [
        ['乾燥はできますか。', 'かんそう わ できます か。', 'Understandable, but mo adds drying to the washing you already discussed. wa contrasts it instead.'],
        ['乾燥もしますか。', 'かんそう も します か。', 'That asks whether THEY dry things. Asking about capability is dekimasu ka.']
      ] }
    ]
  },
  {
    code: 'shop-return',
    unit: 'shopping',
    title: 'Returning something',
    situation: 'The size is wrong.',
    turns: [
      { s: 'you', t: 'これ、サイズを交換できますか。', r: 'これ、サイズ お こうかん できます か。', e: 'Can I exchange this for another size?', wrong: [
        ['これ、サイズが交換できますか。', 'これ、サイズ が こうかん できます か。', 'With dekiru either particle appears, but with a transitive noun-suru like koukan the object stays o here.'],
        ['これ、サイズを変えてくださいますか。', 'これ、サイズ お かえて くださいます か。', 'Very polite but it presumes they will. Asking whether it is possible at all is dekimasu ka.']
      ] },
      { s: 'other', t: 'レシートはお持ちですか。', r: 'レシート わ おもち です か。', e: 'Do you have the receipt?' },
      { s: 'you', t: 'はい、こちらです。', r: 'はい、こちら です。', e: 'Yes, here it is.', wrong: [
        ['はい、あちらです。', 'はい、あちら です。', 'achira points at something far from you both. What is in your hand is kochira.'],
        ['はい、そちらです。', 'はい、そちら です。', 'sochira is near THEM. The receipt is with you.']
      ] }
    ]
  },
  {
    code: 'shop-size',
    unit: 'shopping',
    title: 'Trying something on',
    situation: 'You want to try a jacket.',
    turns: [
      { s: 'you', t: 'これ、試着してもいいですか。', r: 'これ、しちゃく して も いい です か。', e: 'May I try this on?', wrong: [
        ['これ、試着しませんか。', 'これ、しちゃく しません か。', 'That invites THEM to try it on.'],
        ['これ、試着したいです。', 'これ、しちゃく したい です。', 'A statement of desire. Asking permission is te mo ii desu ka.']
      ] },
      { s: 'other', t: 'どうぞ。試着室はあちらです。', r: 'どうぞ。しちゃくしつ わ あちら です。', e: 'Please. The fitting room is over there.' },
      { s: 'you', t: 'もう一つ大きいのはありますか。', r: 'もう ひとつ おおきい の わ あります か。', e: 'Do you have this one size bigger?', wrong: [
        ['もう一つ大きいはありますか。', 'もう ひとつ おおきい わ あります か。', 'ookii is an adjective and cannot be the thing itself. no makes it "the bigger one".'],
        ['もう一つ大きいのがいますか。', 'もう ひとつ おおきい の が います か。', 'iru is for animate things; a jacket takes aru.']
      ] }
    ]
  },
  {
    code: 'restaurant-allergy',
    unit: 'restaurant',
    title: 'Mentioning an allergy',
    situation: 'You must avoid eggs.',
    turns: [
      { s: 'you', t: 'すみません、卵アレルギーがあるんです。', r: 'すみません、たまご アレルギー が ある ん です。', e: 'Excuse me, I have an egg allergy.', wrong: [
        ['すみません、卵アレルギーをあるんです。', 'すみません、たまご アレルギー お ある ん です。', 'aru is intransitive: ga.'],
        ['すみません、卵アレルギーがいるんです。', 'すみません、たまご アレルギー が いる ん です。', 'iru is for animate things.']
      ] },
      { s: 'other', t: 'かしこまりました。確認してまいります。', r: 'かしこまりました。かくにん して まいります。', e: 'Certainly, I will check.' },
      { s: 'you', t: 'この料理に卵は入っていますか。', r: 'この りょうり に たまご わ はいって います か。', e: 'Does this dish contain egg?', wrong: [
        ['この料理に卵を入っていますか。', 'この りょうり に たまご お はいって います か。', 'hairu is intransitive — what is inside takes ga or, as here, the topic wa.'],
        ['この料理に卵は入れていますか。', 'この りょうり に たまご わ いれて います か。', 'ireru means someone puts it in. Asking what is in it is haitte imasu ka.']
      ] }
    ]
  },
  {
    code: 'restaurant-split',
    unit: 'restaurant',
    title: 'Splitting the bill',
    situation: 'You are paying with a friend.',
    turns: [
      { s: 'you', t: 'すみません、別々でお願いします。', r: 'すみません、べつべつ で おねがいします。', e: 'Separately, please.', wrong: [
        ['すみません、別々をお願いします。', 'すみません、べつべつ お おねがいします。', 'The manner of paying takes de.'],
        ['すみません、一緒でお願いします。', 'すみません、いっしょ で おねがいします。', 'issho is together — the opposite of what you want.']
      ] },
      { s: 'other', t: '申し訳ありません、お会計は一緒でお願いしております。', r: 'もうしわけ ありません、おかいけい わ いっしょ で おねがい して おります。', e: 'Sorry, we only take one payment.' },
      { s: 'you', t: 'そうですか。では、一緒でいいです。', r: 'そう です か。では、いっしょ で いい です。', e: 'I see. Together is fine, then.', wrong: [
        ['そうですね。では、一緒でいいです。', 'そう です ね。では、いっしょ で いい です。', 'ne seeks agreement about shared knowledge. You have just been told something new: sou desu ka.'],
        ['そうですか。では、別々でいいです。', 'そう です か。では、べつべつ で いい です。', 'They just said separate is not possible.']
      ] }
    ]
  },
  {
    code: 'konbini-copy',
    unit: 'konbini',
    title: 'Using the copier',
    situation: 'You need to print something.',
    turns: [
      { s: 'you', t: 'すみません、コピー機はどこですか。', r: 'すみません、コピーき わ どこ です か。', e: 'Excuse me, where is the copier?', wrong: [
        ['すみません、コピー機がどこですか。', 'すみません、コピーき が どこ です か。', 'The copier is your topic, so wa.'],
        ['すみません、コピー機はどこにいますか。', 'すみません、コピーき わ どこ に います か。', 'iru is for animate things — and doko desu ka is the ordinary way to ask.']
      ] },
      { s: 'other', t: '入り口の横にございます。', r: 'いりぐち の よこ に ございます。', e: 'Beside the entrance.' },
      { s: 'you', t: '両面もできますか。', r: 'りょうめん も できます か。', e: 'Can it do double-sided too?', wrong: [
        ['両面もしますか。', 'りょうめん も します か。', 'That asks whether the shop does it. Asking about capability is dekimasu ka.'],
        ['両面がありますか。', 'りょうめん が あります か。', 'aru asks whether double-sided EXISTS. Whether the machine can do it is dekimasu ka.']
      ] }
    ]
  }
]
