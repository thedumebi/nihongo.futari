-- Curriculum units: the decks a learner can pick.
--
-- Two flavours, one mechanism:
--   scripts   — hiragana / katakana, so you can drill one alphabet at a time
--   scenarios — the words you actually need in a situation
--
-- Scenario membership is by word, matched on the JMdict spelling. Deliberately
-- data rather than code: adding "at the post office" is another INSERT, not a
-- deploy. Words absent from the N5 import simply don't match, so this is safe
-- to run before the vocabulary is complete.

INSERT INTO curriculum_units (id, language_id, level_id, code, title, description, published, sort_index) VALUES
  ('unit-ja-hiragana',  'lang-ja', 'lvl-ja-n5', 'hiragana',  'Hiragana',  'The 46 basic characters, plus dakuten and handakuten.', true, 0),
  ('unit-ja-katakana',  'lang-ja', 'lvl-ja-n5', 'katakana',  'Katakana',  'Same sounds, the script used for loanwords and emphasis.', true, 1),
  ('unit-ja-restaurant','lang-ja', 'lvl-ja-n5', 'restaurant','At a restaurant', 'Ordering, paying, and asking for what you need.', true, 10),
  ('unit-ja-konbini',   'lang-ja', 'lvl-ja-n5', 'konbini',   'At a konbini', 'The convenience store: bags, warming food, paying.', true, 11),
  ('unit-ja-ward-office','lang-ja','lvl-ja-n5', 'ward-office','At the ward office', 'Paperwork, addresses, names and dates.', true, 12),
  ('unit-ja-station',   'lang-ja', 'lvl-ja-n5', 'station',   'At the station', 'Tickets, platforms, directions and times.', true, 13)
ON CONFLICT (language_id, code) DO NOTHING;

-- Scripts: every kana study item, split by script.
INSERT INTO curriculum_unit_items (unit_id, study_item_id, sort_index)
SELECT CASE WHEN k.script = 'hiragana' THEN 'unit-ja-hiragana' ELSE 'unit-ja-katakana' END,
       si.id, k.order_index
FROM study_items si JOIN kana k ON k.id = si.kana_id
WHERE si.kind = 'kana'
ON CONFLICT DO NOTHING;

-- Scenarios: word membership by spelling. A word may appear in several.
-- NOTE the join is on curriculum_units.CODE, so the first column below is the
-- code ('restaurant'), not the row id ('unit-ja-restaurant').
INSERT INTO curriculum_unit_items (unit_id, study_item_id, sort_index)
SELECT u.id, si.id, (row_number() OVER (PARTITION BY u.id ORDER BY w.primary_form))::int
FROM study_items si
JOIN words w ON w.id = si.word_id
JOIN (VALUES
  -- At a restaurant
  ('restaurant', ARRAY['食べる','飲む','水','お茶','ご飯','肉','魚','野菜','果物','パン','牛乳','酒','ビール','コーヒー','紅茶','砂糖','塩','美味しい','注文','食堂','喫茶店','店','いくら','お金','払う','メニュー','昼ご飯','晩ご飯','朝ご飯','卵','肉屋','箸','皿','コップ','スプーン','フォーク','ナイフ','カレー','ラーメン','弁当','丼']),
  -- At a konbini
  ('konbini',    ARRAY['店','買う','お金','いくら','袋','温める','弁当','おにぎり','飲み物','雑誌','新聞','切手','煙草','電池','傘','これ','それ','あれ','一つ','二つ','三つ','円','千','百','万','レジ','カード','現金','コンビニ']),
  -- At the ward office
  ('ward-office',ARRAY['名前','住所','電話','番号','生まれる','国','外国','外国人','書く','読む','紙','鉛筆','ペン','時間','曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日','日曜日','今日','明日','昨日','来年','去年','今年','年','月','日','区','市','町','村','家族','父','母','兄','姉','弟','妹','子供','結婚','仕事','会社']),
  -- At the station
  ('station',    ARRAY['駅','電車','地下鉄','バス','切符','行く','来る','帰る','乗る','降りる','出口','入口','north','時間','何時','分','早い','遅い','次','線','番','待つ','急行','特急','駅員','東','西','南','北'])
) AS scenario(unit_code, forms) ON true
JOIN curriculum_units u ON u.code = scenario.unit_code AND u.language_id = 'lang-ja'
WHERE si.kind = 'word' AND w.primary_form = ANY(scenario.forms)
ON CONFLICT DO NOTHING;
