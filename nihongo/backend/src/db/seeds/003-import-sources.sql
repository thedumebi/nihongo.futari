-- Upstream datasets the import pipeline pulls from. `attribution_text` is what
-- renders on /attribution — a CC BY-SA obligation, not a courtesy.

INSERT INTO import_sources (id, code, name, url, homepage, license, attribution_text, active) VALUES
  ('imp-jmdict', 'jmdict', 'JMdict',
   'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz', 'https://www.edrdg.org/jmdict/j_jmdict.html',
   'CC BY-SA 4.0',
   'Vocabulary data from JMdict, © Electronic Dictionary Research and Development Group, used under CC BY-SA 4.0.', true),

  ('imp-kanjidic2', 'kanjidic2', 'KANJIDIC2',
   'http://ftp.edrdg.org/pub/Nihongo/kanjidic2.xml.gz', 'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project',
   'CC BY-SA 4.0',
   'Kanji data from KANJIDIC2, © Electronic Dictionary Research and Development Group, used under CC BY-SA 4.0.', true),

  ('imp-kanjivg', 'kanjivg', 'KanjiVG',
   'https://github.com/KanjiVG/kanjivg/releases', 'https://kanjivg.tagaini.net/',
   'CC BY-SA 3.0',
   'Stroke order data from KanjiVG, © Ulrich Apel, used under CC BY-SA 3.0.', true),

  -- The sentences actually shipped come from EDRDG's indexed examples file (the
  -- Tanaka Corpus), NOT from a Tatoeba export: it carries the human-checked
  -- word-by-word index the furigana pipeline depends on, and it is a different
  -- file under a different licence. Naming the wrong upstream on the
  -- attribution page would defeat the point of having one.
  ('imp-tatoeba', 'tatoeba', 'Tanaka Corpus',
   'http://ftp.edrdg.org/pub/Nihongo/examples.utf.gz',
   'http://www.edrdg.org/wiki/index.php/Tanaka_Corpus',
   'CC BY-SA 3.0',
   'Example sentences from the Tanaka Corpus, compiled by Yasuhito Tanaka and '
   'maintained by the Electronic Dictionary Research and Development Group, '
   'used under CC BY-SA 3.0.', true),

  ('imp-kanjium', 'kanjium', 'Kanjium pitch accent',
   'https://github.com/mifunetoshiro/kanjium', 'https://github.com/mifunetoshiro/kanjium',
   'See repository', 'Pitch accent data from Kanjium.', true),

  ('imp-chise-ids', 'chise-ids', 'CHISE IDS',
   'https://gitlab.chise.org/CHISE/ids', 'https://www.chise.org/',
   'GPL-compatible', 'Character decomposition data from the CHISE Project.', true),

  ('imp-wiktextract', 'wiktextract', 'Wiktionary (wiktextract)',
   'https://kaikki.org/dictionary/rawdata.html', 'https://en.wiktionary.org/',
   'CC BY-SA 3.0',
   'Etymology text from Wiktionary contributors, used under CC BY-SA 3.0.', true),

  ('imp-edrdg-phonetic', 'edrdg-phonetic', 'EDRDG kanji phonetic components',
   'https://www.edrdg.org/~jwb/kanjiphonetics/', 'https://www.edrdg.org/~jwb/kanjiphonetics/',
   'EDRDG licence',
   'Phonetic component data from Jim Breen / EDRDG.', true)
ON CONFLICT (code) DO NOTHING;
