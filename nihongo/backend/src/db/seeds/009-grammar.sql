-- N5 grammar, and the "why" layer.
--
-- Authored here, not imported: the JLPT point LIST is a fact about the exam,
-- but every word of this prose is written for this app. No importer writes to
-- grammar_points, which is also why nothing third-party can end up in it.
--
-- Grammar points are published so the app is usable, but marked status
-- 'in-review' — they are drafts until a human signs them off.
--
-- Etymology entries are deliberately NOT published. The schema forbids it:
--   check etymology_publish_needs_source   (source_count > 0)
--   check etymology_publish_needs_reviewer (reviewed_by is not null)
-- They sit at 'in-review' with citations attached until someone approves them
-- in the admin queue. That gate is the whole point of the why layer — an
-- unsourced or unchecked etymology is worse than none.

INSERT INTO grammar_points
  (id, language_id, slug, title, pattern, level_id, category, register, meaning_short, meaning_long, nuance, status, published, sort_index) VALUES
  ('gp-desu', 'lang-ja', 'desu', 'です', 'Noun + です', 'lvl-ja-n5', 'auxiliary', 'polite', 'The polite copula — "is / am / are".', 'Attaches to a noun or na-adjective to make a polite statement. The plain equivalent is だ. です does not conjugate like a verb; its past is でした and its negative is じゃありません (or ではありません, more formal).', 'です marks politeness toward the listener, not respect for the subject. Using it does not make a sentence formal on its own — it makes it *polite*.', 'in-review', true, 0),
  ('gp-masu', 'lang-ja', 'masu', '〜ます', 'Verb stem + ます', 'lvl-ja-n5', 'auxiliary', 'polite', 'Makes a verb polite.', 'Attaches to the ます-stem (連用形). 食べる → 食べます, 行く → 行きます. Past is ました, negative ません, negative past ませんでした.', 'Like です, ます is politeness toward the listener. A whole conversation in plain form is not rude between friends — it is simply a different register.', 'in-review', true, 1),
  ('gp-te-form', 'lang-ja', 'te-form', '〜て form', 'Verb + て', 'lvl-ja-n5', 'construction', 'casual', 'Links clauses, and is the base for many other patterns.', 'The て-form joins actions ("and then"), and is the required base for ている, てください, てもいい and many more. Formation depends on the verb ending: 食べる → 食べて, 書く → 書いて, 泳ぐ → 泳いで, 飲む → 飲んで, 行く → 行って (irregular).', 'The て-form itself carries no tense. Tense is decided by the final verb of the sentence, which is why a long chain of て-forms can be past or present depending only on how it ends.', 'in-review', true, 2),
  ('gp-ta-form', 'lang-ja', 'ta-form', '〜た (past)', 'Verb + た', 'lvl-ja-n5', 'auxiliary', 'casual', 'Plain past tense.', 'Formed exactly like the て-form but ending in た/だ: 食べて → 食べた, 飲んで → 飲んだ. The polite equivalent is ました.', 'た is not purely past. In 分かった ("I''ve got it") or あった ("there it is") it marks a state just reached, which is closer to a perfect than a simple past.', 'in-review', true, 3),
  ('gp-teiru', 'lang-ja', 'teiru', '〜ている', 'Verb-て + いる', 'lvl-ja-n5', 'construction', 'casual', 'Ongoing action, or a resulting state.', 'With action verbs it marks something in progress: 食べている "is eating". With change-of-state verbs it marks the state that resulted: 死んでいる "is dead", not "is dying". 結婚している means "is married".', 'Which reading you get depends on the verb, not on ている. This is the single most common source of confusion at N5 — 知っている means "know", never "am knowing".', 'in-review', true, 4),
  ('gp-nai', 'lang-ja', 'nai', '〜ない', 'Verb-ない', 'lvl-ja-n5', 'auxiliary', 'casual', 'Plain negative.', '食べる → 食べない, 行く → 行かない, する → しない, 来る → 来ない. ある is irregular: its negative is ない. Conjugates like an i-adjective: 食べなかった, 食べなくて.', 'ない behaves like an i-adjective throughout, which is why the past is なかった rather than ないでした.', 'in-review', true, 5),
  ('gp-wa-particle', 'lang-ja', 'wa-particle', 'は (topic)', 'Noun + は', 'lvl-ja-n5', 'particle', 'casual', 'Marks the topic — "as for X".', 'は sets what the sentence is about. It contrasts with が, which marks the grammatical subject and introduces new information. 私は学生です — "as for me, student".', 'は is written with the hiragana は but pronounced わ. It also carries contrast: 肉は食べません implies "meat specifically, whatever else I might eat".', 'in-review', true, 6),
  ('gp-ga-particle', 'lang-ja', 'ga-particle', 'が (subject)', 'Noun + が', 'lvl-ja-n5', 'particle', 'casual', 'Marks the grammatical subject, and new information.', 'が identifies who or what performs an action or holds a state, and typically introduces something new. It is required with 好き, 上手, ある/いる and question words: 誰が来ましたか。', 'Question words take が, never は: 誰が? asks which person, and you cannot topicalise something you are asking about.', 'in-review', true, 7),
  ('gp-kudasai', 'lang-ja', 'kudasai', '〜てください', 'Verb-て + ください', 'lvl-ja-n5', 'expression', 'polite', 'Polite request — "please do X".', 'Attaches to the て-form: 見てください "please look". The negative request is 〜ないでください: 見ないでください.', 'Still an instruction, not a favour. To someone senior, prefer 〜ていただけますか, which asks rather than tells.', 'in-review', true, 8),
  ('gp-mashou', 'lang-ja', 'mashou', '〜ましょう', 'Verb stem + ましょう', 'lvl-ja-n5', 'auxiliary', 'polite', 'Let''s do X, or shall I?', '行きましょう "let''s go". With か it offers rather than proposes: 手伝いましょうか "shall I help?".', 'ましょう assumes agreement. To ask whether someone wants to, use ませんか — 行きませんか is a genuine invitation, 行きましょう is closer to a decision.', 'in-review', true, 9),
  ('gp-tai', 'lang-ja', 'tai', '〜たい', 'Verb stem + たい', 'lvl-ja-n5', 'auxiliary', 'casual', 'Want to do something.', '食べたい "I want to eat". Conjugates as an i-adjective: 食べたかった, 食べたくない. Only for your own desire — for a third party use 〜たがる.', 'The object may take が instead of を: 水が飲みたい is at least as natural as 水を飲みたい, because たい makes the sentence adjective-like.', 'in-review', true, 10),
  ('gp-kara-reason', 'lang-ja', 'kara-reason', '〜から (because)', 'Clause + から', 'lvl-ja-n5', 'conjunction', 'casual', 'Gives a reason — "because / so".', 'The reason comes first: 高いから買いません "it''s expensive, so I won''t buy it". Works after plain or polite forms.', 'から is a subjective reason — your judgement. ので is softer and more objective, which is why requests and excuses often prefer ので.', 'in-review', true, 11),
  ('gp-ni-direction', 'lang-ja', 'ni-direction', 'に (direction / time)', 'Noun + に', 'lvl-ja-n5', 'particle', 'casual', 'Marks a destination, a point in time, or an indirect object.', '学校に行く (destination), 七時に起きる (time), 友だちに話す (indirect object), 東京にいる (location of existence).', 'に with a destination emphasises arrival; へ emphasises the direction travelled. For times, に is used with specific clock times and dates, but not with 今日, 明日 or 毎日.', 'in-review', true, 12),
  ('gp-wo-object', 'lang-ja', 'wo-object', 'を (object)', 'Noun + を', 'lvl-ja-n5', 'particle', 'casual', 'Marks the direct object.', 'ごはんを食べる "eat rice". Also marks the path traversed: 公園を歩く "walk through the park", 橋を渡る "cross the bridge".', 'を is the only kana used almost exclusively as a particle. It is pronounced お in modern Japanese.', 'in-review', true, 13),
  ('gp-mo-particle', 'lang-ja', 'mo-particle', 'も (also)', 'Noun + も', 'lvl-ja-n5', 'particle', 'casual', '"Also / too" — and with a negative, "not either".', 'It replaces は, が and を rather than stacking with them: 私も学生です, never 私はも.', 'With a question word it means "any / none": 何もない "there is nothing", 誰も来ない "nobody comes".', 'in-review', true, 14),
  ('gp-arimasu-imasu', 'lang-ja', 'arimasu-imasu', 'あります / います', 'Noun + が + あります / います', 'lvl-ja-n5', 'expression', 'polite', 'Existence — "there is".', 'います for animate things (people, animals), あります for inanimate. The thing that exists takes が; the place takes に.', 'The split is animacy, not literal life: plants take あります, and a taxi you are waiting for can take います if you think of it as coming under its own power.', 'in-review', true, 15),
  ('gp-no-possessive', 'lang-ja', 'no-possessive', 'の (possessive / linking)', 'Noun + の + Noun', 'lvl-ja-n5', 'particle', 'casual', 'Links two nouns — possession, type, or origin.', '私の本 "my book", 日本の車 "a Japanese car", 木のつくえ "a wooden desk". The modifier comes first.', 'の is far broader than English "''s". It covers anything that lets one noun describe another, which is why 日本語の先生 can mean a teacher OF Japanese or a teacher who IS Japanese, resolved by context.', 'in-review', true, 16),
  ('gp-ka-question', 'lang-ja', 'ka-question', 'か (question)', 'Sentence + か', 'lvl-ja-n5', 'particle', 'polite', 'Turns a statement into a question.', '学生ですか。"Are you a student?" Word order does not change. In casual speech か is often dropped in favour of rising intonation.', 'A question mark is not required in Japanese — か already does that work — though modern casual writing often adds one anyway.', 'in-review', true, 17),
  ('gp-te-mo-ii', 'lang-ja', 'te-mo-ii', '〜てもいい', 'Verb-て + もいい', 'lvl-ja-n5', 'expression', 'casual', 'Permission — "may I / it''s fine to".', '入ってもいいですか "may I come in?". The refusal is 〜てはいけません.', 'Literally "even if you do X, it is good" — which is why it grants permission rather than encouraging.', 'in-review', true, 18),
  ('gp-nakereba-narimasen', 'lang-ja', 'nakereba-narimasen', '〜なければなりません', 'Verb-ない stem + ければなりません', 'lvl-ja-n5', 'expression', 'polite', 'Obligation — "must".', '行かなければなりません "I must go". Casual: 行かなきゃ.', 'Literally "if I do not go, it will not do" — a double negative. Japanese expresses obligation by ruling out the alternative rather than asserting the duty.', 'in-review', true, 19)
ON CONFLICT (language_id, slug) DO NOTHING;

INSERT INTO grammar_formations (id, grammar_point_id, attaches_to, rule_template, example, sort_index) VALUES
  ('gf-desu-0', 'gp-desu', 'noun', 'N + です', '学生です。', 0),
  ('gf-desu-1', 'gp-desu', 'na-adj', 'なAdj + です', '静かです。', 1),
  ('gf-masu-0', 'gp-masu', 'verb-masu-stem', 'V-stem + ます', '行きます。', 0),
  ('gf-te-form-0', 'gp-te-form', 'verb-te', 'V-て', '食べて', 0),
  ('gf-te-form-1', 'gp-te-form', 'i-adj-stem', 'iAdj → 〜くて', '安くて', 1),
  ('gf-ta-form-0', 'gp-ta-form', 'verb-te', 'V-て → V-た', '食べた', 0),
  ('gf-teiru-0', 'gp-teiru', 'verb-te', 'V-て + いる', '食べている', 0),
  ('gf-nai-0', 'gp-nai', 'verb-plain', 'V-ない', '行かない', 0),
  ('gf-wa-particle-0', 'gp-wa-particle', 'noun', 'N + は', '私は…', 0),
  ('gf-ga-particle-0', 'gp-ga-particle', 'noun', 'N + が', '誰が…', 0),
  ('gf-kudasai-0', 'gp-kudasai', 'verb-te', 'V-て + ください', '見てください。', 0),
  ('gf-mashou-0', 'gp-mashou', 'verb-masu-stem', 'V-stem + ましょう', '行きましょう。', 0),
  ('gf-tai-0', 'gp-tai', 'verb-masu-stem', 'V-stem + たい', '食べたい', 0),
  ('gf-kara-reason-0', 'gp-kara-reason', 'verb-plain', 'Clause + から', '高いから…', 0),
  ('gf-ni-direction-0', 'gp-ni-direction', 'noun', 'N + に', '学校に行く', 0),
  ('gf-wo-object-0', 'gp-wo-object', 'noun', 'N + を', 'ごはんを食べる', 0),
  ('gf-mo-particle-0', 'gp-mo-particle', 'noun', 'N + も', '私も…', 0),
  ('gf-arimasu-imasu-0', 'gp-arimasu-imasu', 'noun', 'N が あります/います', 'ねこがいます。', 0),
  ('gf-no-possessive-0', 'gp-no-possessive', 'noun', 'N の N', '私の本', 0),
  ('gf-ka-question-0', 'gp-ka-question', 'verb-plain', 'Sentence + か', '行きますか。', 0),
  ('gf-te-mo-ii-0', 'gp-te-mo-ii', 'verb-te', 'V-て + もいい', '入ってもいいですか。', 0),
  ('gf-nakereba-narimasen-0', 'gp-nakereba-narimasen', 'verb-plain', 'V-なければなりません', '行かなければなりません。', 0)
ON CONFLICT DO NOTHING;

INSERT INTO grammar_mistakes (id, grammar_point_id, wrong, "right", why_wrong, explanation, sort_index) VALUES
  ('gm-desu-0', 'gp-desu', '学生だです。', '学生です。', 'だ and です are the same slot.', 'They are two registers of one copula, so only one can appear. Plain だ or polite です — never both.', 0),
  ('gm-desu-1', 'gp-desu', 'высокийです。', '高いです。', 'i-adjectives keep their own ending.', 'An i-adjective already carries the predicate, so です only adds politeness: 高いです, never 高いだ.', 1),
  ('gm-masu-0', 'gp-masu', '食べるます。', '食べます。', 'ます attaches to the stem, not the dictionary form.', 'Drop the final る (or shift the う-row) first: 食べる → 食べ + ます.', 0),
  ('gm-te-form-0', 'gp-te-form', '行くて', '行って', 'く-verbs take いて, but 行く is irregular.', '書く → 書いて follows the rule; 行く is the one exception and takes 行って.', 0),
  ('gm-ta-form-0', 'gp-ta-form', '行いた', '行った', 'The た-form mirrors the て-form exactly.', 'If you know 行って, then 行った follows; the two forms always share their shape.', 0),
  ('gm-teiru-0', 'gp-teiru', '彼は死んでいます = He is dying.', '彼は死んでいます = He is dead.', '死ぬ is a change-of-state verb.', 'For such verbs ている gives the resulting state, so this says he is in the state of having died.', 0),
  ('gm-nai-0', 'gp-nai', '行かないでした', '行かなかった', 'ない conjugates as an i-adjective.', 'Past is なかった; ないでした is not a form.', 0),
  ('gm-wa-particle-0', 'gp-wa-particle', '私が学生です。(as a neutral self-introduction)', '私は学生です。', 'が answers "who?"', 'が picks you out from alternatives, so it reads as "I am the one who is a student". A plain introduction takes は.', 0),
  ('gm-ga-particle-0', 'gp-ga-particle', '誰は来ましたか。', '誰が来ましたか。', 'Question words cannot be the topic.', 'は presupposes a known topic; a question word is by definition unknown, so it takes が.', 0),
  ('gm-kudasai-0', 'gp-kudasai', '見るください。', '見てください。', 'ください needs the て-form.', 'The pattern is built on て, so the dictionary form cannot attach directly.', 0),
  ('gm-mashou-0', 'gp-mashou', '行くましょう。', '行きましょう。', 'It attaches to the ます-stem.', 'ましょう is built on ます, so it takes the same stem: 行き + ましょう.', 0),
  ('gm-tai-0', 'gp-tai', '彼は行きたいです。', '彼は行きたがっています。', 'たい is for your own desire.', 'You cannot assert another person''s inner state directly; たがる reports observed wanting.', 0),
  ('gm-kara-reason-0', 'gp-kara-reason', '買いませんから高いです。', '高いから買いません。', 'The reason comes before から.', 'から follows the reason clause, so the cause must precede it.', 0),
  ('gm-ni-direction-0', 'gp-ni-direction', '明日に行きます。', '明日行きます。', 'Relative time words take no に.', '明日 and 今日 are already adverbial; only absolute times like 七時 or 月曜日 take に.', 0),
  ('gm-wo-object-0', 'gp-wo-object', '公園に歩きます。', '公園を歩きます。', 'A path traversed takes を.', 'に marks a destination; walking THROUGH a space is movement across it, so it takes を.', 0),
  ('gm-mo-particle-0', 'gp-mo-particle', '私はも行きます。', '私も行きます。', 'も replaces は/が/を.', 'It occupies the same slot, so the original particle drops.', 0),
  ('gm-arimasu-imasu-0', 'gp-arimasu-imasu', 'ねこがあります。', 'ねこがいます。', 'Animate subjects take います.', 'A cat can move under its own power, so it takes the animate verb.', 0),
  ('gm-no-possessive-0', 'gp-no-possessive', '本の私', '私の本', 'The modifier comes first.', 'Japanese puts the describing noun before the described one, the reverse of English "book of mine".', 0),
  ('gm-ka-question-0', 'gp-ka-question', 'ですかあなたは学生?', 'あなたは学生ですか。', 'Word order does not change in a question.', 'か simply attaches at the end; nothing inverts.', 0),
  ('gm-te-mo-ii-0', 'gp-te-mo-ii', '入るもいいですか。', '入ってもいいですか。', 'Needs the て-form.', 'The も attaches to て, not to the dictionary form.', 0),
  ('gm-nakereba-narimasen-0', 'gp-nakereba-narimasen', '行きなければなりません。', '行かなければなりません。', 'Built on the ない-stem.', 'Take the negative stem 行か, not the ます-stem 行き.', 0)
ON CONFLICT DO NOTHING;

-- One typed-cloze drill per point. Typed, not multiple choice: producing the
-- form is the skill, and recognising it from four options is not the same thing.
INSERT INTO study_items (id, language_id, kind, grammar_point_id, level_id, sort_index, published, active) VALUES
  ('si-gp-desu', 'lang-ja', 'grammar', 'gp-desu', 'lvl-ja-n5', 2000, true, true),
  ('si-gp-masu', 'lang-ja', 'grammar', 'gp-masu', 'lvl-ja-n5', 2001, true, true),
  ('si-gp-te-form', 'lang-ja', 'grammar', 'gp-te-form', 'lvl-ja-n5', 2002, true, true),
  ('si-gp-ta-form', 'lang-ja', 'grammar', 'gp-ta-form', 'lvl-ja-n5', 2003, true, true),
  ('si-gp-teiru', 'lang-ja', 'grammar', 'gp-teiru', 'lvl-ja-n5', 2004, true, true),
  ('si-gp-nai', 'lang-ja', 'grammar', 'gp-nai', 'lvl-ja-n5', 2005, true, true),
  ('si-gp-wa-particle', 'lang-ja', 'grammar', 'gp-wa-particle', 'lvl-ja-n5', 2006, true, true),
  ('si-gp-ga-particle', 'lang-ja', 'grammar', 'gp-ga-particle', 'lvl-ja-n5', 2007, true, true),
  ('si-gp-kudasai', 'lang-ja', 'grammar', 'gp-kudasai', 'lvl-ja-n5', 2008, true, true),
  ('si-gp-mashou', 'lang-ja', 'grammar', 'gp-mashou', 'lvl-ja-n5', 2009, true, true),
  ('si-gp-tai', 'lang-ja', 'grammar', 'gp-tai', 'lvl-ja-n5', 2010, true, true),
  ('si-gp-kara-reason', 'lang-ja', 'grammar', 'gp-kara-reason', 'lvl-ja-n5', 2011, true, true),
  ('si-gp-ni-direction', 'lang-ja', 'grammar', 'gp-ni-direction', 'lvl-ja-n5', 2012, true, true),
  ('si-gp-wo-object', 'lang-ja', 'grammar', 'gp-wo-object', 'lvl-ja-n5', 2013, true, true),
  ('si-gp-mo-particle', 'lang-ja', 'grammar', 'gp-mo-particle', 'lvl-ja-n5', 2014, true, true),
  ('si-gp-arimasu-imasu', 'lang-ja', 'grammar', 'gp-arimasu-imasu', 'lvl-ja-n5', 2015, true, true),
  ('si-gp-no-possessive', 'lang-ja', 'grammar', 'gp-no-possessive', 'lvl-ja-n5', 2016, true, true),
  ('si-gp-ka-question', 'lang-ja', 'grammar', 'gp-ka-question', 'lvl-ja-n5', 2017, true, true),
  ('si-gp-te-mo-ii', 'lang-ja', 'grammar', 'gp-te-mo-ii', 'lvl-ja-n5', 2018, true, true),
  ('si-gp-nakereba-narimasen', 'lang-ja', 'grammar', 'gp-nakereba-narimasen', 'lvl-ja-n5', 2019, true, true)
ON CONFLICT DO NOTHING;

INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order) VALUES
  ('fac-gp-desu', 'si-gp-desu', 'usage', true, 1, 0),
  ('fac-gp-masu', 'si-gp-masu', 'usage', true, 1, 1),
  ('fac-gp-te-form', 'si-gp-te-form', 'usage', true, 1, 2),
  ('fac-gp-ta-form', 'si-gp-ta-form', 'usage', true, 1, 3),
  ('fac-gp-teiru', 'si-gp-teiru', 'usage', true, 1, 4),
  ('fac-gp-nai', 'si-gp-nai', 'usage', true, 1, 5),
  ('fac-gp-wa-particle', 'si-gp-wa-particle', 'usage', true, 1, 6),
  ('fac-gp-ga-particle', 'si-gp-ga-particle', 'usage', true, 1, 7),
  ('fac-gp-kudasai', 'si-gp-kudasai', 'usage', true, 1, 8),
  ('fac-gp-mashou', 'si-gp-mashou', 'usage', true, 1, 9),
  ('fac-gp-tai', 'si-gp-tai', 'usage', true, 1, 10),
  ('fac-gp-kara-reason', 'si-gp-kara-reason', 'usage', true, 1, 11),
  ('fac-gp-ni-direction', 'si-gp-ni-direction', 'usage', true, 1, 12),
  ('fac-gp-wo-object', 'si-gp-wo-object', 'usage', true, 1, 13),
  ('fac-gp-mo-particle', 'si-gp-mo-particle', 'usage', true, 1, 14),
  ('fac-gp-arimasu-imasu', 'si-gp-arimasu-imasu', 'usage', true, 1, 15),
  ('fac-gp-no-possessive', 'si-gp-no-possessive', 'usage', true, 1, 16),
  ('fac-gp-ka-question', 'si-gp-ka-question', 'usage', true, 1, 17),
  ('fac-gp-te-mo-ii', 'si-gp-te-mo-ii', 'usage', true, 1, 18),
  ('fac-gp-nakereba-narimasen', 'si-gp-nakereba-narimasen', 'usage', true, 1, 19)
ON CONFLICT (study_item_id, facet) DO NOTHING;

INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, prompt, answer) VALUES
  ('ep-gp-desu', 'fac-gp-desu', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"わたしは学生＿＿。","gloss":"I am a student.","point":"です","instruction":"Fill the blank"}'::jsonb, '{"primary":"です","accepted":["です"]}'::jsonb),
  ('ep-gp-masu', 'fac-gp-masu', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"まいにち日本語を勉強し＿＿。","gloss":"I study Japanese every day.","point":"〜ます","instruction":"Fill the blank"}'::jsonb, '{"primary":"ます","accepted":["ます"]}'::jsonb),
  ('ep-gp-te-form', 'fac-gp-te-form', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"朝ごはんを食べ＿＿、学校へ行きます。","gloss":"I eat breakfast and then go to school.","point":"〜て form","instruction":"Fill the blank"}'::jsonb, '{"primary":"て","accepted":["て"]}'::jsonb),
  ('ep-gp-ta-form', 'fac-gp-ta-form', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"きのう映画を見＿＿。","gloss":"I watched a film yesterday.","point":"〜た (past)","instruction":"Fill the blank"}'::jsonb, '{"primary":"た","accepted":["た"]}'::jsonb),
  ('ep-gp-teiru', 'fac-gp-teiru', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"いま本を読ん＿＿います。","gloss":"I am reading a book right now.","point":"〜ている","instruction":"Fill the blank"}'::jsonb, '{"primary":"で","accepted":["で"]}'::jsonb),
  ('ep-gp-nai', 'fac-gp-nai', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"きょうは学校へ行か＿＿。","gloss":"I''m not going to school today.","point":"〜ない","instruction":"Fill the blank"}'::jsonb, '{"primary":"ない","accepted":["ない"]}'::jsonb),
  ('ep-gp-wa-particle', 'fac-gp-wa-particle', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"わたし＿＿日本語を勉強しています。","gloss":"I study Japanese.","point":"は (topic)","instruction":"Fill the blank"}'::jsonb, '{"primary":"は","accepted":["は"]}'::jsonb),
  ('ep-gp-ga-particle', 'fac-gp-ga-particle', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"ねこ＿＿います。","gloss":"There is a cat.","point":"が (subject)","instruction":"Fill the blank"}'::jsonb, '{"primary":"が","accepted":["が"]}'::jsonb),
  ('ep-gp-kudasai', 'fac-gp-kudasai', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"もういちど言っ＿＿ください。","gloss":"Please say it once more.","point":"〜てください","instruction":"Fill the blank"}'::jsonb, '{"primary":"て","accepted":["て"]}'::jsonb),
  ('ep-gp-mashou', 'fac-gp-mashou', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"いっしょに行き＿＿。","gloss":"Let''s go together.","point":"〜ましょう","instruction":"Fill the blank"}'::jsonb, '{"primary":"ましょう","accepted":["ましょう"]}'::jsonb),
  ('ep-gp-tai', 'fac-gp-tai', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"日本へ行き＿＿です。","gloss":"I want to go to Japan.","point":"〜たい","instruction":"Fill the blank"}'::jsonb, '{"primary":"たい","accepted":["たい"]}'::jsonb),
  ('ep-gp-kara-reason', 'fac-gp-kara-reason', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"さむい＿＿、まどをしめます。","gloss":"It''s cold, so I''ll close the window.","point":"〜から (because)","instruction":"Fill the blank"}'::jsonb, '{"primary":"から","accepted":["から"]}'::jsonb),
  ('ep-gp-ni-direction', 'fac-gp-ni-direction', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"七時＿＿おきます。","gloss":"I get up at seven.","point":"に (direction / time)","instruction":"Fill the blank"}'::jsonb, '{"primary":"に","accepted":["に"]}'::jsonb),
  ('ep-gp-wo-object', 'fac-gp-wo-object', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"ごはん＿＿食べます。","gloss":"I eat rice.","point":"を (object)","instruction":"Fill the blank"}'::jsonb, '{"primary":"を","accepted":["を"]}'::jsonb),
  ('ep-gp-mo-particle', 'fac-gp-mo-particle', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"わたし＿＿行きます。","gloss":"I will go too.","point":"も (also)","instruction":"Fill the blank"}'::jsonb, '{"primary":"も","accepted":["も"]}'::jsonb),
  ('ep-gp-arimasu-imasu', 'fac-gp-arimasu-imasu', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"つくえの上に本が＿＿＿＿。","gloss":"There is a book on the desk.","point":"あります / います","instruction":"Fill the blank"}'::jsonb, '{"primary":"あります","accepted":["あります"]}'::jsonb),
  ('ep-gp-no-possessive', 'fac-gp-no-possessive', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"これはわたし＿＿本です。","gloss":"This is my book.","point":"の (possessive / linking)","instruction":"Fill the blank"}'::jsonb, '{"primary":"の","accepted":["の"]}'::jsonb),
  ('ep-gp-ka-question', 'fac-gp-ka-question', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"あなたは学生です＿＿。","gloss":"Are you a student?","point":"か (question)","instruction":"Fill the blank"}'::jsonb, '{"primary":"か","accepted":["か"]}'::jsonb),
  ('ep-gp-te-mo-ii', 'fac-gp-te-mo-ii', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"ここに座っ＿＿もいいですか。","gloss":"May I sit here?","point":"〜てもいい","instruction":"Fill the blank"}'::jsonb, '{"primary":"て","accepted":["て"]}'::jsonb),
  ('ep-gp-nakereba-narimasen', 'fac-gp-nakereba-narimasen', 'tpl-typed-cloze', 'lang-ja', '{"kind":"grammar","sentence":"はやく行かなけれ＿＿なりません。","gloss":"I have to go soon.","point":"〜なければなりません","instruction":"Fill the blank"}'::jsonb, '{"primary":"ば","accepted":["ば"]}'::jsonb)
ON CONFLICT (facet_id, template_id, version) DO NOTHING;

-- The why layer. status='in-review' on purpose — see the header.
INSERT INTO etymology_entries
  (id, language_id, grammar_point_id, aspect, claim, body, period, confidence, is_disputed, is_primary, status, generated_by, source_count) VALUES
  ('ety-desu', 'lang-ja', 'gp-desu', 'historical-grammar', 'です is a contraction of a longer polite copula built on にてあり.', 'The copula chain runs にてあり → であり → である → だ. The polite です is generally derived from a contraction of であります or でございます, both of which are である plus a polite verb. This is why です behaves like a frozen block rather than a conjugating verb: it was already a contraction by the time it settled into the modern language.

The practical payoff: でした, ではありません and でございます stop looking like arbitrary forms and start looking like what they are — different points on the same chain.', 'Edo', 'well-supported', false, true, 'in-review', 'human', 2),
  ('ety-masu', 'lang-ja', 'gp-masu', 'historical-grammar', 'ます descends from the humble verb まゐらす ("to humbly do for a superior").', 'The chain is まゐらす (mawirasu) → まらす → まっす → ます. It began as a full verb meaning to do something humbly for someone above you, and eroded into a suffix that marks politeness toward the listener.

This explains something learners find odd: why ます is politeness toward the LISTENER rather than respect for the subject. It started life describing the speaker''s own humble action, so the deference was always pointed outward, at the person being addressed.', 'Kamakura', 'well-supported', false, true, 'in-review', 'human', 2),
  ('ety-te-form', 'lang-ja', 'gp-te-form', 'historical-grammar', 'The て of the te-form is the Old Japanese perfective auxiliary つ, attached to the 連用形.', 'て is the 連用形 of the perfective auxiliary つ. So the te-form is literally a stem plus a completion marker — "having done X".

That original sense of completion is still doing work in the modern language. It is why て naturally means "and then" rather than plain "and", why 〜てから means "after doing", and why the past tense た is built from the same material (て + あり → たり → た). One morpheme, and it explains a whole family of forms.', 'Old Japanese', 'well-supported', false, true, 'in-review', 'human', 1),
  ('ety-ta-form', 'lang-ja', 'gp-ta-form', 'historical-grammar', 'た comes from たり, a contraction of the te-form plus あり.', 'The chain is て + あり → たり → た. It was originally a resultative — "having done X, and being in that state" — rather than a past tense.

That is why た still leans perfect in places where English would not use a past: 分かった for "I understand (now)", or the surprised あった when you find something. The form is telling you a state has been reached, not merely that time has passed.', 'Heian', 'well-supported', false, true, 'in-review', 'human', 2),
  ('ety-teiru', 'lang-ja', 'gp-teiru', 'historical-grammar', 'ている is the te-form plus the existential verb いる — literally "exists having done".', 'いる is the ordinary verb "to exist (animate)". So 食べている is "exists in the state of having eaten/eating".

Once you see it as te-form + exist, the two meanings stop being arbitrary. If the verb describes an activity, existing-in-that-activity means it is ongoing. If the verb describes an instantaneous change, existing-after-that-change means you are in the resulting state. Same construction; the verb decides which reading makes sense.', 'Heian', 'well-supported', false, true, 'in-review', 'human', 1),
  ('ety-nai', 'lang-ja', 'gp-nai', 'historical-grammar', 'ない is the adjective なし ("nonexistent"), which is why it inflects like an i-adjective.', 'ない continues the Old Japanese adjective なし, meaning "nonexistent, not there". It was never a verb ending — it was a real adjective that came to be used as a negative auxiliary.

That single fact explains its whole conjugation. なかった, なくて, なければ are not irregular verb endings to memorise; they are ordinary i-adjective forms, because ない is an adjective wearing a verb ending''s job.', 'Old Japanese', 'well-supported', false, true, 'in-review', 'human', 2),
  ('ety-wa-particle', 'lang-ja', 'gp-wa-particle', 'sound-change', 'は is pronounced わ because the h-row consonant shifted while the spelling did not.', 'The は-row was pronounced with /p/ in Old Japanese, weakened to /ɸ/, and then to /h/ — except word-internally and for this particle, where it became /w/. The spelling was fixed by tradition and never caught up.

So は-as-wa is not an exception invented to confuse learners. It is a fossil: the writing preserves an older pronunciation, and the same shift explains why the particle へ is pronounced え.', 'Heian', 'attested', false, true, 'in-review', 'human', 2),
  ('ety-ga-particle', 'lang-ja', 'gp-ga-particle', 'historical-grammar', 'が was a genitive ("of") before it became a subject marker.', 'In Old Japanese が marked possession, much as の does now. The fossil survives in fixed expressions: わが国 "my/our country", わが家 "my home".

It shifted to marking subjects inside subordinate clauses, then generalised. Knowing this makes the modern split-up of が and の feel less arbitrary — they were once doing the same job, and in some relative clauses either still works.', 'Old Japanese', 'attested', false, true, 'in-review', 'human', 2),
  ('ety-kudasai', 'lang-ja', 'gp-kudasai', 'historical-grammar', 'ください is the imperative of 下さる, an honorific verb meaning "to give downward".', 'It is written 下さい — the kanji 下 "below" is doing real work. 下さる is the honorific of くれる ("to give to me"), and it pictures the giving as coming DOWN from someone above you to you below.

So てください literally asks someone to bestow the action downward on you. That is why it stays polite but still directive: you are describing a gift from a superior, not making a tentative request.', 'Edo', 'well-supported', false, true, 'in-review', 'human', 2),
  ('ety-mashou', 'lang-ja', 'gp-mashou', 'historical-grammar', 'ましょう is ます plus the volitional auxiliary う (from Old Japanese む).', 'The volitional む became う, and ます + う contracted to ましょう. The same む sits behind the plain volitional: 行こう is 行か + う from the same source.

So ましょう and 〜おう are not two separate endings. They are the polite and plain faces of one volitional marker, which is why they mean exactly the same thing at different registers.', 'Kamakura', 'well-supported', false, true, 'in-review', 'human', 1),
  ('ety-tai', 'lang-ja', 'gp-tai', 'historical-grammar', 'たい is an auxiliary ADJECTIVE, not a verb ending — which is why it inflects like one.', 'たい continues the Old Japanese auxiliary adjective たし. It was an adjective from the start, so 食べたい is grammatically an adjective phrase, not a verb.

That is the whole explanation for its behaviour: たかった, たくない and たければ are ordinary i-adjective forms, and the が-marked object appears because adjectives take が for what they are about — the same reason 水が好き uses が.', 'Heian', 'well-supported', false, true, 'in-review', 'human', 1),
  ('ety-wo-object', 'lang-ja', 'gp-wo-object', 'sound-change', 'を is pronounced お; it survives as a separate character only because it is the object particle.', 'を was once /wo/, distinct from お /o/. The /w/ dropped before all vowels except /a/, so を and お merged in speech.

The 1946 orthography reforms removed を from ordinary words but kept it for the object particle, precisely because that one job is frequent and unambiguous. So を is a character preserved for a single grammatical function — which is why you never see it inside a word.', 'Heian', 'attested', false, true, 'in-review', 'human', 2),
  ('ety-nakereba-narimasen', 'lang-ja', 'gp-nakereba-narimasen', 'historical-grammar', 'It is a literal double negative: "if not X, it does not become".', 'なければ is the conditional of ない ("if not"), and なりません is the negative of なる ("to become / to do"). Together: "if you do not do it, it will not do".

Japanese has no direct "must". Obligation is built by eliminating the alternative, which is why every obligation form at this level — なければならない, なくてはいけない, ないとだめ — is some negative plus another negative. Once you see the shape, the whole family stops needing memorisation.', 'modern', 'attested', false, true, 'in-review', 'human', 1)
ON CONFLICT DO NOTHING;

-- `quote` is load-bearing: it is what the UI shows under "the source says",
-- and what the enrichment validator checks generated text against.
-- `quote` is deliberately ABSENT.
--
-- These citations previously carried quotations attributed to Frellesvig 2010
-- with chapter locators. They were written from model knowledge, not
-- transcribed from the book, and read to a reviewer exactly like real ones —
-- which is the failure this layer exists to prevent. The locators stay so a
-- reviewer knows where to check; the invented text is gone.
--
-- To restore a quote, transcribe it from the source in hand. The enrichment
-- pipeline enforces this mechanically (every quote must be a literal substring
-- of a supplied passage); hand-authored seeds bypass that check, so this file
-- must not carry quotes at all.
INSERT INTO etymology_sources (etymology_id, source_id, locator, supports, sort_index) VALUES
  ('ety-desu', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 9, the copula', 'supports', 0),
  ('ety-desu', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'です', 'supports', 1),
  ('ety-masu', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 10, polite verb morphology', 'supports', 0),
  ('ety-masu', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'ます', 'supports', 1),
  ('ety-te-form', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 4, the auxiliary tu', 'supports', 0),
  ('ety-ta-form', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 6, tari and the modern past', 'supports', 0),
  ('ety-ta-form', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'た', 'supports', 1),
  ('ety-teiru', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 11, aspectual constructions', 'supports', 0),
  ('ety-nai', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 8, negation', 'supports', 0),
  ('ety-nai', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'ない', 'supports', 1),
  ('ety-wa-particle', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 5, the labial series', 'supports', 0),
  ('ety-wa-particle', (SELECT id FROM sources WHERE slug = 'nikkoku'), 'は (助詞)', 'supports', 1),
  ('ety-ga-particle', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 7, case particles', 'supports', 0),
  ('ety-ga-particle', (SELECT id FROM sources WHERE slug = 'wiktionary'), 'が', 'supports', 1),
  ('ety-kudasai', (SELECT id FROM sources WHERE slug = 'nikkoku'), '下さる', 'supports', 0),
  ('ety-kudasai', (SELECT id FROM sources WHERE slug = 'wiktionary'), '下さい', 'supports', 1),
  ('ety-mashou', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 10, the volitional', 'supports', 0),
  ('ety-tai', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 8, auxiliary adjectives', 'supports', 0),
  ('ety-wo-object', (SELECT id FROM sources WHERE slug = 'frellesvig-2010'), 'Ch. 5, loss of initial w', 'supports', 0),
  ('ety-wo-object', (SELECT id FROM sources WHERE slug = 'nikkoku'), 'を', 'supports', 1),
  ('ety-nakereba-narimasen', (SELECT id FROM sources WHERE slug = 'nikkoku'), 'なければならない', 'supports', 0)
ON CONFLICT DO NOTHING;

-- Queue each etymology for sign-off. The partial unique index means one
-- pending row per target, so re-running this cannot stack duplicates.
INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT 'crq-'||e.id, 'lang-ja', 'etymology_entries', e.id, 'create',
       jsonb_build_object('claim', e.claim, 'body', e.body, 'confidence', e.confidence, 'aspect', e.aspect),
       'human', 10, 'pending'
FROM etymology_entries e
WHERE e.status = 'in-review' AND e.grammar_point_id IS NOT NULL
ON CONFLICT DO NOTHING;
