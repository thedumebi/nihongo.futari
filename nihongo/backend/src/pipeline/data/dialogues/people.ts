import type { Dialogue } from './types.js'

/** Work, school, friends and the telephone. */
export const PEOPLE: Dialogue[] = [
  {
    code: 'work-arriving',
    unit: 'work',
    title: 'Arriving at work',
    situation: 'You come into the office at nine.',
    turns: [
      { s: 'you', t: 'おはようございます。', r: 'おはようございます。', e: 'Good morning.', wrong: [
        ['こんにちは。', 'こんにちは。', 'In an office ohayou gozaimasu is the arrival greeting whatever the hour — night staff say it too.'],
        ['おはよう。', 'おはよう。', 'The short form is for family and close friends. To colleagues it needs gozaimasu.']
      ] },
      { s: 'other', t: 'おはようございます。今日の会議、十時からです。', r: 'おはようございます。きょう の かいぎ、じゅうじ から です。', e: 'Morning. Today\'s meeting is at ten.' },
      { s: 'you', t: '承知しました。', r: 'しょうち しました。', e: 'Understood.', wrong: [
        ['分かった。', 'わかった。', 'Plain form to a colleague at work is too casual. wakarimashita at least; shouchi shimashita is the business register.'],
        ['はい、そうです。', 'はい、そう です。', 'sou desu confirms a fact about you. Acknowledging an instruction is wakarimashita.']
      ] }
    ]
  },
  {
    code: 'work-leaving',
    unit: 'work',
    title: 'Leaving the office',
    situation: 'You are done for the day; others are still working.',
    turns: [
      { s: 'you', t: 'お先に失礼します。', r: 'おさきに しつれいします。', e: 'I am off — excuse me for leaving first.', wrong: [
        ['さようなら。', 'さようなら。', 'sayounara sounds final, as though you were not coming back tomorrow.'],
        ['いってきます。', 'いってきます。', 'ittekimasu says you are going out and returning shortly. Leaving for the day is osaki ni shitsurei shimasu.']
      ] },
      { s: 'other', t: 'お疲れさまでした。', r: 'おつかれさま でした。', e: 'Thanks for your work.' },
      { s: 'you', t: 'お疲れさまでした。', r: 'おつかれさま でした。', e: 'And you.', wrong: [
        ['ご苦労さまでした。', 'ごくろうさま でした。', 'gokurousama is said downward, by a superior to a subordinate. Said upward or sideways it is rude.'],
        ['どういたしまして。', 'どういたしまして。', 'That answers thanks. Otsukaresama is a greeting, not thanks — it is returned, not accepted.']
      ] }
    ]
  },
  {
    code: 'work-day-off',
    unit: 'work',
    title: 'Asking for a day off',
    situation: 'You need Friday off.',
    turns: [
      { s: 'you', t: 'すみません、金曜日に休みを取ってもいいですか。', r: 'すみません、きんようび に やすみ お とって も いい です か。', e: 'May I take Friday off?', wrong: [
        ['すみません、金曜日に休みます。', 'すみません、きんようび に やすみます。', 'That announces you will not be in. Asking permission is te mo ii desu ka.'],
        ['すみません、金曜日は休みを取りたいです。', 'すみません、きんようび わ やすみ お とりたい です。', 'States a want. To a manager, asking permission is the form.']
      ] },
      { s: 'other', t: '大丈夫ですよ。理由は。', r: 'だいじょうぶ です よ。りゆう わ。', e: 'That is fine. Reason?' },
      { s: 'you', t: '家族が来るので、空港に迎えに行きます。', r: 'かぞく が くる ので、くうこう に むかえ に いきます。', e: 'My family is coming, so I am meeting them at the airport.', wrong: [
        ['家族が来るから、空港に迎えに行きます。', 'かぞく が くる から、くうこう に むかえ に いきます。', 'kara is a subjective reason and can sound like an excuse. To a manager, node is the softer, more objective word.'],
        ['家族が来るので、空港で迎えに行きます。', 'かぞく が くる ので、くうこう で むかえ に いきます。', 'de marks where an action happens, but with iku the airport is the destination: ni.']
      ] }
    ]
  },
  {
    code: 'work-introduction',
    unit: 'work',
    title: 'Meeting someone new',
    situation: 'A colleague introduces you to a visitor.',
    turns: [
      { s: 'other', t: 'こちらが新しいメンバーの田中さんです。', r: 'こちら が あたらしい メンバー の たなかさん です。', e: 'This is Tanaka, our new member.' },
      { s: 'you', t: 'はじめまして。よろしくお願いします。', r: 'はじめまして。よろしく おねがいします。', e: 'Nice to meet you.', wrong: [
        ['こんにちは。よろしくお願いします。', 'こんにちは。よろしく おねがいします。', 'Not wrong, but a first meeting has its own word: hajimemashite.'],
        ['はじめまして。よろしくお願いしました。', 'はじめまして。よろしく おねがい しました。', 'The past tense closes something already done. The relationship is starting, so the present.']
      ] },
      { s: 'other', t: 'こちらこそ、よろしくお願いします。', r: 'こちらこそ、よろしく おねがいします。', e: 'Likewise.' }
    ]
  },
  {
    code: 'school-question',
    unit: 'school',
    title: 'Asking the teacher',
    situation: 'You did not follow the last explanation.',
    turns: [
      { s: 'you', t: 'すみません、もう一度お願いできますか。', r: 'すみません、もう いちど おねがい できます か。', e: 'Could you say that once more?', wrong: [
        ['すみません、もう一度言って。', 'すみません、もう いちど いって。', 'The bare te-form is a command between friends. To a teacher it needs kudasai at least.'],
        ['すみません、分かりません。', 'すみません、わかりません。', 'True but unhelpful — it states a problem without asking for anything.']
      ] },
      { s: 'other', t: 'もちろん。どこが分かりませんか。', r: 'もちろん。どこ が わかりません か。', e: 'Of course. Which part?' },
      { s: 'you', t: 'この文法がまだよく分かりません。', r: 'この ぶんぽう が まだ よく わかりません。', e: 'I still do not really follow this grammar.', wrong: [
        ['この文法をまだよく分かりません。', 'この ぶんぽう お まだ よく わかりません。', 'wakaru is intransitive — it is closer to "becomes clear to me". What you understand takes ga.'],
        ['この文法はまだよく分かりません。', 'この ぶんぽう わ まだ よく わかりません。', 'Possible, but wa contrasts it against grammar you DO understand. ga simply names what is unclear.']
      ] }
    ]
  },
  {
    code: 'school-homework',
    unit: 'school',
    title: 'Homework',
    situation: 'The teacher is setting work for next week.',
    turns: [
      { s: 'other', t: '宿題は来週の火曜日までです。', r: 'しゅくだい わ らいしゅう の かようび まで です。', e: 'Homework is due next Tuesday.' },
      { s: 'you', t: '火曜日までに出せばいいですか。', r: 'かようび まで に だせば いい です か。', e: 'So I hand it in by Tuesday?', wrong: [
        ['火曜日まで出せばいいですか。', 'かようび まで だせば いい です か。', 'made is continuous — up TO Tuesday. A deadline is made ni.'],
        ['火曜日に出せばいいですか。', 'かようび に だせば いい です か。', 'ni names the day exactly. A deadline allows anything before it, which is made ni.']
      ] },
      { s: 'other', t: 'そうです。遅れないでくださいね。', r: 'そう です。おくれないで ください ね。', e: 'That is right. Do not be late.' }
    ]
  },
  {
    code: 'social-plans',
    unit: 'social',
    title: 'Making plans',
    situation: 'A friend messages about the weekend.',
    turns: [
      { s: 'other', t: '週末、映画でも見に行かない？', r: 'しゅうまつ、えいが でも み に いかない？', e: 'Want to go see a film at the weekend?' },
      { s: 'you', t: 'いいですね。土曜日はどうですか。', r: 'いい です ね。どようび わ どう です か。', e: 'Sounds good. How about Saturday?', wrong: [
        ['いいですね。土曜日がどうですか。', 'いい です ね。どようび が どう です か。', 'You are proposing a day, not picking it out. Proposals take wa.'],
        ['いいですよ。土曜日はどうですか。', 'いい です よ。どようび わ どう です か。', 'yo tells them something new, which lands as slightly grudging permission. ne shares the enthusiasm.']
      ] },
      { s: 'other', t: '土曜日は用事があるんだ。日曜日は？', r: 'どようび わ ようじ が ある ん だ。にちようび わ？', e: 'I am busy Saturday. Sunday?' },
      { s: 'you', t: '日曜日でも大丈夫です。', r: 'にちようび でも だいじょうぶ です。', e: 'Sunday works too.', wrong: [
        ['日曜日にも大丈夫です。', 'にちようび に も だいじょうぶ です。', 'demo is "either way is fine". ni mo would add Sunday to a list of days you had already agreed.'],
        ['日曜日は大丈夫じゃないです。', 'にちようび わ だいじょうぶ じゃない です。', 'That refuses the day they just offered.']
      ] }
    ]
  },
  {
    code: 'social-late',
    unit: 'social',
    title: 'Running late',
    situation: 'You are twenty minutes behind.',
    turns: [
      { s: 'you', t: 'ごめん、電車が遅れていて、二十分ぐらい遅れます。', r: 'ごめん、でんしゃ が おくれて いて、にじゅっぷん ぐらい おくれます。', e: 'Sorry, the train is delayed — I will be about twenty minutes late.', wrong: [
        ['ごめん、電車が遅れて、二十分ごろ遅れます。', 'ごめん、でんしゃ が おくれて、にじゅっぷん ごろ おくれます。', 'goro is for a point in time — three o\'clock-ish. For a duration it is gurai.'],
        ['ごめん、電車を遅れていて、二十分ぐらい遅れます。', 'ごめん、でんしゃ お おくれて いて、にじゅっぷん ぐらい おくれます。', 'okureru is intransitive — the train is doing the being-late, so ga.']
      ] },
      { s: 'other', t: '大丈夫、気をつけて。', r: 'だいじょうぶ、き お つけて。', e: 'No problem, take care.' },
      { s: 'you', t: 'ありがとう。先に入っていて。', r: 'ありがとう。さきに はいって いて。', e: 'Thanks. Go on in without me.', wrong: [
        ['ありがとう。先に入ってください。', 'ありがとう。さきに はいって ください。', 'Grammatical, but kudasai to a close friend is stiff — it sounds like you are giving instructions.'],
        ['ありがとう。先に入ります。', 'ありがとう。さきに はいります。', 'That says YOU will go in first, which you cannot — you are not there.']
      ] }
    ]
  },
  {
    code: 'phone-answering',
    unit: 'phone',
    title: 'Answering the phone',
    situation: 'The office phone rings.',
    turns: [
      { s: 'you', t: 'はい、山田商事でございます。', r: 'はい、やまだ しょうじ で ございます。', e: 'Yamada Trading, hello.', wrong: [
        ['もしもし。', 'もしもし。', 'moshi moshi is for answering a personal call, and for checking someone is still there. A business answers with its name.'],
        ['はい、山田商事です。こんにちは。', 'はい、やまだ しょうじ です。こんにちは。', 'konnichiwa is not used on a business call — the greeting is osewa ni natte orimasu once you know who it is.']
      ] },
      { s: 'other', t: 'お世話になっております。田中と申します。', r: 'おせわ に なって おります。たなか と もうします。', e: 'Hello, this is Tanaka.' },
      { s: 'you', t: 'お世話になっております。', r: 'おせわ に なって おります。', e: 'Hello, good to hear from you.', wrong: [
        ['はじめまして。', 'はじめまして。', 'Reserved for meeting in person for the first time, and this is a business call from someone who already deals with you.'],
        ['どうも。', 'どうも。', 'Far too casual on a company line.']
      ] }
    ]
  },
  {
    code: 'phone-absent',
    unit: 'phone',
    title: 'Taking a message',
    situation: 'The caller wants a colleague who is out.',
    turns: [
      { s: 'other', t: '佐藤さんはいらっしゃいますか。', r: 'さとうさん わ いらっしゃいます か。', e: 'Is Sato there?' },
      { s: 'you', t: '佐藤は今、席を外しております。', r: 'さとう わ いま、せき お はずして おります。', e: 'Sato is away from his desk at the moment.', wrong: [
        ['佐藤さんは今、席を外しております。', 'さとうさん わ いま、せき お はずして おります。', 'You do not add san to your own colleague when speaking to an outsider — inside the company they are just Sato.'],
        ['佐藤はいません。', 'さとう わ いません。', 'Accurate but abrupt. Business Japanese softens absence into seki o hazushite orimasu.']
      ] },
      { s: 'other', t: 'では、また後でかけ直します。', r: 'では、また あとで かけなおします。', e: 'I will call back later then.' },
      { s: 'you', t: '恐れ入ります。よろしくお願いいたします。', r: 'おそれいります。よろしく おねがい いたします。', e: 'Thank you. I appreciate it.', wrong: [
        ['分かりました。', 'わかりました。', 'Fine internally, but flat for a customer who has just offered to ring back.'],
        ['ありがとう。', 'ありがとう。', 'Plain arigatou on a business line is too casual.']
      ] }
    ]
  }
]
