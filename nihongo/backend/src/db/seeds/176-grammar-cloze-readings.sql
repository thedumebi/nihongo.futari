-- Readings for the twenty grammar fill-the-blank cards.
--
-- These cards stored a sentence with its blank and no reading, so they were
-- shown as plain text: no furigana in any mode, and kanji left as kanji in
-- hiragana mode (言 in もういちど言っ＿＿ください had nothing over it). Each now
-- carries the reading of the whole sentence, answer filled in, written the way
-- every authored line is — spaced, particles as spoken. The card is read whole
-- through the same aligner as every other line, then cut at the blank.
--
-- Written for these twenty and checked by a second reviewer. Additive and
-- guarded: a card that already has a reading is left alone.

UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'つくえ の うえ に ほん が あります。'), updated_at = now()
  WHERE id = 'ep-gp-arimasu-imasu' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'わたし わ がくせい です。'), updated_at = now()
  WHERE id = 'ep-gp-desu' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'ねこ が います。'), updated_at = now()
  WHERE id = 'ep-gp-ga-particle' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'あなた わ がくせい です か。'), updated_at = now()
  WHERE id = 'ep-gp-ka-question' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'さむい から、まど お しめます。'), updated_at = now()
  WHERE id = 'ep-gp-kara-reason' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'もう いちど いって ください。'), updated_at = now()
  WHERE id = 'ep-gp-kudasai' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'いっしょに いきましょう。'), updated_at = now()
  WHERE id = 'ep-gp-mashou' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'まいにち にほんご お べんきょう します。'), updated_at = now()
  WHERE id = 'ep-gp-masu' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'わたし も いきます。'), updated_at = now()
  WHERE id = 'ep-gp-mo-particle' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'きょう わ がっこう え いかない。'), updated_at = now()
  WHERE id = 'ep-gp-nai' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'はやく いかなければ なりません。'), updated_at = now()
  WHERE id = 'ep-gp-nakereba-narimasen' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'しちじ に おきます。'), updated_at = now()
  WHERE id = 'ep-gp-ni-direction' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'これ わ わたし の ほん です。'), updated_at = now()
  WHERE id = 'ep-gp-no-possessive' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'きのう えいが お みた。'), updated_at = now()
  WHERE id = 'ep-gp-ta-form' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'にほん え いきたい です。'), updated_at = now()
  WHERE id = 'ep-gp-tai' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'あさごはん お たべて、がっこう え いきます。'), updated_at = now()
  WHERE id = 'ep-gp-te-form' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'ここ に すわって も いい です か。'), updated_at = now()
  WHERE id = 'ep-gp-te-mo-ii' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'いま ほん お よんで います。'), updated_at = now()
  WHERE id = 'ep-gp-teiru' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'わたし わ にほんご お べんきょう して います。'), updated_at = now()
  WHERE id = 'ep-gp-wa-particle' AND NOT prompt ? 'reading';
UPDATE exercise_prompts SET prompt = prompt || jsonb_build_object('reading', 'ごはん お たべます。'), updated_at = now()
  WHERE id = 'ep-gp-wo-object' AND NOT prompt ? 'reading';
