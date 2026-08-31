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
      ] },
      { s: 'other', t: 'あ、それから、資料はもう準備できていますか。', r: 'あ、それから、しりょう わ もう じゅんび できて います か。', e: 'Oh, also — are the materials ready yet?' },
      { s: 'you', t: 'すみません、まだです。今から作ります。', r: 'すみません、まだ です。いま から つくります。', e: 'Sorry, not yet. I\'ll make them now.', wrong: [
        ['すみません、まだじゃありません。今から作ります。', 'すみません、まだ じゃありません。いま から つくります。', 'mada already leans negative — "not yet". Adding janai negates that again and flips the meaning to "it is already done".'],
        ['すみません、今から作ってあげます。', 'すみません、いま から つくって あげます。', 'te ageru frames finishing your own assigned work as a favor granted to your manager, which sounds presumptuous — plain tsukurimasu is enough.']
      ] },
      { s: 'other', t: '急がなくても大丈夫ですよ。会議の前に見せてもらえますか。', r: 'いそがなくても だいじょうぶ です よ。かいぎ の まえ に みせて もらえます か。', e: 'No rush. Could you show them to me before the meeting?' },
      { s: 'you', t: 'はい、九時半までにお見せします。', r: 'はい、くじはん まで に おみせします。', e: 'Yes, I\'ll show you by 9:30.', wrong: [
        ['はい、九時半までお見せします。', 'はい、くじはん まで おみせします。', 'made alone is continuous — up TO 9:30. A one-time deadline for showing them needs made ni, not made by itself.'],
        ['はい、九時半までに見せてあげます。', 'はい、くじはん まで に みせて あげます。', 'misete agemasu frames showing your manager the materials as a favor granted to them, which is backwards for someone senior — the humble o-mise shimasu is what fits.']
      ] },
      { s: 'other', t: 'お願いします。じゃあ、また後で。', r: 'おねがいします。じゃあ、また あとで。', e: 'Please do. See you later then.' },
      { s: 'you', t: 'はい、また後で。', r: 'はい、また あとで。', e: 'Yes, see you later.', wrong: [
        ['はい、さようなら。', 'はい、さようなら。', 'sayounara sounds like a final farewell, as though you will not see them again — for a colleague you will see later the same day, mata ato de is what is said.'],
        ['はい、行ってきます。', 'はい、いってきます。', 'ittekimasu is said by the person heading OUT and coming back shortly; here your colleague is the one leaving your desk, so it does not fit your side of the exchange.']
      ] }
    ]
  },
  {
    code: 'work-leaving',
    unit: 'work',
    title: 'Leaving the office',
    situation: 'You are done for the day; others are still working.',
    turns: [
      { s: 'other', t: 'もう帰るんですか。今日は早いですね。', r: 'もう かえる ん です か。きょう わ はやい です ね。', e: 'Heading home already? You\'re early today.' },
      { s: 'you', t: 'ええ、ちょっと用事があるんです。', r: 'ええ、ちょっと ようじ が ある ん です。', e: 'Yeah, I\'ve got a bit of a thing on.', wrong: [
        ['ええ、ちょっと用事をあるんです。', 'ええ、ちょっと ようじ お ある ん です。', 'aru is intransitive existence — what exists takes ga, not o.'],
        ['ええ、ちょっと用事があるですよ。', 'ええ、ちょっと ようじ が ある です よ。', 'the explanatory form needs n before desu — aru n desu, not aru desu. Dropping the n loses the explanatory nuance and sounds broken.']
      ] },
      { s: 'other', t: 'そうですか。お先にどうぞ。', r: 'そう です か。おさきに どうぞ。', e: 'I see. Go ahead then.' },
      { s: 'you', t: 'お先に失礼します。', r: 'おさきに しつれいします。', e: 'I am off — excuse me for leaving first.', wrong: [
        ['さようなら。', 'さようなら。', 'sayounara sounds final, as though you were not coming back tomorrow.'],
        ['いってきます。', 'いってきます。', 'ittekimasu says you are going out and returning shortly. Leaving for the day is osaki ni shitsurei shimasu.']
      ] },
      { s: 'other', t: 'お疲れさまでした。', r: 'おつかれさま でした。', e: 'Thanks for your work.' },
      { s: 'you', t: 'お疲れさまでした。', r: 'おつかれさま でした。', e: 'And you.', wrong: [
        ['ご苦労さまでした。', 'ごくろうさま でした。', 'gokurousama is said downward, by a superior to a subordinate. Said upward or sideways it is rude.'],
        ['どういたしまして。', 'どういたしまして。', 'That answers thanks. Otsukaresama is a greeting, not thanks — it is returned, not accepted.']
      ] },
      { s: 'other', t: '明日も九時からでしたっけ。', r: 'あした も くじ から でした っけ。', e: 'Nine again tomorrow, right?' },
      { s: 'you', t: 'はい、九時からです。', r: 'はい、くじ から です。', e: 'Yes, from nine.', wrong: [
        ['はい、九時からでした。', 'はい、くじ から でした。', 'past tense deshita treats tomorrow\'s start time as something already over; a schedule that has not happened yet needs the plain non-past desu.'],
        ['はい、九時にからです。', 'はい、くじ に から です。', 'kara already marks the starting point by itself; stacking ni in front of it is redundant — just kuji kara desu.']
      ] },
      { s: 'other', t: '分かりました。じゃあ、また明日。', r: 'わかりました。じゃあ、また あした。', e: 'Got it. See you tomorrow then.' },
      { s: 'you', t: 'はい、また明日。', r: 'はい、また あした。', e: 'Yes, see you tomorrow.', wrong: [
        ['さようなら。', 'さようなら。', 'sayounara to a colleague you will see again tomorrow sounds overly final, as though you are not coming back.'],
        ['では、失礼いたします。', 'では、しつれい いたします。', 'shitsurei itashimasu is humble language for ending a formal meeting or call, not a casual goodbye to a peer heading out the same door.']
      ] }
    ]
  },
  {
    code: 'work-day-off',
    unit: 'work',
    title: 'Asking for a day off',
    situation: 'You need Friday off.',
    turns: [
      { s: 'you', t: '部長、今ちょっとよろしいですか。', r: 'ぶちょう、いま ちょっと よろしい です か。', e: 'Director, do you have a moment?', wrong: [
        ['部長、今ちょっといい？', 'ぶちょう、いま ちょっと いい？', 'the plain casual ii? to your department head is far too familiar — yoroshii desu ka is the polite register for approaching a superior.'],
        ['部長さん、今ちょっとよろしいですか。', 'ぶちょうさん、いま ちょっと よろしい です か。', 'buchou is already a title; adding san to a job title doubles the honorific and sounds off — the title alone is respectful enough.']
      ] },
      { s: 'other', t: 'はい、何ですか。', r: 'はい、なん です か。', e: 'Yes, what is it?' },
      { s: 'you', t: 'すみません、金曜日に休みを取ってもいいですか。', r: 'すみません、きんようび に やすみ お とって も いい です か。', e: 'May I take Friday off?', wrong: [
        ['すみません、金曜日に休みます。', 'すみません、きんようび に やすみます。', 'That announces you will not be in. Asking permission is te mo ii desu ka.'],
        ['すみません、金曜日は休みを取りたいです。', 'すみません、きんようび わ やすみ お とりたい です。', 'States a want. To a manager, asking permission is the form.']
      ] },
      { s: 'other', t: '大丈夫ですよ。理由は。', r: 'だいじょうぶ です よ。りゆう わ。', e: 'That is fine. Reason?' },
      { s: 'you', t: '家族が来るので、空港に迎えに行きます。', r: 'かぞく が くる ので、くうこう に むかえ に いきます。', e: 'My family is coming, so I am meeting them at the airport.', wrong: [
        ['家族が来るから、空港に迎えに行きます。', 'かぞく が くる から、くうこう に むかえ に いきます。', 'kara is a subjective reason and can sound like an excuse. To a manager, node is the softer, more objective word.'],
        ['家族が来るので、空港で迎えに行きます。', 'かぞく が くる ので、くうこう で むかえ に いきます。', 'de marks where an action happens, but with iku the airport is the destination: ni.']
      ] },
      { s: 'other', t: '分かりました。仕事の方は大丈夫ですか。', r: 'わかりました。しごと の ほう わ だいじょうぶ です か。', e: 'Got it. Is your work under control?' },
      { s: 'you', t: 'はい、金曜日の分は木曜日までに終わらせておきます。', r: 'はい、きんようび の ぶん わ もくようび まで に おわらせて おきます。', e: 'Yes, I\'ll get Friday\'s share finished by Thursday.', wrong: [
        ['はい、金曜日の分は木曜日までに終わらせます。', 'はい、きんようび の ぶん わ もくようび まで に おわらせます。', 'owaraseru alone just says you will finish it; adding oku (owarasete oku) signals you are doing it in advance for their benefit — dropping oku loses that "taken care of" nuance.'],
        ['はい、金曜日の分は木曜日までに終わっておきます。', 'はい、きんようび の ぶん わ もくようび まで に おわって おきます。', 'owaru is intransitive — the work finishes by itself; since YOU are the one finishing it, the transitive owaraseru is needed, not owaru.']
      ] },
      { s: 'other', t: 'それなら安心です。良い週末を。', r: 'それなら あんしん です。よい しゅうまつ お。', e: 'That\'s a relief then. Have a good weekend.' },
      { s: 'you', t: 'ありがとうございます。助かります。', r: 'ありがとう ございます。たすかります。', e: 'Thank you. That\'s a big help.', wrong: [
        ['ありがとうございます。助けます。', 'ありがとう ございます。たすけます。', 'tasukemasu is a future/volitional statement, "I will help/rescue" — describing the relief you feel from their favor needs the stative tasukarimasu, not tasukemasu.'],
        ['ありがとうございます。休みをもらってあげます。', 'ありがとう ございます。やすみ お もらって あげます。', 'morau and ageru point in opposite directions — you received the favor (morau) from your manager; ageru would mean doing HIM a favor, which reverses who benefits.']
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
      { s: 'other', t: 'こちらこそ、よろしくお願いします。', r: 'こちらこそ、よろしく おねがいします。', e: 'Likewise.' },
      { s: 'you', t: '田中さんは、どちらの部署からいらっしゃったんですか。', r: 'たなかさん わ、どちら の ぶしょ から いらっしゃった ん です か。', e: 'Which department did you come from, Tanaka-san?', wrong: [
        ['田中さんは、どこの部署から来ましたか。', 'たなかさん わ、どこ の ぶしょ から きました か。', 'kimashita is plain-polite but shows no special respect for someone you have just met; irasshatta (or the softer irashita n desu ka) honors THEIR action.'],
        ['田中さんは、どちらの部署から参りましたか。', 'たなかさん わ、どちら の ぶしょ から まいりました か。', 'mairu is humble language for your OWN actions; used about Tanaka\'s action it lowers him instead of respecting him — his action needs the respectful irassharu, not the humble mairu.']
      ] },
      { s: 'other', t: '営業部から来ました。今日からこちらでお世話になります。', r: 'えいぎょうぶ から きました。きょう から こちら で おせわ に なります。', e: 'I came from Sales. I\'ll be in your care starting today.' },
      { s: 'you', t: 'そうですか。分からないことがあったら、何でも聞いてください。', r: 'そう です か。わからない こと が あったら、なんでも きいて ください。', e: 'I see. If there\'s anything you\'re unsure about, feel free to ask me anything.', wrong: [
        ['そうですか。分からないことがあったら、何でも聞いてもらってください。', 'そう です か。わからない こと が あったら、なんでも きいて もらって ください。', 'kiite moratte kudasai asks Tanaka to arrange for someone ELSE to ask; you mean "ask me", which is just kiite kudasai.'],
        ['そうですか。分からないことがあったら、何でも伺ってください。', 'そう です か。わからない こと が あったら、なんでも うかがって ください。', 'ukagau is humble language for asking someone senior; inviting a fellow new colleague to ask casually just needs kiku — ukagau would oddly lower Tanaka instead of you.']
      ] },
      { s: 'other', t: 'ありがとうございます。心強いです。', r: 'ありがとう ございます。こころづよい です。', e: 'Thank you. That\'s reassuring.' },
      { s: 'you', t: 'いえいえ、お互い頑張りましょう。', r: 'いえいえ、おたがい がんばりましょう。', e: 'No, no — let\'s both do our best.', wrong: [
        ['いえいえ、お互い頑張ってあげましょう。', 'いえいえ、おたがい がんばって あげましょう。', 'ganbatte agemashou frames your own effort as a favor granted to Tanaka, which sounds condescending; ganbarimashou alone is the plain, shared invitation.'],
        ['いえいえ、お互い頑張ってください。', 'いえいえ、おたがい がんばって ください。', 'kudasai directs the effort at Tanaka alone; otagai ("each other") calls for a shared form like mashou, not a one-way command.']
      ] },
      { s: 'other', t: 'はい、よろしくお願いします。', r: 'はい、よろしく おねがいします。', e: 'Yes, looking forward to working with you.' }
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
      ] },
      { s: 'other', t: 'じゃあ、もう少し簡単な例で説明しましょうか。', r: 'じゃあ、もう すこし かんたんな れい で せつめい しましょう か。', e: 'Then shall I explain with a simpler example?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、ください。', 'はい、ください。', 'kudasai alone demands an object be handed over; you are accepting an offer to be taught, which just needs onegaishimasu.'],
        ['はい、いいです。', 'はい、いい です。', 'ii desu here reads as a polite decline ("I\'m fine, thanks"), not an acceptance — to say yes you need onegaishimasu, not ii desu.']
      ] },
      { s: 'other', t: 'これなら分かりますか。', r: 'これなら わかります か。', e: 'Does this make sense now?' },
      { s: 'you', t: 'あ、何となく分かってきました。', r: 'あ、なんとなく わかって きました。', e: 'Ah, I\'m starting to get it.', wrong: [
        ['あ、何となく分かってしまいました。', 'あ、なんとなく わかって しまいました。', 'wakatte shimaimashita frames understanding as an unfortunate or accidental event; wakatte kimashita marks the gradual shift into understanding, which is what is actually happening.'],
        ['あ、何となく分かります。', 'あ、なんとなく わかります。', 'plain wakarimasu states a flat fact; the sense of just now clicking into place, moving from confusion to clarity, is what kimashita captures.']
      ] },
      { s: 'other', t: 'よかったです。他に質問はありますか。', r: 'よかった です。ほか に しつもん わ あります か。', e: 'Good. Any other questions?' },
      { s: 'you', t: 'いいえ、大丈夫です。ありがとうございました。', r: 'いいえ、だいじょうぶ です。ありがとう ございました。', e: 'No, I\'m fine. Thank you.', wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'daijoubu desu is itself a soft decline ("I\'m fine"); answering hai to "any other questions?" contradicts it, leaving the teacher unsure whether you actually have more.'],
        ['いいえ、大丈夫でした。', 'いいえ、だいじょうぶ でした。', 'past tense deshita describes a state that is now over; you are answering right now, so the plain non-past daijoubu desu is what fits.']
      ] },
      { s: 'other', t: 'どういたしまして。分からなかったら、いつでも聞いてください。', r: 'どういたしまして。わからなかったら、いつでも きいて ください。', e: 'You\'re welcome. If you don\'t understand, ask anytime.' }
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
      { s: 'other', t: 'そうです。遅れないでくださいね。', r: 'そう です。おくれないで ください ね。', e: 'That is right. Do not be late.' },
      { s: 'you', t: '分かりました。レポートはメールで送ってもいいですか。', r: 'わかりました。レポート わ メール で おくって も いい です か。', e: 'Got it. Can I send the report by email?', wrong: [
        ['分かりました。レポートはメールに送ってもいいですか。', 'わかりました。レポート わ メール に おくって も いい です か。', 'ni marks a destination point, like an address itself; the medium you send THROUGH takes de — meeru de okuru.'],
        ['分かりました。レポートはメールを送ってもいいですか。', 'わかりました。レポート わ メール お おくって も いい です か。', 'that asks permission to send "an email" as the object, not the report via email — the report is what is sent (repooto o), the email is the means (meeru de).']
      ] },
      { s: 'other', t: 'ええ、いいですよ。件名に名前を書いてください。', r: 'ええ、いい です よ。けんめい に なまえ お かいて ください。', e: 'Yes, that\'s fine. Please put your name in the subject line.' },
      { s: 'you', t: 'もし火曜日までに終わらなかったら、どうすればいいですか。', r: 'もし かようび まで に おわらなかったら、どう すれば いい です か。', e: 'If I can\'t finish it by Tuesday, what should I do?', wrong: [
        ['もし火曜日までに終わりなかったら、どうすればいいですか。', 'もし かようび まで に おわり なかったら、どう すれば いい です か。', 'owaru negates to owaranai; owari is the noun-like stem form and cannot take nai directly.'],
        ['もし火曜日までに終わらなかったら、どうしてもいいですか。', 'もし かようび まで に おわらなかったら、どう しても いい です か。', 'doushite mo ii desu ka asks permission to do whatever you like — it turns the question into a blanket request, not a request for advice, which is dou sureba ii desu ka.']
      ] },
      { s: 'other', t: '早めに相談してくださいね。連絡がなければ減点します。', r: 'はやめに そうだん して ください ね。れんらく が なければ げんてん します。', e: 'Talk to me early then. If there\'s no word from you, I\'ll deduct points.' },
      { s: 'you', t: '分かりました。頑張ります。', r: 'わかりました。がんばります。', e: 'Got it. I\'ll do my best.', wrong: [
        ['分かりました。頑張ってあげます。', 'わかりました。がんばって あげます。', 'ganbatte agemasu frames your own effort as a favor done for the teacher, which is presumptuous; ganbarimasu alone states your own intent to try.'],
        ['分かりました。頑張れます。', 'わかりました。がんばれます。', 'ganbaremasu is the potential form, a claim about being ABLE to try hard — a plain statement of intent is ganbarimasu, not a statement about capability.']
      ] },
      { s: 'other', t: 'はい、期待していますよ。', r: 'はい、きたい して います よ。', e: 'Yes, I\'m counting on you.' }
    ]
  },
  {
    code: 'social-plans',
    unit: 'social',
    title: 'Making plans',
    situation: 'A friend messages about the weekend.',
    turns: [
      { s: 'other', t: '最近元気？', r: 'さいきん げんき？', e: 'How\'ve you been lately?' },
      { s: 'you', t: 'うん、まあまあかな。そっちは？', r: 'うん、まあまあ かな。そっち わ？', e: 'Yeah, so-so I guess. You?', wrong: [
        ['うん、まあまあかな。そちらは？', 'うん、まあまあ かな。そちら わ？', 'sochira is the polite/formal way to say "you/that side" — with a close friend the plain socchi fits, sochira sounds stiffly formal here.'],
        ['はい、まあまあです。そっちは？', 'はい、まあまあ です。そっち わ？', 'hai...desu answers a casual genki? with distancing polite language, which reads as oddly formal toward a friend who just asked you casually.']
      ] },
      { s: 'other', t: '週末、映画でも見に行かない？', r: 'しゅうまつ、えいが でも み に いかない？', e: 'Want to go see a film at the weekend?' },
      { s: 'you', t: 'いいですね。土曜日はどうですか。', r: 'いい です ね。どようび わ どう です か。', e: 'Sounds good. How about Saturday?', wrong: [
        ['いいですね。土曜日がどうですか。', 'いい です ね。どようび が どう です か。', 'You are proposing a day, not picking it out. Proposals take wa.'],
        ['いいですよ。土曜日はどうですか。', 'いい です よ。どようび わ どう です か。', 'yo tells them something new, which lands as slightly grudging permission. ne shares the enthusiasm.']
      ] },
      { s: 'other', t: '土曜日は用事があるんだ。日曜日は？', r: 'どようび わ ようじ が ある ん だ。にちようび わ？', e: 'I am busy Saturday. Sunday?' },
      { s: 'you', t: '日曜日でも大丈夫です。', r: 'にちようび でも だいじょうぶ です。', e: 'Sunday works too.', wrong: [
        ['日曜日にも大丈夫です。', 'にちようび に も だいじょうぶ です。', 'demo is "either way is fine". ni mo would add Sunday to a list of days you had already agreed.'],
        ['日曜日は大丈夫じゃないです。', 'にちようび わ だいじょうぶ じゃない です。', 'That refuses the day they just offered.']
      ] },
      { s: 'other', t: 'じゃあ、日曜日の午後はどう？', r: 'じゃあ、にちようび の ごご わ どう？', e: 'Okay then, how about Sunday afternoon?' },
      { s: 'you', t: 'いいですよ。何時に集合する？', r: 'いい です よ。なんじ に しゅうごう する？', e: 'Sounds good. What time should we meet up?', wrong: [
        ['いいですよ。何時に集合しますか。', 'いい です よ。なんじ に しゅうごう します か。', 'masu-form questions between close friends read as unexpectedly formal; the plain suru? matches the casual tone of the rest of the exchange.'],
        ['いいですよ。何時が集合する？', 'いい です よ。なんじ が しゅうごう する？', 'shuugou suru needs a time particle to attach the "when" to — that is ni. ga would try to make "what time" the subject, which does not fit an action verb like this.']
      ] },
      { s: 'other', t: '二時に駅前でどう？', r: 'にじ に えきまえ で どう？', e: 'How about 2 at the station?' },
      { s: 'you', t: '分かった。じゃあ、日曜日にね。', r: 'わかった。じゃあ、にちようび に ね。', e: 'Got it. See you Sunday then.', wrong: [
        ['分かりました。じゃあ、日曜日にね。', 'わかりました。じゃあ、にちようび に ね。', 'wakarimashita politely closes the sentence, but the casual ne right after snaps back — mixing keigo and casual sentence-final particles in one line reads as inconsistent with a friend.'],
        ['分かった。じゃあ、日曜日はね。', 'わかった。じゃあ、にちようび わ ね。', 'wa marks a contrast or topic shift ("as for Sunday..."); confirming a plan for a specific day just needs the point-in-time ni, not wa.']
      ] }
    ]
  },
  {
    code: 'social-late',
    unit: 'social',
    title: 'Running late',
    situation: 'You are twenty minutes behind.',
    turns: [
      { s: 'other', t: 'もしもし。今どこ？', r: 'もしもし。いま どこ？', e: 'Hey. Where are you now?' },
      { s: 'you', t: 'ごめん、電車が遅れていて、二十分ぐらい遅れます。', r: 'ごめん、でんしゃ が おくれて いて、にじゅっぷん ぐらい おくれます。', e: 'Sorry, the train is delayed — I will be about twenty minutes late.', wrong: [
        ['ごめん、電車が遅れて、二十分ごろ遅れます。', 'ごめん、でんしゃ が おくれて、にじゅっぷん ごろ おくれます。', 'goro is for a point in time — three o\'clock-ish. For a duration it is gurai.'],
        ['ごめん、電車を遅れていて、二十分ぐらい遅れます。', 'ごめん、でんしゃ お おくれて いて、にじゅっぷん ぐらい おくれます。', 'okureru is intransitive — the train is doing the being-late, so ga.']
      ] },
      { s: 'other', t: '大丈夫、気をつけて。', r: 'だいじょうぶ、き お つけて。', e: 'No problem, take care.' },
      { s: 'you', t: 'ありがとう。先に入っていて。', r: 'ありがとう。さきに はいって いて。', e: 'Thanks. Go on in without me.', wrong: [
        ['ありがとう。先に入ってください。', 'ありがとう。さきに はいって ください。', 'Grammatical, but kudasai to a close friend is stiff — it sounds like you are giving instructions.'],
        ['ありがとう。先に入ります。', 'ありがとう。さきに はいります。', 'That says YOU will go in first, which you cannot — you are not there.']
      ] },
      { s: 'other', t: '分かった。じゃあ先に注文しておくね。', r: 'わかった。じゃあ さきに ちゅうもん して おく ね。', e: 'Got it. I\'ll go ahead and order then.' },
      { s: 'you', t: 'ごめん、何か頼んでおいて。', r: 'ごめん、なにか たのんで おいて。', e: 'Sorry, order something for me.', wrong: [
        ['ごめん、何か頼んであげて。', 'ごめん、なにか たのんで あげて。', 'tanonde agete casts ordering as a favor done for a third person; you want your friend to order ahead for YOUR benefit and have it ready, which is te oku, not te ageru.'],
        ['ごめん、何か頼んでもらって。', 'ごめん、なにか たのんで もらって。', 'tanonde moratte would mean having someone else order on your friend\'s behalf — you are asking your friend directly to order and have it ready, which is te oite.']
      ] },
      { s: 'other', t: '了解。着いたら連絡して。', r: 'りょうかい。ついたら れんらく して。', e: 'Got it. Text me when you arrive.' },
      { s: 'you', t: 'ごめん、待たせちゃって。', r: 'ごめん、またせちゃって。', e: 'Sorry for making you wait.', wrong: [
        ['ごめん、待ってちゃって。', 'ごめん、まってちゃって。', 'matte is the plain te-form of matsu (to wait); making someone wait needs the causative mataseru, not the plain verb.'],
        ['ごめん、待たさせちゃって。', 'ごめん、またさせちゃって。', 'the causative of matsu is mataseru; matasaseru inserts an extra sa that belongs only to different verb types, a common double-causative mistake.']
      ] },
      { s: 'other', t: 'ううん、全然。座って座って。', r: 'ううん、ぜんぜん。すわって すわって。', e: 'No worries at all. Sit, sit.' },
      { s: 'you', t: 'ありがとう。今度は奢るから。', r: 'ありがとう。こんど わ おごる から。', e: 'Thanks. I\'ll treat you next time.', wrong: [
        ['ありがとう。今度は奢らせるから。', 'ありがとう。こんど わ おごらせる から。', 'ogoraseru is causative, "I\'ll make [someone] treat" — you mean YOU will do the treating, which is just the plain ogoru.'],
        ['ありがとう。今度は奢ってくれるから。', 'ありがとう。こんど わ おごって くれる から。', 'ogotte kureru describes someone ELSE treating you as a favor to you; here you are promising to treat THEM, which needs ageru or plain ogoru, not kureru.']
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
      ] },
      { s: 'other', t: '恐れ入りますが、営業部の佐藤様はいらっしゃいますでしょうか。', r: 'おそれいります が、えいぎょうぶ の さとうさま わ いらっしゃいます でしょう か。', e: 'Excuse me, is Sato-sama from Sales available?' },
      { s: 'you', t: '佐藤でございますね。少々お待ちください。', r: 'さとう で ございます ね。しょうしょう おまち ください。', e: 'Sato, is it. One moment please.', wrong: [
        ['佐藤さんでございますね。少々お待ちください。', 'さとうさん で ございます ね。しょうしょう おまち ください。', 'you do not add san to your own colleague\'s name when speaking with an outside caller — inside the company they are referred to with no honorific at all.'],
        ['佐藤でございますね。少々お待ちしております。', 'さとう で ございます ね。しょうしょう おまち して おります。', 'o-machi shite orimasu is humble language describing that YOU are the one waiting; asking the caller to wait needs the polite imperative o-machi kudasai.']
      ] },
      { s: 'other', t: 'お願いいたします。', r: 'おねがい いたします。', e: 'Please do.' },
      { s: 'you', t: 'お待たせいたしました。ただいま代わります。', r: 'おまたせ いたしました。ただいま かわります。', e: 'Sorry to keep you waiting. I\'ll put him through now.', wrong: [
        ['お待たせしました。ただいま代わってもらいます。', 'おまたせしました。ただいま かわって もらいます。', 'kawatte moraimasu says you will have someone ELSE do the switching for your benefit; you are the one performing the handover, which is the plain kawarimasu.'],
        ['お待たせいたしました。ただいま代わられます。', 'おまたせ いたしました。ただいま かわられます。', 'the respectful -areru form is reserved for the OTHER party\'s actions; describing your own action needs humble language, not this passive-honorific form.']
      ] },
      { s: 'other', t: 'ありがとうございます。よろしくお願いいたします。', r: 'ありがとう ございます。よろしく おねがい いたします。', e: 'Thank you. I appreciate it.' },
      { s: 'you', t: 'こちらこそ、よろしくお願いいたします。', r: 'こちらこそ、よろしく おねがい いたします。', e: 'Likewise, thank you.', wrong: [
        ['いえいえ、よろしくお願いいたします。', 'いえいえ、よろしく おねがい いたします。', 'iie iie brushes off their thanks as unnecessary, which undercuts the courtesy exchange — kochira koso ("likewise") is what matches and returns it.'],
        ['こちらこそ、よろしくお願いいたしました。', 'こちらこそ、よろしく おねがい いたしました。', 'past tense closes the relationship as already finished; an ongoing business courtesy needs the non-past itashimasu.']
      ] }
    ]
  },
  {
    code: 'phone-absent',
    unit: 'phone',
    title: 'Taking a message',
    situation: 'The caller wants a colleague who is out.',
    turns: [
      { s: 'other', t: 'いつもお世話になっております。鈴木物産の鈴木と申します。', r: 'いつも おせわ に なって おります。すずき ぶっさん の すずき と もうします。', e: 'Thank you for your continued support. This is Suzuki from Suzuki Trading.' },
      { s: 'you', t: 'お世話になっております。', r: 'おせわ に なって おります。', e: 'Hello, thank you for your support.', wrong: [
        ['はじめまして。', 'はじめまして。', 'hajimemashite is for meeting someone in person for the first time; this is a routine call with a company you already deal with, where the fixed exchange is osewa ni natte orimasu.'],
        ['お世話様です。', 'おせわさま です。', 'osewa sama desu is casual, used among close coworkers or shopkeepers — a call with an outside business contact needs the fuller osewa ni natte orimasu.']
      ] },
      { s: 'other', t: '佐藤さんはいらっしゃいますか。', r: 'さとうさん わ いらっしゃいます か。', e: 'Is Sato there?' },
      { s: 'you', t: '佐藤は今、席を外しております。', r: 'さとう わ いま、せき お はずして おります。', e: 'Sato is away from his desk at the moment.', wrong: [
        ['佐藤さんは今、席を外しております。', 'さとうさん わ いま、せき お はずして おります。', 'You do not add san to your own colleague when speaking to an outsider — inside the company they are just Sato.'],
        ['佐藤はいません。', 'さとう わ いません。', 'Accurate but abrupt. Business Japanese softens absence into seki o hazushite orimasu.']
      ] },
      { s: 'other', t: '何時ごろお戻りになりますか。', r: 'なんじ ごろ おもどり に なります か。', e: 'About what time will he be back?' },
      { s: 'you', t: '三時には戻ると思います。', r: 'さんじ に わ もどる と おもいます。', e: 'I think he\'ll be back by three.', wrong: [
        ['三時には戻ろうと思います。', 'さんじ に わ もどろう と おもいます。', 'modorou to omoimasu states YOUR OWN intention to go back; you are predicting Sato\'s return, a fact about someone else, which needs the plain modoru to omoimasu.'],
        ['三時には戻ってあげると思います。', 'さんじ に わ もどって あげる と おもいます。', 'te ageru would frame Sato\'s return as a favor done for the caller, which does not fit a plain prediction — modoru alone is what is needed.']
      ] },
      { s: 'other', t: 'では、また後でかけ直します。', r: 'では、また あとで かけなおします。', e: 'I will call back later then.' },
      { s: 'you', t: '恐れ入ります。よろしくお願いいたします。', r: 'おそれいります。よろしく おねがい いたします。', e: 'Thank you. I appreciate it.', wrong: [
        ['分かりました。', 'わかりました。', 'Fine internally, but flat for a customer who has just offered to ring back.'],
        ['ありがとう。', 'ありがとう。', 'Plain arigatou on a business line is too casual.']
      ] },
      { s: 'other', t: 'はい、失礼いたします。', r: 'はい、しつれい いたします。', e: 'Yes, goodbye.' },
      { s: 'you', t: '失礼いたします。', r: 'しつれい いたします。', e: 'Goodbye.', wrong: [
        ['さようなら。', 'さようなら。', 'sayounara is rarely used on a business call; the fixed sign-off is shitsurei itashimasu regardless of who hangs up.'],
        ['失礼しました。', 'しつれい しました。', 'past tense treats the courtesy as already finished, which is slightly off right as you hang up — the sign-off said in the moment is the non-past shitsurei itashimasu.']
      ] }
    ]
  }
]
