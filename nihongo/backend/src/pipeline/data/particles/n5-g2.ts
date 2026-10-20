import type { AuthoredParticleSet } from './types.js'

export const N5_G2: AuthoredParticleSet[] = [
  {
    point: 'ni-direction',
    questions: [
      { s: '学校[に]行きます。', also: ['へ'], wrong: ['を', 'が', 'と'], why: 'に marks the place you go to. を is for things you act on, not places you head for.' },
      { s: '会社[に]行かなければなりません。', also: ['へ'], wrong: ['を', 'で', 'が'], why: 'に marks the destination of 行く. で would say where an action happens, not where you go.' },
      { s: '公園[に]行きなさい。', also: ['へ'], wrong: ['が', 'と', 'で'], why: 'に names where you are told to go. で marks a place of action, not a destination.' },
      { s: '日本[に]来たばかりです。', also: ['へ'], wrong: ['を', 'が', 'で'], why: 'に marks the place you arrive at with 来る.' },
      { s: '家[に]帰るよ。', also: ['へ'], wrong: ['を', 'が', 'と'], why: 'に marks the place you return to. が would make 家 the one doing the returning.' },
      { s: '部屋[に]入るな。', also: ['へ'], wrong: ['が', 'で', 'と'], why: 'に marks the place you enter. で would mean doing something inside the room.' },
      { s: '駅[に]着いたら、電話してください。', also: ['へ'], wrong: ['を', 'が', 'と'], why: 'に marks the place you arrive at with 着く.' },
      { s: '新しい店[に]行ってみる。', also: ['へ'], wrong: ['を', 'で', 'が'], why: 'に marks the shop as the destination of 行く.' },
      { s: 'パーティー[に]来ますか。', also: ['へ'], wrong: ['を', 'が', 'と'], why: 'に marks the party as where you come to.' },
      { s: '兵庫大学[に]入りました。', also: ['へ'], wrong: ['を', 'が', 'と'], why: 'に marks the university you got into with 入る.' }
    ]
  },
  {
    point: 'he-direction',
    questions: [
      { s: '日本[へ]来ます。', also: ['に'], wrong: ['を', 'が', 'で'], why: 'へ points toward the direction of travel. を would treat Japan as a thing acted on.' },
      { s: '学校[へ]行きます。', also: ['に'], wrong: ['を', 'が', 'と'], why: 'へ marks the direction you head in.' },
      { s: '学校[へ]行きなさい。', also: ['に'], wrong: ['が', 'で', 'と'], why: 'へ marks where you are told to head. で marks a place of action instead.' },
      { s: '外国[へ]いきたい。', also: ['に'], wrong: ['を', 'が', 'で'], why: 'へ marks the direction of travel, abroad.' },
      { s: '日本[へ]行くつもりです。', also: ['に'], wrong: ['を', 'が', 'で'], why: 'へ marks Japan as where you intend to head.' },
      { s: 'おとといそこ[へ]行きました。', also: ['に'], wrong: ['が', 'で', 'と'], why: 'へ marks the direction of travel to that place.' },
      { s: '向こう[へ]行け！', also: ['に'], wrong: ['が', 'を', 'と'], why: 'へ points the direction you must go: over there.' },
      { s: '左[へ]曲がりなさい。', also: ['に'], wrong: ['と', 'が', 'で'], why: 'へ marks the direction of the turn. で would mark where the turning happens, not which way.' },
      { s: 'メアリーは階段をおりて台所[へ]行った。', also: ['に'], wrong: ['が', 'で', 'と'], why: 'へ marks the kitchen as where Mary headed. で would be where something happens.' },
      { s: '外[へ]出たい。', also: ['に'], wrong: ['で', 'が', 'と'], why: 'へ marks the direction you want to move in: outside.' }
    ]
  },
  {
    point: 'ni-existence',
    questions: [
      { s: 'テーブルの上[に]カップがある。', wrong: ['で', 'を', 'へ'], why: 'に marks where something is. で is for where an action happens.' },
      { s: 'ベッドの下[に]猫がいる。', wrong: ['で', 'を', 'と'], why: 'に marks where the cat is. で would need an action.' },
      { s: 'たこは海[に]いる。', wrong: ['で', 'を', 'へ'], why: 'に marks where a living thing is, with いる.' },
      { s: 'だれか玄関[に]いる。', wrong: ['で', 'を', 'と'], why: 'に marks where someone is. で would suggest an action at the door.' },
      { s: 'ホテルの前[に]銀行がある。', wrong: ['で', 'を', 'へ'], why: 'に marks where the bank is. ある here is existence, not an action.' },
      { s: 'この近く[に]映画館はありますか。', wrong: ['で', 'を', 'と'], why: 'に marks the place where the cinema might be.' },
      { s: 'この町[に]は学校が４つあります。', wrong: ['から', 'を', 'へ'], why: 'に marks where the schools are; は just makes the town the topic.' },
      { s: 'この店[に]葉書がたくさんある。', wrong: ['で', 'を', 'と'], why: 'に marks the shop as where the postcards are.' },
      { s: 'テーブルの下[に]猫がいる？', wrong: ['で', 'を', 'へ'], why: 'に marks where the cat is.' },
      { s: 'この家[に]は部屋が６つあります。', wrong: ['から', 'へ', 'と'], why: 'に marks the house as where the rooms are; は just makes the house the topic.' }
    ]
  },
  {
    point: 'ni-frequency',
    questions: [
      { s: '一日[に]一回勉強します。', wrong: ['で', 'を', 'と'], why: 'に after a period of time says "per": once a day.' },
      { s: '一日[に]三回食べます。', wrong: ['で', 'から', 'の'], why: '一日に三回 means three times per day. 一日で would mean within one day, not per day.' },
      { s: '一日[に]三回飲みます。', wrong: ['が', 'へ', 'を'], why: 'に ties the count to the period: three times per day.' },
      { s: '一日[に]二回歩きます。', wrong: ['で', 'の', 'と'], why: 'に gives the rate: twice per day.' },
      { s: '週[に]二かい友達に会います。', wrong: ['が', 'を', 'で'], why: 'に after a period of time says "per": twice a week.' },
      { s: '月[に]一度母に電話します。', wrong: ['で', 'を', 'の'], why: 'に ties the count to the period: once per month.' },
      { s: '一年[に]一かい日本へ行きます。', wrong: ['を', 'と', 'が'], why: 'に gives the rate: once per year.' },
      { s: '一日[に]二かいメールを見ます。', wrong: ['が', 'を', 'の'], why: 'に after a day says "per day": twice a day.' },
      { s: '週[に]三かい学校へ行きます。', wrong: ['を', 'と', 'が'], why: 'に after 週 says "per week": three times a week.' },
      { s: '月[に]二かい映画を見ます。', wrong: ['が', 'を', 'で'], why: 'に gives the rate: twice per month.' }
    ]
  },
  {
    point: 'ni-purpose',
    questions: [
      { s: '泳ぎ[に]行きます。', wrong: ['を', 'で', 'と'], why: '泳ぎ plus に says why you go: to swim.' },
      { s: '友達と買い物[に]行った。', also: ['へ'], wrong: ['で', 'を', 'が'], why: 'A noun like 買い物 plus に says the purpose of going: shopping.' },
      { s: '明日買い物[に]行きます。', also: ['へ'], wrong: ['で', 'が', 'の'], why: '買い物に行く means go in order to shop.' },
      { s: '私はあのデパートへ買い物[に]行った。', also: ['へ'], wrong: ['で', 'が', 'と'], why: '買い物 plus に gives the purpose of the trip. The earlier へ is the direction.' },
      { s: '旅行[に]行こう。', also: ['へ'], wrong: ['で', 'を', 'の'], why: 'に marks the trip as the purpose of going. 旅行で would mean on a trip, not going in order to travel.' },
      { s: 'あなたのお姉さんは旅行[に]行かなかったのですね。', also: ['へ'], wrong: ['を', 'が', 'と'], why: 'に marks the trip as the purpose of going.' },
      { s: 'うちは家族で毎年冬スキー[に]行きます。', also: ['へ'], wrong: ['で', 'を', 'と'], why: 'スキー plus に says what the family goes to do.' },
      { s: 'サムは一月にスキー[に]行った。', also: ['へ'], wrong: ['を', 'が', 'と'], why: 'The second に gives the purpose: go skiing. The first に is the time.' }
    ]
  },
  {
    point: 'wo-object',
    questions: [
      { s: 'お茶[を]飲みました。', also: ['は', 'も'], wrong: ['が', 'に', 'と'], why: 'を marks what was drunk. に would not mark the thing drunk.' },
      { s: 'この写真[を]見て下さい。', also: ['は'], wrong: ['が', 'に', 'と'], why: 'を marks the thing you look at.' },
      { s: 'いいカメラ[を]買った。', also: ['は'], wrong: ['が', 'に', 'と'], why: 'を marks what was bought.' },
      { s: 'すぐに靴[を]履いた。', wrong: ['が', 'に', 'で'], why: 'を marks the shoes put on. が would make the shoes the doer.' },
      { s: 'あの建物[を]見て。', also: ['は'], wrong: ['が', 'で', 'と'], why: 'を marks the building you are told to look at.' },
      { s: 'この歌[を]歌えますか。', also: ['が', 'は'], wrong: ['に', 'で', 'と'], why: 'を marks the song being sung. With a can-verb, が also works, and は makes the song the topic.' },
      { s: 'このセーター[を]着なさい。', also: ['は'], wrong: ['が', 'に', 'で'], why: 'を marks the thing worn.' },
      { s: 'そのテープ[を]聞きましょう。', also: ['は'], wrong: ['が', 'に', 'と'], why: 'を marks what we will listen to.' },
      { s: 'お茶[を]入れますよ。', also: ['は'], wrong: ['が', 'に', 'と'], why: 'を marks the tea being made.' },
      { s: 'お砂糖[を]取って下さい。', wrong: ['が', 'に', 'で'], why: 'を marks the sugar to pass.' }
    ]
  }
]
