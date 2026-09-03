-- Teach the two things every conjugation drill already assumes.
--
-- 540 conjugation prompts carry a `verbClass` — godan 340, ichidan 128, suru 64,
-- aru 4, kuru 4 — and hand the learner a dictionary form as input. Searching all
-- 353 grammar points for 五段, 一段, godan, ichidan or "dictionary form" returns
-- nothing. So the app has been asking "give the te-form of 引く (godan)" without
-- ever having said what a godan verb is, what a dictionary form is, or why
-- either matters. That is the complaint verbatim: "I should learn about verbs,
-- they of verbs, different endings and how they change".
--
-- Placed at study_items.sort_index 156, immediately before 〜ます at 157 and
-- after the nouns at 151–156, so both are introduced before the first form is
-- ever asked for. Tied with 八 at 156, which is harmless — the queue orders by
-- sort_index and both land in the same stage as the forms they explain.
--
-- grammar_points.sort_index is shifted to make room in the N5 block (0–49; N4
-- starts at 100, N5's later additions at 500). That column is read only by
-- build-curriculum, which does not run in production, but leaving it wrong would
-- silently undo this the next time the curriculum is rebuilt.
--
-- Additive: two points, two items, two facets, two prompts, plus formations and
-- relations. No existing row is deleted and nothing touches accounts, srs_cards
-- or review logs. Safe on a live database and safe to re-run.

-- Room at the front of the N5 block, ahead of 〜ます (1).
UPDATE grammar_points SET sort_index = sort_index + 10, updated_at = now()
WHERE language_id = 'lang-ja' AND sort_index BETWEEN 1 AND 99
  AND NOT EXISTS (SELECT 1 FROM grammar_points x WHERE x.slug = 'verb-classes' AND x.language_id = 'lang-ja');

INSERT INTO grammar_points
  (id, language_id, slug, title, pattern, level_id, category, register, meaning_short, meaning_long, nuance, status, published, sort_index) VALUES
  ('gp-verb-classes', 'lang-ja', 'verb-classes', 'Verb classes', '五段 / 一段 / する・くる', 'lvl-ja-n5', 'construction', 'casual',
   'Every Japanese verb belongs to one of three groups, and the group decides how it changes.',
   'Japanese verbs do not each have their own endings to memorise. There are three groups, and once you know which group a verb is in, every form follows.

**Ichidan (一段)** — the easy ones. The dictionary form ends in 〜いる or 〜える, and you conjugate by dropping る and adding the ending. 食べる → 食べます, 食べて, 食べた, 食べない. Nothing else changes.

**Godan (五段)** — everything else ending in う, く, ぐ, す, つ, ぬ, ぶ, む, る. The final syllable shifts across the five vowel rows, which is what 五段, "five steps", means. 書く → 書きます, 書いて, 書いた, 書かない. The consonant stays, the vowel moves.

**Irregular** — there are only two: する (to do) and くる (to come). They are irregular in every form, and you learn them as they arrive. する is worth extra attention because it is how Japanese turns almost any noun into a verb: 勉強 → 勉強する, 電話 → 電話する.

ある is a fourth footnote: a godan verb in every form except the negative, where it becomes ない rather than あらない.',
   'The trap is that 〜いる and 〜える do not guarantee ichidan. 帰る, 入る, 走る and 切る all look ichidan and are godan. There is no rule that catches them — they are a short list you meet one at a time, and every learner conjugates 帰る wrongly at least once.',
   'in-review', true, 1),
  ('gp-dictionary-form', 'lang-ja', 'dictionary-form', 'Dictionary form', 'Verb, plain non-past', 'lvl-ja-n5', 'construction', 'casual',
   'The unconjugated verb — how it is listed, and the base every other form is built from.',
   'The dictionary form (辞書形) is the verb as you would find it in a dictionary: 食べる, 書く, する. It always ends in a う-row syllable.

It is not only a citation form. It is a real, usable tense — the plain non-past — meaning both "eat" and "will eat" depending on context. 明日行く is a perfectly complete sentence meaning "I''ll go tomorrow"; it is simply casual where 行きます is polite.

Every drill in this app hands you the dictionary form and asks for something else, because that is the direction the language works in: 書く is the root, 書きます and 書いて and 書いた are all derived from it.',
   'Japanese has no infinitive. English "to eat" and "eat" are separate ideas; 食べる is both, plus "will eat". Which one it means is decided by the sentence around it, never by the verb itself.',
   'in-review', true, 2)
ON CONFLICT (language_id, slug) DO NOTHING;

-- How each attaches, which is also what the Show Hints button will read.
INSERT INTO grammar_formations (id, grammar_point_id, attaches_to, rule_template, example, sort_index) VALUES
  ('gf-verb-classes-ichidan', 'gp-verb-classes', 'verb-plain', 'Ichidan: drop る, add the ending', '食べる → 食べ + ます / て / た / ない', 0),
  ('gf-verb-classes-godan', 'gp-verb-classes', 'verb-plain', 'Godan: shift the final syllable''s vowel', '書く → 書き / 書い / 書か', 1),
  ('gf-verb-classes-irregular', 'gp-verb-classes', 'verb-plain', 'Irregular: する → し, くる → き', 'する → します, くる → きます', 2),
  ('gf-dictionary-form-base', 'gp-dictionary-form', 'verb-plain', 'The う-row ending IS the dictionary form', '書く, 食べる, 話す, 待つ', 0)
ON CONFLICT (id) DO NOTHING;

-- Point the four form patterns back at what explains them.
INSERT INTO grammar_relations (from_id, to_id, kind, note)
SELECT g.id, 'gp-verb-classes', 'prerequisite',
       'Which group the verb belongs to is what decides this ending.'
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.slug IN ('masu', 'te-form', 'ta-form', 'nai')
ON CONFLICT (from_id, to_id, kind) DO NOTHING;

INSERT INTO grammar_relations (from_id, to_id, kind, note)
VALUES ('gp-verb-classes', 'gp-dictionary-form', 'prerequisite',
        'The dictionary form is what you inspect to work out the group.')
ON CONFLICT (from_id, to_id, kind) DO NOTHING;

-- Study items, immediately ahead of 〜ます (157).
INSERT INTO study_items (id, language_id, kind, grammar_point_id, level_id, sort_index, published, active)
SELECT 'si-'||g.id, g.language_id, 'grammar', g.id, g.level_id, 156, true, true
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.slug IN ('verb-classes', 'dictionary-form')
ON CONFLICT (id) DO NOTHING;

INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
SELECT 'sif-'||si.id||'-usage', si.id, 'usage', true, 1, 0
FROM study_items si
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE g.slug IN ('verb-classes', 'dictionary-form')
ON CONFLICT (study_item_id, facet) DO NOTHING;

INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, prompt, answer, distractors, status)
SELECT
  'ep-'||f.id, f.id, 'tpl-mcq', g.language_id,
  jsonb_build_object('kind', 'grammar', 'character', g.title, 'pattern', g.pattern,
                     'instruction', 'What does this pattern mean?'),
  jsonb_build_object('primary', g.meaning_short, 'accepted', jsonb_build_array(g.meaning_short)),
  (SELECT jsonb_agg(m) FROM (
     SELECT o.meaning_short AS m FROM grammar_points o
     WHERE o.language_id = g.language_id AND o.level_id = g.level_id
       AND o.id <> g.id AND o.meaning_short <> g.meaning_short
     ORDER BY md5(o.id || g.id) LIMIT 3) picked),
  'published'
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE f.facet = 'usage' AND g.slug IN ('verb-classes', 'dictionary-form')
ON CONFLICT (facet_id, template_id, version) DO NOTHING;
