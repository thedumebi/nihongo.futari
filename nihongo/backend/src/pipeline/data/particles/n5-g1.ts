import type { AuthoredParticleSet } from './types.js'

export const N5_G1: AuthoredParticleSet[] = [
  {
    point: 'wa-particle',
    questions: [
      { s: '私[は]医者です。', also: ['が'], wrong: ['の', 'で', 'に'], why: 'は marks what the sentence is about: "as for me". の would turn it into "my doctor", which is not what the English says.' },
      { s: '父[は]医者です。', also: ['が'], wrong: ['の', 'と', 'から'], why: 'は sets up the topic, my father, and then says something about him. の would link 父 to 医者 as the doctor of my father.' },
      { s: '空[は]青い。', also: ['が'], wrong: ['を', 'に', 'へ'], why: 'は names the topic and the rest describes it. 青い is a description, so it cannot take を.' },
      { s: '鳥[は]飛ぶ。', also: ['が'], wrong: ['か', 'から', 'と'], why: 'は gives a general statement about birds as a topic. と would mean "fly with birds", which is not the English.' },
      { s: 'これ[は]机です。', also: ['が'], wrong: ['の', 'に', 'へ'], why: 'これは introduces the thing and then names it. に points to a place or a time, not to what something is.' },
      { s: 'あれ[は]学校です。', also: ['が'], wrong: ['の', 'で', 'と'], why: 'は makes あれ the topic and 学校です says what it is. で and と need an action to attach to, and です is not one.' },
      { s: 'あの犬[は]大きい。', also: ['が'], wrong: ['を', 'と', 'の'], why: 'は marks the dog as the topic of the description. 大きい describes, so を does not fit.' },
      { s: 'あなた[は]学生ですか。', also: ['が'], wrong: ['の', 'と', 'に'], why: 'は picks あなた as the topic of the question. の would ask about "your student", a different person.' },
      { s: '今日[は]暑い。', also: ['が'], wrong: ['を', 'で', 'と'], why: 'は makes 今日 the topic: "as for today". で would mean "by" or "at", which breaks 暑い.' },
      { s: '外[は]暗い。', also: ['が'], wrong: ['の', 'へ', 'から'], why: 'は sets outside as the topic and 暗い describes it. から would mean "from outside", which 暗い cannot take here.' },
      { s: '雪[は]消えた。', also: ['が'], wrong: ['を', 'へ', 'から'], why: 'は marks the snow as the topic, and the verb says what happened to it. を would make the snow the object.' }
    ]
  },
  {
    point: 'ga-particle',
    questions: [
      { s: '雨[が]降ります。', also: ['は'], wrong: ['を', 'に', 'で'], why: 'が marks the thing that does the verb: the rain is what falls. 降る takes no object, so を fails.' },
      { s: '花[が]綺麗です。', also: ['は'], wrong: ['を', 'の', 'で'], why: 'が marks 花 as the one that is beautiful. を would need a verb to act on the flowers.' },
      { s: '歯[が]痛い。', also: ['は'], wrong: ['と', 'に', 'へ'], why: 'The sore tooth is the subject of 痛い, so が marks it. に would point to a place or a time, not to what hurts.' },
      { s: '目[が]痛いです。', also: ['は'], wrong: ['を', 'に', 'と'], why: 'が marks the part of the body that hurts. を would make the eyes an object, but nothing acts on them.' },
      { s: '頭[が]痛い。', also: ['は'], wrong: ['を', 'に', 'から'], why: 'が marks the head as what hurts, new information. を cannot be used with 痛い.' },
      { s: '猫[が]います。', also: ['は'], wrong: ['を', 'で', 'の'], why: 'が marks what exists: the cat is who is there. を cannot mark the thing that exists.' },
      { s: '兄[が]います。', also: ['は'], wrong: ['を', 'で', 'に'], why: 'いる states that something exists, and が marks that something: an older brother.' },
      { s: '車[が]あります。', also: ['は'], wrong: ['を', 'の', 'へ'], why: 'ある says something exists, and が marks the thing that does: a car. を does not mark what exists.' },
      { s: '誰[が]来ますか。', wrong: ['を', 'に', 'の'], why: 'A question word asking who does the action takes が. を would ask who is being come to.' },
      { s: '何[が]あったの？', wrong: ['を', 'に', 'へ'], why: 'が marks the unknown thing that happened. を cannot mark the subject of あった.' },
      { s: '誰[が]したの？', wrong: ['を', 'へ', 'から'], why: 'が marks who did it, the doer of the action. を would make the person the thing that was done.' },
      { s: '空[が]晴れた。', also: ['は'], wrong: ['を', 'に', 'へ'], why: 'が marks the sky as the thing that changed. 晴れる has no object, so を cannot be used.' }
    ]
  },
  {
    point: 'mo-particle',
    questions: [
      { s: '私[も]学生です。', wrong: ['を', 'に', 'で'], why: 'も adds "too" in place of は: I am a student as well. を does not go before です.' },
      { s: '私[も]先生です。', wrong: ['を', 'に', 'へ'], why: 'も means "also", so I join someone who is a teacher. に points to a place or a time instead.' },
      { s: '父[も]働きます。', wrong: ['を', 'に', 'で'], why: 'も says my father works too. を would make my father the thing that is worked.' },
      { s: '猫[も]好きです。', wrong: ['に', 'で', 'へ'], why: 'も means I like cats in addition to something else. に and で do not mark what is liked.' },
      { s: '明日[も]忙しいです。', wrong: ['を', 'と', 'へ'], why: 'も adds tomorrow to other busy days: "as well". を cannot attach to a time word before an adjective.' },
      { s: '友達[も]来るでしょう。', wrong: ['を', 'に', 'か'], why: 'も says a friend will come too. を would make the friend the object of 来る, which takes none.' },
      { s: '弟[も]そうです。', wrong: ['を', 'に', 'へ'], why: 'も means "so is my brother too". を cannot mark a person who is "like that".' },
      { s: '本[も]新聞も読みます。', also: ['と', 'や'], wrong: ['に', 'で', 'へ'], why: 'も ... も means both A and B. に and で cannot link two nouns into a list.' },
      { s: '海[も]山も好きです。', also: ['と', 'や'], wrong: ['を', 'か', 'から'], why: 'The pair 海も山も says "both the sea and the mountains". を does not fit before 好き.' },
      { s: '魚[も]肉も食べます。', also: ['と', 'や'], wrong: ['に', 'か', 'へ'], why: 'も ... も gives "both fish and meat". か would make it a choice and へ does not fit 食べる.' },
      { s: '靴[も]服も買います。', also: ['と', 'や'], wrong: ['に', 'で', 'か'], why: 'も ... も means "both shoes and clothes". に and で would not list two things bought.' }
    ]
  },
  {
    point: 'ga-desire',
    questions: [
      { s: '水[が]飲みたい。', also: ['を', 'は'], wrong: ['に', 'へ', 'と'], why: 'With たい, the thing you want to do it to is marked with が (を also works). に and へ do not mark that.' },
      { s: 'お金[が]欲しい。', also: ['は'], wrong: ['に', 'で', 'へ'], why: '欲しい is a feeling, and the thing wanted is marked with が. に and で do not fit.' },
      { s: '本[が]欲しいです。', also: ['は'], wrong: ['に', 'で', 'と'], why: 'The thing you want is marked with が, not に or で. 欲しい is a feeling about it.' },
      { s: '車[が]欲しいです。', also: ['は'], wrong: ['に', 'へ', 'から'], why: 'が marks the car as what is wanted. へ points to a direction, so it does not fit.' },
      { s: 'お茶[が]飲みたいです。', also: ['を', 'は'], wrong: ['に', 'で', 'へ'], why: 'With たい, the thing you want to drink takes が (を also works). に and で do not mark what you want.' },
      { s: '本[が]読みたいです。', also: ['を', 'は'], wrong: ['に', 'で', 'と'], why: 'With たい, the thing you want to read takes が (を also works). に would point to a place or a time instead.' },
      { s: '映画[が]好きです。', also: ['は'], wrong: ['に', 'で', 'と'], why: '好き is a feeling, and what you like is marked with が. に and で do not mark it.' },
      { s: '音楽[が]聞きたいです。', also: ['を', 'は'], wrong: ['に', 'で', 'へ'], why: 'With たい, what you want to listen to takes が (を also works). で marks a place or a means, not the thing wanted.' },
      { s: '魚[が]買いたいです。', also: ['を', 'は'], wrong: ['に', 'で', 'と'], why: 'With たい, what you want to buy takes が (を also works). と would mean "with fish", which does not fit.' },
      { s: '友達は料理[が]上手です。', also: ['は'], wrong: ['を', 'で', 'に'], why: '上手 is about ability, and what you are good at takes が. を cannot mark it, and で would only mark a place or a means.' },
      { s: '私は猫[が]好きだ。', also: ['は'], wrong: ['に', 'で', 'から'], why: 'は gives the topic, me, and が marks what I like. On its own に cannot mark the thing liked.' }
    ]
  },
  {
    point: 'ga-in-clause',
    questions: [
      { s: '私[が]買った本です。', also: ['の'], wrong: ['を', 'か', 'へ'], why: 'Inside the clause 私が買った, が marks who did the buying (の also works). を would make me the thing bought.' },
      { s: '母[が]作った料理を食べます。', also: ['の'], wrong: ['を', 'は', 'へ'], why: 'が marks who made the food inside the describing clause (の also works). は would make mother the one who eats, not the maker.' },
      { s: '友達[が]来る時、料理を作ります。', also: ['の'], wrong: ['を', 'へ', 'は'], why: 'The clause 友達が来る says who comes before 時 (の also works). は would make the friend the one cooking.' },
      { s: '雨[が]降る日は休みます。', also: ['の'], wrong: ['を', 'に', 'は'], why: 'が marks the rain as what falls in the clause that describes 日 (の also works). は cannot sit inside a describing clause.' },
      { s: 'あれは私[が]生まれた家だ。', also: ['の'], wrong: ['を', 'は', 'へ'], why: 'Inside 私が生まれた, が marks who was born (の also works). は cannot sit inside a describing clause.' },
      { s: 'これは私[が]先週撮った写真です。', also: ['の'], wrong: ['を', 'へ', 'は'], why: 'The clause says who took the picture, and が marks that person (の also works). は cannot sit inside a describing clause.' },
      { s: '雪で電車[が]止まることがあります。', also: ['の', 'は'], wrong: ['を', 'へ', 'か'], why: 'が marks the train as what stops, inside the clause before こと (の also works). 止まる takes no を.' },
      { s: '兄[が]来ないという話を聞いた。', also: ['の', 'は'], wrong: ['を', 'へ', 'か'], why: 'が marks who is not coming, inside the clause that describes the news (の also works). を does not fit 来ない.' },
      { s: '兄[が]来るのを待っています。', also: ['の'], wrong: ['を', 'は', 'へ'], why: 'が marks who comes, inside the clause 兄が来る that の turns into a noun. は would make my brother the one waiting.' },
      { s: '授業[が]始まるのは８時半からだ。', also: ['の'], wrong: ['を', 'へ', 'と'], why: 'が marks the class as what starts, inside the clause before の (の also works). 始まる takes no を.' }
    ]
  },
  {
    point: 'no-pronoun',
    questions: [
      { s: '安い[の]を買います。', wrong: ['に', 'と', 'へ'], why: 'の stands in for a noun already understood: the cheap one. に and と cannot do that.' },
      { s: '新しい[の]が好きです。', wrong: ['を', 'に', 'へ'], why: 'After an adjective, の means "one": the new one. The other particles cannot replace a noun.' },
      { s: '大きい[の]をください。', wrong: ['に', 'と', 'か'], why: 'の takes the place of the noun, so 大きいの is "the big one". に and と need a noun in front of them.' },
      { s: '小さい[の]が欲しいです。', wrong: ['を', 'と', 'へ'], why: '小さいの is "the small one", and が marks it as the thing wanted. と cannot stand in for the noun.' },
      { s: 'その黄色い[の]をいただきましょう。', wrong: ['に', 'と', 'か'], why: 'の is the pronoun "one" here: the yellow one. に would need an actual noun before it.' },
      { s: 'コーヒーは熱い[の]が好きだ。', wrong: ['に', 'で', 'と'], why: 'の stands for coffee, already understood: the hot one. で and に cannot take the place of a noun.' },
      { s: 'コーヒーは薄い[の]が好きです。', wrong: ['を', 'へ', 'か'], why: '薄いの means the weak one, with の replacing the noun. へ and か do not do that.' },
      { s: 'あの黒い[の]は私のです。', wrong: ['を', 'に', 'で'], why: 'あの黒いの means "that black one". を, に and で cannot replace the noun after an adjective.' },
      { s: 'パリで買った[の]はこの万年筆です。', wrong: ['を', 'に', 'と'], why: 'の stands for the thing I bought, so 買ったの is "the one I bought". を and に cannot replace that noun.' }
    ]
  }
]
