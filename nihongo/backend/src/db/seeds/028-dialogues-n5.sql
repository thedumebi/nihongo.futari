-- Conversation practice: the first six dialogues.
--
-- Authored here, like the grammar. The point of a scripted conversation is
-- that "correct" is a fact rather than a judgement, and that a wrong choice
-- can say WHY — so every distractor below is a mistake a learner actually
-- makes, with the reason spelled out. A distractor that is merely wrong
-- teaches nothing.
--
-- `reading_kana` carries particles as they are SPOKEN — は as わ, を as お —
-- because that is what the romaji surface renders from, and no heuristic in
-- the codebase can tell a particle は from the は inside a word.
--
-- Scoped to the four scenario units, which already have vocabulary and scene
-- art. Every word used is N5 and already in the curriculum.

-- ---------------------------------------------------------------------------
-- At a restaurant
-- ---------------------------------------------------------------------------

INSERT INTO dialogues (id, language_id, level_id, unit_id, code, title, situation, published, sort_index) VALUES
  ('dlg-ja-restaurant-order', 'lang-ja', 'lvl-ja-n5', 'unit-ja-restaurant', 'restaurant-order',
   'Ordering a meal', 'You sit down at a small restaurant. A waiter comes over.', true, 0),
  ('dlg-ja-restaurant-pay', 'lang-ja', 'lvl-ja-n5', 'unit-ja-restaurant', 'restaurant-pay',
   'Paying the bill', 'You have finished eating and want to pay.', true, 1),
  ('dlg-ja-konbini-buy', 'lang-ja', 'lvl-ja-n5', 'unit-ja-konbini', 'konbini-buy',
   'Buying lunch', 'You take a bento to the counter at a convenience store.', true, 2),
  ('dlg-ja-konbini-warm', 'lang-ja', 'lvl-ja-n5', 'unit-ja-konbini', 'konbini-warm',
   'Asking them to heat it', 'You would like your bento warmed up.', true, 3),
  ('dlg-ja-station-ticket', 'lang-ja', 'lvl-ja-n5', 'unit-ja-station', 'station-ticket',
   'Buying a ticket', 'You are at a station and need to get to Kyoto.', true, 4),
  ('dlg-ja-station-lost', 'lang-ja', 'lvl-ja-n5', 'unit-ja-station', 'station-lost',
   'Finding the right platform', 'You cannot find your platform and ask for help.', true, 5)
ON CONFLICT (language_id, code) DO NOTHING;

INSERT INTO dialogue_turns (id, dialogue_id, index, speaker, text, reading_kana, translation) VALUES
  -- Ordering a meal
  ('dt-rest-order-0', 'dlg-ja-restaurant-order', 0, 'other', 'いらっしゃいませ。', 'いらっしゃいませ。', 'Welcome!'),
  ('dt-rest-order-1', 'dlg-ja-restaurant-order', 1, 'learner', 'すみません、メニューをください。', 'すみません、メニューおください。', 'Excuse me, the menu please.'),
  ('dt-rest-order-2', 'dlg-ja-restaurant-order', 2, 'other', 'はい、どうぞ。', 'はい、どうぞ。', 'Here you are.'),
  ('dt-rest-order-3', 'dlg-ja-restaurant-order', 3, 'learner', 'これをお願いします。', 'これおおねがいします。', 'This one, please.'),
  ('dt-rest-order-4', 'dlg-ja-restaurant-order', 4, 'other', 'お飲み物は。', 'おのみものわ。', 'And to drink?'),
  ('dt-rest-order-5', 'dlg-ja-restaurant-order', 5, 'learner', 'お水をお願いします。', 'おみずおおねがいします。', 'Water, please.'),

  -- Paying
  ('dt-rest-pay-0', 'dlg-ja-restaurant-pay', 0, 'learner', 'すみません、お会計をお願いします。', 'すみません、おかいけいおおねがいします。', 'Excuse me, the bill please.'),
  ('dt-rest-pay-1', 'dlg-ja-restaurant-pay', 1, 'other', '千二百円です。', 'せんにひゃくえんです。', 'That is 1,200 yen.'),
  ('dt-rest-pay-2', 'dlg-ja-restaurant-pay', 2, 'learner', 'カードでいいですか。', 'かーどでいいですか。', 'Is a card all right?'),
  ('dt-rest-pay-3', 'dlg-ja-restaurant-pay', 3, 'other', 'はい、大丈夫です。', 'はい、だいじょうぶです。', 'Yes, that is fine.'),
  ('dt-rest-pay-4', 'dlg-ja-restaurant-pay', 4, 'learner', 'ごちそうさまでした。', 'ごちそうさまでした。', 'Thank you for the meal.'),

  -- Konbini: buying
  ('dt-konbini-buy-0', 'dlg-ja-konbini-buy', 0, 'other', 'いらっしゃいませ。', 'いらっしゃいませ。', 'Welcome!'),
  ('dt-konbini-buy-1', 'dlg-ja-konbini-buy', 1, 'other', 'お弁当は一つですか。', 'おべんとうわひとつですか。', 'Just the one bento?'),
  ('dt-konbini-buy-2', 'dlg-ja-konbini-buy', 2, 'learner', 'はい、一つです。', 'はい、ひとつです。', 'Yes, one.'),
  ('dt-konbini-buy-3', 'dlg-ja-konbini-buy', 3, 'other', '五百円です。', 'ごひゃくえんです。', 'That is 500 yen.'),
  ('dt-konbini-buy-4', 'dlg-ja-konbini-buy', 4, 'learner', 'はい、どうぞ。', 'はい、どうぞ。', 'Here you go.'),

  -- Konbini: warming
  ('dt-konbini-warm-0', 'dlg-ja-konbini-warm', 0, 'other', 'お弁当は温めますか。', 'おべんとうわあたためますか。', 'Shall I warm the bento?'),
  ('dt-konbini-warm-1', 'dlg-ja-konbini-warm', 1, 'learner', 'はい、お願いします。', 'はい、おねがいします。', 'Yes please.'),
  ('dt-konbini-warm-2', 'dlg-ja-konbini-warm', 2, 'other', 'お箸はいりますか。', 'おはしわいりますか。', 'Do you need chopsticks?'),
  ('dt-konbini-warm-3', 'dlg-ja-konbini-warm', 3, 'learner', 'いいえ、大丈夫です。', 'いいえ、だいじょうぶです。', 'No, I am fine.'),

  -- Station: ticket
  ('dt-station-ticket-0', 'dlg-ja-station-ticket', 0, 'learner', 'すみません、京都までいくらですか。', 'すみません、きょうとまでいくらですか。', 'Excuse me, how much is it to Kyoto?'),
  ('dt-station-ticket-1', 'dlg-ja-station-ticket', 1, 'other', '千四百円です。', 'せんよんひゃくえんです。', 'It is 1,400 yen.'),
  ('dt-station-ticket-2', 'dlg-ja-station-ticket', 2, 'learner', '切符を二枚ください。', 'きっぷおにまいください。', 'Two tickets, please.'),
  ('dt-station-ticket-3', 'dlg-ja-station-ticket', 3, 'other', 'はい、二千八百円です。', 'はい、にせんはっぴゃくえんです。', 'Right, 2,800 yen.'),

  -- Station: lost
  ('dt-station-lost-0', 'dlg-ja-station-lost', 0, 'learner', 'すみません、京都行きはどこですか。', 'すみません、きょうとゆきわどこですか。', 'Excuse me, where is the train for Kyoto?'),
  ('dt-station-lost-1', 'dlg-ja-station-lost', 1, 'other', '三番線です。', 'さんばんせんです。', 'Platform three.'),
  ('dt-station-lost-2', 'dlg-ja-station-lost', 2, 'learner', '何時に出ますか。', 'なんじにでますか。', 'What time does it leave?'),
  ('dt-station-lost-3', 'dlg-ja-station-lost', 3, 'other', '十時半です。', 'じゅうじはんです。', 'Half past ten.'),
  ('dt-station-lost-4', 'dlg-ja-station-lost', 4, 'learner', 'ありがとうございます。', 'ありがとうございます。', 'Thank you very much.')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- The reply options.
--
-- One correct per learner turn. Every wrong one names the specific mistake —
-- that is the whole reason this feature is scripted rather than generated: a
-- model can hold a conversation, but it cannot reliably tell you which
-- particle you got wrong and why.
-- ---------------------------------------------------------------------------

INSERT INTO dialogue_replies (id, turn_id, text, reading_kana, translation, is_correct, why_wrong, sort_index) VALUES
  -- "Excuse me, the menu please."
  ('dr-rest-order-1a', 'dt-rest-order-1', 'すみません、メニューをください。', 'すみません、メニューおください。', 'Excuse me, the menu please.', true, null, 0),
  ('dr-rest-order-1b', 'dt-rest-order-1', 'すみません、メニューがください。', 'すみません、メニューがください。', null, false,
   'ください takes を, not が. が marks the thing doing something; you are asking FOR the menu, not saying the menu acts.', 1),
  ('dr-rest-order-1c', 'dt-rest-order-1', 'すみません、メニューをくれ。', 'すみません、メニューおくれ。', null, false,
   'くれ is the bare command form of くれる. It is what you say to a younger brother, not to someone serving you.', 2),

  -- "This one, please."
  ('dr-rest-order-3a', 'dt-rest-order-3', 'これをお願いします。', 'これおおねがいします。', 'This one, please.', true, null, 0),
  ('dr-rest-order-3b', 'dt-rest-order-3', 'それをお願いします。', 'それおおねがいします。', null, false,
   'それ is "that one, near you". The menu is in your hands, so これ is the one you want.', 1),
  ('dr-rest-order-3c', 'dt-rest-order-3', 'これはお願いします。', 'これわおねがいします。', null, false,
   'は makes これ the topic — "as for this one" — which sets up a contrast you never finish. Ordering takes を.', 2),

  -- "Water, please."
  ('dr-rest-order-5a', 'dt-rest-order-5', 'お水をお願いします。', 'おみずおおねがいします。', 'Water, please.', true, null, 0),
  ('dr-rest-order-5b', 'dt-rest-order-5', 'お水がほしいです。', 'おみずがほしいです。', null, false,
   'ほしい states your own desire and is blunt to a stranger. お願いします asks, which is what you want with someone serving you.', 1),
  ('dr-rest-order-5c', 'dt-rest-order-5', 'お水をお願います。', 'おみずおおねがいます。', null, false,
   'お願いします comes from 願う, so the stem is 願い — お願います drops the い and is not a word.', 2),

  -- "Excuse me, the bill please."
  ('dr-rest-pay-0a', 'dt-rest-pay-0', 'すみません、お会計をお願いします。', 'すみません、おかいけいおおねがいします。', 'Excuse me, the bill please.', true, null, 0),
  ('dr-rest-pay-0b', 'dt-rest-pay-0', 'すみません、お金をお願いします。', 'すみません、おかねおおねがいします。', null, false,
   'お金 is money itself — this asks them to give you some. The bill is お会計.', 1),
  ('dr-rest-pay-0c', 'dt-rest-pay-0', 'すみません、お会計をください。', 'すみません、おかいけいおください。', null, false,
   'Understandable, but ください asks for an object handed over. For a service — settling up — お願いします is what is said.', 2),

  -- "Is a card all right?"
  ('dr-rest-pay-2a', 'dt-rest-pay-2', 'カードでいいですか。', 'かーどでいいですか。', 'Is a card all right?', true, null, 0),
  ('dr-rest-pay-2b', 'dt-rest-pay-2', 'カードをいいですか。', 'かーどおいいですか。', null, false,
   'いい is an adjective, not a verb, so it takes no object. で marks the means — paying BY card.', 1),
  ('dr-rest-pay-2c', 'dt-rest-pay-2', 'カードがいいですか。', 'かーどがいいですか。', null, false,
   'が here asks which THEY would prefer, as if offering them a choice. で asks whether your card is acceptable.', 2),

  -- "Thank you for the meal."
  ('dr-rest-pay-4a', 'dt-rest-pay-4', 'ごちそうさまでした。', 'ごちそうさまでした。', 'Thank you for the meal.', true, null, 0),
  ('dr-rest-pay-4b', 'dt-rest-pay-4', 'いただきます。', 'いただきます。', null, false,
   'いただきます is said BEFORE eating. Afterwards it is ごちそうさまでした.', 1),
  ('dr-rest-pay-4c', 'dt-rest-pay-4', 'おいしいでした。', 'おいしいでした。', null, false,
   'おいしい is an i-adjective and carries its own past: おいしかったです. い-adjectives never take でした.', 2),

  -- "Yes, one."
  ('dr-konbini-buy-2a', 'dt-konbini-buy-2', 'はい、一つです。', 'はい、ひとつです。', 'Yes, one.', true, null, 0),
  ('dr-konbini-buy-2b', 'dt-konbini-buy-2', 'はい、一個です。', 'はい、いっこです。', null, false,
   'Not wrong exactly, but they asked with 一つ. Answering with the counter they used is what a native does.', 1),
  ('dr-konbini-buy-2c', 'dt-konbini-buy-2', 'はい、一人です。', 'はい、ひとりです。', null, false,
   '人 counts people. A bento takes つ — Japanese counters classify by what is being counted.', 2),

  -- "Yes please." (warming)
  ('dr-konbini-warm-1a', 'dt-konbini-warm-1', 'はい、お願いします。', 'はい、おねがいします。', 'Yes please.', true, null, 0),
  ('dr-konbini-warm-1b', 'dt-konbini-warm-1', 'はい、温めます。', 'はい、あたためます。', null, false,
   'That says YOU will warm it. They offered to do it, so you accept rather than announce.', 1),
  ('dr-konbini-warm-1c', 'dt-konbini-warm-1', 'はい、ありがとう。', 'はい、ありがとう。', null, false,
   'Thanking them before they have done it is odd, and plain ありがとう is too casual for a shop.', 2),

  -- "No, I am fine." (chopsticks)
  ('dr-konbini-warm-3a', 'dt-konbini-warm-3', 'いいえ、大丈夫です。', 'いいえ、だいじょうぶです。', 'No, I am fine.', true, null, 0),
  ('dr-konbini-warm-3b', 'dt-konbini-warm-3', 'いいえ、いりません。', 'いいえ、いりません。', null, false,
   'Correct Japanese, but flat — it is the tone of refusing a form you did not ask for. 大丈夫です softens it.', 1),
  ('dr-konbini-warm-3c', 'dt-konbini-warm-3', 'いいえ、いいです。', 'いいえ、いいです。', null, false,
   'いいです is genuinely ambiguous — it can mean "yes, good" or "no thanks" — and shop staff often have to ask again.', 2),

  -- "Two tickets, please."
  ('dr-station-ticket-2a', 'dt-station-ticket-2', '切符を二枚ください。', 'きっぷおにまいください。', 'Two tickets, please.', true, null, 0),
  ('dr-station-ticket-2b', 'dt-station-ticket-2', '切符を二つください。', 'きっぷおふたつください。', null, false,
   'つ is the general counter. A ticket is flat, and flat things take 枚 — 二枚.', 1),
  ('dr-station-ticket-2c', 'dt-station-ticket-2', '二枚切符をください。', 'にまいきっぷおください。', null, false,
   'The counter goes after the thing it counts: 切符を二枚, not 二枚切符を.', 2),

  -- "Excuse me, where is the train for Kyoto?"
  ('dr-station-lost-0a', 'dt-station-lost-0', 'すみません、京都行きはどこですか。', 'すみません、きょうとゆきわどこですか。', 'Excuse me, where is the train for Kyoto?', true, null, 0),
  ('dr-station-lost-0b', 'dt-station-lost-0', 'すみません、京都行きがどこですか。', 'すみません、きょうとゆきがどこですか。', null, false,
   'どこ is the question word, so が belongs with it — どこですか already asks. The thing you are asking about takes は.', 1),
  ('dr-station-lost-0c', 'dt-station-lost-0', 'すみません、京都はどこに行きますか。', 'すみません、きょうとわどこにいきますか。', null, false,
   'That asks where Kyoto goes. You want the platform, so ask about 京都行き — the Kyoto-bound train.', 2),

  -- "What time does it leave?"
  ('dr-station-lost-2a', 'dt-station-lost-2', '何時に出ますか。', 'なんじにでますか。', 'What time does it leave?', true, null, 0),
  ('dr-station-lost-2b', 'dt-station-lost-2', '何時は出ますか。', 'なんじわでますか。', null, false,
   'A question word can never take は — you cannot make a topic of the thing you are asking about.', 1),
  ('dr-station-lost-2c', 'dt-station-lost-2', 'いつに出ますか。', 'いつにでますか。', null, false,
   'いつ takes no に, and it asks "when" in general. For a clock time the word is 何時.', 2)
ON CONFLICT (id) DO NOTHING;
