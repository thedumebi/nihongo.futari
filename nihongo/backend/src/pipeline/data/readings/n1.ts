import type { AuthoredReading } from './types.js'

/** N1 speeches. Kanji at N1 and below only; anything harder is written in kana. */
export const N1: AuthoredReading[] = [
  {
    code: 'n1-wedding-toast',
    level: 'N1',
    title: '友人の結婚式でのスピーチ',
    titleEn: "A speech at a friend's wedding",
    stanzas: [
      [
        { t: '皆様、本日はお呼びくださり、誠にありがとうございます。', r: 'みなさま、ほんじつ わ および くださり、まことに ありがとう ございます。', e: 'Everyone, thank you sincerely for inviting me today.' },
        { t: '新郎の友人として、一言ご挨拶をさせていただきます。', r: 'しんろう の ゆうじん として、ひとこと ごあいさつ お させて いただきます。', e: "As the groom's friend, allow me to say a few words." },
        { t: 'お二人を前にして、胸が熱くなります。', r: 'おふたり お まえ に して、むね が あつく なります。', e: 'Standing before you both, my heart is full.' }
      ],
      [
        { t: '彼と出会ったのは、大学の入学式でした。', r: 'かれ と であった の わ、だいがく の にゅうがくしき でした。', e: 'I met him at our university entrance ceremony.' },
        { t: '隣の席に座っていた彼は、', r: 'となり の せき に すわって いた かれ わ、', e: 'He was sitting in the next seat,' },
        { t: '緊張のあまり、ネクタイを裏返しに締めていました。', r: 'きんちょう の あまり、ネクタイ お うらがえし に しめて いました。', e: 'so nervous that he had tied his tie inside out.' }
      ],
      [
        { t: 'それから二十年、私と彼の付き合いは今も続いています。', r: 'それから にじゅうねん、わたし と かれ の つきあい わ いま も つづいて います。', e: 'Twenty years on, our friendship is still going.' },
        { t: '彼は決して器用な男ではありません。', r: 'かれ わ けっして きよう な おとこ で わ ありません。', e: 'He is by no means the most deft of men.' },
        { t: 'しかし、誰よりも誠実です。', r: 'しかし、だれ より も せいじつ です。', e: 'But he is more sincere than anyone.' }
      ],
      [
        { t: '私が仕事を失ったとき、', r: 'わたし が しごと お うしなった とき、', e: 'When I lost my job,' },
        { t: '彼は何も聞かずに、一晩中そばにいてくれました。', r: 'かれ わ なにも きかず に、ひとばんじゅう そば に いて くれました。', e: 'he asked nothing and stayed by my side all night.' },
        { t: 'あの夜のことは、今も覚えています。', r: 'あの よる の こと わ、いま も おぼえて います。', e: 'I still remember that night.' }
      ],
      [
        { t: '新婦の方と初めて会ったとき、', r: 'しんぷ の かた と はじめて あった とき、', e: 'When I first met the bride,' },
        { t: '彼がなぜ変わったのか、一目で分かりました。', r: 'かれ が なぜ かわった の か、ひとめ で わかりました。', e: 'I understood at a glance why he had changed.' },
        { t: '彼女の前では、彼は自然に笑うのです。', r: 'かのじょ の まえ で わ、かれ わ しぜん に わらう の です。', e: 'In front of her, he laughs naturally.' }
      ],
      [
        { t: '二人は、よく似ているわけではありません。', r: 'ふたり わ、よく にて いる わけ で わ ありません。', e: 'These two are not especially alike.' },
        { t: 'むしろ、足りないところを補い合っています。', r: 'むしろ、たりない ところ お おぎない あって います。', e: 'Rather, each makes up for what the other lacks.' },
        { t: 'それこそが、夫婦の強さだと思います。', r: 'それこそ が、ふうふ の つよさ だ と おもいます。', e: 'That, I think, is the strength of a couple.' }
      ],
      [
        { t: '結婚は、ゴールではなく出発点です。', r: 'けっこん わ、ゴール で わ なく しゅっぱつてん です。', e: 'Marriage is not the finish line but the starting point.' },
        { t: '楽しい日ばかりではないでしょう。', r: 'たのしい ひ ばかり で わ ない でしょう。', e: 'There will not be only happy days.' },
        { t: 'そんな日こそ、今日の気持ちを思い出してください。', r: 'そんな ひ こそ、きょう の きもち お おもいだして ください。', e: 'On those days above all, remember how you feel today.' }
      ],
      [
        { t: 'どうかお二人とも、お幸せに。', r: 'どうか おふたり とも、おしあわせ に。', e: 'May you both be happy.' },
        { t: 'お二人の門出を、心よりお祝い申し上げます。', r: 'おふたり の かどで お、こころ より おいわい もうしあげます。', e: 'I offer my heartfelt congratulations on your new beginning.' },
        { t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n1-technology-loneliness',
    level: 'N1',
    title: '技術と孤独',
    titleEn: 'Technology and loneliness',
    stanzas: [
      [
        { t: '最後に、誰かと目を見て話したのはいつですか。', r: 'さいご に、だれか と め お みて はなした の わ いつ です か。', e: 'When was the last time you talked to someone face to face?' },
        { t: '画面の中ではなく、目の前で。', r: 'がめん の なか で わ なく、め の まえ で。', e: 'Not inside a screen, but right in front of you.' }
      ],
      [
        { t: '今の時代、人はかつてないほど繋がっています。', r: 'いま の じだい、ひと わ かつて ない ほど つながって います。', e: 'In this age, people are more connected than ever.' },
        { t: '遠い国に住む人とも、一瞬で話せます。', r: 'とおい くに に すむ ひと と も、いっしゅん で はなせます。', e: 'We can talk in an instant even with people who live in faraway countries.' },
        { t: 'それなのに、なぜ孤独は減らないのですか。', r: 'それなのに、なぜ こどく わ へらない の です か。', e: 'So why, then, does loneliness not go away?' }
      ],
      [
        { t: '私は、繋がりと絆は別物だと考えています。', r: 'わたし わ、つながり と きずな わ べつもの だ と かんがえて います。', e: 'I believe that being connected and having bonds are different things.' },
        { t: '画面に並ぶ名前の数は、', r: 'がめん に ならぶ なまえ の かず わ、', e: 'The number of names lined up on a screen' },
        { t: '心の支えの数とは関係がありません。', r: 'こころ の ささえ の かず と わ かんけい が ありません。', e: 'has no relation to the number of people who support your heart.' }
      ],
      [
        { t: '便利さは、我々の手間を省いてくれます。', r: 'べんりさ わ、われわれ の てま お はぶいて くれます。', e: 'Convenience saves us effort.' },
        { t: '店員と話さなくても、買い物ができます。', r: 'てんいん と はなさ なくて も、かいもの が できます。', e: 'We can shop without speaking to a clerk.' },
        { t: 'しかし、あの手間こそが、', r: 'しかし、あの てま こそ が、', e: 'But that very effort' },
        { t: '人と人との出会いの場でもあったのです。', r: 'ひと と ひと と の であい の ば で も あった の です。', e: 'was also a place where people met.' }
      ],
      [
        { t: '言うまでもなく、技術を否定するつもりはありません。', r: 'いう まで も なく、ぎじゅつ お ひてい する つもり わ ありません。', e: 'Needless to say, I have no intention of rejecting technology.' },
        { t: '遠くに住む家族の顔を見られるのは、', r: 'とおく に すむ かぞく の かお お みられる の わ、', e: 'Being able to see the faces of family living far away' },
        { t: '本当にありがたいことです。', r: 'ほんとう に ありがたい こと です。', e: 'is truly something to be grateful for.' }
      ],
      [
        { t: '問題は、技術ではなく、', r: 'もんだい わ、ぎじゅつ で わ なく、', e: 'The problem is not technology,' },
        { t: 'それに頼りすぎる我々の習慣にあります。', r: 'それ に たよりすぎる われわれ の しゅうかん に あります。', e: 'but in our habit of leaning on it too much.' },
        { t: '返事の速さで、愛情を測っていませんか。', r: 'へんじ の はやさ で、あいじょう お はかって いません か。', e: 'Are you not measuring affection by how fast someone replies?' }
      ],
      [
        { t: '孤独を感じたら、電話を置いて、外に出てみましょう。', r: 'こどく お かんじたら、でんわ お おいて、そと に でて みましょう。', e: 'When you feel lonely, put the phone down and step outside.' },
        { t: 'そして、近所の誰かに声をかけてください。', r: 'そして、きんじょ の だれか に こえ お かけて ください。', e: 'Then say hello to someone in your neighbourhood.' },
        { t: '小さな行動が、孤独を和らげるはずです。', r: 'ちいさな こうどう が、こどく お やわらげる はず です。', e: 'Small actions should ease the loneliness.' }
      ],
      [
        { t: '技術は、人を繋ぐための道具です。', r: 'ぎじゅつ わ、ひと お つなぐ ため の どうぐ です。', e: 'Technology is a tool for linking people.' },
        { t: '手を差し出すのは、いつの時代も人間です。', r: 'て お さしだす の わ、いつ の じだい も にんげん です。', e: 'In every age, it is people who reach out a hand.' },
        { t: '聞いてくれて、ありがとうございました。', r: 'きいて くれて、ありがとう ございました。', e: 'Thank you for listening.' }
      ]
    ]
  },
  {
    code: 'n1-value-of-failure',
    level: 'N1',
    title: '失敗の価値',
    titleEn: 'The value of failure',
    stanzas: [
      [
        { t: '三十歳のとき、私は会社を立ち上げました。', r: 'さんじっさい の とき、わたし わ かいしゃ お たちあげました。', e: 'At thirty, I started a company.' },
        { t: 'そして二年後、あの会社を潰してしまいました。', r: 'そして にねんご、あの かいしゃ お つぶして しまいました。', e: 'Two years later, I ran it into the ground.' },
        { t: '貯金も、気力も、すべて失いました。', r: 'ちょきん も、きりょく も、すべて うしないました。', e: 'I lost my savings and my energy, everything.' }
      ],
      [
        { t: '当時の私は、失敗を恥だと思っていました。', r: 'とうじ の わたし わ、しっぱい お はじ だ と おもって いました。', e: 'Back then I thought failure was a disgrace.' },
        { t: '友人に会うのも避けていたほどです。', r: 'ゆうじん に あう の も さけて いた ほど です。', e: 'I even avoided meeting friends.' },
        { t: '部屋に閉じこもって、何週間も過ごしました。', r: 'へや に とじこもって、なんしゅうかん も すごしました。', e: 'I shut myself in my room and spent weeks that way.' }
      ],
      [
        { t: 'ところが、ある日ふと気づいたのです。', r: 'ところが、ある ひ ふと きづいた の です。', e: 'Then one day I suddenly realised something.' },
        { t: '私は、あの二年間で、', r: 'わたし わ、あの にねんかん で、', e: 'that in those two years,' },
        { t: '十年分のことを学んでいたことに。', r: 'じゅうねんぶん の こと お まなんで いた こと に。', e: "I had learned ten years' worth of lessons." }
      ],
      [
        { t: '成功は、人を喜ばせてくれます。', r: 'せいこう わ、ひと お よろこばせて くれます。', e: 'Success makes people happy.' },
        { t: 'しかし、教えてくれることは少ないのです。', r: 'しかし、おしえて くれる こと わ すくない の です。', e: 'But it teaches us little.' },
        { t: '失敗は痛みを伴いますが、', r: 'しっぱい わ いたみ お ともないます が、', e: 'Failure comes with pain,' },
        { t: '理由まで丁寧に教えてくれます。', r: 'りゆう まで ていねい に おしえて くれます。', e: 'but it also explains the reasons carefully.' }
      ],
      [
        { t: '大切なのは、同じ失敗を繰り返さないことです。', r: 'たいせつ な の わ、おなじ しっぱい お くりかえさ ない こと です。', e: 'What matters is not repeating the same failure.' },
        { t: '転んだ場所を覚えていれば、', r: 'ころんだ ばしょ お おぼえて いれば、', e: 'If you remember the place where you fell,' },
        { t: '次は避けて通ることができます。', r: 'つぎ わ さけて とおる こと が できます。', e: 'next time you can step around it.' }
      ],
      [
        { t: '今、私は二つ目の会社を経営しています。', r: 'いま、わたし わ ふたつめ の かいしゃ お けいえい して います。', e: 'Now I run my second company.' },
        { t: '最初の会社があったからこそ、今の私がいます。', r: 'さいしょ の かいしゃ が あった から こそ、いま の わたし が います。', e: 'It is because of that first company that I am who I am.' },
        { t: 'ですから、あの失敗に感謝しています。', r: 'ですから、あの しっぱい に かんしゃ して います。', e: 'So I am grateful for that failure.' }
      ],
      [
        { t: 'どうか、失敗を恐れないでください。', r: 'どうか、しっぱい お おそれない で ください。', e: 'Please do not be afraid of failure.' },
        { t: '挑戦しないことのほうが、よほど高くつきます。', r: 'ちょうせん しない こと の ほう が、よほど たかく つきます。', e: 'Not trying costs far more in the end.' },
        { t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n1-language-identity',
    level: 'N1',
    title: '言葉とアイデンティティ',
    titleEn: 'Language and identity',
    stanzas: [
      [
        { t: '私は、二つの言葉で生きています。', r: 'わたし わ、ふたつ の ことば で いきて います。', e: 'I live in two languages.' },
        { t: 'どちらも、私にとって大切な言葉です。', r: 'どちら も、わたし に とって たいせつな ことば です。', e: 'Both are precious languages to me.' }
      ],
      [
        { t: '家では母の言葉を、', r: 'いえ で わ はは の ことば お、', e: "At home I spoke my mother's language," },
        { t: '学校では周りの言葉を話しました。', r: 'がっこう で わ まわり の ことば お はなしました。', e: 'and at school, the language around me.' },
        { t: '二つの言葉は、いつも私の中で話し合っていました。', r: 'ふたつ の ことば わ、いつも わたし の なか で はなしあって いました。', e: 'The two languages were always talking inside me.' },
        { t: 'どちらが本当の自分なのか、よく悩みました。', r: 'どちら が ほんとう の じぶん な の か、よく なやみました。', e: 'I often wondered which one was the real me.' }
      ],
      [
        { t: '不思議なことに、言語を変えると、', r: 'ふしぎ な こと に、げんご お かえる と、', e: 'Curiously, when I change language,' },
        { t: '声の高さまで変わるのです。', r: 'こえ の たかさ まで かわる の です。', e: 'even the pitch of my voice changes.' },
        { t: '冗談を言う間も、怒り方も違います。', r: 'じょうだん お いう ま も、おこりかた も ちがいます。', e: 'My sense of timing in jokes and my way of getting angry differ too.' }
      ],
      [
        { t: '言葉は、ただの伝達の手段ではありません。', r: 'ことば わ、ただ の でんたつ の しゅだん で わ ありません。', e: 'Language is not merely a means of communication.' },
        { t: '物の見方を、作っているのです。', r: 'もの の みかた お、つくって いる の です。', e: 'It shapes the way we see things.' },
        { t: 'ある言語にしかない言葉が、', r: 'ある げんご に しか ない ことば が、', e: 'A word that exists in only one language' },
        { t: 'ある感情に名前を与えてくれることもあります。', r: 'ある かんじょう に なまえ お あたえて くれる こと も あります。', e: 'can sometimes give a name to a certain feeling.' }
      ],
      [
        { t: '昔、私は自分の発音を隠そうと必死でした。', r: 'むかし、わたし わ じぶん の はつおん お かくそう と ひっし でした。', e: 'In the past I was desperate to hide my own pronunciation.' },
        { t: '笑われることが怖かったからです。', r: 'わらわれる こと が こわかった から です。', e: 'I was afraid of being laughed at.' },
        { t: 'でも今は、それも私の歴史だと思えます。', r: 'でも いま わ、それ も わたし の れきし だ と おもえます。', e: 'But now I can see it as part of my own history.' }
      ],
      [
        { t: '自分という存在は、一つに絞るものではなく、', r: 'じぶん と いう そんざい わ、ひとつ に しぼる もの で わ なく、', e: 'Who you are is not something to narrow down to one,' },
        { t: '重ねていくものなのかもしれません。', r: 'かさねて いく もの な の か も しれません。', e: 'it may be something you layer up.' },
        { t: '新しい言語を身につけるたびに、', r: 'あたらしい げんご お み に つける たび に、', e: 'Each time you take on a new language,' },
        { t: 'もう一人の自分が、生まれるのです。', r: 'もう ひとり の じぶん が、うまれる の です。', e: 'one more version of you is born.' }
      ],
      [
        { t: '今、外国の言葉を学んでいる人へ。', r: 'いま、がいこく の ことば お まなんで いる ひと え。', e: 'To anyone learning a foreign language now,' },
        { t: '発音が完璧でなくても、構いません。', r: 'はつおん が かんぺき で なくて も、かまいません。', e: 'It does not matter if your pronunciation is not perfect.' },
        { t: '不完全な言葉の中にも、あなたらしさは宿ります。', r: 'ふかんぜん な ことば の なか に も、あなたらしさ わ やどります。', e: 'Even in imperfect speech, who you are shines through.' },
        { t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n1-colleague-farewell',
    level: 'N1',
    title: '同僚への送別の言葉',
    titleEn: 'A farewell speech for a colleague',
    stanzas: [
      [
        { t: '皆さん、お忙しい中、お越しくださり、', r: 'みなさん、おいそがしい なか、おこし くださり、', e: 'Everyone, for taking time out of your busy day to be here,' },
        { t: 'ありがとうございます。', r: 'ありがとう ございます。', e: 'thank you.' },
        { t: '田中さんに一言、感謝の気持ちを伝えさせてください。', r: 'たなかさん に ひとこと、かんしゃ の きもち お つたえさせて ください。', e: 'Let me say a few words of thanks to Tanaka-san.' }
      ],
      [
        { t: '田中さんと同じ部署で働いて、八年になります。', r: 'たなかさん と おなじ ぶしょ で はたらいて、はちねん に なります。', e: 'I have worked in the same department as Tanaka-san for eight years.' },
        { t: '私が入社した日、最初に声をかけてくれたのが', r: 'わたし が にゅうしゃ した ひ、さいしょ に こえ お かけて くれた の が', e: 'On the day I joined, the first person to speak to me' },
        { t: '田中さんでした。', r: 'たなかさん でした。', e: 'was Tanaka-san.' }
      ],
      [
        { t: '仕事に対しては、とても厳しい方でした。', r: 'しごと に たいして わ、とても きびしい かた でした。', e: 'When it came to work, Tanaka-san was very strict.' },
        { t: '私の資料は、何度も突き返されました。', r: 'わたし の しりょう わ、なんど も つきかえされました。', e: 'My documents were sent back to me many times.' },
        { t: '当時は辛かったけれど、今では感謝しかありません。', r: 'とうじ わ つらかった けれど、いま で わ かんしゃ しか ありません。', e: 'It was hard then, but now I feel nothing but gratitude.' }
      ],
      [
        { t: '一方で、田中さんは誰よりも優しい人でもありました。', r: 'いっぽう で、たなかさん わ だれ より も やさしい ひと で も ありました。', e: 'At the same time, Tanaka-san was also kinder than anyone.' },
        { t: '失敗した後輩を、決して責めませんでした。', r: 'しっぱい した こうはい お、けっして せめません でした。', e: 'Tanaka-san never blamed a junior who had made a mistake.' },
        { t: '代わりに、黙ってお茶を入れてくれました。', r: 'かわり に、だまって おちゃ お いれて くれました。', e: 'Instead, Tanaka-san quietly made them tea.' }
      ],
      [
        { t: '今も思い出すのは、三年前の大きな仕事です。', r: 'いま も おもいだす の わ、さんねんまえ の おおきな しごと です。', e: 'What I still recall is a big job three years ago.' },
        { t: '締め切りの前夜、全員が諦めかけていました。', r: 'しめきり の ぜんや、ぜんいん が あきらめかけて いました。', e: 'The night before the deadline, everyone was close to giving up.' },
        { t: 'あのとき、田中さんが笑って言いました。', r: 'あの とき、たなかさん が わらって いいました。', e: 'Then Tanaka-san smiled and said,' },
        { t: '「大丈夫、まだ朝まで時間はある」と。', r: '「だいじょうぶ、まだ あさ まで じかん わ ある」と。', e: '"It is fine, we still have until morning."' }
      ],
      [
        { t: 'あの一言で、チームの空気が変わりました。', r: 'あの ひとこと で、チーム の くうき が かわりました。', e: 'With that one remark, the whole mood of the team changed.' },
        { t: '田中さんは、チームの大黒柱でした。', r: 'たなかさん わ、チーム の だいこくばしら でした。', e: 'Tanaka-san was the backbone of this team.' }
      ],
      [
        { t: '新しい土地での生活は、不安も多いでしょう。', r: 'あたらしい とち で の せいかつ わ、ふあん も おおい でしょう。', e: 'Life in a new place will surely bring many worries.' },
        { t: 'けれど、田中さんなら、必ず大丈夫です。', r: 'けれど、たなかさん なら、かならず だいじょうぶ です。', e: 'But with Tanaka-san, I am sure it will be fine.' },
        { t: 'どうかお体を大切に。', r: 'どうか おからだ お たいせつ に。', e: 'Please take good care of yourself.' }
      ],
      [
        { t: 'またいつか、一緒に仕事ができる日を、', r: 'また いつか、いっしょ に しごと が できる ひ お、', e: 'The day we can work together again,' },
        { t: '楽しみにしています。', r: 'たのしみ に して います。', e: 'I look forward to it.' },
        { t: '長い間、本当にお世話になりました。', r: 'ながい あいだ、ほんとう に おせわ に なりました。', e: 'Thank you so much for all your help over the years.' },
        { t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you very much.' }
      ]
    ]
  }
]
