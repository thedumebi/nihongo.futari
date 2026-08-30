/**
 * Words that borrow another word's illustration.
 *
 * Drawing 書物 when 本 already has a book adds a file without adding
 * information: the two mean the same thing, so one picture teaches both. This
 * maps the borrower's JMdict ent_seq to the owner's.
 *
 * CURATED, NOT DERIVED, and that distinction is the whole point. The obvious
 * derivation — pair words that share an English gloss — is wrong often enough
 * to be dangerous, because it matches on English rather than on meaning:
 *
 *   書斎 (a study ROOM)        matched 勉強 (studying)
 *   面目 (dignity)             matched 面   (a face)
 *   再発 (recurrence)          matched 帰り (going home)
 *   岸  (a riverbank)          matched 銀行 (a financial bank)
 *   博士 (a PhD)               matched 医師 (a physician)
 *   綱  (a taxonomic class)    matched クラス (a school class)
 *
 * Every pair below was judged individually against both words' full glosses.
 * 412 candidates were considered and 164 rejected. A word with no picture is
 * fine; a word with a picture of the wrong thing teaches an error the reader
 * has no reason to doubt.
 *
 * Pairs are only applied when the TARGET has a drawing — see make-image-seed.
 */
export const IMAGE_ALIASES: Record<number, number> = {
  // お宮 -> 神社: both denote a Shinto shrine
  1001790: 1364670,
  // インターナショナル -> 国際: same concept, international
  1022850: 1286400,
  // オイル -> 石油: both oil/petroleum
  1033900: 1382830,
  // オフィス -> 事務所: both an office
  1034660: 1314400,
  // カー -> 自動車: both a car
  1036170: 1318400,
  // ゲスト -> 客: both a guest/visitor
  1048550: 1226630,
  // シート -> 席: both a seat
  1059450: 1382250,
  // スクール -> 学校: both a school
  1068230: 1206730,
  // スピーチ -> 演説: both a speech/address
  1072260: 1176960,
  // ソックス -> 靴下: both socks
  1075420: 1246740,
  // ダンス -> 踊り: both dance
  1077250: 1546880,
  // ビルディング -> ビル: same word, multi-storey building
  1106040: 1106010,
  // プラン -> 計画: both a plan/scheme
  1115900: 1252090,
  // ペア -> 一番: both a pair, a set of two
  1120690: 1165980,
  // ボーイ -> 男子: both a boy
  1123230: 1420070,
  // ミュージック -> 音楽: both music
  1131680: 1183720,
  // メンバー -> 会員: both a member
  1134370: 1198230,
  // ランチ -> 昼ご飯: both lunch
  1140100: 1602340,
  // ルール -> 規則: both a rule/regulation
  1143920: 1223021,
  // 愛情 -> 愛: both love/affection
  1150860: 1150410,
  // 意義 -> 意味: both meaning/significance
  1156520: 1156800,
  // 育ち -> 成長: both growth/growing up
  1160520: 1375790,
  // 一切 -> 全部: both all/everything
  1164170: 1396130,
  // 英雄 -> 丈夫: both a hero/warrior
  1174680: 1580485,
  // 演劇 -> 劇: both drama/theatre
  1176860: 1253310,
  // 下書き -> 草: both a draft/rough copy
  1185370: 2414580,
  // 家屋 -> 家: both a house/building
  1191780: 1191730,
  // 果実 -> 果物: both fruit
  1192940: 1193060,
  // 歌謡 -> 歌: both a song
  1193450: 1193180,
  // 貨幣 -> お金: both money/currency
  1195930: 1001820,
  // 解説 -> 説明: both an explanation
  1199080: 1386460,
  // 解答 -> 答え: both an answer/solution
  1199160: 1449530,
  // 回答 -> 返事: both a reply/answer
  1199680: 1512220,
  // 快晴 -> 晴れ: both clear fine weather
  1200060: 1376460,
  // 拡充 -> 拡大: both expansion
  1205190: 1205200,
  // 拡張 -> 拡大: both expansion/extension
  1205220: 1205200,
  // 感じ -> 気持ち: both a feeling/impression
  1212250: 1591430,
  // 感謝 -> お礼: both thanks/gratitude
  1212380: 1270810,
  // 関連 -> 関係: both relation/connection
  1216060: 1215810,
  // 気分 -> 気持ち: both feeling/mood
  1222590: 1591430,
  // 戯曲 -> 劇: both a drama/play
  1225010: 1253310,
  // 休憩 -> 休み: both a rest/break
  1227720: 1227500,
  // 休息 -> 休み: both rest/repose
  1227940: 1227500,
  // 休養 -> 休み: rest for recuperation, same core image of resting
  1228100: 1227500,
  // 筋肉 -> 筋: both denote muscle
  1241810: 1241750,
  // 金 -> お金: same word, polite prefix only
  1242590: 1001820,
  // 金銭 -> お金: both money/cash
  1243020: 1001820,
  // 型 -> タイプ: both type/kind/style
  1250090: 1075940,
  // 稽古 -> 練習: both practicing/training
  1250990: 1559160,
  // 計 -> 計画: both a plan
  1252050: 1252090,
  // 券 -> 切符: both a ticket
  1256730: 1385170,
  // 見解 -> 意見: both an opinion/view
  1258200: 1156530,
  // 言語 -> 言葉: both language
  1264420: 1264540,
  // 交差 -> 交差点: crossing and the crossing point, one image
  1271970: 1592970,
  // 公害 -> 汚染: both pollution/contamination
  1273420: 1179040,
  // 構想 -> 計画: both a plan/scheme
  1279780: 1252090,
  // 合議 -> 相談: both consultation/discussion
  1284700: 1401210,
  // 腰掛け -> 席: both a seat
  1288370: 1382250,
  // 昆虫 -> 虫: both an insect
  1289980: 1426680,
  // 作業 -> 仕事: both work/labor being done
  1297540: 1304970,
  // 作製 -> 製造: both manufacture/production
  1297790: 1380690,
  // 策 -> 計画: both a plan/scheme
  1298260: 1252090,
  // 皿 -> お皿: same word, polite prefix only
  1299680: 1299685,
  // 産出 -> 生産: both production/output
  1303810: 1378990,
  // 死亡 -> 死: both death
  1310950: 1310720,
  // 時刻 -> 時間: clock time works for both
  1316220: 1315920,
  // 質疑 -> 質問: both asking questions
  1320680: 1320760,
  // 実 -> 果物: both fruit
  1320810: 1193060,
  // 斜面 -> 坂: both a slope/incline
  1322470: 1297110,
  // 者 -> 人: both a person
  1322990: 1580640,
  // 酒 -> アルコール: both alcoholic drink
  1329010: 1019280,
  // 樹木 -> 木: both a tree
  1330400: 1534520,
  // 周辺 -> 周り: both the area around something
  1331300: 1604290,
  // 修学 -> 学習: both learning/study
  1331950: 1206820,
  // 終了 -> 最後: both the end/conclusion
  1333040: 1293810,
  // 祝い -> お祝い: same word with honorific prefix
  1337370: 1612770,
  // 巡査 -> 警官: both a police officer
  1342110: 1252330,
  // 書籍 -> 本: both a book
  1344090: 1522150,
  // 書物 -> 本: both a book
  1344150: 1522150,
  // 助け -> 援助: both help/assistance
  1344390: 1176660,
  // 女の人 -> 女子: both a female person
  1344980: 1345140,
  // 床 -> ベッド: both a bed/sleeping place
  1349370: 1119650,
  // 招き -> 招待: both an invitation
  1349570: 1349610,
  // 丈 -> 背: both height/stature
  1354600: 1472650,
  // 場 -> 場所: both a place/spot
  1355790: 1355850,
  // 色彩 -> 色: both colour/hue
  1357720: 1357600,
  // 食物 -> 食品: both food/foodstuff
  1358620: 1358600,
  // 食料 -> 食品: both food
  1358670: 1358600,
  // 心地 -> 気持ち: both feeling/sensation/mood
  1360820: 1591430,
  // 森林 -> 森: both a forest
  1362530: 1362490,
  // 神様 -> 神: both a god/deity
  1364920: 1364440,
  // 人 -> 人: same word, alternate reading
  1366420: 1580640,
  // 人ごみ -> 大勢: both a crowd of people
  1367680: 1414220,
  // 人物 -> 人: both a person
  1369070: 1580640,
  // 水曜 -> 水曜日: both Wednesday
  1372180: 1372190,
  // 炊事 -> 料理: both cooking
  1372350: 1554310,
  // 世の中 -> 社会: both society/the world
  1373850: 1322700,
  // 成人 -> 大人: both an adult
  1375740: 1414170,
  // 清掃 -> 掃除: both cleaning
  1378320: 1399790,
  // 精神 -> 心: both mind/spirit
  1379950: 1360480,
  // 製作 -> 製造: both manufacture/production
  1380650: 1380690,
  // 惜しい -> 残念: both regrettable/disappointing, same POS
  1382280: 1304680,
  // 前途 -> 将来: both the future/prospects
  1393750: 1347710,
  // 全 -> 全部: both all/the whole
  1394770: 1396130,
  // 相違 -> 差: both a difference
  1400820: 1291070,
  // 対 -> 一番: both a pair/couple/brace
  1409810: 1165980,
  // 対談 -> 話: both a talk/conversation
  1410230: 1600900,
  // 代金 -> 価格: both price/amount charged
  1411790: 1189500,
  // 宅 -> 家: both a house/home
  1415750: 1191730,
  // 男の子 -> 男子: both a boy
  1420010: 1420070,
  // 男の人 -> 男性: both a man
  1420020: 1420160,
  // 地域 -> 辺: both an area/region
  1420800: 1512070,
  // 中学 -> 中学校: both junior high school
  1423640: 1423650,
  // 中間 -> 真中: both denote the middle/midpoint between things
  1423680: 2838012,
  // 仲 -> 関係: both denote a relationship/relation between people
  1425710: 1215810,
  // 昼飯 -> 昼ご飯: same word for lunch, plain vs polite form
  1426410: 1602340,
  // 調理 -> 料理: both denote cooking/food preparation
  1429310: 1554310,
  // 鉄砲 -> 銃: both are a gun/firearm
  1438010: 1337000,
  // 法 -> 規則: のり reading means rule/regulation, same as 規則
  1438050: 1223021,
  // 天候 -> 天気: both mean weather
  1438970: 1438690,
  // 天然 -> 自然: both denote nature/the natural
  1439580: 1318090,
  // 展示 -> 展覧会: both denote exhibiting/things on display
  1440610: 1440660,
  // 途上 -> 途中: both mean on the way, en route
  1444870: 1582200,
  // 統率 -> 指揮: both denote commanding/leading a group
  1449840: 1309700,
  // 働き -> 仕事: both denote work/labor
  1451040: 1304970,
  // 特殊 -> 特別: both na-adjectives meaning special/particular
  1454970: 1455280,
  // 日中 -> 昼間: both mean daytime
  1464250: 1581710,
  // 農民 -> 農家: both denote a farmer
  1470770: 1470620,
  // 肌着 -> 下着: both mean underwear
  1476500: 1185930,
  // 発 -> 出発: both denote departure/setting off
  1477120: 1340000,
  // 髪の毛 -> 髪: both mean hair on the head
  1477960: 1477950,
  // 半ば -> 真中: both denote the middle/halfway point
  1478780: 2838012,
  // 班 -> 団体: both denote a group/team of people
  1481640: 1419270,
  // 飯 -> ご飯: same word for cooked rice, plain vs polite
  1482010: 1270590,
  // 扉 -> ドア: both are a door
  1483380: 1087820,
  // 美術 -> 芸術: both denote art/fine arts
  1486440: 1253060,
  // 不在 -> 留守: both denote absence/being away
  1492460: 1552760,
  // 夫人 -> 妻: both denote a wife, differing only in politeness
  1496540: 1294330,
  // 風景 -> 景色: both mean scenery/landscape
  1499830: 1250870,
  // 文 -> 手紙: ふみ means a letter/note, same as 手紙
  1505080: 1327720,
  // 返答 -> 返事: both mean a reply/answer
  1512290: 1512220,
  // 便所 -> お手洗い: both mean toilet/lavatory
  1512520: 1002100,
  // 弁当 -> お弁当: same word for bento, with and without o-prefix
  1513060: 1513065,
  // 保守 -> 維持: both denote maintenance/upkeep
  1513750: 1158450,
  // 歩む -> 歩く: both verbs meaning to walk
  1514360: 1514320,
  // 補助 -> 援助: both denote assistance/aid/support
  1514590: 1176660,
  // 方 -> 方向: both denote direction/way
  1516925: 1516990,
  // 方 -> 方向: both denote direction/way
  1516930: 1516990,
  // 方角 -> 方向: both denote a compass direction/bearing
  1516950: 1516990,
  // 方策 -> 計画: both denote a plan/scheme of action
  1517020: 1252090,
  // 方面 -> 方向: both denote a direction/heading
  1517100: 1516990,
  // 法 -> 法律: both denote the law/legislation
  1517150: 1517480,
  // 坊や -> 男子: both denote a boy
  1519060: 1420070,
  // 冒頭 -> 最初: both denote the beginning/outset
  1519860: 1293990,
  // 末 -> 最後: both denote the end of something
  1525250: 1293810,
  // 味覚 -> 味: both denote the sense of taste
  1527020: 2258680,
  // 無事 -> 安全: both denote safety/security
  1530030: 1153930,
  // 名 -> 名前: both denote a person's name
  1531330: 1531710,
  // 名称 -> 名前: a name/designation, same referent
  1531620: 1531710,
  // 目論見 -> 計画: both denote a plan or scheme
  1535730: 1252090,
  // 問い -> 質問: both are a question
  1535930: 1320760,
  // 夜間 -> 夜: both denote nighttime
  1536530: 1536350,
  // 役 -> 戦争: えき reading means a war/campaign
  1537960: 1390360,
  // 友 -> 友人: both are a friend
  1539980: 1540150,
  // 誘導 -> 案内: both denote leading/guiding someone
  1542020: 1154860,
  // 夕暮れ -> 晩: both denote the evening hours
  1542770: 1482110,
  // 用件 -> 用事: both are a matter/errand to attend to
  1546250: 1546300,
  // 遥か -> 遠く: both denote far away in the distance
  1546930: 1177820,
  // 率 -> 割合: both are a rate/ratio
  1551200: 1606810,
  // 旅 -> 旅行: both are a trip/journey
  1553120: 1553170,
  // 力 -> 力: same word, alternate reading
  1554840: 1554830,
  // 礼 -> お礼: same word, honorific prefix
  1557450: 1270810,
  // 暦 -> カレンダー: both are a calendar
  1557950: 1039220,
  // 列車 -> 電車: both are a railway train
  1558370: 1443530,
  // 次 -> 次: same word, alternate reading
  1579580: 1316380,
  // 寝台 -> ベッド: both are a bed
  1580570: 1119650,
  // 値 -> 価格: both denote price/cost
  1581630: 1189500,
  // 店 -> 店: same word, alternate reading
  1582125: 1582120,
  // 面 -> 顔: おもて literally means the face
  1584680: 1217730,
  // 面 -> 顔: めん first sense is the face
  1584695: 1217730,
  // 来場 -> 出席: both denote attending/being present
  1585050: 1339460,
  // 倅 -> 息子: both are a son
  1585440: 1404390,
  // 匙 -> スプーン: both are a spoon
  1585630: 1072590,
  // 明かり -> 光: both denote light/glow
  1586210: 1272780,
  // 戦 -> 戦争: both denote war/battle
  1587140: 1390360,
  // 位置 -> 場所: both denote a place/position
  1587310: 1355850,
  // 箇所 -> 場所: both denote a spot/place
  1590250: 1355850,
  // 共同 -> 協力: both denote working together
  1591660: 1591720,
  // 差し支え -> 邪魔: both denote a hindrance/obstacle
  1593780: 1323500,
  // 手帳 -> ノート: both are a small book to write in
  1598330: 1093450,
  // 手引き -> 案内: both denote guiding someone
  1598410: 1154860,
  // 年寄り -> 老人: both are an elderly person
  1598750: 1561090,
  // 昼食 -> 昼ご飯: both are lunch
  1602330: 1602340,
  // 祭り -> お祭り: same word, honorific prefix
  1604130: 1604135,
  // 見舞い -> お見舞い: same word, honorific prefix
  1604690: 1001870,
  // 決まり -> 規則: both are a rule/regulation
  1609660: 1223021,
  // お帰り -> 帰り: same word, honorific prefix
  1612780: 1221250,
  // 泳ぎ -> 水泳: both are swimming
  1613570: 1371320,
  // 食い物 -> 食品: both denote food
  1640430: 1358600,
  // お昼 -> 昼ご飯: お昼 commonly means lunch
  1660100: 1602340,
  // 店屋 -> 店: both are a store/shop
  1910260: 1582120,
  // 学 -> 学習: both denote learning/study
  1955900: 1206820,
  // 訳 -> 翻訳: both mean a translation
  2057030: 1523400,
  // 人間 -> 世界: jinkan is the (human) world, same as sekai
  2065280: 1373860,
  // 日 -> 日曜日: abbreviation for Sunday
  2083100: 1464900,
  // 港 -> 港: same word, on-reading of harbour
  2085750: 1279990,
  // 島 -> 島: same word, on-reading of island
  2085760: 1446760,
  // 生 -> 生活: both mean life/living
  2088240: 1378860,
  // 者 -> 人: sha denotes a person, same as hito
  2153760: 1580640,
  // 薬師 -> 医師: archaic word for a physician
  2229590: 1159930,
  // 土 -> 土曜日: abbreviation for Saturday
  2248580: 1445590,
  // 兄 -> 兄: same word, alternate reading nii
  2254970: 1249900,
  // 一方 -> 一人: honorific for one person
  2258660: 1576150,
  // 姉 -> 姉: same word, alternate reading nee
  2266990: 1307630,
  // 階 -> 階段: archaic word for stairs
  2543170: 1203090,
  // 場 -> 場所: jou denotes a place/grounds, same core meaning
  2652950: 1355850,
  // 筋 -> 筋: same word, on-reading kin for muscle
  2657060: 1241750,
  // 脳 -> 脳: same word, archaic reading for brain
  2665990: 1470380,
  // 飯 -> ご飯: ii is cooked rice, same as gohan
  2672310: 1270590,
  // 跡 -> 跡: same word, on-reading of trace
  2718510: 1383680,
  // 白 -> 白: same word, alternate reading shira
  2751410: 1474900,
  // 車 -> 自動車: sha denotes a car/vehicle
  2773260: 1318400,
  // 紙 -> 新聞: shi denotes a newspaper
  2787310: 1362360,
  // 身体 -> 体: both mean the body
  2830705: 1409140,
  // おみや -> 贈り物: a souvenir is a present given to someone
  2834761: 1589030,
  // 値 -> 価格: both mean price/cost
  2836242: 1189500,
  // 辺り -> 近所: identical glosses, nearby area/vicinity
  2842191: 1242350,
  // 楽 -> 音楽: gaku means music
  2842911: 1183720,
  // 節 -> 季節: sechi is a season/time of year
  2843303: 1222840,
  // 息 -> 息子: soku means son
  2843392: 1404390,
  // 友 -> 友人: both mean friend
  2844332: 1540150,
  // ベース -> バス: both are the musical bass
  2845313: 2845314,
  // グラス -> 草: loanword for grass, same plant
  2847461: 1401910,
  // 親父 -> 父: both mean one's father
  2849214: 1497610,
  // ホース -> 馬: loanword for horse, same animal
  2855195: 1471560,
  // ホーム -> 家庭: both mean home/household
  2855797: 1192280,
  // 夫婦 -> 夫婦: same word, alternate reading meoto
  2857591: 1583640,
  // 女子 -> 女子: same word, alternate reading onago
  2858064: 1345140,
  // 音 -> 音: same word, on-reading on for sound
  2859161: 1576900,
  // 音 -> 音: same word, reading ne for sound/tone
  2859162: 1576900,
  // 日中 -> 昼間: both mean daytime
  2862668: 1581710,
  // 酒 -> アルコール: sake/alcoholic drink, honest match
  2862891: 1019280,
  // 酒 -> アルコール: shu means alcoholic drink
  2862909: 1019280,
  // 酒 -> アルコール: saka combining form of sake/alcohol
  2862910: 1019280,
  // 昼食 -> 昼ご飯: both mean lunch/midday meal
  2863029: 1602340,
  // 昼餉 -> 昼ご飯: archaic word for lunch
  2863031: 1602340,
  // 腸 -> もつ: both mean entrails/guts
  2863261: 2096560,
  // 銃 -> 銃: same word, reading tsutsu for gun
  2864475: 1337000
}
