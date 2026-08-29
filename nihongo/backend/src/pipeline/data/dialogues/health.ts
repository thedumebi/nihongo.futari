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
      ] }
    ]
  },
  {
    code: 'health-doctor',
    unit: 'health',
    title: 'At the doctor',
    situation: 'You have had a fever since yesterday.',
    turns: [
      { s: 'other', t: '今日はどうされましたか。', r: 'きょう わ どう されました か。', e: 'What brings you in today?' },
      { s: 'you', t: '昨日から熱があります。', r: 'きのう から ねつ が あります。', e: 'I have had a fever since yesterday.', wrong: [
        ['昨日から熱がいます。', 'きのう から ねつ が います。', 'iru is for animate things. A fever takes aru.'],
        ['昨日から熱を持っています。', 'きのう から ねつ お もって います。', 'A literal translation of "have". Japanese states a symptom as existing: netsu ga arimasu.']
      ] },
      { s: 'other', t: '喉は痛いですか。', r: 'のど わ いたい です か。', e: 'Is your throat sore?' },
      { s: 'you', t: 'いいえ、あまり痛くないです。', r: 'いいえ、あまり いたくない です。', e: 'No, not very.', wrong: [
        ['いいえ、あまり痛いです。', 'いいえ、あまり いたい です。', 'amari demands a negative. With a positive it means "too much", which is the opposite of what you mean.'],
        ['いいえ、ぜんぜん痛いです。', 'いいえ、ぜんぜん いたい です。', 'zenzen also wants a negative: zenzen itakunai desu.']
      ] }
    ]
  },
  {
    code: 'health-pharmacy',
    unit: 'health',
    title: 'At the pharmacy',
    situation: 'You hand over a prescription.',
    turns: [
      { s: 'other', t: '処方箋をお預かりします。', r: 'しょほうせん お おあずかり します。', e: 'I will take the prescription.' },
      { s: 'you', t: 'お願いします。', r: 'おねがいします。', e: 'Thank you.', wrong: [
        ['どうぞ。', 'どうぞ。', 'douzo alone is what you say handing something over casually; with a pharmacist onegai shimasu is the register.'],
        ['ください。', 'ください。', 'That asks THEM for something. You are handing it to them.']
      ] },
      { s: 'other', t: '食後に一日三回飲んでください。', r: 'しょくご に いちにち さんかい のんで ください。', e: 'Take it three times a day after meals.' },
      { s: 'you', t: '分かりました。何日分ですか。', r: 'わかりました。なんにちぶん です か。', e: 'Understood. How many days worth?', wrong: [
        ['分かりました。何日ですか。', 'わかりました。なんにち です か。', 'That asks what date it is. For a quantity of days, nan-nichi-bun.'],
        ['分かりました。いくつですか。', 'わかりました。いくつ です か。', 'ikutsu counts objects, not days of a course.']
      ] }
    ]
  },
  {
    code: 'health-cancel',
    unit: 'health',
    title: 'Cancelling an appointment',
    situation: 'You cannot make tomorrow.',
    turns: [
      { s: 'you', t: 'すみません、明日の予約をキャンセルしたいのですが。', r: 'すみません、あした の よやく お キャンセル したい の です が。', e: 'I would like to cancel tomorrow\'s appointment.', wrong: [
        ['すみません、明日の予約をキャンセルします。', 'すみません、あした の よやく お キャンセル します。', 'A flat statement. Softening it with -tai no desu ga is what makes it an apology as well as a request.'],
        ['すみません、明日の予約がキャンセルしたいです。', 'すみません、あした の よやく が キャンセル したい です。', 'The appointment is what you are cancelling, so it takes o. With -tai, ga is possible on the object but not when the verb is a suru-compound like this.']
      ] },
      { s: 'other', t: 'かしこまりました。次はいつがよろしいですか。', r: 'かしこまりました。つぎ わ いつ が よろしい です か。', e: 'Certainly. When would suit you next?' },
      { s: 'you', t: '来週の水曜日はどうですか。', r: 'らいしゅう の すいようび わ どう です か。', e: 'How about next Wednesday?', wrong: [
        ['来週の水曜日がどうですか。', 'らいしゅう の すいようび が どう です か。', 'You are proposing a day, not picking it out of a set. Proposals take wa.'],
        ['来週の水曜日にどうですか。', 'らいしゅう の すいようび に どう です か。', 'ni marks when something happens, but here the day itself is the topic being proposed.']
      ] }
    ]
  }
]
