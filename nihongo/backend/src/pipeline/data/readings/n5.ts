import type { AuthoredReading } from './types.js'

/** N5 speeches. Kanji at N5 and below only; anything harder is written in kana. */
export const N5: AuthoredReading[] = [
  {
    code: 'n5-about-me',
    level: 'N5',
    title: 'じこしょうかい',
    titleEn: 'About me',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: 'わたしの名前は山本です。', r: 'わたし の なまえ わ やまもと です。', e: 'My name is Yamamoto.' }
      ],
      [
        { t: 'わたしは二十五さいです。', r: 'わたし わ にじゅうご さい です。', e: 'I am twenty-five years old.' },
        { t: '外国から来ました。', r: 'がいこく から きました。', e: 'I came from abroad.' },
        { t: '今、日本に住んでいます。', r: 'いま、にほん に すんで います。', e: 'Now I live in Japan.' }
      ],
      [
        { t: '会社で働いています。', r: 'かいしゃ で はたらいて います。', e: 'I work at a company.' },
        { t: '毎日、電車で行きます。', r: 'まいにち、でんしゃ で いきます。', e: 'Every day I go by train.' }
      ],
      [
        { t: '音楽が好きです。', r: 'おんがく が すき です。', e: 'I like music.' },
        { t: 'それから、犬も好きです。', r: 'それから、いぬ も すき です。', e: 'And I like dogs too.' },
        { t: '家に白い犬がいます。', r: 'いえ に しろい いぬ が います。', e: 'I have a white dog at home.' }
      ],
      [
        { t: '日本語、まだあまり上手じゃありません。', r: 'にほんご、まだ あまり じょうず じゃ ありません。', e: 'My Japanese isn’t very good yet.' },
        { t: 'でも、毎日、勉強します。', r: 'でも、まいにち、べんきょう します。', e: 'But I study every day.' }
      ],
      [
        { t: 'みなさんと話したいです。', r: 'みなさん と はなしたい です。', e: 'I want to talk with all of you.' },
        { t: 'どうぞ、よろしく。', r: 'どうぞ、よろしく。', e: 'Nice to meet you all.' }
      ]
    ]
  },
  {
    code: 'n5-my-day',
    level: 'N5',
    title: 'わたしの一日',
    titleEn: 'My day',
    stanzas: [
      [
        { t: '朝、六時に起きます。', r: 'あさ、ろくじ に おきます。', e: 'In the morning, I get up at six.' },
        { t: 'はじめに、水を飲みます。', r: 'はじめに、みず お のみます。', e: 'First, I drink water.' },
        { t: 'それから、顔を洗います。', r: 'それから、かお お あらいます。', e: 'Then I wash my face.' }
      ],
      [
        { t: '七時に朝ごはんを食べます。', r: 'しちじ に あさごはん お たべます。', e: 'I eat breakfast at seven.' },
        { t: 'パンとくだものを食べます。', r: 'パン と くだもの お たべます。', e: 'I eat bread and fruit.' }
      ],
      [
        { t: '八時に家を出ます。', r: 'はちじ に いえ お でます。', e: 'I leave the house at eight.' },
        { t: 'バスで学校へ行きます。', r: 'バス で がっこう え いきます。', e: 'I go to school by bus.' }
      ],
      [
        { t: '昼ごはんは友だちと食べます。', r: 'ひるごはん わ ともだち と たべます。', e: 'I eat lunch with friends.' },
        { t: '午後も勉強します。', r: 'ごご も べんきょう します。', e: 'I study in the afternoon too.' }
      ],
      [
        { t: '五時に家へ帰ります。', r: 'ごじ に いえ え かえります。', e: 'I go home at five.' },
        { t: '夜は、料理を作ります。', r: 'よる わ、りょうり お つくります。', e: 'In the evening I cook dinner.' }
      ],
      [
        { t: '十一時にねます。', r: 'じゅういちじ に ねます。', e: 'I go to bed at eleven.' },
        { t: 'おやすみなさい。', r: 'おやすみなさい。', e: 'Good night.' }
      ]
    ]
  },
  {
    code: 'n5-my-family',
    level: 'N5',
    title: 'わたしの家族',
    titleEn: 'My family',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '今日は、家族のことを話します。', r: 'きょう わ、かぞく の こと お はなします。', e: 'Today I will talk about my family.' }
      ],
      [
        { t: 'わたしの家族は五人です。', r: 'わたし の かぞく わ ごにん です。', e: 'There are five people in my family.' },
        { t: '父と母と姉と弟とわたしです。', r: 'ちち と はは と あね と おとうと と わたし です。', e: 'My father, mother, older sister, younger brother and me.' }
      ],
      [
        { t: '父は先生です。', r: 'ちち わ せんせい です。', e: 'My father is a teacher.' },
        { t: '少しこわいですが、やさしいです。', r: 'すこし こわい です が、やさしい です。', e: 'He is a little scary, but kind.' }
      ],
      [
        { t: '母は料理が上手です。', r: 'はは わ りょうり が じょうず です。', e: 'My mother is good at cooking.' },
        { t: 'とてもおいしいです。', r: 'とても おいしい です。', e: 'It’s really delicious.' }
      ],
      [
        { t: '姉は大学生です。', r: 'あね わ だいがくせい です。', e: 'My older sister is a university student.' },
        { t: '毎日、とても忙しいです。', r: 'まいにち、とても いそがしい です。', e: 'She is very busy every day.' }
      ],
      [
        { t: '弟は十さいです。', r: 'おとうと わ じゅっさい です。', e: 'My younger brother is ten years old.' },
        { t: '走るのが好きです。', r: 'はしる の が すき です。', e: 'He likes running.' }
      ],
      [
        { t: 'みんな、わたしの大切な家族です。', r: 'みんな、わたし の たいせつな かぞく です。', e: 'They are all my precious family.' },
        { t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n5-my-room',
    level: 'N5',
    title: 'わたしの部屋',
    titleEn: 'My room',
    stanzas: [
      [
        { t: 'これはわたしの部屋です。', r: 'これ わ わたし の へや です。', e: 'This is my room.' },
        { t: '小さいですが、新しいです。', r: 'ちいさい です が、あたらしい です。', e: 'It is small, but new.' }
      ],
      [
        { t: 'ドアの右にベッドがあります。', r: 'ドア の みぎ に ベッド が あります。', e: 'There is a bed to the right of the door.' },
        { t: 'ベッドの上に本があります。', r: 'ベッド の うえ に ほん が あります。', e: 'There is a book on the bed.' }
      ],
      [
        { t: '窓の下につくえがあります。', r: 'まど の した に つくえ が あります。', e: 'There is a desk under the window.' },
        { t: 'つくえの上にパソコンがあります。', r: 'つくえ の うえ に パソコン が あります。', e: 'There is a computer on the desk.' },
        { t: '毎日、つくえで勉強します。', r: 'まいにち、つくえ で べんきょう します。', e: 'I study at the desk every day.' }
      ],
      [
        { t: 'つくえの前にテレビがあります。', r: 'つくえ の まえ に テレビ が あります。', e: 'There is a TV in front of the desk.' },
        { t: 'テレビの後ろに大きい箱があります。', r: 'テレビ の うしろ に おおきい はこ が あります。', e: 'There is a big box behind the TV.' }
      ],
      [
        { t: 'かべに地図があります。', r: 'かべ に ちず が あります。', e: 'There is a map on the wall.' },
        { t: '日本の地図です。', r: 'にほん の ちず です。', e: 'It is a map of Japan.' }
      ],
      [
        { t: 'わたしの部屋が大好きです。', r: 'わたし の へや が だいすき です。', e: 'I really love my room.' },
        { t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you.' }
      ]
    ]
  },
  {
    code: 'n5-my-weekend',
    level: 'N5',
    title: 'しゅうまつ',
    titleEn: 'My weekend',
    stanzas: [
      [
        { t: 'みなさん、こんにちは。', r: 'みなさん、こんにちわ。', e: 'Hello, everyone.' },
        { t: '先週の土曜日と日曜日の話をします。', r: 'せんしゅう の どようび と にちようび の はなし お します。', e: 'I will talk about last Saturday and Sunday.' }
      ],
      [
        { t: '土曜日は、長くねました。', r: 'どようび わ、ながく ねました。', e: 'On Saturday I slept for a long time.' },
        { t: 'そして、部屋をそうじしました。', r: 'そして、へや お そうじ しました。', e: 'Then I cleaned my room.' }
      ],
      [
        { t: '午後は友だちに会いました。', r: 'ごご わ ともだち に あいました。', e: 'In the afternoon I met a friend.' },
        { t: '二人で買い物に行きました。', r: 'ふたり で かいもの に いきました。', e: 'The two of us went shopping.' },
        { t: '新しい本を買いました。', r: 'あたらしい ほん お かいました。', e: 'I bought a new book.' }
      ],
      [
        { t: '夜は友だちと映画を見ました。', r: 'よる わ ともだち と えいが お みました。', e: 'At night I watched a movie with a friend.' },
        { t: 'とても面白かったです。', r: 'とても おもしろかった です。', e: 'It was really fun.' }
      ],
      [
        { t: '日曜日は家にいました。', r: 'にちようび わ いえ に いました。', e: 'On Sunday I stayed home.' },
        { t: '本を読んで、お茶を飲みました。', r: 'ほん お よんで、おちゃ お のみました。', e: 'I read a book and drank tea.' }
      ],
      [
        { t: '静かな日曜日でした。', r: 'しずかな にちようび でした。', e: 'It was a quiet Sunday.' },
        { t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you.' }
      ]
    ]
  }
]
