import type { Dialogue } from './types.js'

/** Doctor, dentist, pharmacy — saying where it hurts. */
export const HEALTH: Dialogue[] = [
  {
    code: 'health-dentist-booking',
    unit: 'health',
    title: 'Booking the dentist',
    situation: 'You ring a dental clinic.',
    turns: [
      { s: 'other', t: 'はい、やまだ歯科です。', r: 'はい、やまだ しか です。', e: 'Yamada Dental, hello.' },
      { s: 'you', t: '予約をお願いしたいのですが。', r: 'よやく お おねがい したい の です が。', e: 'I would like to make an appointment.', wrong: [
        ['予約をください。', 'よやく お ください。', 'kudasai asks for an object to be handed over. Booking is a service — onegai shimasu.'],
        ['予約をしたいです。', 'よやく お したい です。', 'Not wrong, but bare -tai desu to a stranger is blunt. The trailing no desu ga softens it into a request.']
      ] },
      { s: 'other', t: '初めてですか。', r: 'はじめて です か。', e: 'Is this your first visit?' },
      { s: 'you', t: 'はい、初めてです。', r: 'はい、はじめて です。', e: 'Yes, first time.', wrong: [
        ['はい、はじめまして。', 'はい、はじめまして。', 'hajimemashite greets a person you are meeting. This asks about the visit.'],
        ['いいえ、初めてです。', 'いいえ、はじめて です。', 'iie contradicts the yes that follows it.']
      ] },
      // Reception never stops at "first time?" — they want the actual symptom before offering a slot.
      { s: 'other', t: 'どうなさいましたか。', r: 'どう なさいました か。', e: 'What seems to be the trouble?' },
      { s: 'you', t: '冷たいものを食べると痛みます。', r: 'つめたい もの お たべる と いたみます。', e: 'It hurts when I eat something cold.', wrong: [
        ['冷たいものを食べると痛めます。', 'つめたい もの お たべる と いためます。', 'itameru is transitive — it would mean you injure something. The tooth hurting on its own is itamu, intransitive.'],
        ['冷たいものが食べると痛みます。', 'つめたい もの が たべる と いたみます。', 'taberu is transitive and its object needs o; ga would mark a subject, not what you eat.']
      ] },
      { s: 'other', t: '保険証はお持ちですか。', r: 'ほけんしょう わ おもち です か。', e: 'Do you have your insurance card with you?' },
      { s: 'you', t: 'はい、持っています。', r: 'はい、もって います。', e: 'Yes, I have it.', wrong: [
        ['はい、持ちます。', 'はい、もちます。', 'mochimasu describes the act of picking something up, not the ongoing state of having it — that is motte imasu.'],
        ['はい、あります。', 'はい、あります。', 'arimasu says the card exists somewhere; confirming you have it on you right now needs motte imasu.']
      ] },
      { s: 'other', t: 'では明日の午後3時はいかがですか。', r: 'では あした の ごご さんじ わ いかが です か。', e: 'Then how about tomorrow at 3pm?' },
      { s: 'you', t: 'はい、大丈夫です。よろしくお願いします。', r: 'はい、だいじょうぶ です。よろしく おねがいします。', e: 'Yes, that works. Thank you.', wrong: [
        ['はい、大丈夫でした。よろしくお願いします。', 'はい、だいじょうぶ でした。よろしく おねがいします。', 'Past tense reports something already resolved; confirming the time being proposed right now needs the present daijoubu desu.'],
        ['はい、大丈夫します。よろしくお願いします。', 'はい、だいじょうぶ します。よろしく おねがいします。', 'daijoubu is a na-adjective, not a verb — it pairs with desu, not suru.']
      ] },
      { s: 'other', t: 'かしこまりました。お名前とお電話番号を教えてください。', r: 'かしこまりました。おなまえ と おでんわばんごう お おしえて ください。', e: 'Certainly. Could I get your name and phone number?' },
      { s: 'you', t: '田中と申します。電話番号は090-1234-5678です。', r: 'たなか と もうします。でんわばんごう わ ぜろ きゅう ぜろ の いち に さん よん の ご ろく なな はち です。', e: 'I\'m Tanaka. My phone number is 090-1234-5678.', wrong: [
        ['田中と言います。電話番号は090-1234-5678です。', 'たなか と いいます。でんわばんごう わ ぜろ きゅう ぜろ の いち に さん よん の ご ろく なな はち です。', 'iimasu names yourself in casual speech; moushimasu is the humble form for giving your name to a clinic.'],
        ['田中と申しました。電話番号は090-1234-5678です。', 'たなか と もうしました。でんわばんごう わ ぜろ きゅう ぜろ の いち に さん よん の ご ろく なな はち です。', 'Past tense moushimashita reports an introduction already finished; you are introducing yourself right now.']
      ] },
      { s: 'other', t: 'では明日の午後3時にお待ちしております。', r: 'では あした の ごご さんじ に おまち して おります。', e: 'Then we\'ll be expecting you tomorrow at 3pm.' },
      { s: 'you', t: 'よろしくお願いします。失礼します。', r: 'よろしく おねがいします。しつれいします。', e: 'Thank you. Goodbye.', wrong: [
        ['よろしくお願いします。さようなら。', 'よろしく おねがいします。さようなら。', 'sayounara suits a face-to-face parting and sounds oddly final on the phone; shitsurei shimasu is the standard way to end a call.'],
        ['よろしくお願いします。ただいま。', 'よろしく おねがいします。ただいま。', 'tadaima announces arriving home — it has nothing to do with ending a phone call, which is shitsurei shimasu.']
      ] }
    ]
  },
  {
    code: 'health-dentist-pain',
    unit: 'health',
    title: 'At the dentist',
    situation: 'You are in the chair.',
    turns: [
      { s: 'other', t: 'どうしましたか。', r: 'どう しました か。', e: 'What seems to be the problem?' },
      { s: 'you', t: '奥歯が痛いです。', r: 'おくば が いたい です。', e: 'My back tooth hurts.', wrong: [
        ['奥歯を痛いです。', 'おくば お いたい です。', 'itai is an adjective, not a verb — nothing is acted on, so the tooth takes ga.'],
        ['奥歯は痛いです。', 'おくば わ いたい です。', 'wa contrasts it with your other teeth, as if listing which ones are fine. ga simply reports where it hurts.']
      ] },
      { s: 'other', t: 'いつからですか。', r: 'いつ から です か。', e: 'Since when?' },
      { s: 'you', t: '三日前からです。', r: 'みっかまえ から です。', e: 'Since three days ago.', wrong: [
        ['三日前までです。', 'みっかまえ まで です。', 'made is the far end of a span — that says it stopped three days ago.'],
        ['三日前にです。', 'みっかまえ に です。', 'ni marks a point. The pain started then and continues, which is kara.']
      ] },
      // "Since when" is only the first question — real triage asks what kind of pain it is too.
      { s: 'other', t: 'どんな痛みですか。', r: 'どんな いたみ です か。', e: 'What kind of pain is it?' },
      { s: 'you', t: 'ずきずきします。', r: 'ずきずき します。', e: 'It\'s a throbbing pain.', wrong: [
        ['ずきずきいます。', 'ずきずき います。', 'Mimetic pain words pair with suru, not iru — the phrase is zukizuki shimasu.'],
        ['ずきずきです。', 'ずきずき です。', 'Bare desu after the mimetic reads like naming a category; the pain actually happening needs the verb, zukizuki shimasu.']
      ] },
      { s: 'other', t: '歯茎が腫れていますか。', r: 'はぐき が はれて います か。', e: 'Is your gum swollen?' },
      { s: 'you', t: 'いいえ、腫れていません。でも噛むと痛いです。', r: 'いいえ、はれて いません。でも かむ と いたい です。', e: 'No, it\'s not swollen. But it hurts when I bite.', wrong: [
        ['いいえ、腫れませんでした。でも噛むと痛いです。', 'いいえ、はれません でした。でも かむ と いたい です。', 'The plain past hare-masen deshita reports it never happened at any point; describing its current state needs the -te imasen form.'],
        ['いいえ、腫らしていません。でも噛むと痛いです。', 'いいえ、はらして いません。でも かむ と いたい です。', 'harasu is transitive (to make something swell); the gum swelling on its own is the intransitive hareru.']
      ] },
      { s: 'other', t: '少し見てみますね。口を大きく開けてください。', r: 'すこし みて みます ね。くち お おおきく あけて ください。', e: 'Let me take a look. Please open your mouth wide.' },
      { s: 'you', t: 'はい、分かりました。', r: 'はい、わかりました。', e: 'Okay.', wrong: [
        ['はい、分かります。', 'はい、わかります。', 'wakarimasu states a general ability to understand; agreeing to comply right now uses the past-form wakarimashita as an acknowledgement.'],
        ['はい、分かっています。', 'はい、わかって います。', 'wakatte imasu means you already knew something; simply agreeing to what was just asked is wakarimashita.']
      ] },
      { s: 'other', t: 'やはり虫歯ですね。神経の近くまで進んでいます。', r: 'やはり むしば です ね。しんけい の ちかく まで すすんで います。', e: 'As I thought, it\'s a cavity. It\'s progressed close to the nerve.' },
      { s: 'you', t: '削る必要がありますか。麻酔はしますか。', r: 'けずる ひつよう が あります か。ますい わ します か。', e: 'Will it need drilling? Will you use anesthesia?', wrong: [
        ['削る必要をありますか。麻酔はしますか。', 'けずる ひつよう お あります か。ますい わ します か。', 'hitsuyou ga arimasu is the fixed pattern for "there is a need" — hitsuyou is what exists, so it takes ga, not o.'],
        ['削る必要がいますか。麻酔はしますか。', 'けずる ひつよう が います か。ますい わ します か。', 'iru is for animate things being present; a need existing takes aru/arimasu.']
      ] },
      { s: 'other', t: 'はい、麻酔をしてから削ります。今日は詰め物をして終わりにしましょう。', r: 'はい、ますい お して から けずります。きょう わ つめもの お して おわり に しましょう。', e: 'Yes, I\'ll numb it first, then drill. Let\'s finish today with a filling.' },
      { s: 'you', t: 'お願いします。', r: 'おねがいします。', e: 'Please go ahead.', wrong: [
        ['ください。', 'ください。', 'kudasai asks them to hand you something; agreeing to a procedure about to be done to you is onegai shimasu.'],
        ['どうぞ。', 'どうぞ。', 'douzo grants permission to someone else; here you are the one accepting the treatment, so onegai shimasu.']
      ] }
    ]
  },
  {
    code: 'health-doctor',
    unit: 'health',
    title: 'At the doctor',
    situation: 'You have had a fever since yesterday.',
    turns: [
      // Reception first: the card and first-visit check happen before anyone asks about symptoms.
      { s: 'other', t: '保険証をお願いします。初診ですか。', r: 'ほけんしょう お おねがいします。しょしん です か。', e: 'Your insurance card, please. Is this your first visit?' },
      { s: 'you', t: 'いいえ、二回目です。', r: 'いいえ、にかいめ です。', e: 'No, this is my second visit.', wrong: [
        ['いいえ、二回です。', 'いいえ、にかい です。', 'nikai just counts two occurrences; nikaime marks this as the second visit in a sequence.'],
        ['いいえ、二回目でした。', 'いいえ、にかいめ でした。', 'Past tense reports something already finished; this visit is happening right now, so desu.']
      ] },
      { s: 'other', t: '食欲はありますか。', r: 'しょくよく わ あります か。', e: 'Do you have an appetite?' },
      { s: 'you', t: 'いいえ、あまりありません。', r: 'いいえ、あまり ありません。', e: 'No, not really.', wrong: [
        ['いいえ、あまりです。', 'いいえ、あまり です。', 'amari needs a negative verb to attach to; desu alone leaves it dangling — state it as arimasen.'],
        ['いいえ、あまりいません。', 'いいえ、あまり いません。', 'imasen is for animate things being absent; an appetite existing or not uses arimasen.']
      ] },
      { s: 'other', t: '今日はどうされましたか。', r: 'きょう わ どう されました か。', e: 'What brings you in today?' },
      { s: 'you', t: '昨日から熱があります。', r: 'きのう から ねつ が あります。', e: 'I have had a fever since yesterday.', wrong: [
        ['昨日から熱がいます。', 'きのう から ねつ が います。', 'iru is for animate things. A fever takes aru.'],
        ['昨日から熱を持っています。', 'きのう から ねつ お もって います。', 'A literal translation of "have". Japanese states a symptom as existing: netsu ga arimasu.']
      ] },
      { s: 'other', t: '喉は痛いですか。', r: 'のど わ いたい です か。', e: 'Is your throat sore?' },
      { s: 'you', t: 'いいえ、あまり痛くないです。', r: 'いいえ、あまり いたくない です。', e: 'No, not very.', wrong: [
        ['いいえ、あまり痛いです。', 'いいえ、あまり いたい です。', 'amari demands a negative. With a positive it means "too much", which is the opposite of what you mean.'],
        ['いいえ、ぜんぜん痛いです。', 'いいえ、ぜんぜん いたい です。', 'zenzen also wants a negative: zenzen itakunai desu.']
      ] },
      // The interview ends and the physical exam starts — this is where the pain gets located, not just described.
      { s: 'other', t: 'では診察します。上を脱いで、大きく息を吸ってください。', r: 'では しんさつ します。うえ お ぬいで、おおきく いき お すって ください。', e: 'Let\'s examine you. Please take off your top and breathe in deeply.' },
      { s: 'you', t: 'ここが痛いです。', r: 'ここ が いたい です。', e: 'It hurts here.', wrong: [
        ['ここを痛いです。', 'ここ お いたい です。', 'itai is an adjective, not a verb — nothing is acted on, so the location takes ga, not o.'],
        ['ここは痛いです。', 'ここ わ いたい です。', 'wa would contrast this spot with others, as if listing which ones do not hurt; ga simply reports where it hurts.']
      ] },
      // The trap: declining ii desu/daijoubu desu here means walking out without medicine you need.
      { s: 'other', t: '風邪ですね。お薬を出しますね。それから、熱がつらいなら解熱剤も一緒に出しましょうか。', r: 'かぜ です ね。おくすり お だします ね。それから、ねつ が つらい なら げねつざい も いっしょ に だしましょう か。', e: 'It\'s a cold. I\'ll prescribe some medicine. Also, if the fever is rough, shall I add a fever reducer too?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['いいです。', 'いい です。', 'ii desu on its own reads as a polite decline — "I\'m fine, no thank you" — the opposite of accepting the fever reducer you actually want.'],
        ['大丈夫です。', 'だいじょうぶ です。', 'daijoubu desu here is heard as turning the offer down. If you want the medicine, say so directly with onegai shimasu.']
      ] },
      { s: 'other', t: '分かりました。三日分出しておきます。お大事に。', r: 'わかりました。みっかぶん だして おきます。おだいじに。', e: 'Got it. I\'ll give you three days\' worth. Take care.' },
      { s: 'you', t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you very much.', wrong: [
        ['どうも。', 'どうも。', 'That is too casual a send-off to a doctor; arigatou gozaimashita is the polite closing.'],
        ['すみませんでした。', 'すみません でした。', 'sumimasen deshita apologizes for a past inconvenience; thanking the doctor for treatment is arigatou gozaimashita.']
      ] }
    ]
  },
  {
    code: 'health-pharmacy',
    unit: 'health',
    title: 'At the pharmacy',
    situation: 'You hand over a prescription.',
    turns: [
      // Before the prescription itself, the pharmacy checks your medication history.
      { s: 'other', t: 'お薬手帳はお持ちですか。', r: 'おくすりてちょう わ おもち です か。', e: 'Do you have your medication notebook?' },
      { s: 'you', t: 'はい、これです。', r: 'はい、これ です。', e: 'Yes, here it is.', wrong: [
        ['はい、これでした。', 'はい、これ でした。', 'deshita reports something that used to be the case; handing it over right now is present-tense desu.'],
        ['はい、これがあります。', 'はい、これ が あります。', 'Presenting what is in your hand is simply kore desu; arimasu describes something existing elsewhere, not what you are holding out.']
      ] },
      { s: 'other', t: '処方箋をお預かりします。', r: 'しょほうせん お おあずかり します。', e: 'I will take the prescription.' },
      { s: 'you', t: 'お願いします。', r: 'おねがいします。', e: 'Thank you.', wrong: [
        ['どうぞ。', 'どうぞ。', 'douzo alone is what you say handing something over casually; with a pharmacist onegai shimasu is the register.'],
        ['ください。', 'ください。', 'That asks THEM for something. You are handing it to them.']
      ] },
      // The generic-substitution question is a classic spot for the ii desu / daijoubu desu trap.
      { s: 'other', t: 'ジェネリック医薬品でもよろしいですか。', r: 'ジェネリック いやくひん でも よろしい です か。', e: 'Is a generic version all right with you?' },
      { s: 'you', t: 'はい、ジェネリックでお願いします。', r: 'はい、ジェネリック で おねがいします。', e: 'Yes, generic is fine, please.', wrong: [
        ['はい、いいです。', 'はい、いい です。', 'ii desu alone can be heard as declining — "no, I\'m fine as is." Naming what you want, jenerikku de onegai shimasu, avoids the ambiguity.'],
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'daijoubu desu on its own also reads as turning the offer down. Say what you are accepting: jenerikku de onegai shimasu.']
      ] },
      { s: 'other', t: '食後に一日三回飲んでください。', r: 'しょくご に いちにち さんかい のんで ください。', e: 'Take it three times a day after meals.' },
      { s: 'you', t: '分かりました。何日分ですか。', r: 'わかりました。なんにちぶん です か。', e: 'Understood. How many days worth?', wrong: [
        ['分かりました。何日ですか。', 'わかりました。なんにち です か。', 'That asks what date it is. For a quantity of days, nan-nichi-bun.'],
        ['分かりました。いくつですか。', 'わかりました。いくつ です か。', 'ikutsu counts objects, not days of a course.']
      ] },
      { s: 'other', t: '五日分出ています。それから、この薬は眠くなることがあるので、車の運転は控えてください。', r: 'いつかぶん でて います。それから、この くすり わ ねむく なる こと が ある ので、くるま の うんてん わ ひかえて ください。', e: 'There\'s five days\' worth. Also, this medicine can make you drowsy, so please avoid driving.' },
      { s: 'you', t: '分かりました。気をつけます。', r: 'わかりました。き お つけます。', e: 'Understood. I\'ll be careful.', wrong: [
        ['分かりました。気をつきます。', 'わかりました。き お つきます。', 'tsukimasu is the plain verb "to attach/arrive"; the fixed expression for taking care is ki o tsukemasu, with tsukeru.'],
        ['分かりました。気がつけます。', 'わかりました。き が つけます。', 'ki o tsukeru is a fixed phrase — ki is the object of tsukeru and takes o, not ga.']
      ] },
      { s: 'other', t: 'お会計は1,200円になります。', r: 'おかいけい わ せんにひゃくえん に なります。', e: 'That comes to 1,200 yen.' },
      { s: 'you', t: 'カードで払えますか。', r: 'カード で はらえます か。', e: 'Can I pay by card?', wrong: [
        ['カードを払えますか。', 'カード お はらえます か。', 'The card is the means of paying, not the thing being paid — that takes de, not o.'],
        ['カードが払えますか。', 'カード が はらえます か。', 'haraeru takes the amount paid as its object; the method of payment is marked with de, not ga.']
      ] }
    ]
  },
  {
    code: 'health-cancel',
    unit: 'health',
    title: 'Cancelling an appointment',
    situation: 'You cannot make tomorrow.',
    turns: [
      // The call starts with the clinic answering, not with your request out of nowhere.
      { s: 'other', t: 'はい、さくら内科です。', r: 'はい、さくら ないか です。', e: 'Sakura Internal Medicine, hello.' },
      { s: 'you', t: 'すみません、明日の予約をキャンセルしたいのですが。', r: 'すみません、あした の よやく お キャンセル したい の です が。', e: 'I would like to cancel tomorrow\'s appointment.', wrong: [
        ['すみません、明日の予約をキャンセルします。', 'すみません、あした の よやく お キャンセル します。', 'A flat statement. Softening it with -tai no desu ga is what makes it an apology as well as a request.'],
        ['すみません、明日の予約がキャンセルしたいです。', 'すみません、あした の よやく が キャンセル したい です。', 'The appointment is what you are cancelling, so it takes o. With -tai, ga is possible on the object but not when the verb is a suru-compound like this.']
      ] },
      { s: 'other', t: 'かしこまりました。次はいつがよろしいですか。', r: 'かしこまりました。つぎ わ いつ が よろしい です か。', e: 'Certainly. When would suit you next?' },
      { s: 'you', t: '来週の水曜日はどうですか。', r: 'らいしゅう の すいようび わ どう です か。', e: 'How about next Wednesday?', wrong: [
        ['来週の水曜日がどうですか。', 'らいしゅう の すいようび が どう です か。', 'You are proposing a day, not picking it out of a set. Proposals take wa.'],
        ['来週の水曜日にどうですか。', 'らいしゅう の すいようび に どう です か。', 'ni marks when something happens, but here the day itself is the topic being proposed.']
      ] },
      // A day alone is not a bookable slot — the clinic still needs morning or afternoon, then an exact time.
      { s: 'other', t: '来週の水曜日ですね。午前と午後、どちらがよろしいですか。', r: 'らいしゅう の すいようび です ね。ごぜん と ごご、どちら が よろしい です か。', e: 'Next Wednesday, got it. Morning or afternoon, which is better?' },
      { s: 'you', t: '午後でお願いします。', r: 'ごご で おねがいします。', e: 'Afternoon, please.', wrong: [
        ['午後をお願いします。', 'ごご お おねがいします。', 'Afternoon is the time slot you are settling on, not a thing being handed over — that takes de, not o.'],
        ['午後がお願いします。', 'ごご が おねがいします。', 'onegai shimasu does not take a ga-marked subject here; the chosen time is marked with de.']
      ] },
      { s: 'other', t: '午後2時はいかがですか。', r: 'ごご にじ わ いかが です か。', e: 'How about 2pm?' },
      { s: 'you', t: 'はい、それで大丈夫です。', r: 'はい、それ で だいじょうぶ です。', e: 'Yes, that works.', wrong: [
        ['はい、それで大丈夫でした。', 'はい、それ で だいじょうぶ でした。', 'Past tense reports something already settled; confirming a time being proposed right now needs present tense.'],
        ['はい、それで大丈夫します。', 'はい、それ で だいじょうぶ します。', 'daijoubu is a na-adjective, not a verb — pair it with desu, not suru.']
      ] },
      { s: 'other', t: '承知しました。来週水曜日の午後2時に変更ですね。', r: 'しょうち しました。らいしゅう すいようび の ごご にじ に へんこう です ね。', e: 'Understood. Changed to next Wednesday at 2pm.' },
      { s: 'you', t: 'はい、お願いします。ありがとうございます。', r: 'はい、おねがいします。ありがとう ございます。', e: 'Yes, please. Thank you.', wrong: [
        ['はい、お願いしました。ありがとうございます。', 'はい、おねがい しました。ありがとう ございます。', 'Past tense onegai shimashita reports a request already made and finished; confirming the new time right now calls for the present onegai shimasu.'],
        ['はい、お願いします。ありがとうございました。', 'はい、おねがいします。ありがとう ございました。', 'The call is not over yet — the past arigatou gozaimashita belatedly closes it; arigatou gozaimasu fits mid-call thanks.']
      ] }
    ]
  }
]
