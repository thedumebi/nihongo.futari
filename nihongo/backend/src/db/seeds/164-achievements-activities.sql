-- Achievements for everything besides reviews.
--
-- The first fourteen (005) counted only flashcards and kanji, so a learner who
-- spent their week on Speak sessions, lessons and conversations had nothing to
-- show for it. These count each kind of activity — distinct things done, so
-- repeating one lesson ten times is one lesson, not ten.
--
-- Idempotent: keyed on code, nothing existing is touched.

INSERT INTO achievements (id, code, language_id, title, description, icon, category, threshold_kind, threshold, secret, sort_index) VALUES
  ('ach-lessons-1',        'lessons-1',        NULL, 'First lesson',        'You finished your first lesson.',            'book-open',   'lessons',  'lessons',        1,   false, 60),
  ('ach-lessons-10',       'lessons-10',       NULL, 'Ten lessons',         'Ten different lessons finished.',            'book-open',   'lessons',  'lessons',        10,  false, 61),
  ('ach-lessons-50',       'lessons-50',       NULL, 'Fifty lessons',       'Fifty different lessons finished.',          'library',     'lessons',  'lessons',        50,  false, 62),

  ('ach-speak-1',          'speak-1',          NULL, 'First words out loud','You finished your first Speak session.',     'mic',         'speaking', 'speak-sessions', 1,   false, 70),
  ('ach-speak-10',         'speak-10',         NULL, 'Ten sessions',        'Ten different Speak sessions finished.',     'mic',         'speaking', 'speak-sessions', 10,  false, 71),
  ('ach-speak-30',         'speak-30',         NULL, 'Finding your voice',  'Thirty different Speak sessions finished.',  'megaphone',   'speaking', 'speak-sessions', 30,  false, 72),

  ('ach-conversations-1',  'conversations-1',  NULL, 'First conversation',  'You practised your first conversation.',     'messages-square', 'speaking', 'conversations', 1, false, 73),
  ('ach-conversations-25', 'conversations-25', NULL, 'Twenty-five chats',   'Twenty-five different conversations.',       'messages-square', 'speaking', 'conversations', 25, false, 74),
  ('ach-conversations-100','conversations-100',NULL, 'Talker',              'One hundred different conversations.',       'messages-square', 'speaking', 'conversations', 100, false, 75),

  ('ach-readings-1',       'readings-1',       NULL, 'First speech',        'You read a speech aloud to the end.',        'scroll-text', 'reading',  'readings',       1,   false, 80),
  ('ach-readings-15',      'readings-15',      NULL, 'Fifteen speeches',    'Fifteen different speeches read aloud.',     'scroll-text', 'reading',  'readings',       15,  false, 81),

  ('ach-crosswords-1',     'crosswords-1',     NULL, 'First crossword',     'You solved your first crossword.',           'grid-3x3',    'games',    'crosswords',     1,   false, 90),
  ('ach-crosswords-25',    'crosswords-25',    NULL, 'Puzzler',             'Twenty-five crosswords solved.',             'grid-3x3',    'games',    'crosswords',     25,  false, 91),

  ('ach-recall-1',         'recall-1',         NULL, 'Hands-free',          'You finished your first recall session.',    'headphones',  'speaking', 'recall',         1,   false, 76)
ON CONFLICT (code) DO NOTHING;
