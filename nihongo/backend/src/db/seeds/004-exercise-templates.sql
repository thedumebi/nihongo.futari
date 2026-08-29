-- The exercise engine's configuration.
--
-- `typed-cloze` is the default everywhere it can apply: producing an answer
-- beats recognising one. `mcq` is marked first_exposure_only so it introduces
-- an item and then gets out of the way — staying multiple-choice forever is
-- exactly what Bunpo gets criticised for.

INSERT INTO exercise_templates
  (id, code, language_id, name, applies_to_kinds, applies_to_facets, input_mode, grader_code, requires, first_exposure_only, config, weight, active)
VALUES
  ('tpl-typed-cloze', 'typed-cloze', NULL, 'Type the missing piece',
   ARRAY['word','grammar','kanji'], ARRAY['production','usage'],
   'text', 'normalised-jp', '{"sentence":true}', false, '{}', 10, true),

  ('tpl-mcq', 'mcq', NULL, 'Multiple choice',
   ARRAY['kana','kanji','word','grammar'], ARRAY['meaning','reading','usage'],
   'choice', 'choice-id', '{}', true, '{"choices":4}', 5, true),

  ('tpl-reading-input', 'reading-input', 'lang-ja', 'Type the reading',
   ARRAY['kanji','word'], ARRAY['reading'],
   'text', 'exact-kana', '{}', false, '{}', 8, true),

  ('tpl-listening', 'listening', NULL, 'Listen and choose',
   ARRAY['word','sentence'], ARRAY['listening'],
   'choice', 'choice-id', '{"audio":true}', false, '{"choices":4}', 4, true),

  ('tpl-dictation', 'dictation', NULL, 'Listen and type',
   ARRAY['word','sentence'], ARRAY['listening','production'],
   'text', 'normalised-jp', '{"audio":true}', false, '{}', 3, true),

  ('tpl-word-order', 'word-order', NULL, 'Arrange the sentence',
   ARRAY['grammar','sentence'], ARRAY['usage','production'],
   'ordering', 'sequence', '{"sentence":true}', false, '{}', 4, true),

  ('tpl-handwriting', 'handwriting', 'lang-ja', 'Write the character',
   ARRAY['kana','kanji'], ARRAY['writing'],
   'canvas', 'stroke-match', '{"strokes":true}', false, '{}', 6, true),

  ('tpl-conjugation-drill', 'conjugation-drill', 'lang-ja', 'Conjugate',
   ARRAY['word','grammar'], ARRAY['production'],
   'text', 'normalised-jp', '{}', false, '{}', 6, true),

  ('tpl-sound-series-pick', 'sound-series-pick', 'lang-ja', 'Predict the on-reading',
   ARRAY['kanji','phonetic-series'], ARRAY['reading'],
   'choice', 'choice-id', '{}', false, '{"choices":4}', 3, true)
ON CONFLICT (code, language_id) DO NOTHING;

-- Default template pool per (kind, facet). A few dozen rows of config; per-item
-- overrides go in study_item_facet_templates and stay sparse.
INSERT INTO kind_facet_templates (id, language_id, kind, facet, template_id, weight, first_exposure_only) VALUES
  ('kft-kana-reading-mcq',        'lang-ja', 'kana',    'reading',    'tpl-mcq',               5, true),
  ('kft-kana-reading-input',      'lang-ja', 'kana',    'reading',    'tpl-reading-input',    10, false),
  ('kft-kana-writing',            'lang-ja', 'kana',    'writing',    'tpl-handwriting',      10, false),

  ('kft-kanji-meaning-mcq',       'lang-ja', 'kanji',   'meaning',    'tpl-mcq',               5, true),
  ('kft-kanji-reading-input',     'lang-ja', 'kanji',   'reading',    'tpl-reading-input',    10, false),
  ('kft-kanji-reading-series',    'lang-ja', 'kanji',   'reading',    'tpl-sound-series-pick', 3, false),
  ('kft-kanji-writing',           'lang-ja', 'kanji',   'writing',    'tpl-handwriting',      10, false),

  ('kft-word-meaning-mcq',        'lang-ja', 'word',    'meaning',    'tpl-mcq',               5, true),
  ('kft-word-production-cloze',   'lang-ja', 'word',    'production', 'tpl-typed-cloze',      10, false),
  ('kft-word-reading-input',      'lang-ja', 'word',    'reading',    'tpl-reading-input',     8, false),
  ('kft-word-listening',          'lang-ja', 'word',    'listening',  'tpl-listening',         4, false),

  ('kft-grammar-usage-mcq',       'lang-ja', 'grammar', 'usage',      'tpl-mcq',               5, true),
  ('kft-grammar-usage-cloze',     'lang-ja', 'grammar', 'usage',      'tpl-typed-cloze',      10, false),
  ('kft-grammar-usage-order',     'lang-ja', 'grammar', 'usage',      'tpl-word-order',        4, false),
  ('kft-grammar-production-conj', 'lang-ja', 'grammar', 'production', 'tpl-conjugation-drill', 6, false)
ON CONFLICT (language_id, kind, facet, template_id) DO NOTHING;
