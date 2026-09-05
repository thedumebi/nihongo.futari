-- Fable's N2 verification: 26 of 53 entries corrected.
--
-- The two claims most likely to have been invented both SURVIVED, which is
-- worth recording: 皮切り really is the first burn of a course of moxibustion —
-- the Nippo Jisho of 1603 defines it as the first moxa — and あげく really is
-- the closing verse of a 連歌 sequence. Those stay as written.
--
-- Seven were false, six of them the same fault the other levels kept turning
-- up: the kanji is a spelling, not the origin.
--
--   やら is not や + ら. It is にやあらむ — "might it be that…?" — compressed,
--   and the ら is the tail of あらむ, not the ら of 彼ら.
--   ついで is not 序. It is つぎて, from 次ぐ.
--   まみれる is not kin to 塗る; 塗 is a shared spelling.
--   仕方's 仕 is ateji for the stem し, the same fitting as 仕事 for しごと.
--   関する and native かかわる are unrelated words sharing 関.
--   And the ほかならない entry had the wrong verb entirely: its なら is the
--   classical copula なり, not the なる of なければならない.
--
-- One sentence in the きり entry described a spelling ときり that does not
-- exist. It is deleted rather than repaired.
--
-- Twelve periods were ancestor-dated again, and the rule that catches most of
-- them is simple: a Sino-Japanese compound cannot be Old Japanese. 反面, 一方,
-- 次第, 応じる, 反する and 際する all move. So do the fixed formulas —
-- にかかわらず, にもかかわらず, からといって, とは限らない — which are centuries
-- younger than their parts.
--
-- Three overstated restrictions, all falsified by ordinary Japanese: 〜上 said
-- to take only Sino-Japanese nouns (セキュリティ上の理由); 上で said to require
-- the past tense (日本語を学ぶ上で is a different, standard use); なしに said not
-- to take a verb (ことなしに does). And two more images sold as reasons —
-- をめぐって's dispute sense blamed on "circling", に基づいて said to demand a
-- documentary source when 経験に基づく勘 is ordinary.
--
-- ずくめ and げ go to 'attested': both origins are genuinely contested, and
-- ずくめ was additionally said to be always positive, which 規則ずくめ falsifies.
--
-- Seeds 139-148 have run and are left alone; corrections ship as a new seed.


UPDATE etymology_entries SET claim = 'げ is け, "air, appearance" — conventionally written 気.',
    body = 'Whether that け is the Chinese loan 気 or a native noun the character was fitted to is not settled. What it does is not in doubt: it reports an appearance, and 悲しげ is a sad air about someone. The げ-adjectives are characteristic of Heian prose — うつくしげ, 心細げ.

So げ, 気味 and そう all describe outward signs, differing in register and reach. げ is literary and works on emotions; 気味 is a trace, usually unwelcome; そう is the plain spoken one. All three exist because Japanese will not let you assert another person''s feelings flatly.',
    period = 'Heian',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n2-ge';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-hanmen';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-ippou-de';

UPDATE etymology_entries SET body = 'One kanji across three patterns at this level. As a Sino-Japanese suffix it means "on the plane of" — 法律上 is on the legal plane, 健康上 on the health one.

It favours compact, compound-ready nouns, overwhelmingly Sino-Japanese — though modern loans join freely enough, as セキュリティ上の理由 and ルール上 show.', updated_at = now()
WHERE id = 'ety-n2-jou';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n2-kara-to-itte';

UPDATE etymology_entries SET body = '一度きり is once and the line drawn there. The verb is the everyday one in 切符 and 縁を切る.

Both readings are that cut. 二人きり is only two because everyone else has been cut away; 出かけたきり帰らない is left after the cut with nothing following. The emphatic っきり is the same word.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n2-kkiri';

UPDATE etymology_entries SET claim = 'まみれ is まみれる, a native verb for being coated in something.',
    body = '塗 is a shared spelling, not shared ancestry — まみれる is not kin to 塗る. It is attested from the Heian period, in 大和物語 among others.

What is まみれ has had something spread over it, typically things that genuinely coat: 血まみれ, 泥まみれ, 汗まみれ. The conventional extension is to clinging abstractions — 借金まみれ — where だらけ, which can hold anything anywhere including mistakes, is the broader word.',
    period = 'Heian', updated_at = now()
WHERE id = 'ety-n2-mamire';

UPDATE etymology_entries SET body = 'なし meant "nonexistent" and inflected as an adjective — the same word behind the negative taught at N5. なしに keeps the old form untouched.

That is the whole difference from ないで: なしに is frozen classical Japanese, so it belongs to writing and set phrases, and it attaches to a noun — 許可なしに, never 許可ないに. A verb gets in through こと: 誰にも知られることなしに.', updated_at = now()
WHERE id = 'ety-n2-nashi-ni';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-ni-hanshite';

UPDATE etymology_entries SET claim = 'ほかならない is 他 with the classical copula なり negated — "is not anything other".',
    body = 'The なら is the 未然形 of the copula なり, not the verb なる. Classical ほかならず said outright "is nothing other than", which is exactly the modern meaning — nothing has shifted.

Which is why it is emphatic identification rather than a hedge: 努力の結果にほかならない insists there is no other account. It is worth keeping apart from なければならない, whose ならない really is なる.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n2-ni-hokanaranai';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n2-ni-kakawarazu';

UPDATE etymology_entries SET claim = '関する is a Sino-Japanese verb, "to relate to".',
    body = 'It enters through kanbun, and に関して is the written register''s について — the difference being only that 関する is Sino-Japanese and 付く is native, so the first belongs to reports and the second to speech.

The 関 also used to write native かかわる is spelling, not kinship: かかわる is its own word, written 係わる and 拘わる just as readily. And neither carries the settled dispute of をめぐって.',
    period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-ni-kanshite';

UPDATE etymology_entries SET body = 'The 基 of 基本 and 基礎, with the 付く of について. Something is fastened to a footing.

に基づいて belongs to formal writing and typically cites something firm as its footing — 法律, データ, 事実 — though 経験に基づく勘 shows the base need not be documentary.', updated_at = now()
WHERE id = 'ety-n2-ni-motozuite';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-ni-oujite';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-ni-saishite';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-nimo-kakawarazu';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n2-shidai';

UPDATE etymology_entries SET claim = '仕方 is し, the stem of する, plus 方 — a way of doing.',
    body = '仕 is a kanji later fitted to the native stem し, the same fitting as 仕事 for しごと; the 方 is the one in 書き方 at N4. 仕方がない on its own is the everyday "nothing to be done".

Attached to a te-form it turns that helplessness inward: 気になって仕方がない is a feeling there is no method of dealing with. The casual しょうがない is the same phrase worn down.', updated_at = now()
WHERE id = 'ety-n2-te-shikata-ga-nai';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n2-to-ittemo';

UPDATE etymology_entries SET period = 'Modern', updated_at = now()
WHERE id = 'ety-n2-towa-kagiranai';

UPDATE etymology_entries SET claim = 'ついで is つぎて, from 次ぐ "to come next" — the thing that follows on.',
    body = 'A regular sound change, つぎて to ついで. 序 is a kanji fitted to the word afterwards; the Sino-Japanese morpheme is not where it comes from.

What follows on has to follow something, which is why the pattern needs a main errand to attach to. 買い物のついでに寄る works because the shopping was going to happen anyway; the second act rides on the first rather than standing alone.',
    period = 'Heian', updated_at = now()
WHERE id = 'ety-n2-tsuide-ni';

UPDATE etymology_entries SET body = 'The plain noun for an upper surface. よく考えた上で is deciding while standing on the thinking already done.

Which is why the "after doing" sense takes た: you cannot stand on something not yet there. The dictionary form is a separate use — 日本語を学ぶ上で大切なこと is "in the course of", not "after".', updated_at = now()
WHERE id = 'ety-n2-ue-de';

UPDATE etymology_entries SET body = '巡る is the verb in 巡り会う and お遍路が巡る. をめぐって puts the sentence in orbit around a thing.

It puts several parties around one contested thing, and in practice it has settled into dispute contexts — 対立, 議論, 争い — where について, which merely attaches, stays neutral. That is a habit the phrase has acquired rather than anything the verb spells out.', updated_at = now()
WHERE id = 'ety-n2-wo-megutte';

UPDATE etymology_entries SET claim = 'やら is the worn-down remainder of classical にやあらむ — "might it be that…?"',
    body = 'A whole hedged question compressed into two syllables: に + や + あらむ became やらむ, やらう, やら. The ら is what is left of あらむ, not the ら of 彼ら.

That buried question is why やら suits complaint and fluster. 雨やら風やら names two things out of a mess nobody is trying to count, each offered as a "might it be", and 何やら is the same hedge with nothing listed at all.',
    period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n2-yara';

UPDATE etymology_entries SET body = 'ず is the Old Japanese negative, the same one in ざるを得ない and にかかわらず, carried inside an otherwise modern frame: いられない is the potential negative of いる, which the classical language did not form this way.

So the sentence says you cannot stay in the condition of not doing it. 笑わずにはいられない is not a decision to laugh but an inability to keep from it, which is why the pattern belongs to feelings that overtake the speaker rather than to choices.',
    period = 'Meiji', updated_at = now()
WHERE id = 'ety-n2-zu-ni-wa-irarenai';

UPDATE etymology_entries SET claim = 'ずくめ has a contested origin — 尽く and 竦める both have backers.',
    body = 'The kana is the clue. It is written ずくめ and not づくめ, which is itself a sign that lexicographers do not read it as a transparent 尽く; 三省堂国語辞典 derives it instead from 竦める, "to bind tight". Either way the sense is a thing filled out with one quality and no remainder.

Which is why it takes only a small set of nouns and describes a totality rather than a mess: 黒ずくめ, いいことずくめ, and 規則ずくめ — that last one showing the totality can oppress rather than please. だらけ is a scattering of something; ずくめ leaves no room for anything else.',
    period = 'Edo',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n2-zukume';
