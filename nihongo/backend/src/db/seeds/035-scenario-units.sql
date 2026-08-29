-- More places to have a conversation in.
--
-- 008 created four scenario units and they were vocabulary-only; the dialogues
-- in 028 were the first non-vocabulary content in any of them. These twelve
-- exist to GROUP conversations, so they carry no word lists — a unit with no
-- study items simply does not appear in the deck picker, which is the right
-- behaviour until vocabulary is assigned.
--
-- sort_index starts at 20, after the existing four (10–13).

INSERT INTO curriculum_units (id, language_id, level_id, code, title, description, published, sort_index) VALUES
  ('unit-ja-home',      'lang-ja', 'lvl-ja-n5', 'home',      'Around the house',   'Rooms, chores, and the small exchanges of living somewhere.', true, 20),
  ('unit-ja-comings',   'lang-ja', 'lvl-ja-n5', 'comings',   'Coming and going',   'The set phrases nobody translates: いってきます, ただいま, おかえり.', true, 21),
  ('unit-ja-cooking',   'lang-ja', 'lvl-ja-n5', 'cooking',   'Cooking and meals',  'Making dinner, laying the table, and what is in the fridge.', true, 22),
  ('unit-ja-bath',      'lang-ja', 'lvl-ja-n5', 'bath',      'The bath',           'おふろ is a household institution, with its own vocabulary.', true, 23),
  ('unit-ja-health',    'lang-ja', 'lvl-ja-n5', 'health',    'Doctor and dentist', 'Saying where it hurts, and understanding what you are told.', true, 24),
  ('unit-ja-shopping',  'lang-ja', 'lvl-ja-n5', 'shopping',  'Shopping',           'Supermarkets, department stores, and asking for a size.', true, 25),
  ('unit-ja-work',      'lang-ja', 'lvl-ja-n5', 'work',      'At work',            'Arriving, leaving, and the phrases that bracket a working day.', true, 26),
  ('unit-ja-school',    'lang-ja', 'lvl-ja-n5', 'school',    'At school',          'Classes, homework, and asking a teacher something.', true, 27),
  ('unit-ja-travel',    'lang-ja', 'lvl-ja-n5', 'travel',    'Travelling',         'Hotels, taxis, airports and asking the way.', true, 28),
  ('unit-ja-social',    'lang-ja', 'lvl-ja-n5', 'social',    'Friends and plans',  'Making arrangements, cancelling them, and apologising.', true, 29),
  ('unit-ja-phone',     'lang-ja', 'lvl-ja-n5', 'phone',     'On the phone',       'もしもし, and the fact that phone Japanese has its own rules.', true, 30),
  ('unit-ja-services',  'lang-ja', 'lvl-ja-n5', 'services',  'Errands',            'Post office, bank, hairdresser, dry cleaner.', true, 31)
ON CONFLICT (language_id, code) DO NOTHING;
