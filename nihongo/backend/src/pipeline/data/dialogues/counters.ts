import type { Dialogue } from './types.js'

/**
 * Ticket windows, IC card gates, platforms, delays, lost property, the post
 * office, takkyubin, the bank ATM, the pharmacy counter -- the errands where
 * a transaction goes sideways and staff offer a way out. A three-turn
 * dialogue can teach "a ticket to Shin-Osaka, please" but never reaches the
 * moment staff counter-offer a fix (満席です。10時21分発でしたらいかがですか) --
 * the actual skill, since the easy request rarely goes as planned. These run
 * long enough to hit that pivot and make the learner answer it, and long
 * enough to also carry the machine and announcement lines (IC charge
 * machines, platform announcements, ATM prompts) a real errand is full of --
 * heard, not spoken, so they stay 'other' turns the learner never produces.
 */
export const COUNTERS: Dialogue[] = [
  // script: ticket-window-reserved -- same-day Shinkansen ticket to Shin-Osaka, first train full.
  // notes: two tickets (乗車券+特急券) go into the gate together; 指定席/自由席 and 片道/往復
  // come back to back with little pause; 満席 is the pivot -- the counter-offer expects an
  // immediate yes/no, and hesitation reads as "no".
  {
    code: 'station-ticket-reserved',
    unit: 'station',
    title: 'Buying a reserved Shinkansen ticket',
    situation: 'At the ticket window, buying a same-day Shinkansen ticket to Shin-Osaka. The first train is fully booked.',
    turns: [
      { s: 'other', t: '次にお並びの方、どうぞ。', r: 'つぎ に おならび の かた、どうぞ。', e: 'Next in line, please.' },
      { s: 'you', t: 'すみません、新大阪までの新幹線のきっぷをお願いします。', r: 'すみません、しんおおさか まで の しんかんせん の きっぷ お おねがいします。', e: 'Excuse me, I would like a Shinkansen ticket to Shin-Osaka.', wrong: [
        ['新大阪までの新幹線のきっぷがお願いします。', 'しんおおさか まで の しんかんせん の きっぷ が おねがいします。', 'onegai shimasu takes the thing requested with o, not ga -- you are asking for the ticket.'],
        ['新大阪までの新幹線のきっぷにお願いします。', 'しんおおさか まで の しんかんせん の きっぷ に おねがいします。', 'ni marks a target for verbs like suru, not the direct object of onegai -- the ticket itself needs o.']
      ] },
      { s: 'other', t: 'ご利用日はいつですか。', r: 'ごりよう び わ いつ です か。', e: 'What date will you be traveling?' },
      { s: 'you', t: '今日です。できれば10時ごろのがいいです。', r: 'きょう です。できれば じゅうじ ごろ の が いい です。', e: 'Today. Around ten would be good if possible.', wrong: [
        ['今日です。できれば10時ごろのをいいです。', 'きょう です。できれば じゅうじ ごろ の お いい です。', 'ii is an adjective -- what is good or preferred takes ga, not o.'],
        ['今日です。できれば10時ごろのでいいです。', 'きょう です。できれば じゅうじ ごろ の で いい です。', 'de ii desu settles for something, meaning that will do. Stating an actual preference is ga ii desu.']
      ] },
      { s: 'other', t: '指定席と自由席、どちらになさいますか。', r: 'していせき と じゆうせき、どちら に なさいます か。', e: 'Reserved or non-reserved seating -- which would you like?' },
      { s: 'you', t: '指定席で、片道でお願いします。', r: 'していせき で、かたみち で おねがいします。', e: 'Reserved seat, one way, please.', wrong: [
        ['指定席に、片道でお願いします。', 'していせき に、かたみち で おねがいします。', 'ni marks a destination or a suru-target, not the option you are choosing -- choosing an item from a menu of options takes de.'],
        ['指定席が、片道でお願いします。', 'していせき が、かたみち で おねがいします。', 'ga would make the reserved seat a new subject. You are naming your choice in response to a question, which takes de.']
      ] },
      { s: 'other', t: '10時発ののぞみ217号ですが、あいにく満席です。10時21分発でしたら窓側のお席がご用意できますが、いかがですか。', r: 'じゅうじ はつ の のぞみ にひゃくじゅうなな ごう です が、あいにく まんせき です。じゅうじ にじゅういっぷん はつ でしたら まどがわ の おせき が ごようい できます が、いかが です か。', e: 'The 10:00 Nozomi 217 is unfortunately fully booked. On the 10:21 I could arrange a window seat -- how does that sound?' },
      { s: 'you', t: 'じゃあ、それで、窓側でお願いします。', r: 'じゃあ、それ で、まどがわ で おねがいします。', e: 'Then I will take that one -- window seat, please.', wrong: [
        ['じゃあ、それが、窓側でお願いします。', 'じゃあ、それ が、まどがわ で おねがいします。', 'ga would make sore a new subject out of nowhere. Accepting the option they just offered takes de, the same as when you chose seating.'],
        ['じゃあ、それでいいです。窓側でお願いします。', 'じゃあ、それ で いい です。まどがわ で おねがいします。', 'de ii desu means settling, as in that will do. After a helpful counter-offer, staff read hesitation as declining -- say de onegaishimasu to actually accept.']
      ] },
      { s: 'other', t: 'かしこまりました。新大阪まで、おひとり様、片道、指定席で14,720円です。お支払いはいかがなさいますか。', r: 'かしこまりました。しんおおさか まで、おひとりさま、かたみち、していせき で いちまん よんせん ななひゃく にじゅう えん です。おしはらい わ いかが なさいます か。', e: 'Certainly. To Shin-Osaka, one person, one way, reserved seat -- that is 14,720 yen. How would you like to pay?' },
      { s: 'you', t: 'カードでお願いします。', r: 'カード で おねがいします。', e: 'By card, please.', wrong: [
        ['カードをお願いします。', 'カード お おねがいします。', 'The means of payment takes de, not o -- o would suggest the card itself is being handed over or requested.'],
        ['カードにお願いします。', 'カード に おねがいします。', 'ni marks a target or destination, not a means of payment. The way you are paying takes de.']
      ] },
      { s: 'other', t: 'こちら、乗車券と特急券です。10時21分発、16号車8番A席、東京駅からのご乗車です。', r: 'こちら、じょうしゃけん と とっきゅうけん です。じゅうじ にじゅういっぷん はつ、じゅうろく ごうしゃ はちばん エーせき、とうきょうえき から の ごじょうしゃ です。', e: 'Here is your base fare ticket and express ticket. Departing 10:21, car 16, seat 8-A, boarding at Tokyo Station.' },
      { s: 'you', t: '乗り換えはありますか。', r: 'のりかえ わ あります か。', e: 'Are there any transfers?', wrong: [
        ['乗り換えを乗りますか。', 'のりかえ お のります か。', 'noru, to board, takes ni for the vehicle, not o -- and this question is about whether transfers exist, not about riding one.'],
        ['乗り換えがいますか。', 'のりかえ が います か。', 'iru is for animate things. Whether transfers exist is arimasu ka.']
      ] },
      { s: 'other', t: '新大阪まで直通ですので、乗り換えはございません。', r: 'しんおおさか まで ちょくつう です ので、のりかえ わ ございません。', e: 'It runs direct to Shin-Osaka, so there are no transfers.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you very much.', wrong: [
        ['どういたしまして。', 'どういたしまして。', 'That is what the other person says in reply to thanks -- you are the one thanking them.'],
        ['どうもすみません。', 'どうも すみません。', 'sumimasen apologizes or calls for attention. Thanking them for help already given is arigatou gozaimasu.']
      ] }
    ]
  },
  // script: ic-card-gate-charge -- IC card rejected at the gate (残高不足), charged at a machine.
  // notes: this is the entry-side case (charge outside the gates); exit-side short balance uses the
  // のりこし精算機 inside instead -- a different flow, not blended here. The gate never held the
  // card. Charge machines are cash-only at most stations.
  {
    code: 'station-ic-charge',
    unit: 'station',
    title: 'Insufficient balance at the gate',
    situation: 'Your IC card is rejected at the ticket gate and you need to charge it.',
    turns: [
      { s: 'other', t: 'ピンポーン。(表示:「残高不足です。チャージしてください。」)', r: 'ぴんぽーん。(ひょうじ:「ざんだか ぶそく です。チャージ して ください。」)', e: 'Error chime -- the display reads: Insufficient balance. Please charge your card.' },
      { s: 'you', t: 'すみません、改札で引っかかってしまって。残高不足って出たんですが。', r: 'すみません、かいさつ で ひっかかって しまって。ざんだか ぶそく って でた ん です が。', e: 'Excuse me, I got stopped at the gate -- it said insufficient balance.', wrong: [
        ['すみません、改札を引っかかってしまって。', 'すみません、かいさつ お ひっかかって しまって。', 'hikkakaru is intransitive -- the place it happened takes de, not o.'],
        ['すみません、改札で引っかけてしまって。', 'すみません、かいさつ で ひっかけて しまって。', 'hikkakeru means to snag or catch something yourself. Getting stopped by the gate is the intransitive hikkakaru.']
      ] },
      { s: 'other', t: '残高が足りないようですね。そちらの券売機でチャージできますよ。', r: 'ざんだか が たりない よう です ね。そちら の けんばいき で チャージ できます よ。', e: 'Looks like your balance is short. You can charge it at that ticket machine.' },
      { s: 'you', t: '券売機はどこですか。', r: 'けんばいき わ どこ です か。', e: 'Where is the ticket machine?', wrong: [
        ['券売機がどこですか。', 'けんばいき が どこ です か。', 'The ticket machine is your topic here, so wa, not ga.'],
        ['券売機はどこにいますか。', 'けんばいき わ どこ に います か。', 'iru is for animate things. A machine takes doko desu ka, the same as any object.']
      ] },
      { s: 'other', t: '改札を出て右手です。ピンク色のチャージ専用機もございます。', r: 'かいさつ お でて みぎて です。ピンクいろ の チャージせんようき も ございます。', e: 'Out the gate and to your right. There is also a pink charge-only machine.' },
      { s: 'other', t: 'ICカードを入れてください。', r: 'アイシー カード お いれて ください。', e: 'Please insert your IC card.' },
      { s: 'other', t: 'チャージ金額をお選びください。', r: 'チャージ きんがく お おえらび ください。', e: 'Please select the amount to charge.' },
      { s: 'other', t: '紙幣を入れてください。', r: 'しへい お いれて ください。', e: 'Please insert your bills.' },
      { s: 'other', t: 'チャージが完了しました。カードをお取りください。お忘れ物のないよう、ご注意ください。', r: 'チャージ が かんりょう しました。カード お おとり ください。おわすれもの の ない よう、ごちゅうい ください。', e: 'Charging complete. Please take your card. Please make sure you have not left anything behind.' },
      { s: 'you', t: 'すみません、これでもう通れますか。', r: 'すみません、これ で もう とおれます か。', e: 'Excuse me, can I go through now with this?', wrong: [
        ['すみません、これがもう通れますか。', 'すみません、これ が もう とおれます か。', 'The means, with this, takes de. ga would make this the thing doing the passing.'],
        ['すみません、これでもう通りますか。', 'すみません、これ で もう とおります か。', 'toorimasu asks whether you will pass, as a plan. Asking whether it is now possible needs the potential form, tooremasu.']
      ] },
      { s: 'other', t: 'はい、大丈夫です。そのままタッチしてお通りください。', r: 'はい、だいじょうぶ です。そのまま タッチ して おとおり ください。', e: 'Yes, you are all set. Just tap and go through.' }
    ]
  },
  // script: which-platform-local -- private-line station, small stop that express trains skip.
  // notes: train-type ladders differ by company (do not blend); "急行は止まりません" is said in
  // passing at speed and is a prime listening-focus point; 〜つ目 is how locals actually confirm stop counts.
  {
    code: 'station-platform-type',
    unit: 'station',
    title: 'Finding the right platform and train type',
    situation: 'At a private-line station, you need a small stop that express trains skip.',
    turns: [
      { s: 'you', t: 'すみません、豪徳寺に行きたいんですが、何番線ですか。', r: 'すみません、ごうとくじ に いきたい ん です が、なんばんせん です か。', e: 'Excuse me, I want to go to Gotokuji -- which platform is it?', wrong: [
        ['すみません、豪徳寺で行きたいんですが、何番線ですか。', 'すみません、ごうとくじ で いきたい ん です が、なんばんせん です か。', 'de marks where an action takes place. Where you are heading takes ni.'],
        ['すみません、豪徳寺を行きたいんですが、何番線ですか。', 'すみません、ごうとくじ お いきたい ん です が、なんばんせん です か。', 'o marks a path you move through, like a street you walk along -- a destination takes ni.']
      ] },
      { s: 'other', t: '豪徳寺ですね。3番線からです。ただ、急行は止まりませんので、各駅停車にお乗りください。', r: 'ごうとくじ です ね。さんばんせん から です。ただ、きゅうこう わ とまりません ので、かくえきていしゃ に おのり ください。', e: 'Gotokuji -- that is from platform 3. But express trains do not stop there, so please take a local.' },
      { s: 'you', t: '今ホームに止まっている電車は各駅停車ですか。', r: 'いま ホーム に とまって いる でんしゃ わ かくえきていしゃ です か。', e: 'Is the train stopped at the platform now a local?', wrong: [
        ['今ホームに止めている電車は各駅停車ですか。', 'いま ホーム に とめて いる でんしゃ わ かくえきていしゃ です か。', 'tomeru is transitive -- someone stopping something. A train stopping by itself is the intransitive tomaru.'],
        ['今ホームに止まっている電車が各駅停車ですか。', 'いま ホーム に とまって いる でんしゃ が かくえきていしゃ です か。', 'You already picked the train out with the relative clause -- it is the topic now, so wa, not ga.']
      ] },
      { s: 'other', t: 'いえ、あちらは快速急行です。豪徳寺には止まりません。次の各駅停車は4分後に参ります。', r: 'いえ、あちら わ かいそくきゅうこう です。ごうとくじ に わ とまりません。つぎ の かくえきていしゃ わ よんぷんご に まいります。', e: 'No, that one is a rapid express. It does not stop at Gotokuji. The next local arrives in four minutes.' },
      { s: 'you', t: '急行と各駅停車って、料金は同じですか。', r: 'きゅうこう と かくえきていしゃ って、りょうきん わ おなじ です か。', e: 'Is the fare the same for express and local?', wrong: [
        ['急行と各駅停車って、料金と同じですか。', 'きゅうこう と かくえきていしゃ って、りょうきん と おなじ です か。', 'to after onaji marks what something is compared with. Here the fare is the subject being described, so wa.'],
        ['急行と各駅停車って、料金を同じですか。', 'きゅうこう と かくえきていしゃ って、りょうきん お おなじ です か。', 'onaji is a noun or adjective, not a verb -- it takes no object. What is the same takes wa or ga.']
      ] },
      { s: 'other', t: 'はい、同じです。特急ロマンスカーだけ、別に特急券が必要です。', r: 'はい、おなじ です。とっきゅう ロマンスカー だけ、べつ に とっきゅうけん が ひつよう です。', e: 'Yes, the same. Only the Romancecar limited express needs a separate limited-express ticket.' },
      { s: 'other', t: 'まもなく3番線に、各駅停車 本厚木行きが参ります。危ないですから、黄色い点字ブロックまでお下がりください。', r: 'まもなく さんばんせん に、かくえきていしゃ ほんあつぎ ゆき が まいります。あぶない です から、きいろい てんじ ブロック まで おさがり ください。', e: 'The local train bound for Hon-Atsugi will soon arrive at platform 3. For your safety, please stand back behind the yellow tactile paving.' },
      { s: 'you', t: 'すみません、これ、豪徳寺に止まりますよね。', r: 'すみません、これ、ごうとくじ に とまります よ ね。', e: 'Excuse me, this one stops at Gotokuji, right?', wrong: [
        ['すみません、これ、豪徳寺で止まりますよね。', 'すみません、これ、ごうとくじ で とまります よ ね。', 'de marks where an action happens. The station the train comes to rest at takes ni.'],
        ['すみません、これ、豪徳寺を止まりますよね。', 'すみません、これ、ごうとくじ お とまります よ ね。', 'o would mark a space passed through, not the stop itself -- the station it halts at takes ni.']
      ] },
      { s: 'other', t: 'はい、各駅停車ですので、全部の駅に止まりますよ。二つ目です。', r: 'はい、かくえきていしゃ です ので、ぜんぶ の えき に とまります よ。ふたつめ です。', e: 'Yes, it is a local, so it stops at every station. It is the second stop.' },
      { s: 'other', t: '次は豪徳寺、豪徳寺です。お出口は右側です。', r: 'つぎ わ ごうとくじ、ごうとくじ です。おでぐち わ みぎがわ です。', e: 'Next stop, Gotokuji, Gotokuji. The doors will open on the right.' }
    ]
  },
  // script: line-suspended-jinshin -- morning commute, line suspended after a 人身事故.
  // notes: the IC-charge exclusion from 振替輸送 (turn 7) is the single most common trap, since
  // nearly all foreigners ride on IC charge; 運転を見合わせております (suspended) vs 遅れております
  // (delayed) call for different actions; 遅延証明書 is real currency at workplaces and schools.
  {
    code: 'station-line-suspended',
    unit: 'station',
    title: 'A suspended line during the morning commute',
    situation: 'The line is suspended after an incident and you ask staff about alternatives.',
    turns: [
      { s: 'other', t: 'ただいま、〇〇線は、△△駅で発生しました人身事故の影響により、上下線で運転を見合わせております。運転再開は9時30分ごろを見込んでおります。お急ぎのところ、大変ご迷惑をおかけいたします。', r: 'ただいま、まるまるせん わ、さんかくさんかく えき で はっせい しました じんしんじこ の えいきょう に より、じょうげせん で うんてん お みあわせて おります。うんてん さいかい わ くじ さんじゅっぷん ごろ お みこんで おります。おいそぎ の ところ、たいへん ごめいわく お おかけ いたします。', e: 'The __ Line is currently suspended in both directions due to a person-involved incident at __ Station. Resumption is expected around 9:30. We deeply apologize for the inconvenience while you are in a hurry.' },
      { s: 'you', t: 'すみません、渋谷まで行きたいんですが、動いてないんですか。', r: 'すみません、しぶや まで いきたい ん です が、うごいて ない ん です か。', e: 'Excuse me, I am trying to get to Shibuya -- is nothing running?', wrong: [
        ['すみません、渋谷まで行きたいんですが、動かないんですか。', 'すみません、しぶや まで いきたい ん です が、うごかない ん です か。', 'ugokanai is a plain refusal to move, like a stuck object. Asking about the current suspended state uses the ongoing form, ugoite nai.'],
        ['すみません、渋谷まで行きたいんですが、動いてありませんか。', 'すみません、しぶや まで いきたい ん です が、うごいて ありません か。', 'te aru describes a deliberately arranged result of a transitive verb. A train not running is described with the intransitive continuing form, ugoite iru.']
      ] },
      { s: 'other', t: 'はい、ただいま運転を見合わせております。再開まで30分ほどかかる見込みです。お急ぎでしたら、振替輸送をご利用いただけます。', r: 'はい、ただいま うんてん お みあわせて おります。さいかい まで さんじゅっぷん ほど かかる みこみ です。おいそぎ でしたら、ふりかえゆそう お ごりよう いただけます。', e: 'That is right, service is currently suspended. It is expected to take about 30 more minutes to resume. If you are in a hurry, you can use the transfer service.' },
      { s: 'you', t: '振替輸送って、どうやって使うんですか。', r: 'ふりかえゆそう って、どうやって つかう ん です か。', e: 'This transfer service -- how do I use it?', wrong: [
        ['振替輸送が、どうやって使うんですか。', 'ふりかえゆそう が、どうやって つかう ん です か。', 'tsukau needs an object, marked with o -- the transfer service is the thing used, not the one using it, so ga is wrong here.'],
        ['振替輸送って、どうやって使ってるんですか。', 'ふりかえゆそう って、どうやって つかって る ん です か。', 'te iru asks about an ongoing or habitual action. Asking how to do something for the first time needs the plain form, tsukau n desu ka.']
      ] },
      { s: 'other', t: 'きっぷか定期券をお持ちでしたら、そのまま△△線をご利用いただけます。', r: 'きっぷ か ていきけん お おもち でしたら、そのまま さんかくさんかくせん お ごりよう いただけます。', e: 'If you have a paper ticket or a commuter pass, you can use the __ Line as is.' },
      { s: 'you', t: 'Suicaのチャージで乗ってるんですけど…', r: 'スイカ の チャージ で のって る ん です けど…', e: 'I am riding on Suica charge, though.', wrong: [
        ['Suicaのチャージが乗ってるんですけど…', 'すいか の チャージ が のって る ん です けど…', 'The fare method you are riding on takes de, not ga -- ga would make the Suica charge itself the one doing the riding.'],
        ['Suicaのチャージを乗ってるんですけど…', 'すいか の チャージ お のって る ん です けど…', 'noru pairs with ni for the vehicle you board. The fare or means you are using takes de, not o.']
      ] },
      { s: 'other', t: 'ICカードのチャージ残高でのご乗車は、振替輸送の対象外なんです。申し訳ございません。定期区間が入っていれば対象になります。', r: 'アイシー カード の チャージ ざんだか で の ごじょうしゃ わ、ふりかえゆそう の たいしょうがい な ん です。もうしわけ ございません。ていき くかん が はいって いれば たいしょう に なります。', e: 'Riding on IC card charge balance is not covered by the transfer service, I am afraid. It is covered if a commuter-pass section is included.' },
      { s: 'you', t: 'わかりました。あと、遅延証明書ってもらえますか。', r: 'わかりました。あと、ちえん しょうめいしょ って もらえます か。', e: 'I see. Also, can I get a delay certificate?', wrong: [
        ['わかりました。あと、遅延証明書ってあげますか。', 'わかりました。あと、ちえん しょうめいしょ って あげます か。', 'ageru is giving to someone else. Asking to receive something for yourself is moraeru.'],
        ['わかりました。あと、遅延証明書って、もらいますか。', 'わかりました。あと、ちえん しょうめいしょ って、もらいます か。', 'moraimasu ka asks whether they will receive it. A polite request to receive something yourself is the potential form, moraemasu ka.']
      ] },
      { s: 'other', t: 'はい、改札横で配布しております。ウェブサイトからもダウンロードいただけます。', r: 'はい、かいさつ よこ で はいふ して おります。ウェブサイト から も ダウンロード いただけます。', e: 'Yes, we are handing them out beside the ticket gate. You can also download one from our website.' },
      { s: 'you', t: 'ありがとうございます。', r: 'ありがとうございます。', e: 'Thank you.', wrong: [
        ['どういたしまして。', 'どういたしまして。', 'That is what the other person says in reply to thanks -- you are the one thanking them.'],
        ['どうもすみません。', 'どうも すみません。', 'sumimasen apologizes or calls for attention. Thanking them for help already given is arigatou gozaimasu.']
      ] },
      { s: 'other', t: '〇〇線は、9時35分ごろ、運転を再開いたしました。なお、ダイヤが大幅に乱れております。', r: 'まるまるせん わ、くじ さんじゅうごふん ごろ、うんてん お さいかい いたしました。なお、ダイヤ が おおはば に みだれて おります。', e: 'The __ Line resumed service at around 9:35. Please note that the schedule remains significantly disrupted.' }
    ]
  },
  // script: lost-item-center -- a paper bag left on the Yamanote Line, reported at お忘れ物承り所.
  // notes: staff verify ownership by asking YOU to describe the contents before confirming they have
  // it -- the 中身 question comes before any confirmation; the item moves to a central lost-property
  // office after a few days, which is time-sensitive; pickup wants photo ID.
  {
    code: 'station-lost-property',
    unit: 'station',
    title: 'Reporting something left on the train',
    situation: 'You left a paper bag on the train and report it at the lost property window.',
    turns: [
      { s: 'other', t: 'こんにちは。お忘れ物ですか。', r: 'こんにちは。おわすれもの です か。', e: 'Hello. Did you lose something?' },
      { s: 'you', t: 'はい、電車の中に紙袋を忘れてしまって。', r: 'はい、でんしゃ の なか に かみぶくろ お わすれて しまって。', e: 'Yes, I left a paper bag on the train.', wrong: [
        ['はい、電車の中で紙袋を忘れてしまって。', 'はい、でんしゃ の なか で かみぶくろ お わすれて しまって。', 'de marks where an action takes place. Where the bag ended up staying takes ni.'],
        ['はい、電車の中に紙袋が忘れてしまって。', 'はい、でんしゃ の なか に かみぶくろ が わすれて しまって。', 'wasureru is transitive -- what you forgot takes o, not ga.']
      ] },
      { s: 'other', t: 'いつ、どの路線かお分かりになりますか。', r: 'いつ、どの ろせん か おわかり に なります か。', e: 'Do you know when, and which line?' },
      { s: 'you', t: '今日の午後2時ごろ、山手線に乗っていました。たしか外回りでした。', r: 'きょう の ごご にじ ごろ、やまのてせん に のって いました。たしか そとまわり でした。', e: 'Around 2 p.m. today, I was riding the Yamanote Line. The outer loop, I think.', wrong: [
        ['今日の午後2時ごろ、山手線が乗っていました。たしか外回りでした。', 'きょう の ごご にじ ごろ、やまのてせん が のって いました。たしか そとまわり でした。', 'noru pairs with ni for the vehicle boarded -- ga would make the line itself the one doing the riding.'],
        ['今日の午後2時ごろ、山手線を乗っていました。たしか外回りでした。', 'きょう の ごご にじ ごろ、やまのてせん お のって いました。たしか そとまわり でした。', 'The vehicle you board with noru takes ni, not o.']
      ] },
      { s: 'other', t: 'どちらの駅で降りられましたか。', r: 'どちら の えき で おりられました か。', e: 'Which station did you get off at?' },
      { s: 'you', t: '新宿です。先頭の方の車両に乗っていました。', r: 'しんじゅく です。せんとう の ほう の しゃりょう に のって いました。', e: 'Shinjuku. I was riding in one of the front cars.', wrong: [
        ['新宿です。先頭の方の車両で乗っていました。', 'しんじゅく です。せんとう の ほう の しゃりょう で のって いました。', 'The car you were riding in takes ni with noru, not de.'],
        ['新宿です。先頭の方の車両に乗りました。', 'しんじゅく です。せんとう の ほう の しゃりょう に のりました。', 'norimashita states a completed one-off action. Describing where you were riding during the whole trip needs the ongoing form, notte imashita.']
      ] },
      { s: 'other', t: '袋の特徴と、中身を教えていただけますか。', r: 'ふくろ の とくちょう と、なかみ お おしえて いただけます か。', e: 'Can you tell me what the bag looks like, and what is inside it?' },
      { s: 'you', t: '白い紙袋で、中に本が2冊と、折りたたみ傘が入っています。', r: 'しろい かみぶくろ で、なか に ほん が にさつ と、おりたたみがさ が はいって います。', e: 'A white paper bag, with two books and a folding umbrella inside.', wrong: [
        ['白い紙袋で、中に本が2冊と、折りたたみ傘を入っています。', 'しろい かみぶくろ で、なか に ほん が にさつ と、おりたたみがさ お はいって います。', 'hairu is intransitive -- what is inside takes ga. o would need the transitive ireru instead.'],
        ['白い紙袋に、中に本が2冊と、折りたたみ傘が入っています。', 'しろい かみぶくろ に、なか に ほん が にさつ と、おりたたみがさ が はいって います。', 'de here links the description, a white paper bag, to what follows. ni would wrongly mark the bag as a location or target instead.']
      ] },
      { s: 'other', t: '少々お待ちください。お調べいたします。……ございました。品川駅で保管されています。', r: 'しょうしょう おまち ください。おしらべ いたします。……ございました。しながわえき で ほかん されて います。', e: 'One moment, please, I will check. ... Here it is. It is being kept at Shinagawa Station.' },
      { s: 'you', t: 'よかった!取りに来ればいいですか。', r: 'よかった!とり に くれば いい です か。', e: 'Oh, thank goodness! Should I go pick it up?', wrong: [
        ['よかった!取りに来ればいいですか。', 'よかった!とり に くれば いい です か。', 'kuru is movement toward here. Going to Shinagawa to get it is iku, not kuru.'],
        ['よかった!取りに行ってもいいですか。', 'よかった!とり に いって も いい です か。', 'te mo ii desu ka asks for permission. Asking whether going is the right or sufficient thing to do is ba ii desu ka.']
      ] },
      { s: 'other', t: 'はい、本日中でしたら品川駅の窓口でお受け取りいただけます。明日以降ですと、お忘れ物センターに移送されます。お受け取りの際は、ご本人確認できるものをお持ちください。', r: 'はい、ほんじつちゅう でしたら しながわえき の まどぐち で おうけとり いただけます。あした いこう です と、おわすれもの センター に いそう されます。おうけとり の さい わ、ごほんにん かくにん できる もの お おもち ください。', e: 'Yes, if it is within today you can collect it at the Shinagawa Station window. From tomorrow onward it gets transferred to the Lost and Found Center. When you collect it, please bring something that can confirm your identity.' },
      { s: 'you', t: 'わかりました。ありがとうございます!', r: 'わかりました。ありがとうございます!', e: 'Got it. Thank you so much!', wrong: [
        ['わかりました。ありがとうございませんでした!', 'わかりました。ありがとう ございません でした!', 'arigatou gozaimasu is a fixed thanking phrase -- it does not take a negative form. Negating it does not mean no thanks, it just breaks the phrase.'],
        ['わかりました。どういたしまして!', 'わかりました。どういたしまして!', 'That is what the other person says in reply to being thanked -- you are the one thanking them.']
      ] }
    ]
  },
  // script: post-office-parcel -- a box of books and clothes sent to Osaka at a Japan Post counter.
  // notes: the contents/hazard question comes fast, and batteries are the item that actually derails
  // shipments; 定形外 vs ゆうパック (cheaper vs tracked/insured) is the real decision staff hand you;
  // the recipient goes on the large section of the slip, the sender on the small one.
  {
    code: 'services-post-parcel',
    unit: 'services',
    title: 'Sending a parcel at the post office',
    situation: 'You are sending a box of books and clothes to Osaka.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。次の方、どうぞ。', r: 'いらっしゃいませ。つぎ の かた、どうぞ。', e: 'Welcome. Next customer, please.' },
      { s: 'you', t: 'これを大阪まで送りたいんですが。', r: 'これ お おおさか まで おくりたい ん です が。', e: 'I would like to send this to Osaka.', wrong: [
        ['これを大阪で送りたいんですが。', 'これ お おおさか で おくりたい ん です が。', 'de marks where the sending happens -- that says you post it while in Osaka. The destination takes made.'],
        ['これが大阪まで送りたいんですが。', 'これ が おおさか まで おくりたい ん です が。', 'What you are sending takes o, not ga.']
      ] },
      { s: 'other', t: 'かしこまりました。お中身は何でしょうか。壊れ物や、電池などの危険物は入っていますか。', r: 'かしこまりました。おなかみ わ なん でしょう か。こわれもの や、でんち など の きけんぶつ わ はいって います か。', e: 'Certainly. What are the contents? Is there anything fragile, or hazardous items like batteries?' },
      { s: 'you', t: '本と服です。壊れ物はありません。', r: 'ほん と ふく です。こわれもの わ ありません。', e: 'Books and clothes. Nothing fragile.', wrong: [
        ['本と服です。壊れ物がありません。', 'ほん と ふく です。こわれもの が ありません。', 'They just asked specifically about fragile items -- answering about that same topic takes wa, not ga.'],
        ['本と服です。壊れ物はいません。', 'ほん と ふく です。こわれもの わ いません。', 'imasen is for animate things. Objects not existing takes arimasen.']
      ] },
      { s: 'other', t: 'ありがとうございます。サイズを測りますね。……60サイズですので、ゆうパックですと810円です。定形外郵便ですと少しお安くなりますが、追跡と補償が付きません。いかがなさいますか。', r: 'ありがとうございます。サイズ お はかります ね。……ろくじゅう サイズ です ので、ゆうパック です と はっぴゃくじゅう えん です。ていけいがい ゆうびん です と すこし おやすく なります が、ついせき と ほしょう が つきません。いかが なさいます か。', e: 'Thank you. I will measure the size. ... It is size 60, so by Yu-Pack it is 810 yen. Non-standard mail would be a bit cheaper, but no tracking or compensation comes with it. Which would you like?' },
      { s: 'you', t: '追跡を付けたいので、ゆうパックでお願いします。', r: 'ついせき お つけたい ので、ゆうパック で おねがいします。', e: 'I want tracking, so Yu-Pack, please.', wrong: [
        ['追跡が付けたいので、ゆうパックでお願いします。', 'ついせき が つけたい ので、ゆうパック で おねがいします。', 'tsukeru is transitive -- what you want attached, the tracking, takes o, not ga.'],
        ['追跡を付けたいので、ゆうパックをお願いします。', 'ついせき お つけたい ので、ゆうパック お おねがいします。', 'Passable alone, but when choosing between the two options just offered, the one you pick takes de, not o.']
      ] },
      { s: 'other', t: 'では、こちらの伝票にご記入をお願いします。お届け先と、ご依頼主のお名前・ご住所・お電話番号です。', r: 'では、こちら の でんぴょう に ごきにゅう お おねがいします。おとどけさき と、ごいらいぬし の おなまえ・ごじゅうしょ・おでんわばんごう です。', e: 'Then please fill out this slip -- the name, address, and phone number for both the recipient and the sender.' },
      { s: 'you', t: 'はい。……書けました。', r: 'はい。……かけました。', e: 'Sure. ... Done.', wrong: [
        ['はい。……書けます。', 'はい。……かけます。', 'kakemasu, non-past, states a general ability to write. Reporting that you just finished takes the past tense, kakemashita.'],
        ['はい。……書かせました。', 'はい。……かかせました。', 'kakasemashita is causative -- making or letting someone else write. You filled it out yourself.']
      ] },
      { s: 'other', t: 'ありがとうございます。お届け日時のご指定はございますか。', r: 'ありがとうございます。おとどけ にちじ の ごしてい わ ございます か。', e: 'Thank you. Would you like to specify a delivery date or time?' },
      { s: 'you', t: '特にないです。一番早いのでお願いします。', r: 'とくに ない です。いちばん はやい の で おねがいします。', e: 'No preference. The soonest one, please.', wrong: [
        ['特にないです。一番早いのにお願いします。', 'とくに ない です。いちばん はやい の に おねがいします。', 'ni marks a destination or target, not the option you are choosing -- choosing from a menu takes de.'],
        ['特にないです。一番早いのがお願いします。', 'とくに ない です。いちばん はやい の が おねがいします。', 'ga would make the soonest one the subject doing the asking. The option you are choosing takes de.']
      ] },
      { s: 'other', t: '明後日の午前中には届く予定です。810円になります。', r: 'あさって の ごぜんちゅう に わ とどく よてい です。はっぴゃくじゅう えん に なります。', e: 'It should arrive by the morning of the day after tomorrow. That comes to 810 yen.' },
      { s: 'you', t: 'キャッシュレスで払えますか。', r: 'キャッシュレス で はらえます か。', e: 'Can I pay cashless?', wrong: [
        ['キャッシュレスを払えますか。', 'キャッシュレス お はらえます か。', 'The method of paying takes de, not o.'],
        ['キャッシュレスで払いますか。', 'キャッシュレス で はらいます か。', 'haraimasu ka asks about intent to pay. Asking whether it is possible needs the potential form, haraemasu ka.']
      ] },
      { s: 'other', t: 'はい、クレジットカードや交通系IC、コード決済もご利用いただけます。……こちらがお客様控えです。追跡番号が付いていますので、大切に保管してください。', r: 'はい、クレジットカード や こうつうけい アイシー、コード けっさい も ごりよう いただけます。……こちら が おきゃくさま ひかえ です。ついせき ばんごう が ついて います ので、たいせつ に ほかん して ください。', e: 'Yes, credit card, transit IC cards, and QR payment all work too. ... Here is your customer copy. It has a tracking number, so please keep it safe.' }
    ]
  },
  // script: takkyubin-redelivery -- calling the driver number on a missed-delivery slip (不在連絡票).
  // notes: time slots are a fixed menu (午前中/14-16/16-18/18-20/19-21) -- an arbitrary time gets
  // converted to a slot; 置き配 must be requested with this carrier unless preset in an app; the
  // address readback (building name + 号室, said fluently) is where foreigners stall.
  {
    code: 'services-takkyubin',
    unit: 'services',
    title: 'Arranging redelivery with the driver',
    situation: 'A missed-delivery slip is in your mailbox and you call the number on it.',
    turns: [
      { s: 'other', t: 'はい、ヤマト運輸の田中です。', r: 'はい、ヤマトうんゆ の たなか です。', e: 'Hello, this is Tanaka from Yamato Transport.' },
      { s: 'you', t: 'すみません、不在票が入っていたので、再配達をお願いしたいんですが。', r: 'すみません、ふざいひょう が はいって いた ので、さいはいたつ お おねがい したい ん です が。', e: 'Hi, I found a missed-delivery slip, so I would like to arrange redelivery.', wrong: [
        ['すみません、不在票を入っていたので、再配達をお願いしたいんですが。', 'すみません、ふざいひょう お はいって いた ので、さいはいたつ お おねがい したい ん です が。', 'hairu is intransitive -- what was inside takes ga, not o.'],
        ['すみません、不在票が入れていたので、再配達をお願いしたいんですが。', 'すみません、ふざいひょう が いれて いた ので、さいはいたつ お おねがい したい ん です が。', 'ireru means someone put it in. The slip just being there by itself is the intransitive haitte ita.']
      ] },
      { s: 'other', t: 'ありがとうございます。伝票番号か、お名前とご住所をお願いできますか。', r: 'ありがとうございます。でんぴょう ばんごう か、おなまえ と ごじゅうしょ お おねがい できます か。', e: 'Thank you. Could I get the slip number, or your name and address?' },
      { s: 'you', t: 'スミスです。住所は中野区中央2丁目3の5、ハイツ中野203号室です。', r: 'スミス です。じゅうしょ わ なかのく ちゅうおう にちょうめ さん の ご、ハイツなかの にひゃくさん ごうしつ です。', e: 'It is Smith. The address is Nakano Ward, Chuo 2-3-5, Heights Nakano, room 203.', wrong: [
        ['スミスです。住所が中野区中央2丁目3の5、ハイツ中野203号室です。', 'スミス です。じゅうしょ が なかのく ちゅうおう にちょうめ さん の ご、ハイツなかの にひゃくさん ごうしつ です。', 'They just asked for your address -- answering about that same topic takes wa, not ga.'],
        ['スミスです。住所は中野区中央2丁目3の5、ハイツ中野203号室にです。', 'スミス です。じゅうしょ わ なかのく ちゅうおう にちょうめ さん の ご、ハイツなかの にひゃくさん ごうしつ に です。', 'ni does not attach before desu like this -- naming the address as your answer is just the noun phrase plus desu.']
      ] },
      { s: 'other', t: 'スミス様ですね、確認できました。本日ですと、何時ごろがよろしいですか。', r: 'スミスさま です ね、かくにん できました。ほんじつ です と、なんじ ごろ が よろしい です か。', e: 'Mr. Smith -- yes, I have confirmed it. If today works, about what time would be good?' },
      { s: 'you', t: '夜7時以降だと助かります。', r: 'よる しちじ いこう だと たすかります。', e: 'After 7 p.m. would be a big help.', wrong: [
        ['夜7時以降だと助けます。', 'よる しちじ いこう だと たすけます。', 'tasukemasu is you helping someone else. Being helped or relieved by something is the intransitive tasukarimasu.'],
        ['夜7時以降が助かります。', 'よる しちじ いこう が たすかります。', 'da to sets up if it is after 7. Dropping it to ga loses the conditional and just states the time is inherently a relief, not a proposal.']
      ] },
      { s: 'other', t: 'かしこまりました。では、19時から21時の間にお伺いします。', r: 'かしこまりました。では、じゅうくじ から にじゅういちじ の あいだ に おうかがい します。', e: 'Understood. Then I will come by between 7 and 9 p.m.' },
      { s: 'you', t: 'あの、もし出られなかったら、置き配ってできますか。', r: 'あの、もし でられなかったら、おきはい って できます か。', e: 'Um, if I cannot come to the door, could you do a doorstep drop-off?', wrong: [
        ['あの、もし出られなかったら、置き配ってしますか。', 'あの、もし でられなかったら、おきはい って します か。', 'shimasu ka asks whether they plan to do it. Asking whether the option is possible at all is dekimasu ka.'],
        ['あの、もし出なかったら、置き配ってできますか。', 'あの、もし でなかったら、おきはい って できます か。', 'denakattara is a plain negative -- choosing not to come out. Being unable to is the potential negative, derarenakattara.']
      ] },
      { s: 'other', t: 'はい、玄関前でよろしければ可能です。ただ、代金引換やクール便のお荷物は置き配ができないんですが、今回は通常のお荷物ですので大丈夫です。', r: 'はい、げんかんまえ で よろしければ かのう です。ただ、だいきん ひきかえ や クールびん の おにもつ わ おきはい が できない ん です が、こんかい わ つうじょう の おにもつ です ので だいじょうぶ です。', e: 'Yes, it is possible if in front of the door is fine. Though cash-on-delivery and cold-chain parcels cannot be left, this time it is a regular parcel, so no problem.' },
      { s: 'you', t: 'じゃあ、その場合は玄関前にお願いします。', r: 'じゃあ、その ばあい わ げんかんまえ に おねがいします。', e: 'Then in that case, please leave it in front of the door.', wrong: [
        ['じゃあ、その場合は玄関前でお願いします。', 'じゃあ、その ばあい わ げんかんまえ で おねがいします。', 'The spot where the parcel should end up takes ni, not de -- de would mark it as where an action happens, not the placement target.'],
        ['じゃあ、その場合は玄関前をお願いします。', 'じゃあ、その ばあい わ げんかんまえ お おねがいします。', 'o would make the entrance itself the thing requested. The target location for leaving something takes ni.']
      ] },
      { s: 'other', t: '承知しました。お届けしましたら、写真を撮ってポストにお知らせを入れておきますね。', r: 'しょうち しました。おとどけ しましたら、しゃしん お とって ポスト に おしらせ お いれて おきます ね。', e: 'Understood. Once it is delivered, I will take a photo and leave a note in your mailbox.' },
      { s: 'you', t: 'ありがとうございます。よろしくお願いします。', r: 'ありがとうございます。よろしく おねがいします。', e: 'Thank you. I appreciate it.', wrong: [
        ['ありがとうございます。よろしくお願いしました。', 'ありがとうございます。よろしく おねがい しました。', 'The past tense treats the request as already settled and done. The delivery has not happened yet, so keep it non-past: onegaishimasu.'],
        ['ありがとうございます。よろしくどういたしまして。', 'ありがとうございます。よろしく どういたしまして。', 'douitashimashite is what the other person says in reply to thanks -- it cannot attach to your own closing request.']
      ] }
    ]
  },
  // script: bank-atm-passbook -- updating a passbook (通帳記帳) at the ATM with floor-staff help,
  // then withdrawing cash.
  // notes: the ATM talks and beeps constantly, cancelling after about 30 seconds of hesitation;
  // learners freeze at 暗証番号 (PIN) since textbooks taught パスワード; newer accounts are 通帳レス.
  {
    code: 'services-bank-passbook',
    unit: 'services',
    title: 'Updating a passbook and withdrawing cash',
    situation: 'At a bank branch, you update your passbook at the ATM and then withdraw cash.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。本日はどのようなご用件でしょうか。', r: 'いらっしゃいませ。ほんじつ わ どのような ごようけん でしょう か。', e: 'Welcome. What can we help you with today?' },
      { s: 'you', t: '通帳の記帳をしたいんですが。', r: 'つうちょう の きちょう お したい ん です が。', e: 'I would like to update my passbook.', wrong: [
        ['通帳の記帳をしていたいんですが。', 'つうちょう の きちょう お して いたい ん です が。', 'te itai wants to remain in an ongoing state. Wanting to do this one-time task is the plain tai form, shitai.'],
        ['通帳の記帳をしたかったんですが。', 'つうちょう の きちょう お したかった ん です が。', 'The past tense shitakatta implies you wanted this before but not necessarily now. Since you want it done right now, use the non-past shitai.']
      ] },
      { s: 'other', t: '記帳でしたら、こちらのATMでできますよ。ご案内いたします。', r: 'きちょう でしたら、こちら の エーティーエム で できます よ。ごあんない いたします。', e: 'For passbook updates you can use this ATM. Let me show you.' },
      { s: 'other', t: 'いらっしゃいませ。お取引を選んで、ボタンを押してください。', r: 'いらっしゃいませ。おとりひき お えらんで、ボタン お おして ください。', e: 'Welcome. Please select a transaction and press the button.' },
      { s: 'you', t: 'すみません、どのボタンですか。', r: 'すみません、どの ボタン です か。', e: 'Sorry, which button is it?', wrong: [
        ['すみません、どのボタンがですか。', 'すみません、どの ボタン が です か。', 'A particle does not attach directly before desu like this -- which button is it is just dono botan desu ka.'],
        ['すみません、どのボタンをですか。', 'すみません、どの ボタン お です か。', 'Same problem -- o cannot sit directly before desu. Asking which one it is needs no extra particle: dono botan desu ka.']
      ] },
      { s: 'other', t: '右下の「通帳記入」です。通帳を開いて、そのまま機械に入れてください。', r: 'みぎした の「つうちょう きにゅう」です。つうちょう お ひらいて、そのまま きかい に いれて ください。', e: 'Passbook entry, bottom right. Open the passbook and put it into the machine just as it is.' },
      { s: 'other', t: '通帳を入れてください。……記帳中です。しばらくお待ちください。', r: 'つうちょう お いれて ください。……きちょうちゅう です。しばらく おまち ください。', e: 'Please insert your passbook. ... Updating now. Please wait a moment.' },
      { s: 'other', t: '通帳をお取りください。ありがとうございました。', r: 'つうちょう お おとり ください。ありがとう ございました。', e: 'Please take your passbook. Thank you.' },
      { s: 'you', t: 'あと、引き出しもこのATMでできますか。', r: 'あと、ひきだし も この エーティーエム で できます か。', e: 'Also, can I withdraw money at this ATM too?', wrong: [
        ['あと、引き出しをこのATMでできますか。', 'あと、ひきだし お この エーティーエム で できます か。', 'dekiru describes what is possible -- the thing that can be done takes ga, or here mo, not o.'],
        ['あと、引き出しもこのATMにできますか。', 'あと、ひきだし も この エーティーエム に できます か。', 'ni marks a target or destination. The place where an action is possible takes de.']
      ] },
      { s: 'other', t: 'はい、「お引き出し」を押して、キャッシュカードを入れてください。', r: 'はい、「おひきだし」お おして、キャッシュカード お いれて ください。', e: 'Yes -- press Withdrawal and insert your cash card.' },
      { s: 'other', t: '暗証番号を押してください。……金額を入力し、「確認」を押してください。', r: 'あんしょうばんごう お おして ください。……きんがく お にゅうりょく し、「かくにん」お おして ください。', e: 'Please enter your PIN. ... Enter the amount and press Confirm.' },
      { s: 'other', t: 'お札をお取りください。カードとご利用明細をお忘れなく。', r: 'おさつ お おとり ください。カード と ごりよう めいさい お おわすれ なく。', e: 'Please take your bills. Do not forget your card and receipt.' }
    ]
  },
  // script: pharmacy-prescription -- first visit to a 調剤薬局 next to a clinic, prescription in hand.
  // notes: "ジェネリックでよろしいですか" is asked to everyone, fast, expecting an instant yes; since
  // the 2024 rule change, choosing the brand-name drug without medical reason costs extra; the
  // dosage readback (1日3回・毎食後・1錠・5日分) is dense number-listening with real consequences;
  // a prescription expires 4 days including the issue date.
  {
    code: 'services-pharmacy-prescription',
    unit: 'services',
    title: 'Filling a prescription at the pharmacy',
    situation: 'Your first visit to a pharmacy next to a clinic, prescription in hand.',
    turns: [
      { s: 'other', t: 'いらっしゃいませ。処方箋はお持ちですか。', r: 'いらっしゃいませ。しょほうせん わ おもち です か。', e: 'Welcome. Do you have a prescription?' },
      { s: 'you', t: 'はい、これです。', r: 'はい、これ です。', e: 'Yes, here it is.', wrong: [
        ['はい、それです。', 'はい、それ です。', 'sore points to something near the listener. What is in your own hand is kore.'],
        ['はい、あれです。', 'はい、あれ です。', 'are points to something far from you both. The prescription is right here with you: kore.']
      ] },
      { s: 'other', t: 'お預かりします。当薬局のご利用は初めてですか。保険証か、マイナンバーカードはお持ちでしょうか。', r: 'おあずかり します。とう やっきょく の ごりよう わ はじめて です か。ほけんしょう か、マイナンバー カード わ おもち でしょう か。', e: 'I will take that. Is this your first time using this pharmacy? Do you have your insurance card or My Number card?' },
      { s: 'you', t: '初めてです。マイナンバーカードでお願いします。', r: 'はじめて です。マイナンバー カード で おねがいします。', e: 'It is my first time. I will go with my My Number card, please.', wrong: [
        ['初めてです。マイナンバーカードをお願いします。', 'はじめて です。マイナンバー カード お おねがいします。', 'o would ask them to hand you a card. You are naming which ID you are using -- a choice takes de.'],
        ['初めてです。マイナンバーカードがお願いします。', 'はじめて です。マイナンバー カード が おねがいします。', 'ga would make the card itself the one making the request. The option you are choosing takes de.']
      ] },
      { s: 'other', t: 'では、こちらの問診票のご記入をお願いします。アレルギーや、今飲んでいるお薬はありますか。', r: 'では、こちら の もんしんひょう の ごきにゅう お おねがいします。アレルギー や、いま のんで いる おくすり わ あります か。', e: 'Then please fill out this intake form. Do you have any allergies, or any medicine you are currently taking?' },
      { s: 'you', t: 'アレルギーは特にないです。薬も今は飲んでいません。', r: 'アレルギー わ とくに ない です。くすり も いま わ のんで いません。', e: 'No allergies in particular. I am not taking any medicine right now either.', wrong: [
        ['アレルギーが特にないです。薬も今は飲んでいません。', 'アレルギー が とくに ない です。くすり も いま わ のんで いません。', 'They just asked about allergies specifically -- answering on that topic takes wa, not ga.'],
        ['アレルギーは特にないです。薬も今は飲みません。', 'アレルギー わ とくに ない です。くすり も いま わ のみません。', 'nomimasen states a general habit or future intention. Describing your current state of not being on any medicine needs the ongoing negative, nonde imasen.']
      ] },
      { s: 'other', t: 'お薬手帳はお持ちですか。', r: 'おくすりてちょう わ おもち です か。', e: 'Do you have a medicine notebook?' },
      { s: 'you', t: '持っていません。作った方がいいですか。', r: 'もって いません。つくった ほう が いい です か。', e: 'I do not have one. Should I make one?', wrong: [
        ['持っていません。作る方がいいですか。', 'もって いません。つくる ほう が いい です か。', 'The would be better to pattern uses the past-tense form even for a future action -- tsukutta hou ga ii, not the plain tsukuru.'],
        ['持っていません。作った方がします。', 'もって いません。つくった ほう が します。', 'hou ga ii is a fixed pattern for it would be better to. suru does not substitute for ii here.']
      ] },
      { s: 'other', t: '無料でお作りできますよ。アプリ版もございます。それから、お薬はジェネリック医薬品でよろしいですか。', r: 'むりょう で おつくり できます よ。アプリばん も ございます。それから、おくすり わ ジェネリック いやくひん で よろしい です か。', e: 'We can make one for free. There is an app version too. Also, is a generic medicine all right with you?' },
      { s: 'you', t: 'ジェネリックって、何が違うんですか。', r: 'ジェネリック って、なに が ちがう ん です か。', e: 'Generic -- what is different about it?', wrong: [
        ['ジェネリックって、何を違うんですか。', 'ジェネリック って、なに お ちがう ん です か。', 'chigau is intransitive -- what differs takes ga, not o.'],
        ['ジェネリックって、何が違いますか。', 'ジェネリック って、なに が ちがいます か。', 'Dropping n desu loses the please explain this to me framing you want when asking for clarification about something they just brought up.']
      ] },
      { s: 'other', t: '効き目は同じで、お値段が安くなります。先発品をご希望の場合は、特別料金が上乗せになる場合がございます。', r: 'ききめ わ おなじ で、おねだん が やすく なります。せんぱつひん お ごきぼう の ばあい わ、とくべつ りょうきん が うわのせ に なる ばあい が ございます。', e: 'The effect is the same, and the price gets cheaper. If you would prefer the brand-name version, there can be cases where a special charge is added.' },
      { s: 'you', t: 'じゃあ、ジェネリックでお願いします。', r: 'じゃあ、ジェネリック で おねがいします。', e: 'Then generic, please.', wrong: [
        ['じゃあ、ジェネリックをお願いします。', 'じゃあ、ジェネリック お おねがいします。', 'Choosing between the two options just presented takes de, not o.'],
        ['じゃあ、ジェネリックがお願いします。', 'じゃあ、ジェネリック が おねがいします。', 'ga would make generic itself the one making the request. The option you are accepting takes de.']
      ] },
      { s: 'other', t: 'スミス様、お待たせしました。こちら、痛み止めです。1日3回、毎食後に1錠、5日分です。', r: 'スミスさま、おまたせ しました。こちら、いたみどめ です。いちにち さんかい、まいしょくご に いちじょう、いつかぶん です。', e: 'Mr. Smith, thanks for waiting. Here is your painkiller. One tablet three times a day, after each meal, a five-day supply.' },
      { s: 'other', t: '本日、保険適用で640円です。お大事にどうぞ。', r: 'ほんじつ、ほけん てきよう で ろっぴゃくよんじゅう えん です。おだいじ に どうぞ。', e: 'Today, with insurance, it comes to 640 yen. Take care of yourself.' }
    ]
  }
]
