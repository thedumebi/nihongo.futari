-- "Don't confuse this with…"
--
-- Most N5 mistakes are not ignorance of a form but confusion between two that
-- look interchangeable and are not. A learner who has met both は and が does
-- not need either explained again; they need the DIFFERENCE, and there is
-- nowhere to put that on a single point's own row.
--
-- Directed, with a note per direction: what you need to hear looking at から is
-- not what you need looking at ので.

INSERT INTO grammar_relations (from_id, to_id, kind, note) VALUES
  ('gp-wa-particle', 'gp-ga-particle', 'contrast',
   'は sets the topic and often implies contrast with something unsaid; が identifies the subject and introduces new information. If the listener already knows what you are talking about, it is usually は.'),
  ('gp-ga-particle', 'gp-wa-particle', 'contrast',
   'が answers "which one?"; は answers "what about it?". Question words take が because you cannot topicalise the thing you are asking about.'),

  ('gp-kara-reason', 'gp-node', 'contrast',
   'から is your judgement, so it can sound like an argument. Prefer ので when the reason is a circumstance rather than a case you are making.'),
  ('gp-node', 'gp-kara-reason', 'contrast',
   'ので presents a fact and lets the listener conclude; から asserts the reason. This is why excuses and requests reach for ので.'),

  ('gp-dake', 'gp-shika-nai', 'contrast',
   'だけ simply counts: 一つだけ is neutral. しか carries disappointment and requires a negative verb.'),
  ('gp-shika-nai', 'gp-dake', 'contrast',
   'しか regrets the amount; だけ states it. If you are not complaining, use だけ.'),

  ('gp-yori', 'gp-hou-ga', 'contrast',
   'より marks the thing compared AGAINST — the loser. ほうが marks the winner. They pair up: BよりAのほうが高い.'),
  ('gp-hou-ga', 'gp-yori', 'contrast',
   'ほうが names the side you are picking; より names what you are picking over.'),

  ('gp-ni-direction', 'gp-de-location', 'contrast',
   'に marks where something exists or is going; で marks where an action happens. 公園にいる (being there) against 公園で遊ぶ (doing there).'),
  ('gp-de-location', 'gp-ni-direction', 'contrast',
   'で needs a verb that DOES something. If the verb is ある, いる or 行く, the place takes に.'),

  ('gp-ni-direction', 'gp-he-direction', 'contrast',
   'に emphasises arriving; へ emphasises the heading. For a destination you reached, に is the safer choice.'),
  ('gp-he-direction', 'gp-ni-direction', 'contrast',
   'へ points the way without promising you got there — it came from 辺, "vicinity".'),

  ('gp-to-with', 'gp-ya-particle', 'contrast',
   'と lists exhaustively: 本とノート means those two and nothing else. Use や when the list is only examples.'),
  ('gp-ya-particle', 'gp-to-with', 'contrast',
   'や implies "and so on". Choosing と instead claims a completeness you may not intend.'),

  ('gp-mae-ni', 'gp-ato-de', 'contrast',
   '前に takes the DICTIONARY form, 後で takes the TA-form. The tense sits on whichever side has already happened.'),
  ('gp-ato-de', 'gp-mae-ni', 'contrast',
   '後で follows a completed action, so its verb is past even when the sentence is not.'),

  ('gp-mashou', 'gp-masen-ka', 'contrast',
   'ましょう assumes agreement, closer to a decision. ませんか asks, and leaves room to decline.'),
  ('gp-masen-ka', 'gp-mashou', 'contrast',
   'ませんか is a genuine invitation; ましょう is closer to "let us, then".'),

  ('gp-teiru', 'gp-ta-form', 'contrast',
   'With change-of-state verbs ている is a RESULT, not an action in progress: 結婚している means "is married", not "is getting married".'),

  ('gp-tai', 'gp-tsumori', 'contrast',
   'たい is a wish; つもり is a settled plan. つもり comes from 積もる, "to pile up" — something that accumulated.'),
  ('gp-tsumori', 'gp-tai', 'contrast',
   'つもり claims a decision. If you only want to, たい is the honest word.'),

  ('gp-kudasai', 'gp-naide-kudasai', 'contrast',
   'The negative request is 〜ないでください, built on the ない-form, not on the て-form.'),

  ('gp-i-adjective', 'gp-na-adjective', 'contrast',
   'い-adjectives carry their own tense (高かった); な-adjectives borrow the copula (静かでした). This is why 高いでした is wrong.'),
  ('gp-na-adjective', 'gp-i-adjective', 'contrast',
   'な-adjectives are nouns wearing an adjective''s coat, which is why they need な to modify a noun.'),

  ('gp-ga-but', 'gp-kedo', 'formal-variant',
   'Same job, different register: が in polite or written Japanese, けど in speech. けれども is the full form.'),
  ('gp-kedo', 'gp-ga-but', 'formal-variant',
   'けど is what survives of けれども in casual speech. Use が when writing.'),

  ('gp-desu', 'gp-masu', 'similar',
   'です attaches to nouns and な-adjectives; ます attaches to verbs. Both mark politeness toward the LISTENER.'),
  ('gp-te-form', 'gp-ta-form', 'prerequisite',
   'The た-form is built exactly like the て-form, ending in た/だ instead. Learn て first and た is free.')
ON CONFLICT (from_id, to_id, kind) DO NOTHING;
