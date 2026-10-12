import type { AuthoredReading } from './types.js'

/** N3 speeches. Kanji at N3 and below only; anything harder is written in kana. */
export const N3: AuthoredReading[] = [
  {
    code: 'n3-trip-gone-wrong',
    level: 'N3',
    title: 'うまくいかなかった旅行',
    titleEn: 'A Trip That Went Wrong',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '去年の夏、友達と旅行に行きました。', r: 'きょねん の なつ、ともだち と りょこう に いきました。', e: 'Last summer, I went on a trip with a friend.' },
        { t: 'でも、思った通りにはいきませんでした。', r: 'でも、おもった とおり に わ いきませんでした。', e: 'But it did not go the way I had thought.' }
      ],
      [
        { t: '朝、駅に着いてから分かりました。', r: 'あさ、えき に ついて から わかりました。', e: 'In the morning, after reaching the station, I realized.' },
        { t: '切符を家に忘れていたのです。', r: 'きっぷ お いえ に わすれて いた の です。', e: 'I had left my ticket at home.' },
        { t: '急いで取りに帰りました。', r: 'いそいで とり に かえりました。', e: 'I hurried back to get it.' }
      ],
      [
        { t: 'それで、予定の電車に乗れませんでした。', r: 'それで、よてい の でんしゃ に のれませんでした。', e: 'So I missed the train we had planned on.' },
        { t: '友達は一時間も待ってくれました。', r: 'ともだち わ いちじかん も まって くれました。', e: 'My friend waited a whole hour for me.' },
        { t: '私は何度も謝りました。', r: 'わたし わ なんど も あやまりました。', e: 'I apologized again and again.' }
      ],
      [
        { t: 'やっと着いた町は、雨でした。', r: 'やっと ついた まち わ、あめ でした。', e: 'The town we finally reached was rainy.' },
        { t: '傘を持っていなかったので、', r: 'かさ お もって いなかった ので、', e: 'Since I had no umbrella,' },
        { t: '二人ともぬれてしまいました。', r: 'ふたり とも ぬれて しまいました。', e: 'both of us got soaked.' }
      ],
      [
        { t: 'しかも、ホテルの予約が取れていませんでした。', r: 'しかも、ホテル の よやく が とれて いませんでした。', e: 'On top of that, our hotel booking had not gone through.' },
        { t: '泊まる部屋がありませんでした。', r: 'とまる へや が ありませんでした。', e: 'There was no room for us to stay in.' },
        { t: '近くの小さな宿に泊まりました。', r: 'ちかく の ちいさな やど に とまりました。', e: 'We stayed at a small inn nearby.' }
      ],
      [
        { t: '宿で食べた晩ご飯は、', r: 'やど で たべた ばんごはん わ、', e: 'The dinner we ate at the inn,' },
        { t: '今まで食べた中で一番おいしいと思いました。', r: 'いま まで たべた なか で いちばん おいしい と おもいました。', e: 'was the best I had ever eaten, I thought.' },
        { t: '宿の人もとても親切でした。', r: 'やど の ひと も とても しんせつ でした。', e: 'The people at the inn were very kind too.' }
      ],
      [
        { t: '帰りの電車で、二人で笑いました。', r: 'かえり の でんしゃ で、ふたり で わらいました。', e: 'On the train home, we laughed together.' },
        { t: '失敗ばかりの旅行でしたが、', r: 'しっぱい ばかり の りょこう でした が、', e: 'It was a trip full of mistakes, but' },
        { t: '一番の思い出になりました。', r: 'いちばん の おもいで に なりました。', e: 'it became my favorite memory.' }
      ],
      [
        { t: '今は、出かける前に何度も確認します。', r: 'いま わ、でかける まえ に なんど も かくにん します。', e: 'Now I check many times before I leave.' },
        { t: '最後まで聞いていただいて、ありがとうございました。', r: 'さいご まで きいて いただいて、ありがとう ございました。', e: 'Thank you for listening to the end.' }
      ]
    ]
  },
  {
    code: 'n3-part-time-job',
    level: 'N3',
    title: '私のアルバイト',
    titleEn: 'My Part-Time Job',
    stanzas: [
      [
        { t: 'はじめまして。', r: 'はじめまして。', e: 'Nice to meet you.' },
        { t: '今日は、私のアルバイトの話をします。', r: 'きょう わ、わたし の アルバイト の はなし お します。', e: 'Today I will talk about my part-time job.' }
      ],
      [
        { t: '私は駅前の小さな本屋で働いています。', r: 'わたし わ えきまえ の ちいさな ほんや で はたらいて います。', e: 'I work at a small bookstore in front of the station.' },
        { t: '週に三日、夕方から夜まで働きます。', r: 'しゅう に みっか、ゆうがた から よる まで はたらきます。', e: 'I work three days a week, from evening until night.' }
      ],
      [
        { t: '仕事は、本を並べることと、', r: 'しごと わ、ほん お ならべる こと と、', e: 'My work is arranging books,' },
        { t: 'お客さんの質問に答えることです。', r: 'おきゃくさん の しつもん に こたえる こと です。', e: 'and answering customers\' questions.' },
        { t: 'レジに立つこともあります。', r: 'レジ に たつ こと も あります。', e: 'Sometimes I also work the register.' }
      ],
      [
        { t: '始めたばかりの頃は、失敗が多くて、', r: 'はじめた ばかり の ころ わ、しっぱい が おおくて、', e: 'When I had just started, I made many mistakes,' },
        { t: '毎日、店の人に注意されました。', r: 'まいにち、みせ の ひと に ちゅうい されました。', e: 'and I was told off by the staff every day.' },
        { t: '正直、やめたいと思ったこともあります。', r: 'しょうじき、やめたい と おもった こと も あります。', e: 'Honestly, there were times I wanted to quit.' }
      ],
      [
        { t: 'でも、ある日、お客さんに', r: 'でも、ある ひ、おきゃくさん に', e: 'But one day, a customer told me,' },
        { t: '「教えてくれた本、とてもよかったよ」と言われました。', r: '「おしえて くれた ほん、とても よかったよ」 と いわれました。', e: '"The book you told me about was really good."' },
        { t: 'あの言葉が力になって、続けることにしました。', r: 'あの ことば が ちから に なって、つづける こと に しました。', e: 'Those words gave me strength, so I decided to keep going.' }
      ],
      [
        { t: 'アルバイトで学んだことは、', r: 'アルバイト で まなんだ こと わ、', e: 'What I learned from the job is' },
        { t: '人に説明する力です。', r: 'ひと に せつめい する ちから です。', e: 'the ability to explain things to people.' },
        { t: '大学の勉強にも役に立っています。', r: 'だいがく の べんきょう に も やく に たって います。', e: 'It is useful for my university studies too.' }
      ],
      [
        { t: '給料は安いですが、', r: 'きゅうりょう わ やすい です が、', e: 'The pay is low, but' },
        { t: '店で働くのが好きです。', r: 'みせ で はたらく の が すき です。', e: 'I enjoy working at the shop.' },
        { t: 'これからも、頑張るつもりです。', r: 'これから も、がんばる つもり です。', e: 'I intend to keep doing my best from now on.' }
      ],
      [
        { t: 'これで私の話を終わります。', r: 'これ で わたし の はなし お おわります。', e: 'That is the end of my talk.' },
        { t: 'ありがとうございました。', r: 'ありがとうございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n3-chance-meeting',
    level: 'N3',
    title: '偶然会った友達',
    titleEn: 'A Friend I Met by Chance',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '先月、不思議なことがありました。', r: 'せんげつ、ふしぎな こと が ありました。', e: 'Last month, something strange happened.' }
      ],
      [
        { t: '休みの日に、知らない町を歩いていました。', r: 'やすみ の ひ に、しらない まち お あるいて いました。', e: 'On a day off, I was walking in a town I did not know.' },
        { t: '道に迷って、困っていたときです。', r: 'みち に まよって、こまって いた とき です。', e: 'It was while I was lost and did not know what to do.' },
        { t: '後ろから、私の名前を呼ぶ声がしました。', r: 'うしろ から、わたし の なまえ お よぶ こえ が しました。', e: 'From behind, I heard a voice calling my name.' }
      ],
      [
        { t: '見ると、立っていたのは', r: 'みる と、たって いた の わ', e: 'When I looked, the person standing there was' },
        { t: '学生のときの友達でした。', r: 'がくせい の とき の ともだち でした。', e: 'a friend from my student days.' },
        { t: '十年ぶりに会ったのです。', r: 'じゅうねん ぶり に あった の です。', e: 'It was the first time we had seen each other in ten years.' }
      ],
      [
        { t: 'お互い、少しの間、言葉が出ませんでした。', r: 'おたがい、すこし の あいだ、ことば が でませんでした。', e: 'For a little while, neither of us could say a word.' },
        { t: 'それから、同時に笑い出しました。', r: 'それから、どうじ に わらいだしました。', e: 'Then we both burst out laughing at the same time.' }
      ],
      [
        { t: '彼女は仕事で、近くの町に引っ越したそうです。', r: 'かのじょ わ しごと で、ちかく の まち に ひっこした そう です。', e: 'She told me she had moved to a nearby town for work.' },
        { t: '近くのおいしい店に連れて行ってくれました。', r: 'ちかく の おいしい みせ に つれて いって くれました。', e: 'She took me to a tasty restaurant nearby.' }
      ],
      [
        { t: '二人で何時間も話しました。', r: 'ふたり で なんじかん も はなしました。', e: 'The two of us talked for hours.' },
        { t: '昔の先生のこと、学校のこと、', r: 'むかし の せんせい の こと、がっこう の こと、', e: 'About our old teachers, our school,' },
        { t: 'そして、これからの夢のことを。', r: 'そして、これから の ゆめ の こと お。', e: 'and then our dreams for the future.' }
      ],
      [
        { t: 'もし道に迷わなかったら、', r: 'もし みち に まよわなかったら、', e: 'If I had not gotten lost,' },
        { t: '会えなかったかもしれません。', r: 'あえなかった かも しれません。', e: 'we might never have met.' },
        { t: '迷子になって、本当によかったです。', r: 'まいご に なって、ほんとう に よかった です。', e: 'I am truly glad I got lost.' }
      ],
      [
        { t: '今も、時々電話で話しています。', r: 'いま も、ときどき でんわ で はなして います。', e: 'Even now, we talk on the phone from time to time.' },
        { t: 'みなさんにも、そんな出会いがありますように。', r: 'みなさん に も、そんな であい が あります よう に。', e: 'I hope you have a meeting like that too.' },
        { t: 'ありがとうございました。', r: 'ありがとうございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n3-living-alone',
    level: 'N3',
    title: '初めての一人暮らし',
    titleEn: 'Living Alone for the First Time',
    stanzas: [
      [
        { t: 'みなさん、こんばんは。', r: 'みなさん、こんばんわ。', e: 'Good evening, everyone.' },
        { t: '私は半年前から、一人で生活しています。', r: 'わたし わ はんとし まえ から、ひとり で せいかつ して います。', e: 'I have been living on my own for half a year.' }
      ],
      [
        { t: '家を出る日、母は少し泣いていました。', r: 'いえ お でる ひ、はは わ すこし ないて いました。', e: 'On the day I left home, my mother was crying a little.' },
        { t: '私は「大丈夫だよ」と言いましたが、', r: 'わたし わ 「だいじょうぶだよ」 と いいました が、', e: 'I said, "I will be fine," but' },
        { t: '本当は、とても不安でした。', r: 'ほんとう わ、とても ふあん でした。', e: 'the truth is, I was very anxious.' }
      ],
      [
        { t: '最初の週は、分からないことばかりでした。', r: 'さいしょ の しゅう わ、わからない こと ばかり でした。', e: 'The first week, it was nothing but things I did not understand.' },
        { t: '洗濯機の使い方が分からなくて、', r: 'せんたくき の つかいかた が わからなくて、', e: 'I did not know how to use the washing machine,' },
        { t: '服を全部、洗い直しました。', r: 'ふく お ぜんぶ、あらいなおしました。', e: 'and I had to wash all my clothes again.' }
      ],
      [
        { t: '料理も苦手で、毎日パンばかり食べていました。', r: 'りょうり も にがて で、まいにち パン ばかり たべて いました。', e: 'I was bad at cooking too, so I lived on bread every day.' },
        { t: '母に電話して、作り方を聞きました。', r: 'はは に でんわ して、つくりかた お ききました。', e: 'I called my mother and asked how to make things.' }
      ],
      [
        { t: '夜、部屋が静かで、', r: 'よる、へや が しずか で、', e: 'At night, the room is so quiet,' },
        { t: 'さびしくなることもあります。', r: 'さびしく なる こと も あります。', e: 'and sometimes I get lonely.' },
        { t: 'そんなときは、好きな音楽をかけます。', r: 'そんな とき わ、すきな おんがく お かけます。', e: 'At those times, I play music I like.' }
      ],
      [
        { t: 'でも、少しずつ慣れてきました。', r: 'でも、すこし ずつ なれて きました。', e: 'But little by little, I have gotten used to it.' },
        { t: '自分で決めて、自分で動く。', r: 'じぶん で きめて、じぶん で うごく。', e: 'Decide for myself, and move for myself.' },
        { t: 'それが、こんなに楽しいとは思いませんでした。', r: 'それ が、こんなに たのしい と わ おもいませんでした。', e: 'I never thought that would be so enjoyable.' }
      ],
      [
        { t: '今では、母のしてくれたことがよく分かります。', r: 'いま で わ、はは の して くれた こと が よく わかります。', e: 'Now I understand well what my mother did for me.' },
        { t: '来月、久しぶりに実家へ帰ります。', r: 'らいげつ、ひさしぶり に じっか え かえります。', e: 'Next month, I will go back to my parents\' home after a long time.' },
        { t: '母に、おいしい料理を作ってみたいです。', r: 'はは に、おいしい りょうり お つくって みたい です。', e: 'I want to try cooking my mother a tasty meal.' }
      ],
      [
        { t: '以上です。', r: 'いじょう です。', e: 'That is all.' },
        { t: 'ありがとうございました。', r: 'ありがとうございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n3-why-i-keep-a-diary',
    level: 'N3',
    title: '日記をつける理由',
    titleEn: 'Why I Keep a Diary',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '私は五年間、毎晩日記を書いています。', r: 'わたし わ ごねんかん、まいばん にっき お かいて います。', e: 'I have written in a diary every night for five years.' }
      ],
      [
        { t: 'きっかけは、中学のときの先生の言葉でした。', r: 'きっかけ わ、ちゅうがく の とき の せんせい の ことば でした。', e: 'It all began with something my middle-school teacher said.' },
        { t: '「書けば、心が軽くなるよ」と言われたのです。', r: '「かけば、こころ が かるく なるよ」 と いわれた の です。', e: 'I was told, "If you write, your heart will feel lighter."' },
        { t: '最初は、信じていませんでした。', r: 'さいしょ わ、しんじて いませんでした。', e: 'At first, I did not believe it.' }
      ],
      [
        { t: 'でも、続けてみると、本当に先生の言うとおりでした。', r: 'でも、つづけて みる と、ほんとう に せんせい の いう とおり でした。', e: 'But once I kept at it, my teacher was exactly right.' },
        { t: 'いやなことがあった日も、', r: 'いやな こと が あった ひ も、', e: 'Even on days when something bad happened,' },
        { t: '書いているうちに、落ち着いてきます。', r: 'かいて いる うち に、おちついて きます。', e: 'while I write, I calm down.' }
      ],
      [
        { t: '日記は、自分と話す時間でもあります。', r: 'にっき わ、じぶん と はなす じかん でも あります。', e: 'A diary is also time to talk with myself.' },
        { t: '一日の気持ちを、正直に書きます。', r: 'いちにち の きもち お、しょうじき に かきます。', e: 'I write the day\'s feelings honestly.' },
        { t: '人には言えないことも書けます。', r: 'ひと に わ いえない こと も かけます。', e: 'I can even write things I cannot tell others.' }
      ],
      [
        { t: 'もう一つの理由は、読み返す楽しみです。', r: 'もう ひとつ の りゆう わ、よみかえす たのしみ です。', e: 'Another reason is the pleasure of reading it again.' },
        { t: '去年の今日、何をしていたか分かります。', r: 'きょねん の きょう、なに お して いた か わかります。', e: 'I can tell what I was doing on this day last year.' },
        { t: '自分の小さな変化に気づくこともあります。', r: 'じぶん の ちいさな へんか に きづく こと も あります。', e: 'Sometimes I notice small changes in myself.' }
      ],
      [
        { t: '忙しくて、書けない日もあります。', r: 'いそがしくて、かけない ひ も あります。', e: 'There are days when I am too busy to write.' },
        { t: 'そんな日は、短くてもいいのです。', r: 'そんな ひ わ、みじかくても いい の です。', e: 'On those days, even a short entry is fine.' }
      ],
      [
        { t: '大切なのは、続けることです。', r: 'たいせつな の わ、つづける こと です。', e: 'What matters is to keep going.' },
        { t: '日記のおかげで、自分のことがよく分かるようになりました。', r: 'にっき の おかげ で、じぶん の こと が よく わかる よう に なりました。', e: 'Thanks to my diary, I have come to understand myself better.' }
      ],
      [
        { t: 'みなさんも、今夜から始めてみませんか。', r: 'みなさん も、こんや から はじめて みませんか。', e: 'Why not try starting tonight, everyone?' },
        { t: 'ありがとうございました。', r: 'ありがとうございました。', e: 'Thank you.' }
      ]
    ]
  }
]
