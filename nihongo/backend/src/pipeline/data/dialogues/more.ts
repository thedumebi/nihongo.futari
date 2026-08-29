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
      ] }
    ]
  },
  {
    code: 'cafe-order',
    unit: 'services',
    title: 'In a café',
    situation: 'You are ordering coffee to drink in.',
    turns: [
      { s: 'other', t: 'こちらでお召し上がりですか。', r: 'こちら で おめしあがり です か。', e: 'Drinking in?' },
      { s: 'you', t: 'はい、ここで飲みます。', r: 'はい、ここ で のみます。', e: 'Yes, here.', wrong: [
        ['はい、ここに飲みます。', 'はい、ここ に のみます。', 'ni marks a destination or a point. Where an action happens is de.'],
        ['はい、持ち帰ります。', 'はい、もちかえります。', 'That is takeaway — the opposite of what you just agreed to.']
      ] },
      { s: 'other', t: 'サイズはいかがなさいますか。', r: 'サイズ わ いかが なさいます か。', e: 'What size?' },
      { s: 'you', t: '一番小さいのをお願いします。', r: 'いちばん ちいさい の お おねがいします。', e: 'The smallest, please.', wrong: [
        ['一番小さいをお願いします。', 'いちばん ちいさい お おねがいします。', 'chiisai is an adjective and cannot stand alone as a thing. no turns it into "the small one".'],
        ['もっと小さいのをお願いします。', 'もっと ちいさい の お おねがいします。', 'motto compares against something already offered. Nothing has been offered yet.']
      ] }
    ]
  },
  {
    code: 'services-drycleaner',
    unit: 'services',
    title: 'At the dry cleaner',
    situation: 'You are dropping off a coat.',
    turns: [
      { s: 'you', t: 'これ、お願いできますか。', r: 'これ、おねがい できます か。', e: 'Could you do this one?', wrong: [
        ['これ、してください。', 'これ、して ください。', 'Grammatical but abrupt over a counter — and vague about what you want done.'],
        ['これ、お願いします。', 'これ、おねがいします。', 'Fine in a shop, but dekimasu ka acknowledges they might not take it, which is politer at a cleaner.']
      ] },
      { s: 'other', t: 'かしこまりました。金曜日にできます。', r: 'かしこまりました。きんようび に できます。', e: 'Certainly. It will be ready Friday.' },
      { s: 'you', t: '金曜日の何時からですか。', r: 'きんようび の なんじ から です か。', e: 'From what time on Friday?', wrong: [
        ['金曜日の何時までですか。', 'きんようび の なんじ まで です か。', 'made asks when it stops being available. You want when it starts: kara.'],
        ['金曜日は何時ですか。', 'きんようび わ なんじ です か。', 'That asks what the time is on Friday, which is not a question anyone can answer.']
      ] }
    ]
  },
  {
    code: 'gym-join',
    unit: 'services',
    title: 'At the gym',
    situation: 'You are asking about membership.',
    turns: [
      { s: 'you', t: '見学してもいいですか。', r: 'けんがく して も いい です か。', e: 'May I look around?', wrong: [
        ['見学したいです。', 'けんがく したい です。', 'States a want. Asking permission on someone else\'s premises is te mo ii desu ka.'],
        ['見学しましょうか。', 'けんがく しましょう か。', 'That offers to look round WITH them, as though it were a joint activity.']
      ] },
      { s: 'other', t: 'どうぞ。月会費は八千円です。', r: 'どうぞ。げっかいひ わ はっせん えん です。', e: 'Please do. It is 8,000 yen a month.' },
      { s: 'you', t: '一週間に何回まで来られますか。', r: 'いっしゅうかん に なんかい まで こられます か。', e: 'How many times a week can I come?', wrong: [
        ['何回一週間に来られますか。', 'なんかい いっしゅうかん に こられます か。', 'The period comes first and the count second — isshuukan ni nankai, which is the reverse of English.'],
        ['一週間で何回まで来られますか。', 'いっしゅうかん で なんかい まで こられます か。', 'For a rate — so many times PER week — the particle is ni.']
      ] }
    ]
  },
  {
    code: 'travel-airport',
    unit: 'travel',
    title: 'At the airport',
    situation: 'You are checking in a bag.',
    turns: [
      { s: 'other', t: 'お預けのお荷物はございますか。', r: 'おあずけ の おにもつ わ ございます か。', e: 'Any bags to check?' },
      { s: 'you', t: 'はい、一つあります。', r: 'はい、ひとつ あります。', e: 'Yes, one.', wrong: [
        ['はい、一個います。', 'はい、いっこ います。', 'iru is for animate things; a bag takes aru. And tsu is the counter that answers here.'],
        ['はい、一枚あります。', 'はい、いちまい あります。', 'mai counts flat things. A suitcase takes tsu or ko.']
      ] },
      { s: 'other', t: '通路側と窓側、どちらがよろしいですか。', r: 'つうろがわ と まどがわ、どちら が よろしい です か。', e: 'Aisle or window?' },
      { s: 'you', t: '窓側をお願いします。', r: 'まどがわ お おねがいします。', e: 'Window, please.', wrong: [
        ['窓側がお願いします。', 'まどがわ が おねがいします。', 'ga marks a subject. What you are asking for takes o.'],
        ['窓側でお願いします。', 'まどがわ で おねがいします。', 'de marks a means or a place of action. Choosing between offered options takes o.']
      ] }
    ]
  },
  {
    code: 'travel-bus',
    unit: 'travel',
    title: 'On the bus',
    situation: 'You are not sure this bus goes where you want.',
    turns: [
      { s: 'you', t: 'すみません、このバスは市役所に行きますか。', r: 'すみません、この バス わ しやくしょ に いきます か。', e: 'Does this bus go to the city hall?', wrong: [
        ['すみません、このバスが市役所に行きますか。', 'すみません、この バス が しやくしょ に いきます か。', 'You are asking about this bus as your topic, so wa. ga would be picking it out from several buses you had discussed.'],
        ['すみません、このバスは市役所を行きますか。', 'すみません、この バス わ しやくしょ お いきます か。', 'iku takes ni for a destination. o with a motion verb means travelling THROUGH a place.']
      ] },
      { s: 'other', t: 'いいえ、次のバスですよ。', r: 'いいえ、つぎ の バス です よ。', e: 'No, it is the next one.' },
      { s: 'you', t: 'そうですか。ありがとうございます。', r: 'そう です か。ありがとうございます。', e: 'I see. Thank you.', wrong: [
        ['そうですね。ありがとうございます。', 'そう です ね。ありがとうございます。', 'ne seeks agreement about something you both know. You have just been told something new, which is sou desu ka.'],
        ['そうですよ。ありがとうございます。', 'そう です よ。ありがとうございます。', 'yo tells THEM — it contradicts the person who just informed you.']
      ] }
    ]
  },
  {
    code: 'social-invite',
    unit: 'social',
    title: 'Inviting someone',
    situation: 'You want to ask a colleague to lunch.',
    turns: [
      { s: 'you', t: 'よかったら、一緒に昼ごはんを食べませんか。', r: 'よかったら、いっしょに ひるごはん お たべません か。', e: 'If you like, shall we have lunch together?', wrong: [
        ['よかったら、一緒に昼ごはんを食べましょう。', 'よかったら、いっしょに ひるごはん お たべましょう。', 'mashou assumes agreement — it decides for both of you. An invitation that leaves room to decline is masen ka.'],
        ['よかったら、一緒に昼ごはんを食べたいです。', 'よかったら、いっしょに ひるごはん お たべたい です。', 'That states YOUR wish rather than inviting them.']
      ] },
      { s: 'other', t: 'いいですね。何時にしますか。', r: 'いい です ね。なんじ に します か。', e: 'Good idea. What time?' },
      { s: 'you', t: '十二時半はどうですか。', r: 'じゅうにじはん わ どう です か。', e: 'How about half twelve?', wrong: [
        ['十二時半にどうですか。', 'じゅうにじはん に どう です か。', 'The time itself is what you are proposing, so it is the topic: wa.'],
        ['十二時半でどうですか。', 'じゅうにじはん で どう です か。', 'de marks a means or a place. A proposed time takes wa.']
      ] }
    ]
  },
  {
    code: 'social-cancel',
    unit: 'social',
    title: 'Cancelling on a friend',
    situation: 'You are not going to make tonight.',
    turns: [
      { s: 'you', t: 'ごめん、今日はどうしても行けなくなった。', r: 'ごめん、きょう わ どうしても いけなく なった。', e: 'Sorry, I cannot make it today after all.', wrong: [
        ['ごめん、今日はどうしても行きません。', 'ごめん、きょう わ どうしても いきません。', 'That says you are choosing not to go. ikenaku natta says something changed and now you cannot — which is what an apology needs.'],
        ['ごめん、今日はどうしても行けない。', 'ごめん、きょう わ どうしても いけない。', 'Close, but natta carries the change of state: you COULD, and now you cannot.']
      ] },
      { s: 'other', t: '大丈夫だよ。また今度ね。', r: 'だいじょうぶ だ よ。また こんど ね。', e: 'No problem. Another time.' },
      { s: 'you', t: '本当にごめん。埋め合わせするね。', r: 'ほんとうに ごめん。うめあわせ する ね。', e: 'Really sorry. I will make it up to you.', wrong: [
        ['本当にごめん。埋め合わせします。', 'ほんとうに うめあわせ します。', 'Mixing plain gomen with polite shimasu in one breath is jarring — keep one register.'],
        ['本当にごめんなさい。埋め合わせするね。', 'ほんとうに ごめんなさい。うめあわせ する ね。', 'Not wrong, but gomen nasai to a close friend over a cancelled drink is heavier than the situation.']
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
      ] }
    ]
  }
]
