-- Fable's N3 verification: 26 of 44 entries corrected.
--
-- This pass had web search, and it shows: three entries were plainly false and
-- all three were the same fault — reading the kanji as the etymology.
--
--   わけ is not 訳. It is 分け, the nominalised 分ける, "to divide" — a
--   distinction drawn, hence the sense a thing makes. 訳 is a spelling fitted
--   afterwards; its on-reading やく means "translate". This one is worth the
--   whole pass, because it makes 訳が分からない say the same thing twice and ties
--   わけ to 分かる, already taught at N5.
--
--   にくい is not 難 read differently. がたい is 難し, but にくい is 憎い,
--   "disagreeable", extended to "hard to" — a separate word that later
--   borrowed the same character.
--
--   なんて is not 何と. It is などと worn down, so the belittling in it is the
--   など of N5 rather than the question word. Only なんか comes from 何か.
--
-- Thirteen period fields were ancestor-dated: 取る is Old Japanese but にとって
-- is not; 付く, 因る, 連る and 従う likewise. 気味 is a Sino-Japanese compound
-- and cannot be Old Japanese at all. Two were dated too LATE — べき and こそ are
-- both already operating in Old Japanese, and both entries said so in their own
-- claim while the field said Heian.
--
-- Four cases of fake causality, where an image was presented as the reason for
-- a real usage fact: にかけて's soft boundaries blamed on a hung thing sagging,
-- which no source supports; たびに's attachment rules blamed on it being a
-- counter when they are ordinary noun syntax; とおり's rendaku called a change
-- "any noun undergoes" when rendaku is lexically irregular; and さえ〜ば
-- explained by the additive sense when that job belonged to だに until the
-- medieval period.
--
-- Two pedagogical errors: ほど's "the more, the more" described as the noun used
-- twice, when what doubles is the predicate and ほど appears once; and the ている
-- of ことにしている called the progressive, which would collide with 知っている
-- later.
--
-- Seeds 139-147 have run and are left alone; corrections ship as a new seed.


UPDATE etymology_entries SET period = 'Old Japanese', updated_at = now()
WHERE id = 'ety-n3-beki';

UPDATE etymology_entries SET period = 'Heian',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n3-gachi';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n3-gimi';

UPDATE etymology_entries SET body = 'Still written 程 in formal prose and still a plain noun: 程度 is "degree", 身の程 is one''s station.

Both patterns are that noun. 死ぬほど疲れた measures tiredness against dying; 高いほどいい pairs two extents and lets them rise together. The "the more, the more" construction is not a special form but the predicate doubled around the noun: 高ければ高いほど repeats 高い, and ほど measures the second against the first.', updated_at = now()
WHERE id = 'ety-n3-hodo';

UPDATE etymology_entries SET period = 'Old Japanese',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n3-kanenai';

UPDATE etymology_entries SET body = 'The same verb as in 食べかけ and 言いかける. Here what is suspended is a stretch: 月曜から水曜にかけて hangs the period between the two days named.

Unlike から〜まで, which draws hard edges, にかけて never did — its boundaries are approximate, which is why it suits weather, seasons and regions rather than timetables.', updated_at = now()
WHERE id = 'ety-n3-kara-nikakete';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n3-kke';

UPDATE etymology_entries SET period = 'Old Japanese', updated_at = now()
WHERE id = 'ety-n3-koso';

UPDATE etymology_entries SET body = 'The same する that pairs with なる everywhere else in Japanese, here acting on こと, "a matter". You make the matter the case, so the decision is yours.

Set against ことになる it is the whole grammar of agency in two verbs, exactly as ようにする sits against ようになる. And ことにしている — the ている that holds a state in force, not the progressive one — is a decision kept up, which is how Japanese says "I make a policy of".', updated_at = now()
WHERE id = 'ety-n3-koto-ni-suru';

UPDATE etymology_entries SET body = 'The noun survives in わがまま, "one''s own way", and in 気の向くまま. It names a condition nobody has altered.

That is why the resultative use takes た — 開けたまま names a state produced by a finished act, where English says "with the window open". The noun itself takes other states just as happily: 知らないまま, and the 気の向くまま above.', updated_at = now()
WHERE id = 'ety-n3-mama';

UPDATE etymology_entries SET claim = 'なんか is 何か worn down; なんて is などと worn down.',
    body = 'Two different routes to the same shrug. なんか reaches for "what" instead of naming the thing; なんて comes from など plus と, so it reaches for "or some such" — the belittling in it is the など of N5, not the question word.

Either way the tone is built in rather than added, which is why neither can be used politely about a listener''s things. 私なんか, turned on yourself, is self-deprecation for exactly the same reason.', updated_at = now()
WHERE id = 'ety-n3-nanka';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n3-ni-shitagatte';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n3-ni-taishite';

UPDATE etymology_entries SET body = '私にとって is standing where I stand and looking from there. The verb is the everyday 取る, doing the work English does with "from the standpoint of".

That is why にとって wants something whose interests or standpoint can be at stake — a person, a group, a country, even a body, since 日本にとって and 体にとって are perfectly ordinary — and why it pairs with judgements like 大切, 難しい and 必要 rather than with plain descriptions of fact.',
    period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n3-ni-totte';

UPDATE etymology_entries SET period = 'Heian', updated_at = now()
WHERE id = 'ety-n3-ni-tsuite';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n3-ni-tsurete';

UPDATE etymology_entries SET period = 'Heian', updated_at = now()
WHERE id = 'ety-n3-ni-yotte';

UPDATE etymology_entries SET claim = 'がたい is classical 難し; にくい is a different word entirely, from 憎い.',
    body = 'The shared kanji 難 is spelling, not shared origin. がたし meant difficult; the suffix にくい comes from 憎い, "disagreeable", extended to "hard to" — dictionaries gloss it 《難い・悪い》 and trace it to 憎む.

The division of labour follows: にくい is physical awkwardness (読みにくい字), がたい is difficulty in bringing yourself to it (信じがたい, 忘れがたい), and がたい keeps to written and emotional contexts because 難し is the older, stiffer word. 難い in ありがたい — hard to exist, therefore precious — is where ありがとう comes from.', updated_at = now()
WHERE id = 'ety-n3-nikui-gatai';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n3-okage-de';

UPDATE etymology_entries SET body = 'Old Japanese さへ added something on top of what was already there. The modern sense is that addition narrowed to its most surprising case — the one you would not have added.

The "if only" use came from elsewhere. In classical Japanese that job belonged to a different particle, だに — 命だに〜ば — and さえ took over だに''s territory in the medieval period, which is how one particle ended up carrying both "even" and "if only". Reading 来さえすればいい as "if only the coming is added" is a serviceable mnemonic but not the history.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n3-sae';

UPDATE etymology_entries SET body = 'The kanji spell out an act attributed to a source — one of the few cases at this level where the characters really are the origin. せい is the kanbun reading しょい worn down, in Early Modern speech, and naming a cause that way is naming who is answerable for it.

Which is why せいで is always blame and おかげで always credit, though both simply mean "because of". Japanese picks the noun according to how the outcome turned out, and using the wrong one is heard immediately.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n3-sei-de';

UPDATE etymology_entries SET body = 'A noun meaning a time or an instance. 会うたびに is "on each occasion of meeting", with no idiom involved.

Because it is a noun it takes what all nouns take: a plain-form clause in front, 会うたびに, or another noun with の, 旅行のたびに. Being a counter has nothing to do with it — うち, まま and かぎり behave the same way.', updated_at = now()
WHERE id = 'ety-n3-tabi-ni';

UPDATE etymology_entries SET body = 'A 通り is a street, a route, a way through. 言ったとおりに is going along the path the words laid down.

Because it is a noun it takes の after another noun — 予定のとおり — and voices to どおり when it is fixed to one: 予定どおり. That voicing is rendaku, the habit many native nouns show in second position — a tendency of compounds rather than a rule, since plenty of nouns resist it.', updated_at = now()
WHERE id = 'ety-n3-toori';

UPDATE etymology_entries SET claim = 'って goes back to quoting と, with the verb of saying absorbed into the particle.',
    body = '「行く」と言っていた compressed to 行くって. Which route it took is disputed — a gemination of classical とて, or a contraction of と言って, or of という, which is the account usually given for the topic use.

That is why って can stand where と cannot — 田中さんって人, 明日って本当？ — and why it needs no verb after it. The saying is already implied by the particle that used to mark it.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n3-tte-quote';

UPDATE etymology_entries SET claim = 'わけ is 分け, from 分ける "to divide" — a distinction drawn, hence the sense a thing makes.',
    body = '訳 is only its customary spelling — the on-reading やく, "translate", has nothing to do with it. The word is the nominalised 分け, and it shares its root with 分かる: something divided off is something told apart, and what you can tell apart makes sense. 訳が分からない contains the same idea twice.

わけだ says a reason for this exists and has just become apparent, which is why it lands as "no wonder" rather than as a fresh claim.

The whole family is that noun with different endings attached. わけがない denies the reason exists at all; わけではない denies only that this is the reason; わけにはいかない says the reason cannot be made to go anywhere. Learn the noun and the three patterns stop being separate items.', updated_at = now()
WHERE id = 'ety-n3-wake';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n3-you-ga-nai';
