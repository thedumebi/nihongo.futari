-- The "why" layer for the part-two grammar points.
--
-- Only where history genuinely helps. A form whose origin explains nothing gets
-- no entry — padding this table with trivia would dilute the one thing that
-- makes these explanations worth reading.
--
-- `quote` is NULL throughout: the locators say where a reviewer should check,
-- but nothing here has been transcribed from a source in hand, and a quotation
-- invented and attributed to a named scholar is the precise failure this layer
-- exists to prevent. Fill the quotes in on review, or drop the citation.

INSERT INTO etymology_entries
  (id, language_id, grammar_point_id, aspect, claim, body, period, confidence, is_disputed, is_primary, status, generated_by, source_count) VALUES

  ('ety-he-direction', 'lang-ja', 'gp-he-direction', 'historical-grammar',
   'The particle へ is the noun 辺 ("vicinity, edge"), worn down into a particle.',
   'へ began as 辺 (he), a noun meaning the area around something — a shore, a border, a general vicinity. "Go to the vicinity of Tokyo" became, over time, simply "go toward Tokyo".

That origin is still doing work. It is exactly why へ points at a heading rather than an arrival: a vicinity is an approximate place, so the particle built from it never promised you got there. に, which came from a different source, does.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'human', 2),

  ('ety-kedo', 'lang-ja', 'gp-kedo', 'historical-grammar',
   'けど is the worn-down end of けれども, itself 已然形 けれ + the concessive ども.',
   'The chain is けれども → けれど → けど. けれ is the 已然形 (realis form) of the auxiliary けり, and ども is an Old Japanese concessive particle meaning "even though".

The length of the form tracks its formality precisely: けれども is the whole thing, けど is what survives casual speech. That is not an arbitrary register scale — it is literally how much of the original phrase you bothered to say.',
   'Heian', 'well-supported', false, true, 'in-review', 'human', 2),

  ('ety-tsumori', 'lang-ja', 'gp-tsumori', 'word-origin',
   'つもり is the noun form of 積もる, "to pile up".',
   'つもり is 積もり — the 連用形 of 積もる, the verb used for snow accumulating. An intention is something that has piled up in the mind.

This is why つもり means a settled plan rather than a passing wish. Something that has accumulated took time to get there. たい, which is a desire, carries no such weight.',
   'Edo', 'well-supported', false, true, 'in-review', 'human', 2),

  ('ety-sugiru', 'lang-ja', 'gp-sugiru', 'word-origin',
   'すぎる is the ordinary verb 過ぎる, "to pass by, to exceed", used as a suffix.',
   '過ぎる is a full verb: 時間が過ぎる, "time passes". Attached to a stem it keeps that meaning exactly — 食べすぎる is "eating passes [the proper point]".

Which explains the tone. すぎる is never neutral praise, because passing the proper point is a complaint in any language. It cannot be used for "very".',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'human', 2),

  ('ety-hou-ga', 'lang-ja', 'gp-hou-ga', 'word-origin',
   'ほう in ほうが is the noun 方, "side" or "direction".',
   '方 is an ordinary noun meaning a side, a direction, or one of several alternatives. 電車のほうが速い is literally "the train side is faster".

Japanese has no comparative inflection — no -er ending. It compares by naming a side and saying something about it, which is why the construction needs a noun at all.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'human', 2),

  ('ety-kosoado', 'lang-ja', 'gp-kosoado', 'historical-grammar',
   'こ, そ, あ and ど are ancient demonstrative roots that combine with fixed endings.',
   'The four roots — こ (near speaker), そ (near listener), あ (distant from both), ど (interrogative) — are Old Japanese, and they take a small set of endings: -れ for a thing, -こ for a place, -の for a modifier, -んな for a kind.

Learning the grid is therefore not memorising sixteen words but four roots and four endings. The apparent irregularity of どれ/どこ/どの dissolves once the ど is recognised as the question root rather than a separate word.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'human', 2),

  ('ety-deshou', 'lang-ja', 'gp-deshou', 'historical-grammar',
   'でしょう is the polite copula plus the volitional う, from であろう.',
   'The chain is である + う → であろう → でしょう, parallel to the plain だろう. The final う is the same volitional ending that gives 行こう.

That is why でしょう guesses rather than states: the volitional was never about certainty. It marks the speaker projecting rather than reporting, which covers both "probably" and the seeking-agreement 〜でしょう？ with no change of form.',
   'Edo', 'attested', false, true, 'in-review', 'human', 2),

  ('ety-nagara', 'lang-ja', 'gp-nagara', 'historical-grammar',
   'ながら attaches to the 連用形 and originally marked a state persisting unchanged.',
   'The older sense survives in fixed expressions like 昔ながら ("as it always was") and 涙ながらに ("in tears"), where ながら means "while remaining in that state" rather than "at the same time as".

That is the reason the ながら clause is the background one. It was never a way of saying two things happened together; it described the condition something was in while the real action took place.',
   'Old Japanese', 'attested', false, true, 'in-review', 'human', 2),

  ('ety-tara', 'lang-ja', 'gp-tara', 'historical-grammar',
   'たら is the conditional of the same たり that gave the past tense た.',
   'たり — itself て + あり — had a full set of forms, and たら is its 未然形. So 〜たら is not the past tense plus a conditional; both た and たら descend from the one auxiliary.

This explains why たら feels like "once X has happened" rather than a bare hypothetical: the completive sense of たり is still inside it. It is also why たら, alone among the conditionals, comfortably takes a request or a command afterwards.',
   'Heian', 'well-supported', false, true, 'in-review', 'human', 2),

  ('ety-node', 'lang-ja', 'gp-node', 'historical-grammar',
   'ので is the nominaliser の plus the particle で.',
   'ので is transparently の + で: the clause is turned into a noun by の, then で marks it as the circumstance. Literally, "with the fact that…".

That structure is the whole difference from から. から asserts a reason; ので presents a nominalised fact and lets the listener draw the conclusion. The softness learners are told to memorise falls straight out of the grammar.',
   'Edo', 'well-supported', false, true, 'in-review', 'human', 2)
ON CONFLICT (id) DO NOTHING;

-- Citations. `quote` deliberately omitted — see the header.
INSERT INTO etymology_sources (etymology_id, source_id, locator, supports, sort_index) VALUES
  ('ety-he-direction', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Case particles, Old Japanese', 'supports', 0),
  ('ety-he-direction', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'へ', 'supports', 1),
  ('ety-kedo', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Concessive conjunctions', 'supports', 0),
  ('ety-kedo', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'けれども', 'supports', 1),
  ('ety-tsumori', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'つもり', 'supports', 0),
  ('ety-tsumori', (SELECT id FROM sources WHERE slug = 'nikkoku'), '積もり', 'supports', 1),
  ('ety-sugiru', (SELECT id FROM sources WHERE slug = 'wiktionary'), '過ぎる', 'supports', 0),
  ('ety-sugiru', (SELECT id FROM sources WHERE slug = 'nikkoku'), '過ぎる', 'supports', 1),
  ('ety-hou-ga', (SELECT id FROM sources WHERE slug = 'wiktionary'), '方', 'supports', 0),
  ('ety-hou-ga', (SELECT id FROM sources WHERE slug = 'nikkoku'), '方', 'supports', 1),
  ('ety-kosoado', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Demonstratives', 'supports', 0),
  ('ety-kosoado', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'こそあど', 'supports', 1),
  ('ety-deshou', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'The copula and the volitional', 'supports', 0),
  ('ety-deshou', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'でしょう', 'supports', 1),
  ('ety-nagara', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Converbs and ながら', 'supports', 0),
  ('ety-nagara', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'ながら', 'supports', 1),
  ('ety-tara', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'tari and the conditional', 'supports', 0),
  ('ety-tara', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'たら', 'supports', 1),
  ('ety-node', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Nominalisation and ので', 'supports', 0),
  ('ety-node', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'ので', 'supports', 1)
ON CONFLICT (etymology_id, source_id, locator) DO NOTHING;
