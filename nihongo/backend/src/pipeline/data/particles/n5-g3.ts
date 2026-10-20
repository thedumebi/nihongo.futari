import type { AuthoredParticleSet } from './types.js'

export const N5_G3: AuthoredParticleSet[] = [
  {
    point: 'de-location',
    questions: [
      { s: '学校[で]勉強します。', wrong: ['を', 'が', 'に'], why: 'で marks the place where an action happens. に would only say where something is.' },
      { s: '部屋[で]音楽を聞きます。', wrong: ['に', 'が', 'と'], why: 'Listening is an action done in the room, so the room takes で, not に.' },
      { s: '海[で]泳ぎます。', also: ['を'], wrong: ['に', 'が', 'へ'], why: 'Swimming is an action, and で names where it takes place.' },
      { s: '店[で]パンを買います。', wrong: ['を', 'が', 'と'], why: 'で marks the shop as the place where the buying happens.' },
      { s: '公園[で]お弁当を食べませんか。', wrong: ['に', 'へ', 'が'], why: 'Eating happens in the park, so the park takes で. へ only points to a direction.' },
      { s: '銀行[で]働いています。', wrong: ['を', 'が', 'へ'], why: 'The place where you work is marked with で. へ only points towards the bank.' },
      { s: '七時に公園[で]待っています。', wrong: ['を', 'が', 'へ'], why: 'で gives the place where the waiting goes on. The に after 七時 is for the time.' },
      { s: '次の駅[で]降ります。', wrong: ['が', 'と', 'へ'], why: 'で marks the point where the action of getting off happens.' },
      { s: '明日図書館[で]ね。', wrong: ['を', 'が', 'から'], why: 'で names the place where you will meet, as in "see you at the library".' },
      { s: 'ここ[で]食べます。', wrong: ['を', 'と', 'が'], why: 'で marks where you eat. ここを would make "here" the thing eaten.' },
      { s: '教室[で]食べるの。', wrong: ['を', 'に', 'が'], why: 'The classroom is where the eating happens, so で.' }
    ]
  },
  {
    point: 'de-means',
    questions: [
      { s: '電車[で]行きます。', wrong: ['に', 'を', 'と'], why: 'で marks the way you travel. 電車に would sound like going to the train.' },
      { s: '車[で]来ます。', wrong: ['を', 'へ', 'から'], why: 'で names the vehicle you come by.' },
      { s: '手[で]作ります。', wrong: ['を', 'に', 'が'], why: 'で marks the method: made by hand.' },
      { s: '水[で]洗います。', wrong: ['を', 'が', 'と'], why: 'で marks what you wash with. 水を would make water the thing being washed.' },
      { s: 'バス[で]行こう。', wrong: ['を', 'に', 'へ'], why: 'で marks the bus as the means of getting there.' },
      { s: 'タクシー[で]行こうよ。', wrong: ['を', 'が', 'と'], why: 'で names the transport. と would mean going together with a taxi.' },
      { s: '電車[で]来ました。', wrong: ['を', 'へ', 'が'], why: 'で marks how you came: by train.' },
      { s: '私は飛行機[で]旅行したい。', wrong: ['を', 'に', 'と'], why: 'で marks the means of travel: by airplane.' },
      { s: '地下鉄[で]行きたいのです。', wrong: ['を', 'が', 'へ'], why: 'The subway is the means, so it takes で.' },
      { s: 'チーズは牛乳[で]作る。', also: ['から'], wrong: ['を', 'に', 'と'], why: 'で marks the material the cheese is made from.' },
      { s: '私は木[で]机を作った。', also: ['から'], wrong: ['を', 'に', 'が'], why: 'で marks the material: a desk made of wood.' }
    ]
  },
  {
    point: 'de-tool',
    questions: [
      { s: '手[で]食べます。', wrong: ['を', 'に', 'と'], why: 'で marks the tool you use. 手を would say you eat the hands.' },
      { s: '電話[で]話します。', wrong: ['を', 'に', 'と'], why: 'で marks the device you talk through.' },
      { s: '鍵[で]開けます。', wrong: ['に', 'が', 'と'], why: 'で marks the key as the tool that opens it.' },
      { s: 'ペン[で]書きます。', wrong: ['を', 'に', 'が'], why: 'で marks what you write with. ペンに would mean writing onto the pen.' },
      { s: 'パーカーさんは箸[で]食べてみました。', wrong: ['を', 'に', 'が'], why: 'で marks chopsticks as the tool for eating.' },
      { s: 'ボールペン[で]書いてください。', wrong: ['を', 'に', 'と'], why: 'で marks the pen to write with. ボールペンに would mean writing on it.' },
      { s: '英語[で]答えなさい。', wrong: ['を', 'に', 'が'], why: 'で marks the language used as the means of answering.' },
      { s: '英語[で]手紙を書いてみる。', wrong: ['に', 'が', 'と'], why: 'で marks English as the medium of the letter.' },
      { s: '授業は英語[で]なされた。', wrong: ['を', 'に', 'と'], why: 'で marks the language the class was carried out in.' },
      { s: '石けん[で]手を洗いなさい。', wrong: ['を', 'に', 'と'], why: 'で marks the soap as what you wash with. 石けんを would make the soap the thing washed.' }
    ]
  },
  {
    point: 'de-reason',
    questions: [
      { s: '雨[で]休みました。', wrong: ['が', 'を', 'と'], why: 'で gives the cause: the rain is why I took the day off.' },
      { s: '雨[で]休みます。', wrong: ['を', 'へ', 'と'], why: 'で marks the rain as the reason for taking the day off.' },
      { s: '仕事[で]忙しいです。', also: ['が', 'に'], wrong: ['を', 'と', 'へ'], why: 'で gives the cause of being busy: work.' },
      { s: '仕事[で]遅れました。', wrong: ['を', 'と', 'に'], why: 'で names the reason for being late. に would make it late for work.' },
      { s: '風邪[で]頭が痛い。', wrong: ['を', 'に', 'と'], why: 'で links the headache to its cause: a cold.' },
      { s: '宿題[で]忙しい。', also: ['が', 'に'], wrong: ['を', 'と', 'へ'], why: 'で gives the homework as the reason for being busy.' },
      { s: '長い散歩[で]疲れた。', also: ['に'], wrong: ['を', 'と', 'へ'], why: 'で gives the cause of being tired: the long walk.' },
      { s: '雪[で]電車が止まることがあります。', wrong: ['を', 'と', 'へ'], why: 'で marks snow as the cause that stops the trains.' }
    ]
  },
  {
    point: 'ka-question',
    questions: [
      { s: '音楽を聞きます[か]。', wrong: ['よ', 'も', 'と'], why: 'か at the end turns the statement into a question. よ would be telling, not asking.' },
      { s: '魚が好きです[か]。', wrong: ['よ', 'は', 'も'], why: 'A sentence-final か makes the question "Do you like fish?"' },
      { s: '学生です[か]。', wrong: ['よ', 'も', 'に'], why: 'か asks the question. 学生ですよ would assert that you are a student.' },
      { s: '明日は来ます[か]。', wrong: ['よ', 'を', 'と'], why: 'か turns "you will come" into "will you come?"' },
      { s: 'いつ来ます[か]。', wrong: ['よ', 'も', 'を'], why: 'Even with a question word like いつ, the sentence still ends in か.' },
      { s: 'お茶を飲みません[か]。', wrong: ['よ', 'も', 'に'], why: 'か makes this an invitation. よ would say you do not drink tea.' },
      { s: '映画を見ません[か]。', wrong: ['よ', 'と', 'を'], why: 'ませんか is the polite way to suggest doing something together.' },
      { s: '漢字が読めます[か]。', wrong: ['よ', 'も', 'に'], why: 'か asks whether you can read kanji.' },
      { s: '何を食べます[か]。', wrong: ['よ', 'も', 'に'], why: 'か closes the question that 何 opens.' },
      { s: '誰が来ます[か]。', wrong: ['よ', 'を', 'と'], why: 'か makes "Who is coming?" a real question.' },
      { s: '一緒に行きません[か]。', wrong: ['よ', 'も', 'を'], why: 'か turns the sentence into a polite invitation.' }
    ]
  },
  {
    point: 'ka-or',
    questions: [
      { s: '魚[か]肉を食べます。', wrong: ['を', 'が', 'と'], why: 'か between two nouns means "or". と would mean eating both.' },
      { s: '本[か]新聞を読みます。', wrong: ['と', 'の', 'も'], why: 'か offers a choice between a book and a newspaper. と would mean both.' },
      { s: '電車[か]車で行きます。', wrong: ['を', 'が', 'に'], why: 'か joins the two options "train or car".' },
      { s: '今日[か]明日行きます。', wrong: ['を', 'が', 'と'], why: 'か gives the choice between today and tomorrow. と would mean going on both days.' },
      { s: '赤と黒のマジック[か]サインペン持ってない？', wrong: ['を', 'が', 'に'], why: 'か offers two alternatives: markers or felt-tip pens.' },
      { s: 'あの犬はオス[か]メスか。', wrong: ['を', 'が', 'に'], why: 'The question "male or female?" puts か between the two choices.' },
      { s: '水[か]お茶を飲みます。', wrong: ['と', 'を', 'が'], why: 'か between two nouns means "or". と would mean drinking both.' },
      { s: '月曜日[か]火曜日に行きます。', wrong: ['と', 'を', 'が'], why: 'か offers a choice of days. と would mean going on both.' },
      { s: 'ペン[か]えんぴつで書きます。', wrong: ['と', 'を', 'が'], why: 'か joins the two options: a pen or a pencil.' },
      { s: 'りんご[か]バナナを食べます。', wrong: ['と', 'が', 'に'], why: 'か gives a choice of one fruit or the other.' },
      { s: '父[か]母に聞きます。', wrong: ['と', 'を', 'が'], why: 'か means "or": one of the two parents, not both.' }
    ]
  }
]
