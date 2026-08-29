-- Japanese, its JLPT levels, and the feature switches that tell the app which
-- modules apply. Adding French later is another row here plus its own levels;
-- no schema change.

INSERT INTO languages (id, code, name, native_name, script_direction, active, sort_index)
VALUES ('lang-ja', 'ja', 'Japanese', '日本語', 'ltr', true, 0)
ON CONFLICT (code) DO NOTHING;

-- rank 1 = easiest, so queries never need to know whether the scheme is JLPT
-- (N5..N1, counting down) or CEFR (A1..C2, counting up).
INSERT INTO language_levels (id, language_id, code, name, rank, description, sort_index) VALUES
  ('lvl-ja-n5', 'lang-ja', 'N5', 'JLPT N5', 1, 'Basic. ~800 words, ~100 kanji, ~135 grammar points.', 0),
  ('lvl-ja-n4', 'lang-ja', 'N4', 'JLPT N4', 2, 'Elementary. ~1,500 words, ~300 kanji.', 1),
  ('lvl-ja-n3', 'lang-ja', 'N3', 'JLPT N3', 3, 'Intermediate. ~3,700 words, ~650 kanji.', 2),
  ('lvl-ja-n2', 'lang-ja', 'N2', 'JLPT N2', 4, 'Upper intermediate. ~6,000 words, ~1,000 kanji.', 3),
  ('lvl-ja-n1', 'lang-ja', 'N1', 'JLPT N1', 5, 'Advanced. ~10,000 words, ~2,000 kanji.', 4)
ON CONFLICT (language_id, code) DO NOTHING;

INSERT INTO language_features (id, language_id, key, enabled, config) VALUES
  ('feat-ja-kanji',        'lang-ja', 'kanji',        true,  '{}'),
  ('feat-ja-furigana',     'lang-ja', 'furigana',     true,  '{"defaultMode":"unknown-only"}'),
  ('feat-ja-stroke-order', 'lang-ja', 'stroke-order', true,  '{"source":"kanjivg"}'),
  ('feat-ja-handwriting',  'lang-ja', 'handwriting',  true,  '{"defaultTolerance":0.5}'),
  ('feat-ja-pitch-accent', 'lang-ja', 'pitch-accent', true,  '{"source":"kanjium"}'),
  ('feat-ja-conjugation',  'lang-ja', 'conjugation',  true,  '{}'),
  ('feat-ja-romanisation', 'lang-ja', 'romanisation', false, '{"system":"hepburn"}')
ON CONFLICT (language_id, key) DO NOTHING;
