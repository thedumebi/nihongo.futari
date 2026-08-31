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
      { s: 'other', t: 'では、お名前とお電話番号をお願いします。', r: 'では、おなまえ と おでんわ ばんごう お おねがいします。', e: 'Could I get your name and phone number, then?' },
      { s: 'you', t: '田中と申します。電話番号は090の1234の5678です。', r: 'たなか と もうします。でんわ ばんごう わ ゼロ きゅう ゼロ の いち に さん よん の ご ろく なな はち です。', e: "I'm Tanaka. My number is 090-1234-5678.", wrong: [
        ['田中と申しました。', 'たなか と もうしました。', 'moushimashita is past tense — introducing yourself right now needs the present mousu.'],
        ['電話番号は九十の千二百三十四の五千六百七十八です。', 'でんわ ばんごう わ きゅうじゅう の せんにひゃくさんじゅうよん の ごせんろっぴゃくななじゅうはち です。', 'Phone numbers are read digit by digit, not as one big number — 090 is zero-kyuu-zero, not kyuujuu.'],
        ['電話番号が090の1234の5678です。', 'でんわ ばんごう が ゼロ きゅう ゼロ の いち に さん よん の ご ろく なな はち です。', 'You are listing your own details in turn — each one is a topic marked by wa, not ga.']
      ] },
      { s: 'other', t: '何かお困りの症状はありますか。', r: 'なにか おこまり の しょうじょう わ あります か。', e: 'Is there any problem bothering you?' },
      { s: 'you', t: '奥歯が少し痛いんです。', r: 'おくば が すこし いたい ん です。', e: 'My back tooth hurts a bit.', wrong: [
        ['奥歯を少し痛いんです。', 'おくば お すこし いたい ん です。', 'itai is an adjective, not a verb — the part that hurts takes ga, not o.'],
        ['奥歯が少し痛かったです。', 'おくば が すこし いたかった です。', 'itakatta is past tense. The tooth still hurts now, so it stays itai.'],
        ['奥歯が少し痛いですか。', 'おくば が すこし いたい です か。', 'Adding ka turns your own symptom into a question — you are telling them, not asking.']
      ] },
      { s: 'other', t: '木曜日の三時はいかがですか。', r: 'もくようび の さんじ わ いかが です か。', e: 'How about Thursday at three?' },
      { s: 'you', t: '大丈夫です。お願いします。', r: 'だいじょうぶ です。おねがいします。', e: 'That works. Please.', wrong: [
        ['結構です。', 'けっこう です。', 'kekkou desu at a counter usually REFUSES — "no thank you". Dangerous word.'],
        ['いいです。', 'いい です。', 'Also ambiguous — it can mean "no need". daijoubu desu with onegai shimasu is unambiguous.']
      ] },
      { s: 'other', t: 'かしこまりました。木曜日の三時にお待ちしております。', r: 'かしこまりました。もくようび の さんじ に おまち して おります。', e: "Understood. We'll be expecting you Thursday at three." },
      { s: 'you', t: 'よろしくお願いします。失礼します。', r: 'よろしく おねがいします。しつれい します。', e: 'Thank you, goodbye.', wrong: [
        ['よろしくお願いします。さようなら。', 'よろしく おねがいします。さようなら。', 'sayounara sounds like a final farewell to a person, not how a phone call with a business ends — shitsurei shimasu is the norm.'],
        ['よろしくお願いします。ばいばい。', 'よろしく おねがいします。ばいばい。', 'baibai is casual, for friends — far too informal for hanging up on a clinic.']
      ] }
    ]
  },
  {
    code: 'health-dentist-visit',
    unit: 'health',
    title: 'In the dentist chair',
    situation: 'The dentist asks where it hurts.',
    turns: [
      { s: 'other', t: 'お待たせしました。椅子に座ってください。', r: 'おまたせ しました。いす に すわって ください。', e: 'Sorry to keep you waiting. Please sit in the chair.' },
      { s: 'you', t: 'はい、失礼します。', r: 'はい、しつれい します。', e: 'Right, thank you.', wrong: [
        ['はい、いただきます。', 'はい、いただきます。', 'itadakimasu is said before eating or receiving something — not when following an instruction to sit down.'],
        ['はい、ごめんなさい。', 'はい、ごめんなさい。', 'gomennasai apologizes for a fault. You have done nothing wrong — shitsurei shimasu is the polite acknowledgement here.']
      ] },
      { s: 'other', t: 'どこが痛いですか。', r: 'どこ が いたい です か。', e: 'Where does it hurt?' },
      { s: 'you', t: '右の奥歯が痛いです。', r: 'みぎ の おくば が いたい です。', e: 'My back right tooth hurts.', wrong: [
        ['右の奥歯を痛いです。', 'みぎ の おくば お いたい です。', 'itai is an adjective, not a verb — what hurts takes ga.'],
        ['右の奥歯が痛みます。', 'みぎ の おくば が いたみます。', 'Understandable, but itamu is written or clinical. In speech it is itai desu.']
      ] },
      { s: 'other', t: 'いつからですか。', r: 'いつ から です か。', e: 'Since when?' },
      { s: 'you', t: '一週間くらい前からです。', r: 'いっしゅうかん くらい まえ から です。', e: 'About a week ago.', wrong: [
        ['一週間くらい前までです。', 'いっしゅうかん くらい まえ まで です。', 'made is an end point. The pain STARTED then, so kara.'],
        ['一週間くらい後からです。', 'いっしゅうかん くらい あと から です。', 'ato is after — that puts it in the future.']
      ] },
      { s: 'other', t: '冷たいものを飲むと痛みますか。', r: 'つめたい もの お のむ と いたみます か。', e: 'Does it hurt when you drink something cold?' },
      { s: 'you', t: 'はい、冷たいものを飲むと痛みます。', r: 'はい、つめたい もの お のむ と いたみます。', e: 'Yes, it hurts when I drink something cold.', wrong: [
        ['はい、冷たいものを飲むと痛かったです。', 'はい、つめたい もの お のむ と いたかった です。', 'itakatta is past tense. This is a symptom that keeps happening now, so it stays itamimasu.'],
        ['はい、冷たいものが飲むと痛みます。', 'はい、つめたい もの が のむ と いたみます。', 'nomu takes an object — the thing you drink is marked by o, not ga.']
      ] },
      { s: 'other', t: 'では、レントゲンを撮りますね。口を大きく開けてください。', r: 'では、レントゲン お とります ね。くち お おおきく あけて ください。', e: "Right, let's take an X-ray. Please open your mouth wide." },
      { s: 'you', t: 'はい、わかりました。', r: 'はい、わかりました。', e: 'Okay, got it.', wrong: [
        ['はい、わかります。', 'はい、わかります。', 'wakarimasu is a standing ability. Acknowledging an instruction just given is wakarimashita.'],
        ['はい、知っています。', 'はい、しって います。', 'shitte imasu claims prior knowledge — unrelated to acknowledging what was just said.']
      ] },
      { s: 'other', t: '虫歯がありますね。今日は詰め物をしましょう。', r: 'むしば が あります ね。きょう わ つめもの お しましょう。', e: "You have a cavity. Let's fill it today." },
      { s: 'you', t: 'お願いします。痛くないですか。', r: 'おねがいします。いたくない です か。', e: "Please do. Won't it hurt?", wrong: [
        ['痛いじゃないですか。', 'いたい じゃない です か。', 'janai negates nouns and na-adjectives. itai is an i-adjective — its negative is itakunai.'],
        ['痛くないでした。', 'いたく ない でした。', 'The past of an i-adjective negative is itakunakatta desu, not itakunai deshita.']
      ] },
      { s: 'other', t: '麻酔をしますので、少しちくっとしますよ。', r: 'ますい お します ので、すこし ちくっと します よ。', e: "I'll give you some anesthetic, so you'll feel a little prick." },
      { s: 'you', t: 'はい、大丈夫です。お願いします。', r: 'はい、だいじょうぶ です。おねがいします。', e: "Okay, that's fine. Go ahead.", wrong: [
        ['結構です。', 'けっこう です。', 'kekkou desu here usually REFUSES — "no thank you". Dangerous word to say to your dentist mid-treatment.'],
        ['いいです。', 'いい です。', 'Also ambiguous — it can mean "no need". daijoubu desu with onegai shimasu is unambiguous.']
      ] }
    ]
  },
  {
    code: 'health-pharmacy-book',
    unit: 'health',
    title: 'At the pharmacy',
    situation: 'You are handing in a prescription.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。', r: 'いらっしゃいませ。', e: 'Welcome.' },
      { s: 'you', t: '処方箋をお願いします。', r: 'しょほうせん お おねがいします。', e: 'My prescription, please.', wrong: [
        ['処方箋をください。', 'しょほうせん お ください。', 'kudasai asks them to GIVE you a prescription. You are handing yours over.'],
        ['処方箋がお願いします。', 'しょほうせん が おねがいします。', 'What you present takes o.']
      ] },
      { s: 'other', t: 'お薬手帳はお持ちですか。', r: 'おくすり てちょう わ おもち です か。', e: 'Do you have your medicine record book?' },
      { s: 'you', t: 'いいえ、持っていません。', r: 'いいえ、もって いません。', e: 'No, I do not have one.', wrong: [
        ['いいえ、持ちません。', 'いいえ、もちません。', 'mochimasen says you will not carry one. Not currently having it is motte imasen.'],
        ['いいえ、ありません。', 'いいえ、ありません。', 'Not wrong for existence, but for possession the natural answer is motte imasen.']
      ] },
      { s: 'other', t: 'では、お作りしますね。', r: 'では、おつくりします ね。', e: 'I will make you one, then.' },
      { s: 'you', t: 'お願いします。少しかかりますか。', r: 'おねがいします。すこし かかります か。', e: 'Please do. Will it take a while?', wrong: [
        ['少しかけますか。', 'すこし かけます か。', 'kakeru means to hang or spend something deliberately. Time TAKING itself is kakaru.'],
        ['少しかかりましたか。', 'すこし かかりました か。', 'Asking about now, but past tense implies it already happened.']
      ] },
      { s: 'other', t: '十分ほどお待ちいただけますか。呼びますので。', r: 'じゅっぷん ほど おまち いただけます か。よびます ので。', e: "Could you wait about ten minutes? I'll call your name." },
      { s: 'you', t: 'はい、わかりました。', r: 'はい、わかりました。', e: 'Okay, sure.', wrong: [
        ['はい、わかります。', 'はい、わかります。', 'wakarimasu is a general ability, not an acknowledgement of a specific instruction just given — that is wakarimashita.'],
        ['はい、知っています。', 'はい、しって います。', 'shitte imasu claims prior knowledge, unrelated to acknowledging what was just said.']
      ] },
      { s: 'other', t: '田中さーん、お待たせしました。', r: 'たなか さーん、おまたせ しました。', e: 'Tanaka? Sorry for the wait.' },
      { s: 'you', t: 'はい、田中です。', r: 'はい、たなか です。', e: "Yes, that's me.", wrong: [
        ['はい、田中でした。', 'はい、たなか でした。', 'deshita is past tense. Confirming your own identity right now stays present: desu.'],
        ['はい、田中と申しました。', 'はい、たなか と もうしました。', 'moushimashita implies you introduced yourself earlier. Confirming a name just called is a plain desu.']
      ] },
      { s: 'other', t: 'お薬です。一日三回、食後に飲んでください。', r: 'おくすり です。いちにち さんかい、しょくご に のんで ください。', e: 'Here is your medicine. Take it three times a day after meals.' },
      { s: 'you', t: 'わかりました。副作用はありますか。', r: 'わかりました。ふくさよう わ あります か。', e: 'Got it. Are there any side effects?', wrong: [
        ['わかりました。副作用がいますか。', 'わかりました。ふくさよう が います か。', 'iru is for animate beings. The existence of side effects is inanimate, so it takes aru/arimasu.'],
        ['わかりました。副作用をありますか。', 'わかりました。ふくさよう お あります か。', 'arimasu is an intransitive existence verb — its subject takes ga, not o.']
      ] },
      { s: 'other', t: '眠くなることがありますので、車の運転は気をつけてくださいね。', r: 'ねむく なる こと が あります ので、くるま の うんてん わ き お つけて ください ね。', e: 'It can make you drowsy, so be careful driving.' },
      { s: 'you', t: 'わかりました。ありがとうございました。', r: 'わかりました。ありがとうございました。', e: 'Understood, thank you.', wrong: [
        ['わかりました。ごちそうさまでした。', 'わかりました。ごちそうさま でした。', 'gochisousama is said after eating — irrelevant to thanking a pharmacist.'],
        ['わかりました。お疲れ様でした。', 'わかりました。おつかれさま でした。', 'otsukaresama acknowledges a colleague\'s effort as an equal — not how a customer thanks pharmacy staff.']
      ] }
    ]
  },
  {
    code: 'health-symptoms',
    unit: 'health',
    title: 'Describing a cold',
    situation: 'At the clinic reception.',
    turns: [
      { s: 'other', t: '次の方、どうぞ。', r: 'つぎ の かた、どうぞ。', e: 'Next patient, please.' },
      { s: 'you', t: '失礼します。', r: 'しつれい します。', e: 'Excuse me, coming in.', wrong: [
        ['こんにちは。', 'こんにちは。', 'Too plain a greeting for entering a doctor\'s exam room — shitsurei shimasu is the set phrase.'],
        ['いってきます。', 'いってきます。', 'itte kimasu is said when leaving home — irrelevant here.']
      ] },
      { s: 'other', t: '今日はどうされましたか。', r: 'きょう わ どう されました か。', e: 'What brings you in today?' },
      { s: 'you', t: '熱があって、喉が痛いです。', r: 'ねつ が あって、のど が いたい です。', e: 'I have a fever and a sore throat.', wrong: [
        ['熱があって、喉を痛いです。', 'ねつ が あって、のど お いたい です。', 'itai is an adjective; the sore part takes ga.'],
        ['熱がいて、喉が痛いです。', 'ねつ が いて、のど が いたい です。', 'iru is for animate things. A fever takes aru, so the te-form is atte.']
      ] },
      { s: 'other', t: 'いつからですか。', r: 'いつ から です か。', e: 'Since when?' },
      { s: 'you', t: '昨日の夜からです。', r: 'きのう の よる から です。', e: 'Since last night.', wrong: [
        ['昨日の夜までです。', 'きのう の よる まで です。', 'made marks an end point. The fever STARTED then, so it needs kara.'],
        ['昨日の夜後です。', 'きのう の よる あと です。', 'ato means afterward — that puts the start in the future, not last night.']
      ] },
      { s: 'other', t: '熱は何度ですか。', r: 'ねつ わ なんど です か。', e: 'What is your temperature?' },
      { s: 'you', t: '三十八度ありました。', r: 'さんじゅうはち ど ありました。', e: 'It was 38.', wrong: [
        ['三十八度でした。', 'さんじゅうはち ど でした。', 'Understandable, but with a measured quantity the idiom is arimashita.'],
        ['三十八度がありました。', 'さんじゅうはち ど が ありました。', 'A counted amount before aru takes no particle.']
      ] },
      { s: 'other', t: '咳や鼻水はありますか。', r: 'せき や はなみず わ あります か。', e: 'Do you have a cough or runny nose?' },
      { s: 'you', t: '咳は少しありますが、鼻水はありません。', r: 'せき わ すこし あります が、はなみず わ ありません。', e: 'I have a bit of a cough, but no runny nose.', wrong: [
        ['咳は少しいますが、鼻水はいません。', 'せき わ すこし います が、はなみず わ いません。', 'iru is for animate things. A cough or runny mucus existing takes aru, so arimasu/arimasen.'],
        ['咳は少しあります、鼻水はないです。', 'せき わ すこし あります、はなみず わ ない です。', 'Mixing the polite arimasu with the plain nai desu mid-sentence — keep both clauses polite: arimasen.']
      ] },
      { s: 'other', t: '風邪ですね。お薬を出しておきますので、しっかり休んでください。', r: 'かぜ です ね。おくすり お だして おきます ので、しっかり やすんで ください。', e: "It's a cold. I'll prescribe medicine, so please rest well." },
      { s: 'you', t: 'わかりました。お風呂に入ってもいいですか。', r: 'わかりました。おふろ に はいって も いい です か。', e: 'Understood. Is it okay to take a bath?', wrong: [
        ['お風呂を入ってもいいですか。', 'おふろ お はいって も いい です か。', 'hairu is a motion verb — the place you enter takes ni, not o.'],
        ['お風呂に入ってもいいでしょう。', 'おふろ に はいって も いい でしょう。', 'deshou without ka just asserts your own guess. Asking permission needs the question ka: ii desu ka.']
      ] },
      { s: 'other', t: '熱がある間はシャワーだけにしてくださいね。', r: 'ねつ が ある あいだ わ シャワー だけ に して ください ね。', e: 'While you have a fever, please just take showers.' },
      { s: 'you', t: 'わかりました。ありがとうございました。', r: 'わかりました。ありがとうございました。', e: 'Understood, thank you.', wrong: [
        ['わかりました。お大事に。', 'わかりました。おだいじ に。', 'odaiji ni is said BY the medical staff TO the patient — not the other way around.'],
        ['わかりました。お疲れ様でした。', 'わかりました。おつかれさま でした。', 'otsukaresama acknowledges a colleague\'s effort — not how a patient thanks a doctor.']
      ] }
    ]
  },
  {
    code: 'services-delivery',
    unit: 'services',
    title: 'A delivery at the door',
    situation: 'The intercom goes.',
    turns: [
      { s: 'you', t: 'はい、どちら様ですか。', r: 'はい、どちら さま です か。', e: 'Hello, who is it?', wrong: [
        ['はい、誰ですか。', 'はい、だれ です か。', 'dare is blunt for a stranger at the door — donata or dochira-sama is the polite way to ask.'],
        ['はい、あなたは誰ですか。', 'はい、あなた わ だれ です か。', 'anata directly at someone you cannot see comes across as confrontational — just dochira-sama de shou ka.']
      ] },
      { s: 'other', t: '宅配便です。お荷物お届けにあがりました。', r: 'たくはいびん です。おにもつ おとどけ に あがりました。', e: 'Delivery. I have a parcel for you.' },
      { s: 'you', t: '今開けます。少々お待ちください。', r: 'いま あけます。しょうしょう おまち ください。', e: 'Opening now. One moment.', wrong: [
        ['今開きます。少々お待ちください。', 'いま あきます。しょうしょう おまち ください。', 'aku is intransitive — the door opens by itself. You are opening it: akeru.'],
        ['今開けます。少々待ちます。', 'いま あけます。しょうしょう まちます。', 'That says YOU will wait. Asking them to wait is omachi kudasai.']
      ] },
      { s: 'other', t: 'お待たせしました。田中様のお荷物です。', r: 'おまたせ しました。たなか さま の おにもつ です。', e: 'Sorry to keep you waiting. This is a parcel for Mr. Tanaka.' },
      { s: 'you', t: 'はい、私です。', r: 'はい、わたし です。', e: "Yes, that's me.", wrong: [
        ['はい、僕です。', 'はい、ぼく です。', 'boku is casual and masculine — too informal a register for confirming your name to delivery staff.'],
        ['はい、これです。', 'はい、これ です。', 'kore points at a thing. Confirming that YOU are the addressee needs watashi desu, not kore desu.']
      ] },
      { s: 'other', t: '冷蔵便ですので、お早めに冷蔵庫へ入れてくださいね。', r: 'れいぞうびん です ので、おはやめ に れいぞうこ え いれて ください ね。', e: 'This is a refrigerated delivery, so please put it in the fridge soon.' },
      { s: 'you', t: 'わかりました。ありがとうございます。', r: 'わかりました。ありがとうございます。', e: 'Got it, thank you.', wrong: [
        ['わかりました。ごちそうさまでした。', 'わかりました。ごちそうさま でした。', 'gochisousama is said after eating — irrelevant to receiving a package.'],
        ['わかりました。いただきます。', 'わかりました。いただきます。', 'itadakimasu precedes eating or receiving something as a gift — not fitting for a delivered parcel.']
      ] },
      { s: 'other', t: 'こちらにサインをお願いします。', r: 'こちら に サイン お おねがいします。', e: 'Sign here, please.' },
      { s: 'you', t: 'はい。ご苦労さまです。', r: 'はい。ごくろうさま です。', e: 'Here you go. Thanks for your trouble.', wrong: [
        ['はい。お疲れさまです。', 'はい。おつかれさま です。', 'Not wrong, but otsukaresama is for colleagues. To someone delivering to you, gokurousama fits.'],
        ['はい。いただきます。', 'はい。いただきます。', 'That is for eating or receiving a gift, not a parcel at the door.']
      ] },
      { s: 'other', t: 'ありがとうございました。失礼します。', r: 'ありがとうございました。しつれい します。', e: 'Thank you. Goodbye.' },
      { s: 'you', t: 'はい、失礼します。', r: 'はい、しつれい します。', e: 'Right, goodbye.', wrong: [
        ['はい、さようなら。', 'はい、さようなら。', 'sayounara sounds like a final farewell to a person you know — for a brief exchange at the door, shitsurei shimasu fits better.'],
        ['はい、じゃあね。', 'はい、じゃあ ね。', 'jaa ne is casual, for friends — too familiar for someone delivering a parcel to your door.']
      ] }
    ]
  },
  {
    code: 'services-redeliver',
    unit: 'services',
    title: 'Rearranging a delivery',
    situation: 'You missed the parcel and are calling back.',
    turns: [
      { s: 'other', t: 'はい、さくら運輸でございます。', r: 'はい、さくら うんゆ で ございます。', e: 'Hello, Sakura Delivery, how can I help?' },
      { s: 'you', t: '再配達をお願いしたいのですが。', r: 'さいはいたつ お おねがい したい の です が。', e: 'I would like to arrange a redelivery.', wrong: [
        ['再配達をしたいのですが。', 'さいはいたつ お したい の です が。', 'That says YOU want to redeliver it. You want them to: onegai shitai.'],
        ['再配達がお願いしたいのですが。', 'さいはいたつ が おねがい したい の です が。', 'onegai suru takes an object: o.']
      ] },
      { s: 'other', t: '伝票番号はお分かりになりますか。', r: 'でんぴょう ばんごう わ おわかり に なります か。', e: 'Do you know the tracking slip number?' },
      { s: 'you', t: 'すみません、わかりません。不在票を見ながら電話しています。', r: 'すみません、わかりません。ふざいひょう お みながら でんわ して います。', e: "Sorry, I don't know. I'm calling while looking at the notice.", wrong: [
        ['すみません、知りません。', 'すみません、しりません。', 'shirimasen flatly denies knowing something and sounds curt here. For "I can\'t tell," wakarimasen is the natural, softer choice.'],
        ['すみません、わかりませんでした。', 'すみません、わかりません でした。', 'You still do not know right now — that is present tense wakarimasen, not the past wakarimasendeshita.']
      ] },
      { s: 'other', t: 'では、お客様のお名前とご住所を伺えますか。', r: 'では、おきゃくさま の おなまえ と ごじゅうしょ お うかがえます か。', e: 'Then may I get your name and address?' },
      { s: 'you', t: '田中です。住所は渋谷区一丁目二番三号です。', r: 'たなか です。じゅうしょ わ しぶやく いっちょうめ にばん さんごう です。', e: "I'm Tanaka. My address is 1-2-3 Shibuya-ku.", wrong: [
        ['住所は渋谷区一、二、三です。', 'じゅうしょ わ しぶやく いち、に、さん です。', 'Japanese addresses use the counters choume, ban, gou for each part — not bare numbers.'],
        ['住所が渋谷区一丁目二番三号です。', 'じゅうしょ が しぶやく いっちょうめ にばん さんごう です。', 'You are stating your own address as the requested info — topic marker wa fits, not ga.']
      ] },
      { s: 'other', t: 'ご希望のお時間は。', r: 'ごきぼう の おじかん わ。', e: 'What time would you like?' },
      { s: 'you', t: '夜の七時以降でお願いします。', r: 'よる の しちじ いこう で おねがいします。', e: 'After seven in the evening, please.', wrong: [
        ['夜の七時以内でお願いします。', 'よる の しちじ いない で おねがいします。', 'inai means within a span. After a point in time is ikou.'],
        ['夜の七時までにお願いします。', 'よる の しちじ まで に おねがいします。', 'That asks for it BEFORE seven — the opposite.']
      ] },
      { s: 'other', t: '申し訳ございませんが、七時以降は埋まっておりまして。六時ではいかがですか。', r: 'もうしわけ ございません が、しちじ いこう わ うまって おりまして。ろくじ で わ いかが です か。', e: "I'm afraid after seven is fully booked. How about six?" },
      { s: 'you', t: '六時はちょっと難しいので、八時から九時の間でお願いできますか。', r: 'ろくじ わ ちょっと むずかしい ので、はちじ から くじ の あいだ で おねがい できます か。', e: 'Six is a bit difficult — could you do between eight and nine instead?', wrong: [
        ['六時がちょっと難しいので、八時から九時の間でお願いできますか。', 'ろくじ が ちょっと むずかしい ので、はちじ から くじ の あいだ で おねがい できます か。', 'Rejecting a suggested TIME as your topic needs wa, not ga: rokuji wa chotto muzukashii.'],
        ['六時はちょっと難しいですから、八時から九時の間でお願いします。', 'ろくじ わ ちょっと むずかしい です から、はちじ から くじ の あいだ で おねがいします。', 'Ending with onegai shimasu states a flat request. Asking if it is possible is the softer onegai dekimasu ka.']
      ] },
      { s: 'other', t: 'かしこまりました。では八時半でご用意できますが、よろしいですか。', r: 'かしこまりました。では はちじはん で ごようい できます が、よろしい です か。', e: 'Understood. I can arrange 8:30 — does that work?' },
      { s: 'you', t: 'はい、それでお願いします。', r: 'はい、それ で おねがいします。', e: 'Yes, that works, please.', wrong: [
        ['それで結構です。', 'それ で けっこう です。', 'kekkou desu here reads as "no, that\'s fine as is" — a polite decline, not confirmation you want it.'],
        ['それでいいです。', 'それ で いい です。', 'ii desu on its own leans toward "no need" — pair acceptance with onegaishimasu to be unambiguous.']
      ] },
      { s: 'other', t: 'では八時半にお伺いします。ありがとうございました。', r: 'では はちじはん に おうかがい します。ありがとうございました。', e: "We'll come at 8:30, then. Thank you." },
      { s: 'you', t: 'よろしくお願いします。失礼します。', r: 'よろしく おねがいします。しつれい します。', e: 'Thank you, goodbye.', wrong: [
        ['よろしくお願いします。さようなら。', 'よろしく おねがいします。さようなら。', 'sayounara suits a final goodbye to a person face to face — a phone call like this ends with shitsurei shimasu.'],
        ['よろしくお願いします。またね。', 'よろしく おねがいします。また ね。', 'mata ne is casual, used with friends expecting to meet again soon — too familiar for a delivery company.']
      ] }
    ]
  },
  {
    code: 'home-repair',
    unit: 'home',
    title: 'Reporting something broken',
    situation: 'The air conditioner has stopped.',
    turns: [
      { s: 'other', t: 'はい、さくら管理会社です。', r: 'はい、さくら かんり がいしゃ です。', e: 'Hello, Sakura Management, how can I help?' },
      { s: 'you', t: 'エアコンが壊れてしまったんですが。', r: 'エアコン が こわれて しまった ん です が。', e: 'The air conditioner has broken.', wrong: [
        ['エアコンを壊してしまったんですが。', 'エアコン お こわして しまった ん です が。', 'kowasu means YOU broke it. If it failed by itself, it is kowareru.'],
        ['エアコンが壊れます。', 'エアコン が こわれます。', 'That predicts it will break. It already has: kowarete shimatta.']
      ] },
      { s: 'other', t: 'いつからですか。', r: 'いつ から です か。', e: 'Since when?' },
      { s: 'you', t: '昨日の夜からつきません。', r: 'きのう の よる から つきません。', e: 'It has not come on since last night.', wrong: [
        ['昨日の夜からつけません。', 'きのう の よる から つけません。', 'tsukeru is to switch it on. Whether it comes on by itself is tsuku.'],
        ['昨日の夜までつきません。', 'きのう の よる まで つきません。', 'made is up until — that says it worked from last night onward.']
      ] },
      { s: 'other', t: 'お部屋番号を教えていただけますか。', r: 'おへや ばんごう お おしえて いただけます か。', e: 'Could you tell me your room number?' },
      { s: 'you', t: '305号室の田中です。', r: 'さん まる ご ごうしつ の たなか です。', e: "I'm Tanaka, room 305.", wrong: [
        ['305号室が田中です。', 'さん まる ご ごうしつ が たなか です。', 'You are linking the room and your name — the connector is no, not ga.'],
        ['三百五号室の田中です。', 'さんびゃくご ごうしつ の たなか です。', 'Room numbers are read digit by digit — san-zero-go, not the compound number sanbyakugo.']
      ] },
      { s: 'other', t: '明日、業者が伺います。', r: 'あした、ぎょうしゃ が うかがいます。', e: 'An engineer will come tomorrow.' },
      { s: 'you', t: '何時ごろになりますか。', r: 'なんじ ごろ に なります か。', e: 'About what time will that be?', wrong: [
        ['何時ごろでなりますか。', 'なんじ ごろ で なります か。', 'naru resulting in a time takes ni, not de.'],
        ['何時ごろになりましたか。', 'なんじ ごろ に なりました か。', 'Past tense asks about something already decided. You are asking about the future visit: narimasu ka.']
      ] },
      { s: 'other', t: '午前十時から十二時の間に伺う予定です。', r: 'ごぜん じゅうじ から じゅうにじ の あいだ に うかがう よてい です。', e: 'The plan is to come between 10am and noon.' },
      { s: 'you', t: 'わかりました。部屋にはいないといけませんか。', r: 'わかりました。へや に わ いない と いけません か。', e: 'Understood. Do I need to be home?', wrong: [
        ['部屋がいないといけませんか。', 'へや が いない と いけません か。', 'The room is the location you must be IN, so it takes ni, not ga.'],
        ['部屋にいなくてもいけませんか。', 'へや に いなくても いけません か。', 'inakutemo ii would mean "even without being there is fine" — the opposite. You are asking if you MUST be there: inai to ikemasen.']
      ] },
      { s: 'other', t: '大丈夫です。管理人が鍵で開けますので。', r: 'だいじょうぶ です。かんりにん が かぎ で あけます ので。', e: 'No need — the caretaker can let them in with a key.' },
      { s: 'you', t: 'そうですか。助かります。ありがとうございます。', r: 'そう です か。たすかります。ありがとうございます。', e: "Oh, that's a relief. Thank you.", wrong: [
        ['そうですか。助けます。ありがとうございます。', 'そう です か。たすけます。ありがとうございます。', 'tasukeru means "I will rescue/help" — you mean the opposite, that YOU are being helped: tasukaru.'],
        ['そうですか。助かられます。ありがとうございます。', 'そう です か。たすかられます。ありがとうございます。', 'tasukaru is already the intransitive "be helped" — adding the passive -rareru on top is redundant and ungrammatical.']
      ] },
      { s: 'other', t: 'では明日よろしくお願いします。', r: 'では あした よろしく おねがいします。', e: 'Alright, thanks for tomorrow, then.' },
      { s: 'you', t: 'よろしくお願いします。失礼します。', r: 'よろしく おねがいします。しつれい します。', e: 'Thank you, goodbye.', wrong: [
        ['よろしくお願いします。さようなら。', 'よろしく おねがいします。さようなら。', 'sayounara suits a final goodbye to a person face to face — a phone call like this ends with shitsurei shimasu.'],
        ['よろしくお願いします。ばいばい。', 'よろしく おねがいします。ばいばい。', 'baibai is casual, for friends — too informal for a call with the management company.']
      ] }
    ]
  },
  {
    code: 'home-neighbour',
    unit: 'home',
    title: 'Meeting a neighbour',
    situation: 'You have just moved in.',
    turns: [
      { s: 'other', t: 'はい、どちら様ですか。', r: 'はい、どちら さま です か。', e: 'Yes, who is it?' },
      { s: 'you', t: '隣に越してきました田中です。', r: 'となり に こして きました たなか です。', e: 'I am Tanaka, just moved in next door.', wrong: [
        ['隣に越していきました田中です。', 'となり に こして いきました たなか です。', 'te-iku moves away from here. Moving in toward where you both are is te-kuru.'],
        ['隣に越します田中です。', 'となり に こします たなか です。', 'That says you will move in later. You have already: koshite kimashita.']
      ] },
      { s: 'other', t: 'あら、よろしくお願いします。', r: 'あら、よろしく おねがいします。', e: 'Oh, pleased to meet you.' },
      { s: 'you', t: 'こちらこそ、よろしくお願いします。', r: 'こちらこそ、よろしく おねがいします。', e: 'Likewise, pleased to meet you.', wrong: [
        ['はい、よろしくお願いします。', 'はい、よろしく おねがいします。', 'Fine but flat. kochira koso returns the greeting properly.'],
        ['ありがとうございます。', 'ありがとうございます。', 'They greeted you rather than doing you a favour.']
      ] },
      { s: 'other', t: 'そうですか。荷物運び、大変でしたね。', r: 'そう です か。にもつ はこび、たいへん でした ね。', e: 'Is that so. The moving must have been tough.' },
      { s: 'you', t: 'つまらないものですが、どうぞ。', r: 'つまらない もの です が、どうぞ。', e: "It's nothing much, but please take this.", wrong: [
        ['素晴らしいものですが、どうぞ。', 'すばらしい もの です が、どうぞ。', 'Calling your own gift "wonderful" breaks the humble convention — the set phrase downplays it as nothing much.'],
        ['つまらないものをください。', 'つまらない もの お ください。', 'kudasai asks THEM for something. Handing yours over is douzo.']
      ] },
      { s: 'other', t: 'あら、そんな、すみません。ありがとうございます。', r: 'あら、そんな、すみません。ありがとうございます。', e: "Oh, you shouldn't have. Thank you." },
      { s: 'you', t: 'いえいえ、些細なものですので。', r: 'いえいえ、ささいな もの です ので。', e: "No no, it's a small thing.", wrong: [
        ['いえいえ、大きいものですので。', 'いえいえ、おおきい もの です ので。', 'Calling your own gift "big" breaks the humble convention — the set phrase downplays it as small.'],
        ['いえいえ、些細なことですので。', 'いえいえ、ささいな こと です ので。', 'koto is an abstract matter; a physical gift is mono, not koto.']
      ] },
      { s: 'other', t: 'お名前、もう一度いいですか。', r: 'おなまえ、もう いちど いい です か。', e: 'Sorry, could I get your name again?' },
      { s: 'you', t: '田中と申します。よろしくお願いします。', r: 'たなか と もうします。よろしく おねがいします。', e: "I'm Tanaka. Pleased to meet you.", wrong: [
        ['田中と言いました。よろしくお願いします。', 'たなか と いいました。よろしく おねがいします。', 'iimashita is past tense — you are stating your name right now, so it stays present: to moushimasu.'],
        ['田中と申します。よろしくお願いしました。', 'たなか と もうします。よろしく おねがい しました。', 'onegai shimashita puts the set greeting in the past — the fixed phrase stays present tense: onegai shimasu.']
      ] },
      { s: 'other', t: '何かあったら、いつでも声かけてくださいね。', r: 'なにか あったら、いつでも こえ かけて ください ね。', e: 'If anything comes up, feel free to call out anytime.' },
      { s: 'you', t: 'ありがとうございます。そちらも何かあれば、おっしゃってください。', r: 'ありがとうございます。そちら も なにか あれば、おっしゃって ください。', e: 'Thank you. Please let me know too if you ever need anything.', wrong: [
        ['そちらも何かあれば、申し上げてください。', 'そちら も なにか あれば、もうしあげて ください。', 'moushiageru is a humble form for YOUR OWN actions toward someone above you — asking them to speak needs the respectful ossharu.'],
        ['そちらも何かあれば、いただいてください。', 'そちら も なにか あれば、いただいて ください。', 'itadaku means to receive, not to say — asking them to speak up needs ossharu or itte kudasai.']
      ] },
      { s: 'other', t: 'はい、こちらこそ。じゃあ、また。', r: 'はい、こちらこそ。じゃあ、また。', e: 'Yes, likewise. See you around.' },
      { s: 'you', t: 'はい、失礼します。', r: 'はい、しつれい します。', e: 'Right, goodbye.', wrong: [
        ['はい、さようなら。', 'はい、さようなら。', 'sayounara is a final, formal farewell — too heavy for a quick chat with a neighbour you will see again.'],
        ['はい、お疲れ様でした。', 'はい、おつかれさま でした。', 'otsukaresama acknowledges someone\'s work effort, like to a colleague — a neighbourly chat is not work.']
      ] }
    ]
  },
  {
    code: 'home-rubbish-day',
    unit: 'home',
    title: 'Asking about the rubbish',
    situation: 'You do not know which day burnables go out.',
    turns: [
      { s: 'other', t: 'あ、田中さん、おはようございます。', r: 'あ、たなか さん、おはよう ございます。', e: 'Oh, Mr. Tanaka, good morning.' },
      { s: 'you', t: 'おはようございます。あの、ちょっと伺いたいことがあるんですが。', r: 'おはよう ございます。あの、ちょっと うかがいたい こと が ある ん です が。', e: 'Good morning. Um, I have something I wanted to ask.', wrong: [
        ['あの、ちょっと伺いますことがあるんですが。', 'あの、ちょっと うかがいます こと が ある ん です が。', 'A verb modifying a noun (koto) uses the plain dictionary form, not the polite -masu form — ukagau koto, not ukagaimasu koto.'],
        ['あの、ちょっと伺いたいことでした。', 'あの、ちょっと うかがいたい こと でした。', 'deshita puts this in the past. You have the question right now, so it stays present desu.']
      ] },
      { s: 'other', t: 'はい、何でしょう。', r: 'はい、なん でしょう。', e: 'Yes, what is it?' },
      { s: 'you', t: '燃えるゴミは何曜日ですか。', r: 'もえる ゴミ わ なんようび です か。', e: 'Which day is burnable rubbish?', wrong: [
        ['燃えるゴミは何日ですか。', 'もえる ゴミ わ なんにち です か。', 'nannichi asks which date of the month. A weekday is nanyoubi.'],
        ['燃えるゴミが何曜日ですか。', 'もえる ゴミ が なんようび です か。', 'The rubbish is your topic, so wa.']
      ] },
      { s: 'other', t: '火曜と金曜ですよ。朝八時までに出してください。', r: 'かよう と きんよう です よ。あさ はちじ まで に だして ください。', e: 'Tuesday and Friday. Put it out by eight.' },
      { s: 'you', t: 'わかりました。ありがとうございます。', r: 'わかりました。ありがとうございます。', e: 'Understood, thank you.', wrong: [
        ['知っています。ありがとうございます。', 'しって います。ありがとうございます。', 'shitte imasu claims you already knew, which contradicts having asked.'],
        ['わかります。ありがとうございます。', 'わかります。ありがとうございます。', 'wakarimasu is a standing ability. Having just grasped something is wakarimashita.']
      ] },
      { s: 'other', t: 'いえ、他にも何か聞きたいことがあれば、どうぞ。', r: 'いえ、ほか に も なにか ききたい こと が あれば、どうぞ。', e: 'No trouble — ask away if there is anything else.' },
      { s: 'you', t: 'では、プラスチックは何曜日ですか。', r: 'では、プラスチック わ なんようび です か。', e: 'Then, which day is plastic?', wrong: [
        ['では、プラスチックが何曜日ですか。', 'では、プラスチック が なんようび です か。', 'Plastic is your new topic here, so it takes wa, not ga.'],
        ['では、プラスチックは何日ですか。', 'では、プラスチック わ なんにち です か。', 'nannichi asks for a date of the month. A weekday is nanyoubi.']
      ] },
      { s: 'other', t: 'プラスチックは水曜日です。それから、資源ゴミは第二土曜日ですよ。', r: 'プラスチック わ すいようび です。それから、しげん ゴミ わ だいに どようび です よ。', e: 'Plastic is Wednesday. And recyclables are the second Saturday.' },
      { s: 'you', t: '第二土曜日というと、来月は何日ですか。', r: 'だいに どようび という と、らいげつ わ なんにち です か。', e: 'The second Saturday — what date would that be next month?', wrong: [
        ['第二土曜日と言ったら、来月は何日でしたか。', 'だいに どようび と いったら、らいげつ わ なんにち でした か。', 'deshita asks about the past. You want an upcoming date, so it stays desu ka.'],
        ['第二土曜日ということは、来月が何日ですか。', 'だいに どようび という こと わ、らいげつ が なんにち です か。', 'What you are asking about — the date — is the topic here, so it takes wa: raigetsu wa.']
      ] },
      { s: 'other', t: 'ええと、来月は十二日です。', r: 'ええと、らいげつ わ じゅうに にち です。', e: 'Let me see, next month it is the 12th.' },
      { s: 'you', t: '粗大ゴミはどうすればいいですか。', r: 'そだい ゴミ わ どう すれば いい です か。', e: 'What should I do about bulky trash?', wrong: [
        ['粗大ゴミはどうしますか。', 'そだい ゴミ わ どう します か。', 'That asks what THEY will do about it. Asking for advice on what YOU should do needs dou sureba ii desu ka.'],
        ['粗大ゴミはどうすればいいでした。', 'そだい ゴミ わ どう すれば いい でした。', 'Asking a live question needs ka, and the present ii desu ka — not the past ii deshita with no question marker.']
      ] },
      { s: 'other', t: '粗大ゴミは事前に申し込みが必要です。市役所に電話してくださいね。', r: 'そだい ゴミ わ じぜん に もうしこみ が ひつよう です。しやくしょ に でんわ して ください ね。', e: 'Bulky trash needs advance booking — please call city hall.' },
      { s: 'you', t: 'わかりました。教えてくださって、ありがとうございます。失礼します。', r: 'わかりました。おしえて くださって、ありがとうございます。しつれい します。', e: 'Understood. Thanks for explaining, goodbye.', wrong: [
        ['わかりました。教えてもらって、ありがとうございます。失礼します。', 'わかりました。おしえて もらって、ありがとうございます。しつれい します。', 'oshiete moratte centers what YOU received; crediting their courtesy directly uses oshiete kudasatte.'],
        ['わかりました。教えさせて、ありがとうございます。失礼します。', 'わかりました。おしえさせて、ありがとうございます。しつれい します。', 'oshiesasete is causative — "let me teach" — the opposite of thanking someone who taught you.']
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
      ] },
      { s: 'other', t: 'かしこまりました。渋滞しているかもしれませんので、少し時間がかかるかもしれません。', r: 'かしこまりました。じゅうたい して いる かもしれません ので、すこし じかん が かかる かもしれません。', e: 'Understood. There might be traffic, so it could take a bit longer.' },
      { s: 'you', t: '大丈夫です。急いでいませんので。', r: 'だいじょうぶ です。いそいで いません ので。', e: "That's fine, I'm not in a hurry.", wrong: [
        ['いいです。急いでいませんので。', 'いい です。いそいで いません ので。', 'ii desu alone here reads as "no need" (declining) rather than reassurance — daijoubu desu reads as fine either way.'],
        ['結構です。急いでいませんので。', 'けっこう です。いそいで いません ので。', 'kekkou desu leans toward "no thanks" in this context — the wrong signal to give your driver.']
      ] },
      { s: 'other', t: 'そうですか。では下の道で行きますね。', r: 'そう です か。では した の みち で いきます ね。', e: "I see. I'll take the surface streets, then." },
      { s: 'you', t: 'あ、着く前にコンビニの前で停めてもらえますか。買いたいものがあって。', r: 'あ、つく まえ に コンビニ の まえ で とめて もらえます か。かいたい もの が あって。', e: 'Oh, could you stop in front of a convenience store before we arrive? There is something I want to buy.', wrong: [
        ['あ、着く前にコンビニの前で停まってもらえますか。', 'あ、つく まえ に コンビニ の まえ で とまって もらえます か。', 'tomaru is intransitive — the car stops by itself. Asking the driver to STOP the car needs the transitive tomeru.'],
        ['あ、着く前にコンビニの前で停めさせますか。', 'あ、つく まえ に コンビニ の まえ で とめさせます か。', 'tomesaseru is causative ("make/let someone stop") — asking a favor for yourself needs the potential moraeru, not the causative.']
      ] },
      { s: 'other', t: 'はい、わかりました。', r: 'はい、わかりました。', e: 'Sure, no problem.' },
      { s: 'you', t: 'お待たせしました。ありがとうございます。', r: 'おまたせ しました。ありがとうございます。', e: 'Sorry for the wait, thank you.', wrong: [
        ['お待たせしました。ごちそうさまでした。', 'おまたせ しました。ごちそうさま でした。', 'gochisousama is said after eating — irrelevant to a driver who waited for you.'],
        ['お待たせしました。いただきます。', 'おまたせ しました。いただきます。', 'itadakimasu precedes eating or receiving something — not fitting here.']
      ] },
      { s: 'other', t: 'あ、着きましたよ。駅前でよろしいですか。', r: 'あ、つきました よ。えきまえ で よろしい です か。', e: 'Ah, here we are. Is right in front of the station fine?' },
      { s: 'you', t: 'はい、ここで大丈夫です。カードで払えますか。', r: 'はい、ここ で だいじょうぶ です。カード で はらえます か。', e: 'Yes, here is fine. Can I pay by card?', wrong: [
        ['はい、ここでいいです。カードで払えますか。', 'はい、ここ で いい です。カード で はらえます か。', 'ii desu here leans toward "no need," an odd signal when you actually want to get out here — daijoubu desu reads as clear confirmation.'],
        ['はい、ここで大丈夫です。カードが払えますか。', 'はい、ここ で だいじょうぶ です。カード が はらえます か。', 'The card is the MEANS of paying, so it takes de, not ga.']
      ] },
      { s: 'other', t: 'はい、大丈夫ですよ。それでは千二百円になります。', r: 'はい、だいじょうぶ です よ。それ で わ せんにひゃく えん に なります。', e: "Yes, that's fine. That'll be 1,200 yen." },
      { s: 'you', t: 'はい、お願いします。ありがとうございました。', r: 'はい、おねがいします。ありがとうございました。', e: 'Here you go, thank you.', wrong: [
        ['はい、お願いします。ごちそうさまでした。', 'はい、おねがいします。ごちそうさま でした。', 'gochisousama is said after eating — irrelevant to paying a taxi fare.'],
        ['はい、お願いします。お疲れ様でした。', 'はい、おねがいします。おつかれさま でした。', 'otsukaresama treats the driver as a peer acknowledging shared work — as a customer, gokurousama or a plain thank-you fits better.']
      ] }
    ]
  }
]
