import type { Dialogue } from './types.js'

/** Appointments, deliveries, repairs, neighbours — the errands of a normal week. */
export const DAILY: Dialogue[] = [
  {
    code: 'health-dentist-book',
    unit: 'health',
    title: 'Booking the dentist',
    situation: 'You ring to make an appointment.',
    turns: [
      { s: 'other', t: 'はい、山田歯科です。', r: 'はい、やまだ しか です。', e: 'Yamada Dental, hello.' },
      { s: 'you', t: '予約をお願いしたいのですが。', r: 'よやく お おねがい したい の です が。', e: 'I would like to make an appointment.', wrong: [
        ['予約をしてください。', 'よやく お して ください。', 'A direct order on the phone to a stranger. shitai no desu ga is the request form.'],
        ['予約がお願いしたいのですが。', 'よやく が おねがい したい の です が。', 'onegai suru takes an object, so yoyaku takes o.']
      ] },
      { s: 'other', t: '初めてですか。', r: 'はじめて です か。', e: 'Is this your first visit?' },
      { s: 'you', t: 'はい、初めてです。', r: 'はい、はじめて です。', e: 'Yes, first time.', wrong: [
        ['はい、初めまして。', 'はい、はじめまして。', 'hajimemashite is "nice to meet you" when introducing yourself, not "first time".'],
        ['はい、一回です。', 'はい、いっかい です。', 'ikkai counts one occurrence. For a first visit it is hajimete.']
      ] },
      { s: 'other', t: '木曜日の三時はいかがですか。', r: 'もくようび の さんじ わ いかが です か。', e: 'How about Thursday at three?' },
      { s: 'you', t: '大丈夫です。お願いします。', r: 'だいじょうぶ です。おねがいします。', e: 'That works. Please.', wrong: [
        ['結構です。', 'けっこう です。', 'kekkou desu at a counter usually REFUSES — "no thank you". Dangerous word.'],
        ['いいです。', 'いい です。', 'Also ambiguous — it can mean "no need". daijoubu desu with onegai shimasu is unambiguous.']
      ] }
    ]
  },
  {
    code: 'health-dentist-visit',
    unit: 'health',
    title: 'In the dentist chair',
    situation: 'The dentist asks where it hurts.',
    turns: [
      { s: 'other', t: 'どこが痛いですか。', r: 'どこ が いたい です か。', e: 'Where does it hurt?' },
      { s: 'you', t: '右の奥歯が痛いです。', r: 'みぎ の おくば が いたい です。', e: 'My back right tooth hurts.', wrong: [
        ['右の奥歯を痛いです。', 'みぎ の おくば お いたい です。', 'itai is an adjective, not a verb — what hurts takes ga.'],
        ['右の奥歯が痛みます。', 'みぎ の おくば が いたみます。', 'Understandable, but itamu is written or clinical. In speech it is itai desu.']
      ] },
      { s: 'other', t: 'いつからですか。', r: 'いつ から です か。', e: 'Since when?' },
      { s: 'you', t: '一週間くらい前からです。', r: 'いっしゅうかん くらい まえ から です。', e: 'About a week ago.', wrong: [
        ['一週間くらい前までです。', 'いっしゅうかん くらい まえ まで です。', 'made is an end point. The pain STARTED then, so kara.'],
        ['一週間くらい後からです。', 'いっしゅうかん くらい あと から です。', 'ato is after — that puts it in the future.']
      ] }
    ]
  },
  {
    code: 'health-pharmacy-book',
    unit: 'health',
    title: 'At the pharmacy',
    situation: 'You are handing in a prescription.',
    turns: [
      { s: 'you', t: '処方箋をお願いします。', r: 'しょほうせん お おねがいします。', e: 'My prescription, please.', wrong: [
        ['処方箋をください。', 'しょほうせん お ください。', 'kudasai asks them to GIVE you a prescription. You are handing yours over.'],
        ['処方箋がお願いします。', 'しょほうせん が おねがいします。', 'What you present takes o.']
      ] },
      { s: 'other', t: 'お薬手帳はお持ちですか。', r: 'おくすり てちょう わ おもち です か。', e: 'Do you have your medicine record book?' },
      { s: 'you', t: 'いいえ、持っていません。', r: 'いいえ、もって いません。', e: 'No, I do not have one.', wrong: [
        ['いいえ、持ちません。', 'いいえ、もちません。', 'mochimasen says you will not carry one. Not currently having it is motte imasen.'],
        ['いいえ、ありません。', 'いいえ、ありません。', 'Not wrong for existence, but for possession the natural answer is motte imasen.']
      ] },
      { s: 'other', t: 'では、お作りしますね。', r: 'では、おつくりします ね。', e: 'I will make you one, then.' }
    ]
  },
  {
    code: 'health-symptoms',
    unit: 'health',
    title: 'Describing a cold',
    situation: 'At the clinic reception.',
    turns: [
      { s: 'other', t: '今日はどうされましたか。', r: 'きょう わ どう されました か。', e: 'What brings you in today?' },
      { s: 'you', t: '熱があって、喉が痛いです。', r: 'ねつ が あって、のど が いたい です。', e: 'I have a fever and a sore throat.', wrong: [
        ['熱があって、喉を痛いです。', 'ねつ が あって、のど お いたい です。', 'itai is an adjective; the sore part takes ga.'],
        ['熱がいて、喉が痛いです。', 'ねつ が いて、のど が いたい です。', 'iru is for animate things. A fever takes aru, so the te-form is atte.']
      ] },
      { s: 'other', t: '熱は何度ですか。', r: 'ねつ わ なんど です か。', e: 'What is your temperature?' },
      { s: 'you', t: '三十八度ありました。', r: 'さんじゅうはち ど ありました。', e: 'It was 38.', wrong: [
        ['三十八度でした。', 'さんじゅうはち ど でした。', 'Understandable, but with a measured quantity the idiom is arimashita.'],
        ['三十八度がありました。', 'さんじゅうはち ど が ありました。', 'A counted amount before aru takes no particle.']
      ] }
    ]
  },
  {
    code: 'services-delivery',
    unit: 'services',
    title: 'A delivery at the door',
    situation: 'The intercom goes.',
    turns: [
      { s: 'other', t: '宅配便です。お荷物お届けにあがりました。', r: 'たくはいびん です。おにもつ おとどけ に あがりました。', e: 'Delivery. I have a parcel for you.' },
      { s: 'you', t: '今開けます。少々お待ちください。', r: 'いま あけます。しょうしょう おまち ください。', e: 'Opening now. One moment.', wrong: [
        ['今開きます。少々お待ちください。', 'いま あきます。しょうしょう おまち ください。', 'aku is intransitive — the door opens by itself. You are opening it: akeru.'],
        ['今開けます。少々待ちます。', 'いま あけます。しょうしょう まちます。', 'That says YOU will wait. Asking them to wait is omachi kudasai.']
      ] },
      { s: 'other', t: 'こちらにサインをお願いします。', r: 'こちら に サイン お おねがいします。', e: 'Sign here, please.' },
      { s: 'you', t: 'はい。ご苦労さまです。', r: 'はい。ごくろうさま です。', e: 'Here you go. Thanks for your trouble.', wrong: [
        ['はい。お疲れさまです。', 'はい。おつかれさま です。', 'Not wrong, but otsukaresama is for colleagues. To someone delivering to you, gokurousama fits.'],
        ['はい。いただきます。', 'はい。いただきます。', 'That is for eating or receiving a gift, not a parcel at the door.']
      ] }
    ]
  },
  {
    code: 'services-redeliver',
    unit: 'services',
    title: 'Rearranging a delivery',
    situation: 'You missed the parcel and are calling back.',
    turns: [
      { s: 'you', t: '再配達をお願いしたいのですが。', r: 'さいはいたつ お おねがい したい の です が。', e: 'I would like to arrange a redelivery.', wrong: [
        ['再配達をしたいのですが。', 'さいはいたつ お したい の です が。', 'That says YOU want to redeliver it. You want them to: onegai shitai.'],
        ['再配達がお願いしたいのですが。', 'さいはいたつ が おねがい したい の です が。', 'onegai suru takes an object: o.']
      ] },
      { s: 'other', t: 'ご希望のお時間は。', r: 'ごきぼう の おじかん わ。', e: 'What time would you like?' },
      { s: 'you', t: '夜の七時以降でお願いします。', r: 'よる の しちじ いこう で おねがいします。', e: 'After seven in the evening, please.', wrong: [
        ['夜の七時以内でお願いします。', 'よる の しちじ いない で おねがいします。', 'inai means within a span. After a point in time is ikou.'],
        ['夜の七時までにお願いします。', 'よる の しちじ まで に おねがいします。', 'That asks for it BEFORE seven — the opposite.']
      ] }
    ]
  },
  {
    code: 'home-repair',
    unit: 'home',
    title: 'Reporting something broken',
    situation: 'The air conditioner has stopped.',
    turns: [
      { s: 'you', t: 'エアコンが壊れてしまったんですが。', r: 'エアコン が こわれて しまった ん です が。', e: 'The air conditioner has broken.', wrong: [
        ['エアコンを壊してしまったんですが。', 'エアコン お こわして しまった ん です が。', 'kowasu means YOU broke it. If it failed by itself, it is kowareru.'],
        ['エアコンが壊れます。', 'エアコン が こわれます。', 'That predicts it will break. It already has: kowarete shimatta.']
      ] },
      { s: 'other', t: 'いつからですか。', r: 'いつ から です か。', e: 'Since when?' },
      { s: 'you', t: '昨日の夜からつきません。', r: 'きのう の よる から つきません。', e: 'It has not come on since last night.', wrong: [
        ['昨日の夜からつけません。', 'きのう の よる から つけません。', 'tsukeru is to switch it on. Whether it comes on by itself is tsuku.'],
        ['昨日の夜までつきません。', 'きのう の よる まで つきません。', 'made is up until — that says it worked from last night onward.']
      ] },
      { s: 'other', t: '明日、業者が伺います。', r: 'あした、ぎょうしゃ が うかがいます。', e: 'An engineer will come tomorrow.' }
    ]
  },
  {
    code: 'home-neighbour',
    unit: 'home',
    title: 'Meeting a neighbour',
    situation: 'You have just moved in.',
    turns: [
      { s: 'you', t: '隣に越してきました田中です。', r: 'となり に こして きました たなか です。', e: 'I am Tanaka, just moved in next door.', wrong: [
        ['隣に越していきました田中です。', 'となり に こして いきました たなか です。', 'te-iku moves away from here. Moving in toward where you both are is te-kuru.'],
        ['隣に越します田中です。', 'となり に こします たなか です。', 'That says you will move in later. You have already: koshite kimashita.']
      ] },
      { s: 'other', t: 'あら、よろしくお願いします。', r: 'あら、よろしく おねがいします。', e: 'Oh, pleased to meet you.' },
      { s: 'you', t: 'こちらこそ、よろしくお願いします。', r: 'こちらこそ、よろしく おねがいします。', e: 'Likewise, pleased to meet you.', wrong: [
        ['はい、よろしくお願いします。', 'はい、よろしく おねがいします。', 'Fine but flat. kochira koso returns the greeting properly.'],
        ['ありがとうございます。', 'ありがとうございます。', 'They greeted you rather than doing you a favour.']
      ] }
    ]
  },
  {
    code: 'home-rubbish-day',
    unit: 'home',
    title: 'Asking about the rubbish',
    situation: 'You do not know which day burnables go out.',
    turns: [
      { s: 'you', t: '燃えるゴミは何曜日ですか。', r: 'もえる ゴミ わ なんようび です か。', e: 'Which day is burnable rubbish?', wrong: [
        ['燃えるゴミは何日ですか。', 'もえる ゴミ わ なんにち です か。', 'nannichi asks which date of the month. A weekday is nanyoubi.'],
        ['燃えるゴミが何曜日ですか。', 'もえる ゴミ が なんようび です か。', 'The rubbish is your topic, so wa.']
      ] },
      { s: 'other', t: '火曜と金曜ですよ。朝八時までに出してください。', r: 'かよう と きんよう です よ。あさ はちじ まで に だして ください。', e: 'Tuesday and Friday. Put it out by eight.' },
      { s: 'you', t: 'わかりました。ありがとうございます。', r: 'わかりました。ありがとうございます。', e: 'Understood, thank you.', wrong: [
        ['知っています。ありがとうございます。', 'しって います。ありがとうございます。', 'shitte imasu claims you already knew, which contradicts having asked.'],
        ['わかります。ありがとうございます。', 'わかります。ありがとうございます。', 'wakarimasu is a standing ability. Having just grasped something is wakarimashita.']
      ] }
    ]
  },
  {
    code: 'out-taxi',
    unit: 'travel',
    title: 'Taking a taxi',
    situation: 'You get in and give the destination.',
    turns: [
      { s: 'other', t: 'どちらまで。', r: 'どちら まで。', e: 'Where to?' },
      { s: 'you', t: '駅までお願いします。', r: 'えき まで おねがいします。', e: 'To the station, please.', wrong: [
        ['駅にお願いします。', 'えき に おねがいします。', 'Understandable, but for a destination you are travelling AS FAR AS, the taxi idiom is made.'],
        ['駅までください。', 'えき まで ください。', 'kudasai asks for an object. A service you are requesting is onegai shimasu.']
      ] },
      { s: 'other', t: '高速を使いますか。', r: 'こうそく お つかいます か。', e: 'Shall I take the expressway?' },
      { s: 'you', t: 'いいえ、下道でお願いします。', r: 'いいえ、したみち で おねがいします。', e: 'No, surface roads please.', wrong: [
        ['いいえ、下道をお願いします。', 'いいえ、したみち お おねがいします。', 'The road is the MEANS of getting there, so de.'],
        ['いいえ、下道にお願いします。', 'いいえ、したみち に おねがいします。', 'ni marks a destination. The road is not where you are going.']
      ] }
    ]
  }
]
