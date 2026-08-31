import type { Dialogue } from './types.js'

/** Hotels, hot springs, hobbies, apologies — the last of the everyday set. */
export const LIFE: Dialogue[] = [
  {
    code: 'travel-hotel-checkout',
    unit: 'travel',
    title: 'Checking out',
    situation: 'You are leaving in the morning and want to leave your bags.',
    turns: [
      { s: 'other', t: 'おはようございます。チェックアウトでしょうか。', r: 'おはよう ございます。チェックアウト でしょう か。', e: 'Good morning. Checking out?' },
      { s: 'you', t: 'チェックアウトをお願いします。', r: 'チェックアウト お おねがいします。', e: 'Checking out, please.', wrong: [
        ['チェックアウトをします。', 'チェックアウト お します。', 'A flat announcement of what you are about to do. At a counter, onegai shimasu is the request.'],
        ['チェックアウトがお願いします。', 'チェックアウト が おねがいします。', 'onegai suru takes an object, so it is o.']
      ] },
      { s: 'other', t: 'かしこまりました。お部屋番号をお願いできますか。', r: 'かしこまりました。おへや ばんごう お おねがい できます か。', e: 'Certainly. Could I get your room number?' },
      { s: 'you', t: '三百二号室です。', r: 'さんびゃくに ごうしつ です。', e: 'Room three-oh-two.', wrong: [
        ['三百二号室があります。', 'さんびゃくに ごうしつ が あります。', 'That states that a room exists somewhere. Giving your own room number just needs desu.'],
        ['三百二号室でした。', 'さんびゃくに ごうしつ でした。', 'The past says it no longer is your room. It still is, so desu.'],
        ['三百二号室ですか。', 'さんびゃくに ごうしつ です か。', 'Ending in ka turns your own room number into a question back at them, which does not make sense when you are the one being asked.']
      ] },
      { s: 'other', t: 'お部屋の鍵をお預かりします。', r: 'おへや の かぎ お おあずかり します。', e: 'I will take your room key.' },
      { s: 'you', t: '荷物を夕方まで預かってもらえますか。', r: 'にもつ お ゆうがた まで あずかって もらえます か。', e: 'Could you hold my bags until this evening?', wrong: [
        ['荷物を夕方まで預けてもらえますか。', 'にもつ お ゆうがた まで あずけて もらえます か。', 'azukeru is to hand something over for safekeeping — that is what YOU do. Them holding it is azukaru.'],
        ['荷物を夕方までに預かってもらえますか。', 'にもつ お ゆうがた まで に あずかって もらえます か。', 'made ni is a deadline by which something happens. A stretch of time you want it held FOR is plain made.']
      ] },
      { s: 'other', t: 'かしこまりました。こちらの札をお持ちください。', r: 'かしこまりました。こちら の ふだ お おもち ください。', e: 'Certainly. Please keep this tag.' },
      { s: 'you', t: '何時までに取りに来ればいいですか。', r: 'なんじ まで に とりに くれば いい です か。', e: 'By what time should I come to collect them?', wrong: [
        ['何時まで取りに来ればいいですか。', 'なんじ まで とりに くれば いい です か。', 'made alone marks a stretch of time up to now. A deadline you must act BY needs made ni.'],
        ['何時までに取りに行けばいいですか。', 'なんじ まで に とりに いけば いい です か。', 'iku heads away from here. Coming back to the front desk to collect them is kuru.']
      ] },
      { s: 'other', t: '夜八時までは大丈夫ですよ。', r: 'よる はちじ まで わ だいじょうぶ です よ。', e: 'Up until eight in the evening is fine.' },
      { s: 'you', t: 'ありがとうございます。荷物、よろしくお願いします。', r: 'ありがとうございます。にもつ、よろしく おねがいします。', e: 'Thank you. Please take good care of them.', wrong: [
        ['ありがとうございます。荷物、よろしくいたします。', 'ありがとうございます。にもつ、よろしく いたします。', 'yoroshiku itashimasu humbles YOUR OWN action. Asking them to take care of something is yoroshiku onegai shimasu.'],
        ['ありがとうございます。荷物、よろしくもらいます。', 'ありがとうございます。にもつ、よろしく もらいます。', 'morau receives a favor as an ordinary verb; the fixed request phrase is yoroshiku onegai shimasu, not morau.']
      ] },
      { s: 'other', t: 'いってらっしゃいませ。良い一日を。', r: 'いってらっしゃいませ。よい いちにち お。', e: 'Have a good day.' }
    ]
  },
  {
    code: 'travel-hotel-ask',
    unit: 'travel',
    title: 'Asking about breakfast',
    situation: 'You want to know the times.',
    turns: [
      { s: 'other', t: '何かご質問はございますか。', r: 'なにか ごしつもん わ ございます か。', e: 'Is there anything you would like to ask?' },
      { s: 'you', t: '朝食は何時からですか。', r: 'ちょうしょく わ なんじ から です か。', e: 'What time does breakfast start?', wrong: [
        ['朝食は何時までですか。', 'ちょうしょく わ なんじ まで です か。', 'made asks when it ENDS. The start is kara.'],
        ['朝食が何時からですか。', 'ちょうしょく が なんじ から です か。', 'Breakfast is your topic, so wa.']
      ] },
      { s: 'other', t: '七時から十時までです。', r: 'しちじ から じゅうじ まで です。', e: 'Seven to ten.' },
      { s: 'you', t: '場所はどこですか。', r: 'ばしょ わ どこ です か。', e: 'Where is it?', wrong: [
        ['場所はどこにですか。', 'ばしょ わ どこ に です か。', 'ni needs a verb of existence or motion to attach to. Asking where something is as a bare question just takes doko desu ka.'],
        ['場所へどこですか。', 'ばしょ え どこ です か。', 'e marks a direction of movement, not "where is it".']
      ] },
      { s: 'other', t: '一階のレストランでございます。予約は必要ございません。', r: 'いっかい の レストラン で ございます。よやく わ ひつよう ございません。', e: 'It is the restaurant on the first floor. No reservation needed.' },
      { s: 'you', t: '部屋で食べてもいいですか。', r: 'へや で たべて も いい です か。', e: 'May I eat in the room?', wrong: [
        ['部屋に食べてもいいですか。', 'へや に たべて も いい です か。', 'ni marks a destination. Where an action happens is de.'],
        ['部屋で食べたいですか。', 'へや で たべたい です か。', 'That asks whether THEY want to eat in the room. -tai desu ka about another person is odd anyway.']
      ] },
      { s: 'other', t: '申し訳ございませんが、お食事はレストランのみとなっております。', r: 'もうしわけ ございません が、おしょくじ わ レストラン のみ と なって おります。', e: 'I am sorry, but meals are restaurant only.' },
      { s: 'you', t: 'わかりました。着替えてから行きます。', r: 'わかりました。きがえて から いきます。', e: 'Understood. I will change then go.', wrong: [
        ['わかりました。着替えて行きます。', 'わかりました。きがえて いきます。', 'Just te-form joins the two loosely. To say one happens strictly AFTER the other, use te kara.'],
        ['わかりました。着替えるから行きます。', 'わかりました。きがえる から いきます。', 'kara after the plain form means because. That reads as going BECAUSE you change, not after you change.']
      ] },
      { s: 'other', t: 'かしこまりました。コーヒーのおかわりもございますので、ぜひどうぞ。', r: 'かしこまりました。コーヒー の おかわり も ございます ので、ぜひ どうぞ。', e: 'Certainly. There are coffee refills too, so please help yourself.' },
      { s: 'you', t: 'ありがとうございます。じゃあ、朝ごはんに行ってきます。', r: 'ありがとうございます。じゃあ、あさごはん に いって きます。', e: 'Thank you. I will go have breakfast now.', wrong: [
        ['ありがとうございます。じゃあ、朝ごはんに行っています。', 'ありがとうございます。じゃあ、あさごはん に いって います。', 'te iru describes an ongoing or habitual state, not the announcement that you are about to leave for something. Leaving-and-returning is itte kimasu.'],
        ['ありがとうございます。じゃあ、朝ごはんに行くでした。', 'ありがとうございます。じゃあ、あさごはん に いく でした。', 'desu/deshita cannot follow the plain non-past directly like that; and deshita puts a future plan in the past.']
      ] }
    ]
  },
  {
    code: 'bath-onsen',
    unit: 'bath',
    title: 'At the hot spring',
    situation: 'It is your first visit and you check the rules.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。日帰り入浴でしょうか。', r: 'いらっしゃいませ。ひがえり にゅうよく でしょう か。', e: 'Welcome. Day-trip bathing?' },
      { s: 'you', t: 'タオルが借りられますか。', r: 'タオル が かりられます か。', e: 'Yes, it is my first time. Can I rent a towel?', wrong: [
        ['タオルを借りられますか。', 'タオル お かりられます か。', 'Not incorrect in casual speech, but the object of a potential verb like kariru to karirareru is conventionally marked with ga, not o.'],
        ['タオルが借りますか。', 'タオル が かります か。', 'kariru is the plain verb "to borrow"; the potential "can borrow" is karirareru. Without -rareru, ga does not fit.'],
        ['タオルは借りますか。', 'タオル わ かります か。', 'That asks whether THEY will do the borrowing. Asking about your own ability needs the potential karirareru.']
      ] },
      { s: 'other', t: 'はい、フロントで二百円でお貸ししています。', r: 'はい、フロント で にひゃくえん で おかし して います。', e: 'Yes, we rent them at the front desk for two hundred yen.' },
      { s: 'you', t: 'タトゥーがあっても入れますか。', r: 'タトゥー が あって も はいれます か。', e: 'Can I enter even with a tattoo?', wrong: [
        ['タトゥーがあっても入りますか。', 'タトゥー が あって も はいります か。', 'hairimasu just states future fact ("will I enter"). Asking whether it is ALLOWED needs the potential hairemasu.'],
        ['タトゥーをあっても入れますか。', 'タトゥー お あって も はいれます か。', 'aru is intransitive — existence takes ga, not o.']
      ] },
      { s: 'other', t: '申し訳ございませんが、タトゥーがある方はご遠慮いただいております。シールでお隠しいただければ大丈夫です。', r: 'もうしわけ ございません が、タトゥー が ある かた わ ごえんりょ いただいて おります。シール で おかくし いただければ だいじょうぶ です。', e: 'I am sorry, but guests with tattoos are asked to refrain. If you cover it with a patch, that is fine.' },
      { s: 'you', t: 'タオルは持って入ってもいいですか。', r: 'タオル わ もって はいって も いい です か。', e: 'May I take a towel in?', wrong: [
        ['タオルを持って入ってもいいですか。', 'タオル お もって はいって も いい です か。', 'Grammatical, but the towel is what you are asking ABOUT, so wa marks it as the topic under question.'],
        ['タオルは持って入りたいですか。', 'タオル わ もって はいりたい です か。', 'That asks about their wishes rather than the rule.']
      ] },
      { s: 'other', t: '小さいタオルは大丈夫ですが、湯船には入れないでください。', r: 'ちいさい タオル わ だいじょうぶ です が、ゆぶね に わ いれない で ください。', e: 'A small towel is fine, but do not put it in the water.' },
      { s: 'you', t: 'わかりました。体を洗ってから入りますね。', r: 'わかりました。からだ お あらって から はいります ね。', e: 'Understood. I will wash first, then get in.', wrong: [
        ['わかりました。体を洗って入りますね。', 'わかりました。からだ お あらって はいります ね。', 'Just the te-form links the two. To say explicitly that one comes AFTER the other, it is te kara.'],
        ['わかりました。体が洗ってから入りますね。', 'わかりました。からだ が あらって から はいります ね。', 'arau takes an object: o.']
      ] },
      { s: 'other', t: '石鹸とシャンプーは洗い場にありますので、自由に使ってください。', r: 'せっけん と シャンプー わ あらいば に あります ので、じゆう に つかって ください。', e: 'Soap and shampoo are at the washing stations, feel free to use them.' },
      { s: 'you', t: '何時まで入れますか。', r: 'なんじ まで はいれます か。', e: 'Until what time can I use it?', wrong: [
        ['何時まで入りますか。', 'なんじ まで はいります か。', 'hairimasu just states you will enter. Asking the latest time you are ALLOWED to be in requires the potential hairemasu.'],
        ['何時に入れますか。', 'なんじ に はいれます か。', 'ni marks a point in time. The closing deadline "up until" is made.']
      ] },
      { s: 'other', t: '夜十一時までです。ごゆっくりどうぞ。', r: 'よる じゅういちじ まで です。ごゆっくり どうぞ。', e: 'Until eleven at night. Enjoy your bath.' }
    ]
  },
  {
    code: 'station-delay',
    unit: 'station',
    title: 'A delayed train',
    situation: 'The board says the line has stopped.',
    turns: [
      { s: 'other', t: 'ただいま、〇〇線は人身事故の影響で運転を見合わせております。', r: 'ただいま、まるまるせん わ じんしん じこ の えいきょう で うんてん お みあわせて おります。', e: 'Right now, the XX line has suspended service due to a person-related accident.' },
      { s: 'you', t: 'すみません、電車はいつ動きますか。', r: 'すみません、でんしゃ わ いつ うごきます か。', e: 'Excuse me, when will the trains run?', wrong: [
        ['すみません、電車をいつ動きますか。', 'すみません、でんしゃ お いつ うごきます か。', 'ugoku is intransitive — the train moves by itself.'],
        ['すみません、電車はいつ動かしますか。', 'すみません、でんしゃ わ いつ うごかします か。', 'ugokasu means to move something. The train moving is ugoku.']
      ] },
      { s: 'other', t: '一時間ほどかかる見込みです。', r: 'いちじかん ほど かかる みこみ です。', e: 'About an hour, we expect.' },
      { s: 'you', t: '振替輸送はありますか。', r: 'ふりかえ ゆそう わ あります か。', e: 'Is there an alternative route?', wrong: [
        ['振替輸送はいますか。', 'ふりかえ ゆそう わ います か。', 'iru is for animate things.'],
        ['振替輸送をありますか。', 'ふりかえ ゆそう お あります か。', 'aru is intransitive.']
      ] },
      { s: 'other', t: 'はい、〇〇線であれば振替輸送が可能です。改札でこの紙を見せてください。', r: 'はい、まるまるせん で あれば ふりかえ ゆそう が かのう です。かいさつ で この かみ お みせて ください。', e: 'Yes, if it is the XX line, alternate transport is possible. Show this paper at the ticket gate.' },
      { s: 'you', t: '遅延証明書はもらえますか。', r: 'ちえん しょうめいしょ わ もらえます か。', e: 'Can I get a delay certificate?', wrong: [
        ['遅延証明書をもらいませんか。', 'ちえん しょうめいしょ お もらいません か。', 'Negative -masen ka is an invitation ("shall we...?"), which does not fit asking for a document for yourself.'],
        ['遅延証明書はあげますか。', 'ちえん しょうめいしょ わ あげます か。', 'ageru is giving to someone else. Asking to receive one yourself is morau/moraeru.']
      ] },
      { s: 'other', t: 'はい、あちらの機械で発行できます。', r: 'はい、あちら の きかい で はっこう できます。', e: 'Yes, you can issue one from that machine over there.' },
      { s: 'you', t: 'あの機械の使い方を教えてもらえますか。', r: 'あの きかい の つかいかた お おしえて もらえます か。', e: 'Could you tell me how to use that machine?', wrong: [
        ['あの機械の使い方を教えてくれますか。', 'あの きかい の つかいかた お おしえて くれます か。', 'Not wrong itself, but te-kureru reads a touch casual toward station staff; te-itadakemasu ka or te-moraemasu ka keeps it polite.'],
        ['あの機械の使い方が教えてもらえますか。', 'あの きかい の つかいかた が おしえて もらえます か。', 'oshieru takes an object: o, not ga.']
      ] },
      { s: 'other', t: 'ボタンを押すだけです。簡単ですよ。', r: 'ボタン お おす だけ です。かんたん です よ。', e: 'Just press the button. It is easy.' },
      { s: 'you', t: '助かりました。ありがとうございました。', r: 'たすかりました。ありがとう ございました。', e: 'That is a big help. Thank you.', wrong: [
        ['助けました。ありがとうございました。', 'たすけました。ありがとう ございました。', 'tasukeru is to actively help someone else. Saying that something was a help TO you is the intransitive tasukaru.'],
        ['助かりです。ありがとうございました。', 'たすかり です。ありがとう ございました。', 'tasukaru is a verb, not a noun before desu; the natural exclamation keeps the past form tasukarimashita, not tasukari desu.']
      ] }
    ]
  },
  {
    code: 'station-lost-item',
    unit: 'station',
    title: 'Lost property',
    situation: 'You left a bag on the train.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。お忘れ物ですか。', r: 'いらっしゃいませ。おわすれもの です か。', e: 'Welcome. Did you lose something?' },
      { s: 'you', t: '電車に鞄を忘れてしまったんですが。', r: 'でんしゃ に かばん お わすれて しまった ん です が。', e: 'I left my bag on the train.', wrong: [
        ['電車で鞄を忘れてしまったんですが。', 'でんしゃ で かばん お わすれて しまった ん です が。', 'de is where an action happens. Leaving something BEHIND somewhere takes ni.'],
        ['電車に鞄が忘れてしまったんですが。', 'でんしゃ に かばん が わすれて しまった ん です が。', 'wasureru takes an object: o.']
      ] },
      { s: 'other', t: '何時ごろの電車ですか。', r: 'なんじごろ の でんしゃ です か。', e: 'Roughly what time was the train?' },
      { s: 'you', t: '八時ごろだったと思います。', r: 'はちじごろ だった と おもいます。', e: 'Around eight, I think.', wrong: [
        ['八時ごろだと思いました。', 'はちじごろ だ と おもいました。', 'omoimashita puts the THINKING in the past. You think so now about a past event: datta to omoimasu.'],
        ['八時ごろでしたと思います。', 'はちじごろ でした と おもいます。', 'Before to omou the clause takes the plain form: datta, not deshita.']
      ] },
      { s: 'other', t: '鞄の色や特徴を教えていただけますか。', r: 'かばん の いろ や とくちょう お おしえて いただけます か。', e: 'Could you tell me the color and features of the bag?' },
      { s: 'you', t: '黒くて、小さいリュックです。中に財布と本が入っています。', r: 'くろくて、ちいさい リュック です。なか に さいふ と ほん が はいって います。', e: 'It is black, a small backpack. Inside there is a wallet and a book.', wrong: [
        ['黒いて、小さいリュックです。', 'くろいて、ちいさい リュック です。', 'kuroi is an i-adjective; linking it to the next clause drops i and adds kute, not ite: kurokute.'],
        ['黒くて、小さいリュックでした。', 'くろくて、ちいさい リュック でした。', 'The bag still exists and is still yours, describing it now takes desu, not the past deshita.'],
        ['黒くて、小さいリュックがあります。', 'くろくて、ちいさい リュック が あります。', 'Adding ga arimasu describes a bag existing somewhere else. You are identifying the very bag in question, so desu is enough.']
      ] },
      { s: 'other', t: '少々お待ちください。……確認しましたが、まだ届いていないようです。', r: 'しょうしょう おまち ください。……かくにん しました が、まだ とどいて いない よう です。', e: 'One moment please. I checked, but it does not seem to have arrived yet.' },
      { s: 'you', t: 'そうですか…。見つかったら連絡してもらえますか。', r: 'そう です か…。みつかったら れんらく して もらえます か。', e: 'I see. If it is found, could you contact me?', wrong: [
        ['見つかったら連絡してあげますか。', 'みつかったら れんらく して あげます か。', 'te-ageru offers to do THEM a favor. You want to receive the favor of being contacted: moraeru.'],
        ['見つかると連絡してもらえますか。', 'みつかる と れんらく して もらえます か。', 'to states an automatic, inevitable result. Whether it is found is uncertain, so the conditional is tara.']
      ] },
      { s: 'other', t: 'かしこまりました。お名前とお電話番号をお願いします。', r: 'かしこまりました。おなまえ と おでんわ ばんごう お おねがいします。', e: 'Certainly. Your name and phone number, please.' },
      { s: 'you', t: '名前は田中です。電話番号はこちらです。', r: 'なまえ わ たなか です。でんわ ばんごう わ こちら です。', e: 'My name is Tanaka. Here is my phone number.', wrong: [
        ['名前が田中です。電話番号はこちらです。', 'なまえ が たなか です。でんわ ばんごう わ こちら です。', 'Introducing what your name IS marks it with wa, the topic, not ga.'],
        ['名前は田中と言いました。電話番号はこちらです。', 'なまえ わ たなか と いいました。でんわ ばんごう わ こちら です。', 'to iimashita reports something said in the past. Stating your name now just takes desu.']
      ] },
      { s: 'other', t: 'ありがとうございます。見つかり次第、お電話いたします。', r: 'ありがとう ございます。みつかり しだい、おでんわ いたします。', e: 'Thank you. As soon as it is found, I will call you.' }
    ]
  },
  {
    code: 'social-hobby',
    unit: 'social',
    title: 'Talking about hobbies',
    situation: 'Someone asks what you do at weekends.',
    turns: [
      { s: 'other', t: 'あれ、久しぶり!元気?', r: 'あれ、ひさしぶり! げんき?', e: 'Oh hey, long time no see! How are you?' },
      { s: 'you', t: 'うん、元気だよ。最近ちょっと忙しかったけど。', r: 'うん、げんき だよ。さいきん ちょっと いそがしかった けど。', e: 'Yeah, I am good. I have been a bit busy lately though.', wrong: [
        ['うん、元気だよ。最近ちょっと忙しいだったけど。', 'うん、げんき だよ。さいきん ちょっと いそがしい だった けど。', 'Before datta an i-adjective needs no da at all, drop da entirely: isogashikatta.'],
        ['うん、元気だよ。最近ちょっと忙しかっただけど。', 'うん、げんき だよ。さいきん ちょっと いそがしかった だ けど。', 'The plain past of an i-adjective already ends the clause; adding da again is redundant. Just isogashikatta kedo.']
      ] },
      { s: 'other', t: '休みの日は何をしていますか。', r: 'やすみ の ひ わ なに お して います か。', e: 'What do you do on your days off?' },
      { s: 'you', t: '料理をするのが好きです。', r: 'りょうり お する の が すき です。', e: 'I like cooking.', wrong: [
        ['料理をするのを好きです。', 'りょうり お する の お すき です。', 'suki is an adjective — what you like takes ga.'],
        ['料理をするが好きです。', 'りょうり お する が すき です。', 'A verb needs no to become a noun before ga.']
      ] },
      { s: 'other', t: 'いいですね。何を作るんですか。', r: 'いい です ね。なに お つくる ん です か。', e: 'Nice. What do you make?' },
      { s: 'you', t: '最近はカレーばかり作っています。', r: 'さいきん わ カレー ばかり つくって います。', e: 'Lately nothing but curry.', wrong: [
        ['最近はカレーだけ作っています。', 'さいきん わ カレー だけ つくって います。', 'dake states a plain limit. bakari carries the wry "nothing but", which is what makes the line a joke.'],
        ['最近はカレーばかり作ります。', 'さいきん わ カレー ばかり つくります。', 'The plain present is a habit in general. An ongoing recent stretch is te imasu.']
      ] },
      { s: 'other', t: 'へえ、レシピはどこで見ているんですか。', r: 'へえ、レシピ わ どこ で みて いる ん です か。', e: 'Oh, where do you look up recipes?' },
      { s: 'you', t: 'スマホのアプリで見ています。今度レシピを送ろうか。', r: 'スマホ の アプリ で みて います。こんど レシピ お おくろう か。', e: 'I look them up on a phone app. Want me to send you a recipe sometime?', wrong: [
        ['スマホのアプリを見ています。今度レシピを送ろうか。', 'スマホ の アプリ お みて います。こんど レシピ お おくろう か。', 'The place where you look is marked with de. Marking the app with o would make the app itself the thing being watched, not the tool used to look.'],
        ['スマホのアプリに見ています。今度レシピを送ろうか。', 'スマホ の アプリ に みて います。こんど レシピ お おくろう か。', 'ni marks a destination or target, not the means by which you do something. The tool used is de.']
      ] },
      { s: 'other', t: 'いいね!ぜひ送って。', r: 'いい ね! ぜひ おくって。', e: 'Nice! Please do send it.' },
      { s: 'you', t: 'じゃあ、今度作ってみて。おいしいよ。', r: 'じゃあ、こんど つくって みて。おいしい よ。', e: 'Then try making it sometime. It is tasty.', wrong: [
        ['じゃあ、今度作ってみせて。おいしいよ。', 'じゃあ、こんど つくって みせて。おいしい よ。', 'te-miseru means to show someone by doing it. Trying it out for yourself is te-miru.'],
        ['じゃあ、今度作ってあげて。おいしいよ。', 'じゃあ、こんど つくって あげて。おいしい よ。', 'te-ageru means doing it as a favor for someone else. Telling a friend to try cooking it themselves is te-miru.']
      ] },
      { s: 'other', t: 'うん、楽しみ!ありがとう。', r: 'うん、たのしみ! ありがとう。', e: 'Yeah, looking forward to it! Thanks.' }
    ]
  },
  {
    code: 'social-photo',
    unit: 'social',
    title: 'Asking for a photo',
    situation: 'You want someone to take your picture.',
    turns: [
      { s: 'you', t: 'すみません、写真を撮ってもらえますか。', r: 'すみません、しゃしん お とって もらえます か。', e: 'Excuse me, could you take a photo?', wrong: [
        ['すみません、写真を撮ってあげますか。', 'すみません、しゃしん お とって あげます か。', 'te-ageru offers to do it FOR them. You are asking to receive the favour.'],
        ['すみません、写真が撮ってもらえますか。', 'すみません、しゃしん が とって もらえます か。', 'toru takes an object: o.']
      ] },
      { s: 'other', t: 'いいですよ。ここを押せばいいですか。', r: 'いい です よ。ここ お おせば いい です か。', e: 'Sure. Just press here?' },
      { s: 'you', t: 'はい、お願いします。後ろの建物も入れてください。', r: 'はい、おねがいします。うしろ の たてもの も いれて ください。', e: 'Yes please. Get the building behind us in too.', wrong: [
        ['はい、お願いします。後ろの建物も入ってください。', 'はい、おねがいします。うしろ の たてもの も はいって ください。', 'hairu is the building entering by itself. Including it in the frame is ireru.'],
        ['はい、お願いします。後ろの建物を入れてください。', 'はい、おねがいします。うしろ の たてもの お いれて ください。', 'You are ADDING the building to yourselves, so mo, not o.']
      ] },
      { s: 'other', t: 'わかりました。……はい、撮りました。', r: 'わかりました。……はい、とりました。', e: 'Got it. Okay, I took it.' },
      { s: 'you', t: 'ありがとうございます。あ、もう一枚お願いできますか。', r: 'ありがとう ございます。あ、もう いちまい おねがい できます か。', e: 'Thank you. Oh, could I ask for one more?', wrong: [
        ['ありがとうございます。あ、もう一枚お願いしませんか。', 'ありがとう ございます。あ、もう いちまい おねがい しません か。', 'Negative -masen ka invites the OTHER person to do something together; asking them a favor for yourself needs the affirmative onegai dekimasu ka or onegai shimasu.'],
        ['ありがとうございます。あ、もう一枚お願いをもらえますか。', 'ありがとう ございます。あ、もう いちまい おねがい お もらえます か。', 'onegai is not a physical thing to receive; drop morau and just say onegai dekimasu ka.']
      ] },
      { s: 'other', t: 'はい、いいですよ。もう一枚撮りますね。', r: 'はい、いい です よ。もう いちまい とります ね。', e: 'Sure, no problem. I will take one more.' },
      { s: 'you', t: 'すみません、今度は縦で撮ってもらえますか。', r: 'すみません、こんど わ たて で とって もらえます か。', e: 'Sorry, could you take it vertically this time?', wrong: [
        ['すみません、今度は縦を撮ってもらえますか。', 'すみません、こんど わ たて お とって もらえます か。', 'toru already takes shashin as its object; tate here describes HOW to hold the camera, so it needs de, not o.'],
        ['すみません、今度は縦に撮ってもらえますか。', 'すみません、こんど わ たて に とって もらえます か。', 'ni marks a destination or target. The manner or orientation of the shot is marked with de.']
      ] },
      { s: 'other', t: 'はい、どうぞ。……できました。', r: 'はい、どうぞ。……できました。', e: 'Sure. Done.' },
      { s: 'you', t: 'ありがとうございました。助かりました。よろしければ、お二人の写真も撮りましょうか。', r: 'ありがとう ございました。たすかりました。よろしければ、おふたり の しゃしん も とりましょう か。', e: 'Thank you so much, that was a big help. If you like, shall I take a photo of you two as well?', wrong: [
        ['ありがとうございました。助かりました。よろしければ、お二人の写真も撮ってもらいましょうか。', 'ありがとう ございました。たすかりました。よろしければ、おふたり の しゃしん も とって もらいましょう か。', 'moraimashou asks to receive a favor yourself, offering to take THEIR photo means doing it for them, so drop moratte and just say torimashou ka.'],
        ['ありがとうございました。助かりました。よろしければ、お二人の写真が撮りましょうか。', 'ありがとう ございました。たすかりました。よろしければ、おふたり の しゃしん が とりましょう か。', 'toru takes its object marked with o; ga does not fit a volitional offer like this one.']
      ] },
      { s: 'other', t: 'え、いいんですか?ありがとうございます!', r: 'え、いい ん です か? ありがとう ございます!', e: 'Oh, really? Thank you!' }
    ]
  },
  {
    code: 'work-apology',
    unit: 'work',
    title: 'Apologising for a mistake',
    situation: 'You sent the wrong file.',
    turns: [
      { s: 'other', t: 'あの、さっき送ってもらったファイル、中身が違うみたいなんですが。', r: 'あの、さっき おくって もらった ファイル、なかみ が ちがう みたい な ん です が。', e: 'Um, the file you sent earlier, the contents seem different.' },
      { s: 'you', t: 'ファイルを間違えてしまいました。申し訳ありません。', r: 'ファイル お まちがえて しまいました。もうしわけ ありません。', e: 'I sent the wrong file. I am very sorry.', wrong: [
        ['ファイルが間違えてしまいました。', 'ファイル が まちがえて しまいました。', 'machigaeru is transitive — YOU mistook it, so the file takes o.'],
        ['ファイルを間違いました。', 'ファイル お まちがいました。', 'machigai is the noun. The verb is machigaeru: machigaemashita.']
      ] },
      { s: 'other', t: '大丈夫ですよ。正しいものを送ってください。', r: 'だいじょうぶ です よ。ただしい もの お おくって ください。', e: 'It is fine. Send the right one.' },
      { s: 'you', t: 'すぐにお送りします。', r: 'すぐに おおくりします。', e: 'I will send it right away.', wrong: [
        ['すぐにお送りになります。', 'すぐに おおくり に なります。', 'o-...-ni naru elevates the OTHER person. Humbling yourself is o-...-suru.'],
        ['すぐに送っていただきます。', 'すぐに おくって いただきます。', 'te-itadaku is receiving a favour — that says they will send it for you.']
      ] },
      { s: 'other', t: '急がなくて大丈夫ですよ。今日中で構いません。', r: 'いそがなくて だいじょうぶ です よ。きょうじゅう で かまいません。', e: 'No need to rush. Sometime today is fine.' },
      { s: 'you', t: 'ありがとうございます。今後は送る前に確認いたします。', r: 'ありがとう ございます。こんご わ おくる まえ に かくにん いたします。', e: 'Thank you. From now on, I will double check before sending.', wrong: [
        ['ありがとうございます。今後は送る前に確認してあげます。', 'ありがとう ございます。こんご わ おくる まえ に かくにん して あげます。', 'te-ageru frames checking as a favor done for someone else. Checking your own work before sending needs no te-ageru at all, just kakunin itashimasu.'],
        ['ありがとうございます。今後は送る前に確認していただきます。', 'ありがとう ございます。こんご わ おくる まえ に かくにん して いただきます。', 'te-itadaku means someone else does the checking for you. Promising to check it yourself is just kakunin itashimasu.'],
        ['ありがとうございます。今後は送る前に確認します。', 'ありがとう ございます。こんご わ おくる まえ に かくにん します。', 'Not wrong grammatically, but after apologising to a colleague, the humble itashimasu fits the moment better than the plain shimasu.']
      ] },
      { s: 'other', t: 'それはいいですね。安心しました。', r: 'それ わ いい です ね。あんしん しました。', e: 'Good to hear. That is a relief.' },
      { s: 'you', t: '今、正しいファイルをお送りしました。ご確認いただけますでしょうか。', r: 'いま、ただしい ファイル お おおくり しました。ごかくにん いただけます でしょう か。', e: 'I have just sent the correct file. Could you please check it?', wrong: [
        ['今、正しいファイルをお送りになりました。ご確認いただけますでしょうか。', 'いま、ただしい ファイル お おおくり に なりました。ごかくにん いただけます でしょう か。', 'o-...-ni naru raises the action of the OTHER person. Describing your own sending needs the humble o-...-suru: o-okuri shimashita.'],
        ['今、正しいファイルをお送りしてもらいました。ご確認いただけますでしょうか。', 'いま、ただしい ファイル お おおくり して もらいました。ごかくにん いただけます か。', 'te-moraimashita says someone else sent it for you. You sent it yourself, so drop moratte.']
      ] },
      { s: 'other', t: '確認しました。今度は問題ないですね。ありがとうございます。', r: 'かくにん しました。こんど わ もんだい ない です ね。ありがとう ございます。', e: 'Checked it. No problem this time. Thank you.' },
      { s: 'you', t: 'こちらこそ、お手数をおかけしました。', r: 'こちらこそ、おてすう お おかけ しました。', e: 'No, thank you. Sorry for the trouble.', wrong: [
        ['こちらこそ、お手数をおかけになりました。', 'こちらこそ、おてすう お おかけ に なりました。', 'o-...-ni naru raises the action of the OTHER person; apologizing for troubling them describes your own action, so it stays o-...-suru: okake shimashita.'],
        ['こちらこそ、お手数をおかけしています。', 'こちらこそ、おてすう お おかけ して います。', 'te-imasu describes an ongoing state. The trouble already happened and is over, so the plain past okake shimashita fits, not the ongoing form.']
      ] }
    ]
  },
  {
    code: 'work-thanks',
    unit: 'work',
    title: 'Thanking someone for help',
    situation: 'A colleague stayed late to help you.',
    turns: [
      { s: 'other', t: 'あ、おはよう。昨日は大変だったね。', r: 'あ、おはよう。きのう わ たいへん だった ね。', e: 'Oh, morning. Yesterday was rough, huh.' },
      { s: 'you', t: '昨日は手伝ってくださってありがとうございました。', r: 'きのう わ てつだって くださって ありがとうございました。', e: 'Thank you for helping me yesterday.', wrong: [
        ['昨日は手伝ってあげてありがとうございました。', 'きのう わ てつだって あげて ありがとうございました。', 'te-ageru is you doing them a favour. They helped you: te-kudasaru.'],
        ['昨日は手伝ってくださってありがとうございます。', 'きのう わ てつだって くださって ありがとうございます。', 'The help is finished, so the thanks takes the past: gozaimashita.']
      ] },
      { s: 'other', t: 'いえいえ、こちらこそ。', r: 'いえいえ、こちらこそ。', e: 'Not at all.' },
      { s: 'you', t: 'おかげさまで間に合いました。', r: 'おかげさま で まにあいました。', e: 'Thanks to you I made it in time.', wrong: [
        ['おかげさまで間に合わせました。', 'おかげさま で まにあわせました。', 'maniawaseru is to force something to fit the deadline. Making it in time is maniau.'],
        ['おかげさまで間に合います。', 'おかげさま で まにあいます。', 'The deadline has passed, so it takes the past.']
      ] },
      { s: 'other', t: 'よかった。次は僕も手伝ってもらうかもね。', r: 'よかった。つぎ わ ぼく も てつだって もらう かも ね。', e: 'Glad to hear it. Next time I might ask you for help too.' },
      { s: 'you', t: 'もちろんです。いつでも言ってください。', r: 'もちろん です。いつでも いって ください。', e: 'Of course. Just tell me anytime.', wrong: [
        ['もちろんです。いつでも言わせてください。', 'もちろん です。いつでも いわせて ください。', 'iwasete kudasai asks THEM to let YOU speak. Inviting them to tell YOU something needs itte kudasai.'],
        ['もちろんです。いつでも言ってあげます。', 'もちろん です。いつでも いって あげます。', 'te-ageru here would mean YOU doing the telling as a favor, which reverses who is asking whom.']
      ] },
      { s: 'other', t: 'ありがとう。じゃあ、お礼にランチおごるよ。', r: 'ありがとう。じゃあ、おれい に ランチ おごる よ。', e: 'Thanks. Then let me treat you to lunch as thanks.' },
      { s: 'you', t: 'え、いいの?ありがとう、じゃあお言葉に甘えて。', r: 'え、いい の? ありがとう、じゃあ おことば に あまえて。', e: 'Oh, really? Thanks, I will take you up on that then.', wrong: [
        ['え、いいの?ありがとう、じゃあお言葉が甘えて。', 'え、いい の? ありがとう、じゃあ おことば が あまえて。', 'amaeru takes ni for the thing you are presuming upon, not ga.'],
        ['え、いいの?ありがとう、じゃあお言葉を甘えて。', 'え、いい の? ありがとう、じゃあ おことば お あまえて。', 'amaeru pairs with ni, not the direct object marker o.']
      ] },
      { s: 'other', t: '決まりね。お昼、何食べたい?', r: 'きまり ね。おひる、なに たべたい?', e: 'Settled then. What do you want to eat for lunch?' },
      { s: 'you', t: '何でもいいよ。おすすめある?', r: 'なんでも いい よ。おすすめ ある?', e: 'Anything is fine. Do you have a recommendation?', wrong: [
        ['何でもいいだよ。おすすめある?', 'なんでも いい だ よ。おすすめ ある?', 'ii is an i-adjective and never takes da before yo.'],
        ['何でも良かったよ。おすすめある?', 'なんでも よかった よ。おすすめ ある?', 'The past yokatta says it WAS fine, describing something already decided. Right now, anything still being fine is the present ii.']
      ] },
      { s: 'other', t: 'じゃあ、駅前のラーメン屋にしよう。', r: 'じゃあ、えきまえ の ラーメンや に しよう。', e: 'Then we will go with the ramen place by the station.' }
    ]
  },
  {
    code: 'school-explain-again',
    unit: 'school',
    title: 'Asking the teacher',
    situation: 'You did not follow the explanation.',
    turns: [
      { s: 'other', t: 'どうしましたか。難しいところがありますか。', r: 'どう しました か。むずかしい ところ が あります か。', e: 'What is wrong? Is there a difficult part?' },
      { s: 'you', t: 'すみません、もう一度説明していただけますか。', r: 'すみません、もう いちど せつめい して いただけます か。', e: 'Sorry, could you explain once more?', wrong: [
        ['すみません、もう一度説明してくれますか。', 'すみません、もう いちど せつめい して くれます か。', 'Not wrong, but te-kureru is casual. To a teacher, te-itadakemasu ka.'],
        ['すみません、もう一度説明してあげますか。', 'すみません、もう いちど せつめい して あげます か。', 'That offers to explain it to THEM.']
      ] },
      { s: 'other', t: 'もちろん。どこがわかりませんでしたか。', r: 'もちろん。どこ が わかりません でした か。', e: 'Of course. Which part?' },
      { s: 'you', t: '最後のところがわかりませんでした。', r: 'さいご の ところ が わかりません でした。', e: 'The last part.', wrong: [
        ['最後のところをわかりませんでした。', 'さいご の ところ お わかりません でした。', 'wakaru takes ga.'],
        ['最後のところがわかりました。', 'さいご の ところ が わかりました。', 'That says you DID understand it.']
      ] },
      { s: 'other', t: 'ああ、ここですね。つまり、この公式を先に使うということです。', r: 'ああ、ここ です ね。つまり、この こうしき お さき に つかう という こと です。', e: 'Ah, here. In other words, you use this formula first.' },
      { s: 'you', t: 'なるほど…。ということは、次にこの数字を入れるんですか。', r: 'なるほど…。という こと わ、つぎ に この すうじ お いれる ん です か。', e: 'I see. So then, do I put this number in next?', wrong: [
        ['なるほど…。ということは、次にこの数字が入れるんですか。', 'なるほど…。という こと わ、つぎ に この すうじ が いれる ん です か。', 'ireru takes an object: o, not ga.'],
        ['なるほど…。ということは、次にこの数字を入るんですか。', 'なるほど…。という こと わ、つぎ に この すうじ お はいる ん です か。', 'hairu is intransitive, the number entering by itself. Putting it in yourself is ireru.'],
        ['なるほど…。ということは、次にこの数字に入れるんですか。', 'なるほど…。という こと わ、つぎ に この すうじ に いれる ん です か。', 'ni would mark the number as a destination something else goes INTO. The number itself is what gets put in, so it takes o.']
      ] },
      { s: 'other', t: 'そうです。よくできました。', r: 'そう です。よく できました。', e: 'That is right. Well done.' },
      { s: 'you', t: 'ありがとうございます!やっとわかりました。', r: 'ありがとう ございます! やっと わかりました。', e: 'Thank you! I finally understand.', wrong: [
        ['ありがとうございます!やっとわかります。', 'ありがとう ございます! やっと わかります。', 'The present wakarimasu describes a general ability. The moment of finally getting it just now takes the past wakarimashita.'],
        ['ありがとうございます!やっとわかっています。', 'ありがとう ございます! やっと わかって います。', 'te iru here would describe an ongoing state you have been in, not the sudden moment of understanding. Use the plain past wakarimashita.']
      ] },
      { s: 'other', t: 'よかったです。他にわからないところはありますか。', r: 'よかった です。ほか に わからない ところ わ あります か。', e: 'Good. Is there anything else you do not understand?' },
      { s: 'you', t: '今のところ大丈夫です。ありがとうございました。', r: 'いま の ところ だいじょうぶ です。ありがとう ございました。', e: 'I am fine for now, thank you.', wrong: [
        ['今のところ大丈夫でした。ありがとうございました。', 'いま の ところ だいじょうぶ でした。ありがとう ございました。', 'The past deshita describes a state that is now over. Right now you are still fine, so it stays daijoubu desu.'],
        ['今のところ大丈夫します。ありがとうございました。', 'いま の ところ だいじょうぶ します。ありがとう ございました。', 'daijoubu is a na-adjective, not a verb, it pairs with desu, never suru.']
      ] },
      { s: 'other', t: 'はい、また何かあれば聞いてくださいね。', r: 'はい、また なにか あれば きいて ください ね。', e: 'Okay, ask again if anything comes up.' }
    ]
  },
  {
    code: 'school-homework-late',
    unit: 'school',
    title: 'Handing in late work',
    situation: 'The homework is a day late.',
    turns: [
      { s: 'other', t: 'あれ、今日の宿題出してませんね。', r: 'あれ、きょう の しゅくだい だしてません ね。', e: 'Huh, you have not handed in the homework for today.' },
      { s: 'you', t: '宿題が遅れてすみません。', r: 'しゅくだい が おくれて すみません。', e: 'Sorry the homework is late.', wrong: [
        ['宿題を遅れてすみません。', 'しゅくだい お おくれて すみません。', 'okureru is intransitive — the homework is late by itself.'],
        ['宿題が遅らせてすみません。', 'しゅくだい が おくらせて すみません。', 'okuraseru is to delay something deliberately. Being late is okureru.']
      ] },
      { s: 'other', t: 'どうしたんですか。', r: 'どう した ん です か。', e: 'What happened?' },
      { s: 'you', t: '昨日、体調が悪くて、できませんでした。', r: 'きのう、たいちょう が わるくて、できません でした。', e: 'Yesterday I felt unwell and could not do it.', wrong: [
        ['昨日、体調が悪いて、できませんでした。', 'きのう、たいちょう が わるいて、できません でした。', 'An i-adjective linking to the next clause drops i and takes kute, not ite: warukute.'],
        ['昨日、体調が悪くて、しませんでした。', 'きのう、たいちょう が わるくて、しません でした。', 'shimasendeshita says you chose not to do it. Being unable to is dekimasendeshita.']
      ] },
      { s: 'other', t: 'そうだったんですね、大変でしたね。', r: 'そう だった ん です ね、たいへん でした ね。', e: 'I see, that was rough.' },
      { s: 'you', t: 'いつまでに出せばいいですか。', r: 'いつ まで に だせば いい です か。', e: 'By when should I submit it?', wrong: [
        ['いつまで出せばいいですか。', 'いつ まで だせば いい です か。', 'made alone marks a stretch of time up to now. A deadline you must meet needs made ni.'],
        ['いつまでに出ればいいですか。', 'いつ まで に でれば いい です か。', 'deru is to go out or leave. Submitting something is dasu.']
      ] },
      { s: 'other', t: '次からは気をつけてくださいね。明日の朝までに出してください。', r: 'つぎ から わ き お つけて ください ね。あした の あさ まで に だして ください。', e: 'Be careful from now on. Please submit it by tomorrow morning.' },
      { s: 'you', t: 'はい、気をつけます。', r: 'はい、き お つけます。', e: 'Yes, I will.', wrong: [
        ['はい、気をつけました。', 'はい、き お つけました。', 'The past says you already were careful, which contradicts the apology.'],
        ['はい、気がつけます。', 'はい、き が つけます。', 'The set phrase is ki o tsukeru — ki ga tsuku means to notice something, a different idiom entirely.']
      ] },
      { s: 'other', t: 'じゃあ、今日はゆっくり休んでくださいね。', r: 'じゃあ、きょう わ ゆっくり やすんで ください ね。', e: 'Then rest well today.' },
      { s: 'you', t: 'ありがとうございます。明日、必ず出します。', r: 'ありがとう ございます。あした、かならず だします。', e: 'Thank you. I will definitely submit it tomorrow.', wrong: [
        ['ありがとうございます。明日、必ず出しました。', 'ありがとう ございます。あした、かならず だしました。', 'The past dashimashita says you already submitted it. Tomorrow has not happened yet, so it takes the present dashimasu.'],
        ['ありがとうございます。明日、必ず出させます。', 'ありがとう ございます。あした、かならず ださせます。', 'dasaseru means to make or let someone else submit it. Submitting it yourself is dasu.']
      ] },
      { s: 'other', t: 'はい、待っていますね。', r: 'はい、まって います ね。', e: 'Okay, I will be waiting.' }
    ]
  },
  {
    code: 'cooking-shopping-list',
    unit: 'cooking',
    title: 'What to buy for dinner',
    situation: 'Deciding at home before going out.',
    turns: [
      { s: 'other', t: '今晩、何食べたい。', r: 'こんばん、なに たべたい。', e: 'What do you fancy tonight?' },
      { s: 'you', t: 'カレーが食べたいな。', r: 'カレー が たべたい な。', e: 'I fancy curry.', wrong: [
        ['カレーを食べたいな。', 'カレー お たべたい な。', 'Heard often, but with -tai the thing wanted normally takes ga.'],
        ['カレーが食べたいだ。', 'カレー が たべたい だ。', 'tabetai is an i-adjective and takes no da.']
      ] },
      { s: 'other', t: 'いいね。でも、家に人参ないんじゃない?', r: 'いい ね。でも、いえ に にんじん ない ん じゃ ない?', e: 'Sounds good. But do we not have carrots at home?' },
      { s: 'you', t: 'あ、そうだ。じゃあ、それも買ってくるね。', r: 'あ、そう だ。じゃあ、それ も かって くる ね。', e: 'Oh right. I will buy that too then.', wrong: [
        ['あ、そうだ。じゃあ、それも買ってきたね。', 'あ、そう だ。じゃあ、それ も かって きた ね。', 'The past kita says you already went and came back. You are about to go, so it stays the plain non-past kuru.'],
        ['あ、そうだ。じゃあ、それに買ってくるね。', 'あ、そう だ。じゃあ、それ に かって くる ね。', 'ni marks a destination for buying something FOR, not "that too" as an additional item, the additive marker here is mo.'],
        ['あ、そうだ。じゃあ、それを買ってくるね。', 'あ、そう だ。じゃあ、それ お かって くる ね。', 'o would treat "that" as the only new item, dropping the sense of ADDING it to what is already planned. mo carries the "also" meaning.']
      ] },
      { s: 'other', t: 'じゃあ、じゃがいも買ってきて。', r: 'じゃあ、じゃがいも かって きて。', e: 'Get some potatoes, then.' },
      { s: 'you', t: 'うん、行ってくる。', r: 'うん、いって くる。', e: 'All right, back in a bit.', wrong: [
        ['うん、行ってきた。', 'うん、いって きた。', 'The past says you already went.'],
        ['うん、行っていく。', 'うん、いって いく。', 'te-iku moves away with no return. Going and coming back is itte kuru.']
      ] },
      { s: 'other', t: 'あ、待って。玉ねぎも切れてるから、それも。', r: 'あ、まって。たまねぎ も きれてる から、それ も。', e: 'Oh wait. We are also out of onions, so that too.' },
      { s: 'you', t: '了解。他に足りないものある?', r: 'りょうかい。ほか に たりない もの ある?', e: 'Got it. Is there anything else we are short on?', wrong: [
        ['了解。他に足りるものある?', 'りょうかい。ほか に たりる もの ある?', 'tariru means to be sufficient. Asking what is LACKING needs the negative tarinai.'],
        ['了解。他に足りないものが?', 'りょうかい。ほか に たりない もの が?', 'Dropping aru after ga leaves the question incomplete, keep the verb: tarinai mono aru?']
      ] },
      { s: 'other', t: 'うーん、大丈夫だと思う。あ、レシートもらってきてね。', r: 'うーん、だいじょうぶ だ と おもう。あ、レシート もらって きて ね。', e: 'Hmm, I think that is it. Oh, get a receipt.' },
      { s: 'you', t: 'わかった。あと、飲み物も何か買おうか。', r: 'わかった。あと、のみもの も なにか かおう か。', e: 'Got it. Also, should I get something to drink too?', wrong: [
        ['わかった。あと、飲み物も何か買いましょうか。', 'わかった。あと、のみもの も なにか かいましょう か。', 'mashou ka is the polite register. Talking casually to family at home stays in the plain volitional kaou ka.'],
        ['わかった。あと、飲み物が何か買おうか。', 'わかった。あと、のみもの が なにか かおう か。', 'kau takes its object with o; ga does not fit here.']
      ] },
      { s: 'other', t: 'うん、お願い。気をつけて行ってきてね。', r: 'うん、おねがい。き お つけて いって きて ね。', e: 'Yeah, please. Take care, off you go.' }
    ]
  },
  {
    code: 'comings-late-home',
    unit: 'comings',
    title: 'Coming home late',
    situation: 'It is past midnight and someone waited up.',
    turns: [
      { s: 'other', t: 'あ、おかえり…って、こんな時間まで何してたの?', r: 'あ、おかえり…って、こんな じかん まで なに してた の?', e: 'Oh, welcome back. Wait, what were you doing until this hour?' },
      { s: 'you', t: 'ただいま。遅くなってごめん。', r: 'ただいま。おそく なって ごめん。', e: 'I am home. Sorry I am late.', wrong: [
        ['ただいま。遅いなってごめん。', 'ただいま。おそい なって ごめん。', 'Before naru an i-adjective drops i and takes ku: osoku.'],
        ['ただいま。遅くしてごめん。', 'ただいま。おそく して ごめん。', 'osoku suru means you made something else late. Becoming late yourself is osoku naru.']
      ] },
      { s: 'other', t: 'おかえり。ご飯は。', r: 'おかえり。ごはん わ。', e: 'Welcome back. Have you eaten?' },
      { s: 'you', t: 'もう食べてきた。ありがとう。', r: 'もう たべて きた。ありがとう。', e: 'Already ate, thanks.', wrong: [
        ['もう食べていった。ありがとう。', 'もう たべて いった。ありがとう。', 'te-iku heads away from here. Having eaten before coming home is tabete kita.'],
        ['もう食べてくる。ありがとう。', 'もう たべて くる。ありがとう。', 'The present says you will go and eat. You already have.']
      ] },
      { s: 'other', t: 'そう。お風呂は?', r: 'そう。おふろ わ?', e: 'I see. What about a bath?' },
      { s: 'you', t: 'うん、入ってから寝るよ。', r: 'うん、はいって から ねる よ。', e: 'Yeah, I will take one, then go to sleep.', wrong: [
        ['うん、入って寝るよ。', 'うん、はいって ねる よ。', 'Plain te-form just links the two loosely. To say bathing comes strictly BEFORE sleeping, use te kara.'],
        ['うん、入るから寝るよ。', 'うん、はいる から ねる よ。', 'kara after the plain form means because. That reads as sleeping BECAUSE you bathe, not after you bathe.']
      ] },
      { s: 'other', t: '明日も早いんでしょう?大丈夫?', r: 'あした も はやい ん でしょう? だいじょうぶ?', e: 'You have an early start tomorrow too, right? Are you okay?' },
      { s: 'you', t: 'うん、大丈夫。ちゃんと起きるから心配しないで。', r: 'うん、だいじょうぶ。ちゃんと おきる から しんぱい しないで。', e: 'Yeah, I am fine. I will get up properly, so do not worry.', wrong: [
        ['うん、大丈夫。ちゃんと起きるから心配しなくて。', 'うん、だいじょうぶ。ちゃんと おきる から しんぱい しなくて。', 'shinaide kudasai is the request form "please do not worry"; shinakute does not combine into the same request.'],
        ['うん、大丈夫。ちゃんと起きるから心配しないの。', 'うん、だいじょうぶ。ちゃんと おきる から しんぱい しない の。', 'Ending in no here turns the line into a soft statement, not the request to stop worrying you intend. The request form is shinaide.']
      ] },
      { s: 'other', t: 'わかった。じゃあ、おやすみ。', r: 'わかった。じゃあ、おやすみ。', e: 'Okay. Goodnight then.' },
      { s: 'you', t: 'おやすみ。明日もよろしくね。', r: 'おやすみ。あした も よろしく ね。', e: 'Goodnight. See you tomorrow.', wrong: [
        ['おやすみ。明日もよろしいね。', 'おやすみ。あした も よろしい ね。', 'yoroshii is a formal adjective meaning good or acceptable; the fixed closing phrase here is yoroshiku, not yoroshii.'],
        ['おやすみ。明日によろしくね。', 'おやすみ。あした に よろしく ね。', 'ni does not fit the set phrase yoroshiku; tomorrow here is just added with mo, not marked with ni.']
      ] }
    ]
  },
  {
    code: 'comings-see-off',
    unit: 'comings',
    title: 'Seeing someone off',
    situation: 'They are leaving for work.',
    turns: [
      { s: 'other', t: 'そろそろ出るね。傘持った?', r: 'そろそろ でる ね。かさ もった?', e: 'I am heading out soon. Did you get your umbrella?' },
      { s: 'you', t: 'あ、忘れてた。ありがとう。', r: 'あ、わすれてた。ありがとう。', e: 'Oh, I forgot it. Thank you.', wrong: [
        ['あ、忘れった。ありがとう。', 'あ、わすれった。ありがとう。', 'wasureru is an ru-verb; its te and ta forms are wasurete and wasureta, not the u-verb-style wasuretta.'],
        ['あ、忘れてる。ありがとう。', 'あ、わすれてる。ありがとう。', 'te iru describes an ongoing state (I am forgetting), which does not fit realizing just now. The moment of realizing takes the plain past wasureteta.']
      ] },
      { s: 'other', t: '今日は何時に帰るの?', r: 'きょう わ なんじ に かえる の?', e: 'What time are you coming home today?' },
      { s: 'you', t: 'たぶん七時ごろになると思う。', r: 'たぶん しちじ ごろ に なる と おもう。', e: 'Probably around seven, I think.', wrong: [
        ['たぶん七時ごろになろうと思う。', 'たぶん しちじ ごろ に なろう と おもう。', 'narou to omou states YOUR OWN intention to make something happen. Predicting a likely time needs naru to omou, plain non-past.'],
        ['たぶん七時ごろになりたいと思う。', 'たぶん しちじ ごろ に なりたい と おもう。', 'naritai expresses a wish for the time to become seven. You are predicting the time, not wishing for it.']
      ] },
      { s: 'other', t: 'わかった。夕飯どうする?', r: 'わかった。ゆうはん どう する?', e: 'Got it. What about dinner?' },
      { s: 'you', t: '外で食べてくるから、いらないよ。', r: 'そと で たべて くる から、いらない よ。', e: 'I will eat out, so no need.', wrong: [
        ['外で食べていくから、いらないよ。', 'そと で たべて いく から、いらない よ。', 'te-iku heads away from here. Eating before coming back home is tabete kuru.'],
        ['外で食べてくるから、いりないよ。', 'そと で たべて くる から、いりない よ。', 'iru meaning to need drops ru and adds nai: iranai. The wrong form keeps an extra i: irinai.']
      ] },
      { s: 'other', t: '行ってきます。', r: 'いって きます。', e: 'I am off.' },
      { s: 'you', t: '行ってらっしゃい。気をつけてね。', r: 'いって らっしゃい。き お つけて ね。', e: 'Take care, see you later.', wrong: [
        ['行ってきます。気をつけてね。', 'いって きます。き お つけて ね。', 'ittekimasu is what the person LEAVING says. The one staying answers itterasshai.'],
        ['お帰りなさい。気をつけてね。', 'おかえりなさい。き お つけて ね。', 'okaerinasai welcomes someone back. They are going out.']
      ] },
      { s: 'other', t: 'うん、行ってきます。', r: 'うん、いって きます。', e: 'Right, off I go.' },
      { s: 'you', t: 'いってらっしゃーい!忘れ物がないようにね!', r: 'いってらっしゃーい! わすれもの が ない よう に ね!', e: 'See you later! Make sure you do not forget anything!', wrong: [
        ['いってらっしゃーい!忘れ物をないようにね!', 'いってらっしゃーい! わすれもの お ない よう に ね!', 'nai is the negative of aru, an existence verb — it cannot take a direct object marked with o.'],
        ['いってらっしゃーい!忘れ物がしないようにね!', 'いってらっしゃーい! わすれもの が しない よう に ね!', 'shinai needs a person doing the not-forgetting; mono ga shinai makes the belongings themselves the doer. Say wasuremono ga nai you ni instead.']
      ] }
    ]
  }
]
