-- The why-layer for N3: 44 of the 55 topics.
--
-- N3 is where Japanese stops teaching forms and starts teaching nouns wearing
-- grammar. わけ is 訳, a reason; ほど is 程, an extent; くらい is 位, a rank;
-- まま is 儘, a state left standing; くせ is 癖, a bad habit. Almost every
-- pattern at this level is an ordinary noun or the te-form of an ordinary verb,
-- and reading it that way turns a list of set phrases back into words.
--
-- The two that pay for the whole batch: かねない is the NEGATIVE of かねる, so
-- 遅刻しかねない is a double negative and that is why two forms one syllable
-- apart mean opposite things; and 向け against 向き is the transitive-
-- intransitive pair that runs through the entire language, not a rule peculiar
-- to this pattern.
--
-- Eleven topics are left without an entry. 〜はずがない, 〜たところだ,
-- 〜ように言う, お〜ください, 〜ながらも and 〜ため (cause) are covered by entries
-- already on their parent forms at N4 or N5, and repeating an etymology under
-- a second slug would be padding. 〜だけでなく and 〜ように見える are transparent.
-- 〜っぽい and 〜だらけ have no origin I can state without inventing one, which
-- is the failure this layer exists to prevent.
--
-- Nothing here has a source row: `source_count` is 0 rather than a number with
-- nothing behind it, and every entry lands at 'in-review'. Every entry a reader
-- can see carries a human review, and this seed does not break that.
--
-- Additive, idempotent, safe on a live database.

-- Joined to grammar_points by SLUG, not by a guessed id. Most ids are
-- gp-<slug> and 49 are not — gp-owari-ni carries the slug kawari-ni — so
-- building the id by hand fails the foreign key on exactly those rows.
INSERT INTO etymology_entries
  (id, language_id, grammar_point_id, aspect, claim, body, period, confidence,
   is_disputed, is_primary, status, generated_by, source_count)
SELECT v.id, 'lang-ja', g.id, v.aspect, v.claim, v.body, v.period, v.confidence,
       false, true, 'in-review', 'claude', 0
FROM (VALUES
  ('ety-n3-beki', 'beki', 'historical-grammar',
   'べき is the 連体形 of べし, the Old Japanese auxiliary of obligation and expectation.',
   'べし had a full set of forms, and べき is the one that stood before a noun. That is why the modern pattern is べき and never べし except in set phrases — you are using a form that was built to modify something.

It also explains the する oddity. Classical べし attached to the 終止形, and する in classical Japanese was す, so both するべき and すべき are alive: one follows the modern verb, the other the classical one. The negative べからず on old signs is the same auxiliary, still forbidding things.',
   'Heian', 'well-supported'),

  ('ety-n3-wake', 'wake', 'word-origin',
   'わけ is the noun 訳 — a reason, or the sense a thing makes.',
   'An ordinary noun, still visible in 訳が分からない, "makes no sense". わけだ says that a reason for this exists and has just become apparent, which is why it lands as "no wonder" rather than as a fresh claim.

The whole family is that noun with different endings attached. わけがない denies the reason exists at all; わけではない denies only that this is the reason; わけにはいかない says the reason cannot be made to go anywhere. Learn the noun and the three patterns stop being separate items.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-wake-dewa-nai', 'wake-dewa-nai', 'historical-grammar',
   'The partial denial lives in では, not in わけ.',
   'わけがない flatly denies that any reason exists. わけではない uses では — the topic-marked negative — and topic-marking is what makes it partial: it denies this particular account while leaving others standing.

So 嫌いなわけではない says not that liking is untrue but that dislike is not the explanation. The same では does the same softening everywhere else in the language, which is why the pattern feels hedged without anything hedging having been added.',
   'Modern', 'attested'),

  ('ety-n3-mono-da', 'mono-da', 'word-origin',
   'もの is 物, a thing — and naming something as a thing is what makes it general.',
   '若い頃はよく遊んだものだ and 人は死ぬものだ look unrelated until you read もの literally. Both say "that is a thing" — the second about how the world reliably is, the first about how life reliably was.

Generality is the common element, and it is why ものだ cannot be used for a single occurrence. 昨日遊んだものだ is wrong: one afternoon is an event, not a thing that holds.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-koto-ni-suru', 'koto-ni-suru', 'historical-grammar',
   'ことにする is the noun こと with する — making a matter be so.',
   'The same する that pairs with なる everywhere else in Japanese, here acting on こと, "a matter". You make the matter the case, so the decision is yours.

Set against ことになる it is the whole grammar of agency in two verbs, exactly as ようにする sits against ようになる. And ことにしている, the progressive, is a decision kept up — which is how Japanese says "I make a policy of".',
   'Old Japanese', 'well-supported'),

  ('ety-n3-koto-ni-naru', 'koto-ni-naru', 'historical-grammar',
   'ことになる is こと with なる — a matter that comes to be so, with nobody named.',
   'なる is the verb of things happening of themselves. Put a matter into it and the matter settles without anyone being said to have settled it.

That is why it is the polite way to report a decision you did in fact make: 来月転勤することになりました leaves the deciding unattributed, which is more comfortable than announcing it. The construction is not passive, but it does the work a passive would do in English.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-uchi-ni', 'uchi-ni', 'word-origin',
   'うち is 内, "the inside" — inside a stretch of time, before it closes.',
   'The plain noun for an interior. 若いうちに is literally within the young part, and the sense of a window that will shut comes from the walls the noun implies.

It is why うちに and 間に are not interchangeable. 間に is neutral about the window ending; うちに says get it done before the inside runs out, and that urgency is the noun, not an idiom laid over it.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-tabi-ni', 'tabi-ni', 'word-origin',
   'たび is 度, an occasion — the same 度 counted in 一度 and 何度.',
   'A noun meaning a time or an instance. 会うたびに is "on each occasion of meeting", with no idiom involved.

Because it is a counter noun it wants a whole occurrence in front of it, which is why たびに takes the plain present rather than a stem, and why a noun before it needs の: 旅行のたびに.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-to-tomo-ni', 'to-tomo-ni', 'word-origin',
   'ともに is 共に, "together with" — the 共 of 共通 and 共に働く.',
   'A plain adverb built on a noun of sharing. とともに names two things as keeping company.

That covers both textbook senses without splitting them: accompanying (家族とともに) and moving in step (年をとるとともに). Company in space and company in change are the same idea, and Japanese did not separate them.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-ni-tsurete', 'ni-tsurete', 'word-origin',
   'つれて is the te-form of 連れる, "to lead along with you".',
   '子供を連れて行く is taking a child along. につれて keeps that image exactly: one thing moves and drags the other after it.

Hence the constraint that catches people out — につれて needs gradual, continuous change on both sides. A single step cannot lead anything along, so 春になるにつれて works and 駅に着くにつれて does not.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-ni-shitagatte', 'ni-shitagatte', 'word-origin',
   'したがって is the te-form of 従う, "to follow" or "to obey".',
   'One verb, and its two ordinary senses are the two textbook meanings. 規則に従う is obeying a rule; 川に従って歩く is following a river along.

So 指示にしたがって is compliance and 年をとるにしたがって is keeping pace, and there is nothing else to memorise. It is the stiffer, more written cousin of につれて because 従う is the stiffer, more written verb.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-ni-yotte', 'ni-yotte', 'word-origin',
   'によって is the te-form of 因る／依る, "to depend on, to be caused by".',
   'Four textbook meanings — means, cause, agent, variation — and one verb behind all of them. Whatever the sentence is doing, によって names the thing the outcome hangs on.

The agent use in a passive is the same idea: この本は彼によって書かれた says the writing depended on him. And 人によって違う is variation because what differs is exactly what it depends on. The English translations diverge; the Japanese never did.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-ni-taishite', 'ni-taishite', 'word-origin',
   '対して is the te-form of 対する, "to face" or "to be opposite".',
   '対 is the 対 of 反対 and 対立 — one thing set facing another. に対して puts the sentence in that posture.

Both senses follow from the picture. Facing someone is directing something at them (私に対して失礼だ); facing something is being set against it, which gives the contrastive reading (兄に対して弟は静かだ). Same stance, read forwards or sideways.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-ni-tsuite', 'ni-tsuite', 'word-origin',
   'ついて is the te-form of 付く, "to attach to, to be stuck to".',
   '付く is the verb in 気が付く and 手に付く. について fastens the sentence onto a topic and then talks about it.

The attaching image is why について takes a topic rather than an object, and why it sits so comfortably in the language of reports and papers: this is the thing the discussion is fixed to.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-ni-totte', 'ni-totte', 'word-origin',
   'とって is the te-form of 取る, "to take" — taking something as your position.',
   '私にとって is standing where I stand and looking from there. The verb is the everyday 取る, doing the work English does with "from the standpoint of".

That is why にとって wants a person or a group and sounds wrong on an inanimate thing with no vantage of its own, and why it pairs with judgements — 大切, 難しい, 必要 — rather than with plain descriptions of fact.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-kagiri', 'kagiri', 'word-origin',
   'かぎり is 限り, the 連用形 of 限る — "to set a boundary".',
   'A noun meaning the limit of something. 私が知るかぎり draws a line around what I know and speaks only inside it.

The pattern that looks like a different meaning is the same line seen from the other side: 生きているかぎり is for as long as the boundary holds. Extent and duration are one limit, measured in space or in time.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-sae', 'sae', 'historical-grammar',
   'さえ meant "in addition" before it meant "even".',
   'Old Japanese さへ added something on top of what was already there. The modern sense is that addition narrowed to its most surprising case — the one you would not have added.

The older meaning explains the conditional use, which otherwise looks unrelated. 来さえすればいい is "if only the coming is added, it is fine": さえ names the one further thing needed, and ば supplies the condition. Addition, not emphasis, is what makes that sentence work.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-koso', 'koso', 'historical-grammar',
   'こそ is an Old Japanese focus particle that used to change the verb at the end of the sentence.',
   'Classical Japanese had 係り結び: certain particles mid-sentence forced a particular ending on the final verb, and こそ demanded the 已然形. The agreement is gone; the particle stayed.

What it does now is what it always did — single one element out as the one that counts. That is why こそ replaces は and が rather than joining them, and why 今こそ and あなたこそ need no other emphasis around them.',
   'Heian', 'well-supported'),

  ('ety-n3-hodo', 'hodo', 'word-origin',
   'ほど is 程, a noun meaning extent or degree.',
   'Still written 程 in formal prose and still a plain noun: 程度 is "degree", 身の程 is one''s station.

Both patterns are that noun. 死ぬほど疲れた measures tiredness against dying; 高いほどいい pairs two extents and lets them rise together. The "the more, the more" construction is not a special form but the noun used twice.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-kurai', 'kurai', 'word-origin',
   'くらい is 位, a noun meaning rank or grade.',
   'The 位 of 一位 and 位置 — a place on a scale. Put after a quantity it gives the approximate reading, because naming a grade is vaguer than naming a number.

The belittling use is the same scale pointed downward. 掃除くらいしなさい says cleaning ranks that low, so there is no excuse — the dismissiveness is the noun doing its ordinary job.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-toori', 'toori', 'word-origin',
   'とおり is 通り, from 通る — "to pass along".',
   'A 通り is a street, a route, a way through. 言ったとおりに is going along the path the words laid down.

Because it is a noun it takes の after another noun — 予定のとおり — and voices to どおり when it is fixed to one: 予定どおり. That rendaku is the ordinary sound change any noun undergoes in second position, not a separate word.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-mama', 'mama', 'word-origin',
   'まま is 儘, a noun meaning a state left exactly as it stood.',
   'The noun survives in わがまま, "one''s own way", and in 気の向くまま. It names a condition nobody has altered.

That is why まま takes the past tense in front of it — 窓を開けたまま — although English says "with the window open". Japanese names the state as something that was done and then left, so the verb has to be finished before the leaving can begin.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-kke', 'kke', 'historical-grammar',
   'っけ descends from けり, the Old Japanese auxiliary of recollection.',
   'けり marked something recalled or newly noticed rather than plainly reported. Worn down through け, it survives only in this small casual ending.

The old meaning is intact. っけ never asks a fresh question — it asks you to help retrieve something the speaker feels they already knew, which is why 何だっけ is natural and asking a stranger 名前は何だっけ is not.',
   'Heian', 'attested'),

  ('ety-n3-tte-quote', 'tte-quote', 'historical-grammar',
   'って is the quotative と with the 言って worn off.',
   '「行く」と言っていた compressed to 行くって. The verb of saying dropped out and left the particle to do the whole job.

That is why って can stand where と cannot — 田中さんって人, 明日って本当？ — and why it needs no verb after it. The saying is already implied by the particle that used to mark it.',
   'Edo', 'well-supported'),

  ('ety-n3-nanka', 'nanka', 'word-origin',
   'なんか is 何か worn down, and なんて is 何と — the question word doing the belittling.',
   'Reaching for "what" rather than naming the thing is what makes these dismissive. 勉強なんか is roughly "study, or whatever", the vagueness deliberate.

So the tone is not an extra fact to memorise; it is built in, and it is why なんか cannot be used politely about a listener''s things. 私なんか, turned on yourself, is self-deprecation for exactly the same reason.',
   'Edo', 'attested'),

  ('ety-n3-sasete-itadaku', 'sasete-itadaku', 'historical-grammar',
   'It is the causative plus いただく: receiving the favour of being allowed to do it.',
   '説明させていただきます parses as "I receive your letting me explain". Every piece is literal — させ is the causative, いただく the humble もらう.

That is why it implies permission was granted, and why it grates when nobody granted anything. Used for something entirely your own — 閉店させていただきます — it asks the listener to supply a consent they were never asked for, which is the exact reason the form is criticised in Japanese as much as it is taught.',
   'Modern', 'well-supported'),

  ('ety-n3-zaru-o-enai', 'zaru-o-enai', 'historical-grammar',
   'It is a classical double negative: "cannot obtain the not-doing of it".',
   'ざる is the 連体形 of ず, the Old Japanese negative, and 得ない is the negative potential of 得る, "to obtain". 行かざるを得ない says the not-going cannot be had.

Knowing ざる is the old ず explains the attachment, which otherwise has to be memorised: it goes on the ない stem, 行か-, because that is the stem ず always took. And する is the exception せざるを得ない because classical する was す.',
   'Heian', 'well-supported'),

  ('ety-n3-ni-chigainai', 'ni-chigainai', 'word-origin',
   '違いない is literally "there is no discrepancy" — from 違う, to differ.',
   '間違い is a mistake, a thing that came out different. に違いない says there is no gap between this and how matters are.

Which is why it sits so much higher than かもしれない or でしょう. It is not a strong guess but a claim that no other reading fits, and that is also why it belongs to the speaker''s own reasoning rather than to reported evidence.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-osore-ga-aru', 'osore-ga-aru', 'word-origin',
   'おそれ is 恐れ, the noun from 恐れる — a fear.',
   'A plain noun for something feared. 恐れがある is "there exists a fear of it", which is why the pattern only ever attaches to bad outcomes.

It is the stiff, official register — weather warnings, notices, reports — because naming a fear as a thing that exists is how documents talk. 危険性がある is its Sino-Japanese equivalent and behaves the same way.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-kanenai', 'kanenai', 'historical-grammar',
   'かねない is the negative of かねる, so it is a double negative: not-unable-to.',
   'かねる means to be unable to bring oneself to do something — 分かりかねます, "I am not in a position to know". Negate it and you get "it is not that this could not happen".

That is the whole reason かねない means "might well" while かねる means "cannot", two opposite-looking forms one syllable apart. And it explains the tone: you only bother saying a bad thing is not impossible when you are worried about it.',
   'Heian', 'well-supported'),

  ('ety-n3-gachi', 'gachi', 'word-origin',
   'がち is 勝ち, from 勝つ — "to win, to prevail".',
   'The thing that tends to happen is the thing that wins out. 病気がち is illness prevailing more often than not.

The negative colouring follows from that: what prevails over you is not usually welcome, which is why 忘れがち and 遅れがち are natural and 元気がち is not. Compare 気味, which is a touch of something, and っぽい, which is a resemblance — three suffixes, three quite different pictures.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-muke-muki', 'muke-muki', 'historical-grammar',
   '向け and 向き are the transitive and intransitive halves of one verb.',
   '向ける is to aim something; 向く is to face. 子供向け is aimed at children by whoever made it; 子供向き is suited to children by its own nature.

So the distinction textbooks state as a rule is the ordinary transitive-intransitive pair that runs through the whole language — 開ける and 開く, 集める and 集まる. Somebody points the one; the other simply faces.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-gimi', 'gimi', 'word-origin',
   '気味 is 気 plus 味 — the feel and the flavour of a thing.',
   '気 is the same 気 as in 元気 and 天気; 味 is taste. Together they name a slight quality detectable in something.

Which is why 気味 is always a small amount and usually an unwelcome one: 風邪気味 is a touch of a cold, 遅れ気味 is running a little late. A trace is what you notice when something is going slightly wrong.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-kake', 'kake', 'word-origin',
   'かけ is 掛け, from 掛ける — "to hang".',
   'Something hung is suspended: begun and not brought down. 食べかけのパン is bread left hanging between started and finished.

The same verb gives 〜かける as a verb ending (言いかけた, "started to say") and turns up again in 〜から〜にかけて, where the span is hung between two points. One image, three patterns.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-nikui-gatai', 'nikui-gatai', 'word-origin',
   'がたい is 難い — the same 難 as にくい, in its other reading.',
   '難 is read both かた and にく. がたい is the older, stiffer reading, which is why it keeps to written and emotional contexts.

The division of labour follows the register rather than a rule about meaning: にくい is physical difficulty (読みにくい字), がたい is difficulty in bringing yourself to it (信じがたい, 忘れがたい). And 難い in ありがたい — hard to exist, therefore precious — is where ありがとう comes from.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-you-ga-nai', 'you-ga-nai', 'word-origin',
   'ようがない is the noun 様 again: there is no way in which it could be done.',
   'The same 様 that gives ようだ and ように. ようがない says no manner of doing it exists at all.

That is stronger than できない, which says you cannot; ようがない says nobody could, because there is no method to reach for. 連絡しようがない is not reluctance or inability but the absence of any channel.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-tsutsu', 'tsutsu', 'historical-grammar',
   'つつ is an Old Japanese suffix for an action repeated or kept up.',
   'It attached to the 連用形, exactly as ながら does, and the two are near-synonyms because they were built the same way. つつ simply stayed in the written language while ながら moved into speech.

The repetition sense survives in つつある, which is not "while" at all but a change still under way — 増えつつある, going on increasing. That is the older meaning, preserved in the one place ながら never took over.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-mono-no', 'mono-no', 'word-origin',
   'ものの is the noun 物 with の — the same 物 as ものだ.',
   'It names the situation as a thing and then modifies onward from it, and the concession comes from the mismatch that follows rather than from any word meaning "although".

So 買ったものの使っていない sets the buying up as an established thing and then reports what did not follow from it. It is the written register''s けれど, and it will not take a request or an invitation afterwards, because a stated thing cannot be aimed at a proposal.',
   'Heian', 'attested'),

  ('ety-n3-kuseni', 'kuseni', 'word-origin',
   'くせ is 癖, a habit — and usually a bad one.',
   '口癖 is a verbal tic, 悪い癖 a vice. The noun already carries fault before any grammar is applied.

That is where the contempt in くせに comes from, and why it cannot be used neutrally or about yourself without irony. 子供のくせに names being a child as the failing, which is exactly the tone のに does not have.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-sei-de', 'sei-de', 'word-origin',
   'せい is 所為 — literally "the thing done", a doing that something is charged with.',
   'The kanji spell out an act attributed to a source. Naming a cause that way is naming who is answerable for it.

Which is why せいで is always blame and おかげで always credit, though both simply mean "because of". Japanese picks the noun according to how the outcome turned out, and using the wrong one is heard immediately.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-okage-de', 'okage-de', 'word-origin',
   'おかげ is お陰 — the honourable shade, the shadow of something you shelter under.',
   'The image is standing in the protection of a larger thing: originally a god or a benefactor, and the お is not decorative but part of the word.

That is why おかげで credits rather than merely explains, and why おかげさまで works as a set reply with nothing named at all — you are acknowledging shelter without saying whose. Its opposite せいで comes from a noun about blame, and the pair splits every cause in the language into helped and harmed.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-toshite', 'toshite', 'historical-grammar',
   'として is the quotative と with する — treating something AS something.',
   'The と that quotes, and する doing what it does in ことにする: making it so. 医者として来た is coming, taken as a doctor.

So it is not a preposition but a small clause, which is why it stacks naturally into としては and としても, and why 〜をXとする ("regard X as") is the same construction with the pieces spread out.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-kara-nikakete', 'kara-nikakete', 'word-origin',
   'にかけて is 掛ける again — the span is hung between two points.',
   'The same verb as in 食べかけ and 言いかける. Here what is suspended is a stretch: 月曜から水曜にかけて hangs the period between the two days named.

Because a hung thing sags rather than stopping sharply, the boundaries are approximate. That is the difference from から〜まで, which draws hard edges, and it is why にかけて suits weather, seasons and regions rather than timetables.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-kawari-ni', 'kawari-ni', 'word-origin',
   'かわり is 代わり, from 代わる — "to take the place of".',
   'A substitution. 代わりに puts one thing into the slot another would have filled.

Both textbook meanings are that one act. Replacement is 私の代わりに行く; exchange is 手伝う代わりに昼を奢って, where each side stands in for the other. Compensation is just substitution with something owed going the other way.',
   'Old Japanese', 'well-supported')
) AS v(id, slug, aspect, claim, body, period, confidence)
JOIN grammar_points g ON g.slug = v.slug AND g.language_id = 'lang-ja'
ON CONFLICT (id) DO NOTHING;

-- One review-queue row per entry, so they surface where the others did.
INSERT INTO content_review_queue
  (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT v.id, 'lang-ja', 'etymology_entries', v.target, 'create', v.proposed::jsonb, 'claude', 10, 'pending'
FROM (VALUES
  ('rq-ety-n3-beki', 'ety-n3-beki', '{"claim": "べき is the 連体形 of べし, the Old Japanese auxiliary of obligation and expectation.", "body": "べし had a full set of forms, and べき is the one that stood before a noun. That is why the modern pattern is べき and never べし except in set phrases — you are using a form that was built to modify something.\n\nIt also explains the する oddity. Classical べし attached to the 終止形, and する in classical Japanese was す, so both するべき and すべき are alive: one follows the modern verb, the other the classical one. The negative べからず on old signs is the same auxiliary, still forbidding things.", "confidence": "well-supported"}'),
  ('rq-ety-n3-wake', 'ety-n3-wake', '{"claim": "わけ is the noun 訳 — a reason, or the sense a thing makes.", "body": "An ordinary noun, still visible in 訳が分からない, \"makes no sense\". わけだ says that a reason for this exists and has just become apparent, which is why it lands as \"no wonder\" rather than as a fresh claim.\n\nThe whole family is that noun with different endings attached. わけがない denies the reason exists at all; わけではない denies only that this is the reason; わけにはいかない says the reason cannot be made to go anywhere. Learn the noun and the three patterns stop being separate items.", "confidence": "well-supported"}'),
  ('rq-ety-n3-wake-dewa-nai', 'ety-n3-wake-dewa-nai', '{"claim": "The partial denial lives in では, not in わけ.", "body": "わけがない flatly denies that any reason exists. わけではない uses では — the topic-marked negative — and topic-marking is what makes it partial: it denies this particular account while leaving others standing.\n\nSo 嫌いなわけではない says not that liking is untrue but that dislike is not the explanation. The same では does the same softening everywhere else in the language, which is why the pattern feels hedged without anything hedging having been added.", "confidence": "attested"}'),
  ('rq-ety-n3-mono-da', 'ety-n3-mono-da', '{"claim": "もの is 物, a thing — and naming something as a thing is what makes it general.", "body": "若い頃はよく遊んだものだ and 人は死ぬものだ look unrelated until you read もの literally. Both say \"that is a thing\" — the second about how the world reliably is, the first about how life reliably was.\n\nGenerality is the common element, and it is why ものだ cannot be used for a single occurrence. 昨日遊んだものだ is wrong: one afternoon is an event, not a thing that holds.", "confidence": "well-supported"}'),
  ('rq-ety-n3-koto-ni-suru', 'ety-n3-koto-ni-suru', '{"claim": "ことにする is the noun こと with する — making a matter be so.", "body": "The same する that pairs with なる everywhere else in Japanese, here acting on こと, \"a matter\". You make the matter the case, so the decision is yours.\n\nSet against ことになる it is the whole grammar of agency in two verbs, exactly as ようにする sits against ようになる. And ことにしている, the progressive, is a decision kept up — which is how Japanese says \"I make a policy of\".", "confidence": "well-supported"}'),
  ('rq-ety-n3-koto-ni-naru', 'ety-n3-koto-ni-naru', '{"claim": "ことになる is こと with なる — a matter that comes to be so, with nobody named.", "body": "なる is the verb of things happening of themselves. Put a matter into it and the matter settles without anyone being said to have settled it.\n\nThat is why it is the polite way to report a decision you did in fact make: 来月転勤することになりました leaves the deciding unattributed, which is more comfortable than announcing it. The construction is not passive, but it does the work a passive would do in English.", "confidence": "well-supported"}'),
  ('rq-ety-n3-uchi-ni', 'ety-n3-uchi-ni', '{"claim": "うち is 内, \"the inside\" — inside a stretch of time, before it closes.", "body": "The plain noun for an interior. 若いうちに is literally within the young part, and the sense of a window that will shut comes from the walls the noun implies.\n\nIt is why うちに and 間に are not interchangeable. 間に is neutral about the window ending; うちに says get it done before the inside runs out, and that urgency is the noun, not an idiom laid over it.", "confidence": "well-supported"}'),
  ('rq-ety-n3-tabi-ni', 'ety-n3-tabi-ni', '{"claim": "たび is 度, an occasion — the same 度 counted in 一度 and 何度.", "body": "A noun meaning a time or an instance. 会うたびに is \"on each occasion of meeting\", with no idiom involved.\n\nBecause it is a counter noun it wants a whole occurrence in front of it, which is why たびに takes the plain present rather than a stem, and why a noun before it needs の: 旅行のたびに.", "confidence": "well-supported"}'),
  ('rq-ety-n3-to-tomo-ni', 'ety-n3-to-tomo-ni', '{"claim": "ともに is 共に, \"together with\" — the 共 of 共通 and 共に働く.", "body": "A plain adverb built on a noun of sharing. とともに names two things as keeping company.\n\nThat covers both textbook senses without splitting them: accompanying (家族とともに) and moving in step (年をとるとともに). Company in space and company in change are the same idea, and Japanese did not separate them.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ni-tsurete', 'ety-n3-ni-tsurete', '{"claim": "つれて is the te-form of 連れる, \"to lead along with you\".", "body": "子供を連れて行く is taking a child along. につれて keeps that image exactly: one thing moves and drags the other after it.\n\nHence the constraint that catches people out — につれて needs gradual, continuous change on both sides. A single step cannot lead anything along, so 春になるにつれて works and 駅に着くにつれて does not.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ni-shitagatte', 'ety-n3-ni-shitagatte', '{"claim": "したがって is the te-form of 従う, \"to follow\" or \"to obey\".", "body": "One verb, and its two ordinary senses are the two textbook meanings. 規則に従う is obeying a rule; 川に従って歩く is following a river along.\n\nSo 指示にしたがって is compliance and 年をとるにしたがって is keeping pace, and there is nothing else to memorise. It is the stiffer, more written cousin of につれて because 従う is the stiffer, more written verb.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ni-yotte', 'ety-n3-ni-yotte', '{"claim": "によって is the te-form of 因る／依る, \"to depend on, to be caused by\".", "body": "Four textbook meanings — means, cause, agent, variation — and one verb behind all of them. Whatever the sentence is doing, によって names the thing the outcome hangs on.\n\nThe agent use in a passive is the same idea: この本は彼によって書かれた says the writing depended on him. And 人によって違う is variation because what differs is exactly what it depends on. The English translations diverge; the Japanese never did.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ni-taishite', 'ety-n3-ni-taishite', '{"claim": "対して is the te-form of 対する, \"to face\" or \"to be opposite\".", "body": "対 is the 対 of 反対 and 対立 — one thing set facing another. に対して puts the sentence in that posture.\n\nBoth senses follow from the picture. Facing someone is directing something at them (私に対して失礼だ); facing something is being set against it, which gives the contrastive reading (兄に対して弟は静かだ). Same stance, read forwards or sideways.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ni-tsuite', 'ety-n3-ni-tsuite', '{"claim": "ついて is the te-form of 付く, \"to attach to, to be stuck to\".", "body": "付く is the verb in 気が付く and 手に付く. について fastens the sentence onto a topic and then talks about it.\n\nThe attaching image is why について takes a topic rather than an object, and why it sits so comfortably in the language of reports and papers: this is the thing the discussion is fixed to.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ni-totte', 'ety-n3-ni-totte', '{"claim": "とって is the te-form of 取る, \"to take\" — taking something as your position.", "body": "私にとって is standing where I stand and looking from there. The verb is the everyday 取る, doing the work English does with \"from the standpoint of\".\n\nThat is why にとって wants a person or a group and sounds wrong on an inanimate thing with no vantage of its own, and why it pairs with judgements — 大切, 難しい, 必要 — rather than with plain descriptions of fact.", "confidence": "well-supported"}'),
  ('rq-ety-n3-kagiri', 'ety-n3-kagiri', '{"claim": "かぎり is 限り, the 連用形 of 限る — \"to set a boundary\".", "body": "A noun meaning the limit of something. 私が知るかぎり draws a line around what I know and speaks only inside it.\n\nThe pattern that looks like a different meaning is the same line seen from the other side: 生きているかぎり is for as long as the boundary holds. Extent and duration are one limit, measured in space or in time.", "confidence": "well-supported"}'),
  ('rq-ety-n3-sae', 'ety-n3-sae', '{"claim": "さえ meant \"in addition\" before it meant \"even\".", "body": "Old Japanese さへ added something on top of what was already there. The modern sense is that addition narrowed to its most surprising case — the one you would not have added.\n\nThe older meaning explains the conditional use, which otherwise looks unrelated. 来さえすればいい is \"if only the coming is added, it is fine\": さえ names the one further thing needed, and ば supplies the condition. Addition, not emphasis, is what makes that sentence work.", "confidence": "well-supported"}'),
  ('rq-ety-n3-koso', 'ety-n3-koso', '{"claim": "こそ is an Old Japanese focus particle that used to change the verb at the end of the sentence.", "body": "Classical Japanese had 係り結び: certain particles mid-sentence forced a particular ending on the final verb, and こそ demanded the 已然形. The agreement is gone; the particle stayed.\n\nWhat it does now is what it always did — single one element out as the one that counts. That is why こそ replaces は and が rather than joining them, and why 今こそ and あなたこそ need no other emphasis around them.", "confidence": "well-supported"}'),
  ('rq-ety-n3-hodo', 'ety-n3-hodo', '{"claim": "ほど is 程, a noun meaning extent or degree.", "body": "Still written 程 in formal prose and still a plain noun: 程度 is \"degree\", 身の程 is one''s station.\n\nBoth patterns are that noun. 死ぬほど疲れた measures tiredness against dying; 高いほどいい pairs two extents and lets them rise together. The \"the more, the more\" construction is not a special form but the noun used twice.", "confidence": "well-supported"}'),
  ('rq-ety-n3-kurai', 'ety-n3-kurai', '{"claim": "くらい is 位, a noun meaning rank or grade.", "body": "The 位 of 一位 and 位置 — a place on a scale. Put after a quantity it gives the approximate reading, because naming a grade is vaguer than naming a number.\n\nThe belittling use is the same scale pointed downward. 掃除くらいしなさい says cleaning ranks that low, so there is no excuse — the dismissiveness is the noun doing its ordinary job.", "confidence": "well-supported"}'),
  ('rq-ety-n3-toori', 'ety-n3-toori', '{"claim": "とおり is 通り, from 通る — \"to pass along\".", "body": "A 通り is a street, a route, a way through. 言ったとおりに is going along the path the words laid down.\n\nBecause it is a noun it takes の after another noun — 予定のとおり — and voices to どおり when it is fixed to one: 予定どおり. That rendaku is the ordinary sound change any noun undergoes in second position, not a separate word.", "confidence": "well-supported"}'),
  ('rq-ety-n3-mama', 'ety-n3-mama', '{"claim": "まま is 儘, a noun meaning a state left exactly as it stood.", "body": "The noun survives in わがまま, \"one''s own way\", and in 気の向くまま. It names a condition nobody has altered.\n\nThat is why まま takes the past tense in front of it — 窓を開けたまま — although English says \"with the window open\". Japanese names the state as something that was done and then left, so the verb has to be finished before the leaving can begin.", "confidence": "well-supported"}'),
  ('rq-ety-n3-kke', 'ety-n3-kke', '{"claim": "っけ descends from けり, the Old Japanese auxiliary of recollection.", "body": "けり marked something recalled or newly noticed rather than plainly reported. Worn down through け, it survives only in this small casual ending.\n\nThe old meaning is intact. っけ never asks a fresh question — it asks you to help retrieve something the speaker feels they already knew, which is why 何だっけ is natural and asking a stranger 名前は何だっけ is not.", "confidence": "attested"}'),
  ('rq-ety-n3-tte-quote', 'ety-n3-tte-quote', '{"claim": "って is the quotative と with the 言って worn off.", "body": "「行く」と言っていた compressed to 行くって. The verb of saying dropped out and left the particle to do the whole job.\n\nThat is why って can stand where と cannot — 田中さんって人, 明日って本当？ — and why it needs no verb after it. The saying is already implied by the particle that used to mark it.", "confidence": "well-supported"}'),
  ('rq-ety-n3-nanka', 'ety-n3-nanka', '{"claim": "なんか is 何か worn down, and なんて is 何と — the question word doing the belittling.", "body": "Reaching for \"what\" rather than naming the thing is what makes these dismissive. 勉強なんか is roughly \"study, or whatever\", the vagueness deliberate.\n\nSo the tone is not an extra fact to memorise; it is built in, and it is why なんか cannot be used politely about a listener''s things. 私なんか, turned on yourself, is self-deprecation for exactly the same reason.", "confidence": "attested"}'),
  ('rq-ety-n3-sasete-itadaku', 'ety-n3-sasete-itadaku', '{"claim": "It is the causative plus いただく: receiving the favour of being allowed to do it.", "body": "説明させていただきます parses as \"I receive your letting me explain\". Every piece is literal — させ is the causative, いただく the humble もらう.\n\nThat is why it implies permission was granted, and why it grates when nobody granted anything. Used for something entirely your own — 閉店させていただきます — it asks the listener to supply a consent they were never asked for, which is the exact reason the form is criticised in Japanese as much as it is taught.", "confidence": "well-supported"}'),
  ('rq-ety-n3-zaru-o-enai', 'ety-n3-zaru-o-enai', '{"claim": "It is a classical double negative: \"cannot obtain the not-doing of it\".", "body": "ざる is the 連体形 of ず, the Old Japanese negative, and 得ない is the negative potential of 得る, \"to obtain\". 行かざるを得ない says the not-going cannot be had.\n\nKnowing ざる is the old ず explains the attachment, which otherwise has to be memorised: it goes on the ない stem, 行か-, because that is the stem ず always took. And する is the exception せざるを得ない because classical する was す.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ni-chigainai', 'ety-n3-ni-chigainai', '{"claim": "違いない is literally \"there is no discrepancy\" — from 違う, to differ.", "body": "間違い is a mistake, a thing that came out different. に違いない says there is no gap between this and how matters are.\n\nWhich is why it sits so much higher than かもしれない or でしょう. It is not a strong guess but a claim that no other reading fits, and that is also why it belongs to the speaker''s own reasoning rather than to reported evidence.", "confidence": "well-supported"}'),
  ('rq-ety-n3-osore-ga-aru', 'ety-n3-osore-ga-aru', '{"claim": "おそれ is 恐れ, the noun from 恐れる — a fear.", "body": "A plain noun for something feared. 恐れがある is \"there exists a fear of it\", which is why the pattern only ever attaches to bad outcomes.\n\nIt is the stiff, official register — weather warnings, notices, reports — because naming a fear as a thing that exists is how documents talk. 危険性がある is its Sino-Japanese equivalent and behaves the same way.", "confidence": "well-supported"}'),
  ('rq-ety-n3-kanenai', 'ety-n3-kanenai', '{"claim": "かねない is the negative of かねる, so it is a double negative: not-unable-to.", "body": "かねる means to be unable to bring oneself to do something — 分かりかねます, \"I am not in a position to know\". Negate it and you get \"it is not that this could not happen\".\n\nThat is the whole reason かねない means \"might well\" while かねる means \"cannot\", two opposite-looking forms one syllable apart. And it explains the tone: you only bother saying a bad thing is not impossible when you are worried about it.", "confidence": "well-supported"}'),
  ('rq-ety-n3-gachi', 'ety-n3-gachi', '{"claim": "がち is 勝ち, from 勝つ — \"to win, to prevail\".", "body": "The thing that tends to happen is the thing that wins out. 病気がち is illness prevailing more often than not.\n\nThe negative colouring follows from that: what prevails over you is not usually welcome, which is why 忘れがち and 遅れがち are natural and 元気がち is not. Compare 気味, which is a touch of something, and っぽい, which is a resemblance — three suffixes, three quite different pictures.", "confidence": "well-supported"}'),
  ('rq-ety-n3-muke-muki', 'ety-n3-muke-muki', '{"claim": "向け and 向き are the transitive and intransitive halves of one verb.", "body": "向ける is to aim something; 向く is to face. 子供向け is aimed at children by whoever made it; 子供向き is suited to children by its own nature.\n\nSo the distinction textbooks state as a rule is the ordinary transitive-intransitive pair that runs through the whole language — 開ける and 開く, 集める and 集まる. Somebody points the one; the other simply faces.", "confidence": "well-supported"}'),
  ('rq-ety-n3-gimi', 'ety-n3-gimi', '{"claim": "気味 is 気 plus 味 — the feel and the flavour of a thing.", "body": "気 is the same 気 as in 元気 and 天気; 味 is taste. Together they name a slight quality detectable in something.\n\nWhich is why 気味 is always a small amount and usually an unwelcome one: 風邪気味 is a touch of a cold, 遅れ気味 is running a little late. A trace is what you notice when something is going slightly wrong.", "confidence": "well-supported"}'),
  ('rq-ety-n3-kake', 'ety-n3-kake', '{"claim": "かけ is 掛け, from 掛ける — \"to hang\".", "body": "Something hung is suspended: begun and not brought down. 食べかけのパン is bread left hanging between started and finished.\n\nThe same verb gives 〜かける as a verb ending (言いかけた, \"started to say\") and turns up again in 〜から〜にかけて, where the span is hung between two points. One image, three patterns.", "confidence": "well-supported"}'),
  ('rq-ety-n3-nikui-gatai', 'ety-n3-nikui-gatai', '{"claim": "がたい is 難い — the same 難 as にくい, in its other reading.", "body": "難 is read both かた and にく. がたい is the older, stiffer reading, which is why it keeps to written and emotional contexts.\n\nThe division of labour follows the register rather than a rule about meaning: にくい is physical difficulty (読みにくい字), がたい is difficulty in bringing yourself to it (信じがたい, 忘れがたい). And 難い in ありがたい — hard to exist, therefore precious — is where ありがとう comes from.", "confidence": "well-supported"}'),
  ('rq-ety-n3-you-ga-nai', 'ety-n3-you-ga-nai', '{"claim": "ようがない is the noun 様 again: there is no way in which it could be done.", "body": "The same 様 that gives ようだ and ように. ようがない says no manner of doing it exists at all.\n\nThat is stronger than できない, which says you cannot; ようがない says nobody could, because there is no method to reach for. 連絡しようがない is not reluctance or inability but the absence of any channel.", "confidence": "well-supported"}'),
  ('rq-ety-n3-tsutsu', 'ety-n3-tsutsu', '{"claim": "つつ is an Old Japanese suffix for an action repeated or kept up.", "body": "It attached to the 連用形, exactly as ながら does, and the two are near-synonyms because they were built the same way. つつ simply stayed in the written language while ながら moved into speech.\n\nThe repetition sense survives in つつある, which is not \"while\" at all but a change still under way — 増えつつある, going on increasing. That is the older meaning, preserved in the one place ながら never took over.", "confidence": "well-supported"}'),
  ('rq-ety-n3-mono-no', 'ety-n3-mono-no', '{"claim": "ものの is the noun 物 with の — the same 物 as ものだ.", "body": "It names the situation as a thing and then modifies onward from it, and the concession comes from the mismatch that follows rather than from any word meaning \"although\".\n\nSo 買ったものの使っていない sets the buying up as an established thing and then reports what did not follow from it. It is the written register''s けれど, and it will not take a request or an invitation afterwards, because a stated thing cannot be aimed at a proposal.", "confidence": "attested"}'),
  ('rq-ety-n3-kuseni', 'ety-n3-kuseni', '{"claim": "くせ is 癖, a habit — and usually a bad one.", "body": "口癖 is a verbal tic, 悪い癖 a vice. The noun already carries fault before any grammar is applied.\n\nThat is where the contempt in くせに comes from, and why it cannot be used neutrally or about yourself without irony. 子供のくせに names being a child as the failing, which is exactly the tone のに does not have.", "confidence": "well-supported"}'),
  ('rq-ety-n3-sei-de', 'ety-n3-sei-de', '{"claim": "せい is 所為 — literally \"the thing done\", a doing that something is charged with.", "body": "The kanji spell out an act attributed to a source. Naming a cause that way is naming who is answerable for it.\n\nWhich is why せいで is always blame and おかげで always credit, though both simply mean \"because of\". Japanese picks the noun according to how the outcome turned out, and using the wrong one is heard immediately.", "confidence": "well-supported"}'),
  ('rq-ety-n3-okage-de', 'ety-n3-okage-de', '{"claim": "おかげ is お陰 — the honourable shade, the shadow of something you shelter under.", "body": "The image is standing in the protection of a larger thing: originally a god or a benefactor, and the お is not decorative but part of the word.\n\nThat is why おかげで credits rather than merely explains, and why おかげさまで works as a set reply with nothing named at all — you are acknowledging shelter without saying whose. Its opposite せいで comes from a noun about blame, and the pair splits every cause in the language into helped and harmed.", "confidence": "well-supported"}'),
  ('rq-ety-n3-toshite', 'ety-n3-toshite', '{"claim": "として is the quotative と with する — treating something AS something.", "body": "The と that quotes, and する doing what it does in ことにする: making it so. 医者として来た is coming, taken as a doctor.\n\nSo it is not a preposition but a small clause, which is why it stacks naturally into としては and としても, and why 〜をXとする (\"regard X as\") is the same construction with the pieces spread out.", "confidence": "well-supported"}'),
  ('rq-ety-n3-kara-nikakete', 'ety-n3-kara-nikakete', '{"claim": "にかけて is 掛ける again — the span is hung between two points.", "body": "The same verb as in 食べかけ and 言いかける. Here what is suspended is a stretch: 月曜から水曜にかけて hangs the period between the two days named.\n\nBecause a hung thing sags rather than stopping sharply, the boundaries are approximate. That is the difference from から〜まで, which draws hard edges, and it is why にかけて suits weather, seasons and regions rather than timetables.", "confidence": "well-supported"}'),
  ('rq-ety-n3-kawari-ni', 'ety-n3-kawari-ni', '{"claim": "かわり is 代わり, from 代わる — \"to take the place of\".", "body": "A substitution. 代わりに puts one thing into the slot another would have filled.\n\nBoth textbook meanings are that one act. Replacement is 私の代わりに行く; exchange is 手伝う代わりに昼を奢って, where each side stands in for the other. Compensation is just substitution with something owed going the other way.", "confidence": "well-supported"}')
) AS v(id, target, proposed)
JOIN etymology_entries e ON e.id = v.target
ON CONFLICT (id) DO NOTHING;
