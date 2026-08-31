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
      ] },
      { s: 'other', t: 'すみません、Mは切らしておりまして。Lでしたらございます。', r: 'すみません、エム わ きらして おりまして。エル でしたら ございます。', e: "Sorry, we're out of mediums right now. We do have a large, though." },
      { s: 'you', t: 'それじゃ、Lを試着してもいいですか。', r: 'それじゃ、エル お しちゃく して も いい です か。', e: 'In that case, can I try the large on?', wrong: [
        ['それじゃ、Lに試着してもいいですか。', 'それじゃ、エル に しちゃく して も いい です か。', 'shichaku suru takes a direct object — the thing you try on is marked with o, not ni.'],
        ['それじゃ、Lを試着したいですか。', 'それじゃ、エル お しちゃく したい です か。', 'tai desu ka asks about someone else\'s desire. Asking permission for yourself is te mo ii desu ka.'],
        ['それじゃ、Lを試着しませんか。', 'それじゃ、エル お しちゃく しません か。', 'masen ka invites the other person to try it on together with you — you want permission to try it yourself, not a joint invitation.']
      ] },
      { s: 'other', t: 'もちろんです。試着室はあちらです。', r: 'もちろん です。しちゃくしつ わ あちら です。', e: 'Of course. The fitting room is over there.' },
      { s: 'you', t: 'ちょうどいいサイズでした。これをください。', r: 'ちょうど いい サイズ でした。これ お ください。', e: "This fits perfectly. I'll take this one.", wrong: [
        ['ちょうどいいサイズでした。これはください。', 'ちょうど いい サイズ でした。これ わ ください。', 'kudasai asks for a specific object to be handed over — the thing wanted takes o, not wa.'],
        ['ちょうどいいサイズです。これを買いませんか。', 'ちょうど いい サイズ です。これ お かいません か。', 'kaimasen ka invites someone else to buy it along with you. Telling the clerk you will take it just needs kudasai.'],
        ['ちょうどいいサイズでした。これで買いたいです。', 'ちょうど いい サイズ でした。これ で かいたい です。', 'de marks a means or a location — the thing purchased needs o, and the actual request is kudasai, not a statement of your own want.']
      ] },
      { s: 'other', t: 'かしこまりました。三千円になります。', r: 'かしこまりました。さんぜんえん に なります。', e: "Certainly. That'll be three thousand yen." },
      { s: 'you', t: '袋をいただけますか。', r: 'ふくろ お いただけます か。', e: 'Could I get a bag?', wrong: [
        ['袋にいただけますか。', 'ふくろ に いただけます か。', 'ni would mark the bag as a recipient or destination; the thing being requested takes o.'],
        ['袋がいただけますか。', 'ふくろ が いただけます か。', 'ga would mark the bag as the subject of an action; here it is the object of the request, so o.'],
        ['袋をいただきたいですか。', 'ふくろ お いただきたい です か。', 'tai desu ka asks about someone else\'s desire. A polite request for yourself uses the potential form, itadakemasu ka.']
      ] },
      { s: 'other', t: 'はい、こちらにお入れします。', r: 'はい、こちら に おいれ します。', e: "Sure, I'll put it in for you." },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['ありがとうございました。', 'ありがとうございました。', 'The past tense treats the exchange as already over, but the clerk is still bagging the item — the present arigatou gozaimasu fits an interaction still in progress.'],
        ['どうも。', 'どうも。', 'Too casual for a shop transaction the clerk has kept in full keigo throughout.'],
        ['お願いします。', 'おねがいします。', 'onegai shimasu makes a request; you have already gotten what you asked for, so this is where you thank them instead.']
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
      ] },
      { s: 'other', t: '少々お待ちください。確認してまいります。', r: 'しょうしょう おまち ください。かくにん して まいります。', e: "One moment please, I'll go check." },
      { s: 'you', t: 'はい、お待ちしています。', r: 'はい、おまち して います。', e: "Sure, I'll wait.", wrong: [
        ['はい、待ってください。', 'はい、まって ください。', 'kudasai orders the OTHER person to wait — you are the one waiting, so the humble omachi shite imasu fits, not an order back at them.'],
        ['いいです、待ちます。', 'いい です、まちます。', 'ii desu here reads as declining, not agreeing — it leaves the clerk unsure whether you actually want to wait.'],
        ['大丈夫です、待ちません。', 'だいじょうぶ です、まちません。', 'machimasen is negative — it says you will NOT wait, the opposite of what is meant.']
      ] },
      { s: 'other', t: 'すみません、こちらのお色でワンサイズ下は在庫がありませんでした。', r: 'すみません、こちら の おいろ で ワン サイズ した わ ざいこ が ありません でした。', e: "Sorry, we don't have one size down in this colour in stock." },
      { s: 'you', t: 'そうですか。じゃ、違う色でも大丈夫です。', r: 'そう です か。じゃ、ちがう いろ でも だいじょうぶ です。', e: 'I see. A different colour is fine then.', wrong: [
        ['そうですか。じゃ、違う色に大丈夫です。', 'そう です か。じゃ、ちがう いろ に だいじょうぶ です。', 'daijoubu describes a state, not a destination — demo (even/also) is what links it to iro, not ni.'],
        ['そうですか。じゃ、違う色をいいです。', 'そう です か。じゃ、ちがう いろ お いい です。', 'ii desu is an adjective, not a verb that takes an object — o cannot attach here.'],
        ['そうですか。じゃ、違う色は大丈夫です。', 'そう です か。じゃ、ちがう いろ わ だいじょうぶ です。', 'wa would make the colour a sole topic, as if contrasting it against something already named. demo carries the concessive "that works too" meant here.']
      ] },
      { s: 'other', t: 'かしこまりました。青と黒がございますが、どちらがよろしいですか。', r: 'かしこまりました。あお と くろ が ございます が、どちら が よろしい です か。', e: 'Certainly. We have blue and black — which would you prefer?' },
      { s: 'you', t: '黒でお願いします。', r: 'くろ で おねがいします。', e: 'Black, please.', wrong: [
        ['黒をお願いします。', 'くろ お おねがいします。', 'Choosing between options just offered takes de, marking the one selected out of the set — o would treat kuro as a direct object being acted on.'],
        ['黒がお願いします。', 'くろ が おねがいします。', 'ga marks a subject performing an action; onegai shimasu is your own request, not something kuro is doing.'],
        ['黒にお願いします。', 'くろ に おねがいします。', 'ni would name kuro as a target or destination; choosing among options uses de.']
      ] },
      { s: 'other', t: 'こちらです。もう一度試着なさいますか。', r: 'こちら です。もう いちど しちゃく なさいます か。', e: 'Here you go. Would you like to try it on again?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、しましょう。', 'はい、しましょう。', 'mashou proposes doing something together, as if the clerk were putting the jacket on too — accepting an offer just needs onegai shimasu.'],
        ['はい、したいです。', 'はい、したい です。', 'tai desu states your own desire, but the clerk already made the offer — accepting it directly is onegai shimasu.'],
        ['いいです。', 'いい です。', 'ii desu is ambiguous between accepting and declining — the clerk cannot tell which you mean.']
      ] },
      { s: 'other', t: 'こちらでございます。ぴったりだといいですね。', r: 'こちら で ございます。ぴったり だ と いい です ね。', e: 'Here you are. Hope it fits well!' }
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
      ] },
      { s: 'other', t: '航空便だと三日くらいで届きます。船便は一ヶ月かかりますが。', r: 'こうくうびん だ と みっか くらい で とどきます。ふなびん わ いっかげつ かかります が。', e: "By air it'll arrive in about three days. Surface takes about a month." },
      { s: 'you', t: 'それなら航空便のほうがいいです。', r: 'それなら こうくうびん の ほう が いい です。', e: 'In that case, air is better.', wrong: [
        ['それなら航空便の方はいいです。', 'それなら こうくうびん の ほう わ いい です。', 'The comparison pattern is fixed as "no hou ga ii" — swapping in wa breaks the construction that means the ~ option is better.'],
        ['それなら航空便でいいです。', 'それなら こうくうびん で いい です。', 'de ii desu means "air will do," a weaker claim than actually preferring it — the comparison needs no hou ga.'],
        ['それなら航空便のほうが好きです。', 'それなら こうくうびん の ほう が すき です。', 'suki desu states a general liking, not a comparative judgement about which option suits this delivery better.']
      ] },
      { s: 'other', t: '箱の中身は何ですか。', r: 'はこ の なかみ わ なん です か。', e: "What's inside the box?" },
      { s: 'you', t: '服と本が入っています。', r: 'ふく と ほん が はいって います。', e: 'Clothes and books.', wrong: [
        ['服と本を入っています。', 'ふく と ほん お はいって います。', 'hairu is intransitive — what is inside takes ga, never o.'],
        ['服と本に入っています。', 'ふく と ほん に はいって います。', 'ni would mark the box as where the contents are going, but you are stating what already IS inside — ga marks the thing that exists there.'],
        ['服と本で入っています。', 'ふく と ほん で はいって います。', 'de marks the means or place of an action; hairu describes a state of being contained, which takes ga.']
      ] },
      { s: 'other', t: '重さを量りますので、少々お待ちください。', r: 'おもさ お はかります ので、しょうしょう おまち ください。', e: "I'll weigh it, so one moment please." },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Sure, go ahead.', wrong: [
        ['はい、待ちます。', 'はい、まちます。', 'Announcing that you personally will wait misses the point — onegai shimasu hands the action back to them.'],
        ['はい、いいです。', 'はい、いい です。', 'ii desu can just as easily read as declining, leaving the clerk unsure whether to go ahead.'],
        ['はい、量ってください。', 'はい、はかって ください。', 'kudasai is a direct order — fine in some contexts, but onegai shimasu is the softer reply to a clerk already offering to help.']
      ] },
      { s: 'other', t: '二キロで、五千円になります。', r: 'に キロ で、ごせんえん に なります。', e: "It's two kilograms — that'll be five thousand yen." },
      { s: 'you', t: '分かりました。カードで払えますか。', r: 'わかりました。カード で はらえます か。', e: 'Got it. Can I pay by card?', wrong: [
        ['分かりました。カードに払えますか。', 'わかりました。カード に はらえます か。', 'ni would mark the card as a target or recipient; the method of payment takes de.'],
        ['分かりました。カードを払えますか。', 'わかりました。カード お はらえます か。', 'harau takes the amount owed as its object, not the method of payment — o cannot attach to kaado here.'],
        ['分かりました。カードで払いませんか。', 'わかりました。カード で はらいません か。', 'masen ka invites someone else to pay along with you. Asking whether YOU are able to pay is the potential form, haraemasu ka.']
      ] },
      { s: 'other', t: 'はい、大丈夫です。こちらにどうぞ。', r: 'はい、だいじょうぶ です。こちら に どうぞ。', e: 'Yes, that works. This way, please.' }
    ]
  },
  {
    code: 'services-haircut',
    unit: 'services',
    title: 'At the hairdresser',
    situation: 'You sit down and they ask what you want.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。', r: 'いらっしゃいませ。', e: 'Welcome in!' },
      { s: 'you', t: 'カットをお願いします。', r: 'カット お おねがいします。', e: 'A haircut, please.', wrong: [
        ['カットにお願いします。', 'カット に おねがいします。', 'ni would mark katto as a destination or recipient; the service being requested takes o.'],
        ['カットでお願いします。', 'カット で おねがいします。', 'de would mark katto as a means; here it is the thing itself being requested, so o.'],
        ['カットしたいですか。', 'カット したい です か。', 'tai desu ka asks about someone else\'s desire. Stating your own request just needs onegai shimasu.']
      ] },
      { s: 'other', t: '今日はどうしますか。', r: 'きょう わ どう します か。', e: 'What are we doing today?' },
      { s: 'you', t: '少し短くしてください。', r: 'すこし みじかく して ください。', e: 'A little shorter, please.', wrong: [
        ['少し短いしてください。', 'すこし みじかい して ください。', 'To make something an adverb, an i-adjective drops i and takes ku: mijikaku.'],
        ['少し短くしましょう。', 'すこし みじかく しましょう。', 'mashou proposes doing it together, as if you were both holding the scissors.']
      ] },
      { s: 'other', t: 'どのくらい短くしますか。五センチくらいでいいですか。', r: 'どの くらい みじかく します か。ご センチ くらい で いい です か。', e: 'How much shorter? Is around five centimetres okay?' },
      { s: 'you', t: 'はい、五センチで大丈夫です。', r: 'はい、ご センチ で だいじょうぶ です。', e: 'Yes, five centimetres is fine.', wrong: [
        ['はい、五センチを大丈夫です。', 'はい、ご センチ お だいじょうぶ です。', 'daijoubu is an adjective, not a verb that takes an object — the measurement takes de, not o.'],
        ['はい、五センチに大丈夫です。', 'はい、ご センチ に だいじょうぶ です。', 'ni would treat the length as a destination; a measurement used this way takes de.'],
        ['はい、五本で大丈夫です。', 'はい、ごほん で だいじょうぶ です。', 'hon counts long thin objects like bottles or pencils — a length is counted with senchi, not hon.']
      ] },
      { s: 'other', t: '前髪はどうしますか。', r: 'まえがみ わ どう します か。', e: 'And the fringe?' },
      { s: 'you', t: 'そのままでお願いします。', r: 'そのまま で おねがいします。', e: 'Leave it as it is, please.', wrong: [
        ['そのままをお願いします。', 'そのまま お おねがいします。', 'sonomama is a state, not an object — it takes de, the particle of manner.'],
        ['いいです。', 'いい です。', 'ii desu is genuinely ambiguous: it can mean "that is fine" or "no thank you", and a hairdresser will have to ask again.']
      ] },
      { s: 'other', t: 'カラーもいかがですか。', r: 'カラー も いかが です か。', e: 'Would you like some colour too?' },
      { s: 'you', t: '今日はいいです、カットだけで。', r: 'きょう わ いい です、カット だけ で。', e: 'No thanks today, just the cut.', wrong: [
        ['今日はお願いします、カットだけで。', 'きょう わ おねがいします、カット だけ で。', 'onegai shimasu accepts the offer — the opposite of the polite decline meant here.'],
        ['今日はしたいです、カットだけで。', 'きょう わ したい です、カット だけ で。', 'tai desu states a want — saying you want it contradicts turning the colour down.'],
        ['今日は大丈夫じゃないです、カットだけで。', 'きょう わ だいじょうぶ じゃ ない です、カット だけ で。', 'daijoubu ja nai flatly denies that something is fine or safe. Declining an offer just uses ii desu, not a negated daijoubu.']
      ] },
      { s: 'other', t: 'かしこまりました。シャンプーからいたしますね。', r: 'かしこまりました。シャンプー から いたします ね。', e: "Understood. I'll start with a shampoo." },
      { s: 'you', t: 'お願いします。', r: 'おねがいします。', e: 'Please do.', wrong: [
        ['いいです。', 'いい です。', 'ii desu reads as ambiguous here too — it could mean "that\'s fine" or "no need," leaving the stylist unsure whether to proceed.'],
        ['します。', 'します。', 'Announcing that YOU will do the shampooing takes over their job — onegai shimasu hands the action to them.'],
        ['お願いしましょう。', 'おねがい しましょう。', 'mashou proposes doing it together; accepting their offer just needs onegai shimasu.']
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
      ] },
      { s: 'other', t: 'パスポートを見せていただけますか。', r: 'パスポート お みせて いただけます か。', e: 'Could I see your passport?' },
      { s: 'you', t: 'はい、どうぞ。', r: 'はい、どうぞ。', e: 'Sure, here you go.', wrong: [
        ['はい、見せます。', 'はい、みせます。', 'Announcing you will show it just restates their request back at them — doozo is what actually accompanies handing it over.'],
        ['はい、いいです。', 'はい、いい です。', 'ii desu here reads as ambiguous — it could sound like a refusal rather than handing the passport over.'],
        ['はい、見せてください。', 'はい、みせて ください。', 'kudasai would be asking THEM to show something to YOU — the reverse of what is happening.']
      ] },
      { s: 'other', t: '禁煙室と喫煙室、どちらがよろしいですか。', r: 'きんえんしつ と きつえんしつ、どちら が よろしい です か。', e: 'Non-smoking or smoking room?' },
      { s: 'you', t: '禁煙室でお願いします。', r: 'きんえんしつ で おねがいします。', e: 'Non-smoking, please.', wrong: [
        ['禁煙室をお願いします。', 'きんえんしつ お おねがいします。', 'Choosing between two named options uses de, marking the one selected out of the set just offered — o would treat it like a plain object.'],
        ['禁煙室にお願いします。', 'きんえんしつ に おねがいします。', 'ni would treat the room as a destination; picking an option from a choice takes de.'],
        ['禁煙室がお願いします。', 'きんえんしつ が おねがいします。', 'ga marks a subject performing an action — onegai shimasu is your own request, not the room\'s.']
      ] },
      { s: 'other', t: '申し訳ございません、禁煙室は満室です。少々お待ちください、確認いたします。', r: 'もうしわけ ございません、きんえんしつ わ まんしつ です。しょうしょう おまち ください、かくにん いたします。', e: "I'm very sorry, non-smoking is fully booked. One moment, let me check." },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Sure, please do.', wrong: [
        ['はい、確認します。', 'はい、かくにん します。', 'Saying YOU will check takes over the job that is theirs to do — onegai shimasu leaves the action with them.'],
        ['はい、大丈夫じゃないです。', 'はい、だいじょうぶ じゃ ない です。', 'Negating daijoubu says something is NOT fine — the opposite of agreeing to wait.'],
        ['はい、待ちません。', 'はい、まちません。', 'machimasen is negative — it says you will NOT wait, which contradicts agreeing to the delay.']
      ] },
      { s: 'other', t: 'お待たせいたしました。禁煙のツインルームがご用意できます。', r: 'おまたせ いたしました。きんえん の ツイン ルーム が ごようい できます。', e: 'Thank you for waiting. We can offer a non-smoking twin room.' },
      { s: 'you', t: 'それで大丈夫です。ありがとうございます。', r: 'それ で だいじょうぶ です。ありがとうございます。', e: 'That works, thank you.', wrong: [
        ['それを大丈夫です。', 'それ お だいじょうぶ です。', 'daijoubu is an adjective and cannot take a direct object — accepting an option this way needs de.'],
        ['それに大丈夫です。', 'それ に だいじょうぶ です。', 'ni would mark sore as a destination; accepting it as sufficient uses de.'],
        ['それはいいです。', 'それ わ いい です。', 'ii desu is ambiguous between accepting and declining — the desk clerk cannot tell which you mean.']
      ] },
      { s: 'other', t: '朝食は七時からです。エレベーターはあちらです。', r: 'ちょうしょく わ しちじ から です。エレベーター わ あちら です。', e: "Breakfast is from seven. The elevator's over there." },
      { s: 'you', t: '分かりました。ありがとうございます。', r: 'わかりました。ありがとうございます。', e: 'Got it, thank you.', wrong: [
        ['分かりましたので、ありがとうございます。', 'わかりました ので、ありがとうございます。', 'node needs a reason clause to attach to — wakarimashita alone is already a complete sentence, not a reason for what follows.'],
        ['分かります。ありがとうございます。', 'わかります。ありがとうございます。', 'wakarimasu states a general ability to understand; confirming you just understood this specific instruction needs the past form wakarimashita.'],
        ['了解です。ありがとうございます。', 'りょうかい です。ありがとうございます。', 'ryoukai desu is a casual, workplace-style acknowledgment — too informal for a hotel receptionist using keigo.']
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
      { s: 'other', t: '東京駅まで、大体三十分くらいですね。', r: 'とうきょうえき まで、だいたい さんじゅっぷん くらい です ね。', e: 'To Tokyo Station — about thirty minutes.' },
      { s: 'you', t: 'そうですか。渋滞はありますか。', r: 'そう です か。じゅうたい わ あります か。', e: 'I see. Is there traffic?', wrong: [
        ['そうですか。渋滞をありますか。', 'そう です か。じゅうたい お あります か。', 'aru is intransitive — what exists takes wa or ga, never o.'],
        ['そうですか。渋滞にありますか。', 'そう です か。じゅうたい に あります か。', 'ni would mark traffic as a location something exists IN, not as the thing whose existence you are asking about.'],
        ['そうですか。渋滞ですか。', 'そう です か。じゅうたい です か。', 'Dropping wa and tacking desu ka straight onto jutai sounds like naming a label, not asking whether traffic exists.']
      ] },
      { s: 'other', t: '高速を使いますか。', r: 'こうそく お つかいます か。', e: 'Shall I take the expressway?' },
      { s: 'you', t: 'はい、お願いします。急いでいますので。', r: 'はい、おねがいします。いそいで います ので。', e: 'Yes please, I am in a hurry.', wrong: [
        ['はい、お願いします。急ぎますので。', 'はい、おねがいします。いそぎます ので。', 'isogimasu says you will start hurrying. Being in a hurry now is a state: isoide imasu.'],
        ['はい、お願いします。急いでください。', 'はい、おねがいします。いそいで ください。', 'That orders the driver to hurry, which is not the same as explaining why.']
      ] },
      { s: 'other', t: 'すみません、事故で高速が渋滞しているみたいです。一般道の方が早いかもしれません。', r: 'すみません、じこ で こうそく が じゅうたい して いる みたい です。いっぱんどう の ほう が はやい かも しれません。', e: "Sorry, there's an accident and the expressway looks jammed. The regular road might be faster." },
      { s: 'you', t: 'それなら一般道でお願いします。', r: 'それなら いっぱんどう で おねがいします。', e: 'In that case, the regular road, please.', wrong: [
        ['それなら一般道をお願いします。', 'それなら いっぱんどう お おねがいします。', 'Choosing between two named routes takes de, marking the one you are going with — o would make the road itself a direct object being requested like an item.'],
        ['それなら一般道にお願いします。', 'それなら いっぱんどう に おねがいします。', 'ni would name the road as a destination; picking it as your choice between options takes de.'],
        ['それなら一般道を使いませんか。', 'それなら いっぱんどう お つかいません か。', 'masen ka invites the driver to use the road together with you as an equal choice — but this is your instruction to them, so onegai shimasu.']
      ] },
      { s: 'other', t: '分かりました。あと二十分くらいで着きます。', r: 'わかりました。あと にじゅっぷん くらい で つきます。', e: "Got it. We'll get there in about twenty more minutes." },
      { s: 'you', t: 'あそこの信号を過ぎたら、駅の入り口が右手に見えますよね。', r: 'あそこ の しんごう お すぎたら、えき の いりぐち が みぎて に みえます よ ね。', e: 'After that light up ahead, the station entrance is on the right, isn\'t it?', wrong: [
        ['あそこの信号に過ぎたら、駅の入り口が右手に見えますよね。', 'あそこ の しんごう に すぎたら、えき の いりぐち が みぎて に みえます よ ね。', 'sugiru describes passing a point, which takes o, not ni — ni would mark the light as a destination you stop at.'],
        ['あそこの信号を過ぎたら、駅の入り口を右手に見えますよね。', 'あそこ の しんごう お すぎたら、えき の いりぐち お みぎて に みえます よ ね。', 'mieru is intransitive — what comes into view takes ga, never o.'],
        ['あそこの信号で過ぎたら、駅の入り口が右手に見えますよね。', 'あそこ の しんごう で すぎたら、えき の いりぐち が みぎて に みえます よ ね。', 'de marks where an action happens, not a point being passed through — sugiru needs o for the thing passed.']
      ] },
      { s: 'other', t: 'そうですね、その通りです。着きました。二千円になります。', r: 'そう です ね、その とおり です。つきました。にせんえん に なります。', e: "That's right, exactly. Here we are. That'll be two thousand yen." },
      { s: 'you', t: 'カードで払えますか。', r: 'カード で はらえます か。', e: 'Can I pay by card?', wrong: [
        ['カードに払えますか。', 'カード に はらえます か。', 'ni would mark the card as a recipient or target; the means of payment takes de.'],
        ['カードを払えますか。', 'カード お はらえます か。', 'harau takes the amount owed as its object; the payment method cannot be marked with o.'],
        ['カードで払いますか。', 'カード で はらいます か。', 'haraimasu ka asks whether the DRIVER will pay — dropping the potential -emasu changes whose ability is being asked about.']
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
      { s: 'you', t: '分かりました。ここから歩いてどれくらいかかりますか。', r: 'わかりました。ここ から あるいて どれくらい かかります か。', e: 'Got it. How long does it take on foot from here?', wrong: [
        ['分かりました。ここまで歩いてどれくらいかかりますか。', 'わかりました。ここ まで あるいて どれくらい かかります か。', 'made marks a destination point; the starting point of your walk needs kara, not made.'],
        ['分かりました。ここで歩いてどれくらいかかりますか。', 'わかりました。ここ で あるいて どれくらい かかります か。', 'de marks where an action takes place, not a starting point — walking FROM here needs kara.'],
        ['分かりました。ここから歩いて何分ですか。', 'わかりました。ここ から あるいて なんぷん です か。', 'Not wrong exactly, but nanpun desu ka asks for an exact figure; dorekurai kakarimasu ka is the natural way to ask for a rough estimate.']
      ] },
      { s: 'other', t: '十分くらいですね。二つ目の信号も右に曲がってください。', r: 'じゅっぷん くらい です ね。ふたつめ の しんごう も みぎ に まがって ください。', e: 'About ten minutes. Turn right at the second light too.' },
      { s: 'you', t: '二つ目の信号を右ですね。そのあとは真っ直ぐですか。', r: 'ふたつめ の しんごう お みぎ です ね。そのあと わ まっすぐ です か。', e: 'Right at the second light, got it. Straight after that?', wrong: [
        ['二つ目の信号に右ですね。そのあとは真っ直ぐですか。', 'ふたつめ の しんごう に みぎ です ね。そのあと わ まっすぐ です か。', 'The light is the point where you turn, which pairs with o (magaru o) — ni would mark it as a destination you are heading toward instead.'],
        ['二つ目の信号で右ですね。そのあとは真っ直ぐですか。', 'ふたつめ の しんごう で みぎ です ね。そのあと わ まっすぐ です か。', 'de marks the general location of an action; the specific point you turn AT takes o, matching magaru o.'],
        ['二つ目の信号を右ですね。そのあとを真っ直ぐですか。', 'ふたつめ の しんごう お みぎ です ね。そのあと お まっすぐ です か。', 'There is no verb here for o to attach to — asking whether something IS straight ahead needs wa, marking sonoato as the topic.']
      ] },
      { s: 'other', t: 'はい、突き当たりまで真っ直ぐ行くと、郵便局が右手に見えます。', r: 'はい、つきあたり まで まっすぐ いく と、ゆうびんきょく が みぎて に みえます。', e: 'Yes, go straight to the end of the road, and the post office will come into view on your right.' },
      { s: 'you', t: '右ですね。ありがとうございます。', r: 'みぎ です ね。ありがとうございます。', e: 'Right, got it. Thank you.', wrong: [
        ['右ですよ。ありがとうございます。', 'みぎ です よ。ありがとうございます。', 'yo tells them something they did not know — but they just told you. ne confirms.'],
        ['右ですか。ありがとうございます。', 'みぎ です か。ありがとうございます。', 'Not wrong, but ka asks again as though you had not heard. ne shows you followed.']
      ] },
      { s: 'other', t: 'いえいえ、迷ったらまた聞いてくださいね。', r: 'いえいえ、まよったら また きいて ください ね。', e: 'No worries, ask again if you get lost.' },
      { s: 'you', t: 'はい、そうします。もう一つ聞いてもいいですか。近くにコンビニはありますか。', r: 'はい、そう します。もう ひとつ きいて も いい です か。ちかく に コンビニ わ あります か。', e: 'I will. Can I ask one more thing — is there a convenience store nearby?', wrong: [
        ['はい、そうします。もう一つ聞いてもいいですか。近くでコンビニはありますか。', 'はい、そう します。もう ひとつ きいて も いい です か。ちかく で コンビニ わ あります か。', 'de marks where an action happens; stating where something exists (aru) takes ni.'],
        ['はい、そうします。もう一つ聞いてもいいですか。近くをコンビニはありますか。', 'はい、そう します。もう ひとつ きいて も いい です か。ちかく お コンビニ わ あります か。', 'o would need a verb of traversal or action to attach to; simply locating something that exists takes ni.'],
        ['はい、そうします。もう一つ聞きたいですか。近くにコンビニはありますか。', 'はい、そう します。もう ひとつ ききたい です か。ちかく に コンビニ わ あります か。', 'tai desu ka asks about someone else\'s desire to hear something; asking permission to ask is temo ii desu ka.']
      ] },
      { s: 'other', t: 'はい、郵便局の隣にありますよ。', r: 'はい、ゆうびんきょく の となり に あります よ。', e: 'Yes, right next to the post office.' },
      { s: 'you', t: '助かりました。行ってきます。', r: 'たすかりました。いって きます。', e: "That's a big help. I'll get going, thanks.", wrong: [
        ['助かりました。行きます。', 'たすかりました。いきます。', 'ikimasu just states you will go; ittekimasu is the set phrase for heading off with the sense of coming back, which fits leaving a chat on the street.'],
        ['助けました。行ってきます。', 'たすけました。いって きます。', 'tasukemashita says YOU rescued someone; being helped by their directions is the passive-feeling tasukarimashita.'],
        ['助かりました。行ってください。', 'たすかりました。いって ください。', 'ittekudasai orders the other person to go — you are the one leaving, so ittekimasu.']
      ] },
      { s: 'other', t: '気をつけて。', r: 'き お つけて。', e: 'Take care.' }
    ]
  }
]
