import type { Dialogue } from './types.js'

/**
 * Convenience-store and supermarket checkout: the one exchange every learner
 * in Japan has almost daily, and the one where いいです silently means "no"
 * to a foreigner expecting a yes.
 *
 * These conversations run long on purpose. A real checkout is never a single
 * question and answer — it's a fixed battery fired in order (heating,
 * cutlery, point card, bag, payment, and now the machine), sometimes in full
 * keigo, sometimes contracted to a bare 「〜は?」 at the lunchtime rush. The
 * corpus this file joins averages 3.5 turns per dialogue, which is enough to
 * teach one sentence but not enough to teach staying oriented through five
 * questions in a row, catching いいです for what it means before the moment
 * to correct it is gone, or recovering when an IC card comes up short or a
 * barcode will not scan. Shortening these back down would remove the exact
 * thing they are here to drill.
 *
 * Staff lines carry the keigo a real clerk uses (かしこまりました, いかが
 * なさいますか, ご利用ですか) purely so the learner can recognise it when it
 * arrives fast and unannounced. The learner is never asked to produce that
 * register — their lines are what an ordinary customer actually says.
 */
export const CHECKOUT: Dialogue[] = [
  // 温めますか comes while the clerk is still scanning, before a learner
  // expects it — silence is heard as "no heating." お先に大きい方 means the
  // change comes in two hand-offs, notes then coins, not a second charge.
  {
    code: 'konbini-bento-cash',
    unit: 'konbini',
    title: 'Bento, heated, paid in cash',
    situation: 'An evening konbini run — one bento, one tea, paying in cash.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。', r: 'いらっしゃいませ。', e: 'Welcome.' },
      { s: 'other', t: 'こちらのお弁当、温めますか。', r: 'こちら の おべんとう、あたためます か。', e: 'Shall I heat this bento for you?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、いいです。', 'はい、いい です。', 'ii desu declines here — the single biggest trap in this whole exchange. Accepting an offer is hai, onegaishimasu.'],
        ['はい、温めます。', 'はい、あたためます。', 'atatamemasu says YOU will do the heating. Accepting their offer to do it is onegaishimasu, not the bare verb.']
      ] },
      { s: 'other', t: 'お箸はご利用ですか。', r: 'おはし わ ごりよう です か。', e: 'Will you need chopsticks?' },
      { s: 'you', t: 'はい、一膳お願いします。', r: 'はい、いちぜん おねがいします。', e: 'Yes, one pair please.', wrong: [
        ['一膳あげます。', 'いちぜん あげます。', 'ageru is you giving something to THEM. You are asking to receive the chopsticks, so onegaishimasu, not ageru.'],
        ['一個お願いします。', 'いっこ おねがいします。', 'ko is the general counter for objects. Chopstick pairs take their own counter, zen.']
      ] },
      { s: 'other', t: 'ポイントカードはお持ちですか。', r: 'ポイントカード わ おもち です か。', e: 'Do you have a point card?' },
      { s: 'you', t: '持ってないです。', r: 'もって ない です。', e: "I don't have one on me.", wrong: [
        ['持たないです。', 'もたない です。', 'motanai states a general habit — that you never carry one, as a rule. Not having it on you right now is the te-form negative, motte nai.'],
        ['持ちませんでした。', 'もちません でした。', 'That is past tense, about some earlier point in time. The fact of not having it right now needs motte nai, not a past-tense verb.']
      ] },
      { s: 'other', t: 'レジ袋はご利用ですか。', r: 'レジぶくろ わ ごりよう です か。', e: 'Will you be needing a bag?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、いいです。', 'はい、いい です。', 'ii desu declines the bag — the same trap as the heating question. Accepting is hai, onegaishimasu.'],
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'daijoubu desu also declines, whatever hai in front of it suggests. Accepting needs onegaishimasu.']
      ] },
      { s: 'other', t: '袋は3円になります。合計で658円です。', r: 'ふくろ わ さんえん に なります。ごうけい で ろっぴゃくごじゅうはち えん です。', e: "The bag is 3 yen, so that's 658 yen altogether." },
      { s: 'you', t: '千円でお願いします。', r: 'せんえん で おねがいします。', e: 'Out of 1000 yen, please.', wrong: [
        ['千円をお願いします。', 'せんえん お おねがいします。', 'The note you are handing over is the means of paying, so it takes de. o would treat the note itself as a direct object of onegaishimasu.'],
        ['千円がお願いします。', 'せんえん が おねがいします。', 'onegaishimasu does not take a ga-marked subject here — the amount you are paying with is marked with de.']
      ] },
      { s: 'other', t: '千円お預かりします。お先に大きい方、300円のお返しです。', r: 'せんえん おあずかり します。おさきに おおきい ほう、さんびゃくえん の おかえし です。', e: 'Taking your 1000 yen — first the larger amount, 300 yen back.' },
      { s: 'other', t: '残り42円とレシートのお返しです。ありがとうございました。', r: 'のこり よんじゅうにえん と レシート の おかえし です。ありがとう ございました。', e: 'And the remaining 42 yen with your receipt. Thank you very much.' },
      { s: 'you', t: 'どうも。', r: 'どうも。', e: 'Thanks.', wrong: [
        ['どうもでした。', 'どうも でした。', 'doumo already stands complete as a closing word on its own — deshita cannot attach onto it.'],
        ['どうもします。', 'どうも します。', 'doumo is not a verb stem here. It is the fixed closing word by itself, not a part that combines with suru.']
      ] }
    ]
  },

  // 一括払い ("one lump payment", not installments) is the question a
  // foreign card always answers with 一括で — installments are not a thing
  // on non-Japanese cards, and hesitating stalls the till. そのままで below
  // ¥10,000 usually skips PIN/signature; over it, expect 暗証番号 or サイン.
  {
    code: 'konbini-credit-card',
    unit: 'konbini',
    title: 'Paying by credit card',
    situation: 'A few items, no heating — paying by credit card and confirming a single payment.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。お弁当温めますか。', r: 'いらっしゃいませ。おべんとう あたためます か。', e: 'Welcome. Shall I heat the bento?' },
      { s: 'you', t: 'いえ、大丈夫です。', r: 'いえ、だいじょうぶ です。', e: "No, I'm fine.", wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai signals yes. Pairing it with a decline sends a contradictory answer — a decline opens with iie, not hai.'],
        ['いえ、お願いします。', 'いえ、おねがいします。', 'onegaishimasu is a request/acceptance phrase. Pairing it with iie contradicts the decline you are making.']
      ] },
      { s: 'other', t: 'ポイントカードはお持ちですか。', r: 'ポイントカード わ おもち です か。', e: 'Do you have a point card?' },
      { s: 'you', t: 'ないです。', r: 'ない です。', e: "I don't have one.", wrong: [
        ['いないです。', 'いない です。', 'iru is for animate things. A card is inanimate, so its negative existence is nai desu, not inai desu.'],
        ['持たないです。', 'もたない です。', 'motanai states a general habit of never carrying one. Simply not having it on you now is nai desu.']
      ] },
      { s: 'other', t: '袋はご利用ですか。', r: 'ふくろ わ ごりよう です か。', e: 'Do you need a bag?' },
      { s: 'you', t: 'いえ、そのままで大丈夫です。', r: 'いえ、そのまま で だいじょうぶ です。', e: 'No, as-is is fine.', wrong: [
        ['いえ、そのままをください。', 'いえ、そのまま お ください。', 'sono mama describes a state ("as it is"), not a thing that can be handed over, so it cannot take the object marker o with kudasai.'],
        ['はい、そのままで大丈夫です。', 'はい、そのまま で だいじょうぶ です。', 'hai signals yes. Declining the bag needs to open with iie, not hai.']
      ] },
      { s: 'other', t: 'かしこまりました。合計876円です。お支払い方法はいかがなさいますか。', r: 'かしこまりました。ごうけい はっぴゃくななじゅうろく えん です。おしはらい ほうほう わ いかが なさいます か。', e: 'Understood. That comes to 876 yen. How will you be paying?' },
      { s: 'you', t: 'クレジットカードで。', r: 'クレジットカード で。', e: 'By credit card.', wrong: [
        ['クレジットカードを。', 'クレジットカード お。', 'The method you are paying with takes de. You are not handing the card over as a direct object here — o would need a verb like dasu.'],
        ['クレジットカードが。', 'クレジットカード が。', 'ga would mark the card as the subject performing an action. Naming your payment method takes de.']
      ] },
      { s: 'other', t: '一括払いでよろしいですか。', r: 'いっかつばらい で よろしい です か。', e: 'Is a single payment, no installments, all right?' },
      { s: 'you', t: 'はい、一括で。', r: 'はい、いっかつ で。', e: 'Yes, single payment.', wrong: [
        ['はい、一括を。', 'はい、いっかつ お。', 'Naming the method you are choosing takes de, echoing their ikkatsu-barai de. o would need a verb to attach to.'],
        ['はい、一括が。', 'はい、いっかつ が。', 'ga would make ikkatsu a bare subject with no predicate. Stating your chosen method takes de.']
      ] },
      { s: 'other', t: 'では、こちらにカードを挿入してください。タッチ決済でしたらそのままかざしてください。', r: 'では、こちら に カード お そうにゅう して ください。タッチ けっさい でしたら そのまま かざして ください。', e: "Please insert your card here. If it's contactless, just tap it as it is." },
      { s: 'other', t: 'お取りください。レシートはご利用ですか。', r: 'おとり ください。レシート わ ごりよう です か。', e: 'You can take your card. Would you like the receipt?' },
      { s: 'you', t: 'いえ、大丈夫です。', r: 'いえ、だいじょうぶ です。', e: "No, I'm fine.", wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai signals yes. A decline needs to start with iie.'],
        ['いえ、要ります。', 'いえ、いります。', 'irimasu ("I need it") contradicts the iie right before it. A decline continues with daijoubu desu, not a statement that you need the thing.']
      ] },
      { s: 'other', t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you very much.' }
    ]
  },

  // 電子マネー is the umbrella term for Suica/PASMO/ICOCA plus iD, QUICPay,
  // nanaco, WAON — the universal answer pattern is brand name + で. Contracted
  // staff speech (袋いりますか / ポイントカードは) is what learners actually
  // hear at a normal register, not the textbook full form.
  {
    code: 'konbini-suica',
    unit: 'konbini',
    title: 'Paying with an IC card',
    situation: 'A drink and a rice ball, paid with a transit IC card. Staff speech runs short and contracted.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。', r: 'いらっしゃいませ。', e: 'Welcome.' },
      { s: 'other', t: '温めますか。', r: 'あたためます か。', e: 'Heat it up?' },
      { s: 'you', t: 'いえ、いいです。', r: 'いえ、いい です。', e: "No, I'm good.", wrong: [
        ['はい、お願いします。', 'はい、おねがいします。', "That accepts the heating — but you don't want it heated. Declining is exactly what iie, ii desu already does."],
        ['いえ、お願いします。', 'いえ、おねがいします。', 'onegaishimasu is a request/acceptance phrase. Pairing it with iie contradicts the decline you are making.']
      ] },
      { s: 'other', t: '袋いりますか。', r: 'ふくろ いります か。', e: 'Need a bag?' },
      { s: 'you', t: 'いらないです。そのままで。', r: 'いらない です。そのまま で。', e: 'No need. As-is.', wrong: [
        ['いりません、そのままを。', 'いりません、そのまま お。', 'sono mama is a state, not a direct object. It pairs with de, not the object marker o.'],
        ['いらないです。そのままが。', 'いらない です。そのまま が。', 'ga would make "as-is" a bare subject with no predicate. Stating how you want it left takes de.']
      ] },
      { s: 'other', t: 'ポイントカードは。', r: 'ポイントカード わ。', e: 'Point card?' },
      { s: 'you', t: 'ないです。', r: 'ない です。', e: "Don't have one.", wrong: [
        ['いないです。', 'いない です。', 'iru is for animate things. A card is inanimate, so its negative existence is nai desu.'],
        ['ありません、たぶん。', 'ありません、たぶん。', 'tabun ("maybe") undercuts a fact you actually know for certain — you know you have no card, so state it plainly as arimasen.']
      ] },
      { s: 'other', t: '合計283円です。お支払いは。', r: 'ごうけい にひゃくはちじゅうさん えん です。おしはらい わ。', e: '283 yen total. And for payment?' },
      { s: 'you', t: 'スイカで。', r: 'スイカ で。', e: 'With Suica.', wrong: [
        ['スイカを。', 'スイカ お。', 'The method of paying takes de, not the object marker o.'],
        ['スイカが。', 'スイカ が。', 'ga marks a grammatical subject. Naming your payment method takes de.']
      ] },
      { s: 'other', t: 'かしこまりました。では、タッチをお願いします。', r: 'かしこまりました。では、タッチ お おねがいします。', e: 'Understood. Go ahead and tap it.' },
      { s: 'other', t: 'はい、お買い上げありがとうございます。レシートはご利用ですか。', r: 'はい、おかいあげ ありがとう ございます。レシート わ ごりよう です か。', e: '(beep) There we go — thank you for your purchase. Would you like the receipt?' },
      { s: 'you', t: 'いえ、大丈夫です。', r: 'いえ、だいじょうぶ です。', e: "No, I'm fine.", wrong: [
        ['はい、大丈夫です。', 'はい、だいじょうぶ です。', 'hai signals yes. A decline should open with iie, not hai.'],
        ['いえ、欲しいです。', 'いえ、ほしい です。', 'hoshii desu says you want it, which contradicts the iie that opens the sentence.']
      ] }
    ]
  },

  // 残高不足 (ざんだかぶそく) is the phrase itself, and チャージできますか is
  // the whole point of this script — the till errors out and everyone behind
  // you waits. Charging is cash-only at most registers, and a shortfall on
  // transit IC generally cannot be split with cash at a konbini.
  {
    code: 'konbini-zandaka-busoku',
    unit: 'konbini',
    title: 'When the IC card comes up short',
    situation: 'Your IC card fails at the register with an insufficient balance, and you have to charge it on the spot.',
    turns: [
      { s: 'other', t: '合計1,120円です。お支払い方法は。', r: 'ごうけい せんひゃくにじゅう えん です。おしはらい ほうほう わ。', e: "That's 1,120 yen. How will you be paying?" },
      { s: 'you', t: 'パスモで。', r: 'パスモ で。', e: 'With PASMO.', wrong: [
        ['パスモを。', 'パスモ お。', 'The method of paying takes de, not the object marker o.'],
        ['パスモが。', 'パスモ が。', 'ga marks a grammatical subject. Naming your payment method takes de.']
      ] },
      { s: 'other', t: 'タッチをお願いします。', r: 'タッチ お おねがいします。', e: 'Please tap it.' },
      { s: 'other', t: '申し訳ございません、残高が不足しているようです。', r: 'もうしわけ ございません、ざんだか が ふそく して いる よう です。', e: "I'm terribly sorry — it looks like your balance is insufficient." },
      { s: 'you', t: 'あ、すみません。チャージできますか。', r: 'あ、すみません。チャージ できます か。', e: 'Ah, sorry — can I charge it here?', wrong: [
        ['あ、すみません。チャージしますか。', 'あ、すみません。チャージ します か。', 'shimasu ka asks whether THEY will do the charging. Asking whether it is possible at all is dekimasu ka.'],
        ['あ、すみません。チャージがいいですか。', 'あ、すみません。チャージ が いい です か。', 'ii desu ka asks whether something is acceptable in the abstract. Asking about capability needs dekimasu ka.']
      ] },
      { s: 'other', t: 'はい、できますよ。いくらチャージなさいますか。', r: 'はい、できます よ。いくら チャージ なさいます か。', e: 'Yes, you can. How much would you like to charge?' },
      { s: 'you', t: 'じゃあ、2000円で。', r: 'じゃあ、にせんえん で。', e: 'Then 2,000 yen, please.', wrong: [
        ['じゃあ、2000円を。', 'じゃあ、にせんえん お。', "The amount is stated with de, echoing their ikura de nasaimasu ka. o would treat the 2,000 yen as a handled object rather than the amount you're specifying."],
        ['じゃあ、2000円がいいです。', 'じゃあ、にせんえん が いい です。', 'ga ii desu frames the amount as your preferred option among alternatives. Simply naming the amount to charge takes de.']
      ] },
      { s: 'other', t: '2000円お預かりします。もう一度タッチをお願いします。', r: 'にせんえん おあずかり します。もう いちど タッチ お おねがいします。', e: 'Taking your 2,000 yen. Please tap once more.' },
      { s: 'other', t: 'チャージ完了です。続けてお支払いのタッチをお願いします。', r: 'チャージ かんりょう です。つづけて おしはらい の タッチ お おねがいします。', e: '(beep) Charge complete. Now please tap again for the payment.' },
      { s: 'you', t: 'あ、はい。', r: 'あ、はい。', e: 'Oh, right. (taps again)', wrong: [
        ['あ、はいです。', 'あ、はい です。', 'hai is already a complete word on its own. desu cannot attach directly onto it like that.'],
        ['あ、そうです。', 'あ、そう です。', 'sou desu confirms a fact. A quick response showing you will comply with an instruction is just hai.']
      ] },
      { s: 'other', t: 'はい、お支払い完了です。レシートとご一緒にチャージの控えもお入れしておきますね。', r: 'はい、おしはらい かんりょう です。レシート と ごいっしょ に チャージ の ひかえ も おいれ して おきます ね。', e: "There, payment complete. I'll pop the charge slip in together with your receipt." },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとう ございます。', e: 'Thank you.', wrong: [
        ['ありがとうございませんでした。', 'ありがとう ございません でした。', 'Negating gozaimasu cancels the meaning of thanks entirely. Never negate arigatou.'],
        ['どうもでした。', 'どうも でした。', 'doumo already stands complete as a closing word on its own — deshita cannot attach onto it.']
      ] },
      { s: 'other', t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you very much.' }
    ]
  },

  // コード決済 answers follow the same pattern as電子マネー: brand + で. At a
  // konbini or supermarket, staff scan YOUR barcode; at small shops it flips
  // and you scan the store's QR instead. This script covers the konbini flow.
  {
    code: 'konbini-paypay',
    unit: 'konbini',
    title: 'Paying with a QR code app',
    situation: 'Paying by PayPay — showing your barcode for the clerk to scan.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。ポイントカードはお持ちですか。', r: 'いらっしゃいませ。ポイントカード わ おもち です か。', e: 'Welcome. Do you have a point card?' },
      { s: 'you', t: '大丈夫です。', r: 'だいじょうぶ です。', e: "I'm fine, no thanks.", wrong: [
        ['大丈夫をです。', 'だいじょうぶ お です。', 'daijoubu is a na-adjective describing a state, not an object — it cannot take the object marker o.'],
        ['いいですです。', 'いい です です。', 'desu cannot stack onto itself. daijoubu desu or ii desu already stands complete on its own.']
      ] },
      { s: 'other', t: '袋はご利用ですか。', r: 'ふくろ わ ごりよう です か。', e: 'Do you need a bag?' },
      { s: 'you', t: 'お願いします。小さいので。', r: 'おねがいします。ちいさい ので。', e: 'Yes please — a small one is fine.', wrong: [
        ['お願いします。小さいのに。', 'おねがいします。ちいさい の に。', 'noni means "even though/despite" and sets up a contrast. Giving the reason for your request is node, not noni.'],
        ['お願いします。小さいのが。', 'おねがいします。ちいさい の が。', 'ga would leave "the small one" as a bare subject with no predicate. Giving your reason for the request needs the connector node.']
      ] },
      { s: 'other', t: '合計524円です。お支払い方法は。', r: 'ごうけい ごひゃくにじゅうよん えん です。おしはらい ほうほう わ。', e: "That's 524 yen. How will you be paying?" },
      { s: 'you', t: 'ペイペイで。', r: 'ペイペイ で。', e: 'With PayPay.', wrong: [
        ['ペイペイを。', 'ペイペイ お。', 'The payment method takes de, not the object marker o.'],
        ['ペイペイが。', 'ペイペイ が。', 'ga marks a grammatical subject. Naming your payment method takes de.']
      ] },
      { s: 'other', t: 'かしこまりました。バーコードのご提示をお願いします。', r: 'かしこまりました。バーコード の ごていじ お おねがいします。', e: 'Understood. Please show me your barcode.' },
      { s: 'you', t: 'これでいいですか。', r: 'これ で いい です か。', e: '(showing the screen) Is this all right?', wrong: [
        ['これでいますか。', 'これ で います か。', 'imasu ka asks whether something animate exists or is present. Asking if this is acceptable is ii desu ka.'],
        ['これはいいですか。', 'これ わ いい です か。', 'wa would set "this" up as a contrasting topic. Asking whether it works as shown uses de, matching kore de ii desu ka.']
      ] },
      { s: 'other', t: 'はい。お支払い完了です。', r: 'はい。おしはらい かんりょう です。', e: 'Yes. (scans it — "PayPay!") Payment complete.' },
      { s: 'other', t: 'レシートはご利用ですか。', r: 'レシート わ ごりよう です か。', e: 'Would you like the receipt?' },
      { s: 'you', t: 'いえ、いいです。', r: 'いえ、いい です。', e: "No, I'm fine.", wrong: [
        ['はい、いいです。', 'はい、いい です。', 'hai signals yes, but ii desu right after it already declines — the two contradict each other. A clean decline is iie, ii desu.'],
        ['いえ、欲しいです。', 'いえ、ほしい です。', 'hoshii desu says you want it, which contradicts the iie that opens the sentence.']
      ] },
      { s: 'other', t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you very much.' }
    ]
  },

  // 袋お分けしますか blindsides learners — it is asking whether to SPLIT the
  // bags, not another do-you-want-a-bag question. The trailing 3円と5円が
  // ございますが expects you to just pick a size, and the "wait over there for
  // your heated bento" step is real and never appears in textbook scripts.
  {
    code: 'konbini-hot-cold-bags',
    unit: 'konbini',
    title: 'Splitting hot and cold items',
    situation: 'A bento to heat, plus ice cream and a salad — the bags need splitting, and the size needs choosing.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。お弁当温めますか。', r: 'いらっしゃいませ。おべんとう あたためます か。', e: 'Welcome. Shall I heat the bento?' },
      { s: 'you', t: 'はい、お願いします。', r: 'はい、おねがいします。', e: 'Yes, please.', wrong: [
        ['はい、いいです。', 'はい、いい です。', 'ii desu declines. Accepting an offer is hai, onegaishimasu.'],
        ['はい、温めます。', 'はい、あたためます。', 'atatamemasu says YOU will heat it yourself. Accepting their offer to do it is onegaishimasu.']
      ] },
      { s: 'other', t: '温かいものと冷たいもの、袋お分けしますか。', r: 'あたたかい もの と つめたい もの、ふくろ おわけ します か。', e: 'Shall I put the hot and cold items in separate bags?' },
      { s: 'you', t: 'あ、分けてください。', r: 'あ、わけて ください。', e: 'Ah, yes, please separate them.', wrong: [
        ['あ、分けています。', 'あ、わけて います。', 'wakete imasu describes an action already in progress. Asking them to do it is the te-form plus kudasai, not imasu.'],
        ['あ、分かってください。', 'あ、わかって ください。', 'wakaru is "to understand" — a different verb entirely. Separating things into two bags is wakeru.']
      ] },
      { s: 'other', t: 'かしこまりました。レジ袋、サイズが3円と5円がございますが。', r: 'かしこまりました。レジぶくろ、サイズ が さんえん と ごえん が ございます が。', e: 'Understood. For bags we have a 3-yen size and a 5-yen size.' },
      { s: 'you', t: '大きい方を一枚と、小さいのを一枚で。', r: 'おおきい ほう お いちまい と、ちいさい の お いちまい で。', e: 'One large one and one small one.', wrong: [
        ['大きい方が一枚と、小さいのが一枚で。', 'おおきい ほう が いちまい と、ちいさい の が いちまい で。', 'What you are requesting is the object of an implicit onegaishimasu, so it takes o, not ga.'],
        ['大きい方を一枚と、小さいのを一枚に。', 'おおきい ほう お いちまい と、ちいさい の お いちまい に。', 'ni marks a destination or the result of a change. Totting up a combined order at the register uses de.']
      ] },
      { s: 'other', t: 'お箸とスプーン、お付けしますか。', r: 'おはし と スプーン、おつけ します か。', e: 'Shall I include chopsticks and a spoon?' },
      { s: 'you', t: 'スプーンだけお願いします。', r: 'スプーン だけ おねがいします。', e: 'Just a spoon, please.', wrong: [
        ['スプーンしかお願いします。', 'スプーン しか おねがいします。', 'shika must pair with a negative verb (shika arimasen, shika iranai). It cannot end a request in the plain affirmative onegaishimasu.'],
        ['スプーンだけつけてあげます。', 'スプーン だけ つけて あげます。', 'agemasu is you doing THEM a favour by attaching it. You are the one asking to receive the spoon, so onegaishimasu, not ageru.']
      ] },
      { s: 'other', t: '合計986円です。お支払い方法は。', r: 'ごうけい きゅうひゃくはちじゅうろく えん です。おしはらい ほうほう わ。', e: "That's 986 yen in total. How will you be paying?" },
      { s: 'you', t: '現金で。', r: 'げんきん で。', e: 'Cash.', wrong: [
        ['現金を。', 'げんきん お。', 'The method of paying takes de, not the object marker o.'],
        ['現金が。', 'げんきん が。', 'ga marks a grammatical subject. Naming your payment method takes de.']
      ] },
      { s: 'other', t: '千円お預かりします。14円のお返しとレシートです。', r: 'せんえん おあずかり します。じゅうよん えん の おかえし と レシート です。', e: "Out of 1,000 yen — here's 14 yen back and your receipt." },
      { s: 'other', t: 'お弁当、温まりましたらあちらでお渡ししますので、少々お待ちください。', r: 'おべんとう、あたたまりましたら あちら で おわたし します ので、しょうしょう おまち ください。', e: "Once your bento is heated I'll hand it to you over there, so please wait a moment." },
      { s: 'you', t: 'はい、ありがとうございます。', r: 'はい、ありがとう ございます。', e: 'Okay, thank you.', wrong: [
        ['はい、ありがとうございませんでした。', 'はい、ありがとう ございません でした。', 'Negating gozaimasu cancels the meaning of thanks entirely. Never negate arigatou.'],
        ['はい、ありがとうございましょう。', 'はい、ありがとう ございましょう。', 'The volitional -mashou form proposes a joint action, "let\'s...". arigatou gozaimasu is a fixed phrase that never conjugates into it.']
      ] },
      { s: 'other', t: 'お待たせしました。ありがとうございました。', r: 'おまたせ しました。ありがとう ございました。', e: 'Sorry to keep you waiting. Thank you very much.' }
    ]
  },

  // Every question loses its verb at rush hour: お箸は? / ポイントカードは? /
  // レシートは? are complete questions on their own. Turn 8 is the いいです
  // trap live — it means NO here and staff move on instantly; the recovery
  // line if you meant yes is あ、すみません、袋お願いします.
  {
    code: 'konbini-rush-hour',
    unit: 'konbini',
    title: 'The lunchtime rush',
    situation: '12:30 at a station convenience store — a long queue, and every question comes clipped to almost nothing.',
    turns: [
      { s: 'other', t: 'いらっしゃいませー。温めますか。', r: 'いらっしゃいませー。あたためます か。', e: 'Welcome! Heat it up?' },
      { s: 'you', t: 'お願いします。', r: 'おねがいします。', e: 'Yes please.', wrong: [
        ['いいです。', 'いい です。', 'ii desu would decline the heating. You want it heated, so onegaishimasu.'],
        ['温めます。', 'あたためます。', 'atatamemasu says YOU will heat it yourself. Accepting their offer is onegaishimasu.']
      ] },
      { s: 'other', t: 'お箸は。', r: 'おはし わ。', e: 'Chopsticks?' },
      { s: 'you', t: '一つで。', r: 'ひとつ で。', e: 'One, please.', wrong: [
        ['一つを。', 'ひとつ お。', 'Answering a bare wa-question with the thing you want takes de, as a shorthand for onegaishimasu, not the object marker o.'],
        ['一膳が。', 'いちぜん が。', 'ga would leave the chopsticks as a bare subject with no predicate. The quick-answer shorthand here is de.']
      ] },
      { s: 'other', t: 'ポイントカードは。', r: 'ポイントカード わ。', e: 'Point card?' },
      { s: 'you', t: 'ないです。', r: 'ない です。', e: "Don't have one.", wrong: [
        ['いないです。', 'いない です。', 'iru is for animate things. A card is inanimate, so its negative existence is nai desu.'],
        ['持たないです。', 'もたない です。', 'motanai states a general habit of never carrying one. Not having it right now is nai desu.']
      ] },
      { s: 'other', t: '袋いりますか。', r: 'ふくろ いります か。', e: 'Need a bag?' },
      { s: 'you', t: 'いいです。', r: 'いい です。', e: 'No thanks.', wrong: [
        ['はい、いいです。', 'はい、いい です。', 'hai signals yes, but ii desu right after it already declines — say hai, onegaishimasu to actually accept.'],
        ['大丈夫です、お願いします。', 'だいじょうぶ です、おねがいします。', 'daijoubu desu already declines by itself. Tacking onegaishimasu on afterward reverses it back into a request.']
      ] },
      { s: 'other', t: '640円です。お支払いは。', r: 'ろっぴゃくよんじゅう えん です。おしはらい わ。', e: '640 yen. And for payment?' },
      { s: 'you', t: 'iDで。', r: 'アイディー で。', e: 'With iD.', wrong: [
        ['iDを。', 'アイディー お。', 'The payment method takes de, not the object marker o.'],
        ['iDが。', 'アイディー が。', 'ga marks a grammatical subject. Naming your payment method takes de.']
      ] },
      { s: 'other', t: 'タッチどうぞ。はい、レシートは。', r: 'タッチ どうぞ。はい、レシート わ。', e: '(beep) Tap, go ahead. There — receipt?' },
      { s: 'you', t: '大丈夫です。', r: 'だいじょうぶ です。', e: "I'm fine, no thanks.", wrong: [
        ['大丈夫でした。', 'だいじょうぶ でした。', 'The past tense reports on something already over. You are declining an offer being made right now, so the present daijoubu desu fits.'],
        ['大丈夫をください。', 'だいじょうぶ お ください。', 'daijoubu is a na-adjective describing a state, not a thing to be handed over — it cannot take o with kudasai.']
      ] },
      { s: 'other', t: 'ありがとうございましたー。', r: 'ありがとう ございました ー。', e: 'Thank you!' }
    ]
  },

  // The big konbini/supermarket difference: staff do NOT bag your groceries.
  // Everything gets moved into a fresh basket, and you carry it to the サッ
  // カー台 (bagging counter) yourself — standing at the till packing bags
  // blocks the line. The point card also goes over first, before scanning.
  {
    code: 'supermarket-standard',
    unit: 'shopping',
    title: 'The weekly supermarket shop',
    situation: 'A full trip through a supermarket till — the point card, your own bag, cash, and the bagging counter a konbini never has.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。ポイントカードはお持ちですか。', r: 'いらっしゃいませ。ポイントカード わ おもち です か。', e: 'Welcome. Do you have a point card?' },
      { s: 'you', t: 'はい、あります。', r: 'はい、あります。', e: 'Yes, I do. (hands it over)', wrong: [
        ['はい、います。', 'はい、います。', 'iru is for animate things. A card is inanimate, so its existence is arimasu.'],
        ['はい、持ちます。', 'はい、もちます。', 'mochimasu states an intention to carry one from now on. Confirming you currently have it is arimasu.']
      ] },
      { s: 'other', t: 'お預かりします。', r: 'おあずかり します。', e: 'Thank you. (scans your items into a second basket)' },
      { s: 'other', t: 'レジ袋はご利用ですか。マイバッグはお持ちですか。', r: 'レジぶくろ わ ごりよう です か。マイバッグ わ おもち です か。', e: 'Would you like bags, or do you have your own bag?' },
      { s: 'you', t: 'マイバッグがあるので大丈夫です。', r: 'マイバッグ が ある ので だいじょうぶ です。', e: "I have my own bag, so I'm fine.", wrong: [
        ['マイバッグがあるのに大丈夫です。', 'マイバッグ が ある のに だいじょうぶ です。', 'noni means "even though/despite" and sets up a contrast. Giving the reason you do not need a bag is node, not noni.'],
        ['マイバッグをあるので大丈夫です。', 'マイバッグ お ある ので だいじょうぶ です。', 'aru is intransitive — what exists takes ga, not the object marker o.']
      ] },
      { s: 'other', t: 'かしこまりました。合計2,340円です。お支払い方法は。', r: 'かしこまりました。ごうけい にせんさんびゃくよんじゅう えん です。おしはらい ほうほう わ。', e: "Understood. That's 2,340 yen. How will you be paying?" },
      { s: 'you', t: '現金でお願いします。', r: 'げんきん で おねがいします。', e: 'Cash, please.', wrong: [
        ['現金をお願いします。', 'げんきん お おねがいします。', 'The method of paying takes de, not the object marker o.'],
        ['現金がお願いします。', 'げんきん が おねがいします。', 'onegaishimasu does not take a ga-marked subject here. The means of payment takes de.']
      ] },
      { s: 'other', t: '3,000円お預かりします。お先に500円のお返しです。', r: 'さんぜんえん おあずかり します。おさきに ごひゃくえん の おかえし です。', e: "Out of 3,000 yen — here's 500 yen back first." },
      { s: 'other', t: '残り160円と、カード、レシートのお返しです。', r: 'のこり ひゃくろくじゅう えん と、カード、レシート の おかえし です。', e: 'And the remaining 160 yen, your card, and your receipt.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとう ございます。', e: 'Thank you.', wrong: [
        ['ありがとうございませんでした。', 'ありがとう ございません でした。', 'Negating gozaimasu cancels the meaning of thanks entirely. Never negate arigatou.'],
        ['どうもでした。', 'どうも でした。', 'doumo already stands complete as a closing word on its own — deshita cannot attach onto it.']
      ] },
      { s: 'other', t: '袋詰めは向こうの台でお願いします。カゴはそのままお持ちください。', r: 'ふくろづめ わ むこう の だい で おねがいします。カゴ わ そのまま おもち ください。', e: 'Please bag your things at the counter over there. You can take the basket as it is.' },
      { s: 'you', t: 'はい、わかりました。', r: 'はい、わかりました。', e: 'Okay, got it.', wrong: [
        ['はい、知りました。', 'はい、しりました。', 'shiru is learning some fact for the first time. Confirming you understood an instruction is wakaru.'],
        ['はい、わかります。', 'はい、わかります。', 'The plain non-past states a general ability to understand. Confirming that you have just understood THIS instruction needs the past, wakarimashita.']
      ] },
      { s: 'other', t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you very much.' }
    ]
  },

  // セミセルフ is now standard at big chains: staff scan, you pay at the
  // 精算機 (せいさんき) separately. Foreigners routinely stand at the till
  // holding out cash while staff point at the machine — that handoff is the
  // moment this script trains. Point-card apps get the same "is this okay"
  // question every human point card gets.
  {
    code: 'supermarket-app-seisanki',
    unit: 'shopping',
    title: 'Points app and the payment machine',
    situation: 'A modern supermarket: staff scan your items, but you pay at a separate machine, and your point card lives in an app.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。ポイントカードはお持ちですか。', r: 'いらっしゃいませ。ポイントカード わ おもち です か。', e: 'Welcome. Do you have a point card?' },
      { s: 'you', t: 'アプリなんですけど、いいですか。', r: 'アプリ な ん です けど、いい です か。', e: "It's on the app — is that all right?", wrong: [
        ['アプリだけど、いいですか。', 'アプリ だけど、いい です か。', 'dakedo is the plain, casual form. Talking to shop staff calls for the polite nan desu kedo, not the plain copula stacked with kedo.'],
        ['アプリなのに、いいですか。', 'アプリ な のに、いい です か。', 'noni means "even though," setting up an unexpected contrast. Simply explaining your situation before asking uses kedo, not noni.']
      ] },
      { s: 'other', t: 'はい、大丈夫ですよ。バーコードの画面をお願いします。', r: 'はい、だいじょうぶ です よ。バーコード の がめん お おねがいします。', e: 'Yes, that works. Please show me the barcode screen.' },
      { s: 'you', t: 'これですか。', r: 'これ です か。', e: '(shows screen) This one?', wrong: [
        ['これがですか。', 'これ が です か。', 'ga cannot sit directly before desu with nothing else in the sentence. A bare confirmation is simply kore desu ka.'],
        ['これをですか。', 'これ お です か。', 'The object marker o needs a verb to attach to. A bare confirmation question is kore desu ka, not kore o desu ka.']
      ] },
      { s: 'other', t: 'はい、頂戴します。レジ袋はご利用ですか。', r: 'はい、ちょうだい します。レジぶくろ わ ごりよう です か。', e: '(beep) Yes, thank you. Will you need bags?' },
      { s: 'you', t: '大きいのを一枚お願いします。', r: 'おおきい の お いちまい おねがいします。', e: 'One large one, please.', wrong: [
        ['大きいのが一枚お願いします。', 'おおきい の が いちまい おねがいします。', 'What you are requesting is the object of an implicit onegaishimasu, so it takes o, not ga.'],
        ['大きいを一枚お願いします。', 'おおきい お いちまい おねがいします。', 'ookii is an adjective and cannot stand for the thing itself. no makes it "the big one" before it can take o.']
      ] },
      { s: 'other', t: 'かしこまりました。合計1,858円です。お支払いは、あちらの精算機でお願いします。', r: 'かしこまりました。ごうけい せんはっぴゃくごじゅうはち えん です。おしはらい わ、あちら の せいさんき で おねがいします。', e: "Understood. That's 1,858 yen. Please pay at the machine over there." },
      { s: 'you', t: 'あ、あの機械ですか。', r: 'あ、あの きかい です か。', e: 'Oh — that machine there?', wrong: [
        ['あ、この機械ですか。', 'あ、この きかい です か。', 'kono points at something near YOU. The machine is off at a distance from both of you, so ano.'],
        ['あ、その機械ですか。', 'あ、その きかい です か。', 'sono points at something near the LISTENER. A machine visible in the distance from both of you takes ano.']
      ] },
      { s: 'other', t: 'はい、こちらのレシートのバーコードをかざしてから、お支払い方法をお選びください。', r: 'はい、こちら の レシート の バーコード お かざして から、おしはらい ほうほう お おえらび ください。', e: 'Yes — hold this receipt\'s barcode up to it, then choose your payment method.' },
      { s: 'you', t: 'わかりました。ありがとうございます。', r: 'わかりました。ありがとう ございます。', e: 'Got it. Thank you.', wrong: [
        ['わかります。ありがとうございます。', 'わかります。ありがとう ございます。', 'The plain non-past states a general ability to understand. Confirming you have just understood these instructions needs the past, wakarimashita.'],
        ['知りました。ありがとうございます。', 'しりました。ありがとう ございます。', 'shiru is learning a new fact for the first time. Confirming you understood spoken instructions is wakaru.']
      ] },
      { s: 'other', t: 'お支払い方法を選択してください。現金を投入してください。', r: 'おしはらい ほうほう お せんたく して ください。げんきん お とうにゅう して ください。', e: '(machine) Please select your payment method. … Please insert your cash.' },
      { s: 'other', t: 'おつりとレシートをお取りください。ありがとうございました。', r: 'おつり と レシート お おとり ください。ありがとう ございました。', e: '(machine) Please take your change and receipt. Thank you very much.' }
    ]
  },

  // The call button (呼び出しボタン) plus 〜が読み取れなくて is the survival
  // kit for self-checkout — the trailing te-form ("it won't scan, so...") is
  // exactly how natives report a problem. Bags here are self-declared on
  // screen, and alcohol locks the machine for a staff age-check, unmentioned
  // in this run but worth knowing exists.
  {
    code: 'supermarket-self-checkout',
    unit: 'shopping',
    title: 'Self-checkout, calling staff over',
    situation: 'A self-checkout register — you scan everything alone, one barcode will not read, and you call staff over before paying.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。バーコードを読み取ってください。', r: 'いらっしゃいませ。バーコード お よみとって ください。', e: 'Welcome. Please scan your barcodes.' },
      { s: 'you', t: 'あれ、読み取れない。', r: 'あれ、よみとれない。', e: "(scanning) …Huh, it won't scan.", wrong: [
        ['あれ、読み取らない。', 'あれ、よみとらない。', 'yomitoranai is the plain negative of the transitive "to scan." Reporting that the machine is unable to pick it up needs the potential form, yomitorenai.'],
        ['あれ、読み込まない。', 'あれ、よみこまない。', 'yomikomu means "to load/read data in," not the everyday word for a scanner reading a barcode, which is yomitoru.']
      ] },
      { s: 'you', t: 'すみません。', r: 'すみません。', e: '(presses the call button) Excuse me.', wrong: [
        ['すみませんでした。', 'すみません でした。', 'The past tense apologizes for something already finished. Calling someone over right now uses the plain sumimasen.'],
        ['すみませんが。', 'すみません が。', 'ga here would trail off expecting you to continue with a request. A simple attention-getter to call staff over is just sumimasen on its own.']
      ] },
      { s: 'other', t: 'はい、どうされましたか。', r: 'はい、どう されました か。', e: 'Yes, what seems to be the problem?' },
      { s: 'you', t: 'これ、バーコードが読み取れなくて。', r: 'これ、バーコード が よみとれなくて。', e: "This one — the barcode won't scan.", wrong: [
        ['これ、バーコードを読み取れなくて。', 'これ、バーコード お よみとれなくて。', 'yomitoreru is a potential form — the barcode that fails to be picked up is the subject, so ga.'],
        ['これ、バーコードが読み取らなくて。', 'これ、バーコード が よみとらなくて。', 'yomitoranai is the plain negative, not about ability. Reporting that scanning is not POSSIBLE needs the potential, yomitorenai.']
      ] },
      { s: 'other', t: '失礼します。こちらで読み取りますね。はい、入りました。', r: 'しつれい します。こちら で よみとります ね。はい、はいりました。', e: "Excuse me a moment. I'll scan it on this side. …There, it's in." },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとう ございます。', e: 'Thank you.', wrong: [
        ['ありがとうございませんでした。', 'ありがとう ございません でした。', 'Negating gozaimasu cancels the meaning of thanks entirely. Never negate arigatou.'],
        ['どうもでした。', 'どうも でした。', 'doumo already stands complete as a closing word on its own — deshita cannot attach onto it.']
      ] },
      { s: 'other', t: 'レジ袋が必要でしたら、画面の「レジ袋」を押して枚数を選んでください。', r: 'レジぶくろ が ひつよう でしたら、がめん の「レジぶくろ」お おして まいすう お えらんで ください。', e: 'If you need bags, press "bag" on the screen and choose how many.' },
      { s: 'you', t: 'はい。', r: 'はい。', e: 'Okay. (selects one bag)', wrong: [
        ['はいです。', 'はい です。', 'hai is already a complete word on its own. desu cannot attach directly onto it like that.'],
        ['そうです。', 'そう です。', 'sou desu confirms a fact. A quick response showing you will comply with an instruction is just hai.']
      ] },
      { s: 'other', t: 'お支払い方法を選択してください。', r: 'おしはらい ほうほう お せんたく して ください。', e: '(machine) Please select your payment method.' },
      { s: 'you', t: 'スイカで。', r: 'スイカ で。', e: '(taps "e-money") With Suica.', wrong: [
        ['スイカを。', 'スイカ お。', 'The payment method takes de, not the object marker o.'],
        ['スイカが。', 'スイカ が。', 'ga marks a grammatical subject. Naming your payment method takes de.']
      ] },
      { s: 'other', t: 'カードをタッチしてください。お支払いが完了しました。レシートをお取りください。', r: 'カード お タッチ して ください。おしはらい が かんりょう しました。レシート お おとり ください。', e: '(machine) Please tap your card. …Payment complete. Please take your receipt.' },
      { s: 'other', t: 'ありがとうございました。', r: 'ありがとう ございました。', e: 'Thank you very much.' }
    ]
  }
]
