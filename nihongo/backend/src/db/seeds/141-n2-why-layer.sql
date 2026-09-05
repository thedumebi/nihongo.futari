-- The why-layer for N2: 53 of the 55 topics.
--
-- Almost every N2 pattern is the te-form of an ordinary verb or a two-kanji
-- noun, and reading it literally turns a list of set phrases back into words.
-- をめぐって is 巡る, to circle — which is where the argument in the pattern
-- comes from, though nothing in the words says so. に基づいて is 基 plus 付く,
-- fastened to a footing, so it wants a real authority and not an impression.
-- 反面 is the opposite FACE of one thing, which is why it cannot hold two
-- separate subjects the way 一方で can.
--
-- Three that are worth the batch on their own. 皮切り is the first burn in a
-- course of moxibustion, the sharpest one, which is why the pattern needs
-- something to spread afterwards. あげく is the closing verse of a linked-verse
-- poem, the end of a long sequence, and it still refuses to describe a good
-- outcome. And ものなら against ようものなら differ only by what stands in front —
-- a potential is a wish out of reach, a volitional is a warning.
--
-- Two topics have no entry. 〜もしない and 〜てばかりいる are their parts with
-- nothing added, and both parts already carry entries at N3.
--
-- Nothing here has a source row: `source_count` is 0 rather than a number with
-- nothing behind it, and every entry lands at 'in-review'.
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
  ('ety-n2-ni-kakawarazu', 'ni-kakawarazu', 'historical-grammar',
   'かかわらず is 関わる, "to be concerned with", plus the classical negative ず.',
   '関わる is an everyday verb — 事件に関わる, to be mixed up in something. にかかわらず says the outcome is not concerned with the thing named.

The ず is the Old Japanese negative, the same one in 知らず and ざるを得ない, and it is why the attachment is to the ない stem rather than to a te-form. 天候にかかわらず: the weather does not come into it.',
   'Heian', 'well-supported'),

  ('ety-n2-nimo-kakawarazu', 'nimo-kakawarazu', 'historical-grammar',
   'The も is the entire difference between "regardless of" and "despite".',
   'にかかわらず and にもかかわらず share every other syllable. も means "even", and adding it says that even this — which plainly should have been concerned in the matter — was not.

That is why にかかわらず takes neutral alternatives (晴雨にかかわらず) and にもかかわらず takes a real obstacle (努力したにもかかわらず). One is indifference, the other is a complaint, and も is doing all of it.',
   'Heian', 'well-supported'),

  ('ety-n2-wo-towazu', 'wo-towazu', 'historical-grammar',
   '問わず is 問う, "to ask", with the classical negative ず — "without asking".',
   '経験を問わず on a job advertisement says nobody will be asking about experience. The verb is the ordinary one in 問題 and 質問.

It sits alongside にかかわらず and に限らず as three ways of saying the same indifference, each built from a different verb: not asking, not being concerned, not limiting. The register differs because the verbs do — を問わず belongs to notices and forms.',
   'Heian', 'well-supported'),

  ('ety-n2-wo-kiniseze', 'wo-kiniseze', 'historical-grammar',
   'をものともせず is "not even making a thing of it" — もの, とも, and せず.',
   'もの is the ordinary noun; と marks what something is treated as; せず is する with the classical negative. Put together: not treating it as anything at all.

So the defiance is literal rather than idiomatic. 危険をものともせず does not say the danger was faced but that it was not even granted the status of an obstacle, which is why the pattern always attaches to something that plainly was one.',
   'Heian', 'well-supported'),

  ('ety-n2-wo-kawakiri-ni', 'wo-kawakiri-ni', 'word-origin',
   '皮切り is the first burn in a course of moxibustion — the one that cuts the skin.',
   'Moxa was burned on the skin in a series, and the 皮切り was the opening application: the sharpest, and the one everything after followed from.

That is why the pattern is not merely "first" but first-and-then-spreading. 東京を皮切りに全国へ needs the expansion to follow; a first item with nothing after it is not a 皮切り, however first it was.',
   'Edo', 'well-supported'),

  ('ety-n2-wo-komete', 'wo-komete', 'word-origin',
   '込める is "to put into, to load" — the verb for charging something with contents.',
   '弾を込める is loading a round. 心を込めて is loading the feeling in, and the metaphor is as physical in Japanese as it sounds.

Which is why を込めて only takes feelings and intentions, never facts or objects: what you load a thing with is something that fills it. The related 込む as a suffix — 詰め込む, 話し込む — is the same verb doing the same work.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-wo-megutte', 'wo-megutte', 'word-origin',
   'めぐって is 巡る, "to go around, to circle".',
   '巡る is the verb in 巡り会う and お遍路が巡る. をめぐって puts the sentence in orbit around a thing.

That is where the argument comes from, and it is not stated anywhere in the words. People circling a topic are people disputing it, so をめぐって attracts 対立, 議論 and 争い, while について — which merely attaches — stays neutral.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-motozuite', 'ni-motozuite', 'word-origin',
   '基づく is 基 ("foundation") plus 付く ("to attach") — fixed onto a base.',
   'The 基 of 基本 and 基礎, with the 付く of について. Something is fastened to a footing.

That is why に基づいて demands a real authority to rest on — 法律, データ, 事実 — and sounds wrong on a vague impression. The base has to be solid enough to attach to.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-wo-moto-ni', 'wo-moto-ni', 'word-origin',
   'もと is 元 or 基 — the source or the material a thing is made from.',
   'Nearly the same word as 基づく, used differently. をもとに supplies raw material: 実話をもとにした映画 is a film made out of a true story.

That is the distinction from に基づいて, which supplies authority. A film is built from the story and free to change it; a decision 基づいて the rules is bound by them. Material against grounds.',
   'Old Japanese', 'attested'),

  ('ety-n2-ni-oujite', 'ni-oujite', 'word-origin',
   '応じる is "to respond, to answer" — the 応 of 応答 and 反応.',
   '呼びかけに応じる is answering a call. に応じて makes one thing the answer to another.

Both textbook senses are that one act. Responding to a request is 要望に応じて; varying with a condition is 収入に応じて, where the amount answers the income. Something adjusts itself to fit, which is exactly what responding means.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-wataru', 'ni-wataru', 'word-origin',
   '渡る is "to cross over" — the verb for getting from one side to the other.',
   '橋を渡る, to cross a bridge. にわたって stretches the sentence across a span the way a crossing stretches over water.

So it needs breadth to cross. 三年にわたって works because three years is a distance; a single moment is not something you can cross, which is why にわたって never takes a point in time.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-kanshite', 'ni-kanshite', 'word-origin',
   '関する is "to relate to" — the same 関 as in にかかわらず.',
   'One kanji, two patterns at opposite ends of this level: に関して concerns itself with the topic, にかかわらず declines to.

に関して is the written register''s について, and the difference is only that: 関する is a Sino-Japanese verb and 付く is a native one, so the first belongs to reports and the second to speech. Neither carries the circling dispute of をめぐって.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-sotte', 'ni-sotte', 'word-origin',
   '沿う is "to run alongside" — a road following a river.',
   '川に沿って歩く is the literal use, and it is still the commonest one. The pattern keeps the picture of two things lying parallel.

Which is why に沿って covers both a physical line (道に沿って) and an abstract one (方針に沿って): a policy is something you keep beside rather than something you are fastened to. That is the difference from に基づいて.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-hanshite', 'ni-hanshite', 'word-origin',
   '反する is "to run counter to" — the 反 of 反対 and 反面.',
   'A plain Sino-Japanese verb meaning to go against. に反して sets the outcome facing the wrong way from what was named.

It wants an expectation, a rule or a prediction to contradict — 予想に反して, 規則に反して — because only those are things a result can run counter to. A mere alternative gives it nothing to oppose.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-kagirazu', 'ni-kagirazu', 'word-origin',
   'に限らず is 限る with the classical negative — the boundary is not drawn.',
   '限る is the verb behind かぎり at N3: to set a limit. Negated, it says the limit does not hold.

若者に限らず says the young are not the edge of it. It is the widening twin of に限り, which draws the boundary rather than denying it, and the two are one verb pointed opposite ways.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-kagiri', 'ni-kagiri', 'word-origin',
   'に限り draws the boundary that に限らず denies.',
   'The same 限る. 本日に限り says today is the edge and nothing outside it counts.

That is why it belongs to notices and offers — 学生に限り半額 — where the point is exactly where the line falls. 〜に限る, the other form, means something else entirely: 夏はビールに限る, "nothing beats", which is the limit read as the only thing worth having.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-hanmen', 'hanmen', 'word-origin',
   '反面 is literally "the opposite face" — 反 as in 反対, 面 as a surface.',
   'A noun naming the other side of the same thing. That is what makes it different from 一方で.

反面 needs the two halves to belong to one subject: 便利な反面、高い describes a single object from two faces. 一方で can hold two separate things apart. Using 反面 for two different subjects is the mistake the kanji predicts.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ippou-de', 'ippou-de', 'word-origin',
   '一方 is "one side" — one of the two directions a thing can be looked at from.',
   '方 is the same 方 as ほうが and 〜方: a side or direction. 一方 names one of them and leaves the other implied.

That is why 一方で can set two quite separate matters beside each other while 反面 cannot — sides do not have to belong to the same object. And 一方 alone at the head of a sentence works as "meanwhile", the other side of the story.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-mono-nara', 'mono-nara', 'historical-grammar',
   'ものなら is the noun もの with the conditional なら — "if it were a thing that could happen".',
   'もの names the situation as a thing; なら supposes it. Together they suppose a thing that the speaker doubts.

That doubt is why the potential goes in front — 帰れるものなら帰りたい — and why the sentence is wistful rather than planning. You do not put a real possibility into ものなら; the construction exists to mark one as out of reach.',
   'Heian', 'well-supported'),

  ('ety-n2-you-mono-nara', 'you-mono-nara', 'historical-grammar',
   'ようものなら is the same ものなら with the VOLITIONAL in front, and that changes everything.',
   '帰れるものなら supposes an ability. 帰ろうものなら supposes an attempt — the volitional is intention, not capacity.

So the wistfulness inverts into a warning: 遅れようものなら大変だ says that should you so much as try it, the consequences follow. One form is longing for what cannot be done, the other is a threat about what might be, and only the stem in front tells them apart.',
   'Heian', 'well-supported'),

  ('ety-n2-to-ittemo', 'to-ittemo', 'historical-grammar',
   'といっても is the quotative と with 言う and も — "even saying that".',
   'The whole N2 family of と言う compounds is built the same way, and reading them literally sorts them out. といっても concedes what was said and then cuts it down: 広いといっても、六畳だ.

See also からといって (just because it is said), とはいえ (that said), とは限らない (it is not limited to what is said). Four patterns, one verb of saying, each with a different particle doing the work.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-towa-ie', 'towa-ie', 'historical-grammar',
   'とはいえ is と with は and いえ, the classical imperative-shaped 已然形 of 言う.',
   'The stiff shape is what marks the register: いえ is not modern Japanese, which is why とはいえ belongs to writing and speeches where といっても would do in conversation.

The は is the same topic-marking は that softens everywhere else. It takes the said thing, sets it up as the topic, and then concedes it — that said.',
   'Heian', 'attested'),

  ('ety-n2-kara-to-itte', 'kara-to-itte', 'historical-grammar',
   'からといって is "just because one says から" — the reason quoted rather than accepted.',
   'から gives a cause; と言って quotes it as something asserted. Quoting a reason rather than stating it is what marks it as somebody else''s inference.

That is why the pattern demands a negative afterwards. 安いからといって買うな: the cheapness has been offered as grounds, and the sentence exists to refuse them. Without the refusal there is nothing for the quotation to do.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-towa-kagiranai', 'towa-kagiranai', 'historical-grammar',
   'とは限らない is 限る again: what is said does not draw the boundary.',
   'The verb from かぎり and に限らず, now applied to a quoted claim. 高いものがいいとは限らない says the claim does not fence the matter in.

It is a partial denial rather than a contradiction, exactly like わけではない at N3, and for the same structural reason: the は marks the claim as a topic and denies only that, leaving everything else standing.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-suginai', 'ni-suginai', 'word-origin',
   'すぎない is 過ぎる negated — it does not go beyond.',
   'The same 過ぎる taught at N5 in 食べすぎる, where passing the proper point is a complaint. Negated it becomes a limit: this does not pass that point.

So にすぎない always belittles. 学生にすぎない is "no more than a student", and the dismissiveness is the verb refusing to let the thing exceed its bound.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-hokanaranai', 'ni-hokanaranai', 'word-origin',
   'ほかならない is 他 plus ならない — "it does not become anything other".',
   '他 is "other", ならない the negative of なる. Nothing else is what this turns out to be.

Which is why it is emphatic identification rather than a hedge: 努力の結果にほかならない insists there is no other account. It is the same なる as in なければならない, negated the same way, doing the opposite job.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-nashi-ni', 'nashi-ni', 'historical-grammar',
   'なし is the classical adjective that also gave modern ない.',
   'なし meant "nonexistent" and inflected as an adjective — the same word behind the negative taught at N5. なしに keeps the old form untouched.

That is the whole difference from ないで: なしに is frozen classical Japanese, so it belongs to writing and set phrases, and it attaches to a noun rather than a verb. 許可なしに, never 許可ないに.',
   'Heian', 'well-supported'),

  ('ety-n2-nuki-ni', 'nuki-ni', 'word-origin',
   '抜き is 抜く, "to pull out" — the thing is extracted, not merely absent.',
   '歯を抜く is pulling a tooth; ワサビ抜き is sushi with the wasabi taken out. Something that was expected has been removed.

That is the difference from なしに, which merely says a thing was not there. 冗談抜きで works because a joke was in play and has been pulled; it would make no sense about something never present.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-kkiri', 'kkiri', 'word-origin',
   'きり is 切り, from 切る — "to cut". Something has been cut off.',
   '一度きり is once and the line drawn there. The verb is the everyday one in 切符 and 縁を切る.

Both readings are that cut. 二人きり is only two because everyone else has been cut away; 出かけたきり帰らない is left after the cut with nothing following. The と切り spelling ときり and the emphatic っきり are the same word.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-shidai', 'shidai', 'word-origin',
   '次第 is 次 plus 第 — order, sequence, the way things fall out.',
   'Both kanji mean sequence. The noun names how matters are arranged, and every use follows from that.

着き次第 is "in the order following arrival", hence as soon as. 天気次第 is according to how things fall. And ご説明した次第です — the one that baffles people — is simply "such is the sequence of it", a formal way of closing an account.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ka-ina-ka', 'ka-ina-ka', 'word-origin',
   '否 is the classical word for "no" — the pattern is literally "whether or no".',
   '否 survives in 安否, 否定 and in 否 read いな. かどうか says "whether — how — whether"; か否か says "whether or not", with the actual word for no in the middle.

The two are the same question, one modern and one classical, and that is the only difference between them: か否か is what かどうか wears to a formal occasion.',
   'Heian', 'well-supported'),

  ('ety-n2-you-ni-mo', 'you-ni-mo', 'historical-grammar',
   'ようにも is the volitional with にも — even setting out to, the ability is not there.',
   'The volitional is intention. にも adds "even". So 出かけようにも is "even meaning to go out", and the potential negative that must follow supplies what stops it.

That two-part shape is required by the grammar rather than by convention: the first half provides the intent, the second the impossibility, and neither half means anything alone.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-dokoro-ka', 'dokoro-ka', 'word-origin',
   'どころ is ところ, 所 — a place — voiced in second position.',
   'The 所 taught at N4 for a moment in time. どころか says the thing named is not even the place where the matter stands.

上手どころか、下手だ dismisses "skilled" as the wrong location entirely and then supplies the right one. That is why どころか always overturns rather than merely qualifying: it has rejected the ground, not adjusted it.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-dokoro-dewa-nai', 'dokoro-dewa-nai', 'word-origin',
   'どころではない is the same 所: this is not the place, meaning there is no room for it.',
   'Where どころか rejects a description, どころではない rejects the occasion. 勉強どころではない says circumstances leave no space for studying.

Both are the noun 所 doing what it does at N4 — locating a moment as a place — and the negation lands differently only because of what is being denied a location.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-bakari-ka', 'bakari-ka', 'word-origin',
   'ばかりか is 計り, the measure from N3, with か opening it back up.',
   'ばかり measures a thing tightly — nothing but. Adding か reopens the bound and lets more in: not merely this, but even that.

So the pattern reads as "is it only that?", and the answer supplied is no. It is why ばかりか needs a second, stronger clause after it, and why さえ or まで so often turns up there.',
   'Heian', 'attested'),

  ('ety-n2-mono-dakara', 'mono-dakara', 'word-origin',
   'ものだから is the noun 物 with だから — naming the reason as a plain thing.',
   'The same もの as ものだ at N3, where naming something as a thing makes it general and beyond argument.

That is exactly the tone of the excuse. 電車が遅れたものだから presents the delay as a fact of the world rather than as something the speaker had a hand in, which is why the pattern sounds defensive even when nobody is accusing anyone.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ue-de', 'ue-de', 'word-origin',
   '上 is "on top of" — and doing something on top of another thing means doing it afterwards, on that footing.',
   'The plain noun for an upper surface. よく考えた上で is deciding while standing on the thinking already done.

Which is why 上で needs the past tense in front: you cannot stand on something not yet there. The sequence is not a separate meaning but a consequence of the stacking.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ue-ni', 'ue-ni', 'word-origin',
   '上に is the same 上, stacking rather than standing.',
   '安い上に美味しい piles the second quality on the first. The に marks where it lands.

The pattern requires both halves to point the same way, which the image predicts: you cannot stack a complaint on a compliment and have the pile stand. 安い上にまずい is wrong, and 安いが、まずい is what it wants.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-sue-ni', 'sue-ni', 'word-origin',
   '末 is the tip or far end of something — the thin end of a branch.',
   'The noun in 末っ子 and 週末. 末に puts the outcome at the far end of a long stretch.

So it needs the stretch. 悩んだ末に決めた works because the worrying went on; a quick decision has no 末 to arrive at. Unlike あげく, 末 passes no judgement on how it turned out.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-agaku', 'agaku', 'word-origin',
   'あげく is 挙句 — the closing verse of a linked-verse poem.',
   '連歌 was composed in sequence by several poets, and the 挙句 was the last verse, the one everything before had been building toward. The phrase 挙句の果て still carries that finality.

The modern sense keeps the long build-up and adds a verdict on it. あげく always follows a drawn-out process and always ends badly — 待たされたあげく断られた — which is why it cannot be used for a good outcome however long the wait.',
   'Edo', 'well-supported'),

  ('ety-n2-tsuide-ni', 'tsuide-ni', 'word-origin',
   'ついで is 序で, from 序 — an order or a sequence of events.',
   'A 序 is an arrangement of things one after another. ついでに inserts something into a sequence already under way.

That is why the pattern needs a main errand to attach to. 買い物のついでに寄る works because the shopping was going to happen anyway; the second act is riding on the first, not standing alone.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-yara', 'yara', 'historical-grammar',
   'やら is the particle や with ら, and it lists without committing.',
   'や already lists loosely — 本や鉛筆 names a couple of examples rather than everything. ら adds vagueness on top, the same ら as in 彼ら and これら.

So やら is a doubly open list, which is why it suits complaint and fluster: 雨やら風やら names two out of a mess nobody is trying to count. The question use, 何やら, is the same vagueness with nothing listed.',
   'Heian', 'attested'),

  ('ety-n2-te-tamaranai', 'te-tamaranai', 'word-origin',
   'たまらない is 堪る negated — one cannot bear it.',
   '堪る is an ordinary verb of enduring, close kin to 耐える. 暑くてたまらない is heat that cannot be borne.

Because the verb is about the speaker''s own endurance, the pattern only works on your own sensations and feelings. Another person''s unbearable heat needs たまらないらしい or 暑がっている — the same restriction that gives がる its job at N4.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-te-shikata-ga-nai', 'te-shikata-ga-nai', 'word-origin',
   '仕方 is 仕 plus 方 — a way of doing. There is no way to do anything about it.',
   'The same 方 as 書き方 at N4. 仕方がない on its own is the everyday "nothing to be done".

Attached to a te-form it turns that helplessness inward: 気になって仕方がない is a feeling there is no method of dealing with. The casual しょうがない is the same phrase worn down.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-zu-ni-wa-irarenai', 'zu-ni-wa-irarenai', 'historical-grammar',
   'It is the classical negative ず with いる in the potential negative: one cannot remain not-doing it.',
   'ず is the Old Japanese negative from ざるを得ない and にかかわらず; いられない is the potential negative of いる, to stay in a state.

So the sentence says you cannot stay in the condition of not doing it. 笑わずにはいられない is not a decision to laugh but an inability to keep from it, which is why the pattern belongs to feelings that overtake the speaker rather than to choices.',
   'Heian', 'well-supported'),

  ('ety-n2-te-wa-naranai', 'te-wa-naranai', 'historical-grammar',
   'ならない is なる negated — it will not do, it does not turn out.',
   'The same なる as in なければならない at N5, and the same construction seen from the other end. There the negative was on the condition; here it is on the act.

ては sets the doing up as a topic and なる refuses it. That is why the pattern is impersonal and heavy — it says the thing does not work rather than that you are forbidden — and why it belongs to rules and notices.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-atatte', 'ni-atatte', 'word-origin',
   '当たる is "to strike, to hit" — the moment something lands.',
   'The verb in 当たり前 and くじに当たる. に当たって marks the point of impact between a person and an occasion.

That is why it takes significant beginnings — 開会に当たって, 就職に当たって — and not routine ones. Something has to be substantial enough to strike against.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ni-saishite', 'ni-saishite', 'word-origin',
   '際 is an edge or a verge — the 際 of 国際 and 窓際.',
   'A boundary line. に際して stands the sentence at the edge of an event, just as it begins.

It is the most formal of the occasion patterns for that reason: an edge is a precise place, and 際 belongs to ceremony and documents. The same noun gives この際 — "at this juncture" — and 際どい, right on the line.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-wo-hajime', 'wo-hajime', 'word-origin',
   'をはじめ is 始め, the noun from 始める — the head of a list, not merely its first item.',
   'The 連用形 used as a noun, the same shape as 限り and 通り. What it names is the leading example, and the rest follow from it.

That is the difference from 皮切りに, which needs the thing to spread outward, and from ばかりか, which escalates. をはじめ ranks: 社長をはじめ全員 names the most important and sweeps in the others behind.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-jou', 'jou', 'word-origin',
   '上 as a suffix is the same 上 as 上で and 上に, read じょう.',
   'One kanji across three patterns at this level. As a Sino-Japanese suffix it means "on the plane of" — 法律上 is on the legal plane, 健康上 on the health one.

That is why 〜上 attaches only to Sino-Japanese nouns and never to native ones: it is a compound-forming suffix, and it takes the on-reading company it belongs to.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-ge', 'ge', 'word-origin',
   'げ is 気, the same 気 as in 気味 and 元気, read as け.',
   '気 is the air or feel of something. As a suffix it voices to げ and reports an appearance: 悲しげ is a sad air about someone.

So げ, 気味 and そう all describe outward signs, and the differences are register and reach. げ is literary and works on emotions; 気味 is a trace, usually unwelcome; そう is the plain spoken one. All three exist because Japanese will not let you assert another person''s feelings directly.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-mamire', 'mamire', 'word-origin',
   'まみれ is 塗れ, from 塗れる — "to be smeared".',
   'The verb is kin to 塗る, to paint or spread. What is まみれ has had something spread over its surface.

Which is why it takes only liquids, dust and grime — 血まみれ, 泥まみれ — and always on the outside. だらけ can hold anything and anywhere, including mistakes; まみれ needs something that could actually coat a thing.',
   'Old Japanese', 'well-supported'),

  ('ety-n2-zukume', 'zukume', 'word-origin',
   'ずくめ is 尽くめ, from 尽くす — "to exhaust, to use up entirely".',
   '尽くす is the verb in 力を尽くす. What is ずくめ has been filled to the point where nothing else is left.

That totality is why the pattern takes only a small set of nouns and always positively or completely — 黒ずくめ, いいことずくめ. だらけ is a mess of something; ずくめ is a thing complete in one quality with no remainder.',
   'Old Japanese', 'well-supported')
) AS v(id, slug, aspect, claim, body, period, confidence)
JOIN grammar_points g ON g.slug = v.slug AND g.language_id = 'lang-ja'
ON CONFLICT (id) DO NOTHING;

-- One review-queue row per entry, so they surface where the others did.
INSERT INTO content_review_queue
  (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT v.id, 'lang-ja', 'etymology_entries', v.target, 'create', v.proposed::jsonb, 'claude', 10, 'pending'
FROM (VALUES
  ('rq-ety-n2-ni-kakawarazu', 'ety-n2-ni-kakawarazu', '{"claim": "かかわらず is 関わる, \"to be concerned with\", plus the classical negative ず.", "body": "関わる is an everyday verb — 事件に関わる, to be mixed up in something. にかかわらず says the outcome is not concerned with the thing named.\n\nThe ず is the Old Japanese negative, the same one in 知らず and ざるを得ない, and it is why the attachment is to the ない stem rather than to a te-form. 天候にかかわらず: the weather does not come into it.", "confidence": "well-supported"}'),
  ('rq-ety-n2-nimo-kakawarazu', 'ety-n2-nimo-kakawarazu', '{"claim": "The も is the entire difference between \"regardless of\" and \"despite\".", "body": "にかかわらず and にもかかわらず share every other syllable. も means \"even\", and adding it says that even this — which plainly should have been concerned in the matter — was not.\n\nThat is why にかかわらず takes neutral alternatives (晴雨にかかわらず) and にもかかわらず takes a real obstacle (努力したにもかかわらず). One is indifference, the other is a complaint, and も is doing all of it.", "confidence": "well-supported"}'),
  ('rq-ety-n2-wo-towazu', 'ety-n2-wo-towazu', '{"claim": "問わず is 問う, \"to ask\", with the classical negative ず — \"without asking\".", "body": "経験を問わず on a job advertisement says nobody will be asking about experience. The verb is the ordinary one in 問題 and 質問.\n\nIt sits alongside にかかわらず and に限らず as three ways of saying the same indifference, each built from a different verb: not asking, not being concerned, not limiting. The register differs because the verbs do — を問わず belongs to notices and forms.", "confidence": "well-supported"}'),
  ('rq-ety-n2-wo-kiniseze', 'ety-n2-wo-kiniseze', '{"claim": "をものともせず is \"not even making a thing of it\" — もの, とも, and せず.", "body": "もの is the ordinary noun; と marks what something is treated as; せず is する with the classical negative. Put together: not treating it as anything at all.\n\nSo the defiance is literal rather than idiomatic. 危険をものともせず does not say the danger was faced but that it was not even granted the status of an obstacle, which is why the pattern always attaches to something that plainly was one.", "confidence": "well-supported"}'),
  ('rq-ety-n2-wo-kawakiri-ni', 'ety-n2-wo-kawakiri-ni', '{"claim": "皮切り is the first burn in a course of moxibustion — the one that cuts the skin.", "body": "Moxa was burned on the skin in a series, and the 皮切り was the opening application: the sharpest, and the one everything after followed from.\n\nThat is why the pattern is not merely \"first\" but first-and-then-spreading. 東京を皮切りに全国へ needs the expansion to follow; a first item with nothing after it is not a 皮切り, however first it was.", "confidence": "well-supported"}'),
  ('rq-ety-n2-wo-komete', 'ety-n2-wo-komete', '{"claim": "込める is \"to put into, to load\" — the verb for charging something with contents.", "body": "弾を込める is loading a round. 心を込めて is loading the feeling in, and the metaphor is as physical in Japanese as it sounds.\n\nWhich is why を込めて only takes feelings and intentions, never facts or objects: what you load a thing with is something that fills it. The related 込む as a suffix — 詰め込む, 話し込む — is the same verb doing the same work.", "confidence": "well-supported"}'),
  ('rq-ety-n2-wo-megutte', 'ety-n2-wo-megutte', '{"claim": "めぐって is 巡る, \"to go around, to circle\".", "body": "巡る is the verb in 巡り会う and お遍路が巡る. をめぐって puts the sentence in orbit around a thing.\n\nThat is where the argument comes from, and it is not stated anywhere in the words. People circling a topic are people disputing it, so をめぐって attracts 対立, 議論 and 争い, while について — which merely attaches — stays neutral.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-motozuite', 'ety-n2-ni-motozuite', '{"claim": "基づく is 基 (\"foundation\") plus 付く (\"to attach\") — fixed onto a base.", "body": "The 基 of 基本 and 基礎, with the 付く of について. Something is fastened to a footing.\n\nThat is why に基づいて demands a real authority to rest on — 法律, データ, 事実 — and sounds wrong on a vague impression. The base has to be solid enough to attach to.", "confidence": "well-supported"}'),
  ('rq-ety-n2-wo-moto-ni', 'ety-n2-wo-moto-ni', '{"claim": "もと is 元 or 基 — the source or the material a thing is made from.", "body": "Nearly the same word as 基づく, used differently. をもとに supplies raw material: 実話をもとにした映画 is a film made out of a true story.\n\nThat is the distinction from に基づいて, which supplies authority. A film is built from the story and free to change it; a decision 基づいて the rules is bound by them. Material against grounds.", "confidence": "attested"}'),
  ('rq-ety-n2-ni-oujite', 'ety-n2-ni-oujite', '{"claim": "応じる is \"to respond, to answer\" — the 応 of 応答 and 反応.", "body": "呼びかけに応じる is answering a call. に応じて makes one thing the answer to another.\n\nBoth textbook senses are that one act. Responding to a request is 要望に応じて; varying with a condition is 収入に応じて, where the amount answers the income. Something adjusts itself to fit, which is exactly what responding means.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-wataru', 'ety-n2-ni-wataru', '{"claim": "渡る is \"to cross over\" — the verb for getting from one side to the other.", "body": "橋を渡る, to cross a bridge. にわたって stretches the sentence across a span the way a crossing stretches over water.\n\nSo it needs breadth to cross. 三年にわたって works because three years is a distance; a single moment is not something you can cross, which is why にわたって never takes a point in time.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-kanshite', 'ety-n2-ni-kanshite', '{"claim": "関する is \"to relate to\" — the same 関 as in にかかわらず.", "body": "One kanji, two patterns at opposite ends of this level: に関して concerns itself with the topic, にかかわらず declines to.\n\nに関して is the written register''s について, and the difference is only that: 関する is a Sino-Japanese verb and 付く is a native one, so the first belongs to reports and the second to speech. Neither carries the circling dispute of をめぐって.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-sotte', 'ety-n2-ni-sotte', '{"claim": "沿う is \"to run alongside\" — a road following a river.", "body": "川に沿って歩く is the literal use, and it is still the commonest one. The pattern keeps the picture of two things lying parallel.\n\nWhich is why に沿って covers both a physical line (道に沿って) and an abstract one (方針に沿って): a policy is something you keep beside rather than something you are fastened to. That is the difference from に基づいて.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-hanshite', 'ety-n2-ni-hanshite', '{"claim": "反する is \"to run counter to\" — the 反 of 反対 and 反面.", "body": "A plain Sino-Japanese verb meaning to go against. に反して sets the outcome facing the wrong way from what was named.\n\nIt wants an expectation, a rule or a prediction to contradict — 予想に反して, 規則に反して — because only those are things a result can run counter to. A mere alternative gives it nothing to oppose.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-kagirazu', 'ety-n2-ni-kagirazu', '{"claim": "に限らず is 限る with the classical negative — the boundary is not drawn.", "body": "限る is the verb behind かぎり at N3: to set a limit. Negated, it says the limit does not hold.\n\n若者に限らず says the young are not the edge of it. It is the widening twin of に限り, which draws the boundary rather than denying it, and the two are one verb pointed opposite ways.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-kagiri', 'ety-n2-ni-kagiri', '{"claim": "に限り draws the boundary that に限らず denies.", "body": "The same 限る. 本日に限り says today is the edge and nothing outside it counts.\n\nThat is why it belongs to notices and offers — 学生に限り半額 — where the point is exactly where the line falls. 〜に限る, the other form, means something else entirely: 夏はビールに限る, \"nothing beats\", which is the limit read as the only thing worth having.", "confidence": "well-supported"}'),
  ('rq-ety-n2-hanmen', 'ety-n2-hanmen', '{"claim": "反面 is literally \"the opposite face\" — 反 as in 反対, 面 as a surface.", "body": "A noun naming the other side of the same thing. That is what makes it different from 一方で.\n\n反面 needs the two halves to belong to one subject: 便利な反面、高い describes a single object from two faces. 一方で can hold two separate things apart. Using 反面 for two different subjects is the mistake the kanji predicts.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ippou-de', 'ety-n2-ippou-de', '{"claim": "一方 is \"one side\" — one of the two directions a thing can be looked at from.", "body": "方 is the same 方 as ほうが and 〜方: a side or direction. 一方 names one of them and leaves the other implied.\n\nThat is why 一方で can set two quite separate matters beside each other while 反面 cannot — sides do not have to belong to the same object. And 一方 alone at the head of a sentence works as \"meanwhile\", the other side of the story.", "confidence": "well-supported"}'),
  ('rq-ety-n2-mono-nara', 'ety-n2-mono-nara', '{"claim": "ものなら is the noun もの with the conditional なら — \"if it were a thing that could happen\".", "body": "もの names the situation as a thing; なら supposes it. Together they suppose a thing that the speaker doubts.\n\nThat doubt is why the potential goes in front — 帰れるものなら帰りたい — and why the sentence is wistful rather than planning. You do not put a real possibility into ものなら; the construction exists to mark one as out of reach.", "confidence": "well-supported"}'),
  ('rq-ety-n2-you-mono-nara', 'ety-n2-you-mono-nara', '{"claim": "ようものなら is the same ものなら with the VOLITIONAL in front, and that changes everything.", "body": "帰れるものなら supposes an ability. 帰ろうものなら supposes an attempt — the volitional is intention, not capacity.\n\nSo the wistfulness inverts into a warning: 遅れようものなら大変だ says that should you so much as try it, the consequences follow. One form is longing for what cannot be done, the other is a threat about what might be, and only the stem in front tells them apart.", "confidence": "well-supported"}'),
  ('rq-ety-n2-to-ittemo', 'ety-n2-to-ittemo', '{"claim": "といっても is the quotative と with 言う and も — \"even saying that\".", "body": "The whole N2 family of と言う compounds is built the same way, and reading them literally sorts them out. といっても concedes what was said and then cuts it down: 広いといっても、六畳だ.\n\nSee also からといって (just because it is said), とはいえ (that said), とは限らない (it is not limited to what is said). Four patterns, one verb of saying, each with a different particle doing the work.", "confidence": "well-supported"}'),
  ('rq-ety-n2-towa-ie', 'ety-n2-towa-ie', '{"claim": "とはいえ is と with は and いえ, the classical imperative-shaped 已然形 of 言う.", "body": "The stiff shape is what marks the register: いえ is not modern Japanese, which is why とはいえ belongs to writing and speeches where といっても would do in conversation.\n\nThe は is the same topic-marking は that softens everywhere else. It takes the said thing, sets it up as the topic, and then concedes it — that said.", "confidence": "attested"}'),
  ('rq-ety-n2-kara-to-itte', 'ety-n2-kara-to-itte', '{"claim": "からといって is \"just because one says から\" — the reason quoted rather than accepted.", "body": "から gives a cause; と言って quotes it as something asserted. Quoting a reason rather than stating it is what marks it as somebody else''s inference.\n\nThat is why the pattern demands a negative afterwards. 安いからといって買うな: the cheapness has been offered as grounds, and the sentence exists to refuse them. Without the refusal there is nothing for the quotation to do.", "confidence": "well-supported"}'),
  ('rq-ety-n2-towa-kagiranai', 'ety-n2-towa-kagiranai', '{"claim": "とは限らない is 限る again: what is said does not draw the boundary.", "body": "The verb from かぎり and に限らず, now applied to a quoted claim. 高いものがいいとは限らない says the claim does not fence the matter in.\n\nIt is a partial denial rather than a contradiction, exactly like わけではない at N3, and for the same structural reason: the は marks the claim as a topic and denies only that, leaving everything else standing.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-suginai', 'ety-n2-ni-suginai', '{"claim": "すぎない is 過ぎる negated — it does not go beyond.", "body": "The same 過ぎる taught at N5 in 食べすぎる, where passing the proper point is a complaint. Negated it becomes a limit: this does not pass that point.\n\nSo にすぎない always belittles. 学生にすぎない is \"no more than a student\", and the dismissiveness is the verb refusing to let the thing exceed its bound.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-hokanaranai', 'ety-n2-ni-hokanaranai', '{"claim": "ほかならない is 他 plus ならない — \"it does not become anything other\".", "body": "他 is \"other\", ならない the negative of なる. Nothing else is what this turns out to be.\n\nWhich is why it is emphatic identification rather than a hedge: 努力の結果にほかならない insists there is no other account. It is the same なる as in なければならない, negated the same way, doing the opposite job.", "confidence": "well-supported"}'),
  ('rq-ety-n2-nashi-ni', 'ety-n2-nashi-ni', '{"claim": "なし is the classical adjective that also gave modern ない.", "body": "なし meant \"nonexistent\" and inflected as an adjective — the same word behind the negative taught at N5. なしに keeps the old form untouched.\n\nThat is the whole difference from ないで: なしに is frozen classical Japanese, so it belongs to writing and set phrases, and it attaches to a noun rather than a verb. 許可なしに, never 許可ないに.", "confidence": "well-supported"}'),
  ('rq-ety-n2-nuki-ni', 'ety-n2-nuki-ni', '{"claim": "抜き is 抜く, \"to pull out\" — the thing is extracted, not merely absent.", "body": "歯を抜く is pulling a tooth; ワサビ抜き is sushi with the wasabi taken out. Something that was expected has been removed.\n\nThat is the difference from なしに, which merely says a thing was not there. 冗談抜きで works because a joke was in play and has been pulled; it would make no sense about something never present.", "confidence": "well-supported"}'),
  ('rq-ety-n2-kkiri', 'ety-n2-kkiri', '{"claim": "きり is 切り, from 切る — \"to cut\". Something has been cut off.", "body": "一度きり is once and the line drawn there. The verb is the everyday one in 切符 and 縁を切る.\n\nBoth readings are that cut. 二人きり is only two because everyone else has been cut away; 出かけたきり帰らない is left after the cut with nothing following. The と切り spelling ときり and the emphatic っきり are the same word.", "confidence": "well-supported"}'),
  ('rq-ety-n2-shidai', 'ety-n2-shidai', '{"claim": "次第 is 次 plus 第 — order, sequence, the way things fall out.", "body": "Both kanji mean sequence. The noun names how matters are arranged, and every use follows from that.\n\n着き次第 is \"in the order following arrival\", hence as soon as. 天気次第 is according to how things fall. And ご説明した次第です — the one that baffles people — is simply \"such is the sequence of it\", a formal way of closing an account.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ka-ina-ka', 'ety-n2-ka-ina-ka', '{"claim": "否 is the classical word for \"no\" — the pattern is literally \"whether or no\".", "body": "否 survives in 安否, 否定 and in 否 read いな. かどうか says \"whether — how — whether\"; か否か says \"whether or not\", with the actual word for no in the middle.\n\nThe two are the same question, one modern and one classical, and that is the only difference between them: か否か is what かどうか wears to a formal occasion.", "confidence": "well-supported"}'),
  ('rq-ety-n2-you-ni-mo', 'ety-n2-you-ni-mo', '{"claim": "ようにも is the volitional with にも — even setting out to, the ability is not there.", "body": "The volitional is intention. にも adds \"even\". So 出かけようにも is \"even meaning to go out\", and the potential negative that must follow supplies what stops it.\n\nThat two-part shape is required by the grammar rather than by convention: the first half provides the intent, the second the impossibility, and neither half means anything alone.", "confidence": "well-supported"}'),
  ('rq-ety-n2-dokoro-ka', 'ety-n2-dokoro-ka', '{"claim": "どころ is ところ, 所 — a place — voiced in second position.", "body": "The 所 taught at N4 for a moment in time. どころか says the thing named is not even the place where the matter stands.\n\n上手どころか、下手だ dismisses \"skilled\" as the wrong location entirely and then supplies the right one. That is why どころか always overturns rather than merely qualifying: it has rejected the ground, not adjusted it.", "confidence": "well-supported"}'),
  ('rq-ety-n2-dokoro-dewa-nai', 'ety-n2-dokoro-dewa-nai', '{"claim": "どころではない is the same 所: this is not the place, meaning there is no room for it.", "body": "Where どころか rejects a description, どころではない rejects the occasion. 勉強どころではない says circumstances leave no space for studying.\n\nBoth are the noun 所 doing what it does at N4 — locating a moment as a place — and the negation lands differently only because of what is being denied a location.", "confidence": "well-supported"}'),
  ('rq-ety-n2-bakari-ka', 'ety-n2-bakari-ka', '{"claim": "ばかりか is 計り, the measure from N3, with か opening it back up.", "body": "ばかり measures a thing tightly — nothing but. Adding か reopens the bound and lets more in: not merely this, but even that.\n\nSo the pattern reads as \"is it only that?\", and the answer supplied is no. It is why ばかりか needs a second, stronger clause after it, and why さえ or まで so often turns up there.", "confidence": "attested"}'),
  ('rq-ety-n2-mono-dakara', 'ety-n2-mono-dakara', '{"claim": "ものだから is the noun 物 with だから — naming the reason as a plain thing.", "body": "The same もの as ものだ at N3, where naming something as a thing makes it general and beyond argument.\n\nThat is exactly the tone of the excuse. 電車が遅れたものだから presents the delay as a fact of the world rather than as something the speaker had a hand in, which is why the pattern sounds defensive even when nobody is accusing anyone.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ue-de', 'ety-n2-ue-de', '{"claim": "上 is \"on top of\" — and doing something on top of another thing means doing it afterwards, on that footing.", "body": "The plain noun for an upper surface. よく考えた上で is deciding while standing on the thinking already done.\n\nWhich is why 上で needs the past tense in front: you cannot stand on something not yet there. The sequence is not a separate meaning but a consequence of the stacking.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ue-ni', 'ety-n2-ue-ni', '{"claim": "上に is the same 上, stacking rather than standing.", "body": "安い上に美味しい piles the second quality on the first. The に marks where it lands.\n\nThe pattern requires both halves to point the same way, which the image predicts: you cannot stack a complaint on a compliment and have the pile stand. 安い上にまずい is wrong, and 安いが、まずい is what it wants.", "confidence": "well-supported"}'),
  ('rq-ety-n2-sue-ni', 'ety-n2-sue-ni', '{"claim": "末 is the tip or far end of something — the thin end of a branch.", "body": "The noun in 末っ子 and 週末. 末に puts the outcome at the far end of a long stretch.\n\nSo it needs the stretch. 悩んだ末に決めた works because the worrying went on; a quick decision has no 末 to arrive at. Unlike あげく, 末 passes no judgement on how it turned out.", "confidence": "well-supported"}'),
  ('rq-ety-n2-agaku', 'ety-n2-agaku', '{"claim": "あげく is 挙句 — the closing verse of a linked-verse poem.", "body": "連歌 was composed in sequence by several poets, and the 挙句 was the last verse, the one everything before had been building toward. The phrase 挙句の果て still carries that finality.\n\nThe modern sense keeps the long build-up and adds a verdict on it. あげく always follows a drawn-out process and always ends badly — 待たされたあげく断られた — which is why it cannot be used for a good outcome however long the wait.", "confidence": "well-supported"}'),
  ('rq-ety-n2-tsuide-ni', 'ety-n2-tsuide-ni', '{"claim": "ついで is 序で, from 序 — an order or a sequence of events.", "body": "A 序 is an arrangement of things one after another. ついでに inserts something into a sequence already under way.\n\nThat is why the pattern needs a main errand to attach to. 買い物のついでに寄る works because the shopping was going to happen anyway; the second act is riding on the first, not standing alone.", "confidence": "well-supported"}'),
  ('rq-ety-n2-yara', 'ety-n2-yara', '{"claim": "やら is the particle や with ら, and it lists without committing.", "body": "や already lists loosely — 本や鉛筆 names a couple of examples rather than everything. ら adds vagueness on top, the same ら as in 彼ら and これら.\n\nSo やら is a doubly open list, which is why it suits complaint and fluster: 雨やら風やら names two out of a mess nobody is trying to count. The question use, 何やら, is the same vagueness with nothing listed.", "confidence": "attested"}'),
  ('rq-ety-n2-te-tamaranai', 'ety-n2-te-tamaranai', '{"claim": "たまらない is 堪る negated — one cannot bear it.", "body": "堪る is an ordinary verb of enduring, close kin to 耐える. 暑くてたまらない is heat that cannot be borne.\n\nBecause the verb is about the speaker''s own endurance, the pattern only works on your own sensations and feelings. Another person''s unbearable heat needs たまらないらしい or 暑がっている — the same restriction that gives がる its job at N4.", "confidence": "well-supported"}'),
  ('rq-ety-n2-te-shikata-ga-nai', 'ety-n2-te-shikata-ga-nai', '{"claim": "仕方 is 仕 plus 方 — a way of doing. There is no way to do anything about it.", "body": "The same 方 as 書き方 at N4. 仕方がない on its own is the everyday \"nothing to be done\".\n\nAttached to a te-form it turns that helplessness inward: 気になって仕方がない is a feeling there is no method of dealing with. The casual しょうがない is the same phrase worn down.", "confidence": "well-supported"}'),
  ('rq-ety-n2-zu-ni-wa-irarenai', 'ety-n2-zu-ni-wa-irarenai', '{"claim": "It is the classical negative ず with いる in the potential negative: one cannot remain not-doing it.", "body": "ず is the Old Japanese negative from ざるを得ない and にかかわらず; いられない is the potential negative of いる, to stay in a state.\n\nSo the sentence says you cannot stay in the condition of not doing it. 笑わずにはいられない is not a decision to laugh but an inability to keep from it, which is why the pattern belongs to feelings that overtake the speaker rather than to choices.", "confidence": "well-supported"}'),
  ('rq-ety-n2-te-wa-naranai', 'ety-n2-te-wa-naranai', '{"claim": "ならない is なる negated — it will not do, it does not turn out.", "body": "The same なる as in なければならない at N5, and the same construction seen from the other end. There the negative was on the condition; here it is on the act.\n\nては sets the doing up as a topic and なる refuses it. That is why the pattern is impersonal and heavy — it says the thing does not work rather than that you are forbidden — and why it belongs to rules and notices.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-atatte', 'ety-n2-ni-atatte', '{"claim": "当たる is \"to strike, to hit\" — the moment something lands.", "body": "The verb in 当たり前 and くじに当たる. に当たって marks the point of impact between a person and an occasion.\n\nThat is why it takes significant beginnings — 開会に当たって, 就職に当たって — and not routine ones. Something has to be substantial enough to strike against.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ni-saishite', 'ety-n2-ni-saishite', '{"claim": "際 is an edge or a verge — the 際 of 国際 and 窓際.", "body": "A boundary line. に際して stands the sentence at the edge of an event, just as it begins.\n\nIt is the most formal of the occasion patterns for that reason: an edge is a precise place, and 際 belongs to ceremony and documents. The same noun gives この際 — \"at this juncture\" — and 際どい, right on the line.", "confidence": "well-supported"}'),
  ('rq-ety-n2-wo-hajime', 'ety-n2-wo-hajime', '{"claim": "をはじめ is 始め, the noun from 始める — the head of a list, not merely its first item.", "body": "The 連用形 used as a noun, the same shape as 限り and 通り. What it names is the leading example, and the rest follow from it.\n\nThat is the difference from 皮切りに, which needs the thing to spread outward, and from ばかりか, which escalates. をはじめ ranks: 社長をはじめ全員 names the most important and sweeps in the others behind.", "confidence": "well-supported"}'),
  ('rq-ety-n2-jou', 'ety-n2-jou', '{"claim": "上 as a suffix is the same 上 as 上で and 上に, read じょう.", "body": "One kanji across three patterns at this level. As a Sino-Japanese suffix it means \"on the plane of\" — 法律上 is on the legal plane, 健康上 on the health one.\n\nThat is why 〜上 attaches only to Sino-Japanese nouns and never to native ones: it is a compound-forming suffix, and it takes the on-reading company it belongs to.", "confidence": "well-supported"}'),
  ('rq-ety-n2-ge', 'ety-n2-ge', '{"claim": "げ is 気, the same 気 as in 気味 and 元気, read as け.", "body": "気 is the air or feel of something. As a suffix it voices to げ and reports an appearance: 悲しげ is a sad air about someone.\n\nSo げ, 気味 and そう all describe outward signs, and the differences are register and reach. げ is literary and works on emotions; 気味 is a trace, usually unwelcome; そう is the plain spoken one. All three exist because Japanese will not let you assert another person''s feelings directly.", "confidence": "well-supported"}'),
  ('rq-ety-n2-mamire', 'ety-n2-mamire', '{"claim": "まみれ is 塗れ, from 塗れる — \"to be smeared\".", "body": "The verb is kin to 塗る, to paint or spread. What is まみれ has had something spread over its surface.\n\nWhich is why it takes only liquids, dust and grime — 血まみれ, 泥まみれ — and always on the outside. だらけ can hold anything and anywhere, including mistakes; まみれ needs something that could actually coat a thing.", "confidence": "well-supported"}'),
  ('rq-ety-n2-zukume', 'ety-n2-zukume', '{"claim": "ずくめ is 尽くめ, from 尽くす — \"to exhaust, to use up entirely\".", "body": "尽くす is the verb in 力を尽くす. What is ずくめ has been filled to the point where nothing else is left.\n\nThat totality is why the pattern takes only a small set of nouns and always positively or completely — 黒ずくめ, いいことずくめ. だらけ is a mess of something; ずくめ is a thing complete in one quality with no remainder.", "confidence": "well-supported"}')
) AS v(id, target, proposed)
JOIN etymology_entries e ON e.id = v.target
ON CONFLICT (id) DO NOTHING;
