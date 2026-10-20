import type { AuthoredParticleSet } from './types.js'

export const N5_G4: AuthoredParticleSet[] = [
  {
    point: 'to-with',
    questions: [
      { s: '友達[と]行きます。', wrong: ['を', 'が', 'で'], why: 'と marks the person you do something with. 友達を would make the friend the thing being gone.' },
      { s: '父[と]話します。', also: ['に'], wrong: ['を', 'で', 'へ'], why: 'と marks who you talk with. で would mean using father as a tool.' },
      { s: '猫[と]遊びます。', wrong: ['を', 'が', 'へ'], why: 'と names the companion in the activity. 猫が would make the cat the one playing, not you.' },
      { s: '魚[と]肉を買います。', also: ['や'], wrong: ['か', 'で', 'へ'], why: 'と joins two nouns into a complete list: fish and meat. か would mean fish or meat.' },
      { s: 'サウナ[と]プールがあります。', also: ['や'], wrong: ['か', 'を', 'も'], why: 'と links the two things that exist: a sauna and a pool.' },
      { s: 'ノート[と]ペンを出しなさい。', also: ['や'], wrong: ['か', 'が', 'で'], why: 'と joins notebook and pen as one set of things to take out.' },
      { s: '顔[と]手を洗いなさい。', also: ['や'], wrong: ['も', 'が', 'へ'], why: 'と joins face and hands: wash both.' },
      { s: '父[と]母と妹がいます。', wrong: ['を', 'で', 'や'], why: 'と chains the family members into one complete list. や would make them mere examples.' },
      { s: '夕方私は犬[と]散歩する。', also: ['を'], wrong: ['が', 'で', 'へ'], why: 'と marks the companion you walk with. 犬が would make the dog the walker.' },
      { s: 'ケンは私[と]並んで走った。', also: ['に'], wrong: ['を', 'が', 'へ'], why: 'と marks who Ken ran alongside.' }
    ]
  },
  {
    point: 'to-together-n5',
    questions: [
      { s: '友達[と]食べます。', wrong: ['を', 'が', 'で'], why: 'と marks who you eat with. 友達を would mean eating the friend.' },
      { s: '父[と]行きます。', wrong: ['に', 'を', 'で'], why: 'と names your travelling companion.' },
      { s: '母[と]買います。', wrong: ['も', 'を', 'へ'], why: 'と shows you buy it together with your mother. 母も would mean she buys too.' },
      { s: '友達[と]泳ぎます。', wrong: ['に', 'が', 'へ'], why: 'と marks the person you swim with. 友達に泳ぎます is not grammatical.' },
      { s: '友達[と]映画を見ます。', wrong: ['が', 'で', 'へ'], why: 'と marks the person you watch with. を is already used for the film.' },
      { s: '友達[と]買い物に行った。', wrong: ['を', 'が', 'で'], why: 'と marks who you went shopping with.' },
      { s: '誰[と]行くの。', wrong: ['が', 'を', 'で'], why: '誰と asks who you go with. 誰が would ask who goes, not who goes with you.' },
      { s: '私[と]いっしょに来なさい。', wrong: ['を', 'が', 'で'], why: 'と goes with いっしょに to mean together with me.' },
      { s: '私[と]並んで歩きなさい。', also: ['に'], wrong: ['を', 'が', 'へ'], why: 'と marks the person you walk beside.' },
      { s: '私[と]いっしょに来ませんか。', wrong: ['を', 'が', 'へ'], why: 'と pairs with いっしょに: come together with me.' }
    ]
  },
  {
    point: 'to-quotation',
    questions: [
      { s: '安い[と]言いました。', wrong: ['を', 'が', 'に'], why: 'と closes the words that were said. 安いを is not a way to report speech.' },
      { s: '行く[と]言いました。', wrong: ['に', 'を', 'で'], why: 'と quotes what he said: he would go.' },
      { s: '好きだ[と]言いました。', wrong: ['を', 'が', 'に'], why: 'と follows the quoted phrase before 言いました.' },
      { s: '来る[と]言いました。', wrong: ['を', 'で', 'へ'], why: 'と marks the content of what he said.' },
      { s: 'いただきます[と]言います。', wrong: ['が', 'に', 'で'], why: 'と quotes the exact phrase you say.' },
      { s: '警官は止まれ[と]言った。', wrong: ['を', 'が', 'に'], why: 'と closes the quoted order 止まれ.' },
      { s: 'あの映画は面白い[と]思う。', wrong: ['を', 'が', 'で'], why: 'と reports a thought as well as speech: I think it is interesting.' },
      { s: '先生は来ない[と]思います。', wrong: ['を', 'に', 'へ'], why: 'と marks what you think: that he is not coming.' },
      { s: '明日は雨が降る[と]思います。', wrong: ['か', 'に', 'で'], why: 'と holds the thought: it will rain tomorrow.' },
      { s: '次の誕生日で２０歳になります[と]私は言った。', wrong: ['か', 'が', 'に'], why: 'と closes the quote before the speaker and 言った.' }
    ]
  },
  {
    point: 'ya-particle',
    questions: [
      { s: '山[や]海が好きです。', wrong: ['と', 'を', 'に'], why: 'や lists examples, "and so on". と would claim these two are the whole list.' },
      { s: '本[や]新聞などを読みます。', also: ['と'], wrong: ['を', 'が', 'で'], why: 'や joins examples, and など confirms there are more.' },
      { s: '本[や]新聞を読みます。', wrong: ['と', 'が', 'に'], why: 'や gives books and newspapers as examples. と would mean only those two.' },
      { s: '海[や]山などが好きです。', also: ['と'], wrong: ['か', 'を', 'で'], why: 'や lists the sea and mountains as examples, and など confirms there are more.' },
      { s: '靴[や]服を買います。', wrong: ['と', 'が', 'へ'], why: 'や says shoes, clothes and similar things. と would be exactly those two.' },
      { s: '魚[や]肉を食べます。', wrong: ['と', 'を', 'に'], why: 'や names fish and meat as examples of what you eat. と would mean only those two.' },
      { s: 'つくえの上にペン[や]ノートがあります。', wrong: ['か', 'を', 'と'], why: 'や lists pens and notebooks as examples of what is on the desk. と would mean only those two.' },
      { s: 'りんご[や]バナナを買いました。', wrong: ['か', 'が', 'と'], why: 'や lists apples and bananas as examples. と would mean only those two.' },
      { s: '日曜日はそうじ[や]せんたくなどをします。', also: ['と'], wrong: ['か', 'が', 'で'], why: 'や lists examples of chores, and など confirms there are more.' },
      { s: '犬[や]猫が好きです。', wrong: ['か', 'を', 'と'], why: 'や names dogs and cats as examples of animals you like. と would mean only those two.' },
      { s: 'パン[や]たまごを食べます。', wrong: ['か', 'が', 'と'], why: 'や lists bread and eggs as examples of what you eat. と would mean only those two.' }
    ]
  },
  {
    point: 'no-possessive',
    questions: [
      { s: '父[の]車です。', wrong: ['は', 'を', 'で'], why: 'の links owner to thing: father\'s car.' },
      { s: '学校[の]先生です。', wrong: ['が', 'に', 'へ'], why: 'の makes 学校 describe 先生: a school teacher.' },
      { s: '日本[の]音楽が好きです。', wrong: ['は', 'と', 'を'], why: 'の turns 日本 into a description of 音楽: Japanese music.' },
      { s: '部屋[の]窓を開けます。', wrong: ['が', 'を', 'と'], why: 'の links the room to its window.' },
      { s: '日本[の]料理が好きです。', wrong: ['は', 'と', 'で'], why: 'の links 日本 to 料理: Japanese food.' },
      { s: '私[の]靴でした。', wrong: ['は', 'を', 'に'], why: 'の shows whose shoes they were.' },
      { s: 'それはポチ[の]食べ物です。', wrong: ['が', 'を', 'へ'], why: 'の marks Pochi as the owner of the food.' },
      { s: 'これは誰[の]自動車ですか。', wrong: ['が', 'に', 'を'], why: '誰の asks whose: の links owner to car.' },
      { s: '今日[の]新聞はどこ。', wrong: ['を', 'に', 'で'], why: 'の links 今日 to 新聞: today\'s paper.' },
      { s: 'うさぎ[の]耳は長い。', wrong: ['を', 'に', 'で'], why: 'の links the rabbit to its ears.' }
    ]
  },
  {
    point: 'ne-particle',
    questions: [
      { s: '寒いです[ね]。', wrong: ['よ', 'か', 'を'], why: 'ね seeks agreement, "isn\'t it?". よ would be telling, not checking.' },
      { s: '綺麗です[ね]。', wrong: ['が', 'よ', 'に'], why: 'ね invites the listener to agree: beautiful, isn\'t it?' },
      { s: '英語は難しいです[ね]。', wrong: ['よ', 'か', 'が'], why: 'ね asks for agreement, matching "isn\'t it?".' },
      { s: '高いです[ね]。', wrong: ['よ', 'を', 'で'], why: 'ね looks for a shared view: expensive, isn\'t it?' },
      { s: 'いい天気です[ね]。', wrong: ['か', 'が', 'も'], why: 'ね makes small talk by seeking agreement: nice day, isn\'t it?' },
      { s: 'それは安いです[ね]。', wrong: ['よ', 'は', 'へ'], why: 'ね fits "isn\'t it?": you are checking the listener agrees. よ would be telling them.' },
      { s: '今朝は寒いです[ね]。', wrong: ['か', 'を', 'と'], why: 'ね seeks agreement about something you both feel.' },
      { s: 'お兄さんが結婚なさったのです[ね]。', wrong: ['よ', 'か', 'が'], why: 'ね confirms what you already half know: "didn\'t he?".' },
      { s: '料理うまい[ね]。', wrong: ['よ', 'が', 'を'], why: 'ね seeks agreement, "aren\'t you?".' },
      { s: 'あなたのお姉さんは旅行に行かなかったのです[ね]。', wrong: ['よ', 'か', 'を'], why: 'ね checks something you half know: she did not go, did she?' }
    ]
  },
  {
    point: 'yo-particle',
    questions: [
      { s: '好きです[よ]。', wrong: ['ね', 'か', 'を'], why: 'よ tells the listener something new, "you know". ね would ask for agreement.' },
      { s: '安いです[よ]。', wrong: ['ね', 'が', 'に'], why: 'よ shares information the listener may not know: it is cheap, you know.' },
      { s: '行きます[よ]。', wrong: ['ね', 'は', 'と'], why: 'よ announces "I am going, you know" rather than seeking agreement.' },
      { s: '面白いです[よ]。', wrong: ['ね', 'か', 'で'], why: 'よ tells the listener it is interesting, "you know".' },
      { s: 'お薬ができました[よ]。', wrong: ['ね', 'か', 'が'], why: 'よ announces news the listener did not know: the medicine is ready. ね would ask for agreement.' },
      { s: 'ほら、お母さんが来られた[よ]。', wrong: ['ね', 'は', 'を'], why: 'ほら points something out, and よ tells the listener the news.' },
      { s: '太郎、ご飯です[よ]。', wrong: ['ね', 'か', 'を'], why: 'よ announces that dinner is ready. ね would ask for agreement instead.' },
      { s: '大丈夫です[よ]。', wrong: ['ね', 'か', 'が'], why: 'よ reassures the listener: no problem, I tell you.' },
      { s: 'つりは要らん[よ]。', wrong: ['ね', 'が', 'も'], why: 'よ states your decision to the listener: keep the change.' },
      { s: 'ネクタイが曲がってる[よ]。', wrong: ['ね', 'か', 'を'], why: 'よ tells the listener something they cannot see themselves. ね would ask them to agree about their own tie.' }
    ]
  }
]
