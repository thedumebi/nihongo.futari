import type { AuthoredReading } from './types.js'

/** A third set of N5 speeches. Kanji at N5 and below only; anything harder is written in kana. */
export const N5_EXTRA: AuthoredReading[] = [
  {
    code: 'n5-day-at-the-park',
    level: 'N5',
    title: 'こうえんの一日',
    titleEn: 'A day at the park',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '日曜日、友だちとこうえんへ行きました。', r: 'にちようび、ともだち と こうえん え いきました。', e: 'On Sunday, I went to the park with a friend.' }
      ],
      [
        { t: '天気は、とてもよかったです。', r: 'てんき わ、とても よかった です。', e: 'The weather was very good.' },
        { t: 'そらは青くて、風はあたたかかったです。', r: 'そら わ あおくて、かぜ わ あたたかかった です。', e: 'The sky was blue and the wind was warm.' },
        { t: '大きい木の下に、すわりました。', r: 'おおきい き の した に、すわりました。', e: 'I sat under a big tree.' }
      ],
      [
        { t: '子どもたちが、あそんでいました。', r: 'こどもたち が、あそんで いました。', e: 'Children were playing.' },
        { t: '小さい犬も、走っていました。', r: 'ちいさい いぬ も、はしって いました。', e: 'A small dog was running too.' },
        { t: 'わたしは、しずかに見ていました。', r: 'わたし わ、しずか に みて いました。', e: 'I watched them quietly.' }
      ],
      [
        { t: 'いっしょに、おべんとうを食べました。', r: 'いっしょ に、おべんとう お たべました。', e: 'We ate packed lunches together.' },
        { t: 'おにぎりは、とてもおいしかったです。', r: 'おにぎり わ、とても おいしかった です。', e: 'The rice balls were very tasty.' },
        { t: 'そして、お茶を飲みました。', r: 'そして、おちゃ お のみました。', e: 'And we drank tea.' }
      ],
      [
        { t: '午後は、本を読みました。', r: 'ごご わ、ほん お よみました。', e: 'In the afternoon, I read a book.' },
        { t: 'ときどき、花を見ました。', r: 'ときどき、はな お みました。', e: 'Now and then, I looked at the flowers.' }
      ],
      [
        { t: '五時に、家へ帰りました。', r: 'ごじ に、いえ え かえりました。', e: 'I went home at five.' },
        { t: 'また、行きたいです。', r: 'また、いきたい です。', e: 'I want to go again.' }
      ]
    ]
  },
  {
    code: 'n5-my-favourite-season',
    level: 'N5',
    title: 'わたしのすきなきせつ',
    titleEn: 'My favourite season',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '今日は、すきなきせつの話をします。', r: 'きょう わ、すきな きせつ の はなし お します。', e: 'Today I will talk about my favourite season.' }
      ],
      [
        { t: 'わたしは、あきがいちばん好きです。', r: 'わたし わ、あき が いちばん すき です。', e: 'I like autumn the best.' },
        { t: 'あきは、すずしいです。', r: 'あき わ、すずしい です。', e: 'Autumn is cool.' },
        { t: '天気のいい日も多いです。', r: 'てんき の いい ひ も おおい です。', e: 'There are many fine days, too.' }
      ],
      [
        { t: 'あきは、本を読むのが好きです。', r: 'あき わ、ほん お よむ の が すき です。', e: 'In autumn, I like reading books.' },
        { t: '夜が長いですから。', r: 'よる が ながい です から。', e: 'Because the nights are long.' },
        { t: 'あたたかいお茶も、おいしいです。', r: 'あたたかい おちゃ も、おいしい です。', e: 'Warm tea tastes good too.' }
      ],
      [
        { t: 'あきは、食べ物もおいしいです。', r: 'あき わ、たべもの も おいしい です。', e: 'In autumn, the food is delicious too.' },
        { t: 'くりやさかなが好きです。', r: 'くり や さかな が すき です。', e: 'I like chestnuts and fish.' },
        { t: 'あきは、よく食べます。', r: 'あき わ、よく たべます。', e: 'In autumn, I eat a lot.' }
      ],
      [
        { t: '黄色い葉は、きれいです。', r: 'きいろい は わ、きれい です。', e: 'The yellow leaves are pretty.' },
        { t: 'わたしは、よく山へ行きます。', r: 'わたし わ、よく やま え いきます。', e: 'I often go to the mountains.' }
      ],
      [
        { t: 'みなさんの好きなきせつは、何ですか。', r: 'みなさん の すきな きせつ わ、なん です か。', e: 'What is your favourite season?' }
      ]
    ]
  },
  {
    code: 'n5-breakfast',
    level: 'N5',
    title: '朝ごはん',
    titleEn: 'Breakfast',
    stanzas: [
      [
        { t: 'おはようございます。', r: 'おはよう ございます。', e: 'Good morning.' },
        { t: '今日は、朝ごはんの話をします。', r: 'きょう わ、あさごはん の はなし お します。', e: 'Today I will talk about breakfast.' }
      ],
      [
        { t: 'わたしは、毎朝、六時に起きます。', r: 'わたし わ、まいあさ、ろくじ に おきます。', e: 'Every morning, I get up at six.' },
        { t: 'そして、すぐに朝ごはんを作ります。', r: 'そして、すぐ に あさごはん お つくります。', e: 'Then I make breakfast right away.' }
      ],
      [
        { t: 'たいてい、パンとたまごを食べます。', r: 'たいてい、パン と たまご お たべます。', e: 'Usually, I eat bread and eggs.' },
        { t: 'たまごは、小さいフライパンで作ります。', r: 'たまご わ、ちいさい フライパン で つくります。', e: 'I cook the eggs in a small frying pan.' },
        { t: 'ぎゅうにゅうも飲みます。', r: 'ぎゅうにゅう も のみます。', e: 'I drink milk too.' }
      ],
      [
        { t: '日曜日は、ごはんを食べます。', r: 'にちようび わ、ごはん お たべます。', e: 'On Sundays, I eat rice.' },
        { t: 'みそしると、さかなも食べます。', r: 'みそしる と、さかな も たべます。', e: 'I eat miso soup and fish too.' },
        { t: '母は、毎朝、ごはんを食べます。', r: 'はは わ、まいあさ、ごはん お たべます。', e: 'My mother eats rice every morning.' }
      ],
      [
        { t: '朝ごはんを食べると、元気になります。', r: 'あさごはん お たべる と、げんき に なります。', e: 'When I eat breakfast, I feel full of energy.' },
        { t: '食べないと、学校でねむくなります。', r: 'たべない と、がっこう で ねむく なります。', e: 'If I don\'t eat, I get sleepy at school.' }
      ],
      [
        { t: 'みなさんは、朝ごはんに何を食べますか。', r: 'みなさん わ、あさごはん に なに お たべます か。', e: 'What do you eat for breakfast?' }
      ]
    ]
  },
  {
    code: 'n5-my-teacher',
    level: 'N5',
    title: 'わたしの先生',
    titleEn: 'My teacher',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: 'わたしの先生の話をします。', r: 'わたし の せんせい の はなし お します。', e: 'I will tell you about my teacher.' }
      ],
      [
        { t: '先生の名前は、たなか先生です。', r: 'せんせい の なまえ わ、たなか せんせい です。', e: 'My teacher\'s name is Ms. Tanaka.' },
        { t: 'たなか先生は、やさしい人です。', r: 'たなか せんせい わ、やさしい ひと です。', e: 'Ms. Tanaka is a kind person.' },
        { t: 'いつも、にこにこしています。', r: 'いつも、にこにこ して います。', e: 'She is always smiling.' }
      ],
      [
        { t: '先生は、日本語を教えています。', r: 'せんせい わ、にほんご お おしえて います。', e: 'She teaches Japanese.' },
        { t: '先生の話は、とてもわかりやすいです。', r: 'せんせい の はなし わ、とても わかりやすい です。', e: 'Her explanations are very easy to understand.' },
        { t: 'わたしがわからないとき、もういちど教えてくれます。', r: 'わたし が わからない とき、もう いちど おしえて くれます。', e: 'When I don\'t understand, she explains it again.' }
      ],
      [
        { t: '先生は、本をたくさん読みます。', r: 'せんせい わ、ほん お たくさん よみます。', e: 'She reads many books.' },
        { t: 'よく、おもしろい話をします。', r: 'よく、おもしろい はなし お します。', e: 'She often tells interesting stories.' },
        { t: 'みんなで、わらいます。', r: 'みんな で、わらいます。', e: 'We all laugh together.' }
      ],
      [
        { t: 'わたしは、先生が大好きです。', r: 'わたし わ、せんせい が だいすき です。', e: 'I love my teacher.' },
        { t: 'だから、日本語のべんきょうは楽しいです。', r: 'だから、にほんご の べんきょう わ たのしい です。', e: 'So studying Japanese is fun.' },
        { t: '先生、ありがとうございます。', r: 'せんせい、ありがとう ございます。', e: 'Thank you, teacher.' }
      ]
    ]
  },
  {
    code: 'n5-station-near-my-house',
    level: 'N5',
    title: '家の近くの駅',
    titleEn: 'The station near my house',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: 'わたしの家の近くの駅の話をします。', r: 'わたし の いえ の ちかく の えき の はなし お します。', e: 'I will talk about the station near my house.' }
      ],
      [
        { t: '駅は、家から歩いて五分です。', r: 'えき わ、いえ から あるいて ごふん です。', e: 'The station is five minutes on foot from my house.' },
        { t: 'あまり大きくありません。', r: 'あまり おおきく ありません。', e: 'It is not very big.' },
        { t: 'でも、とてもべんりです。', r: 'でも、とても べんり です。', e: 'But it is very convenient.' }
      ],
      [
        { t: '駅の前に、小さい店があります。', r: 'えき の まえ に、ちいさい みせ が あります。', e: 'There is a small shop in front of the station.' },
        { t: '朝は、そこでお茶を買います。', r: 'あさ わ、そこ で おちゃ お かいます。', e: 'In the morning, I buy tea there.' },
        { t: 'パンもおいしいです。', r: 'パン も おいしい です。', e: 'The bread is tasty too.' }
      ],
      [
        { t: '毎朝、七時の電車に乗ります。', r: 'まいあさ、しちじ の でんしゃ に のります。', e: 'Every morning, I take the seven o\'clock train.' },
        { t: '人がたくさんいます。', r: 'ひと が たくさん います。', e: 'There are many people.' },
        { t: 'だから、いつも立っています。', r: 'だから、いつも たって います。', e: 'So I always stand.' }
      ],
      [
        { t: '夜は、駅が静かです。', r: 'よる わ、えき が しずか です。', e: 'At night, the station is quiet.' },
        { t: '駅から家まで、ゆっくり歩きます。', r: 'えき から いえ まで、ゆっくり あるきます。', e: 'I walk slowly from the station to my house.' },
        { t: 'わたしは、この駅が好きです。', r: 'わたし わ、この えき が すき です。', e: 'I like this station.' }
      ]
    ]
  },
  {
    code: 'n5-my-summer-holiday',
    level: 'N5',
    title: 'なつやすみ',
    titleEn: 'My summer holiday',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: 'なつやすみの話をします。', r: 'なつやすみ の はなし お します。', e: 'I will talk about my summer holiday.' }
      ],
      [
        { t: '今年のなつは、とてもあつかったです。', r: 'ことし の なつ わ、とても あつかった です。', e: 'This summer was very hot.' },
        { t: 'でも、わたしは元気でした。', r: 'でも、わたし わ げんき でした。', e: 'But I was well.' }
      ],
      [
        { t: '八月に、家族と海へ行きました。', r: 'はちがつ に、かぞく と うみ え いきました。', e: 'In August, I went to the sea with my family.' },
        { t: '車で行きました。', r: 'くるま で いきました。', e: 'We went by car.' },
        { t: '海は、とても大きかったです。', r: 'うみ わ、とても おおきかった です。', e: 'The sea was very big.' }
      ],
      [
        { t: 'わたしは、海で泳ぎました。', r: 'わたし わ、うみ で およぎました。', e: 'I swam in the sea.' },
        { t: '水は、少しつめたかったです。', r: 'みず わ、すこし つめたかった です。', e: 'The water was a little cold.' },
        { t: '弟と、すなで山を作りました。', r: 'おとうと と、すな で やま お つくりました。', e: 'I built a sand mountain with my little brother.' }
      ],
      [
        { t: '夜は、花火を見ました。', r: 'よる わ、はなび お みました。', e: 'At night, we watched fireworks.' },
        { t: '赤い花火も、青い花火もありました。', r: 'あかい はなび も、あおい はなび も ありました。', e: 'There were red fireworks and blue ones.' },
        { t: 'とてもきれいでした。', r: 'とても きれい でした。', e: 'They were very beautiful.' }
      ],
      [
        { t: 'なつやすみは、もうおわりました。', r: 'なつやすみ わ、もう おわりました。', e: 'The summer holiday is over now.' },
        { t: '来年も、また海へ行きたいです。', r: 'らいねん も、また うみ え いきたい です。', e: 'Next year, I want to go to the sea again.' }
      ]
    ]
  },
  {
    code: 'n5-cooking-dinner',
    level: 'N5',
    title: 'ばんごはんを作る',
    titleEn: 'Cooking dinner',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '今日は、ばんごはんの話をします。', r: 'きょう わ、ばんごはん の はなし お します。', e: 'Today I will talk about dinner.' }
      ],
      [
        { t: 'わたしは、夜、ごはんを作ります。', r: 'わたし わ、よる、ごはん お つくります。', e: 'In the evening, I make dinner.' },
        { t: '今日は、肉と野菜を使います。', r: 'きょう わ、にく と やさい お つかいます。', e: 'Today I use meat and vegetables.' }
      ],
      [
        { t: 'まず、手を洗います。', r: 'まず、て お あらいます。', e: 'First, I wash my hands.' },
        { t: 'それから、野菜を小さく切ります。', r: 'それから、やさい お ちいさく きります。', e: 'Then I cut the vegetables small.' },
        { t: '肉も切ります。', r: 'にく も きります。', e: 'I cut the meat too.' }
      ],
      [
        { t: '次に、なべに水を入れます。', r: 'つぎ に、なべ に みず お いれます。', e: 'Next, I put water in the pot.' },
        { t: '火をつけて、少し待ちます。', r: 'ひ お つけて、すこし まちます。', e: 'I turn on the heat and wait a little.' },
        { t: '水があつくなると、肉を入れます。', r: 'みず が あつく なる と、にく お いれます。', e: 'When the water gets hot, I put in the meat.' },
        { t: '野菜も入れます。', r: 'やさい も いれます。', e: 'I put in the vegetables too.' }
      ],
      [
        { t: '二十分たつと、できあがりです。', r: 'にじゅっぷん たつ と、できあがり です。', e: 'After twenty minutes, it is ready.' },
        { t: 'おいしいにおいがします。', r: 'おいしい におい が します。', e: 'It smells delicious.' },
        { t: 'いただきます。', r: 'いただきます。', e: 'Let\'s eat.' }
      ]
    ]
  },
  {
    code: 'n5-a-rainy-day',
    level: 'N5',
    title: '雨の日',
    titleEn: 'A rainy day',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '雨の日の話をします。', r: 'あめ の ひ の はなし お します。', e: 'I will talk about a rainy day.' }
      ],
      [
        { t: '今日は、朝から雨です。', r: 'きょう わ、あさ から あめ です。', e: 'It has been raining since this morning.' },
        { t: 'そらは、少しくらいです。', r: 'そら わ、すこし くらい です。', e: 'The sky is a little dark.' },
        { t: 'わたしは、かさを持って出ました。', r: 'わたし わ、かさ お もって でました。', e: 'I went out with an umbrella.' }
      ],
      [
        { t: '道に、水がたくさんありました。', r: 'みち に、みず が たくさん ありました。', e: 'There was a lot of water on the road.' },
        { t: 'くつが、ぬれました。', r: 'くつ が、ぬれました。', e: 'My shoes got wet.' },
        { t: '電車も、人が多かったです。', r: 'でんしゃ も、ひと が おおかった です。', e: 'The train was crowded too.' }
      ],
      [
        { t: '学校で、友だちに会いました。', r: 'がっこう で、ともだち に あいました。', e: 'At school, I met my friend.' },
        { t: '友だちも、ぬれていました。', r: 'ともだち も、ぬれて いました。', e: 'My friend was wet too.' },
        { t: 'わたしたちは、わらいました。', r: 'わたしたち わ、わらいました。', e: 'We laughed.' }
      ],
      [
        { t: '家に帰って、あついお茶を飲みました。', r: 'いえ に かえって、あつい おちゃ お のみました。', e: 'I went home and drank hot tea.' },
        { t: 'そして、本を読みました。', r: 'そして、ほん お よみました。', e: 'And I read a book.' },
        { t: 'わたしは、雨の音が好きです。', r: 'わたし わ、あめ の おと が すき です。', e: 'I like the sound of rain.' }
      ]
    ]
  },
  {
    code: 'n5-my-new-bag',
    level: 'N5',
    title: '新しいかばん',
    titleEn: 'My new bag',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '新しいかばんの話をします。', r: 'あたらしい かばん の はなし お します。', e: 'I will talk about my new bag.' }
      ],
      [
        { t: '先週の土曜日に、店でかばんを買いました。', r: 'せんしゅう の どようび に、みせ で かばん お かいました。', e: 'Last Saturday, I bought a bag at a shop.' },
        { t: '前のかばんは、古かったです。', r: 'まえ の かばん わ、ふるかった です。', e: 'My previous bag was worn out.' },
        { t: 'だから、新しいのがほしかったです。', r: 'だから、あたらしい の が ほしかった です。', e: 'So I wanted a new one.' }
      ],
      [
        { t: '新しいかばんは、青いです。', r: 'あたらしい かばん わ、あおい です。', e: 'The new bag is blue.' },
        { t: 'とても小さいです。', r: 'とても ちいさい です。', e: 'It is very small.' },
        { t: 'でも、ポケットがたくさんあります。', r: 'でも、ポケット が たくさん あります。', e: 'But it has many pockets.' }
      ],
      [
        { t: '本とノートを入れます。', r: 'ほん と ノート お いれます。', e: 'I put books and a notebook in it.' },
        { t: 'それから、水も入れます。', r: 'それから、みず も いれます。', e: 'And I put water in too.' },
        { t: 'とてもかるいです。', r: 'とても かるい です。', e: 'It is very light.' }
      ],
      [
        { t: 'わたしは、毎日このかばんを持って出かけます。', r: 'わたし わ、まいにち この かばん お もって でかけます。', e: 'I take this bag with me every day.' },
        { t: '友だちは、「いいですね」と言いました。', r: 'ともだち わ、「いい です ね」と いいました。', e: 'My friend said, "That\'s nice."' },
        { t: '大切に使います。', r: 'たいせつ に つかいます。', e: 'I will use it with care.' }
      ]
    ]
  },
  {
    code: 'n5-a-letter-to-a-friend',
    level: 'N5',
    title: '友だちへの手紙',
    titleEn: 'A letter to a friend',
    stanzas: [
      [
        { t: 'ゆきさん、お元気ですか。', r: 'ゆきさん、おげんき です か。', e: 'Yuki, how are you?' },
        { t: 'わたしは、元気です。', r: 'わたし わ、げんき です。', e: 'I am well.' }
      ],
      [
        { t: '手紙を書きます。', r: 'てがみ お かきます。', e: 'I\'m writing to you.' },
        { t: 'ゆきさんに会いたいです。', r: 'ゆきさん に あいたい です。', e: 'I want to see you.' },
        { t: '去年は、いっしょに学校へ行きましたね。', r: 'きょねん わ、いっしょ に がっこう え いきました ね。', e: 'Last year we went to school together.' }
      ],
      [
        { t: '今、わたしは新しい町に住んでいます。', r: 'いま、わたし わ あたらしい まち に すんで います。', e: 'Now I live in a new town.' },
        { t: '家の近くに、大きいかわがあります。', r: 'いえ の ちかく に、おおきい かわ が あります。', e: 'There is a big river near my house.' },
        { t: '毎日、かわのそばを歩きます。', r: 'まいにち、かわ の そば お あるきます。', e: 'Every day I walk by the river.' }
      ],
      [
        { t: '学校の友だちは、みんなやさしいです。', r: 'がっこう の ともだち わ、みんな やさしい です。', e: 'The friends at school are all kind.' },
        { t: 'でも、ゆきさんがいなくて、少しさびしいです。', r: 'でも、ゆきさん が いなくて、すこし さびしい です。', e: 'But without you, I feel a little lonely.' }
      ],
      [
        { t: 'ゆきさんは、今、何をしていますか。', r: 'ゆきさん わ、いま、なに お して います か。', e: 'What are you doing now?' },
        { t: 'お返事を待っています。', r: 'おへんじ お まって います。', e: 'I am waiting for your reply.' },
        { t: 'また、手紙を書いてください。', r: 'また、てがみ お かいて ください。', e: 'Please write to me again.' },
        { t: 'さようなら。', r: 'さようなら。', e: 'Goodbye.' }
      ]
    ]
  }
]
