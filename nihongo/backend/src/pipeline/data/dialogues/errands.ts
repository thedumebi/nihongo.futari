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
      ] },
      { s: 'other', t: '前のご住所はどちらですか。', r: 'まえ の ごじゅうしょ わ どちら です か。', e: 'Where was your previous address?' },
      { s: 'you', t: '前は大阪市に住んでいました。', r: 'まえ わ おおさかし に すんで いました。', e: 'Before this I was living in Osaka city.', wrong: [
        ['前は大阪市に住みました。', 'まえ わ おおさかし に すみました。', 'sumimashita frames living there as one finished event; describing where you used to live day to day needs sunde imashita.'],
        ['前は大阪市に住んでいます。', 'まえ わ おおさかし に すんで います。', 'imasu is present tense — a previous address needs the past, sunde imashita.']
      ] },
      { s: 'other', t: '世帯主はご本人ですか、それとも別の方ですか。', r: 'せたいぬし わ ごほんにん です か、それとも べつ の かた です か。', e: 'Are you the head of household yourself, or is it someone else?' },
      { s: 'you', t: '私が世帯主です。', r: 'わたし が せたいぬし です。', e: 'I am the head of household.', wrong: [
        ['私の世帯主です。', 'わたし の せたいぬし です。', 'no makes this "my head of household" — a different person. Answering who it is, about yourself, takes ga.'],
        ['私が世帯主になります。', 'わたし が せたいぬし に なります。', 'narimasu describes becoming something later. You already are the head of household: desu.']
      ] },
      { s: 'other', t: 'マイナンバーカードもお作りになりますか。', r: 'マイナンバーカード も おつくり に なります か。', e: 'Would you like a My Number card made as well?' },
      { s: 'you', t: '保険証はお願いします。マイナンバーカードは大丈夫です。', r: 'ほけんしょう わ おねがいします。マイナンバーカード わ だいじょうぶ です。', e: "Insurance, yes please. I'm fine on the My Number card.", wrong: [
        ['保険証はお願いします。マイナンバーカードはいいですか。', 'ほけんしょう わ おねがいします。マイナンバーカード わ いい です か。', 'Adding ka turns this into a question asking whether THEY are fine — dropping ka is what makes it your own decline.'],
        ['保険証はお願いします。マイナンバーカードをください。', 'ほけんしょう わ おねがいします。マイナンバーカード お ください。', 'kudasai asks for the very thing you meant to decline.']
      ] },
      { s: 'other', t: 'かしこまりました。番号でお呼びしますので、そちらでお待ちください。', r: 'かしこまりました。ばんごう で およびします ので、そちら で おまち ください。', e: "Certainly. We'll call your number, so please wait over there." },
      { s: 'other', t: 'お待たせしました。こちらが住民票と保険証です。', r: 'おまたせ しました。こちら が じゅうみんひょう と ほけんしょう です。', e: 'Sorry to keep you waiting. Here is your residency certificate and insurance card.' },
      { s: 'you', t: 'ありがとうございます。マイナンバーの手続きはまた今度でも大丈夫ですか。', r: 'ありがとうございます。マイナンバー の てつづき わ また こんど でも だいじょうぶ です か。', e: 'Thank you. Is it okay if I do the My Number procedure another time?', wrong: [
        ['ありがとうございます。マイナンバーの手続きはまた今度でもいいですね。', 'ありがとうございます。マイナンバー の てつづき わ また こんど でも いい です ね。', 'ne asks them to agree with something you both already know. You are asking permission for the first time, so ka.'],
        ['ありがとうございます。マイナンバーの手続きはまた今度でも大丈夫でした。', 'ありがとうございます。マイナンバー の てつづき わ また こんど でも だいじょうぶ でした。', 'deshita is past tense — you are asking about now, not reporting something already settled.']
      ] },
      { s: 'other', t: '大丈夫ですよ。ただ、14日以内にお越しください。', r: 'だいじょうぶ です よ。ただ、じゅうよっか いない に おこし ください。', e: "That's fine. Just come within 14 days, though." }
    ]
  },
  {
    code: 'ward-insurance',
    unit: 'ward-office',
    title: 'Health insurance',
    situation: 'You are asked whether you want to enrol.',
    turns: [
      { s: 'other', t: 'お仕事はされていますか。会社の保険には入っていますか。', r: 'おしごと わ されて います か。かいしゃ の ほけん に わ はいって います か。', e: "Are you working? Are you enrolled in your company's insurance?" },
      { s: 'you', t: 'いいえ、今は入っていません。', r: 'いいえ、いま わ はいって いません。', e: "No, I'm not enrolled in anything right now.", wrong: [
        ['いいえ、今は入りません。', 'いいえ、いま わ はいりません。', 'hairimasen is a plain future refusal ("I will not join"). Describing your current state of not being enrolled needs the -te iru form: haitte imasen.'],
        ['いいえ、今は入っていました。', 'いいえ、いま わ はいって いました。', 'imashita is past — you are describing your situation right now, so imasen.']
      ] },
      { s: 'other', t: '国民健康保険に加入されますか。', r: 'こくみん けんこう ほけん に かにゅう されます か。', e: 'Will you enrol in national health insurance?' },
      { s: 'you', t: 'はい、お願いします。手続きは今日できますか。', r: 'はい、おねがいします。てつづき わ きょう できます か。', e: 'Yes please. Can I do the paperwork today?', wrong: [
        ['はい、お願いします。手続きが今日できますか。', 'はい、おねがいします。てつづき が きょう できます か。', 'You are raising the paperwork as your topic, so wa.'],
        ['はい、お願いします。手続きは今日しますか。', 'はい、おねがいします。てつづき わ きょう します か。', 'That asks whether THEY will do it today. Asking if it is possible is dekimasu ka.']
      ] },
      { s: 'other', t: 'はい、こちらで承ります。', r: 'はい、こちら で うけたまわります。', e: 'Yes, we can handle it here.' },
      { s: 'other', t: '保険料は前年の所得によって決まります。今年は概算でのご案内になります。', r: 'ほけんりょう わ ぜんねん の しょとく に よって きまります。ことし わ がいさん で の ごあんない に なります。', e: "The premium is based on last year's income. This year it'll be an estimate." },
      { s: 'you', t: 'だいたいでいいので、月にいくらぐらいになりますか。', r: 'だいたい で いい ので、つき に いくら ぐらい に なります か。', e: 'A rough figure is fine — about how much per month?', wrong: [
        ['だいたいがいいので、月にいくらぐらいになりますか。', 'だいたい が いい ので、つき に いくら ぐらい に なります か。', '"daitai de ii" fixes the manner — an estimate will do. ga just labels daitai as the subject and drops that meaning.'],
        ['だいたいでいいので、月がいくらぐらいになりますか。', 'だいたい で いい ので、つき が いくら ぐらい に なります か。', 'The time frame "per month" is a ni-marked adverbial, not the subject — tsuki ni, not tsuki ga.']
      ] },
      { s: 'other', t: '大体一万五千円くらいです。口座振替になさいますか、それとも納付書がよろしいですか。', r: 'だいたい いちまん ごせん えん くらい です。こうざふりかえ に なさいます か、それとも のうふしょ が よろしい です か。', e: 'About fifteen thousand yen. Would you like automatic bank transfer, or would a payment slip be better?' },
      { s: 'you', t: '口座振替でお願いします。通帳と印鑑を持ってくればいいですか。', r: 'こうざふりかえ で おねがいします。つうちょう と いんかん お もって くれば いい です か。', e: 'Bank transfer, please. Should I bring my bankbook and seal?', wrong: [
        ['口座振替をお願いします。通帳と印鑑を持ってくればいいですか。', 'こうざふりかえ お おねがいします。つうちょう と いんかん お もって くれば いい です か。', 'Passable, but the method you are choosing takes de, like koukuubin de at the post office.'],
        ['口座振替でお願いします。通帳と印鑑を持ってくるといいですか。', 'こうざふりかえ で おねがいします。つうちょう と いんかん お もって くる と いい です か。', 'to ii ka is not how you check whether something suffices — the conditional ba plus ii ka is the pattern: motte kureba ii desu ka.']
      ] },
      { s: 'other', t: 'はい。今日は印鑑がなくても大丈夫ですよ、サインで結構です。', r: 'はい。きょう わ いんかん が なくて も だいじょうぶ です よ、サイン で けっこう です。', e: "Yes. You don't need the seal today though — a signature is fine." },
      { s: 'other', t: '保険証は後日、郵送でお届けします。それまではこの資格確認書をお使いください。', r: 'ほけんしょう わ ごじつ、ゆうそう で おとどけ します。それ まで わ この しかく かくにんしょ お つかって ください。', e: "We'll mail the insurance card to you later. Until then, please use this certificate of eligibility." },
      { s: 'you', t: 'わかりました。届くまでどのくらいかかりますか。', r: 'わかりました。とどく まで どの くらい かかります か。', e: 'Understood. How long will it take to arrive?', wrong: [
        ['わかりました。届くまでどのくらいかけますか。', 'わかりました。とどく まで どの くらい かけます か。', 'kakemasu is spending time on purpose, someone doing the spending. How long the wait itself takes is intransitive: kakarimasu.'],
        ['わかりました。届くまでどのくらいありますか。', 'わかりました。とどく まで どの くらい あります か。', 'arimasu asks whether a duration exists at all. Asking how long a process takes is dono kurai kakarimasu ka.']
      ] }
    ]
  },
  {
    code: 'ward-form-help',
    unit: 'ward-office',
    title: 'Asking for help with a form',
    situation: 'A box on the form makes no sense.',
    turns: [
      { s: 'other', t: '何かお困りですか。', r: 'なにか おこまり です か。', e: 'Is something the matter?' },
      { s: 'you', t: 'すみません、ここの書き方がわかりません。', r: 'すみません、ここ の かきかた が わかりません。', e: 'Sorry, I do not know how to fill this in.', wrong: [
        ['すみません、ここの書き方をわかりません。', 'すみません、ここ の かきかた お わかりません。', 'wakaru takes ga, not o — what is understood is the subject.'],
        ['すみません、ここの書き方が知りません。', 'すみません、ここ の かきかた が しりません。', 'shiru takes o, and for not grasping something the verb is wakaru.']
      ] },
      { s: 'other', t: 'こちらは前のご住所です。', r: 'こちら わ まえ の ごじゅうしょ です。', e: 'That is your previous address.' },
      { s: 'you', t: 'なるほど。ありがとうございます。', r: 'なるほど。ありがとうございます。', e: 'I see. Thank you.', wrong: [
        ['なるほどですね。', 'なるほど です ね。', 'naruhodo desu ne is not standard — naruhodo stands alone.'],
        ['そうしましょう。', 'そう しましょう。', 'That proposes a course of action. They explained a fact.']
      ] },
      { s: 'other', t: 'あと、こちらの電話番号の欄が空欄になっていますね。', r: 'あと、こちら の でんわ ばんごう の らん が くうらん に なって います ね。', e: 'Also, this phone number field is blank.' },
      { s: 'you', t: 'あ、忘れていました。今書きます。', r: 'あ、わすれて いました。いま かきます。', e: "Oh, I forgot. I'll write it now.", wrong: [
        ['あ、忘れました。今書きます。', 'あ、わすれました。いま かきます。', 'wasuremashita reports forgetting as a flat past event. Realising you had been forgetting it needs the -te iru past: wasurete imashita.'],
        ['あ、忘れていました。今書けます。', 'あ、わすれて いました。いま かけます。', 'kakemasu is the potential, "I am able to write". You mean you will write it now: kakimasu.']
      ] },
      { s: 'other', t: 'それから、この印鑑は不要ですので、こちらにサインをお願いします。', r: 'それから、この いんかん わ ふよう です ので、こちら に サイン お おねがいします。', e: "Also, this seal isn't needed, so please sign here instead." },
      { s: 'you', t: 'サインだけでいいんですか。', r: 'サイン だけ で いい ん です か。', e: 'Just a signature is enough?', wrong: [
        ['サインだけがいいんですか。', 'サイン だけ が いい ん です か。', 'de marks what suffices as sufficient by itself; ga just makes "sign only" the subject and loses that meaning.'],
        ['サインだけでいいんでした。', 'サイン だけ で いい ん でした。', 'deshita reports something already settled in the past. You are checking right now, so desu ka.']
      ] },
      { s: 'other', t: 'はい、それで結構です。ほかに何か聞きたいことはありますか。', r: 'はい、それ で けっこう です。ほか に なにか ききたい こと わ あります か。', e: "Yes, that's fine. Is there anything else you'd like to ask?" },
      { s: 'you', t: 'いいえ、大丈夫です。これで全部書けたと思います。', r: 'いいえ、だいじょうぶ です。これ で ぜんぶ かけた と おもいます。', e: "No, I'm fine. I think I've written everything now.", wrong: [
        ['いいえ、大丈夫でした。これで全部書けたと思います。', 'いいえ、だいじょうぶ でした。これ で ぜんぶ かけた と おもいます。', 'deshita puts your being fine in the past. You are answering about right now: desu.'],
        ['いいえ、大丈夫です。これで全部書けると思います。', 'いいえ、だいじょうぶ です。これ で ぜんぶ かける と おもいます。', 'kakeru, plain non-past potential, says you are able to write it. kaketa, past, reports you actually have — which is what is true now.']
      ] },
      { s: 'other', t: 'それでは、この場でお預かりします。控えをお渡ししますので、大切に保管してください。', r: 'それでは、この ば で おあずかり します。ひかえ お おわたし します ので、たいせつ に ほかん して ください。', e: "We'll take this from you now, then. We'll give you a copy, so please keep it somewhere safe." },
      { s: 'you', t: 'わかりました。この控えはいつまで必要ですか。', r: 'わかりました。この ひかえ わ いつ まで ひつよう です か。', e: 'Understood. How long do I need to keep this copy?', wrong: [
        ['わかりました。この控えはいつまで必要にしますか。', 'わかりました。この ひかえ わ いつ まで ひつよう に します か。', 'suru asks about someone making a deliberate choice. Asking how long something remains necessary is just the na-adjective plus desu ka.'],
        ['わかりました。この控えはいつまで必要ありますか。', 'わかりました。この ひかえ わ いつ まで ひつよう あります か。', 'hitsuyou is a na-adjective; predicating it needs desu, not arimasu — hitsuyou desu ka.']
      ] },
      { s: 'other', t: '一年間、保管をお願いします。', r: 'いちねんかん、ほかん お おねがいします。', e: 'Please keep it for one year.' }
    ]
  },
  {
    code: 'post-send',
    unit: 'services',
    title: 'At the post office',
    situation: 'You are sending a parcel abroad.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。次の方どうぞ。', r: 'いらっしゃいませ。つぎ の かた どうぞ。', e: 'Welcome. Next, please.' },
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
      ] },
      { s: 'other', t: '重さを量りますので、少々お待ちください。…2キロですね。', r: 'おもさ お はかります ので、しょうしょう おまち ください。…に キロ です ね。', e: "We'll weigh it, one moment... It's 2 kilos." },
      { s: 'you', t: '送料はいくらになりますか。', r: 'そうりょう わ いくら に なります か。', e: 'How much will the postage be?', wrong: [
        ['送料はいくらがなりますか。', 'そうりょう わ いくら が なります か。', 'naru takes ni for what something becomes or amounts to, not ga.'],
        ['送料はいくらでなりますか。', 'そうりょう わ いくら で なります か。', 'de marks means or location, not the resulting amount — the amount something comes to takes ni: ikura ni narimasu ka.']
      ] },
      { s: 'other', t: '5000円です。それから、この関税申告書にご記入ください。', r: 'ごせん えん です。それから、この かんぜい しんこくしょ に ごきにゅう ください。', e: "That'll be 5000 yen. Also, please fill in this customs declaration form." },
      { s: 'you', t: 'すみません、ペンを貸してもらえますか。', r: 'すみません、ペン お かして もらえます か。', e: 'Sorry, could I borrow a pen?', wrong: [
        ['すみません、ペンを借りてもらえますか。', 'すみません、ペン お かりて もらえます か。', 'kariru is to borrow. Asking THEM to lend it to you needs kasu: kashite moraemasu ka.'],
        ['すみません、ペンが貸してもらえますか。', 'すみません、ペン が かして もらえます か。', 'kasu takes an object: what is lent takes o, not ga.']
      ] },
      { s: 'other', t: 'あの、この箱、少し弱いようです。もう一枚、緩衝材を入れましょうか。', r: 'あの、この はこ、すこし よわい よう です。もう いちまい、かんしょうざい お いれましょう か。', e: 'Um, this box seems a bit weak. Shall we add another layer of padding?' },
      { s: 'you', t: 'お願いします。割れ物なので、心配していました。', r: 'おねがいします。われもの な ので、しんぱい して いました。', e: "Please do. It's fragile, so I was worried about it.", wrong: [
        ['お願いします。割れ物なので、心配します。', 'おねがいします。われもの な ので、しんぱい します。', 'shinpai shimasu states a plain future or habitual worry. Describing the worry you have been carrying needs the -te iru past: shinpai shite imashita.'],
        ['お願いします。割れ物ので、心配していました。', 'おねがいします。われもの ので、しんぱい して いました。', 'waremono is a noun; before node a noun needs na: waremono na node.']
      ] },
      { s: 'other', t: '追跡番号はこちらの控えに書いてあります。到着まで4〜5日ほどです。', r: 'ついせき ばんごう わ こちら の ひかえ に かいて あります。とうちゃく まで よん から ご にち ほど です。', e: "The tracking number is written on this receipt. It'll take about four to five days to arrive." },
      { s: 'you', t: 'ありがとうございます。オンラインで追跡番号を確認できますか。', r: 'ありがとうございます。オンライン で ついせき ばんごう お かくにん できます か。', e: 'Thank you. Can I check the tracking number online?', wrong: [
        ['ありがとうございます。オンラインが追跡番号を確認できますか。', 'ありがとうございます。オンライン が ついせき ばんごう お かくにん できます か。', 'de marks the means "online"; ga would make "online" the subject, which does not make sense here.'],
        ['ありがとうございます。オンラインで追跡番号が確認できますか。', 'ありがとうございます。オンライン で ついせき ばんごう が かくにん できます か。', 'With dekiru either particle can appear, but confirming a specific document like this keeps the object marker: bangou o kakunin.']
      ] }
    ]
  },
  {
    code: 'barber-cut',
    unit: 'services',
    title: 'At the barber',
    situation: 'You are explaining what you want.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。今日はカットだけでよろしいですか。', r: 'いらっしゃいませ。きょう わ カット だけ で よろしい です か。', e: 'Welcome. Just a cut today, is that alright?' },
      { s: 'you', t: 'はい、カットだけでお願いします。', r: 'はい、カット だけ で おねがいします。', e: 'Yes, just a cut, please.', wrong: [
        ['はい、カットだけをします。', 'はい、カット だけ お します。', 'shimasu says YOU will do the cutting yourself. Asking for it to be done is onegaishimasu.'],
        ['はい、カットだけがいいです。', 'はい、カット だけ が いい です。', 'ii desu here reads as a mild preference, not a request — the standard way to ask for service is onegaishimasu.']
      ] },
      { s: 'other', t: '今日はどうしますか。', r: 'きょう わ どう します か。', e: 'What are we doing today?' },
      { s: 'you', t: '全体的に短くしてください。', r: 'ぜんたいてき に みじかく して ください。', e: 'Shorter all over, please.', wrong: [
        ['全体的に短いしてください。', 'ぜんたいてき に みじかい して ください。', 'Before suru an i-adjective becomes an adverb: mijikaku.'],
        ['全体的に短くなってください。', 'ぜんたいてき に みじかく なって ください。', 'naru is to become by itself — that asks the barber to get shorter.']
      ] },
      { s: 'other', t: '横はどのくらい。', r: 'よこ わ どのくらい。', e: 'How much off the sides?' },
      { s: 'you', t: '耳が見えるくらいでお願いします。', r: 'みみ が みえる くらい で おねがいします。', e: 'Enough to see my ears.', wrong: [
        ['耳を見えるくらいでお願いします。', 'みみ お みえる くらい で おねがいします。', 'mieru is something being visible, so it takes ga. o would need miru.'],
        ['耳が見るくらいでお願いします。', 'みみ が みる くらい で おねがいします。', 'miru is to look AT something. Ears being visible is mieru.']
      ] },
      { s: 'other', t: '前髪はどうしますか、そのままにしますか。', r: 'まえがみ わ どう します か、そのまま に します か。', e: 'What about the fringe — leave it as is?' },
      { s: 'you', t: '少しだけ切ってください。眉にかからないくらいで。', r: 'すこし だけ きって ください。まゆ に かからない くらい で。', e: "Just a little off, please. Enough that it doesn't cover my eyebrows.", wrong: [
        ['少しだけ切ってください。眉にかかるくらいで。', 'すこし だけ きって ください。まゆ に かかる くらい で。', 'kakaru, plain affirmative, says it should cover your eyebrows — the opposite of what you want. You need the negative: kakaranai.'],
        ['少しだけ切ってください。眉がかからないくらいで。', 'すこし だけ きって ください。まゆ が かからない くらい で。', 'kakaru, to hang over something, takes ni for what it hangs over, not ga.']
      ] },
      { s: 'other', t: 'かしこまりました。シャンプーもされますか。', r: 'かしこまりました。シャンプー も されます か。', e: 'Certainly. Will you also have a shampoo?' },
      { s: 'you', t: 'いえ、今日はカットだけで大丈夫です。', r: 'いえ、きょう わ カット だけ で だいじょうぶ です。', e: 'No, just the cut is fine today.', wrong: [
        ['いえ、今日はカットだけで大丈夫でした。', 'いえ、きょう わ カット だけ で だいじょうぶ でした。', 'deshita puts this in the past. You are deciding right now, so desu.'],
        ['いえ、今日はカットだけがいいです。', 'いえ、きょう わ カット だけ が いい です。', 'Understandable, but declining an extra service and settling on the base one is de ii or de daijoubu — ga loses that "this is enough" nuance.']
      ] },
      { s: 'other', t: 'すみません、思ったより短くなってしまいましたが、大丈夫ですか。', r: 'すみません、おもった より みじかく なって しまいました が、だいじょうぶ です か。', e: "Sorry, it's come out a bit shorter than planned — is that alright?" },
      { s: 'you', t: '大丈夫です、気にしないでください。', r: 'だいじょうぶ です、き に しないで ください。', e: "It's fine, please don't worry about it.", wrong: [
        ['大丈夫です、気にしないてください。', 'だいじょうぶ です、き に しないて ください。', 'The negative te-form of suru is shinai, and its te-form is shinaide, not shinaite — ki ni shinaide kudasai.'],
        ['大丈夫でした、気にしないでください。', 'だいじょうぶ でした、き に しないで ください。', 'deshita reports this as settled in the past; you are reassuring them about right now, so desu.']
      ] },
      { s: 'other', t: 'お疲れさまでした。全体、こんな感じでいかがですか。', r: 'おつかれさま でした。ぜんたい、こんな かんじ で いかが です か。', e: 'All done. How does it look overall?' },
      { s: 'you', t: 'いいですね、ありがとうございます。', r: 'いい です ね、ありがとうございます。', e: 'It looks great, thank you.', wrong: [
        ['いいですか、ありがとうございます。', 'いい です か、ありがとうございます。', 'ka turns this into a question asking THEM whether it is good — ne here is you commenting on what you see.'],
        ['よくないです、ありがとうございます。', 'よくない です、ありがとうございます。', 'yokunai negates it — that says you do not like it, the opposite of thanking them for a good cut.']
      ] }
    ]
  },
  {
    code: 'library-card',
    unit: 'services',
    title: 'At the library',
    situation: 'You want to borrow books.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。何かお探しですか。', r: 'いらっしゃいませ。なにか おさがし です か。', e: 'Welcome. Are you looking for something?' },
      { s: 'you', t: '本を借りたいのですが、カードは要りますか。', r: 'ほん お かりたい の です が、カード わ いります か。', e: 'I would like to borrow books. Do I need a card?', wrong: [
        ['本を貸したいのですが、カードは要りますか。', 'ほん お かしたい の です が、カード わ いります か。', 'kasu is to lend. You want to borrow: kariru.'],
        ['本を借りたいのですが、カードが要りますか。', 'ほん お かりたい の です が、カード が いります か。', 'The card is the new topic of the second clause, so wa.']
      ] },
      { s: 'other', t: 'はい。身分証明書があれば作れます。', r: 'はい。みぶん しょうめいしょ が あれば つくれます。', e: 'Yes. We can make one if you have ID.' },
      { s: 'you', t: '何冊まで借りられますか。', r: 'なんさつ まで かりられます か。', e: 'How many can I borrow?', wrong: [
        ['何個まで借りられますか。', 'なんこ まで かりられます か。', 'ko is the general counter; books take satsu.'],
        ['何冊まで借りますか。', 'なんさつ まで かります か。', 'That asks how many you intend to. Asking the limit needs the potential: kariraremasu.']
      ] },
      { s: 'other', t: '10冊まで、2週間借りられます。今日は身分証明書をお持ちですか。', r: 'じゅっさつ まで、にしゅうかん かりられます。きょう わ みぶん しょうめいしょ お おもち です か。', e: 'Up to ten books for two weeks. Do you have ID with you today?' },
      { s: 'you', t: 'はい、在留カードを持ってきました。', r: 'はい、ざいりゅう カード お もって きました。', e: 'Yes, I brought my residence card.', wrong: [
        ['はい、在留カードを持って行きました。', 'はい、ざいりゅう カード お もって いきました。', 'motte ikimashita is taking it away somewhere. You brought it here: motte kimashita.'],
        ['はい、在留カードが持ってきました。', 'はい、ざいりゅう カード が もって きました。', 'motte kuru takes an object: the card takes o, not ga.']
      ] },
      { s: 'other', t: 'では、こちらの申込書にご記入ください。…あ、こちらは在留期間が切れていますね。', r: 'では、こちら の もうしこみしょ に ごきにゅう ください。…あ、こちら わ ざいりゅう きかん が きれて います ね。', e: 'Please fill in this application... ah, this residence period has expired.' },
      { s: 'you', t: 'え、本当ですか。更新の手続きはまだなんです。', r: 'え、ほんとう です か。こうしん の てつづき わ まだ な ん です。', e: "Really? I haven't done the renewal procedure yet.", wrong: [
        ['え、本当ですか。更新の手続きはまだいるんです。', 'え、ほんとう です か。こうしん の てつづき わ まだ いる ん です。', 'iru describes existing or being somewhere. Saying a procedure is still pending needs mada plus the na-nominalizer: mada na n desu.'],
        ['え、本当ですか。更新の手続きはまだするんです。', 'え、ほんとう です か。こうしん の てつづき わ まだ する ん です。', 'suru is plain present or future "do" — it does not convey "not yet done". The pending-state explanation is mada na n desu.']
      ] },
      { s: 'other', t: 'それでは仮の利用証をお作りしますね。正式なカードは期限内に切り替えてください。', r: 'それでは かり の りようしょう お おつくり します ね。せいしき な カード わ きげんない に きりかえて ください。', e: "In that case we'll make you a temporary user pass. Please switch to the proper card within the deadline." },
      { s: 'you', t: 'わかりました。ありがとうございます。返却日はいつまでですか。', r: 'わかりました。ありがとうございます。へんきゃくび わ いつ まで です か。', e: 'Understood, thank you. Until when is the return date?', wrong: [
        ['わかりました。ありがとうございます。返却日はいつまでにですか。', 'わかりました。ありがとうございます。へんきゃくび わ いつ まで に です か。', 'Stacking ni after made here is redundant — asking "until when" is itsu made desu ka.'],
        ['わかりました。ありがとうございます。返却日はいつからですか。', 'わかりました。ありがとうございます。へんきゃくび わ いつ から です か。', 'kara asks about the start point. You want the deadline, the end point: made.']
      ] },
      { s: 'other', t: '2週間後の15日までです。延長はオンラインでもできますよ。', r: 'にしゅうかんご の じゅうごにち まで です。えんちょう わ オンライン でも できます よ。', e: 'Two weeks from now, the 15th. You can extend it online too, you know.' },
      { s: 'you', t: 'それは便利ですね。教えてくださってありがとうございます。', r: 'それ わ べんり です ね。おしえて くださって ありがとうございます。', e: "That's convenient. Thanks for letting me know.", wrong: [
        ['それは便利ですね。教えてあげてありがとうございます。', 'それ わ べんり です ね。おしえて あげて ありがとうございます。', 'te-ageru is YOU doing someone else a favour. They just did one for you, so te-kudasaru or te-kureru.'],
        ['それは便利ですね。教えさせてありがとうございます。', 'それ わ べんり です ね。おしえさせて ありがとうございます。', 'oshiesasete is a causative, "let/make someone tell". Thanking them for telling you plainly is oshiete kudasatte.']
      ] }
    ]
  },
  {
    code: 'atm-trouble',
    unit: 'services',
    title: 'The cash machine ate your card',
    situation: 'You need help at the ATM.',
    turns: [
      { s: 'other', t: 'どうかされましたか。', r: 'どうか されました か。', e: 'Is something wrong?' },
      { s: 'you', t: 'すみません、カードが出てこないんです。', r: 'すみません、カード が でて こない ん です。', e: 'Excuse me, my card will not come out.', wrong: [
        ['すみません、カードを出てこないんです。', 'すみません、カード お でて こない ん です。', 'deru is intransitive — the card comes out by itself, so ga.'],
        ['すみません、カードが出さないんです。', 'すみません、カード が ださない ん です。', 'dasu means someone puts it out. The card not emerging is dete konai.']
      ] },
      { s: 'other', t: '少々お待ちください。係の者を呼びます。', r: 'しょうしょう おまち ください。かかり の もの お よびます。', e: 'One moment, I will call someone.' },
      { s: 'you', t: 'お願いします。急いでいるんです。', r: 'おねがいします。いそいで いる ん です。', e: 'Please. I am in a hurry.', wrong: [
        ['お願いします。急ぎます。', 'おねがいします。いそぎます。', 'isogimasu says you will hurry. Being in a hurry right now is isoide iru.'],
        ['お願いします。速いんです。', 'おねがいします。はやい ん です。', 'hayai is fast in speed. Being pressed for time is isoide iru.']
      ] },
      { s: 'other', t: 'お待たせしました。暗証番号を3回間違えると機械が回収するんです。', r: 'おまたせ しました。あんしょう ばんごう お さんかい まちがえる と きかい が かいしゅう する ん です。', e: 'Sorry to keep you waiting. If you enter the wrong PIN three times, the machine keeps the card.' },
      { s: 'you', t: 'あ、そうなんですか。2回までは間違えました。', r: 'あ、そう な ん です か。にかい まで わ まちがえました。', e: 'Oh, is that right? I did get it wrong up to twice.', wrong: [
        ['あ、そうなんですか。2回まで間違いました。', 'あ、そう な ん です か。にかい まで まちがいました。', 'machigau is intransitive, "to be mistaken". Getting the PIN wrong through your own action is the transitive machigaeru: machigaemashita.'],
        ['あ、そうなんですか。2回まで間違えています。', 'あ、そう な ん です か。にかい まで まちがえて います。', 'imasu describes an ongoing state. Reporting a completed count of past attempts needs the plain past: machigaemashita.']
      ] },
      { s: 'other', t: 'では、カードを取り出しますので、こちらの用紙にご記入ください。', r: 'では、カード お とりだします ので、こちら の ようし に ごきにゅう ください。', e: "We'll take the card out then, so please fill in this form." },
      { s: 'you', t: '今日中に返してもらえますか。', r: 'きょうじゅう に かえして もらえます か。', e: 'Can I get it back today?', wrong: [
        ['今日中に返してあげますか。', 'きょうじゅう に かえして あげます か。', 'te-ageru is you doing THEM a favour. You are asking to receive the card back: te-moraemasu ka.'],
        ['今日中に返しをもらえますか。', 'きょうじゅう に かえし お もらえます か。', 'kaeshi turns "return" into a bare noun. Asking for the act of returning it needs the verb te-form: kaeshite moraemasu ka.']
      ] },
      { s: 'other', t: '申し訳ありません、カードは銀行の窓口でしか返却できないんです。', r: 'もうしわけ ありません、カード わ ぎんこう の まどぐち でしか へんきゃく できない ん です。', e: 'I am very sorry, the card can only be returned at a bank branch counter.' },
      { s: 'you', t: 'そうなんですか…。じゃあ、どこに行けばいいですか。', r: 'そう な ん です か…。じゃあ、どこ に いけば いい です か。', e: 'Is that so... Then where should I go?', wrong: [
        ['そうなんですか…。じゃあ、どこに行くばいいですか。', 'そう な ん です か…。じゃあ、どこ に いく ば いい です か。', 'The conditional ba attaches to the e-stem, not the plain form — ikeba, not iku ba.'],
        ['そうなんですか…。じゃあ、どこが行けばいいですか。', 'そう な ん です か…。じゃあ、どこ が いけば いい です か。', 'The destination takes ni, not ga: doko ni ikeba.']
      ] },
      { s: 'other', t: '三丁目支店にお越しください。本人確認書類をお持ちくださいね。', r: 'さんちょうめ してん に おこし ください。ほんにん かくにん しょるい お おもち ください ね。', e: 'Please go to the Sanchome branch. Bring identification with you, alright.' },
      { s: 'you', t: 'わかりました。この用紙は持って行った方がいいですか。', r: 'わかりました。この ようし わ もって いった ほう が いい です か。', e: 'Understood. Should I bring this form with me?', wrong: [
        ['わかりました。この用紙は持って行く方がいいですか。', 'わかりました。この ようし わ もって いく ほう が いい です か。', 'For advice about a single upcoming action, hou ga ii pairs with the past-tense form even though nothing happened yet: motte itta hou ga.'],
        ['わかりました。この用紙は持って行けばいいですか。', 'わかりました。この ようし わ もって いけば いい です か。', 'That asks whether doing so would work out fine. Asking for advice on what is advisable is hou ga ii desu ka.']
      ] },
      { s: 'other', t: 'はい、念のため持って行ってください。', r: 'はい、ねん の ため もって いって ください。', e: 'Yes, bring it along just in case.' }
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
      ] },
      { s: 'other', t: 'でしたら、こちらの20ギガのプランはいかがですか。月額3000円です。', r: 'でしたら、こちら の にじゅっギガ の プラン わ いかが です か。げつがく さんぜん えん です。', e: 'In that case, how about this 20GB plan? It is 3000 yen a month.' },
      { s: 'you', t: 'それにします。いつから使えますか。', r: 'それ に します。いつ から つかえます か。', e: "I'll go with that. From when can I use it?", wrong: [
        ['それをします。いつから使えますか。', 'それ お します。いつ から つかえます か。', 'suru for choosing an option takes ni, marking what you are settling on — sore ni shimasu.'],
        ['それにします。いつまで使えますか。', 'それ に します。いつ まで つかえます か。', 'made asks for an end point. You are asking when it starts: itsu kara.']
      ] },
      { s: 'other', t: '今すぐ切り替えられます。本人確認書類をお願いします。', r: 'いま すぐ きりかえられます。ほんにん かくにん しょるい お おねがいします。', e: 'It can switch right away. Your ID, please.' },
      { s: 'you', t: 'はい、これでいいですか。免許証です。', r: 'はい、これ で いい です か。めんきょしょう です。', e: 'Sure, is this OK? It is my driver’s license.', wrong: [
        ['はい、これがいいですか。免許証です。', 'はい、これ が いい です か。めんきょしょう です。', 'ga would ask whether THIS ONE, out of options, is preferred. You are checking whether it is acceptable as ID: kore de ii desu ka.'],
        ['はい、これはいいですか。免許証です。', 'はい、これ わ いい です か。めんきょしょう です。', 'wa here reads as contrasting this ID against something else. Checking plain acceptability is kore de ii desu ka.']
      ] },
      { s: 'other', t: 'あの、こちらのご住所、今お住まいのところと違いますね。', r: 'あの、こちら の ごじゅうしょ、いま おすまい の ところ と ちがいます ね。', e: 'Um, this address is different from where you currently live.' },
      { s: 'you', t: 'あ、引っ越したばかりで、まだ変更していないんです。', r: 'あ、ひっこした ばかり で、まだ へんこう して いない ん です。', e: "Oh, I just moved and haven't updated it yet.", wrong: [
        ['あ、引っ越したばかりで、まだ変更しないんです。', 'あ、ひっこした ばかり で、まだ へんこう しない ん です。', 'shinai is plain negative "don\'t do". Saying you haven\'t gotten around to it yet needs the -te iru negative: henkou shite inai.'],
        ['あ、引っ越したところで、まだ変更していないんです。', 'あ、ひっこした ところ で、まだ へんこう して いない ん です。', 'hikkoshita tokoro de loosely means "right at the point of moving". The set phrase for "just did X" is bakari: hikkoshita bakari de.']
      ] },
      { s: 'other', t: 'でしたら、新しいご住所を教えていただけますか。免許証の変更は後日で結構です。', r: 'でしたら、あたらしい ごじゅうしょ お おしえて いただけます か。めんきょしょう の へんこう わ ごじつ で けっこう です。', e: 'In that case, could you tell us your new address? Updating the license itself can be done later.' },
      { s: 'you', t: '東京都渋谷区です、番地は後で送ります。', r: 'とうきょうと しぶやく です、ばんち わ あと で おくります。', e: "It's Shibuya-ku, Tokyo — I'll send the exact number later.", wrong: [
        ['東京都渋谷区です、番地は後に送ります。', 'とうきょうと しぶやく です、ばんち わ あと に おくります。', 'ni after ato is not the natural pattern for "later"; the set adverbial is ato de.'],
        ['東京都渋谷区です、番地は後で送ってください。', 'とうきょうと しぶやく です、ばんち わ あと で おくって ください。', 'kudasai asks THEM to send something to you. You are promising to send it yourself: okurimasu.']
      ] },
      { s: 'other', t: '承知しました。それでは新しいSIMを設定しますので、少々お待ちください。', r: 'しょうち しました。それでは あたらしい シム お せってい します ので、しょうしょう おまち ください。', e: "Understood. We'll set up the new SIM, so please wait a moment." },
      { s: 'you', t: 'お願いします。設定にはどれくらいかかりますか。', r: 'おねがいします。せってい に わ どれくらい かかります か。', e: 'Please do. How long will the setup take?', wrong: [
        ['お願いします。設定にどれくらいかけますか。', 'おねがいします。せってい に どれくらい かけます か。', 'kakemasu is spending time by choice, a transitive action. Asking how long the process itself takes is intransitive: kakarimasu ka.'],
        ['お願いします。設定はどれくらいありますか。', 'おねがいします。せってい わ どれくらい あります か。', 'arimasu asks whether a duration exists, not how much time a process consumes — dono kurai kakarimasu ka is how you ask that.']
      ] },
      { s: 'other', t: '10分ほどで終わります。', r: 'じゅっぷん ほど で おわります。', e: "It'll be done in about ten minutes." }
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
      ] },
      { s: 'other', t: 'はい、できますよ。乾燥は別料金で、30分200円です。', r: 'はい、できます よ。かんそう わ べつりょうきん で、さんじゅっぷん にひゃく えん です。', e: 'Yes, you can. Drying is a separate charge, 200 yen for 30 minutes.' },
      { s: 'you', t: '洗濯だけだといくらですか。', r: 'せんたく だけ だ と いくら です か。', e: 'How much is it if it is just the wash?', wrong: [
        ['洗濯だけだといくらでしたか。', 'せんたく だけ だ と いくら でした か。', 'deshita asks about a price in the past. You are asking the current price: desu ka.'],
        ['洗濯だけといくらですか。', 'せんたく だけ と いくら です か。', 'Dropping da before to breaks the conditional — the plain copula has to be there: dake da to.']
      ] },
      { s: 'other', t: '500円です。あ、こちらの機械、小銭しか使えないんです。', r: 'ごひゃく えん です。あ、こちら の きかい、こぜに しか つかえない ん です。', e: 'That is 500 yen. Oh, this machine only takes coins, by the way.' },
      { s: 'you', t: 'あ、細かいのがないんですけど、両替できますか。', r: 'あ、こまかい の が ない ん です けど、りょうがえ できます か。', e: "Oh, I don't have change — can I get some?", wrong: [
        ['あ、細かいのがいないんですけど、両替できますか。', 'あ、こまかい の が いない ん です けど、りょうがえ できます か。', 'inai is for animate things being absent; small change is inanimate, so nai.'],
        ['あ、細かいのをないんですけど、両替できますか。', 'あ、こまかい の お ない ん です けど、りょうがえ できます か。', 'nai, "there isn\'t", is intransitive — what is absent takes ga, not o.']
      ] },
      { s: 'other', t: 'あちらに両替機がありますよ。1000円札が使えます。', r: 'あちら に りょうがえき が あります よ。せんえんさつ が つかえます よ。', e: 'There is a change machine over there. It takes 1000 yen notes.' },
      { s: 'you', t: '助かります。ありがとうございます。', r: 'たすかります。ありがとうございます。', e: 'That is a help, thank you.', wrong: [
        ['助けます。ありがとうございます。', 'たすけます。ありがとうございます。', 'tasukemasu means YOU will help someone. Saying their tip helped you needs the intransitive: tasukarimasu.'],
        ['助かっています。ありがとうございます。', 'たすかって います。ありがとうございます。', 'The -te iru form reads as an ongoing state. Thanking them for the help just given is the plain tasukarimasu.']
      ] },
      { s: 'other', t: 'どういたしまして。洗濯は40分くらいで終わりますよ。', r: 'どういたしまして。せんたく わ よんじゅっぷん くらい で おわります よ。', e: "You're welcome. The wash will finish in about 40 minutes." },
      { s: 'you', t: 'わかりました。終わったら音か何かで知らせてくれますか。', r: 'わかりました。おわったら おと か なにか で しらせて くれます か。', e: 'Got it. Will it let me know with a sound or something when it is done?', wrong: [
        ['わかりました。終わったら音か何かで知らせてあげますか。', 'わかりました。おわったら おと か なにか で しらせて あげます か。', 'te-ageru is you doing the machine a favour. You want to receive the notification: te-kuremasu ka.'],
        ['わかりました。終わったら音か何かに知らせてくれますか。', 'わかりました。おわったら おと か なにか に しらせて くれます か。', 'ni would mark a recipient being informed, not the means of alerting you — the sound as method takes de.']
      ] },
      { s: 'other', t: 'いいえ、音は鳴らないので、時間を見て取りに来てくださいね。', r: 'いいえ、おと わ ならない ので、じかん お みて とり に きて ください ね。', e: 'No, it does not make a sound, so please keep an eye on the time and come collect it.' }
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
      ] },
      { s: 'other', t: 'ありがとうございます。少々お待ちください、在庫を確認します。', r: 'ありがとうございます。しょうしょう おまち ください、ざいこ お かくにん します。', e: "Thank you. One moment, I'll check the stock." },
      { s: 'other', t: '申し訳ございません、Mサイズは只今切らしております。', r: 'もうしわけ ございません、エム サイズ わ ただいま きらして おります。', e: "I'm very sorry, we're currently out of the M size." },
      { s: 'you', t: 'そうですか…。じゃあ、返金してもらえますか。', r: 'そう です か…。じゃあ、へんきん して もらえます か。', e: 'I see... Then could I get a refund?', wrong: [
        ['そうですか…。じゃあ、返金をあげますか。', 'そう です か…。じゃあ、へんきん お あげます か。', 'ageru is YOU giving someone else something. You want to RECEIVE a refund: moraemasu ka.'],
        ['そうですか…。じゃあ、返金させてもらえますか。', 'そう です か…。じゃあ、へんきん させて もらえます か。', 'sasete morau asks permission to do the refunding yourself. You want THEM to refund you: henkin shite moraemasu ka.']
      ] },
      { s: 'other', t: 'かしこまりました。お支払いはカードでしたね、同じカードにご返金します。', r: 'かしこまりました。おしはらい わ カード でした ね、おなじ カード に ごへんきん します。', e: 'Certainly. You paid by card, right — we will refund it to the same card.' },
      { s: 'you', t: '現金では返金できませんか。', r: 'げんきん で わ へんきん できません か。', e: "Can't it be refunded in cash?", wrong: [
        ['現金は返金できませんか。', 'げんきん わ へんきん できません か。', 'Bare wa would make cash the flat topic. Contrasting cash against the card refund they just proposed needs de wa.'],
        ['現金へは返金できませんか。', 'げんきん え わ へんきん できません か。', 'e marks a direction of movement — a payment method is not a destination. The means of the refund takes de.']
      ] },
      { s: 'other', t: '申し訳ありません、カードでのお支払いは現金でのご返金ができない決まりなんです。', r: 'もうしわけ ありません、カード で の おしはらい わ げんきん で の ごへんきん が できない きまり な ん です。', e: "I'm sorry, our policy doesn't allow cash refunds for card payments." },
      { s: 'you', t: 'わかりました。それなら、色違いに交換できますか。', r: 'わかりました。それなら、いろちがい に こうかん できます か。', e: 'I see. In that case, can I exchange it for a different colour instead?', wrong: [
        ['わかりました。それなら、色違いを交換できますか。', 'わかりました。それなら、いろちがい お こうかん できます か。', 'For exchanging FOR a different item, the item you are switching to takes ni; o would mark it as the thing being exchanged away.'],
        ['わかりました。それなら、色違いが交換できますか。', 'わかりました。それなら、いろちがい が こうかん できます か。', 'koukan dekiru with a specific target item keeps ni here, marking what you are changing into.']
      ] },
      { s: 'other', t: 'はい、こちらの黒でしたらございます。', r: 'はい、こちら の くろ でしたら ございます。', e: 'Yes, we do have this one in black.' },
      { s: 'you', t: 'それにします。カードへの返金でお願いします。', r: 'それ に します。カード え の へんきん で おねがいします。', e: "I'll take that. Please refund it to my card.", wrong: [
        ['それをします。カードへの返金でお願いします。', 'それ お します。カード え の へんきん で おねがいします。', 'Choosing an option takes ni: sore ni shimasu.'],
        ['それにします。カードでの返金へお願いします。', 'それ に します。カード で の へんきん え おねがいします。', 'e marks a direction of movement; a request does not have a destination like that — onegaishimasu just takes de for the method.']
      ] },
      { s: 'other', t: 'かしこまりました。少々お待ちください。', r: 'かしこまりました。しょうしょう おまち ください。', e: 'Certainly. One moment, please.' }
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
      ] },
      { s: 'other', t: 'はい、Lサイズですね。少々お待ちください…こちらです、どうぞ。', r: 'はい、エル サイズ です ね。しょうしょう おまち ください…こちら です、どうぞ。', e: 'Yes, size L, right? One moment... here you go.' },
      { s: 'you', t: 'ありがとうございます。もう一度着てみます。', r: 'ありがとうございます。もう いちど きて みます。', e: "Thank you. I'll try it on again.", wrong: [
        ['ありがとうございます。もう一度着てあげます。', 'ありがとうございます。もう いちど きて あげます。', 'te-ageru is doing someone a favour by wearing it, which does not make sense here. Trying something on for yourself is te-miru.'],
        ['ありがとうございます。もう一度着てもらいます。', 'ありがとうございます。もう いちど きて もらいます。', 'te-morau means having someone ELSE do it for you. You are the one trying it on: te-miru.']
      ] },
      { s: 'you', t: 'これ、ちょうどいいです。色違いはありますか。', r: 'これ、ちょうど いい です。いろちがい わ あります か。', e: 'This fits just right. Do you have it in a different colour?', wrong: [
        ['これ、ちょうどいいです。色違いをありますか。', 'これ、ちょうど いい です。いろちがい お あります か。', 'aru is intransitive — what exists takes ga or, as the new topic here, wa, not o.'],
        ['これ、ちょうどいいでした。色違いはありますか。', 'これ、ちょうど いい でした。いろちがい わ あります か。', 'deshita puts the fit in the past. You are describing how it feels right now: desu.']
      ] },
      { s: 'other', t: 'はい、紺と白がございます。こちらの紺は今セール中で、20%オフです。', r: 'はい、こん と しろ が ございます。こちら の こん わ いま セール ちゅう で、にじゅっパーセント オフ です。', e: 'Yes, we have navy and white. This navy one is on sale right now, 20% off.' },
      { s: 'you', t: 'じゃあ、紺にします。これをください。', r: 'じゃあ、こん に します。これ お ください。', e: "Then I'll go with navy. I'll take this one.", wrong: [
        ['じゃあ、紺をします。これをください。', 'じゃあ、こん お します。これ お ください。', 'Deciding on an option takes ni: kon ni shimasu.'],
        ['じゃあ、紺にします。これをあげます。', 'じゃあ、こん に します。これ お あげます。', 'ageru is you giving something away. Asking them to hand it over is kudasai.']
      ] },
      { s: 'other', t: 'かしこまりました。お会計はあちらのレジでお願いいたします。', r: 'かしこまりました。おかいけい わ あちら の レジ で おねがい いたします。', e: 'Certainly. Please pay at the register over there.' },
      { s: 'other', t: '袋はご利用になりますか、有料になりますが。', r: 'ふくろ わ ごりよう に なります か、ゆうりょう に なります が。', e: 'Would you like a bag? There is a charge for it though.' },
      { s: 'you', t: '大丈夫です、自分の袋があるので。', r: 'だいじょうぶ です、じぶん の ふくろ が ある ので。', e: 'I am fine, I have my own bag.', wrong: [
        ['大丈夫でした、自分の袋があるので。', 'だいじょうぶ でした、じぶん の ふくろ が ある ので。', 'deshita is past — you are declining right now, so desu.'],
        ['大丈夫です、自分の袋をあるので。', 'だいじょうぶ です、じぶん の ふくろ お ある ので。', 'aru is intransitive; what exists, your bag, takes ga.']
      ] },
      { s: 'other', t: 'かしこまりました。1500円になります。', r: 'かしこまりました。せん ごひゃく えん に なります。', e: "Certainly. That'll be 1500 yen." },
      { s: 'you', t: 'カードで払えますか。', r: 'カード で はらえます か。', e: 'Can I pay by card?', wrong: [
        ['カードを払えますか。', 'カード お はらえます か。', 'The card is the means of paying, not the thing being paid — the method takes de.'],
        ['カードで払いますか。', 'カード で はらいます か。', 'That asks whether YOU intend to pay, a plain statement of intent. Asking if it is accepted is the potential: haraemasu ka.']
      ] },
      { s: 'other', t: 'はい、こちらにどうぞ。', r: 'はい、こちら に どうぞ。', e: 'Yes, right here please.' }
    ]
  },
  {
    code: 'restaurant-allergy',
    unit: 'restaurant',
    title: 'Mentioning an allergy',
    situation: 'You must avoid eggs.',
    turns: [
      { s: 'other', t: 'ご注文はお決まりですか。', r: 'ごちゅうもん わ おきまり です か。', e: 'Have you decided on your order?' },
      { s: 'you', t: 'すみません、卵アレルギーがあるんです。', r: 'すみません、たまご アレルギー が ある ん です。', e: 'Excuse me, I have an egg allergy.', wrong: [
        ['すみません、卵アレルギーをあるんです。', 'すみません、たまご アレルギー お ある ん です。', 'aru is intransitive: ga.'],
        ['すみません、卵アレルギーがいるんです。', 'すみません、たまご アレルギー が いる ん です。', 'iru is for animate things.']
      ] },
      { s: 'other', t: 'かしこまりました。確認してまいります。', r: 'かしこまりました。かくにん して まいります。', e: 'Certainly, I will check.' },
      { s: 'you', t: 'この料理に卵は入っていますか。', r: 'この りょうり に たまご わ はいって います か。', e: 'Does this dish contain egg?', wrong: [
        ['この料理に卵を入っていますか。', 'この りょうり に たまご お はいって います か。', 'hairu is intransitive — what is inside takes ga or, as here, the topic wa.'],
        ['この料理に卵は入れていますか。', 'この りょうり に たまご わ いれて います か。', 'ireru means someone puts it in. Asking what is in it is haitte imasu ka.']
      ] },
      { s: 'other', t: 'お待たせいたしました。こちらのオムライスには卵が入っております。', r: 'おまたせ いたしました。こちら の オムライス に わ たまご が はいって おります。', e: 'Sorry for the wait. This omurice does contain egg.' },
      { s: 'you', t: 'そうですか。じゃあ、卵を抜くことはできますか。', r: 'そう です か。じゃあ、たまご お ぬく こと わ できます か。', e: 'I see. Then, is it possible to leave out the egg?', wrong: [
        ['そうですか。じゃあ、卵が抜くことはできますか。', 'そう です か。じゃあ、たまご が ぬく こと わ できます か。', 'nuku, to remove, takes an object: what is removed is tamago o, not ga.'],
        ['そうですか。じゃあ、卵を抜けることはできますか。', 'そう です か。じゃあ、たまご お ぬける こと わ できます か。', 'nukeru is the intransitive "to come out by itself". Asking whether they can remove it needs the plain verb inside dekiru: nuku koto wa dekimasu ka.']
      ] },
      { s: 'other', t: '申し訳ございません、こちらは卵が生地に練り込まれているので難しいです。', r: 'もうしわけ ございません、こちら わ たまご が きじ に ねりこまれて いる ので むずかしい です。', e: "I'm afraid this one is difficult — the egg is mixed right into the batter." },
      { s: 'you', t: 'わかりました。では、卵を使っていないメニューはありますか。', r: 'わかりました。では、たまご お つかって いない メニュー わ あります か。', e: 'I understand. Then, is there a menu item that does not use egg?', wrong: [
        ['わかりました。では、卵が使っていないメニューはありますか。', 'わかりました。では、たまご が つかって いない メニュー わ あります か。', 'tsukau takes an object: what is used is tamago o.'],
        ['わかりました。では、卵を使っていないメニューがいますか。', 'わかりました。では、たまご お つかって いない メニュー が います か。', 'iru is for animate things; a menu item takes arimasu ka.']
      ] },
      { s: 'other', t: 'でしたら、こちらのシーフードパスタでしたら卵不使用です。', r: 'でしたら、こちら の シーフード パスタ でしたら たまご ふしよう です。', e: 'In that case, this seafood pasta does not use egg.' },
      { s: 'you', t: 'それにします。あと、飲み物は水で大丈夫です。', r: 'それ に します。あと、のみもの わ みず で だいじょうぶ です。', e: "I'll have that. Also, water's fine for my drink.", wrong: [
        ['それにします。あと、飲み物は水が大丈夫です。', 'それ に します。あと、のみもの わ みず が だいじょうぶ です。', 'The drink you are settling for as sufficient takes de: mizu de daijoubu, not ga.'],
        ['それにします。あと、飲み物は水で大丈夫でした。', 'それ に します。あと、のみもの わ みず で だいじょうぶ でした。', 'deshita is past — you are deciding now, so desu.']
      ] },
      { s: 'other', t: 'かしこまりました。少々お待ちくださいませ。', r: 'かしこまりました。しょうしょう おまち くださいませ。', e: 'Certainly. Please wait a moment.' },
      { s: 'you', t: 'お願いします。それと、取り皿を一枚もらえますか。', r: 'おねがいします。それ と、とりざら お いちまい もらえます か。', e: 'Please. Also, could I get one extra small plate?', wrong: [
        ['お願いします。それと、取り皿を一枚あげますか。', 'おねがいします。それ と、とりざら お いちまい あげます か。', 'ageru is you giving something away. You are asking to receive a plate: moraemasu ka.'],
        ['お願いします。それと、取り皿が一枚もらえますか。', 'おねがいします。それ と、とりざら が いちまい もらえます か。', 'morau takes an object: what you receive is sara o.']
      ] }
    ]
  },
  {
    code: 'restaurant-split',
    unit: 'restaurant',
    title: 'Splitting the bill',
    situation: 'You are paying with a friend.',
    turns: [
      { s: 'you', t: 'すみません、お会計をお願いします。', r: 'すみません、おかいけい お おねがいします。', e: 'Excuse me, could we get the bill please.', wrong: [
        ['すみません、お会計でお願いします。', 'すみません、おかいけい で おねがいします。', 'de marks a means or method; the bill itself is the direct object of your request, so o: okaikei o onegaishimasu.'],
        ['すみません、お会計もお願いします。', 'すみません、おかいけい も おねがいします。', 'mo means "also", implying you are asking for the bill in addition to something else already requested. Just asking for it plainly takes o.']
      ] },
      { s: 'you', t: 'すみません、別々でお願いします。', r: 'すみません、べつべつ で おねがいします。', e: 'Separately, please.', wrong: [
        ['すみません、別々をお願いします。', 'すみません、べつべつ お おねがいします。', 'The manner of paying takes de.'],
        ['すみません、一緒でお願いします。', 'すみません、いっしょ で おねがいします。', 'issho is together — the opposite of what you want.']
      ] },
      { s: 'other', t: '申し訳ありません、お会計は一緒でお願いしております。', r: 'もうしわけ ありません、おかいけい わ いっしょ で おねがい して おります。', e: 'Sorry, we only take one payment.' },
      { s: 'you', t: 'そうですか。では、一緒でいいです。', r: 'そう です か。では、いっしょ で いい です。', e: 'I see. Together is fine, then.', wrong: [
        ['そうですね。では、一緒でいいです。', 'そう です ね。では、いっしょ で いい です。', 'ne seeks agreement about shared knowledge. You have just been told something new: sou desu ka.'],
        ['そうですか。では、別々でいいです。', 'そう です か。では、べつべつ で いい です。', 'They just said separate is not possible.']
      ] },
      { s: 'other', t: 'ありがとうございます。合計で4800円になります。', r: 'ありがとうございます。ごうけい で よんせん はっぴゃく えん に なります。', e: 'Thank you. That comes to 4800 yen in total.' },
      { s: 'you', t: '半分ずつだと、いくらになりますか。', r: 'はんぶん ずつ だ と、いくら に なります か。', e: 'If we split it in half, how much would that be?', wrong: [
        ['半分ずつはいくらになりますか。', 'はんぶん ずつ わ いくら に なります か。', 'This drops the conditional entirely — "if split in half" needs da to, not a bare wa.'],
        ['半分ずつだと、いくらがなりますか。', 'はんぶん ずつ だ と、いくら が なります か。', 'naru marks the resulting amount with ni, not ga: ikura ni narimasu.']
      ] },
      { s: 'other', t: '2400円ずつですね。お支払いはどうされますか。', r: 'にせん よんひゃく えん ずつ です ね。おしはらい わ どう されます か。', e: '2400 yen each, then. How would you like to pay?' },
      { s: 'you', t: '私が先にカードで払って、友達が現金で私に渡します。', r: 'わたし が さき に カード で はらって、ともだち が げんきん で わたし に わたします。', e: "I'll pay by card first, and my friend will hand me cash.", wrong: [
        ['私が先にカードで払って、友達が現金で私を渡します。', 'わたし が さき に カード で はらって、ともだち が げんきん で わたし お わたします。', 'watasu, to hand over, takes ni for the receiver, not o — that would make YOU the thing being handed over.'],
        ['私が先にカードで払って、友達が現金で私に渡ります。', 'わたし が さき に カード で はらって、ともだち が げんきん で わたし に わたります。', 'wataru is intransitive, "to be handed over by itself". Your friend actively handing you cash needs the transitive: watasu.']
      ] },
      { s: 'other', t: 'かしこまりました。では、こちらのカードでよろしいですか。', r: 'かしこまりました。では、こちら の カード で よろしい です か。', e: 'Certainly. Is this card alright, then?' },
      { s: 'other', t: 'あ、こちらのカードは決済できませんでした。別のカードはお持ちですか。', r: 'あ、こちら の カード わ けっさい できません でした。べつ の カード わ おもち です か。', e: 'Ah, this card did not go through. Do you have another one?' },
      { s: 'you', t: 'え、本当ですか。じゃあ、こっちのカードを試してもらえますか。', r: 'え、ほんとう です か。じゃあ、こっち の カード お ためして もらえます か。', e: 'Really? Then could you try this other card?', wrong: [
        ['え、本当ですか。じゃあ、こっちのカードが試してもらえますか。', 'え、ほんとう です か。じゃあ、こっち の カード が ためして もらえます か。', 'tamesu, to try, takes an object: what is tried takes o, not ga.'],
        ['え、本当ですか。じゃあ、こっちのカードに試してもらえますか。', 'え、ほんとう です か。じゃあ、こっち の カード に ためして もらえます か。', 'ni would mark the card as a recipient or target, not the thing being tried — the card itself takes o.']
      ] },
      { s: 'other', t: 'はい、今度は通りました。ありがとうございます。', r: 'はい、こんど わ とおりました。ありがとうございます。', e: 'Yes, it went through this time. Thank you.' },
      { s: 'you', t: 'よかったです。レシート、2枚もらえますか。', r: 'よかった です。レシート、にまい もらえます か。', e: 'Good. Could I get two receipts?', wrong: [
        ['よかったです。レシート、2枚あげますか。', 'よかった です。レシート、にまい あげます か。', 'ageru is giving something away. You want to receive two receipts: moraemasu ka.'],
        ['よかったです。レシートを2枚もらいですか。', 'よかった です。レシート お にまい もらい です か。', 'morai is the bare stem, not a valid predicate on its own — the polite potential moraemasu ka is what you need.']
      ] },
      { s: 'other', t: 'かしこまりました。少々お待ちください。', r: 'かしこまりました。しょうしょう おまち ください。', e: 'Certainly. One moment please.' }
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
      ] },
      { s: 'other', t: 'はい、できますよ。使い方はわかりますか。', r: 'はい、できます よ。つかいかた わ わかります か。', e: 'Yes, it can. Do you know how to use it?' },
      { s: 'you', t: 'いえ、初めてなので教えてもらえますか。', r: 'いえ、はじめて な ので おしえて もらえます か。', e: 'No, it is my first time, so could you show me?', wrong: [
        ['いえ、初めてので教えてもらえますか。', 'いえ、はじめて ので おしえて もらえます か。', 'hajimete is a noun; before node a noun needs na: hajimete na node.'],
        ['いえ、初めてなので教えてあげますか。', 'いえ、はじめて な ので おしえて あげます か。', 'te-ageru is you doing them a favour by teaching. You want to be taught: te-moraemasu ka.']
      ] },
      { s: 'other', t: 'A4はこちら、ここにお金を入れて、緑のボタンを押してください。', r: 'エーよん わ こちら、ここ に おかね お いれて、みどり の ボタン お おして ください。', e: 'A4 is here — put money in here and press the green button.' },
      { s: 'you', t: 'あ、お札しかないんですけど、使えますか。', r: 'あ、おさつ しか ない ん です けど、つかえます か。', e: 'Oh, I only have a bill — can that be used?', wrong: [
        ['あ、お札しかいないんですけど、使えますか。', 'あ、おさつ しか いない ん です けど、つかえます か。', 'inai is for animate things being absent; a bill is inanimate, so nai.'],
        ['あ、お札しかないんですけど、使いますか。', 'あ、おさつ しか ない ん です けど、つかいます か。', 'That asks whether YOU will use it, a plain intention. Asking whether it is accepted is the potential: tsukaemasu ka.']
      ] },
      { s: 'other', t: 'はい、千円札まで使えます。お釣りも出ますよ。', r: 'はい、せんえんさつ まで つかえます。おつり も でます よ。', e: 'Yes, it takes up to a 1000 yen note. It gives change too.' },
      { s: 'you', t: 'すみません、紙が詰まってしまったみたいです。', r: 'すみません、かみ が つまって しまった みたい です。', e: "Excuse me, it looks like the paper's gotten jammed.", wrong: [
        ['すみません、紙を詰まってしまったみたいです。', 'すみません、かみ お つまって しまった みたい です。', 'tsumaru is intransitive, "to get jammed" — what jams takes ga, not o.'],
        ['すみません、紙が詰めてしまったみたいです。', 'すみません、かみ が つめて しまった みたい です。', 'tsumeru means someone jams it on purpose. The paper jamming by itself is the intransitive: tsumatte shimatta.']
      ] },
      { s: 'other', t: 'あ、すみません、すぐ直します。少々お待ちください。', r: 'あ、すみません、すぐ なおします。しょうしょう おまち ください。', e: "Oh, sorry, I'll fix it right away. One moment please." },
      { s: 'other', t: 'お待たせしました。もう一度お試しください。', r: 'おまたせ しました。もう いちど おためし ください。', e: 'Sorry to keep you waiting. Please try again.' },
      { s: 'you', t: 'ありがとうございます。全部で何枚になりますか。', r: 'ありがとうございます。ぜんぶ で なんまい に なります か。', e: 'Thank you. How many sheets does that come to in total?', wrong: [
        ['ありがとうございます。全部を何枚になりますか。', 'ありがとうございます。ぜんぶ お なんまい に なります か。', 'naru does not take a direct object — "in total" as the scope takes de: zenbu de.'],
        ['ありがとうございます。全部で何枚がなりますか。', 'ありがとうございます。ぜんぶ で なんまい が なります か。', 'The resulting count takes ni: nanmai ni narimasu, not ga.']
      ] },
      { s: 'other', t: '3枚で30円になります。', r: 'さんまい で さんじゅう えん に なります。', e: "Three sheets, that'll be 30 yen." }
    ]
  }
]
