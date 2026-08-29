-- Modest and habit-oriented. Streak freeze does more for retention than any of
-- these, but they cost nothing to add.

INSERT INTO achievements (id, code, language_id, title, description, icon, category, threshold_kind, threshold, secret, sort_index) VALUES
  ('ach-first-review',  'first-review',  NULL, 'First review',      'You reviewed your first item.',            'sparkles',   'milestone', 'reviews',       1,     false, 0),
  ('ach-reviews-100',   'reviews-100',   NULL, 'Hundred down',      '100 reviews completed.',                   'check',      'milestone', 'reviews',       100,   false, 1),
  ('ach-reviews-1000',  'reviews-1000',  NULL, 'Thousand down',     '1,000 reviews completed.',                 'check-check','milestone', 'reviews',       1000,  false, 2),
  ('ach-reviews-10000', 'reviews-10000', NULL, 'Ten thousand',      '10,000 reviews completed.',                'trophy',     'milestone', 'reviews',       10000, false, 3),

  ('ach-streak-7',      'streak-7',      NULL, 'One week',          'Seven days in a row.',                     'flame',      'streak',    'streak',        7,     false, 10),
  ('ach-streak-30',     'streak-30',     NULL, 'One month',         'Thirty days in a row.',                    'flame',      'streak',    'streak',        30,    false, 11),
  ('ach-streak-100',    'streak-100',    NULL, 'Hundred days',      'One hundred days in a row.',               'flame',      'streak',    'streak',        100,   false, 12),
  ('ach-streak-365',    'streak-365',    NULL, 'One year',          'Three hundred and sixty-five days.',       'flame',      'streak',    'streak',        365,   false, 13),

  ('ach-kanji-100',     'kanji-100',     'lang-ja', 'Hundred kanji', '100 kanji known well enough to drop furigana.', 'pen-tool', 'kanji', 'kanji-known', 100,  false, 20),
  ('ach-kanji-500',     'kanji-500',     'lang-ja', 'Five hundred',  '500 kanji known.',                        'pen-tool',   'kanji',     'kanji-known',   500,   false, 21),
  ('ach-kanji-2136',    'kanji-2136',    'lang-ja', 'Jōyō',          'All 2,136 jōyō kanji known.',             'award',      'kanji',     'kanji-known',   2136,  false, 22),

  ('ach-items-500',     'items-500',     NULL, 'Five hundred items','500 items learned.',                       'library',    'milestone', 'items-learned', 500,   false, 30),
  ('ach-accuracy-90',   'accuracy-90',   NULL, 'Sharp',             '90% accuracy over a 30-day window.',       'target',     'quality',   'accuracy',      90,    false, 40),
  ('ach-handwriting-50','handwriting-50','lang-ja', 'Steady hand',   '50 characters written correctly first try.','edit-3',    'kanji',     'handwriting',   50,    true,  50)
ON CONFLICT (code) DO NOTHING;
