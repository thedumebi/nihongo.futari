import type { Dialogue } from './types.js'

/** Cooking, meals and the bath — the domestic evening. */
export const COOKING: Dialogue[] = [
  {
    code: 'cooking-whats-for-dinner',
    unit: 'cooking',
    title: 'What is for dinner',
    situation: 'You come into the kitchen and something smells good.',
    turns: [
      { s: 'you', t: '今晩は何ですか。', r: 'こんばん わ なん です か。', e: 'What is for dinner tonight?', wrong: [
        ['今晩は何ましたか。', 'こんばん わ なん ました か。', 'nan is a noun; it cannot take a verb ending. The copula does the work: nan desu ka.'],
        ['今晩が何ですか。', 'こんばん が なん です か。', 'ga would single tonight out against other nights. Simply asking about tonight takes wa.']
      ] },
      { s: 'other', t: 'カレーだよ。', r: 'カレー だ よ。', e: 'Curry.' },
      { s: 'you', t: '手伝いましょうか。', r: 'てつだいましょう か。', e: 'Shall I help?', wrong: [
        ['手伝いますか。', 'てつだいます か。', 'That asks whether THEY will help. To offer, use mashou ka.'],
        ['手伝ってください。', 'てつだって ください。', 'That asks them to help YOU — the opposite of an offer.']
      ] },
      { s: 'other', t: 'じゃあ、野菜を切って。', r: 'じゃあ、やさい お きって。', e: 'Then cut the vegetables.' }
    ]
  },
  {
    code: 'cooking-fridge',
    unit: 'cooking',
    title: 'What is in the fridge',
    situation: 'You are checking whether anything needs using up.',
    turns: [
      { s: 'you', t: '冷蔵庫に卵がありますか。', r: 'れいぞうこ に たまご が あります か。', e: 'Are there any eggs in the fridge?', wrong: [
        ['冷蔵庫で卵がありますか。', 'れいぞうこ で たまご が あります か。', 'de marks where an action happens. For where something exists, aru takes ni.'],
        ['冷蔵庫に卵をありますか。', 'れいぞうこ に たまご お あります か。', 'aru is intransitive — nothing acts on the eggs. The thing that exists takes ga.']
      ] },
      { s: 'other', t: '二つだけあるよ。', r: 'ふたつ だけ ある よ。', e: 'Only two.' },
      { s: 'you', t: 'じゃあ、買ってきます。', r: 'じゃあ、かって きます。', e: 'I will go and buy some then.', wrong: [
        ['じゃあ、買っていきます。', 'じゃあ、かって いきます。', 'te-ikimasu goes and does not come back. Fetching something means returning with it: katte kimasu.'],
        ['じゃあ、買いました。', 'じゃあ、かいました。', 'Past tense claims you already have.']
      ] }
    ]
  },
  {
    code: 'cooking-table',
    unit: 'cooking',
    title: 'Laying the table',
    situation: 'Dinner is nearly ready.',
    turns: [
      { s: 'other', t: 'お皿を出してくれる？', r: 'おさら お だして くれる？', e: 'Could you get the plates out?' },
      { s: 'you', t: 'はい。何枚要りますか。', r: 'はい。なんまい いります か。', e: 'Yes. How many do I need?', wrong: [
        ['はい。何個要りますか。', 'はい。なんこ いります か。', 'ko counts small round things. Plates are flat, so mai.'],
        ['はい。いくら要りますか。', 'はい。いくら いります か。', 'ikura asks a price. For a count it is nan- plus a counter.']
      ] },
      { s: 'other', t: '四枚お願い。', r: 'よんまい おねがい。', e: 'Four, please.' }
    ]
  },
  {
    code: 'cooking-taste',
    unit: 'cooking',
    title: 'Tasting it',
    situation: 'They hand you a spoon.',
    turns: [
      { s: 'other', t: 'ちょっと味見して。', r: 'ちょっと あじみ して。', e: 'Have a taste.' },
      { s: 'you', t: 'おいしいです。でも、少し辛いですね。', r: 'おいしい です。でも、すこし からい です ね。', e: 'It is good. A little spicy though.', wrong: [
        ['おいしいです。でも、少し辛いでした。', 'おいしい です。でも、すこし からい でした。', 'karai is an i-adjective: its past is karakatta desu, never karai deshita. And it is spicy now, so the present is right anyway.'],
        ['おいしいでした。でも、少し辛いです。', 'おいしい でした。でも、すこし からい です。', 'Same mistake on oishii — i-adjectives never take deshita.']
      ] },
      { s: 'other', t: 'じゃあ、水を足そう。', r: 'じゃあ、みず お たそう。', e: 'I will add some water then.' }
    ]
  },
  {
    code: 'cooking-leftovers',
    unit: 'cooking',
    title: 'Leftovers',
    situation: 'There is food left after dinner.',
    turns: [
      { s: 'other', t: '残ったの、どうする？', r: 'のこった の、どう する？', e: 'What shall we do with what is left?' },
      { s: 'you', t: '明日食べるので、冷蔵庫に入れておきます。', r: 'あした たべる ので、れいぞうこ に いれて おきます。', e: 'I will eat it tomorrow, so I will put it in the fridge.', wrong: [
        ['明日食べるから、冷蔵庫に入れます。', 'あした たべる から、れいぞうこ に いれます。', 'Understandable, but te-okimasu is the form for doing something now for later — which is exactly what putting food away is.'],
        ['明日食べるので、冷蔵庫で入れておきます。', 'あした たべる ので、れいぞうこ で いれて おきます。', 'de marks where an action happens, but the fridge is the destination the food goes INTO, so ni.']
      ] }
    ]
  },
  {
    code: 'bath-ready',
    unit: 'bath',
    title: 'The bath is ready',
    situation: 'Someone calls from the corridor.',
    turns: [
      { s: 'other', t: 'お風呂が沸きましたよ。', r: 'おふろ が わきました よ。', e: 'The bath is ready.' },
      { s: 'you', t: 'ありがとうございます。先にどうぞ。', r: 'ありがとうございます。さきに どうぞ。', e: 'Thank you. You go first.', wrong: [
        ['ありがとうございます。先に行きます。', 'ありがとうございます。さきに いきます。', 'That announces YOU are going first, which in a Japanese household is the opposite of polite when someone has just told you it is ready.'],
        ['ありがとうございます。お先に失礼します。', 'ありがとうございます。おさきに しつれいします。', 'That phrase is for leaving somewhere ahead of others — an office, a gathering. Not for the bath.']
      ] },
      { s: 'other', t: 'いいえ、どうぞお先に。', r: 'いいえ、どうぞ おさきに。', e: 'No, you go ahead.' },
      { s: 'you', t: 'では、お先にいただきます。', r: 'では、おさきに いただきます。', e: 'Then I will go first, thank you.', wrong: [
        ['では、お先に食べます。', 'では、おさきに たべます。', 'taberu is for food. The bath is received as a favour, which is why itadakimasu covers it too.'],
        ['では、さようなら。', 'では、さようなら。', 'You are going to the bathroom, not leaving for good.']
      ] }
    ]
  },
  {
    code: 'bath-after',
    unit: 'bath',
    title: 'After the bath',
    situation: 'You come out warm and pink.',
    turns: [
      { s: 'other', t: 'どうだった？', r: 'どう だった？', e: 'How was it?' },
      { s: 'you', t: 'とても気持ちよかったです。', r: 'とても きもちよかった です。', e: 'It felt wonderful.', wrong: [
        ['とても気持ちいいでした。', 'とても きもち いい でした。', 'ii is irregular: its past is yokatta, from the older yoi. kimochi ii becomes kimochi yokatta.'],
        ['とても気持ちよかったでした。', 'とても きもち よかった でした。', 'The past is already in yokatta — adding deshita doubles it.']
      ] },
      { s: 'other', t: 'よかった。お湯はまだ温かいよ。', r: 'よかった。おゆ わ まだ あたたかい よ。', e: 'Good. The water is still warm.' }
    ]
  },
  {
    code: 'bath-asking',
    unit: 'bath',
    title: 'Asking to use the bath',
    situation: 'You are staying with a family and it is getting late.',
    turns: [
      { s: 'you', t: 'お風呂を借りてもいいですか。', r: 'おふろ お かりて も いい です か。', e: 'May I use the bath?', wrong: [
        ['お風呂を借りたいです。', 'おふろ お かりたい です。', 'That states what you want. In someone else\'s house you ask permission: te mo ii desu ka.'],
        ['お風呂を借ります。', 'おふろ お かります。', 'That announces you are going to, without asking.']
      ] },
      { s: 'other', t: 'どうぞどうぞ。タオルはそこにあります。', r: 'どうぞ どうぞ。タオル わ そこ に あります。', e: 'Please do. Towels are there.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['失礼します。', 'しつれいします。', 'That is for entering or leaving a room, not for thanks.'],
        ['おじゃまします。', 'おじゃまします。', 'That is said on entering someone\'s home, at the door.']
      ] }
    ]
  }
]
